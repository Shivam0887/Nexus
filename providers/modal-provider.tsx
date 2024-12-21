"use client";

import CalendarModal from "@/components/modals/calendar.modal";
import FullScreenModal from "@/components/modals/full-screen.modal";
import AccountDeletionModal from "@/components/modals/account-deletion.modal";
import SecurityModal from "@/components/modals/security-modal";
import { useEffect, useState } from "react";
import CancelSubscriptionModal from "@/components/modals/cancel-subscription.modal";

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
      <CancelSubscriptionModal />
    </div>
  );
};

export default ModalProvider;
