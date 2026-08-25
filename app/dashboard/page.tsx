import Link from "next/link";
import { CalendarDays, Users2, Shield, MapPin, Phone, AtSign } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";
import { BottomNav } from "@/components/bottom-nav";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function formatEventDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { day: d, month: MONTHS[m - 1] };
}

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
    { data: isDeveloper },
    { data: canManageMembers },
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
    supabase.rpc("is_developer"),
    supabase.rpc("has_permission", { p_key: "membros.manage" }),
  ]);

  const roleName = Array.isArray(profile?.roles)
    ? profile?.roles[0]?.name
    : (profile?.roles as { name: string } | null)?.name;

  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Olá, {firstName} 👋</h1>
          <p className="text-sm text-neutral-500">{roleName ?? "Membro"}</p>
        </div>
        <form action={logout}>
          <button type="submit" className="text-xs text-neutral-400 underline">
            Sair
          </button>
        </form>
      </div>

      <section className="mb-5 rounded-2xl bg-[#173B2C] p-5 text-white">
        <p className="text-lg font-semibold">{church?.name ?? "IBAU"}</p>
        {church?.about && <p className="mt-1 text-sm text-white/80">{church.about}</p>}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/70">
          {church?.address && (
            <span className="flex items-center gap-1">
              <MapPin size={13} /> {church.address}
            </span>
          )}
          {church?.phone && (
            <span className="flex items-center gap-1">
              <Phone size={13} /> {church.phone}
            </span>
          )}
          {church?.instagram && (
            <span className="flex items-center gap-1">
              <AtSign size={13} /> {church.instagram}
            </span>
          )}
        </div>
      </section>

      <section className="mb-5">
        <p className="mb-2 text-sm font-medium">Dias de culto</p>
        {services && services.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {services.map((s) => (
              <div key={s.id} className="rounded-xl border border-neutral-200 px-3 py-2">
                <p className="text-sm font-medium">{WEEKDAYS[s.weekday]}</p>
                <p className="text-xs text-neutral-500">
                  {s.label} · {s.start_time.slice(0, 5)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-400">Nenhum horário cadastrado ainda.</p>
        )}
      </section>

      <section className="mb-5">
        <p className="mb-2 text-sm font-medium">Próximos eventos</p>
        {events && events.length > 0 ? (
          <div className="space-y-2">
            {events.map((e) => {
              const { day, month } = formatEventDate(e.event_date);
              return (
                <div
                  key={e.id}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200 px-3 py-2.5"
                >
                  <div className="flex h-11 w-11 flex-col items-center justify-center rounded-lg bg-neutral-100">
                    <span className="text-sm font-semibold leading-none">{day}</span>
                    <span className="text-[10px] uppercase text-neutral-500">{month}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-neutral-500">
                      {e.start_time?.slice(0, 5)}
                      {e.location && ` · ${e.location}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-neutral-400">Nenhum evento agendado no momento.</p>
        )}
      </section>

      <section className="grid grid-cols-2 gap-2">
        <Link
          href="/dashboard/celulas"
          className="flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium"
        >
          <Users2 size={18} /> Células
        </Link>
        {canManageMembers && (
          <Link
            href="/dashboard/membros"
            className="flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium"
          >
            <CalendarDays size={18} /> Membros
          </Link>
        )}
        {isDeveloper && (
          <Link
            href="/dashboard/admin/categorias"
            className="col-span-2 flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium"
          >
            <Shield size={18} /> Categorias & Permissões
          </Link>
        )}
      </section>

      <BottomNav />
    </main>
  );
}
