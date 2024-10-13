"use client";

import { saveFilters } from "@/actions/user.actions";
import useUser from "@/hooks/useUser";
import { images } from "@/lib/constants";
import { FilterKey } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, RefreshCw, Save, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

const Filter = ({
  className,
  controlledHeight = false,
}: {
  className?: string;
  controlledHeight?: boolean;
}) => {
  const { user, dispatch } = useUser();
  const [selected, setSelected] = useState(new Set<FilterKey>(user.filter));
  const [filterKeys, setFilterKeys] = useState(images);
  const [isExpand, setIsExpand] = useState(false);

  const filterKeyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const div = filterKeyRef.current;

    if (div && !controlledHeight) {
      div.style.height = isExpand ? `${div.scrollHeight}px` : "28px";
    }
  }, [isExpand, controlledHeight]);

  return (
    <div className="rounded-lg bg-neutral-800 grid gap-2 max-w-[756px] w-full py-2 px-4">
      <p className="text-[13px] text-text-primary tracking-wide">Filter by: </p>

      <div
        ref={filterKeyRef}
        className={cn(
          "h-7 transition-all duration-300 overflow-hidden w-full flex-1 flex flex-wrap items-center gap-2 md:[grid-column:2/3] md:[grid-row:1/span1] [grid-row:2/span1] [grid-column:1/3]",
          className
        )}
      >
        {filterKeys.map((image) => (
          <button
            type="button"
            key={image.key}
            onClick={() => {
              const newSet = new Set(selected);
              const filteredKeys = filterKeys.filter(
                ({ alt: a }) => a != image.alt
              );

              if (newSet.has(image.alt)) {
                newSet.delete(image.alt);
                filteredKeys.push(image);
              } else {
                newSet.add(image.alt);
                filteredKeys.unshift(image);
              }

              setFilterKeys(filteredKeys);
              setSelected(newSet);
            }}
            className="flex items-center gap-2 text-xs bg-neutral-900 text-text-primary text-black py-1 px-4 rounded-lg font-semibold"
          >
            <div className="flex items-center gap-2">
              <div className="relative h-5 w-5">
                <Image src={image.src} alt={image.alt} fill />
              </div>
              <p className="line-clamp-1 text-left capitalize">
                {image.alt.replace("_", " ").toLowerCase()}
              </p>
            </div>

            {selected.has(image.alt) && <X className="size-3" />}
          </button>
        ))}
      </div>

      {/* expand, save, and reset buttons */}
      <div className="flex space-x-4 py-1 [grid-row:1/1] [grid-column:2/span1] justify-self-end self-start">
        <button
          type="button"
          className="md:inline hidden"
          onClick={() => setIsExpand((prev) => !prev)}
        >
          {isExpand ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>
        <button
          type="button"
          title="save filter"
          className="text-text-primary"
          onClick={async () => {
            await saveFilters(selected);
            dispatch({ type: "FILTER_SAVE", payload: Array.from(selected) });
          }}
        >
          <Save className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setSelected(new Set<FilterKey>())}
          title="reset filter"
          className="text-[13px] text-text-primary"
        >
          <RefreshCw className="size-4" />
        </button>
      </div>
    </div>
  );
};

export default Filter;
