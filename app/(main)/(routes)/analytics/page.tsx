import { getSearchCount, getSearchResultCount } from "@/actions/user.actions";
import GraphWrapper from "./_graph-wrapper";

const Page = async () => {
  const searchCount = await getSearchCount();
  const searchResultCount = await getSearchResultCount();

  return (
    <div className="h-full flex md:flex-row flex-col gap-3 p-4 overflow-y-auto">
      <GraphWrapper
        searchCount={searchCount}
        searchResultCount={searchResultCount}
      />
    </div>
  );
};

export default Page;
