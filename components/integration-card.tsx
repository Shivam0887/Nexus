"use client";

import { z } from "zod";
import useUser from "@/hooks/useUser";
import axios from "axios";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdditionalFilterKey, FilterKey } from "@/lib/types";
import { toast } from "sonner";
import { Platforms } from "@/lib/constants";
import Switch from "./ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { enableGoogleService } from "@/actions/user.actions";
import { useModalSelection } from "@/hooks/useModalSelection";

const searchParamsSchema = z.object({
  success: z.enum(["true", "false"]),
  platform: z.enum(Platforms),
});

const GoogleServicePlatforms = ({
  status,
  disabled = false,
}: {
  disabled?: boolean;
  status: {
    connectionStatus: number;
    GoogleDocsConnectionStatus: boolean;
    GoogleSheetsConnectionStatus: boolean;
    GoogleSlidesConnectionStatus: boolean;
  };
}) => {
  const { dispatch } = useUser();

  const handleChange = async (
    value: boolean,
    platform:
      | "GoogleDocsConnectionStatus"
      | "GoogleSheetsConnectionStatus"
      | "GoogleSlidesConnectionStatus"
  ) => {
    const platformMap: Record<any, AdditionalFilterKey> = {
      GoogleDocsConnectionStatus: "GOOGLE_DOCS",
      GoogleSheetsConnectionStatus: "GOOGLE_SHEETS",
      GoogleSlidesConnectionStatus: "GOOGLE_SLIDES",
    };

    dispatch({
      connectionType: "GOOGLE_DRIVE",
      type: "CONNECTION",
      payload: { ...status, [platform]: value },
    });

    const response = await enableGoogleService(platformMap[platform], value);
    if (response.success) {
      toast.success(response.data);
    } else {
      toast.error(response.error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className="cursor-pointer shadow-xl"
        disabled={disabled}
      >
        <button
          type="button"
          className="text-sm bg-neutral-900 px-4 py-2 rounded-md"
        >
          Enable Google Service
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-neutral-900 border-none shadow-xl">
        <DropdownMenuItem>
          <Switch
            value={status.GoogleDocsConnectionStatus}
            onValueChange={(value) =>
              handleChange(value, "GoogleDocsConnectionStatus")
            }
            label={
              <div className="flex items-center gap-2">
                <div className="relative size-5">
                  <Image src="./Google_Docs.svg" alt="Google Docs" fill />
                </div>
                <p className="text-xs">Google Docs</p>
              </div>
            }
          />
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Switch
            value={status.GoogleSheetsConnectionStatus}
            onValueChange={(value) =>
              handleChange(value, "GoogleSheetsConnectionStatus")
            }
            label={
              <div className="flex items-center gap-2">
                <div className="relative size-5">
                  <Image src="./Google_Sheets.svg" alt="Google Sheets" fill />
                </div>
                <p className="text-xs">Google Sheets</p>
              </div>
            }
          />
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Switch
            value={status.GoogleSlidesConnectionStatus}
            onValueChange={(value) =>
              handleChange(value, "GoogleSlidesConnectionStatus")
            }
            label={
              <div className="flex items-center gap-2">
                <div className="relative size-5">
                  <Image src="./Google_Slides.svg" alt="Google Slides" fill />
                </div>
                <p className="text-xs">Google Slides</p>
              </div>
            }
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const IntegrationCard = ({
  src,
  alt,
  desc,
}: {
  src: string;
  alt: FilterKey;
  desc: string;
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const { dispatch, user } = useUser();
  const { modalDispatch } = useModalSelection();

  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      container.style.width = isClicked
        ? `${container.scrollWidth}px`
        : "16rem";
      container.style.height = isClicked ? "15rem" : "8rem";
    }
  }, [isClicked]);

  useEffect(() => {
    const isSucceed = searchParams.get("success");
    const platform = searchParams.get("platform");

    if (isSucceed && platform) {
      const { success, data } = searchParamsSchema.safeParse({
        success: isSucceed,
        platform,
      });

      if (success) {
        if (data.success === "true")
          toast.success(
            `${data.platform.replace("_", " ")} connected successfully.`
          );
        else
          toast.error(
            `Failed to connect with ${data.platform.replace(
              "_",
              " "
            )}. Please try again later.`
          );
      } else {
        toast.error(
          "Not able to connect to the service, please try again later."
        );
      }
    }
  }, [searchParams]);

  const handleDisconnect = async (
    e: React.MouseEvent<HTMLButtonElement>,
    platform: FilterKey
  ) => {
    try {
      e.stopPropagation();
      dispatch({
        type: "CONNECTION",
        payload: { connectionStatus: 0 },
        connectionType: platform,
      });

      await axios.patch(`/api/auth?platform=${platform}`);
    } catch (error: any) {
      toast.error(error.message);
      dispatch({
        type: "CONNECTION",
        payload: { connectionStatus: 1 },
        connectionType: platform,
      });
    }
  };

  const handleConnect = async (
    e: React.MouseEvent<HTMLButtonElement>,
    platform: FilterKey
  ) => {
    try {
      e.stopPropagation();
      if (!user.hasPasskey || !user.shouldRemember) {
        const url = user.shouldRemember
          ? undefined
          : `/api/auth?platform=${platform}`;

        modalDispatch({
          type: "onOpen",
          payload: "SecurityModal",
          data: { type: "SecurityModal", data: { url } },
        });
        return;
      }

      const response = await axios.post(`/api/auth?platform=${platform}`);
      if (response) {
        router.replace(response.data);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div
      ref={containerRef}
      id={alt.toLowerCase()}
      onClick={() => setIsClicked((prev) => !prev)}
      className="shrink-0 relative cursor-pointer w-[16rem] h-[8rem] overflow-hidden bg-secondary rounded-3xl p-4 transition-all duration-500 border"
    >
      <div className="w-[20rem] sm:w-[24rem] grid grid-cols-[1fr_auto] grid-rows-[6rem_auto] gap-3">
        <div className="flex gap-6 items-center">
          <div className="w-14 sm:w-16 h-14 sm:h-16 bg-primary rounded-lg flex justify-center items-center">
            <div className="relative w-[75%] h-[75%]">
              <Image src={src} alt={alt} fill />
            </div>
          </div>
          <p className="text-center capitalize w-max text-sm sm:text-base">
            {alt.replace("_", " ").toLowerCase()}
          </p>
        </div>

        <div className="shrink-0 flex flex-col justify-evenly">
          {user[alt].connectionStatus === 1 ? (
            <button
              type="button"
              onClick={(e) => handleDisconnect(e, alt)}
              className="w-max text-xs bg-btn-primary py-2 px-4 rounded-3xl text-black"
            >
              Connected
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => handleConnect(e, alt)}
              className="w-max text-xs border border-btn-primary py-2 px-4 rounded-3xl text-btn-primary"
            >
              {user[alt].connectionStatus === 2 ? "Reconnect" : "Connect"}
            </button>
          )}
        </div>
        <div
          className="flex items-center flex-wrap gap-2"
          style={{ gridColumn: "1/-1" }}
        >
          {alt === "GOOGLE_DRIVE" && (
            <GoogleServicePlatforms
              status={user[alt]}
              disabled={user[alt].connectionStatus !== 1}
            />
          )}
          <p className="text-sm">{desc}</p>
        </div>
      </div>
    </div>
  );
};

export default IntegrationCard;
