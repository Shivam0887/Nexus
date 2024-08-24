import SidebaNav from "@/components/global/sidebar-nav";
import { ConnectToDB } from "@/lib/utils";
import { User, UserType } from "@/models/user.model";
import { auth } from "@clerk/nextjs/server";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  await ConnectToDB();

  const { userId } = auth();
  const user = await User.findOne<UserType>({ userId });

  if (!user) throw new Error("Please sign-in to continue...");

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <SidebaNav username={user.username} />
      <div className="flex-1 h-full">{children}</div>
    </div>
  );
};

export default MainLayout;
