export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
  aspectRatio?: "square" | "portrait" | "landscape";
}

// Poster showcase brand BisaPrint — mockup produk per kategori.
// File: public/assets/portfolio/*.webp (779×972 ≈ 4:5)
export const portfolioItems: PortfolioItem[] = [
  {
    id: "pf-001",
    title: "Media Promosi",
    category: "Brosur, Poster, Banner, Voucher",
    image: "/assets/portfolio/cetak-promosi.webp",
    aspectRatio: "portrait",
  },
  {
    id: "pf-002",
    title: "Dokumen & Jilid",
    category: "Print, Skripsi, Laminating",
    image: "/assets/portfolio/cetak-dokumen.webp",
    aspectRatio: "portrait",
  },
  {
    id: "pf-003",
    title: "Sablon & Apparel",
    category: "DTF Kaos, Totebag, Polo, Topi",
    image: "/assets/portfolio/sablon.webp",
    aspectRatio: "portrait",
  },
  {
    id: "pf-004",
    title: "Stiker, Label & Sertifikat",
    category: "Stiker Vinyl, Label UMKM, Kartu Nama",
    image: "/assets/portfolio/terbaik.webp",
    aspectRatio: "portrait",
  },
  {
    id: "pf-005",
    title: "Produk Custom",
    category: "Undangan, Packaging, Merch Event",
    image: "/assets/portfolio/custom-produk.webp",
    aspectRatio: "portrait",
  },
];
