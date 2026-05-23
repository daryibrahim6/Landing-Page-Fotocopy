export type TestimonialSource = "whatsapp" | "google" | "marketplace";

export interface Testimonial {
  id: string;
  name: string;
  quote: string;
  rating: number;
  source: TestimonialSource;
  screenshot: string;
}

// TODO: Replace placeholder screenshot paths ("") with real testimonial screenshots when client provides them.
export const testimonials: Testimonial[] = [
  {
    id: "bt-001",
    name: "Dewi Lestari",
    quote:
      "Warna banner toko saya keluar tajam dan tidak pudar. Timnya ramah dan bisa konsultasi desain sebelum cetak.",
    rating: 5,
    source: "whatsapp",
    screenshot: "",
  },
  {
    id: "bt-002",
    name: "Rizky Pratama",
    quote:
      "Order stiker produk jam 10 pagi, sorenya sudah bisa diambil. Cocok banget buat UMKM yang butuh cepat.",
    rating: 5,
    source: "whatsapp",
    screenshot: "",
  },
  {
    id: "bt-003",
    name: "Siti Nurhaliza",
    quote:
      "Harga jilid skripsi jelas dari awal, tidak ada biaya tambahan aneh-aneh. Hasil rapi dan sesuai deadline kampus.",
    rating: 5,
    source: "google",
    screenshot: "",
  },
  {
    id: "bt-004",
    name: "Budi Santoso",
    quote:
      "Cetak dokumen kantor rutin di sini, kualitas konsisten dan harganya masih masuk akal untuk volume besar.",
    rating: 5,
    source: "google",
    screenshot: "",
  },
  {
    id: "bt-005",
    name: "Ayu Maharani",
    quote:
      "Sablon kaos komunitas 30 pcs, warnanya cerah dan ukuran sesuai. Proses order lewat marketplace juga mudah.",
    rating: 5,
    source: "marketplace",
    screenshot: "",
  },
  {
    id: "bt-006",
    name: "Fajar Nugroho",
    quote:
      "Paket kartu nama + stiker kemasan untuk brand kecil saya dapat harga paket yang hemat. Hasilnya profesional.",
    rating: 5,
    source: "marketplace",
    screenshot: "",
  },
];
