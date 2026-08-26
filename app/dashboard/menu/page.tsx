import Link from "next/link";
import { CalendarDays, Shield, ImagePlus, ChevronRight, Grid2x2, Users, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";
import { BottomNav } from "@/components/bottom-nav";
import { TopBar } from "@/components/top-bar";
import { isAdminLevel } from "@/lib/admin-check";

export default async function MenuPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: isDeveloper }, { data: canManageMembers }, { data: canManageChurch }, { data: canManageStudies }, adminLevel] =
    await Promise.all([
      supabase.from("profiles").select("full_name, roles(name)").eq("id", user!.id).single(),
      supabase.rpc("is_developer"),
      supabase.rpc("has_permission", { p_key: "membros.manage" }),
      supabase.rpc("has_permission", { p_key: "igreja.manage" }),
      supabase.rpc("has_permission", { p_key: "estudos.manage" }),
      isAdminLevel(),
    ]);

  const roleName = Array.isArray(profile?.roles)
    ? profile?.roles[0]?.name
    : (profile?.roles as { name: string } | null)?.name;

  const links = [
    adminLevel && { href: "/dashboard/admin/usuarios", label: "Painel de usuários", icon: Users },
    canManageMembers && { href: "/dashboard/membros", label: "Membros", icon: CalendarDays },
    canManageStudies && { href: "/dashboard/admin/estudos", label: "Estudo semanal", icon: BookOpen },
    isDeveloper && { href: "/dashboard/admin/categorias", label: "Categorias & Permissões", icon: Shield },
    canManageChurch && { href: "/dashboard/admin/carrossel", label: "Carrossel da tela inicial", icon: ImagePlus },
  ].filter(Boolean) as { href: string; label: string; icon: typeof CalendarDays }[];

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 pb-40 pt-6">
        <h1 className="ibau-section-title mb-5 text-lg font-semibold">
          <span className="ibau-section-icon"><Grid2x2 size={15} /></span>
          Menu
        </h1>

      <div className="ibau-card mb-5 p-4">
        <p className="text-sm font-medium">{profile?.full_name}</p>
        <p className="text-xs text-neutral-500">{roleName}</p>
      </div>

      <div className="space-y-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="ibau-card flex items-center justify-between p-4"
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <Icon size={18} /> {label}
            </span>
            <ChevronRight size={16} className="text-neutral-400" />
          </Link>
        ))}
      </div>

      <form action={logout} className="mt-6">
        <button type="submit" className="text-sm text-neutral-400 underline">
          Sair da conta
        </button>
      </form>

      <BottomNav />
      </main>
    </>
  );
}
