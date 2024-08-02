import SidebaNav from "@/components/global/sidebar-nav";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex md:h-[calc(100vh-77px)] h-[calc(100vh-73px)]">
      <SidebaNav />
      <div className="flex-1 h-full">{children}</div>
    </div>
  );
};

export default MainLayout;
