export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
  aspectRatio?: "square" | "portrait" | "landscape";
}

// TODO: Replace placeholder image paths ("") with real portfolio image files when client provides them.
export const portfolioItems: PortfolioItem[] = [
  {
    id: "pf-001",
    title: "Banner UMKM Kuliner",
    category: "Digital Print",
    image: "",
    aspectRatio: "landscape",
  },
  {
    id: "pf-002",
    title: "Stiker Produk Skincare",
    category: "Digital Print",
    image: "",
    aspectRatio: "square",
  },
  {
    id: "pf-003",
    title: "Spanduk Grand Opening",
    category: "Digital Print",
    image: "",
    aspectRatio: "portrait",
  },
  {
    id: "pf-004",
    title: "Print Modul Pelatihan",
    category: "Dokumen",
    image: "",
    aspectRatio: "landscape",
  },
  {
    id: "pf-005",
    title: "Jilid Laporan Magang",
    category: "Dokumen",
    image: "",
    aspectRatio: "square",
  },
  {
    id: "pf-006",
    title: "Brosur Informasi Kampus",
    category: "Dokumen",
    image: "",
    aspectRatio: "portrait",
  },
  {
    id: "pf-007",
    title: "Kaos Komunitas Lari",
    category: "Sablon",
    image: "",
    aspectRatio: "square",
  },
  {
    id: "pf-008",
    title: "Sablon Totebag Event",
    category: "Sablon",
    image: "",
    aspectRatio: "landscape",
  },
  {
    id: "pf-009",
    title: "Merch Band Lokal",
    category: "Sablon",
    image: "",
    aspectRatio: "portrait",
  },
  {
    id: "pf-010",
    title: "Kartu Nama Coffee Shop",
    category: "UMKM",
    image: "",
    aspectRatio: "landscape",
  },
  {
    id: "pf-011",
    title: "Box Kemasan Kue Kering",
    category: "UMKM",
    image: "",
    aspectRatio: "square",
  },
  {
    id: "pf-012",
    title: "Paper Bag Brand Fashion",
    category: "UMKM",
    image: "",
    aspectRatio: "portrait",
  },
];
