"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCell(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const neighborhood = String(formData.get("neighborhood") ?? "") || null;
  const meetingWeekday = formData.get("meeting_weekday");
  const meetingTime = String(formData.get("meeting_time") ?? "") || null;

  const supabase = await createClient();
  const { error } = await supabase.from("cells").insert({
    name,
    neighborhood,
    meeting_weekday: meetingWeekday ? Number(meetingWeekday) : null,
    meeting_time: meetingTime,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/celulas");
}

export async function addMemberToCell(cellId: string, profileId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cell_members")
    .insert({ cell_id: cellId, profile_id: profileId });

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/celulas/${cellId}`);
}
