"use server";

import { ConnectToDB, isSearchableService, redactText } from "@/lib/utils";

import { auth } from "@clerk/nextjs/server";

import {
  searchDocs,
  searchGmail,
  searchGitHub,
  searchNotion,
  searchSheets,
  searchSlack,
} from "./utils.actions";

import {
  CoreMessage,
  ImagePart,
  streamText,
  TextPart,
  cosineSimilarity,
  embed,
} from "ai";
import { createStreamableValue, StreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  DocumentType,
  TActionResponse,
  TDocumentResponse,
  TSearchableService,
} from "@/lib/types";
import { createSearchHistoryInstance } from "./user.actions";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { decryptedUserData } from "./security.actions";
import { TUser } from "@/models/user.model";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
]

const tunedModel_Gmail = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "tunedModels/gmailquery-ham7ian0yejt",
  safetySettings,
});

const tunedModel_Docs = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "tunedModels/google-docs-data-5u6szrdsitel",
  safetySettings
});

const tunedModel_Sheets = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "tunedModels/google-sheets-data-rsvd22fipb8n",
  safetySettings
});

const tunedModel_Slack = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "tunedModels/slack-data-oglib9jwnvqj",
  safetySettings
});

const tunedModel_GitHub = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "tunedModels/github-data-qw3h8evn8n45",
  safetySettings
});

const googleGenAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
});

const checkEnabledServices = (user: TUser) => {
  const enabledServices: TSearchableService[] = [];

  for (const key in user) {
    const k = key as keyof TUser;
    if (isSearchableService(k) && user[k].searchStatus) {
      enabledServices.push(k);
    }
  }

  return enabledServices;
};

const generateSearchResult = async (
  user: TUser,
  input: string,
  enabledServices: TSearchableService[]
): Promise<TActionResponse<TDocumentResponse[]>> => {
  let discordResult: DocumentType[] = [];
  let githubResult: DocumentType[] = [];
  let gmailResult: DocumentType[] = [];
  let docsResult: DocumentType[] = [];
  let sheetsResult: (DocumentType & { ranges: string[] })[] = [];
  let slidesResult: DocumentType[] = [];
  let teamsResult: DocumentType[] = [];
  let notionResult: (DocumentType & { type: "Page" | "Database" })[] = [];
  let slackResult: DocumentType[] = [];

  try {
    await Promise.all(
      enabledServices.map(async (service) => {
        switch (service) {
          case "DISCORD":
            // Implemented soon;
            break;
          case "GITHUB":
            const githubQuery = (
              await tunedModel_GitHub.invoke(input)
            ).content.toString();
            const githubResponse = await searchGitHub(githubQuery.trim(), user);
            if (githubResponse.success) githubResult = githubResponse.data;
            else throw new Error(githubResponse.error);
            break;
          case "GMAIL":
            const emailQuery = (
              await tunedModel_Gmail.invoke(input)
            ).content.toString();
            const gmailResponse = await searchGmail(emailQuery.trim(), user);
            if (gmailResponse.success) gmailResult = gmailResponse.data;
            else throw new Error(gmailResponse.error);
            break;
          case "GOOGLE_DOCS":
            const docsQuery = (
              await tunedModel_Docs.invoke(input)
            ).content.toString();
            const docsResponse = await searchDocs(docsQuery.trim(), user);
            if (docsResponse.success) docsResult = docsResponse.data;
            else throw new Error(docsResponse.error);
            break;
          case "GOOGLE_SHEETS":
            const sheetsQuery = (
              await tunedModel_Sheets.invoke(input)
            ).content.toString();
            const sheetsResponse = await searchSheets(sheetsQuery.trim(), user);
            if (sheetsResponse.success) sheetsResult = sheetsResponse.data;
            else throw new Error(sheetsResponse.error);
            break;
          case "GOOGLE_SLIDES":
            // Implemented soon;
            break;
          case "MICROSOFT_TEAMS":
            // Implemented soon;
            break;
          case "NOTION":
            const notionResponse = await searchNotion(input, user);
            if (notionResponse.success) notionResult = notionResponse.data;
            else throw new Error(notionResponse.error);
            break;
          default:
            const slackQuery = (
              await tunedModel_Slack.invoke(input)
            ).content.toString();
            const slackResponse = await searchSlack(slackQuery.trim(), user);
            if (slackResponse.success) slackResult = slackResponse.data;
            else throw new Error(slackResponse.error);
        }
      })
    );

    return {
      success: true,
      data: [
        ...gmailResult,
        ...docsResult,
        ...sheetsResult,
        ...slackResult,
        ...notionResult,
        ...githubResult,
        ...discordResult,
        ...slidesResult,
        ...teamsResult,
      ],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const searchAction = async (
  formData: FormData
): Promise<
  TActionResponse<TDocumentResponse[] | StreamableValue<string, any>>
> => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthenticated user. Please login first.");

    const data = formData.get("search")?.toString().trim();
    if (!data) throw new Error("Bad request. Please enter your query.");

    // Trying to remove sensitive information before it is processed
    const query = redactText(data);

    await ConnectToDB();
    const user = (await decryptedUserData(userId)) as TUser | undefined;
    if (!user) throw new Error("User not found");

    const enabledServices = checkEnabledServices(user);
    if (enabledServices.length === 0) {
      return {
        success: false,
        error: "Please enable at least one service",
      };
    }

    await createSearchHistoryInstance(query, user.email, user.searchCount, user.isAISearch, userId);

    // Search the query against every platform the user is connected to.
    const response = await generateSearchResult(user, query, enabledServices);
    if (!response.success) throw new Error(response.error);

    const result = response.data;

    // If no AI-Search, then just return the result.
    if (!user.isAISearch) return { success: true, data: result };

    const { embedding: userEmbedding } = await embed({
      model: googleGenAI.textEmbeddingModel("text-embedding-004"),
      value: query,
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

    const messages = similarDocs.map(({ content }): TextPart | ImagePart => {
      return {
        text: content,
        type: "text",
      };
    });

    messages.unshift({
      text: `User query: ${query} \n Following messages contain the context from which you have to answer.`,
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

    return {
      success: true,
      data: createStreamableValue(streamResult.textStream).value,
    };
  } catch (error: any) {
    console.error("Search error:", error.message);

    return {
      success: false,
      error: error.name,
    };
  }
};

export const chatAction = async (
  data: { role: "user" | "assistant"; content: string }[]
): Promise<TActionResponse<StreamableValue<string, any>>> => {
  try {
    const streamResult = await streamText({
      model: googleGenAI("gemini-1.5-flash"),
      messages: data as CoreMessage[],
      temperature: 1,
    });

    return {
      success: true,
      data: createStreamableValue(streamResult.textStream).value,
    };
  } catch (error: any) {
    return { success: false, error: error.name };
  }
};
