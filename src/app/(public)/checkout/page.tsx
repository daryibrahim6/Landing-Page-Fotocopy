import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-soft)] pt-24 sm:pt-28">
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        }
      >
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
