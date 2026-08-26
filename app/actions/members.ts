"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdminLevel } from "@/lib/admin-check";

export async function updateMemberRole(profileId: string, formData: FormData) {
  const supabase = await createClient();
  const roleId = String(formData.get("role_id") ?? "");

  const { data: role } = await supabase
    .from("roles")
    .select("admin_only")
    .eq("id", roleId)
    .single();

  if (role?.admin_only && !(await isAdminLevel())) {
    throw new Error("Só Administradores e Desenvolvedores podem atribuir essa categoria.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role_id: roleId, updated_at: new Date().toISOString() })
    .eq("id", profileId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/membros");
}
