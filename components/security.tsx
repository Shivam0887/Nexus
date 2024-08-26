"use client";

import { createPasskey } from "@/actions/passkey.actions";
import useUser from "@/hooks/useUser";
import { PasskeyState } from "@/lib/types";
import {
  CircleCheckBig,
  CirclePlus,
  KeyRound,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import React, { forwardRef, useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

const SecurityInputs = ({ error, success }: PasskeyState) => {
  const [passkey, setPasskey] = useState<string[]>(new Array(6).fill(""));
  const { pending } = useFormStatus();

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const key = e.key;
    const arr = [...passkey];

    if (key === "Backspace") {
      arr[index] = "";
      setPasskey(arr);

      if (index > 0) {
        const nextInput = document.getElementById(
          `passkey${index - 1}`
        ) as HTMLInputElement;
        nextInput.focus();
      }
    } else if (key.charCodeAt(0) >= 48 && key.charCodeAt(0) <= 57) {
      arr[index] = key;
      setPasskey(arr);

      if (index < 5) {
        const nextInput = document.getElementById(
          `passkey${index + 1}`
        ) as HTMLInputElement;
        nextInput.focus();
        nextInput.setSelectionRange(1, 1);
      }
    }
  };

  return (
    <>
      <div className="flex-1 shrink-0 flex gap-2 items-center justify-center">
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={`passkey${i}`}
            type="text"
            id={`passkey${i}`}
            inputMode="numeric"
            name={`passkey${i}`}
            value={passkey[i]}
            onChange={() => {}}
            onKeyDown={(e) => handleKeyDown(e, i)}
            autoFocus={i === 0}
            className="sm:w-14 w-12 sm:h-14 h-12 text-center rounded-md bg-neutral-800"
            required
            disabled={pending}
          />
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <input
            type="checkbox"
            id="remember"
            name="remember"
            className="customCheckbox"
            disabled={pending}
          />
          <label htmlFor="remember" className="cursor-pointer">
            remember me
          </label>
        </div>
        <button
          disabled={pending}
          type="submit"
          className={`py-3 px-6 flex items-center justify-center gap-2 rounded-2xl bg-btn-primary text-black font-semibold text-sm ${
            pending ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {pending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : success ? (
            <CircleCheckBig
              className="w-4 h-4 stroke-emerald-600"
              style={{ strokeWidth: "3" }}
            />
          ) : (
            <CirclePlus className="w-4 h-4" />
          )}
          Create key
        </button>
      </div>

      {!success && error && (
        <p className="text-sm flex items-center gap-3">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          {error}
        </p>
      )}
    </>
  );
};

const Security = forwardRef(
  (props, ref: React.ForwardedRef<HTMLDivElement>) => {
    const [state, formAction] = useFormState(createPasskey, {
      success: false,
      error: "",
    });

    const { dispatch } = useUser();

    useEffect(() => {
      dispatch({ type: "PASSKEY_CREATE", payload: state.success });
    }, [state, dispatch]);

    return (
      <div
        ref={ref}
        className="z-[100] flex justify-center md:items-center absolute w-full h-full bg-neutral-950/10 backdrop-blur-sm rounded-2xl"
      >
        <form
          action={formAction}
          className="sm:w-[448px] w-96 p-8 h-96 rounded-2xl sticky top-1/2 md:top-0 -translate-y-1/2 md:translate-y-0 bg-neutral-950 flex flex-col"
        >
          <div className="space-y-3">
            <div className="flex gap-3 items-center">
              <h3 className="md:text-2xl text-xl font-medium">Security</h3>
              <KeyRound className="stroke-neutral-950 fill-btn-primary [transform:rotateY(180deg)]" />
            </div>
            <p className="sm:text-sm text-xs">
              Set-up a passkey before you start integrating your apps.
            </p>
          </div>

          <SecurityInputs error={state.error} success={state.success} />
        </form>
      </div>
    );
  }
);

Security.displayName = "Security";

export default Security;
