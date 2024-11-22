"use client";

import { dark } from "@clerk/themes";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { useRef } from "react";
import { Gem, Sparkles } from "lucide-react";

import Switch from "@/components/ui/switch";
import HamburgurIcon from "@/components/ui/hamburger-icon";

import useUser from "@/hooks/useUser";
import { AISearchPreference } from "@/actions/user.actions";
import { toast } from "sonner";
import SearchService from "../search-service";
import { useDrawerSelection } from "@/hooks/useDrawerSelection";

export default function Navbar() {
  const pathname = usePathname();
  const { user, dispatch: userDispatch } = useUser();
  const { drawerDispatch } = useDrawerSelection();
  const { isAISearch } = user;

  const prevAISearchPreference = useRef(false);

  const searchRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    (
      document.getElementById("productList") as HTMLDivElement
    ).style.visibility = "visible";
  };

  const handleMouseLeave = () => {
    (
      document.getElementById("productList") as HTMLDivElement
    ).style.visibility = "hidden";
  };

  const handleAISearchToggle = async (isChecked: boolean) => {
    prevAISearchPreference.current = isAISearch;
    userDispatch({ type: "AI_SEARCH_CHANGE", payload: isChecked });

    const response = await AISearchPreference(isChecked);
    if (!response.success) {
      toast.error(response.error);
      userDispatch({
        type: "AI_SEARCH_CHANGE",
        payload: prevAISearchPreference.current,
      });
    }
  };

  return (
    <header className="h-16 flex flex-col justify-center bg-neutral-900/60 backdrop-blur-lg sticky z-[100] top-0 left-0 right-0">
      <nav className="flex py-4 sm:pl-10 pl-5 pr-5 justify-between items-center">
        <Link href="/" className="flex gap-1 items-center">
          <span className="sm:hidden inline relative size-6">
            <Image
              src="/logo.jpeg"
              alt="logo"
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </span>
          <span className="sm:inline hidden sm:text-2xl text-xl">Nexus</span>
        </Link>
        <div className="flex gap-3 sm:gap-4 items-center">
          {pathname === "/" ? (
            <ul className="hidden relative lg:text-lg md:text-base text-sm md:flex justify-center sm:gap-4">
              <li
                onMouseOver={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="cursor-pointer p-2"
              >
                Products
                <span
                  id="productList"
                  className="flex z-10 flex-col shadow-lg justify-center pl-2 gap-2 invisible absolute bg-primary w-28 h-16 top-10 rounded-lg -left-3"
                >
                  <Link
                    href="https://synapsse.netlify.app"
                    target="_blank"
                    className="text-sm"
                  >
                    Synapse
                  </Link>
                  <Link
                    href="https://doc-insight-ai.vercel.app/"
                    target="_blank"
                    className="text-sm"
                  >
                    DocInsight-AI
                  </Link>
                </span>
              </li>
              <li className="p-2">
                <Link href="/#features">Features</Link>
              </li>
              <li className="p-2">
                <Link href="/#pricing">Pricing</Link>
              </li>
            </ul>
          ) : (
            <div className="flex gap-3 sm:gap-4 items-center">
              {/* Turn on the service against you want to perform search operation. */}

              <SearchService />
              <div ref={searchRef} className="relative w-max">
                {/* AI search button */}
                <Switch
                  label={
                    <div className="flex gap-2">
                      <Sparkles className="hidden sm:block size-4 fill-btn-primary stroke-btn-primary" />
                      <p className="text-xs font-medium tracking-wide">
                        AI Search
                      </p>
                    </div>
                  }
                  value={isAISearch}
                  onValueChange={handleAISearchToggle}
                />
              </div>

              {/* Upgrade button */}
              <Link
                href="/"
                className="hidden sm:flex items-center gap-1 font-medium bg-neutral-800 hover:bg-neutral-700 transition-colors rounded-lg py-2 px-4 text-xs tracking-wider"
              >
                <span>
                  <Gem className="size-4 stroke-blue-600" />
                </span>
                Upgrade
              </Link>
            </div>
          )}

          {/* If signed out */}
          <SignedOut>
            <SignInButton
              mode="modal"
              signUpFallbackRedirectUrl={"/search"}
              fallbackRedirectUrl={"/search"}
            >
              <button
                type="button"
                className="text-sm text-black bg-btn-primary py-2 px-4 rounded-2xl font-medium"
              >
                Sign up
              </button>
            </SignInButton>
          </SignedOut>

          {/* If signed in */}
          <div className="flex gap-4 items-center">
            <SignedIn>
              <UserButton appearance={{ baseTheme: dark }} />
              {/* Navigation for smaller devices */}
              <button
                type="button"
                onClick={() => {
                  drawerDispatch({
                    type: "onOpen",
                    payload: "SidebarMenu",
                    data: { type: "SidebarMenu" },
                  });
                }}
              >
                <HamburgurIcon />
              </button>
            </SignedIn>
          </div>
        </div>
      </nav>
    </header>
  );
}
