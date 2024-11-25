"use client";

import { useEffect, useRef } from "react";
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
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { sendOTP } from "@/actions/otp.actions";

const CurPlan: "Starter" | "Professional" = "Professional";

const Page = () => {
  const { user, dispatch } = useUser();
  const { user: clerkUser, isLoaded } = useClerkUser();
  const { modalDispatch } = useModalSelection();
  const router = useRouter();

  const prevAISearchPreferenceRef = useRef(false);

  useEffect(() => {
    if (isLoaded && clerkUser) {
      const { username, imageUrl } = clerkUser;
      dispatch({ type: "USERNAME_CHANGE", payload: username! });
      dispatch({ type: "PROFILE_IMAGE_CHANGE", payload: imageUrl });
    }
  }, [dispatch, isLoaded, clerkUser]);

  const handleClick = async () => {
    const response = await sendOTP();
    if (!response.success) {
      toast.error(response.error);
      return;
    }

    toast.success(response.data);
    router.replace("/reset-passkey");
  };

  return (
    <div className="sm:mx-4 mx-0 my-4 h-[calc(100%-2rem)] rounded-2xl [scrollbar-width:none] overflow-y-auto bg-neutral-900 select-none">
      <div className="min-h-[calc(100%-2rem)] flex flex-col justify-center [scrollbar-width:none] overflow-y-auto md:mt-0 mt-10">
        <div className="flex gap-5 items-center mx-5">
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
                <span className="inline-flex text-black font-bold text-xs py-1 pr-4 rounded-lg bg-btn-secondary items-center">
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
                          {features.map(
                            ({ available, content, icon: Icon }) => (
                              <div
                                key={content}
                                className={`flex gap-2 text-[13px] ${
                                  available
                                    ? "text-btn-secondary"
                                    : "text-gray-600"
                                }`}
                              >
                                <span>
                                  <Icon className="w-4 h-4" />
                                </span>
                                {content}
                              </div>
                            )
                          )}
                        </div>

                        <div className="flex flex-col items-center justify-between">
                          <p>${price} /month</p>
                          <button
                            type="button"
                            className="py-2 px-6 rounded-lg bg-btn-secondary font-extrabold text-xs text-black"
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
                    prevAISearchPreferenceRef.current = user.isAISearch;
                    dispatch({
                      type: "AI_SEARCH_CHANGE",
                      payload: !user.isAISearch,
                    });

                    const response = await AISearchPreference(!user.isAISearch);
                    if (!response.success) {
                      dispatch({
                        type: "AI_SEARCH_CHANGE",
                        payload: prevAISearchPreferenceRef.current,
                      });
                      toast.error(response.error);
                      return;
                    }
                    toast.success(response.data);
                  }}
                  type="button"
                  className="absolute bottom-0 right-0 rounded-lg bg-btn-secondary px-4 py-2 text-xs font-bold text-black"
                >
                  {user.isAISearch ? "Disable" : "Enable"}
                </button>
              </div>

              <div className="relative space-y-2 flex-1">
                <h2 className="[letter-spacing:1px] flex gap-2 items-center">
                  <ScanSearch className="w-4 h-4 text-btn-primary" /> Visual
                  Search
                </h2>
                <p className="text-[13px] text-btn-secondary">
                  Integrate advanced image recognition technology to enable
                  users to upload photos for searching, enhances user
                  experience.
                </p>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 rounded-lg bg-btn-secondary px-4 py-2 text-xs font-bold text-black"
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
              <div className="flex-1 gap-2 grid grid-rows-[auto_auto_auto] grid-cols-2">
                <h2
                  className="flex gap-2 items-center"
                  style={{ gridColumn: "1/span2" }}
                >
                  <KeyRound className="w-4 h-4 text-btn-primary" /> Reset
                  Passkey
                </h2>
                <p
                  className="text-[13px] text-btn-secondary"
                  style={{ gridColumn: "1/span2" }}
                >
                  Uh-oh! Looks like your passkey has gone on a vacation without
                  telling you. Time to send it a {"'reset passkey'"} postcard!
                  This should do the trick and bring it back home!
                </p>
                <button
                  style={{ gridColumn: "2/span1" }}
                  onClick={handleClick}
                  type="button"
                  className={cn(
                    "rounded-lg bg-btn-secondary max-w-max px-4 py-2 text-xs font-bold text-black justify-self-end",
                    !user.hasPasskey && "cursor-not-allowed bg-neutral-400"
                  )}
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
                  className="absolute bottom-0 right-0 rounded-lg bg-red-700 px-4 py-2 text-xs font-bold"
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
