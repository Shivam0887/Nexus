"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import Document from "@/components/document";

import { cn } from "@/lib/utils";
import { useModalSelection } from "@/hooks/useModalSelection";

const FullScreenModal = () => {
  const { modalDispatch, modalState } = useModalSelection();

  const isModalOpen =
    modalState.isOpen && modalState.type === "FullScreenModal";

  if (!modalState.data || modalState.data.type !== "FullScreenModal")
    return null;

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={() => modalDispatch({ type: "onClose" })}
    >
      <DialogContent
        className={cn(
          "!h-[80vh] max-w-screen-lg p-4",
          modalState.data.data.type === "Element"
            ? modalState.data.data.className
            : ""
        )}
        disableXCloseButton={modalState.data.data.type === "Element"}
      >
        {modalState.data.data.type === "Message" ? (
          <div
            className={cn("grid gap-4 px-4 sm:px-6 lg:px-8", {
              "lg:grid-cols-3 md:grid-cols-2 grid-cols-1":
                modalState.data.data.layout === "grid",
            })}
          >
            {modalState.data.data.documents.map((doc) => {
              const layout =
                modalState.data?.type === "FullScreenModal" &&
                modalState.data.data.type === "Message"
                  ? modalState.data.data.layout
                  : "list";
              return <Document key={doc.href} layout={layout} document={doc} />;
            })}
          </div>
        ) : (
          <div className="relative">{modalState.data.data.element}</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FullScreenModal;
