"use server";

import { z } from "zod";
import { genSalt, hash, compare } from "bcrypt";
import { auth } from "@clerk/nextjs/server";
import { User, TUser } from "@/models/user.model";
import { ConnectToDB, encrypt } from "@/lib/utils";
import { TActionResponse } from "@/lib/types";
import { decryptedUserData } from "./security.actions";
import { Subscription, TSubscription } from "@/models/subscription.model";

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
      success: false,
      error: "Bad request",
    };
  }

  const subscription = await Subscription.findOne<Pick<TSubscription, "currentEnd">>(
    { subId: user.currentSubId }, 
    { currentEnd: 1, _id: 0 }
  );
  
  const isSubscriptionExpired = subscription ? subscription.currentEnd < Date.now() : true;

  if(user.hasSubscription && isSubscriptionExpired){
    return {
      success: false,
      error: "Subscription expired, please re-subscribe to the Professional plan",
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

  const user = await decryptedUserData(userId, ["hasSubscription", "passkey"])
  if (!user) {
    return {
      error: "User not found",
      success: false,
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
    const match = await compare(passkey, user.passkey);
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
