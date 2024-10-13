"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogItem,
  DialogTitle,
} from "@/components/ui/dialog";
import useAISearch from "@/hooks/useAISearch";
import { useModalSelection } from "@/hooks/useModalSelection";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

/* Data Collection disclaimer for user privacy */
const DataCollectionModal = () => {
  const { modalDispatch, modalState } = useModalSelection();
  const { updateAISearchPreference } = useAISearch();

  const isModalOpen =
    modalState.isOpen && modalState.type === "DataCollectionModal";

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={() => {
        modalDispatch({ type: "onClose" });
      }}
    >
      <DialogContent
        className={`flex items-center max-w-2xl h-max pb-5 px-4 ${
          inter.className
        } ${isModalOpen ? "block" : "hidden"}`}
      >
        <DialogHeader>
          <DialogTitle className="w-max mx-auto">
            <h2 className="text-xl text">Disclaimer: Data Collection</h2>
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            <p className="text-justify">
              If you want to use AI-based search for more granular search, then
              you must <strong>&quot;allow&quot;</strong> for data collection.
              We ensure you that your data only belongs to you, and won&apos;t
              be shared to any third-party expect AI-models we use. Only
              AI-models will use your data for improving their products and
              services. If you want no one use your data expect you, upgrade to{" "}
              <strong>&quot;Premium Plan&quot;</strong>.
            </p>
          </DialogDescription>
        </DialogHeader>

        <DialogItem>
          <div className="flex items-center justify-around mt-5">
            <button
              className="text-sm px-6 py-3 rounded-lg font-semibold text-white transition-colors bg-neutral-800 hover:bg-neutral-700"
              onClick={() => updateAISearchPreference(false)}
            >
              Deny
            </button>
            <button
              className="text-sm px-6 py-3 rounded-lg font-semibold text-white transition-colors bg-neutral-800 hover:bg-neutral-700"
              onClick={() => updateAISearchPreference(true)}
            >
              Allow
            </button>
          </div>
        </DialogItem>
      </DialogContent>
    </Dialog>
  );
};

export default DataCollectionModal;
