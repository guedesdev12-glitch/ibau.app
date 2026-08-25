import Link from "next/link";
import { ArrowLeft, Users2, UserPlus, Heart, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default async function HistoricoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: meetings } = await supabase
    .from("cell_meetings")
    .select("id, meeting_date, start_time, duration_minutes, location, offering_amount")
    .eq("cell_id", id)
    .order("meeting_date", { ascending: false });

  const meetingIds = meetings?.map((m) => m.id) ?? [];

  const [{ data: teamRows }, { data: visitorRows }] = await Promise.all([
    meetingIds.length
      ? supabase.from("cell_meeting_team").select("meeting_id").in("meeting_id", meetingIds)
      : Promise.resolve({ data: [] as { meeting_id: string }[] }),
    meetingIds.length
      ? supabase
          .from("cell_meeting_visitors")
          .select("meeting_id")
          .in("meeting_id", meetingIds)
      : Promise.resolve({ data: [] as { meeting_id: string }[] }),
  ]);

  const teamCountByMeeting = new Map<string, number>();
  teamRows?.forEach((r) => teamCountByMeeting.set(r.meeting_id, (teamCountByMeeting.get(r.meeting_id) ?? 0) + 1));

  const visitorCountByMeeting = new Map<string, number>();
  visitorRows?.forEach((r) =>
    visitorCountByMeeting.set(r.meeting_id, (visitorCountByMeeting.get(r.meeting_id) ?? 0) + 1),
  );

  const groups = new Map<string, typeof meetings>();
  meetings?.forEach((m) => {
    const [y, mo] = m.meeting_date.split("-").map(Number);
    const key = `${MONTHS[mo - 1]} ${y}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/dashboard/celulas/${id}`}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-semibold">Histórico de encontros</h1>
      </div>

      {[...groups.entries()].map(([month, monthMeetings]) => (
        <section key={month} className="mb-6">
          <p className="mb-2 text-sm font-medium text-neutral-500">{month}</p>
          <div className="space-y-2">
            {monthMeetings!.map((m) => {
              const [, , d] = m.meeting_date.split("-");
              return (
                <Link
                  key={m.id}
                  href={`/dashboard/celulas/${id}/encontros/${m.id}`}
                  className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 flex-col items-center justify-center rounded-lg bg-neutral-100 text-xs">
                      <span className="font-semibold">{d}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{m.location}</p>
                      <p className="text-xs text-neutral-500">
                        {m.start_time?.slice(0, 5)}
                        {m.duration_minutes && ` · ${m.duration_minutes}min`}
                      </p>
                      <div className="mt-1 flex gap-3 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Users2 size={12} /> {teamCountByMeeting.get(m.id) ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <UserPlus size={12} /> {visitorCountByMeeting.get(m.id) ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={12} /> R$ {Number(m.offering_amount ?? 0).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-neutral-400" />
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      {(!meetings || meetings.length === 0) && (
        <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-8 text-center text-sm text-neutral-500">
          Nenhum encontro registrado ainda.
        </p>
      )}
    </main>
  );
}
