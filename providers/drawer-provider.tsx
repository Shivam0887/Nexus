"use client";

import ChatSidebarDrawer from "@/components/drawer/chat-sidebar";
import FilterDrawer from "@/components/drawer/filter";
import SidenavDrawer from "@/components/drawer/sidenav";
import SummarySidebarDrawer from "@/components/drawer/summary-sidebar";
import { useEffect, useState } from "react";

const DrawerProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <></>;
  return (
    <>
      <FilterDrawer />
      <SidenavDrawer />
      <ChatSidebarDrawer />
      <SummarySidebarDrawer />
    </>
  );
};

export default DrawerProvider;
