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
    p_key: "estudos.manage",
  });
  if (!canManage) {
    return NextResponse.json(
      { error: "Sem permissão para publicar o estudo semanal." },
      { status: 403 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Não foi possível ler o envio." }, { status: 400 });
  }

  const studyDate = String(formData.get("study_date") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const pdf = formData.get("pdf");

  if (!studyDate || !title) {
    return NextResponse.json({ error: "Selecione a data e o título." }, { status: 400 });
  }

  let fileUrl: string | null = null;

  if (pdf instanceof File && pdf.size > 0) {
    if (pdf.type !== "application/pdf") {
      return NextResponse.json({ error: "O arquivo precisa ser um PDF." }, { status: 400 });
    }
    const MAX_SIZE = 15 * 1024 * 1024;
    if (pdf.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "PDF muito grande. Envie um arquivo de até 15MB." },
        { status: 400 },
      );
    }

    const path = `${crypto.randomUUID()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("studies")
      .upload(path, pdf, { contentType: "application/pdf" });

    if (uploadError) {
      return NextResponse.json(
        { error: `Falha ao enviar o PDF: ${uploadError.message}` },
        { status: 500 },
      );
    }

    const { data: publicUrlData } = supabase.storage.from("studies").getPublicUrl(path);
    fileUrl = publicUrlData.publicUrl;
  }

  const { error: insertError } = await supabase.from("weekly_studies").insert({
    study_date: studyDate,
    title,
    content: content || "",
    file_url: fileUrl,
    created_by: user.id,
  });

  if (insertError) {
    return NextResponse.json(
      { error: `Falha ao salvar o estudo: ${insertError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
