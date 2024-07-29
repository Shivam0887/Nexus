"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

const Menu = () => {
  const [isChecked, setIsChecked] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current) {
        if (e.clientX < ref.current.getBoundingClientRect().x) {
          setIsChecked(false);
        }
      }
    };

    window.addEventListener("click", handleClick, true);

    return () => window.removeEventListener("click", handleClick, true);
  }, []);

  return (
    <div className="block relative sm:hidden">
      <div
        className={cn(
          "z-[100] menu relative w-[20px] h-[20px]",
          isChecked && "alter"
        )}
      >
        <div className={isChecked ? "alter" : ""}></div>
        <div className={isChecked ? "cross" : "hidden"}>
          <div className="line1"></div>
          <div className="line2"></div>
        </div>
        <input
          type="checkbox"
          onClick={() => setIsChecked((prev) => !prev)}
          className="absolute cursor-pointer top-0 left-0 opacity-0 w-[20px] h-[20px]"
        />
      </div>

      <div
        ref={ref}
        className={cn(
          "w-0 h-screen rounded-md z-[90] bg-neutral-900/90 border border-neutral-600 bg-no-repeat  left-[300%] top-[-100%] opacity-0 absolute -translate-x-[100%] transition-all duration-500",
          isChecked && "w-[70vw] opacity-100"
        )}
      ></div>
    </div>
  );
};

export default Menu;
