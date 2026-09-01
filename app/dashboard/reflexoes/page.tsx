import { Video } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";
import { PageHeader } from "@/components/page-header";
import { ReflectionCard } from "@/components/reflection-card";
import { ReflectionCreateForm } from "@/components/reflection-create-form";

export default async function ReflexoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: items }, { data: canManage }, { data: views }] = await Promise.all([
    supabase
      .from("reflections")
      .select("id, kind, title, speaker_name, thumbnail_url, duration_min, duration_max, published_at")
      .eq("active", true)
      .order("published_at", { ascending: false }),
    supabase.rpc("has_permission", { p_key: "reflexoes.manage" }),
    supabase.from("reflection_views").select("reflection_id").eq("profile_id", user?.id ?? ""),
  ]);

  const viewed = new Set(views?.map((v) => v.reflection_id));

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-40 pt-6">
        <PageHeader
          title="Reflexões"
          subtitle="Palavras, leituras e orações guiadas."
          icon={<Video size={15} />}
        />

        {canManage && (
          <div className="mb-6">
            <ReflectionCreateForm />
          </div>
        )}

        <div className="space-y-2.5">
          {items?.map((r) => (
            <ReflectionCard
              key={r.id}
              item={{ ...r, viewed: viewed.has(r.id) }}
            />
          ))}

          {(!items || items.length === 0) && (
            <div className="rounded-2xl border border-dashed border-neutral-200 px-4 py-14 text-center">
              <Video size={26} className="mx-auto mb-2 text-neutral-300" />
              <p className="text-sm font-medium text-neutral-600">
                Nenhuma reflexão publicada ainda
              </p>
            </div>
          )}
        </div>

        <BottomNav />
      </main>
    </>
  );
}
