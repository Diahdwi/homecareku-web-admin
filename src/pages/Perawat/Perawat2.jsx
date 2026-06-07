import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { Search, Layout, List, Plus, ChevronDown, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { subscribeNurses } from "../../services/firestoreService";

export default function Perawat2({ isOpen }) {
  const navigate = useNavigate();
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeNurses(
      (data) => {
        setNurses(data);
        setLoading(false);
      },
      (err) => {
        console.error("Gagal mengambil data perawat:", err);
        setError("Gagal memuat data perawat.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const filterOptions = ["Semua", "Sedang Bertugas", "Tidak Bertugas"];

  // Filter logic
  const filteredNurses = nurses.filter(nurse => {
    const matchesSearch = nurse.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "Semua" || nurse.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredNurses.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNurses = filteredNurses.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div
      className={`bg-[#ECECEC] min-h-screen p-5 transition-all duration-300 ${
        isOpen ? "ml-[280px]" : "ml-[90px]"
      }`}
    >
      <Header />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-8 mb-6 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-[#2B3674] w-full md:w-auto">
          {filteredNurses.length} Perawat
        </h1>

        <div className="flex flex-wrap md:flex-nowrap items-center space-x-4 relative w-full md:w-auto justify-end">
          {/* Tambah Perawat Button (Now at top, matches Layanan) */}
          <button 
            onClick={() => navigate('/tambah_perawat')}
            className="bg-[#214E8A] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#1c4071] transition-colors shadow-sm whitespace-nowrap flex items-center gap-1.5"
          >
            <Plus size={18} /> Tambah Perawat
          </button>
          
          {/* Dropdown Filter */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between space-x-2 bg-white px-4 py-2.5 rounded-full border border-gray-300 text-sm focus:outline-none min-w-[160px]"
            >
              <span>{activeFilter}</span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setActiveFilter(option);
                      setIsDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      activeFilter === option ? "font-semibold text-[#214E8A] bg-blue-50" : "text-gray-700"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View Toggles */}
          <div className="flex space-x-3 text-black">
            <Layout 
              size={28} 
              className="cursor-pointer text-gray-400 hover:text-black transition-colors" 
              onClick={() => navigate('/perawat')}
            />
            <List 
              size={28} 
              className="cursor-pointer text-black" 
            />
          </div>
          
          {/* Search Input */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Cari Perawat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-10 py-2.5 rounded-full border border-gray-400 focus:outline-none w-[240px] text-sm"
            />
            <Search size={18} className="absolute right-4 top-3 text-gray-500" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="animate-spin text-[#214E8A] mb-2" size={40} />
          <p className="text-gray-600 font-medium">Memuat data perawat...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-3xl text-center font-medium max-w-lg mx-auto mt-10 shadow-sm">
          {error}
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-8 w-full overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Table Header - Now perfectly aligned and spans 100% width */}
            <div className="grid grid-cols-[60px_1.5fr_1fr_1fr_1fr] items-center px-8 mb-4 text-black font-bold text-[16px]">
              <div>No</div>
              <div>Nama Perawat</div>
              <div>Status</div>
              <div>Lokasi</div>
              <div>No. Telepon</div>
            </div>

            {/* List Items */}
            <div className="flex flex-col gap-4">
              {paginatedNurses.map((nurse, index) => (
                <div 
                  key={nurse.id} 
                  className="bg-white rounded-full py-4 px-8 grid grid-cols-[60px_1.5fr_1fr_1fr_1fr] items-center shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                  onClick={() => navigate(`/detail_perawat/${nurse.id}`)}
                >
                  <div className="text-sm font-semibold text-gray-500">
                    {startIndex + index + 1}
                  </div>
                  <div className="flex items-center space-x-4 overflow-hidden pr-2">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 border border-gray-200">
                        <img src={nurse.img} alt={nurse.name} className="w-full h-full object-cover" />
                      </div>
                      {/* Status indicator dot */}
                      <div 
                        className={`absolute -bottom-0 -right-0 w-3 h-3 rounded-full border-2 border-white ${
                          nurse.isOnline ? "bg-[#79B735]" : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <span className="font-medium text-sm text-black truncate" title={nurse.name}>
                      {nurse.name}
                    </span>
                  </div>
                  <div className="text-sm text-black truncate">{nurse.status}</div>
                  <div className="text-sm text-black truncate">{nurse.lokasi}</div>
                  <div className="text-sm text-black truncate">{nurse.phone || "-"}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2.5 rounded-full bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-semibold text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-full bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {filteredNurses.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm text-gray-500 font-medium mt-4">
              Tidak ada data perawat ditemukan
            </div>
          )}
        </div>
      )}
    </div>
  );
}
