import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  X,
  Loader2,
  Building2,
  Users,
  Coffee,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { useTenantStore } from "../../../store/useTenantStore";
import type { TenantInput } from "../../../store/useTenantStore";

function getTenantCafes(tenant: any): any[] {
  return tenant?.cafe ?? tenant?.cafes ?? [];
}

const TenantsIndex: React.FC = () => {
  const {
    tenants,
    isLoading,
    error,
    fetchTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    clearError,
  } = useTenantStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit" | "detail">("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [formData, setFormData] = useState<TenantInput>({
    name: "",
    address: "",
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const openModal = (type: "create" | "edit" | "detail", id?: number) => {
    clearError();
    setModalType(type);

    if (type === "create") {
      setFormData({ name: "", address: "" });
      setSelectedId(null);
    }

    if (id) {
      const tenant = tenants.find((t) => t.id === id);
      if (tenant) {
        setSelectedId(id);
        setFormData({
          name: tenant.name,
          address: tenant.address || "",
        });
      }
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;

    if (modalType === "create") success = await createTenant(formData);
    if (modalType === "edit" && selectedId) success = await updateTenant(selectedId, formData);

    if (success) {
      setIsModalOpen(false);
    }
    // kalau gagal, modal tetap terbuka dan `error` dari store akan tampil di form
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Yakin hapus tenant "${name}"? Semua data terkait akan ikut terhapus.`)) {
      await deleteTenant(id);
    }
  };

  const filteredTenants = tenants.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTenant = selectedId ? tenants.find((t) => t.id === selectedId) : null;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#3E2C23] tracking-tight">Data Tenant</h1>
          <p className="text-[#8B735C] mt-2">Kelola semua tenant yang terdaftar di sistem CafeRank</p>
        </div>
        <button
          onClick={() => openModal("create")}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#8B5E3C] to-[#C8A27C] text-white font-semibold shadow-lg hover:scale-105 transition"
        >
          <Plus size={18} />
          Tambah Tenant
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E8DED5] rounded-[24px] p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF4E8] flex items-center justify-center">
            <Building2 size={22} className="text-[#C97A2B]" />
          </div>
          <div>
            <p className="text-xs text-[#8B735C] font-medium">Total Tenant</p>
            <p className="text-2xl font-black text-[#3E2C23]">{tenants.length}</p>
          </div>
        </div>
        <div className="bg-white border border-[#E8DED5] rounded-[24px] p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#F0FFF4] flex items-center justify-center">
            <Coffee size={22} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-[#8B735C] font-medium">Total Cafe</p>
            <p className="text-2xl font-black text-[#3E2C23]">
              {tenants.reduce((acc, t) => acc + getTenantCafes(t).length, 0)}
            </p>
          </div>
        </div>
        <div className="bg-white border border-[#E8DED5] rounded-[24px] p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center">
            <Users size={22} className="text-indigo-500" />
          </div>
          <div>
            <p className="text-xs text-[#8B735C] font-medium">Total User</p>
            <p className="text-2xl font-black text-[#3E2C23]">
              {tenants.reduce((acc, t) => acc + (t.user ? 1 : 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white/90 backdrop-blur-xl border border-[#E8DED5] rounded-[28px] p-6 shadow-[0_10px_40px_rgba(62,44,35,0.08)]">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B735C]" />
          <input
            type="text"
            placeholder="Cari tenant berdasarkan nama atau alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-4 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] outline-none focus:ring-2 focus:ring-[#C8A27C]"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-[#E8DED5] rounded-[30px] overflow-hidden shadow-[0_15px_40px_rgba(62,44,35,0.08)]">
        <div className="px-6 py-5 border-b border-[#F0E8DF] bg-gradient-to-r from-[#FAF8F5] to-white">
          <h2 className="font-bold text-[#3E2C23] text-lg">Daftar Tenant ({filteredTenants.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F4EF] text-[#6F4E37]">
                <th className="p-5 text-left">No</th>
                <th className="p-5 text-left">Nama Tenant</th>
                <th className="p-5 text-left">Alamat</th>
                <th className="p-5 text-center">Cafe</th>
                <th className="p-5 text-center">User</th>
                <th className="p-5 text-center">Kriteria</th>
                <th className="p-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Loader2 size={28} className="animate-spin mx-auto text-[#C8A27C]" />
                  </td>
                </tr>
              )}

              {!isLoading && filteredTenants.map((tenant, index) => (
                <tr key={tenant.id} className="border-b border-[#F4ECE4] hover:bg-[#FCFAF8] transition">
                  <td className="p-5 font-medium text-[#6F4E37]">{index + 1}</td>

                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8B5E3C] to-[#C8A27C] flex items-center justify-center text-white font-black text-sm shrink-0">
                        {tenant.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-[#3E2C23]">{tenant.name}</span>
                    </div>
                  </td>

                  <td className="p-5 text-[#6F4E37] text-sm">{tenant.address || "—"}</td>

                  <td className="p-5 text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF4E8] text-[#C97A2B] text-xs font-bold">
                      <Coffee size={12} />
                      {getTenantCafes(tenant).length}
                    </span>
                  </td>

                  <td className="p-5 text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EEF2FF] text-indigo-500 text-xs font-bold">
                      <Users size={12} />
                      {tenant.user ? 1 : 0}
                    </span>
                  </td>

                  <td className="p-5 text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F0FFF4] text-green-600 text-xs font-bold">
                      <ShieldCheck size={12} />
                      {tenant.criteria?.length || 0}
                    </span>
                  </td>

                  <td className="p-5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openModal("detail", tenant.id)}
                        className="w-10 h-10 rounded-xl bg-[#F8F4EF] flex items-center justify-center hover:bg-[#EDE2D5] transition"
                        title="Lihat Detail"
                      >
                        <Eye size={17} />
                      </button>
                      <button
                        onClick={() => openModal("edit", tenant.id)}
                        className="w-10 h-10 rounded-xl bg-[#FFF4E8] text-[#C97A2B] flex items-center justify-center hover:bg-[#FFE8CC] transition"
                        title="Edit"
                      >
                        <Edit2 size={17} />
                      </button>
                      <button
                        onClick={() => handleDelete(tenant.id, tenant.name)}
                        className="w-10 h-10 rounded-xl bg-[#FFF1F1] text-red-500 flex items-center justify-center hover:bg-[#FFE3E3] transition"
                        title="Hapus"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!isLoading && filteredTenants.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#8B735C]">
                    <Building2 size={36} className="mx-auto mb-3 opacity-20" />
                    <p>Tidak ada tenant ditemukan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0E8DF]">
              <h2 className="font-black text-[#3E2C23] text-xl">
                {modalType === "create" && "Tambah Tenant Baru"}
                {modalType === "edit" && "Edit Data Tenant"}
                {modalType === "detail" && "Detail Tenant"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-[#F8F4EF] flex items-center justify-center hover:bg-[#EDE2D5] transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* DETAIL MODE */}
            {modalType === "detail" && selectedTenant && (
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B5E3C] to-[#C8A27C] flex items-center justify-center text-white font-black text-2xl">
                    {selectedTenant.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#3E2C23]">{selectedTenant.name}</h3>
                    <p className="text-sm text-[#8B735C]">{selectedTenant.address || "Tidak ada alamat"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#FFF4E8] rounded-2xl p-4 text-center">
                    <Coffee size={18} className="mx-auto mb-1 text-[#C97A2B]" />
                    <p className="text-2xl font-black text-[#3E2C23]">{getTenantCafes(selectedTenant).length}</p>
                    <p className="text-xs text-[#8B735C] mt-0.5">Cafe</p>
                  </div>
                  <div className="bg-[#EEF2FF] rounded-2xl p-4 text-center">
                    <Users size={18} className="mx-auto mb-1 text-indigo-500" />
                    <p className="text-2xl font-black text-[#3E2C23]">{selectedTenant.user ? 1 : 0}</p>
                    <p className="text-xs text-[#8B735C] mt-0.5">User</p>
                  </div>
                  <div className="bg-[#F0FFF4] rounded-2xl p-4 text-center">
                    <ShieldCheck size={18} className="mx-auto mb-1 text-green-600" />
                    <p className="text-2xl font-black text-[#3E2C23]">{selectedTenant.criteria?.length || 0}</p>
                    <p className="text-xs text-[#8B735C] mt-0.5">Kriteria</p>
                  </div>
                </div>

                {getTenantCafes(selectedTenant).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">Daftar Cafe</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {getTenantCafes(selectedTenant).map((cafe: any) => (
                        <div key={cafe.id} className="flex items-center gap-3 p-3 bg-[#FAF8F5] rounded-xl">
                          <Coffee size={14} className="text-[#C8A27C] shrink-0" />
                          <span className="text-sm text-[#3E2C23] font-medium">{cafe.name}</span>
                          <span className="ml-auto text-xs text-[#8B735C]">{cafe.lokasi || "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-3 rounded-2xl bg-[#F8F4EF] text-[#3E2C23] font-bold hover:bg-[#EDE2D5] transition"
                >
                  Tutup
                </button>
              </div>
            )}

            {/* CREATE / EDIT MODE */}
            {(modalType === "create" || modalType === "edit") && (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">
                    Nama Tenant *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Slawi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] text-sm outline-none focus:ring-2 focus:ring-[#C8A27C]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">
                    Alamat Tenant
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Jl. Ahmad Yani No. 10, Slawi"
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] text-sm outline-none focus:ring-2 focus:ring-[#C8A27C]"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">⚠ {error}</p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-2xl border border-[#E8DED5] text-[#6F4E37] font-semibold hover:bg-[#F8F4EF] transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#8B5E3C] to-[#C8A27C] text-white font-semibold shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                    {modalType === "create" ? "Simpan Tenant" : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantsIndex;