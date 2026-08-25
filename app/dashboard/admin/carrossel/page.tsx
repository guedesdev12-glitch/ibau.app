import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowLeft, ImagePlus, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { uploadBanner, deleteBanner, toggleBannerActive, moveBanner } from "@/app/actions/banners";
import { BannerControls } from "@/components/banner-controls";

export default async function CarrosselAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
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

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      {success && (
        <p className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          Foto publicada no carrossel!
        </p>
      )}

      <form action={uploadBanner} className="ibau-card mb-6 p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <ImagePlus size={16} className="text-[#14532d]" /> Adicionar foto ou aviso
        </p>

        <label
          htmlFor="banner-image"
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center transition hover:border-[#14532d] hover:bg-[#14532d]/5"
        >
          <Upload size={24} className="text-neutral-400" />
          <span className="text-sm font-medium text-neutral-600">
            Toque para escolher uma foto
          </span>
          <span className="text-xs text-neutral-400">JPG ou PNG</span>
          <input
            id="banner-image"
            type="file"
            name="image"
            accept="image/*"
            required
            className="sr-only"
          />
        </label>

        <input
          type="text"
          name="title"
          placeholder="Legenda / aviso (opcional)"
          className="mt-3 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
        />
        <button
          type="submit"
          className="mt-3 w-full rounded-lg bg-[#14532d] py-2.5 text-sm font-medium text-white"
        >
          Publicar no carrossel
        </button>
      </form>

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
