"use server";

import { User, UserType } from "@/models/user.model";
import { auth } from "@clerk/nextjs/server";

export const getUser = async () => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthenticated user");
  }

  const user = await User.findOne<UserType>({ userId });

  return {
    hasPasskey: user ? user.hasPasskey : false,
  };
};
