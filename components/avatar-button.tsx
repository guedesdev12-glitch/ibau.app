"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import { useCroppedImagePicker } from "@/components/use-cropped-image-picker";

export function AvatarButton({
  avatarUrl,
  initials,
}: {
  avatarUrl: string | null;
  initials: string;
}) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [error, setError] = useState<string | null>(null);
  const { croppedFile, onSelect, modal, reset } = useCroppedImagePicker(1);

  useEffect(() => {
    if (!croppedFile) return;

    (async () => {
      setError(null);
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("photo", croppedFile);

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
        reset();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [croppedFile]);

  return (
    <div className="relative">
      <label className="relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-white/15 text-sm font-semibold text-white shadow-[0_2px_6px_rgba(0,0,0,0.3)] ring-2 ring-white/25">
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
        <input type="file" accept="image/*" className="sr-only" onChange={onSelect} />
      </label>
      {error && (
        <p className="absolute right-0 top-12 z-20 w-48 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 shadow-lg">
          {error}
        </p>
      )}
      {modal}
    </div>
  );
}
