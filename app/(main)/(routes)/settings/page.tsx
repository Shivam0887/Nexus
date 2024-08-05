"use client";

import { plans } from "@/lib/constants";
import { useUser } from "@clerk/nextjs";
import { Crown, Dot, KeyRound, Loader2, UserRound } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import React, { useEffect, useState } from "react";

const CurPlan: "Starter" | "Professional" = "Professional";

const Page = () => {
  const { isLoaded, user } = useUser();
  const [data, setData] = useState({ username: "", email: "", imageUrl: "" });

  useEffect(() => {
    if (user) {
      setData({
        email: user.emailAddresses[0].emailAddress,
        imageUrl: user.imageUrl,
        username: user.username!,
      });
    }
  }, [user]);

  if (!isLoaded) {
    return (
      <div className="h-[calc(100%-2rem)] flex items-center justify-center">
        <div className="animate-spin">
          <Loader2 className="w-5 h-5 text-btn-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    notFound();
  }

  return (
    <div className="m-4 mb-0 h-[calc(100%-2rem)] rounded-2xl [scrollbar-width:none] overflow-auto bg-neutral-900 select-none">
      {/* Cover image */}
      <div className="relative h-[250px]">
        <div className="h-full relative [mask-image:linear-gradient(black_80%,transparent)] [mask-mode:alpha]">
          <Image
            src={"/temp/temp2.png"}
            fill
            priority
            alt="cover image"
            className="object-cover object-center rounded-t-2xl"
          />
        </div>

        <div className="relative -translate-y-3/4 flex gap-5 items-center mx-5">
          <div className="w-24 h-24 relative rounded-full shrink-0 border border-neutral-700">
            <Image
              src={data.imageUrl}
              fill
              quality={100}
              alt="profile image"
              className="rounded-full object-cover"
            />
          </div>
          <div className="space-y-2">
            <h2 className="sm:text-3xl text-2xl text capitalize">
              {data.username}
            </h2>
            <p className="text-xs text-neutral-500">{data.email}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-8 mb-4 mt-12 mx-5">
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

            <>
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
                        <button className="py-2 px-6 rounded-3xl bg-btn-secondary font-extrabold text-xs text-black">
                          {plan === "Professional" ? "Manage" : "Upgrade"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
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
                <KeyRound className="w-4 h-4 text-btn-primary" /> AI-Search
              </h2>
              <p className="text-[13px] text-btn-secondary">
                Enable AI-Search to perform context-based searching, allowing
                for more accurate and relevant results.
              </p>
              <button className="absolute bottom-0 right-0 rounded-3xl bg-btn-secondary px-4 py-2 text-xs font-bold text-black">
                Enable
              </button>
            </div>

            <div className="relative space-y-2 flex-1">
              <h2 className="[letter-spacing:1px] flex gap-2 items-center">
                <UserRound className="w-4 h-4 text-btn-primary" /> Search Filter
              </h2>
              <p className="text-[13px] text-btn-secondary">
                Manage your search filter settings to customize and refine your
                search results.
              </p>
              <button className="absolute bottom-0 right-0 rounded-3xl bg-btn-secondary px-4 py-2 text-xs font-bold text-black">
                Reset filters
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
              <button className="absolute bottom-0 right-0 rounded-3xl bg-btn-secondary px-4 py-2 text-xs font-bold text-black">
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
              <button className="absolute bottom-0 right-0 rounded-3xl bg-red-700 px-4 py-2 text-xs font-bold">
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
