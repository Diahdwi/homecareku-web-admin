import Header from "../components/Header";
import {
  Users,
  UserRound,
  BriefcaseMedical,
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function Dashboard({ isOpen }) {
  const chartData = {
    labels: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
    datasets: [
      {
        label: "Pemasukan",
        data: [350000, 220000, 350000, 350000, 470000, 180000, 420000],
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

  return (
    <div
      className={`
  bg-[#ECECEC]
  min-h-screen
  p-5
  transition-all
  duration-300

  ${isOpen
    ? "lg:ml-[280px]"
    : "lg:ml-[90px]"
  }
`}
    >
      <Header />

      {/* Greeting */}
      <div className="mt-8">
        <p className="text-lg text-gray-500">
          Minggu, 24 Mei 2026
        </p>

        <h1 className="text-4xl font-bold text-[#214E8A]">
          Selamat Malam, Admin!
        </h1>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <Users
            size={32}
            className="text-[#818807]"
          />

          <p className="mt-4 text-gray-500">
            Total Pasien
          </p>

          <h2 className="text-5xl font-bold mt-2">
            30
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <UserRound
            size={32}
            className="text-[#818807]"
          />

          <p className="mt-4 text-gray-500">
            Total Perawat
          </p>

          <h2 className="text-5xl font-bold mt-2">
            2
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <BriefcaseMedical
            size={32}
            className="text-[#818807]"
          />

          <p className="mt-4 text-gray-500">
            Total Layanan
          </p>

          <h2 className="text-5xl font-bold mt-2">
            8
          </h2>
        </div>
      </div>

      {/* Chart + Verifikasi */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">
        {/* Analisis */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              Analisis Pemasukan
            </h2>

            <select className="border rounded-full px-4 py-2">
              <option>Minggu Ini</option>
            </select>
          </div>

          <div className="h-[320px]">
            <Bar
              data={chartData}
              options={chartOptions}
            />
          </div>
        </div>

        {/* Verifikasi */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">
            Verifikasi Pesanan Pasien
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-50">
              Pasien A menunggu verifikasi
            </div>

            <div className="p-4 rounded-xl bg-gray-50">
              Pasien B menunggu verifikasi
            </div>

            <div className="p-4 rounded-xl bg-gray-50">
              Pasien C menunggu verifikasi
            </div>
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">
            Jadwal Tindakan Hari Ini
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-2">
                    Pasien
                  </th>
                  <th className="text-left py-2">
                    Jam
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td className="py-2">
                    Budi
                  </td>
                  <td>08:00</td>
                </tr>

                <tr>
                  <td className="py-2">
                    Andi
                  </td>
                  <td>10:00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">
            Histori Pembayaran
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-2">
                    Metode
                  </th>
                  <th className="text-left py-2">
                    Nominal
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td className="py-2">
                    QRIS
                  </td>
                  <td>
                    Rp 220.000
                  </td>
                </tr>

                <tr>
                  <td className="py-2">
                    Tunai
                  </td>
                  <td>
                    Rp 350.000
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}