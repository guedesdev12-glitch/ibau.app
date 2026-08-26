import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MeetingReportWizard } from "@/components/meeting-report-wizard";

export default async function EncontroPage({
  params,
}: {
  params: Promise<{ id: string; meetingId: string }>;
}) {
  const { id, meetingId } = await params;
  const supabase = await createClient();

  const { data: meeting } = await supabase
    .from("cell_meetings")
    .select("*")
    .eq("id", meetingId)
    .single();

  if (!meeting) notFound();

  const [
    { data: memberRows },
    { data: visitors },
    { data: studies },
    { data: presentRows },
    { data: presentVisitorRows },
  ] = await Promise.all([
    supabase
      .from("cell_members")
      .select("role, profiles(id, full_name, avatar_url)")
      .eq("cell_id", id),
    supabase.from("visitors").select("id, full_name").eq("cell_id", id).order("full_name"),
    supabase
      .from("weekly_studies")
      .select("id, title, study_date")
      .order("study_date", { ascending: false })
      .limit(20),
    supabase.from("cell_meeting_team").select("profile_id").eq("meeting_id", meetingId),
    supabase.from("cell_meeting_visitors").select("visitor_id").eq("meeting_id", meetingId),
  ]);

  const members =
    memberRows
      ?.map((r) => {
        const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
        if (!p) return null;
        return {
          id: p.id,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          role: r.role as string,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        const order: Record<string, number> = { lider: 0, anfitriao: 1, membro: 2 };
        const diff = (order[a!.role] ?? 3) - (order[b!.role] ?? 3);
        return diff !== 0 ? diff : a!.full_name.localeCompare(b!.full_name);
      }) as { id: string; full_name: string; avatar_url: string | null; role: string }[];

  return (
    <MeetingReportWizard
      cellId={id}
      meetingId={meetingId}
      meetingDate={meeting.meeting_date}
      members={members ?? []}
      existingVisitors={visitors ?? []}
      studies={studies ?? []}
      initial={{
        startTime: meeting.start_time,
        endTime: meeting.end_time,
        hostId: meeting.host_id,
        studyId: meeting.study_id,
        theme: meeting.theme,
        location: meeting.location,
        presentIds: presentRows?.map((r) => r.profile_id) ?? [],
        visitorIds: presentVisitorRows?.map((r) => r.visitor_id) ?? [],
        rating: meeting.rating,
        notes: meeting.notes,
        offeringAmount: meeting.offering_amount,
        status: meeting.status,
      }}
    />
  );
}
