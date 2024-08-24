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
    const width = window.innerWidth;

    const isMobile = width < 386;
    const isTablet = width < 640;

    const isLaptop = width < 1024;

    if (container) {
      container.style.width = isClicked
        ? `${container.scrollWidth}px`
        : "14rem";
      container.style.height = isClicked ? "14rem" : "7rem";
    }
  }, [isClicked]);

  return (
    <div
      ref={containerRef}
      role="button"
      onClick={() => setIsClicked((prev) => !prev)}
      className="relative cursor-pointer w-[14rem] h-[7rem] overflow-hidden shrink-0 group bg-secondary rounded-3xl p-4 transition-all duration-500 flex flex-col border"
    >
      <div className="transition-all duration-500 absolute top-6 left-5 flex gap-6 items-center">
        <div className="w-16 h-16 bg-primary rounded-lg flex justify-center items-center">
          <div className="relative w-[75%] h-[75%]">
            <Image src={src} alt={alt} fill />
          </div>
        </div>
        <p className="text-center">{alt}</p>
      </div>

      <div className="w-[18rem] sm:w-[20rem] lg:w-[22rem] xl:w-[28rem] h-[14rem] shrink-0 flex flex-col justify-around">
        <div className="flex justify-end">
          <button className=" w-max text-xs border border-btn-primary py-2 px-4 rounded-3xl text-btn-primary">
            Connect
          </button>
        </div>
        <div className="">
          <p className="text-sm pb-4">{desc}</p>
        </div>
      </div>
    </div>
  );
};

export default IntegrationCard;
