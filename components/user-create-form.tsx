"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2 } from "lucide-react";

type Role = { id: string; name: string };

export function UserCreateForm({ roles }: { roles: Role[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdInfo, setCreatedInfo] = useState<{ email: string; password: string } | null>(
    null,
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCreatedInfo(null);
    setIsSubmitting(true);

    const form = e.currentTarget;
    const fullName = (form.elements.namedItem("fullName") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const roleId = (form.elements.namedItem("roleId") as HTMLSelectElement).value;

    try {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, roleId }),
      });

      const body: { ok?: boolean; error?: string } = await res.json();
      if (!res.ok || !body.ok) {
        throw new Error(body.error || `Falha ao criar usuário (status ${res.status}).`);
      }

      setCreatedInfo({ email, password });
      formRef.current?.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido ao criar usuário.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="ibau-card space-y-3 p-5">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <UserPlus size={16} /> Cadastrar usuário
      </p>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      {createdInfo && (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
          <p className="font-medium">Usuário criado! Compartilhe o acesso:</p>
          <p className="mt-1">
            E-mail: <span className="font-mono">{createdInfo.email}</span>
          </p>
          <p>
            Senha: <span className="font-mono">{createdInfo.password}</span>
          </p>
          <p className="mt-1 text-xs text-green-700">
            Essa senha só aparece agora — anote antes de sair da tela.
          </p>
        </div>
      )}

      <input
        name="fullName"
        required
        placeholder="Nome completo"
        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="E-mail"
        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
      />
      <input
        name="password"
        type="text"
        required
        minLength={6}
        placeholder="Senha provisória (mín. 6 caracteres)"
        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
      />
      <select
        name="roleId"
        required
        defaultValue=""
        className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
      >
        <option value="" disabled>
          Categoria
        </option>
        {roles.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? "Criando..." : "Criar usuário"}
      </button>
    </form>
  );
}
