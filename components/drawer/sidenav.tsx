"use client";

import React from "react";
import { Drawer, DrawerClose, DrawerContent } from "../ui/drawer";
import SidebarNav from "../global/sidebar-nav";
import HamburgurIcon from "../ui/hamburger-icon";
import { useDrawerSelection } from "@/hooks/useDrawerSelection";

const SidenavDrawer = () => {
  const { drawerState } = useDrawerSelection();

  if (drawerState.data?.type !== "SidebarMenu") return;

  const isOpen = drawerState.isOpen && drawerState.type === "SidebarMenu";
  return (
    <Drawer open={isOpen} onOpenChange={() => {}} drawerDirection="right">
      <DrawerContent
        containerClassName="h-full mt-0 w-full"
        drawerClassName="!w-[60vw]"
        handleStyles={{ display: "none" }}
      >
        <SidebarNav className="relative w-full" direction="right" />
        <DrawerClose className="z-[9999] right-5 top-5 absolute">
          <HamburgurIcon />
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  );
};

export default SidenavDrawer;
