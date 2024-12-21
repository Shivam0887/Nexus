"use client";

import { createPasskey, validatePasskey } from "@/actions/passkey.actions";
import useUser from "@/hooks/useUser";
import { CirclePlus, KeyRound, Loader2, ShieldAlert } from "lucide-react";
import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogItem } from "@/components/ui/dialog";
import { useModalSelection } from "@/hooks/useModalSelection";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";
import OTP from "@/components/ui/otp";

const SecurityModal = () => {
  const router = useRouter();
  const { dispatch, user } = useUser();
  const { modalState, modalDispatch } = useModalSelection();
  const [error, setError] = useState("");
  const [passkey, setPasskey] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldRemember, setShouldRemember] = useState(false);

  const submitButtonRef = useRef<HTMLButtonElement | null>(null);

  const isModalOpen = modalState.type === "SecurityModal" && modalState.isOpen;
  const validate = user.hasPasskey && !user.shouldRemember;

  const handleCreatePasskey = async () => {
    const response = await createPasskey(passkey, shouldRemember);

    dispatch({ type: "PASSKEY_CREATE", payload: response.success });

    if (response.success) {
      setPasskey("");
      setShouldRemember(false);
      toast.success(response.data);
      modalDispatch({ type: "onClose" });
    } else {
      setError(response.error);
    }
  };

  const handleValidatePasskey = async () => {
    const response = await validatePasskey(passkey, shouldRemember);

    if (response.success) {
      if (
        modalState.data?.type === "SecurityModal" &&
        modalState.data.data.url
      ) {
        const url = modalState.data.data.url;
        console.log({url})
        router.push(url);
      }

      setPasskey("");
      setShouldRemember(false);
      toast.success(response.data);

      modalDispatch({ type: "onClose" });
    } else {
      setError(response.error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!e.shiftKey && (e.key === "Enter" || e.key === "NumpadEnter")) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit(submitButtonRef.current);
    }
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={() => {}}
    >
      <DialogContent className="max-w-fit h-auto max-h-max text-white" onXCloseButtonClick={() => { modalDispatch({ type: "onClose" }) }}>
        <DialogItem>
          <form
            action={validate ? handleValidatePasskey : handleCreatePasskey}
            className="sm:w-[448px] w-96 p-8 h-80 rounded-2xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex gap-3 items-center">
                <h3 className="md:text-2xl text-xl font-medium">Security</h3>
                <KeyRound className="stroke-neutral-950 fill-btn-primary [transform:rotateY(180deg)]" />
              </div>
              <p className="sm:text-sm text-xs">
                {validate
                  ? "Please verify your passkey before you start integrating your apps."
                  : "Set-up a passkey before you start integrating your apps."}
              </p>
            </div>
            <OTP
              setOTP={setPasskey}
              setIsSubmitting={setIsSubmitting}
              hideOTP
            />

            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={shouldRemember}
                  onChange={(e) => setShouldRemember(e.target.checked)}
                  onKeyDown={handleKeyDown}
                  className="customCheckbox"
                  disabled={isSubmitting}
                />
                <label htmlFor="remember" className="cursor-pointer">
                  remember me
                </label>
              </div>
              <button
                disabled={isSubmitting}
                ref={submitButtonRef}
                type="submit"
                className="py-3 px-6 flex items-center justify-center gap-2 rounded-2xl bg-btn-primary text-black font-semibold text-sm disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
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
          </form>
        </DialogItem>
      </DialogContent>
    </Dialog>
  );
};

export default SecurityModal;
