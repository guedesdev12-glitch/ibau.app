import Link from "next/link";
import { ArrowLeft, Users2, UserPlus, Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/top-bar";
import { MONTH_NAMES } from "@/lib/saturdays";

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  a_realizar: { label: "A REALIZAR", className: "bg-amber-50 text-amber-700" },
  registrada: { label: "REGISTRADA", className: "bg-[#14532d]/10 text-[#14532d]" },
  nao_houve: { label: "NÃO HOUVE", className: "bg-neutral-100 text-neutral-500" },
};

const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default async function ReunioesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ y?: string; m?: string }>;
}) {
  const { id } = await params;
  const { y, m } = await searchParams;
  const supabase = await createClient();

  const now = new Date();
  const year = y ? Number(y) : now.getFullYear();
  const month = m !== undefined ? Number(m) : now.getMonth(); // 0-11

  // Garante que os sábados do próximo ano existam (idempotente)
  await supabase.rpc("ensure_cell_saturdays", { p_cell_id: id, p_months: 12 });

  const monthStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const nextMonthDate = new Date(year, month + 1, 1);
  const monthEnd = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}-01`;

  const { data: meetings } = await supabase
    .from("cell_meetings")
    .select(
      "id, meeting_date, start_time, location, offering_amount, status, rating, theme, weekly_studies(title)",
    )
    .eq("cell_id", id)
    .gte("meeting_date", monthStart)
    .lt("meeting_date", monthEnd)
    .order("meeting_date", { ascending: false });

  const meetingIds = meetings?.map((mt) => mt.id) ?? [];

  const [{ data: teamRows }, { data: visitorRows }] = await Promise.all([
    meetingIds.length
      ? supabase.from("cell_meeting_team").select("meeting_id").in("meeting_id", meetingIds)
      : Promise.resolve({ data: [] as { meeting_id: string }[] }),
    meetingIds.length
      ? supabase.from("cell_meeting_visitors").select("meeting_id").in("meeting_id", meetingIds)
      : Promise.resolve({ data: [] as { meeting_id: string }[] }),
  ]);

  const teamCount = new Map<string, number>();
  teamRows?.forEach((r) => teamCount.set(r.meeting_id, (teamCount.get(r.meeting_id) ?? 0) + 1));
  const visitorCount = new Map<string, number>();
  visitorRows?.forEach((r) =>
    visitorCount.set(r.meeting_id, (visitorCount.get(r.meeting_id) ?? 0) + 1),
  );

  const prev = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };
  const next = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 };

  const registered = meetings?.filter((mt) => mt.status === "registrada").length ?? 0;

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-6">
        <div className="mb-5 flex items-center gap-3">
          <Link href={`/dashboard/celulas/${id}`}>
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-semibold">Reuniões</h1>
        </div>

        {/* Navegação por mês */}
        <div className="ibau-card mb-5 flex items-center justify-between p-3">
          <Link
            href={`/dashboard/celulas/${id}/encontros?y=${prev.y}&m=${prev.m}`}
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
          >
            <ChevronLeft size={18} />
          </Link>
          <div className="text-center">
            <p className="text-sm font-semibold">
              {MONTH_NAMES[month]} {year}
            </p>
            <p className="text-xs text-neutral-400">
              {registered} de {meetings?.length ?? 0} registradas
            </p>
          </div>
          <Link
            href={`/dashboard/celulas/${id}/encontros?y=${next.y}&m=${next.m}`}
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
          >
            <ChevronRight size={18} />
          </Link>
        </div>

        <div className="space-y-2.5">
          {meetings?.map((mt) => {
            const [yy, mm, dd] = mt.meeting_date.split("-").map(Number);
            const weekday = WEEKDAY_SHORT[new Date(yy, mm - 1, dd).getDay()];
            const status = STATUS_STYLE[mt.status] ?? STATUS_STYLE.a_realizar;
            const study = Array.isArray(mt.weekly_studies)
              ? mt.weekly_studies[0]
              : (mt.weekly_studies as { title: string } | null);
            const subject = study?.title ?? mt.theme;

            return (
              <Link
                key={mt.id}
                href={`/dashboard/celulas/${id}/encontros/${mt.id}`}
                className="ibau-card block p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">
                    {String(dd).padStart(2, "0")}/{String(mm).padStart(2, "0")}
                    <span className="font-normal text-neutral-400">
                      {" "}· {weekday}
                      {mt.start_time && ` · ${mt.start_time.slice(0, 5)}`}
                    </span>
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

                {mt.status === "registrada" && (
                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Users2 size={12} /> {teamCount.get(mt.id) ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserPlus size={12} /> {visitorCount.get(mt.id) ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart size={12} /> R$ {Number(mt.offering_amount ?? 0).toFixed(0)}
                    </span>
                    {mt.rating !== null && (
                      <span className="flex items-center gap-1">
                        <Star size={12} /> {mt.rating}/10
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}

          {(!meetings || meetings.length === 0) && (
            <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-8 text-center text-sm text-neutral-500">
              Nenhuma reunião neste mês.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
