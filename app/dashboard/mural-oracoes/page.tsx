import { MessagesSquare, Trash2, Heart, Sparkles, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  createPrayerRequest,
  togglePraying,
  markRequestAnswered,
  deletePrayerRequest,
} from "@/app/actions/diario";
import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";
import { PageHeader } from "@/components/page-header";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `há ${Math.max(mins, 1)} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days}d`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
}

export default async function MuralOracoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const myId = user?.id ?? "";

  const { data: requests, error } = await supabase
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
    if (p.profile_id === myId) myPrayers.add(p.request_id);
  });

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-40 pt-6">
        <PageHeader
          title="Mural de orações"
          subtitle="Compartilhe seu pedido e interceda pelos irmãos."
          icon={MessagesSquare}
        />

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error.message}
          </p>
        )}

        <form action={createPrayerRequest} className="ibau-card mb-6 space-y-3 p-5">
          <textarea
            name="content"
            required
            rows={3}
            placeholder="Qual é o seu pedido de oração?"
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none focus:border-[#14532d]"
          />
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs text-neutral-600">
              <input type="checkbox" name="is_anonymous" className="h-4 w-4 accent-[#14532d]" />
              Publicar como anônimo
            </label>
            <button
              type="submit"
              className="ibau-pressable flex items-center gap-1.5 rounded-lg bg-[#14532d] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Send size={14} /> Publicar
            </button>
          </div>
        </form>

        <div className="space-y-2.5">
          {requests?.map((r, i) => {
            const author = Array.isArray(r.profiles)
              ? r.profiles[0]
              : (r.profiles as { full_name: string } | null);
            const displayName = r.is_anonymous ? "Anônimo" : (author?.full_name ?? "Membro");
            const isMine = r.profile_id === myId;
            const praying = myPrayers.has(r.id);
            const count = countByRequest.get(r.id) ?? 0;

            return (
              <article
                key={r.id}
                className={`ibau-card ibau-enter p-4 ${r.answered ? "ibau-card-accent pl-5" : ""}`}
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                <div className="mb-2.5 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#14532d]/10 text-[11px] font-bold text-[#14532d]">
                      {r.is_anonymous ? "?" : initials(displayName)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold leading-tight">{displayName}</p>
                      <p className="text-[11px] text-neutral-400">{timeAgo(r.created_at)}</p>
                    </div>
                  </div>
                  {isMine && (
                    <form action={deletePrayerRequest.bind(null, r.id)}>
                      <button
                        type="submit"
                        aria-label="Excluir"
                        className="ibau-pressable text-neutral-300 hover:text-red-500"
                      >
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
                      className={`ibau-pressable flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold ${
                        praying
                          ? "bg-[#14532d] text-white"
                          : "border border-neutral-200 text-neutral-700"
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
                        className="ibau-pressable rounded-lg border border-neutral-200 px-3 py-2.5 text-xs font-medium text-neutral-700"
                      >
                        Respondida
                      </button>
                    </form>
                  )}
                </div>
              </article>
            );
          })}

          {!error && (!requests || requests.length === 0) && (
            <div className="rounded-2xl border border-dashed border-neutral-200 px-4 py-12 text-center">
              <MessagesSquare size={26} className="mx-auto mb-2 text-neutral-300" />
              <p className="text-sm font-medium text-neutral-600">Mural vazio por enquanto</p>
              <p className="mt-1 text-xs text-neutral-400">Seja o primeiro a compartilhar.</p>
            </div>
          )}
        </div>

        <BottomNav />
      </main>
    </>
  );
}
