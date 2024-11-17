import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { sign } from "jsonwebtoken";
import axios from "axios";

import mongoose from "mongoose";
import { PATTERNS } from "./sensitive-regex";
import { CombinedFilterKey, TSlackAxiosResponse } from "./types";
import { UserType } from "@/models/user.model";

type TResponse = {
  token: string;
  expires_at: string;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let isConnected = false;

export async function ConnectToDB() {
  const URI = process.env.MONGODB_URI;

  if (!URI) {
    console.info("Connection URI not found");
    throw new Error("Unable to connect. Please try again later.");
  }

  if (!isConnected) {
    mongoose.set("strictQuery", true);
    await mongoose.connect(URI, {
      dbName: "Nexus",
    });

    switch (mongoose.connection.readyState) {
      case 0: {
        console.log("⚠️ Disconnected to MongoDB!");
        break;
      }
      case 1: {
        console.log("✅ Connected to MongoDB!");
        break;
      }
      case 2: {
        console.log("⏳ Connecting to MongoDB...");
        break;
      }
      case 3: {
        console.log("⏳ Disconnecting to MongoDB...");
        break;
      }
      default: {
        console.log("Unknown state");
      }
    }

    isConnected = true;
  } else {
    console.log("😎 Already connected to MongoDB!");
  }
}

export function redactText(text: string) {
  const patterns = Object.entries(PATTERNS);

  return patterns.reduce((curMaskedText, [key, regex]) => {
    return curMaskedText.replace(regex, `[${key}]`);
  }, text);
}

export const typedEntries = <T extends Object>(
  entries: T
): [keyof T, T[keyof T]][] => {
  return Object.entries(entries) as [keyof T, T[keyof T]][];
};

export const isGoogleService = (platform: CombinedFilterKey) => {
  return (
    platform === "GMAIL" ||
    platform === "GOOGLE_CALENDAR" ||
    platform === "GOOGLE_DRIVE" || 
    platform === "GOOGLE_DOCS" || 
    platform === "GOOGLE_SHEETS" || 
    platform === "GOOGLE_SLIDES"
  );
};

export const generateGitHubJWT = () => {
  const signingKey = process.env.GITHUB_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const clientId = process.env.GITHUB_CLIENT_ID!;

  const now = Date.now();

  const payload = {
    // Issued at time
    iat: Math.floor(now / 1000),
    // JWT expiration time (5 minutes maximum)
    exp: Math.floor(now / 1000) + 300,
    iss: clientId,
  };

  return sign(payload, signingKey, { algorithm: "RS256" });
};

export const refreshGitHubAccessToken = async (
  token: string,
  installationId: string
) => {
  return await axios.post<TResponse>(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {},
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
};

export const refreshSlackAccessToken = async (user: UserType) => {
  const clientId = process.env.SLACK_CLIENT_ID!;
  const clientSecret = process.env.SLACK_CLIENT_SECRET!;
  const redirectUri = `${process.env.OAUTH_REDIRECT_URI!}/slack`;

  const tokenUrl = "https://slack.com/api/oauth.v2.access";
  return await axios.post<TSlackAxiosResponse>(
    tokenUrl,
    {},
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      params: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: user.GITHUB.refreshToken,
        redirect_uri: redirectUri,
      }),
    }
  );
};
