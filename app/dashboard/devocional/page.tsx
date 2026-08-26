import { Sunrise, Trash2, Quote } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createDevotional, deleteDevotional } from "@/app/actions/diario";
import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";
import { PageHeader } from "@/components/page-header";

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    weekday: "long",
  });
}

export default async function DevocionalPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: current }, { data: previous }, { data: canManage }] = await Promise.all([
    supabase
      .from("devotionals")
      .select("*")
      .lte("devotional_date", today)
      .order("devotional_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("devotionals")
      .select("id, devotional_date, title")
      .lte("devotional_date", today)
      .order("devotional_date", { ascending: false })
      .range(1, 15),
    supabase.rpc("has_permission", { p_key: "devocional.manage" }),
  ]);

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-40 pt-6">
        <PageHeader
          title="Devocional"
          subtitle="Uma palavra para o seu dia."
          icon={Sunrise}
        />

        {current ? (
          <article className="ibau-card mb-6 overflow-hidden">
            <div className="bg-[#14532d] px-5 py-4">
              <p className="text-[11px] font-medium capitalize text-white/60">
                {formatDate(current.devotional_date)}
              </p>
              <h2 className="mt-0.5 text-lg font-bold leading-tight text-white">
                {current.title}
              </h2>
            </div>

            {current.verse_text && (
              <div className="border-b border-neutral-100 bg-neutral-50 px-5 py-4">
                <Quote size={14} className="mb-1.5 text-neutral-400" />
                <p className="text-sm italic leading-relaxed text-neutral-700">
                  {current.verse_text}
                </p>
                {current.verse_reference && (
                  <p className="mt-1.5 text-xs font-semibold text-[#14532d]">
                    {current.verse_reference}
                  </p>
                )}
              </div>
            )}

            <div className="px-5 py-4">
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-neutral-800">
                {current.content}
              </p>
            </div>
          </article>
        ) : (
          <p className="mb-6 rounded-xl border border-dashed border-neutral-200 px-4 py-10 text-center text-sm text-neutral-500">
            Nenhum devocional publicado ainda.
          </p>
        )}

        {previous && previous.length > 0 && (
          <section className="mb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Anteriores
            </p>
            <div className="space-y-2">
              {previous.map((d) => (
                <div key={d.id} className="ibau-card flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs text-neutral-400">
                      {new Date(d.devotional_date + "T00:00:00").toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-sm font-medium">{d.title}</p>
                  </div>
                  {canManage && (
                    <form action={deleteDevotional.bind(null, d.id)}>
                      <button type="submit" className="text-neutral-300 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {canManage && (
          <form action={createDevotional} className="ibau-card space-y-3 p-5">
            <p className="text-sm font-semibold">Publicar devocional</p>
            <input
              type="date"
              name="devotional_date"
              required
              defaultValue={today}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
            />
            <input
              name="title"
              required
              placeholder="Título"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
            />
            <input
              name="verse_reference"
              placeholder="Referência (ex: Salmos 23:1)"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
            />
            <textarea
              name="verse_text"
              rows={2}
              placeholder="Texto do versículo"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
            />
            <textarea
              name="content"
              required
              rows={6}
              placeholder="Reflexão do dia"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-[#14532d] py-2.5 text-sm font-medium text-white"
            >
              Publicar
            </button>
          </form>
        )}

        <BottomNav />
      </main>
    </>
  );
}
