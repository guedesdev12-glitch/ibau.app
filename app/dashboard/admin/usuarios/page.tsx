import { redirect } from "next/navigation";
import { Users as UsersIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isAdminLevel } from "@/lib/admin-check";
import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";
import { UserCreateForm } from "@/components/user-create-form";
import { UserRowActions } from "@/components/user-row-actions";

export default async function UsuariosPage() {
  const adminLevel = await isAdminLevel();
  if (!adminLevel) redirect("/dashboard");

  const supabase = await createClient();

  const [{ data: users }, { data: roles }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, active, roles(name)")
      .order("full_name"),
    supabase.from("roles").select("id, name").order("name"),
  ]);

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-6">
        <h1 className="ibau-section-title mb-6 text-lg font-semibold">
          <span className="ibau-section-icon">
            <UsersIcon size={15} />
          </span>
          Painel de usuários
        </h1>

        <div className="mb-6">
          <UserCreateForm roles={roles ?? []} />
        </div>

        <div className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {users?.map((u) => {
            const roleName = Array.isArray(u.roles) ? u.roles[0]?.name : (u.roles as { name: string } | null)?.name;
            return (
              <div key={u.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{u.full_name}</p>
                  <p className="text-xs text-neutral-500">{u.email}</p>
                  <span className="mt-1 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600">
                    {roleName}
                  </span>
                </div>
                <UserRowActions userId={u.id} active={u.active} />
              </div>
            );
          })}
          {(!users || users.length === 0) && (
            <p className="px-4 py-6 text-center text-sm text-neutral-500">
              Nenhum usuário cadastrado ainda.
            </p>
          )}
        </div>

        <BottomNav />
      </main>
    </>
  );
}
