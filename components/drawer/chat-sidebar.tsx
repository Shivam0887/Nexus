"use client";

import { cn } from "@/lib/utils";
import { TDocumentResponse } from "@/lib/types";

import { toast } from "sonner";
import Image from "next/image";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { Loader2, MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import Textarea from "@/components/ui/textarea";
import Skeleton from "@/components/ui/skeleton";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

import useUser from "@/hooks/useUser";
import { useDrawerSelection } from "@/hooks/useDrawerSelection";

import { chatAction } from "@/actions/search.actions";
import { getProcessedContent } from "@/actions/utils.actions";

import { readStreamableValue } from "ai/rsc";

type TChat = { role: "user" | "assistant"; content: string };

const ChatSidebarDrawer = () => {
  const { drawerState } = useDrawerSelection();

  const [isSearching, setIsSearching] = useState(false);

  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);

  const lastItemRef = useRef<HTMLDivElement | null>(null);

  const [chats, setChats] = useState<TChat[]>([]);

  useEffect(() => {
    if (lastItemRef.current) {
      lastItemRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [chats]);

  if (drawerState.data?.type !== "SidebarChat") return;

  const document = drawerState.data.data;
  const isOpen = drawerState.isOpen && drawerState.type === "SidebarChat";

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
        { role: "assistant", content: "Answer the upcoming queries." },
      ];

      setChats(newChats);
      setIsContentLoading(false);
      setIsContentLoaded(true);

      const response = await chatAction(newChats);

      setTimeout(() => {
        setIsSearching(false);
      }, 0);

      if (!response.success) {
        setChats((chats) => [
          chats[0],
          { ...chats[1], content: response.error },
        ]);
      } else {
        for await (const content of readStreamableValue(response.data)) {
          if (content) {
            setChats((chats) => [chats[0], { ...chats[1], content }]);
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message);
      setIsContentLoading(false);
      setIsContentLoaded(false);
      setIsSearching(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    const userQuery = formData.get("search")!.toString();
    setIsSearching(true);

    const newChats = [
      ...chats,
      { role: "user", content: userQuery },
      { role: "assistant", content: "" },
    ] as TChat[];

    setChats(newChats);

    try {
      const response = await chatAction(newChats);
      setTimeout(() => {
        setIsSearching(false);
      }, 0);

      if (!response.success) {
        setChats((prevChats) => [
          ...prevChats.slice(0, -1),
          { role: "assistant", content: response.error },
        ]);
      } else {
        for await (const content of readStreamableValue(response.data)) {
          if (content) {
            setChats((prevChats) => [
              ...prevChats.slice(0, -1),
              { role: "assistant", content },
            ]);
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message);
      setIsSearching(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={() => {}} drawerDirection="right">
      <DrawerContent
        containerClassName="h-full"
        handleStyles={{ display: "none" }}
      >
        <div className="relative mx-4 grid grid-rows-[auto_1fr] h-[calc(100%-1rem)]">
          <div>
            <span className="text-xs">
              <sup>*</sup> We&apos;re not storing the chats.
            </span>
            <h2 className="text-2xl font-semibold">Title: {document.title}</h2>
            <p className="text-sm">
              Date: {format(document.date, "eee, MMM do, yyyy 'at' hh:mm aaa")}
            </p>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto">
            <div className="flex-1 overflow-y-auto flex flex-col relative">
              {/* Load content */}
              {!isContentLoaded && (
                <button
                  type="button"
                  disabled={isContentLoading}
                  onClick={() => handleClick(document)}
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-neutral-950 border-none hover:bg-neutral-900 transition-colors flex items-center gap-2",
                    { "cursor-not-allowed": isContentLoading }
                  )}
                >
                  {isContentLoading && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  {isContentLoading ? "Loading..." : "Load Content"}
                </button>
              )}

              {chats.map(({ content, role }, idx) => (
                <div key={`${role}:${idx}`} className="flex py-3">
                  <div className="flex justify-end gap-2 w-full">
                    <div
                      className={`relative size-6 ${
                        role === "assistant" ? "mt-4" : ""
                      }`}
                    >
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
                      <p className="text-sm w-3/4 md:w-1/2 mr-2 rounded-lg bg-neutral-900 p-4">
                        {content}
                      </p>
                    ) : (
                      <>
                        {isSearching && idx === chats.length - 1 ? (
                          <>
                            <Skeleton />
                            <Skeleton className="w-3/4 mt-2" />
                          </>
                        ) : (
                          <div
                            ref={idx === chats.length - 1 ? lastItemRef : null}
                            className="!max-w-max char markdown !p-0 !bg-inherit"
                          >
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
            <form action={handleSubmit} className="mb-10">
              <Textarea
                setIsSearching={setIsSearching}
                fileUploadClassName="hidden"
                containerClassName="max-w-full"
              />
            </form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ChatSidebarDrawer;
