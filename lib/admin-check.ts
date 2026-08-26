import { createClient } from "@/lib/supabase/server";

/**
 * Administrador ou Desenvolvedor — o único nível que pode atribuir
 * categorias sensíveis (admin_only) e usar o painel de usuários.
 */
export async function isAdminLevel(): Promise<boolean> {
  const supabase = await createClient();

  const { data: isDeveloper } = await supabase.rpc("is_developer");
  if (isDeveloper) return true;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("roles(name)")
    .eq("id", user.id)
    .single();

  const roleName = Array.isArray(profile?.roles)
    ? profile?.roles[0]?.name
    : (profile?.roles as { name: string } | null)?.name;

  return roleName === "Administrador";
}
