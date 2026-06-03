import dynamic from "next/dynamic";
import { WavyDivider } from "@/components/shared/WavyDivider";
import { HeroSection } from "@/components/sections/HeroSection";
import { KategoriProduk } from "@/components/sections/KategoriProduk";
import { ProductCatalog } from "@/components/sections/ProductCatalog";

const WhyBisaPrint = dynamic(() => import("@/components/sections/WhyBisaPrint").then((m) => m.WhyBisaPrint));
const CaraOrderSection = dynamic(() => import("@/components/sections/CaraOrderSection").then((m) => m.CaraOrderSection));
const FormKonsultasi = dynamic(() => import("@/components/sections/FormKonsultasi").then((m) => m.FormKonsultasi));
const PortfolioGallery = dynamic(() => import("@/components/sections/PortfolioGallery").then((m) => m.PortfolioGallery));
const Testimonials = dynamic(() => import("@/components/sections/Testimonials").then((m) => m.Testimonials));
const PanduanFile = dynamic(() => import("@/components/sections/PanduanFile").then((m) => m.PanduanFile));
const FaqSection = dynamic(() => import("@/components/sections/FaqSection").then((m) => m.FaqSection));
const ContactSection = dynamic(() => import("@/components/sections/ContactSection").then((m) => m.ContactSection));

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WavyDivider color="#FFFFFF" flip={false} />

      <KategoriProduk />
      <WavyDivider color="#FFEAF4" flip />

      <ProductCatalog />
      <WavyDivider color="#FFEAF4" flip />

      <WhyBisaPrint />
      <WavyDivider color="#FFEAF4" flip />

      <CaraOrderSection />
      <WavyDivider color="#FFFFFF" flip={false} />

      <FormKonsultasi />
      <WavyDivider color="#FFFFFF" flip={false} />

      <PortfolioGallery />
      <WavyDivider color="#FFEAF4" flip />

      <Testimonials />
      <WavyDivider color="#FFFFFF" flip={false} />

      <PanduanFile />
      <WavyDivider color="#FFFFFF" flip={false} />

      <FaqSection />
      <WavyDivider color="#FFFFFF" flip={false} />

      <ContactSection />
    </>
  );
}
