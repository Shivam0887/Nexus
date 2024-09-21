"use client";

import { DrawerDir } from "@/lib/constants";
import { DrawerDirection } from "@/lib/types";
import {
  createContext,
  MutableRefObject,
  useCallback,
  useContext,
  useMemo,
} from "react";

type DrawerContextType = {
  open: boolean;
  isPortalLoaded: boolean;
  setIsPortalLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  drawerDirection: MutableRefObject<DrawerDirection>;
};

const drawerContext = createContext<DrawerContextType>({
  onOpenChange: () => {},
  open: false,
  isPortalLoaded: false,
  setIsPortalLoaded: () => {},
  drawerDirection: {
    current: "bottom",
  },
});

const useDrawer = () => {
  const {
    onOpenChange,
    open,
    isPortalLoaded,
    setIsPortalLoaded,
    drawerDirection,
  } = useContext(drawerContext);

  const onPortalOpen = useCallback(
    () => setIsPortalLoaded(true),
    [setIsPortalLoaded]
  );
  const onPortalClose = useCallback(
    () => setIsPortalLoaded(false),
    [setIsPortalLoaded]
  );

  const onClose = useCallback(
    (direction: DrawerDirection) => {
      const item = document.querySelector(".drawer-item");
      if (item) {
        (item as HTMLDivElement).style.transform =
          DrawerDir[direction].translateOut;
      }

      setTimeout(() => {
        document.body.style.overflow = "auto";
        onOpenChange(false);
        onPortalClose();
      }, 300);
    },
    [onOpenChange, onPortalClose]
  );
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
      drawerDirection,
    }),

    [
      onClose,
      onOpen,
      open,
      isPortalLoaded,
      onPortalOpen,
      onPortalClose,
      drawerDirection,
    ]
  );

  return values;
};

export default useDrawer;
