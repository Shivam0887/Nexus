"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TTooltipContainerProps = {
  side?: "left" | "right" | "top" | "bottom" | undefined;
  align?: "center" | "end" | "start" | undefined;
  trigger: React.ReactNode;
  content: React.ReactNode;
};

export function TooltipContainer({
  side,
  align,
  trigger,
  content,
}: TTooltipContainerProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild className="cursor-pointer">
          {trigger}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className="border-none bg-neutral-950"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
