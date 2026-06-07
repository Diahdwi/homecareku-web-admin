import { useState, useMemo, useRef, useEffect } from "react";
import Header from "../components/Header";
import { SlidersHorizontal, ChevronDown, Banknote, Landmark, X } from "lucide-react";

export default function Transaksi({ isOpen }) {
  // State for filter dropdown popover
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Individual filter states
  const [filterName, setFilterName] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterMethod, setFilterMethod] = useState("Semua");
  const [filterService, setFilterService] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Generate 110 dummy transactions
  const dummyTransactions = useMemo(() => {
    // The first 6 items exactly matching the mockup image
    const initialItems = [
      {
        id: 1,
        name: "Golang",
        date: "2026-04-22",
        dateFormatted: "22 April 2026",
        time: "10:20",
        method: "Qris",
        status: "Lunas",
        price: 100000,
        service: "Perawatan Luka",
        img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Golang&backgroundColor=ffdfbf"
      },
      {
        id: 2,
        name: "Abyan Faza",
        date: "2026-04-22",
        dateFormatted: "22 April 2026",
        time: "11:20",
        method: "Tunai",
        status: "Lunas",
        price: 100000,
        service: "Pasang Kateter",
        img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abyan&backgroundColor=b6e3f4"
      },
      {
        id: 3,
        name: "Siti Kusmini",
        date: "2026-04-22",
        dateFormatted: "22 April 2026",
        time: "12:10",
        method: "Tunai",
        status: "Lunas",
        price: 100000,
        service: "Khitan Modern",
        img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti&backgroundColor=ffdfbf"
      },
      {
        id: 4,
        name: "Dedi Kokbuzer",
        date: "2026-04-22",
        dateFormatted: "22 April 2026",
        time: "13:12",
        method: "Tunai",
        status: "Lunas",
        price: 100000,
        service: "Perawatan Luka",
        img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dedi&backgroundColor=b6e3f4"
      },
      {
        id: 5,
        name: "Cece Majalengka",
        date: "2026-04-22",
        dateFormatted: "22 April 2026",
        time: "10:20",
        method: "Qris",
        status: "Batal",
        price: 100000,
        service: "Perawatan Luka",
        img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cece&backgroundColor=ffdfbf"
      },
      {
        id: 6,
        name: "Fajar Sadboy",
        date: "2026-04-22",
        dateFormatted: "22 April 2026",
        time: "10:20",
        method: "Qris",
        status: "Lunas",
        price: 100000,
        service: "Pasang Kateter",
        img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fajar&backgroundColor=b6e3f4"
      }
    ];

    const names = ["Ahmad", "Budi", "Chandra", "Dewi", "Eko", "Farida", "Giri", "Hana", "Indra", "Joko"];
    const services = ["Perawatan Luka", "Pasang Kateter", "Khitan Modern", "Fisioterapi", "Infus Rumah"];
    const methods = ["Qris", "Tunai"];
    const statuses = ["Lunas", "Batal"];
    const prices = [100000, 150000, 200000, 250000];

    // Generate the remaining 104 items to reach 110 items total
    const generatedItems = Array.from({ length: 104 }, (_, index) => {
      const id = index + 7;
      const name = names[id % names.length] + " " + (id % 3 === 0 ? "Pratama" : "Sari");
      const service = services[id % services.length];
      const method = methods[id % methods.length];
      const status = id % 7 === 0 ? "Batal" : "Lunas"; // 1 in 7 cancelled
      const price = prices[id % prices.length];
      const day = (id % 28) + 1;
      const dateStr = `2026-04-${day.toString().padStart(2, "0")}`;
      
      const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const dateFormatted = `${day} April 2026`;
      const hour = (8 + (id % 10)).toString().padStart(2, "0");
      const minute = ((id * 5) % 60).toString().padStart(2, "0");
      const time = `${hour}:${minute}`;

      return {
        id,
        name,
        date: dateStr,
        dateFormatted,
        time,
        method,
        status,
        price,
        service,
        img: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=${id % 2 === 0 ? "b6e3f4" : "ffdfbf"}`
      };
    });

    return [...initialItems, ...generatedItems];
  }, []);

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return dummyTransactions.filter((t) => {
      // 1. Filter by Name
      if (filterName && !t.name.toLowerCase().includes(filterName.toLowerCase())) {
        return false;
      }
      // 2. Filter by Date
      if (filterDate && t.date !== filterDate) {
        return false;
      }
      // 3. Filter by Method
      if (filterMethod !== "Semua" && t.method.toLowerCase() !== filterMethod.toLowerCase()) {
        return false;
      }
      // 4. Filter by Service
      if (filterService !== "Semua" && t.service !== filterService) {
        return false;
      }
      // 5. Filter by Status
      if (filterStatus !== "Semua" && t.status !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [dummyTransactions, filterName, filterDate, filterMethod, filterService, filterStatus]);

  // Compute stats based on current filters
  const totalTransactions = filteredTransactions.length;
  const totalRevenue = useMemo(() => {
    // Only sum transactions with status "Lunas"
    return filteredTransactions
      .filter((t) => t.status === "Lunas")
      .reduce((sum, t) => sum + t.price, 0);
  }, [filteredTransactions]);

  // Format currency helpers
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(value)
      .replace(/\s+/g, " ")
      .replace("IDR", "Rp");
  };

  const handleResetFilters = () => {
    setFilterName("");
    setFilterDate("");
    setFilterMethod("Semua");
    setFilterService("Semua");
    setFilterStatus("Semua");
  };

  // Check if any filter is active
  const isAnyFilterActive = 
    filterName !== "" || 
    filterDate !== "" || 
    filterMethod !== "Semua" || 
    filterService !== "Semua" || 
    filterStatus !== "Semua";

  return (
    <div
      className={`bg-[#ECECEC] min-h-screen p-5 transition-all duration-300 ${
        isOpen ? "ml-[280px]" : "ml-[90px]"
      }`}
    >
      <Header />

      {/* Header Title Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-8 mb-6 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-[#2B3674] w-full md:w-auto">
          Transaksi
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Total Transaksi */}
        <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <p className="text-gray-500 font-semibold text-lg">Total Transaksi</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="w-14 h-14 rounded-2xl bg-[#79B735]/10 flex items-center justify-center border border-[#79B735]">
              <Banknote className="text-[#79B735]" size={32} />
            </div>
            <span className="text-5xl font-bold text-black">{totalTransactions}</span>
          </div>
        </div>

        {/* Total Pemasukan */}
        <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <p className="text-gray-500 font-semibold text-lg">Total Pemasukan</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="w-14 h-14 rounded-2xl bg-[#818807]/10 flex items-center justify-center border border-[#818807]">
              <Landmark className="text-[#818807]" size={32} />
            </div>
            <span className="text-3xl sm:text-4xl font-bold text-black">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Trigger Button */}
      <div className="flex justify-end mb-4 relative" ref={dropdownRef}>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none"
        >
          <SlidersHorizontal size={16} className="text-gray-500" />
          <span>
            {isAnyFilterActive ? "Filter Aktif" : "Semua Transaksi"}
          </span>
          <ChevronDown size={16} className="text-gray-500" />
        </button>

        {/* Floating Filter Dropdown Popover */}
        {isFilterOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-3xl shadow-xl z-30 p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-800 text-base">Filter Transaksi</h4>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Filter by Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Nama Pasien
                </label>
                <input
                  type="text"
                  placeholder="Cari nama pasien..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#214E8A] text-black"
                />
              </div>

              {/* Filter by Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#214E8A] text-black"
                />
              </div>

              {/* Filter by Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Metode Pembayaran
                </label>
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#214E8A] text-black bg-white"
                >
                  <option value="Semua">Semua Metode</option>
                  <option value="Qris">QRIS</option>
                  <option value="Tunai">Tunai</option>
                </select>
              </div>

              {/* Filter by Service */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Layanan
                </label>
                <select
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#214E8A] text-black bg-white"
                >
                  <option value="Semua">Semua Layanan</option>
                  <option value="Perawatan Luka">Perawatan Luka</option>
                  <option value="Pasang Kateter">Pasang Kateter</option>
                  <option value="Khitan Modern">Khitan Modern</option>
                  <option value="Fisioterapi">Fisioterapi</option>
                  <option value="Infus Rumah">Infus Rumah</option>
                </select>
              </div>

              {/* Filter by Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#214E8A] text-black bg-white"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Batal">Batal</option>
                </select>
              </div>

              {/* Reset Button */}
              {isAnyFilterActive && (
                <button
                  onClick={handleResetFilters}
                  className="w-full mt-2 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs transition-colors"
                >
                  Reset Semua Filter
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm overflow-hidden">
        <h2 className="text-xl font-bold text-center text-[#1B2559] mb-6">
          Histori Pembayaran
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Nama
                </th>
                <th className="text-left pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="text-left pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="text-left pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Metode
                </th>
                <th className="text-left pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Harga
                </th>
                <th className="text-left pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Layanan
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Nama (with Avatar) */}
                    <td className="py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-blue-50">
                        <img
                          src={tx.img}
                          alt={tx.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-semibold text-sm text-[#1B2559]">
                        {tx.name}
                      </span>
                    </td>

                    {/* Tanggal */}
                    <td className="py-4 text-sm font-semibold text-[#1B2559]">
                      {tx.dateFormatted}
                    </td>

                    {/* Waktu */}
                    <td className="py-4 text-sm font-semibold text-[#1B2559]">
                      {tx.time}
                    </td>

                    {/* Metode */}
                    <td className="py-4 text-sm font-medium text-gray-500">
                      {tx.method}
                    </td>

                    {/* Status */}
                    <td className="py-4 text-sm">
                      <span
                        className={`font-semibold ${
                          tx.status === "Lunas"
                            ? "text-[#79B735]"
                            : "text-red-500"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>

                    {/* Harga */}
                    <td className="py-4 text-sm font-semibold text-[#1B2559]">
                      {formatCurrency(tx.price)}
                    </td>

                    {/* Layanan */}
                    <td className="py-4 text-sm font-medium text-[#1B2559]">
                      {tx.service}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 text-sm">
                    Tidak ada transaksi yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}