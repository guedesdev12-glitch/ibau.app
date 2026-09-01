/** Extrai o ID de um vídeo do YouTube a partir das formas mais comuns de URL. */
export function youtubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/live\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

export function embedUrl(url: string | null): string | null {
  if (!url) return null;
  const yt = youtubeId(url);
  if (yt) return `https://www.youtube.com/embed/${yt}?rel=0`;
  const vm = vimeoId(url);
  if (vm) return `https://player.vimeo.com/video/${vm}`;
  return null;
}

/** Miniatura automática quando não houver capa enviada. */
export function autoThumbnail(url: string | null): string | null {
  if (!url) return null;
  const yt = youtubeId(url);
  return yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : null;
}

/** Fundos do card de versículo — rotacionam por dia, sem depender de rede. */
export const VERSE_BACKGROUNDS = [
  "linear-gradient(160deg,#7c3f5d 0%,#c2643f 55%,#e8a05c 100%)",
  "linear-gradient(160deg,#123f26 0%,#1c6b3c 60%,#5fa06a 100%)",
  "linear-gradient(160deg,#1e3a5f 0%,#2b6b8f 55%,#7fb5c9 100%)",
  "linear-gradient(160deg,#3d2b56 0%,#6b4a8f 55%,#b58bd1 100%)",
  "linear-gradient(160deg,#5c2e2e 0%,#a04d3c 55%,#e0a06a 100%)",
  "linear-gradient(160deg,#0f3d3e 0%,#1f6f6b 55%,#7fc4b4 100%)",
  "linear-gradient(160deg,#2b2f4a 0%,#4a5680 55%,#93a3cc 100%)",
];

export function verseBackground(date: Date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return VERSE_BACKGROUNDS[dayOfYear % VERSE_BACKGROUNDS.length];
}
