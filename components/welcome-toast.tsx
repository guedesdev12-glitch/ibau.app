"use client";

import { useEffect, useState } from "react";
import { HandHeart } from "lucide-react";

export function WelcomeToast({ firstName }: { firstName: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem("ibau-welcome-shown");
    if (shown) return;
    sessionStorage.setItem("ibau-welcome-shown", "1");
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <div
        onClick={() => setVisible(false)}
        className="flex animate-[fadeslide_0.4s_ease-out] items-center gap-3 rounded-2xl bg-neutral-950 px-5 py-3.5 text-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
          <HandHeart size={16} />
        </span>
        <div>
          <p className="text-sm font-semibold leading-tight">Graça e paz, {firstName}!</p>
          <p className="text-xs text-white/50">Bom te ver por aqui.</p>
        </div>
      </div>
      <style>{`
        @keyframes fadeslide {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
