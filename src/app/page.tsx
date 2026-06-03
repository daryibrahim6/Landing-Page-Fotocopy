import { WavyDivider } from "@/components/shared/WavyDivider";
import { HeroSection } from "@/components/sections/HeroSection";
import { KategoriProduk } from "@/components/sections/KategoriProduk";
import { ProductCatalog } from "@/components/sections/ProductCatalog";
import { WhyBisaPrint } from "@/components/sections/WhyBisaPrint";
import { CaraOrderSection } from "@/components/sections/CaraOrderSection";
import { FormKonsultasi } from "@/components/sections/FormKonsultasi";
import { PortfolioGallery } from "@/components/sections/PortfolioGallery";
import { Testimonials } from "@/components/sections/Testimonials";
import { PanduanFile } from "@/components/sections/PanduanFile";
import { FaqSection } from "@/components/sections/FaqSection";
import { ContactSection } from "@/components/sections/ContactSection";

export default function HomePage() {
  return (
    <>
      {/* Hero — bg-soft */}
      <HeroSection />
      <WavyDivider color="#FFFFFF" flip={false} />

      {/* KategoriProduk — bg-white */}
      <KategoriProduk />
      <WavyDivider color="#FFEAF4" flip />

      {/* ProductCatalog — bg-white (via SectionWrapper) */}
      <ProductCatalog />
      <WavyDivider color="#FFEAF4" flip />

      {/* WhyBisaPrint — bg-white */}
      <WhyBisaPrint />
      <WavyDivider color="#FFEAF4" flip />

      {/* CaraOrder — bg-soft */}
      <CaraOrderSection />
      <WavyDivider color="#FFFFFF" flip={false} />

      {/* FormKonsultasi — bg-soft */}
      <FormKonsultasi />
      <WavyDivider color="#FFFFFF" flip={false} />

      {/* Portfolio — bg-white */}
      <PortfolioGallery />
      <WavyDivider color="#FFEAF4" flip />

      {/* Testimoni — bg-soft */}
      <Testimonials />
      <WavyDivider color="#FFFFFF" flip={false} />

      {/* PanduanFile — bg-soft */}
      <PanduanFile />
      <WavyDivider color="#FFFFFF" flip={false} />

      {/* FAQ — bg-white */}
      <FaqSection />
      <WavyDivider color="#FFFFFF" flip={false} />

      {/* Contact — bg-soft */}
      <ContactSection />
    </>
  );
}
