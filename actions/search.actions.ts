"use server";

import { ConnectToDB } from "@/lib/utils";

import { auth } from "@clerk/nextjs/server";

import { User, UserType } from "@/models/user.model";
import {
  generateSearchQuery,
  searchGitHub,
  searchNotion,
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
import { DocumentType, TActionResponse } from "@/lib/types";
import { createSearchHistoryInstance } from "./user.actions";

const googleGenAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
});

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

    await createSearchHistoryInstance(query, user.searchCount, user.isAISearch);

    const { gitHubQuery } = await generateSearchQuery(query);

    // Search the query against every platform the user is connected to.
    // const emailResult = await searchEmails(emailQuery, user);
    // const docsResult = await searchDocs(docsQuery, user);
    // const driveResult = await searchSheets(sheetsQuery, user);
    // const slackResult = await searchSlack(slackQuery, user);
    // const notionResult = await searchNotion(query, user);
    const gitHubResult = await searchGitHub(gitHubQuery, user);

    const result = [...gitHubResult]

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
