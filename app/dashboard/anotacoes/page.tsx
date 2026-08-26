import { NotebookPen, Trash2, BookMarked, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createNote, deleteNote } from "@/app/actions/diario";
import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";
import { PageHeader } from "@/components/page-header";

export default async function AnotacoesPage() {
  const supabase = await createClient();

  const { data: notes, error } = await supabase
    .from("notes")
    .select("id, title, content, verse_reference, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-40 pt-6">
        <PageHeader
          title="Anotações"
          subtitle="Só você vê o que escreve aqui."
          icon={NotebookPen}
        />

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error.message}
          </p>
        )}

        <form action={createNote} className="ibau-card mb-6 space-y-3 p-5">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Plus size={15} /> Nova anotação
          </p>
          <input
            name="title"
            placeholder="Título (opcional)"
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none focus:border-[#14532d]"
          />
          <input
            name="verse_reference"
            placeholder="Versículo relacionado (opcional)"
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none focus:border-[#14532d]"
          />
          <textarea
            name="content"
            required
            rows={4}
            placeholder="O que Deus falou com você hoje?"
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none focus:border-[#14532d]"
          />
          <button
            type="submit"
            className="ibau-pressable w-full rounded-lg bg-[#14532d] py-2.5 text-sm font-semibold text-white"
          >
            Salvar anotação
          </button>
        </form>

        <div className="space-y-2.5">
          {notes?.map((n, i) => (
            <article
              key={n.id}
              className="ibau-card ibau-card-accent ibau-enter p-4 pl-5"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  {n.title && <p className="text-sm font-semibold">{n.title}</p>}
                  <p className="text-[11px] text-neutral-400">
                    {new Date(n.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <form action={deleteNote.bind(null, n.id)}>
                  <button
                    type="submit"
                    aria-label="Excluir"
                    className="ibau-pressable text-neutral-300 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>

              {n.verse_reference && (
                <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#14532d]/10 px-2 py-1 text-[11px] font-semibold text-[#14532d]">
                  <BookMarked size={11} /> {n.verse_reference}
                </p>
              )}

              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                {n.content}
              </p>
            </article>
          ))}

          {!error && (!notes || notes.length === 0) && (
            <div className="rounded-2xl border border-dashed border-neutral-200 px-4 py-12 text-center">
              <NotebookPen size={26} className="mx-auto mb-2 text-neutral-300" />
              <p className="text-sm font-medium text-neutral-600">Nenhuma anotação ainda</p>
              <p className="mt-1 text-xs text-neutral-400">
                Escreva a primeira no formulário acima.
              </p>
            </div>
          )}
        </div>

        <BottomNav />
      </main>
    </>
  );
}
