"use client";

import { createPasskey, validatePasskey } from "@/actions/passkey.actions";
import useUser from "@/hooks/useUser";
import {
  CircleCheckBig,
  CirclePlus,
  KeyRound,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Dialog, DialogContent, DialogItem } from "@/components/ui/dialog";
import { useModalSelection } from "@/hooks/useModalSelection";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";

const SecurityInputs = ({
  error,
  validate,
  passkey,
  setPasskey,
}: {
  passkey: string[];
  setPasskey: React.Dispatch<React.SetStateAction<string[]>>;
  error: string;
  validate: boolean;
}) => {
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
          ) : (
            <CirclePlus className="w-4 h-4" />
          )}
          {validate ? "Verify key" : "Create key"}
        </button>
      </div>

      {error && (
        <p className="text-sm flex items-center gap-3">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          {error}
        </p>
      )}
    </>
  );
};

const SecurityModal = () => {
  const router = useRouter();
  const { dispatch, user } = useUser();
  const { modalState, modalDispatch } = useModalSelection();
  const [error, setError] = useState("");
  const [passkey, setPasskey] = useState<string[]>(new Array(6).fill(""));

  const isModalOpen = modalState.type === "SecurityModal" && modalState.isOpen;
  const validate = user.hasPasskey && !user.shouldRemember;

  const handleCreatePasskey = async (formData: FormData) => {
    const response = await createPasskey(formData);

    dispatch({ type: "PASSKEY_CREATE", payload: response.success });

    if (response.success) {
      setPasskey(new Array(6).fill(""));
      modalDispatch({ type: "onClose" });
      toast.success(response.data);
    } else {
      setError(response.error);
    }
  };

  const handleValidatePasskey = async (formData: FormData) => {
    const response = await validatePasskey(formData);

    if (response.success) {
      if (
        modalState.data?.type === "SecurityModal" &&
        modalState.data.data.url
      ) {
        const url = modalState.data.data.url;
        const data = await axios.post(url);
        if (data) {
          router.replace(data.data);
        }
      }

      toast.success(response.data);
      setPasskey(new Array(6).fill(""));
      modalDispatch({ type: "onClose" });
    } else {
      setError(response.error);
    }
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={() => modalDispatch({ type: "onClose" })}
    >
      <DialogContent className="max-w-fit h-auto max-h-max text-white">
        <DialogItem>
          <form
            action={validate ? handleValidatePasskey : handleCreatePasskey}
            className="sm:w-[448px] w-96 p-8 h-80 rounded-2xl flex flex-col"
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
            <SecurityInputs
              error={error}
              validate={validate}
              passkey={passkey}
              setPasskey={setPasskey}
            />
          </form>
        </DialogItem>
      </DialogContent>
    </Dialog>
  );
};

export default SecurityModal;
