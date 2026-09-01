import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { autoThumbnail } from "@/lib/media";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });
  }

  const { data: canManage } = await supabase.rpc("has_permission", {
    p_key: "reflexoes.manage",
  });
  if (!canManage) {
    return NextResponse.json(
      { error: "Sem permissão para publicar reflexões." },
      { status: 403 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Não foi possível ler o envio." }, { status: 400 });
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "Informe o título." }, { status: 400 });
  }

  const videoUrl = String(formData.get("video_url") ?? "").trim() || null;
  const thumb = formData.get("thumbnail");
  let thumbnailUrl: string | null = null;

  if (thumb instanceof File && thumb.size > 0) {
    if (thumb.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Capa muito grande (máx. 8MB)." }, { status: 400 });
    }
    const path = `${crypto.randomUUID()}.jpg`;
    const { error: upErr } = await supabase.storage
      .from("reflections")
      .upload(path, thumb, { contentType: thumb.type || "image/jpeg" });
    if (upErr) {
      return NextResponse.json({ error: `Falha ao enviar a capa: ${upErr.message}` }, { status: 500 });
    }
    thumbnailUrl = supabase.storage.from("reflections").getPublicUrl(path).data.publicUrl;
  }

  if (!thumbnailUrl) thumbnailUrl = autoThumbnail(videoUrl);

  const durMin = String(formData.get("duration_min") ?? "");
  const durMax = String(formData.get("duration_max") ?? "");

  const { error } = await supabase.from("reflections").insert({
    kind: (String(formData.get("kind") ?? "reflexao") as "leitura" | "oracao" | "reflexao"),
    title,
    description: String(formData.get("description") ?? "").trim() || null,
    speaker_name: String(formData.get("speaker_name") ?? "").trim() || null,
    verse_reference: String(formData.get("verse_reference") ?? "").trim() || null,
    video_url: videoUrl,
    thumbnail_url: thumbnailUrl,
    duration_min: durMin ? Number(durMin) : null,
    duration_max: durMax ? Number(durMax) : null,
    published_at: String(formData.get("published_at") ?? "") || new Date().toISOString().slice(0, 10),
    created_by: user.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
