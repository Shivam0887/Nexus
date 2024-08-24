"use client";

import { useDialog } from "@/hooks/useDialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef } from "react";

type DialogType = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: React.Dispatch<React.SetStateAction<boolean>>;
  modal?: boolean;
};

export const DialogTrigger = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { onOpenChange } = useDialog();

  return (
    <div
      onClick={() => onOpenChange(true)}
      className={cn("size-4 text-text-primary cursor-pointer", className)}
    >
      {children}
    </div>
  );
};

export const DialogHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col items-start gap-3", className)}>
      {children}
    </div>
  );
};

export const DialogTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("text-2xl font-semibold text-text-primary", className)}>
      {children}
    </div>
  );
};

export const DialogDescription = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("text-sm text-text-secondary", className)}>
      {children}
    </div>
  );
};

export const DialogItem = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("", className)}>{children}</div>;
};

export const DialogContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const { modal, onOpenChange, open } = useDialog();

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const dialog = dialogRef.current!;
      const dialogDim = dialog.getBoundingClientRect();

      if (
        e.clientX < dialogDim.left ||
        e.clientX > dialogDim.right ||
        e.clientY < dialogDim.top ||
        e.clientY > dialogDim.bottom
      ) {
        handleClose();
      }
    },
    [handleClose]
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("click", handleClick);

    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("click", handleClick);
    };
  }, [handleClose, handleClick]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (
      !dialog ||
      typeof dialog.show !== "function" ||
      typeof dialog.showModal !== "function"
    ) {
      // Fallback behavior for browsers without dialog support
      console.warn("Dialog element not supported");
      return;
    }

    if (open) {
      if (modal) dialog.showModal();
      else dialog.show();
    } else dialog.close();
  }, [modal, open]);

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "relative space-y-2 backdrop:backdrop-blur-sm max-w-[768px] w-[95%] h-72 bg-secondary rounded-2xl sm:px-5 px-2 pt-10 focus:outline-none border border-neutral-700 overflow-hidden",
        className
      )}
    >
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 float-end"
        aria-label="close button"
      >
        <X className="size-4 text-text-primary" />
      </button>
      <div
        className="flex flex-col gap-4 h-full overflow-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {children}
      </div>
    </dialog>
  );
};

export const Dialog = ({ children, open, onOpenChange, modal }: DialogType) => {
  const {
    open: contextOpen,
    onOpenChange: contextOnOpenChange,
    modal: contextModal,
    setModal,
  } = useDialog();

  const isControlled = useMemo(
    () => open !== undefined && onOpenChange !== undefined,
    [onOpenChange, open]
  );

  useEffect(() => {
    contextOnOpenChange(isControlled ? open! : contextOpen);
    setModal(modal ?? contextModal);
  }, [
    isControlled,
    open,
    onOpenChange,
    contextOpen,
    contextOnOpenChange,
    modal,
    contextModal,
    setModal,
  ]);

  return <div>{children}</div>;
};
