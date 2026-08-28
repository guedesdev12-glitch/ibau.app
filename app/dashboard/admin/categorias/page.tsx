import { Fragment } from "react";
import { redirect } from "next/navigation";
import { Shield, Trash2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createRole, deleteRole, togglePermission } from "@/app/actions/roles";
import { PermissionCheckbox } from "@/components/permission-checkbox";
import { PageHeader } from "@/components/page-header";
import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";

export default async function CategoriasPage() {
  const supabase = await createClient();

  const { data: isDeveloper } = await supabase.rpc("is_developer");
  if (!isDeveloper) redirect("/dashboard");

  const [{ data: roles }, { data: permissions }, { data: rolePermissions }] =
    await Promise.all([
      supabase.from("roles").select("id, name, is_developer").order("created_at"),
      supabase.from("permissions").select("id, key, module, label").order("module"),
      supabase.from("role_permissions").select("role_id, permission_id"),
    ]);

  const enabledSet = new Set(
    rolePermissions?.map((rp) => `${rp.role_id}:${rp.permission_id}`),
  );

  const permissionsByModule = new Map<string, typeof permissions>();
  permissions?.forEach((p) => {
    if (!permissionsByModule.has(p.module)) permissionsByModule.set(p.module, []);
    permissionsByModule.get(p.module)!.push(p);
  });

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-40 pt-6">
      <PageHeader
        title="Categorias & Permissões"
        subtitle="Só Desenvolvedor edita. As permissões valem por categoria, nunca por pessoa."
        icon={<Shield size={15} />}
        fallbackHref="/dashboard/menu"
      />

      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="px-3 py-2 text-left font-medium">Permissão</th>
              {roles?.map((r) => (
                <th key={r.id} className="px-2 py-2 text-center font-medium">
                  <div className="flex flex-col items-center gap-1">
                    <span className={r.is_developer ? "text-neutral-400" : ""}>
                      {r.name}
                    </span>
                    {!r.is_developer && (
                      <form action={deleteRole.bind(null, r.id)}>
                        <button type="submit" className="text-neutral-300 hover:text-red-500">
                          <Trash2 size={12} />
                        </button>
                      </form>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...permissionsByModule.entries()].map(([module, perms]) => (
              <Fragment key={module}>
                <tr className="bg-neutral-50/60">
                  <td
                    colSpan={(roles?.length ?? 0) + 1}
                    className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-400"
                  >
                    {module}
                  </td>
                </tr>
                {perms!.map((p) => (
                  <tr key={p.id} className="border-b border-neutral-100">
                    <td className="px-3 py-2">{p.label}</td>
                    {roles?.map((r) => (
                      <td key={r.id} className="px-2 py-2 text-center">
                        <PermissionCheckbox
                          defaultChecked={r.is_developer || enabledSet.has(`${r.id}:${p.id}`)}
                          disabled={r.is_developer}
                          toggle={togglePermission.bind(null, r.id, p.id)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <details className="mt-5 rounded-xl border border-neutral-200 p-4">
        <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <Plus size={16} /> Nova categoria
        </summary>
        <form action={createRole} className="mt-3 flex gap-2">
          <input
            type="text"
            name="name"
            placeholder="Ex: Diácono"
            required
            className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-[#173B2C] px-4 py-2 text-sm font-medium text-white"
          >
            Criar
          </button>
        </form>
      </details>
      <BottomNav />
      </main>
    </>
  );
}
