"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, CalendarPlus, Ticket } from "lucide-react";
import { useCroppedImagePicker } from "@/components/use-cropped-image-picker";

export function EventCreateForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pricing, setPricing] = useState<"gratuito" | "pago">("gratuito");
  const { croppedFile, onSelect, modal } = useCroppedImagePicker(3 / 4);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const form = e.currentTarget;
      const raw = new FormData(form);
      const formData = new FormData();
      for (const [key, value] of raw.entries()) {
        if (key === "poster") continue;
        formData.append(key, value);
      }
      formData.set("is_free", pricing);
      if (croppedFile) formData.append("poster", croppedFile);

      const res = await fetch("/api/events/create", { method: "POST", body: formData });
      const body: { ok?: boolean; error?: string } = await res.json();
      if (!res.ok || !body.ok) {
        throw new Error(body.error || `Falha ao criar evento (status ${res.status}).`);
      }

      setSuccess(true);
      formRef.current?.reset();
      setPricing("gratuito");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido ao criar o evento.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none focus:border-[#14532d]";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="ibau-card space-y-3 p-5">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <CalendarPlus size={16} /> Novo evento
      </p>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          Evento publicado!
        </p>
      )}

      <input name="title" required placeholder="Nome do evento" className={inputCls} />
      <input name="subtitle" placeholder="Subtítulo / chamada (opcional)" className={inputCls} />

      <div className="grid grid-cols-3 gap-2">
        <input type="date" name="event_date" required className={`${inputCls} col-span-3`} />
        <input type="time" name="start_time" className={`${inputCls} col-span-1`} />
        <input type="time" name="end_time" className={`${inputCls} col-span-1`} />
        <input
          type="number"
          name="capacity"
          placeholder="Vagas"
          className={`${inputCls} col-span-1`}
        />
      </div>

      <input name="location" placeholder="Local" className={inputCls} />
      <textarea name="description" rows={3} placeholder="Descrição" className={inputCls} />

      {/* Inscrição */}
      <div className="rounded-xl border border-neutral-200 p-3">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          <Ticket size={12} /> Inscrição
        </p>
        <div className="mb-2.5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPricing("gratuito")}
            className={`rounded-lg border-2 py-2 text-sm font-medium transition ${
              pricing === "gratuito"
                ? "border-[#14532d] bg-[#14532d]/5 text-[#14532d]"
                : "border-neutral-200 text-neutral-500"
            }`}
          >
            Gratuito
          </button>
          <button
            type="button"
            onClick={() => setPricing("pago")}
            className={`rounded-lg border-2 py-2 text-sm font-medium transition ${
              pricing === "pago"
                ? "border-[#f0a922] bg-[#f0a922]/10 text-[#a06d09]"
                : "border-neutral-200 text-neutral-500"
            }`}
          >
            Pago
          </button>
        </div>

        {pricing === "pago" && (
          <div className="relative mb-2.5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
              R$
            </span>
            <input
              name="price"
              inputMode="decimal"
              placeholder="0,00"
              className={`${inputCls} pl-9`}
            />
          </div>
        )}

        <label className="block text-[11px] font-medium text-neutral-500">
          Prazo de inscrição (opcional)
        </label>
        <input type="date" name="registration_deadline" className={`${inputCls} mt-1`} />
      </div>

      <label
        htmlFor="event-poster"
        className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center transition hover:border-[#14532d]"
      >
        <Upload size={20} className="text-neutral-400" />
        <span className="text-sm font-medium text-neutral-600">
          {croppedFile ? croppedFile.name : "Banner do evento"}
        </span>
        <input
          id="event-poster"
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
        {isSubmitting ? "Publicando..." : "Publicar evento"}
      </button>

      {modal}
    </form>
  );
}
