import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Users2, Shield, ImagePlus, ChevronRight, Clock, Sparkles, Church, CalendarClock, BookOpen, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/bottom-nav";
import { MediaCarousel } from "@/components/media-carousel";
import { TopBar } from "@/components/top-bar";
import { WelcomeToast } from "@/components/welcome-toast";
import { nextSaturday } from "@/lib/saturdays";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const QUICK_LINKS = [
  { href: "/dashboard/celulas", label: "Células", icon: Users2, perm: undefined },
  { href: "/dashboard/membros", label: "Membros", icon: CalendarDays, perm: "membros" },
  { href: "/dashboard/admin/categorias", label: "Categorias", icon: Shield, perm: "dev" },
  { href: "/dashboard/admin/carrossel", label: "Carrossel", icon: ImagePlus, perm: "igreja" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: profile },
    { data: church },
    { data: services },
    { data: events },
    { data: banners },
    { data: cells },
    { data: isDeveloper },
    { data: canManageMembers },
    { data: canManageChurch },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user!.id).single(),
    supabase.from("church_settings").select("*").single(),
    supabase.from("church_services").select("*").eq("active", true).order("weekday"),
    supabase
      .from("events")
      .select("id, title, event_date, start_time, location, poster_url")
      .gte("event_date", new Date().toISOString().slice(0, 10))
      .order("event_date")
      .limit(6),
    supabase
      .from("home_banners")
      .select("id, image_url, title")
      .eq("active", true)
      .order("position"),
    supabase
      .from("cells")
      .select("id, name, photo_url, profiles!cells_leader_id_fkey(full_name)")
      .order("name")
      .limit(6),
    supabase.rpc("is_developer"),
    supabase.rpc("has_permission", { p_key: "membros.manage" }),
    supabase.rpc("has_permission", { p_key: "igreja.manage" }),
  ]);

  const permMap: Record<string, boolean> = {
    dev: !!isDeveloper,
    membros: !!canManageMembers,
    igreja: !!canManageChurch,
  };

  const bannerSlides = (banners ?? []).map((b) => ({
    id: b.id,
    image_url: b.image_url,
    title: b.title,
  }));

  const eventSlides = (events ?? [])
    .filter((e) => e.poster_url)
    .map((e) => ({
      id: e.id,
      image_url: e.poster_url as string,
      title: e.title,
      href: "/dashboard/eventos",
    }));

  // Encontro de sábado — atalho para líderes/co-líderes da célula
  const nextSaturdayStr = nextSaturday();

  const { data: currentStudy } = await supabase
    .from("weekly_studies")
    .select("id, title, content, file_url, study_date")
    .lte("study_date", nextSaturdayStr)
    .order("study_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: ledCell } = await supabase
    .from("cells")
    .select("id, name")
    .or(`leader_id.eq.${user!.id},co_leader_id.eq.${user!.id}`)
    .limit(1)
    .maybeSingle();

  let saturdayMeetingHref: string | null = null;
  let saturdayDateLabel = "";
  if (ledCell) {
    saturdayDateLabel = new Date(nextSaturdayStr + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });

    const { data: existingMeeting } = await supabase
      .from("cell_meetings")
      .select("id")
      .eq("cell_id", ledCell.id)
      .eq("meeting_date", nextSaturdayStr)
      .maybeSingle();

    saturdayMeetingHref = existingMeeting
      ? `/dashboard/celulas/${ledCell.id}/encontros/${existingMeeting.id}`
      : `/dashboard/celulas/${ledCell.id}/encontros/novo?date=${nextSaturdayStr}`;
  }

  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  return (
    <>
      <TopBar />
      <WelcomeToast firstName={firstName} />
      <main className="mx-auto max-w-3xl px-4 pb-28">
        <p className="pb-4 pt-4 text-sm text-neutral-500">{church?.name ?? "IBAU"}</p>

        <MediaCarousel
          slides={bannerSlides}
          emptyState={
            <div className="flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-neutral-900 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.35)]">
              <p className="px-6 text-center text-lg font-semibold text-white/90">
                Bem-vindo(a) à {church?.name ?? "IBAU"}
              </p>
            </div>
          }
        />

        {saturdayMeetingHref && (
          <Link
            href={saturdayMeetingHref}
            className="ibau-tile mt-5 flex items-center justify-between rounded-2xl bg-neutral-900 px-5 py-4 text-white shadow-[0_10px_28px_-12px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <CalendarClock size={19} />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">
                  Encontro de célula · {saturdayDateLabel}
                </p>
                <p className="text-xs text-white/50">
                  Estudo da semana, equipe, visitantes e oferta
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-white/60" />
          </Link>
        )}

        {currentStudy && (
          <section className="ibau-card mt-5 p-4">
            <p className="ibau-section-title mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              <span className="ibau-section-icon"><BookOpen size={12} /></span>
              Estudo da semana
            </p>
            <p className="text-sm font-semibold">{currentStudy.title}</p>
            {currentStudy.content && (
              <p className="mt-1 line-clamp-3 text-xs text-neutral-500">
                {currentStudy.content}
              </p>
            )}
            {currentStudy.file_url && (
              <a
                href={currentStudy.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white"
              >
                <FileText size={12} /> Abrir PDF
              </a>
            )}
          </section>
        )}

        {/* Atalhos */}
        <section className="mt-6">
          <p className="ibau-section-title mb-3 text-base font-semibold">
            <span className="ibau-section-icon"><Sparkles size={14} /></span>
            Atalhos
          </p>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {QUICK_LINKS.filter((l) => !l.perm || permMap[l.perm]).map(
              ({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="ibau-tile ibau-card flex w-24 flex-shrink-0 flex-col items-center gap-2 p-4"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-b from-neutral-800 to-neutral-950 text-white shadow-[0_4px_10px_-4px_rgba(0,0,0,0.5)] ring-1 ring-black/10">
                    <Icon size={20} />
                  </span>
                  <span className="text-center text-[11px] font-medium leading-tight">
                    {label}
                  </span>
                </Link>
              ),
            )}
          </div>
        </section>

        {/* Programação */}
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="ibau-section-title text-base font-semibold">
              <span className="ibau-section-icon"><Clock size={14} /></span>
              Programação
            </p>
          </div>
          {services && services.length > 0 ? (
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {services.map((s) => (
                <div key={s.id} className="ibau-card w-40 flex-shrink-0 p-4">
                  <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
                    <Church size={15} />
                  </span>
                  <p className="text-sm font-semibold leading-tight">{s.label}</p>
                  <p className="mt-1.5 text-xs text-neutral-500">
                    {WEEKDAYS[s.weekday]} · {s.start_time.slice(0, 5)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center">
              <p className="text-sm text-neutral-400">Nenhum horário cadastrado ainda.</p>
            </div>
          )}
        </section>

        {/* Eventos */}
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="ibau-section-title text-base font-semibold">
              <span className="ibau-section-icon"><CalendarDays size={14} /></span>
              Eventos
            </p>
            <Link href="/dashboard/eventos" className="flex items-center text-xs text-neutral-500">
              Ver mais <ChevronRight size={14} />
            </Link>
          </div>
          <MediaCarousel
            slides={eventSlides}
            aspect="aspect-[4/3]"
            emptyState={
              <div className="rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center">
                <p className="text-sm text-neutral-400">Nenhum evento agendado no momento.</p>
              </div>
            }
          />
        </section>

        {/* Células */}
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="ibau-section-title text-base font-semibold">
              <span className="ibau-section-icon"><Users2 size={14} /></span>
              Células
            </p>
            <Link href="/dashboard/celulas" className="flex items-center text-xs text-neutral-500">
              Ver mais <ChevronRight size={14} />
            </Link>
          </div>
          {cells && cells.length > 0 ? (
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {cells.map((c) => {
                const leader = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
                return (
                  <Link
                    key={c.id}
                    href={`/dashboard/celulas/${c.id}`}
                    className="ibau-card w-44 flex-shrink-0 overflow-hidden"
                  >
                    <div className="relative aspect-[4/3] w-full bg-neutral-100">
                      {c.photo_url ? (
                        <Image src={c.photo_url} alt={c.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-neutral-300">
                          <Users2 size={22} />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold leading-tight">{c.name}</p>
                      {leader?.full_name && (
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500">
                          <span className="inline-block h-1 w-1 rounded-full bg-neutral-400" />
                          {leader.full_name}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center">
              <p className="text-sm text-neutral-400">Nenhuma célula cadastrada ainda.</p>
            </div>
          )}
        </section>

        <BottomNav />
      </main>
    </>
  );
}
