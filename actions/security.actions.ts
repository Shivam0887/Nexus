"use server";

import { UserKeys } from "@/lib/constants";
import { ConnectToDB, decrypt } from "@/lib/utils";
import { User, TUser } from "@/models/user.model";

export const decryptedUserData = async <T extends keyof TUser>(
  userId: string | undefined | null,
  options: T[] = UserKeys as any
): Promise<Pick<TUser, T> | undefined> => {
  try {
    if (!userId) throw new Error("Unauthenticated");

    const queryOptions = Array.from(new Set(options));

    await ConnectToDB();
    const user = (await User.findOne(
      { userId },
      queryOptions.reduce((acc, key) => ({ ...acc, [key]: 1 }), { _id: 0 })
    )) as any;

    if (!user) throw new Error("User not found");

    const isBasicInfo = (key: T) =>
      key === "username" ||
      key === "email" ||
      key === "birthday" ||
      key === "imageUrl" ||
      key === "passkey";

    const isIntegration = (key: T) =>
      key === "NOTION" ||
      key === "SLACK" ||
      key === "GITHUB" ||
      key === "GMAIL" ||
      key === "GOOGLE_DRIVE" ||
      key === "GOOGLE_CALENDAR" ||
      key === "MICROSOFT_TEAMS" ||
      key === "DISCORD";

    // Integration-specific decryption rules
    const integrationDecryptRules = {
      NOTION: ["accessToken", "botId", "workspaceId"],
      SLACK: ["accessToken", "refreshToken", "teamId", "teamName"],
      GITHUB: ["accessToken", "refreshToken", "installationId"],
      GMAIL: ["accessToken", "refreshToken"],
      GOOGLE_DRIVE: ["accessToken", "refreshToken"],
      GOOGLE_CALENDAR: ["accessToken", "refreshToken"],
      MICROSOFT_TEAMS: ["accessToken", "refreshToken"],
      DISCORD: ["accessToken", "refreshToken"],
    } as Record<T, string[]>;

    for (const _ in user) {
      const key = _ as T;
      // Handle simple fields
      if (isBasicInfo(key)) {
        user[key] = decrypt(user[key] as string) as any;
      }

      // Handle integration fields
      if (isIntegration(key)) {
        const integration = integrationDecryptRules[key];
        integration.forEach((field) => {
          if (user[key][field]) {
            user[key][field] = decrypt(user[key][field]);
          }
        });
      }
    }

    return user;
  } catch (error: any) {
    console.log("Error at decryptedUserData", error.message);
  }
};
