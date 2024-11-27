"use client";

import { Card } from "@/components/ui/card";
import { Icon, IconBinoculars, IconProps } from "@tabler/icons-react";
import { ScanSearch, Filter, LucideIcon, Mic } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { Flipwords } from "./ui/flipwords";
import { words } from "@/lib/constants";
import { PinContainer } from "./ui/3d-pin";

export const features: {
  title: string;
  desc: string;
  longDesc: string;
  icon: LucideIcon | ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
}[] = [
  {
    title: "smart contextual search",
    desc: "Nexus analyzes query context for precise, relevant results tailored to your needs.",
    longDesc:
      "Nexus's contextual search deeply understands your queries, delivering highly relevant results tailored to your needs.",
    icon: ScanSearch,
  },
  {
    title: "voice search",
    desc: "Search hands-free by speaking your query for quick and effortless results.",
    longDesc:
      "Find what you need effortlessly with Nexus's voice search—just speak your query for instant results.",
    icon: Mic,
  },
  {
    title: "sorting and filtering",
    desc: "Quickly narrow down results with advanced filtering and sorting options.",
    longDesc:
      "Refine your search with advanced sorting and filtering options to locate information efficiently.",
    icon: Filter,
  },
  {
    title: "visual search",
    desc: "Upload images to search visually with ML-powered accurate results.",
    longDesc:
      "Use image recognition to search visually. Upload photos and get accurate results with ML-powered technology.",
    icon: IconBinoculars,
  },
];

const FeatureCard = () => {
  return (
    <section className="h-full mx-auto w-full px-4 flex flex-col">
      <div className="text-center mb-16 text-4xl sm:text-5xl md:text-6xl">
        <h1 className="font-medium tracking-tight text mb-2">
          Unleash the Power of Advanced
        </h1>
        <h1 className="md:text-6xl font-medium tracking-tight text">
          <span className="inline-block">
            <Flipwords words={words} charSpeed={100} />
          </span>{" "}
          search
        </h1>
      </div>

      <div className="flex-1 shrink-0 grid md:grid-cols-2 grid-rows-[repeat(4,192px)] md:grid-rows-[repeat(2,192px)] gap-6">
        {features.map(({ desc, icon: Icon, title, longDesc }, index) => (
          <PinContainer
            key={index}
            title={longDesc}
            className="w-full h-full border border-neutral-700"
            containerClassName="h-full"
          >
            <Card className="h-full p-6 relative overflow-hidden group bg-accent/50 border-none bg-black bg-gradient-to-bl from-neutral-900 from-10% via-neutral-900/50 via-70% to-neutral-950 rounded-lg">
              <div className="h-full relative z-10">
                <div className="w-12 h-12 flex items-center justify-center mb-4 rounded-lg  transition-colors duration-300">
                  <Icon className="w-6 h-6 group-hover:text-text-primary text-neutral-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2 capitalize">
                  {title}
                </h3>
                <p className="text-sm">{desc}</p>
              </div>
            </Card>
          </PinContainer>
        ))}
      </div>
    </section>
  );
};

export default FeatureCard;
