import {
  Home,
  Coffee,
  Star,
  BarChart3,
  Info,
  UserCircle,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/authStore";

export const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const profileRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { label: "Beranda", href: "/", icon: <Home size={18} /> },
    { label: "Daftar Cafe", href: "/cafes", icon: <Coffee size={18} /> },
    // {
    //   label: "Rekomendasi",
    //   href: "/recommendation",
    //   icon: <BarChart3 size={18} />,
    // },
    { label: "Ranking", href: "/ranking", icon: <Star size={18} /> },
    // { label: "Tentang", href: "/about", icon: <Info size={18} /> },
  ];

  // Tutup dropdown profil kalau klik di luar area dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    navigate("/login");
  };
return (
    <header className="sticky top-0 z-50 w-full bg-[#2B0F16]/95 backdrop-blur-xl border-b border-[#5B2333]/40 shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
      {/*                                                                                                                              ⬆️ overflow-hidden DIHAPUS */}

      {/* ================= BACKGROUND GLOW ================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/*                                              ⬆️ overflow-hidden DIPINDAH ke sini */}
        <div className="absolute -top-24 left-0 w-72 h-72 bg-[#7A1631]/30 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D97706]/20 rounded-full blur-3xl" />
      </div>

      {/* ================= MAIN NAVBAR ================= */}
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 h-20 md:h-24 flex items-center justify-between">

        {/* ================= LOGO ================= */}
        <NavLink to="/" className="flex items-center gap-3 md:gap-4 shrink-0">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[#F59E0B] opacity-40 blur-2xl rounded-full" />
            <img
              src="/logo.png"
              alt="CafeRank Logo"
              className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-contain drop-shadow-[0_12px_30px_rgba(249,115,22,0.5)]"
            />
          </div>

          <div className="block">
            <h1 className="text-[22px] sm:text-3xl md:text-4xl font-black tracking-tight leading-none text-white">
              Cafe
              <span className="bg-gradient-to-r from-[#F59E0B] via-[#FB923C] to-[#F97316] bg-clip-text text-transparent">
                Rank
              </span>
            </h1>
            <p className="text-[7px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.22em] md:tracking-[0.30em] text-[#D9B8A3] mt-1">
              Smart Cafe Recommendation
            </p>
          </div>
        </NavLink>

        {/* ================= DESKTOP MENU ================= */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 backdrop-blur-xl rounded-full px-3 py-2 shadow-inner">
          {menuItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `group relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 overflow-hidden whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-[#7A1631] to-[#D97706] text-white shadow-[0_8px_25px_rgba(217,119,6,0.35)]"
                    : "text-[#F5E7DF] hover:text-[#FBBF24] hover:bg-white/10"
                }`
              }
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/5 transition duration-300 rounded-full" />
              <span className="relative z-10 flex items-center gap-2">
                {item.icon}
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* ================= RIGHT SECTION ================= */}
        <div className="flex items-center gap-3">

          {/* ===== DESKTOP: LOGIN atau PROFILE DROPDOWN ===== */}
          {user ? (
            <div className="hidden lg:block relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full bg-white/10 border border-white/10 hover:bg-white/15 transition"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#EA580C] flex items-center justify-center text-white font-black text-sm shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold text-white max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown
                  size={15}
                  className={`text-[#D9B8A3] transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E8DED5] overflow-hidden py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-[#F0E8DF]">
                    <p className="text-sm font-bold text-[#3E2C23] truncate">{user.name}</p>
                    <p className="text-xs text-[#8B735C] truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#3E2C23] hover:bg-[#FAF8F5] transition"
                  >
                    <UserCircle size={16} className="text-[#8B5E3C]" />
                    Profil Saya
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to="/login"
              className="hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#F59E0B] via-[#FB923C] to-[#EA580C] text-white text-sm font-bold shadow-[0_8px_25px_rgba(249,115,22,0.4)] hover:scale-105 hover:shadow-[0_10px_35px_rgba(249,115,22,0.6)] transition-all duration-300"
            >
              <UserCircle size={18} />
              Login
            </NavLink>
          )}

          {/* ================= MOBILE BUTTON ================= */}
          <button
            className="lg:hidden w-12 h-12 rounded-2xl bg-white/10 border border-white/10 text-white flex items-center justify-center backdrop-blur-xl hover:bg-white/15 transition shrink-0"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ${
          isOpen ? "max-h-[700px]" : "max-h-0"
        }`}
      >
        <div className="relative bg-[#2B0F16]/95 backdrop-blur-xl border-t border-white/10 px-5 py-5">
          <div className="absolute top-0 left-0 w-52 h-52 bg-[#7A1631]/20 blur-3xl rounded-full" />
          <div className="absolute bottom-0 right-0 w-52 h-52 bg-[#D97706]/10 blur-3xl rounded-full" />

          <div className="relative flex flex-col gap-3">
            {menuItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold text-[15px] transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-[#7A1631] to-[#D97706] text-white shadow-[0_10px_30px_rgba(217,119,6,0.35)]"
                      : "text-[#F5E7DF] bg-white/5 hover:bg-white/10"
                  }`
                }
              >
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}

            {/* ===== MOBILE: LOGIN atau PROFILE + LOGOUT ===== */}
            {user ? (
              <>
                <div className="mt-2 flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#EA580C] flex items-center justify-center text-white font-black text-sm shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                    <p className="text-xs text-[#D9B8A3] truncate">{user.email}</p>
                  </div>
                </div>

                <NavLink
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold text-[15px] text-[#F5E7DF] bg-white/5 hover:bg-white/10 transition"
                >
                  <UserCircle size={18} />
                  Profil Saya
                </NavLink>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-red-500/15 text-red-400 font-bold border border-red-500/20"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setIsOpen(false)}
                className="mt-3 flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-gradient-to-r from-[#F59E0B] via-[#FB923C] to-[#EA580C] text-white font-bold shadow-[0_8px_25px_rgba(249,115,22,0.35)]"
              >
                <UserCircle size={18} />
                Login
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;