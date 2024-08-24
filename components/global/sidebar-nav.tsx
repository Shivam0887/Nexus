"use client";

import { usePathname, useRouter } from "next/navigation";
import { icons } from "@/lib/constants";
import { SignOutButton, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { LogOut } from "lucide-react";

const SidebaNav = ({ username }: { username: string }) => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="sm:flex hidden py-10 md:hover:w-44 w-16 rounded-r-2xl select-none overflow-hidden transition-all duration-300 h-full pl-4 flex-col justify-between items-center bg-neutral-900/50">
      <div className="w-full flex flex-col justify-center items-start gap-y-6">
        {icons.map(({ Icon, href, label }) => (
          <button key={label} onClick={() => router.push(href)}>
            <Icon selected={href === pathname} label={label} />
          </button>
        ))}
      </div>
      <div className="flex flex-col w-full gap-y-6 justify-center items-start">
        <div className="flex gap-x-5 items-center">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-[32px] h-[32px]",
              },
              baseTheme: dark,
            }}
          />
          <p className="text-sm capitalize">{username}</p>
        </div>
        <SignOutButton signOutOptions={{ redirectUrl: "/" }}>
          <button className="flex hover:text-btn-primary gap-x-5 items-center">
            <LogOut className="w-[30px] h-[30px]" />
            <p className="text-sm whitespace-nowrap">Sign out</p>
          </button>
        </SignOutButton>
      </div>
    </div>
  );
};

export default SidebaNav;