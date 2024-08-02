"use client";

import { usePathname, useRouter } from "next/navigation";
import { icons } from "@/lib/constants";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const SidebaNav = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="py-10 md:hover:w-40 w-16 overflow-hidden transition-all duration-300 h-full pl-4 flex flex-col justify-between items-center bg-neutral-900/50">
      <div className="w-full flex flex-col justify-center items-start gap-y-8">
        {icons.map(({ Icon, href, label }) => (
          <button key={label} onClick={() => router.push(href)}>
            <Icon selected={href === pathname} label={label} />
          </button>
        ))}
      </div>
      <div className="flex w-full gap-x-5 items-center">
        <div className="flex relative items-center">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-[32px] h-[32px]",
              },
              baseTheme: dark,
            }}
          />
        </div>
        <p className="text-sm">Profile</p>
      </div>
    </div>
  );
};

export default SidebaNav;
