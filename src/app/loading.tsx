export default function RootLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
        <p className="text-sm font-medium text-[var(--color-text-muted)]">
          Memuat...
        </p>
      </div>
    </div>
  );
}
