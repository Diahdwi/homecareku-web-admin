import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";

// === TAMBAHAN: Import SDK Firebase ===
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase"; // <-- Sesuaikan dengan path file konfigurasi Firebase-mu

export default function Login() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState(""); // <-- Tambahan untuk menampung error UI
  const [loading, setLoading] = useState(false); // <-- Tambahan untuk status loading tombol
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      // 1. Tembak API Firebase Auth untuk validasi Email & Password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Tembak API Firestore untuk cek dokumen di koleksi 'users' berdasarkan UID
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const role = userData.id_role || "";

        // 3. Verifikasi Hak Akses (Admin harus memiliki id_role: '/roles/1')
        if (role === "/roles/1") {
          // Login sukses, arahkan ke dashboard admin
          navigate("/dashboard");
        } else {
          // Jika Pasien atau Perawat mencoba iseng login ke Web Admin, langsung didepak keluar
          await signOut(auth);
          setErrorMsg("Akses ditolak! Akun Anda bukan merupakan Admin.");
        }
      } else {
        await signOut(auth);
        setErrorMsg("Data pengguna tidak ditemukan di sistem database.");
      }
    } catch (error) {
      console.error("Login error:", error);
      // Menangani pesan error bawaan Firebase agar lebih enak dibaca manusia
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

        {/* === TAMBAHAN: Alert Error Box === */}
        {errorMsg && (
          <div className="mt-5 p-4 text-sm text-red-700 bg-red-50 rounded-xl text-center font-medium">
            {errorMsg}
          </div>
        )}

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
              disabled={loading}
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
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Lupa Password */}
          <div className="text-right">
            <button type="button" className="text-sm font-medium text-[#214E8A] hover:underline" disabled={loading}>
              Lupa Password?
            </button>
          </div>

          {/* Tombol Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[55px] bg-[#214E8A] text-white text-base font-semibold rounded-xl transition-all hover:bg-[#1a3e6d] active:scale-[0.98] disabled:bg-gray-400 disabled:scale-100 flex items-center justify-center"
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}