"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Upload, Loader2 } from "lucide-react";
import { compressImage } from "@/lib/image-compress";

export function BannerUploadForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState("Enviando...");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const form = e.currentTarget;
      const fileInput = form.elements.namedItem("image") as HTMLInputElement;
      const original = fileInput.files?.[0];

      if (!original) {
        throw new Error("Selecione uma imagem.");
      }

      setStatusText("Preparando imagem...");
      const compressed = await compressImage(original);

      const formData = new FormData();
      formData.append("image", compressed);
      const titleInput = form.elements.namedItem("title") as HTMLInputElement;
      formData.append("title", titleInput?.value ?? "");

      setStatusText("Enviando...");
      const res = await fetch("/api/banners/upload", {
        method: "POST",
        body: formData,
      });

      let body: { ok?: boolean; error?: string } = {};
      try {
        body = await res.json();
      } catch {
        throw new Error(`O servidor respondeu de forma inesperada (status ${res.status}).`);
      }

      if (!res.ok || !body.ok) {
        throw new Error(body.error || `Falha ao enviar (status ${res.status}).`);
      }

      setSuccess(true);
      formRef.current?.reset();
      setFileName(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido ao enviar a imagem.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="ibau-card mb-6 p-5">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <ImagePlus size={16} /> Adicionar foto ou aviso
      </p>

      {error && (
        <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      {success && (
        <p className="mb-3 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          Foto publicada no carrossel!
        </p>
      )}

      <label
        htmlFor="banner-image"
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center transition hover:border-neutral-900 hover:bg-neutral-100"
      >
        <Upload size={24} className="text-neutral-400" />
        <span className="text-sm font-medium text-neutral-600">
          {fileName ?? "Toque para escolher uma foto"}
        </span>
        <span className="text-xs text-neutral-400">JPG ou PNG — a foto é ajustada automaticamente</span>
        <input
          id="banner-image"
          type="file"
          name="image"
          accept="image/*"
          required
          className="sr-only"
          onChange={(e) => setFileName(e.currentTarget.files?.[0]?.name ?? null)}
        />
      </label>

      <input
        type="text"
        name="title"
        placeholder="Legenda / aviso (opcional)"
        className="mt-3 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? statusText : "Publicar no carrossel"}
      </button>
    </form>
  );
}
