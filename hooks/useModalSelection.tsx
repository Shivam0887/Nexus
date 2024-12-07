"use client";

import { DocumentType } from "@/lib/types";
import { createContext, useContext, useMemo, useReducer } from "react";

type ModalType =
  | "CalendarModal"
  | "FullScreenModal"
  | "AccountDelete"
  | "SecurityModal";

type ActionData =
  | {
      type: "CalendarModal";
      data: {
        title?: string;
      };
    }
  | { type: "AccountDelete" }
  | { type: "SecurityModal"; data: { url?: string } }
  | {
      type: "FullScreenModal";
      data: {
        type: "Message"
        aiMessage: string;
        documents: DocumentType[];
        layout: "grid" | "list";
      } | { type: "Element", element: React.ReactNode };
    };

type ActionType =
  | {
      payload: ModalType;
      type: "onOpen";
      data: ActionData;
    }
  | { type: "onClose" };

type StateType = {
  isOpen: boolean;
  type: ModalType | null;
  data: ActionData | null;
};

type ModalContextType = {
  modalState: StateType;
  modalDispatch: React.Dispatch<ActionType>;
};

const initialState: StateType = {
  isOpen: false,
  type: null,
  data: null,
};

const ModalContext = createContext<ModalContextType>({
  modalDispatch: () => {},
  modalState: initialState,
});

const reducer = (state: StateType, action: ActionType) => {
  switch (action.type) {
    case "onOpen":
      return {
        isOpen: true,
        type: action.payload,
        data: action.data,
      };
    case "onClose":
      return {
        isOpen: false,
        type: null,
        data: null,
      };
    default:
      return state;
  }
};

export const useModalSelection = () => useContext(ModalContext);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modalState, modalDispatch] = useReducer(reducer, initialState);

  const value: ModalContextType = useMemo(
    () => ({
      modalState,
      modalDispatch,
    }),
    [modalState]
  );

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};
