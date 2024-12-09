"use client";

import "regenerator-runtime/runtime";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "regenerator-runtime/runtime";

import { useDebounce } from "@/hooks/useDebounce";
import { Mic, Paperclip } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

const MAX_ROWS = 6;

const Textarea = ({
  setIsSearching,
  fileUploadClassName,
  containerClassName,
}: {
  fileUploadClassName?: string;
  containerClassName?: string;
  setIsSearching: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {
    listening,
    transcript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    resetTranscript,
  } = useSpeechRecognition();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { pending } = useFormStatus();

  const [disabled, setDisabled] = useState(true);
  const [query, setQuery] = useState("");
  const deboundedTranscript = useDebounce(transcript, 200);

  const initialClientHeightRef = useRef(0);

  const handleChange = useCallback(() => {
    const textarea = textareaRef.current;

    if (textarea && initialClientHeightRef.current) {
      if (!listening) {
        setQuery(textarea.value);
      } else {
        setQuery(deboundedTranscript);
      }

      setDisabled(
        textarea.value.length === 0 && deboundedTranscript.length === 0
      );

      if (textarea.scrollHeight / initialClientHeightRef.current < MAX_ROWS) {
        // Reset height to calculate the correct scroll height
        textarea.style.height = "auto";

        // Set height to the scroll height, which adjusts to the content
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }
  }, [listening, deboundedTranscript, setQuery]);

  const startListening = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      if (!isMicrophoneAvailable) {
        alert("Please allow the permission for microphone");
        return;
      }

      if (browserSupportsSpeechRecognition) {
        resetTranscript();
        SpeechRecognition.startListening({ continuous: true });
      } else {
        alert(
          "Your browser does not support Speech Recognition. Please try using Chrome or another supported browser."
        );
      }
    },
    [browserSupportsSpeechRecognition, isMicrophoneAvailable, resetTranscript]
  );

  const stopListening = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      if (browserSupportsSpeechRecognition) {
        SpeechRecognition.stopListening();
      } else {
        alert(
          "Your browser does not support Speech Recognition. Please try using Chrome or another supported browser."
        );
      }
    },
    [browserSupportsSpeechRecognition]
  );

  useEffect(() => {
    if (textareaRef.current) {
      initialClientHeightRef.current = textareaRef.current.clientHeight;
    }
  }, []);

  useEffect(() => {
    handleChange();
  }, [deboundedTranscript, handleChange]);

  useEffect(() => {
    setIsSearching(pending);
    if (pending && textareaRef.current) {
      setQuery("");
      setDisabled(true);
      textareaRef.current.style.height = "auto";
    }
  }, [pending, setIsSearching]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!e.shiftKey && (e.key === "Enter" || e.key === "NumpadEnter")) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <div
      className={cn(
        "w-full max-w-2xl relative flex flex-col gap-3 rounded-2xl bg-neutral-800 px-4 py-3",
        containerClassName
      )}
    >
      {/* query */}
      <textarea
        ref={textareaRef}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        required
        rows={1}
        autoFocus
        value={query}
        name="search"
        className="caret-btn-primary pl-1 sm:text-lg text-base resize-none focus:outline-none bg-transparent"
        placeholder="Message Nexus"
      />
      <div className="flex w-full justify-between">
        {/* File upload */}
        <button
          type="button"
          title="upload image"
          className="flex items-center sm:h-7 h-6 cursor-pointer"
        >
          <Paperclip
            className={cn(
              "sm:size-6 size-5 text-neutral-500 -rotate-45",
              fileUploadClassName
            )}
            style={{ strokeWidth: "1.5" }}
          />
        </button>

        <div className="space-x-3">
          {/* Voice search */}
          <button
            type="button"
            className="relative"
            onClick={listening ? stopListening : startListening}
          >
            <Mic className="relative z-20 sm:size-7 size-6 text-neutral-500" />
            {listening && (
              <div className="absolute sm:size-12 size-10 rounded-full bg-neutral-950 animate-pulse top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-0"></div>
            )}
          </button>

          {/* submit button */}
          <button disabled={pending || disabled} type="submit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="2 2 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`lucide lucide-circle-arrow-up sm:size-7 size-6 stroke-neutral-800 ${
                pending || disabled ? "fill-neutral-500" : "fill-neutral-200"
              }`}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m16 12-4-4-4 4" />
              <path d="M12 16V8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Textarea;
