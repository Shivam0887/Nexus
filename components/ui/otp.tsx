"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

const OTP = ({
  setOTP,
  setIsSubmitting,
}: {
  setOTP: React.Dispatch<React.SetStateAction<string>>;
  setIsSubmitting?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [passkey, setPasskey] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>(
    new Array(6).fill(null)
  );

  const { pending } = useFormStatus();

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const key = e.key;
    const arr = [...passkey];

    if (key === "Backspace") {
      arr[index] = "";
      setPasskey(arr);

      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (/^\d$/.test(key)) {
      arr[index] = key;
      setPasskey(arr);

      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
        inputRefs.current[index + 1]?.setSelectionRange(1, 1);
      }
    } else if (key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    setOTP(arr.join(""));
  };

  useEffect(() => {
    setIsSubmitting?.(pending);
    if(!pending){
      setPasskey(new Array(6).fill(""))
    }
  }, [pending, setIsSubmitting]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="flex gap-2 items-center justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={`passkey${i}`}
          id={`passkey${i}`}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          name={`passkey${i}`}
          value={passkey[i]}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onChange={(e) => e.preventDefault()}
          className="sm:w-14 w-12 sm:h-14 h-12 text-center rounded-md bg-neutral-800 font-semibold outline-none focus:outline focus:outline-neutral-700 focus:outline-offset-2"
          required
          disabled={pending}
        />
      ))}
    </div>
  );
};

export default OTP;
