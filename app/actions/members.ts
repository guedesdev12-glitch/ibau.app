"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateMemberRole(profileId: string, formData: FormData) {
  const supabase = await createClient();
  const roleId = String(formData.get("role_id") ?? "");

  const { error } = await supabase
    .from("profiles")
    .update({ role_id: roleId, updated_at: new Date().toISOString() })
    .eq("id", profileId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/membros");
}
