"use server";

import { Scopes } from "@/lib/constants";
import { ConnectToDB } from "@/lib/utils";
import { DocumentType } from "@/lib/types";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { User, UserType } from "@/models/user.model";

import { gmail_v1, google } from "googleapis";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import { JSDOM } from "jsdom";
import { gmailPrompt } from "@/lib/prompt";

const clientId = process.env.GMAIL_CLIENT_ID!;
const clientSecret = process.env.GMAIL_CLIENT_SECRET!;
const redirectUri = `${process.env.OAUTH_REDIRECT_URI!}/gmail`;

const textSplitter = new CharacterTextSplitter({ separator: "</html>" });

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  maxRetries: 2,
});

const oauth2Client = new google.auth.OAuth2({
  clientId,
  clientSecret,
  redirectUri,
});

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
  clerkId: string,
  authUser: string
): Promise<DocumentType[]> => {
  if (searchQuery.trim().length === 0) return [];

  await checkAndRefreshToken(clerkId);
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const result: DocumentType[] = [];
  let pageToken: string | undefined;

  // Define email fetching parameters
  const fetchParams = {
    userId,
    q: searchQuery,
    maxResults: 50, // Limit results per page
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

  do {
    // Fetch emails
    const { data } = await gmail.users.messages.list({
      ...fetchParams,
      pageToken,
    });

    if (!data.messages) break;

    // Process each email
    const emails = await Promise.all(
      data.messages.map(async ({ id }) => {
        const message = await gmail.users.messages.get({
          userId,
          id: id!,
        });

        const { payload, labelIds } = message.data;
        const headers = payload?.headers ?? [];

        // Determine the label (inbox or first available label)
        const label = labelIds?.includes("INBOX")
          ? "inbox"
          : labelIds?.[0]?.toLowerCase() ?? "inbox";

        // Construct email URL
        const href = `https://mail.google.com/mail/u/${authUser}/#${label}/${id}`;

        // Process email content
        // const content = await processEmailContent(payload?.parts);

        return {
          date: getHeader(headers, "Date"),
          author: getHeader(headers, "From"),
          title: getHeader(headers, "Subject"),
          href,
          email: userId,
          logo: "./Gmail.svg",
          content: "",
        };
      })
    );

    result.push(...emails);
    pageToken = data.nextPageToken ?? undefined;
  } while (pageToken && result.length < 100); // Limit total results to 1000

  return result;
};

export const searchAction = async (
  state: DocumentType[],
  formData: FormData
) => {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthenticated user");

  try {
    const query = formData.get("search")?.toString().trim();
    if (!query) throw new Error("Please enter your query.");

    const aiMsg = await llm.invoke([
      ["assistant", `${gmailPrompt}\n\n Current date: ${new Date()}`],
      ["user", query],
    ]);

    await ConnectToDB();
    const user = await User.findOne<UserType>(
      { userId },
      { email: 1, gmail: 1 }
    );
    if (!user) throw new Error("User not found");

    console.log(aiMsg.content);

    return await searchEmails(
      aiMsg.content.toString(),
      user.email,
      userId,
      user.gmail!.authUser!
    );
  } catch (error: any) {
    console.error("Search error:", error.message);
    if (error.message === "RE_AUTHENTICATE") {
      const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: `openid ${Scopes["Gmail"]}`,
        prompt: "consent select_account",
        state: userId,
      });
      redirect(url);
    }
    return [];
  }
};

// "use server";

// import { Scopes } from "@/lib/constants";
// import { DocumentType, FilterKey } from "@/lib/types";
// import { ConnectToDB } from "@/lib/utils";
// import { User, UserType } from "@/models/user.model";
// import { auth } from "@clerk/nextjs/server";
// import { google } from "googleapis";
// import { redirect } from "next/navigation";
// import { PineconeClient } from "@pinecone-database/pinecone";
// import { OpenAIEmbeddings } from "langchain/embeddings/openai";
// import { PineconeStore } from "langchain/vectorstores/pinecone";
// import { Document } from "langchain/document";
// import { Notion } from "@notionhq/client";
// import { App } from "@slack/bolt";
// import { Client as DiscordClient } from "discord.js";
// import { Octokit } from "@octokit/rest";
// import { OneDrive } from "@microsoft/microsoft-graph-client";
// import { Client as OutlookClient } from "@microsoft/microsoft-graph-client";

// const clientId = process.env.GMAIL_CLIENT_ID!;
// const clientSecret = process.env.GMAIL_CLIENT_SECRET!;
// const redirectUri = `${process.env.OAUTH_REDIRECT_URI!}/gmail`;

// const oauth2Client = new google.auth.OAuth2({
//   clientId,
//   clientSecret,
//   redirectUri,
// });

// const pinecone = new PineconeClient();
// await pinecone.init({
//   environment: process.env.PINECONE_ENVIRONMENT!,
//   apiKey: process.env.PINECONE_API_KEY!,
// });

// const embeddings = new OpenAIEmbeddings();

// // Helper function to check and refresh token
// async function checkAndRefreshToken(userId: string) {
//   // ... (keep the existing implementation)
// }

// // Function to fetch and process emails
// async function fetchEmails(userId: string, query: string, authUser: string) {
//   await checkAndRefreshToken(userId);
//   const gmail = google.gmail({ version: "v1", auth: oauth2Client });
//   const result: ({content: string} & DocumentType)[] = [];
//   let pageToken: string | undefined;

//   do {
//     const { data } = await gmail.users.messages.list({
//       userId,
//       q: query,
//       pageToken,
//       maxResults: 100, // Limit results per page
//     });

//     if (!data.messages) break;

//     const emails = await Promise.all(
//       data.messages.map(async ({ id }) => {
//         const message = await gmail.users.messages.get({
//           userId,
//           id: id!,
//         });

//         const { payload, labelIds } = message.data;
//         const label = labelIds?.includes("INBOX")
//         ? "inbox"
//         : labelIds?.[0]?.toLowerCase() ?? "inbox";
//         const href = `https://mail.google.com/mail/u/${authUser}/#${label}/${id}`;

//         const headers = payload?.headers ?? [];
//         const getHeader = (name: string) => headers.find((h) => h.name === name)?.value ?? "";

//         const content = payload?.parts?.map(async ({ body, mimeType }) => {
//           let rawContent = "";

//           if(body?.size){
//             rawContent = Buffer.from(body.data!, "base64").toString("utf8");
//             if(mimeType === "text/html"){

//             }
//           }
//           else if(body?.attachmentId){
//             const attachment = await gmail.users.messages.attachments.get({
//               userId,
//               messageId: id!,
//               id: body.attachmentId
//             });

//             rawContent = Buffer.from(attachment.data.data!, "base64").toString("utf8");
//           }
//         })

//         return {
//           date: getHeader("Date"),
//           author: getHeader("From"),
//           title: getHeader("Subject"),
//           href,
//           email: userId,
//           logo: "./Gmail.svg",
//           content: ""
//         };
//       })
//     );

//     result.push(...emails);
//     pageToken = data.nextPageToken ?? undefined;
//   } while (pageToken && result.length < 1000); // Limit

//   return result;
// }

// // Function to fetch and process Google Docs
// async function fetchGoogleDocs(userId: string) {
//   await checkAndRefreshToken(userId);
//   const docs = google.docs({ version: "v1", auth: oauth2Client });
//   const drive = google.drive({ version: "v3", auth: oauth2Client });

//   const { data } = await drive.files.list({
//     q: "mimeType='application/vnd.google-apps.document'",
//     fields: "files(id, name)",
//   });

//   if (!data.files) return [];

//   const documents = await Promise.all(
//     data.files.map(async (file) => {
//       const doc = await docs.documents.get({ documentId: file.id! });
//       const content = doc.data.body?.content
//         ?.map((item) => item.paragraph?.elements?.map((el) => el.textRun?.content).join(""))
//         .join("\n");

//       return new Document({
//         pageContent: content ?? "",
//         metadata: {
//           platform: "googledocs",
//           id: file.id!,
//           title: file.name!,
//           href: `https://docs.google.com/document/d/${file.id}`,
//         },
//       });
//     })
//   );

//   return documents;
// }

// // Function to fetch and process Google Drive files
// async function fetchGoogleDrive(userId: string) {
//   await checkAndRefreshToken(userId);
//   const drive = google.drive({ version: "v3", auth: oauth2Client });

//   const { data } = await drive.files.list({
//     fields: "files(id, name, mimeType, description)",
//   });

//   if (!data.files) return [];

//   const files = data.files.map((file) =>
//     new Document({
//       pageContent: file.description ?? file.name ?? "",
//       metadata: {
//         platform: "googledrive",
//         id: file.id!,
//         title: file.name!,
//         mimeType: file.mimeType!,
//         href: `https://drive.google.com/file/d/${file.id}`,
//       },
//     })
//   );

//   return files;
// }

// // Function to fetch and process Notion pages
// async function fetchNotion(userId: string) {
//   const notion = new Notion({ auth: process.env.NOTION_API_KEY });
//   const { results } = await notion.search({});

//   const pages = results.map((page: any) =>
//     new Document({
//       pageContent: page.properties?.title?.title[0]?.plain_text ?? "",
//       metadata: {
//         platform: "notion",
//         id: page.id,
//         title: page.properties?.title?.title[0]?.plain_text ?? "Untitled",
//         href: page.url,
//       },
//     })
//   );

//   return pages;
// }

// // Function to fetch and process Slack messages
// async function fetchSlack(userId: string) {
//   const app = new App({
//     token: process.env.SLACK_BOT_TOKEN,
//     signingSecret: process.env.SLACK_SIGNING_SECRET,
//   });

//   const result = await app.client.search.messages({
//     query: "*",
//     count: 100,
//   });

//   const messages = result.messages?.matches?.map((message: any) =>
//     new Document({
//       pageContent: message.text,
//       metadata: {
//         platform: "slack",
//         id: message.ts,
//         author: message.username,
//         channel: message.channel.name,
//         href: message.permalink,
//       },
//     })
//   ) ?? [];

//   return messages;
// }

// // Function to fetch and process Discord messages
// async function fetchDiscord(userId: string) {
//   const client = new DiscordClient({ intents: ["GUILDS", "GUILD_MESSAGES"] });
//   await client.login(process.env.DISCORD_BOT_TOKEN);

//   const messages: Document[] = [];

//   for (const guild of client.guilds.cache.values()) {
//     for (const channel of guild.channels.cache.values()) {
//       if (channel.isText()) {
//         const fetchedMessages = await channel.messages.fetch({ limit: 100 });
//         fetchedMessages.forEach((message) => {
//           messages.push(new Document({
//             pageContent: message.content,
//             metadata: {
//               platform: "discord",
//               id: message.id,
//               author: message.author.username,
//               channel: channel.name,
//               guild: guild.name,
//               href: message.url,
//             },
//           }));
//         });
//       }
//     }
//   }

//   return messages;
// }

// // Function to fetch and process GitHub issues and pull requests
// async function fetchGitHub(userId: string) {
//   const octokit = new Octokit({ auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN });

//   const { data: issues } = await octokit.issues.listForAuthenticatedUser({
//     filter: "all",
//     state: "all",
//     per_page: 100,
//   });

//   const documents = issues.map((issue) =>
//     new Document({
//       pageContent: issue.title + "\n" + issue.body,
//       metadata: {
//         platform: "github",
//         id: issue.id.toString(),
//         title: issue.title,
//         state: issue.state,
//         type: issue.pull_request ? "pull_request" : "issue",
//         href: issue.html_url,
//       },
//     })
//   );

//   return documents;
// }

// // Function to fetch and process OneDrive files
// async function fetchOneDrive(userId: string) {
//   const client = OneDrive.init({
//     authProvider: (done) => {
//       done(null, process.env.ONEDRIVE_ACCESS_TOKEN);
//     },
//   });

//   const response = await client.api("/me/drive/root/children").get();

//   const files = response.value.map((file: any) =>
//     new Document({
//       pageContent: file.name,
//       metadata: {
//         platform: "onedrive",
//         id: file.id,
//         name: file.name,
//         type: file.file ? "file" : "folder",
//         href: file.webUrl,
//       },
//     })
//   );

//   return files;
// }

// // Function to fetch and process Outlook emails
// async function fetchOutlook(userId: string) {
//   const client = OutlookClient.init({
//     authProvider: (done) => {
//       done(null, process.env.OUTLOOK_ACCESS_TOKEN);
//     },
//   });

//   const response = await client.api("/me/messages").top(100).get();

//   const emails = response.value.map((email: any) =>
//     new Document({
//       pageContent: email.subject + "\n" + email.bodyPreview,
//       metadata: {
//         platform: "outlook",
//         id: email.id,
//         subject: email.subject,
//         from: email.from.emailAddress.address,
//         receivedDateTime: email.receivedDateTime,
//         href: email.webLink,
//       },
//     })
//   );

//   return emails;
// }

// export const searchAction = async (
//   state: DocumentType[],
//   formData: FormData
// ) => {
//   const { userId } = auth();
//   if (!userId) throw new Error("Unauthenticated user");

//   const query = formData.get("search")?.toString().trim();
//   if (!query) throw new Error("Please enter your query.");

//   try {
//     const user = await User.findOne<UserType>({ userId }).select('email').lean();
//     if (!user) throw new Error("User not found");

//     // Fetch data from all platforms
//     const [emails, googleDocs, googleDrive, notionPages, slackMessages, discordMessages, githubIssues, oneDriveFiles, outlookEmails] = await Promise.all([
//       fetchEmails(userId, query),
//       fetchGoogleDocs(userId),
//       fetchGoogleDrive(userId),
//       fetchNotion(userId),
//       fetchSlack(userId),
//       fetchDiscord(userId),
//       fetchGitHub(userId),
//       fetchOneDrive(userId),
//       fetchOutlook(userId),
//     ]);

//     // Combine all documents
//     const allDocuments = [
//       ...emails,
//       ...googleDocs,
//       ...googleDrive,
//       ...notionPages,
//       ...slackMessages,
//       ...discordMessages,
//       ...githubIssues,
//       ...oneDriveFiles,
//       ...outlookEmails,
//     ];

//     // Perform semantic search
//     const index = pinecone.Index(process.env.PINECONE_INDEX!);
//     const vectorStore = await PineconeStore.fromDocuments(allDocuments, embeddings, { pineconeIndex: index });

//     const results = await vectorStore.similaritySearch(query, 20);

//     // Format results
//     const formattedResults = results.map(result => ({
//       date: result.metadata.date || result.metadata.receivedDateTime,
//       author: result.metadata.from || result.metadata.author,
//       title: result.metadata.subject || result.metadata.title || "Untitled",
//       href: result.metadata.href,
//       email: user.email,
//       logo: getPlatformLogo(result.metadata.platform),
//       platform: result.metadata.platform,
//       snippet: result.pageContent.substring(0, 100) + '...'
//     }));

//     return formattedResults;
//   } catch (error: any) {
//     console.error("Search error:", error.message);
//     return [];
//   }
// };

// function getPlatformLogo(platform: string) {
//   const logoMap: {[key: string]: string} = {
//     gmail: './Gmail.svg',
//     googledocs: './GoogleDocs.svg',
//     googledrive: './GoogleDrive.svg',
//     notion: './Notion.svg',
//     slack: './Slack.svg',
//     discord: './Discord.svg',
//     github: './GitHub.svg',
//     onedrive: './OneDrive.svg',
//     outlook: './Outlook.svg',
//   };
//   return logoMap[platform] || './DefaultLogo.svg';
// }
