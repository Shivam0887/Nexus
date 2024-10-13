"use client";

import { z } from "zod";
import useUser from "@/hooks/useUser";
import axios from "axios";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterKey } from "@/lib/types";
import { toast } from "sonner";
import { Platforms } from "@/lib/constants";

const searchParamsSchema = z.object({
  success: z.enum(["true", "false"]),
  platform: z.enum(Platforms),
});

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

  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      container.style.width = isClicked
        ? `${container.scrollWidth}px`
        : "16rem";
      container.style.height = isClicked ? "14rem" : "8rem";
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
        payload: 1,
        connectionType: platform,
      });

      await axios.patch(`/api/auth?platform=${platform}`);
    } catch (error) {
      dispatch({
        type: "CONNECTION",
        payload: 0,
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
      <div className="w-[20rem] sm:w-[24rem] grid grid-cols-[1fr_auto] grid-rows-[6rem_auto] gap-4">
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
          {user[alt] === 1 ? (
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
              {user[alt] === 2 ? "Reconnect" : "Connect"}
            </button>
          )}
        </div>
        <p className="text-sm " style={{ gridColumn: "1/-1" }}>
          {desc}
        </p>
      </div>
    </div>
  );
};

export default IntegrationCard;
