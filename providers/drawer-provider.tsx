"use client";

import FilterDrawer from "@/components/drawer/filter";
import SidenavDrawer from "@/components/drawer/sidenav";
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
    </>
  );
};

export default DrawerProvider;
