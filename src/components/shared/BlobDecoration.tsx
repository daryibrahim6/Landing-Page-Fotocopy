import { cn } from "@/lib/utils";

interface BlobDecorationProps {
  color: string;
  size: number;
  opacity: number;
  variant: 1 | 2 | 3;
  className?: string;
}

const BLOB_PATHS: Record<1 | 2 | 3, string> = {
  1: "M108,28 C142,8 178,22 188,52 C198,82 172,108 138,118 C104,128 58,122 38,98 C18,74 24,38 52,22 C74,10 88,14 108,28 Z",
  2: "M42,62 C18,38 28,12 58,6 C88,0 128,18 152,44 C176,70 168,108 132,128 C96,148 52,142 32,118 C12,94 22,58 42,62 Z",
  3: "M88,18 C118,4 162,16 178,48 C194,80 168,124 122,138 C76,152 28,132 14,96 C0,60 32,24 62,16 C72,14 80,16 88,18 Z",
};

export function BlobDecoration({
  color,
  size,
  opacity,
  variant,
  className,
}: BlobDecorationProps) {
  return (
    <div
      className={cn("pointer-events-none absolute", className)}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={BLOB_PATHS[variant]}
          fill={color}
          fillOpacity={opacity}
        />
      </svg>
    </div>
  );
}
