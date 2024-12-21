"use client";

import { Sparkles } from "lucide-react";
import Switch from "./ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useRef } from "react";
import useUser from "@/hooks/useUser";
import { toast } from "sonner";
import { AISearchPreference } from "@/actions/user.actions";

const SearchAI = () => {
  const { user, dispatch: userDispatch } = useUser();
  const { isAISearch, aiModel } = user;
  const prevAISearchPreferenceRef = useRef(false);

  const handleAISearchToggle = async (isChecked: boolean) => {
    prevAISearchPreferenceRef.current = isAISearch;
    userDispatch({ type: "AI_SEARCH_CHANGE", payload: isChecked });

    const response = await AISearchPreference(isChecked);
    if (!response.success) {
      toast.error(response.error);
      userDispatch({
        type: "AI_SEARCH_CHANGE",
        payload: prevAISearchPreferenceRef.current,
      });
    } else toast.success(response.data);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-max outline-none">
        <div className="flex gap-2 w-full bg-neutral-800 hover:bg-neutral-700 transition-colors py-2 items-center px-4 rounded-lg">
          <Sparkles className="hidden sm:block size-4 fill-btn-primary stroke-btn-primary" />
          <p className="text-xs font-medium tracking-wide">AI Search</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-neutral-900 border-none shadow-xl z-[120] rounded-lg">
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Switch
            label={null}
            value={isAISearch}
            onValueChange={handleAISearchToggle}
          />
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="gemini-model"
              name="model"
              className="disabled:cursor-not-allowed disabled:opacity-35"
              disabled={!isAISearch}
              checked={aiModel === "gemini"}
              onChange={() =>
                userDispatch({ type: "CHANGE_AI_MODEL", payload: "gemini" })
              }
            />
            <label htmlFor="gemini-model" className="text-sm">
              Gemini-1.5-Flash/text-embedding-004
            </label>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="ollama-model"
              name="model"
              className="disabled:cursor-not-allowed disabled:opacity-35"
              disabled={!isAISearch}
              checked={aiModel === "ollama"}
              onChange={() =>
                userDispatch({ type: "CHANGE_AI_MODEL", payload: "ollama" })
              }
            />
            <label htmlFor="ollama-model" className="text-sm">
              Llama-3.2:3b/nomic-embed-text
            </label>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SearchAI;
