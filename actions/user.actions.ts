"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { ConnectToDB, isGoogleService } from "@/lib/utils";
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

import { User, UserType } from "@/models/user.model";
import {
  SearchHistory,
  TSearchHistorySchema,
} from "@/models/search-history.model";
import { format } from "date-fns";
import { checkAndRefreshToken, getPlatformClient } from "./utils.actions";

import { Octokit } from "@octokit/rest";
import { WebClient } from "@slack/web-api";

export const AISearchPreference = async (
  isAISearch: boolean
): Promise<TActionResponse> => {
  try {
    const { userId } = await auth();
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
      data: "",
    };
  } catch (error: any) {
    console.log("AI Search Preference Error:", error.message);
    return {
      success: false,
      error: error.message,
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

    const user = (await User.findOne<UserType>({ userId }))!;

    if (service !== "GMAIL" && isGoogleService(service)) {
      if (user.GOOGLE_DRIVE.connectionStatus !== 1)
        return {
          success: false,
          error: "Please connect to your google drive account...",
        };
    } else {
      if (user[service].connectionStatus !== 1)
        return {
          success: false,
          error: `Please connect to your ${service
            .replace("_", " ")
            .toLowerCase()} account...`,
        };
    }

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
    const user = (await User.findOne<
      Pick<
        UserType,
        Exclude<CombinedFilterKey, "GOOGLE_CALENDAR" | "GOOGLE_DRIVE">
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
        _id: 0,
      }
    ))!;

    const result = {
      DISCORD: user.DISCORD.searchResults,
      GITHUB: user.GITHUB.searchResults,
      GMAIL: user.GMAIL.searchResults,
      GOOGLE_DOCS: user.GOOGLE_DOCS.searchResults,
      GOOGLE_SHEETS: user.GOOGLE_SHEETS.searchResults,
      GOOGLE_SLIDES: user.GOOGLE_SLIDES.searchResults,
      MICROSOFT_TEAMS: user.MICROSOFT_TEAMS.searchResults,
      NOTION: user.NOTION.searchResults,
      SLACK: user.SLACK.searchResults,
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
    const result = (await User.findOne<Pick<UserType, "searchCount">>(
      { userId },
      { searchCount: 1, _id: 0 }
    ).lean())!;

    const searchCount = (
      Object.entries(result.searchCount) as [string, TSearchCount][]
    ).map(([key, val]) => ({
      ...val,
      date: key,
    }));

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
  search_count: Map<string, TSearchCount>,
  isAISearch: boolean
) => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthenticated");

    await ConnectToDB();
    const now = format(new Date(), "yyyy-MM-dd");

    const update = {
      [`searchCount.${now}`]: {
        "AI Search":
          Number(isAISearch) + (search_count.get(now)?.["AI Search"] ?? 0),
        "Keyword Search":
          Number(!isAISearch) +
          (search_count.get(now)?.["Keyword Search"] ?? 0),
        "Total Search": 1 + (search_count.get(now)?.["Total Search"] ?? 0),
      },
    };

    const searchHistory = await SearchHistory.create({
      userId,
      searchItem,
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
        searchItem: searchItem!,
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
    const user = await User.findOne<UserType>({ userId });
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
        const gitHubClient = (await getPlatformClient(
          user,
          platform
        )) as Octokit;
        gitHubClient.apps.deleteInstallation({
          installation_id: parseInt(user[platform].installationId),
        });
        const gitHubResp =
          await gitHubClient.apps.revokeInstallationAccessToken();
        status = gitHubResp.status;
        break;
      case "MICROSOFT_TEAMS":
        break;
      case "NOTION":
        break;
      case "SLACK":
        const slackClient = (await getPlatformClient(
          user,
          platform
        )) as WebClient;
        const slackResp = await slackClient.auth.revoke({ token });
        if (slackResp.error) throw new Error(slackResp.error);
        break;
      default:
        const oauth2Client = (await getPlatformClient(
          user,
          platform
        )) as OAuth2Client;
        await checkAndRefreshToken(user, platform, oauth2Client);
        const googleResp = await oauth2Client.revokeToken(
          user[platform].accessToken
        );
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

export const deleteAccount = async (): Promise<TActionResponse> => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await ConnectToDB();
    const user = await User.findOne<
      Pick<
        UserType,
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
