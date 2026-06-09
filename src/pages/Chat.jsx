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

// ─── TIME FORMATTER ────────────────────────────────
function formatChatTime(date) {
  const now = new Date();
  const diff = now - date;
  const oneDay = 24 * 60 * 60 * 1000;

  // Reset hours to compare dates cleanly
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysDiff = Math.floor((todayStart - dateStart) / oneDay);

  // Hari ini → jam
  if (daysDiff === 0) {
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }

  // Kemarin
  if (daysDiff === 1) {
    return "Kemarin";
  }

  // 2-7 hari lalu → nama hari
  if (daysDiff >= 2 && daysDiff <= 7) {
    return date.toLocaleDateString("id-ID", { weekday: "long" });
  }

  // Lebih dari 7 hari
  if (date.getFullYear() !== now.getFullYear()) {
    // Tahun beda → 7 Mei 2025
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }

  // Tahun sama → 7 Mei
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long" });
}

// ─── MOCK DATA ─────────────────────────────────────
const mockChats = [
  {
    id: 1,
    name: "Abyan Faza",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abyan&backgroundColor=c0aede",
    lastMessage: "Terima kasih, saya akan coba sarannya",
    lastTime: new Date(),
    unread: 3,
    messages: [
      { id: 1, text: "Selamat pagi, saya ingin konsultasi", isAdmin: false, time: "07:12", type: "text" },
      { id: 2, text: "Selamat pagi, silakan ada yang bisa dibantu?", isAdmin: true, time: "07:15", type: "text" },
      { id: 3, text: "Saya merasa kurang enak badan akhir-akhir ini, sudah 3 hari demam", isAdmin: false, time: "07:18", type: "text" },
      { id: 4, text: "Baik, apakah ada keluhan lain selain demam? Seperti batuk, pilek, atau nyeri?", isAdmin: true, time: "07:20", type: "text" },
      { id: 5, text: "", isAdmin: false, time: "07:25", type: "image", imageUrl: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=300&h=200&fit=crop" },
      { id: 6, text: "Ini foto hasil pemeriksaan saya kemarin", isAdmin: false, time: "07:25", type: "text" },
      { id: 7, text: "Terima kasih atas fotonya. Saya akan review dan beri saran segera.", isAdmin: true, time: "07:30", type: "text" },
      { id: 8, text: "Terima kasih, saya akan coba sarannya", isAdmin: false, time: "07:45", type: "text" },
    ],
  },
  {
    id: 2,
    name: "Siti Kusmini",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti&backgroundColor=ffdfbf",
    lastMessage: "Rumah saya yang ada atapnya",
    lastTime: new Date(),
    unread: 2,
    messages: [
      { id: 1, text: "Halo, saya mau tanya alamat kliniknya", isAdmin: false, time: "10:00", type: "text" },
      { id: 2, text: "Halo Ibu Siti, klinik kami di Jl. Kesehatan No. 15", isAdmin: true, time: "10:05", type: "text" },
      { id: 3, text: "Rumah saya yang ada atapnya", isAdmin: false, time: "10:10", type: "text" },
    ],
  },
  {
    id: 3,
    name: "Dedi Kokbuzer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dedi&backgroundColor=b6e3f4",
    lastMessage: "Yang saya rasa selama minum Susu protein...",
    lastTime: new Date(),
    unread: 1,
    messages: [
      { id: 1, text: "Dok, saya mau tanya tentang suplemen", isAdmin: false, time: "09:30", type: "text" },
      { id: 2, text: "Yang saya rasa selama minum Susu protein...", isAdmin: false, time: "09:32", type: "text" },
    ],
  },
  {
    id: 4,
    name: "Cece Majalengka",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cece&backgroundColor=ffd5dc",
    lastMessage: "Oke, mas. Terima kasih.",
    lastTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // kemarin
    unread: 0,
    messages: [
      { id: 1, text: "Mas, jadwal kunjungan saya kapan ya?", isAdmin: false, time: "14:00", type: "text" },
      { id: 2, text: "Jadwal kunjungan Ibu hari Jumat pukul 10.00", isAdmin: true, time: "14:05", type: "text" },
      { id: 3, text: "Oke, mas. Terima kasih.", isAdmin: false, time: "14:10", type: "text" },
    ],
  },
  {
    id: 5,
    name: "Fajar Sadboy",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fajar&backgroundColor=e8ffdb",
    lastMessage: "Saya habis diputusin.",
    lastTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // kemarin
    unread: 0,
    messages: [
      { id: 1, text: "Dok, saya stress berat", isAdmin: false, time: "20:00", type: "text" },
      { id: 2, text: "Saya habis diputusin.", isAdmin: false, time: "20:01", type: "text" },
    ],
  },
  {
    id: 6,
    name: "Nala Kusmala",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nala&backgroundColor=d1f4ff",
    lastMessage: "Baik terima kasih infonya",
    lastTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 hari lalu
    unread: 0,
    messages: [
      { id: 1, text: "Halo, apakah ada layanan home visit?", isAdmin: false, time: "08:00", type: "text" },
      { id: 2, text: "Ada, Bu. Kami menyediakan layanan home visit untuk area tertentu.", isAdmin: true, time: "08:10", type: "text" },
      { id: 3, text: "Baik terima kasih infonya", isAdmin: false, time: "08:15", type: "text" },
    ],
  },
  {
    id: 7,
    name: "Budi Santoso",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi&backgroundColor=b6e3f4",
    lastMessage: "Siap, saya akan datang sesuai jadwal",
    lastTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 hari lalu
    unread: 0,
    messages: [
      { id: 1, text: "Kapan jadwal kontrol saya berikutnya?", isAdmin: false, time: "11:00", type: "text" },
      { id: 2, text: "Jadwal kontrol Bapak tanggal 15 Juni", isAdmin: true, time: "11:05", type: "text" },
      { id: 3, text: "Siap, saya akan datang sesuai jadwal", isAdmin: false, time: "11:10", type: "text" },
    ],
  },
];

// ─── MAIN COMPONENT ────────────────────────────────
export default function Chat({ isOpen }) {
  const location = useLocation();
  const [activeChat, setActiveChat] = useState(location.state?.activeChat || null);
  const [filter, setFilter] = useState("semua"); // "semua" | "belum_dibaca"
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [chats, setChats] = useState(mockChats);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState(null); // { file, name, isImage, url }
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const attachMenuRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat, chats]);

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

  const activeChatData = chats.find((c) => c.id === activeChat);

  // Send message
  const handleSend = () => {
    if (!messageInput.trim() && !attachmentPreview) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== activeChat) return chat;

        const newMessages = [...chat.messages];

        // If attachment
        if (attachmentPreview) {
          newMessages.push({
            id: Date.now(),
            text: "",
            isAdmin: true,
            time: timeStr,
            type: attachmentPreview.isImage ? "image" : "document",
            imageUrl: attachmentPreview.isImage ? attachmentPreview.url : undefined,
            fileName: !attachmentPreview.isImage ? attachmentPreview.name : undefined,
          });
        }

        // If text
        if (messageInput.trim()) {
          newMessages.push({
            id: Date.now() + 1,
            text: messageInput.trim(),
            isAdmin: true,
            time: timeStr,
            type: "text",
          });
        }

        return {
          ...chat,
          messages: newMessages,
          lastMessage: messageInput.trim() || (attachmentPreview?.isImage ? "📷 Foto" : "📄 Dokumen"),
          lastTime: now,
        };
      })
    );

    setMessageInput("");
    setAttachmentPreview(null);
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
