"use server";

import { Scopes } from "@/lib/constants";
import { DocumentType, FilterKey } from "@/lib/types";
import { ConnectToDB } from "@/lib/utils";
import { User, UserType } from "@/models/user.model";
import { auth } from "@clerk/nextjs/server";
import { google } from "googleapis";
import { redirect } from "next/navigation";

const clientId = process.env.GMAIL_CLIENT_ID!;
const clientSecret = process.env.GMAIL_CLIENT_SECRET!;
const redirectUri = `${process.env.OAUTH_REDIRECT_URI!}/gmail`;

const oauth2Client = new google.auth.OAuth2({
  clientId,
  clientSecret,
  redirectUri,
});

export const saveFilters = async (data: Set<FilterKey>) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthenticated user");
  }

  const filter = Array.from(data);

  await ConnectToDB();
  await User.findOneAndUpdate(
    { userId },
    {
      $set: {
        filter,
        isFilterApplied: !!filter.length,
      },
    }
  );
};

const checkAndRefreshToken = async (userId: string) => {
  const user = await User.findOne<UserType>({ userId });
  if (!user) {
    throw new Error("User not found.");
  }

  const { gmail } = user;
  if (!gmail?.accessToken)
    throw new Error("Please connect you Gmail account...");

  const { accessToken, expiresAt, refreshToken, authUser } = gmail;

  // Check if the token has expired
  const currentTime = Date.now();
  if (expiresAt && currentTime < expiresAt - 60000) {
    oauth2Client.setCredentials({
      access_token: accessToken,
    });
  } else {
    try {
      oauth2Client.setCredentials({ refresh_token: refreshToken! });
      // Attempt to refresh the token
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials({
        access_token: credentials.access_token,
      });

      // Store the new tokens in the database
      await User.findOneAndUpdate(
        { userId },
        {
          $set: {
            gmail: {
              accessToken: credentials.access_token,
              refreshToken,
              expiresAt: credentials.expiry_date!,
              authUser,
            },
          },
        }
      );

      console.log("Access token refreshed.");
    } catch (error: any) {
      if (error?.response && error?.response?.data?.error === "invalid_grant") {
        console.error(
          "Refresh token is invalid or has expired. User needs to re-authenticate."
        );

        // Redirect the user to re-authenticate
        throw new Error("RE_AUTHENTICATE");
      } else {
        console.error("Error refreshing access token:", error?.message);
        throw error;
      }
    }
  }
};

const searchEmails = async (
  searchQuery: string,
  userId: string,
  authUser: string
) => {
  try {
    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client,
    });

    let pageToken: string | undefined;
    const result: DocumentType[] = [];

    const getMessageIds = async () => {
      const { data } = await gmail.users.messages.list({
        userId,
        q: searchQuery,
        pageToken,
      });

      const { messages, nextPageToken } = data;
      if (!messages) return undefined;

      const emails = await Promise.all(
        messages.map(async ({ id }): Promise<DocumentType> => {
          let date = "";
          let from = "";
          let subject = "";

          const message = (
            await gmail.users.messages.get({
              userId,
              id: id!,
              format: "metadata",
            })
          ).data;

          const label = message.labelIds
            ? message.labelIds.includes("INBOX")
              ? "inbox"
              : message.labelIds[0].toLowerCase()
            : "inbox";

          const href = `https://mail.google.com/mail/u/${authUser}/#${label}/${id}`;

          message.payload?.headers?.forEach(({ name, value }) => {
            if (name === "Date") date = value!;
            else if (name === "From") from = value!;
            else if (name === "Subject") subject = value!;
          });

          return {
            date,
            author: from,
            title: subject,
            href,
            email: userId,
            logo: "./Gmail.svg",
          };
        })
      );

      emails.forEach((email) => {
        result.push(email);
      });

      return nextPageToken ?? undefined;
    };

    do {
      pageToken = await getMessageIds();
    } while (pageToken);

    return result;
  } catch (error) {
    throw error;
  }
};

export const searchAction = async (
  state: DocumentType[],
  formData: FormData
) => {
  const { userId } = auth();

  try {
    const user = await User.findOne<UserType>({ userId });
    if (!user) {
      throw new Error("User not found");
    }

    const query = formData.get("search");
    if (!query || query.toString().trim().length === 0) {
      throw new Error("Please enter your query.");
    }

    await checkAndRefreshToken(userId!);

    const messages = await searchEmails(
      query.toString(),
      user.email,
      user.gmail!.authUser!
    );

    return messages;
  } catch (error: any) {
    console.log(error?.message);
    if (error?.message === "RE_AUTHENTICATE") {
      // Redirect the user to the Google OAuth consent screen to re-authenticate
      const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: `openid ${Scopes["Gmail"]}`,
        prompt: "consent select_account",
        state: userId!,
      });

      redirect(url);
    }

    return [];
  }
};
