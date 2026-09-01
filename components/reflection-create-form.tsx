"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, Video } from "lucide-react";
import { useCroppedImagePicker } from "@/components/use-cropped-image-picker";

const inputCls =
  "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none focus:border-[#14532d]";

export function ReflectionCreateForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [kind, setKind] = useState<"reflexao" | "leitura" | "oracao">("reflexao");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { croppedFile, onSelect, modal } = useCroppedImagePicker(16 / 9);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      const raw = new FormData(e.currentTarget);
      const fd = new FormData();
      for (const [k, v] of raw.entries()) {
        if (k === "thumbnail") continue;
        fd.append(k, v);
      }
      fd.set("kind", kind);
      if (croppedFile) fd.append("thumbnail", croppedFile);

      const res = await fetch("/api/reflections/create", { method: "POST", body: fd });
      const body: { ok?: boolean; error?: string } = await res.json();
      if (!res.ok || !body.ok) throw new Error(body.error || `Falha (status ${res.status}).`);

      setSuccess(true);
      formRef.current?.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao publicar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const kinds = [
    { key: "reflexao" as const, label: "Reflexão" },
    { key: "leitura" as const, label: "Leitura guiada" },
    { key: "oracao" as const, label: "Oração guiada" },
  ];

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="ibau-card space-y-3 p-5">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Video size={16} /> Publicar reflexão
      </p>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">Publicado!</p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {kinds.map((k) => (
          <button
            key={k.key}
            type="button"
            onClick={() => setKind(k.key)}
            className={`rounded-lg border-2 py-2 text-xs font-medium transition ${
              kind === k.key
                ? "border-[#14532d] bg-[#14532d]/5 text-[#14532d]"
                : "border-neutral-200 text-neutral-500"
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      <input name="title" required placeholder="Título" className={inputCls} />
      <input name="speaker_name" placeholder="Quem ministra (ex: Pr. João)" className={inputCls} />
      <input name="verse_reference" placeholder="Base bíblica (opcional)" className={inputCls} />
      <textarea name="description" rows={3} placeholder="Descrição" className={inputCls} />

      <input
        name="video_url"
        placeholder="Link do vídeo (YouTube ou Vimeo)"
        className={inputCls}
      />
      <p className="-mt-1 text-[11px] text-neutral-400">
        A capa é puxada do YouTube automaticamente se você não enviar uma.
      </p>

      <div className="grid grid-cols-3 gap-2">
        <input type="number" name="duration_min" placeholder="min" className={inputCls} />
        <input type="number" name="duration_max" placeholder="máx" className={inputCls} />
        <input
          type="date"
          name="published_at"
          defaultValue={new Date().toISOString().slice(0, 10)}
          className={inputCls}
        />
      </div>

      <label
        htmlFor="reflection-thumb"
        className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-5 text-center transition hover:border-[#14532d]"
      >
        <Upload size={18} className="text-neutral-400" />
        <span className="text-sm font-medium text-neutral-600">
          {croppedFile ? croppedFile.name : "Capa personalizada (opcional)"}
        </span>
        <input
          id="reflection-thumb"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={onSelect}
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="ibau-pressable flex w-full items-center justify-center gap-2 rounded-lg bg-[#14532d] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? "Publicando..." : "Publicar"}
      </button>

      {modal}
    </form>
  );
}
