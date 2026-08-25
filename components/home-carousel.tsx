"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

type Banner = { id: string; image_url: string; title: string | null };

export function HomeCarousel({
  banners,
  churchName,
}: {
  banners: Banner[];
  churchName: string;
}) {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % Math.max(banners.length, 1));
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, banners.length]);

  if (banners.length === 0) {
    return (
      <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-2xl bg-neutral-900">
        <p className="px-6 text-center text-lg font-semibold text-white/90">
          Bem-vindo(a) à {churchName}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {banners.map((b) => (
            <div key={b.id} className="relative aspect-[16/10] w-full flex-shrink-0">
              <Image
                src={b.image_url}
                alt={b.title ?? "Aviso"}
                fill
                sizes="(max-width: 768px) 100vw, 700px"
                className="object-cover"
                priority
              />
              {b.title && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-base font-semibold leading-snug text-white drop-shadow">
                      {b.title}
                    </p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {banners.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {banners.map((b, i) => (
            <button
              key={b.id}
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
