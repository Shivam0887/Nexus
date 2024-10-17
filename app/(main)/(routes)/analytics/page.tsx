import React from "react";

const Page = () => {
  return (
    <div className="h-full flex md:flex-row flex-col gap-3 p-4 overflow-y-auto">
      <div className="h-full w-full shrink-0 md:w-[calc(66.67%-0.75rem)] space-y-3">
        {/* Graph */}
        <div className="h-2/3 rounded-xl bg-neutral-800 p-4">
          <h3 className="text-lg text">Graph</h3>
          <div></div>
        </div>

        {/* Stats */}
        <div className="h-[calc(33.33%-0.75rem)] flex md:flex-row flex-col gap-3">
          {/* Data overview */}
          <div className="h-full w-full md:w-[calc(66.67%-0.75rem)] rounded-xl bg-neutral-800 p-4">
            <h3 className="text-lg text">Data overview</h3>
            <div></div>
          </div>

          {/* Subscription */}
          <div className="h-full w-full md:w-1/3 rounded-xl bg-neutral-800 p-4">
            <h3 className="text-lg text">Subscription</h3>
            <div></div>
          </div>
        </div>
      </div>
      <div className="h-full w-full shrink-0 md:w-1/3 rounded-xl bg-neutral-800 p-4">
        <h3 className="text-lg text">History</h3>
        <div></div>
      </div>
    </div>
  );
};

export default Page;
