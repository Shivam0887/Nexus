import React from "react";

const Search = ({ selected, label }: { selected: boolean; label: string }) => {
  return (
    <div className="flex gap-x-5 justify-center items-center h-11 w-full">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 28 28"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`lucide lucide-search relative z-10 ${
          selected
            ? "fill-sidenav-btn-secondary stroke-sidenav-btn-primary"
            : "fill-none stroke-white"
        }`}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M 21 21 l -4.3 -4.3" />
      </svg>
      <p className={`text-sm ${selected ? "text-btn-primary" : ""}`}>{label}</p>
    </div>
  );
};

export default Search;
