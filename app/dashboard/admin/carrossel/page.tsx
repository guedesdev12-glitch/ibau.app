import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteBanner, toggleBannerActive, moveBanner } from "@/app/actions/banners";
import { BannerControls } from "@/components/banner-controls";
import { BannerUploadForm } from "@/components/banner-upload-form";

export default async function CarrosselAdminPage() {
  const supabase = await createClient();

  const { data: canManage } = await supabase.rpc("has_permission", {
    p_key: "igreja.manage",
  });
  if (!canManage) redirect("/dashboard");

  const { data: banners } = await supabase
    .from("home_banners")
    .select("id, image_url, title, active, position")
    .order("position");

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-lg font-semibold">Carrossel da tela inicial</h1>
          <p className="text-xs text-neutral-500">Fotos e avisos que aparecem para todo mundo</p>
        </div>
      </div>

      <BannerUploadForm />

      <div className="space-y-3">
        {banners?.map((b, i) => (
          <div key={b.id} className="ibau-card flex items-center gap-3 p-3">
            <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
              <Image src={b.image_url} alt={b.title ?? ""} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{b.title ?? "Sem legenda"}</p>
              <BannerControls
                bannerId={b.id}
                active={b.active}
                isFirst={i === 0}
                isLast={i === (banners?.length ?? 0) - 1}
                onMove={moveBanner}
                onToggle={toggleBannerActive}
                onDelete={deleteBanner}
              />
            </div>
          </div>
        ))}
        {(!banners || banners.length === 0) && (
          <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-8 text-center text-sm text-neutral-500">
            Nenhuma foto/aviso no carrossel ainda.
          </p>
        )}
      </div>
    </main>
  );
}
