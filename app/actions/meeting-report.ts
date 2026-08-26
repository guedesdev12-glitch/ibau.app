"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MeetingReportPayload = {
  meetingId: string;
  cellId: string;
  happened: boolean;
  startTime: string | null;
  endTime: string | null;
  hostId: string | null;
  studyId: string | null;
  theme: string | null;
  location: string | null;
  presentProfileIds: string[];
  visitorIds: string[];
  newVisitorNames: string[];
  rating: number | null;
  notes: string | null;
  hadOffering: boolean;
  offeringAmount: number | null;
};

export async function saveMeetingReport(payload: MeetingReportPayload) {
  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from("cell_meetings")
    .update({
      status: payload.happened ? "registrada" : "nao_houve",
      start_time: payload.startTime,
      end_time: payload.endTime,
      host_id: payload.hostId,
      study_id: payload.studyId,
      theme: payload.theme,
      location: payload.location,
      rating: payload.rating,
      notes: payload.notes,
      offering_amount: payload.hadOffering ? payload.offeringAmount : null,
      registered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.meetingId);

  if (updateError) throw new Error(updateError.message);

  if (!payload.happened) {
    revalidatePath(`/dashboard/celulas/${payload.cellId}`);
    return { ok: true };
  }

  // Presença da equipe
  await supabase.from("cell_meeting_team").delete().eq("meeting_id", payload.meetingId);
  if (payload.presentProfileIds.length > 0) {
    const { data: members } = await supabase
      .from("cell_members")
      .select("profile_id, role")
      .eq("cell_id", payload.cellId)
      .in("profile_id", payload.presentProfileIds);

    const rows =
      members?.map((m) => ({
        meeting_id: payload.meetingId,
        profile_id: m.profile_id,
        role:
          m.role === "lider"
            ? ("lider" as const)
            : m.role === "anfitriao"
              ? ("co_lider" as const)
              : ("auxiliar" as const),
      })) ?? [];

    if (rows.length > 0) {
      const { error } = await supabase.from("cell_meeting_team").insert(rows);
      if (error) throw new Error(error.message);
    }
  }

  // Visitantes novos criados durante o preenchimento
  const allVisitorIds = [...payload.visitorIds];
  for (const name of payload.newVisitorNames) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    const { data: visitor, error } = await supabase
      .from("visitors")
      .insert({ cell_id: payload.cellId, full_name: trimmed })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    allVisitorIds.push(visitor.id);
  }

  await supabase.from("cell_meeting_visitors").delete().eq("meeting_id", payload.meetingId);
  if (allVisitorIds.length > 0) {
    const rows = allVisitorIds.map((visitor_id) => ({
      meeting_id: payload.meetingId,
      visitor_id,
    }));
    const { error } = await supabase.from("cell_meeting_visitors").insert(rows);
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/dashboard/celulas/${payload.cellId}`);
  revalidatePath(`/dashboard/celulas/${payload.cellId}/encontros`);
  return { ok: true };
}
