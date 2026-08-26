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
    <header className="sticky top-0 z-20">
      <div className="relative overflow-hidden rounded-b-[28px] bg-gradient-to-b from-neutral-800 via-neutral-900 to-black shadow-[0_14px_32px_-12px_rgba(0,0,0,0.55)] ring-1 ring-inset ring-white/10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white/10 p-1 shadow-inner">
              <Image src="/logo-mark-v2.png" alt="IBAU" width={26} height={26} />
            </div>
            <span className="text-lg font-black tracking-tight text-white">ibau</span>
          </div>
          <AvatarButton avatarUrl={profile?.avatar_url ?? null} initials={initials} />
        </div>
      </div>
    </header>
  );
}
