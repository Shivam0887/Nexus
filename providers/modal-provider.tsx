"use client";

import CalendarModal from "@/components/modals/calendar.modal";
import FullScreenModal from "@/components/modals/full-screen.modal";
import DataCollectionModal from "@/components/modals/data-collection.modal";
import SecurityModal from "@/components/modals/security-modal";
import { useEffect, useState } from "react";

const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <></>;
  return (
    <div>
      <FullScreenModal />
      <DataCollectionModal />
      <CalendarModal />
      <SecurityModal />
    </div>
  );
};

export default ModalProvider;
