import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Layanan from "./pages/Layanan";
import Perawat from "./pages/Perawat";
import Transaksi from "./pages/Transaksi";

// Komponen pembungkus untuk memisahkan halaman yang butuh Sidebar (Dashboard dll) dengan yang tidak (Login)
function AdminLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  return (
    <div className="flex bg-[#F4F7FE] min-h-screen">
      {/* Tampilkan sidebar hanya jika BUKAN di halaman login */}
      {!isLoginPage && <Sidebar />}

      {/* Area konten utama, beri margin-left jika ada sidebar */}
      <div className={`flex-1 ${!isLoginPage ? "ml-64" : ""}`}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/layanan" element={<Layanan />} />
          <Route path="/perawat" element={<Perawat />} />
          <Route path="/transaksi" element={<Transaksi />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AdminLayout />
    </Router>
  );
}

export default App;