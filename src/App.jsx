import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import Sidebar from "./components/Sidebar";
import NotificationListener from "./components/NotificationListener";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Layanan from "./pages/Layanan";
import Addon from "./pages/Addon";
import Perawat from "./pages/Perawat/Perawat1";
import Perawat2 from "./pages/Perawat/Perawat2";
import DetailPerawat from "./pages/Perawat/detail_perawat";
import CapaianPerawat from "./pages/Perawat/Capaian_perawat";
import TambahPerawat from "./pages/Perawat/Tambah_perawat";
import Pasien from "./pages/Pasien/Pasien1";
import Pasien2 from "./pages/Pasien/Pasien2";
import DetailPasien from "./pages/Pasien/detail_pasien";
import RekamMedisPasien from "./pages/Pasien/rekam_medis_pasien";
import Transaksi from "./pages/Transaksi";
import Chat from "./pages/Chat";
import Notifikasi from "./pages/Notifikasi";

function AdminLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  // Default sidebar terbuka di desktop
  const [isOpen, setIsOpen] = useState(
    window.innerWidth >= 1024
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="bg-[#ECECEC] min-h-screen">
      <NotificationListener />

      {/* SIDEBAR */}
      {!isLoginPage && (
        <Sidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      )}

      {/* ROUTING */}
      <main>
        <Routes>
          <Route
            path="/"
            element={<Login />}
          />

          <Route
            path="/dashboard"
            element={
              <Dashboard
                isOpen={isOpen}
              />
            }
          />

          <Route
            path="/layanan"
            element={
              <Layanan
                isOpen={isOpen}
              />
            }
          />

          <Route
            path="/addon"
            element={
              <Addon
                isOpen={isOpen}
              />
            }
          />

          <Route
            path="/perawat"
            element={<Perawat isOpen={isOpen} />}
          />

          <Route
            path="/perawat2"
            element={<Perawat2 isOpen={isOpen} />}
          />

          <Route
            path="/detail_perawat/:id"
            element={<DetailPerawat isOpen={isOpen} />}
          />

          <Route
            path="/capaian_perawat/:id"
            element={<CapaianPerawat isOpen={isOpen} />}
          />

          <Route
            path="/tambah_perawat"
            element={<TambahPerawat isOpen={isOpen} />}
          />

          <Route
            path="/pasien"
            element={<Pasien isOpen={isOpen} />}
          />

          <Route
            path="/pasien2"
            element={<Pasien2 isOpen={isOpen} />}
          />

          <Route
            path="/detail_pasien/:id"
            element={<DetailPasien isOpen={isOpen} />}
          />

          <Route
            path="/rekam_medis_pasien/:id"
            element={<RekamMedisPasien isOpen={isOpen} />}
          />

          <Route
            path="/transaksi"
            element={<Transaksi isOpen={isOpen} />}
          />

          <Route
            path="/chat"
            element={<Chat isOpen={isOpen} />}
          />

          <Route
            path="/notifikasi"
            element={<Notifikasi isOpen={isOpen} />}
          />
        </Routes>
      </main>

    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AdminLayout />
    </Router>
  );
}