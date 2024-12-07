import { PLAN } from "@/lib/types";
import { Inter } from "next/font/google";
import AnimatedModal from "./animated-modal";
import { ChevronRight } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

const PricingCard = ({ options }: { options: PLAN }) => {
  return (
    <div
      className={`pricing-card sm:w-96 w-80 h-max flex flex-col gap-8 border backdrop-blur-xl rounded-3xl shrink-0 p-7 ${
        options.plan === "Starter"
          ? "border-sidenav-btn-bg items-card1"
          : "border-sky-500/50 items-card2"
      } ${inter.className} `}
    >
      <div className="flex justify-between">
        <div className="space-y-1">
          <p className="text-neutral-500 text-sm tracking-widest">PLAN</p>
          <p
            className={`text-lg font-semibold tracking-wider
              ${
                options.plan === "Starter" ? "text-btn-primary" : "text-sky-500"
              }`}
          >
            {options.plan}
          </p>
        </div>
        <p
          className={`text-xs py-2 px-3 rounded-2xl h-max ${
            options.plan === "Starter"
              ? "text-btn-primary bg-sidenav-btn-bg"
              : "text-sky-500 bg-sky-950"
          }`}
        >
          {options.plan === "Starter" ? "Free" : "Best Seller"}
        </p>
      </div>

      <div className="space-y-6">
        <p>
          <sup style={{ fontSize: "18px", verticalAlign: "20px" }}>$</sup>
          <span className="text-5xl font-bold ">{options.price}</span>{" "}
          {options.plan === "Starter" ? "Free forever" : "/month"}
        </p>
        <p className="text-neutral-500 text-sm">{options.desc}</p>
      </div>

      <div className="w-full h-[1px] bg-neutral-500" />

      <div className="space-y-2">
        {options.features.map(
          ({ available, content, icon: Icon, comingSoon }, i) => (
            <div
              key={i}
              className={`flex text-sm gap-4 ${
                available ? "" : "text-gray-600"
              }`}
            >
              <span>
                <Icon />
              </span>
              <p>
                {content} {comingSoon && <span>(Coming Soon)</span>}
              </p>
            </div>
          )
        )}
      </div>

      <AnimatedModal
        href={`/billing?plan=${options.plan}`}
        icon={<ChevronRight />}
        className={`!w-full text-sm ${
          options.plan === "Starter" ? "!bg-btn-primary" : "!bg-sky-500"
        }`}
      >
        Try Now
      </AnimatedModal>
    </div>
  );
};

export default PricingCard;
