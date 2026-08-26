import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users2, UserPlus, Heart, FileText, ChevronRight, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateMeetingBasics } from "@/app/actions/meetings";
import { TopBar } from "@/components/top-bar";

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

  const [{ count: teamCount }, { count: visitorCount }, { data: study }] = await Promise.all([
    supabase
      .from("cell_meeting_team")
      .select("*", { count: "exact", head: true })
      .eq("meeting_id", meetingId),
    supabase
      .from("cell_meeting_visitors")
      .select("*", { count: "exact", head: true })
      .eq("meeting_id", meetingId),
    supabase
      .from("weekly_studies")
      .select("id, title, content, file_url, study_date")
      .lte("study_date", meeting.meeting_date)
      .order("study_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const updateBasics = updateMeetingBasics.bind(null, id, meetingId);

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/dashboard/celulas/${id}`}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-semibold">Registrar encontro</h1>
      </div>

      <p className="mb-3 text-sm font-medium text-neutral-500">Informações do encontro</p>

      {study && (
        <div className="ibau-card mb-4 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            <BookOpen size={13} /> Estudo da semana
          </p>
          <p className="text-sm font-semibold">{study.title}</p>
          <p className="mt-1 whitespace-pre-line text-xs text-neutral-600">{study.content}</p>
          {study.file_url && (
            <a
              href={study.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs font-medium text-neutral-900 underline"
            >
              Abrir material
            </a>
          )}
        </div>
      )}

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
          <label className="mb-1 block text-xs text-neutral-500">Hora de término</label>
          <input
            type="time"
            name="end_time"
            defaultValue={meeting.end_time?.slice(0, 5) ?? ""}
            className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
          />
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
    </>
  );
}
