import Link from "next/link";
import { CheckCircle } from "lucide-react";

interface Props {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { orderId } = await searchParams;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="size-10 text-green-600" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
          Pembayaran Berhasil!
        </h1>
        <p className="mt-3 text-[var(--color-text-secondary)]">
          Terima kasih, pesanan kamu sudah kami terima dan akan segera diproses.
        </p>
        {orderId && (
          <p className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
            ID Pesanan: <span className="font-mono font-bold text-[var(--color-text-primary)]">{orderId}</span>
          </p>
        )}
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          Admin kami akan menghubungi kamu via WhatsApp untuk konfirmasi lebih lanjut.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
