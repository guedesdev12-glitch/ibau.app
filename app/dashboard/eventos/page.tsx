import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  MapPin,
  Ticket,
  Clock,
  Sparkles,
  Users2,
  QrCode,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";
import { EventCreateForm } from "@/components/event-create-form";
import { cancelTicket } from "@/app/actions/tickets";

const MONTHS_SHORT = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];

function parts(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { day: d, month: MONTHS_SHORT[m - 1], year: y };
}

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const TICKET_BADGE: Record<string, { label: string; cls: string }> = {
  confirmado: { label: "CONFIRMADO", cls: "bg-[#14532d]/10 text-[#14532d]" },
  pendente: { label: "AGUARDANDO PAGAMENTO", cls: "bg-amber-50 text-amber-700" },
  cancelado: { label: "CANCELADO", cls: "bg-neutral-100 text-neutral-500" },
};

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "ingressos" ? "ingressos" : "eventos";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: upcoming }, { data: past }, { data: canManage }, { data: tickets }] =
    await Promise.all([
      supabase
        .from("events")
        .select("*")
        .gte("event_date", today)
        .order("event_date"),
      supabase
        .from("events")
        .select("id, title, event_date, poster_url")
        .lt("event_date", today)
        .order("event_date", { ascending: false })
        .limit(6),
      supabase.rpc("has_permission", { p_key: "igreja.manage" }),
      supabase
        .from("event_tickets")
        .select("id, code, quantity, total_price, status, created_at, events(id, title, event_date, start_time, location, poster_url)")
        .order("created_at", { ascending: false }),
    ]);

  const activeTickets = tickets?.filter((t) => t.status !== "cancelado") ?? [];

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-40 pt-6">
        <h1 className="ibau-section-title mb-4 text-lg font-semibold">
          <span className="ibau-section-icon">
            <CalendarDays size={15} />
          </span>
          Eventos
        </h1>

        {/* Abas */}
        <div className="mb-5 flex gap-2">
          <Link
            href="/dashboard/eventos"
            className={`flex-1 rounded-xl py-2.5 text-center text-sm font-semibold transition ${
              activeTab === "eventos"
                ? "bg-[#14532d] text-white"
                : "border border-neutral-200 bg-white text-neutral-600"
            }`}
          >
            Programação
          </Link>
          <Link
            href="/dashboard/eventos?tab=ingressos"
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-center text-sm font-semibold transition ${
              activeTab === "ingressos"
                ? "bg-[#14532d] text-white"
                : "border border-neutral-200 bg-white text-neutral-600"
            }`}
          >
            <Ticket size={15} /> Ingressos
            {activeTickets.length > 0 && (
              <span
                className={`rounded-full px-1.5 text-[10px] font-bold ${
                  activeTab === "ingressos" ? "bg-white/20" : "bg-[#14532d]/10 text-[#14532d]"
                }`}
              >
                {activeTickets.length}
              </span>
            )}
          </Link>
        </div>

        {activeTab === "eventos" ? (
          <>
            {upcoming && upcoming.length > 0 ? (
              <div className="space-y-4">
                {upcoming.map((e, i) => {
                  const p = parts(e.event_date);
                  return (
                    <Link
                      key={e.id}
                      href={`/dashboard/eventos/${e.id}`}
                      className="ibau-enter block overflow-hidden rounded-2xl bg-neutral-900 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.5)]"
                      style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
                    >
                      <div className="relative aspect-[16/10] w-full">
                        {e.poster_url ? (
                          <Image
                            src={e.poster_url}
                            alt={e.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 700px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-[#1c6b3c] to-[#0a2c18]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                        {/* Data */}
                        <div className="absolute left-4 top-4 flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-white/95 shadow-lg">
                          <span className="text-lg font-black leading-none text-neutral-900">
                            {p.day}
                          </span>
                          <span className="text-[10px] font-bold tracking-wide text-[#14532d]">
                            {p.month}
                          </span>
                        </div>

                        {/* Preço */}
                        <span
                          className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide shadow-lg ${
                            e.is_free
                              ? "bg-[#14532d] text-white"
                              : "bg-[#f0a922] text-neutral-900"
                          }`}
                        >
                          {e.is_free ? "GRATUITO" : money(Number(e.price ?? 0))}
                        </span>

                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <h2 className="text-xl font-bold leading-tight text-white drop-shadow">
                            {e.title}
                          </h2>
                          {e.subtitle && (
                            <p className="mt-0.5 text-sm text-white/80">{e.subtitle}</p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/70">
                            {e.start_time && (
                              <span className="flex items-center gap-1">
                                <Clock size={11} /> {e.start_time.slice(0, 5)}
                              </span>
                            )}
                            {e.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={11} /> {e.location}
                              </span>
                            )}
                            {e.capacity && (
                              <span className="flex items-center gap-1">
                                <Users2 size={11} /> {e.capacity} vagas
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-white px-4 py-3">
                        <span className="text-xs font-semibold text-[#14532d]">
                          {e.registration_open ? "Inscrições abertas" : "Inscrições encerradas"}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-medium text-neutral-500">
                          Ver detalhes <ChevronRight size={14} />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-200 px-4 py-14 text-center">
                <Sparkles size={26} className="mx-auto mb-2 text-neutral-300" />
                <p className="text-sm font-medium text-neutral-600">
                  Nenhum evento programado
                </p>
                <p className="mt-1 text-xs text-neutral-400">Em breve teremos novidades.</p>
              </div>
            )}

            {past && past.length > 0 && (
              <section className="mt-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Já aconteceram
                </p>
                <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
                  {past.map((e) => (
                    <div key={e.id} className="w-36 flex-shrink-0">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-200 grayscale">
                        {e.poster_url && (
                          <Image src={e.poster_url} alt={e.title} fill className="object-cover" />
                        )}
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-[11px] font-medium text-neutral-500">
                        {e.title}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {canManage && (
              <div className="mt-8">
                <EventCreateForm />
              </div>
            )}
          </>
        ) : (
          /* ---------- ABA INGRESSOS ---------- */
          <div className="space-y-3">
            {activeTickets.length > 0 ? (
              activeTickets.map((t, i) => {
                const ev = Array.isArray(t.events) ? t.events[0] : t.events;
                const badge = TICKET_BADGE[t.status] ?? TICKET_BADGE.confirmado;
                const p = ev ? parts(ev.event_date) : null;

                return (
                  <article
                    key={t.id}
                    className="ibau-enter overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[var(--ibau-card-shadow)]"
                    style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}
                  >
                    <div className="flex">
                      <div className="relative w-24 flex-shrink-0 bg-neutral-100">
                        {ev?.poster_url ? (
                          <Image
                            src={ev.poster_url}
                            alt={ev.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-[#1c6b3c] to-[#0a2c18]" />
                        )}
                      </div>

                      <div className="flex-1 p-4">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[9px] font-bold tracking-wide ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                        <h3 className="mt-1.5 text-sm font-bold leading-tight">
                          {ev?.title ?? "Evento"}
                        </h3>
                        {p && (
                          <p className="mt-0.5 text-[11px] text-neutral-500">
                            {p.day} {p.month} {p.year}
                            {ev?.start_time && ` · ${ev.start_time.slice(0, 5)}`}
                          </p>
                        )}
                        <p className="mt-1 text-[11px] text-neutral-500">
                          {t.quantity} {t.quantity === 1 ? "ingresso" : "ingressos"} ·{" "}
                          {Number(t.total_price) === 0
                            ? "Gratuito"
                            : money(Number(t.total_price))}
                        </p>
                      </div>
                    </div>

                    {/* Faixa do código, estilo canhoto */}
                    <div className="flex items-center justify-between border-t border-dashed border-neutral-200 bg-neutral-50 px-4 py-3">
                      <span className="flex items-center gap-2">
                        <QrCode size={16} className="text-neutral-400" />
                        <span className="font-mono text-sm font-bold tracking-widest text-neutral-800">
                          {t.code}
                        </span>
                      </span>
                      <form action={cancelTicket.bind(null, t.id)}>
                        <button
                          type="submit"
                          className="ibau-pressable text-[11px] font-medium text-neutral-400 underline"
                        >
                          Cancelar
                        </button>
                      </form>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-200 px-4 py-14 text-center">
                <Ticket size={26} className="mx-auto mb-2 text-neutral-300" />
                <p className="text-sm font-medium text-neutral-600">
                  Você ainda não tem ingressos
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Inscreva-se em um evento na aba Programação.
                </p>
              </div>
            )}
          </div>
        )}

        <BottomNav />
      </main>
    </>
  );
}
