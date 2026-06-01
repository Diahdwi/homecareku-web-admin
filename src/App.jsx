import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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