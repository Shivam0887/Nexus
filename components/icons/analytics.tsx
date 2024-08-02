import React from "react";

const Analytics = ({
  selected,
  label,
}: {
  selected: boolean;
  label: string;
}) => {
  return (
    <div className="flex gap-x-5 justify-center items-center h-11 w-full">
      <svg
        width="32"
        height="32"
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`relative z-10 stroke-2 ${
          selected ? "stroke-none" : "stroke-white"
        }`}
      >
        <path
          d="M1 15C1 8.40084 1 5.09979 3.04989 3.04989C5.09979 1 8.39937 1 15 1C21.5992 1 24.9002 1 26.9501 3.04989C29 5.09979 29 8.39937 29 15C29 21.5992 29 24.9002 26.9501 26.9501C24.9002 29 21.6006 29 15 29C8.40084 29 5.09979 29 3.04989 26.9501C1 24.9002 1 21.6006 1 15Z"
          className={`${selected ? "fill-sidenav-btn-primary" : ""}`}
        />
        <path
          d="M22.3658 23.8424V20.895M14.9974 23.8424V19.4213M7.62896 23.8424V16.4739M6.15527 7.63184C10.8666 12.4478 16.8159 13.6459 22.5736 12.0411M20.4323 9.8011L23.4888 11.2984C23.8513 11.4767 23.9485 11.8878 23.7069 12.2179L21.6688 15.0003"
          className={`${selected ? "stroke-sidenav-btn-secondary" : ""}`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className={`text-sm ${selected ? "text-btn-primary" : ""}`}>{label}</p>
    </div>
  );
};

export default Analytics;
