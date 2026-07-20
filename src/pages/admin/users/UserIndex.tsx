import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  X,
  Loader2,
  Users,
  ShieldCheck,
  UserCircle,
  Phone,
  Mail,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUserStore } from "../../../store/useUserStore";
import UserCreateModal from "./UserCreate";
import UserEditModal from "./UserEdit";

type RoleType = "ADMIN" | "USER";

const ROLE_COLOR: Record<RoleType, string> = {
  ADMIN: "bg-[#FFF4E8] text-[#C97A2B] border-[#F0D5B0]",
  USER: "bg-blue-50 text-blue-700 border-blue-200",
};

const PER_PAGE = 8;

const UserIndex: React.FC = () => {
  const { users, isLoading, fetchUsers, deleteUser } = useUserStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"" | RoleType>("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterRole]);

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Yakin hapus user "${name}"?`)) {
      await deleteUser(id);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = filterRole === "" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  // PAGINATION
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  const selectedUser = selectedId ? users.find((u) => u.id === selectedId) : null;

  const totalAdmin = users.filter((u) => u.role === "ADMIN").length;
  const totalUser = users.filter((u) => u.role === "USER").length;

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#3E2C23] tracking-tight">Data User</h1>
          <p className="text-[#8B735C] mt-2">Kelola akun pengguna yang terdaftar dalam sistem</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#8B5E3C] to-[#C8A27C] text-white font-semibold shadow-lg hover:scale-105 transition"
        >
          <Plus size={18} />
          Tambah User
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E8DED5] rounded-[24px] p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF4E8] flex items-center justify-center">
            <Users size={22} className="text-[#C97A2B]" />
          </div>
          <div>
            <p className="text-xs text-[#8B735C] font-medium">Total User</p>
            <p className="text-2xl font-black text-[#3E2C23]">{users.length}</p>
          </div>
        </div>
        <div className="bg-white border border-[#E8DED5] rounded-[24px] p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF4E8] flex items-center justify-center">
            <ShieldCheck size={22} className="text-[#C97A2B]" />
          </div>
          <div>
            <p className="text-xs text-[#8B735C] font-medium">Admin</p>
            <p className="text-2xl font-black text-[#3E2C23]">{totalAdmin}</p>
          </div>
        </div>
        <div className="bg-white border border-[#E8DED5] rounded-[24px] p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
            <UserCircle size={22} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-[#8B735C] font-medium">User</p>
            <p className="text-2xl font-black text-[#3E2C23]">{totalUser}</p>
          </div>
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-white/90 backdrop-blur-xl border border-[#E8DED5] rounded-[28px] p-6 shadow-[0_10px_40px_rgba(62,44,35,0.08)]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B735C]" />
            <input
              type="text"
              placeholder="Cari nama atau email user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-4 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] outline-none focus:ring-2 focus:ring-[#C8A27C]"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as "" | RoleType)}
            className="px-5 py-4 rounded-2xl border border-[#E8DED5] bg-[#FAF8F5] min-w-[180px] outline-none focus:ring-2 focus:ring-[#C8A27C]"
          >
            <option value="">Semua Role</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-[#E8DED5] rounded-[30px] overflow-hidden shadow-[0_15px_40px_rgba(62,44,35,0.08)]">
        <div className="px-6 py-5 border-b border-[#F0E8DF] bg-gradient-to-r from-[#FAF8F5] to-white">
          <h2 className="font-bold text-[#3E2C23] text-lg">Daftar User ({filtered.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F4EF] text-[#6F4E37] text-sm">
                <th className="p-5 text-left">No</th>
                <th className="p-5 text-left">Nama</th>
                <th className="p-5 text-left">Email</th>
                <th className="p-5 text-left">No HP</th>
                <th className="p-5 text-center">Role</th>
                <th className="p-5 text-left">Tenant</th>
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

              {!isLoading && paginated.map((user, index) => (
                <tr key={user.id} className="border-b border-[#F4ECE4] hover:bg-[#FCFAF8] transition">
                  <td className="p-5 font-medium text-[#6F4E37]">
                    {(currentPage - 1) * PER_PAGE + index + 1}
                  </td>

                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5E3C] to-[#C8A27C] flex items-center justify-center shrink-0">
                        <span className="text-white font-black text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className="font-bold text-[#3E2C23]">{user.name}</p>
                    </div>
                  </td>

                  <td className="p-5 text-sm text-[#6F4E37]">{user.email}</td>

                  <td className="p-5 text-sm text-[#8B735C]">{user.phone || "—"}</td>

                  <td className="p-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${ROLE_COLOR[user.role as RoleType]}`}>
                      {user.role}
                    </span>
                  </td>

                  <td className="p-5">
                    {user.tenants && user.tenants.length > 0 ? (
                      <span className="flex items-center gap-1.5 text-sm text-[#6F4E37]">
                        <Building2 size={14} className="text-[#C8A27C]" />
                        {user.tenants.length === 1
                          ? user.tenants[0].name
                          : `${user.tenants.length} tenant`}
                      </span>
                    ) : (
                      <span className="text-sm text-[#C8A27C] italic">—</span>
                    )}
                  </td>

                  <td className="p-5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { setSelectedId(user.id); setIsDetailOpen(true); }}
                        className="w-10 h-10 rounded-xl bg-[#F8F4EF] flex items-center justify-center hover:bg-[#EDE2D5] transition"
                      >
                        <Eye size={17} />
                      </button>
                      <button
                        onClick={() => { setSelectedId(user.id); setIsEditOpen(true); }}
                        className="w-10 h-10 rounded-xl bg-[#FFF4E8] text-[#C97A2B] flex items-center justify-center hover:bg-[#FFE8CC] transition"
                      >
                        <Edit2 size={17} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="w-10 h-10 rounded-xl bg-[#FFF1F1] text-red-500 flex items-center justify-center hover:bg-[#FFE3E3] transition"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#8B735C]">
                    <Users size={36} className="mx-auto mb-3 opacity-20" />
                    <p>Tidak ada user ditemukan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#F0E8DF] bg-[#FAF8F5] flex items-center justify-between">
            <p className="text-sm text-[#8B735C]">
              Halaman{" "}
              <span className="font-black text-[#3E2C23]">{currentPage}</span>
              {" "}dari{" "}
              <span className="font-black text-[#3E2C23]">{totalPages}</span>
              {" "}·{" "}
              <span className="font-black text-[#3E2C23]">
                {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)}
              </span>{" "}
              dari {filtered.length} user
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#E8DED5] text-sm font-semibold text-[#6F4E37] hover:bg-[#F8F4EF] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5E3C] to-[#C8A27C] text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Selanjutnya
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CREATE */}
      {isCreateOpen && (
        <UserCreateModal onClose={() => setIsCreateOpen(false)} />
      )}

      {/* MODAL EDIT */}
      {isEditOpen && selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => { setIsEditOpen(false); setSelectedId(null); }}
        />
      )}

      {/* MODAL DETAIL */}
      {isDetailOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0E8DF]">
              <h2 className="font-black text-[#3E2C23] text-xl">Detail User</h2>
              <button
                onClick={() => { setIsDetailOpen(false); setSelectedId(null); }}
                className="w-9 h-9 rounded-xl bg-[#F8F4EF] flex items-center justify-center hover:bg-[#EDE2D5] transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B5E3C] to-[#C8A27C] flex items-center justify-center text-white font-black text-2xl shrink-0">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#3E2C23]">{selectedUser.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${ROLE_COLOR[selectedUser.role as RoleType]}`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 px-4 py-3 bg-[#FAF8F5] rounded-2xl border border-[#E8DED5]">
                  <Mail size={16} className="text-[#C8A27C] shrink-0" />
                  <div>
                    <p className="text-[10px] text-[#8B735C] font-semibold uppercase tracking-wider">Email</p>
                    <p className="text-sm font-bold text-[#3E2C23]">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3 bg-[#FAF8F5] rounded-2xl border border-[#E8DED5]">
                  <Phone size={16} className="text-[#C8A27C] shrink-0" />
                  <div>
                    <p className="text-[10px] text-[#8B735C] font-semibold uppercase tracking-wider">No HP</p>
                    <p className="text-sm font-bold text-[#3E2C23]">{selectedUser.phone || "—"}</p>
                  </div>
                </div>

                <div className="px-4 py-3 bg-[#FAF8F5] rounded-2xl border border-[#E8DED5]">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 size={16} className="text-[#C8A27C] shrink-0" />
                    <p className="text-[10px] text-[#8B735C] font-semibold uppercase tracking-wider">
                      Tenant Dimiliki ({selectedUser.tenants?.length || 0})
                    </p>
                  </div>
                  {selectedUser.tenants && selectedUser.tenants.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedUser.tenants.map((t) => (
                        <span
                          key={t.id}
                          className="px-2.5 py-1 rounded-full text-xs font-bold bg-white border border-[#E8DED5] text-[#3E2C23]"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#C8A27C] italic">Belum punya tenant</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-[#8B735C]">
                  <div className="px-4 py-3 bg-[#FAF8F5] rounded-2xl border border-[#E8DED5]">
                    <p className="font-bold uppercase tracking-wider mb-0.5">Dibuat</p>
                    <p>{new Date(selectedUser.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                  <div className="px-4 py-3 bg-[#FAF8F5] rounded-2xl border border-[#E8DED5]">
                    <p className="font-bold uppercase tracking-wider mb-0.5">Diperbarui</p>
                    <p>{new Date(selectedUser.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { setIsDetailOpen(false); setSelectedId(null); }}
                className="w-full py-3 rounded-2xl bg-[#F8F4EF] text-[#3E2C23] font-bold hover:bg-[#EDE2D5] transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserIndex;