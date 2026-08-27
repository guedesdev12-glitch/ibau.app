"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  User,
  MapPin,
  Church,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CircleCheck,
  Search,
} from "lucide-react";
import { completeOnboarding } from "@/app/actions/onboarding";
import { formatCPF, formatPhone, formatCEP, isValidCPF, onlyDigits } from "@/lib/br-format";

type Role = { id: string; name: string };

const STEPS = [
  { key: "pessoal", label: "Você", icon: User },
  { key: "endereco", label: "Endereço", icon: MapPin },
  { key: "igreja", label: "Igreja", icon: Church },
] as const;

const UF = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const input =
  "w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#14532d]";
const label = "mb-1.5 block text-xs font-medium text-neutral-600";

export function OnboardingWizard({
  roles,
  initialName,
  initialEmail,
}: {
  roles: Role[];
  initialName: string;
  initialEmail: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);

  const [fullName, setFullName] = useState(initialName);
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [postalCode, setPostalCode] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [roleId, setRoleId] = useState("");
  const [attendedEncounter, setAttendedEncounter] = useState<boolean | null>(null);
  const [encounterDate, setEncounterDate] = useState("");

  const step = STEPS[stepIndex];
  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  async function lookupCep(value: string) {
    const digits = onlyDigits(value);
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setStreet(data.logradouro || "");
        setNeighborhood(data.bairro || "");
        setCity(data.localidade || "");
        setState(data.uf || "");
      }
    } catch {
      /* preenchimento manual continua disponível */
    } finally {
      setCepLoading(false);
    }
  }

  function validateStep() {
    setError(null);
    if (stepIndex === 0) {
      if (!fullName.trim()) return "Informe seu nome completo.";
      if (!isValidCPF(cpf)) return "CPF inválido. Confira os números.";
      if (onlyDigits(phone).length < 10) return "Informe um telefone válido com DDD.";
    }
    if (stepIndex === 1) {
      if (!street.trim() || !number.trim() || !city.trim()) {
        return "Preencha ao menos rua, número e cidade.";
      }
    }
    if (stepIndex === 2) {
      if (!roleId) return "Selecione como você participa da igreja.";
      if (attendedEncounter === null) return "Informe se já participou do Encontro com Deus.";
    }
    return null;
  }

  function next() {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function submit() {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    startTransition(async () => {
      try {
        await completeOnboarding({
          fullName,
          cpf,
          phone,
          birthDate: birthDate || null,
          postalCode,
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          roleId,
          attendedEncounter: attendedEncounter ?? false,
          encounterDate: encounterDate || null,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Não foi possível salvar seu cadastro.");
      }
    });
  }

  return (
    <main className="min-h-screen bg-white pb-32">
      <header className="sticky top-0 z-20 border-b border-neutral-100 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-sm px-4 pb-3 pt-5">
          <div className="mb-3 flex items-center gap-3">
            <Image src="/logo-mark-v2.png" alt="IBAU" width={34} height={34} />
            <div className="flex-1">
              <p className="text-sm font-bold leading-tight">Complete seu cadastro</p>
              <p className="text-[11px] text-neutral-500">
                Etapa {stepIndex + 1} de {STEPS.length} · {step.label}
              </p>
            </div>
            <span className="text-sm font-bold text-[#14532d]">{progress}%</span>
          </div>

          <div className="h-1 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-[#14532d] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-sm px-4 py-6">
        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        {/* ETAPA 1 */}
        {step.key === "pessoal" && (
          <div className="ibau-enter space-y-4">
            <div>
              <h2 className="text-xl font-bold">Seus dados</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Precisamos disso para o cadastro de membro.
              </p>
            </div>

            <div>
              <label className={label}>Nome completo</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Como está no documento"
                className={input}
              />
            </div>

            <div>
              <label className={label}>E-mail</label>
              <input value={initialEmail} disabled className={`${input} text-neutral-400`} />
            </div>

            <div>
              <label className={label}>CPF</label>
              <input
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                inputMode="numeric"
                placeholder="000.000.000-00"
                className={input}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Telefone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  inputMode="numeric"
                  placeholder="(00) 00000-0000"
                  className={input}
                />
              </div>
              <div>
                <label className={label}>Nascimento</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className={input}
                />
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 2 */}
        {step.key === "endereco" && (
          <div className="ibau-enter space-y-4">
            <div>
              <h2 className="text-xl font-bold">Onde você mora</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Ajuda a conectar você com a célula mais próxima.
              </p>
            </div>

            <div>
              <label className={label}>CEP</label>
              <div className="relative">
                <input
                  value={postalCode}
                  onChange={(e) => {
                    const v = formatCEP(e.target.value);
                    setPostalCode(v);
                    if (onlyDigits(v).length === 8) lookupCep(v);
                  }}
                  inputMode="numeric"
                  placeholder="00000-000"
                  className={input}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                  {cepLoading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Search size={15} />
                  )}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-neutral-400">
                Preenchemos o endereço automaticamente.
              </p>
            </div>

            <div>
              <label className={label}>Rua</label>
              <input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className={input}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Número</label>
                <input
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className={input}
                />
              </div>
              <div>
                <label className={label}>Complemento</label>
                <input
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  placeholder="Apto, bloco..."
                  className={input}
                />
              </div>
            </div>

            <div>
              <label className={label}>Bairro</label>
              <input
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className={input}
              />
            </div>

            <div className="grid grid-cols-[1fr_90px] gap-3">
              <div>
                <label className={label}>Cidade</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} className={input} />
              </div>
              <div>
                <label className={label}>UF</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className={input}
                >
                  <option value="">--</option>
                  {UF.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 3 */}
        {step.key === "igreja" && (
          <div className="ibau-enter space-y-5">
            <div>
              <h2 className="text-xl font-bold">Sua caminhada</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Assim direcionamos você da melhor forma.
              </p>
            </div>

            <div>
              <label className={label}>Como você participa hoje?</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRoleId(r.id)}
                    className={`rounded-xl border-2 py-3 text-sm font-medium transition ${
                      roleId === r.id
                        ? "border-[#14532d] bg-[#14532d]/5 text-[#14532d]"
                        : "border-neutral-200 text-neutral-600"
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-neutral-400">
                A liderança pode ajustar isso depois.
              </p>
            </div>

            <div>
              <label className={label}>Você já fez o Encontro com Deus?</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAttendedEncounter(true)}
                  className={`rounded-xl border-2 py-3 text-sm font-medium transition ${
                    attendedEncounter === true
                      ? "border-[#14532d] bg-[#14532d]/5 text-[#14532d]"
                      : "border-neutral-200 text-neutral-600"
                  }`}
                >
                  Já participei
                </button>
                <button
                  type="button"
                  onClick={() => setAttendedEncounter(false)}
                  className={`rounded-xl border-2 py-3 text-sm font-medium transition ${
                    attendedEncounter === false
                      ? "border-[#f0a922] bg-[#f0a922]/10 text-[#8a5c07]"
                      : "border-neutral-200 text-neutral-600"
                  }`}
                >
                  Ainda não
                </button>
              </div>
            </div>

            {attendedEncounter === true && (
              <div className="ibau-enter">
                <label className={label}>Quando foi? (opcional)</label>
                <input
                  type="date"
                  value={encounterDate}
                  onChange={(e) => setEncounterDate(e.target.value)}
                  className={input}
                />
              </div>
            )}

            {attendedEncounter === false && (
              <div className="ibau-enter rounded-xl bg-[#f0a922]/10 p-4">
                <p className="text-sm font-semibold text-[#8a5c07]">
                  Temos algo especial para você
                </p>
                <p className="mt-1 text-xs text-neutral-600">
                  O Encontro com Deus é um marco na caminhada. Vamos te avisar da próxima data.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="fixed inset-x-0 bottom-0 border-t border-neutral-100 bg-white/95 px-4 pb-7 pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-sm gap-2.5">
          {stepIndex > 0 && (
            <button
              onClick={() => setStepIndex((i) => i - 1)}
              className="ibau-pressable flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 px-5 py-3.5 text-sm font-medium"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
          )}

          {stepIndex < STEPS.length - 1 ? (
            <button
              onClick={next}
              className="ibau-pressable flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#14532d] py-3.5 text-sm font-semibold text-white"
            >
              Continuar <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={isPending}
              className="ibau-pressable flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#14532d] py-3.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CircleCheck size={16} />
              )}
              {isPending ? "Salvando..." : "Concluir cadastro"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
