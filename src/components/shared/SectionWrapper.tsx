import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  id: string;
  bgVariant?: "white" | "soft" | "primary";
  className?: string;
  children: ReactNode;
}

const bgVariantStyles = {
  white: "bg-white",
  soft: "bg-[var(--color-bg-soft)]",
  primary: "bg-primary text-white",
} as const;

export function SectionWrapper({
  id,
  bgVariant = "white",
  className,
  children,
}: SectionWrapperProps) {
  return (
    <section id={id} className={cn(bgVariantStyles[bgVariant], className)}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        {children}
      </div>
    </section>
  );
}
