"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Check, Copy, Fullscreen, Ghost, LayoutGrid, Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { CombinedFilterKey, DocumentType, FilterKey } from "@/lib/types";

import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { readStreamableValue } from "ai/rsc";
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
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

type LayoutType = "grid" | "list";

type TFilter = {
  key: Omit<CombinedFilterKey, "GOOGLE_CALENDAR">;
  logo: string;
  isSelected: boolean;
};

const Page = () => {
  const [layout, setLayout] = useState<LayoutType>("list");
  const [userQuery, setUserQuery] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [filter, setFilter] = useState<TFilter[]>([]);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentType[]>(
    []
  );

  const { user, dispatch } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [searchCount, setSearchCount] = useState(0);

  const { modalDispatch } = useModalSelection();

  useEffect(() => {
    const uniqueKey = new Set<Omit<CombinedFilterKey, "GOOGLE_CALENDAR">>();
    const result: TFilter[] = [];

    documents.forEach(({ key, logo }) => {
      if (!uniqueKey.has(key)) {
        uniqueKey.add(key);
        result.push({ key, logo, isSelected: false });
      }
    });

    setFilter(result);
  }, [documents]);

  const handleFormAction = async (formData: FormData) => {
    try {
      const query = formData.get("search");
      if (user.isAISearch && query) {
        setAiMessage("");
      }

      const response = await searchAction(formData);
      if (!response.success) {
        toast.error(response.error);
        if (response.error.split("-")[0] === "RE_AUTHENTICATE") {
          const platform = response.error.split("-")[1] as FilterKey;
          dispatch({
            type: "CONNECTION",
            connectionType: platform,
            payload: { connectionStatus: 2 },
          });
        }
        return;
      }

      if (Array.isArray(response.data)) {
        setDocuments(response.data);
        setFilteredDocuments(response.data);
      } else {
        setIsLoading(false);
        for await (const content of readStreamableValue(response.data)) {
          if (content) {
            setAiMessage(content);
          }
        }
      }

      setSearchCount((prev) => prev + 1);
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  return (
    <div className="relative mb:py-10 md:px-5 py-5 px-2 my-4 sm:mx-4 mx-0 space-y-10 h-[calc(100%-2rem)] flex flex-col rounded-2xl bg-neutral-900">
      <form
        action={handleFormAction}
        className="w-full flex flex-col items-center gap-8"
      >
        <Flipwords
          words={["How can I help you Today?"]}
          nextWordAnimationStop={true}
          charSpeed={50}
          loadingDot={true}
          className="md:text-4xl sm:text-3xl text-2xl font-medium tracking-wide text-neutral-200"
        />
        <Textarea setIsSearching={setIsLoading} setUserQuery={setUserQuery} />
      </form>

      <div className="flex items-start justify-between gap-2">
        {/* filtering */}
        {documents.length > 0 && (
          <>
            <div className="lg:block hidden">
              <Filter
                documents={documents}
                setFilteredDocuments={setFilteredDocuments}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                filter={filter}
                setFilter={setFilter}
              />
            </div>
            <div className="lg:hidden block">
              <Drawer drawerDirection="bottom">
                <DrawerTrigger>
                  <div className="text-[13px] text-text-primary bg-neutral-800 max-w-max py-2 px-4 flex items-center rounded-lg">
                    Filter
                  </div>
                </DrawerTrigger>
                <DrawerContent containerClassName="pt-10 px-2 flex items-center">
                  <Filter
                    className="h-max"
                    controlledHeight={true}
                    documents={documents}
                    setFilteredDocuments={setFilteredDocuments}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    filter={filter}
                    setFilter={setFilter}
                  />
                </DrawerContent>
              </Drawer>
            </div>
          </>
        )}

        {(documents.length > 0 || aiMessage.length > 0) && (
          <div className="flex items-center gap-3">
            {/* calendar */}
            <Calendar />

            {documents.length > 0 && (
              <>
                {/* sorting */}
                <Sorting
                  filteredDocuments={filteredDocuments}
                  setFilteredDocuments={setFilteredDocuments}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
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
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto flex items-center justify-center">
        {isLoading ? (
          <div className="space-y-10 w-full">
            {Array.from({ length: 2 }).map((_, i) => (
              <Loading key={`loading${i}`} />
            ))}
          </div>
        ) : (
          <>
            {filteredDocuments.length || aiMessage.length ? (
              <div className="space-y-4 self-start">
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
                    {userQuery}

                    <button
                      onClick={() => {
                        setIsCopied(true);
                        window.navigator.clipboard.writeText(userQuery);

                        setTimeout(() => {
                          setIsCopied(false);
                        }, 3000);
                      }}
                    >
                      {isCopied ? (
                        <Check className="size-4" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {filteredDocuments.length ? (
                  <div
                    className={cn(
                      "w-full md:w-[576px] lg:w-[896px] mx-auto grid gap-4 px-4 sm:px-6 lg:px-8",
                      {
                        "lg:grid-cols-3 md:grid-cols-2 grid-cols-1":
                          layout === "grid",
                      }
                    )}
                  >
                    {filteredDocuments.map((doc) => (
                      <Document key={doc.href} layout={layout} document={doc} />
                    ))}
                  </div>
                ) : (
                  <div>
                    {/* If AI-Search enabled */}
                    <div className="markdown overflow-auto space-y-5">
                      <ReactMarkdown className="char">
                        {aiMessage}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                {searchCount ? (
                  <h1 className="text-lg flex gap-2">
                    <Ghost />
                    <span className="text">No data found</span>
                  </h1>
                ) : (
                  <h1 className="text-lg">
                    🤔{" "}
                    <span className="text">
                      Hmm, you haven&apos;t search anything, yet.
                    </span>
                  </h1>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div title="Fullscreen" className="fixed right-[4vw] bottom-[5vh]">
        <button
          type="button"
          onClick={() =>
            modalDispatch({
              type: "onOpen",
              payload: "FullScreenModal",
              data: {
                type: "FullScreenModal",
                data: { aiMessage, documents, layout },
              },
            })
          }
        >
          <Fullscreen />
        </button>
      </div>

      <span className="absolute -translate-x-1/2 left-1/2 bottom-1 text-xs text-neutral-300 font-light">
        Nexus can make mistakes as it uses AI models.
      </span>
    </div>
  );
};

export default Page;
