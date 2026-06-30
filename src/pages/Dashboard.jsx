import { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import {
  Users,
  UserRound,
  BriefcaseMedical,
  CheckCircle,
  X,
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

import {
  subscribePatients,
  subscribeNurses,
  subscribeLayanan,
  subscribeTransactions,
  toTitleCase,
} from "../services/firestoreService";

// Import Firebase milikmu untuk sinkronisasi Verifikasi
import { db } from "../config/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs, getDoc, setDoc } from "firebase/firestore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function Dashboard({ isOpen }) {
  // === STATE MILIK TEMANMU ===
  const [patientsCount, setPatientsCount] = useState(0);
  const [nursesCount, setNursesCount] = useState(0);
  const [layananCount, setLayananCount] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [layananList, setLayananList] = useState([]);
  const [loading, setLoading] = useState(true);

  // === STATE MILIKMU (Untuk Verifikasi) ===
  const [pendingOrders, setPendingOrders] = useState([]);
  const [rejectId, setRejectId] = useState(null);
  const [alasan, setAlasan] = useState("");
  
  // === STATE BARU: Untuk menyimpan perawat on_shift dan perawat yang dipilih admin ===
  const [activeNurses, setActiveNurses] = useState([]);
  const [selectedNurses, setSelectedNurses] = useState({}); // Menyimpan pilihan per tiap pesanan
  const [allSchedules, setAllSchedules] = useState([]);

  // === STATE UNTUK PENGATURAN QRIS PEMBAYARAN ===
  const [qrisImage, setQrisImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);

  useEffect(() => {
    const fetchQris = async () => {
      try {
        const docRef = doc(db, "settings", "payment");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setQrisImage(docSnap.data().qrCodeBase64);
        }
      } catch (e) {
        console.error("Error fetching QRIS: ", e);
      }
    };
    fetchQris();
  }, []);

  const handleQrisChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadStatus({ type: "error", message: "File harus berupa gambar!" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        const docRef = doc(db, "settings", "payment");
        await setDoc(docRef, { qrCodeBase64: base64String }, { merge: true });
        setQrisImage(base64String);
        setUploadStatus({ type: "success", message: "Gambar QRIS berhasil diperbarui!" });
      } catch (err) {
        console.error("Error saving QRIS:", err);
        setUploadStatus({ type: "error", message: "Gagal menyimpan QRIS ke database." });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteQris = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus gambar QRIS kustom dan kembali ke default?")) {
      try {
        const docRef = doc(db, "settings", "payment");
        await setDoc(docRef, { qrCodeBase64: "" }, { merge: true });
        setQrisImage(null);
        setUploadStatus({ type: "success", message: "Gambar QRIS berhasil di-reset ke default!" });
      } catch (err) {
        console.error("Error deleting QRIS:", err);
        setUploadStatus({ type: "error", message: "Gagal me-reset gambar QRIS." });
      }
    }
  };

  // === STATE FILTER BULAN DAN TAHUN ===
  const [filterType, setFilterType] = useState("Per Minggu");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // === EFFECT: Ambil Data Jadwal Tindakan langsung dari Pesanan ===
  useEffect(() => {
    const q = collection(db, "pesanan");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllSchedules(docs);
    });

    return () => unsubscribe();
  }, []);

  const todaySchedulesFromDb = useMemo(() => {
    const todayStr = new Date().toDateString();
    const filtered = allSchedules.filter(doc => {
      if (!doc.tanggal_booking) return false;
      const d = doc.tanggal_booking.toDate ? doc.tanggal_booking.toDate() : new Date(doc.tanggal_booking);
      return d.toDateString() === todayStr;
    });

    filtered.sort((a, b) => {
      const jamA = (a.jam_booking || '').toString();
      const jamB = (b.jam_booking || '').toString();
      const cmp = jamA.localeCompare(jamB);
      if (cmp !== 0) return cmp;
      const tA = a.created_at?.seconds || 0;
      const tB = b.created_at?.seconds || 0;
      return tA - tB;
    });
    return filtered;
  }, [allSchedules]);

  // === EFFECT: Ambil Data Perawat yang On Shift ===
  useEffect(() => {
    const qNurses = query(collection(db, "users"), where("status", "in", ["on_shift", "Sedang Bertugas"]));
    const unsubscribeNurses = onSnapshot(qNurses, (snapshot) => {
      const nursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActiveNurses(nursesData);
    });
    return () => unsubscribeNurses();
  }, []);

  // === EFFECT MILIK TEMANMU (Subscribe Dashboard Data) ===
  useEffect(() => {
    const unsubPatients = subscribePatients((list) => {
      setPatientsCount(list.length);
    });

    const unsubNurses = subscribeNurses((list) => {
      setNursesCount(list.length);
    });

    const unsubLayanan = subscribeLayanan((list) => {
      setLayananCount(list.length);
      setLayananList(list);
    });

    const unsubTransactions = subscribeTransactions((list) => {
      setTransactions(list);
      setLoading(false);
    });

    return () => {
      unsubPatients();
      unsubNurses();
      unsubLayanan();
      unsubTransactions();
    };
  }, []);

  // === EFFECT MILIKMU (Subscribe Antrean Verifikasi) ===
  useEffect(() => {
    const q = query(
      collection(db, "bookings"),
      where("status", "==", "Menunggu Verifikasi")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const ordersPromises = snapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        let tglBooking = data.tanggal_booking;
        let jamBooking = data.jam_booking;
        let tempatLayanan = data.tempat_layanan;

        if ((!tglBooking || !tempatLayanan) && data.id_pesanan) {
          try {
            const pQuery = query(collection(db, "pesanan"), where("id_pesanan", "==", data.id_pesanan));
            const pRes = await getDocs(pQuery);
            if (!pRes.empty) {
              const pData = pRes.docs[0].data();
              if (!tglBooking) tglBooking = pData.tanggal_booking;
              if (!jamBooking) jamBooking = pData.jam_booking;
              if (!tempatLayanan) tempatLayanan = pData.tempat_layanan;
            }
          } catch (error) {
            console.error("Gagal menarik detail waktu pesanan:", error);
          }
        }

        return {
          id_doc: docSnapshot.id,
          id_pesanan: data.id_pesanan, 
          nama: toTitleCase(data.pasien?.nama || "Tanpa Nama"),
          ...data,
          tanggal_booking: tglBooking, 
          jam_booking: jamBooking,     
          tempat_layanan: tempatLayanan,
        };
      });

      const resolvedOrders = await Promise.all(ordersPromises);
      setPendingOrders(resolvedOrders);
    });

    return () => unsubscribe();
  }, []);

  // === FUNGSI VERIFIKASI MILIKMU (Diperbarui dengan Pemilihan Perawat) ===
  const handleVerifikasi = async (id_doc, id_pesanan) => {
    // 1. Cek apakah admin sudah memilih perawat
    const nurseId = selectedNurses[id_doc];
    if (!nurseId) {
      alert("Pilih perawat yang bertugas terlebih dahulu!");
      return;
    }

    // Dapatkan data perawat yang dipilih
    const selectedNurseData = activeNurses.find(n => n.id === nurseId);
    const order = pendingOrders.find(o => o.id_doc === id_doc);

    try {
      // 2. Update status dan data perawat di koleksi 'bookings' 
      await updateDoc(doc(db, "bookings", id_doc), { 
        status: "Terjadwal",
        perawat: {
          id_perawat: selectedNurseData.id,
          nama: selectedNurseData.nama
        }
      });
      
      // 3. Sinkronisasi ke koleksi 'pesanan'
      if (id_pesanan) {
        const q = query(collection(db, "pesanan"), where("id_pesanan", "==", id_pesanan));
        const res = await getDocs(q);
        
        res.forEach(async (d) => {
          await updateDoc(doc(db, "pesanan", d.id), { 
              status: "Terjadwal", 
              status_detail: "Menunggu Kedatangan",
              id_perawat: selectedNurseData.id,       // Tambahan agar masuk ke app perawat
              nama_perawat: selectedNurseData.nama    // Tambahan agar masuk ke app perawat
          });
        });
      }

      // 4. Kirim Push Notification ke Perawat dan Pasien via Backend
      const backendUrl = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://pbl-homecareku-backend.vercel.app";

      if (order) {
        // Notifikasi ke perawat
        fetch(`${backendUrl}/api/pesanan/send-assignment-notification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nurseId: selectedNurseData.id,
            patientName: order.pasien?.nama || order.nama,
            bookingId: order.id_pesanan
          })
        }).catch(err => console.error("Gagal kirim notif ke perawat:", err));

        // Notifikasi ke pasien
        fetch(`${backendUrl}/api/pesanan/send-status-notification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: order.pasien?.id_pasien,
            statusDetail: "Menunggu Kedatangan",
            bookingId: order.id_pesanan
          })
        }).catch(err => console.error("Gagal kirim notif ke pasien:", err));
      }
      
      alert("Pesanan berhasil diverifikasi dan perawat telah ditugaskan!");
    } catch (e) { 
      alert("Gagal melakukan sinkronisasi: " + e.message); 
    }
  };

  const handleTolak = async (id_doc, id_pesanan) => {
    if (!alasan) return alert("Harap isi alasan penolakan");
    const order = pendingOrders.find(o => o.id_doc === id_doc);
    try {
      await updateDoc(doc(db, "bookings", id_doc), { status: "Ditolak", alasan: alasan });
      
      if (id_pesanan) {
        const q = query(collection(db, "pesanan"), where("id_pesanan", "==", id_pesanan));
        const res = await getDocs(q);
        res.forEach(async (d) => await updateDoc(doc(db, "pesanan", d.id), { 
            status: "Ditolak", 
            status_detail: "Ditolak", 
            alasan_tolak: alasan      
        }));
      }

      // Kirim Push Notification penolakan ke pasien
      const backendUrl = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://pbl-homecareku-backend.vercel.app";

      if (order) {
        fetch(`${backendUrl}/api/pesanan/send-status-notification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: order.pasien?.id_pasien,
            statusDetail: "Ditolak",
            bookingId: order.id_pesanan
          })
        }).catch(err => console.error("Gagal kirim notif penolakan ke pasien:", err));
      }

      setRejectId(null);
      setAlasan("");
      alert("Pesanan ditolak");
    } catch (e) { alert("Gagal: " + e.message); }
  };

  // === COMPUTE LOGIC MILIK TEMANMU ===
  const revenueData = useMemo(() => {
    const getTransactionPrice = (tx) => {
      let price = tx.harga || 0;
      if (!price && tx.layanan) {
        const matchingLayanan = layananList.find(
          (l) => l.nama.toLowerCase() === tx.layanan.toLowerCase()
        );
        if (matchingLayanan && matchingLayanan.harga) {
          const parsed = parseInt(matchingLayanan.harga.toString().replace(/[^0-9]/g, ""), 10);
          if (!isNaN(parsed)) price = parsed;
        }
      }
      if (!price) price = 100000;
      return price;
    };

    if (filterType === "Per Minggu") {
      const revenueByDay = [0, 0, 0, 0, 0, 0, 0];
      const now = new Date();
      const currentDay = now.getDay();
      
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - currentDay);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      transactions.forEach((tx) => {
        if (tx.status === "Lunas") {
          let tgl = new Date();
          if (tx.tanggal_booking) {
            tgl = tx.tanggal_booking.toDate ? tx.tanggal_booking.toDate() : new Date(tx.tanggal_booking);
          }

          if (tgl >= startOfWeek && tgl <= endOfWeek) {
            const dayIndex = tgl.getDay();
            revenueByDay[dayIndex] += getTransactionPrice(tx);
          }
        }
      });

      return {
        labels: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
        data: revenueByDay,
      };
    } else if (filterType === "Per Bulan") {
      const numDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const revenueByDate = Array(numDays).fill(0);
      const labels = Array.from({ length: numDays }, (_, i) => (i + 1).toString());

      transactions.forEach((tx) => {
        if (tx.status === "Lunas") {
          let tgl = new Date();
          if (tx.tanggal_booking) {
            tgl = tx.tanggal_booking.toDate ? tx.tanggal_booking.toDate() : new Date(tx.tanggal_booking);
          }

          if (tgl.getMonth() === selectedMonth && tgl.getFullYear() === selectedYear) {
            const dateIndex = tgl.getDate() - 1;
            if (dateIndex >= 0 && dateIndex < numDays) {
              revenueByDate[dateIndex] += getTransactionPrice(tx);
            }
          }
        }
      });

      return {
        labels,
        data: revenueByDate,
      };
    } else if (filterType === "Per Tahun") {
      const revenueByMonth = Array(12).fill(0);
      const labels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

      transactions.forEach((tx) => {
        if (tx.status === "Lunas") {
          let tgl = new Date();
          if (tx.tanggal_booking) {
            tgl = tx.tanggal_booking.toDate ? tx.tanggal_booking.toDate() : new Date(tx.tanggal_booking);
          }

          if (tgl.getFullYear() === selectedYear) {
            const monthIndex = tgl.getMonth();
            revenueByMonth[monthIndex] += getTransactionPrice(tx);
          }
        }
      });

      return {
        labels,
        data: revenueByMonth,
      };
    }

    return { labels: [], data: [] };
  }, [filterType, selectedMonth, selectedYear, transactions, layananList]);

  const chartData = {
    labels: revenueData.labels,
    datasets: [
      {
        label: "Pemasukan",
        data: revenueData.data,
        backgroundColor: "#214E8A",
        borderRadius: 12,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `Rp ${context.raw.toLocaleString("id-ID")}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) =>
            `${(value / 1000).toFixed(0)}k`,
        },
      },
    },
  };

  const todaySchedules = useMemo(() => {
    const todayStr = new Date().toDateString();
    return transactions.filter((tx) => {
      let tgl = new Date();
      if (tx.tanggal_booking) {
        tgl = tx.tanggal_booking.toDate ? tx.tanggal_booking.toDate() : new Date(tx.tanggal_booking);
      }
      return tgl.toDateString() === todayStr && tx.status !== "Batal";
    });
  }, [transactions]);

  const recentPayments = useMemo(() => {
    return transactions
      .slice(0, 5)
      .map((tx) => {
        let price = tx.harga || 0;
        if (!price) {
          const matchingLayanan = layananList.find(
            (l) => l.nama.toLowerCase() === tx.layanan.toLowerCase()
          );
          if (matchingLayanan && matchingLayanan.harga) {
            const parsed = parseInt(matchingLayanan.harga.toString().replace(/[^0-9]/g, ""), 10);
            if (!isNaN(parsed)) price = parsed;
          }
        }
        if (!price) price = 100000;
        return {
          id: tx.id,
          id_pesanan: tx.id_pesanan || "#A000",
          method: tx.metode_pembayaran || "Tunai",
          price: price,
        };
      });
  }, [transactions, layananList]);

  const isNurseBusy = (nurseId, order) => {
    if (!order || !order.tanggal_booking) return false;
    const orderDate = order.tanggal_booking.toDate ? order.tanggal_booking.toDate() : new Date(order.tanggal_booking);
    const orderDateStr = orderDate.toDateString();
    
    const normalizeTime = (timeStr) => {
      if (!timeStr) return "";
      return timeStr.toString().replaceAll(".", ":").replaceAll(" WIB", "").trim();
    };
    
    const orderJam = normalizeTime(order.jam_booking);
    
    return allSchedules.some(schedule => {
      if (schedule.id_perawat !== nurseId) return false;
      if (schedule.status === "Ditolak" || schedule.status_detail === "Ditolak" || schedule.status_detail === "Selesai") return false;
      
      const schedDate = schedule.tanggal_booking?.toDate ? schedule.tanggal_booking.toDate() : new Date(schedule.tanggal_booking);
      const schedDateStr = schedDate.toDateString();
      const schedJam = normalizeTime(schedule.jam_booking);
      
      return schedDateStr === orderDateStr && schedJam === orderJam;
    });
  };

  const isNurseLocationMismatch = (nurse, order) => {
    if (!order || !nurse) return false;
    const orderLoc = order.tempat_layanan || "Rumah";
    const isNurseAtRumah = nurse.lokasi === true; 
    
    if (orderLoc === "Klinik") {
      return isNurseAtRumah;
    }
    return !isNurseAtRumah;
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "Rp 0";
    const formattedVal = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `Rp ${formattedVal}`;
  };

  const getTodayDateFormatted = () => {
    return new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatBookingDate = (timestamp) => {
    if (!timestamp) return "-";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return "-";
    }
  };

  const qrisSrc = qrisImage ? (qrisImage.startsWith('data:image/') ? qrisImage : 'data:image/png;base64,' + qrisImage) : '';

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

      <div className="mt-8">
        <p className="text-lg text-gray-500">
          {getTodayDateFormatted()}
        </p>

        <h1 className="text-4xl font-bold text-[#214E8A]">
          Selamat Datang, Admin!
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <Users size={32} className="text-[#818807]" />
          <p className="mt-4 text-gray-500 font-semibold">Total Pasien</p>
          <h2 className="text-5xl font-bold mt-2 text-black">{patientsCount}</h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <UserRound size={32} className="text-[#818807]" />
          <p className="mt-4 text-gray-500 font-semibold">Total Perawat</p>
          <h2 className="text-5xl font-bold mt-2 text-black">{nursesCount}</h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <BriefcaseMedical size={32} className="text-[#818807]" />
          <p className="mt-4 text-gray-500 font-semibold">Total Layanan</p>
          <h2 className="text-5xl font-bold mt-2 text-black">{layananCount}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-[#1B2559]">Analisis Pemasukan</h2>
            <div className="flex flex-wrap gap-2 items-center">
              {filterType === "Per Bulan" && (
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="text-xs font-semibold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-full bg-gray-50 focus:outline-none focus:border-[#214E8A] cursor-pointer"
                >
                  <option value={0}>Januari</option>
                  <option value={1}>Februari</option>
                  <option value={2}>Maret</option>
                  <option value={3}>April</option>
                  <option value={4}>Mei</option>
                  <option value={5}>Juni</option>
                  <option value={6}>Juli</option>
                  <option value={7}>Agustus</option>
                  <option value={8}>September</option>
                  <option value={9}>Oktober</option>
                  <option value={10}>November</option>
                  <option value={11}>Desember</option>
                </select>
              )}

              {(filterType === "Per Bulan" || filterType === "Per Tahun") && (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="text-xs font-semibold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-full bg-gray-50 focus:outline-none focus:border-[#214E8A] cursor-pointer"
                >
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-xs font-semibold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-full bg-gray-50 focus:outline-none focus:border-[#214E8A] cursor-pointer"
              >
                <option value="Per Minggu">Per Minggu</option>
                <option value="Per Bulan">Per Bulan</option>
                <option value="Per Tahun">Per Tahun</option>
              </select>
            </div>
          </div>

          <div className="h-[320px]">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#1B2559]">
              Verifikasi Pesanan Pasien
            </h2>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {pendingOrders.length > 0 ? (
                pendingOrders.map((order) => (
                  <div
                    key={order.id_doc}
                    className="p-4 rounded-2xl bg-gray-50 flex flex-col gap-3 border border-gray-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-full pr-4">
                        <p className="font-bold text-gray-800">
                          {toTitleCase(order.nama)}{" "}
                          {order.id_pesanan && (
                            <span className="text-xs font-normal text-gray-400">
                              ({order.id_pesanan.startsWith('#A') ? order.id_pesanan.replace('#A', 'P') : order.id_pesanan})
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.layanan?.nama_layanan || order.layanan} • {order.tempat_layanan || "Rumah"}
                        </p>
                        <p className="text-xs font-semibold text-[#214E8A] mt-1">
                          {formatBookingDate(order.tanggal_booking)} | {order.jam_booking || "-"}
                        </p>
                        
                        {/* === DROPDOWN PILIH PERAWAT === */}
                        <div className="mt-3 w-full">
                          <select 
                            className="border border-gray-200 p-2 w-full text-xs rounded-xl focus:outline-none focus:border-[#214E8A] focus:ring-1 focus:ring-[#214E8A] bg-white cursor-pointer"
                            value={selectedNurses[order.id_doc] || ""}
                            onChange={(e) => setSelectedNurses({...selectedNurses, [order.id_doc]: e.target.value})}
                          >
                            <option value="">-- Pilih Perawat Bertugas --</option>
                             {activeNurses
                              .filter((nurse) => !isNurseLocationMismatch(nurse, order))
                              .map((nurse) => {
                                const busy = isNurseBusy(nurse.id, order);
                                return (
                                  <option key={nurse.id} value={nurse.id} disabled={busy}>
                                    {toTitleCase(nurse.nama)} (On Shift) {busy ? "- SIBUK DI JAM INI" : ""}
                                  </option>
                                );
                              })}
                          </select>
                        </div>
                        {/* === END DROPDOWN === */}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleVerifikasi(order.id_doc, order.id_pesanan)}
                          className="flex items-center justify-center gap-1.5 bg-[#818807] hover:bg-[#818807]/90 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm"
                        >
                          <CheckCircle size={14} />
                          <span className="hidden sm:inline">Terima</span>
                        </button>
                        <button
                          onClick={() => setRejectId(order.id_doc)}
                          className="flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm"
                        >
                          <X size={14} />
                          <span className="hidden sm:inline">Tolak</span>
                        </button>
                      </div>
                    </div>
                    {rejectId === order.id_doc && (
                      <div className="flex gap-2 w-full mt-1 border-t border-gray-200 pt-3">
                        <input
                          className="border border-gray-200 p-2 w-full text-xs rounded-xl focus:outline-none focus:border-[#214E8A] focus:ring-1 focus:ring-[#214E8A]"
                          placeholder="Masukkan alasan penolakan..."
                          onChange={(e) => setAlasan(e.target.value)}
                        />
                        <button
                          onClick={() => handleTolak(order.id_doc, order.id_pesanan)}
                          className="bg-[#214E8A] hover:bg-[#1B2559] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                        >
                          Kirim
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">
                  Tidak ada antrean verifikasi.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-4 text-[#1B2559]">
            Jadwal Tindakan Hari Ini
          </h2>

          <div className="overflow-x-auto max-h-[300px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="py-2 text-xs font-bold text-gray-400 uppercase">Antrean</th>
                  <th className="py-2 text-xs font-bold text-gray-400 uppercase">Pasien</th>
                  <th className="py-2 text-xs font-bold text-gray-400 uppercase">Layanan</th>
                  <th className="py-2 text-xs font-bold text-gray-400 uppercase">Perawat</th>
                  <th className="py-2 text-xs font-bold text-gray-400 uppercase text-right">Jam</th>
                </tr>
              </thead>

              <tbody>
                {todaySchedulesFromDb.length > 0 ? (
                  todaySchedulesFromDb.map((tx, index) => {
                    const queueNum = '#A' + String(index + 1).padStart(3, '0');
                    return (
                      <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-3 text-sm font-bold text-[#818807]">
                          {queueNum}
                        </td>
                        <td className="py-3 text-sm font-semibold text-[#1B2559]">
                          {toTitleCase(tx.nama_pasien)}
                        </td>
                        <td className="py-3 text-sm text-gray-500">
                          {tx.layanan}
                        </td>
                        <td className="py-3 text-sm text-gray-500">
                          {tx.nama_perawat ? toTitleCase(tx.nama_perawat) : <span className="text-red-500 font-semibold">Belum Ditugaskan</span>}
                        </td>
                        <td className="py-3 text-sm font-bold text-[#214E8A] text-right">
                          {tx.jam_booking}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                      Tidak ada tindakan terjadwal hari ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-4 text-[#1B2559]">
            Histori Pembayaran
          </h2>

          <div className="overflow-x-auto max-h-[300px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="py-2 text-xs font-bold text-gray-400 uppercase">ID</th>
                  <th className="py-2 text-xs font-bold text-gray-400 uppercase">Metode</th>
                  <th className="py-2 text-xs font-bold text-gray-400 uppercase text-right">Nominal</th>
                </tr>
              </thead>

              <tbody>
                {recentPayments.length > 0 ? (
                  recentPayments.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 text-sm font-semibold text-[#1B2559]">
                        {p.id_pesanan}
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {p.method}
                      </td>
                      <td className="py-3 text-sm font-bold text-[#79B735] text-right">
                        {formatCurrency(p.price)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-400 text-sm">
                      Belum ada transaksi pembayaran.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PENGATURAN QRIS PEMBAYARAN */}
      <div className="bg-white rounded-3xl p-6 shadow-sm mt-5">
        <h2 className="text-2xl font-bold mb-4 text-[#1B2559]">
          Pengaturan QRIS Pembayaran
        </h2>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="border border-gray-200 p-4 rounded-2xl bg-gray-50 flex items-center justify-center w-[200px] h-[200px]">
            {qrisImage ? (
              <img
                src={qrisSrc}
                alt="QRIS Pembayaran"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-gray-400 text-sm text-center">Belum ada gambar QRIS. Menggunakan default aplikasi.</div>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-3 w-full">
            <p className="text-gray-500 text-sm">
              Unggah gambar QR Code / QRIS baru untuk mengganti kode pembayaran statis yang ditampilkan pada aplikasi Pasien & Perawat.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="bg-[#214E8A] hover:bg-[#1B2559] text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-all shadow-sm text-center">
                Pilih Gambar QRIS
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrisChange}
                  className="hidden"
                />
              </label>
              {qrisImage && (
                <button
                  onClick={handleDeleteQris}
                  className="border border-red-500 text-red-500 hover:bg-red-50 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
                >
                  Hapus & Reset ke Default
                </button>
              )}
            </div>
            {uploadStatus && (
              <span className={uploadStatus.type === 'success' ? 'text-sm text-green-600' : 'text-sm text-red-600'}>
                {uploadStatus.message}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}