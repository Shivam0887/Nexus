import SearchHistory from "@/components/search-history";
import UsageGraph from "@/components/graphs/usage-graph";
import SearchGraph from "@/components/graphs/search-graph";
import IntegrationGraph from "@/components/graphs/integration-graph";
import SearchResultGraph from "@/components/graphs/search-result-graph";

import { getSearchCount, getSearchResultCount } from "@/actions/user.actions";

const Page = async () => {
  const searchCount = await getSearchCount();
  const searchResultCount = await getSearchResultCount();

  return (
    <div className="h-full flex md:flex-row flex-col gap-3 p-4 overflow-y-auto">
      <div className="min-h-full md:h-full w-full overflow-y-auto shrink-0 md:w-[calc(66.67%-0.75rem)] space-y-3 scroll-none">
        {/* Graph */}
        <div className="w-full h-full grid lg:grid-cols-[1fr_1fr] lg:grid-rows-[1fr_1fr] grid-rows-4 gap-4">
          <SearchGraph searchCount={searchCount} />
          <SearchResultGraph searchResultCount={searchResultCount} />
          <UsageGraph />
          <IntegrationGraph />
        </div>
      </div>
      <div className="h-full w-full shrink-0 md:w-1/3 flex flex-col rounded-xl bg-neutral-900 p-4">
        <h3 className="text-lg text">History</h3>
        <SearchHistory />
      </div>
    </div>
  );
};

export default Page;
