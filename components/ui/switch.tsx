import React, { useState } from "react";

type SwitchProps = {
  label: React.ReactNode;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
};

const Switch = ({ label, onValueChange, value, disabled }: SwitchProps) => {
  const [isChecked, setIsChecked] = useState(false);

  if (Number(value === undefined) ^ Number(onValueChange === undefined)) {
    throw new Error(
      "You must specify both 'value' and 'onValueChange', if you want controlled input."
    );
  }

  return (
    <div
      className={`relative ${
        disabled ? "bg-neutral-700" : "bg-neutral-800"
      } hover:bg-neutral-700 transition-colors flex gap-3 items-center py-2 cursor-pointer px-4 rounded-lg`}
    >
      {label}
      <div
        className={`relative flex items-center w-6 h-3.5 rounded-md bg-btn-secondary ${
          value ?? isChecked ? "bg-green-600" : "bg-red-600"
        }`}
      >
        <div
          className={`bg-white relative size-2 mx-[2px] transition-all duration-300 rounded-full ${
            value ?? isChecked
              ? "left-full -translate-x-[calc(100%+5px)]"
              : "left-0"
          } `}
        />
      </div>
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
  );
};

export default Switch;
