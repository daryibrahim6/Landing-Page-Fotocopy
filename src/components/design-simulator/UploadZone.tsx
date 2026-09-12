"use client";

import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB — keeps dataURL memory sane

interface UploadZoneProps {
  onFileUpload: (file: File, dataUrl: string) => void;
  className?: string;
}

export function UploadZone({ onFileUpload, className }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        setError("Hanya file gambar (JPG, PNG) yang didukung untuk MVP ini.");
        return;
      }

      if (file.type === "application/pdf") {
        setError("Untuk MVP ini, silakan upload file gambar (JPG/PNG). Support PDF akan segera hadir.");
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError("File terlalu besar. Maksimal 10 MB untuk simulasi.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setError(null);
        const dataUrl = e.target?.result as string;
        onFileUpload(file, dataUrl);
      };
      reader.onerror = () => {
        setError("Gagal membaca file. Coba file lain.");
      };
      reader.readAsDataURL(file);
    },
    [onFileUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload file desain – klik atau tekan Enter untuk memilih file"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-[var(--color-border)] bg-[var(--color-bg-soft)] hover:border-primary hover:bg-primary/5",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />

        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Upload className="size-7 text-primary" />
        </div>

        <p className="mt-4 text-center text-sm font-semibold text-[var(--color-text-primary)]">
          {isDragging ? "Lepaskan file di sini..." : "Drag & drop design kamu di sini"}
        </p>
        <p className="mt-1 text-center text-xs text-[var(--color-text-muted)]">
          atau klik untuk pilih file &middot; JPG, PNG
        </p>
      </div>
      {error && (
        <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
