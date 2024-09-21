"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
  content,
}: {
  content: {
    title: string;
    desc: string;
    content: React.ReactNode;
  }[];
}) => {
  const [activeCard, setActiveCard] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const cardsBreakpoints = useMemo(() => {
    const cardLength = content.length;
    return content.map((_, index) => index / cardLength);
  }, [content]);

  const linearGradients = useMemo(
    () => [
      "linear-gradient(to bottom right, #52d3ee, #50b981)",
      "linear-gradient(to bottom right, #ec4899, #6366f1)",
      "linear-gradient(to bottom right, #fb923c, #facc15)",
    ],
    []
  );

  useEffect(() => {
    const container = ref.current;

    const contentContainer = document.querySelector(
      ".content-container"
    ) as HTMLDivElement;
    const items = document.querySelector(".items") as HTMLDivElement;

    const beamContainer = document.querySelector(
      ".beam-container"
    ) as HTMLDivElement;
    const beam = document.querySelector(".beam") as HTMLDivElement;

    const handleScroll = () => {
      if (ref.current && beam) {
        const container = ref.current;
        const scrollYProgress =
          container.scrollTop /
          (container.scrollHeight - container.clientHeight);

        beam.style.top = `${Math.round(scrollYProgress * 100)}%`;
        beam.style.height = `${Math.round(scrollYProgress * 25)}%`;

        let closestBreakpointIndex = 0;

        for (let i = 0; i < cardsBreakpoints.length; i++) {
          const breakPoint = cardsBreakpoints[i];
          if (scrollYProgress >= breakPoint) {
            closestBreakpointIndex = i;
          }
        }

        setActiveCard(closestBreakpointIndex);
      }
    };

    if (container && contentContainer && items && beamContainer) {
      container.addEventListener("scroll", handleScroll);

      beamContainer.style.height = `${contentContainer.scrollHeight}px`;
      (items.lastChild as HTMLDivElement).style.marginBottom = "7rem";
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [cardsBreakpoints]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--background-gradient",
      linearGradients[activeCard]
    );
  }, [activeCard, linearGradients]);

  const backgroundColors = ["#1B1B1B", "#000000", "#171717"];

  return (
    <div
      className="h-[30rem] w-full mx-auto [scrollbar-width:none] overflow-y-auto flex relative px-3 rounded-lg transition duration-500 ease-linear"
      ref={ref}
      style={{
        backgroundColor: backgroundColors[activeCard],
      }}
    >
      <div className="content-container h-fit overflow-clip grid [grid-template-columns:auto_auto_1fr] gap-10 md:px-10 relative w-full">
        {/* tracing beam */}
        <div className="mx-2 w-3.5 h-3.5 relative rounded-[50%] border flex justify-center items-center border-neutral-500 mt-10">
          <div className="w-2 h-2 rounded-[50%] bg-emerald-500" />
          <div className="beam-container w-[2px] absolute top-[100%] bg-neutral-600/20">
            <div
              className="beam w-full transition-all duration-100 absolute "
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(174,72,255,0.05) 15%, rgba(174,72,255,1) 50%, rgba(99,68,245,1) 60%, rgba(24,204,252,1) 85%)",
              }}
            />
          </div>
        </div>

        <div className="items flex flex-col px-4">
          {content.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className="max-w-96 space-y-10 mt-28"
            >
              <h2
                className={cn(
                  "md:text-3xl sm:text-2xl text-xl font-bold text-[#cbd5e1] opacity-30 transition-opacity duration-500 ease-linear",
                  activeCard === index && "opacity-100"
                )}
              >
                {item.title}
              </h2>
              <p
                className={cn(
                  "md:text-lg sm:text-base text-sm text-[#94a3b8] opacity-30 transition-opacity duration-500 ease-linear",
                  activeCard === index && "opacity-100"
                )}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
        <div
          style={{ background: `var(--background-gradient)` }}
          className={
            "hidden md:block h-60 w-80 rounded-lg sticky mx-auto top-1/2 -translate-y-1/2"
          }
        >
          {content[activeCard].content ?? null}
        </div>
      </div>
    </div>
  );
};
