"use client";

import { createContext, useContext, useMemo, useState } from "react";

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
  const Provider = DialogContext.Provider;

  return {
    modal,
    onOpenChange,
    open,
    setModal,
    Provider,
  };
};

const DialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, onOpenChange] = useState(false);
  const [modal, setModal] = useState(true);

  const contextValue = useMemo(
    () => ({ open, onOpenChange, modal, setModal }),
    [open, modal]
  );

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  );
};

export default DialogProvider;
