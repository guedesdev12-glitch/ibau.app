import { NotebookPen, Trash2, BookMarked } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createNote, deleteNote } from "@/app/actions/diario";
import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";

export default async function AnotacoesPage() {
  const supabase = await createClient();

  const { data: notes } = await supabase
    .from("notes")
    .select("id, title, content, verse_reference, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-40 pt-6">
        <h1 className="ibau-section-title mb-1 text-lg font-semibold">
          <span className="ibau-section-icon">
            <NotebookPen size={15} />
          </span>
          Anotações
        </h1>
        <p className="mb-6 ml-9 text-xs text-neutral-500">
          Só você vê suas anotações.
        </p>

        <form action={createNote} className="ibau-card mb-6 space-y-3 p-5">
          <input
            name="title"
            placeholder="Título (opcional)"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
          />
          <input
            name="verse_reference"
            placeholder="Versículo relacionado (opcional)"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
          />
          <textarea
            name="content"
            required
            rows={4}
            placeholder="O que Deus falou com você hoje?"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-[#14532d] py-2.5 text-sm font-medium text-white"
          >
            Salvar anotação
          </button>
        </form>

        <div className="space-y-2.5">
          {notes?.map((n) => (
            <article key={n.id} className="ibau-card p-4">
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
                  <button type="submit" className="text-neutral-300 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>

              {n.verse_reference && (
                <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#14532d]/8 px-2 py-1 text-[11px] font-medium text-[#14532d]">
                  <BookMarked size={11} /> {n.verse_reference}
                </p>
              )}

              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                {n.content}
              </p>
            </article>
          ))}

          {(!notes || notes.length === 0) && (
            <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-10 text-center text-sm text-neutral-500">
              Nenhuma anotação ainda.
            </p>
          )}
        </div>

        <BottomNav />
      </main>
    </>
  );
}
