import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { useAuthStore } from "../store/authStore"; 
import { InputText } from "../components/ui/InputText";
import { InputPassword } from "../components/ui/InputPassword";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login); 

  const registerEmail = {
    value: email,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
  };

  const registerPassword = {
    value: password,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await loginAction({ email, password });
      
      alert(`Login berhasil! Selamat datang, ${user.name}`);
      
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }

    } catch (err: any) {
      // Menangkap pesan error yang dikirim oleh Express backend
      setError(err.message || "Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center px-6 py-10 overflow-hidden"
      style={{ backgroundImage: `url('/background1.png')` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#2B0F16]/70" />

      {/* Glow Effect */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#5B1921]/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D8B08C]/20 rounded-full blur-3xl" />

      {/* ================= LOGIN CARD ================= */}
      <div className="relative z-10 w-full max-w-[560px]">
        <div className="relative overflow-hidden rounded-[40px] border border-white/20 bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-3xl shadow-[0_25px_100px_rgba(0,0,0,0.45)] px-10 py-8 sm:px-14 sm:py-10 transition-all duration-500">
          
          <div className="absolute -top-24 -right-20 w-56 h-56 bg-[#D8B08C]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-20 w-56 h-56 bg-[#5B1921]/30 rounded-full blur-3xl" />

          <div className="relative z-10">
            
            {/* Logo */}
            <div className="flex flex-col items-center text-center mb-6">
              <img
                src="/logo.png"
                alt="CafeRank Logo"
                className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 object-contain drop-shadow-[0_12px_30px_rgba(249,115,22,0.5)]"
              />
            </div>

            {/* Welcome Text */}
            <div className="text-center mb-6">
              <h2 className="text-4xl font-bold text-white">Welcome Back</h2>
              <p className="mt-2 text-sm text-white/70">Login untuk melanjutkan perjalanan kopimu</p>
            </div>

            {/* Alert Error Box */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 text-red-200 text-xs text-center rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* EMAIL */}
              <div>
                <div className="mb-2 text-sm font-medium text-white/70">Email</div>
                <InputText
                  nama="email"
                  type="email"
                  placeholder="Masukkan email"
                  icon={Mail}
                  register={registerEmail}
                />
              </div>

              {/* PASSWORD */}
              <div>
                <div className="mb-2 text-sm font-medium text-white/70">Password</div>
                <InputPassword
                  nama="password"
                  placeholder="Masukkan password"
                  register={registerPassword}
                />

                <div className="flex justify-end mt-2">
                  <Link to="/forgot-password" className="text-xs text-[#F6D4B5] hover:text-white transition hover:underline">
                    Lupa password?
                  </Link>
                </div>
              </div>

              {/* Remember Checkbox */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-white/70 cursor-pointer">
                  <input type="checkbox" className="rounded border-white/20 bg-transparent text-[#5B1921] focus:ring-0" />
                  Ingat saya
                </label>
              </div>

              {/* BUTTON LOGIN */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-[#5B1921] hover:bg-[#431218] text-white font-bold tracking-wide transition-all duration-300 shadow-xl shadow-black/20 hover:scale-[1.01] flex items-center justify-center disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Login Sekarang"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-7">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/50">atau masuk dengan</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="h-14 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition flex items-center justify-center gap-3 text-white font-medium backdrop-blur-md">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                Google
              </button>
              <button type="button" className="h-14 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition flex items-center justify-center gap-3 text-white font-medium backdrop-blur-md">
                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5" />
                Facebook
              </button>
            </div>

            {/* Link Footer Navigasi */}
            <div className="mt-7 space-y-4">
              <p className="text-center text-sm text-white/70">
                Belum punya akun?{" "}
                <Link to="/register" className="font-bold text-[#F6D4B5] hover:underline">
                  Daftar sekarang
                </Link>
              </p>
              <div className="flex justify-center">
                <Link to="/" className="group flex items-center gap-2 text-sm text-white/60 hover:text-white transition">
                  <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
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

export default Login;