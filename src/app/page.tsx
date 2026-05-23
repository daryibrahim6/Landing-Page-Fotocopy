import type { Metadata } from "next";
import { WavyDivider } from "@/components/shared/WavyDivider";
import { ContactSection } from "@/components/sections/ContactSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { PortfolioGallery } from "@/components/sections/PortfolioGallery";
import { ProductCatalog } from "@/components/sections/ProductCatalog";
import { Testimonials } from "@/components/sections/Testimonials";
import { WhyBisaPrint } from "@/components/sections/WhyBisaPrint";

export const metadata: Metadata = {
  title: "BisaPrint - Percetakan Digital Bekasi",
  description:
    "Digital printing, sablon, dokumen, dan kebutuhan UMKM di Bekasi. Hasil premium, harga bersahabat. Pesan via WhatsApp.",
  openGraph: {
    locale: "id_ID",
    title: "BisaPrint - Percetakan Digital Bekasi",
    description:
      "Digital printing, sablon, dokumen, dan kebutuhan UMKM di Bekasi. Hasil premium, harga bersahabat.",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WavyDivider color="#FFFFFF" flip={false} />
      <WhyBisaPrint />
      <WavyDivider color="#FFF0F5" flip />
      <ProductCatalog />
      <WavyDivider color="#FFFFFF" flip={false} />
      <PortfolioGallery />
      <WavyDivider color="#FFF0F5" flip={false} />
      <Testimonials />
      <WavyDivider color="#FFFFFF" flip={false} />
      <FaqSection />
      <WavyDivider color="#FFF0F5" flip={false} />
      <ContactSection />
    </>
  );
}
