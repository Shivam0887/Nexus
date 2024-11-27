"use client";

import { deleteAccount } from "@/actions/user.actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalSelection } from "@/hooks/useModalSelection";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const inter = Inter({ subsets: ["latin"] });

/* Data Collection disclaimer for user privacy */
const AccountDeletionModal = () => {
  const { modalDispatch, modalState } = useModalSelection();
  const router = useRouter();

  const isModalOpen = modalState.isOpen && modalState.type === "AccountDelete";

  const [value, setValue] = useState("");

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={() => {
        modalDispatch({ type: "onClose" });
      }}
    >
      <DialogContent className={`max-w-2xl h-max pb-5 px-4 ${inter.className}`}>
        <DialogHeader>
          <DialogTitle className="w-max mx-auto">
            <h2 className="text-lg sm:text-xl text-red-600 font-semibold">
              Confirm Account Deletion
            </h2>
          </DialogTitle>
          <DialogDescription className="text-text-secondary text-center w-full">
            <p className="text-xs sm:text-sm">
              Are you sure you want to delete your account? This action is
              irreversible. <br /> Type {"'CONFIRM'"} to delete your account.
            </p>
          </DialogDescription>
        </DialogHeader>

        <form className="mx-auto w-full sm:w-3/4 space-y-4 mb-2 flex flex-col">
          <input
            type="text"
            className="w-full mx-auto px-4 py-3 rounded-lg bg-neutral-900 text-white text-xs focus:outline outline-neutral-600"
            placeholder="CONFIRM"
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />

          <div className="w-full flex justify-end gap-2 mb-2">
            <button
              type="button"
              className="rounded-lg text-sm bg-neutral-950 border border-neutral-800 max-w-max px-4 py-2 font-medium hover:bg-neutral-800 transition-colors text-white"
              onClick={() => {
                modalDispatch({ type: "onClose" });
              }}
            >
              Cancel
            </button>
            <button
              disabled={value.toLowerCase() !== "confirm"}
              type="button"
              className="rounded-lg text-sm bg-red-800 max-w-max px-4 py-2 font-medium hover:bg-red-800/85 transition-colors text-white disabled:bg-red-800/50 disabled:cursor-not-allowed"
              onClick={async () => {
                const response = await deleteAccount(value);
                if (!response.success) {
                  toast.error(response.error);
                  modalDispatch({ type: "onClose" });
                  return;
                }

                modalDispatch({ type: "onClose" });
                setTimeout(() => {
                  router.replace("/account-delete");
                }, 0);
              }}
            >
              Done
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDeletionModal;
