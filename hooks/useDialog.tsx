"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type DialogContextType = {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  modal: boolean;
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const DialogContext = createContext<DialogContextType>({
  modal: true,
  open: false,
  onOpenChange: () => {},
  setModal: () => {},
});

export const useDialog = () => {
  const { modal, onOpenChange, open, setModal } = useContext(DialogContext);

  const onClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const contextValue = useMemo(
    () => ({
      open,
      onOpenChange,
      modal,
      setModal,
      DialogProvider: DialogContext.Provider,
      onClose,
    }),
    [open, modal, onOpenChange, setModal, onClose]
  );

  return contextValue;
};
