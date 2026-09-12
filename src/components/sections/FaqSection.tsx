"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { faqItems } from "@/data/faq";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { cn } from "@/lib/utils";

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(faqItems[0]?.id ?? null);

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <SectionWrapper id="faq" bgVariant="soft" className="relative overflow-hidden">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-14">
        {/* Kolom kiri — sticky */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ScrollReveal>
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <HelpCircle className="size-5 text-[var(--color-primary)]" aria-hidden="true" />
              </span>
              <p className="font-display text-sm font-bold uppercase tracking-widest text-[var(--color-primary)]">
                FAQ
              </p>
            </div>
            <h2 className="mt-3 font-display text-3xl font-black text-[var(--color-text-primary)] md:text-4xl">
              Sering Ditanya
            </h2>
            <p className="mt-4 max-w-md text-base text-[var(--color-text-secondary)] md:text-lg">
              Jawaban buat pertanyaan yang paling sering muncul. Klik pertanyaan untuk lihat jawabannya.
            </p>

            <div className="mt-8 rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
              <p className="font-display text-lg font-bold text-[var(--color-text-primary)]">
                Pertanyaan lain?
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Langsung tanya admin — dibalas cepat di jam kerja.
              </p>
              <WhatsAppButton
                label="Tanya via WhatsApp"
                message="Halo BisaPrint, saya punya pertanyaan seputar layanan cetak."
                variant="primary"
                size="md"
                className="mt-4"
              />
            </div>
          </ScrollReveal>
        </div>

        {/* Kolom kanan — accordion */}
        <div className="space-y-3">
          {faqItems.map((item) => {
            const isOpen = openId === item.id;

            return (
              <div
                key={item.id}
                className={cn(
                  "overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-colors",
                  isOpen
                    ? "border-primary shadow-md shadow-primary/10"
                    : "border-[var(--color-border)] hover:border-[var(--color-primary)]/40",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  id={`faq-btn-${item.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${item.id}`}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
                >
                  <span className="font-display text-base font-bold text-[var(--color-text-primary)] md:text-lg">
                    {item.question}
                  </span>
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
                      isOpen ? "bg-primary text-white" : "bg-[var(--color-bg-soft)] text-primary",
                    )}
                  >
                    <ChevronDown
                      className={cn("size-4 transition-transform duration-300", isOpen && "rotate-180")}
                      aria-hidden="true"
                    />
                  </span>
                </button>

                <div
                  id={`faq-panel-${item.id}`}
                  role="region"
                  aria-labelledby={`faq-btn-${item.id}`}
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
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
