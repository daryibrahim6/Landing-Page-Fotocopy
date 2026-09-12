import type { ReactNode } from "react";

// Admin surface intentionally has no marketing chrome — just the content area.
// Auth is enforced by proxy.ts + each route handler, not by this layout.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main-content" className="min-h-screen bg-[var(--color-bg-soft)]">
      {children}
    </main>
  );
}
