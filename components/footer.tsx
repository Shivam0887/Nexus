import { Button } from "@/components/ui/button";
import { ArrowRight, Linkedin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { IconBrandGithub } from "@tabler/icons-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function Footer() {
  return (
    <div className="text-white min-h-screen flex flex-col justify-between">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-24 md:py-32 max-w-6xl">
        <h1 className="text-5xl sm:text-6xl md:text-7xl text font-bold text-center leading-tight tracking-tight pb-12">
          Your AI-powered gateway to seamless work insights and smarter
          productivity
        </h1>
        <div className="flex justify-center">
          <SignedOut>
            <SignInButton
              mode="modal"
              signUpFallbackRedirectUrl={"/search"}
              fallbackRedirectUrl={"/search"}
            >
              <Button
                variant="link"
                className="text-white text-lg group flex items-center gap-2 hover:text-gray-300 transition-colors"
              >
                Get in touch
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/search"
              className="text-white text-lg group flex items-center gap-2 hover:text-gray-300 transition-colors underline-offset-4 hover:underline"
            >
              Get in touch
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </SignedIn>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8">
                <Image
                  src="/logo.jpeg"
                  alt="logo"
                  width={32}
                  height={32}
                  className="w-full h-full"
                />
              </div>
              <div className="text-lg font-semibold">Nexus</div>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-8 -ml-10">
              <Link
                href="/#features"
                className="text-sm hover:text-gray-300 transition-colors"
              >
                Features
              </Link>
              <Link
                href="/#pricing"
                className="text-sm hover:text-gray-300 transition-colors"
              >
                Price
              </Link>
            </nav>

            {/* Social Links */}
            <div className="flex items-center gap-6">
              <a
                href="https://www.linkedin.com/in/shivam0887/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300 transition-colors"
              >
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/Shivam0887"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300 transition-colors"
              >
                <span className="sr-only">GitHub</span>
                <IconBrandGithub className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
