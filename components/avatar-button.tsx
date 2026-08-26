"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import { compressImage } from "@/lib/image-compress";

export function AvatarButton({
  avatarUrl,
  initials,
}: {
  avatarUrl: string | null;
  initials: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsUploading(true);

    try {
      const compressed = await compressImage(file, 512, 0.85);
      const formData = new FormData();
      formData.append("photo", compressed);

      const res = await fetch("/api/profile/avatar", { method: "POST", body: formData });
      const body: { ok?: boolean; error?: string; avatarUrl?: string } = await res.json();

      if (!res.ok || !body.ok) {
        throw new Error(body.error || "Falha ao enviar a foto.");
      }

      setPreview(body.avatarUrl ?? null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar a foto.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/15 text-sm font-semibold text-white shadow-[0_2px_6px_rgba(0,0,0,0.3)] ring-2 ring-white/25"
      >
        {preview ? (
          <Image src={preview} alt="Sua foto" fill className="object-cover" />
        ) : (
          initials
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition hover:bg-black/40 hover:opacity-100">
          {isUploading ? (
            <Loader2 size={14} className="animate-spin text-white" />
          ) : (
            <Camera size={14} className="text-white" />
          )}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
      />
      {error && (
        <p className="absolute right-0 top-12 z-20 w-48 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 shadow-lg">
          {error}
        </p>
      )}
    </div>
  );
}
