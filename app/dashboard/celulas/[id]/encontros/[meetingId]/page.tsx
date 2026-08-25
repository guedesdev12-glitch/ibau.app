import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users2, UserPlus, Heart, FileText, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateMeetingBasics } from "@/app/actions/meetings";

const OFFERING_LABEL: Record<string, string> = {
  voluntaria: "Oferta voluntária",
  dizimo: "Dízimo",
  oferta_especial: "Oferta especial",
};

export default async function EncontroPage({
  params,
}: {
  params: Promise<{ id: string; meetingId: string }>;
}) {
  const { id, meetingId } = await params;
  const supabase = await createClient();

  const { data: meeting } = await supabase
    .from("cell_meetings")
    .select("*")
    .eq("id", meetingId)
    .single();

  if (!meeting) notFound();

  const [{ count: teamCount }, { count: visitorCount }] = await Promise.all([
    supabase
      .from("cell_meeting_team")
      .select("*", { count: "exact", head: true })
      .eq("meeting_id", meetingId),
    supabase
      .from("cell_meeting_visitors")
      .select("*", { count: "exact", head: true })
      .eq("meeting_id", meetingId),
  ]);

  const updateBasics = updateMeetingBasics.bind(null, id, meetingId);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/dashboard/celulas/${id}`}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-semibold">Registrar encontro</h1>
      </div>

      <p className="mb-3 text-sm font-medium text-neutral-500">Informações do encontro</p>

      <form action={updateBasics} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-neutral-500">Data</label>
            <input
              type="date"
              name="meeting_date"
              defaultValue={meeting.meeting_date}
              required
              className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">Hora de início</label>
            <input
              type="time"
              name="start_time"
              defaultValue={meeting.start_time?.slice(0, 5) ?? ""}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">Local</label>
          <input
            type="text"
            name="location"
            defaultValue={meeting.location ?? ""}
            className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">Tema / Palavra</label>
          <input
            type="text"
            name="theme"
            defaultValue={meeting.theme ?? ""}
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
            defaultValue={meeting.duration_minutes ?? ""}
            className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl border border-neutral-200 py-2.5 text-sm font-medium"
        >
          Salvar alterações
        </button>
      </form>

      <div className="mt-5 space-y-2">
        <Link
          href={`/dashboard/celulas/${id}/encontros/${meetingId}/equipe`}
          className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3"
        >
          <span className="flex items-center gap-3 text-sm">
            <Users2 size={18} className="text-neutral-500" />
            Participantes da equipe
          </span>
          <span className="flex items-center gap-1 text-xs text-neutral-500">
            {teamCount ?? 0} membros <ChevronRight size={16} />
          </span>
        </Link>

        <Link
          href={`/dashboard/celulas/${id}/encontros/${meetingId}/visitantes`}
          className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3"
        >
          <span className="flex items-center gap-3 text-sm">
            <UserPlus size={18} className="text-neutral-500" />
            Visitantes
          </span>
          <span className="flex items-center gap-1 text-xs text-neutral-500">
            {visitorCount ?? 0} visitantes <ChevronRight size={16} />
          </span>
        </Link>

        <Link
          href={`/dashboard/celulas/${id}/encontros/${meetingId}/oferta`}
          className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3"
        >
          <span className="flex items-center gap-3 text-sm">
            <Heart size={18} className="text-neutral-500" />
            Oferta
          </span>
          <span className="flex items-center gap-1 text-xs text-neutral-500">
            {meeting.offering_amount
              ? `R$ ${Number(meeting.offering_amount).toFixed(2)}`
              : "Não informado"}{" "}
            <ChevronRight size={16} />
          </span>
        </Link>

        <Link
          href={`/dashboard/celulas/${id}/encontros/${meetingId}/observacoes`}
          className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3"
        >
          <span className="flex items-center gap-3 text-sm">
            <FileText size={18} className="text-neutral-500" />
            Observações
          </span>
          <span className="flex items-center gap-1 text-xs text-neutral-500">
            {meeting.notes ? "1 observação" : "Nenhuma"} <ChevronRight size={16} />
          </span>
        </Link>
      </div>

      {meeting.offering_type && (
        <p className="mt-3 text-xs text-neutral-400">
          Tipo de oferta: {OFFERING_LABEL[meeting.offering_type]}
        </p>
      )}
    </main>
  );
}
