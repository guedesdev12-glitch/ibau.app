"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createWeeklyStudy(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("weekly_studies").insert({
    study_date: String(formData.get("study_date")),
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? ""),
    file_url: String(formData.get("file_url") ?? "") || null,
    created_by: user?.id,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/estudos");
  revalidatePath("/dashboard");
}

export async function deleteWeeklyStudy(studyId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("weekly_studies").delete().eq("id", studyId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/estudos");
  revalidatePath("/dashboard");
}
