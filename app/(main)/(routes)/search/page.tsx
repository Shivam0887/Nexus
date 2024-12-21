"use client";

import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import {
  Check,
  CircleFadingPlus,
  Copy,
  Fullscreen,
  Ghost,
  LayoutGrid,
  Menu,
} from "lucide-react";

import { cn, typedEntries } from "@/lib/utils";
import { CombinedFilterKey, FilterKey, TDocumentResponse } from "@/lib/types";

import { toast } from "sonner";
import { searchAction } from "@/actions/search.actions";

import useUser from "@/hooks/useUser";
import { useModalSelection } from "@/hooks/useModalSelection";

import Sorting from "@/components/sorting";
import Loading from "@/components/loading";
import Filter from "@/components/ui/filter";
import Calendar from "@/components/calendar";
import Document from "@/components/document";
import Textarea from "@/components/ui/textarea";
import { Flipwords } from "@/components/ui/flipwords";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TSearchChatHistory,
  TSearchDocument,
  useSearchDocument,
} from "@/hooks/useSearchDocument";

type LayoutType = "grid" | "list";

type TFilter = {
  key: Omit<CombinedFilterKey, "GOOGLE_CALENDAR">;
  logo: string;
  isSelected: boolean;
};

type TShowUserQueryProps = {
  setDocuments: React.Dispatch<React.SetStateAction<TDocumentResponse[]>>;
  setFilteredDocuments: React.Dispatch<
    React.SetStateAction<TDocumentResponse[]>
  >;
  setIsPreviousChat: React.Dispatch<React.SetStateAction<boolean>>;
  searchContextChatHistory: TSearchChatHistory;
};

const ShowUserQuery = ({
  searchContextChatHistory,
  setDocuments,
  setFilteredDocuments,
  setIsPreviousChat,
}: TShowUserQueryProps) => {
  const [isCopied, setIsCopied] = useState<{[key: string]: boolean}>({});
  const { user } = useUser();

  return (
    <div className="flex flex-col gap-2 overflow-y-auto mt-2">
      {typedEntries(searchContextChatHistory).map(([key, { userInput }]) => {
        const id = key.toString().trim();
        return (
          <div
            className="cursor-pointer"
            key={id}
            onClick={() => {
              if (id && searchContextChatHistory[id]) {
                setIsPreviousChat(true);
                setDocuments(searchContextChatHistory[id].searchResults);
                setFilteredDocuments(searchContextChatHistory[id].searchResults);
              }
            }}
          >
            <div className="w-full">
              <div className="flex gap-2 justify-end items-center w-full max-w-5xl px-4 sm:px-6 lg:px-8 ">
                <div className="relative size-7">
                  <Image
                    src={user.imageUrl}
                    alt="user profile photo"
                    fill
                    className="rounded-full"
                  />
                </div>
                <div className="flex items-center gap-3 bg-neutral-900 p-2 rounded-lg">
                  {userInput}

                  <button
                    onClick={() => {
                      setIsCopied((prev) => ({...prev, [id]: true}));
                      window.navigator.clipboard.writeText(userInput);

                      setTimeout(() => {
                        setIsCopied((prev) => ({...prev, [id]: false}));
                      }, 3000);
                    }}
                  >
                    {isCopied[id] ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
      )})}
    </div>
  );
};

const SearchPage = () => {
  const [layout, setLayout] = useState<LayoutType>("list");
  const [userQuery, setUserQuery] = useState("");
  const [filter, setFilter] = useState<TFilter[]>([]);

  const [isDesktop, setIsDesktop] = useState(false);

  const {
    searchContextChatHistory,
    setSearchContextChatHistory,
    setSearchContextDocuments,
  } = useSearchDocument();

  const [documents, setDocuments] = useState<TDocumentResponse[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<TDocumentResponse[]>([]);

  const { user, dispatch } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isPreviousChat, setIsPreviousChat] = useState(false);
  const [searchCount, setSearchCount] = useState(Object.entries(searchContextChatHistory).length);

  const chatIdRef = useRef("");
  const searchDivContainerRef = useRef<HTMLDivElement | null>(null);
  const fullScreenBtnRef = useRef<HTMLButtonElement | null>(null);

  const { modalDispatch } = useModalSelection();

  useEffect(() => {
    const uniqueKey = new Set<Omit<CombinedFilterKey, "GOOGLE_CALENDAR">>();
    const result: TFilter[] = [];

    const data: TSearchDocument = {};

    documents.forEach((document) => {
      if (!uniqueKey.has(document.key)) {
        uniqueKey.add(document.key);
        result.push({
          key: document.key,
          logo: document.logo,
          isSelected: false,
        });
      }

      data[document.id] = document;
    });

    setFilter(result);

    if (!isPreviousChat) {
      setSearchContextDocuments((prev) => ({ ...prev, ...data }));

      if (documents.length) {
        setSearchContextChatHistory((prev) => ({
          ...prev,
          [chatIdRef.current]: {
            ...prev[chatIdRef.current],
            searchResults: documents,
          },
        }));
      }
    }
  }, [
    documents,
    isPreviousChat,
    setSearchContextDocuments,
    setSearchContextChatHistory,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        fullScreenBtnRef.current?.click();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalDispatch]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth <= 1024);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleFormSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      const query = userQuery;
      chatIdRef.current = uuidv4();

      e.preventDefault();

      setIsPreviousChat(false);
      setSearchCount((prev) => prev + 1);
      setIsSubmitting(true);
      setUserQuery("");

      const response = await searchAction(query, user.aiModel);
      if (!response.success) {
        toast.error(response.error);
        if (response.error.split("-")[0] === "RE_AUTHENTICATE") {
          const platform = response.error.split("-")[1] as FilterKey;
          dispatch({
            type: "CONNECTION",
            payload: { connectionStatus: 2, connectionType: platform },
          });
        }
        return;
      }

      if(!user.hasSubscription && user.credits.search > 0) dispatch({ type: "CREDIT_DESC_SEARCH" });

      setDocuments(response.data);
      setFilteredDocuments(response.data);

      setSearchContextChatHistory((prev) => ({
        ...prev,
        [chatIdRef.current]: { userInput: query, searchResults: [] },
      }));
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`relative pb-5 my-4 sm:mx-4 mx-0 h-[calc(100%-2rem)] transition-all duration-1000 grid grid-rows-[1fr_auto] lg:grid-rows-1 rounded-2xl bg-neutral-900 ${
        searchCount ? "lg:grid-cols-[1fr_1fr] gap-2" : "grid-cols-[1fr_0fr]"
      }`}
    >
      <div className="h-full lg:order-1 order-2 relative">
        {/* user queries */}
        <div
          className={`hidden lg:block overflow-y-auto`}
          style={{
            height: searchDivContainerRef.current
              ? `calc(100% - ${searchDivContainerRef.current.clientHeight}px - 1rem)`
              : "100%",
          }}
        >
          <ShowUserQuery
            searchContextChatHistory={searchContextChatHistory}
            setDocuments={setDocuments}
            setFilteredDocuments={setFilteredDocuments}
            setIsPreviousChat={setIsPreviousChat}
          />
        </div>

        {/* search box */}
        <div
          ref={searchDivContainerRef}
          className={`w-full px-2 md:px-4 space-y-2 relative lg:absolute z-10 transition-all delay-100 duration-500 ${
            isDesktop
              ? ""
              : searchCount
              ? "top-full -translate-y-full translate-x-0 left-0"
              : "top-1/2 -translate-y-[calc(50%+1.5rem)] left-1/2 -translate-x-1/2"
          }`}
        >
          <div className="w-full flex justify-between gap-2">
            {/* filtering */}
            {documents.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="text-[13px] text-text-primary bg-neutral-800 max-w-max py-2 px-4 flex items-center rounded-lg"
                  >
                    Filter
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="max-w-[756px] w-full border-none"
                  side="top"
                  align="start"
                >
                  <Filter
                    documents={documents}
                    setFilteredDocuments={setFilteredDocuments}
                    isSubmitting={isSubmitting}
                    setIsSubmitting={setIsSubmitting}
                    filter={filter}
                    setFilter={setFilter}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {documents.length > 0 && (
              <div className="flex items-center gap-3">
                {/* calendar */}
                <Calendar />

                {/* sorting */}
                <Sorting
                  filteredDocuments={filteredDocuments}
                  setFilteredDocuments={setFilteredDocuments}
                  isSubmitting={isSubmitting}
                  setIsSubmitting={setIsSubmitting}
                />

                {/* layout buttons*/}
                <div className="px-4 flex gap-x-4 h-9 bg-neutral-800 rounded-lg">
                  {(["grid", "list"] as LayoutType[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setLayout(item)}
                      className="relative"
                    >
                      <span>
                        {item === "grid" ? (
                          <LayoutGrid
                            className={`relative z-20 size-4 ${
                              layout === "grid"
                                ? "fill-neutral-800 stroke-neutral-800"
                                : "fill-text-primary stroke-text-primary"
                            }`}
                          />
                        ) : (
                          <Menu
                            className={`relative z-20 stroke-[3] size-4 ${
                              layout === "list"
                                ? "stroke-neutral-800"
                                : "stroke-text-primary"
                            }`}
                          />
                        )}
                      </span>

                      {layout === item && (
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-6 rounded-full bg-text-primary pointer-events-none z-0"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <form
            onSubmit={handleFormSubmission}
            className="w-full flex flex-col items-center gap-8"
          >
            {searchCount === 0 && (
              <Flipwords
                words={["How can I help you Today?"]}
                nextWordAnimationStop={true}
                charSpeed={50}
                loadingDot={true}
                className="md:text-4xl sm:text-3xl text-2xl font-medium tracking-wide text-neutral-200"
              />
            )}
            <Textarea
              disable={isSubmitting}
              query={userQuery}
              setQuery={setUserQuery}
            />
            {searchCount === 0 && (
              <h1 className="text-lg">
                🤔{" "}
                <span className="text">
                  Hmm, you haven&apos;t search anything, yet.
                </span>
              </h1>
            )}
          </form>
        </div>
      </div>

      {searchCount > 0 && (
        <div className="lg:order-2 order-1 w-full relative overflow-y-auto lg:bg-neutral-800 rounded-r-2xl py-4">
          {isSubmitting ? (
            <div className="space-y-10 absolute top-1/2 -translate-y-1/2 w-full">
              {Array.from({ length: 2 }).map((_, i) => (
                <Loading key={`loading${i}`} />
              ))}
            </div>
          ) : (
            <>
              {filteredDocuments.length ? (
                <div className="relative h-full space-y-4">
                  <div
                    className={cn(
                      "w-full mx-auto grid gap-4 px-4 sm:px-6 lg:px-8 overflow-hidden",
                      {
                        "lg:grid-cols-3 md:grid-cols-2 grid-cols-1":
                          layout === "grid",
                      }
                    )}
                  >
                    {filteredDocuments.map((doc) => (
                      <Document
                        key={doc.href}
                        layout={layout}
                        document={doc}
                      />
                    ))}
                  </div>
                  {user.isAISearch && <p className="absolute bottom-0 right-5 text-xs text-neutral-300">Using AI</p>}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  {documents.length === 0 && (
                    <h1 className="text-lg flex gap-2">
                      <Ghost />
                      <span className="text">No data found</span>
                    </h1>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div
        title="Fullscreen"
        className={`opacity-40 hover:opacity-100 absolute z-20 ${
          searchCount ? "top-5 left-5" : "right-5 bottom-5"
        }`}
      >
        <button
          ref={fullScreenBtnRef}
          type="button"
          className="flex gap-1 items-center"
          onClick={() =>
            modalDispatch({
              type: "onOpen",
              payload: "FullScreenModal",
              data: {
                type: "FullScreenModal",
                data: { type: "Message", documents, layout },
              },
            })
          }
        >
          <Fullscreen />
          <kbd className="hidden sm:block text-xs bg-neutral-950 p-1 rounded-md">
            ctrk + /
          </kbd>
        </button>
      </div>

      {searchCount !== 0 && isDesktop && (
        <div className="fixed left-5 top-1/2 translate-y-full">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <CircleFadingPlus className="opacity-75"/>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              sideOffset={10}
              className="bg-neutral-800 border-none h-[50vh] overflow-y-auto"
            >
              <ShowUserQuery
                searchContextChatHistory={searchContextChatHistory}
                setDocuments={setDocuments}
                setFilteredDocuments={setFilteredDocuments}
                setIsPreviousChat={setIsPreviousChat}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <p className="w-max absolute -translate-x-1/2 left-1/2 bottom-1 text-xs text-neutral-300 font-light">
        Nexus can make mistakes as it uses AI models.
      </p>
    </div>
  );
};

export default SearchPage;
