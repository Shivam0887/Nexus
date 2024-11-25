"use server";

import { createHash } from "crypto";
import { ConnectToDB } from "@/lib/utils";
import { User, UserType } from "@/models/user.model";
import { auth } from "@clerk/nextjs/server";
import { genSalt, hash } from "bcrypt";
import nodemailer from "nodemailer";
import { z } from "zod";
import { TActionResponse } from "@/lib/types";
import { render } from "@react-email/components";
import Email from "@/emails/email";
import { createElement } from "react";
import OTP, { TOtp } from "@/models/otp.model";

const OTPSchmea = z
  .string()
  .length(6, "Must contain 6 digits.")
  .refine((passkey) => /^\d{6}$/.test(passkey), "Invalid OTP");

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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
    const user = await User.findOne<Pick<UserType, "email">>(
      { userId },
      { email: 1, _id: 0 }
    );
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await OTP.create({ email: user.email, otp: hashedOTP, expiresAt });

    const emailComponent = createElement(Email, { otp });
    const emailHTML = await render(emailComponent);

    // Send OTP to user's email
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: "shivamsharma0887@gmail.com",
      subject: "Passkey Reset OTP",
      html: emailHTML,
    });

    return {
      success: true,
      data: "A 6-digit OTP code has been sent to your registered email.",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.name,
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
  const user = await User.findOne<Pick<UserType, "email">>(
    { userId },
    { email: 1, _id: 0 }
  );
  if (!user) {
    return {
      success: false,
      error: "User not found",
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

  const user = await User.findOne({ userId }, { _id: 1 });
  if (!user) {
    return {
      success: false,
      error: "User not found",
    };
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
        passkey: passkeyHash,
      },
    }
  );

  return {
    success: true,
    data: "Passkey reset successfully.",
  };
};
