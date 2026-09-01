import Link from "next/link";
import Image from "next/image";
import { Play, Check, BookOpen, HandHeart, Video } from "lucide-react";

export type ReflectionCardData = {
  id: string;
  kind: "leitura" | "oracao" | "reflexao";
  title: string;
  speaker_name: string | null;
  thumbnail_url: string | null;
  duration_min: number | null;
  duration_max: number | null;
  viewed?: boolean;
};

const KIND_LABEL: Record<ReflectionCardData["kind"], string> = {
  leitura: "Leitura guiada",
  oracao: "Oração guiada",
  reflexao: "Reflexão",
};

function KindIcon({ kind }: { kind: ReflectionCardData["kind"] }) {
  if (kind === "leitura") return <BookOpen size={18} />;
  if (kind === "oracao") return <HandHeart size={18} />;
  return <Video size={18} />;
}

function duration(min: number | null, max: number | null) {
  if (min && max) return `${min}–${max} minutos`;
  if (min) return `${min} minutos`;
  return null;
}

export function ReflectionCard({ item }: { item: ReflectionCardData }) {
  const time = duration(item.duration_min, item.duration_max);

  return (
    <Link
      href={`/dashboard/reflexoes/${item.id}`}
      className="ibau-card ibau-tile ibau-pressable flex items-stretch gap-4 overflow-hidden p-4"
    >
      <div className="min-w-0 flex-1">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
            item.viewed
              ? "bg-[#14532d] text-white"
              : "bg-[#14532d]/10 text-[#14532d]"
          }`}
        >
          {item.viewed ? <Check size={11} /> : <KindIcon kind={item.kind} />}
          {item.viewed ? "Concluído" : KIND_LABEL[item.kind]}
        </span>

        <h3 className="mt-2 line-clamp-2 text-[15px] font-bold leading-tight">
          {item.title}
        </h3>

        {item.speaker_name && (
          <p className="mt-1 text-xs text-neutral-500">{item.speaker_name}</p>
        )}

        {time && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
            <Play size={11} fill="currentColor" /> {time}
          </p>
        )}
      </div>

      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-900">
        {item.thumbnail_url ? (
          <Image
            src={item.thumbnail_url}
            alt={item.title}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1c6b3c] to-[#0a2c18] text-white/70">
            <KindIcon kind={item.kind} />
          </div>
        )}
        <span className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-neutral-900 shadow">
          <Play size={12} fill="currentColor" />
        </span>
      </div>
    </Link>
  );
}
