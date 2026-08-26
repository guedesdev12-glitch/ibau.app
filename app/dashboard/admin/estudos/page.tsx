import { redirect } from "next/navigation";
import { BookOpen, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createWeeklyStudy, deleteWeeklyStudy } from "@/app/actions/studies";
import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";

export default async function EstudosAdminPage() {
  const supabase = await createClient();

  const { data: canManage } = await supabase.rpc("has_permission", {
    p_key: "estudos.manage",
  });
  if (!canManage) redirect("/dashboard");

  const { data: studies } = await supabase
    .from("weekly_studies")
    .select("id, study_date, title, content, file_url")
    .order("study_date", { ascending: false });

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-6">
        <h1 className="ibau-section-title mb-6 text-lg font-semibold">
          <span className="ibau-section-icon">
            <BookOpen size={15} />
          </span>
          Estudo semanal
        </h1>

        <form action={createWeeklyStudy} className="ibau-card mb-6 space-y-3 p-5">
          <p className="text-sm font-semibold">Publicar novo estudo</p>
          <input
            type="date"
            name="study_date"
            required
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
          />
          <input
            name="title"
            required
            placeholder="Título do estudo"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
          />
          <textarea
            name="content"
            required
            rows={6}
            placeholder="Conteúdo do estudo (texto, tópicos, perguntas...)"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
          />
          <input
            name="file_url"
            placeholder="Link do material (opcional — PDF, vídeo, etc.)"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white"
          >
            Publicar
          </button>
        </form>

        <div className="space-y-2">
          {studies?.map((s) => (
            <div key={s.id} className="ibau-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-neutral-400">
                    {new Date(s.study_date + "T00:00:00").toLocaleDateString("pt-BR")}
                  </p>
                  <p className="text-sm font-semibold">{s.title}</p>
                </div>
                <form action={deleteWeeklyStudy.bind(null, s.id)}>
                  <button type="submit" className="text-neutral-300 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-neutral-500">{s.content}</p>
            </div>
          ))}
          {(!studies || studies.length === 0) && (
            <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center text-sm text-neutral-500">
              Nenhum estudo publicado ainda.
            </p>
          )}
        </div>

        <BottomNav />
      </main>
    </>
  );
}
