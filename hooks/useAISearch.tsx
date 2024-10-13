"use client";

import { AISearchPreference } from "@/actions/user.actions";
import { useModalSelection } from "./useModalSelection";
import useUser from "./useUser";

/**
 * @returns updateAISearchPreference: This function updates the user preference for AISearch, i.e., if the user wants to search for documents using keyword-based search or AI-based (using AI) search.
 */

const useAISearch = () => {
  const { modalDispatch } = useModalSelection();
  const { dispatch: userDispatch, user } = useUser();

  const updateAISearchPreference = async (isAllowed: boolean) => {
    let prevAISearchPreference = user.isAISearch;
    try {
      userDispatch({ type: "AI_SEARCH_CHANGE", payload: isAllowed });
      await AISearchPreference(isAllowed);

      if (isAllowed) {
        localStorage.setItem("isAISearch", isAllowed.toString());
      }
    } catch (error: any) {
      console.error("Error updating AI search preference:", error?.message);
      userDispatch({
        type: "AI_SEARCH_CHANGE",
        payload: prevAISearchPreference,
      });
    } finally {
      modalDispatch({ type: "onClose" });
    }
  };

  return { updateAISearchPreference };
};

export default useAISearch;
