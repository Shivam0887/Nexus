"use client";

import CalendarModal from "@/components/modals/calendar.modal";
import FullScreenModal from "@/components/modals/full-screen.modal";
import DataCollectionModal from "@/components/modals/data-collection.modal";

const ModalProvider = () => {
  return (
    <div>
      <FullScreenModal />
      <DataCollectionModal />
      <CalendarModal />
    </div>
  );
};

export default ModalProvider;
