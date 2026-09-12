import type { ReactNode } from "react";
import Script from "next/script";
import { getMidtransBaseUrl, getMidtransClientKey } from "@/lib/midtrans";

export default function CheckoutLayout({
  children,
}: {
  children: ReactNode;
}) {
  const midtransClientKey = getMidtransClientKey();
  const midtransSnapUrl = midtransClientKey
    ? `${getMidtransBaseUrl().replace("api", "app")}/snap/snap.js?client-key=${midtransClientKey}`
    : null;

  return (
    <>
      {midtransSnapUrl && (
        <>
          <link
            rel="preconnect"
            href={getMidtransBaseUrl().replace("api", "app")}
          />
          <Script
            id="midtrans-snap"
            src={midtransSnapUrl}
            strategy="afterInteractive"
          />
        </>
      )}
      {children}
    </>
  );
}
