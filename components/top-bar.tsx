import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { AvatarButton } from "@/components/avatar-button";

export async function TopBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user!.id)
    .single();

  const initials = profile?.full_name?.slice(0, 1).toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-20 bg-neutral-950">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Image src="/logo-mark-v2.png" alt="IBAU" width={30} height={30} />
          <span className="text-lg font-black tracking-tight text-white">ibau</span>
        </div>
        <AvatarButton avatarUrl={profile?.avatar_url ?? null} initials={initials} />
      </div>
    </header>
  );
}
