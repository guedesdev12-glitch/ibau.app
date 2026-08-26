"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function currentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão expirada.");
  return { supabase, userId: user.id };
}

/* ---------------- Anotações ---------------- */

export async function createNote(formData: FormData) {
  const { supabase, userId } = await currentUserId();
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;

  const { error } = await supabase.from("notes").insert({
    profile_id: userId,
    title: String(formData.get("title") ?? "").trim() || null,
    verse_reference: String(formData.get("verse_reference") ?? "").trim() || null,
    content,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/anotacoes");
}

export async function deleteNote(noteId: string) {
  const { supabase } = await currentUserId();
  const { error } = await supabase.from("notes").delete().eq("id", noteId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/anotacoes");
}

/* ---------------- Plano de oração ---------------- */

export async function createPrayerItem(formData: FormData) {
  const { supabase, userId } = await currentUserId();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const { error } = await supabase.from("prayer_items").insert({
    profile_id: userId,
    title,
    description: String(formData.get("description") ?? "").trim() || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/plano-oracao");
}

export async function markPrayed(itemId: string, currentCount: number) {
  const { supabase } = await currentUserId();
  const { error } = await supabase
    .from("prayer_items")
    .update({ prayed_count: currentCount + 1, last_prayed_at: new Date().toISOString() })
    .eq("id", itemId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/plano-oracao");
}

export async function toggleAnswered(itemId: string, answered: boolean) {
  const { supabase } = await currentUserId();
  const { error } = await supabase
    .from("prayer_items")
    .update({ answered, answered_at: answered ? new Date().toISOString() : null })
    .eq("id", itemId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/plano-oracao");
}

export async function deletePrayerItem(itemId: string) {
  const { supabase } = await currentUserId();
  const { error } = await supabase.from("prayer_items").delete().eq("id", itemId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/plano-oracao");
}

/* ---------------- Mural de orações ---------------- */

export async function createPrayerRequest(formData: FormData) {
  const { supabase, userId } = await currentUserId();
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;

  const { error } = await supabase.from("prayer_requests").insert({
    profile_id: userId,
    content,
    is_anonymous: formData.get("is_anonymous") === "on",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/mural-oracoes");
}

export async function togglePraying(requestId: string, praying: boolean) {
  const { supabase, userId } = await currentUserId();

  if (praying) {
    await supabase
      .from("prayer_request_prayers")
      .insert({ request_id: requestId, profile_id: userId });
  } else {
    await supabase
      .from("prayer_request_prayers")
      .delete()
      .eq("request_id", requestId)
      .eq("profile_id", userId);
  }
  revalidatePath("/dashboard/mural-oracoes");
}

export async function markRequestAnswered(requestId: string) {
  const { supabase } = await currentUserId();
  const { error } = await supabase
    .from("prayer_requests")
    .update({ answered: true })
    .eq("id", requestId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/mural-oracoes");
}

export async function deletePrayerRequest(requestId: string) {
  const { supabase } = await currentUserId();
  const { error } = await supabase.from("prayer_requests").delete().eq("id", requestId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/mural-oracoes");
}

/* ---------------- Devocional ---------------- */

export async function createDevotional(formData: FormData) {
  const { supabase, userId } = await currentUserId();
  const { error } = await supabase.from("devotionals").upsert(
    {
      devotional_date: String(formData.get("devotional_date")),
      title: String(formData.get("title") ?? "").trim(),
      verse_reference: String(formData.get("verse_reference") ?? "").trim() || null,
      verse_text: String(formData.get("verse_text") ?? "").trim() || null,
      content: String(formData.get("content") ?? "").trim(),
      created_by: userId,
    },
    { onConflict: "devotional_date" },
  );
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/devocional");
}

export async function deleteDevotional(id: string) {
  const { supabase } = await currentUserId();
  const { error } = await supabase.from("devotionals").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/devocional");
}
