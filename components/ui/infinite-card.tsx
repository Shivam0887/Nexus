"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

type InfiniteCardProps = {
  cardItems: {
    src: string;
    alt: string;
    key: string;
    width: number;
    height: number;
  }[];
  className?: string;
  itemsClassName?: string;
  animationSpeed?: "slow" | "normal" | "fast";
  animationDirection?: "left" | "right";
  animationDelay?: string;
  mask?: boolean;
};

export const InfiniteCard = ({
  cardItems,
  className,
  itemsClassName,
  animationDirection = "left",
  animationSpeed = "normal",
  animationDelay = "0s",
  mask,
}: InfiniteCardProps) => {
  const [items, setItems] = useState(cardItems);

  useEffect(() => {
    const duplicatedItems = items.map((item, i) => {
      return {
        ...item,
        alt: `${item.alt} ${i}`,
        key: `${item.key} ${i}`,
      };
    });

    setItems((prev) => [...prev, ...duplicatedItems]);
    //eslint-disable-next-line
  }, []);

  return (
    <div
      className={cn("overflow-hidden relative w-[512px]", className, {
        mask: mask,
      })}
      data-animation-speed={animationSpeed}
      data-animation-direction={animationDirection}
    >
      <div
        className={cn(
          "flex w-max h-[250px] gap-10 animate-infinite-move",
          itemsClassName
        )}
        style={{ animationDelay }}
      >
        {items.map(({ alt, src, key, height, width }) => (
          <Image
            key={key}
            src={src}
            alt={alt}
            width={width}
            height={height}
            quality={100}
          />
        ))}
      </div>
    </div>
  );
};
