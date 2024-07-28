"use client";

import { FAQ } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState } from "react";

const Accordion = ({ faqs }: { faqs: FAQ[] }) => {
  const [cardNum, setCardNum] = useState(new Set<Number>());

  const handleClick = (i: number) => {
    if (cardNum.has(i)) {
      setCardNum((prev) => {
        const cur = new Set(prev);
        cur.delete(i);
        return cur;
      });
    } else {
      setCardNum((prev) => {
        const cur = new Set(prev);
        cur.add(i);
        return cur;
      });
    }
  };

  return (
    <div className="flex flex-col gap-10 lg:w-[896px] sm:w-[576px] w-full">
      {faqs.map(({ desc, title }, i) => (
        <div
          key={title}
          className={cn(
            "bg-neutral-900 py-4 sm:px-10 px-6 flex flex-col justify-start space-y-2 text-neutral-300 rounded-3xl",
            cardNum.has(i) && "bg-neutral-950"
          )}
        >
          <button
            type="button"
            className="w-full flex justify-between text-left"
            onClick={() => handleClick(i)}
          >
            {title}
            {cardNum.has(i) ? <ChevronUp /> : <ChevronDown />}
          </button>
          <p className={`${cardNum.has(i) ? "block" : " hidden"}`}>{desc}</p>
        </div>
      ))}
    </div>
  );
};

export default Accordion;
