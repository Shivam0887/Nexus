"use client";

import { useEffect, useState } from "react";

export const Flipwords = ({ words }: { words: string[] }) => {
  const [word, setWord] = useState<string[]>([]);

  useEffect(() => {
    let i = 0;
    let n = words.length;

    const animate = () => {
      let j = 0;

      const id = setInterval(() => {
        const s = words[i][j];
        setWord((prev) => [...prev, s]);
        j++;

        if (j === words[i].length) {
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
  }, [words]);

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
