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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        alert("Hanya file gambar (JPG, PNG) yang didukung untuk MVP ini.");
        return;
      }

      if (file.type === "application/pdf") {
        alert("Untuk MVP ini, silakan upload file gambar (JPG/PNG). Support PDF akan segera hadir.");
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        alert("File terlalu besar. Maksimal 10 MB untuk simulasi.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onFileUpload(file, dataUrl);
      };
      reader.onerror = () => {
        alert("Gagal membaca file. Coba file lain.");
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
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-[var(--color-border)] bg-[var(--color-bg-soft)] hover:border-primary hover:bg-primary/5",
        className,
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
        }}
      />

      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
        <Upload className="size-7 text-primary" />
      </div>

      <p className="mt-4 text-center text-sm font-semibold text-[var(--color-text-primary)]">
        {isDragging ? "Lepaskan file di sini..." : "Drag & drop design kamu di sini"}
      </p>
      <p className="mt-1 text-center text-xs text-[var(--color-text-muted)]">
        atau klik untuk pilih file &middot; JPG, PNG
      </p>
    </div>
  );
}
