import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays, Users2, Shield, ImagePlus, ChevronRight, Clock, Sparkles,
  CalendarClock, FileText, BookOpenText, Sunrise, NotebookPen, HandHeart,
  MessagesSquare, Quote, MapPin, Ticket, Church, UserPlus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/bottom-nav";
import { MediaCarousel } from "@/components/media-carousel";
import { TopBar } from "@/components/top-bar";
import { WelcomeToast } from "@/components/welcome-toast";
import { nextSaturday } from "@/lib/saturdays";
import { verseOfTheDay } from "@/lib/daily-verse";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const MONTHS_SHORT = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];

const QUICK_LINKS = [
  { href: "/dashboard/membros", label: "Membros", icon: Users2, perm: "membros" },
  { href: "/dashboard/admin/usuarios", label: "Usuários", icon: UserPlus, perm: "membros" },
  { href: "/dashboard/admin/categorias", label: "Categorias", icon: Shield, perm: "dev" },
  { href: "/dashboard/admin/carrossel", label: "Carrossel", icon: ImagePlus, perm: "igreja" },
];

const DIARIO = [
  { href: "/dashboard/biblia", label: "Bíblia", icon: BookOpenText },
  { href: "/dashboard/devocional", label: "Devocional", icon: Sunrise },
  { href: "/dashboard/anotacoes", label: "Anotações", icon: NotebookPen },
  { href: "/dashboard/plano-oracao", label: "Plano de oração", icon: HandHeart },
  { href: "/dashboard/mural-oracoes", label: "Mural de orações", icon: MessagesSquare },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const today = new Date().toISOString().slice(0, 10);
  const nextSaturdayStr = nextSaturday();

  const [
    { data: profile }, { data: church }, { data: services }, { data: events },
    { data: banners }, { data: cells }, { data: currentStudy }, { data: devotional },
    { data: myTickets }, { data: prayerCount },
    { data: isDeveloper }, { data: canManageMembers }, { data: canManageChurch },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, roles(name)").eq("id", user!.id).single(),
    supabase.from("church_settings").select("*").single(),
    supabase.from("church_services").select("*").eq("active", true).order("weekday"),
    supabase.from("events")
      .select("id, title, subtitle, event_date, start_time, location, poster_url, is_free, price")
      .gte("event_date", today).order("event_date").limit(6),
    supabase.from("home_banners").select("id, image_url, title").eq("active", true).order("position"),
    supabase.from("cells")
      .select("id, name, photo_url, neighborhood, profiles!cells_leader_id_fkey(full_name)")
      .order("name").limit(6),
    supabase.from("weekly_studies").select("id, title, content, file_url, study_date")
      .lte("study_date", nextSaturdayStr).order("study_date", { ascending: false })
      .limit(1).maybeSingle(),
    supabase.from("devotionals").select("id, title, verse_reference")
      .lte("devotional_date", today).order("devotional_date", { ascending: false })
      .limit(1).maybeSingle(),
    supabase.from("event_tickets").select("id").neq("status", "cancelado"),
    supabase.from("prayer_requests").select("id").eq("answered", false),
    supabase.rpc("is_developer"),
    supabase.rpc("has_permission", { p_key: "membros.manage" }),
    supabase.rpc("has_permission", { p_key: "igreja.manage" }),
  ]);

  const roleName = Array.isArray(profile?.roles)
    ? profile?.roles[0]?.name
    : (profile?.roles as { name: string } | null)?.name;
  const firstName = profile?.full_name?.split(" ")[0] ?? "";
  const verse = verseOfTheDay();

  const permMap: Record<string, boolean> = {
    dev: !!isDeveloper, membros: !!canManageMembers, igreja: !!canManageChurch,
  };

  const bannerSlides = (banners ?? []).map((b) => ({
    id: b.id, image_url: b.image_url, title: b.title,
  }));

  // Próximo culto a partir de hoje
  const todayDow = new Date().getDay();
  const nextService = services?.length
    ? [...services].sort((a, b) => {
        const da = (a.weekday - todayDow + 7) % 7;
        const db = (b.weekday - todayDow + 7) % 7;
        return da - db;
      })[0]
    : null;

  // Encontro de sábado para líderes
  const { data: ledCell } = await supabase
    .from("cells").select("id, name")
    .or(`leader_id.eq.${user!.id},co_leader_id.eq.${user!.id}`)
    .limit(1).maybeSingle();

  let saturdayHref: string | null = null;
  let saturdayLabel = "";
  if (ledCell) {
    saturdayLabel = new Date(nextSaturdayStr + "T00:00:00")
      .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    await supabase.rpc("ensure_cell_saturdays", { p_cell_id: ledCell.id, p_months: 12 });
    const { data: m } = await supabase.from("cell_meetings").select("id, status")
      .eq("cell_id", ledCell.id).eq("meeting_date", nextSaturdayStr).maybeSingle();
    saturdayHref = m
      ? `/dashboard/celulas/${ledCell.id}/encontros/${m.id}`
      : `/dashboard/celulas/${ledCell.id}/encontros`;
  }

  const nextEvent = events?.[0];

  return (
    <>
      <TopBar />
      <WelcomeToast firstName={firstName} />
      <main className="mx-auto max-w-3xl px-4 pb-40">

        {/* Saudação */}
        <section className="pb-4 pt-5">
          <p className="text-sm text-neutral-500">{greeting()},</p>
          <h1 className="text-2xl font-bold leading-tight">{firstName}</h1>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="rounded-full bg-[#14532d]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#14532d]">
              {roleName ?? "Membro"}
            </span>
            <span className="text-[11px] text-neutral-400">
              {church?.name ?? "IBAU"}
            </span>
          </div>
        </section>

        <MediaCarousel
          slides={bannerSlides}
          emptyState={
            <div className="flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c6b3c] to-[#0a2c18] shadow-[0_18px_40px_-16px_rgba(0,0,0,0.35)]">
              <p className="px-6 text-center text-lg font-semibold text-white/90">
                Bem-vindo(a) à {church?.name ?? "IBAU"}
              </p>
            </div>
          }
        />

        {/* Versículo do dia */}
        <section className="ibau-enter mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#123f26] to-[#0a2c18] p-5 text-white shadow-[0_14px_34px_-16px_rgba(10,44,24,0.7)]">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#f0a922]">
            <Quote size={12} /> Palavra do dia
          </div>
          <p className="text-[15px] font-medium leading-relaxed">{verse.text}</p>
          <p className="mt-2 text-xs font-semibold text-white/60">{verse.reference}</p>
        </section>

        {/* Resumo rápido */}
        <section className="mt-4 grid grid-cols-3 gap-2.5">
          <Link href="/dashboard/eventos" className="ibau-card ibau-tile p-3 text-center">
            <CalendarDays size={17} className="mx-auto mb-1.5 text-[#14532d]" />
            <p className="text-lg font-bold leading-none">{events?.length ?? 0}</p>
            <p className="mt-1 text-[10px] leading-tight text-neutral-500">Eventos</p>
          </Link>
          <Link href="/dashboard/eventos?tab=ingressos" className="ibau-card ibau-tile p-3 text-center">
            <Ticket size={17} className="mx-auto mb-1.5 text-[#14532d]" />
            <p className="text-lg font-bold leading-none">{myTickets?.length ?? 0}</p>
            <p className="mt-1 text-[10px] leading-tight text-neutral-500">Ingressos</p>
          </Link>
          <Link href="/dashboard/mural-oracoes" className="ibau-card ibau-tile p-3 text-center">
            <HandHeart size={17} className="mx-auto mb-1.5 text-[#14532d]" />
            <p className="text-lg font-bold leading-none">{prayerCount?.length ?? 0}</p>
            <p className="mt-1 text-[10px] leading-tight text-neutral-500">Orações</p>
          </Link>
        </section>

        {/* Encontro de sábado (líderes) */}
        {saturdayHref && (
          <Link href={saturdayHref}
            className="ibau-pressable mt-4 flex items-center justify-between rounded-2xl bg-[#14532d] px-5 py-4 shadow-[0_12px_28px_-14px_rgba(20,83,45,0.8)]">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                <CalendarClock size={20} />
              </span>
              <div>
                <p className="text-[15px] font-semibold leading-tight text-white">
                  Encontro de célula · {saturdayLabel}
                </p>
                <p className="mt-0.5 text-xs text-white/70">Registrar presença, visitantes e oferta</p>
              </div>
            </div>
            <ChevronRight size={18} className="flex-shrink-0 text-white/70" />
          </Link>
        )}

        {/* Próximo culto + próximo evento lado a lado */}
        <section className="mt-4 grid gap-3 sm:grid-cols-2">
          {nextService && (
            <div className="ibau-card ibau-card-accent p-4 pl-5">
              <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                <Church size={11} /> Próximo culto
              </p>
              <p className="text-sm font-bold leading-tight">{nextService.label}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
                <Clock size={12} /> {WEEKDAYS[nextService.weekday]} · {nextService.start_time.slice(0, 5)}
              </p>
            </div>
          )}

          {nextEvent && (
            <Link href={`/dashboard/eventos/${nextEvent.id}`} className="ibau-card ibau-tile ibau-card-accent p-4 pl-5">
              <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                <Sparkles size={11} /> Próximo evento
              </p>
              <p className="line-clamp-1 text-sm font-bold leading-tight">{nextEvent.title}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
                <CalendarDays size={12} />
                {(() => {
                  const [, m, d] = nextEvent.event_date.split("-").map(Number);
                  return `${d} ${MONTHS_SHORT[m - 1]}`;
                })()}
                {nextEvent.start_time && ` · ${nextEvent.start_time.slice(0, 5)}`}
              </p>
            </Link>
          )}
        </section>

        {/* Estudo + Devocional */}
        {(currentStudy || devotional) && (
          <section className="mt-4 space-y-2.5">
            {currentStudy && (
              <div className="ibau-card p-4">
                <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  <FileText size={11} /> Estudo da semana
                </p>
                <p className="text-sm font-bold leading-tight">{currentStudy.title}</p>
                {currentStudy.content && (
                  <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{currentStudy.content}</p>
                )}
                {currentStudy.file_url && (
                  <a href={currentStudy.file_url} target="_blank" rel="noopener noreferrer"
                    className="ibau-pressable mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white">
                    <FileText size={12} /> Abrir PDF
                  </a>
                )}
              </div>
            )}

            {devotional && (
              <Link href="/dashboard/devocional" className="ibau-card ibau-tile flex items-center justify-between p-4">
                <div>
                  <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    <Sunrise size={11} /> Devocional de hoje
                  </p>
                  <p className="text-sm font-bold leading-tight">{devotional.title}</p>
                  {devotional.verse_reference && (
                    <p className="mt-0.5 text-xs text-[#14532d]">{devotional.verse_reference}</p>
                  )}
                </div>
                <ChevronRight size={17} className="flex-shrink-0 text-neutral-300" />
              </Link>
            )}
          </section>
        )}

        {/* Diário */}
        <section className="mt-7">
          <p className="ibau-section-title mb-3 text-base font-semibold">
            <span className="ibau-section-icon"><BookOpenText size={14} /></span>
            Diário
          </p>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {DIARIO.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className="ibau-card ibau-tile flex w-24 flex-shrink-0 flex-col items-center gap-2 p-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#14532d]/10 text-[#14532d]">
                  <Icon size={20} />
                </span>
                <span className="text-center text-[11px] font-medium leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Eventos */}
        {events && events.length > 0 && (
          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <p className="ibau-section-title text-base font-semibold">
                <span className="ibau-section-icon"><CalendarDays size={14} /></span>
                Eventos
              </p>
              <Link href="/dashboard/eventos" className="flex items-center text-xs font-medium text-neutral-500">
                Ver todos <ChevronRight size={14} />
              </Link>
            </div>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {events.map((e) => {
                const [, m, d] = e.event_date.split("-").map(Number);
                return (
                  <Link key={e.id} href={`/dashboard/eventos/${e.id}`}
                    className="ibau-tile w-52 flex-shrink-0 overflow-hidden rounded-2xl bg-neutral-900 shadow-[0_12px_28px_-14px_rgba(0,0,0,0.45)]">
                    <div className="relative aspect-[16/10] w-full">
                      {e.poster_url ? (
                        <Image src={e.poster_url} alt={e.title} fill className="object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-[#1c6b3c] to-[#0a2c18]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <span className="absolute left-3 top-3 flex h-11 w-11 flex-col items-center justify-center rounded-lg bg-white/95">
                        <span className="text-sm font-black leading-none text-neutral-900">{d}</span>
                        <span className="text-[9px] font-bold text-[#14532d]">{MONTHS_SHORT[m - 1]}</span>
                      </span>
                      <span className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        e.is_free ? "bg-[#14532d] text-white" : "bg-[#f0a922] text-neutral-900"}`}>
                        {e.is_free ? "GRÁTIS" : `R$ ${Number(e.price ?? 0).toFixed(0)}`}
                      </span>
                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <p className="line-clamp-2 text-sm font-bold leading-tight text-white">{e.title}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Células */}
        {cells && cells.length > 0 && (
          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <p className="ibau-section-title text-base font-semibold">
                <span className="ibau-section-icon"><Users2 size={14} /></span>
                Células
              </p>
              <Link href="/dashboard/celulas" className="flex items-center text-xs font-medium text-neutral-500">
                Ver todas <ChevronRight size={14} />
              </Link>
            </div>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {cells.map((c) => {
                const leader = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
                return (
                  <Link key={c.id} href={`/dashboard/celulas/${c.id}`}
                    className="ibau-card ibau-tile w-44 flex-shrink-0 overflow-hidden">
                    <div className="relative aspect-[4/3] w-full bg-neutral-100">
                      {c.photo_url ? (
                        <Image src={c.photo_url} alt={c.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-300">
                          <Users2 size={24} />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-1 text-xs font-bold leading-tight">{c.name}</p>
                      {leader?.full_name && (
                        <p className="mt-1 line-clamp-1 text-[11px] text-neutral-500">{leader.full_name}</p>
                      )}
                      {c.neighborhood && (
                        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-neutral-400">
                          <MapPin size={9} /> {c.neighborhood}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Gestão */}
        {(permMap.dev || permMap.membros || permMap.igreja) && (
          <section className="mt-7">
            <p className="ibau-section-title mb-3 text-base font-semibold">
              <span className="ibau-section-icon"><Shield size={14} /></span>
              Gestão
            </p>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {QUICK_LINKS.filter((l) => !l.perm || permMap[l.perm]).map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}
                  className="ibau-card ibau-tile flex w-24 flex-shrink-0 flex-col items-center gap-2 p-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-b from-neutral-800 to-neutral-950 text-white shadow-[0_4px_10px_-4px_rgba(0,0,0,0.5)]">
                    <Icon size={19} />
                  </span>
                  <span className="text-center text-[11px] font-medium leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Sobre a igreja */}
        {(church?.about || church?.address) && (
          <section className="ibau-card mt-7 p-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Sobre a {church?.name ?? "IBAU"}
            </p>
            {church?.about && (
              <p className="text-sm leading-relaxed text-neutral-600">{church.about}</p>
            )}
            {church?.address && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
                <MapPin size={12} /> {church.address}
              </p>
            )}
          </section>
        )}

        <BottomNav />
      </main>
    </>
  );
}
