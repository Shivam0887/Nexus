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
import { useDrawerSelection } from "@/hooks/useDrawerSelection";

const Document = ({
  layout,
  document,
}: {
  layout: "grid" | "list";
  document: TDocumentResponse;
}) => {
  const [open, setOpen] = useState(false);
  const { drawerDispatch } = useDrawerSelection();

  const handleDragStart = (e: React.DragEvent<HTMLElement>) => {
    e.dataTransfer.setData("text", document.title);
  };

  return (
    <main
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "px-5 py-2 w-full h-24 grid grid-cols-[auto_1fr_auto] items-center gap-6 mx-auto bg-neutral-800 rounded-lg",
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

          <div className="relative">
            <button
              type="button"
              onBlur={() => setOpen(false)}
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-1 bg-neutral-800 hover:bg-neutral-700 transition-colors rounded-lg p-2 text-xs tracking-wider"
            >
              <EllipsisVertical className="sm:size-5 size-4 text-text-primary" />
            </button>

            <div
              className={cn(
                "absolute -left-10 space-y-2 bg-neutral-900 border-none shadow-xl z-[120] rounded-lg p-2 transition-opacity duration-75",
                { "opacity-0": !open, "opacity-100": open }
              )}
            >
              <button
                type="button"
                className="inline-flex text-sm gap-2 items-center"
                onClick={() => {
                  drawerDispatch({
                    data: { type: "SidebarChat", data: document },
                    payload: "SidebarChat",
                    type: "onOpen",
                  });
                }}
              >
                <span title="Open in Sidebar">
                  <MessageSquare className="size-5" />
                </span>
                Chat
              </button>
              <button
                type="button"
                className="inline-flex text-sm gap-2 items-center"
                onClick={() => {
                  drawerDispatch({
                    data: { type: "SidebarContentSummary", data: document },
                    payload: "SidebarContentSummary",
                    type: "onOpen",
                  });
                }}
              >
                <span title="Open in Sidebar">
                  <AlignLeft className="size-5" />
                </span>
                Summerize
              </button>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
};

export default Document;
