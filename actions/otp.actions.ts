"use server";

import { createHash } from "crypto";
import { ConnectToDB, encrypt } from "@/lib/utils";
import { User } from "@/models/user.model";
import { auth } from "@clerk/nextjs/server";
import { genSalt, hash } from "bcrypt";
import { z } from "zod";
import { TActionResponse } from "@/lib/types";
import OTP, { TOtp } from "@/models/otp.model";
import { EmailTemplate, getPlainTextEmail } from "@/components/email-template";
import { Resend } from "resend";
import { decryptedUserData } from "./security.actions";
import { Subscription, TSubscription } from "@/models/subscription.model";

const resend = new Resend(process.env.RESEND_API_KEY!);

const OTPSchmea = z
  .string()
  .length(6, "Must contain 6 digits.")
  .refine((passkey) => /^\d{6}$/.test(passkey), "Invalid OTP");

// Generate OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Hash OTP (security practice to prevent plaintext OTP storage)
const hashOTP = (otp: string) => createHash("sha256").update(otp).digest("hex");

export const sendOTP = async (): Promise<TActionResponse> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Unauthenticated",
      };
    }

    await ConnectToDB();
    const user = await decryptedUserData(userId, ["email", "hasSubscription", "currentSubId"]);
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    if(!user.hasSubscription){
      return {
        success: false,
        error: "Bad request. Subscribe to Professional plan",
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

    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);

    const OtpResponse = await OTP.findOne<TOtp>({ email: user.email });
    if (OtpResponse) {
      await OTP.deleteOne({ _id: OtpResponse._id });
    }

    await OTP.create({ email: user.email, otp: hashedOTP });

    const { error } = await resend.emails.send({
      from: "Nexus <privacy@shivam2000.xyz>",
      to: user.email,
      subject: "Passkey reset OTP",
      react: EmailTemplate({ otp }),
      text: await getPlainTextEmail({ otp }),
    });

    if (error) {
      return {
        success: false,
        error: "Error while sending the OTP to reset Passkey",
      };
    }

    return {
      success: true,
      data: "A 6-digit OTP code has been sent to your registered email.",
    };
  } catch (error: any) {
    console.log("Error while sending the OTP to reset Passkey :", error.message);
    return {
      success: false,
      error: "Oops! Something went wrong while sending OTP email, please try again later.",
    };
  }
};

export const verifyOTP = async (otp: string): Promise<TActionResponse> => {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Unauthenticated",
    };
  }

  await ConnectToDB();
  const user = await decryptedUserData(userId, ["email", "hasSubscription"]);
  if (!user) {
    return {
      success: false,
      error: "User not found",
    };
  }

  if(!user.hasSubscription){
    return {
      success: false,
      error: "Bad request. Subscribe to Professional plan",
    };
  }

  const response = OTPSchmea.safeParse(otp);
  if (!response.success) {
    return {
      success: false,
      error: response.error.message,
    };
  }

  const hashedOTP = hashOTP(otp);
  const OtpResponse = await OTP.findOne<TOtp>({ email: user.email });
  if (!OtpResponse || OtpResponse.otp !== hashedOTP) {
    return {
      success: false,
      error: "Invalid or expired OTP.",
    };
  }

  await OTP.deleteOne({ _id: OtpResponse._id });
  await User.findOneAndUpdate({ userId }, {
    $set: {
      isOTPVerified: true
    }
  });

  return {
    success: true,
    data: "OTP verified",
  };
};

export const resetPasskey = async (key: string): Promise<TActionResponse> => {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "Unauthenticated",
    };
  }

  await ConnectToDB();
  const user = await decryptedUserData(userId, ["email", "hasSubscription", "isOTPVerified"]);
  if (!user) {
    return {
      success: false,
      error: "User not found",
    };
  }

  if(!user.hasSubscription || !user.isOTPVerified){
    return {
      success: false,
      error: "Bad request. Either unsubscribed or OTP unverified"
    }
  }

  const response = OTPSchmea.safeParse(key);

  if (!response.success) {
    return {
      success: false,
      error: response.error.message,
    };
  }

  const salt = await genSalt(10);
  const passkeyHash = await hash(key, salt);

  await ConnectToDB();
  await User.findOneAndUpdate(
    { userId },
    {
      $set: {
        passkey: encrypt(passkeyHash),
        isOTPVerified: false
      },
    }
  );

  return {
    success: true,
    data: "Passkey reset successfully.",
  };
};
