import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding-wizard";

export default async function CompletarCadastroPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email, onboarding_completed")
      .eq("id", user.id)
      .single(),
    supabase
      .from("roles")
      .select("id, name, admin_only, is_developer")
      .eq("admin_only", false)
      .eq("is_developer", false)
      .neq("name", "Administrador")
      .order("name"),
  ]);

  if (profile?.onboarding_completed) redirect("/dashboard");

  return (
    <OnboardingWizard
      roles={roles?.map((r) => ({ id: r.id, name: r.name })) ?? []}
      initialName={profile?.full_name ?? ""}
      initialEmail={profile?.email ?? user.email ?? ""}
    />
  );
}
