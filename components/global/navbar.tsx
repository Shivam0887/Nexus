"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";

export default function Navbar() {
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
    <header className="bg-neutral-900/60 border-neutral-900 border-b backdrop-blur-lg sticky z-[100] top-0 left-0 right-0">
      <nav className="flex py-4 sm:px-10 px-4 justify-between items-center">
        <div>
          <h2 className="sm:text-2xl text-xl">
            <Link href="/">Nexus</Link>
          </h2>
        </div>
        <div className="flex gap-10 items-center">
          <ul className="relative md:text-lg text-base flex justify-center sm:gap-10 gap-4">
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
          <SignedIn>
            <UserButton appearance={{ baseTheme: dark }} />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}
