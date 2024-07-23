"use client";

import { cn } from "@/lib/utils";
import { PALETTE_NAME } from "@/lib/types";
import { colorPalettes } from "@/lib/constants";

import Image from "next/image";
import { CSSProperties, useEffect, useRef, useState } from "react";

type CardsType = {
  colorPalette: PALETTE_NAME;
  title: string;
  desc: string[];
  delay?: number;
  className?: string;
  containerClassName?: string;
  style?: CSSProperties;
};

const Cards = ({
  colorPalette,
  title,
  desc,
  className,
  containerClassName,
  style,
  delay = 0,
}: CardsType) => {
  const circleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isCardClick, setIsCardClick] = useState(false);
  const [content, setContent] = useState<string[]>([]);

  const colorTheme = colorPalettes[colorPalette];
  const { linearGradient1, linearGradient2, radialGradient } = colorTheme;

  useEffect(() => {
    if (circleRef.current && containerRef.current) {
      let x = 0;
      let y = 0;
      let dx = 1; // Change in x (velocity)
      let dy = 1; // Change in y (velocity)

      const parentRect = containerRef.current.getBoundingClientRect();
      const circleRect = circleRef.current.getBoundingClientRect();

      containerRef.current.style.background = `radial-gradient(circle at center, ${radialGradient.stop1}, ${radialGradient.stop2}) no-repeat`;

      circleRef.current.style.background = `linear-gradient(110deg, ${linearGradient1.stop1} 30%,${linearGradient1.stop2}), linear-gradient(90deg, ${linearGradient2.stop1} 30%, ${linearGradient2.stop2}) no-repeat`;

      const moveCircle = () => {
        if (circleRef.current && containerRef.current) {
          // Calculate the new position
          x += dx;
          y += dy;

          // Check for boundary collisions
          if (x <= 0 || x >= parentRect.width - circleRect.width) {
            dx = -dx; // Reverse direction on x-axis
          }
          if (y <= 0 || y >= parentRect.height - circleRect.height) {
            dy = -dy; // Reverse direction on y-axis
          }

          // Apply the new position
          circleRef.current.style.left = `${x}px`;
          circleRef.current.style.top = `${y}px`;

          // Request the next animation frame
          requestAnimationFrame(moveCircle);
        }
      };

      // Start the animation
      setTimeout(() => {
        moveCircle();
      }, delay);
    }
  }, [delay, radialGradient, linearGradient1, linearGradient2]);

  useEffect(() => {
    let id: NodeJS.Timeout | undefined;

    if (isCardClick) {
      let i = -1;
      id = setInterval(() => {
        setContent((prev) => [...prev, " ", desc[i]]);
        i++;

        if (i === desc.length - 1) {
          clearInterval(id);
        }
      }, 150);
    } else {
      setContent([]);
      clearInterval(id);
    }

    return () => clearInterval(id);
  }, [isCardClick, desc]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.classList.toggle("animate-forwards");
    setIsCardClick((prev) => !prev);
  };

  return (
    <div
      className={className}
      style={style}
      role="button"
      onClick={handleClick}
    >
      <div
        ref={containerRef}
        className={cn(
          `relative overflow-hidden bg-primary rounded-lg w-full h-full`,
          containerClassName
        )}
      >
        <div
          className="absolute z-50 bottom-0 w-[calc(100%-50px)] h-[calc(100%-50px)] rounded-lg left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur"
          style={{ boxShadow: "0px 0px 15px 2px rgb(0 0 0 / 0.1)" }}
        >
          <div className="h-full font-semibold p-4 flex flex-col gap-10 justify-center items-center">
            <h2
              className={cn(
                "text-4xl leading-tight capitalize",
                isCardClick && "text-2xl self-start"
              )}
            >
              {title}
            </h2>

            <div
              className={cn(
                "hidden relative h-full w-full",
                isCardClick && "block space-y-4"
              )}
            >
              <div className="relative w-full h-[50%] sm:h-[70%]">
                <Image src="/temp/temp1.png" alt="temp12" fill />
              </div>
              <div>
                {content.map((text, i) => (
                  <span
                    key={`${text} ${i}`}
                    className="char font-normal text-sm"
                  >
                    {text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div
          ref={circleRef}
          className="absolute shadow opacity-75 z-10 w-[120px] aspect-square rounded-full bg-blend-soft-light"
        />
      </div>
    </div>
  );
};

export default Cards;
