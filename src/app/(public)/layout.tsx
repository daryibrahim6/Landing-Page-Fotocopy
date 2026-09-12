import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { FloatingSimulator } from "@/components/design-simulator/FloatingSimulator";

// Public marketing chrome. Admin routes live outside this route group so the
// dashboard renders without nav/footer/FABs (UX-B-08).
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
      <FloatingSimulator />
      <WhatsAppButton
        label="Hubungi BisaPrint via WhatsApp"
        variant="floating"
        size="md"
      />
    </div>
  );
}
