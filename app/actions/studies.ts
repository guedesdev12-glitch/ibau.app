"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteWeeklyStudy(studyId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("weekly_studies").delete().eq("id", studyId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/estudos");
  revalidatePath("/dashboard");
}
