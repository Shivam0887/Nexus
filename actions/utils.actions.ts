"use server";

import { JSDOM } from "jsdom";
import { ConnectToDB, redactText } from "@/lib/utils";
import { gmail_v1, google } from "googleapis";
import { User, UserType } from "@/models/user.model";
import { DocumentType, FilterKey } from "@/lib/types";
import { CharacterTextSplitter } from "langchain/text_splitter";

const textSplitter = new CharacterTextSplitter({ separator: "</html>" });

export const checkAndRefreshToken = async (
  user: UserType,
  platform: FilterKey,
  oauth2Client: any
) => {
  const { accessToken, refreshToken, expiresAt } = user[platform];

  if (!accessToken)
    throw new Error(`Please connect you ${platform.toLowerCase()} account...`);

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
      await ConnectToDB();
      await User.findOneAndUpdate(
        { userId: user.userId },
        {
          $set: {
            [`${platform}.accessToken`]: credentials.access_token,
            [`${platform}.expiresAt`]: credentials.expiry_date,
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
        throw new Error(`RE_AUTHENTICATE-${platform}`);
      } else {
        console.error("Error refreshing access token:", error?.message);
        throw error;
      }
    }
  }
};

export const getPlatformClient = async (platform: FilterKey) => {
  try {
    const clientId = process.env[`${platform}_CLIENT_ID`]!;
    const clientSecret = process.env[`${platform}_CLIENT_SECRET`]!;
    const redirectUri = `${process.env
      .OAUTH_REDIRECT_URI!}/${platform.toLowerCase()}`;

    const oauth2Client = new google.auth.OAuth2({
      clientId,
      clientSecret,
      redirectUri,
    });

    return oauth2Client;
  } catch (error) {
    throw error;
  }
};

// Helper function to extract header value
const getHeader = (
  headers: gmail_v1.Schema$MessagePartHeader[],
  name: string
): string =>
  headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ??
  "";

// Helper function to process email content
const processEmailContent = async (
  parts: gmail_v1.Schema$MessagePart[] | undefined
): Promise<string> => {
  if (!parts) return "";

  const contentPromises = parts.map(async ({ body, mimeType }) => {
    if (!body?.data) return "";

    let content = Buffer.from(body.data, "base64").toString("utf8");

    if (mimeType === "text/html") {
      const htmlContent = await textSplitter.splitText(content);
      content = htmlContent
        .map((html) => {
          const dom = new JSDOM(html.concat("</html>"));
          return dom.window.document.querySelector("body")?.textContent ?? "";
        })
        .join(" ");
    }

    return content;
  });

  return (await Promise.all(contentPromises)).join(" ");
};

export const searchEmails = async (
  searchQuery: string,
  user: UserType,
  gmail: gmail_v1.Gmail
): Promise<DocumentType[]> => {
  if ((searchQuery.trim().length === 0 && !user.isAISearch) || !gmail)
    return [];

  const result: DocumentType[] = [];
  let pageToken: string | undefined;

  // Define email fetching parameters
  const fetchParams = {
    userId: user.email,
    q: searchQuery,
    maxResults: 25, // Limit results per page
  };

  do {
    // Fetch emails
    const { data } = await gmail.users.messages.list({
      ...fetchParams,
      pageToken,
    });

    if (!data.messages) break;

    // Process each email
    const emails = await Promise.all(
      data.messages.map(async ({ id }): Promise<DocumentType | undefined> => {
        const message = await gmail.users.messages.get({
          userId: user.email,
          id: id!,
        });

        const { payload, labelIds } = message.data;
        const headers = payload?.headers ?? [];

        // Determine the label (inbox or first available label)
        const label = labelIds?.includes("INBOX")
          ? "inbox"
          : labelIds?.[0]?.toLowerCase() ?? "inbox";

        // Construct email URL
        const href = `https://mail.google.com/mail/u/${
          user.GMAIL!.authUser
        }/#${label}/${id}`;

        // Process email content
        let content = "";
        if (user.isAISearch) {
          content = redactText(await processEmailContent(payload?.parts));
        }

        return {
          id: id!,
          date: getHeader(headers, "Date"),
          author: getHeader(headers, "From"),
          title: getHeader(headers, "Subject"),
          href,
          email: user.email,
          logo: "./Gmail.svg",
          content,
        };
      })
    );

    emails.forEach((email) => {
      if (email) result.push(email);
    });

    pageToken = data.nextPageToken ?? undefined;
  } while (pageToken && result.length < 50); // Limit total results to 50

  return result;
};
