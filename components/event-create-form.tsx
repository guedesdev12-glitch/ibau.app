"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { compressImage } from "@/lib/image-compress";

export function EventCreateForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      const raw = new FormData(form);
      const posterInput = form.elements.namedItem("poster") as HTMLInputElement;
      const originalPoster = posterInput.files?.[0];

      const formData = new FormData();
      for (const [key, value] of raw.entries()) {
        if (key === "poster") continue;
        formData.append(key, value);
      }
      if (originalPoster) {
        const compressed = await compressImage(originalPoster, 1200, 0.85);
        formData.append("poster", compressed);
      }

      const res = await fetch("/api/events/create", { method: "POST", body: formData });

      let body: { ok?: boolean; error?: string } = {};
      try {
        body = await res.json();
      } catch {
        throw new Error(`O servidor respondeu de forma inesperada (status ${res.status}).`);
      }

      if (!res.ok || !body.ok) {
        throw new Error(body.error || `Falha ao criar evento (status ${res.status}).`);
      }

      setSuccess(true);
      formRef.current?.reset();
      setFileName(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido ao criar o evento.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="ibau-card space-y-3 p-5">
      <p className="text-sm font-semibold">Novo evento</p>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      {success && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          Evento publicado!
        </p>
      )}

      <input
        name="title"
        required
        placeholder="Título do evento"
        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
      />

      <div className="grid grid-cols-2 gap-3">
        <input
          type="date"
          name="event_date"
          required
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
        />
        <input
          type="time"
          name="start_time"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
        />
      </div>

      <input
        name="location"
        placeholder="Local (opcional)"
        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
      />

      <textarea
        name="description"
        placeholder="Descrição (opcional)"
        rows={3}
        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
      />

      <label
        htmlFor="event-poster"
        className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center transition hover:border-neutral-900 hover:bg-neutral-100"
      >
        <Upload size={20} className="text-neutral-400" />
        <span className="text-sm font-medium text-neutral-600">
          {fileName ?? "Pôster do evento (opcional)"}
        </span>
        <input
          id="event-poster"
          type="file"
          name="poster"
          accept="image/*"
          className="sr-only"
          onChange={(e) => setFileName(e.currentTarget.files?.[0]?.name ?? null)}
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? "Publicando..." : "Publicar evento"}
      </button>
    </form>
  );
}
