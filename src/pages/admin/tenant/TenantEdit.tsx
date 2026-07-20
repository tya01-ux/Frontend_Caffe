import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Building2, MapPin, Coffee, Users, ShieldCheck } from "lucide-react";
import { useTenantStore } from "../../../store/useTenantStore";

const TenantsEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { tenants, updateTenant, fetchTenants, isLoading, error } = useTenantStore();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });

  useEffect(() => {
    if (tenants.length === 0) fetchTenants();
  }, [tenants, fetchTenants]);

  useEffect(() => {
    if (id && tenants.length > 0) {
      const target = tenants.find((t) => t.id === Number(id));
      if (target) {
        setFormData({
          name: target.name,
          address: target.address || "",
        });
      }
    }
  }, [id, tenants]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const success = await updateTenant(Number(id), formData);
    if (success) {
      alert("Data tenant berhasil diperbarui ✨");
      navigate("/admin/tenants");
    }
  };

  const currentTenant = id ? tenants.find((t) => t.id === Number(id)) : null;

  return (
    <div className="w-full space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/tenants")}
          className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-[#3E2C23] transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-black text-[#3E2C23]">
            Ubah Data Tenant
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Perbarui informasi tenant yang terdaftar di sistem.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl font-semibold text-sm">
          ⚠ Terjadi Kesalahan: {error}
        </div>
      )}

      {currentTenant && (
        <div className="bg-white border border-[#E8DED5] rounded-[24px] p-5 shadow-sm">
          <p className="text-xs font-bold text-[#8B735C] uppercase tracking-wider mb-3">
            Ringkasan Data Tenant
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#FFF4E8] rounded-2xl p-3 text-center">
              <Coffee size={16} className="mx-auto mb-1 text-[#C97A2B]" />
              <p className="text-xl font-black text-[#3E2C23]">{currentTenant.cafes?.length || 0}</p>
              <p className="text-xs text-[#8B735C]">Cafe</p>
            </div>
            <div className="bg-[#EEF2FF] rounded-2xl p-3 text-center">
              <Users size={16} className="mx-auto mb-1 text-indigo-500" />
              <p className="text-xl font-black text-[#3E2C23]">{currentTenant.user ? 1 : 0}</p>
              <p className="text-xs text-[#8B735C]">User</p>
            </div>
            <div className="bg-[#F0FFF4] rounded-2xl p-3 text-center">
              <ShieldCheck size={16} className="mx-auto mb-1 text-green-600" />
              <p className="text-xl font-black text-[#3E2C23]">{currentTenant.criteria?.length || 0}</p>
              <p className="text-xs text-[#8B735C]">Kriteria</p>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#E8DED5] rounded-[28px] p-6 md:p-8 shadow-[0_10px_30px_rgba(62,44,35,0.06)] space-y-6"
      >
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#3E2C23] border-b border-gray-100 pb-2">
            🏢 Informasi Tenant
          </h3>

          <div className="flex items-center gap-4 p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8DED5]">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B5E3C] to-[#C8A27C] flex items-center justify-center text-white font-black text-xl shrink-0">
              {formData.name ? formData.name.charAt(0).toUpperCase() : <Building2 size={22} />}
            </div>
            <div>
              <p className="font-bold text-[#3E2C23] text-lg">
                {formData.name || <span className="text-[#C8A27C] font-normal italic">Nama tenant...</span>}
              </p>
              <p className="text-sm text-[#8B735C]">{formData.address || "Alamat tenant"}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">Nama Tenant *</label>
            <div className="relative">
              <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Contoh: PT. Kopi Nusantara"
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C8A27C] focus:ring-1 focus:ring-[#C8A27C] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">Alamat Tenant</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Contoh: Kota Semarang"
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C8A27C] focus:ring-1 focus:ring-[#C8A27C] transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate("/admin/tenants")}
            className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#8B5E3C] to-[#C8A27C] text-white rounded-xl font-bold text-sm hover:opacity-90 shadow-md transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default TenantsEdit;