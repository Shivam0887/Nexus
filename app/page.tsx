import { Spotlight } from "@/components/ui/spotlight";
import { InfiniteCard } from "@/components/ui/infinite-card";

import { ChevronRight } from "lucide-react";

import { content, faqs, images } from "@/lib/constants";
import { MaxWidthWrapper } from "@/components/global/max-width-wrapper";
import { StickyScroll } from "@/components/ui/sticky-scroll";
import { WavyBackground } from "@/components/ui/wavy-background";
import Accordion from "@/components/ui/accordion";
import AnimatedModal from "@/components/ui/animated-modal";
import Price from "@/components/price";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

import { Noto_Sans } from "next/font/google";
import AnimatedRubiksCube from "@/components/ui/rubiks-cube";
import FeatureCard from "@/components/feature-card";

const notoSans = Noto_Sans({ subsets: ["latin"] });

export default function Home() {
  return (
    <div className="overflow-hidden">
      <MaxWidthWrapper>
        <main className={`relative mb-10 space-y-32 ${notoSans.className}`}>
          {/* Hero section */}

          <section className="flex md:flex-row flex-col items-center justify-center p-5">
            <div className="h-[calc(100vh-56px)] flex flex-col justify-center md:w-1/2 sm:w-2/3 w-full space-y-10 relative ">
              <h1 className="text-4xl sm:text-5xl md:text-6xl">
                <span className="relative text">
                  Nexus
                  <span className="absolute z-0 -left-2 -top-14 opacity-20 rounded-full w-24 h-24 bg-gradient-to-b from-[#D9D9D9]" />
                </span>
                <span className="text">: Your AI-Powered Search Assistant</span>
              </h1>
              <p className="sm:text-base text-sm !font-normal lg:mt-6 mt-10">
                Centralize and access data across multiple work applications
                with Nexus. Boost productivity and efficiency with instant
                answers, and streamlined search capabilities.
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

            <div className="hidden relative lg:block md:w-1/2 sm:w-2/3 w-full h-[calc(100vh-56px)] spotlight_container">
              {/* Spotlight */}
              <div className="spotlight_item absolute h-full w-[150%] opacity-0 -right-3/4 transition-all duration-[2000ms] -top-1/2 -translate-y-full rotate-90">
                <Spotlight />
              </div>
              <AnimatedRubiksCube />
            </div>
          </section>

          {/* features section */}
          <section id="features" className="px-10 min-h-[calc(100vh-56px)]">
            <FeatureCard />
          </section>

          {/* working section */}

          <section className="relative flex flex-col max-h-[calc(100vh-56px)] gap-5 items-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl text">
              How Nexus Works<span className="text-btn-primary">?</span>
            </h1>
            <WavyBackground
              className="w-full flex justify-center"
              backgroundFill="#0a0a0a"
              waveWidth={30}
              containerClassName="mask-gradient relative flex-1 py-10"
            >
              <div className="relative w-[80%]">
                <StickyScroll content={content} />
              </div>
            </WavyBackground>
          </section>

          {/* Integration section */}
          <section className="px-10 my-28 flex flex-col gap-10 items-center text">
            <h1 className="text-4xl sm:text-5xl md:text-6xl">
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
            <h1 className="text-4xl sm:text-5xl md:text-6xl text">
              FAQ&apos;s
            </h1>
            <p className="sm:text-base text-sm text">
              Find answers to frequently asked questions about Nexus and its
              features
            </p>
            <Accordion faqs={faqs} />
          </section>
        </main>
      </MaxWidthWrapper>
    </div>
  );
}
