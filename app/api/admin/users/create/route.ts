import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminLevel } from "@/lib/admin-check";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sessão expirada. Faça login novamente." }, { status: 401 });
  }

  const adminLevel = await isAdminLevel();
  if (!adminLevel) {
    return NextResponse.json(
      { error: "Só Administradores e Desenvolvedores podem cadastrar usuários." },
      { status: 403 },
    );
  }

  const { fullName, email, password, roleId } = await request.json();

  if (!fullName || !email || !password || !roleId) {
    return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
  }

  const { data: role } = await supabase
    .from("roles")
    .select("admin_only")
    .eq("id", roleId)
    .single();

  if (!role) {
    return NextResponse.json({ error: "Categoria inválida." }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Painel de administração ainda não configurado." },
      { status: 501 },
    );
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message || "Falha ao criar usuário." },
      { status: 500 },
    );
  }

  // O trigger handle_new_user já cria o profile com categoria "Visitante";
  // aqui só corrigimos para a categoria escolhida no formulário.
  const { error: updateError } = await admin
    .from("profiles")
    .update({ role_id: roleId })
    .eq("id", created.user.id);

  if (updateError) {
    return NextResponse.json(
      { error: `Usuário criado, mas falha ao definir categoria: ${updateError.message}` },
      { status: 207 },
    );
  }

  return NextResponse.json({ ok: true, userId: created.user.id });
}
