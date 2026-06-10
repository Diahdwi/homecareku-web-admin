import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import {
  Search,
  Send,
  Plus,
  Image as ImageIcon,
  FileText,
  X,
  ArrowLeft,
  Paperclip,
} from "lucide-react";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  subscribeAdminChatRooms,
  subscribeMessages,
  sendChatMessage,
  markChatAsRead
} from "../services/chatService";

// ─── TIME FORMATTER ────────────────────────────────
function formatChatTime(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diff = now - d;
  const oneDay = 24 * 60 * 60 * 1000;

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const daysDiff = Math.floor((todayStart - dateStart) / oneDay);

  if (daysDiff === 0) {
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }
  if (daysDiff === 1) {
    return "Kemarin";
  }
  if (daysDiff >= 2 && daysDiff <= 7) {
    return d.toLocaleDateString("id-ID", { weekday: "long" });
  }
  if (d.getFullYear() !== now.getFullYear()) {
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long" });
}

// ─── MAIN COMPONENT ────────────────────────────────
export default function Chat({ isOpen }) {
  const location = useLocation();
  const [activeChat, setActiveChat] = useState(location.state?.activeChat || null);
  const [filter, setFilter] = useState("semua"); // "semua" | "belum_dibaca"
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [adminUid, setAdminUid] = useState(null);
  
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState(null); // { file, name, isImage, url }
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const attachMenuRef = useRef(null);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdminUid(user.uid);
      } else {
        setAdminUid(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time chat rooms
  useEffect(() => {
    if (!adminUid) return;
    const unsubscribe = subscribeAdminChatRooms((roomList) => {
      setChats(roomList);
    });
    return () => unsubscribe();
  }, [adminUid]);

  // Subscribe to real-time messages for active room
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }
    
    // Mark chat room as read
    markChatAsRead(activeChat);

    const unsubscribe = subscribeMessages(activeChat, (newMsgs) => {
      setMessages(newMsgs);
    });
    return () => unsubscribe();
  }, [activeChat]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChat]);

  // Close attach menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target)) {
        setShowAttachMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered chats
  const filteredChats = chats
    .filter((chat) => {
      if (filter === "belum_dibaca") return chat.unread > 0;
      return true;
    })
    .filter((chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const activeChatData = activeChat ? chats.find((c) => c.id === activeChat) : null;
  if (activeChatData) {
    activeChatData.messages = messages;
  }

  // Send message
  const handleSend = async () => {
    if (!messageInput.trim() && !attachmentPreview) return;
    if (!activeChat || !adminUid) return;

    const textToSend = messageInput.trim();
    setMessageInput(""); // Clear immediately for snappy UI
    
    try {
      if (attachmentPreview) {
        const file = attachmentPreview.file;
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Url = reader.result;
          await sendChatMessage(activeChat, adminUid, textToSend, attachmentPreview.isImage ? "image" : "document", {
            url: base64Url,
            name: file.name
          });
        };
        reader.readAsDataURL(file);
        setAttachmentPreview(null);
      } else {
        await sendChatMessage(activeChat, adminUid, textToSend, "text");
      }
    } catch (err) {
      console.error("Gagal mengirim pesan:", err);
      alert("Gagal mengirim pesan.");
    }
  };

  // Handle file selection
  const handleFileSelect = (e, isImage) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAttachmentPreview({
      file,
      name: file.name,
      isImage,
      url,
    });
    setShowAttachMenu(false);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`
        bg-[#ECECEC]
        min-h-screen
        p-5
        transition-all
        duration-300
        ${isOpen ? "ml-[280px]" : "ml-[90px]"}
      `}
    >
      <Header />

      {/* Chat Container */}
      <div className="mt-5 bg-white rounded-3xl shadow-sm overflow-hidden flex" style={{ height: "calc(100vh - 140px)" }}>

        {/* ═══ LEFT PANEL — CHAT LIST ═══ */}
        <div className={`
          w-[360px] border-r border-gray-100 flex flex-col flex-shrink-0
          ${activeChat ? "hidden lg:flex" : "flex"}
        `}>
          {/* Search */}
          <div className="p-4 pb-3">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full h-11
                  rounded-full
                  border border-gray-200
                  pl-11 pr-4
                  text-sm
                  outline-none
                  focus:border-[#214E8A]
                  transition-colors
                "
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 pb-3 flex gap-2">
            <button
              onClick={() => setFilter("semua")}
              className={`
                px-4 py-2
                rounded-full
                text-sm font-semibold
                transition-all
                ${filter === "semua"
                  ? "bg-[#214E8A] text-white shadow-md shadow-[#214E8A]/20"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
              `}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter("belum_dibaca")}
              className={`
                px-4 py-2
                rounded-full
                text-sm font-semibold
                transition-all
                ${filter === "belum_dibaca"
                  ? "bg-[#214E8A] text-white shadow-md shadow-[#214E8A]/20"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
              `}
            >
              Belum Dibaca
            </button>
          </div>

          {/* Chat Items */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageSquareIcon />
                <p className="mt-3 text-sm">Tidak ada chat ditemukan</p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    setActiveChat(chat.id);
                    // Mark as read
                    setChats((prev) =>
                      prev.map((c) =>
                        c.id === chat.id ? { ...c, unread: 0 } : c
                      )
                    );
                  }}
                  className={`
                    flex items-center gap-3
                    px-4 py-3.5
                    cursor-pointer
                    transition-all
                    border-b border-gray-50
                    ${activeChat === chat.id
                      ? "bg-[#EBF0F7] border-l-4 border-l-[#214E8A]"
                      : "hover:bg-gray-50"}
                  `}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full bg-gray-100"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${chat.unread > 0 ? "font-bold text-[#1B2559]" : "font-semibold text-gray-700"}`}>
                        {chat.name}
                      </p>
                      <span className={`text-[11px] ml-2 flex-shrink-0 ${chat.unread > 0 ? "text-[#214E8A] font-semibold" : "text-gray-400"}`}>
                        {formatChatTime(chat.lastTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className={`text-xs truncate ${chat.unread > 0 ? "text-gray-700 font-medium" : "text-gray-500"}`}>
                        {chat.lastMessage}
                      </p>
                      {chat.unread > 0 && (
                        <span className="ml-2 flex-shrink-0 w-5 h-5 bg-[#214E8A] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ═══ RIGHT PANEL — CHAT ROOM ═══ */}
        <div className={`
          flex-1 flex flex-col
          ${!activeChat ? "hidden lg:flex" : "flex"}
        `}>
          {!activeChatData ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="w-24 h-24 rounded-full bg-[#EBF0F7] flex items-center justify-center mb-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#214E8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-gray-500">Pilih chat untuk memulai</p>
              <p className="text-sm text-gray-400 mt-1">Pilih salah satu percakapan di sebelah kiri</p>
            </div>
          ) : (
            <>
              {/* Chat Room Header */}
              <div className="h-[72px] px-5 flex items-center gap-3 border-b border-gray-100 flex-shrink-0 bg-white">
                {/* Back button (mobile) */}
                <button
                  onClick={() => setActiveChat(null)}
                  className="lg:hidden w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>

                <img
                  src={activeChatData.avatar}
                  alt={activeChatData.name}
                  className="w-11 h-11 rounded-full bg-gray-100"
                />
                <div>
                  <p className="font-bold text-[#1B2559]">{activeChatData.name}</p>
                  <p className="text-xs text-green-500 font-medium">Online</p>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-6 py-4 bg-[#FAFBFD]">
                {activeChatData.messages.map((msg) => (
                  <div key={msg.id} className="mb-5 last:mb-2">
                    {/* Sender Info */}
                    <div className={`flex items-center gap-2 mb-1.5 ${msg.isAdmin ? "justify-end" : "justify-start"}`}>
                      {!msg.isAdmin && (
                        <>
                          <span className="text-xs font-bold text-gray-700">{activeChatData.name}</span>
                          <span className="text-[11px] text-gray-400">{msg.time}</span>
                        </>
                      )}
                      {msg.isAdmin && (
                        <>
                          <span className="text-[11px] text-gray-400">{msg.time}</span>
                          <span className="text-xs font-bold text-gray-700">Admin</span>
                        </>
                      )}
                    </div>

                    {/* Bubble */}
                    <div className={`flex ${msg.isAdmin ? "justify-end" : "justify-start"}`}>
                      {msg.type === "image" ? (
                        <div className="max-w-[280px]">
                          <img
                            src={msg.imageUrl}
                            alt="attachment"
                            className="rounded-2xl max-w-full h-auto shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(msg.imageUrl, "_blank")}
                          />
                        </div>
                      ) : msg.type === "document" ? (
                        <div
                          className={`
                            max-w-[280px] px-4 py-3
                            rounded-2xl
                            flex items-center gap-3
                            cursor-pointer
                            ${msg.isAdmin
                              ? "bg-[#214E8A] text-white"
                              : "bg-white border border-[#214E8A]/20 text-gray-800"}
                          `}
                        >
                          <div className={`
                            w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                            ${msg.isAdmin ? "bg-white/15" : "bg-[#EBF0F7]"}
                          `}>
                            <FileText size={20} className={msg.isAdmin ? "text-white" : "text-[#214E8A]"} />
                          </div>
                          <p className="text-sm font-medium truncate">{msg.fileName || "Dokumen"}</p>
                        </div>
                      ) : (
                        <div
                          className={`
                            max-w-[420px] px-4 py-2.5
                            ${msg.isAdmin
                              ? "bg-[#214E8A] text-white rounded-t-2xl rounded-bl-2xl rounded-br-md"
                              : "bg-white border border-gray-200 text-gray-800 rounded-t-2xl rounded-br-2xl rounded-bl-md"
                            }
                          `}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Attachment Preview */}
              {attachmentPreview && (
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
                  {attachmentPreview.isImage ? (
                    <img
                      src={attachmentPreview.url}
                      alt="preview"
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-[#EBF0F7] flex items-center justify-center">
                      <FileText size={24} className="text-[#214E8A]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {attachmentPreview.isImage ? "1 Foto dilampirkan" : attachmentPreview.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(attachmentPreview.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      URL.revokeObjectURL(attachmentPreview.url);
                      setAttachmentPreview(null);
                    }}
                    className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors"
                  >
                    <X size={18} className="text-red-500" />
                  </button>
                </div>
              )}

              {/* Input Bar */}
              <div className="px-5 py-4 bg-white border-t border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative flex items-center h-12 bg-gray-50 rounded-full border border-gray-200 focus-within:border-[#214E8A] transition-colors">
                    <input
                      type="text"
                      placeholder="Ketik pesan..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="
                        flex-1
                        h-full
                        bg-transparent
                        pl-5 pr-2
                        text-sm
                        outline-none
                      "
                    />

                    {/* Attach Button */}
                    <div className="relative" ref={attachMenuRef}>
                      <button
                        onClick={() => setShowAttachMenu(!showAttachMenu)}
                        className="w-9 h-9 rounded-full hover:bg-gray-200 flex items-center justify-center mr-1.5 transition-colors"
                      >
                        <Plus size={22} className="text-[#214E8A]" />
                      </button>

                      {/* Attach Menu Popup */}
                      {showAttachMenu && (
                        <div className="absolute bottom-full right-0 mb-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                          <button
                            onClick={() => imageInputRef.current?.click()}
                            className="w-full px-4 py-3 text-sm text-left flex items-center gap-3 hover:bg-[#EBF0F7] transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#EBF0F7] flex items-center justify-center">
                              <ImageIcon size={16} className="text-[#214E8A]" />
                            </div>
                            <span className="font-medium text-gray-700">Foto / Gambar</span>
                          </button>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full px-4 py-3 text-sm text-left flex items-center gap-3 hover:bg-[#EBF0F7] transition-colors border-t border-gray-50"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#EBF0F7] flex items-center justify-center">
                              <FileText size={16} className="text-[#214E8A]" />
                            </div>
                            <span className="font-medium text-gray-700">Dokumen</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSend}
                    disabled={!messageInput.trim() && !attachmentPreview}
                    className={`
                      w-12 h-12
                      rounded-full
                      flex items-center justify-center
                      transition-all
                      ${messageInput.trim() || attachmentPreview
                        ? "bg-[#214E8A] text-white shadow-lg shadow-[#214E8A]/30 hover:bg-[#1a3f70]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"}
                    `}
                  >
                    <Send size={20} />
                  </button>
                </div>

                {/* Hidden file inputs */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, true)}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, false)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple message square icon for empty state
function MessageSquareIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
