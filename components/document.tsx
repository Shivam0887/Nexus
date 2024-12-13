"use client";

import { format } from "date-fns";
import { TDocumentResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  AlignLeft,
  CircleArrowOutUpRight,
  Dot,
  EllipsisVertical,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

const Document = ({
  layout,
  document,
}: {
  layout: "grid" | "list";
  document: TDocumentResponse;
}) => {
  const [open, setOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLElement>) => {
    e.dataTransfer.setData("text", document.title);
  };

  return (
    <main
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "px-5 py-2 w-full h-24 grid grid-cols-[auto_1fr_auto] relative items-center gap-6 mx-auto bg-neutral-800 lg:bg-neutral-900 rounded-lg",
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
        <div className="space-y-2">
          <p className="line-clamp-1">Title: {document.title}</p>
          <p className="line-clamp-1">Author: {document.author}</p>
        </div>

        <div
          className={cn("flex items-center", {
            "flex-col items-start gap-2": layout === "grid",
          })}
        >
          <p className="line-clamp-1">{document.email}</p>
          {document.email && layout === "list" && <Dot />}
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
        <div className="flex items-center gap-3">
          {/* links */}
          <a href={document.href} target="_blank">
            <CircleArrowOutUpRight className="sm:size-5 size-4 text-text-primary" />
          </a>

          <button
            type="button"
            onClick={() => setOpen(prev => !prev)}
            className="flex items-center gap-1 hover:bg-neutral-800 transition-colors rounded-lg p-2 text-xs tracking-wider"
          >
            <EllipsisVertical className="sm:size-5 size-4 text-text-primary" />
          </button>
        </div>
      </aside>

      <div
        className={cn(
          "absolute right-16 top-1/2 -translate-y-1/2 space-y-2 flex flex-col text-white bg-neutral-900 lg:bg-neutral-800 border-none shadow-xl z-[120] rounded-lg p-2 transition-all duration-75",
          { invisible: !open, visible: open }
        )}
      >
        <Link
          href={`/chat/${document.id}`}
          className="inline-flex text-sm gap-2 items-center"
        >
          <span title="Open in Sidebar">
            <MessageSquare className="size-5" />
          </span>
          Chat
        </Link>
        <Link
          href={`/summary/${document.id}`}
          className="inline-flex text-sm gap-2 items-center"
        >
          <span title="Open in Sidebar">
            <AlignLeft className="size-5" />
          </span>
          Summerize
        </Link>
      </div>
    </main>
  );
};

export default Document;
