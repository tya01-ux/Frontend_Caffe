import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, Phone } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { InputText } from "../components/ui/InputText";

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleBuildRegister = (name: keyof typeof form) => ({
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        [name]: e.target.value,
      }));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await register(form);

      alert("Register berhasil!");
      navigate("/login");
    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan saat mendaftar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        relative
        min-h-screen
        bg-cover
        bg-center
        flex
        items-center
        justify-center
        px-4
        py-6
        overflow-hidden
      "
      style={{
        backgroundImage: `url('/background1.png')`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#2B0F16]/70" />

      {/* Glow */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#5B1921]/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#D8B08C]/20 rounded-full blur-3xl" />

      {/* ================= CARD ================= */}
      <div className="relative z-10 w-full max-w-[480px]">
        <div
          className="
            relative
            overflow-hidden
            rounded-[34px]
            border border-white/15
            bg-gradient-to-b
            from-white/15
            to-white/5
            backdrop-blur-3xl
            shadow-[0_25px_80px_rgba(0,0,0,0.45)]
            px-8
            py-6
            sm:px-10
            sm:py-7
          "
        >
          {/* Glow Dalam */}
          <div className="absolute -top-20 -right-16 w-44 h-44 bg-[#D8B08C]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-16 w-44 h-44 bg-[#5B1921]/30 rounded-full blur-3xl" />

          {/* Isi */}
          <div className="relative z-10">
            
        {/* ================= LOGO ================= */}
        <div className="flex flex-col items-center text-center mb-5">
        {/* Logo Image */}
        <img
            src="/logo.png"
            alt="CafeRank Logo"
            className="
            relative
            w-28 h-28
            sm:w-32 sm:h-32
            md:w-40 md:h-40
            object-contain
            drop-shadow-[0_15px_35px_rgba(249,115,22,0.55)]
            "
        />
        </div>

            {/* ================= TITLE ================= */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white">
                Create Account
              </h2>

              <p className="mt-1 text-sm text-white/70">
                Daftar untuk mulai menggunakan CafeRank
              </p>
            </div>

            {/* ================= FORM ================= */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Nama */}
              <div>
                <div className="mb-1.5 text-sm font-medium text-white/70">
                  Nama Lengkap
                </div>

                <InputText
                  nama="name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  icon={User}
                  register={handleBuildRegister("name")}
                />
              </div>

              {/* Email */}
              <div>
                <div className="mb-1.5 text-sm font-medium text-white/70">
                  Email
                </div>

                <InputText
                  nama="email"
                  type="email"
                  placeholder="Masukkan email"
                  icon={Mail}
                  register={handleBuildRegister("email")}
                />
              </div>

              {/* Phone */}
              <div>
                <div className="mb-1.5 text-sm font-medium text-white/70">
                  Nomor HP
                </div>

                <InputText
                  nama="phone"
                  type="text"
                  placeholder="Masukkan nomor HP"
                  icon={Phone}
                  register={handleBuildRegister("phone")}
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 text-sm font-medium text-white/70">
                  Password
                </div>

                <InputText
                  nama="password"
                  type="password"
                  placeholder="Masukkan password"
                  icon={Lock}
                  register={handleBuildRegister("password")}
                />
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  h-13
                  mt-2
                  rounded-2xl
                  bg-[#5B1921]
                  hover:bg-[#431218]
                  text-white
                  font-bold
                  tracking-wide
                  transition-all
                  duration-300
                  shadow-xl
                  shadow-black/20
                  hover:scale-[1.01]
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                "
              >
                {loading ? "Mendaftarkan..." : "Register Sekarang"}
              </button>
            </form>

            {/* ================= DIVIDER ================= */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/10" />

              <span className="text-[11px] text-white/50 whitespace-nowrap">
                atau daftar dengan
              </span>

              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* ================= SOCIAL ================= */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* Google */}
              <button
                type="button"
                className="
                  h-12
                  rounded-2xl
                  bg-white/10
                  border border-white/15
                  hover:bg-white/15
                  transition
                  flex items-center
                  justify-center
                  gap-2
                  text-white
                  text-sm
                  font-medium
                  backdrop-blur-md
                "
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />

                Google
              </button>

              {/* Facebook */}
              <button
                type="button"
                className="
                  h-12
                  rounded-2xl
                  bg-white/10
                  border border-white/15
                  hover:bg-white/15
                  transition
                  flex items-center
                  justify-center
                  gap-2
                  text-white
                  text-sm
                  font-medium
                  backdrop-blur-md
                "
              >
                <img
                  src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                  alt="Facebook"
                  className="w-5 h-5"
                />

                Facebook
              </button>
            </div>

            {/* ================= FOOTER ================= */}
            <div className="mt-6 space-y-3">
              
              <p className="text-center text-sm text-white/70">
                Sudah punya akun?{" "}

                <Link
                  to="/login"
                  className="
                    font-bold
                    text-[#F6D4B5]
                    hover:underline
                  "
                >
                  Login sekarang
                </Link>
              </p>

              <div className="flex justify-center">
                <Link
                  to="/"
                  className="
                    group
                    flex
                    items-center
                    gap-2
                    text-sm
                    text-white/60
                    hover:text-white
                    transition
                  "
                >
                  <span
                    className="
                      transition-transform
                      duration-300
                      group-hover:-translate-x-1
                    "
                  >
                    ←
                  </span>

                  Kembali ke Dashboard
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;