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
    setFilter,
    setFilteredDocuments,
    isSubmitting,
    setIsSubmitting,
  } = drawerState.data.data;

  const isOpen = drawerState.isOpen && drawerState.type === "FilterResult";

  return (
    <Drawer open={isOpen} onOpenChange={() => {}} drawerDirection="bottom">
      <DrawerContent containerClassName="pt-10 px-2 flex items-center">
        <Filter
          className="h-max"
          documents={documents}
          setFilteredDocuments={setFilteredDocuments}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          filter={filter}
          setFilter={setFilter}
        />
      </DrawerContent>
    </Drawer>
  );
};

export default FilterDrawer;
