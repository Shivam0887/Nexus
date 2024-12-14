"use client";

import { cn } from "@/lib/utils";
import { TDocumentResponse } from "@/lib/types";

import { toast } from "sonner";
import Image from "next/image";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { Info, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import Skeleton from "@/components/ui/skeleton";

import { getProcessedContent } from "@/actions/utils.actions";
import { useSearchDocument } from "@/hooks/useSearchDocument";
import { notFound } from "next/navigation";
import { TooltipContainer } from "@/components/tooltip";
import useUser from "@/hooks/useUser";

type TChat = { role: "user" | "assistant"; content: string };

const SummaryPage = ({ params }: { params: { id: string } }) => {
  const { searchContextDocuments } = useSearchDocument();
  const { user } = useUser();

  const [isSearching, setIsSearching] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const [chats, setChats] = useState<TChat[]>([]);

  useEffect(() => {
    // Smoothly scroll to the bottom when new data is added
    const container = containerRef.current;
    if (!isUserScrolling && container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chats, isUserScrolling]);

  useEffect(() => {
    const container = containerRef.current;
    const handleScroll = () => {
      setIsUserScrolling(true);
      clearTimeout(scrollTimeoutRef.current);

      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false);
      }, 3000);
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
      setIsSearching(true);
      setIsContentLoading(true);

      if (!(key === "GITHUB" || key === "SLACK")) {
        const response = await getProcessedContent(key, id, type, ranges);
        if (!response.success) throw new Error(response.error);
        processedContent = response.data;
      }

      const newChats: TChat[] = [
        { role: "user", content: processedContent },
        { role: "assistant", content: "Summarize" },
      ];

      setChats(newChats);
      setIsContentLoading(false);
      setIsContentLoaded(true);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: newChats,
          model: user.aiModel
        }),
      });

      setTimeout(() => {
        setIsSearching(false);
      }, 0);

      if (!response.body) {
        throw new Error("No response body");
      }

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
      toast.error("Service is currenly unavailable");

      setChats((prevChats) => [
        ...prevChats.slice(0, -1),
        {
          role: "assistant",
          content: "Having some issues, please try again later.",
        },
      ]);
      setIsContentLoading(false);
      setIsSearching(false);
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
      <div className="flex flex-col gap-4 overflow-y-auto pb-4">
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto flex flex-col relative"
        >
          {/* Load content */}
          {!isContentLoaded ? (
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
              Summarize
            </button>
          ) : (
            <>
              {chats.length > 0 && (
                <div className="w-full my-3">
                  <div className="flex gap-2 w-full">
                    <div className="relative size-6 ">
                      <Image
                        src={"/logo.jpeg"}
                        alt={chats[1].role}
                        fill
                        className="rounded-full"
                      />
                    </div>
                    <>
                      {isSearching ? (
                        <>
                          <Skeleton />
                          <Skeleton className="w-3/4 mt-2" />
                        </>
                      ) : (
                        <div className="flex-1 !max-w-none markdown !p-0 !bg-inherit">
                          <ReactMarkdown className="w-full char">
                            {chats[1].content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
