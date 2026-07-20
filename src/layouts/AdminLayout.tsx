import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  SlidersHorizontal,
  Coffee,
  ClipboardCheck,
  Calculator,
  Users,
  LogOut,
  Menu,
  X,
  Building2,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const logoutAction = useAuthStore((state) => state.logout);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logoutAction();
    alert("Berhasil logout");
    navigate("/login");
  };

  const navigationItems = [
    {
      category: "Dashboard",
      items: [
        {
          to: "/admin/dashboard",
          label: "Dashboard",
          icon: <LayoutDashboard size={18} />,
        },
      ],
    },
    {
      category: "Master Data",
      items: [
        {
          to: "/admin/tenant",
          label: "Tenant",
          icon: <Building2 size={18} />,
        },
        {
          to: "/admin/cafes",
          label: "Cafe",
          icon: <Coffee size={18} />,
        },
        {
          to: "/admin/kriteria",
          label: "Kriteria",
          icon: <SlidersHorizontal size={18} />,
        },
        {
          to: "/admin/nilaiAlternatif",
          label: "Nilai Alternatif",
          icon: <ClipboardCheck size={18} />,
        },
      ],
    },
    {
      category: "Rekomendasi",
      items: [
        {
          to: "/admin/perhitungan",
          label: "Perhitungan SPK",
          icon: <Calculator size={18} />,
        },
    //     {
    //       to: "/admin/riwayat",
    //       label: "Riwayat Rekomendasi",
    //       icon: <History size={18} />,
    //     },
      ],
    },
    {
      category: "Pengguna",
      items: [
        {
          to: "/admin/users",
          label: "User",
          icon: <Users size={18} />,
        },
        // {
        //   to: "/admin/profile",
        //   label: "Profil",
        //   icon: <UserCircle size={18} />,
        // },
      ],
    },

  ];

  return (
    <div className="w-full min-h-screen bg-[#F7F1E8] flex">

      {/* MOBILE HEADER */}
      <header className="fixed top-0 left-0 right-0 h-[75px] bg-[#2B1813] md:hidden z-50 flex items-center justify-between px-5 shadow-md border-b border-[#5C3B2E]">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-14 h-14 object-contain"
          />
          <h1 className="font-bold text-xl">
            <span className="text-[#F7F1E8]">Cafe</span>
            <span className="text-[#D9A066]">Rank</span>
          </h1>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-[#F7F1E8]"
        >
          {isOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </header>

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:relative top-[75px] md:top-0 left-0 z-40
          w-[285px] h-[calc(100vh-75px)] md:h-screen
          bg-gradient-to-b from-[#2B1813] via-[#3A231C] to-[#6B4226]
          border-r border-[#5C3B2E]
          px-5 py-6 flex flex-col justify-between
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Scrollable nav area */}
        <div className="flex-1 overflow-y-auto scrollbar-none">
          {/* DESKTOP LOGO */}
          <div className="hidden md:flex flex-col items-center border-b border-[#5C3B2E] pb-6 mb-8">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-24 h-24 object-contain"
            />
            <h1 className="text-3xl font-bold mt-3">
              <span className="text-[#F7F1E8]">Cafe</span>
              <span className="text-[#D9A066]">Rank</span>
            </h1>
            <p className="text-[#D9A066]/80 text-xs tracking-[3px] mt-1 uppercase">
              Admin Panel
            </p>
          </div>

          {/* MENU */}
          <nav className="space-y-8">
            {navigationItems.map((section) => (
              <div key={section.category}>
                <p className="text-[#D9A066]/80 text-xs uppercase tracking-[2px] mb-3 px-2 font-semibold">
                  {section.category}
                </p>

                <div className="space-y-2">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                        ${
                          isActive
                            ? "bg-[#D9A066] text-[#2B1813] shadow-lg font-semibold"
                            : "text-[#F7F1E8] hover:bg-[#4B2E24]"
                        }`
                      }
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* LOGOUT */}
        <div className="pt-4 border-t border-[#5C3B2E] mt-4 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#EFC8C8] hover:bg-red-200/10 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* BACKDROP MOBILE */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
<main className="flex-1 p-6 md:p-10 mt-[75px] md:mt-0 overflow-y-auto bg-[#F7F1E8] h-screen">
          <div className="bg-white border border-[#EADFD2] rounded-3xl shadow-sm p-6 min-h-[calc(100vh-80px)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;