import { redirect } from "next/navigation";
import { BookOpen, Trash2, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteWeeklyStudy } from "@/app/actions/studies";
import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";
import { StudyCreateForm } from "@/components/study-create-form";

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

        <div className="mb-6">
          <StudyCreateForm />
        </div>

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
              {s.content && (
                <p className="mt-2 line-clamp-2 text-xs text-neutral-500">{s.content}</p>
              )}
              {s.file_url && (
                <a
                  href={s.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-neutral-700 underline"
                >
                  <FileText size={12} /> Ver PDF
                </a>
              )}
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
