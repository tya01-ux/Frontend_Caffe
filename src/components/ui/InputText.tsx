import React, { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

interface InputTextProps {
  nama: string;
  type?: "text" | "email" | "password" | "tel";
  placeholder?: string;
  error?: string;
  register: any;
  icon?: LucideIcon;
}

export const InputText: React.FC<InputTextProps> = ({
  nama,
  type = "text",
  placeholder,
  error,
  register,
  icon: Icon,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Menentukan tipe input (khusus untuk switch password visibility)
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="w-full flex flex-col gap-1.5">
      
      {/* Wrapper Input */}
      <div className="relative flex items-center">
        
        {/* Kiri: Icon Utama */}
        {Icon && (
          <Icon
            size={18}
            className={`absolute left-4 transition-colors duration-200 ${
              error ? "text-red-400" : "text-[#A18E86]"
            }`}
          />
        )}

        {/* Tag Input */}
        <input
          id={nama}
          type={inputType}
          placeholder={placeholder}
          className={`
            w-full py-3.5 pr-4
            ${Icon ? "pl-12" : "pl-4"}
            ${isPassword ? "pr-12" : "pr-4"}
            bg-white border rounded-xl text-sm text-[#2B0F16] 
            placeholder-[#A18E86] transition-all duration-200
            focus:outline-none focus:ring-1
            ${
              error
                ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                : "border-[#E6DFDA] focus:border-[#5B1921] focus:ring-[#5B1921]"
            }
          `}
          {...register}
        />

        {/* Kanan: Tombol Show/Hide Password */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-[#A18E86] hover:text-[#5B1921] transition-colors duration-200 focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {/* Pesan Error (Muncul rapi di bawah input) */}
      {error && (
        <span className="text-xs font-medium text-red-500 pl-1">
          {error}
        </span>
      )}
    </div>
  );
};

export default InputText;