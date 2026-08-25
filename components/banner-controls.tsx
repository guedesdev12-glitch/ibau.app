"use client";

import { useTransition } from "react";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";

export function BannerControls({
  bannerId,
  active,
  isFirst,
  isLast,
  onMove,
  onToggle,
  onDelete,
}: {
  bannerId: string;
  active: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMove: (id: string, direction: "up" | "down") => Promise<void>;
  onToggle: (id: string, active: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1">
      <button
        disabled={isFirst || isPending}
        onClick={() => startTransition(() => onMove(bannerId, "up"))}
        className="rounded p-1.5 text-neutral-500 disabled:opacity-30"
      >
        <ArrowUp size={14} />
      </button>
      <button
        disabled={isLast || isPending}
        onClick={() => startTransition(() => onMove(bannerId, "down"))}
        className="rounded p-1.5 text-neutral-500 disabled:opacity-30"
      >
        <ArrowDown size={14} />
      </button>
      <label className="flex items-center gap-1 text-xs text-neutral-500">
        <input
          type="checkbox"
          defaultChecked={active}
          disabled={isPending}
          onChange={(e) =>
            startTransition(() => onToggle(bannerId, e.currentTarget.checked))
          }
          className="h-4 w-4 accent-[#173B2C]"
        />
        Ativo
      </label>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => onDelete(bannerId))}
        className="rounded p-1.5 text-neutral-400 hover:text-red-500"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
