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

import { cosineSimilarity } from "ai";
import {
  CombinedFilterKey,
  DocumentType,
  TActionResponse,
  TDocumentResponse,
  TRedactText,
  TSearchableService,
} from "@/lib/types";
import { createSearchHistoryInstance } from "./user.actions";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { decryptedUserData } from "./security.actions";
import { TUser, User } from "@/models/user.model";
import { safetySettings } from "@/lib/constants";
import { OllamaEmbeddings } from "@langchain/ollama";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { Subscription, TSubscription } from "@/models/subscription.model";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

const SIMILAR_RESULT_COUNT = 6;

const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1800 });

const ollamaEmbeddings = new OllamaEmbeddings({
  baseUrl: process.env.OLLAMA_BASE_URL!,
  model: "nomic-embed-text",
  maxRetries: 2
});

const geminiEmbeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "text-embedding-004",
  maxRetries: 2,
});

const tunedModel_Gmail = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "tunedModels/gmaildata-eeqty1uf9miv",
  safetySettings,
});

const tunedModel_Docs = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "tunedModels/docs-query-model-abcbb2id94jh",
  safetySettings,
});

const tunedModel_Sheets = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "tunedModels/sheets-query-model-r3bnikss6b7y",
  safetySettings,
});

const tunedModel_Slack = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "tunedModels/slack-query-model-lts7iivnuy2z",
  safetySettings,
});

const tunedModel_GitHub = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "tunedModels/github-query-model-dxh0979jx84e",
  safetySettings,
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
  input: TRedactText,
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
            const githubQuery = (await tunedModel_GitHub.invoke(`'${input.redactedText}'`)).content.toString();
            const githubResponse = await searchGitHub(githubQuery.trim(), input.positions, user);
            if (githubResponse.success) githubResult = githubResponse.data;
            else throw new Error(githubResponse.error);
            break;
          case "GMAIL":
            const emailQuery = (await tunedModel_Gmail.invoke(`'${input.redactedText}'`)).content.toString();
            let gmailResponse = await searchGmail(emailQuery.trim(),input.positions, user);
            if (gmailResponse.success) gmailResult = gmailResponse.data;
            else throw new Error(gmailResponse.error);
            break;
          case "GOOGLE_DOCS":
            const docsQuery = (await tunedModel_Docs.invoke(`'${input.redactedText}'`)).content.toString();
            const docsResponse = await searchDocs(docsQuery.trim(), input.positions, user);
            if (docsResponse.success) docsResult = docsResponse.data;
            else throw new Error(docsResponse.error);
            break;
          case "GOOGLE_SHEETS":
            const sheetsQuery = (await tunedModel_Sheets.invoke(`'${input.redactedText}'`)).content.toString();
            const sheetsResponse = await searchSheets(sheetsQuery.trim(), input.positions, user);
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
            const notionResponse = await searchNotion(input.redactedText, input.positions, user);
            if (notionResponse.success) notionResult = notionResponse.data;
            else throw new Error(notionResponse.error);
            break;
          default:
            const slackQuery = (await tunedModel_Slack.invoke(`'${input.redactedText}'`)).content.toString();
            const slackResponse = await searchSlack(slackQuery.trim(), input.positions, user);
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
    console.log("Error while generating search results: ", error.message);
    return {
      success: false,
      error: "Error while generating search results, please try again later",
    };
  }
};

export const searchAction = async (
  query: string,
  model: "gemini" | "ollama"
): Promise<
  TActionResponse<TDocumentResponse[]>
> => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthenticated");

    if (!query) throw new Error("Bad request. Search input can't be empty");

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

    // If no subscription, and free search credits also exceeds
    if(!user.hasSubscription && user.credits.search === 0){
      return {
        success: false,
        error: "Credits exceed, please subscribe to the Professional plan",
      };
    }

    const subscription = await Subscription.findOne<Pick<TSubscription, "currentEnd">>(
      { subId: user.currentSubId }, 
      { currentEnd: 1, _id: 0 }
    );
    
    const isSubscriptionExpired = subscription ? subscription.currentEnd < Date.now() : true;

    if(user.hasSubscription && isSubscriptionExpired){
      return {
        success: false,
        error: "Subscription expired, please re-subscribe to the Professional plan",
      };
    }

    if(!user.hasSubscription){
      await User.findOneAndUpdate({ userId }, {
        $inc: {
          "credits.search": -1
        }
      });
    }

    const redactedQuery = redactText(query);
    await createSearchHistoryInstance(
      query,
      user.email,
      user.searchCount,
      user.isAISearch,
      userId
    );

    // Search the query against every platform the user is connected to.
    const response = await generateSearchResult(user, redactedQuery, enabledServices);
    if (!response.success) throw new Error(response.error);

    const results = response.data;

    // If no AI-Search, then just return the result.
    if (!user.isAISearch) return { success: true, data: results };

    const groupByPlatform: Record<
      Exclude<CombinedFilterKey, "GOOGLE_DRIVE" | "GOOGLE_CALENDAR">,
      (TDocumentResponse & { similarity: number })[]
    > = {
      DISCORD: [],
      GITHUB: [],
      GMAIL: [],
      GOOGLE_DOCS: [],
      GOOGLE_SHEETS: [],
      GOOGLE_SLIDES: [],
      MICROSOFT_TEAMS: [],
      NOTION: [],
      SLACK: [],
    };

    const embeddingModel = model === "gemini" ? geminiEmbeddings : ollamaEmbeddings;
    const queryEmbedding = await embeddingModel.embedQuery(redactedQuery.redactedText);

    await Promise.all(
      results.map(async (item) => {
        const chunks = await textSplitter.splitText(item.content);
        const contentEmbedding = await embeddingModel.embedDocuments(chunks);

        const similarity = (contentEmbedding.reduce((accu, embedding) => (
          accu + cosineSimilarity(queryEmbedding, embedding))
        , 0)) / contentEmbedding.length;
  
        groupByPlatform[item.key].push({
          ...item,
          similarity,
        });
      })
    );

    const releventResults = Object.entries(groupByPlatform).flatMap(
      ([_, item]) =>
        item
          .sort((a, b) => a.similarity - b.similarity)
          .slice(0, SIMILAR_RESULT_COUNT)
          .map(({ similarity, ...rest }) => rest)
    );

    return {
      success: true,
      data: releventResults,
    };
  } catch (error: any) {
    console.error("Search error:", error.message);

    return {
      success: false,
      error: "Oops! Something went wrong. Try searching later",
    };
  }
};
