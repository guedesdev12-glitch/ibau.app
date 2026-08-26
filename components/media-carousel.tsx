"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

type Slide = { id: string; image_url: string; title: string | null; href?: string };

export function MediaCarousel({
  slides,
  aspect = "aspect-[16/10]",
  emptyState,
}: {
  slides: Slide[];
  aspect?: string;
  emptyState?: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % Math.max(slides.length, 1));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  if (slides.length === 0) {
    return emptyState ? (
      <>{emptyState}</>
    ) : (
      <div className={`flex ${aspect} w-full items-center justify-center rounded-2xl bg-neutral-100`} />
    );
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-black/5 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((s) => {
            const visual = (
              <>
                <Image
                  src={s.image_url}
                  alt={s.title ?? ""}
                  fill
                  sizes="(max-width: 768px) 100vw, 700px"
                  className="object-cover"
                  priority
                />
                {s.title && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="text-base font-semibold leading-snug text-white drop-shadow">
                        {s.title}
                      </p>
                    </div>
                  </>
                )}
              </>
            );
            return s.href ? (
              <Link
                key={s.id}
                href={s.href}
                className={`relative block ${aspect} w-full flex-shrink-0`}
              >
                {visual}
              </Link>
            ) : (
              <div key={s.id} className={`relative ${aspect} w-full flex-shrink-0`}>
                {visual}
              </div>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
      </div>

      {slides.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              aria-label={`Ir para o slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-neutral-900" : "w-1.5 bg-neutral-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
