import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { Search, Layout, List, Plus, ChevronDown, ChevronLeft, ChevronRight, Loader2, Award, Briefcase, MapPin } from "lucide-react";
import { subscribeNurses } from "../../services/firestoreService";

export default function Perawat1({ isOpen }) {
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
            <Layout size={28} className="cursor-pointer text-black" />
            <List 
              size={28} 
              className="cursor-pointer text-gray-400 hover:text-black transition-colors" 
              onClick={() => navigate('/perawat2')}
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
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {/* Nurse Cards */}
              {paginatedNurses.map((nurse) => (
                <div 
                  key={nurse.id} 
                  className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm relative flex flex-col justify-between min-h-[160px] cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  onClick={() => navigate(`/detail_perawat/${nurse.id}`)}
                >
                  <div className="flex gap-4">
                    {/* Left avatar column */}
                    <div className="w-28 h-28 rounded-2xl bg-[#F4F7FE] overflow-hidden flex items-center justify-center shrink-0 border border-gray-100 relative">
                      <img src={nurse.img} alt={nurse.name} className="w-full h-full object-cover" />
                      {/* Indicator Dot */}
                      <div 
                        className={`absolute bottom-2 right-2 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          nurse.isOnline ? "bg-[#79B735]" : "bg-gray-400"
                        }`}
                      />
                    </div>
                    
                    {/* Right text info column */}
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-xl text-[#2B3674] mb-3 truncate" title={nurse.name}>
                        {nurse.name}
                      </h2>
                      
                      <div className="space-y-1.5 text-sm text-gray-600">
                        <div className="flex items-center gap-2 text-sm truncate">
                          <Award size={15} className="shrink-0 text-gray-600" />
                          <span className="truncate" title={nurse.noSertifikat}>Sertifikat: {nurse.noSertifikat}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase size={15} className="shrink-0 text-gray-600" />
                          <span>Status: {nurse.status}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin size={15} className="shrink-0 text-gray-600" />
                          <span>Lokasi: {nurse.lokasi}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-10">
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
              <div className="text-center py-20 bg-white rounded-3xl shadow-sm text-gray-500 font-medium">
                Tidak ada data perawat ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
