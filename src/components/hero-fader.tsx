'use client'
import { useEffect, useState } from "react";
import { heroSlides } from "@/content/landing";

export function HeroFader() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % heroSlides.length), 4500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative h-[70vh] min-h-[420px] w-full overflow-hidden bg-muted">
      {heroSlides.map((s, idx) => (
        <img
          key={s.src}
          src={s.src}
          alt={s.alt}
          className={`washed absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
            idx === i ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-start justify-end px-6 pb-16 text-left text-white">
        <h1 className="max-w-2xl text-4xl tracking-tight sm:text-5xl md:text-6xl">
          Learning, distribution, everything in one place
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
          Timetables, partner schools, and inventory management for our network.
        </p>
      </div>
      <div className="absolute bottom-4 left-6 z-10 flex gap-2">
        {heroSlides.map((_, idx) => (
          <span
            key={idx}
            className={`h-1.5 w-6 rounded-full transition-all ${
              idx === i ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
