"use client";

import "regenerator-runtime/runtime";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "regenerator-runtime/runtime";

import { useDebounce } from "@/hooks/useDebounce";
import { Mic, Paperclip } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

const Textarea = () => {
  const [disabled, setDisabled] = useState(true);
  const {
    listening,
    transcript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [query, setQuery] = useState("");
  const deboundedTranscript = useDebounce(transcript, 200);

  const handleChange = useCallback(() => {
    const textarea = textareaRef.current;

    if (textarea) {
      setDisabled(textarea.value.length === 0);

      if (!listening) {
        setQuery(textarea.value);
      } else {
        setQuery(deboundedTranscript);
      }

      // Reset height to calculate the correct scroll height
      textarea.style.height = "auto";

      // Set height to the scroll height, which adjusts to the content
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [listening, deboundedTranscript]);

  useEffect(() => {
    handleChange();
  }, [deboundedTranscript, handleChange]);

  const startListening = useCallback(() => {
    if (!isMicrophoneAvailable) {
      alert("Please allow the permission for microphone");
      return;
    }

    if (browserSupportsSpeechRecognition) {
      SpeechRecognition.startListening({ continuous: true });
    } else {
      alert(
        "Your browser does not support Speech Recognition. Please try using Chrome or another supported browser."
      );
    }
  }, [browserSupportsSpeechRecognition, isMicrophoneAvailable]);

  const stopListening = useCallback(() => {
    if (browserSupportsSpeechRecognition) {
      SpeechRecognition.stopListening();
    } else {
      alert(
        "Your browser does not support Speech Recognition. Please try using Chrome or another supported browser."
      );
    }
  }, [browserSupportsSpeechRecognition]);

  return (
    <div className="w-full max-w-2xl relative flex items-end gap-3 rounded-2xl bg-neutral-800 px-5 py-3">
      {/* File upload */}
      <button
        title="upload image"
        className="flex items-center sm:h-7 h-5 cursor-pointer"
      >
        <Paperclip
          className="sm:size-6 size-5 text-neutral-500 -rotate-45"
          style={{ strokeWidth: "1.5" }}
        />
      </button>

      {/* separator */}
      <div className="sm:h-7 h-5 border-l-2 border-l-neutral-600 w-1" />

      {/* query */}
      <textarea
        ref={textareaRef}
        onChange={handleChange}
        required
        rows={1}
        autoFocus
        value={query}
        className="caret-btn-primary sm:text-lg text-base flex-1 resize-none focus:outline-none bg-transparent"
        placeholder="flight tickets"
        style={{ scrollbarWidth: "none" }}
      />

      {/* Voice search */}
      <button
        className="relative"
        onClick={listening ? stopListening : startListening}
      >
        <Mic className="relative z-20 sm:size-7 size-5 text-neutral-500" />
        {listening && (
          <div className="absolute sm:size-12 size-10 rounded-full bg-neutral-950 animate-pulse top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-0"></div>
        )}
      </button>

      {/* submit button */}
      <button disabled={disabled} className="mx-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="2 2 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`lucide lucide-circle-arrow-up sm:size-7 size-5 stroke-neutral-800 ${
            disabled ? "fill-neutral-500" : "fill-neutral-200"
          }`}
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m16 12-4-4-4 4" />
          <path d="M12 16V8" />
        </svg>
      </button>
    </div>
  );
};

export default Textarea;
