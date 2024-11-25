import Cards from "@/components/ui/cards";
import { Flipwords } from "@/components/ui/flipwords";
import { Spotlight } from "@/components/ui/spotlight";
import { InfiniteCard } from "@/components/ui/infinite-card";

import { ChevronRight } from "lucide-react";

import { content, faqs, features, images, words } from "@/lib/constants";
import { MaxWidthWrapper } from "@/components/global/max-width-wrapper";
import { StickyScroll } from "@/components/ui/sticky-scroll";
import { WavyBackground } from "@/components/ui/wavy-background";
import Accordion from "@/components/ui/accordion";
import AnimatedModal from "@/components/ui/animated-modal";
import Price from "@/components/price";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

import { Noto_Sans } from "next/font/google";
import AnimatedRubiksCube from "@/components/ui/rubiks-cube";
import { AnimatedCards } from "@/components/ui/animated-cards";
import Image from "next/image";

const notoSans = Noto_Sans({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <MaxWidthWrapper>
        <main className={`relative ${notoSans.className}`}>
          {/* Hero section */}

          <section className="flex md:flex-row flex-col items-center justify-center p-5">
            <div className="h-[calc(100vh-56px)] flex flex-col justify-center md:w-1/2 sm:w-2/3 w-full space-y-10 relative ">
              <h1 className="sm:text-5xl text-4xl text">
                <span className="relative text">
                  Nexus
                  <span className="absolute z-0 -left-2 -top-14 opacity-20 rounded-full w-24 h-24 bg-gradient-to-b from-[#D9D9D9]" />
                </span>
                : Your AI-Powered{" "}
                <span className="relative text-btn-primary">
                  Search
                  <span className="absolute -right-8 top-6 backdrop-blur-sm rounded-full w-20 h-20 bg-gradient-radial from-[rgba(217,217,217,0.1)] to-[rgba(115,115,115,0.1)]" />
                </span>{" "}
                Assistant
              </h1>
              <p className="sm:text-base text-sm !font-normal lg:mt-6 mt-10">
                Centralize and access data across multiple work applications
                with Nexus. Boost productivity and efficiency with instant
                answers, document generation, and streamlined search
                capabilities.
              </p>

              <div className="!mt-32 select-none">
                <SignedOut>
                  <SignInButton
                    mode="modal"
                    signUpFallbackRedirectUrl={"/search"}
                    fallbackRedirectUrl={"/search"}
                  >
                    <AnimatedModal icon={<ChevronRight />} href="/#">
                      Get started
                    </AnimatedModal>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <AnimatedModal icon={<ChevronRight />} href="/search">
                    Get started
                  </AnimatedModal>
                </SignedIn>
              </div>
              <span className="absolute right-32 bottom-16 opacity-10 rounded-full w-28 h-28 bg-gradient-radial from-[#D9D9D9] to-[#737373]" />
            </div>

            <div className="hidden sm:block md:w-1/2 sm:w-2/3 w-full h-[calc(100vh-56px)]">
              <AnimatedRubiksCube />
            </div>
          </section>

          {/* features section */}
          <section
            id="features"
            className="overflow-hidden px-10 flex md:flex-row flex-col"
          >
            {/* Spotlight */}
            <div className="h-[calc(100vh-56px)] spotlight_container relative md:w-1/2 w-full">
              <div className="spotlight_item absolute h-max w-full opacity-0 left-0 transition-all duration-[2000ms] -top-40 translate-y-[-100%]">
                <Spotlight />
              </div>

              <div className="pt-20 h-full flex flex-col max-w-2xl text">
                <h1 className="sm:text-5xl text-4xl">
                  Unleash the Power of Advanced{" "}
                  <span className="inline-block w-[260px]">
                    <Flipwords words={words} charSpeed={100} />
                  </span>
                  <div className="sm:text-5xl text-4xl">search</div>
                </h1>
                <div className="relative flex-1 w-full">
                  <Image
                    src="/Man.png"
                    alt="man"
                    fill
                    className="object-contain "
                  />
                </div>
              </div>
            </div>

            <div className="h-[calc(100vh-56px)] md:w-1/2 w-full">
              <AnimatedCards data={features} autoplay />
            </div>
          </section>

          {/* working section */}

          <section className="relative flex flex-col h-[calc(100vh-4rem)] items-center my-40">
            <h1 className="sm:text-5xl text-4xl text">
              How Nexus Works<span className="text-btn-primary">?</span>
            </h1>
            <WavyBackground
              className="w-full flex justify-center"
              backgroundFill="#0a0a0a"
              waveWidth={30}
              containerClassName="[mask-image:linear-gradient(90deg,transparent,black_5%,black_95%,transparent)] relative flex-1"
            >
              <div className="relative w-[80%] ">
                <StickyScroll content={content} />
              </div>
            </WavyBackground>
          </section>

          {/* Integration section */}
          <section className="px-10 my-28 flex flex-col gap-10 items-center text">
            <h1 className="sm:text-5xl text-4xl">
              All your favorite apps. One{" "}
              <span className="text-btn-primary">AI search</span>
            </h1>
            <p className="sm:text-base text-sm">
              Instantly sync your favorite apps like Gmail, Slack, Notion, and
              Drive to quickly find answers and information in real time
            </p>
            <InfiniteCard
              cardItems={images}
              className="sm:max-w-[928px] w-full mt-10"
              animationSpeed="slow"
              itemsClassName="h-[64px] gap-14"
              mask
            />
          </section>

          {/* Pricing section */}
          <Price />

          {/* FAQ section */}

          <section className="px-10 flex flex-col gap-10 items-center min-h-max my-20">
            <h1 className="sm:text-5xl text-4xl text">FAQ&apos;s</h1>
            <p className="sm:text-base text-sm text">
              Find answers to frequently asked questions about Nexus and its
              features
            </p>
            <Accordion faqs={faqs} />
          </section>
        </main>
      </MaxWidthWrapper>
    </>
  );
}
