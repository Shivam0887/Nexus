"use client";

import { cn, redactText } from "@/lib/utils";
import { TChat, TDocumentResponse } from "@/lib/types";

import { toast } from "sonner";
import Image from "next/image";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { Info, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import Textarea from "@/components/ui/textarea";
import Skeleton from "@/components/ui/skeleton";

import { getProcessedContent } from "@/actions/utils.actions";
import { useSearchDocument } from "@/hooks/useSearchDocument";
import { TooltipContainer } from "@/components/tooltip";
import { notFound } from "next/navigation";
import useUser from "@/hooks/useUser";

const ChatPage = ({ params }: { params: { id: string } }) => {
  const { searchContextChats, setSearchContextChats, searchContextDocuments } = useSearchDocument();
  const [userQuery, setUserQuery] = useState("");
  const { user, dispatch } = useUser();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUserScrolling, setIsUserScrolling] = useState<boolean>(false);

  const [chats, setChats] = useState<TChat[]>(searchContextChats[params.id] ? searchContextChats[params.id] : []);

  const [isContentLoading, setIsContentLoading] = useState<boolean>(false);
  const [isContentLoaded, setIsContentLoaded] = useState<boolean>(!!chats.length);

  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const controller = useMemo(() => new AbortController(), []);

  useEffect(() => {
    // Smoothly scroll to the bottom when new data is added
    const container = containerRef.current;
    if (!isUserScrolling && isStreaming && container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }

    setSearchContextChats((prev) => ({ ...prev, [params.id]: chats }));
  }, [params.id, chats, isUserScrolling, isStreaming, setSearchContextChats]);

  useEffect(() => {
    const container = containerRef.current;
    const handleScroll = () => {
      setIsUserScrolling(true);
      clearTimeout(scrollTimeoutRef.current);

      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false);
      }, 1000);
    };

    container?.addEventListener("scroll", handleScroll);

    return () => {
      container?.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const document = searchContextDocuments[params.id];
  if (!document) {
    notFound();
  }

  const handleClick = async (document: TDocumentResponse) => {
    const { content, id, ranges, type, key } = document;
    let processedContent = content;
    try {
      setIsContentLoading(true);

      if (!(key === "GITHUB" || key === "SLACK")) {
        const response = await getProcessedContent(key, id, type, ranges);
        if (!response.success) throw new Error(response.error);
        processedContent = redactText(response.data).redactedText;
      }

      setIsContentLoaded(true);
      setUserQuery(processedContent);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSubmitting(true);

    const newChats = [
      ...chats,
      { role: "user", content: userQuery },
      {
        role: "assistant",
        content: "",
      },
    ] as TChat[];

    setTimeout(() => {
      setUserQuery("");
      setChats(newChats);
    }, 0);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: chats,
          nextQuery: userQuery,
          model: user.aiModel
        }),
        signal: controller.signal,
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      setTimeout(() => {
        if(!user.hasSubscription && user.credits.ai > 0) dispatch({ type: "CREDIT_DESC_AI" });
        setIsStreaming(true);
        setIsLoading(false);
      }, 0);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let partialMessage = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        partialMessage += chunk;

        setChats((prevChats) => [
          ...prevChats.slice(0, -1),
          { role: "assistant", content: partialMessage },
        ]);
      }

    } catch (error: any) {
      if(error.name !== "AbortError") toast.error("Service is currenly unavailable");
      else toast.error(error.message);

      setChats((prevChats) => [
        ...prevChats.slice(0, -1),
        {
          role: "assistant",
          content: "Having some issues, please try again later.",
        },
      ]);
      setIsLoading(false);
    } finally {
      setIsStreaming(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative md:px-5 py-5 px-2 my-4 sm:mx-4 mx-0 h-[calc(100%-2rem)] rounded-2xl bg-neutral-900 grid grid-rows-[1fr_auto]">
      <div className="absolute z-50 left-4 top-4">
        <TooltipContainer
          side="right"
          align="center"
          trigger={<Info />}
          content={
            <button type="button">
              <h2 className="text-2xl font-semibold">
                Title: {document.title}
              </h2>
              <p className="text-sm">
                Date:{" "}
                {format(document.date, "eee, MMM do, yyyy 'at' hh:mm aaa")}
              </p>
            </button>
          }
        />
      </div>
      <div className="w-full flex flex-col justify-between gap-4 overflow-y-auto">
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto relative px-2 md:px-10"
        >
          {/* Load content */}
          {!isContentLoaded && (
            <button
              type="button"
              disabled={isContentLoading}
              onClick={() => handleClick(document)}
              className={cn(
                "absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-neutral-900 border-none hover:bg-neutral-950 transition-colors flex items-center gap-2",
                { "cursor-not-allowed": isContentLoading }
              )}
            >
              {isContentLoading && <Loader2 className="size-4 animate-spin" />}
              {isContentLoading ? "Loading..." : "Load Content"}
            </button>
          )}

          {chats.map(({ content, role }, idx) => (
            <div key={`${role}:${idx}`} className="flex pt-3">
              <div className="flex justify-end gap-4 w-full">
                <div className="relative size-6">
                  {role === "assistant" && (
                    <Image
                      src={"/logo.jpeg"}
                      alt={role}
                      fill
                      className="rounded-full"
                    />
                  )}
                </div>

                {role === "user" ? (
                  <p className="text-sm w-3/4 md:w-1/2 mr-2 rounded-lg bg-neutral-950 p-4">
                    {content}
                  </p>
                ) : (
                  <>
                    {isLoading && idx === chats.length - 1 ? (
                      <>
                        <Skeleton />
                        <Skeleton className="w-3/4 mt-2" />
                      </>
                    ) : (
                      <div className="flex-1 !max-w-none markdown !p-0 !bg-inherit">
                        <ReactMarkdown className="char">
                          {content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <Textarea
            fileUploadClassName="hidden"
            containerClassName="mx-auto"
            isStreaming={isStreaming}
            disable={isSubmitting}
            handleAbortRequest={() => controller.abort()}
            query={userQuery}
            setQuery={setUserQuery}
            isContentLoaded={isContentLoaded}
          />
        </form>
      </div>

      <div className="text-[11px] absolute bottom-0 left-1/2 -translate-x-1/2 text-neutral-300 font-light">
        Nexus can make mistakes. We&apos;re not storing the chats.
      </div>
    </div>
  );
};

export default ChatPage;
