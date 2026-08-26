"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Check,
  Users2,
  UserPlus,
  Star,
  ClipboardCheck,
  Plus,
  X,
  Loader2,
  CircleCheck,
} from "lucide-react";
import { saveMeetingReport } from "@/app/actions/meeting-report";

type Member = { id: string; full_name: string; avatar_url: string | null; role: string };
type Visitor = { id: string; full_name: string };
type Study = { id: string; title: string; study_date: string };

const ROLE_LABEL: Record<string, string> = {
  lider: "Líder",
  anfitriao: "Co-líder",
  membro: "",
};

const STEPS = [
  { key: "info", label: "Encontro", icon: ClipboardCheck },
  { key: "presenca", label: "Presença", icon: Users2 },
  { key: "visitantes", label: "Visitantes", icon: UserPlus },
  { key: "avaliacao", label: "Avaliação", icon: Star },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function MeetingReportWizard({
  cellId,
  meetingId,
  meetingDate,
  members,
  existingVisitors,
  studies,
  initial,
}: {
  cellId: string;
  meetingId: string;
  meetingDate: string;
  members: Member[];
  existingVisitors: Visitor[];
  studies: Study[];
  initial: {
    startTime: string | null;
    endTime: string | null;
    hostId: string | null;
    studyId: string | null;
    theme: string | null;
    location: string | null;
    presentIds: string[];
    visitorIds: string[];
    rating: number | null;
    notes: string | null;
    offeringAmount: number | null;
    status: string;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<StepKey>("info");
  const [error, setError] = useState<string | null>(null);

  const [happened, setHappened] = useState(initial.status !== "nao_houve");
  const [startTime, setStartTime] = useState(initial.startTime?.slice(0, 5) ?? "20:00");
  const [endTime, setEndTime] = useState(initial.endTime?.slice(0, 5) ?? "21:30");
  const [hostId, setHostId] = useState(initial.hostId ?? "");
  const [subjectMode, setSubjectMode] = useState<"estudo" | "livre">(
    initial.theme && !initial.studyId ? "livre" : "estudo",
  );
  const [studyId, setStudyId] = useState(initial.studyId ?? studies[0]?.id ?? "");
  const [theme, setTheme] = useState(initial.theme ?? "");
  const [location, setLocation] = useState(initial.location ?? "");

  const [presentIds, setPresentIds] = useState<string[]>(initial.presentIds);
  const [visitorIds, setVisitorIds] = useState<string[]>(initial.visitorIds);
  const [newVisitors, setNewVisitors] = useState<string[]>([]);
  const [newVisitorInput, setNewVisitorInput] = useState("");

  const [rating, setRating] = useState<number | null>(initial.rating);
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [hadOffering, setHadOffering] = useState(
    initial.offeringAmount !== null && initial.offeringAmount > 0,
  );
  const [offeringAmount, setOfferingAmount] = useState(
    initial.offeringAmount ? String(initial.offeringAmount) : "",
  );

  const totalVisitors = visitorIds.length + newVisitors.length;

  const progress = useMemo(() => {
    if (!happened) return 100;
    let done = 0;
    const total = 4;
    if (startTime && endTime) done += 1;
    if (presentIds.length > 0) done += 1;
    if (rating !== null) done += 1;
    if (!hadOffering || offeringAmount) done += 1;
    return Math.round((done / total) * 100);
  }, [happened, startTime, endTime, presentIds.length, rating, hadOffering, offeringAmount]);

  function toggleMember(id: string) {
    setPresentIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  function toggleVisitor(id: string) {
    setVisitorIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  function addNewVisitor() {
    const trimmed = newVisitorInput.trim();
    if (!trimmed) return;
    setNewVisitors((prev) => [...prev, trimmed]);
    setNewVisitorInput("");
  }

  function handleSubmit() {
    setError(null);

    if (happened && rating === null) {
      setError("Dê uma nota para a reunião antes de registrar.");
      setStep("avaliacao");
      return;
    }
    if (happened && hadOffering && !offeringAmount) {
      setError("Informe o valor da oferta.");
      setStep("avaliacao");
      return;
    }

    startTransition(async () => {
      try {
        await saveMeetingReport({
          meetingId,
          cellId,
          happened,
          startTime: happened ? startTime : null,
          endTime: happened ? endTime : null,
          hostId: hostId || null,
          studyId: subjectMode === "estudo" ? studyId || null : null,
          theme: subjectMode === "livre" ? theme || null : null,
          location: location || null,
          presentProfileIds: presentIds,
          visitorIds,
          newVisitorNames: newVisitors,
          rating,
          notes: notes || null,
          hadOffering,
          offeringAmount: offeringAmount ? Number(offeringAmount.replace(",", ".")) : null,
        });
        router.push(`/dashboard/celulas/${cellId}`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao registrar a reunião.");
      }
    });
  }

  const dateLabel = new Date(meetingDate + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    weekday: "long",
  });

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Cabeçalho com progresso */}
      <header className="sticky top-0 z-20 border-b border-neutral-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 pb-3 pt-4">
          <button
            onClick={() => router.push(`/dashboard/celulas/${cellId}`)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <p className="text-sm font-semibold leading-tight">Registro de reunião</p>
            <p className="text-xs capitalize text-neutral-500">{dateLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold leading-none text-[#14532d]">{progress}%</p>
            <p className="text-[10px] text-neutral-400">completo</p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4">
          <div className="h-1 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-[#14532d] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <nav className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4 py-3">
          {STEPS.map((s) => {
            const active = step === s.key;
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => setStep(s.key)}
                disabled={!happened && s.key !== "info"}
                className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition disabled:opacity-30 ${
                  active
                    ? "bg-[#14532d] text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                <Icon size={13} />
                {s.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5">
        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        {/* ETAPA: INFORMAÇÕES */}
        {step === "info" && (
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                A reunião aconteceu?
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setHappened(true)}
                  className={`rounded-xl border-2 py-3 text-sm font-medium transition ${
                    happened
                      ? "border-[#14532d] bg-[#14532d]/5 text-[#14532d]"
                      : "border-neutral-200 text-neutral-500"
                  }`}
                >
                  Sim, aconteceu
                </button>
                <button
                  onClick={() => setHappened(false)}
                  className={`rounded-xl border-2 py-3 text-sm font-medium transition ${
                    !happened
                      ? "border-red-500 bg-red-50 text-red-600"
                      : "border-neutral-200 text-neutral-500"
                  }`}
                >
                  Não houve
                </button>
              </div>
            </div>

            {happened && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                      Início
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none focus:border-[#14532d]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                      Término
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none focus:border-[#14532d]"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    Assunto
                  </p>
                  <div className="mb-3 grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setSubjectMode("estudo")}
                      className={`rounded-xl border-2 py-2.5 text-sm font-medium transition ${
                        subjectMode === "estudo"
                          ? "border-[#14532d] bg-[#14532d]/5 text-[#14532d]"
                          : "border-neutral-200 text-neutral-500"
                      }`}
                    >
                      Estudo da semana
                    </button>
                    <button
                      onClick={() => setSubjectMode("livre")}
                      className={`rounded-xl border-2 py-2.5 text-sm font-medium transition ${
                        subjectMode === "livre"
                          ? "border-[#14532d] bg-[#14532d]/5 text-[#14532d]"
                          : "border-neutral-200 text-neutral-500"
                      }`}
                    >
                      Tema livre
                    </button>
                  </div>

                  {subjectMode === "estudo" ? (
                    studies.length > 0 ? (
                      <select
                        value={studyId}
                        onChange={(e) => setStudyId(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none focus:border-[#14532d]"
                      >
                        {studies.map((s) => (
                          <option key={s.id} value={s.id}>
                            {new Date(s.study_date + "T00:00:00").toLocaleDateString("pt-BR")} —{" "}
                            {s.title}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-4 text-center text-xs text-neutral-400">
                        Nenhum estudo publicado ainda.
                      </p>
                    )
                  ) : (
                    <input
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      placeholder="Qual foi o tema?"
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none focus:border-[#14532d]"
                    />
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                    Anfitrião
                  </label>
                  <select
                    value={hostId}
                    onChange={(e) => setHostId(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none focus:border-[#14532d]"
                  >
                    <option value="">Selecione</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                    Local
                  </label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Onde foi o encontro?"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none focus:border-[#14532d]"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ETAPA: PRESENÇA */}
        {step === "presenca" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Quem esteve presente?</p>
                <p className="text-xs text-neutral-500">
                  {presentIds.length} de {members.length} membros
                </p>
              </div>
              <button
                onClick={() =>
                  setPresentIds(
                    presentIds.length === members.length ? [] : members.map((m) => m.id),
                  )
                }
                className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600"
              >
                {presentIds.length === members.length ? "Limpar" : "Marcar todos"}
              </button>
            </div>

            <div className="space-y-2">
              {members.map((m) => {
                const present = presentIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleMember(m.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition ${
                      present
                        ? "border-[#14532d] bg-[#14532d]/[0.04]"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-neutral-900">
                      {m.avatar_url ? (
                        <Image src={m.avatar_url} alt={m.full_name} fill className="object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-white">
                          {initials(m.full_name)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-tight">{m.full_name}</p>
                      {ROLE_LABEL[m.role] && (
                        <p className="text-xs text-neutral-400">{ROLE_LABEL[m.role]}</p>
                      )}
                    </div>
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full transition ${
                        present ? "bg-[#14532d] text-white" : "border-2 border-neutral-200"
                      }`}
                    >
                      {present && <Check size={14} strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
              {members.length === 0 && (
                <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-8 text-center text-sm text-neutral-400">
                  Nenhum membro cadastrado nessa célula.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ETAPA: VISITANTES */}
        {step === "visitantes" && (
          <div>
            <p className="mb-1 text-sm font-semibold">Visitantes presentes</p>
            <p className="mb-4 text-xs text-neutral-500">
              {totalVisitors} {totalVisitors === 1 ? "visitante" : "visitantes"} neste encontro
            </p>

            <div className="mb-4 flex gap-2">
              <input
                value={newVisitorInput}
                onChange={(e) => setNewVisitorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addNewVisitor();
                  }
                }}
                placeholder="Nome do visitante"
                className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none focus:border-[#14532d]"
              />
              <button
                onClick={addNewVisitor}
                className="flex items-center gap-1 rounded-xl bg-[#14532d] px-4 text-sm font-medium text-white"
              >
                <Plus size={16} /> Add
              </button>
            </div>

            {newVisitors.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {newVisitors.map((name, i) => (
                  <span
                    key={`${name}-${i}`}
                    className="flex items-center gap-1.5 rounded-full bg-[#14532d]/10 px-3 py-1.5 text-xs font-medium text-[#14532d]"
                  >
                    {name}
                    <button
                      onClick={() => setNewVisitors((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {existingVisitors.length > 0 && (
              <>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Já visitaram antes
                </p>
                <div className="space-y-2">
                  {existingVisitors.map((v) => {
                    const selected = visitorIds.includes(v.id);
                    return (
                      <button
                        key={v.id}
                        onClick={() => toggleVisitor(v.id)}
                        className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition ${
                          selected
                            ? "border-[#14532d] bg-[#14532d]/[0.04]"
                            : "border-neutral-200 bg-white"
                        }`}
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
                          {initials(v.full_name)}
                        </span>
                        <p className="flex-1 text-sm font-medium">{v.full_name}</p>
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full transition ${
                            selected ? "bg-[#14532d] text-white" : "border-2 border-neutral-200"
                          }`}
                        >
                          {selected && <Check size={14} strokeWidth={3} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ETAPA: AVALIAÇÃO */}
        {step === "avaliacao" && (
          <div className="space-y-6">
            <div>
              <p className="mb-1 text-sm font-semibold">Como foi a reunião?</p>
              <p className="mb-3 text-xs text-neutral-500">Dê uma nota de 0 a 10</p>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 11 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setRating(i)}
                    className={`aspect-square rounded-xl text-sm font-semibold transition ${
                      rating !== null && i <= rating
                        ? "bg-[#14532d] text-white"
                        : "bg-neutral-100 text-neutral-400"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Acontecimentos</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Pedidos de oração, decisões, avisos, algo marcante..."
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none focus:border-[#14532d]"
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">Houve oferta?</p>
              <div className="mb-3 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setHadOffering(true)}
                  className={`rounded-xl border-2 py-2.5 text-sm font-medium transition ${
                    hadOffering
                      ? "border-[#14532d] bg-[#14532d]/5 text-[#14532d]"
                      : "border-neutral-200 text-neutral-500"
                  }`}
                >
                  Sim
                </button>
                <button
                  onClick={() => setHadOffering(false)}
                  className={`rounded-xl border-2 py-2.5 text-sm font-medium transition ${
                    !hadOffering
                      ? "border-neutral-900 bg-neutral-50 text-neutral-900"
                      : "border-neutral-200 text-neutral-500"
                  }`}
                >
                  Não
                </button>
              </div>
              {hadOffering && (
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                    R$
                  </span>
                  <input
                    inputMode="decimal"
                    value={offeringAmount}
                    onChange={(e) => setOfferingAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#14532d]"
                  />
                </div>
              )}
            </div>

            {/* Resumo ao vivo — diferencial */}
            <div className="rounded-2xl bg-[#14532d] p-4 text-white">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/60">
                Resumo do registro
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-2xl font-bold leading-none">{presentIds.length}</p>
                  <p className="mt-1 text-[10px] text-white/60">Presentes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">{totalVisitors}</p>
                  <p className="mt-1 text-[10px] text-white/60">Visitantes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">
                    {hadOffering && offeringAmount
                      ? `R$${Number(offeringAmount.replace(",", ".")).toFixed(0)}`
                      : "—"}
                  </p>
                  <p className="mt-1 text-[10px] text-white/60">Oferta</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Barra de ação fixa */}
      <div className="fixed inset-x-0 bottom-0 border-t border-neutral-100 bg-white/95 px-4 pb-6 pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl gap-2.5">
          {step !== "avaliacao" && happened ? (
            <button
              onClick={() => {
                const idx = STEPS.findIndex((s) => s.key === step);
                setStep(STEPS[Math.min(idx + 1, STEPS.length - 1)].key);
              }}
              className="flex-1 rounded-xl bg-neutral-900 py-3.5 text-sm font-semibold text-white"
            >
              Continuar
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#14532d] py-3.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <CircleCheck size={17} />
              )}
              {isPending ? "Registrando..." : "Registrar reunião"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
