"use client";

import useDrawer from "@/hooks/useDrawer";
import { HeaderContext, useHeader } from "@/hooks/useHeader";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
};

const DrawerPortal = ({ children }: Props) => {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
    null
  );

  useEffect(() => {
    const portal = document.getElementById("drawer-portal") as HTMLDivElement;
    setPortalContainer(portal);
  }, []);

  useEffect(() => {
    const drawerContainer = document.querySelector(
      ".drawer-container"
    ) as HTMLDivElement;

    if (!drawerContainer) return;

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
  }, [portalContainer]);

  if (!portalContainer) return null;

  return <>{createPortal(<>{children}</>, portalContainer)}</>;
};

export const DrawerContent = ({ children, className }: Props) => {
  const { open, onClose } = useDrawer();

  const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    const drawerContainer = document.querySelector(
      ".drawer-container"
    ) as HTMLDivElement;

    (drawerContainer.lastChild as HTMLDivElement).classList.remove(
      "animate-drawer-open"
    );
    (drawerContainer.lastChild as HTMLDivElement).classList.add(
      "animate-drawer-close"
    );

    if (onClose)
      setTimeout(() => {
        document.body.style.overflow = "auto";
        onClose();
      }, 200);
  };

  return (
    <>
      {open && (
        <DrawerPortal onClose={onClose}>
          <div className="drawer-container">
            {/* overlay */}
            <div
              className="z-[9999] fixed inset-0 bg-neutral-950/70"
              onClick={handleClose}
            />
            <div
              tabIndex={1}
              className="animate-drawer-open z-[9999] fixed inset-x-0 bottom-0 h-0 bg-neutral-950 border-t-2 border-t-neutral-800 focus:outline-none rounded-t-xl flex flex-col items-center"
            >
              <div className="w-28 h-2 rounded-3xl bg-neutral-700 mt-6 mx-auto" />
              <div className={cn("", className)}>{children}</div>
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
    <button onClick={onOpen} className={cn("", className)}>
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

export const DrawerClose = ({ children, className, onClose }: Props) => {
  return (
    <button
      className={cn("", className)}
      onClick={(e) => {
        e.stopPropagation();
        onClose?.();
      }}
    >
      {children}
    </button>
  );
};

export const Drawer = ({ children }: Pick<Props, "children">) => {
  const [isOpen, setIsOpen] = useState(false);

  const { DrawerProvider } = useDrawer();

  const values = useMemo(
    () => ({
      open: isOpen,
      onOpenChange: setIsOpen,
    }),
    [isOpen]
  );

  return <DrawerProvider value={values}>{children}</DrawerProvider>;
};
