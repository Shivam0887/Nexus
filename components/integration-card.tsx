"use client";

import useUser from "@/hooks/useUser";
import axios from "axios";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Account, FilterKey } from "@/lib/types";

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
  const router = useRouter();
  const { dispatch, user } = useUser();

  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      container.style.width = isClicked
        ? `${container.scrollWidth}px`
        : "14rem";
      container.style.height = isClicked ? "14rem" : "7rem";
    }
  }, [isClicked]);

  const handleDisconnect = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      e.stopPropagation();
      dispatch({
        type: "CONNECTION",
        payload: { account: false, dataCollection: user[alt].dataCollection },
        connectionType: "Gmail",
      });

      await axios.post("/api/oauth_callback/gmail");
    } catch (error) {
      dispatch({
        type: "CONNECTION",
        payload: { account: true, dataCollection: user[alt].dataCollection },
        connectionType: "Gmail",
      });
    }
  };

  const handleConnect = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      e.stopPropagation();
      const res = await axios("/api/auth/google");
      if (res && res.data) {
        router.push(res.data);
      }
    } catch (error: any) {
      console.log(error?.message);
    }
  };

  return (
    <div
      ref={containerRef}
      role="button"
      onClick={() => setIsClicked((prev) => !prev)}
      className="relative cursor-pointer w-[14rem] h-[7rem] overflow-hidden shrink-0 group bg-secondary rounded-3xl p-4 transition-all duration-500 flex flex-col border"
    >
      <div className="transition-all duration-500 absolute top-6 left-5 flex gap-6 items-center">
        <div className="w-16 h-16 bg-primary rounded-lg flex justify-center items-center">
          <div className="relative w-[75%] h-[75%]">
            <Image src={src} alt={alt} fill />
          </div>
        </div>
        <p className="text-center">{alt}</p>
      </div>

      <div className="w-[18rem] sm:w-[20rem] lg:w-[22rem] xl:w-[28rem] h-[14rem] shrink-0 flex flex-col justify-around">
        <div className="flex justify-end">
          {user[alt].account ? (
            <button
              onClick={handleDisconnect}
              className="w-max text-xs bg-btn-primary py-2 px-4 rounded-3xl text-black"
            >
              Connected
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="w-max text-xs border border-btn-primary py-2 px-4 rounded-3xl text-btn-primary"
            >
              Connect
            </button>
          )}
        </div>
        <div className="">
          <p className="text-sm pb-4">{desc}</p>
        </div>
      </div>
    </div>
  );
};

export default IntegrationCard;
