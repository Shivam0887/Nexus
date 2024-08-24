"use client";

import { images } from "@/lib/constants";
import {
  CircleArrowOutUpRight,
  Dot,
  EllipsisVertical,
  Link2,
  SquareArrowOutDownRight,
} from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

const Document = () => {
  const [openSideWindow, setOpenSideWindow] = useState(false);

  return (
    <main className="sm:px-10 px-4 py-8 w-full max-w-3xl flex items-center sm:gap-8 gap-6 mx-auto h-12 bg-neutral-800 rounded-lg">
      {/* image */}
      <aside className="relative sm:size-9 size-6">
        <Image src={images[0].src} alt={images[0].alt} fill priority />
      </aside>

      {/* document details */}
      <div className="flex-1 flex flex-col sm:text-sm text-xs text-text-secondary">
        <div className="flex items-center gap-2 ">
          <p className="line-clamp-1">Title of the document</p>
          <Dot />
          <p>Author</p>
        </div>

        <div className="flex items-center gap-2">
          <p className="line-clamp-1">example@gamil.com</p>
          <Dot />
          <p>date</p>
        </div>
      </div>

      <aside className="flex gap-3 items-center">
        {/* links */}
        <a href="https://www.google.com" target="_blank">
          <CircleArrowOutUpRight className="sm:size-5 size-4 text-text-primary" />
        </a>
        <Link2 className="sm:size-5 size-4 text-text-primary" />

        {/* more options */}
        <EllipsisVertical className="sm:size-5 size-4 text-text-primary" />
      </aside>
    </main>
  );
};

export default Document;
