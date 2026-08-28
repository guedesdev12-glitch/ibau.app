import Link from "next/link";
import { BookOpenText, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";
import { PageHeader } from "@/components/page-header";
import { OLD_TESTAMENT, NEW_TESTAMENT, findBook } from "@/lib/bible-books";

type Verse = { verse: number; text: string };

async function fetchChapter(bookAbbrev: string, chapter: number) {
  try {
    const res = await fetch(
      `https://bible-api.com/${encodeURIComponent(bookAbbrev)}+${chapter}?translation=almeida`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { verses?: Verse[]; reference?: string };
    return data?.verses?.length ? data : null;
  } catch {
    return null;
  }
}

export default async function BibliaPage({
  searchParams,
}: {
  searchParams: Promise<{ book?: string; chapter?: string }>;
}) {
  const { book: bookParam, chapter: chapterParam } = await searchParams;

  if (!bookParam) {
    return (
      <>
        <TopBar />
        <main className="mx-auto max-w-3xl px-4 pb-40 pt-6">
          <PageHeader title="Bíblia" subtitle="Almeida · 66 livros" icon={<BookOpenText size={15} />} />

          {[
            { label: "Antigo Testamento", books: OLD_TESTAMENT },
            { label: "Novo Testamento", books: NEW_TESTAMENT },
          ].map(({ label, books }) => (
            <section key={label} className="mb-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                {label}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {books.map((b) => (
                  <Link
                    key={b.abbrev}
                    href={`/dashboard/biblia?book=${encodeURIComponent(b.abbrev)}&chapter=1`}
                    className="ibau-card px-3 py-2.5 text-sm font-medium"
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            </section>
          ))}

          <BottomNav />
        </main>
      </>
    );
  }

  const book = findBook(bookParam);
  const chapter = Math.max(1, Math.min(Number(chapterParam ?? 1), book?.chapters ?? 1));

  if (!book) {
    return (
      <>
        <TopBar />
        <main className="mx-auto max-w-3xl px-4 pb-40 pt-6">
          <p className="text-sm text-neutral-500">Livro não encontrado.</p>
          <BottomNav />
        </main>
      </>
    );
  }

  const data = await fetchChapter(book.abbrev, chapter);

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-40 pt-6">
        <div className="mb-5 flex items-center gap-3">
          <Link href="/dashboard/biblia">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-semibold leading-tight">
              {book.name} {chapter}
            </h1>
            <p className="text-xs text-neutral-400">Almeida</p>
          </div>
        </div>

        {/* Seletor de capítulo */}
        <div className="-mx-4 mb-5 flex gap-1.5 overflow-x-auto px-4 pb-1">
          {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => (
            <Link
              key={c}
              href={`/dashboard/biblia?book=${encodeURIComponent(book.abbrev)}&chapter=${c}`}
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-medium ${
                c === chapter
                  ? "bg-[#14532d] text-white"
                  : "bg-neutral-100 text-neutral-600"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        {data?.verses ? (
          <article className="ibau-card space-y-3 p-5 leading-relaxed">
            {data.verses.map((v) => (
              <p key={v.verse} className="text-[15px] text-neutral-800">
                <span className="mr-1.5 align-super text-[11px] font-bold text-[#14532d]">
                  {v.verse}
                </span>
                {v.text.trim()}
              </p>
            ))}
          </article>
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-200 px-4 py-10 text-center">
            <p className="text-sm text-neutral-500">
              Não foi possível carregar este capítulo agora.
            </p>
            <p className="mt-1 text-xs text-neutral-400">Verifique a conexão e tente novamente.</p>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between">
          {chapter > 1 ? (
            <Link
              href={`/dashboard/biblia?book=${encodeURIComponent(book.abbrev)}&chapter=${chapter - 1}`}
              className="flex items-center gap-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium"
            >
              <ChevronLeft size={16} /> Anterior
            </Link>
          ) : (
            <span />
          )}
          {chapter < book.chapters && (
            <Link
              href={`/dashboard/biblia?book=${encodeURIComponent(book.abbrev)}&chapter=${chapter + 1}`}
              className="flex items-center gap-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium"
            >
              Próximo <ChevronRight size={16} />
            </Link>
          )}
        </div>

        <BottomNav />
      </main>
    </>
  );
}
