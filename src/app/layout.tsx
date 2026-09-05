import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fredoka, Poppins } from "next/font/google";
import Script from "next/script";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { FloatingSimulator } from "@/components/design-simulator/FloatingSimulator";
import { MetaPixel } from "@/components/tracking/MetaPixel";
import { GoogleAnalytics } from "@/components/tracking/GoogleAnalytics";
import { getMidtransClientKey, getMidtransBaseUrl } from "@/lib/midtrans";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-display",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bisa Print — Percetakan Digital Bekasi, Stiker, DTF, Kartu Nama & Lebih",
  description:
    "Jasa cetak digital printing: stiker, banner, kartu nama, DTF kaos, print dokumen. Order mudah via WhatsApp. 10.000+ customer. Cepat, custom, harga terjangkau.",
  keywords: [
    "cetak stiker",
    "digital printing",
    "kartu nama",
    "DTF kaos",
    "print dokumen",
    "percetakan",
    "Bekasi",
  ],
  icons: {
    icon: "/assets/brand/logo-tab.webp",
    apple: "/assets/brand/logo-tab.webp",
  },
  openGraph: {
    locale: "id_ID",
    type: "website",
    siteName: "Bisa Print",
    title: "Bisa Print — Percetakan Digital Bekasi",
    description:
      "Jasa cetak digital printing: stiker, banner, kartu nama, DTF kaos, print dokumen. Order mudah via WhatsApp.",
    url: "https://bisaprint.com",
    images: [{ url: "/assets/brand/og-image.webp", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bisa Print — Percetakan Digital Bekasi",
    description:
      "Jasa cetak digital printing: stiker, banner, kartu nama, DTF kaos, print dokumen. Order mudah via WhatsApp.",
    images: ["/assets/brand/og-image.webp"],
  },
  robots: { index: true, follow: true },
  verification: {
    google: "YOUR_GOOGLE_SITE_VERIFICATION",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Bisa Print",
  image: "https://bisaprint.com/assets/brand/logo-bisaprint.webp",
  telephone: "+6281299435019",
  email: "bisadigitalprint@gmail.com",
  url: "https://bisaprint.com",
  sameAs: ["https://instagram.com/bisaprintshop"],
  priceRange: "Rp",
  openingHours: "Mo-Sa 08:00-17:00",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jl. Dalang I No.45, Pengasinan, Rawalumbu",
    addressLocality: "Kota Bekasi",
    addressRegion: "Jawa Barat",
    postalCode: "17115",
    addressCountry: "ID",
  },
  areaServed: "Bekasi, Jawa Barat, Indonesia",
  description:
    "Jasa cetak digital printing: stiker, banner, kartu nama, DTF kaos, print dokumen. Order mudah via WhatsApp.",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Layanan Cetak",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Digital Printing" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Cetak Dokumen" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Stiker & Label" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "DTF & Apparel" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Cetak Custom" } },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const metaPixelId = process.env.META_PIXEL_ID ?? "";
  const gaId = process.env.GOOGLE_ANALYTICS_ID ?? "";
  const midtransClientKey = getMidtransClientKey();
  const midtransSnapUrl = midtransClientKey
    ? `${getMidtransBaseUrl().replace("api", "app")}/snap/snap.js?client-key=${midtransClientKey}`
    : null;

  return (
    <html lang="id" className={`scroll-smooth ${fredoka.variable} ${poppins.variable}`}>
      <body className="min-h-screen overflow-x-hidden bg-background text-foreground antialiased">
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://app.sandbox.midtrans.com" />
        <MetaPixel pixelId={metaPixelId} />
        <GoogleAnalytics gaId={gaId} />
        <Script
          id="schema-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          strategy="afterInteractive"
        />
        {midtransSnapUrl && (
          <Script
            src={midtransSnapUrl}
            strategy="afterInteractive"
          />
        )}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg">
          Skip to main content
        </a>
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
      </body>
    </html>
  );
}
