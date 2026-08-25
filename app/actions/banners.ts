"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function uploadBanner(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("image");
  const title = String(formData.get("title") ?? "") || null;

  if (!(file instanceof File) || file.size === 0) {
    redirect(
      `/dashboard/admin/carrossel?error=${encodeURIComponent("Selecione uma imagem antes de publicar.")}`,
    );
  }

  let errorMessage: string | null = null;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Sessão expirada. Faça login novamente.");

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("banners")
      .upload(path, file, { contentType: file.type || "image/jpeg" });

    if (uploadError) {
      throw new Error(`Falha ao enviar a imagem: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage.from("banners").getPublicUrl(path);

    const { count } = await supabase
      .from("home_banners")
      .select("*", { count: "exact", head: true });

    const { error: insertError } = await supabase.from("home_banners").insert({
      image_url: publicUrlData.publicUrl,
      title,
      position: count ?? 0,
      created_by: user.id,
    });

    if (insertError) {
      throw new Error(`Falha ao salvar no banco: ${insertError.message}`);
    }
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : "Erro desconhecido ao enviar a imagem.";
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/carrossel");

  if (errorMessage) {
    redirect(`/dashboard/admin/carrossel?error=${encodeURIComponent(errorMessage)}`);
  }
  redirect("/dashboard/admin/carrossel?success=1");
}

export async function deleteBanner(bannerId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("home_banners").delete().eq("id", bannerId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/carrossel");
}

export async function toggleBannerActive(bannerId: string, active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("home_banners")
    .update({ active })
    .eq("id", bannerId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/carrossel");
}

export async function moveBanner(bannerId: string, direction: "up" | "down") {
  const supabase = await createClient();
  const { data: banners } = await supabase
    .from("home_banners")
    .select("id, position")
    .order("position");

  if (!banners) return;
  const idx = banners.findIndex((b) => b.id === bannerId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= banners.length) return;

  const a = banners[idx];
  const b = banners[swapIdx];

  await Promise.all([
    supabase.from("home_banners").update({ position: b.position }).eq("id", a.id),
    supabase.from("home_banners").update({ position: a.position }).eq("id", b.id),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/carrossel");
}
