import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  MapPin,
  Users2,
  Ticket,
  CalendarDays,
  CircleCheck,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";
import { PageHeader } from "@/components/page-header";
import { reserveTicket, deleteEvent } from "@/app/actions/tickets";

const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function EventoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: event } = await supabase.from("events").select("*").eq("id", id).single();
  if (!event) notFound();

  const [{ data: spotsLeft }, { data: myTicket }, { data: canManage }] = await Promise.all([
    supabase.rpc("event_spots_left", { p_event_id: id }),
    supabase
      .from("event_tickets")
      .select("id, code, quantity, status, total_price")
      .eq("event_id", id)
      .eq("profile_id", user?.id ?? "")
      .neq("status", "cancelado")
      .maybeSingle(),
    supabase.rpc("has_permission", { p_key: "igreja.manage" }),
  ]);

  const [yy, mm, dd] = event.event_date.split("-").map(Number);
  const dateLabel = `${dd} de ${MONTHS[mm - 1]} de ${yy}`;
  const soldOut = spotsLeft !== null && spotsLeft !== undefined && spotsLeft <= 0;
  const deadlinePassed =
    event.registration_deadline &&
    new Date().toISOString().slice(0, 10) > event.registration_deadline;
  const canRegister =
    event.registration_open && !soldOut && !deadlinePassed && !myTicket;

  const reserve = reserveTicket.bind(null, id);

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl pb-40">
        {/* Banner */}
        <div className="relative aspect-[16/11] w-full bg-neutral-900">
          {event.poster_url ? (
            <Image
              src={event.poster_url}
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#1c6b3c] to-[#0a2c18]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />

          <span
            className={`absolute right-4 top-4 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-lg ${
              event.is_free ? "bg-[#14532d] text-white" : "bg-[#f0a922] text-neutral-900"
            }`}
          >
            {event.is_free ? "GRATUITO" : money(Number(event.price ?? 0))}
          </span>

          <div className="absolute inset-x-0 bottom-0 p-5">
            <h1 className="text-2xl font-bold leading-tight text-white drop-shadow">
              {event.title}
            </h1>
            {event.subtitle && (
              <p className="mt-1 text-sm text-white/85">{event.subtitle}</p>
            )}
          </div>
        </div>

        <div className="px-4 pt-4">
          <PageHeader title="Detalhes do evento" fallbackHref="/dashboard/eventos" />

          {/* Informações */}
          <div className="ibau-card mb-4 divide-y divide-neutral-100">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <CalendarDays size={17} className="text-[#14532d]" />
              <div>
                <p className="text-sm font-medium capitalize">{dateLabel}</p>
                {event.start_time && (
                  <p className="text-xs text-neutral-500">
                    {event.start_time.slice(0, 5)}
                    {event.end_time && ` às ${event.end_time.slice(0, 5)}`}
                  </p>
                )}
              </div>
            </div>

            {event.location && (
              <div className="flex items-center gap-3 px-4 py-3.5">
                <MapPin size={17} className="text-[#14532d]" />
                <p className="text-sm font-medium">{event.location}</p>
              </div>
            )}

            {event.capacity && (
              <div className="flex items-center gap-3 px-4 py-3.5">
                <Users2 size={17} className="text-[#14532d]" />
                <p className="text-sm font-medium">
                  {soldOut ? (
                    <span className="text-red-600">Esgotado</span>
                  ) : (
                    <>
                      {spotsLeft} {spotsLeft === 1 ? "vaga restante" : "vagas restantes"}
                      <span className="text-neutral-400"> de {event.capacity}</span>
                    </>
                  )}
                </p>
              </div>
            )}

            {event.registration_deadline && (
              <div className="flex items-center gap-3 px-4 py-3.5">
                <Clock size={17} className="text-[#14532d]" />
                <p className="text-sm font-medium">
                  Inscrições até{" "}
                  {new Date(event.registration_deadline + "T00:00:00").toLocaleDateString(
                    "pt-BR",
                  )}
                </p>
              </div>
            )}
          </div>

          {event.description && (
            <div className="ibau-card mb-4 p-5">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Sobre o evento
              </p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                {event.description}
              </p>
            </div>
          )}

          {/* Inscrição */}
          {myTicket ? (
            <div className="rounded-2xl border-2 border-[#14532d]/25 bg-[#14532d]/5 p-5 text-center">
              <CircleCheck size={26} className="mx-auto mb-2 text-[#14532d]" />
              <p className="text-sm font-bold text-[#14532d]">
                {myTicket.status === "pendente"
                  ? "Inscrição reservada"
                  : "Você está inscrito!"}
              </p>
              <p className="mt-1 text-xs text-neutral-600">
                {myTicket.status === "pendente"
                  ? "Conclua o pagamento com a secretaria para confirmar."
                  : "Apresente o código na entrada."}
              </p>
              <p className="mt-3 font-mono text-lg font-bold tracking-widest text-neutral-900">
                {myTicket.code}
              </p>
              <Link
                href="/dashboard/eventos?tab=ingressos"
                className="mt-3 inline-block text-xs font-semibold text-[#14532d] underline"
              >
                Ver meus ingressos
              </Link>
            </div>
          ) : canRegister ? (
            <form action={reserve} className="ibau-card space-y-3 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Ticket size={16} /> Fazer inscrição
              </p>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                  Quantidade
                </label>
                <select
                  name="quantity"
                  defaultValue="1"
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "ingresso" : "ingressos"}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="ibau-pressable w-full rounded-xl bg-[#14532d] py-3.5 text-sm font-semibold text-white"
              >
                {event.is_free
                  ? "Garantir minha vaga"
                  : `Reservar · ${money(Number(event.price ?? 0))}`}
              </button>
              {!event.is_free && (
                <p className="text-center text-[11px] text-neutral-400">
                  A reserva fica pendente até a confirmação do pagamento.
                </p>
              )}
            </form>
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-200 px-4 py-8 text-center">
              <p className="text-sm font-medium text-neutral-600">
                {soldOut
                  ? "Evento esgotado"
                  : deadlinePassed
                    ? "Prazo de inscrição encerrado"
                    : "Inscrições encerradas"}
              </p>
            </div>
          )}

          {canManage && (
            <form action={deleteEvent.bind(null, id)} className="mt-6 text-center">
              <button
                type="submit"
                className="ibau-pressable inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400"
              >
                <Trash2 size={13} /> Excluir evento
              </button>
            </form>
          )}
        </div>

        <BottomNav />
      </main>
    </>
  );
}
