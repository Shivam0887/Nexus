"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { DocumentType, FilterKey } from "@/lib/types";
import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, RefreshCw, X } from "lucide-react";

type TFilter = {
  key: Omit<FilterKey, "GOOGLE_CALENDAR">;
  logo: string;
  isSelected: boolean;
};

type TFilterProps = {
  className?: string;
  controlledHeight?: boolean;
  documents: DocumentType[];
  isLoading: boolean;
  filter: TFilter[];
  setFilter: React.Dispatch<React.SetStateAction<TFilter[]>>;
  setFilteredDocuments: React.Dispatch<React.SetStateAction<DocumentType[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const Filter = ({
  className,
  controlledHeight = false,
  documents,
  isLoading,
  filter,
  setFilter,
  setFilteredDocuments,
  setIsLoading,
}: TFilterProps) => {
  const [isExpand, setIsExpand] = useState(false);

  const filterKeyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const div = filterKeyRef.current;

    if (div && !controlledHeight) {
      div.style.height = isExpand ? `${div.scrollHeight}px` : "28px";
    }
  }, [isExpand, controlledHeight]);

  const handleClick = (key: Omit<FilterKey, "GOOGLE_CALENDAR">) => {
    setIsLoading(true);

    setTimeout(() => {
      for (let i = 0; i < filter.length; i++) {
        if (filter[i].key === key) {
          filter[i].isSelected = !filter[i].isSelected;
        }
      }

      const uniqueKey = new Map(
        filter.map(({ key, isSelected }) => [key, isSelected])
      );

      const filteredDocuments = documents.filter((doc) =>
        uniqueKey.get(doc.key)
      );

      setFilteredDocuments(
        filteredDocuments.length === 0 ? documents : filteredDocuments
      );
      setFilter([...filter]);
      setIsLoading(false);
    }, 0);
  };

  return (
    <div className="rounded-lg bg-neutral-800 grid gap-3 items-center grid-cols-[auto_1fr_auto] max-w-[756px] w-full py-2 px-4">
      <p className="text-[13px] text-text-primary tracking-wide">Filter by: </p>

      <div
        ref={filterKeyRef}
        className={cn(
          "h-7 transition-all duration-300 overflow-hidden w-full flex-1 flex flex-wrap items-center gap-2 md:[grid-column:2/3] md:[grid-row:1/span1] [grid-row:2/span1] [grid-column:1/3]",
          className
        )}
      >
        {filter.map(({ key, logo, isSelected }, i) => (
          <button
            disabled={isLoading}
            type="button"
            key={`${key.toString()}_key`}
            onClick={() => handleClick(key)}
            className="flex items-center gap-2 text-xs bg-neutral-900 text-text-primary text-black py-1 px-4 rounded-lg font-semibold"
          >
            <div className="flex items-center gap-2">
              <div className="relative h-5 w-5">
                <Image src={logo} alt={`${key.toString()}_logo`} fill />
              </div>
              <p className="line-clamp-1 text-left capitalize">
                {key.replace("_", " ").toLowerCase()}
              </p>
            </div>

            {isSelected && <X className="size-3" />}
          </button>
        ))}
      </div>

      {/* expand, save */}
      <div className="flex gap-4 items-center [grid-row:1/1] md:[grid-column:3/span1] [grid-column:2/span1]">
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
          onClick={() => {
            const resetFilter = filter.map(({ isSelected, ...rest }) => ({
              ...rest,
              isSelected: false,
            }));

            setFilteredDocuments(documents);
            setFilter(resetFilter);
          }}
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
