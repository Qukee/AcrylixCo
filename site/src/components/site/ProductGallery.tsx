'use client';

import { useState } from 'react';

interface GalleryImage {
  url: string;
  alt: string;
}

interface ProductGalleryProps {
  images: GalleryImage[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const safeIndex = Math.min(Math.max(index, 0), Math.max(images.length - 1, 0));
  const active = images[safeIndex];

  if (!active) return null;

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div className="grid gap-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-cream-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={active.url}
          src={active.url}
          alt={active.alt}
          className="h-full w-full object-cover"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink-900 shadow-sm transition-colors hover:bg-white"
            >
              <span aria-hidden className="text-lg leading-none">
                ←
              </span>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink-900 shadow-sm transition-colors hover:bg-white"
            >
              <span aria-hidden className="text-lg leading-none">
                →
              </span>
            </button>
            <p className="absolute bottom-3 right-3 rounded-full bg-white/85 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-700 shadow-sm">
              {safeIndex + 1} / {images.length}
            </p>
          </>
        )}
      </div>

      {images.length > 1 && (
        <ul
          role="listbox"
          aria-label="Product photos"
          className="-mb-1 flex flex-wrap gap-2 pb-1"
        >
          {images.map((img, i) => {
            const selected = i === safeIndex;
            return (
              <li key={img.url}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => setIndex(i)}
                  className={`block aspect-square h-16 w-16 overflow-hidden rounded-md border transition-colors md:h-20 md:w-20 ${
                    selected
                      ? 'border-terracotta-500 ring-1 ring-terracotta-500'
                      : 'border-cream-200 hover:border-terracotta-300'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt=""
                    aria-hidden
                    className="h-full w-full object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
