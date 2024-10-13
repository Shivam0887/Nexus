"use client";

import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { sortData } from "@/lib/constants";
import { DocumentType, FilterKey } from "@/lib/types";

import ReactMarkdown from "react-markdown";
import { readStreamableValue } from "ai/rsc";
import { searchAction } from "@/actions/search.actions";

import useUser from "@/hooks/useUser";
import { useCallback, useEffect, useState } from "react";
import { Fullscreen, Ghost, LayoutGrid, Menu } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loading from "@/components/loading";
import Filter from "@/components/ui/filter";
import Calendar from "@/components/calendar";
import Document from "@/components/document";
import Textarea from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useModalSelection } from "@/hooks/useModalSelection";
import { toast } from "sonner";

type LayoutType = "grid" | "list";

const inter = Inter({ subsets: ["latin"] });

const Page = () => {
  const [layout, setLayout] = useState<LayoutType>("list");
  const [userQuery, setUserQuery] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [documents, setDocuments] = useState<DocumentType[]>([]);

  const { user, dispatch } = useUser();
  const [isSearching, setIsSearching] = useState(false);
  const [searchCount, setSearchCount] = useState(0);

  const { modalDispatch } = useModalSelection();

  useEffect(() => {
    if (isSearching) {
      setSearchCount((prev) => prev + 1);
    }
  }, [isSearching]);

  const handleAction = useCallback(
    async (formData: FormData) => {
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
              payload: 2,
            });
          }
          return;
        }

        if (Array.isArray(response.data)) {
          setDocuments(response.data);
        } else {
          setIsSearching(false);
          for await (const content of readStreamableValue(response.data)) {
            if (content) {
              setAiMessage(content);
            }
          }
        }
      } catch (error: any) {
        toast.error(error);
      }
    },
    [user.isAISearch, dispatch]
  );

  return (
    <div
      className={`relative mb:py-10 md:px-5 py-5 px-2 my-4 sm:mx-4 mx-0 space-y-10 h-[calc(100%-2rem)] flex flex-col rounded-2xl bg-neutral-900 ${inter.className} overflow-auto`}
    >
      <form
        action={handleAction}
        className="w-full flex flex-col items-center gap-10"
      >
        <h1 className="md:text-4xl sm:text-3xl text-2xl text font-extrabold tracking-wide">
          How can I help you Today?
        </h1>
        <Textarea setIsSearching={setIsSearching} setUserQuery={setUserQuery} />
      </form>

      <div className="flex items-start justify-between gap-2">
        {/* filtering */}
        <div className="lg:block hidden">
          <Filter />
        </div>
        <div className="lg:hidden block">
          <Drawer drawerDirection="bottom">
            <DrawerTrigger>
              <div className="text-[13px] text-text-primary bg-neutral-800 max-w-max py-2 px-4 flex items-center rounded-lg">
                Filter
              </div>
            </DrawerTrigger>
            <DrawerContent containerClassName="pt-10 px-2 flex items-center">
              <Filter className="h-max" controlledHeight={true} />
            </DrawerContent>
          </Drawer>
        </div>

        <div className="flex items-center gap-3">
          {/* calendar */}
          <Calendar />

          {/* sorting */}
          <Select>
            <SelectTrigger className="focus:ring-offset-0 focus:ring-0 text-sm border-none bg-neutral-800">
              <SelectValue className="text-xs" placeholder="sort by" />
            </SelectTrigger>
            <SelectContent className="text-xs bg-neutral-950 text-text-primary border-none">
              {sortData.map((item) => (
                <SelectItem
                  key={item}
                  value={item}
                  className="text-[13px] cursor-pointer"
                >
                  {item}
                </SelectItem>
              ))}

              <div className="mt-1">
                <RadioGroup defaultValue="ascending" className="ml-2">
                  {["ascending", "descending"].map((item) => (
                    <div key={item} className="flex items-center space-x-2.5">
                      <RadioGroupItem
                        value={item}
                        id={item}
                        className="fill-white stroke-neutral-500"
                      />
                      <label htmlFor={item} className="text-[13px]">
                        {item}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </SelectContent>
          </Select>

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
      </div>

      <div className="flex-1 flex items-center justify-center">
        {isSearching ? (
          <div className="space-y-10 w-full">
            {Array.from({ length: 2 }).map((_, i) => (
              <Loading key={`loading${i}`} />
            ))}
          </div>
        ) : (
          <>
            {documents.length || aiMessage.length ? (
              <div className="space-y-4 self-start">
                <div className="flex justify-end w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                  <span className="text-base bg-neutral-800 py-2 px-4 rounded-lg">
                    {userQuery}
                  </span>
                </div>

                {documents.length ? (
                  <div
                    className={cn(
                      "overflow-auto w-full max-w-5xl mx-auto grid gap-4 px-4 sm:px-6 lg:px-8",
                      {
                        "lg:grid-cols-3 md:grid-cols-2 grid-cols-1":
                          layout === "grid",
                      }
                    )}
                  >
                    {documents.map((doc) => (
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

      <div className="fixed right-[4vw] bottom-[5vh]">
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
    </div>
  );
};

export default Page;
