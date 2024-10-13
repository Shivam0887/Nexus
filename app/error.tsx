"use client"; // Error components must be Client Components

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error.name);
  }, [error]);

  return (
    <div className="w-full md:h-[calc(100vh-77px)] h-[calc(100vh-73px)] flex flex-col gap-4 items-center justify-center">
      <h2 className="text-3xl text">Something went wrong!</h2>
      <h3 className="text-lg font-medium">{error.name}</h3>
      <button
        type="button"
        className="py-2 px-4 rounded-lg bg-btn-primary text-black font-medium"
        onClick={reset}
      >
        Please try again, later
      </button>
    </div>
  );
}
