import { HandHeart, Trash2, Check, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  createPrayerItem,
  markPrayed,
  toggleAnswered,
  deletePrayerItem,
} from "@/app/actions/diario";
import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";

export default async function PlanoOracaoPage() {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("prayer_items")
    .select("id, title, description, answered, prayed_count, last_prayed_at, created_at")
    .order("answered")
    .order("created_at", { ascending: false });

  const active = items?.filter((i) => !i.answered) ?? [];
  const answered = items?.filter((i) => i.answered) ?? [];
  const todayStr = new Date().toDateString();

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-40 pt-6">
        <h1 className="ibau-section-title mb-1 text-lg font-semibold">
          <span className="ibau-section-icon">
            <HandHeart size={15} />
          </span>
          Plano de oração
        </h1>
        <p className="mb-6 ml-9 text-xs text-neutral-500">
          Seus alvos de oração. Só você vê.
        </p>

        <form action={createPrayerItem} className="ibau-card mb-6 space-y-3 p-5">
          <input
            name="title"
            required
            placeholder="Pelo que você quer orar?"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
          />
          <textarea
            name="description"
            rows={2}
            placeholder="Detalhes (opcional)"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-[#14532d] py-2.5 text-sm font-medium text-white"
          >
            Adicionar alvo
          </button>
        </form>

        <div className="space-y-2.5">
          {active.map((item) => {
            const prayedToday =
              item.last_prayed_at && new Date(item.last_prayed_at).toDateString() === todayStr;
            return (
              <article key={item.id} className="ibau-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.title}</p>
                    {item.description && (
                      <p className="mt-0.5 text-xs text-neutral-500">{item.description}</p>
                    )}
                    <p className="mt-1.5 text-[11px] text-neutral-400">
                      {item.prayed_count === 0
                        ? "Ainda não orou por este alvo"
                        : `Orou ${item.prayed_count} ${item.prayed_count === 1 ? "vez" : "vezes"}`}
                    </p>
                  </div>
                  <form action={deletePrayerItem.bind(null, item.id)}>
                    <button type="submit" className="text-neutral-300 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </form>
                </div>

                <div className="mt-3 flex gap-2">
                  <form action={markPrayed.bind(null, item.id, item.prayed_count)} className="flex-1">
                    <button
                      type="submit"
                      className={`w-full rounded-lg py-2 text-xs font-semibold ${
                        prayedToday
                          ? "bg-[#14532d]/10 text-[#14532d]"
                          : "bg-[#14532d] text-white"
                      }`}
                    >
                      {prayedToday ? "Orei hoje ✓" : "Orei agora"}
                    </button>
                  </form>
                  <form action={toggleAnswered.bind(null, item.id, true)}>
                    <button
                      type="submit"
                      className="flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600"
                    >
                      <Check size={13} /> Respondido
                    </button>
                  </form>
                </div>
              </article>
            );
          })}

          {active.length === 0 && (
            <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-10 text-center text-sm text-neutral-500">
              Nenhum alvo de oração ativo.
            </p>
          )}
        </div>

        {answered.length > 0 && (
          <section className="mt-8">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              <Sparkles size={12} /> Orações respondidas ({answered.length})
            </p>
            <div className="space-y-2">
              {answered.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-[#14532d]/20 bg-[#14532d]/5 px-4 py-3"
                >
                  <p className="text-sm font-medium text-[#14532d] line-through decoration-[#14532d]/40">
                    {item.title}
                  </p>
                  <form action={toggleAnswered.bind(null, item.id, false)}>
                    <button type="submit" className="text-[11px] text-neutral-500 underline">
                      Reabrir
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        )}

        <BottomNav />
      </main>
    </>
  );
}
