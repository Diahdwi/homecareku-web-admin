import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Stethoscope,
  FolderHeart,
  Users,
  Menu,
  ChevronLeft,
  LogOut,
  X,
} from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={22} />,
    },
    {
      name: "Transaksi",
      path: "/transaksi",
      icon: <Receipt size={22} />,
    },
    {
      name: "Layanan",
      path: "/layanan",
      icon: <FolderHeart size={22} />,
    },
    {
      name: "Perawat",
      path: "/perawat",
      icon: <Stethoscope size={22} />,
    },
    {
      name: "Pasien",
      path: "/pasien",
      icon: <Users size={22} />,
    },
  ];

  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div
          className="
            lg:hidden
            fixed
            inset-0
            bg-black/40
            z-40
          "
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed
          left-0
          top-0
          h-screen
          bg-white
          shadow-lg
          z-50
          transition-all
          duration-300
          flex
          flex-col

          ${
            isOpen
              ? "w-[280px]"
              : "w-[90px]"
          }

          lg:rounded-r-[24px]
        `}
      >
        {/* HEADER */}
        <div className="px-5 py-6 border-b border-gray-100">

          {isOpen ? (
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3 min-w-0">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-12 h-12 object-contain flex-shrink-0"
                />

                <div>
                  <h1 className="font-bold text-xl text-[#214E8A]">
                    HomecareKu
                  </h1>

                  <p className="text-xs text-gray-500">
                    Admin Dashboard
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="
                  w-10
                  h-10
                  flex
                  items-center
                  justify-center
                  rounded-lg
                  hover:bg-gray-100
                  flex-shrink-0
                "
              >
                <ChevronLeft size={20} />
              </button>

            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">

              <img
                src="/logo.png"
                alt="Logo"
                className="w-12 h-12 object-contain"
              />

              <button
                onClick={() => setIsOpen(true)}
                className="
                  w-10
                  h-10
                  flex
                  items-center
                  justify-center
                  rounded-lg
                  hover:bg-gray-100
                "
              >
                <Menu size={20} />
              </button>

            </div>
          )}

        </div>

        {/* MENU */}
        <div className="flex-1 px-4 py-5">

          {isOpen && (
            <p className="text-xs uppercase text-gray-400 font-semibold mb-4">
              Menu
            </p>
          )}

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const active =
                location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex
                    items-center
                    h-14
                    rounded-xl
                    transition-all

                    ${
                      active
                        ? "bg-[#214E8A] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }

                    ${
                      isOpen
                        ? "px-4 gap-3"
                        : "justify-center"
                    }
                  `}
                >
                  {item.icon}

                  {isOpen && (
                    <span>{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-100">

          <button
            onClick={() => navigate("/")}
            className={`
              w-full
              h-14
              rounded-xl
              flex
              items-center
              text-red-500
              hover:bg-red-50

              ${
                isOpen
                  ? "px-4 gap-3"
                  : "justify-center"
              }
            `}
          >
            <LogOut size={22} />

            {isOpen && (
              <span>Keluar</span>
            )}
          </button>

        </div>
      </aside>
    </>
  );
}