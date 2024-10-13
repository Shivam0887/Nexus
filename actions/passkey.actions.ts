"use server";

import { z } from "zod";
import { genSalt, hash } from "bcrypt";
import { auth } from "@clerk/nextjs/server";
import { User } from "@/models/user.model";
import { ConnectToDB } from "@/lib/utils";
import { PasskeyState } from "@/lib/types";

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
  prevState: PasskeyState,
  data: FormData
): Promise<PasskeyState> => {
  const { userId } = auth();

  if (!userId) {
    return {
      error: "Unauthenticated user",
      success: false,
    };
  }

  const pattern = /^.ACTION/;

  const result = Array.from(data).filter((item) => {
    const key = item[0];
    if (!pattern.test(key)) {
      return item;
    }
  });

  const { success, data: safeData } = dataSchema.safeParse(
    Object.fromEntries(result)
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
      error: "",
      success: true,
    };
  } else {
    return {
      error: "Invalid Passkey",
      success: false,
    };
  }
};
