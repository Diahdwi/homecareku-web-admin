import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  Search,
  Bell,
  ShoppingBag,
  CreditCard,
  UserPlus,
  CheckCircle,
  Check,
  CheckCheck,
  X,
  ExternalLink,
  Clock,
} from "lucide-react";
import { 
  subscribeAdminNotifications, 
  assignNurseAndAcceptBooking, 
  rejectBooking, 
  verifyPayment 
} from "../services/firestoreService";
import { db } from "../config/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";


// ─── TIME FORMATTER ────────────────────────────────
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

// Full timestamp for detail view
function formatFullTimestamp(date) {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }) + " • " + date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── ICON HELPERS ──────────────────────────────────
function getNotifIcon(type, size = 20) {
  switch (type) {
    case "booking":
      return <ShoppingBag size={size} className="text-[#214E8A]" />;
    case "pembayaran":
      return <CreditCard size={size} className="text-[#818807]" />;
    case "perawat_baru":
      return <UserPlus size={size} className="text-green-600" />;
    case "verifikasi":
      return <CheckCircle size={size} className="text-orange-500" />;
    default:
      return <Bell size={size} className="text-[#214E8A]" />;
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

function getNotifLabel(type) {
  switch (type) {
    case "booking":
      return { text: "Booking", color: "bg-[#214E8A]/10 text-[#214E8A]" };
    case "pembayaran":
      return { text: "Pembayaran", color: "bg-[#818807]/10 text-[#818807]" };
    case "perawat_baru":
      return { text: "Perawat Baru", color: "bg-green-100 text-green-700" };
    case "verifikasi":
      return { text: "Verifikasi", color: "bg-orange-100 text-orange-700" };
    default:
      return { text: "Info", color: "bg-gray-100 text-gray-600" };
  }
}

// ─── MOCK DATA ─────────────────────────────────────
const mockNotifications = [
  {
    id: 1,
    type: "booking",
    judul: "Booking Baru Masuk",
    pesan: "Abyan Faza telah melakukan booking layanan Perawatan Luka pada tanggal 10 Juni 2026 pukul 10:00 WIB. Silakan lakukan pengecekan data antrean dan konfirmasi pesanan.",
    waktu: new Date(),
    is_read: false,
    pasien: "Abyan Faza",
    layanan: "Perawatan Luka",
    id_pesanan: "#A3F21C",
    actionType: "booking_confirm", // needs accept/reject
  },
  {
    id: 2,
    type: "pembayaran",
    judul: "Pembayaran Baru Terdeteksi",
    pesan: "Siti Kusmini telah menyelesaikan pembayaran sebesar Rp 350.000 untuk layanan Fisioterapi melalui QRIS. Status pembayaran menunggu verifikasi admin.",
    waktu: new Date(Date.now() - 15 * 60 * 1000),
    is_read: false,
    pasien: "Siti Kusmini",
    layanan: "Fisioterapi",
    id_pesanan: "#B7E90A",
    nominal: "Rp 350.000",
    metode: "QRIS",
    actionType: "payment_verify", // needs verify
  },
  {
    id: 3,
    type: "verifikasi",
    judul: "Menunggu Verifikasi Pembayaran",
    pesan: "Dedi Kokbuzer telah mengirim bukti transfer sebesar Rp 250.000 untuk layanan Cek Kesehatan. Silakan periksa bukti pembayaran dan lakukan validasi.",
    waktu: new Date(Date.now() - 45 * 60 * 1000),
    is_read: false,
    pasien: "Dedi Kokbuzer",
    layanan: "Cek Kesehatan",
    id_pesanan: "#C1D8F2",
    nominal: "Rp 250.000",
    metode: "Transfer Bank",
    actionType: "payment_verify",
  },
  {
    id: 4,
    type: "perawat_baru",
    judul: "Pendaftaran Perawat Baru",
    pesan: "Bintang Gumilang, S.Kep telah mendaftar sebagai perawat baru di sistem HomecareKu. Data pendaftaran siap untuk ditinjau.",
    waktu: new Date(Date.now() - 2 * 60 * 60 * 1000),
    is_read: true,
    pasien: null,
    actionType: "info",
  },
  {
    id: 5,
    type: "booking",
    judul: "Booking Baru Masuk",
    pesan: "Cece Majalengka telah melakukan booking layanan Perawatan Infus pada tanggal 11 Juni 2026 pukul 14:00 WIB. Silakan lakukan konfirmasi pesanan.",
    waktu: new Date(Date.now() - 5 * 60 * 60 * 1000),
    is_read: true,
    pasien: "Cece Majalengka",
    layanan: "Perawatan Infus",
    id_pesanan: "#D4A9E3",
    actionType: "booking_confirm",
  },
  {
    id: 6,
    type: "pembayaran",
    judul: "Pembayaran Berhasil Diverifikasi",
    pesan: "Pembayaran Fajar Sadboy untuk layanan Konsultasi Kesehatan sebesar Rp 150.000 telah berhasil diverifikasi. Status pesanan diperbarui menjadi Lunas.",
    waktu: new Date(Date.now() - 24 * 60 * 60 * 1000), // kemarin
    is_read: true,
    pasien: "Fajar Sadboy",
    layanan: "Konsultasi Kesehatan",
    id_pesanan: "#E5B2F1",
    nominal: "Rp 150.000",
    actionType: "info",
  },
  {
    id: 7,
    type: "booking",
    judul: "Booking Dikonfirmasi",
    pesan: "Booking Nala Kusmala untuk layanan Home Visit Perawatan Luka telah dikonfirmasi (Accepted). Perawat akan ditugaskan sesuai jadwal.",
    waktu: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 hari lalu
    is_read: true,
    pasien: "Nala Kusmala",
    layanan: "Home Visit Perawatan Luka",
    id_pesanan: "#F6C3A2",
    actionType: "info",
  },
  {
    id: 8,
    type: "verifikasi",
    judul: "Bukti Transfer Diterima",
    pesan: "Budi Santoso telah mengirim bukti transfer pembayaran untuk layanan Perawatan Pasca Operasi. Pembayaran sudah diverifikasi otomatis.",
    waktu: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 hari lalu
    is_read: true,
    pasien: "Budi Santoso",
    layanan: "Perawatan Pasca Operasi",
    id_pesanan: "#G7D4B3",
    nominal: "Rp 500.000",
    actionType: "info",
  },
];

// ─── MAIN COMPONENT ────────────────────────────────
export default function Notifikasi({ isOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [rawNotifications, setRawNotifications] = useState([]);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [filter, setFilter] = useState("semua"); // "semua" | "belum_dibaca"
  const [searchQuery, setSearchQuery] = useState("");

  const [activeNurses, setActiveNurses] = useState([]);
  const [selectedNurseId, setSelectedNurseId] = useState("");
  const [rejectId, setRejectId] = useState(null);
  const [alasan, setAlasan] = useState("");

  // Subscribe to real-time compiled notifications
  useEffect(() => {
    const unsubscribe = subscribeAdminNotifications((list) => {
      setRawNotifications(list);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to active on-shift nurses
  useEffect(() => {
    const qNurses = query(collection(db, "users"), where("status", "==", "on_shift"));
    const unsubscribeNurses = onSnapshot(qNurses, (snapshot) => {
      const nursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActiveNurses(nursesData);
    });
    return () => unsubscribeNurses();
  }, []);

  // Map notifications to include local storage read status
  const notifications = rawNotifications.map((n) => ({
    ...n,
    is_read: localStorage.getItem(`read_notif_${n.id}`) === "true"
  }));

  // Open specific notif from location state (e.g. from popup click)
  useEffect(() => {
    if (location.state?.activeNotif) {
      const notif = notifications.find((n) => n.id === location.state.activeNotif);
      if (notif) {
        setSelectedNotif(notif);
        markAsRead(notif.id);
      }
    }
  }, [location.state, rawNotifications]);

  // Mark as read
  const markAsRead = (id) => {
    localStorage.setItem(`read_notif_${id}`, "true");
    setRawNotifications((prev) => [...prev]);
  };

  // Mark all as read
  const markAllAsRead = () => {
    rawNotifications.forEach((n) => {
      localStorage.setItem(`read_notif_${n.id}`, "true");
    });
    setRawNotifications((prev) => [...prev]);
  };

  // Handle select notification
  const handleSelect = (notif) => {
    setSelectedNotif(notif);
    markAsRead(notif.id);
  };

  // Handle accept booking
  const handleAcceptBooking = async (notif) => {
    if (!selectedNurseId) {
      alert("Pilih perawat yang bertugas terlebih dahulu!");
      return;
    }
    const nurse = activeNurses.find((n) => n.id === selectedNurseId);
    if (!nurse) return;

    try {
      await assignNurseAndAcceptBooking(
        notif.bookingId,
        notif.id_pesanan,
        nurse.id,
        nurse.nama
      );
      markAsRead(notif.id);
      setSelectedNotif(null);
      setSelectedNurseId("");
      alert("Booking berhasil dikonfirmasi dan perawat telah ditugaskan!");
    } catch (e) {
      alert("Gagal melakukan verifikasi booking: " + e.message);
    }
  };

  // Handle reject booking
  const handleRejectBooking = async (notif, reason) => {
    if (!reason) {
      alert("Harap masukkan alasan penolakan!");
      return;
    }
    try {
      await rejectBooking(notif.bookingId, notif.id_pesanan, reason);
      markAsRead(notif.id);
      setSelectedNotif(null);
      setRejectId(null);
      setAlasan("");
      alert("Pesanan berhasil ditolak!");
    } catch (e) {
      alert("Gagal menolak pesanan: " + e.message);
    }
  };

  // Handle verify payment
  const handleVerifyPayment = async (notif) => {
    try {
      await verifyPayment(notif.bookingId, "Selesai", "selesai");
      markAsRead(notif.id);
      setSelectedNotif(null);
      alert("Pembayaran berhasil diverifikasi!");
    } catch (e) {
      alert("Gagal memverifikasi pembayaran: " + e.message);
    }
  };


  // Filtered
  const filteredNotifs = notifications
    .filter((n) => {
      if (filter === "belum_dibaca") return !n.is_read;
      return true;
    })
    .filter((n) =>
      n.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.pesan.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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

      {/* Notification Container */}
      <div className="mt-5 bg-white rounded-3xl shadow-sm overflow-hidden flex" style={{ height: "calc(100vh - 140px)" }}>

        {/* ═══ LEFT PANEL — NOTIFICATION LIST ═══ */}
        <div className={`
          w-[400px] border-r border-gray-100 flex flex-col flex-shrink-0
          ${selectedNotif ? "hidden lg:flex" : "flex"}
        `}>
          {/* Header */}
          <div className="p-4 pb-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-[#1B2559]">Notifikasi</h2>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-[#214E8A] hover:text-[#1a3f70] flex items-center gap-1 transition-colors"
                >
                  <CheckCheck size={14} />
                  Tandai semua dibaca
                </button>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari notifikasi..."
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
                flex items-center gap-1.5
                ${filter === "belum_dibaca"
                  ? "bg-[#214E8A] text-white shadow-md shadow-[#214E8A]/20"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
              `}
            >
              Belum Dibaca
              {unreadCount > 0 && (
                <span className={`
                  w-5 h-5 text-[10px] font-bold rounded-full flex items-center justify-center
                  ${filter === "belum_dibaca" ? "bg-white text-[#214E8A]" : "bg-[#214E8A] text-white"}
                `}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Notification Items */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Bell size={48} strokeWidth={1.5} />
                <p className="mt-3 text-sm">
                  {filter === "belum_dibaca"
                    ? "Semua notifikasi sudah dibaca"
                    : "Tidak ada notifikasi ditemukan"}
                </p>
              </div>
            ) : (
              filteredNotifs.map((notif) => {
                const label = getNotifLabel(notif.type);
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleSelect(notif)}
                    className={`
                      flex items-start gap-3
                      px-4 py-3.5
                      cursor-pointer
                      transition-all
                      border-b border-gray-50
                      ${selectedNotif?.id === notif.id
                        ? "bg-[#EBF0F7] border-l-4 border-l-[#214E8A]"
                        : !notif.is_read
                          ? "bg-[#F8FAFF] hover:bg-[#EBF0F7]"
                          : "hover:bg-gray-50"}
                    `}
                  >
                    {/* Icon */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${getNotifIconBg(notif.type)}`}>
                      {getNotifIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-snug ${!notif.is_read ? "font-bold text-[#1B2559]" : "font-semibold text-gray-600"}`}>
                          {notif.judul}
                        </p>
                        <span className={`text-[11px] flex-shrink-0 mt-0.5 ${!notif.is_read ? "text-[#214E8A] font-semibold" : "text-gray-400"}`}>
                          {formatNotifTime(notif.waktu)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {notif.pesan}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${label.color}`}>
                          {label.text}
                        </span>
                        {!notif.is_read && (
                          <span className="w-2 h-2 bg-[#214E8A] rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ═══ RIGHT PANEL — NOTIFICATION DETAIL ═══ */}
        <div className={`
          flex-1 flex flex-col
          ${!selectedNotif ? "hidden lg:flex" : "flex"}
        `}>
          {!selectedNotif ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="w-24 h-24 rounded-full bg-[#EBF0F7] flex items-center justify-center mb-4">
                <Bell size={48} strokeWidth={1.5} className="text-[#214E8A]" />
              </div>
              <p className="text-lg font-semibold text-gray-500">Pilih notifikasi</p>
              <p className="text-sm text-gray-400 mt-1">Pilih salah satu notifikasi untuk melihat detail</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {/* Detail Header */}
              <div className="px-8 pt-8 pb-6 border-b border-gray-100">
                {/* Back button (mobile) */}
                <button
                  onClick={() => setSelectedNotif(null)}
                  className="lg:hidden mb-4 text-sm text-[#214E8A] font-semibold flex items-center gap-1 hover:text-[#1a3f70] transition-colors"
                >
                  ← Kembali
                </button>

                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${getNotifIconBg(selectedNotif.type)}`}>
                    {getNotifIcon(selectedNotif.type, 28)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {(() => {
                        const label = getNotifLabel(selectedNotif.type);
                        return (
                          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${label.color}`}>
                            {label.text}
                          </span>
                        );
                      })()}
                    </div>
                    <h2 className="text-xl font-bold text-[#1B2559]">{selectedNotif.judul}</h2>
                    <div className="flex items-center gap-2 mt-1.5 text-gray-400">
                      <Clock size={14} />
                      <span className="text-xs">{formatFullTimestamp(selectedNotif.waktu)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Body */}
              <div className="px-8 py-6">
                <div className="bg-[#FAFBFD] rounded-2xl p-6 border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedNotif.pesan}
                  </p>
                </div>

                {/* Info Cards */}
                {(selectedNotif.pasien || selectedNotif.layanan || selectedNotif.id_pesanan) && (
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedNotif.pasien && (
                      <InfoCard label="Pasien" value={selectedNotif.pasien} />
                    )}
                    {selectedNotif.layanan && (
                      <InfoCard label="Layanan" value={selectedNotif.layanan} />
                    )}
                    {selectedNotif.id_pesanan && (
                      <InfoCard label="ID Pesanan" value={selectedNotif.id_pesanan} />
                    )}
                    {selectedNotif.nominal && (
                      <InfoCard label="Nominal" value={selectedNotif.nominal} />
                    )}
                    {selectedNotif.metode && (
                      <InfoCard label="Metode Pembayaran" value={selectedNotif.metode} />
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                {selectedNotif.actionType === "booking_confirm" && (
                  <div className="mt-6 flex flex-col gap-4">
                    {/* Choose Nurse Dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">Pilih Perawat Bertugas</label>
                      <select
                        value={selectedNurseId}
                        onChange={(e) => setSelectedNurseId(e.target.value)}
                        className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm outline-none focus:border-[#214E8A]"
                      >
                        <option value="">-- Pilih Perawat Bertugas --</option>
                        {activeNurses.map((nurse) => (
                          <option key={nurse.id} value={nurse.id}>
                            {nurse.nama} (On Shift)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleAcceptBooking(selectedNotif)}
                        className="
                          flex-1
                          py-3
                          rounded-xl
                          bg-[#818807]
                          hover:bg-[#6e7406]
                          text-white
                          font-semibold text-sm
                          flex items-center justify-center gap-2
                          transition-colors
                          shadow-sm
                        "
                      >
                        <Check size={18} />
                        Terima Booking
                      </button>
                      <button
                        onClick={() => setRejectId(selectedNotif.id)}
                        className="
                          flex-1
                          py-3
                          rounded-xl
                          bg-white
                          border-2 border-red-400
                          text-red-500
                          hover:bg-red-50
                          font-semibold text-sm
                          flex items-center justify-center gap-2
                          transition-colors
                        "
                      >
                        <X size={18} />
                        Tolak Booking
                      </button>
                    </div>

                    {rejectId === selectedNotif.id && (
                      <div className="flex gap-2 w-full mt-2 border-t border-gray-100 pt-4">
                        <input
                          className="border border-gray-200 p-2.5 w-full text-xs rounded-xl focus:outline-none focus:border-[#214E8A]"
                          placeholder="Masukkan alasan penolakan..."
                          value={alasan}
                          onChange={(e) => setAlasan(e.target.value)}
                        />
                        <button
                          onClick={() => handleRejectBooking(selectedNotif, alasan)}
                          className="bg-[#214E8A] hover:bg-[#1B2559] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
                        >
                          Kirim
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {selectedNotif.actionType === "payment_verify" && (
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      onClick={() => handleVerifyPayment(selectedNotif)}
                      className="
                        flex-1
                        py-3
                        rounded-xl
                        bg-[#214E8A]
                        hover:bg-[#1a3f70]
                        text-white
                        font-semibold text-sm
                        flex items-center justify-center gap-2
                        transition-colors
                        shadow-lg shadow-[#214E8A]/20
                      "
                    >
                      <CheckCircle size={18} />
                      Verifikasi Pembayaran
                    </button>
                    <button
                      onClick={() => navigate("/transaksi")}
                      className="
                        py-3 px-5
                        rounded-xl
                        bg-white
                        border border-gray-200
                        text-gray-600
                        hover:bg-gray-50
                        font-semibold text-sm
                        flex items-center justify-center gap-2
                        transition-colors
                      "
                    >
                      <ExternalLink size={16} />
                      Lihat Transaksi
                    </button>
                  </div>
                )}

                {selectedNotif.actionType === "info" && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <CheckCheck size={16} />
                      <span>Notifikasi ini tidak memerlukan tindakan lebih lanjut</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── INFO CARD COMPONENT ───────────────────────────
function InfoCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <p className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-[#1B2559] mt-1">{value}</p>
    </div>
  );
}
