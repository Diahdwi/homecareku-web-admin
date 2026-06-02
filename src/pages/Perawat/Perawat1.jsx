import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { Search, Layout, List, Plus, ChevronDown } from "lucide-react";

export default function Perawat1({ isOpen }) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const nurses = [
    {
      id: 1,
      name: "Bintang Gumilang, S.Kep",
      status: "Sedang Bertugas",
      lokasi: "Rumah",
      img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bintang&backgroundColor=b6e3f4",
      isOnline: true
    },
    {
      id: 2,
      name: "Megawanti, S.Kep",
      status: "Tidak Bertugas",
      lokasi: "Klinik",
      img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Megawanti&backgroundColor=ffdfbf",
      isOnline: false
    }
  ];

  const filterOptions = ["Semua", "Sedang Bertugas", "Tidak Bertugas"];

  return (
    <div
      className={`bg-[#ECECEC] min-h-screen p-5 transition-all duration-300 ${
        isOpen ? "lg:ml-[280px]" : "lg:ml-[90px]"
      }`}
    >
      <Header />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-8 mb-6 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-[#2B3674] w-full md:w-auto">
          {nurses.length} Perawat
        </h1>

        <div className="flex flex-wrap md:flex-nowrap items-center space-x-4 relative w-full md:w-auto justify-end">
          
          {/* Dropdown Filter */}
          <div className="relative">
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
              className="pl-4 pr-10 py-2.5 rounded-full border border-gray-400 focus:outline-none w-[240px] text-sm"
            />
            <Search size={18} className="absolute right-4 top-3 text-gray-500" />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Main Content Area (Now Full Width without Sidebar) */}
        <div className="flex-1 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Add Button Card */}
            <button 
              onClick={() => navigate('/tambah_perawat')}
              className="bg-white rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[140px] hover:bg-gray-50 transition-colors"
            >
              <Plus size={48} className="text-black mb-2" strokeWidth={3} />
              <span className="font-medium text-[15px] text-black">Tambah Perawat</span>
            </button>

            {/* Nurse Cards */}
            {nurses.map((nurse) => (
              <div 
                key={nurse.id} 
                className="bg-white rounded-3xl p-5 shadow-sm relative flex flex-col justify-between min-h-[140px] cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/detail_perawat')}
              >
                <h3 className="font-semibold text-center text-[15px] text-black mb-4">{nurse.name}</h3>
                
                <div className="flex items-center justify-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-blue-100">
                    <img src={nurse.img} alt={nurse.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-[13px] text-black flex flex-col justify-center">
                    <p>Status: {nurse.status}</p>
                    <p>Lokasi: {nurse.lokasi}</p>
                  </div>
                </div>
                
                {/* Status indicator dot */}
                <div 
                  className={`absolute bottom-4 right-4 w-4 h-4 rounded-full ${
                    nurse.isOnline ? "bg-[#79B735]" : "bg-gray-600"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
