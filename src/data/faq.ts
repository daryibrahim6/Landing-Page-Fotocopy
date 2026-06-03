export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    id: "faq-001",
    question: "Apakah bisa cetak satuan?",
    answer:
      "Bisa! Kami melayani cetak satuan maupun jumlah banyak. Untuk digital print dan dokumen biasanya mulai 1 pcs.",
  },
  {
    id: "faq-002",
    question: "Apakah bisa order lewat WhatsApp?",
    answer:
      "Tentu. Order lewat WhatsApp adalah cara termudah. Kamu tinggal kirim detail produk dan file desain, admin akan bantu estimasi harga.",
  },
  {
    id: "faq-003",
    question: "Apakah bisa desain sekalian?",
    answer:
      "Bisa. Tim kami siap bantu desain untuk kebutuhan cetak kamu. Biaya desain tergantung tingkat kerumitan — konsultasi dulu ya.",
  },
  {
    id: "faq-004",
    question: "Berapa lama proses produksi?",
    answer:
      "Order standar biasanya selesai 1-2 hari kerja. Order yang lebih besar atau custom bisa 3-5 hari kerja tergantung jumlah dan jenis produk.",
  },
  {
    id: "faq-005",
    question: "Apakah bisa kirim ke luar kota?",
    answer:
      "Bisa. Kami melayani pengiriman ke luar kota via jasa ekspedisi. Ongkos kirim menyesuaikan alamat tujuan dan berat paket.",
  },
  {
    id: "faq-006",
    question: "File desain harus format apa?",
    answer:
      "Kami terima PDF, PNG, JPG, CDR, AI, dan PSD. Resolusi minimal 300 dpi, warna CMYK disarankan. Untuk teks, convert ke outline atau embed font.",
  },
  {
    id: "faq-007",
    question: "Apakah file bisa dicek dulu?",
    answer:
      "Ya! File kamu akan kami cek dulu sebelum diproses. Kalau ada yang perlu diperbaiki, admin akan kasih tahu lewat WA.",
  },
  {
    id: "faq-008",
    question: "Apakah bisa ambil langsung di toko?",
    answer:
      "Bisa. Kamu bisa ambil langsung di toko kami di Bekasi. Jam operasional: Senin–Sabtu, 08.00–18.00 WIB.",
  },
  {
    id: "faq-009",
    question: "Pembayaran lewat apa saja?",
    answer:
      "Pembayaran via transfer bank (BCA, Mandiri, BRI) dan QRIS. Untuk order besar bisa diatur termin setelah detail order disepakati.",
  },
  {
    id: "faq-010",
    question: "Apakah bisa konsultasi bahan dulu?",
    answer:
      "Tentu! Admin kami siap bantu pilihkan bahan yang paling cocok untuk kebutuhan cetak kamu. Konsultasi gratis via WhatsApp.",
  },
];
