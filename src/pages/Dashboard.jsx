import { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import {
  Users,
  UserRound,
  BriefcaseMedical,
  CheckCircle,
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
  verifyPayment
} from "../services/firestoreService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function Dashboard({ isOpen }) {
  const [patientsCount, setPatientsCount] = useState(0);
  const [nursesCount, setNursesCount] = useState(0);
  const [layananCount, setLayananCount] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [layananList, setLayananList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to Firestore collections
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

  // Compute weekly revenue for the chart
  const weeklyRevenue = useMemo(() => {
    const revenueByDay = [0, 0, 0, 0, 0, 0, 0]; // Min, Sen, Sel, Rab, Kam, Jum, Sab
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

  // Filter pending verifications
  const pendingVerifications = useMemo(() => {
    return transactions.filter(
      (tx) => tx.status_detail === "Selesai & Menunggu Validasi" || tx.status_detail === "Menunggu Validasi" || tx.status === "Menunggu Validasi"
    );
  }, [transactions]);

  // Filter schedules for today
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

  // Get recent 5 payments
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

  // Verify action
  const handleVerify = async (id) => {
    try {
      await verifyPayment(id, "Selesai", "Selesai");
      alert("Pesanan berhasil diverifikasi!");
    } catch (err) {
      console.error(err);
      alert("Gagal melakukan verifikasi!");
    }
  };

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

      {/* Greeting */}
      <div className="mt-8">
        <p className="text-lg text-gray-500">
          {getTodayDateFormatted()}
        </p>

        <h1 className="text-4xl font-bold text-[#214E8A]">
          Selamat Datang, Admin!
        </h1>
      </div>

      {/* Statistik */}
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

      {/* Chart + Verifikasi */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">
        {/* Analisis */}
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

        {/* Verifikasi */}
        <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#1B2559]">
              Verifikasi Pesanan Pasien
            </h2>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {pendingVerifications.length > 0 ? (
                pendingVerifications.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 rounded-2xl bg-gray-50 flex items-center justify-between border border-gray-100"
                  >
                    <div>
                      <p className="font-bold text-gray-800">{tx.nama_pasien}</p>
                      <p className="text-xs text-gray-500">
                        {tx.layanan} • {tx.id_pesanan}
                      </p>
                    </div>
                    <button
                      onClick={() => handleVerify(tx.id)}
                      className="flex items-center gap-1.5 bg-[#818807] hover:bg-[#818807]/90 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                    >
                      <CheckCircle size={14} />
                      <span>Verifikasi</span>
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">
                  Tidak ada pesanan menunggu verifikasi.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">
        {/* Jadwal Hari Ini */}
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

        {/* Histori Pembayaran */}
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