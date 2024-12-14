"use client";

import { dark } from "@clerk/themes";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { Gem } from "lucide-react";

import HamburgurIcon from "@/components/ui/hamburger-icon";

import useUser from "@/hooks/useUser";
import { useDrawerSelection } from "@/hooks/useDrawerSelection";

import SearchAI from "@/components/search-ai";
import SearchService from "@/components/search-service";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { drawerDispatch } = useDrawerSelection();

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

  return (
    <header
      className={`h-16 flex flex-col justify-center ${
        pathname === "/terms-and-conditions" || pathname === "/privacy-policy"
          ? "bg-neutral-900"
          : "bg-neutral-900/60"
      } backdrop-blur-lg sticky z-[100] top-0 left-0 right-0`}
    >
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
          {/* <sup className="bg-green-900 tracking-wider text-[10px] font-semibold rounded-lg p-2">
            {user.hasSubscription ? "Pro" : "Free"}
          </sup> */}
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
            <SignedIn>
              <div className="flex gap-3 sm:gap-4 items-center relative">
                {/* Turn on the service against you want to perform search operation. */}

                <SearchService />
                <SearchAI />

                {/* Upgrade button */}
                {!user.hasSubscription && (
                  <Link
                    href="/settings?plan=Professional&tab=billing"
                    className="hidden sm:flex items-center gap-1 font-medium bg-neutral-800 hover:bg-neutral-700 transition-colors rounded-lg py-2 px-4 text-xs tracking-wider"
                  >
                    <span>
                      <Gem className="size-4 stroke-blue-600" />
                    </span>
                    Upgrade
                  </Link>
                )}
              </div>
            </SignedIn>
          )}

          {/* If signed out */}
          <SignedOut>
            <SignInButton
              mode="redirect"
              signUpFallbackRedirectUrl={"/search"}
              fallbackRedirectUrl={"/search"}
            >
              <button
                type="button"
                className="text-sm text-black bg-btn-primary py-2 px-4 rounded-2xl font-medium"
              >
                Sign in
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
