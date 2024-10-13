"use server";

import { ConnectToDB } from "@/lib/utils";
import { gmailPrompt } from "@/lib/prompt";

import { format } from "date-fns";
import { auth } from "@clerk/nextjs/server";

import { User, UserType } from "@/models/user.model";
import {
  checkAndRefreshToken,
  getPlatformClient,
  searchEmails,
} from "./utils.actions";

import {
  CoreMessage,
  generateText,
  ImagePart,
  streamText,
  TextPart,
  cosineSimilarity,
  embed,
} from "ai";
import { createStreamableValue, StreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { google } from "googleapis";
import { DocumentType } from "@/lib/types";

const googleGenAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
});

type ResponseType =
  | { success: true; data: DocumentType[] | StreamableValue<string, any> }
  | { success: false; error: string };

export const searchAction = async (
  formData: FormData
): Promise<ResponseType> => {
  try {
    const { userId } = auth();
    if (!userId) throw new Error("Unauthenticated user. Please login first.");

    const query = formData.get("search")?.toString().trim();
    if (!query) throw new Error("Bad request. Please enter your query.");

    await ConnectToDB();
    const user = await User.findOne<UserType>({ userId });
    if (!user) throw new Error("User not found");

    const oauth2Client = await getPlatformClient("GMAIL");
    await checkAndRefreshToken(user, "GMAIL", oauth2Client);

    const { text } = await generateText({
      model: googleGenAI("gemini-1.5-flash"),
      maxRetries: 1,
      prompt: `${gmailPrompt} \n\n Todays date: ${format(
        new Date(),
        "yyyy/MM/dd"
      )} \n\n query: ${query}`,
    });

    const prompt = text.trim();
    // Search the query against every platform the user is connected to.
    const result = await searchEmails(
      prompt,
      user,
      google.gmail({
        version: "v1",
        auth: oauth2Client,
      })
    );

    // If no AI-Search, then just return the result.
    if (!user.isAISearch) return { success: true, data: result };

    const { embedding: userEmbedding } = await embed({
      model: googleGenAI.textEmbeddingModel("text-embedding-004"),
      value: prompt,
    });

    const similarDocs = await Promise.all(
      result.map(async (item) => {
        const { embedding } = await embed({
          model: googleGenAI.textEmbeddingModel("text-embedding-004"),
          value: item.content,
        });

        return {
          ...item,
          similarity: cosineSimilarity(userEmbedding, embedding),
        };
      })
    );

    similarDocs.sort((a, b) => a.similarity - b.similarity);

    const messages = similarDocs.map(
      ({ author, content, date, email, href, title }): TextPart | ImagePart => {
        const pageContent = `Sender: ${author}\n\n Body: ${content}\n\n Message_Date: ${format(
          date,
          "yyyy/MM/dd"
        )}\n\n Email_Address: ${email}\n\n Link: ${href}\n\n Subject: ${title}`;

        return {
          text: content,
          type: "text",
        };
      }
    );

    messages.unshift({
      text: `User query: ${query} \n Following messages contain the context from which you have to answer. \nTodays date, if user requires any date related query: ${format(
        new Date(),
        "yyyy/MM/dd"
      )}`,
      type: "text",
    });

    const coreMessages: CoreMessage[] = [
      {
        content: `Generate a detailed and well-structured Markdown response on the topic below. The output should be visually appealing, using proper Markdown elements such as:
          Main headings (for major sections)
          Subheadings (to organize subsections)
          Bullet points or numbered lists (for listing features/benefits)
          Code blocks (for any code examples)
          Hyperlinks (for external references or documentation)
          Bold or italicized text for emphasis
          Blockquotes or notes (to highlight key points)`,
        role: "system",
      },
      {
        content: messages,
        role: "user",
      },
      {
        content: `Generate to the point response to the users query using the context given by the user.`,
        role: "assistant",
      },
    ];

    const streamResult = await streamText({
      model: googleGenAI("gemini-1.5-flash"),
      messages: coreMessages,
      temperature: 1,
    });

    const stream = createStreamableValue(streamResult.textStream);
    return { success: true, data: stream.value };
  } catch (error: any) {
    console.error("Search error:", error.message);

    return {
      success: false,
      error: error.message,
    };
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
