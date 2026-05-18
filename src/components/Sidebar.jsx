import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Receipt, Stethoscope, Users, FolderHeart } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Transaksi", path: "/transaksi", icon: <Receipt size={20} /> },
    { name: "Perawat", path: "/perawat", icon: <Stethoscope size={20} /> },
    { name: "Layanan", path: "/layanan", icon: <FolderHeart size={20} /> },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-wider text-[#F28B0C]">🚨 HOMECAREKU</h1>
        <p className="text-xs text-slate-400 mt-1">Admin Dashboard Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#F28B0C]/10 text-[#F28B0C] border border-[#F28B0C]/30 font-bold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-500">
        v1.0.0 - Tubes PBL
      </div>
    </div>
  );
}