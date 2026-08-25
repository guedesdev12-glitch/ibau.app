import { createClient } from "@/lib/supabase/server";
import { createCell } from "@/app/actions/cells";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default async function CelulasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const { data: cells } = await supabase
    .from("cells")
    .select("id, name, neighborhood, meeting_weekday, meeting_time, active")
    .order("name");

  const isAdmin = profile?.role === "admin";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Células</h1>

      <ul className="mb-8 space-y-2">
        {cells?.map((cell) => (
          <li key={cell.id}>
            <a
              href={`/dashboard/celulas/${cell.id}`}
              className="block rounded-md border border-neutral-200 px-4 py-3 text-sm"
            >
              <p className="font-medium">{cell.name}</p>
              <p className="text-neutral-500">
                {cell.neighborhood ?? "Bairro não informado"}
                {cell.meeting_weekday !== null &&
                  ` · ${WEEKDAYS[cell.meeting_weekday]}${cell.meeting_time ? ` às ${cell.meeting_time}` : ""}`}
              </p>
            </a>
          </li>
        ))}
        {cells?.length === 0 && (
          <p className="text-sm text-neutral-500">Nenhuma célula cadastrada ainda.</p>
        )}
      </ul>

      {isAdmin && (
        <section className="rounded-md border border-neutral-200 p-4">
          <h2 className="mb-3 text-sm font-medium">Nova célula</h2>
          <form action={createCell} className="space-y-3">
            <input
              name="name"
              placeholder="Nome da célula"
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <input
              name="neighborhood"
              placeholder="Bairro"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <div className="flex gap-3">
              <select
                name="meeting_weekday"
                className="w-1/2 rounded-md border border-neutral-300 px-3 py-2 text-sm"
              >
                <option value="">Dia da semana</option>
                {WEEKDAYS.map((day, idx) => (
                  <option key={day} value={idx}>
                    {day}
                  </option>
                ))}
              </select>
              <input
                type="time"
                name="meeting_time"
                className="w-1/2 rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
            >
              Criar célula
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
