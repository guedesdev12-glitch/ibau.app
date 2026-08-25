"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarClock, Church, Grid2x2 } from "lucide-react";

const ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/eventos", label: "Eventos", icon: CalendarClock },
  { href: "/dashboard/celulas", label: "Igreja", icon: Church },
  { href: "/dashboard/menu", label: "Menu", icon: Grid2x2 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-4 z-10 flex justify-center px-4">
      <ul className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white/95 px-2 py-1.5 shadow-[0_8px_28px_-8px_rgba(0,0,0,0.25)] backdrop-blur">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 rounded-full px-4 py-2 text-[10px] font-medium ${
                  active ? "bg-neutral-900 text-white" : "text-neutral-500"
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
