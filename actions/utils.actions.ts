"use server";

import { User, UserType } from "@/models/user.model";
import { DocumentType, FilterKey } from "@/lib/types";
import { gmail_v1, google } from "googleapis";
import { JSDOM } from "jsdom";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { ConnectToDB } from "@/lib/utils";
import { format } from "date-fns";
import { PineconeStore } from "@langchain/pinecone";
import { Document } from "langchain/document";
import {
  GoogleGenerativeAIEmbeddings,
  GoogleGenerativeAIEmbeddingsParams,
} from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";

const textSplitter = new CharacterTextSplitter({ separator: "</html>" });

const pineconeIndex = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
}).Index(process.env.PINECONE_INDEX!);

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  maxRetries: 2,
  model: "text-embedding-004",
  taskType:
    "SEMANTIC_SIMILARITY" as GoogleGenerativeAIEmbeddingsParams["taskType"],
  maxConcurrency: 5,
});

const checkAndRefreshToken = async (user: UserType, oauth2Client: any) => {
  const { gmail } = user;
  if (!gmail?.accessToken)
    throw new Error("Please connect you Gmail account...");

  const { accessToken, expiresAt, refreshToken } = gmail;

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
            "gmail.accessToken": credentials.access_token,
            "gmail.expiresAt": credentials.expiry_date,
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

export const getPlatformClient = async (
  platform: FilterKey,
  user: UserType | null
) => {
  try {
    if (user) {
      const oauth2Client = new google.auth.OAuth2({
        clientId: process.env.GMAIL_CLIENT_ID!,
        clientSecret: process.env.GMAIL_CLIENT_SECRET!,
      });

      await checkAndRefreshToken(user, oauth2Client);

      return google.gmail({
        version: "v1",
        auth: oauth2Client,
      });
    }
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
  gmail: gmail_v1.Gmail | undefined
): Promise<DocumentType[]> => {
  if ((searchQuery.trim().length === 0 && !user.isAISearch) || !gmail)
    return [];

  const result: DocumentType[] = [];
  let pageToken: string | undefined;
  let nextSync = user.gmail!.lastSync;

  // Define email fetching parameters
  const fetchParams = {
    userId: user.email,
    q: user.isAISearch
      ? `category:primary after:${format(user.gmail!.lastSync, "dd/MM/yyyy")}`
      : searchQuery,
    maxResults: 50, // Limit results per page
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

        // Checking for fresh emails
        if (
          user.isAISearch &&
          message.data.internalDate &&
          parseInt(message.data.internalDate) <= user.gmail!.lastSync
        ) {
          return undefined;
        }

        if (nextSync === user.gmail!.lastSync)
          nextSync = parseInt(message.data.internalDate!);

        const { payload, labelIds } = message.data;
        const headers = payload?.headers ?? [];

        // Determine the label (inbox or first available label)
        const label = labelIds?.includes("INBOX")
          ? "inbox"
          : labelIds?.[0]?.toLowerCase() ?? "inbox";

        // Construct email URL
        const href = `https://mail.google.com/mail/u/${
          user.gmail!.authUser
        }/#${label}/${id}`;

        // Process email content
        let content = "";
        if (user.isAISearch) {
          content = await processEmailContent(payload?.parts);
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
  } while (pageToken && result.length < 100); // Limit total results to 100

  if (user.gmail!.lastSync !== nextSync) {
    await ConnectToDB();
    await User.findOneAndUpdate(
      { userId: user.userId },
      {
        $set: {
          "gmail.lastSync": nextSync,
        },
      }
    );
  }

  return result;
};

export const generateEmbeddings = async (
  platform: FilterKey,
  user: UserType,
  client: any
) => {
  const data = await searchEmails("", user, client);
  const pineconeRecord = data.map(
    ({ content, href, id, logo, author, date, title }) => {
      return new Document({
        pageContent: `context: ${content} \n\n metadata: {resource_link: ${href}, sender: ${author}, received_date: ${format(
          date,
          "yyyy/MM/dd"
        )}, subject: ${title}}`,
        id,
        metadata: {
          logo,
        },
      });
    }
  );

  await PineconeStore.fromDocuments(pineconeRecord, embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
    namespace: user.userId,
    maxRetries: 2,
    onFailedAttempt: (error) => {
      console.log(
        "Failed to insert documents into Pinecone database:",
        error?.message
      );
    },
  });
};
