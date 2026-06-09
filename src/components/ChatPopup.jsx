import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";

// Mock data for popup preview
const recentChats = [
  {
    id: 1,
    name: "Abyan Faza",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abyan&backgroundColor=c0aede",
    lastMessage: "Terima kasih dokter, saya akan coba",
    time: new Date(),
    unread: 3,
  },
  {
    id: 2,
    name: "Siti Kusmini",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti&backgroundColor=ffdfbf",
    lastMessage: "Rumah saya yang ada atapnya",
    time: new Date(),
    unread: 2,
  },
  {
    id: 3,
    name: "Dedi Kokbuzer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dedi&backgroundColor=b6e3f4",
    lastMessage: "Yang saya rasa selama minum Susu protein...",
    time: new Date(),
    unread: 1,
  },
];

function formatTimeShort(date) {
  const now = new Date();
  const diff = now - date;
  const oneDay = 24 * 60 * 60 * 1000;

  if (diff < oneDay && now.getDate() === date.getDate()) {
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }
  if (diff < 2 * oneDay && now.getDate() - date.getDate() === 1) {
    return "Kemarin";
  }
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function ChatPopup() {
  const navigate = useNavigate();

  return (
    <div
      className="
        absolute top-full right-0 mt-2
        w-[380px]
        bg-white
        rounded-2xl
        shadow-2xl
        border border-gray-100
        z-[999]
        overflow-hidden
        animate-[fadeSlideIn_0.2s_ease-out]
      "
      style={{
        animation: "fadeSlideIn 0.2s ease-out",
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#1B2559]">Chat</h3>
          <span className="text-xs font-semibold text-white bg-[#214E8A] px-2.5 py-1 rounded-full">
            {recentChats.reduce((sum, c) => sum + c.unread, 0)} baru
          </span>
        </div>
      </div>

      {/* Chat List */}
      <div className="max-h-[320px] overflow-y-auto">
        {recentChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => navigate("/chat", { state: { activeChat: chat.id } })}
            className="
              flex items-center gap-3
              px-5 py-3.5
              cursor-pointer
              hover:bg-[#EBF0F7]
              transition-colors
              border-b border-gray-50
              last:border-b-0
            "
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-11 h-11 rounded-full bg-gray-100"
              />
              {chat.unread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#214E8A] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {chat.unread}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm text-[#1B2559] truncate">
                  {chat.name}
                </p>
                <span className="text-[11px] text-gray-400 ml-2 flex-shrink-0">
                  {formatTimeShort(chat.time)}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {chat.lastMessage}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => navigate("/chat")}
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
          <MessageSquare size={16} />
          Lihat Semua Chat
        </button>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
