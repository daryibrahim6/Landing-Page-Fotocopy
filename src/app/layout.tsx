import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Nunito, Nunito_Sans } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BisaPrint - Percetakan Digital Bekasi",
  description:
    "Digital printing, sablon, dokumen, dan kebutuhan UMKM di Bekasi. Hasil premium, harga bersahabat. Pesan via WhatsApp.",
  icons: {
    icon: "/assets/brand/logo-tab.png",
    apple: "/assets/brand/logo-tab.png",
  },
  openGraph: {
    locale: "id_ID",
    type: "website",
    title: "BisaPrint - Percetakan Digital Bekasi",
    description:
      "Digital printing, sablon, dokumen, dan kebutuhan UMKM di Bekasi. Hasil premium, harga bersahabat. Pesan via WhatsApp.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "BisaPrint Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="id" className={`scroll-smooth ${nunito.variable} ${nunitoSans.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
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
