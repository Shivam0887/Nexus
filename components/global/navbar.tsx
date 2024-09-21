"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser as clerkUser,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "../ui/drawer";
import SidebarNav from "./sidebar-nav";
import HamburgurIcon from "../ui/hamburger-icon";
import { Inter } from "next/font/google";
import Switch from "../ui/switch";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogItem,
  DialogTitle,
} from "../ui/dialog";
import { AISearchPreference, getUser } from "@/actions/user.actions";

const inter = Inter({ subsets: ["latin"] });

export default function Navbar() {
  const pathname = usePathname();
  const { user } = clerkUser();
  const [isAISearch, setIsAISearch] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getUser({ isAISearch: true });
        if (res) {
          setIsAISearch(res.isAISearch);
        }
      } catch (error: any) {
        console.log(error?.message);
      }
    })();
    setIsLoading(false);
  }, []);

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
    const userConsent = localStorage.getItem("isAISearch");
    if (!userConsent || userConsent === "false") {
      setIsDialogOpen(true);
    } else {
      await updateAISearchPreference(isChecked);
    }
  };

  const updateAISearchPreference = async (isAllowed: boolean) => {
    setIsLoading(true);
    let prevAISearchPreference = isAISearch;
    try {
      setIsAISearch(isAllowed);
      await AISearchPreference(isAllowed);

      if (isAllowed) {
        localStorage.setItem("isAISearch", isAllowed.toString());
      }
    } catch (error: any) {
      console.error("Error updating AI search preference:", error?.message);
      setIsAISearch(prevAISearchPreference);
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <header className="h-16 flex flex-col justify-center bg-neutral-900/60 backdrop-blur-lg sticky z-[100] top-0 left-0 right-0">
      <nav className="flex py-4 sm:px-10 px-4 justify-between items-center">
        <div>
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
        </div>
        <div className="flex gap-6 items-center">
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
            <div className={`flex gap-4 items-center ${inter.className}`}>
              {/* AI search button */}
              <Switch
                label={
                  <p className="text-xs font-medium tracking-wide">AI Search</p>
                }
                value={isAISearch}
                onValueChange={handleAISearchToggle}
                disabled={isLoading}
              />

              {/* Upgrade button */}
              <Link
                href="/"
                className="font-medium bg-neutral-800 hover:bg-neutral-700 transition-colors rounded-lg py-2 px-4 text-xs tracking-wider"
              >
                Upgrade
              </Link>
            </div>
          )}

          <SignedOut>
            <SignInButton>
              <button className="hidden sm:block text-black bg-btn-primary py-2 px-8 rounded-2xl font-medium">
                Sign up
              </button>
            </SignInButton>
          </SignedOut>
          <div className="flex gap-4 items-center">
            <SignedIn>
              <UserButton appearance={{ baseTheme: dark }} />
            </SignedIn>
            {pathname !== "/" && (
              <Drawer drawerDirection="right">
                <DrawerTrigger>
                  <HamburgurIcon />
                </DrawerTrigger>
                <DrawerContent
                  direction="right"
                  containerClassName="h-full mt-0 w-full"
                  drawerClassName="!w-[60vw]"
                  handleStyles={{ display: "none" }}
                >
                  <SidebarNav
                    username={user?.username ?? ""}
                    className="relative w-full"
                    direction="right"
                  />
                  <DrawerClose className="z-[9999] right-5 top-5 absolute">
                    <HamburgurIcon />
                  </DrawerClose>
                </DrawerContent>
              </Drawer>
            )}
          </div>
        </div>
      </nav>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className={`flex items-center max-w-2xl h-max pb-5 ${
            inter.className
          } ${isDialogOpen ? "block" : "hidden"}`}
        >
          <DialogHeader>
            <DialogTitle className="w-max mx-auto">
              <h2 className="text-xl">Disclaimer: Data Collection</h2>
            </DialogTitle>
            <DialogDescription>
              <p className="text-justify">
                If you want to use AI-based search for more granular search,
                then you must <strong>allow</strong> for data collection. We
                ensure you that your data only belongs to you, and won&apos;t be
                shared to any third-party expect AI-models we use. Only
                AI-models will use your data for improving their products and
                services. If you want no one use your data expect you, upgrade
                to <strong>Premium Plan</strong>.
              </p>
            </DialogDescription>
          </DialogHeader>

          <DialogItem>
            <div className="flex items-center justify-around mt-5">
              <button
                className="text-sm px-6 py-3 rounded-lg font-semibold text-white transition-colors bg-neutral-800 hover:bg-neutral-700"
                onClick={() => updateAISearchPreference(false)}
                disabled={isLoading}
              >
                Deny
              </button>
              <button
                className="text-sm px-6 py-3 rounded-lg font-semibold text-white transition-colors bg-neutral-800 hover:bg-neutral-700"
                onClick={() => updateAISearchPreference(true)}
                disabled={isLoading}
              >
                Allow
              </button>
            </div>
          </DialogItem>
        </DialogContent>
      </Dialog>
    </header>
  );
}
