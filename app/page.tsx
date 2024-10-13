import Cards from "@/components/ui/cards";
import { Flipwords } from "@/components/ui/flipwords";
import { Spotlight } from "@/components/ui/spotlight";
import { InfiniteCard } from "@/components/ui/infinite-card";

import { ChevronRight } from "lucide-react";

import { content, faqs, features, images, temp, words } from "@/lib/constants";
import { MaxWidthWrapper } from "@/components/global/max-width-wrapper";
import { StickyScroll } from "@/components/ui/sticky-scroll";
import { WavyBackground } from "@/components/ui/wavy-background";
import Accordion from "@/components/ui/accordion";
import AnimatedModal from "@/components/ui/animated-modal";
import Price from "@/components/price";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div>
      <MaxWidthWrapper>
        <main className="relative">
          {/* Hero section */}

          <section className="bg-[url('/bg-gradient.png')] bg-no-repeat bg-center lg:bg-cover overflow-hidden md:max-h-max h-[calc(100vh-56px)] lg:pb-[5.5rem]">
            <div className="w-full flex gap-10">
              <section className="relative my-40 flex flex-col justify-around px-10 space-y-4 w-full lg:w-1/2">
                <div>
                  <h1 className="sm:text-5xl text-4xl text">
                    <span className="relative text">
                      Nexus
                      <span className="absolute z-0 -left-2 -top-14 opacity-20 rounded-full w-24 h-24 bg-gradient-to-b from-[#D9D9D9]" />
                    </span>
                    : Your AI-Powered{" "}
                    <span className="relative text-btn-primary">
                      Search
                      <span className="absolute -right-8 top-6 backdrop-blur-sm rounded-full w-20 h-20 bg-gradient-radial from-[rgba(217,217,217,0.1)] to-[rgba(115,115,115,0.1)] bg-" />
                    </span>{" "}
                    Assistant
                  </h1>
                  <p className="sm:text-base text-sm !font-normal lg:mt-6 mt-10">
                    Centralize and access data across multiple work applications
                    with Nexus. Boost productivity and efficiency with instant
                    answers, document generation, and streamlined search
                    capabilities.
                  </p>
                </div>

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
                <span className="absolute right-32 -bottom-32 opacity-10 rounded-full w-28 h-28 bg-gradient-radial from-[#D9D9D9] to-[#737373]" />
              </section>

              <section className="hidden w-1/2 lg:flex justify-center mt-5">
                <div className="w-[110vh] h-max md:flex flex-col rotate-90 justify-center items-center gap-10">
                  <InfiniteCard
                    cardItems={temp.slice(0, 3)}
                    className="w-full"
                    animationSpeed="slow"
                  />
                  <InfiniteCard
                    cardItems={temp.slice(3)}
                    animationDelay="-5s"
                    className="w-full"
                    animationSpeed="slow"
                  />
                </div>
              </section>
            </div>
          </section>

          {/* features section */}
          <section
            id="features"
            className="overflow-hidden spotlight_container relative max-h-screen px-10"
          >
            {/* Spotlight */}
            <div className="spotlight_item absolute h-max md:w-1/2 w-full opacity-0 left-0 transition-all duration-[2000ms] -top-40 translate-y-[-100%]">
              <Spotlight />
            </div>

            <div className="relative pt-20 max-w-2xl text">
              <h1 className="sm:text-5xl text-4xl ">
                Unleash the Power of Advanced{" "}
                <span className="sm:inline w-[260px] h-[50px] block">
                  <Flipwords words={words} />
                </span>
                <span className="block">search</span>
              </h1>
              <p className="sm:text-base text-sm !font-normal mt-6">
                Nexus&apos;s advanced search capabilities empower users to
                quickly find and access information across multiple platforms,
                saving time and increasing productivity. With features like
                smart contextual search, voice search, and advanced filtering
                and sorting, Nexus revolutionizes the way you search for
                information.
              </p>
            </div>

            <div className="hidden sm:flex relative h-[250px] my-12 [perspective:1000px]">
              {features.map(({ colorPalette, desc, title }, i) => (
                <Cards
                  key={colorPalette}
                  colorPalette={colorPalette}
                  title={title}
                  desc={(desc[0].toUpperCase() + desc.substring(1)).split(" ")}
                  delay={(i + 1) * 100}
                  className={`w-[300px] h-[250px] absolute transition-all duration-500 card${
                    i + 1
                  }`}
                />
              ))}
            </div>
          </section>

          {/* working section */}

          <section className="relative flex flex-col h-[calc(100vh-4rem)] items-center my-40">
            <h1 className="sm:text-5xl text-4xl text">
              How Nexus Works<span className="text-btn-primary">?</span>
            </h1>
            <WavyBackground
              className="w-full flex justify-center"
              backgroundFill="#101010"
              waveWidth={30}
              containerClassName="[mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)] [mask-mode:alpha] relative flex-1"
            >
              <div className="relative w-[90%]">
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
    </div>
  );
}
