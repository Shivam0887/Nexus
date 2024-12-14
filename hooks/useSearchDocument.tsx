"use client";

import { TChat, TDocumentResponse } from "@/lib/types";
import { createContext, useContext, useMemo, useState } from "react";

export type TSearchDocument = { [id: string]: TDocumentResponse };
export type TSearchChat = { [id: string]: TChat[] };

export type TSearchChatHistory = {
  [chatId: string]: {
    userInput: string,
    searchResults: TDocumentResponse[]
  } 
}

type TSearchDocumentContext = {
  searchContextChats: TSearchChat;
  searchContextDocuments: TSearchDocument;
  searchContextChatHistory: TSearchChatHistory;
  setSearchContextChats: React.Dispatch<React.SetStateAction<TSearchChat>>;
  setSearchContextDocuments: React.Dispatch<React.SetStateAction<TSearchDocument>>;
  setSearchContextChatHistory: React.Dispatch<React.SetStateAction<TSearchChatHistory>>;
};

const initialState: TSearchDocumentContext = {
  searchContextChats: {},
  searchContextDocuments: {},
  searchContextChatHistory: {},
  setSearchContextChats: () => {},
  setSearchContextDocuments: () => {},
  setSearchContextChatHistory: () => {}
};

export const searchDocumentContext = createContext<TSearchDocumentContext>(initialState);

export const useSearchDocument = () => useContext(searchDocumentContext);

const SearchDocumentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [searchContextChats, setSearchContextChats] = useState<TSearchChat>({});
  const [searchContextDocuments, setSearchContextDocuments] = useState<TSearchDocument>({});
  const [searchContextChatHistory, setSearchContextChatHistory] = useState<TSearchChatHistory>({})

  const value = useMemo(
    () => ({
      searchContextChats,
      searchContextDocuments,
      searchContextChatHistory,
      setSearchContextChats,
      setSearchContextDocuments,
      setSearchContextChatHistory
    }),
    [searchContextChats, searchContextDocuments, searchContextChatHistory]
  );

  return (
    <searchDocumentContext.Provider value={value}>
      {children}
    </searchDocumentContext.Provider>
  );
};

export default SearchDocumentProvider;
