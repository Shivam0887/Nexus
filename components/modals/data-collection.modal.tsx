"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalSelection } from "@/hooks/useModalSelection";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

/* Data Collection disclaimer for user privacy */
const DataCollectionModal = () => {
  const { modalDispatch, modalState } = useModalSelection();

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
            <h2 className="text-xl text">Disclaimer: </h2>
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            <p className="text-justify"></p>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DataCollectionModal;
