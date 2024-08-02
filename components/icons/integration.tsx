import React from "react";

const Integration = ({
  selected,
  label,
}: {
  selected: boolean;
  label: string;
}) => {
  return (
    <div className="flex gap-x-5 justify-center items-center h-11 w-full">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="-4 -4 32 32"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`lucide lucide-cable relative z-10  ${
          selected ? "stroke-sidenav-btn-secondary" : "stroke-white"
        }`}
      >
        <rect
          x="-2"
          y="-2"
          width="28"
          height="28"
          className={`  ${
            selected
              ? "fill-sidenav-btn-primary stroke-sidenav-btn-primary"
              : "fill-none stroke-white"
          }`}
          rx="6"
          ry="6"
        ></rect>
        <path d="M17 21v-2a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1" />
        <path d="M19 15V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V9" />
        <path d="M21 21v-2h-4" />
        <path d="M3 5h4V3" />
        <path d="M7 5a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1V3" />
      </svg>
      <p className={`text-sm ${selected ? "text-btn-primary" : ""}`}>{label}</p>
    </div>
  );
};

export default Integration;
