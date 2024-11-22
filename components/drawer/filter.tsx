"use client";

import { Drawer, DrawerContent } from "../ui/drawer";
import Filter from "../ui/filter";
import { useDrawerSelection } from "@/hooks/useDrawerSelection";

const FilterDrawer = () => {
  const { drawerState } = useDrawerSelection();

  if (drawerState.data?.type !== "FilterResult") return;

  const {
    documents,
    filter,
    isLoading,
    setFilter,
    setFilteredDocuments,
    setIsLoading,
  } = drawerState.data.data;

  const isOpen = drawerState.isOpen && drawerState.type === "FilterResult";

  return (
    <Drawer open={isOpen} onOpenChange={() => {}} drawerDirection="bottom">
      <DrawerContent containerClassName="pt-10 px-2 flex items-center">
        <Filter
          className="h-max"
          controlledHeight={true}
          documents={documents}
          setFilteredDocuments={setFilteredDocuments}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          filter={filter}
          setFilter={setFilter}
        />
      </DrawerContent>
    </Drawer>
  );
};

export default FilterDrawer;
