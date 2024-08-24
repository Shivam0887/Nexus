"use client";

import Filter from "@/components/ui/filter";
import Textarea from "@/components/ui/textarea";
import React, { useState } from "react";
import { Inter } from "next/font/google";
import { sortData } from "@/lib/constants";
import { CirclePlus, Fullscreen, LayoutGrid, Menu } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Document from "@/components/document";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import DialogProvider from "@/hooks/useDialog";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

const inter = Inter({ subsets: ["latin"] });

const Page = () => {
  const [layout, setLayout] = useState<"grid" | "list">("list");

  return (
    <div
      className={`relative md:p-10 p-5 my-4 sm:mx-4 mx-0 space-y-10 h-[calc(100%-2rem)] flex flex-col rounded-2xl bg-neutral-900 select-none ${inter.className} overflow-auto`}
    >
      <form className="w-full flex flex-col items-center gap-10">
        <h1 className="md:text-4xl sm:text-3xl text-2xl text font-extrabold tracking-wide">
          How can I help you Today?
        </h1>
        <Textarea />
      </form>

      <div className="flex items-start justify-between gap-2">
        {/* filtering */}
        <div className="md:block hidden">
          <Filter />
        </div>
        <div className="md:hidden block">
          <Drawer>
            <DrawerTrigger>
              <div className="text-[13px] text-text-primary bg-neutral-800 max-w-max py-2 px-4 flex items-center rounded-lg">
                Filter
              </div>
            </DrawerTrigger>
            <DrawerContent className="pt-10 px-2 flex items-center">
              <Filter className="h-max" controlledHeight={true} />
            </DrawerContent>
          </Drawer>
        </div>

        <div className="flex items-center gap-3">
          {/* calendar */}
          <div className="text-[13px] text-text-primary bg-neutral-800 max-w-max py-2 px-4 flex items-center gap-2 rounded-lg">
            <span>
              <CirclePlus className="size-4 stroke-neutral-800 fill-text-primary" />
            </span>
            <p>Calendar</p>
          </div>

          {/* sorting */}
          <Select>
            <SelectTrigger className="focus:ring-offset-0 focus:ring-0 text-sm border-none bg-neutral-800">
              <SelectValue className="text-xs" placeholder="sort by" />
            </SelectTrigger>
            <SelectContent className="text-xs bg-neutral-950 text-text-primary border-none">
              {sortData.map((item) => (
                <SelectItem
                  key={item}
                  value={item}
                  className="text-[13px] cursor-pointer"
                >
                  {item}
                </SelectItem>
              ))}

              <div className="mt-1">
                <RadioGroup defaultValue="ascending" className="ml-2">
                  {["ascending", "descending"].map((item) => (
                    <div key={item} className="flex items-center space-x-2.5">
                      <RadioGroupItem
                        value={item}
                        id={item}
                        className="fill-white stroke-neutral-500"
                      />
                      <label htmlFor={item} className="text-[13px]">
                        {item}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </SelectContent>
          </Select>

          {/* layout buttons*/}
          <div className="px-4 flex gap-x-4 h-9 bg-neutral-800 rounded-lg">
            {/* grid */}
            <button onClick={() => setLayout("grid")} className="relative">
              <LayoutGrid
                className={`relative z-20 size-4 ${
                  layout === "grid"
                    ? "fill-neutral-800 stroke-neutral-800"
                    : "fill-text-primary stroke-text-primary"
                }`}
              />
              {layout === "grid" && (
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-6 rounded-full bg-text-primary pointer-events-none z-0"></span>
              )}
            </button>

            {/* list */}
            <button onClick={() => setLayout("list")} className="relative">
              <Menu
                className={`relative z-20 stroke-[3] size-4 ${
                  layout === "list"
                    ? "stroke-neutral-800"
                    : "stroke-text-primary"
                }`}
              />
              {layout === "list" && (
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-6 rounded-full bg-text-primary pointer-events-none z-0"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* documents */}
      <div className="flex-1 overflow-auto flex flex-col items-center gap-4 sm:pr-0 xs:pr-2 pr-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Document key={i} />
        ))}
      </div>

      {/* dialog box */}
      <div className="absolute lg:right-20 right-5 lg:bottom-20 bottom-5">
        <DialogProvider>
          <Dialog>
            <DialogTrigger>
              <Fullscreen />
            </DialogTrigger>
            <DialogContent className="h-[468px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Document key={i} />
              ))}
            </DialogContent>
          </Dialog>
        </DialogProvider>
      </div>
    </div>
  );
};

export default Page;
