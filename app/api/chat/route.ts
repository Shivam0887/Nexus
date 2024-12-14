import { safetySettings } from "@/lib/constants";
import { ConnectToDB } from "@/lib/utils";
import { TUser, User } from "@/models/user.model";
import { auth } from "@clerk/nextjs/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOllama } from "@langchain/ollama";
import { NextRequest } from "next/server";
import { z } from "zod";

// Configure Ollama client
const ollama = new ChatOllama({
  baseUrl: process.env.OLLAMA_BASE_URL!,
  model: "llama3.2",
  streaming: true,
  maxRetries: 2,
  temperature: 1,
});

const gemini = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
  model: "gemini-1.5-flash",
  streaming: true,
  maxRetries: 2,
  temperature: 1,
  safetySettings,
});

// Input schema validation
const requestBodySchema = z.object({
  data: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1, "Content must not be empty"),
    })
  ),
  nextQuery: z.string().nullish(),
  model: z.enum(["gemini", "ollama"]).default("ollama"),
});

// Streaming API route
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  try {
    if(!userId) throw new Error("Unauthorized");

    await ConnectToDB();
    const user = await User.findOne<Pick<TUser, "isAISearch">>({ userId }, { _id: 0, isAiSearch: 1 });
    if(!user) throw new Error("User not found");
    if(!user.isAISearch) throw new Error("Bad request");

    // Parse and validate request body
    const { data, nextQuery, model } = requestBodySchema.parse(
      await req.json()
    );
    const abortController = new AbortController();
    const signal = abortController.signal;

    req.signal.onabort = () => {
      console.log("Client aborted the request");
      abortController.abort();
    };

    const input = [
      {
        role: "system",
        content: `Generate a detailed Markdown response using headings, lists, code blocks, and other Markdown elements. \n Important note: You have to answer the upcoming queries based on the given context only. Are you ready to answer the upcoming queries?`,
      },
      ...data,
    ];

    if (nextQuery) {
      input.push({ role: "user", content: nextQuery });
    }

    // Create a readable stream for response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response =
            model === "gemini"
              ? await gemini.stream(input, { signal })
              : await ollama.stream(input, { signal });

          // Push chunks into the stream
          for await (const chunk of response) {
            controller.enqueue(encoder.encode(chunk.content.toString()));
          }

          controller.close();
        } catch (error: any) {
          if (signal.aborted) {
            console.log("Streaming aborted due to client disconnect");
          } else {
            console.error("Error during streaming:", error.message);
            controller.error(error);
          }
        }
      },
    });

    // Return stream as the response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    console.error("Error processing request:", error.message);
    return new Response(`${error.message}`, { status: 500 });
  }
}
