"use client";
import "react-datepicker/dist/react-datepicker.css";

import Picker from "react-datepicker";
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { differenceInYears } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { handleCustomHeader } from "@/components/ui/date-picker";

export default function Page() {
  const [dob, setDob] = useState(new Date());
  const [isValidAge, setIsValidAge] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const age = differenceInYears(new Date(), dob);
    if (age < 17) setError("You must be at least 18.");
    else setIsValidAge(true);
  };

  return (
    <div className="flex w-full justify-center h-[calc(100vh-100px)] items-center overflow-hidden">
      {isValidAge ? (
        <SignUp
          appearance={{
            baseTheme: dark,
            elements: {
              formButtonPrimary:
                "bg-btn-primary !shadow-none transition hover:bg-yellow-400",
            },
          }}
          fallbackRedirectUrl={"/search"}
          unsafeMetadata={{ birthday: dob }}
        />
      ) : (
        <div className="bg-neutral-900 text-white rounded-lg shadow-lg p-10 space-y-4">
          <Link
            href="/terms-and-conditions/#age-requirements"
            className="text-blue-600 font-semibold text-sm"
            target="_blank"
          >
            See why we are asking?
          </Link>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label htmlFor="dob" className="font-semibold">
              Date of birth
            </label>
            <Picker
              dateFormat={"dd/MM/yyyy"}
              autoFocus={true}
              renderCustomHeader={handleCustomHeader}
              selected={dob}
              onChange={(date) => {
                if (date) setDob(date);
              }}
              showPopperArrow={false}
              required
              className="focus:outline-none transition-colors rounded-md hover:bg-neutral-700 bg-neutral-800 text-sm p-2"
            />
            <button
              type="submit"
              className="bg-neutral-800 transition-colors hover:bg-neutral-950 text-sm rounded-lg max-w-max text-white px-4 py-2 self-end mt-2 shadow-lg"
            >
              continue
            </button>
            {error && <p className="text-sm text-red-700">{error}</p>}
          </form>
        </div>
      )}
    </div>
  );
}
