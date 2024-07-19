"use client";

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
    <div className="bg-neutral">
      <nav className="flex py-4 px-10 justify-between items-center">
        <div>
          <h2 className="text-2xl">
            <Link href="/">Nexus</Link>
          </h2>
        </div>
        <div className="flex gap-10 items-center">
          <ul className="relative flex justify-center gap-10">
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
              <Link href="/#featues">Features</Link>
            </li>
            <li className="p-2">
              <Link href="/#pricing">Pricing</Link>
            </li>
          </ul>
          <button className="text-black bg-btn-primary py-2 px-8 rounded-2xl font-medium">
            Sign up
          </button>
        </div>
      </nav>
    </div>
  );
}
