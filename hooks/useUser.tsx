"use client";

import { ActionType, StateType } from "@/lib/types";
import React, { createContext, useContext, useMemo, useReducer } from "react";

const platformStatus = {
  connectionStatus: 0,
  searchStatus: false,
};

const InitialState: StateType = {
  coverImage: "",
  email: "",
  hasPasskey: false,
  hasSubscription: false,
  imageUrl: "",
  isAISearch: false,
  shouldRemember: false,
  username: "",
  plan: "Starter",
  credits: {
    ai: 0,
    search: 0
  },
  GOOGLE_DRIVE: {
    connectionStatus: 0,
  },
  GOOGLE_DOCS: { searchStatus: false },
  GOOGLE_SHEETS: { searchStatus: false },
  GOOGLE_SLIDES: { searchStatus: false },
  MICROSOFT_TEAMS: platformStatus,
  DISCORD: platformStatus,
  GITHUB: platformStatus,
  GMAIL: platformStatus,
  NOTION: platformStatus,
  SLACK: platformStatus,
  GOOGLE_CALENDAR: platformStatus,
};

type UserContextType = {
  user: StateType;
  dispatch: React.Dispatch<ActionType>;
};

const reducer = (state: StateType, action: ActionType): StateType => {
  switch (action.type) {
    case "AI_SEARCH_CHANGE":
      return {
        ...state,
        isAISearch: action.payload,
      };
    case "COVER_IMAGE_CHANGE":
      return {
        ...state,
        coverImage: action.payload,
      };
    case "PASSKEY_CREATE":
      return {
        ...state,
        hasPasskey: action.payload,
      };

    case "PLAN_CHANGE":
      return {
        ...state,
        plan: action.payload,
      };

    case "PROFILE_IMAGE_CHANGE":
      return {
        ...state,
        imageUrl: action.payload,
      };

    case "USERNAME_CHANGE":
      return {
        ...state,
        username: action.payload,
      };
    case "CONNECTION":
      return {
        ...state,
        [action.payload.connectionType]: {
          ...state[action.payload.connectionType],
          connectionStatus: action.payload.connectionStatus,
        },
      };
    case "SEARCH_STATUS":
      return {
        ...state,
        [action.payload.connectionType]: {
          ...state[action.payload.connectionType],
          searchStatus: action.payload.searchStatus,
        },
      };
    case "CREDIT_DESC_AI":
      return {
        ...state,
        credits: {
          search: state.credits.search,
          ai: state.credits.ai - 1
        }
      }
    case "CREDIT_DESC_SEARCH":
      return {
        ...state,
        credits: {
          search: state.credits.search - 1,
          ai: state.credits.ai
        }
      }
    default:
      throw new Error("Invalid action");
  }
};

const UserContext = createContext<UserContextType>({
  user: InitialState,
  dispatch: () => {},
});

export const UserProvider: React.FC<{
  children: React.ReactNode;
  userData: StateType;
}> = ({ children, userData }) => {
  const [state, dispatch] = useReducer(reducer, userData);

  const values = useMemo(
    () => ({
      user: state,
      dispatch,
    }),
    [state]
  );

  return <UserContext.Provider value={values}>{children}</UserContext.Provider>;
};

const useUser = () => useContext(UserContext);
export default useUser;
