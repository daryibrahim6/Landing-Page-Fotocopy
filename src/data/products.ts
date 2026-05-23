import type { Product } from "@/types";

// TODO: Replace placeholder image paths ("") with real product image files when client provides them.
export const products: Product[] = [
  {
    id: "bp-dp-001",
    name: "Banner & Spanduk",
    category: "digital-print",
    description:
      "Cetak banner dan spanduk indoor/outdoor dengan warna tajam untuk promosi toko dan event.",
    startingPrice: 35000,
    image: "",
    whatsappMessage:
      "Halo BisaPrint, saya mau cetak banner/spanduk. Bisa bantu hitung harga?",
    featured: true,
  },
  {
    id: "bp-dp-002",
    name: "Stiker Vinyl & Label",
    category: "digital-print",
    description:
      "Stiker produk, label kemasan, dan vinyl cutting untuk branding UMKM yang rapi.",
    startingPrice: 25000,
    image: "",
    whatsappMessage:
      "Halo BisaPrint, saya tertarik cetak stiker vinyl. Mau konsultasi ukuran dan jumlah.",
  },
  {
    id: "bp-doc-001",
    name: "Fotokopi & Print Dokumen",
    category: "document",
    description:
      "Cetak dokumen hitam putih atau warna untuk arsip kantor, sekolah, dan kebutuhan administrasi.",
    startingPrice: 500,
    image: "",
    whatsappMessage:
      "Halo BisaPrint, saya butuh cetak dokumen. Bisa info harga per lembar?",
  },
  {
    id: "bp-doc-002",
    name: "Jilid Skripsi & Laporan",
    category: "document",
    description:
      "Print + jilid softcover/hardcover untuk skripsi, laporan magang, dan tugas akhir.",
    startingPrice: 45000,
    image: "",
    whatsappMessage:
      "Halo BisaPrint, saya mau print dan jilid skripsi. Bisa tanya paket lengkapnya?",
  },
  {
    id: "bp-sab-001",
    name: "Sablon Kaos DTF",
    category: "sablon",
    description:
      "Sablon kaos satuan atau lusinan dengan hasil warna cerah, cocok untuk komunitas dan merch.",
    startingPrice: 65000,
    image: "",
    whatsappMessage:
      "Halo BisaPrint, saya mau pesan sablon kaos DTF. Bisa konsultasi desain dan ukuran?",
    featured: true,
  },
  {
    id: "bp-sab-002",
    name: "Sablon Totebag & Merchandise",
    category: "sablon",
    description:
      "Sablon totebag, topi, dan merchandise event dengan desain custom sesuai identitas brand.",
    startingPrice: 55000,
    image: "",
    whatsappMessage:
      "Halo BisaPrint, saya butuh sablon totebag untuk event. Mau tanya minimal order.",
  },
  {
    id: "bp-umkm-001",
    name: "Kartu Nama UMKM",
    category: "umkm",
    description:
      "Kartu nama premium dengan finishing rapi untuk owner UMKM yang ingin tampil profesional.",
    startingPrice: 75000,
    image: "",
    whatsappMessage:
      "Halo BisaPrint, saya mau cetak kartu nama UMKM. Bisa info bahan dan harga per box?",
  },
  {
    id: "bp-umkm-002",
    name: "Kemasan & Box Produk",
    category: "umkm",
    description:
      "Box kemasan, paper bag, dan insert produk untuk brand lokal yang siap naik kelas.",
    startingPrice: 120000,
    image: "",
    whatsappMessage:
      "Halo BisaPrint, saya butuh kemasan produk custom. Bisa bantu estimasi harga?",
  },
];
