import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/top-bar";
import { setOffering } from "@/app/actions/meetings";

export default async function OfertaPage({
  params,
}: {
  params: Promise<{ id: string; meetingId: string }>;
}) {
  const { id, meetingId } = await params;
  const supabase = await createClient();

  const { data: meeting } = await supabase
    .from("cell_meetings")
    .select("offering_amount, offering_type")
    .eq("id", meetingId)
    .single();

  const saveOffering = setOffering.bind(null, id, meetingId);

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <div className="mb-1 flex items-center gap-3">
        <Link href={`/dashboard/celulas/${id}/encontros/${meetingId}`}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-semibold">Registrar oferta</h1>
      </div>
      <p className="mb-4 ml-8 text-xs text-neutral-500">
        Informe o valor total das ofertas recebidas no encontro.
      </p>

      <form action={saveOffering} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Valor total (R$)</label>
          <input
            type="number"
            step="0.01"
            name="offering_amount"
            defaultValue={meeting?.offering_amount ?? ""}
            placeholder="0,00"
            className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-lg"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">Tipo de oferta</label>
          <select
            name="offering_type"
            defaultValue={meeting?.offering_type ?? "voluntaria"}
            className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
          >
            <option value="voluntaria">Oferta voluntária</option>
            <option value="dizimo">Dízimo</option>
            <option value="oferta_especial">Oferta especial</option>
          </select>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-neutral-50 p-4">
          <BookOpen size={18} className="mt-0.5 text-neutral-500" />
          <div>
            <p className="text-sm font-medium">Gratidão</p>
            <p className="text-xs text-neutral-500">
              Deus ama quem dá com alegria. 2 Coríntios 9:7
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-[#173B2C] py-3 text-sm font-medium text-white"
        >
          Salvar oferta
        </button>
      </form>
    </main>
    </>
  );
}
