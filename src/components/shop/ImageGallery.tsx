"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
        {images[active] && (
          <Image src={images[active]} alt={name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-2 transition ${
                active === i ? "ring-fuchsia-600" : "ring-transparent"
              }`}
            >
              <Image src={img} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
