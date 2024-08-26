"use client";

import { createContext, useCallback, useContext, useMemo } from "react";

type DrawerContextType = {
  open: boolean;
  isPortalLoaded: boolean;
  setIsPortalLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
};

const drawerContext = createContext<DrawerContextType>({
  onOpenChange: () => {},
  open: false,
  isPortalLoaded: false,
  setIsPortalLoaded: () => {},
});

const useDrawer = () => {
  const { onOpenChange, open, isPortalLoaded, setIsPortalLoaded } =
    useContext(drawerContext);

  const onPortalOpen = useCallback(
    () => setIsPortalLoaded(true),
    [setIsPortalLoaded]
  );
  const onPortalClose = useCallback(
    () => setIsPortalLoaded(false),
    [setIsPortalLoaded]
  );

  const onClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);
  const onOpen = useCallback(() => onOpenChange(true), [onOpenChange]);

  const values = useMemo(
    () => ({
      open,
      DrawerProvider: drawerContext.Provider,
      onClose,
      onOpen,
      onPortalOpen,
      onPortalClose,
      isPortalLoaded,
    }),

    [onClose, onOpen, open, isPortalLoaded, onPortalOpen, onPortalClose]
  );

  return values;
};

export default useDrawer;
