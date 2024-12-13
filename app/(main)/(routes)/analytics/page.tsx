import { getSearchCount, getSearchResultCount } from "@/actions/user.actions";
import GraphWrapper from "./_graph-wrapper";
import { auth } from "@clerk/nextjs/server";
import { decryptedUserData } from "@/actions/security.actions";

const Page = async () => {
  const { userId } = await auth();
  const hasSubscription = !!(
    await decryptedUserData(userId, ["hasSubscription"])
  )?.hasSubscription;

  const searchCount = await getSearchCount();
  const searchResultCount = await getSearchResultCount();

  return (
    <div className="h-full flex md:flex-row flex-col gap-3 p-4 overflow-y-auto">
      <GraphWrapper
        searchCount={searchCount}
        searchResultCount={searchResultCount}
        hasSubscription={hasSubscription}
      />
    </div>
  );
};

export default Page;
