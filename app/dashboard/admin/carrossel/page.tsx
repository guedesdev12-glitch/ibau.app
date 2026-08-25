import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { uploadBanner, deleteBanner, toggleBannerActive, moveBanner } from "@/app/actions/banners";
import { BannerControls } from "@/components/banner-controls";

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
        <h1 className="text-lg font-semibold">Carrossel da tela inicial</h1>
      </div>

      <div className="mb-6 space-y-3">
        {banners?.map((b, i) => (
          <div
            key={b.id}
            className="flex items-center gap-3 rounded-xl border border-neutral-200 p-2"
          >
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

      <form action={uploadBanner} className="space-y-3 rounded-xl border border-neutral-200 p-4">
        <p className="flex items-center gap-2 text-sm font-medium">
          <ImagePlus size={16} /> Adicionar ao carrossel
        </p>
        <input
          type="file"
          name="image"
          accept="image/*"
          required
          className="w-full text-sm"
        />
        <input
          type="text"
          name="title"
          placeholder="Legenda / aviso (opcional)"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-[#173B2C] py-2.5 text-sm font-medium text-white"
        >
          Enviar
        </button>
      </form>
    </main>
  );
}
