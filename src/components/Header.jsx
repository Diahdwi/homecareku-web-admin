import { Bell, MessageSquare, Search } from "lucide-react";

export default function Header() {
  return (
    <div className="bg-white rounded-[20px] px-6 py-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">

        {/* SEARCH */}
        <div className="flex-1 min-w-[250px] relative">
          <Search
            size={20}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="text"
            placeholder="Cari yang Anda butuhkan"
            className="
              w-full
              h-12
              rounded-full
              border
              border-[#214E8A]
              pl-14
              pr-5
              outline-none
            "
          />
        </div>

        {/* NOTIF */}
        <button className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center">
          <Bell size={20} className="text-[#214E8A]" />
        </button>

        {/* CHAT */}
        <button className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center">
          <MessageSquare size={20} className="text-[#214E8A]" />
        </button>

        {/* PROFILE */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow">
          <img
            src="https://i.pravatar.cc/100"
            alt="admin"
            className="w-10 h-10 rounded-full"
          />

          <span className="font-medium">
            Admin
          </span>
        </div>
      </div>
    </div>
  );
}