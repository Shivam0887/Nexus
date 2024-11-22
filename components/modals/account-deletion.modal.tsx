"use client";

import { deleteAccount } from "@/actions/user.actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogItem,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalSelection } from "@/hooks/useModalSelection";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const inter = Inter({ subsets: ["latin"] });

/* Data Collection disclaimer for user privacy */
const AccountDeletionModal = () => {
  const { modalDispatch, modalState } = useModalSelection();
  const router = useRouter();

  const isModalOpen = modalState.isOpen && modalState.type === "AccountDelete";

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
            <h2 className="text-xl md:text-2xl text-red-600 font-semibold">
              Confirm Account Deletion
            </h2>
          </DialogTitle>
          <DialogDescription className="text-text-secondary text-center w-full">
            <p className="text-sm md:text-lg">
              Are you sure you want to delete your account? This action is
              irreversible.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-around mt-4">
          <button
            type="button"
            className="bg-[rgb(255_255_255)] rounded-lg px-4 py-2 transition-colors hover:bg-[rgb(255_255_255/0.9)]"
            onClick={() => {
              modalDispatch({ type: "onClose" });
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="text-white bg-red-600 rounded-lg px-4 py-2 transition-colors hover:bg-red-700"
            onClick={async () => {
              const response = await deleteAccount();
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
            Yes, Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDeletionModal;
