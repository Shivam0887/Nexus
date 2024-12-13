"use client";

import SearchHistory from "@/components/search-history";
import UsageGraph from "@/components/graphs/usage-graph";
import SearchGraph from "@/components/graphs/search-graph";
import IntegrationGraph from "@/components/graphs/integration-graph";
import SearchResultGraph from "@/components/graphs/search-result-graph";

import { useRouter } from "next/navigation";
import { TActionResponse, TSearchCount, TSearchResult } from "@/lib/types";

type GraphWrapperProps = {
  searchCount: TActionResponse<
    ({
      date: string;
    } & TSearchCount)[]
  >;
  searchResultCount: TActionResponse<TSearchResult>;
  hasSubscription: boolean;
};

const GraphWrapper = ({
  searchCount,
  searchResultCount,
  hasSubscription,
}: GraphWrapperProps) => {
  const router = useRouter();

  return (
    <div className="h-full w-full relative">
      <div
        className={`h-full w-full flex md:flex-row flex-col gap-3 p-4 overflow-y-auto ${
          hasSubscription ? "" : "pointer-events-none"
        }`}
      >
        <div className="min-h-full md:h-full w-full overflow-y-auto shrink-0 md:w-[calc(66.67%-0.75rem)] space-y-3 scroll-none">
          {/* Graph */}
          <div className="w-full h-full grid lg:grid-cols-[1fr_1fr] lg:grid-rows-[1fr_1fr] grid-rows-4 gap-4">
            <SearchGraph
              searchCount={searchCount}
              hasSubscription={hasSubscription}
            />
            <SearchResultGraph
              searchResultCount={searchResultCount}
              hasSubscription={hasSubscription}
            />
            <UsageGraph hasSubscription={hasSubscription} />
            <IntegrationGraph hasSubscription={hasSubscription} />
          </div>
        </div>
        <div className="h-full w-full shrink-0 md:w-1/3 flex flex-col rounded-xl bg-neutral-900 p-4">
          <h3 className="text-lg text">History</h3>
          <SearchHistory hasSubscription={hasSubscription} />
        </div>
      </div>

      <div
        className="hidden absolute inset-0 rounded-xl justify-center items-center"
        style={{
          display: hasSubscription ? "none" : "flex",
          backdropFilter: hasSubscription ? "blur(0px)" : "blur(8px)",
        }}
      >
        <button
          type="button"
          className="bg-neutral-950 rounded-lg px-4 py-2 text-sm shadow-lg"
          onClick={() => router.push("/settings?plan=Professional&tab=billing")}
        >
          To continue subscribe to the Pro Plan
        </button>
      </div>
    </div>
  );
};

export default GraphWrapper;
