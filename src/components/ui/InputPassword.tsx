import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface InputPasswordProps {
  nama: string;
  placeholder?: string;
  error?: string;
  register: any;
}

export const InputPassword: React.FC<InputPasswordProps> = ({
  nama,
  placeholder = "Password",
  error,
  register,
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className="w-full flex flex-col gap-1.5">
      
      {/* Wrapper Input */}
      <div className="relative flex items-center">
        
        {/* Kiri: Icon Lock Gembok */}
        <Lock
          size={18}
          className={`absolute left-4 transition-colors duration-200 ${
            error ? "text-red-400" : "text-[#A18E86]"
          }`}
        />

        {/* Input Tag */}
        <input
          id={nama}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className={`
            w-full py-3.5 pl-12 pr-12
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

        {/* Kanan: Tombol Mata (Show/Hide) */}
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 text-[#A18E86] hover:text-[#5B1921] transition-colors duration-200 focus:outline-none"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Pesan Error di Bawah Input */}
      {error && (
        <span className="text-xs font-medium text-red-500 pl-1">
          {error}
        </span>
      )}
    </div>
  );
};

export default InputPassword;