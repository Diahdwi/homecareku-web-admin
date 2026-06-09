import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, MessageSquare, Search } from "lucide-react";
import ChatPopup from "./ChatPopup";

export default function Header() {
  const navigate = useNavigate();
  const [showChatPopup, setShowChatPopup] = useState(false);
  const chatRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (chatRef.current && !chatRef.current.contains(e.target)) {
        setShowChatPopup(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setShowChatPopup(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setShowChatPopup(false);
    }, 300);
  };

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
        <div
          ref={chatRef}
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            onClick={() => {
              setShowChatPopup(false);
              navigate("/chat");
            }}
            className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center relative"
          >
            <MessageSquare size={20} className="text-[#214E8A]" />

            {/* Unread Badge */}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#214E8A] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              6
            </span>
          </button>

          {/* Hover Popup */}
          {showChatPopup && <ChatPopup />}
        </div>

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