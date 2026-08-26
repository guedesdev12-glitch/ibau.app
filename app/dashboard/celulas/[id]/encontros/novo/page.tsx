import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createMeeting } from "@/app/actions/meetings";

export default async function NovoEncontroPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { id } = await params;
  const { date } = await searchParams;
  const createMeetingForCell = createMeeting.bind(null, id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/dashboard/celulas/${id}`}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-semibold">Registrar encontro</h1>
      </div>

      <p className="mb-3 text-sm font-medium text-neutral-500">Informações do encontro</p>

      <form action={createMeetingForCell} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-neutral-500">Data</label>
            <input
              type="date"
              name="meeting_date"
              defaultValue={date}
              required
              className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">Hora de início</label>
            <input
              type="time"
              name="start_time"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">Local</label>
          <input
            type="text"
            name="location"
            placeholder="Ex: Casa do Mateus e Júlia"
            className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">Tema / Palavra</label>
          <input
            type="text"
            name="theme"
            placeholder="Ex: Fé que move montanhas"
            className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">
            Tempo de duração (minutos)
          </label>
          <input
            type="number"
            name="duration_minutes"
            placeholder="Ex: 90"
            className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
          />
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-xl bg-[#173B2C] py-3 text-sm font-medium text-white"
        >
          Salvar encontro
        </button>
        <p className="text-center text-xs text-neutral-400">
          Depois de salvar, você poderá adicionar equipe, visitantes, oferta e observações.
        </p>
      </form>
    </main>
  );
}
