"use client";

import { SortBy } from "@/lib/constants";

import {
  getTime,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
} from "date-fns";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DocumentType, TSortBy } from "@/lib/types";
import React, { useState } from "react";

type TSortingProps = {
  filteredDocuments: DocumentType[];
  setFilteredDocuments: React.Dispatch<React.SetStateAction<DocumentType[]>>;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
};

type TOrder = "ascending" | "descending";

const Sorting = ({
  filteredDocuments,
  setFilteredDocuments,
  isSubmitting,
  setIsSubmitting
}: TSortingProps) => {
  const [order, setOrder] = useState<TOrder>("ascending");
  const [sortBy, setSortBy] = useState<TSortBy>("");

  const sortDocuments = (_order: TOrder, sortBy: TSortBy) => {
    setIsSubmitting(true);

    setTimeout(() => {
      const curDate = new Date().toISOString();
      const sortedDocuments = filteredDocuments.sort((a, b) => {
        switch (sortBy) {
          case "date":
            const date_a = getTime(a.date),
              date_b = getTime(b.date);
            return _order === "descending" ? date_a - date_b : date_b - date_a;
          case "last hour":
            const hour_a = differenceInHours(curDate, a.date),
              hour_b = differenceInHours(curDate, b.date);
            return _order === "descending" ? hour_a - hour_b : hour_b - hour_a;
          case "last day":
            const day_a = differenceInDays(curDate, a.date),
              day_b = differenceInDays(curDate, b.date);
            return _order === "descending" ? day_a - day_b : day_b - day_a;
          default:
            const week_a = differenceInWeeks(curDate, a.date),
              week_b = differenceInWeeks(curDate, b.date);
            return _order === "descending" ? week_a - week_b : week_b - week_a;
        }
      });

      setIsSubmitting(false);
      setFilteredDocuments(sortedDocuments);
    }, 0);
  };

  const handleSortValueChange = (value: string) => {
    const _sortBy = value as TSortBy;

    sortDocuments(order, _sortBy);
    setSortBy(_sortBy);
  };

  const handleOrderValueChange = (value: string) => {
    const _order = value as TOrder;

    sortDocuments(_order, sortBy);
    setOrder(_order);
  };

  return (
    <Select
      disabled={isSubmitting}
      value={sortBy}
      onValueChange={handleSortValueChange}
    >
      <SelectTrigger className="focus:ring-offset-0 focus:ring-0 text-sm border-none bg-neutral-800">
        <SelectValue className="text-xs" placeholder="sort by" />
      </SelectTrigger>
      <SelectContent className="text-xs bg-neutral-950 text-text-primary border-none">
        {SortBy.map((item) => (
          <SelectItem
            key={item}
            value={item}
            className="text-[13px] cursor-pointer"
          >
            {item}
          </SelectItem>
        ))}

        <div className="mt-1">
          <RadioGroup
            disabled={isSubmitting}
            className="ml-2"
            value={order}
            onValueChange={handleOrderValueChange}
          >
            {["ascending", "descending"].map((item) => (
              <div key={item} className="flex items-center space-x-2.5">
                <RadioGroupItem
                  value={item}
                  id={item}
                  className="fill-white stroke-neutral-500"
                />
                <label htmlFor={item} className="text-[13px]">
                  {item}
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </SelectContent>
    </Select>
  );
};

export default Sorting;
