"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";

export function UserRowActions({ userId, active }: { userId: string; active: boolean }) {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleReset() {
    setError(null);
    setNewPassword(null);
    setIsResetting(true);
    try {
      const res = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const body: { ok?: boolean; error?: string; newPassword?: string } = await res.json();
      if (!res.ok || !body.ok) throw new Error(body.error || "Falha ao resetar senha.");
      setNewPassword(body.newPassword ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao resetar senha.");
    } finally {
      setIsResetting(false);
    }
  }

  async function handleToggle() {
    setError(null);
    setIsToggling(true);
    try {
      const res = await fetch("/api/admin/users/toggle-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, active: !active }),
      });
      const body: { ok?: boolean; error?: string } = await res.json();
      if (!res.ok || !body.ok) throw new Error(body.error || "Falha ao atualizar status.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar status.");
    } finally {
      setIsToggling(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleReset}
          disabled={isResetting}
          className="flex items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600 disabled:opacity-50"
        >
          {isResetting ? <Loader2 size={12} className="animate-spin" /> : <KeyRound size={12} />}
          Resetar senha
        </button>
        <button
          type="button"
          onClick={handleToggle}
          disabled={isToggling}
          className={`rounded-full px-2.5 py-1 text-xs disabled:opacity-50 ${
            active ? "bg-neutral-100 text-neutral-600" : "bg-red-50 text-red-600"
          }`}
        >
          {active ? "Ativo" : "Bloqueado"}
        </button>
      </div>
      {newPassword && (
        <p className="max-w-[200px] rounded-lg bg-green-50 px-2 py-1 text-right text-[11px] text-green-800">
          Nova senha: <span className="font-mono">{newPassword}</span>
        </p>
      )}
      {error && <p className="max-w-[200px] text-right text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
