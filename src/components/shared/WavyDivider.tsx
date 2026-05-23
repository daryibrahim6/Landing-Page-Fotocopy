import { cn } from "@/lib/utils";

interface WavyDividerProps {
  color?: string;
  flip?: boolean;
}

const WAVE_PATH =
  "M0,48 C95,72 185,18 310,42 C435,66 520,12 655,38 C790,64 905,22 1040,50 C1175,78 1285,26 1440,44 L1440,80 L0,80 Z";

export function WavyDivider({
  color = "#FFF0F5",
  flip = false,
}: WavyDividerProps) {
  return (
    <div
      className={cn("w-full overflow-hidden leading-none", flip && "rotate-180")}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 80"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block h-12 w-full md:h-16 lg:h-20"
      >
        <path d={WAVE_PATH} fill={color} />
      </svg>
    </div>
  );
}
