"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { faqItems } from "@/data/faq";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { cn } from "@/lib/utils";

// ─── Animation ───────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 16, rotate: 0 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotate: ["-0.4deg", "0.3deg", "-0.2deg", "0.4deg", "-0.3deg", "0.2deg"][i % 6],
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as const,
      delay: i * 0.08,
    },
  }),
};



function StickyNote({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, rotate: "2deg", scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
      className="mx-auto mb-8 w-fit rounded-lg bg-[var(--color-accent-light)] px-5 py-3 shadow-md"
      style={{
        boxShadow:
          "2px 3px 0 rgba(0,0,0,0.06), 0 8px 24px -4px rgba(224,120,32,0.12)",
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(faqItems[0]?.id ?? null);

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <SectionWrapper id="faq" bgVariant="white" className="relative overflow-hidden">
      {/* Halftone background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle, var(--color-primary) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Section header */}
      <motion.div
        className="relative flex flex-col items-center text-center"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h2 className="font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
          Sering Ditanya
          <Image
            src="/assets/decoratives/gem-crystal.png"
            alt=""
            width={80}
            height={95}
            className="ml-2 inline-block rotate-6 align-middle"
            quality={90}
            sizes="(max-width: 768px) 100px, 200px"
          />
        </h2>
        <div className="relative mt-2 h-7 w-[200px] md:w-[240px] select-none pointer-events-none">
          <Image 
            src="/assets/decoratives/swoosh-orange.png"
            alt="" 
            fill
            className="object-contain opacity-80"
            aria-hidden="true"
            quality={90}
            sizes="(max-width: 768px) 200px, 400px"
          />
        </div>
        <p className="mx-auto mt-4 max-w-xl text-base text-[var(--color-text-secondary)] md:text-lg">
          Jawaban buat pertanyaan yang paling sering muncul.
        </p>
      </motion.div>

      {/* Sticky note callout */}
      <div className="mt-10">
        <StickyNote>
          <p className="font-display text-sm font-black text-[var(--color-text-primary)]">
            Klik pertanyaan untuk lihat jawaban
          </p>
        </StickyNote>
      </div>

      {/* FAQ accordion */}
      <motion.div
        className="relative mx-auto max-w-3xl space-y-4"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        {faqItems.map((item, i) => {
          const isOpen = openId === item.id;

          return (
            <motion.div
              key={item.id}
              custom={i}
              variants={itemVariant}
              whileHover={{
                rotate: "0deg",
                scale: 1.01,
                transition: { duration: 0.2 },
              }}
              className={cn(
                "overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-colors",
                isOpen
                  ? "border-primary shadow-md shadow-primary/10"
                  : "border-dashed border-[var(--color-border)]",
              )}
            >
              <button
                type="button"
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-display text-base font-bold text-[var(--color-text-primary)] md:text-lg flex items-center">
                  <Image
                    src="/assets/decoratives/pushpin.png"
                    alt=""
                    width={44}
                    height={61}
                    className="mr-3 inline-block -rotate-5 shrink-0 align-middle"
                    quality={90}
                    sizes="(max-width: 768px) 100px, 200px"
                  />
                  {item.question}
                </span>
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
                    isOpen
                      ? "bg-primary text-white"
                      : "bg-[var(--color-bg-soft)] text-primary",
                  )}
                >
                  <ChevronDown
                    className={cn(
                      "size-4 transition-transform duration-300",
                      isOpen && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </span>
              </button>

              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-in-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <p className="border-t border-[var(--color-border)] px-5 pb-5 pt-4 text-sm leading-relaxed text-[var(--color-text-secondary)] md:text-base">
                    {item.answer}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        className="relative mx-auto mt-12 flex max-w-3xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <p className="font-display text-lg font-bold text-[var(--color-text-primary)] md:text-xl">
          Pertanyaan lain? Langsung tanya aja.
        </p>
        <WhatsAppButton
          label="Tanya via WhatsApp"
          message="Halo BisaPrint, saya punya pertanyaan seputar layanan cetak."
          variant="primary"
          size="md"
          className="shrink-0"
        />
      </motion.div>
    </SectionWrapper>
  );
}
