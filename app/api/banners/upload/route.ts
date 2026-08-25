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

  const { data: canManage } = await supabase.rpc("has_permission", {
    p_key: "igreja.manage",
  });

  if (!canManage) {
    return NextResponse.json({ error: "Sem permissão para gerenciar o carrossel." }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Não foi possível ler o envio." }, { status: 400 });
  }

  const file = formData.get("image");
  const title = String(formData.get("title") ?? "") || null;

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Selecione uma imagem." }, { status: 400 });
  }

  const MAX_SIZE = 8 * 1024 * 1024; // 8MB
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Imagem muito grande. Envie uma foto de até 8MB." },
      { status: 400 },
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("banners")
    .upload(path, file, { contentType: file.type || "image/jpeg" });

  if (uploadError) {
    return NextResponse.json(
      { error: `Falha ao enviar a imagem: ${uploadError.message}` },
      { status: 500 },
    );
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
    return NextResponse.json(
      { error: `Falha ao salvar no banco: ${insertError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
