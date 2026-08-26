import Link from "next/link";
import { ArrowLeft, Users2, UserPlus, Heart, ChevronRight, Plus, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/top-bar";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  a_realizar: { label: "A REALIZAR", className: "bg-amber-50 text-amber-700" },
  registrada: { label: "REGISTRADA", className: "bg-[#14532d]/10 text-[#14532d]" },
  nao_houve: { label: "NÃO HOUVE", className: "bg-neutral-100 text-neutral-500" },
};

export default async function HistoricoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: meetings } = await supabase
    .from("cell_meetings")
    .select("id, meeting_date, start_time, location, offering_amount, status, rating, theme, weekly_studies(title)")
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
  teamRows?.forEach((r) =>
    teamCountByMeeting.set(r.meeting_id, (teamCountByMeeting.get(r.meeting_id) ?? 0) + 1),
  );

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
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-6">
        <div className="mb-6 flex items-center gap-3">
          <Link href={`/dashboard/celulas/${id}`}>
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-semibold">Reuniões</h1>
        </div>

        {[...groups.entries()].map(([month, monthMeetings]) => (
          <section key={month} className="mb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {month}
            </p>
            <div className="space-y-2.5">
              {monthMeetings!.map((m) => {
                const [, , d] = m.meeting_date.split("-");
                const status = STATUS_STYLE[m.status] ?? STATUS_STYLE.a_realizar;
                const study = Array.isArray(m.weekly_studies)
                  ? m.weekly_studies[0]
                  : (m.weekly_studies as { title: string } | null);
                const subject = study?.title ?? m.theme;

                return (
                  <Link
                    key={m.id}
                    href={`/dashboard/celulas/${id}/encontros/${m.id}`}
                    className="ibau-card block p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">
                        {d}/{m.meeting_date.split("-")[1]}
                        {m.start_time && (
                          <span className="font-normal text-neutral-400">
                            {" "}· {m.start_time.slice(0, 5)}
                          </span>
                        )}
                      </p>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    {subject && (
                      <p className="mb-2 line-clamp-2 text-xs text-neutral-600">{subject}</p>
                    )}

                    {m.status === "registrada" && (
                      <div className="flex items-center gap-3 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Users2 size={12} /> {teamCountByMeeting.get(m.id) ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <UserPlus size={12} /> {visitorCountByMeeting.get(m.id) ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={12} /> R$ {Number(m.offering_amount ?? 0).toFixed(0)}
                        </span>
                        {m.rating !== null && (
                          <span className="flex items-center gap-1">
                            <Star size={12} /> {m.rating}/10
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        {(!meetings || meetings.length === 0) && (
          <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-8 text-center text-sm text-neutral-500">
            Nenhuma reunião registrada ainda.
          </p>
        )}

        <Link
          href={`/dashboard/celulas/${id}/encontros/novo`}
          className="fixed bottom-8 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-[#14532d] text-white shadow-[0_10px_28px_-8px_rgba(20,83,45,0.6)]"
        >
          <Plus size={24} />
        </Link>
      </main>
    </>
  );
}
