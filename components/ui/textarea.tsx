"use client";

import "regenerator-runtime/runtime";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import "regenerator-runtime/runtime";

import { useDebounce } from "@/hooks/useDebounce";
import { Mic, Paperclip } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MAX_ROWS = 6;

type TextareaProps = {
  fileUploadClassName?: string;
  containerClassName?: string;
  handleAbortRequest?: () => void;
  isStreaming?: boolean;
  disable: boolean;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  query: string;
  isContentLoaded?: boolean
};

const Textarea = ({
  fileUploadClassName,
  containerClassName,
  handleAbortRequest,
  isStreaming,
  disable: isSubmitting,
  query,
  setQuery,
  isContentLoaded = false
}: TextareaProps) => {
  const {
    listening,
    transcript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    resetTranscript,
  } = useSpeechRecognition();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);

  const [disabled, setDisabled] = useState(true);
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

      setDisabled(textarea.value.length === 0 && deboundedTranscript.length === 0);

      if (textarea.scrollHeight / initialClientHeightRef.current < MAX_ROWS) {
        // Reset height to calculate the correct scroll height
        textarea.style.height = "auto";

        // Set height to the scroll height, which adjusts to the content
        textarea.style.height = `${textarea.scrollHeight}px`;
      }

      if (
        textarea.scrollHeight - initialClientHeightRef.current >
        initialClientHeightRef.current
      ) {
        textarea.style.height = "auto";

        const curRows = textarea.scrollHeight / initialClientHeightRef.current;
        textarea.style.height = `${
          initialClientHeightRef.current * Math.min(curRows, MAX_ROWS)
        }px`;
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
    if(isContentLoaded || isSubmitting){
      handleChange();
    }

    // eslint-disable-next-line
  }, [isContentLoaded, isSubmitting]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!e.shiftKey && (e.key === "Enter" || e.key === "NumpadEnter")) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit(submitButtonRef.current);

      if (textareaRef.current) {
        setQuery("");
        setDisabled(true);
        textareaRef.current.style.height = "auto";
      }
    }
  };

  return (
    <div
      className={cn(
        "w-full max-w-2xl relative flex flex-col gap-3 rounded-3xl bg-neutral-800 px-4 py-3",
        containerClassName
      )}
    >
      <div className="w-full flex items-center gap-2 pl-1 pr-[2.5px]">
        {/* query */}
        <textarea
          ref={textareaRef}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          required
          rows={1}
          autoFocus
          value={query}
          className="caret-btn-primary flex-1 sm:text-lg text-base resize-none focus:outline-none bg-transparent"
          placeholder="Message Nexus"
        />

        {isStreaming && (
          <button type="button" onClick={handleAbortRequest}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="rgb(255 255 255 / 0.8)"
              stroke="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-circle-stop"
            >
              <circle cx="12" cy="12" r="10" />
              <rect
                x="9"
                y="9"
                width="6"
                height="6"
                rx="2"
                fill="rgb(27 27 27)"
                stroke="rgb(27 27 27)"
              />
            </svg>
          </button>
        )}
      </div>

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
          <button
            disabled={disabled || isSubmitting}
            type="submit"
            ref={submitButtonRef}
            className="disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="2 2 20 20"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`lucide lucide-circle-arrow-up sm:size-7 size-6 stroke-neutral-800 ${
                disabled || isSubmitting
                  ? "fill-neutral-500"
                  : "fill-neutral-200"
              } disabled:cursor-not-allowed`}
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
