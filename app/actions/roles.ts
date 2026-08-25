"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createRole(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = await createClient();
  const { error } = await supabase.from("roles").insert({ name });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/categorias");
}

export async function deleteRole(roleId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("roles").delete().eq("id", roleId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/categorias");
}

export async function togglePermission(
  roleId: string,
  permissionId: string,
  enabled: boolean,
) {
  const supabase = await createClient();

  if (enabled) {
    const { error } = await supabase
      .from("role_permissions")
      .insert({ role_id: roleId, permission_id: permissionId });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("role_permissions")
      .delete()
      .eq("role_id", roleId)
      .eq("permission_id", permissionId);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/dashboard/admin/categorias");
}
