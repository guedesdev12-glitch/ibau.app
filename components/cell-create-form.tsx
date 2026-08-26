"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { useCroppedImagePicker } from "@/components/use-cropped-image-picker";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const GENERATIONS = ["Kids", "Adolescentes", "Jovens", "Adultos", "Todas as idades"];

type Member = { id: string; full_name: string };

export function CellCreateForm({ members }: { members: Member[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaderId, setLeaderId] = useState("");
  const [coLeaderId, setCoLeaderId] = useState("");
  const { croppedFile, onSelect, modal } = useCroppedImagePicker(4 / 3);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const form = e.currentTarget;
      const raw = new FormData(form);

      const formData = new FormData();
      for (const [key, value] of raw.entries()) {
        if (key === "photo") continue;
        formData.append(key, value);
      }
      if (croppedFile) {
        formData.append("photo", croppedFile);
      }

      const res = await fetch("/api/cells/create", { method: "POST", body: formData });

      let body: { ok?: boolean; error?: string; cellId?: string } = {};
      try {
        body = await res.json();
      } catch {
        throw new Error(`O servidor respondeu de forma inesperada (status ${res.status}).`);
      }

      if (!res.ok || !body.ok) {
        throw new Error(body.error || `Falha ao criar célula (status ${res.status}).`);
      }

      router.push(`/dashboard/celulas/${body.cellId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido ao criar a célula.");
      setIsSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="ibau-card space-y-4 p-5">
      <p className="text-sm font-semibold">Nova célula</p>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Nome da célula</label>
        <input
          name="name"
          required
          placeholder="Ex: Célula Invictus"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Endereço completo</label>
        <input
          name="address"
          placeholder="Rua, número, complemento"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">Bairro</label>
          <input
            name="neighborhood"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">Geração</label>
          <select
            name="generation"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
          >
            <option value="">Selecione</option>
            {GENERATIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">Dia</label>
          <select
            name="meeting_weekday"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
          >
            <option value="">Dia da semana</option>
            {WEEKDAYS.map((day, idx) => (
              <option key={day} value={idx}>
                {day}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">Horário</label>
          <input
            type="time"
            name="meeting_time"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Líder</label>
        <select
          name="leader_id"
          value={leaderId}
          onChange={(e) => setLeaderId(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
        >
          <option value="">Selecione o líder</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Líder auxiliar</label>
        <select
          name="co_leader_id"
          value={coLeaderId}
          onChange={(e) => setCoLeaderId(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
        >
          <option value="">Selecione o líder auxiliar</option>
          {members
            .filter((m) => m.id !== leaderId)
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-neutral-500">Trabalhadores</label>
        <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-neutral-200 p-2">
          {members
            .filter((m) => m.id !== leaderId && m.id !== coLeaderId)
            .map((m) => (
              <label key={m.id} className="flex items-center gap-2 px-1 py-1 text-sm">
                <input type="checkbox" name="worker_id" value={m.id} className="h-4 w-4 accent-neutral-900" />
                {m.full_name}
              </label>
            ))}
          {members.length === 0 && (
            <p className="px-1 py-1 text-xs text-neutral-400">Nenhum membro cadastrado ainda.</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Foto da célula</label>
        <label
          htmlFor="cell-photo"
          className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center transition hover:border-neutral-900 hover:bg-neutral-100"
        >
          <Upload size={20} className="text-neutral-400" />
          <span className="text-sm font-medium text-neutral-600">
            {croppedFile ? croppedFile.name : "Toque para escolher uma foto"}
          </span>
          <input
            id="cell-photo"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onSelect}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? "Criando..." : "Criar célula"}
      </button>

      {modal}
    </form>
  );
}
