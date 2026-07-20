"use client";

import { useEffect, useMemo, useState } from "react";
import { Star, MapPin, Coffee, Wallet, Compass, type LucideIcon } from "lucide-react";
// Sesuaikan path import sesuai struktur folder proyekmu
import { useCafeStore, type Cafe } from "../store/useCaffeStore";

// ============ HERO SLIDES ============
const HERO_SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=1600&auto=format&fit=crop",
    caption: "Ngopi pagi, kerja jadi lebih ringan",
  },
  {
    image:
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=1600&auto=format&fit=crop",
    caption: "Nongkrong santai sore hari",
  },
  {
    image:
      "https://images.unsplash.com/photo-1453614512568-c4024d13c247?q=80&w=1600&auto=format&fit=crop",
    caption: "Tempat kerja yang nyaman",
  },
  {
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop",
    caption: "Kopi terbaik, ditemani suasana hangat",
  },
];

const HERO_INTERVAL_MS = 5000;

// ============ FEATURES ============
const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Coffee, title: "Nyaman", desc: "Tempat nyaman untuk nongkrong" },
  { icon: Wallet, title: "Harga Terjangkau", desc: "Cafe dengan harga bersahabat" },
  { icon: Star, title: "Rating Tinggi", desc: "Cafe dengan rating terbaik" },
  { icon: Compass, title: "Dekat Lokasi", desc: "Cafe terdekat dari lokasimu" },
];

function getCafeRating(cafe: Cafe): number | null {
  if (!cafe.values?.length) return null;

  const ratingEntry = cafe.values.find(
    (v) =>
      v.criteria?.code?.toLowerCase().includes("rating") ||
      v.criteria?.name?.toLowerCase().includes("rating")
  );
  if (ratingEntry) return ratingEntry.value;

  const benefitValues = cafe.values.filter((v) => v.criteria?.type === "BENEFIT");
  if (!benefitValues.length) return null;

  const avg = benefitValues.reduce((sum, v) => sum + v.value, 0) / benefitValues.length;
  return Math.min(5, Math.round(avg * 10) / 10);
}

export default function HomePage() {
  const { cafes, isLoading, fetchCafes } = useCafeStore();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    fetchCafes();
  }, [fetchCafes]);

  // Auto-geser hero slide setiap beberapa detik
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, HERO_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const popularCafes = useMemo(() => {
    return [...cafes]
      .filter((c) => c.isActive)
      .map((c) => ({ ...c, rating: getCafeRating(c) }))
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 4);
  }, [cafes]);

  return (
    <main className="bg-[#FBF7F0] text-[#2A1E14]">
      {/* ===== HERO ===== */}
      <section className="relative h-[560px] overflow-hidden sm:h-[640px]">
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={slide.image}
            className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
              i === activeSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.caption}
              className="h-full w-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1009]/90 via-[#1A1009]/55 to-[#1A1009]/20" />
          </div>
        ))}

        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-16 sm:px-12 lg:px-20">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-[#D4A24C]">
            {HERO_SLIDES[activeSlide].caption}
          </p>
          <h1 className="max-w-xl text-4xl font-bold leading-tight text-white sm:text-5xl">
            Temukan Cafe Terbaik Sesuai Preferensimu
          </h1>
          <p className="mt-4 max-w-md text-[15px] text-white/80">
            Sistem Pendukung Keputusan untuk merekomendasikan cafe terbaik
            menggunakan metode SAW, WP, dan TOPSIS.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/cafes"
              className="rounded-xl bg-[#B5651D] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-[#9c5419]"
            >
              Jelajahi Cafe
            </a>
            <a
              href="/recommendation"
              className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Lihat Rekomendasi
            </a>
          </div>

          {/* indikator slide */}
          <div className="mt-10 flex gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeSlide ? "w-8 bg-[#D4A24C]" : "w-4 bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURE PILLS ===== */}
      <section className="relative z-10 mx-auto -mt-10 grid max-w-5xl grid-cols-2 gap-4 px-6 sm:grid-cols-4 sm:px-12">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl bg-white p-5 text-center shadow-md shadow-black/5"
          >
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#FBEFE0] text-[#B5651D]">
              <Icon size={20} />
            </div>
            <p className="text-sm font-semibold text-[#2A1E14]">{title}</p>
            <p className="mt-1 text-xs text-[#6B5C4D]">{desc}</p>
          </div>
        ))}
      </section>

      {/* ===== CAFE TERPOPULER ===== */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Cafe Terpopuler</h2>
          <a href="/cafes" className="text-sm font-semibold text-[#B5651D] hover:underline">
            Lihat Semua
          </a>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-[#EFE7DA]" />
            ))}
          </div>
        ) : popularCafes.length === 0 ? (
          <p className="text-sm text-[#6B5C4D]">Belum ada cafe yang terdaftar.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {popularCafes.map((cafe) => (
              <a
                key={cafe.id}
                href={`/cafes/${cafe.id}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm shadow-black/5 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-32 w-full overflow-hidden">
                  <img
                    src={cafe.image ?? "/placeholder-cafe.jpg"}
                    alt={cafe.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold text-[#2A1E14]">{cafe.name}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-[#8A7A66]">
                    <Star size={12} className="fill-[#D4A24C] text-[#D4A24C]" />
                    <span>{cafe.rating ? cafe.rating.toFixed(1) : "Baru"}</span>
                    <span className="mx-1">•</span>
                    <MapPin size={12} />
                    <span className="truncate">{cafe.lokasi ?? cafe.address}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

    </main>
  );
}