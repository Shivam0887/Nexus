"use client";

import { useDialog } from "@/hooks/useDialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type DialogType = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: React.Dispatch<React.SetStateAction<boolean>>;
  modal?: boolean;
};

export const DialogTrigger = ({
  children,
  className,
  customOnOpenChange,
}: {
  children: React.ReactNode;
  className?: string;
  customOnOpenChange?: () => void;
}) => {
  const { onOpenChange } = useDialog();

  return (
    <div
      onClick={() =>
        customOnOpenChange ? customOnOpenChange() : onOpenChange(true)
      }
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
  return <div className={cn("w-full", className)}>{children}</div>;
};

export const DialogContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const { modal, open, onClose } = useDialog();

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
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.addEventListener("close", onClose);
    dialog.addEventListener("click", handleClick);

    return () => {
      dialog.removeEventListener("close", onClose);
      dialog.removeEventListener("click", handleClick);
    };
  }, [onClose, handleClick]);

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
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 float-end"
        aria-label="close button"
      >
        <X
          className="size-4 mix-blend-exclusion text-text-primary"
          style={{ strokeWidth: "3" }}
        />
      </button>
      <div
        className="flex flex-col gap-4 h-full w-full overflow-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {children}
      </div>
    </dialog>
  );
};

export const Dialog = ({ children, open, onOpenChange, modal }: DialogType) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModal, setIsModal] = useState(true);

  const { DialogProvider } = useDialog();

  if (Number(open === undefined) ^ Number(onOpenChange === undefined)) {
    throw new Error(
      "You must specify both 'open' and 'onOpenChange', if you want the controlled componenet."
    );
  }

  const value = useMemo(
    () => ({
      modal: modal ?? isModal,
      open: open ?? isOpen,
      onOpenChange: onOpenChange ?? setIsOpen,
      setModal: setIsModal,
    }),
    [isModal, isOpen, onOpenChange, open, modal]
  );

  return <DialogProvider value={value}>{children}</DialogProvider>;
};
