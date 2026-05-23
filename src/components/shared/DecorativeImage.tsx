import Image from "next/image";
import { cn } from "@/lib/utils";

interface DecorativeImageProps {
  src: string;
  alt?: string;
  width: number;
  height: number;
  className?: string;
  rotate?: number;
  opacity?: number;
  zIndex?: number;
  scale?: number;
}

export function DecorativeImage({
  src,
  alt = "",
  width,
  height,
  className,
  rotate = 0,
  opacity = 1,
  zIndex = 10,
  scale = 1,
}: DecorativeImageProps) {
  return (
    <div
      className={cn("pointer-events-none absolute select-none", className)}
      style={{
        transform: `rotate(${rotate}deg) scale(${scale})`,
        opacity,
        zIndex,
        width: `${width}px`,
      }}
      aria-hidden="true"
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="h-auto w-full"
        draggable={false}
        quality={90}
        sizes={`(max-width: 768px) ${Math.round(width * 0.65)}px, ${width}px`}
      />
    </div>
  );
}
