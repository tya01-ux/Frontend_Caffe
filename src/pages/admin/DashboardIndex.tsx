import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Coffee,
  ClipboardList,
  TrendingUp,
  Eye,
  Edit2,
  Trash2,
  UserPlus,
} from "lucide-react";

import { useTenantStore } from "../../store/useTenantStore";
import { useCafeStore } from "../../store/useCaffeStore";
import { useCriteriaStore } from "../../store/useCriteriaStore";
import { useActivityLogStore } from "../../store/useActivityLogStore";

const ACTIVITY_ICON_MAP = {
  cafe: { bg: "bg-[#FFF4E8]", color: "text-[#C97A2B]", Icon: Coffee },
  calc: { bg: "bg-blue-50", color: "text-blue-500", Icon: TrendingUp },
  edit: { bg: "bg-amber-50", color: "text-amber-500", Icon: Edit2 },
  delete: { bg: "bg-red-50", color: "text-red-400", Icon: Trash2 },
  tenant: { bg: "bg-emerald-50", color: "text-emerald-500", Icon: Building2 },
} as const;

type ActivityIconKey = keyof typeof ACTIVITY_ICON_MAP;

function getActivityIcon(entityType: string, action: string): ActivityIconKey {
  const a = action?.toUpperCase();
  const e = entityType?.toLowerCase();

  if (a === "DELETE") return "delete";
  if (a === "UPDATE") return "edit";
  if (e?.includes("tenant")) return "tenant";
  if (e?.includes("spk") || e?.includes("calc") || e?.includes("rekomendasi")) return "calc";
  return "cafe";
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function actionLabel(action: string, entityType: string): string {
  const a = action?.toUpperCase();
  if (a === "CREATE") return `${entityType} baru ditambahkan`;
  if (a === "UPDATE") return `${entityType} diperbarui`;
  if (a === "DELETE") return `${entityType} dihapus`;
  return `${entityType} ${action}`;
}

const DashboardIndex: React.FC = () => {
  const [initialLoading, setInitialLoading] = useState(true);

  const { tenants, fetchTenants } = useTenantStore();
  const { cafes, fetchCafes } = useCafeStore();
  const { criterias, fetchCriterias } = useCriteriaStore();
  const { logs, fetchAllLogs } = useActivityLogStore();

  useEffect(() => {
    const loadAll = async () => {
      setInitialLoading(true);
      await Promise.all([
        fetchTenants(),
        fetchCafes(),
        fetchCriterias(),
        fetchAllLogs({ limit: 8 }),
      ]);
      setInitialLoading(false);
    };
    loadAll();
  }, [fetchTenants, fetchCafes, fetchCriterias, fetchAllLogs]);

  const recentCafes = useMemo(() => {
    return [...cafes]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        name: c.name,
        tenant: c.tenant?.name || "—",
        lokasi: c.lokasi || c.address || "—",
      }));
  }, [cafes]);

  const activities = useMemo(() => {
    return logs.slice(0, 6).map((log) => ({
      id: log.id,
      icon: getActivityIcon(log.entityType, log.action),
      title: log.description || actionLabel(log.action, log.entityType),
      subtitle: log.user?.name ? `oleh ${log.user.name}` : log.entityType,
      time: formatRelativeTime(log.createdAt),
    }));
  }, [logs]);

  const loading = initialLoading;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-black text-[#3E2C23] tracking-tight">Dashboard</h1>
        <p className="text-[#8B735C] mt-2">Selamat datang kembali, Admin! Berikut ringkasan sistem hari ini.</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Building2 size={22} className="text-[#8B5E3C]" />}
          iconBg="bg-[#F1E9DF]"
          label="Total Tenant"
          value={loading ? "..." : tenants.length}
          desc="Tenant terdaftar"
        />
        <StatCard
          icon={<Coffee size={22} className="text-[#C97A2B]" />}
          iconBg="bg-[#FFF4E8]"
          label="Total Cafe"
          value={loading ? "..." : cafes.length}
          desc="Cafe terdaftar"
        />
        <StatCard
          icon={<ClipboardList size={22} className="text-[#5B8C9A]" />}
          iconBg="bg-[#EAF3F5]"
          label="Total Kriteria"
          value={loading ? "..." : criterias.length}
          desc="Kriteria terdaftar"
        />
      </div>

      {/* TABLE + SIDE PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT CAFES */}
        <div className="bg-white border border-[#E8DED5] rounded-[28px] overflow-hidden shadow-sm lg:col-span-2">
          <div className="px-6 py-5 border-b border-[#F0E8DF] bg-gradient-to-r from-[#FAF8F5] to-white flex items-center justify-between">
            <h2 className="font-bold text-[#3E2C23]">Data Cafe Terbaru</h2>
            <button className="text-xs font-bold text-[#C97A2B] bg-[#FFF4E8] px-3 py-1.5 rounded-full hover:bg-[#FFE8CC] transition">
              Lihat semua
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F4EF] text-[#6F4E37] text-xs">
                  <th className="p-4 text-left">No</th>
                  <th className="p-4 text-left">Nama Cafe</th>
                  <th className="p-4 text-left">Tenant</th>
                  <th className="p-4 text-left">Lokasi</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#8B735C] text-sm">Memuat data...</td>
                  </tr>
                )}
                {!loading && recentCafes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#8B735C] text-sm">
                      <Coffee size={28} className="mx-auto mb-2 opacity-20" />
                      <p>Belum ada data cafe.</p>
                    </td>
                  </tr>
                )}
                {!loading && recentCafes.map((cafe, i) => (
                  <tr key={cafe.id} className="border-b border-[#F4ECE4] hover:bg-[#FCFAF8] transition">
                    <td className="p-4 text-sm font-medium text-[#6F4E37]">{i + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5E3C] to-[#C8A27C] flex items-center justify-center shrink-0">
                          <Coffee size={15} className="text-white" />
                        </div>
                        <span className="font-bold text-sm text-[#3E2C23]">{cafe.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[#6F4E37]">{cafe.tenant}</td>
                    <td className="p-4 text-sm text-[#8B735C]">{cafe.lokasi}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button className="w-8 h-8 rounded-lg bg-[#F8F4EF] flex items-center justify-center hover:bg-[#EDE2D5] transition">
                          <Eye size={14} />
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-[#FFF4E8] text-[#C97A2B] flex items-center justify-center hover:bg-[#FFE8CC] transition">
                          <Edit2 size={14} />
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-[#FFF1F1] text-red-500 flex items-center justify-center hover:bg-[#FFE3E3] transition">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ACTIVITY PANEL */}
        <div className="bg-white border border-[#E8DED5] rounded-[28px] p-6 shadow-sm">
          <h2 className="font-bold text-[#3E2C23] mb-4">Aktivitas Terakhir</h2>
          {loading ? (
            <div className="py-10 text-center text-[#8B735C] text-sm">Memuat aktivitas...</div>
          ) : activities.length === 0 ? (
            <div className="py-10 text-center text-[#8B735C] text-sm">
              <UserPlus size={28} className="mx-auto mb-2 opacity-20" />
              <p>Belum ada aktivitas tercatat.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((act) => {
                const cfg = ACTIVITY_ICON_MAP[act.icon];
                const Icon = cfg.Icon;
                return (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={15} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#3E2C23] truncate">{act.title}</p>
                      <p className="text-xs text-[#8B735C] truncate">{act.subtitle}</p>
                    </div>
                    <span className="text-xs text-[#C8A27C] font-semibold shrink-0">{act.time}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* INFO BLOCK
      <div className="bg-[#FAF6F0] p-6 rounded-[28px] border border-[#F0E8DF] space-y-2">
        <h3 className="font-bold text-sm text-[#3E2C23] flex items-center gap-2">
          <ClipboardList size={15} className="text-[#C97A2B]" />
          Catatan Metode SPK (SAW / WP / TOPSIS)
        </h3>
        <p className="text-xs text-[#8B735C] leading-relaxed max-w-3xl">
          Sistem ini mendukung 3 metode perhitungan:{" "}
          <strong className="text-[#6F4E37]">Simple Additive Weighting (SAW)</strong>,{" "}
          <strong className="text-[#6F4E37]">Weighted Product (WP)</strong>, dan{" "}
          <strong className="text-[#6F4E37]">TOPSIS</strong>. Pastikan setiap kriteria memiliki tipe (COST/BENEFIT) dan
          bobot yang tepat sebelum melakukan perhitungan, agar hasil normalisasi matriks tetap valid.
        </p>
      </div> */}
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
  desc: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, iconBg, label, value, desc }) => (
  <div className="bg-white border border-[#E8DED5] rounded-[24px] p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition">
    <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-[#8B735C] font-medium">{label}</p>
      <p className="text-2xl font-black text-[#3E2C23] mt-0.5">{value}</p>
      <p className="text-[10px] text-[#C8A27C] font-semibold">{desc}</p>
    </div>
  </div>
);

export default DashboardIndex;