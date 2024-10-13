"use client";

import z from "zod";
import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import useUser from "@/hooks/useUser";

const emailSchema = z.string().email("Please provide a valid email address.");

const GuestInvitation = ({
  setEmails,
  disabled,
}: {
  setEmails: React.Dispatch<React.SetStateAction<string[]>>;
  disabled: boolean;
}) => {
  const { user } = useUser();
  const [guestEmail, setGuestEmail] = useState<z.infer<typeof emailSchema>>("");
  const [invitationEmails, setInvitationEmails] = useState<Set<string>>(() =>
    new Set("").add(user.email)
  );

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setEmails(Array.from(invitationEmails));
  }, [setEmails, invitationEmails]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { success } = emailSchema.safeParse(e.target.value);
    setIsValid(success);
    setGuestEmail(e.target.value);
  };

  const validate = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "NumpadEnter") {
      e.preventDefault();
    }
  };

  return (
    <div className="relative space-y-2">
      <div className="relative">
        <input
          type="email"
          value={guestEmail}
          onChange={handleChange}
          onKeyDown={validate}
          name="guest_emails"
          placeholder="Add guests"
          disabled={disabled}
          className="bg-inherit w-full focus:bg-neutral-700 hover:bg-neutral-800 focus:outline-none focus:caret-[#1a73e8] focus:border-b-2 border-b-transparent focus:border-b-[#1a73e8] rounded-md p-2 duration-200 transition-colors text-sm"
        />
        {isValid && (
          <div className="flex gap-2 items-center absolute z-10 top-full translate-y-2 bg-neutral-800 w-full rounded-md p-2">
            <div className="relative size-7 pt-1 rounded-full">
              <Image
                src={
                  guestEmail === user.email
                    ? `${user.imageUrl}`
                    : "/test-account.png"
                }
                alt="profile photo"
                fill
                quality={100}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="rounded-full object-cover"
              />
            </div>
            <button
              disabled={disabled}
              type="button"
              className="text-sm text-start w-full"
              onClick={() => {
                setInvitationEmails((prev) => new Set(prev).add(guestEmail));
                setIsValid(false);
                setGuestEmail("");
              }}
            >
              {guestEmail}
            </button>
          </div>
        )}
      </div>

      {invitationEmails.size > 1 &&
        Array.from(invitationEmails).map((email, i) => (
          <div
            key={`guestEmail${i + 1}`}
            className="flex items-center group justify-between hover:bg-neutral-700 p-1 rounded-md"
          >
            <div className="flex items-center gap-2">
              <div className="relative size-7 rounded-full">
                <Image
                  src={
                    email === user.email
                      ? `${user.imageUrl}`
                      : "/test-account.png"
                  }
                  alt="profile photo"
                  fill
                  quality={100}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm">{email}</p>
                <p className="text-xs">
                  {email === user.email ? "organiser" : "guest"}
                </p>
              </div>
            </div>
            <div>
              {email !== user.email && (
                <button
                  type="button"
                  disabled={disabled}
                  className="group-hover:inline hidden"
                  style={{ justifySelf: "self-start" }}
                  onClick={() => {
                    const newSet = new Set(invitationEmails);
                    newSet.delete(email);
                    setInvitationEmails(newSet);
                  }}
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default GuestInvitation;
