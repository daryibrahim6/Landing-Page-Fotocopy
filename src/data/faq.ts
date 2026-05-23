export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    id: "faq-001",
    question: "Apakah ada minimum order?",
    answer:
      "Minimum order tergantung jenis layanan. Untuk digital print dan dokumen biasanya mulai 1 pcs, sedangkan sablon dan beberapa produk UMKM ada minimum quantity. Chat kami dulu untuk cek detail produk yang kamu butuhkan.",
  },
  {
    id: "faq-002",
    question: "Format file apa yang bisa dikirim?",
    answer:
      "Kami menerima PDF, AI, CDR, PSD, dan JPG/PNG resolusi tinggi. Untuk hasil terbaik, kirim file desain dalam format asli (AI/CDR) atau PDF dengan outline/font sudah di-convert.",
  },
  {
    id: "faq-003",
    question: "Metode pembayaran apa yang tersedia?",
    answer:
      "Pembayaran bisa via transfer bank dan tunai di toko. Untuk order besar, kami bisa bantu bagi termin setelah detail order disepakati.",
  },
  {
    id: "faq-004",
    question: "Berapa lama waktu pengerjaan?",
    answer:
      "Sebagian besar order standar selesai di hari yang sama selama file siap sebelum jam operasional. Order urgent atau volume besar akan kami infokan estimasi khusus.",
  },
  {
    id: "faq-005",
    question: "Apakah ada layanan antar atau harus pickup?",
    answer:
      "Pickup di toko Bekasi tersedia. Untuk area Bekasi dan sekitarnya, pengiriman bisa diatur dengan biaya sesuai jarak dan ukuran order.",
  },
  {
    id: "faq-006",
    question: "Bagaimana kebijakan revisi desain?",
    answer:
      "Revisi minor sebelum proses cetak biasanya gratis 1x. Revisi setelah cetak atau perubahan besar mungkin dikenakan biaya tambahan sesuai material yang sudah dipakai.",
  },
  {
    id: "faq-007",
    question: "Bisa cetak ukuran custom?",
    answer:
      "Bisa. Kami melayani ukuran custom untuk banner, stiker, dan berbagai kebutuhan digital print. Kirim ukuran final dan file desain untuk estimasi harga.",
  },
  {
    id: "faq-008",
    question: "Ada paket khusus untuk order UMKM dalam jumlah banyak?",
    answer:
      "Ada. Untuk order bulk UMKM (kartu nama, kemasan, merch, dan lainnya) kami berikan penawaran harga paket. Semakin banyak quantity, semakin hemat per pcs.",
  },
];
