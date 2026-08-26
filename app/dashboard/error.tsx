"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert, RotateCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro no dashboard:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="ibau-card w-full max-w-sm p-6 text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <TriangleAlert size={22} />
        </span>
        <h1 className="text-base font-semibold">Algo deu errado nesta tela</h1>
        <p className="mt-1 text-xs text-neutral-500">
          Nada foi perdido. Você pode tentar de novo.
        </p>

        <pre className="mt-4 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-neutral-50 p-3 text-left text-[11px] leading-relaxed text-neutral-600">
          {error.message || "Erro desconhecido"}
          {error.digest ? `\n\nCódigo: ${error.digest}` : ""}
        </pre>

        <div className="mt-4 flex gap-2">
          <button
            onClick={reset}
            className="ibau-pressable flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#14532d] py-2.5 text-sm font-semibold text-white"
          >
            <RotateCw size={15} /> Tentar de novo
          </button>
          <Link
            href="/dashboard"
            className="ibau-pressable flex flex-1 items-center justify-center rounded-xl border border-neutral-200 py-2.5 text-sm font-medium"
          >
            Início
          </Link>
        </div>
      </div>
    </main>
  );
}
