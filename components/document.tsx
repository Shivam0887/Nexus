"use client";

import { format } from "date-fns";
import { DocumentType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  CircleArrowOutUpRight,
  Dot,
  EllipsisVertical,
  Link2,
} from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

const Document = ({
  layout,
  document,
}: {
  layout: "grid" | "list";
  document: DocumentType;
}) => {
  const [openSideWindow, setOpenSideWindow] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLElement>) => {
    e.dataTransfer.setData("text", document.title);
  };

  return (
    <main
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "px-5 py-2 w-full h-16 grid grid-cols-[auto_1fr_auto] items-center gap-6 mx-auto bg-neutral-800 rounded-lg",
        {
          "max-w-sm h-auto": layout === "grid",
        }
      )}
    >
      {/* image */}
      <aside
        className={cn("relative sm:size-9 size-6", {
          "sm:size-12 size-9": layout === "grid",
        })}
      >
        <Image src={document.logo} alt={document.date} fill priority />
      </aside>

      {/* document details */}
      <div
        className={cn(
          "overflow-hidden space-y-2 sm:text-sm text-xs text-text-secondary",
          {
            "grid [grid-column:1/-1] [grid-row:2/span1]": layout === "grid",
          }
        )}
      >
        <div
          className={cn("flex items-center gap-2", {
            "flex-col items-start": layout === "grid",
          })}
        >
          <p className="line-clamp-1">Title: {document.title}</p>
          {layout === "list" && (
            <span>
              <Dot />
            </span>
          )}
          <p className="line-clamp-1">Author: {document.author}</p>
        </div>

        <div className="flex items-center">
          <p className="line-clamp-1">{document.email}</p>
          <Dot />
          <p className="line-clamp-1">
            {format(document.date, "eee, MMM do, yyyy 'at' hh:mm aaa")}
          </p>
        </div>
      </div>

      <aside
        className={
          layout === "grid"
            ? "grid [grid-column:2/span1] [grid-row:1/span1] justify-end"
            : ""
        }
      >
        <div className="flex gap-3">
          {/* links */}
          <a href={document.href} target="_blank">
            <CircleArrowOutUpRight className="sm:size-5 size-4 text-text-primary" />
          </a>
          <Link2 className="sm:size-5 size-4 text-text-primary" />

          {/* more options */}
          <EllipsisVertical className="sm:size-5 size-4 text-text-primary" />
        </div>
      </aside>
    </main>
  );
};

export default Document;
