import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/top-bar";
import { setNotes } from "@/app/actions/meetings";

export default async function ObservacoesPage({
  params,
}: {
  params: Promise<{ id: string; meetingId: string }>;
}) {
  const { id, meetingId } = await params;
  const supabase = await createClient();

  const { data: meeting } = await supabase
    .from("cell_meetings")
    .select("notes")
    .eq("id", meetingId)
    .single();

  const saveNotes = setNotes.bind(null, id, meetingId);

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <div className="mb-1 flex items-center gap-3">
        <Link href={`/dashboard/celulas/${id}/encontros/${meetingId}`}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-semibold">Observações</h1>
      </div>
      <p className="mb-4 ml-8 text-xs text-neutral-500">
        Registre algo importante que aconteceu no encontro, pedidos de oração, decisões,
        avisos e muito mais.
      </p>

      <form action={saveNotes} className="space-y-2">
        <textarea
          name="notes"
          maxLength={300}
          rows={8}
          defaultValue={meeting?.notes ?? ""}
          placeholder="Escreva aqui..."
          className="w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm"
        />
        <button
          type="submit"
          className="w-full rounded-xl bg-[#173B2C] py-3 text-sm font-medium text-white"
        >
          Salvar observação
        </button>
      </form>
    </main>
    </>
  );
}
