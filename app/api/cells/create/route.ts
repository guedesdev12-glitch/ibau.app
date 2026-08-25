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
    p_key: "celulas.manage",
  });

  if (!canManage) {
    return NextResponse.json(
      { error: "Sem permissão para cadastrar células." },
      { status: 403 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Não foi possível ler o envio." }, { status: 400 });
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Informe o nome da célula." }, { status: 400 });
  }

  const address = String(formData.get("address") ?? "") || null;
  const neighborhood = String(formData.get("neighborhood") ?? "") || null;
  const generation = String(formData.get("generation") ?? "") || null;
  const leaderId = String(formData.get("leader_id") ?? "") || null;
  const coLeaderId = String(formData.get("co_leader_id") ?? "") || null;
  const meetingWeekday = formData.get("meeting_weekday");
  const meetingTime = String(formData.get("meeting_time") ?? "") || null;
  const workerIds = formData.getAll("worker_id").map(String).filter(Boolean);
  const photo = formData.get("photo");

  let photoUrl: string | null = null;

  if (photo instanceof File && photo.size > 0) {
    const MAX_SIZE = 8 * 1024 * 1024;
    if (photo.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Foto muito grande. Envie uma imagem de até 8MB." },
        { status: 400 },
      );
    }
    const ext = photo.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("cells")
      .upload(path, photo, { contentType: photo.type || "image/jpeg" });

    if (uploadError) {
      return NextResponse.json(
        { error: `Falha ao enviar a foto: ${uploadError.message}` },
        { status: 500 },
      );
    }

    const { data: publicUrlData } = supabase.storage.from("cells").getPublicUrl(path);
    photoUrl = publicUrlData.publicUrl;
  }

  const { data: cell, error: insertError } = await supabase
    .from("cells")
    .insert({
      name,
      address,
      neighborhood,
      generation,
      leader_id: leaderId,
      co_leader_id: coLeaderId,
      meeting_weekday: meetingWeekday ? Number(meetingWeekday) : null,
      meeting_time: meetingTime,
      photo_url: photoUrl,
    })
    .select("id")
    .single();

  if (insertError || !cell) {
    return NextResponse.json(
      { error: `Falha ao criar a célula: ${insertError?.message}` },
      { status: 500 },
    );
  }

  const memberRows: { cell_id: string; profile_id: string; role: "lider" | "anfitriao" | "membro" }[] = [];
  if (leaderId) memberRows.push({ cell_id: cell.id, profile_id: leaderId, role: "lider" });
  if (coLeaderId) memberRows.push({ cell_id: cell.id, profile_id: coLeaderId, role: "anfitriao" });
  for (const workerId of workerIds) {
    if (workerId !== leaderId && workerId !== coLeaderId) {
      memberRows.push({ cell_id: cell.id, profile_id: workerId, role: "membro" });
    }
  }

  if (memberRows.length > 0) {
    const { error: membersError } = await supabase.from("cell_members").insert(memberRows);
    if (membersError) {
      return NextResponse.json(
        {
          error: `Célula criada, mas houve falha ao vincular a equipe: ${membersError.message}`,
          cellId: cell.id,
        },
        { status: 207 },
      );
    }
  }

  return NextResponse.json({ ok: true, cellId: cell.id });
}
