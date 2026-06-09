import { useState, useMemo, useRef, useEffect } from "react";
import Header from "../components/Header";
import { SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, Banknote, Landmark, X } from "lucide-react";
import { subscribeTransactions, subscribeLayanan } from "../services/firestoreService";

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

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

  const [transactions, setTransactions] = useState([]);
  const [layananList, setLayananList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch transactions and services from Firestore
  useEffect(() => {
    const unsubscribeLayanan = subscribeLayanan((layanans) => {
      setLayananList(layanans);
    });

    const unsubscribeTransactions = subscribeTransactions((txs) => {
      setTransactions(txs);
      setLoading(false);
    });

    return () => {
      unsubscribeLayanan();
      unsubscribeTransactions();
    };
  }, []);

  // Map database transactions to UI format
  const mappedTransactions = useMemo(() => {
    return transactions.map((t) => {
      let tgl = new Date();
      if (t.tanggal_booking) {
        tgl = t.tanggal_booking.toDate ? t.tanggal_booking.toDate() : new Date(t.tanggal_booking);
      }
      const dateStr = tgl.toISOString().split('T')[0];
      const dateFormatted = tgl.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

      // Use transaction price if available, otherwise match service price
      let price = t.harga || 0;
      if (!price) {
        const matchingLayanan = layananList.find(
          (l) => l.nama.toLowerCase() === t.layanan.toLowerCase()
        );
        if (matchingLayanan && matchingLayanan.harga) {
          const parsed = parseInt(matchingLayanan.harga.toString().replace(/[^0-9]/g, ""), 10);
          if (!isNaN(parsed)) {
            price = parsed;
          }
        }
      }
      if (!price) {
        price = 100000; // Fallback default
      }

      // Map status
      let uiStatus = "Lunas";
      if (t.status_detail === "Batal" || t.status === "Batal" || t.status === "Tidak Selesai") {
        uiStatus = "Batal";
      }

      return {
        id: t.id,
        id_pesanan: t.id_pesanan,
        name: t.nama_pasien || "Pasien",
        date: dateStr,
        dateFormatted,
        time: t.jam_booking || "08:00",
        method: t.metode_pembayaran || "Tunai",
        status: uiStatus,
        price: price,
        service: t.layanan || "Layanan",
        img: `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.nama_pasien || "Pasien"}&backgroundColor=b6e3f4`
      };
    });
  }, [transactions, layananList]);

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return mappedTransactions.filter((t) => {
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
  }, [mappedTransactions, filterName, filterDate, filterMethod, filterService, filterStatus]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterName, filterDate, filterMethod, filterService, filterStatus]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

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
                <th className="text-left pb-4 pr-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-12">
                  No
                </th>
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
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((tx, index) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* No */}
                    <td className="py-4 pr-4 text-sm font-semibold text-[#1B2559]">
                      {startIndex + index + 1}
                    </td>

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
                  <td colSpan={8} className="py-8 text-center text-gray-500 text-sm">
                    Tidak ada transaksi yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-full bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-semibold text-gray-700">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-full bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}