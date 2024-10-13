import React from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import Document from "@/components/document";

import ReactMarkdown from "react-markdown";

import { cn } from "@/lib/utils";
import { DocumentType } from "@/lib/types";
import { useModalSelection } from "@/hooks/useModalSelection";

const FullScreenModal = () => {
  const { modalDispatch, modalState } = useModalSelection();

  const isModalOpen =
    modalState.isOpen && modalState.type === "FullScreenModal";

  if (!modalState.data || modalState.data.type !== "FullScreenModal")
    return null;
  const { aiMessage, documents, layout } = modalState.data.data;

  return (
    <div className="absolute lg:right-20 right-5 lg:bottom-20 bottom-5">
      <Dialog
        open={isModalOpen}
        onOpenChange={() => modalDispatch({ type: "onClose" })}
      >
        <DialogContent className="!h-[80vh] max-w-screen-lg p-4">
          <div
            className={cn("grid gap-4 px-4 sm:px-6 lg:px-8", {
              "lg:grid-cols-3 md:grid-cols-2 grid-cols-1": layout === "grid",
            })}
          >
            {documents.map((doc) => (
              <Document key={doc.href} layout={layout} document={doc} />
            ))}
          </div>

          <div className="markdown overflow-auto space-y-5">
            <ReactMarkdown className="char">{aiMessage}</ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FullScreenModal;
