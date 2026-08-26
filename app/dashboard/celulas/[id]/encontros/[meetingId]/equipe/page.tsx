import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/top-bar";
import { setMeetingTeam } from "@/app/actions/meetings";

const ROLE_LABEL: Record<string, string> = {
  lider: "Líder",
  anfitriao: "Anfitrião",
  membro: "Membro",
};

export default async function EquipePage({
  params,
}: {
  params: Promise<{ id: string; meetingId: string }>;
}) {
  const { id, meetingId } = await params;
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("cell_members")
    .select("role, profiles(id, full_name)")
    .eq("cell_id", id);

  const { data: present } = await supabase
    .from("cell_meeting_team")
    .select("profile_id")
    .eq("meeting_id", meetingId);

  const presentIds = new Set(present?.map((p) => p.profile_id));
  const saveTeam = setMeetingTeam.bind(null, id, meetingId);

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <div className="mb-1 flex items-center gap-3">
        <Link href={`/dashboard/celulas/${id}/encontros/${meetingId}`}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-semibold">Equipe do encontro</h1>
      </div>
      <p className="mb-4 ml-8 text-xs text-neutral-500">
        Selecione os membros da equipe que estiveram presentes no encontro.
      </p>

      <form action={saveTeam} className="space-y-2">
        {members?.map((m) => {
          const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
          if (!profile) return null;
          return (
            <label
              key={profile.id}
              className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium">
                  {profile.full_name.slice(0, 1)}
                </span>
                <span>
                  <p className="text-sm font-medium">{profile.full_name}</p>
                  <p className="text-xs text-neutral-500">{ROLE_LABEL[m.role]}</p>
                </span>
              </span>
              <input
                type="checkbox"
                name="profile_id"
                value={profile.id}
                defaultChecked={presentIds.has(profile.id)}
                className="h-5 w-5 accent-[#173B2C]"
              />
            </label>
          );
        })}

        {(!members || members.length === 0) && (
          <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center text-sm text-neutral-500">
            Nenhum membro nessa célula ainda. Adicione membros na tela de Membros.
          </p>
        )}

        <button
          type="submit"
          className="mt-4 w-full rounded-xl bg-[#173B2C] py-3 text-sm font-medium text-white"
        >
          Salvar equipe
        </button>
      </form>
    </main>
    </>
  );
}
