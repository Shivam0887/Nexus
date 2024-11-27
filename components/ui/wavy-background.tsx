"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: {
  children?: any;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  [key: string]: any;
}) => {
  const noise = createNoise3D();

  let nt: number = 0;
  let h = 30;
  let w = 30;

  let ctx: CanvasRenderingContext2D | null = null;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getSpeed = () => {
    switch (speed) {
      case "slow":
        return 0.001;
      case "fast":
        return 0.002;
      default:
        return 0.001;
    }
  };

  const waveColors = colors ?? [
    "#38bdf8",
    "#818cf8",
    "#c084fc",
    "#e879f9",
    "#22d3ee",
  ];

  const drawWave = (n: number) => {
    if (ctx) {
      nt += getSpeed();
      for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.lineWidth = waveWidth || 50;
        ctx.strokeStyle = waveColors[i % waveColors.length];
        for (let x = 0; x < w; x += 5) {
          const y = noise(x / 800, 0.3 * i, nt) * 100;
          ctx.lineTo(x, y + h * 0.5); // adjust for height, currently at 50% of the container
        }
        ctx.stroke();
        ctx.closePath();
      }
    }
  };

  let animationId: number;
  const render = () => {
    if (ctx) {
      ctx.fillStyle = backgroundFill || "black";
      ctx.globalAlpha = waveOpacity || 0.5;
      ctx.fillRect(0, 0, w, h);
      drawWave(5);
      animationId = requestAnimationFrame(render);
    }
  };

  const init = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (container && canvas) {
      ctx = canvas.getContext("2d")!;
      w = ctx.canvas.width = container!.clientWidth;
      h = ctx.canvas.height = container!.clientHeight;
      ctx.filter = `blur(${blur}px)`;

      window.onresize = function () {
        if (ctx) {
          w = ctx.canvas.width = container!.clientWidth;
          h = ctx.canvas.height = container!.clientHeight;
          ctx.filter = `blur(${blur}px)`;
        }
      };

      render();
    }
  };

  useEffect(() => {
    init();

    return () => {
      cancelAnimationFrame(animationId);
    };

    // eslint-disable-next-line
  }, []);

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    // I'm sorry but i have got to support it on safari.
    setIsSafari(
      typeof window !== "undefined" &&
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome")
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full flex flex-col items-center justify-center",
        containerClassName
      )}
    >
      <canvas
        className="absolute z-0"
        ref={canvasRef}
        id="canvas"
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
        }}
      ></canvas>
      <div className={cn("relative z-10", className)} {...props}>
        {children}
      </div>
    </div>
  );
};
