"use client";

import { ActionType, StateType } from "@/lib/types";
import React, { createContext, useContext, useMemo, useReducer } from "react";

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

    default:
      throw new Error("Invalid action");
  }
  return state;
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
