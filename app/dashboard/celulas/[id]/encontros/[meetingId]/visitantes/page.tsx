import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { addVisitor, setMeetingVisitors } from "@/app/actions/meetings";

export default async function VisitantesPage({
  params,
}: {
  params: Promise<{ id: string; meetingId: string }>;
}) {
  const { id, meetingId } = await params;
  const supabase = await createClient();

  const { data: visitors } = await supabase
    .from("visitors")
    .select("id, full_name")
    .eq("cell_id", id)
    .order("full_name");

  const { data: present } = await supabase
    .from("cell_meeting_visitors")
    .select("visitor_id")
    .eq("meeting_id", meetingId);

  const presentIds = new Set(present?.map((p) => p.visitor_id));
  const saveVisitors = setMeetingVisitors.bind(null, id, meetingId);
  const addNewVisitor = addVisitor.bind(null, id, meetingId);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <Link href={`/dashboard/celulas/${id}/encontros/${meetingId}`}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-semibold">Visitantes</h1>
      </div>

      <form action={saveVisitors} className="space-y-2">
        {visitors?.map((v) => (
          <label
            key={v.id}
            className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium">
                {v.full_name.slice(0, 1)}
              </span>
              <span className="text-sm font-medium">{v.full_name}</span>
            </span>
            <input
              type="checkbox"
              name="visitor_id"
              value={v.id}
              defaultChecked={presentIds.has(v.id)}
              className="h-5 w-5 accent-[#173B2C]"
            />
          </label>
        ))}

        {(!visitors || visitors.length === 0) && (
          <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center text-sm text-neutral-500">
            Nenhum visitante cadastrado ainda nessa célula.
          </p>
        )}

        <button
          type="submit"
          className="mt-4 w-full rounded-xl bg-[#173B2C] py-3 text-sm font-medium text-white"
        >
          Salvar visitantes presentes
        </button>
      </form>

      <details className="mt-5 rounded-xl border border-neutral-200 p-4">
        <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <Plus size={16} /> Adicionar visitante
        </summary>
        <form action={addNewVisitor} className="mt-3 space-y-2">
          <input
            type="text"
            name="full_name"
            placeholder="Nome completo"
            required
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Telefone (opcional)"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="w-full rounded-lg border border-neutral-300 py-2 text-sm font-medium"
          >
            Adicionar
          </button>
        </form>
      </details>
    </main>
  );
}
