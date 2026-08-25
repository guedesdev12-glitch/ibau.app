import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createCell } from "@/app/actions/cells";
import { BottomNav } from "@/components/bottom-nav";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default async function CelulasPage() {
  const supabase = await createClient();

  const [{ data: cells }, { data: canManage }] = await Promise.all([
    supabase
      .from("cells")
      .select("id, name, neighborhood, meeting_weekday, meeting_time, active")
      .order("name"),
    supabase.rpc("has_permission", { p_key: "celulas.manage" }),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-semibold">Células</h1>
      </div>

      <ul className="mb-8 space-y-2">
        {cells?.map((cell) => (
          <li key={cell.id}>
            <Link
              href={`/dashboard/celulas/${cell.id}`}
              className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 text-sm"
            >
              <span>
                <p className="font-medium">{cell.name}</p>
                <p className="text-neutral-500">
                  {cell.neighborhood ?? "Bairro não informado"}
                  {cell.meeting_weekday !== null &&
                    ` · ${WEEKDAYS[cell.meeting_weekday]}${cell.meeting_time ? ` às ${cell.meeting_time}` : ""}`}
                </p>
              </span>
              <ChevronRight size={16} className="text-neutral-400" />
            </Link>
          </li>
        ))}
        {cells?.length === 0 && (
          <p className="text-sm text-neutral-500">Nenhuma célula cadastrada ainda.</p>
        )}
      </ul>

      {canManage && (
        <section className="rounded-xl border border-neutral-200 p-4">
          <h2 className="mb-3 text-sm font-medium">Nova célula</h2>
          <form action={createCell} className="space-y-3">
            <input
              name="name"
              placeholder="Nome da célula"
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
            <input
              name="neighborhood"
              placeholder="Bairro"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
            <div className="flex gap-3">
              <select
                name="meeting_weekday"
                className="w-1/2 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              >
                <option value="">Dia da semana</option>
                {WEEKDAYS.map((day, idx) => (
                  <option key={day} value={idx}>
                    {day}
                  </option>
                ))}
              </select>
              <input
                type="time"
                name="meeting_time"
                className="w-1/2 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-[#173B2C] py-2.5 text-sm font-medium text-white"
            >
              Criar célula
            </button>
          </form>
        </section>
      )}

      <BottomNav />
    </main>
  );
}
