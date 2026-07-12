import Image from "next/image";

import { cn } from "@/lib/utils";

type CircleMotionImageProps = {
  src: string;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  motion?: "float" | "float-delayed" | "breathe" | "sway";
  className?: string;
  priority?: boolean;
};

const SIZE_CLASS = {
  xs: "size-20 sm:size-24",
  sm: "size-28 sm:size-32",
  md: "size-36 sm:size-44",
  lg: "size-44 sm:size-56 md:size-64",
  xl: "size-52 sm:size-64 md:size-72",
} as const;

const MOTION_CLASS = {
  float: "animate-float",
  "float-delayed": "animate-float-delayed",
  breathe: "animate-breathe",
  sway: "animate-sway",
} as const;

export function CircleMotionImage({
  src,
  alt,
  size = "lg",
  motion = "float",
  className,
  priority = false,
}: CircleMotionImageProps) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full border border-border/60 bg-muted shadow-[0_20px_50px_-24px_rgba(0,0,0,0.35)] ring-4 ring-background/70",
        SIZE_CLASS[size],
        MOTION_CLASS[motion],
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
        sizes="(max-width: 768px) 180px, 288px"
      />
    </div>
  );
}
