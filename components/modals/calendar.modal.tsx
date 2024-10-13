"use client";

import { useModalSelection } from "@/hooks/useModalSelection";
import { useRef, useState } from "react";
import { Inter } from "next/font/google";
import { CirclePlus, Clock4, Loader2, Text, Users } from "lucide-react";

import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { toast } from "sonner";
import GuestInvitation from "../guest-invitation";
import { createCalender } from "@/actions/calendar.actions";
import TimeZone from "../ui/timezone";
import { FilterKey } from "@/lib/types";
import useUser from "@/hooks/useUser";

const inter = Inter({ subsets: ["latin"] });

const CalendarModal = () => {
  const { modalDispatch, modalState } = useModalSelection();
  const [emails, setEmails] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { dispatch } = useUser();

  const formRef = useRef<HTMLFormElement>(null);

  const isModalOpen = modalState.isOpen && modalState.type === "CalendarModal";

  const validate = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "NumpadEnter") {
      e.preventDefault();
    }
  };

  const handleFormAction = async (formData: FormData) => {
    const guestEmails = emails.join(" ");
    formData.set("guest_emails", guestEmails);

    const response = await createCalender(formData);
    if (response.success) {
      toast.success(response.data);
    } else {
      toast.error(response.error);
      if (response.error.split("-")[0] === "RE_AUTHENTICATE") {
        const platform = response.error.split("-")[1] as FilterKey;
        dispatch({ type: "CONNECTION", connectionType: platform, payload: 2 });
      }
    }

    formRef.current?.reset();
    modalDispatch({ type: "onClose" });
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={() => {
        modalDispatch({ type: "onClose" });
      }}
    >
      <DialogContent
        className={`max-w-fit h-fit pb-4 px-4 text-btn-secondary ${inter.className}`}
      >
        <form
          ref={formRef}
          action={handleFormAction}
          className="w-full flex flex-col gap-5"
        >
          <div className="flex gap-3 items-center">
            <div className="size-5" />
            <div className="w-full space-y-3 pl-2">
              <input
                type="text"
                className="w-full focus:outline-none focus:caret-[#1a73e8] bg-inherit text-2xl border-b-2 transition-colors duration-200 focus:border-b-[#1a73e8] border-b-neutral-400/75"
                placeholder="Add title"
                name="title"
                autoFocus
                onKeyDown={validate}
                disabled={isSubmitting}
                required
              />

              <div
                className="text-[#1a73e8] bg-[#e8f0fd]
                  p-2 rounded-md test-sm font-medium max-w-max"
              >
                Event
              </div>
            </div>
          </div>

          {/* Date picker */}
          <div className="flex gap-3 items-start">
            <span className="py-2">
              <Clock4 className="size-5" />
            </span>
            <div className="flex-1 space-y-2">
              <DatePicker
                disabled={isSubmitting}
                setDisabled={setIsSubmitting}
              />
              <TimeZone />
            </div>
          </div>

          {/* Add Guests */}
          <div className="flex gap-3 items-start">
            <span className="py-2">
              <Users className="size-5" />
            </span>
            <div className="flex-1">
              <GuestInvitation disabled={isSubmitting} setEmails={setEmails} />
            </div>
          </div>

          {/* Add description */}
          <div className="flex gap-3 items-start">
            <span className="py-2">
              <Text className="size-5" />
            </span>
            <div className="flex-1">
              <input
                type="text"
                name="description"
                disabled={isSubmitting}
                onKeyDown={validate}
                placeholder="Add description"
                className="bg-inherit w-full focus:bg-neutral-700 hover:bg-neutral-800 focus:outline-none focus:caret-[#1a73e8] focus:border-b-2 border-b-transparent focus:border-b-[#1a73e8] rounded-md p-2 duration-200 transition-colors text-sm"
              />
            </div>
          </div>

          <button
            disabled={isSubmitting}
            type="submit"
            className="self-start flex items-center text-sm gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 transition-colors rounded-lg"
          >
            <CirclePlus className="size-4" />
            Create
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarModal;
