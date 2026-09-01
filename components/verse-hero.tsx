import Link from "next/link";
import { BookOpenText, ChevronRight } from "lucide-react";
import { verseOfTheDay } from "@/lib/daily-verse";
import { verseBackground } from "@/lib/media";

export function VerseHero() {
  const verse = verseOfTheDay();
  const background = verseBackground();

  return (
    <Link
      href="/dashboard/biblia"
      className="ibau-pressable ibau-enter relative block overflow-hidden rounded-3xl shadow-[0_18px_44px_-18px_rgba(0,0,0,0.55)]"
      style={{ background }}
    >
      {/* Textura suave para o fundo não ficar chapado */}
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(120% 80% at 20% 0%, rgba(255,255,255,0.55), transparent 60%), radial-gradient(90% 70% at 90% 100%, rgba(0,0,0,0.45), transparent 65%)",
        }}
      />

      <div className="relative p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
          Versículo do dia
        </p>
        <p className="mt-1 text-base font-bold text-white">{verse.reference}</p>

        <p
          className="mt-5 text-[22px] leading-[1.35] text-white"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          {verse.text}
        </p>

        <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-white/85">
          <BookOpenText size={15} />
          Abrir a Bíblia
          <ChevronRight size={15} />
        </div>
      </div>
    </Link>
  );
}
