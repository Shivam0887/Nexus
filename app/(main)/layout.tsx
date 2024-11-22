import SidebaNav from "@/components/global/sidebar-nav";
import ModalManager from "@/providers/modal-provider";
import DrawerManager from "@/providers/drawer-provider";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="h-full sm:block hidden">
        <SidebaNav direction="right" />
      </div>
      <div className="flex-1 h-full">
        <ModalManager />
        <DrawerManager />
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
