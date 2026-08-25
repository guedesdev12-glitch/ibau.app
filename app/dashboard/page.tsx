import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  Users2,
  Shield,
  MapPin,
  Phone,
  AtSign,
  ImagePlus,
  Megaphone,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";
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
  { href: "/dashboard/celulas", label: "Células", icon: Users2, color: "#14532d", bg: "#e8f3ec" },
  { href: "/dashboard/membros", label: "Membros", icon: CalendarDays, color: "#1c5aa6", bg: "#e8f0fa", perm: "membros" },
  { href: "/dashboard/admin/categorias", label: "Categorias & Permissões", icon: Shield, color: "#d5342e", bg: "#fbeaea", perm: "dev" },
  { href: "/dashboard/admin/carrossel", label: "Carrossel", icon: ImagePlus, color: "#f0a922", bg: "#fdf3e0", perm: "igreja" },
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
    { data: isDeveloper },
    { data: canManageMembers },
    { data: canManageChurch },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, roles(name)")
      .eq("id", user!.id)
      .single(),
    supabase.from("church_settings").select("*").single(),
    supabase
      .from("church_services")
      .select("*")
      .eq("active", true)
      .order("weekday"),
    supabase
      .from("events")
      .select("id, title, event_date, start_time, location")
      .gte("event_date", new Date().toISOString().slice(0, 10))
      .order("event_date")
      .limit(4),
    supabase
      .from("home_banners")
      .select("id, image_url, title")
      .eq("active", true)
      .order("position"),
    supabase.rpc("is_developer"),
    supabase.rpc("has_permission", { p_key: "membros.manage" }),
    supabase.rpc("has_permission", { p_key: "igreja.manage" }),
  ]);

  const roleName = Array.isArray(profile?.roles)
    ? profile?.roles[0]?.name
    : (profile?.roles as { name: string } | null)?.name;

  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  const permMap: Record<string, boolean> = {
    dev: !!isDeveloper,
    membros: !!canManageMembers,
    igreja: !!canManageChurch,
  };

  return (
    <main className="mx-auto max-w-3xl px-4 pb-28">
      <div className="mb-4 flex items-center justify-between pt-6">
        <div className="flex items-center gap-3">
          <Image src="/logo-mark-v2.png" alt="IBAU" width={44} height={44} priority />
          <div>
            <h1 className="text-lg font-semibold leading-tight">Olá, {firstName} 👋</h1>
            <p className="text-xs font-medium text-[#14532d]">{roleName ?? "Membro"}</p>
          </div>
        </div>
        <form action={logout}>
          <button type="submit" className="text-xs text-neutral-400 underline">
            Sair
          </button>
        </form>
      </div>

      <HomeCarousel banners={banners ?? []} churchName={church?.name ?? "IBAU"} />

      {/* Painel de avisos / info institucional */}
      <section className="ibau-card mb-5 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-neutral-100 px-5 py-3">
          <Megaphone size={16} className="text-[#14532d]" />
          <p className="text-sm font-semibold">Sobre a {church?.name ?? "IBAU"}</p>
        </div>
        <div className="px-5 py-4">
          {church?.about && (
            <p className="text-sm leading-relaxed text-neutral-600">{church.about}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-neutral-500">
            {church?.address && (
              <span className="flex items-center gap-1.5">
                <MapPin size={13} /> {church.address}
              </span>
            )}
            {church?.phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={13} /> {church.phone}
              </span>
            )}
            {church?.instagram && (
              <span className="flex items-center gap-1.5">
                <AtSign size={13} /> {church.instagram}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <section className="ibau-card p-4">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            <Clock size={13} /> Dias de culto
          </p>
          {services && services.length > 0 ? (
            <div className="space-y-2">
              {services.map((s) => (
                <div key={s.id}>
                  <p className="text-sm font-medium">{WEEKDAYS[s.weekday]}</p>
                  <p className="text-xs text-neutral-500">
                    {s.label} · {s.start_time.slice(0, 5)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-400">Nenhum horário ainda.</p>
          )}
        </section>

        <section className="ibau-card p-4">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            <CalendarDays size={13} /> Próximos eventos
          </p>
          {events && events.length > 0 ? (
            <div className="space-y-2.5">
              {events.map((e) => {
                const { day, month } = formatEventDate(e.event_date);
                return (
                  <div key={e.id} className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-[#14532d]/10">
                      <span className="text-xs font-bold leading-none text-[#14532d]">
                        {day}
                      </span>
                      <span className="text-[8px] uppercase text-[#14532d]/70">{month}</span>
                    </div>
                    <p className="text-xs font-medium leading-tight">{e.title}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-neutral-400">Nenhum evento agendado.</p>
          )}
        </section>
      </div>

      <section className="grid grid-cols-2 gap-3">
        {QUICK_LINKS.filter((l) => !l.perm || permMap[l.perm]).map(({ href, label, icon: Icon, color, bg }) => (
          <Link
            key={href}
            href={href}
            className="ibau-tile ibau-card flex items-center gap-3 p-4"
          >
            <span
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: bg, color }}
            >
              <Icon size={19} />
            </span>
            <span className="text-sm font-medium leading-tight">{label}</span>
          </Link>
        ))}
      </section>

      <BottomNav />
    </main>
  );
}
