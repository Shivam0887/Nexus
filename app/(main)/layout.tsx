import SidebarNav from "@/components/global/sidebar-nav";
import ModalManager from "@/providers/modal-provider";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="h-full sm:block hidden">
        <SidebarNav direction="right" />
      </div>
      <div className="flex-1 h-full">
        <ModalManager />
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
