"use client";

import useDrawer from "@/hooks/useDrawer";
import { HeaderContext, useHeader } from "@/hooks/useHeader";
import { DrawerDir } from "@/lib/constants";
import { DrawerDirection } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
};

type DrawerContentProps = {
  children: React.ReactNode;
  direction?: DrawerDirection;
  handleStyles?: React.CSSProperties;
  drawerClassName?: string;
  containerClassName?: string;
};

const DrawerPortal = ({ children }: Props) => {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
    null
  );
  const { onPortalOpen } = useDrawer();

  useEffect(() => {
    const portal = document.getElementById("drawer-portal") as HTMLDivElement;
    setPortalContainer(portal);
  }, []);

  useEffect(() => {
    const drawerContainer = document.querySelector(
      ".drawer-container"
    ) as HTMLDivElement;

    if (!drawerContainer) return;

    onPortalOpen();

    // removing scroll
    document.body.style.overflow = "hidden";

    // Trap focus inside modal elements
    function trapFocus(element: HTMLElement) {
      const focusableElements =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

      const focusableContent = element.querySelectorAll(focusableElements);
      const firstFocusableElement = focusableContent[0] as HTMLElement;
      const lastFocusableElement = focusableContent[
        focusableContent.length - 1
      ] as HTMLElement;

      firstFocusableElement.focus();

      document.addEventListener("keydown", function (e) {
        let isTabPressed = e.key === "Tab";

        if (!isTabPressed) {
          return;
        }

        if (e.shiftKey) {
          // if shift + tab
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else {
          // if tab
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      });
    }

    trapFocus(drawerContainer);
  }, [portalContainer, onPortalOpen]);

  if (!portalContainer) return null;

  return <>{createPortal(<>{children}</>, portalContainer)}</>;
};

export const DrawerContent = ({
  children,
  drawerClassName,
  containerClassName,
  handleStyles = {},
}: DrawerContentProps) => {
  const { open, onClose, isPortalLoaded, drawerDirection } = useDrawer();

  useEffect(() => {
    if (isPortalLoaded && open) {
      const item = document.querySelector(".drawer-item") as HTMLDivElement;

      item.style.transform = DrawerDir[drawerDirection.current].translateIn;

      item.style.height = DrawerDir[drawerDirection.current].dimen[0];
      item.style.width = DrawerDir[drawerDirection.current].dimen[1];
    }
  }, [drawerDirection, open, isPortalLoaded]);

  return (
    <>
      {open && (
        <DrawerPortal onClose={() => onClose(drawerDirection.current)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="drawer-container"
          >
            {/* overlay */}
            <div
              className="z-[9999] fixed inset-0 bg-neutral-950/70"
              onClick={() => onClose(drawerDirection.current)}
            />
            <div
              tabIndex={1}
              className={cn(
                "transition-transform duration-300 drawer-item z-[9999] fixed bg-neutral-950 focus:outline-none flex flex-col items-center",
                drawerClassName
              )}
              style={{
                transform: DrawerDir[drawerDirection.current].translateOut,
                ...DrawerDir[drawerDirection.current].styles,
              }}
            >
              <div
                className="absolute w-28 h-2 rounded-3xl bg-neutral-700"
                style={{
                  ...handleStyles,
                  ...DrawerDir[drawerDirection.current].handleStyles,
                }}
              />
              <div className={cn("w-full mt-10", containerClassName)}>
                {children}
              </div>
            </div>
          </div>
        </DrawerPortal>
      )}
    </>
  );
};

export const DrawerTrigger = ({ children, className }: Props) => {
  const { onOpen } = useDrawer();

  return (
    <button type="button" onClick={onOpen} className={cn("", className)}>
      {children}
    </button>
  );
};

export const DrawerHeader = ({ className }: Props) => {
  return (
    <HeaderContext.Provider value={{ insideHeader: true }}>
      <div
        className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
      ></div>
    </HeaderContext.Provider>
  );
};

export const DrawerTitle = ({ className, children }: Props) => {
  const { insideHeader } = useHeader();
  if (!insideHeader) return;

  return (
    <div
      className={cn(
        "text-2xl font-semibold text-text-primary tracking-tight",
        className
      )}
    >
      {children}
    </div>
  );
};

export const DrawerDescription = ({ children, className }: Props) => {
  const { insideHeader } = useHeader();
  if (!insideHeader) return;

  return (
    <div className={cn("text-sm text-text-secondary", className)}>
      {children}
    </div>
  );
};

export const DrawerClose = ({ children, className }: Props) => {
  const { onClose, drawerDirection } = useDrawer();
  return (
    <button
      type="button"
      className={cn("", className)}
      onClick={() => onClose(drawerDirection.current)}
    >
      {children}
    </button>
  );
};

export const Drawer = ({
  children,
  drawerDirection,
  onOpenChange,
  open,
}: {
  drawerDirection: DrawerDirection;
  open?: boolean;
  onOpenChange?: React.Dispatch<React.SetStateAction<boolean>>;
} & Pick<Props, "children">) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPortalLoaded, setIsPortalLoaded] = useState(false);
  const direction = useRef<DrawerDirection>(drawerDirection);

  const { DrawerProvider } = useDrawer();

  if (Number(open === undefined) ^ Number(onOpenChange === undefined)) {
    throw new Error(
      "You must specify both 'open' and 'onOpenChange', if you want the controlled component."
    );
  }

  const values = useMemo(
    () => ({
      open: open ?? isOpen,
      onOpenChange: onOpenChange ?? setIsOpen,
      isPortalLoaded,
      setIsPortalLoaded,
      drawerDirection: direction,
    }),
    [isOpen, isPortalLoaded, direction, open, onOpenChange]
  );

  return <DrawerProvider value={values}>{children}</DrawerProvider>;
};
