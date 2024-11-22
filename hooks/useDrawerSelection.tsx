"use client";

import { TFilterProps } from "@/components/ui/filter";
import { TDocumentResponse } from "@/lib/types";
import { createContext, useContext, useMemo, useReducer } from "react";

type DrawerType =
  | "SidebarChat"
  | "SidebarContentSummary"
  | "FilterResult"
  | "SidebarMenu";

type ActionData =
  | {
      type: "SidebarChat";
      data: TDocumentResponse;
    }
  | { type: "FilterResult"; data: TFilterProps }
  | { type: "SidebarMenu" }
  | { type: "SidebarContentSummary"; data: TDocumentResponse };

type ActionType =
  | {
      payload: DrawerType;
      type: "onOpen";
      data: ActionData;
    }
  | { type: "onClose" };

type StateType = {
  isOpen: boolean;
  type: DrawerType | null;
  data: ActionData | null;
};

type DrawerContextType = {
  drawerState: StateType;
  drawerDispatch: React.Dispatch<ActionType>;
};

const initialState: StateType = {
  isOpen: false,
  type: null,
  data: null,
};

const DrawerContext = createContext<DrawerContextType>({
  drawerDispatch: () => {},
  drawerState: initialState,
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

export const useDrawerSelection = () => useContext(DrawerContext);

export const DrawerProvider = ({ children }: { children: React.ReactNode }) => {
  const [drawerState, drawerDispatch] = useReducer(reducer, initialState);

  const value: DrawerContextType = useMemo(
    () => ({
      drawerState,
      drawerDispatch,
    }),
    [drawerState]
  );

  return (
    <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
  );
};
