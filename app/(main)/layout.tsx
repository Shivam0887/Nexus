import { getUser } from "@/actions/user.actions";
import SidebaNav from "@/components/global/sidebar-nav";
import { UserProvider } from "@/hooks/useUser";
import { StateType } from "@/lib/types";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getUser();

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
