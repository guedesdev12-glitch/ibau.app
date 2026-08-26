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
    return NextResponse.json({ error: "Sem permissão para criar eventos." }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Não foi possível ler o envio." }, { status: 400 });
  }

  const title = String(formData.get("title") ?? "").trim();
  const eventDate = String(formData.get("event_date") ?? "");
  if (!title || !eventDate) {
    return NextResponse.json({ error: "Informe título e data do evento." }, { status: 400 });
  }

  const startTime = String(formData.get("start_time") ?? "") || null;
  const endTime = String(formData.get("end_time") ?? "") || null;
  const location = String(formData.get("location") ?? "") || null;
  const subtitle = String(formData.get("subtitle") ?? "") || null;
  const description = String(formData.get("description") ?? "") || null;
  const isFree = formData.get("is_free") !== "pago";
  const rawPrice = String(formData.get("price") ?? "").replace(",", ".");
  const price = isFree ? null : Number(rawPrice) || 0;
  const rawCapacity = String(formData.get("capacity") ?? "");
  const capacity = rawCapacity ? Number(rawCapacity) : null;
  const registrationDeadline = String(formData.get("registration_deadline") ?? "") || null;
  const poster = formData.get("poster");

  let posterUrl: string | null = null;

  if (poster instanceof File && poster.size > 0) {
    const MAX_SIZE = 8 * 1024 * 1024;
    if (poster.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Pôster muito grande. Envie uma imagem de até 8MB." },
        { status: 400 },
      );
    }
    const ext = poster.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("events")
      .upload(path, poster, { contentType: poster.type || "image/jpeg" });

    if (uploadError) {
      return NextResponse.json(
        { error: `Falha ao enviar o pôster: ${uploadError.message}` },
        { status: 500 },
      );
    }

    const { data: publicUrlData } = supabase.storage.from("events").getPublicUrl(path);
    posterUrl = publicUrlData.publicUrl;
  }

  const { error: insertError } = await supabase.from("events").insert({
    title,
    subtitle,
    event_date: eventDate,
    start_time: startTime,
    end_time: endTime,
    location,
    description,
    poster_url: posterUrl,
    is_free: isFree,
    price,
    capacity,
    registration_deadline: registrationDeadline,
    created_by: user.id,
  });

  if (insertError) {
    return NextResponse.json(
      { error: `Falha ao salvar o evento: ${insertError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
