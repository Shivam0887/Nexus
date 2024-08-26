"use client";

import useDrawer from "@/hooks/useDrawer";
import { cn } from "@/lib/utils";

const HamburgurIcon = () => {
  const { open } = useDrawer();

  return (
    <div className="block relative sm:hidden">
      <div
        className={cn(
          "z-[100] menu relative w-[20px] h-[20px]",
          open && "alter"
        )}
      >
        <div className={open ? "alter" : ""}></div>
        <div className={open ? "cross" : "hidden"}>
          <div className="line1"></div>
          <div className="line2"></div>
        </div>
      </div>
    </div>
  );
};

export default HamburgurIcon;
