import Cards from "@/components/ui/cards";
import { Flipwords } from "@/components/ui/flipwords";
import { Spotlight } from "@/components/ui/spotlight";
import { InfiniteCard } from "@/components/ui/infinite-card";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { content, features, temp, words } from "@/lib/constants";
import { MaxWidthWrapper } from "@/components/global/max-width-wrapper";
import Image from "next/image";
import { StickyScroll } from "@/components/ui/sticky-scroll";
import { WavyBackground } from "@/components/ui/wavy-background";

export default function Home() {
  return (
    <MaxWidthWrapper>
      <main className="relative">
        {/* Hero section */}
        <div className="bg-[url('/bg-gradient.png')] bg-no-repeat bg-center bg-cover overflow-hidden h-[calc(100vh-56px)]">
          <div className="w-full h-full flex gap-10">
            <section className="relative my-40 flex flex-col justify-around px-10 space-y-4 w-full md:w-1/2">
              <div>
                <h1 className="sm:text-5xl text-3xl">
                  <span className="relative">
                    Nexus
                    <span className="absolute z-0 -left-2 -top-14 opacity-20 rounded-full w-24 h-24 bg-gradient-to-b from-[#D9D9D9]" />
                  </span>
                  : Your AI-Powered{" "}
                  <span className="relative text-btn-primary">
                    Search
                    <span className="absolute -right-8 top-6 opacity-20 rounded-full w-20 h-20 bg-gradient-radial from-[#D9D9D9] to-[#737373]" />
                  </span>{" "}
                  Assistant
                </h1>
                <p
                  className="sm:text-sm text-xs font-normal mt-6"
                  style={{ lineHeight: "2" }}
                >
                  Centralize and access data across multiple work applications
                  with Nexus. Boost productivity and efficiency with instant
                  answers, document generation, and streamlined search
                  capabilities.
                </p>
              </div>
              <div className="animate-modal">
                <Link href="/search" className="modal_icon">
                  <ChevronRight />
                </Link>
                <div className="modal_text">Get started</div>
              </div>
              <span className="absolute right-32 -bottom-32 opacity-10 rounded-full w-28 h-28 bg-gradient-radial from-[#D9D9D9] to-[#737373]" />
            </section>
            <section className="hidden w-1/2 md:flex justify-center">
              <div className="w-[110vh] h-max md:flex flex-col rotate-90 justify-center items-center gap-10">
                <InfiniteCard
                  cardItems={temp.slice(0, 3)}
                  animationSpeed="slow"
                  className="w-full"
                />
                <InfiniteCard
                  cardItems={temp.slice(3)}
                  animationSpeed="slow"
                  animationDelay="-5s"
                  className="w-full"
                />
              </div>
            </section>
          </div>
        </div>

        {/* features section */}
        <div
          id="features"
          className="overflow-hidden spotlight_container relative min-h-screen px-10"
        >
          {/* Grid bg */}
          <div className="h-full left-1/2 -translate-x-1/2 w-full bg-primary bg-grid-small-white/[0.1] absolute [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)] [mask-mode:alpha] opacity-50" />

          {/* Spotlight */}
          <div className="spotlight_item absolute h-max md:w-1/2 w-full opacity-0 left-0 transition-all duration-[2000ms] -top-40 translate-y-[-100%]">
            <Spotlight />
          </div>

          <div className="relative pt-20 max-w-2xl">
            <h1 className="sm:text-5xl text-3xl">
              Unleash the Power of Advanced{" "}
              <span>
                <Flipwords words={words} />
              </span>
              <br />
              search
            </h1>
            <p className="sm:text-sm text-xs font-normal mt-6">
              Nexus&apos;s advanced search capabilities empower users to quickly
              find and access information across multiple platforms, saving time
              and increasing productivity. With features like smart contextual
              search, voice search, and advanced filtering and sorting, Nexus
              revolutionizes the way you search for information.
            </p>
          </div>

          <div className="relative my-12 flex [perspective:1000px]">
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
        </div>

        {/* working section */}

        <div className="flex flex-col h-screen overflow-hidden relative gap-20 items-center py-10">
          <h1 className="sm:text-5xl text-3xl sticky z-50 top-10">
            How Nexus Works<span className="text-btn-primary">?</span>
          </h1>
          <WavyBackground
            className="w-full flex justify-center"
            backgroundFill="#101010"
            waveWidth={30}
            containerClassName="[mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)] [mask-mode:alpha]"
          >
            <div className="relative w-[80%]">
              <StickyScroll content={content} />
            </div>
          </WavyBackground>
        </div>
      </main>
    </MaxWidthWrapper>
  );
}
