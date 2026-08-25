import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  lider_celula: "Líder de célula",
  membro: "Membro",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user!.id)
    .single();

  const { data: myCells } = await supabase
    .from("cell_members")
    .select("role, cells(id, name, meeting_weekday, meeting_time)")
    .eq("profile_id", user!.id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Olá, {profile?.full_name?.split(" ")[0]}</h1>
          <p className="text-sm text-neutral-500">
            {profile?.role ? ROLE_LABEL[profile.role] : "Membro"}
          </p>
        </div>
        <form action={logout}>
          <button type="submit" className="text-sm text-neutral-500 underline">
            Sair
          </button>
        </form>
      </div>

      <nav className="mb-8 flex gap-3">
        <Link
          href="/dashboard/celulas"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          Células
        </Link>
        {(profile?.role === "admin" || profile?.role === "lider_celula") && (
          <Link
            href="/dashboard/membros"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium"
          >
            Membros
          </Link>
        )}
      </nav>

      <section>
        <h2 className="mb-3 text-lg font-medium">Minhas células</h2>
        {myCells && myCells.length > 0 ? (
          <ul className="space-y-2">
            {myCells.map((cm) => (
              <li
                key={cm.cells?.id}
                className="rounded-md border border-neutral-200 px-4 py-3 text-sm"
              >
                <span className="font-medium">{cm.cells?.name}</span>
                <span className="ml-2 text-neutral-500">({cm.role})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500">Você ainda não está em nenhuma célula.</p>
        )}
      </section>
    </main>
  );
}
