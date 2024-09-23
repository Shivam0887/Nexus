import SidebaNav from "@/components/global/sidebar-nav";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="h-full sm:block hidden">
        <SidebaNav direction="right" />
      </div>
      <div className="flex-1 h-full">{children}</div>
    </div>
  );
};

export default MainLayout;
