import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminLevel } from "@/lib/admin-check";

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

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
      { error: "Só Administradores e Desenvolvedores podem resetar senhas." },
      { status: 403 },
    );
  }

  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: "Usuário não informado." }, { status: 400 });
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

  const newPassword = generatePassword();

  const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, newPassword });
}
