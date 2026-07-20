import React from "react";
import { Coffee } from "lucide-react";

const ProfileIndex: React.FC = () => {
  return (
    <div className="w-full min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      {/* CARD KOTAK UTAMA */}
      <div className="relative w-full max-w-xl bg-white border border-[#5B2333]/10 rounded-[32px] p-10 md:p-12 shadow-[0_20px_50px_rgba(43,15,22,0.04)] overflow-hidden text-center group">
        {/* Aksen Glow Mewah di Background Belakang Card */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#F59E0B]/10 rounded-full blur-3xl transition-all duration-500 group-hover:bg-[#F59E0B]/20" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#8B1E3F]/5 rounded-full blur-3xl transition-all duration-500 group-hover:bg-[#8B1E3F]/10" />

        <div className="flex flex-col items-center space-y-6">
          
          {/* Ornamen Lingkaran Ikon */}
          <div className="w-16 h-16 rounded-2xl bg-[#2B0F16]/5 flex items-center justify-center border border-[#2B0F16]/10 shadow-inner text-[#8B1E3F] transition-transform duration-300 group-hover:rotate-12">
            <Coffee size={28} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-serif font-black tracking-tight text-[#2B0F16]">
              Profil nya kita euyy
            </h1>
          </div>
          {/* Garis Pembagi Ornamen Tengah */}
          <div className="w-16 h-[2px] bg-gradient-to-r from-[#8B1E3F]/20 via-[#F59E0B] to-[#F59E0B]/20 rounded-full" />
        </div>
      </div>

    </div>
  );
};

export default ProfileIndex;