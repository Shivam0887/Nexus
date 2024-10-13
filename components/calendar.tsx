"use client";

import { useModalSelection } from "@/hooks/useModalSelection";
import useUser from "@/hooks/useUser";
import { CirclePlus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const Calendar = () => {
  const { modalDispatch } = useModalSelection();
  const { user } = useUser();

  return (
    <button
      type="button"
      onClick={() => {
        if (user.GOOGLE_CALENDAR === 1) {
          modalDispatch({
            type: "onOpen",
            payload: "CalendarModal",
            data: { data: {}, type: "CalendarModal" },
          });
        } else {
          toast.warning(
            <div className="flex flex-col gap-1">
              Please connect to your Google Calendar account
              <Link
                className="p-2 rounded-md bg-primary max-w-fit"
                href="https://qflbv4c3-3000.inc1.devtunnels.ms/integrations#google_calendar"
              >
                Go to integrations
              </Link>
            </div>
          );
        }
      }}
      className="text-[13px] text-text-primary bg-neutral-800 max-w-max py-2 px-4 flex items-center gap-2 rounded-lg"
    >
      <span>
        <CirclePlus className="size-4 stroke-neutral-800 fill-text-primary" />
      </span>
      <p>Calendar</p>
    </button>
  );
};

export default Calendar;
