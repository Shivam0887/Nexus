"use client";

import { resetPasskey, verifyOTP } from "@/actions/otp.actions";
import OTP from "@/components/ui/otp";
import { CircleCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const ResetPasskeyPage = () => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleVerifyAction = async () => {
    const response = await verifyOTP(otp);
    if (response.success) {
      toast.success(
        <div className="flex items-center gap-1 text-xs">
          <CircleCheck className="size-4" /> Verified successfully
        </div>
      );
      setIsVerified(true);
      setOtp("");
    } else {
      setError(response.error);
    }
  };

  const handleResetAction = async () => {
    const response = await resetPasskey(otp);
    if (response.success) {
      toast.success(
        <div className="flex items-center gap-1 text-xs">
          <CircleCheck className="size-4" /> Passkey reset successfully
        </div>
      );
      setIsVerified(true);
      setTimeout(() => {
        router.replace("/integrations");
      }, 0);
    } else {
      setError(response.error);
    }
  };

  return (
    <div className="h-full bg-black bg-dot-white/[0.2] relative flex items-center justify-center">
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_50%,black)]"></div>

      <form
        action={isVerified ? handleResetAction : handleVerifyAction}
        className="h-72 flex flex-col items-center justify-evenly gap-4 px-10 py-8 rounded-lg shadow-xl bg-gradient-to-bl from-neutral-900 to-neutral-950"
      >
        <p>
          {isVerified
            ? "Enter your new Passkey"
            : "Enter the 6 digit OTP sent on your registered email"}
        </p>
        <OTP setOTP={setOtp} setIsSubmitting={setIsVerifying} />
        <div className="w-full flex items-center justify-between">
          {<p className="text-sm px-4 py-2 text-red-600">{error}</p>}
          <button
            type="submit"
            className="text-sm bg-black px-4 py-2 rounded-lg"
          >
            {isVerifying ? (
              <div className="dot-loading-container">
                <div />
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs">
                {isVerified ? "Change Passkey" : "Verify OTP"}
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPasskeyPage;
