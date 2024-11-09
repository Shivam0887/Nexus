"use server";

import { z } from "zod";
import { genSalt, hash, compare } from "bcrypt";
import { auth } from "@clerk/nextjs/server";
import { User, UserType } from "@/models/user.model";
import { ConnectToDB } from "@/lib/utils";
import { TActionResponse } from "@/lib/types";

const isDigit = (key: string) => key.length === 1 && key >= "0" && key <= "9";

const passkeySchema = z.string().refine(isDigit, "Invalid passkey");

const dataSchema = z.object({
  passkey0: passkeySchema,
  passkey1: passkeySchema,
  passkey2: passkeySchema,
  passkey3: passkeySchema,
  passkey4: passkeySchema,
  passkey5: passkeySchema,
  remember: z.enum(["on"]).optional(),
});

export const createPasskey = async (
  formData: FormData
): Promise<TActionResponse> => {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: "Unauthenticated user",
      success: false,
    };
  }

  const { success, data: safeData } = dataSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (success) {
    const shouldRemember = safeData.remember ? true : false;

    const passkey = Object.entries(safeData).reduce((prev, [key, val]) => {
      if (key != "remember") prev += val;
      return prev;
    }, "");

    const salt = await genSalt(10);
    const passkeyHash = await hash(passkey, salt);

    await ConnectToDB();
    await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          passkey: passkeyHash,
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
  formData: FormData
): Promise<TActionResponse> => {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: "Unauthenticated user",
      success: false,
    };
  }

  const { success, data: safeData } = dataSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (success) {
    const shouldRemember = safeData.remember ? true : false;

    const passkey = Object.entries(safeData).reduce((prev, [key, val]) => {
      if (key != "remember") prev += val;
      return prev;
    }, "");

    const salt = await genSalt(10);
    const passkeyHash = await hash(passkey, salt);

    await ConnectToDB();

    const user = await User.findOne<Pick<UserType, "passkey">>(
      { userId },
      { passkey: 1, _id: 0 }
    );

    if (!user) {
      return {
        error: "User not found",
        success: false,
      };
    }

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
