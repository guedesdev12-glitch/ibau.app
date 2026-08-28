"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
  icon,
  fallbackHref = "/dashboard",
}: {
  title: string;
  subtitle?: string;
  /** Elemento já renderizado (ex: <Sunrise size={15} />). Nunca o componente em si:
   *  funções não atravessam a fronteira servidor → cliente. */
  icon?: ReactNode;
  fallbackHref?: string;
}) {
  const router = useRouter();

  return (
    <div className="mb-6 flex items-start gap-3">
      <button
        onClick={() => {
          if (typeof window !== "undefined" && window.history.length > 1) router.back();
          else router.push(fallbackHref);
        }}
        aria-label="Voltar"
        className="ibau-pressable mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700"
      >
        <ArrowLeft size={18} />
      </button>

      <div className="flex-1">
        <h1 className="ibau-section-title text-lg font-semibold">
          {icon && <span className="ibau-section-icon">{icon}</span>}
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>}
      </div>
    </div>
  );
}
