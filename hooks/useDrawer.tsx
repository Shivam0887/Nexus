"use client";

import { createContext, useCallback, useContext, useMemo } from "react";

type DrawerContextType = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const drawerContext = createContext<DrawerContextType>({
  onOpenChange: () => {},
  open: false,
});

const useDrawer = () => {
  const { onOpenChange, open } = useContext(drawerContext);

  const onClose = useCallback(() => onOpenChange(false), [onOpenChange]);
  const onOpen = useCallback(() => onOpenChange(true), [onOpenChange]);

  const values = useMemo(
    () => ({
      open,
      DrawerProvider: drawerContext.Provider,
      onClose,
      onOpen,
    }),
    [onClose, onOpen, open]
  );

  return values;
};

export default useDrawer;
