import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  Users2,
  Shield,
  ImagePlus,
  ChevronRight,
  MapPin,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/bottom-nav";
import { HomeCarousel } from "@/components/home-carousel";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function formatEventDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { day: d, month: MONTHS[m - 1] };
}

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

  return (
    <main className="mx-auto max-w-3xl px-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 pt-6">
        <div className="flex items-center gap-2.5">
          <Image src="/logo-mark-v2.png" alt="IBAU" width={34} height={34} priority />
          <span className="text-xl font-black tracking-tight">ibau</span>
        </div>
        <Link
          href="/dashboard/menu"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold"
        >
          {profile?.full_name?.slice(0, 1) ?? "?"}
        </Link>
      </div>
      <p className="mb-4 text-sm text-neutral-500">{church?.name ?? "IBAU"}</p>

      <HomeCarousel banners={banners ?? []} churchName={church?.name ?? "IBAU"} />

      {/* Programação */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-base font-semibold">Programação</p>
        </div>
        {services && services.length > 0 ? (
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {services.map((s) => (
              <div key={s.id} className="ibau-card w-40 flex-shrink-0 p-4">
                <p className="text-sm font-semibold leading-tight">{s.label}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
                  <Clock size={13} /> {WEEKDAYS[s.weekday]}
                </p>
                <p className="text-xs text-neutral-500">{s.start_time.slice(0, 5)}</p>
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
          <p className="text-base font-semibold">Eventos</p>
          <Link href="/dashboard/eventos" className="flex items-center text-xs text-neutral-500">
            Ver mais <ChevronRight size={14} />
          </Link>
        </div>
        {events && events.length > 0 ? (
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {events.map((e) => {
              const { day, month } = formatEventDate(e.event_date);
              return (
                <Link
                  key={e.id}
                  href="/dashboard/eventos"
                  className="ibau-card w-36 flex-shrink-0 overflow-hidden"
                >
                  <div className="relative aspect-[3/4] w-full bg-neutral-100">
                    {e.poster_url ? (
                      <Image src={e.poster_url} alt={e.title} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-300">
                        <CalendarDays size={22} />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold leading-tight">{e.title}</p>
                    <p className="mt-1 text-[11px] text-neutral-500">
                      {day} {month}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center">
            <p className="text-sm text-neutral-400">Nenhum evento agendado no momento.</p>
          </div>
        )}
      </section>

      {/* Células */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-base font-semibold">Células</p>
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
                        <MapPin size={22} />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold leading-tight">{c.name}</p>
                    {leader?.full_name && (
                      <p className="mt-1 text-[11px] text-neutral-500">{leader.full_name}</p>
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

      {/* Atalhos */}
      <section className="mt-6">
        <p className="mb-3 text-base font-semibold">Atalhos</p>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          {QUICK_LINKS.filter((l) => !l.perm || permMap[l.perm]).map(
            ({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="ibau-tile ibau-card flex w-24 flex-shrink-0 flex-col items-center gap-2 p-4"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800">
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

      <BottomNav />
    </main>
  );
}
