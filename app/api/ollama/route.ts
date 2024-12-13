import { ChatOllama } from "@langchain/ollama";
import { NextRequest } from "next/server";
import { z } from "zod";

// Configure Ollama client
const ollama = new ChatOllama({
  baseUrl: process.env.OLLAMA_BASE_URL!,
  model: "llama3.2",
  streaming: true,
  temperature: 1,
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
});

// Streaming API route
export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const { data, nextQuery } = requestBodySchema.parse(await req.json());
    const abortController = new AbortController();
    const signal = abortController.signal;

    req.signal.onabort = () => {
      console.log("Client aborted the request");
      abortController.abort();
    };

    const input = [
      {
        role: "system",
        content: `Generate a detailed Markdown response using headings, lists, code blocks, and other Markdown elements. \n You have to answer the following queries based on the given context only. Are you ready to answer the following queries?`,
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
          // Generate a streaming response from Ollama
          const response = await ollama.stream(input, { signal });

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
