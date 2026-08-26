import Link from "next/link";
import { notFound } from "next/navigation";
import { Users2, UserPlus, Heart, CalendarDays, ClipboardList, ChevronRight, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/bottom-nav";
import { TopBar } from "@/components/top-bar";

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  return `${d} de ${months[date.getMonth()]}`;
}

export default async function CelulaDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cell } = await supabase
    .from("cells")
    .select("id, name, photo_url, neighborhood")
    .eq("id", id)
    .single();

  if (!cell) notFound();

  const today = new Date().toISOString().slice(0, 10);

  const { data: nextMeeting } = await supabase
    .from("cell_meetings")
    .select("id, meeting_date, start_time, location")
    .eq("cell_id", id)
    .gte("meeting_date", today)
    .order("meeting_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: lastMeeting } = await supabase
    .from("cell_meetings")
    .select("id, meeting_date, start_time, location, offering_amount")
    .eq("cell_id", id)
    .lt("meeting_date", today)
    .order("meeting_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  let lastMeetingCounts = { participantes: 0, visitantes: 0 };
  if (lastMeeting) {
    const [{ count: teamCount }, { count: visitorCount }] = await Promise.all([
      supabase
        .from("cell_meeting_team")
        .select("*", { count: "exact", head: true })
        .eq("meeting_id", lastMeeting.id),
      supabase
        .from("cell_meeting_visitors")
        .select("*", { count: "exact", head: true })
        .eq("meeting_id", lastMeeting.id),
    ]);
    lastMeetingCounts = {
      participantes: teamCount ?? 0,
      visitantes: visitorCount ?? 0,
    };
  }

  const now = new Date();
  const { data: summaryRows } = await supabase.rpc("cell_monthly_summary", {
    p_cell_id: id,
    p_year: now.getFullYear(),
    p_month: now.getMonth() + 1,
  });
  const summary = summaryRows?.[0] ?? {
    encontros_count: 0,
    participantes_count: 0,
    visitantes_count: 0,
    ofertas_total: 0,
  };

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
            {cell.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cell.photo_url} alt={cell.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-300">
                <MapPin size={20} />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">{cell.name}</h1>
            <p className="text-xs text-neutral-500">
              {cell.neighborhood ?? "Acompanhe e registre os encontros da sua célula."}
            </p>
          </div>
        </div>

        <Link
          href={`/dashboard/celulas/${id}/encontros`}
          className="ibau-tile flex items-center justify-center gap-2 rounded-xl bg-[#14532d] py-3 text-sm font-medium text-white shadow-[0_10px_24px_-12px_rgba(20,83,45,0.5)]"
        >
          <ClipboardList size={18} /> Registrar reunião
        </Link>

        {nextMeeting && (
          <section className="ibau-card mt-5 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
              Próximo encontro
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                  <CalendarDays size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {formatDate(nextMeeting.meeting_date)}
                    {nextMeeting.start_time && ` · ${nextMeeting.start_time.slice(0, 5)}`}
                  </p>
                  <p className="text-xs text-neutral-500">{nextMeeting.location}</p>
                </div>
              </div>
              <Link
                href={`/dashboard/celulas/${id}/encontros/${nextMeeting.id}`}
                className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700"
              >
                Abrir
              </Link>
            </div>
          </section>
        )}

        <section className="mt-5">
          <p className="ibau-section-title mb-2 text-sm font-semibold">
            <span className="ibau-section-icon"><CalendarDays size={13} /></span>
            Resumo do mês
          </p>
          <div className="grid grid-cols-4 gap-2">
            <div className="ibau-card px-2 py-3 text-center">
              <CalendarDays size={18} className="mx-auto mb-1 text-neutral-500" />
              <p className="text-lg font-semibold">{summary.encontros_count}</p>
              <p className="text-[10px] text-neutral-500">Encontros</p>
            </div>
            <div className="ibau-card px-2 py-3 text-center">
              <Users2 size={18} className="mx-auto mb-1 text-neutral-500" />
              <p className="text-lg font-semibold">{summary.participantes_count}</p>
              <p className="text-[10px] text-neutral-500">Participantes</p>
            </div>
            <div className="ibau-card px-2 py-3 text-center">
              <UserPlus size={18} className="mx-auto mb-1 text-neutral-500" />
              <p className="text-lg font-semibold">{summary.visitantes_count}</p>
              <p className="text-[10px] text-neutral-500">Visitantes</p>
            </div>
            <div className="ibau-card px-2 py-3 text-center">
              <Heart size={18} className="mx-auto mb-1 text-neutral-500" />
              <p className="text-sm font-semibold">
                R$ {Number(summary.ofertas_total).toFixed(0)}
              </p>
              <p className="text-[10px] text-neutral-500">Em ofertas</p>
            </div>
          </div>
        </section>

        {lastMeeting && (
          <section className="ibau-card mt-5 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
              Último encontro
            </p>
            <p className="text-sm font-medium">
              {formatDate(lastMeeting.meeting_date)}
              {lastMeeting.start_time && ` · ${lastMeeting.start_time.slice(0, 5)}`}
            </p>
            <p className="mb-3 text-xs text-neutral-500">{lastMeeting.location}</p>
            <div className="mb-3 flex gap-4 text-xs text-neutral-600">
              <span className="flex items-center gap-1">
                <Users2 size={14} /> {lastMeetingCounts.participantes} participantes
              </span>
              <span className="flex items-center gap-1">
                <UserPlus size={14} /> {lastMeetingCounts.visitantes} visitantes
              </span>
              <span className="flex items-center gap-1">
                <Heart size={14} /> R$ {Number(lastMeeting.offering_amount ?? 0).toFixed(0)}
              </span>
            </div>
            <Link
              href={`/dashboard/celulas/${id}/encontros/${lastMeeting.id}`}
              className="flex items-center justify-center gap-1 rounded-lg border border-neutral-200 py-2 text-sm font-medium"
            >
              Ver detalhes do encontro <ChevronRight size={16} />
            </Link>
          </section>
        )}

        <div className="mt-5">
          <Link
            href={`/dashboard/celulas/${id}/encontros`}
            className="ibau-card flex items-center justify-between p-4 text-sm font-medium"
          >
            Ver histórico de encontros
            <ChevronRight size={16} />
          </Link>
        </div>

        <BottomNav />
      </main>
    </>
  );
}
