import { createClient } from "@/lib/supabase/server";
import { updateMemberRole } from "@/app/actions/members";
import { BottomNav } from "@/components/bottom-nav";
import { PageHeader } from "@/components/page-header";
import { RoleSelect } from "@/components/role-select";
import { TopBar } from "@/components/top-bar";
import { Users } from "lucide-react";
import { isAdminLevel } from "@/lib/admin-check";

export default async function MembrosPage() {
  const supabase = await createClient();

  const [{ data: members }, { data: roles }, { data: canManage }, adminLevel] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, phone, role_id, roles(name)")
      .order("full_name"),
    supabase.from("roles").select("id, name, admin_only").order("name"),
    supabase.rpc("has_permission", { p_key: "membros.manage" }),
    isAdminLevel(),
  ]);

  const assignableRoles = roles?.filter((r) => adminLevel || !r.admin_only) ?? [];

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-40 pt-6">
        <PageHeader title="Membros" subtitle="Diretório e categorias." icon={<Users size={15} />} fallbackHref="/dashboard/menu" />

      <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200">
        {members?.map((member) => {
          const roleName = Array.isArray(member.roles)
            ? member.roles[0]?.name
            : (member.roles as { name: string } | null)?.name;
          const updateRole = canManage ? updateMemberRole.bind(null, member.id) : null;

          return (
            <li key={member.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{member.full_name}</p>
                <p className="text-neutral-500">{member.phone ?? "Sem telefone cadastrado"}</p>
              </div>
              {updateRole && roles ? (
                <RoleSelect action={updateRole} roleId={member.role_id} roles={assignableRoles} />
              ) : (
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
                  {roleName}
                </span>
              )}
            </li>
          );
        })}
        {members?.length === 0 && (
          <li className="px-4 py-3 text-sm text-neutral-500">Nenhum membro cadastrado.</li>
        )}
      </ul>

        <BottomNav />
      </main>
    </>
  );
}
