"use client";

import useUser from "@/hooks/useUser";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FilterKey } from "@/lib/types";
import { toast } from "sonner";
import { useModalSelection } from "@/hooks/useModalSelection";
import { revokeAccessToken } from "@/actions/user.actions";
import { useUser as useClerkUser } from "@clerk/nextjs"
import { getOAuthUrl } from "@/actions/utils.actions";

type IntegrationCardProps = {
  src: string;
  alt: FilterKey;
  desc: string;
  hasSubscription: boolean;
};

const IntegrationCard = ({
  src,
  alt,
  desc,
  hasSubscription,
}: IntegrationCardProps) => {
  const [isClicked, setIsClicked] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();

  const { dispatch, user } = useUser();
  const { user: clerkUser } = useClerkUser();
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

  const handleDisconnect = async (
    e: React.MouseEvent<HTMLButtonElement>,
    platform: FilterKey
  ) => {
    try {
      e.stopPropagation();
      dispatch({
        type: "CONNECTION",
        payload: { connectionStatus: 0, connectionType: platform },
      });

      const response = await revokeAccessToken({
        onAccountDelete: false,
        platform,
      });
      if (!response.success) throw new Error(response.error);

      toast.success(response.data);
    } catch (error: any) {
      toast.error(error.message);
      dispatch({
        type: "CONNECTION",
        payload: {
          connectionStatus: 1,
          connectionType: platform,
        },
      });
    }
  };

  const handleConnect = async (
    e: React.MouseEvent<HTMLButtonElement>,
    platform: FilterKey
  ) => {
    try {
      let url: string | undefined = await getOAuthUrl(platform, clerkUser?.id);

      e.stopPropagation();
      if (hasSubscription && (!user.hasPasskey || !user.shouldRemember)) {
        modalDispatch({
          type: "onOpen",
          payload: "SecurityModal",
          data: { type: "SecurityModal", data: { url: user.hasPasskey ? url : undefined } },
        });
        return;
      }

      if (url) {
        router.push(url);
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
              onClick={(e) => {
                if (!(alt === "DISCORD" || alt === "MICROSOFT_TEAMS")) {
                  handleConnect(e, alt);
                }
              }}
              className="w-max text-xs border border-btn-primary py-2 px-4 rounded-3xl text-btn-primary"
            >
              {alt === "MICROSOFT_TEAMS" || alt === "DISCORD"
                ? "Coming soon"
                : user[alt].connectionStatus === 2
                ? "Reconnect"
                : "Connect"}
            </button>
          )}
        </div>
        <div
          className="flex items-center flex-wrap gap-2"
          style={{ gridColumn: "1/-1" }}
        >
          <p className="text-sm">{desc}</p>
        </div>
      </div>
    </div>
  );
};

export default IntegrationCard;
