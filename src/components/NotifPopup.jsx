import { useNavigate } from "react-router-dom";
import { Bell, ShoppingBag, CreditCard, UserPlus, CheckCircle } from "lucide-react";

// ─── TIME FORMATTER (same logic as Chat) ───────────
function formatNotifTime(date) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const oneDay = 24 * 60 * 60 * 1000;
  const daysDiff = Math.floor((todayStart - dateStart) / oneDay);

  if (daysDiff === 0) {
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }
  if (daysDiff === 1) return "Kemarin";
  if (daysDiff >= 2 && daysDiff <= 7) {
    return date.toLocaleDateString("id-ID", { weekday: "long" });
  }
  if (date.getFullYear() !== now.getFullYear()) {
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long" });
}

// Icon resolver
function getNotifIcon(type) {
  switch (type) {
    case "booking":
      return <ShoppingBag size={18} className="text-[#214E8A]" />;
    case "pembayaran":
      return <CreditCard size={18} className="text-[#818807]" />;
    case "perawat_baru":
      return <UserPlus size={18} className="text-green-600" />;
    case "verifikasi":
      return <CheckCircle size={18} className="text-orange-500" />;
    default:
      return <Bell size={18} className="text-[#214E8A]" />;
  }
}

function getNotifIconBg(type) {
  switch (type) {
    case "booking":
      return "bg-[#EBF0F7]";
    case "pembayaran":
      return "bg-[#F5F5E0]";
    case "perawat_baru":
      return "bg-green-50";
    case "verifikasi":
      return "bg-orange-50";
    default:
      return "bg-gray-100";
  }
}

export default function NotifPopup({ notifications = [], markAsRead }) {
  const navigate = useNavigate();

  // Filter unread count based on local storage
  const getIsRead = (id) => localStorage.getItem(`read_notif_${id}`) === "true";
  const unreadCount = notifications.filter((n) => !getIsRead(n.id)).length;

  const displayNotifs = notifications.slice(0, 4);

  return (
    <div
      className="
        absolute top-full right-0 mt-2
        w-[400px]
        bg-white
        rounded-2xl
        shadow-2xl
        border border-gray-100
        z-[999]
        overflow-hidden
      "
      style={{ animation: "fadeSlideIn 0.2s ease-out" }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#1B2559]">Notifikasi</h3>
          {unreadCount > 0 && (
            <span className="text-xs font-semibold text-white bg-[#214E8A] px-2.5 py-1 rounded-full">
              {unreadCount} baru
            </span>
          )}
        </div>
      </div>

      {/* Notif List */}
      <div className="max-h-[340px] overflow-y-auto">
        {displayNotifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <Bell size={32} strokeWidth={1.5} />
            <p className="mt-2 text-xs">Tidak ada notifikasi baru</p>
          </div>
        ) : (
          displayNotifs.map((notif) => {
            const isRead = getIsRead(notif.id);
            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (markAsRead) markAsRead(notif.id);
                  navigate("/notifikasi", { state: { activeNotif: notif.id } });
                }}
                className={`
                  flex items-start gap-3
                  px-5 py-3.5
                  cursor-pointer
                  transition-colors
                  border-b border-gray-50
                  last:border-b-0
                  ${!isRead ? "bg-[#F8FAFF]" : "hover:bg-gray-50"}
                `}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${getNotifIconBg(notif.type)}`}>
                  {getNotifIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-snug ${!isRead ? "font-bold text-[#1B2559]" : "font-semibold text-gray-600"}`}>
                      {notif.judul}
                    </p>
                    <span className={`text-[11px] flex-shrink-0 mt-0.5 ${!isRead ? "text-[#214E8A] font-semibold" : "text-gray-400"}`}>
                      {formatNotifTime(new Date(notif.waktu))}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {notif.pesan}
                  </p>
                </div>

                {/* Unread dot */}
                {!isRead && (
                  <span className="w-2.5 h-2.5 bg-[#214E8A] rounded-full flex-shrink-0 mt-1.5" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => navigate("/notifikasi")}
          className="
            w-full
            py-2.5
            text-sm font-semibold
            text-[#214E8A]
            bg-[#EBF0F7]
            rounded-xl
            hover:bg-[#dce4f0]
            transition-colors
            flex items-center justify-center gap-2
          "
        >
          <Bell size={16} />
          Lihat Semua Notifikasi
        </button>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
