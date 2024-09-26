"use server";

import { ConnectToDB } from "@/lib/utils";
import { FilterKey } from "@/lib/types";

import { auth } from "@clerk/nextjs/server";

import { User, UserType } from "@/models/user.model";
import { ProjectionType } from "mongoose";
import { Pinecone } from "@pinecone-database/pinecone";
import { generateEmbeddings, getPlatformClient } from "./utils.actions";
import axios from "axios";
import { redirect } from "next/navigation";

const pineconeIndex = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
}).Index(process.env.PINECONE_INDEX!);

export const dataCollection = async (platform: FilterKey) => {
  const { userId } = auth();
  try {
    await ConnectToDB();
    const user = await User.findOne<UserType>({ userId });
    if (!user?.isAISearch) throw new Error("Bad request");

    if (!user["gmail"]?.dataCollection) {
      const client = await getPlatformClient(platform, user);
      await generateEmbeddings(platform, user, client);

      await User.findByIdAndUpdate(user._id, {
        $set: {
          "gmail.dataCollection": true,
        },
      });
    } else {
      await pineconeIndex.namespace(user.userId).deleteAll();
      console.log(
        "Total vectors: ",
        (await pineconeIndex.namespace(user.userId)._describeIndexStats())
          .totalRecordCount
      );

      await User.findByIdAndUpdate(user._id, {
        $set: {
          "gmail.dataCollection": false,
          "gmail.lastSync": 0,
        },
      });
    }
  } catch (error: any) {
    console.error("Search error:", error.message);
    if (error.message === "RE_AUTHENTICATE") {
      // WIP: Change url for production
      const url = (
        await axios("https://qflbv4c3-3000.inc1.devtunnels.ms/api/google")
      ).data;
      redirect(url);
    }
  }
};

export const saveFilters = async (data: Set<FilterKey>) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthenticated user");
  }

  const filter = Array.from(data);

  await ConnectToDB();
  await User.findOneAndUpdate(
    { userId },
    {
      $set: {
        filter,
        isFilterApplied: !!filter.length,
      },
    }
  );
};

export const AISearchPreference = async (isAllowed: boolean) => {
  const { userId } = auth();

  try {
    await ConnectToDB();
    await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          isAISearch: isAllowed,
        },
      }
    );
  } catch (error: any) {
    console.log("AI Search Preference Error:", error?.message);
    throw new Error(error);
  }
};

export const getUser = async (options: {
  hasSubscription?: boolean;
  isAISearch?: boolean;
  shouldRemember?: boolean;
}) => {
  try {
    const { userId } = auth();
    if (!userId) throw new Error("Unauthenticated");
    const projections: ProjectionType<any> = {};

    for (const option in options) {
      const key = option as keyof typeof options;
      if (options[key] !== undefined) {
        projections[key] = Number(options[key]);
      }
    }

    return await User.findOne<
      Pick<UserType, "isAISearch" | "shouldRemember" | "hasSubscription">
    >({ userId }, { ...projections, _id: 0 }).lean();
  } catch (error: any) {
    console.log("Error on getUser:", error?.message);
    throw new Error(error);
  }
};
