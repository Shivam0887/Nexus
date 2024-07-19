import { InfiniteCard } from "@/components/global/infinite-card";
import { MaxWidthWrapper } from "@/components/global/max-width-wrapper";
import { temp } from "@/lib/constants";

export default function Home() {
  return (
    <MaxWidthWrapper>
      <main className="bg-[url('/bg-gradient.png')] bg-no-repeat bg-center bg-cover overflow-hidden h-[calc(100vh-72px)]">
        <div className="w-full flex gap-10">
          <section className="relative my-40 px-10 space-y-4 w-1/2">
            <h1 className="text-6xl">
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
            <p className="text-sm font-normal" style={{ lineHeight: "2" }}>
              Centralize and access data across multiple work applications with
              Nexus. Boost productivity and efficiency with instant answers,
              document generation, and streamlined search capabilities.
            </p>
            <span className="absolute right-32 -bottom-32 opacity-10 rounded-full w-28 h-28 bg-gradient-radial from-[#D9D9D9] to-[#737373]" />
          </section>
          <section className="hidden  w-1/2 lg:flex justify-center">
            <div className="w-[100vh] h-max lg:flex flex-col rotate-90 justify-center items-center gap-10">
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
      </main>
    </MaxWidthWrapper>
  );
}
