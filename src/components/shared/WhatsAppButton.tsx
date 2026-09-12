"use client";

import { motion } from "framer-motion";
import { WA_NUMBER, WA_DEFAULT_MSG, waUrl } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/tracking";
import { WHATSAPP_ICON_PATH } from "@/lib/brand-icons";

interface WhatsAppButtonProps {
  label: string;
  message?: string;
  variant: "primary" | "outline" | "floating";
  size: "sm" | "md" | "lg";
  className?: string;
  trackingSource?: string;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d={WHATSAPP_ICON_PATH} />
    </svg>
  );
}

function resolveHref(message?: string): string {
  if (message) return waUrl(message);
  return `https://wa.me/${WA_NUMBER}?text=${WA_DEFAULT_MSG}`;
}

const sizeStyles = {
  primary: {
    sm: "gap-1.5 px-4 py-2 text-sm",
    md: "gap-2 px-6 py-3 text-base",
    lg: "gap-2.5 px-8 py-4 text-lg",
  },
  outline: {
    sm: "gap-1.5 px-4 py-2 text-sm",
    md: "gap-2 px-6 py-3 text-base",
    lg: "gap-2.5 px-8 py-4 text-lg",
  },
  // Smaller on mobile so the FAB covers less of the content it floats over.
  floating: {
    sm: "size-11 sm:size-12",
    md: "size-12 sm:size-14",
    lg: "size-14 sm:size-16",
  },
} as const;

const iconSizes = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
} as const;

const floatingIconSizes = {
  sm: "size-6",
  md: "size-7",
  lg: "size-8",
} as const;

export function WhatsAppButton({
  label,
  message,
  variant,
  size,
  className,
  trackingSource,
}: WhatsAppButtonProps) {
  const href = resolveHref(message);
  const source = trackingSource ?? `wa-${variant}`;
  const handleClick = () => trackEvent("Lead", { source });

  if (variant === "floating") {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          onClick={handleClick}
          whileHover={{ scale: 1.1 }}
          className={cn(
            "group relative inline-flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition hover:bg-[#1ebe5d] hover:shadow-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1ebe5d] animate-pulse-wa",
            sizeStyles.floating[size],
            className,
          )}
        >
          <WhatsAppIcon className={floatingIconSizes[size]} />
          <span className="sr-only">{label}</span>
          <span className="absolute bottom-full right-0 mb-2 scale-0 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition group-hover:scale-100" role="tooltip">
            Chat Admin
          </span>
        </motion.a>
      </div>
    );
  }

  const isPrimary = variant === "primary";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-3",
        isPrimary
          ? "bg-primary text-white hover:animate-pulse hover:bg-primary/90 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          : "border-2 border-primary bg-transparent text-primary hover:bg-primary/10 focus-visible:ring-primary/30",
        sizeStyles[variant][size],
        className,
      )}
    >
      <WhatsAppIcon className={iconSizes[size]} />
      <span>{label}</span>
    </a>
  );
}
