export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
  aspectRatio?: "square" | "portrait" | "landscape";
}

// TODO: ganti SVG mockup ini dengan foto hasil cetak asli saat owner mengirimkan dokumentasi.
// File ilustrasi: public/assets/portfolio/*.svg
export const portfolioItems: PortfolioItem[] = [
  {
    id: "pf-001",
    title: "Stiker Label Produk UMKM",
    category: "Stiker & Label",
    image: "/assets/portfolio/sticker-sheet.svg",
    aspectRatio: "square",
  },
  {
    id: "pf-002",
    title: "Kartu Nama Premium",
    category: "Digital Print",
    image: "/assets/portfolio/kartu-nama.svg",
    aspectRatio: "portrait",
  },
  {
    id: "pf-003",
    title: "Poster & Banner Event",
    category: "Digital Print",
    image: "/assets/portfolio/poster-banner.svg",
    aspectRatio: "square",
  },
  {
    id: "pf-004",
    title: "Undangan & Kartu Acara",
    category: "Produk Custom",
    image: "/assets/portfolio/undangan.svg",
    aspectRatio: "portrait",
  },
  {
    id: "pf-005",
    title: "Print Dokumen & Jilid",
    category: "Dokumen",
    image: "/assets/portfolio/dokumen-jilid.svg",
    aspectRatio: "landscape",
  },
  {
    id: "pf-006",
    title: "Packaging & Paper Bag",
    category: "Produk Custom",
    image: "/assets/portfolio/packaging-box.svg",
    aspectRatio: "square",
  },
  {
    id: "pf-007",
    title: "Sablon DTF & Merchandise",
    category: "Sablon",
    image: "/assets/portfolio/merch-kaos.svg",
    aspectRatio: "portrait",
  },
];
