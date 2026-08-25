import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ChevronRight, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CellCreateForm } from "@/components/cell-create-form";
import { BottomNav } from "@/components/bottom-nav";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default async function CelulasPage() {
  const supabase = await createClient();

  const [{ data: cells }, { data: canManage }, { data: members }] = await Promise.all([
    supabase
      .from("cells")
      .select(
        "id, name, neighborhood, meeting_weekday, meeting_time, photo_url, generation, profiles!cells_leader_id_fkey(full_name)",
      )
      .order("name"),
    supabase.rpc("has_permission", { p_key: "celulas.manage" }),
    supabase.from("profiles").select("id, full_name").order("full_name"),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-28 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-semibold">Células</h1>
      </div>

      <div className="mb-6 space-y-3">
        {cells?.map((cell) => {
          const leader = Array.isArray(cell.profiles) ? cell.profiles[0] : cell.profiles;
          return (
            <Link
              key={cell.id}
              href={`/dashboard/celulas/${cell.id}`}
              className="ibau-card flex items-center gap-3 p-3"
            >
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                {cell.photo_url ? (
                  <Image src={cell.photo_url} alt={cell.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-300">
                    <MapPin size={20} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {cell.name}
                  {leader?.full_name && (
                    <span className="font-normal text-neutral-400"> · {leader.full_name}</span>
                  )}
                </p>
                <p className="text-xs text-neutral-500">
                  {cell.neighborhood ?? "Bairro não informado"}
                  {cell.meeting_weekday !== null &&
                    ` · ${WEEKDAYS[cell.meeting_weekday]}${cell.meeting_time ? ` às ${cell.meeting_time.slice(0, 5)}` : ""}`}
                </p>
              </div>
              <ChevronRight size={16} className="text-neutral-400" />
            </Link>
          );
        })}
        {cells?.length === 0 && (
          <p className="text-sm text-neutral-500">Nenhuma célula cadastrada ainda.</p>
        )}
      </div>

      {canManage && <CellCreateForm members={members ?? []} />}

      <BottomNav />
    </main>
  );
}
