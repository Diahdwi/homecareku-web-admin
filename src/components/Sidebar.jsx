import { Link, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  Receipt,
  Stethoscope,
  FolderHeart,
  Headset,
  Menu,
  MoreVertical,
} from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Transaksi",
      path: "/transaksi",
      icon: <Receipt size={20} />,
    },
    {
      name: "Perawat",
      path: "/perawat",
      icon: <Stethoscope size={20} />,
    },
    {
      name: "Layanan",
      path: "/layanan",
      icon: <FolderHeart size={20} />,
    },
  ];

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-20"
      } h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-50 transition-all duration-300`}
    >
      {/* ================= HEADER ================= */}

      {isOpen ? (
        // ===== EXPAND =====
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            
            {/* PROFILE */}
            <div className="flex items-center gap-3">
              
              <div className="w-12 h-12 rounded-full bg-[#F28B0C]/20 flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-[#F28B0C] flex items-center justify-center">
                  <Headset size={18} className="text-white" />
                </div>
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-wider text-[#F28B0C]">
                  HOMECAREKU
                </h1>

                <p className="text-xs text-slate-400 mt-1">
                  Admin Dashboard
                </p>
              </div>
            </div>

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-all p-1 rounded-md hover:bg-slate-800"
            >
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      ) : (
        // ===== COLLAPSE =====
        <div className="p-4 border-b border-slate-800 flex justify-center">
          <button
            onClick={() => setIsOpen(true)}
            className="text-slate-400 hover:text-white transition-all p-1 rounded-md hover:bg-slate-800"
          >
            <Menu size={24} />
          </button>
        </div>
      )}

      {/* ================= MENU ================= */}

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center ${
                isOpen
                  ? "gap-3 px-4 justify-start"
                  : "justify-center"
              } py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#F28B0C]/10 text-[#F28B0C] border border-[#F28B0C]/30 font-bold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon}

              {isOpen && item.name}
            </Link>
          );
        })}
      </nav>

      {/* ================= FOOTER ================= */}

      {isOpen && (
        <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-500">
          v1.0.0 - Tubes PBL
        </div>
      )}
    </div>
  );
}