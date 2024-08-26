"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
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
import SidebaNav from "./sidebar-nav";
import HamburgurIcon from "../ui/hamburger-icon";
import useUser from "@/hooks/useUser";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();

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
    <header className="h-16 flex flex-col justify-center bg-neutral-900/60 backdrop-blur-lg sticky z-[100] top-0 left-0 right-0">
      <nav className="flex py-4 sm:px-10 px-4 justify-between items-center">
        <div>
          <h2 className="sm:text-2xl text-xl">
            <Link href="/">
              <span className="sm:inline hidden">Nexus</span>
              <span className="sm:hidden block relative size-6">
                <Image src="/logo.jpeg" alt="logo" fill />
              </span>
            </Link>
          </h2>
        </div>
        <div className="flex gap-4 items-center">
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
              <Drawer>
                <DrawerTrigger>
                  <HamburgurIcon />
                </DrawerTrigger>
                <DrawerContent
                  direction="right"
                  containerClassName="h-full mt-0 w-full"
                  drawerClassName=""
                  handleStyles={{ display: "none" }}
                >
                  <SidebaNav
                    username={user.username}
                    className="relative w-full"
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
    </header>
  );
}
