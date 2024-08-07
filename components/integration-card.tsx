"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const IntegrationCard = ({
  src,
  alt,
  desc,
}: {
  src: string;
  alt: string;
  desc: string;
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      container.style.width = isClicked ? "28rem" : "14rem";
      container.style.height = isClicked ? "14rem" : "7rem";

      (container.firstChild as HTMLDivElement).style.top = isClicked
        ? "10%"
        : "50%";
      (container.firstChild as HTMLDivElement).style.transform = isClicked
        ? "translateY(0%)"
        : "translateY(-50%)";
    }
  }, [isClicked]);

  return (
    <div
      ref={containerRef}
      role="button"
      onClick={() => setIsClicked((prev) => !prev)}
      className="relative cursor-pointer w-[14rem] h-[7rem] overflow-hidden shrink-0 group bg-secondary rounded-3xl p-4 transition-all duration-500"
    >
      <div className="transition-all duration-500 absolute top-1/2 -translate-y-1/2 flex gap-6 items-center">
        <div className="w-16 h-16 bg-primary rounded-lg flex justify-center items-center">
          <div className="relative w-[75%] h-[75%]">
            <Image src={src} alt={alt} fill />
          </div>
        </div>
        <p className="text-center">{alt}</p>
      </div>

      <div className="flex flex-col pt-7 justify-between w-[26rem] h-[12rem]">
        <button className="self-end w-max text-xs border border-btn-primary py-2 px-4 rounded-3xl text-btn-primary">
          Connect
        </button>
        <p className="text-sm pb-4">{desc}</p>
      </div>
    </div>
  );
};

export default IntegrationCard;
