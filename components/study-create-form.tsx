"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Upload, Loader2, FileText } from "lucide-react";
import { saturdaysInMonth, MONTH_NAMES } from "@/lib/saturdays";

function formatDay(dateStr: string) {
  const [, , d] = dateStr.split("-");
  return Number(d);
}

export function StudyCreateForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const saturdays = useMemo(
    () => saturdaysInMonth(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  );

  function changeMonth(delta: number) {
    setCursor((c) => {
      let month = c.month + delta;
      let year = c.year;
      if (month < 0) {
        month = 11;
        year -= 1;
      } else if (month > 11) {
        month = 0;
        year += 1;
      }
      return { year, month };
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedDate) {
      setError("Escolha um sábado.");
      return;
    }

    setIsSubmitting(true);
    try {
      const form = e.currentTarget;
      const raw = new FormData(form);
      const formData = new FormData();
      formData.append("study_date", selectedDate);
      for (const [key, value] of raw.entries()) {
        if (key === "pdf") continue;
        formData.append(key, value);
      }
      const pdfInput = form.elements.namedItem("pdf") as HTMLInputElement;
      const file = pdfInput.files?.[0];
      if (file) formData.append("pdf", file);

      const res = await fetch("/api/studies/create", { method: "POST", body: formData });
      const body: { ok?: boolean; error?: string } = await res.json();

      if (!res.ok || !body.ok) {
        throw new Error(body.error || `Falha ao publicar (status ${res.status}).`);
      }

      setSuccess(true);
      formRef.current?.reset();
      setFileName(null);
      setSelectedDate(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido ao publicar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="ibau-card space-y-4 p-5">
      <p className="text-sm font-semibold">Publicar novo estudo</p>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          Estudo publicado para todas as células!
        </p>
      )}

      <div>
        <label className="mb-2 block text-xs font-medium text-neutral-500">
          Sábado do estudo
        </label>
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100"
          >
            <ChevronLeft size={16} />
          </button>
          <p className="text-sm font-medium">
            {MONTH_NAMES[cursor.month]} {cursor.year}
          </p>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {saturdays.map((date) => (
            <button
              key={date}
              type="button"
              onClick={() => setSelectedDate(date)}
              className={`rounded-lg border py-2 text-sm font-medium transition ${
                selectedDate === date
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {formatDay(date)}
            </button>
          ))}
        </div>
      </div>

      <input
        name="title"
        required
        placeholder="Título do estudo"
        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
      />
      <textarea
        name="content"
        rows={5}
        placeholder="Resumo, tópicos ou perguntas (opcional se o PDF já tiver tudo)"
        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
      />

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">
          Arquivo do estudo (PDF)
        </label>
        <label
          htmlFor="study-pdf"
          className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center transition hover:border-neutral-900 hover:bg-neutral-100"
        >
          {fileName ? <FileText size={20} className="text-neutral-500" /> : <Upload size={20} className="text-neutral-400" />}
          <span className="text-sm font-medium text-neutral-600">
            {fileName ?? "Toque para escolher um PDF"}
          </span>
          <input
            id="study-pdf"
            type="file"
            name="pdf"
            accept="application/pdf"
            className="sr-only"
            onChange={(e) => setFileName(e.currentTarget.files?.[0]?.name ?? null)}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? "Publicando..." : "Publicar para todas as células"}
      </button>
    </form>
  );
}
