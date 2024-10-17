"use server";

import { ConnectToDB } from "@/lib/utils";
import { FilterKey } from "@/lib/types";

import { auth } from "@clerk/nextjs/server";

import { User, UserType } from "@/models/user.model";
import { ProjectionType } from "mongoose";

export const AISearchPreference = async (isAISearch: boolean) => {
  const { userId } = auth();

  try {
    await ConnectToDB();
    await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          isAISearch,
        },
      }
    );
  } catch (error: any) {
    console.log("AI Search Preference Error:", error.message);
    throw error;
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
