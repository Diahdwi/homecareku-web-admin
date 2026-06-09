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
} from "../services/firestoreService";

// Import Firebase milikmu untuk sinkronisasi Verifikasi
import { db } from "../config/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from "firebase/firestore";

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

  // === EFFECT: Ambil Data Perawat yang On Shift ===
  useEffect(() => {
    const qNurses = query(collection(db, "users"), where("status", "==", "on_shift"));
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

        if (!tglBooking && data.id_pesanan) {
          try {
            const pQuery = query(collection(db, "pesanan"), where("id_pesanan", "==", data.id_pesanan));
            const pRes = await getDocs(pQuery);
            if (!pRes.empty) {
              const pData = pRes.docs[0].data();
              tglBooking = pData.tanggal_booking;
              jamBooking = pData.jam_booking;
            }
          } catch (error) {
            console.error("Gagal menarik detail waktu pesanan:", error);
          }
        }

        return {
          id_doc: docSnapshot.id,
          id_pesanan: data.id_pesanan, 
          nama: data.pasien?.nama || "Tanpa Nama",
          ...data,
          tanggal_booking: tglBooking, 
          jam_booking: jamBooking,     
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
      
      alert("Pesanan berhasil diverifikasi dan perawat telah ditugaskan!");
    } catch (e) { 
      alert("Gagal melakukan sinkronisasi: " + e.message); 
    }
  };

  const handleTolak = async (id_doc, id_pesanan) => {
    if (!alasan) return alert("Harap isi alasan penolakan");
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
      setRejectId(null);
      setAlasan("");
      alert("Pesanan ditolak");
    } catch (e) { alert("Gagal: " + e.message); }
  };

  // === COMPUTE LOGIC MILIK TEMANMU ===
  const weeklyRevenue = useMemo(() => {
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
      let uiStatus = "Lunas";
      if (tx.status_detail === "Batal" || tx.status === "Batal" || tx.status === "Tidak Selesai") {
        uiStatus = "Batal";
      }

      if (uiStatus === "Lunas") {
        let tgl = new Date();
        if (tx.tanggal_booking) {
          tgl = tx.tanggal_booking.toDate ? tx.tanggal_booking.toDate() : new Date(tx.tanggal_booking);
        }

        if (tgl >= startOfWeek && tgl <= endOfWeek) {
          const dayIndex = tgl.getDay();
          const matchingLayanan = layananList.find(
            (l) => l.nama.toLowerCase() === tx.layanan.toLowerCase()
          );
          let price = 100000;
          if (matchingLayanan && matchingLayanan.harga) {
            const parsed = parseInt(matchingLayanan.harga.toString().replace(/[^0-9]/g, ""), 10);
            if (!isNaN(parsed)) price = parsed;
          }
          revenueByDay[dayIndex] += price;
        }
      }
    });

    return revenueByDay;
  }, [transactions, layananList]);

  const chartData = {
    labels: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
    datasets: [
      {
        label: "Pemasukan",
        data: weeklyRevenue,
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
      .filter((tx) => {
        let uiStatus = "Lunas";
        if (tx.status_detail === "Batal" || tx.status === "Batal" || tx.status === "Tidak Selesai") {
          uiStatus = "Batal";
        }
        return uiStatus === "Lunas";
      })
      .slice(0, 5)
      .map((tx) => {
        const matchingLayanan = layananList.find(
          (l) => l.nama.toLowerCase() === tx.layanan.toLowerCase()
        );
        let price = 100000;
        if (matchingLayanan && matchingLayanan.harga) {
          const parsed = parseInt(matchingLayanan.harga.toString().replace(/[^0-9]/g, ""), 10);
          if (!isNaN(parsed)) price = parsed;
        }
        return {
          id: tx.id,
          id_pesanan: tx.id_pesanan || "#A000",
          method: tx.metode_pembayaran || "Tunai",
          price: price,
        };
      });
  }, [transactions, layananList]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#1B2559]">Analisis Pemasukan</h2>
            <span className="text-sm font-semibold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
              Minggu Ini
            </span>
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
                        <p className="font-bold text-gray-800">{order.nama}</p>
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
                            {activeNurses.map((nurse) => (
                              <option key={nurse.id} value={nurse.id}>
                                {nurse.nama} (On Shift)
                              </option>
                            ))}
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
                  <th className="py-2 text-xs font-bold text-gray-400 uppercase">Pasien</th>
                  <th className="py-2 text-xs font-bold text-gray-400 uppercase">Layanan</th>
                  <th className="py-2 text-xs font-bold text-gray-400 uppercase text-right">Jam</th>
                </tr>
              </thead>

              <tbody>
                {todaySchedules.length > 0 ? (
                  todaySchedules.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 text-sm font-semibold text-[#1B2559]">
                        {tx.nama_pasien}
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {tx.layanan}
                      </td>
                      <td className="py-3 text-sm font-bold text-[#214E8A] text-right">
                        {tx.jam_booking}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-400 text-sm">
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
    </div>
  );
}