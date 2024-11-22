"use client";

import CalendarModal from "@/components/modals/calendar.modal";
import FullScreenModal from "@/components/modals/full-screen.modal";
import AccountDeletionModal from "@/components/modals/account-deletion.modal";
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
      <AccountDeletionModal />
      <CalendarModal />
      <SecurityModal />
    </div>
  );
};

export default ModalProvider;
