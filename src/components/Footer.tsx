import { Link as RouterLink } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-16 overflow-hidden bg-[#2B0F16] text-white border-t border-[#5B2333]/40">

      {/* ================= BACKGROUND GLOW ================= */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#7A1631]/25 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#D97706]/15 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 md:px-10 py-10">

        {/* ================= TOP ================= */}
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.7fr_1.3fr] gap-12 items-start">

          {/* ================= BRAND ================= */}
          <div>
            <div className="flex items-center gap-4 mb-4">

              {/* ================= LOGO IMAGE ================= */}
              <div className="relative flex items-center justify-center shrink-0">

                {/* Glow */}
                <div className="absolute inset-0 bg-[#F59E0B] opacity-40 blur-3xl rounded-full" />

                {/* Logo */}
                <img
                  src="/logo.png"
                  alt="CafeRank Logo"
                  className="relative w-28 h-28 md:w-32 md:h-32 object-contain
                  drop-shadow-[0_15px_35px_rgba(249,115,22,0.55)]
                  hover:scale-105 transition-all duration-300"
                />
              </div>

              {/* ================= TEXT ================= */}
              <div>
                <h2 className="text-2xl md:text-3xl font-black leading-none">
                  Cafe
                  <span className="bg-linier-to-r from-[#F59E0B] via-[#FB923C] to-[#F97316] bg-clip-text text-transparent">
                    Rank
                  </span>
                </h2>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-[#E7D8D1] max-w-sm">
              Temukan cafe terbaik berdasarkan harga,
              fasilitas, kenyamanan, dan lokasi
              dengan sistem rekomendasi modern
              berbasis SPK.
            </p>
          </div>

          {/* ================= NAVIGATION ================= */}
          <div className="md:pl-2">
            <h4 className="text-xl font-bold mb-4 text-white">
              Navigasi
            </h4>

            <ul className="space-y-3 text-sm">

              <li>
                <RouterLink
                  to="/"
                  className="text-[#E7D8D1] hover:text-[#FBBF24] transition"
                >
                  Beranda
                </RouterLink>
              </li>

              <li>
                <RouterLink
                  to="/cafes"
                  className="text-[#E7D8D1] hover:text-[#FBBF24] transition"
                >
                  Daftar Cafe
                </RouterLink>
              </li>

              <li>
                <RouterLink
                  to="/recommendation"
                  className="text-[#E7D8D1] hover:text-[#FBBF24] transition"
                >
                  Rekomendasi
                </RouterLink>
              </li>

              <li>
                <RouterLink
                  to="/ranking"
                  className="text-[#E7D8D1] hover:text-[#FBBF24] transition"
                >
                  Ranking
                </RouterLink>
              </li>

              <li>
                <RouterLink
                  to="/about"
                  className="text-[#E7D8D1] hover:text-[#FBBF24] transition"
                >
                  Tentang
                </RouterLink>
              </li>
            </ul>
          </div>

          {/* ================= CONTACT + MAP ================= */}
          <div className="md:pl-4">
            <h4 className="text-xl font-bold mb-4 text-white">
              Kontak & Lokasi
            </h4>

            {/* CONTACT + MAP */}
            <div className="flex flex-col xl:flex-row gap-4 items-start">

              {/* CONTACT */}
              <div className="space-y-4 min-w-[210px]">

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Phone size={17} className="text-[#FBBF24]" />
                  </div>

                  <span className="text-[#E7D8D1] text-sm">
                    +62 858-0276-4729
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Mail size={17} className="text-[#FBBF24]" />
                  </div>

                  <span className="text-[#E7D8D1] text-sm">
                    CafeRank@gmail.com
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <MapPin size={17} className="text-[#FBBF24]" />
                  </div>

                  <span className="text-[#E7D8D1] text-sm">
                    Jl. Raya Cafe No. 123,
                    Kota Cafe, Indonesia
                  </span>
                </div>
              </div>

              {/* ================= MAP ================= */}
              <div className="overflow-hidden rounded-2xl border border-white/10 shadow-lg w-full xl:w-[240px] h-[160px] flex-shrink-0">
                <iframe
                  src="https://www.google.com/maps/embed?pb="
                  className="w-full h-full"
                  loading="lazy"
                  title="CafeRank Location"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM ================= */}
        <div className="border-t border-white/10 mt-8 pt-5 flex flex-col md:flex-row justify-between items-center gap-5">

          <p className="text-sm text-[#C9B6AA]">
            © 2026 CafeRank. All rights reserved.
          </p>

          {/* ================= SOCIAL ================= */}
          <div className="flex gap-4 text-[#E8DCD5]">

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gradient-to-r hover:from-[#7A1631] hover:to-[#D97706] hover:text-white hover:scale-110 transition-all duration-300"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gradient-to-r hover:from-[#7A1631] hover:to-[#D97706] hover:text-white hover:scale-110 transition-all duration-300"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>

            {/* Youtube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gradient-to-r hover:from-[#7A1631] hover:to-[#D97706] hover:text-white hover:scale-110 transition-all duration-300"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
              </svg>
            </a>

            {/* TikTok */}
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gradient-to-r hover:from-[#7A1631] hover:to-[#D97706] hover:text-white hover:scale-110 transition-all duration-300"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.77 0 2.89 2.89 0 0 1 2.57-2.87v-3.32a6.22 6.22 0 1 0 6.22 6.22V6.69z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}