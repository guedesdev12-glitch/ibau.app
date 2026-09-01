"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteReflection(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("reflections").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/reflexoes");
  revalidatePath("/dashboard");
}

export async function markReflectionViewed(reflectionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("reflection_views")
    .upsert(
      { reflection_id: reflectionId, profile_id: user.id, completed: true },
      { onConflict: "reflection_id,profile_id" },
    );

  revalidatePath("/dashboard/reflexoes");
  revalidatePath("/dashboard");
}

export async function toggleReflectionActive(id: string, active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("reflections").update({ active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/reflexoes");
  revalidatePath("/dashboard");
}
