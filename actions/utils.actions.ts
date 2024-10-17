"use server";

import { JSDOM } from "jsdom";
import { ConnectToDB, redactText } from "@/lib/utils";
import { docs_v1, gmail_v1, google } from "googleapis";
import { User, UserType } from "@/models/user.model";
import { DocumentType, FilterKey } from "@/lib/types";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const textSplitter = new CharacterTextSplitter({ separator: "</html>" });

const tunedModel_Gmail = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "tunedModels/gmailquery-ztw3ralzaba7",
});

const tunedModel_Docs_Drive = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "tunedModels/docsdrivequery-gki6d0sd0ze0",
});

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

// Helper function to process Google Docs content
const processDocsContent = (
  content: docs_v1.Schema$StructuralElement
): string => {
  let result = "";
  if (content.paragraph?.elements) {
    result = content.paragraph.elements.reduce((curContent, { textRun }) => {
      return (curContent += textRun?.content ?? "");
    }, result);
  } else if (content.table?.tableRows) {
    const tableRows = content.table.tableRows;

    tableRows.forEach(({ tableCells }) => {
      tableCells?.forEach(({ content }) => {
        const structuralElement = content ?? [];
        result = structuralElement.reduce((curContent, item) => {
          return (curContent += processDocsContent(item));
        }, result);
      });
    });
  }

  return result;
};

export const searchEmails = async (
  searchQuery: string,
  user: UserType
): Promise<DocumentType[]> => {
  if (searchQuery.trim().length === 0 && !user.isAISearch) return [];

  const oauth2Client = await getPlatformClient("GMAIL");
  await checkAndRefreshToken(user, "GMAIL", oauth2Client);

  const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client,
  });

  const result: DocumentType[] = [];
  let pageToken: string | undefined;

  // Helper function to extract header value
  const getHeader = (
    headers: gmail_v1.Schema$MessagePartHeader[],
    name: string
  ): string =>
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ??
    "";

  do {
    // Fetch emails
    const { data } = await gmail.users.messages.list({
      userId: user.email,
      q: searchQuery,
      maxResults: 25,
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
          key: "GMAIL",
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

export const searchDocs = async (searchQuery: string, user: UserType) => {
  const oauth2Client = await getPlatformClient("GOOGLE_DOCS");
  await checkAndRefreshToken(user, "GOOGLE_DOCS", oauth2Client);

  // Google Drive client that fetches the list of documents matching the search query
  const drive = google.drive({
    auth: oauth2Client,
    version: "v3",
  });

  const docs = google.docs({
    version: "v1",
    auth: oauth2Client,
  });

  const docsIds = await drive.files.list({
    q: searchQuery,
    fields: "files(id,createdTime,owners(emailAddress))",
    corpus: "user",
  });

  const result = docsIds.data.files?.map(
    async ({ id, createdTime, owners }): Promise<DocumentType> => {
      const document = await docs.documents.get({
        documentId: id!,
        fields:
          "title,body(content(paragraph(elements(textRun(content))),table(tableRows(tableCells(content)))))",
      });

      let content = "";
      if (document.data.tabs && user.isAISearch) {
        const structuralElement =
          document.data.tabs[0].documentTab?.body?.content ?? [];

        content = structuralElement.reduce((curContent, item) => {
          curContent += processDocsContent(item);
          return curContent;
        }, "");
      }

      return {
        id: id!,
        author: owners![0].emailAddress!,
        content: redactText(content),
        date: createdTime!,
        email: user.email,
        title: document.data.title!,
        logo: "./Google_Docs.svg",
        href: `https://docs.google.com/document/d/${id!}`,
        key: "GOOGLE_DOCS",
      };
    }
  );

  return await Promise.all(result ?? []);
};

export const generateSearchQuery = async (input: string) => {
  const emailQuery = (
    await tunedModel_Gmail.invoke([
      {
        role: "assistant",
        content: "Don't manipulate the user input",
      },
      {
        role: "user",
        content: input,
      },
    ])
  ).content.toString();

  const docsQuery = (
    await tunedModel_Docs_Drive.invoke([
      {
        role: "assistant",
        content:
          "Append mime = application/vnd.google-apps.document at the end",
      },
      {
        role: "user",
        content: input,
      },
    ])
  ).content.toString();

  // const driveQuery = (
  //   await tunedModel_Docs_Drive.invoke([
  //     {
  //       role: "assistant",
  //       content:
  //         "Don't manipulate the user input, and use mime type either application/vnd.google-apps.file	or application/vnd.google-apps.folder as appropriate",
  //     },
  //     {
  //       role: "user",
  //       content: input,
  //     },
  //   ])
  // ).content.toString();

  // console.log({ emailQuery, docsQuery });
  return { emailQuery, docsQuery };
};
