import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sessão expirada. Faça login novamente." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Não foi possível ler o envio." }, { status: 400 });
  }

  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: "Selecione uma foto." }, { status: 400 });
  }

  const MAX_SIZE = 8 * 1024 * 1024;
  if (photo.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Foto muito grande. Envie uma imagem de até 8MB." },
      { status: 400 },
    );
  }

  const path = `${user.id}/avatar.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, photo, { contentType: "image/jpeg", upsert: true });

  if (uploadError) {
    return NextResponse.json(
      { error: `Falha ao enviar a foto: ${uploadError.message}` },
      { status: 500 },
    );
  }

  const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
  const avatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json(
      { error: `Falha ao salvar no perfil: ${updateError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, avatarUrl });
}
