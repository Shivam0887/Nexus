import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React, { useState } from "react";

type SwitchProps = {
  label: React.ReactNode;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  onContainerClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  icon?: LucideIcon;
  className?: string;
};

const Switch = ({
  label,
  onValueChange,
  value,
  disabled,
  onContainerClick,
  icon: Icon,
  className,
}: SwitchProps) => {
  const [isChecked, setIsChecked] = useState(false);

  if (Number(value === undefined) ^ Number(onValueChange === undefined)) {
    throw new Error(
      "You must specify both 'value' and 'onValueChange', if you want controlled input."
    );
  }

  return (
    <div
      role="button"
      onClick={onContainerClick}
      className={cn(
        "relative w-full hover:bg-neutral-700 transition-colors py-2 flex flex-col items-center cursor-pointer px-4 rounded-lg",
        className,
        disabled ? "bg-neutral-700" : "bg-neutral-800"
      )}
    >
      <div className="relative w-full flex justify-between gap-3 items-center">
        {label}
        <div
          className={`relative shrink-0 pl-[3px] pr-[1px] flex items-center w-6 h-3.5 rounded-md bg-btn-secondary ${
            value ?? isChecked ? "bg-[#ffe501]" : "bg-neutral-900"
          }`}
        >
          <div
            className={`relative size-2 transition-all duration-300 rounded-full ${
              value ?? isChecked
                ? "bg-neutral-900 left-full -translate-x-full"
                : "bg-neutral-400 left-0"
            } `}
          />
          <input
            type="checkbox"
            checked={value ?? isChecked}
            disabled={disabled}
            onChange={(e) => {
              const _value = e.currentTarget.checked;
              if (onValueChange) {
                onValueChange(_value);
              } else {
                setIsChecked(_value);
              }
            }}
            className="w-full h-full rounded-lg absolute top-0 opacity-0 z-10 cursor-pointer"
          />
        </div>
      </div>
      {Icon && (
        <Icon
          className="absolute -bottom-[1px] text-neutral-500 size-3"
          style={{ strokeWidth: "3" }}
        />
      )}
    </div>
  );
};

export default Switch;
