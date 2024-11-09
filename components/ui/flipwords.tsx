"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

type TFlipwordsProps = {
  words: string[];
  className?: string;
  style?: React.CSSProperties;
  charSpeed?: number;
  nextWordSpeed?: number;
  nextWordAnimationStop?: boolean;
  loadingDot?: boolean;
};

export const Flipwords = ({
  words,
  charSpeed = 200,
  nextWordSpeed = 2000,
  className,
  style,
  nextWordAnimationStop = false,
  loadingDot = false,
}: TFlipwordsProps) => {
  const [word, setWord] = useState<string[]>([]);
  const [loadingAnimation, setLoadingAnimation] = useState(true);

  const wordsRef = useRef(words);

  useEffect(() => {
    let i = 0;
    let n = wordsRef.current.length;
    let id: NodeJS.Timeout | undefined = undefined;

    const animate = () => {
      let j = 0;

      id = setInterval(() => {
        const s = wordsRef.current[i][j];
        setWord((prev) => [...prev, s]);
        j++;

        if (j === wordsRef.current[i].length) {
          i = (i + 1) % n;

          setLoadingAnimation(false);
          clearInterval(id);

          if (!nextWordAnimationStop) {
            setTimeout(() => {
              setWord([]);
              setLoadingAnimation(true);
              animate();
            }, nextWordSpeed);
          }
        }
      }, charSpeed);
    };

    animate();

    return () => clearInterval(id);
  }, [nextWordSpeed, charSpeed, nextWordAnimationStop]);

  return (
    <span className="flex items-center">
      <span className={cn("text-btn-primary", className)} style={style}>
        {word.map((char, index) => (
          <span key={index} className="char">
            {char}
          </span>
        ))}
      </span>
      {loadingDot && loadingAnimation && (
        <span className="inline-block size-6 rounded-full bg-neutral-200 animate-pulse" />
      )}
    </span>
  );
};
