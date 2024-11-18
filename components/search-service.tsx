"use client";

import Image from "next/image";
import Switch from "./ui/switch";
import { LogoMap } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { CombinedFilterKey } from "@/lib/types";
import { useRef } from "react";
import useUser from "@/hooks/useUser";
import { toggleSearchService } from "@/actions/user.actions";
import { toast } from "sonner";

type TService = Exclude<CombinedFilterKey, "GOOGLE_DRIVE" | "GOOGLE_CALENDAR">;

const SERVICES: TService[] = [
  "DISCORD",
  "GITHUB",
  "GMAIL",
  "GOOGLE_DOCS",
  "GOOGLE_SHEETS",
  "GOOGLE_SLIDES",
  "MICROSOFT_TEAMS",
  "NOTION",
  "SLACK",
];

const SearchService = () => {
  const { dispatch, user } = useUser();
  const previousSearchStatusRef = useRef<Map<TService, boolean>>(new Map());

  const handleValueChange = async (service: TService) => {
    previousSearchStatusRef.current.set(service, user[service].searchStatus);
    dispatch({
      type: "SEARCH_STATUS",
      payload: {
        connectionType: service,
        searchStatus: !user[service].searchStatus,
      },
    });
    const response = await toggleSearchService(
      service,
      !user[service].searchStatus
    );

    if (response.success) toast.success(response.data);
    else {
      toast.error(response.error);
      dispatch({
        type: "SEARCH_STATUS",
        payload: {
          connectionType: service,
          searchStatus: !!previousSearchStatusRef.current.get(service),
        },
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        title="Turn on the service against which you want to perform search operations."
        className="bg-neutral-800 hover:bg-neutral-700 transition-colors rounded-lg py-2 px-4 text-xs tracking-wider"
      >
        Enable Service
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-neutral-900 border-none shadow-xl z-[120] rounded-lg">
        {SERVICES.map((service) => (
          <DropdownMenuItem key={service} className="p-0.5">
            <Switch
              value={user[service].searchStatus}
              onValueChange={(value) => handleValueChange(service)}
              label={
                <div className="flex items-center gap-2">
                  <div className="relative size-5">
                    <Image src={LogoMap[service]} alt={service} fill />
                  </div>
                  <p className="text-xs capitalize">
                    {service.replace("_", " ").toLowerCase()}
                  </p>
                </div>
              }
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SearchService;
