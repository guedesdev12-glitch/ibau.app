"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
