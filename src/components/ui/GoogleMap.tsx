"use client";

import { MapPin } from "lucide-react";

type GoogleMapProps = {
  /** Nama tempat yang ditampilkan di fallback */
  placeName?: string;
  /** Tinggi iframe, default 400 */
  height?: number;
  className?: string;
};

/**
 * Embed Google Maps menggunakan Maps Embed API.
 * Jika NEXT_PUBLIC_GOOGLE_MAPS_API_KEY belum diisi, tampilkan fallback link.
 *
 * Koordinat: PT Harmony Sistem, Kota Bekasi
 */
export default function GoogleMap({
  placeName = "PT Harmony Sistem, Kota Bekasi",
  height = 400,
  className = "",
}: GoogleMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  // Koordinat Kota Bekasi (pusat)
  const lat = -6.2383;
  const lng = 106.9756;
  const zoom = 15;

  if (!apiKey) {
    // Fallback: tombol buka Google Maps di tab baru
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}`;
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gray-100 rounded-xl border border-border gap-4 ${className}`}
        style={{ height }}
      >
        <div className="p-4 bg-white rounded-full shadow">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        <div className="text-center px-6">
          <p className="font-semibold text-foreground">{placeName}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Kota Bekasi, Jawa Barat
          </p>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          <MapPin className="w-4 h-4" />
          Buka di Google Maps
        </a>
        <p className="text-xs text-muted-foreground">
          Tambahkan NEXT_PUBLIC_GOOGLE_MAPS_API_KEY untuk embed peta
        </p>
      </div>
    );
  }

  const src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(placeName)}&center=${lat},${lng}&zoom=${zoom}`;

  return (
    <div className={`rounded-xl overflow-hidden border border-border ${className}`} style={{ height }}>
      <iframe
        title={`Peta lokasi ${placeName}`}
        src={src}
        width="100%"
        height={height}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
