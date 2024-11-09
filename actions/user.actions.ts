"use server";

import { ConnectToDB } from "@/lib/utils";
import {
  AdditionalFilterKey,
  CombinedFilterKey,
  FilterKey,
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

export const enableGoogleService = async (
  service: AdditionalFilterKey,
  status: boolean
): Promise<TActionResponse> => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthenticated");

    await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          [`GOOGLE_DRIVE.${service}.connectionStatus`]: status,
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
  platform: CombinedFilterKey,
  inc: number
) => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthenticated");

    let updateQuery: Record<string, number> = {};
    if (
      platform === "GOOGLE_DOCS" ||
      platform === "GOOGLE_SHEETS" ||
      platform === "GOOGLE_SLIDES"
    ) {
      updateQuery[`GOOGLE_DRIVE.${platform}.searchResults`] = inc;
    } else {
      updateQuery[`${platform}.searchResults`] = inc;
    }

    await ConnectToDB();
    await User.findOneAndUpdate(
      { userId },
      {
        $inc: updateQuery,
      }
    );
  } catch (error: any) {
    console.log("Search result update error:", error.message);
  }
};

export const getSearchResultCount = async (): Promise<
  TActionResponse<TSearchResult>
> => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthenticated");

    await ConnectToDB();
    const user = (await User.findOne<
      Pick<UserType, Exclude<FilterKey, "GOOGLE_CALENDAR">>
    >(
      { userId },
      {
        DISCORD: 1,
        GITHUB: 1,
        GMAIL: 1,
        GOOGLE_DRIVE: 1,
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
      GOOGLE_DOCS: user.GOOGLE_DRIVE.GOOGLE_DOCS.searchResults,
      GOOGLE_SHEETS: user.GOOGLE_DRIVE.GOOGLE_SHEETS.searchResults,
      GOOGLE_SLIDES: user.GOOGLE_DRIVE.GOOGLE_SLIDES.searchResults,
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
      query["_id"] = { $lt: pageToken };
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
