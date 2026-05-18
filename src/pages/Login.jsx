import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: Tambahkan validasi Firebase Auth di sini jika sudah siap
    
    // Sementara langsung navigasi ke Dashboard Web Admin
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F4F7FE]">
      <div className="w-[450px] p-10 bg-white rounded-[20px] shadow-md">
        {/* Logo / Ikon Admin */}
        <div className="flex justify-center">
          <div className="p-4 bg-[#214E8A]/10 rounded-full">
            <ShieldCheck size={50} className="text-[#214E8A]" />
          </div>
        </div>

        {/* Judul */}
        <h2 className="text-center text-[26px] font-bold text-[#2B3674] mt-5">
          Login Admin
        </h2>
        <p className="text-center text-sm text-gray-400 mt-2">
          Masukkan kredensial Anda untuk mengakses dashboard manajemen.
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-10 space-y-5">
          {/* Input Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Email / Username
            </label>
            <input
              type="email"
              placeholder="admin@homecareku.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 text-sm bg-[#F4F7FE] rounded-xl outline-none border-none focus:ring-2 focus:ring-[#214E8A]/20"
              required
            />
          </div>

          {/* Input Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={isPasswordVisible ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 text-sm bg-[#F4F7FE] rounded-xl outline-none border-none focus:ring-2 focus:ring-[#214E8A]/20"
                required
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Lupa Password */}
          <div className="text-right">
            <button type="button" className="text-sm font-medium text-[#214E8A] hover:underline">
              Lupa Password?
            </button>
          </div>

          {/* Tombol Login */}
          <button
            type="submit"
            className="w-full h-[55px] bg-[#214E8A] text-white text-base font-semibold rounded-xl transition-all hover:bg-[#1a3e6d] active:scale-[0.98]"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}