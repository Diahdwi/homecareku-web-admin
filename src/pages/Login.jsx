import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

const LoginAdmin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      // 1. Authenticate using Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Fetch user details from Firestore
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const role = userData.id_role || "";

        // 3. Verify Admin access (id_role: '/roles/1')
        if (role === "/roles/1") {
          navigate("/dashboard");
        } else {
          await signOut(auth);
          setErrorMsg("Akses ditolak! Akun Anda bukan merupakan Admin.");
        }
      } else {
        await signOut(auth);
        setErrorMsg("Data pengguna tidak ditemukan di sistem database.");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found") {
        setErrorMsg("Email atau Password yang Anda masukkan salah!");
      } else {
        setErrorMsg("Terjadi kesalahan sistem. Silakan coba lagi nanti.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Container utama: flexbox untuk membagi layar menjadi 2 bagian (kiri gambar, kanan form)
    <div 
      className="flex min-h-screen bg-[#F8F9FA]"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      
      {/* BAGIAN KIRI - Ilustrasi (Sembunyikan di layar mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-[#F8F9FA]">
        <img 
          src="/ilustrasi.png" 
          alt="Ilustrasi HomecareKu" 
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ imageRendering: 'auto' }}
        />
      </div>

      {/* BAGIAN KANAN - Form Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F8F9FA]">
        
        {/* Card Form dengan custom drop shadow yang lembut */}
        <div className="w-full max-w-[500px] bg-white rounded-[35px] p-10 flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-50/50">
          
          {/* Logo HomecareKu */}
          <div className="mb-4">
            <img src="/logo.png" alt="HomecareKu" className="w-[60px] h-[60px] object-contain" />
          </div>

          {/* Heading */}
          <h1 className="text-[#214E8A] text-[30px] font-bold text-center mb-1">
            HomecareKu
          </h1>
          <p className="text-gray-500 text-[15px] text-center font-normal mb-8">
            Masukkan kredensial Anda untuk melanjutkan
          </p>

          {/* Error Message Display */}
          {errorMsg && (
            <div className="w-full max-w-[350px] mb-5 p-4 text-sm text-red-700 bg-red-50 rounded-[10px] text-center font-medium border border-red-100">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="w-full max-w-[350px] flex flex-col gap-5">
            
            {/* Input Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[#000000] text-[15px] font-medium text-left">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[50px] border border-gray-300 rounded-[10px] px-4 focus:outline-none focus:border-[#214E8A] focus:ring-1 focus:ring-[#214E8A] transition-all"
                required
                disabled={loading}
              />
            </div>

            {/* Input Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[#000000] text-[15px] font-medium text-left">
                Password
              </label>
              <div className="relative w-full h-[50px]">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[50px] border border-gray-300 rounded-[10px] px-4 pr-12 focus:outline-none focus:border-[#214E8A] focus:ring-1 focus:ring-[#214E8A] transition-all"
                  required
                  disabled={loading}
                />
                {/* Tombol Toggle Mata */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0F1831] hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            {/* Tombol Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] mt-4 bg-[#214E8A] text-white text-[15px] font-bold rounded-[10px] hover:bg-[#1a3d6e] transition-all active:scale-[0.98] disabled:bg-gray-400 disabled:scale-100 flex items-center justify-center"
            >
              {loading ? "Memproses..." : "Login"}
            </button>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;