"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useEffect } from "react";

import useUser from "@/hooks/useUser";
import { useModalSelection } from "@/hooks/useModalSelection";
import { images, Platforms } from "@/lib/constants";

import { useSearchParams } from "next/navigation";
import IntegrationCard from "@/components/integration-card";

const searchParamsSchema = z.object({
  success: z.enum(["true", "false"]),
  platform: z.enum(Platforms),
});

const IntegrationWrapper = () => {
  const { user } = useUser();
  const { modalDispatch } = useModalSelection();
  const searchParams = useSearchParams();

  const hasSubscription = user.hasSubscription;

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
  }, []);

  useEffect(() => {
    if (!user.hasPasskey && hasSubscription) {
      modalDispatch({
        type: "onOpen",
        payload: "SecurityModal",
        data: { type: "SecurityModal", data: {} },
      });
    }
  }, [modalDispatch, user.hasPasskey, hasSubscription]);

  return (
    <div className="relative z-50 flex flex-col lg:overflow-y-auto items-center py-10 gap-10 flex-1">
      {images.map(({ alt, desc, src, key }) => (
        <IntegrationCard
          alt={alt}
          src={src}
          desc={desc}
          key={key}
          hasSubscription={hasSubscription}
        />
      ))}
    </div>
  );
};

export default IntegrationWrapper;
