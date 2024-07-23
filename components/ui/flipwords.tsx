"use client";

import { useEffect, useRef, useState } from "react";

export const Flipwords = ({ words }: { words: string[] }) => {
  const [word, setWord] = useState<string[]>([]);
  const wordsRef = useRef(words);

  useEffect(() => {
    let i = 0;
    let n = wordsRef.current.length;

    const animate = () => {
      let j = 0;

      const id = setInterval(() => {
        const s = wordsRef.current[i][j];
        setWord((prev) => [...prev, s]);
        j++;

        if (j === wordsRef.current[i].length) {
          i = (i + 1) % n;

          clearInterval(id);

          setTimeout(() => {
            setWord([]);
            animate();
          }, 2000);
        }
      }, 200);
    };

    animate();
  }, []);

  return (
    <span className="text-btn-primary">
      {word.map((char, index) => (
        <span key={index} className="char">
          {char}
        </span>
      ))}
    </span>
  );
};
