"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { ConnectToDB, decrypt, encrypt, isGoogleService } from "@/lib/utils";
import {
  CombinedFilterKey,
  FilterKey,
  OAuth2Client,
  TActionResponse,
  TSearchCount,
  TSearchHistory,
  TSearchResult,
} from "@/lib/types";

import { auth } from "@clerk/nextjs/server";

import { User, TUser } from "@/models/user.model";
import {
  SearchHistory,
  TemporarySearchHistory,
  TSearchHistorySchema,
} from "@/models/search-history.model";
import { format } from "date-fns";
import { checkAndRefreshToken, getPlatformClient } from "./utils.actions";

import { Octokit } from "@octokit/rest";
import { WebClient } from "@slack/web-api";
import axios from "axios";
import { decryptedUserData } from "./security.actions";
import Razorpay from "razorpay";
import { Subscription, TSubscription } from "@/models/subscription.model";

const razorpay = new Razorpay({ 
  key_id: process.env.RAZORPAY_CLIENT_ID!, 
  key_secret: process.env.RAZORPAY_CLIENT_SECRET!
});

export const AISearchPreference = async (
  isAISearch: boolean
): Promise<TActionResponse> => {
  const { userId } = await auth();
  try {
    if(!userId){
      return {
        success: false,
        error: "Unauthorized"
      }
    }
    
    await ConnectToDB();
    const user = await User.findOne({ userId }, { _id: 1 });
    if(!user){
      return {
        success: false, 
        error: "User not found"
      }
    }

    await ConnectToDB();
    await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          isAISearch,
        },
      }
    );

    return {
      success: true,
      data: "AI Search " + (isAISearch ? "enabled" : "disabled"),
    };
  } catch (error: any) {
    console.log("AI Search Preference Error:", error.message);
    return {
      success: false,
      error: "Error while toggling the AI-Search",
    };
  }
};

export const toggleSearchService = async (
  service: Exclude<CombinedFilterKey, "GOOGLE_DRIVE" | "GOOGLE_CALENDAR">,
  status: boolean
): Promise<TActionResponse> => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthenticated");

    const user = await decryptedUserData(userId, [
      "DISCORD",
      "GITHUB",
      "GMAIL",
      "GOOGLE_CALENDAR",
      "GOOGLE_DOCS",
      "GOOGLE_DRIVE",
      "GOOGLE_SHEETS",
      "GOOGLE_SLIDES",
      "MICROSOFT_TEAMS",
      "NOTION",
      "SLACK",
    ]);

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    if (service !== "GMAIL" && isGoogleService(service)) {
      if (user.GOOGLE_DRIVE.connectionStatus !== 1)
        return {
          success: false,
          error: "Please connect to your Google Drive account...",
        };
    } else {
      if (user[service].connectionStatus !== 1)
        return {
          success: false,
          error: `Please connect to your ${service
            .replace("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (r) => r.toUpperCase())} account...`,
        };
    }

    await ConnectToDB();
    await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          [`${service}.searchStatus`]: status,
        },
      }
    );

    return {
      success: true,
      data: `${service.replace("_", " ").toLowerCase()} ${
        status ? "enabled" : "disabled"
      }`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: "Failed to update the status, please try again later.",
    };
  }
};

export const updateSearchResultCount = async (
  platform: Exclude<CombinedFilterKey, "GOOGLE_DRIVE">,
  inc: number
) => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthenticated");

    await ConnectToDB();
    await User.findOneAndUpdate(
      { userId },
      {
        $inc: {
          [`${platform}.searchResults`]: inc,
        },
      }
    );
  } catch (error: any) {
    console.log("Search result update error:", error.message);
  }
};

// Number of search results for individual platform
export const getSearchResultCount = async (): Promise<
  TActionResponse<TSearchResult>
> => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthenticated");

    await ConnectToDB();
    // Not need to decrypt the data, as the required fields are not encrypted
    const user = await User.findOne<
      Pick<
        TUser,
        | Exclude<CombinedFilterKey, "GOOGLE_CALENDAR" | "GOOGLE_DRIVE">
        | "hasSubscription"
      >
    >(
      { userId },
      {
        DISCORD: 1,
        GITHUB: 1,
        GMAIL: 1,
        GOOGLE_DOCS: 1,
        GOOGLE_SHEETS: 1,
        GOOGLE_SLIDES: 1,
        MICROSOFT_TEAMS: 1,
        NOTION: 1,
        SLACK: 1,
        hasSubscription: 1,
        _id: 0,
      }
    );

    if (!user) throw new Error("User not found");

    const result = {
      DISCORD: user.hasSubscription ? user.DISCORD.searchResults : 0,
      GITHUB: user.hasSubscription ? user.GITHUB.searchResults : 0,
      GMAIL: user.hasSubscription ? user.GMAIL.searchResults : 0,
      GOOGLE_DOCS: user.hasSubscription ? user.GOOGLE_DOCS.searchResults : 0,
      GOOGLE_SHEETS: user.hasSubscription ? user.GOOGLE_SHEETS.searchResults : 0,
      GOOGLE_SLIDES: user.hasSubscription ? user.GOOGLE_SLIDES.searchResults : 0,
      MICROSOFT_TEAMS: user.hasSubscription ? user.MICROSOFT_TEAMS.searchResults : 0,
      NOTION: user.hasSubscription ? user.NOTION.searchResults : 0,
      SLACK: user.hasSubscription ? user.SLACK.searchResults : 0,
    };

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getSearchCount = async (): Promise<
  TActionResponse<({ date: string } & TSearchCount)[]>
> => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthenticated");

    await ConnectToDB();
    // Not need to decrypt the data, as the required fields are not encrypted
    const result = (await User.findOne<
      Pick<TUser, "searchCount" | "hasSubscription">
    >({ userId }, { searchCount: 1, hasSubscription: 1, _id: 0 }).lean())!;

    let searchCount: {
      date: string;
      "Total Search": number;
      "AI Search": number;
      "Keyword Search": number;
    }[] = [];

    if (result.hasSubscription) {
      searchCount = (
        Object.entries(result.searchCount) as [string, TSearchCount][]
      ).map(([key, val]) => ({
        ...val,
        date: key,
      }));
    }

    return {
      success: true,
      data: searchCount,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const createSearchHistoryInstance = async (
  searchItem: string,
  email: string,
  searchCount: Map<string, TSearchCount>,
  isAISearch: boolean,
  userId: string
) => {
  try {
    const now = format(new Date(), "yyyy-MM-dd");

    const update = {
      [`searchCount.${now}`]: {
        "AI Search": Number(isAISearch) + (searchCount.get(now)?.["AI Search"] ?? 0),
        "Keyword Search": Number(!isAISearch) + (searchCount.get(now)?.["Keyword Search"] ?? 0),
        "Total Search": 1 + (searchCount.get(now)?.["Total Search"] ?? 0),
      },
    };

    await ConnectToDB();
    const searchQuery = encrypt(searchItem);
    const searchHistory = await SearchHistory.create({
      userId,
      searchItem: searchQuery,
    });

    // Save temporarily for 3 months for security concerns
    await TemporarySearchHistory.create({
      email,
      userId,
      searchItem: searchQuery,
    });

    await User.findOneAndUpdate(
      {
        userId,
      },
      {
        $set: update,
        $push: {
          searchHistory: searchHistory._id,
        },
      },
      { upsert: true }
    );
  } catch (error: any) {
    console.log("Error while creating search history instance:", error.message);
  }
};

export const deleteSearchHistory = async (
  searchIds: string[]
): Promise<TActionResponse<string>> => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthenticated");

    await ConnectToDB();
    await SearchHistory.deleteMany({ _id: { $in: searchIds } });
    await User.findOneAndUpdate(
      { userId },
      {
        $pull: {
          searchHistory: { $in: searchIds },
        },
      }
    );

    return {
      success: true,
      data: "deleted",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getSearchHistory = async (
  pageToken: string | null,
  pageSize: number = 20
): Promise<
  TActionResponse<{
    nextPageToken: string | null;
    searchHistory: TSearchHistory[];
  }>
> => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthenticated");

    await ConnectToDB();

    const user = await User.findOne<Pick<TUser, "hasSubscription" | "currentSubId">>(
      { userId },
      { hasSubscription: 1, currentSubId: 1, _id: 0 }
    );

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    if (!user.hasSubscription) {
      return {
        success: true,
        data: {
          nextPageToken: null,
          searchHistory: [],
        },
      };
    }

    const subscription = await Subscription.findOne<Pick<TSubscription, "currentEnd">>(
      { subId: user.currentSubId }, 
      { currentEnd: 1, _id: 0 }
    );
    
    const isSubscriptionExpired = subscription ? subscription.currentEnd < Date.now() : true;

    if(user.hasSubscription && isSubscriptionExpired){
      return {
        success: true,
        data: {
          nextPageToken: null,
          searchHistory: [],
        },
      };
    }

    const query: { [key: string]: any } = { userId };
    if (pageToken) {
      query["_id"] = { $lte: pageToken };
    }

    const result = await SearchHistory.find<TSearchHistorySchema>(
      query,
      {},
      { sort: { createdAt: -1 } }
    ).limit(pageSize + 1);

    let nextPageToken: string | null = null;

    if (result.length > pageSize)
      nextPageToken = result[pageSize]._id.toString();

    const searchHistory = result
      .slice(0, pageSize)
      .map(({ _id, createdAt, searchItem }) => ({
        id: _id.toString(),
        createdAt,
        searchItem: decrypt(searchItem),
      }));

    return {
      success: true,
      data: { nextPageToken, searchHistory },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Revoke access
export const revokeAccessToken = async (
  data:
    | {
        platform: FilterKey;
        onAccountDelete: true;
      }
    | {
        platform: FilterKey;
        onAccountDelete: false;
      }
): Promise<TActionResponse> => {
  try {
    const platform = data.platform;

    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await ConnectToDB();
    const user = (await decryptedUserData(userId)) as TUser | undefined;
    if (!user) throw new Error("User not found");

    if (platform !== "NOTION" && !isGoogleService(platform)) {
      const response = await checkAndRefreshToken(user, platform);
      if (!response.success) throw new Error(response.error);
    }

    let token = user[platform].accessToken;
    let status = 200;

    switch (platform) {
      case "DISCORD":
        break;
      case "GITHUB":
        const gitHubClient = (await getPlatformClient(user, platform)) as Octokit;
        gitHubClient.apps.deleteInstallation({
          installation_id: parseInt(user[platform].installationId),
        });
        const gitHubResp = await gitHubClient.apps.revokeInstallationAccessToken();
        status = gitHubResp.status;
        break;
      case "MICROSOFT_TEAMS":
        break;
      case "NOTION":
        break;
      case "SLACK":
        const slackClient = (await getPlatformClient(user, platform)) as WebClient;
        const slackResp = await slackClient.auth.revoke({ token });
        if (slackResp.error) throw new Error(slackResp.error);
        break;
      default:
        const oauth2Client = (await getPlatformClient(user, platform)) as OAuth2Client;
        await checkAndRefreshToken(user, platform, oauth2Client);
        
        const googleResp = await oauth2Client.revokeToken(user[platform].accessToken);
        status = googleResp.status;
    }

    if (!(status === 200 || status === 204)) {
      throw new Error("Failed to revoke.");
    }

    if (!data.onAccountDelete) {
      await User.findOneAndUpdate(
        { userId },
        {
          $set: {
            [platform]: {},
          },
        }
      );
    }

    return {
      success: true,
      data: "Disconnected successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const deleteAccount = async (
  value: string
): Promise<TActionResponse> => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await ConnectToDB();
    const user = await User.findOne<
      Pick<
        TUser,
        | "DISCORD"
        | "GITHUB"
        | "GMAIL"
        | "GOOGLE_CALENDAR"
        | "GOOGLE_DRIVE"
        | "MICROSOFT_TEAMS"
        | "NOTION"
        | "SLACK"
      >
    >(
      { userId },
      {
        DISCORD: 1,
        GITHUB: 1,
        GMAIL: 1,
        GOOGLE_CALENDAR: 1,
        GOOGLE_DRIVE: 1,
        MICROSOFT_TEAMS: 1,
        NOTION: 1,
        SLACK: 1,
        _id: 0,
      }
    );
    if (!user) throw new Error("User not found");

    if (value.toLowerCase() !== "confirm") {
      return {
        success: false,
        error: "Bad request",
      };
    }

    for (const key in user) {
      const platform = key as keyof typeof user;
      if (user[platform]?.connectionStatus) {
        const response = await revokeAccessToken({
          onAccountDelete: true,
          platform,
        });
        if (!response.success) throw new Error(response.error);
      }
    }

    const client = await clerkClient();
    await client.users.deleteUser(userId);
    await User.findOneAndDelete({ userId });
    await SearchHistory.deleteMany({ userId });

    return {
      success: true,
      data: "Account deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const updateUsername = async (
  username: string
): Promise<TActionResponse> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Unauthenticated",
      };
    }

    await axios.patch(
      `https://api.clerk.com/v1/users/${userId}`,
      { username },
      {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY!}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      data: "Username updated",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response.data?.errors?.[0]?.message,
    };
  }
};

export const createSubscription = async (): Promise<TActionResponse> => {
  const planId = process.env.SUBSCRIPTION_PLAN_ID!
  try {
    const { userId } = await auth();
    if(!userId){
      return {
        success: false,
        error: "Unauthenticated"
      }
    }

    const { id } = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 1,
      quantity: 1,
      notes: {
        userId: encrypt(userId)
      }
    });

    return {
      success: true,
      data: id
    };
  } catch (error: any) {
    console.log("Subscription creation error: ", error.message);
    return {
      success: false,
      error: "Unable to create subscription, please try again later."
    }
  }
}

export const cancelSubscription = async (): Promise<TActionResponse> => {
  try {
    const { userId } = await auth();
    if(!userId){
      return {
        success: false,
        error: "Unauthenticated"
      }
    }

    const user = await User.findOne<Pick<TUser, "currentSubId">>({ userId }, { _id: 0, currentSubId: 1 });
    if(!user){
      return {
        success: false,
        error: "User not found"
      }
    }

    const subscription = await Subscription.findOne<Pick<TSubscription, "status">>({ subId: user.currentSubId }, { status: 1, _id: 0 });
    if(subscription && subscription.status === "active"){
      await razorpay.subscriptions.cancel(user.currentSubId);
      
      await Subscription.findOneAndUpdate(
        { subId: user.currentSubId }, 
        { $set: { status: "cancelled" } }
      );
    }

    return {
      success: true,
      data: "Subscription cancelled successfully"
    };
  } catch (error: any) {
    console.log("Subscription cancellation error: ", error);
    return {
      success: false,
      error: "Unable to cancel subscription, please try again later."
    }
  }
}