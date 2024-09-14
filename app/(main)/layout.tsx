import SidebaNav from "@/components/global/sidebar-nav";
import { UserProvider } from "@/hooks/useUser";
import { FilterKey, StateType } from "@/lib/types";
import { ConnectToDB } from "@/lib/utils";
import { User, UserType } from "@/models/user.model";
import { auth } from "@clerk/nextjs/server";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthenticated user");
  }

  await ConnectToDB();
  const user = await User.findOne<UserType>({ userId });

  if (!user) throw new Error("Please sign-in to continue...");

  const userData: StateType = {
    coverImage: "",
    email: user.email,
    hasPasskey: user.hasPasskey,
    hasSubscription: false,
    imageUrl: user.imageUrl,
    isAISearch: false,
    plan: "Starter",
    shouldRemember: user.shouldRemember,
    username: user.username,
    filter: user.filter as FilterKey[],
    isFilterApplied: user.isFilterApplied,
    isDiscordConnected: !!user?.discord?.accessToken,
    isGitHubConnected: !!user?.gitHub?.accessToken,
    isGmailConnected: !!user?.gmail?.accessToken,
    isGoogleCalendarConnected: !!user?.google_calendar?.accessToken,
    isGoogleDocsConnected: !!user?.google_docs?.accessToken,
    isGoogleDriveConnected: !!user?.google_drive?.accessToken,
    isNotionConnected: !!user?.notion?.accessToken,
    isOneDriveConnected: !!user?.oneDrive?.accessToken,
    isSlackConnected: !!user?.slack?.accessToken,
    isTeamsConnected: !!user?.teams?.accessToken,
  };

  return (
    <UserProvider userData={userData}>
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="h-full sm:block hidden">
          <SidebaNav username={userData.username} />
        </div>
        <div className="flex-1 h-full">{children}</div>
      </div>
    </UserProvider>
  );
};

export default MainLayout;
