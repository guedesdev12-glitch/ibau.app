"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users2, Calendar, MessageCircle, User } from "lucide-react";

const ITEMS = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/dashboard/celulas", label: "Células", icon: Users2 },
  { href: "/dashboard/eventos", label: "Eventos", icon: Calendar },
  { href: "/dashboard/mensagens", label: "Mensagens", icon: MessageCircle },
  { href: "/dashboard/perfil", label: "Perfil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-3xl items-stretch justify-between px-2">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${
                  active ? "text-[#173B2C]" : "text-neutral-400"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
