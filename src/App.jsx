import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { useState, useEffect } from "react";

import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Layanan from "./pages/Layanan";
import Perawat from "./pages/Perawat";
import Transaksi from "./pages/Transaksi";

function AdminLayout() {
  const location = useLocation();

  const isLoginPage = location.pathname === "/";

  // ================= SIDEBAR STATE =================

  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);

  // ================= RESPONSIVE =================

  useEffect(() => {
    const handleResize = () => {
      // AUTO COLLAPSE MOBILE
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }

      // AUTO EXPAND DESKTOP
      else {
        setIsOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="bg-[#F4F7FE] min-h-screen">
      
      {/* ================= SIDEBAR ================= */}

      {!isLoginPage && (
        <Sidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      )}

      {/* ================= ROUTES ================= */}

      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={<Dashboard isOpen={isOpen} />}
        />

        <Route
          path="/layanan"
          element={<Layanan />}
        />

        <Route
          path="/perawat"
          element={<Perawat />}
        />

        <Route
          path="/transaksi"
          element={<Transaksi />}
        />
      </Routes>
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