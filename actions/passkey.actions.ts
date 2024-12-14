"use server";

import { z } from "zod";
import { genSalt, hash, compare } from "bcrypt";
import { auth } from "@clerk/nextjs/server";
import { User, TUser } from "@/models/user.model";
import { ConnectToDB, decrypt, encrypt } from "@/lib/utils";
import { TActionResponse } from "@/lib/types";

const passkeySchmea = z
  .string()
  .length(6, "Must contain 6 digits.")
  .refine((passkey) => /^\d{6}$/.test(passkey), "Invalid passkey");

export const createPasskey = async (
  key: string,
  shouldRemember: boolean
): Promise<TActionResponse> => {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: "Unauthenticated",
      success: false,
    };
  }

  await ConnectToDB();
  const user = await User.findOne<Pick<TUser, "hasSubscription">>(
    { userId },
    { hasSubscription: 1, _id: 0 }
  );

  if (!user) {
    return {
      success: false,
      error: "User not found",
    };
  }

  if (!user.hasSubscription) {
    return {
      success: false,
      error: "Bad request",
    };
  }

  const { success, data: passkey } = passkeySchmea.safeParse(key);

  if (success) {
    const salt = await genSalt(10);
    const passkeyHash = await hash(passkey, salt);

    await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          passkey: encrypt(passkeyHash),
          shouldRemember,
          hasPasskey: true,
        },
      }
    );

    return {
      data: "created successfully",
      success: true,
    };
  } else {
    return {
      error: "Invalid Passkey",
      success: false,
    };
  }
};

export const validatePasskey = async (
  key: string,
  shouldRemember: boolean
): Promise<TActionResponse> => {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: "Unauthenticated",
      success: false,
    };
  }

  await ConnectToDB();
  const user = await User.findOne<Pick<TUser, "hasSubscription">>(
    { userId },
    { hasSubscription: 1, _id: 0 }
  );

  if (!user) {
    return {
      success: false,
      error: "User not found",
    };
  }

  if (!user.hasSubscription) {
    return {
      success: false,
      error: "Bad request",
    };
  }

  const { success, data: passkey } = passkeySchmea.safeParse(key);

  if (success) {
    const user = await User.findOne<Pick<TUser, "passkey">>(
      { userId },
      { passkey: 1, _id: 0 }
    );

    if (!user) {
      return {
        error: "User not found",
        success: false,
      };
    }

    const match = await compare(passkey, decrypt(user.passkey));
    if (!match) {
      return {
        error: "Invalid Passkey",
        success: false,
      };
    }

    await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          shouldRemember,
        },
      }
    );

    return {
      data: "verified successfully",
      success: true,
    };
  } else {
    return {
      error: "Invalid Passkey",
      success: false,
    };
  }
};
