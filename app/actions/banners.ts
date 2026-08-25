"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function uploadBanner(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("image") as File;
  const title = String(formData.get("title") ?? "") || null;

  if (!file || file.size === 0) throw new Error("Selecione uma imagem.");

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("banners")
    .upload(path, file, { contentType: file.type });

  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("banners").getPublicUrl(path);

  const { count } = await supabase
    .from("home_banners")
    .select("*", { count: "exact", head: true });

  const { error } = await supabase
    .from("home_banners")
    .insert({ image_url: publicUrl, title, position: count ?? 0 });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/carrossel");
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
