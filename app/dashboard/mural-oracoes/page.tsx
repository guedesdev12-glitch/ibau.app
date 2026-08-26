import { MessagesSquare, Trash2, Heart, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  createPrayerRequest,
  togglePraying,
  markRequestAnswered,
  deletePrayerRequest,
} from "@/app/actions/diario";
import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default async function MuralOracoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: requests } = await supabase
    .from("prayer_requests")
    .select("id, content, is_anonymous, answered, created_at, profile_id, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  const ids = requests?.map((r) => r.id) ?? [];
  const { data: prayers } = ids.length
    ? await supabase
        .from("prayer_request_prayers")
        .select("request_id, profile_id")
        .in("request_id", ids)
    : { data: [] as { request_id: string; profile_id: string }[] };

  const countByRequest = new Map<string, number>();
  const myPrayers = new Set<string>();
  prayers?.forEach((p) => {
    countByRequest.set(p.request_id, (countByRequest.get(p.request_id) ?? 0) + 1);
    if (p.profile_id === user!.id) myPrayers.add(p.request_id);
  });

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-40 pt-6">
        <h1 className="ibau-section-title mb-1 text-lg font-semibold">
          <span className="ibau-section-icon">
            <MessagesSquare size={15} />
          </span>
          Mural de orações
        </h1>
        <p className="mb-6 ml-9 text-xs text-neutral-500">
          Compartilhe seu pedido e ore pelos irmãos.
        </p>

        <form action={createPrayerRequest} className="ibau-card mb-6 space-y-3 p-5">
          <textarea
            name="content"
            required
            rows={3}
            placeholder="Qual é o seu pedido de oração?"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
          />
          <label className="flex items-center gap-2 text-xs text-neutral-600">
            <input type="checkbox" name="is_anonymous" className="h-4 w-4 accent-[#14532d]" />
            Publicar como anônimo
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-[#14532d] py-2.5 text-sm font-medium text-white"
          >
            Publicar pedido
          </button>
        </form>

        <div className="space-y-2.5">
          {requests?.map((r) => {
            const author = Array.isArray(r.profiles)
              ? r.profiles[0]
              : (r.profiles as { full_name: string } | null);
            const isMine = r.profile_id === user!.id;
            const praying = myPrayers.has(r.id);
            const count = countByRequest.get(r.id) ?? 0;

            return (
              <article
                key={r.id}
                className={`ibau-card p-4 ${r.answered ? "border-[#14532d]/25" : ""}`}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      {r.is_anonymous ? "Anônimo" : (author?.full_name ?? "Membro")}
                    </p>
                    <p className="text-[11px] text-neutral-400">{timeAgo(r.created_at)}</p>
                  </div>
                  {isMine && (
                    <form action={deletePrayerRequest.bind(null, r.id)}>
                      <button type="submit" className="text-neutral-300 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </form>
                  )}
                </div>

                {r.answered && (
                  <p className="mb-2 inline-flex items-center gap-1 rounded-md bg-[#14532d]/10 px-2 py-1 text-[11px] font-semibold text-[#14532d]">
                    <Sparkles size={11} /> Oração respondida
                  </p>
                )}

                <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                  {r.content}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <form action={togglePraying.bind(null, r.id, !praying)} className="flex-1">
                    <button
                      type="submit"
                      className={`flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold ${
                        praying
                          ? "bg-[#14532d] text-white"
                          : "border border-neutral-200 text-neutral-600"
                      }`}
                    >
                      <Heart size={13} fill={praying ? "currentColor" : "none"} />
                      {praying ? "Orando por você" : "Orar por este pedido"}
                      {count > 0 && ` · ${count}`}
                    </button>
                  </form>
                  {isMine && !r.answered && (
                    <form action={markRequestAnswered.bind(null, r.id)}>
                      <button
                        type="submit"
                        className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600"
                      >
                        Respondida
                      </button>
                    </form>
                  )}
                </div>
              </article>
            );
          })}

          {(!requests || requests.length === 0) && (
            <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-10 text-center text-sm text-neutral-500">
              Nenhum pedido no mural ainda. Seja o primeiro.
            </p>
          )}
        </div>

        <BottomNav />
      </main>
    </>
  );
}
