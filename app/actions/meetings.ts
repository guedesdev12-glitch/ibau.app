"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createMeeting(cellId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("cell_meetings")
    .insert({
      cell_id: cellId,
      meeting_date: String(formData.get("meeting_date")),
      start_time: String(formData.get("start_time") ?? "") || null,
      end_time: String(formData.get("end_time") ?? "") || null,
      location: String(formData.get("location") ?? "") || null,
      theme: String(formData.get("theme") ?? "") || null,
      duration_minutes: formData.get("duration_minutes")
        ? Number(formData.get("duration_minutes"))
        : null,
      created_by: user?.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  redirect(`/dashboard/celulas/${cellId}/encontros/${data.id}`);
}

export async function updateMeetingBasics(
  cellId: string,
  meetingId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cell_meetings")
    .update({
      meeting_date: String(formData.get("meeting_date")),
      start_time: String(formData.get("start_time") ?? "") || null,
      end_time: String(formData.get("end_time") ?? "") || null,
      location: String(formData.get("location") ?? "") || null,
      theme: String(formData.get("theme") ?? "") || null,
      duration_minutes: formData.get("duration_minutes")
        ? Number(formData.get("duration_minutes"))
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", meetingId);

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/celulas/${cellId}/encontros/${meetingId}`);
}

export async function setMeetingTeam(
  cellId: string,
  meetingId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const selected = formData.getAll("profile_id").map(String);

  await supabase.from("cell_meeting_team").delete().eq("meeting_id", meetingId);

  if (selected.length > 0) {
    const { data: members } = await supabase
      .from("cell_members")
      .select("profile_id, role")
      .eq("cell_id", cellId)
      .in("profile_id", selected);

    const rows =
      members?.map((m) => ({
        meeting_id: meetingId,
        profile_id: m.profile_id,
        role:
          m.role === "lider" ? "lider" : m.role === "anfitriao" ? "co_lider" : "auxiliar",
      })) ?? [];

    if (rows.length > 0) {
      const { error } = await supabase.from("cell_meeting_team").insert(rows);
      if (error) throw new Error(error.message);
    }
  }

  revalidatePath(`/dashboard/celulas/${cellId}/encontros/${meetingId}`);
  redirect(`/dashboard/celulas/${cellId}/encontros/${meetingId}`);
}

export async function addVisitor(cellId: string, meetingId: string, formData: FormData) {
  const supabase = await createClient();
  const fullName = String(formData.get("full_name") ?? "");
  const phone = String(formData.get("phone") ?? "") || null;

  const { data: visitor, error } = await supabase
    .from("visitors")
    .insert({ cell_id: cellId, full_name: fullName, phone })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await supabase
    .from("cell_meeting_visitors")
    .insert({ meeting_id: meetingId, visitor_id: visitor.id });

  revalidatePath(`/dashboard/celulas/${cellId}/encontros/${meetingId}/visitantes`);
}

export async function setMeetingVisitors(
  cellId: string,
  meetingId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const selected = formData.getAll("visitor_id").map(String);

  await supabase.from("cell_meeting_visitors").delete().eq("meeting_id", meetingId);

  if (selected.length > 0) {
    const rows = selected.map((visitor_id) => ({ meeting_id: meetingId, visitor_id }));
    const { error } = await supabase.from("cell_meeting_visitors").insert(rows);
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/dashboard/celulas/${cellId}/encontros/${meetingId}`);
  redirect(`/dashboard/celulas/${cellId}/encontros/${meetingId}`);
}

export async function setOffering(cellId: string, meetingId: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cell_meetings")
    .update({
      offering_amount: Number(formData.get("offering_amount") ?? 0),
      offering_type: String(formData.get("offering_type") ?? "voluntaria"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", meetingId);

  if (error) throw new Error(error.message);
  redirect(`/dashboard/celulas/${cellId}/encontros/${meetingId}`);
}

export async function setNotes(cellId: string, meetingId: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cell_meetings")
    .update({
      notes: String(formData.get("notes") ?? "") || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", meetingId);

  if (error) throw new Error(error.message);
  redirect(`/dashboard/celulas/${cellId}/encontros/${meetingId}`);
}
