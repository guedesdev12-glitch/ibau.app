import Image from "next/image";
import { notFound } from "next/navigation";
import { Video, BookOpen, HandHeart, Play, Check, Trash2, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";
import { PageHeader } from "@/components/page-header";
import { embedUrl } from "@/lib/media";
import { markReflectionViewed, deleteReflection } from "@/app/actions/reflections";

const KIND_LABEL = {
  leitura: "Leitura guiada",
  oracao: "Oração guiada",
  reflexao: "Reflexão",
} as const;

export default async function ReflexaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: r } = await supabase.from("reflections").select("*").eq("id", id).single();
  if (!r) notFound();

  const [{ data: view }, { data: canManage }] = await Promise.all([
    supabase
      .from("reflection_views")
      .select("completed")
      .eq("reflection_id", id)
      .eq("profile_id", user?.id ?? "")
      .maybeSingle(),
    supabase.rpc("has_permission", { p_key: "reflexoes.manage" }),
  ]);

  const embed = embedUrl(r.video_url);
  const Icon = r.kind === "leitura" ? BookOpen : r.kind === "oracao" ? HandHeart : Video;

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl pb-40">
        {/* Player ou capa */}
        <div className="relative aspect-video w-full bg-neutral-900">
          {embed ? (
            <iframe
              src={embed}
              title={r.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : r.thumbnail_url ? (
            <Image src={r.thumbnail_url} alt={r.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1c6b3c] to-[#0a2c18] text-white/60">
              <Icon size={40} />
            </div>
          )}
        </div>

        <div className="px-4 pt-4">
          <PageHeader title="Reflexão" fallbackHref="/dashboard/reflexoes" />

          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#14532d]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#14532d]">
            <Icon size={12} /> {KIND_LABEL[r.kind]}
          </span>

          <h1 className="mt-3 text-2xl font-bold leading-tight">{r.title}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
            {r.speaker_name && (
              <span className="flex items-center gap-1.5">
                <User size={12} /> {r.speaker_name}
              </span>
            )}
            {(r.duration_min || r.duration_max) && (
              <span className="flex items-center gap-1.5">
                <Play size={11} fill="currentColor" />
                {r.duration_min && r.duration_max
                  ? `${r.duration_min}–${r.duration_max} min`
                  : `${r.duration_min ?? r.duration_max} min`}
              </span>
            )}
            <span>
              {new Date(r.published_at + "T00:00:00").toLocaleDateString("pt-BR")}
            </span>
          </div>

          {r.verse_reference && (
            <p className="mt-3 inline-block rounded-lg bg-neutral-100 px-3 py-1.5 text-sm font-semibold text-[#14532d]">
              {r.verse_reference}
            </p>
          )}

          {r.description && (
            <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-neutral-700">
              {r.description}
            </p>
          )}

          {!embed && r.video_url && (
            <a
              href={r.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ibau-pressable mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3.5 text-sm font-semibold text-white"
            >
              <Play size={15} fill="currentColor" /> Assistir vídeo
            </a>
          )}

          <form action={markReflectionViewed.bind(null, id)} className="mt-5">
            <button
              type="submit"
              disabled={!!view?.completed}
              className={`ibau-pressable flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold ${
                view?.completed
                  ? "bg-[#14532d]/10 text-[#14532d]"
                  : "bg-[#14532d] text-white"
              }`}
            >
              <Check size={16} />
              {view?.completed ? "Concluído" : "Marcar como concluído"}
            </button>
          </form>

          {canManage && (
            <form action={deleteReflection.bind(null, id)} className="mt-6 text-center">
              <button
                type="submit"
                className="ibau-pressable inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400"
              >
                <Trash2 size={13} /> Excluir reflexão
              </button>
            </form>
          )}
        </div>

        <BottomNav />
      </main>
    </>
  );
}
