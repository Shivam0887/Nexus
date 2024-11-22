"use client";

import { useEffect } from "react";
import useUser from "@/hooks/useUser";
import { plans } from "@/lib/constants";
import {
  Crown,
  Dot,
  KeyRound,
  ScanSearch,
  Sparkles,
  UserRound,
} from "lucide-react";

import Image from "next/image";
import { useUser as useClerkUser } from "@clerk/nextjs";
import { AISearchPreference } from "@/actions/user.actions";
import { toast } from "sonner";
import { useModalSelection } from "@/hooks/useModalSelection";

const CurPlan: "Starter" | "Professional" = "Professional";

const Page = () => {
  const { user, dispatch } = useUser();
  const { user: clerkUser, isLoaded } = useClerkUser();
  const { modalDispatch } = useModalSelection();

  useEffect(() => {
    if (isLoaded && clerkUser) {
      const { username, imageUrl } = clerkUser;
      dispatch({ type: "USERNAME_CHANGE", payload: username! });
      dispatch({ type: "PROFILE_IMAGE_CHANGE", payload: imageUrl });
    }
  }, [dispatch, isLoaded, clerkUser]);

  return (
    <div className="sm:mx-4 mx-0 my-4 h-[calc(100%-2rem)] rounded-2xl [scrollbar-width:none] overflow-auto bg-neutral-900 select-none">
      {/* Cover image */}
      <div className="relative h-[250px]">
        <div className="h-full relative [mask-image:linear-gradient(black_80%,transparent)]">
          <Image
            src={"/settings.jpg"}
            fill
            priority
            quality={100}
            alt="cover image"
            className="object-cover object-center rounded-t-2xl opacity-80"
          />
        </div>

        <div className="relative -translate-y-3/4 flex gap-5 items-center mx-5">
          <div className="w-24 h-24 relative rounded-full shrink-0 border border-neutral-700">
            <Image
              src={user.imageUrl}
              fill
              quality={100}
              alt="profile image"
              className="rounded-full object-cover"
            />
          </div>
          <div className="space-y-2">
            <h2 className="sm:text-3xl text-2xl capitalize">{user.username}</h2>
            <p className="text-xs text-neutral-500">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-8 my-12 mx-5">
        {/* Subscription Plans */}
        <div className="space-y-4 h-[300px] md:w-96 w-full shrink-0 flex flex-col">
          <h1 className="text-xl font-bold whitespace-nowrap text-btn-secondary">
            Subscription Plans
          </h1>
          <div className="flex-1 relative rounded-2xl bg-secondary shadow-[0px_0px_5px_5px_rgb(27,27,27)] flex flex-col justify-between p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 [letter-spacing:1px]">
                <Crown className="w-4 h-4 text-btn-primary" />
                Professional
              </div>
              <span className="inline-flex text-black font-bold text-xs py-1 pr-4 rounded-3xl bg-btn-secondary items-center">
                <Dot />
                Current Plan
              </span>
            </div>

            <div>
              {plans.map(({ features, plan, price }) => (
                <div key={plan}>
                  {plan === CurPlan && (
                    <div className="flex justify-between">
                      <div className="flex flex-col gap-2 max-w-96">
                        {features.map(({ available, content, icon: Icon }) => (
                          <div
                            key={content}
                            className={`flex gap-2 text-[13px] ${
                              available ? "text-btn-secondary" : "text-gray-600"
                            }`}
                          >
                            <span>
                              <Icon className="w-4 h-4" />
                            </span>
                            {content}
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col items-center justify-between">
                        <p>${price} /month</p>
                        <button
                          type="button"
                          className="py-2 px-6 rounded-3xl bg-btn-secondary font-extrabold text-xs text-black"
                        >
                          {plan === "Professional" ? "Manage" : "Upgrade"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search Settings */}
        <div className="space-y-4 h-[300px] md:w-96 w-full shrink-0 flex flex-col">
          <h1 className="text-xl font-bold whitespace-nowrap text-btn-secondary">
            Search Settings
          </h1>
          <div className="flex flex-col flex-1 p-4 relative rounded-2xl bg-secondary shadow-[0px_0px_5px_5px_rgb(27,27,27)]">
            <div className="space-y-2 relative flex-1">
              <h2 className="[letter-spacing:1px] flex gap-2 items-center">
                <Sparkles className="w-4 h-4 text-btn-primary" /> AI-Search
              </h2>
              <p className="text-[13px] text-btn-secondary">
                Enable AI-Search to perform context-based searching, allowing
                for more accurate and relevant results.
              </p>
              <button
                onClick={async () => {
                  const response = await AISearchPreference(true);
                  if (!response.success) {
                    toast.error(response.error);
                    return;
                  }
                  toast.success(response.data);
                }}
                type="button"
                className="absolute bottom-0 right-0 rounded-3xl bg-btn-secondary px-4 py-2 text-xs font-bold text-black"
              >
                Enable
              </button>
            </div>

            <div className="relative space-y-2 flex-1">
              <h2 className="[letter-spacing:1px] flex gap-2 items-center">
                <ScanSearch className="w-4 h-4 text-btn-primary" /> Visual
                Search
              </h2>
              <p className="text-[13px] text-btn-secondary">
                Integrate advanced image recognition technology to enable users
                to upload photos for searching, enhances user experience.
              </p>
              <button
                type="button"
                className="absolute bottom-0 right-0 rounded-3xl bg-btn-secondary px-4 py-2 text-xs font-bold text-black"
              >
                Coming soon
              </button>
            </div>
          </div>
        </div>

        {/* Account Settings */}

        <div className="space-y-4 h-[300px] md:w-96 w-full shrink-0 flex flex-col">
          <h1 className="text-xl font-bold whitespace-nowrap text-btn-secondary">
            Account Settings
          </h1>
          <div className="flex flex-col flex-1 p-4 relative rounded-2xl bg-secondary shadow-[0px_0px_5px_5px_rgb(27,27,27)]">
            <div className="space-y-2 relative flex-1">
              <h2 className="[letter-spacing:1px] flex gap-2 items-center">
                <KeyRound className="w-4 h-4 text-btn-primary" /> Integration
                Passkey
              </h2>
              <p className="text-[13px] text-btn-secondary">
                A Passkey is a security key that protects malicious users from
                integrating your apps.
              </p>
              <button
                type="button"
                className="absolute bottom-0 right-0 rounded-3xl bg-btn-secondary px-4 py-2 text-xs font-bold text-black"
              >
                Reset passkey
              </button>
            </div>

            <div className="relative space-y-2 flex-1">
              <h2 className="[letter-spacing:1px] flex gap-2 items-center">
                <UserRound className="w-4 h-4 text-btn-primary" /> Account
              </h2>
              <p className="text-[13px] text-btn-secondary">
                Be careful, if you delete your account, you won&apos;t be able
                to access anything.
              </p>
              <button
                onClick={() => {
                  modalDispatch({
                    type: "onOpen",
                    payload: "AccountDelete",
                    data: { type: "AccountDelete" },
                  });
                }}
                type="button"
                className="absolute bottom-0 right-0 rounded-3xl bg-red-700 px-4 py-2 text-xs font-bold"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
