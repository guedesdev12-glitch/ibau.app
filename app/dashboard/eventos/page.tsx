import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/bottom-nav";
import { EventCreateForm } from "@/components/event-create-form";
import { TopBar } from "@/components/top-bar";

const MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function formatEventDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { day: d, month: MONTHS[m - 1] };
}

export default async function EventosPage() {
  const supabase = await createClient();

  const [{ data: events }, { data: canManage }] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, event_date, start_time, location, description, poster_url")
      .order("event_date", { ascending: false }),
    supabase.rpc("has_permission", { p_key: "igreja.manage" }),
  ]);

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-40 pt-6">
        <h1 className="ibau-section-title mb-5 text-lg font-semibold">
          <span className="ibau-section-icon"><CalendarDays size={15} /></span>
          Eventos
        </h1>

      {canManage && <div className="mb-6"><EventCreateForm /></div>}

      <div className="grid grid-cols-2 gap-3">
        {events?.map((e) => {
          const { day, month } = formatEventDate(e.event_date);
          return (
            <div key={e.id} className="ibau-card overflow-hidden">
              <div className="relative aspect-[3/4] w-full bg-neutral-100">
                {e.poster_url ? (
                  <Image src={e.poster_url} alt={e.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-neutral-300">
                    <CalendarDays size={28} />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold leading-tight">{e.title}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {day} {month}
                  {e.start_time && ` · ${e.start_time.slice(0, 5)}`}
                </p>
                {e.location && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-400">
                    <MapPin size={11} /> {e.location}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {(!events || events.length === 0) && (
          <p className="col-span-2 rounded-xl border border-dashed border-neutral-200 px-4 py-8 text-center text-sm text-neutral-500">
            Nenhum evento cadastrado ainda.
          </p>
        )}
      </div>

      <BottomNav />
      </main>
    </>
  );
}
