"use server";

import { ConnectToDB, isSearchableService } from "@/lib/utils";

import { auth } from "@clerk/nextjs/server";

import { User, UserType } from "@/models/user.model";
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
import { DocumentType, TActionResponse, TSearchableService } from "@/lib/types";
import { createSearchHistoryInstance } from "./user.actions";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const tunedModel_Gmail = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "tunedModels/gmailquery-ham7ian0yejt",
});

const tunedModel_Docs = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "tunedModels/google-docs-data-5u6szrdsitel",
});

const tunedModel_Sheets = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "tunedModels/google-sheets-data-rsvd22fipb8n",
});

const tunedModel_Slack = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "tunedModels/slack-data-oglib9jwnvqj",
});

const tunedModel_GitHub = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "tunedModels/github-data-qw3h8evn8n45",
});

const googleGenAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
});

const checkEnabledServices = (user: UserType) => {
  const enabledServices: TSearchableService[] = [];

  for (const key in user) {
    const k = key as keyof UserType;
    if (isSearchableService(k) && user[k].searchStatus) {
      enabledServices.push(k);
    }
  }

  return enabledServices;
};

const generateSearchResult = async (user: UserType, input: string, enabledServices: TSearchableService[]) => {
  let discordResult: DocumentType[] = [];
  let githubResult: DocumentType[] = [];
  let gmailResult: DocumentType[] = [];
  let docsResult: DocumentType[] = [];
  let sheetsResult: DocumentType[] = [];
  let slidesResult: DocumentType[] = [];
  let teamsResult: DocumentType[] = [];
  let notionResult: DocumentType[] = [];
  let slackResult: DocumentType[] = [];

  await Promise.all(enabledServices.map(async (service) => {
    switch(service){
      case "DISCORD":
        // Implemented soon;
        break;
      case "GITHUB":
        const githubQuery = (await tunedModel_GitHub.invoke(input)).content.toString();
        githubResult = await searchGitHub(githubQuery, user);
        break;
      case "GMAIL":
        const emailQuery = (await tunedModel_Gmail.invoke(input)).content.toString();
        gmailResult = await searchGmail(emailQuery, user);
        break;
      case "GOOGLE_DOCS":
        const docsQuery = (await tunedModel_Docs.invoke(input)).content.toString();
        docsResult = await searchDocs(docsQuery, user);
        break;
      case "GOOGLE_SHEETS":
        const sheetsQuery = (await tunedModel_Sheets.invoke(input)).content.toString();
        sheetsResult = await searchSheets(sheetsQuery, user);
        break;
      case "GOOGLE_SLIDES":
        // Implemented soon;
        break;
      case "MICROSOFT_TEAMS":
        // Implemented soon;
        break;
      case "NOTION":
        notionResult = await searchNotion(input, user);
        break;
      default:   
        const slackQuery = (await tunedModel_Slack.invoke(input)).content.toString();
        slackResult = await searchSlack(slackQuery, user);
    }
  }));

  return [
    ...gmailResult,
    ...docsResult,
    ...sheetsResult,
    ...slackResult,
    ...notionResult,
    ...githubResult,
    ...discordResult,
    ...slidesResult,
    ...teamsResult
  ]
};

export const searchAction = async (
  formData: FormData
): Promise<TActionResponse<DocumentType[] | StreamableValue<string, any>>> => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthenticated user. Please login first.");

    const query = formData.get("search")?.toString().trim();
    if (!query) throw new Error("Bad request. Please enter your query.");

    await ConnectToDB();
    const user = await User.findOne<UserType>({ userId });
    if (!user) throw new Error("User not found");

    const enabledServices = checkEnabledServices(user);
    if (enabledServices.length === 0) {
      return {
        success: false,
        error: "Please enable at least one service",
      };
    }

    await createSearchHistoryInstance(query, user.searchCount, user.isAISearch);
 
    // Search the query against every platform the user is connected to.
    const result =  await generateSearchResult(user, query, enabledServices);

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
