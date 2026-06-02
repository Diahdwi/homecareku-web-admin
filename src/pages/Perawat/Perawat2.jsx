import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { Search, Layout, List, ChevronDown } from "lucide-react";

export default function Perawat2({ isOpen }) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const nurses = [
    {
      id: 1,
      name: "Megawanti, S.Kep",
      status: "Tidak Bertugas",
      lokasi: "Klinik",
      phone: "+62 813-4567-890",
      img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Megawanti&backgroundColor=ffdfbf",
      isOnline: false
    },
    {
      id: 2,
      name: "Bintang Gumilang, S.Kep",
      status: "Sedang Bertugas",
      lokasi: "Rumah",
      phone: "+62 809-7651-321",
      img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bintang&backgroundColor=b6e3f4",
      isOnline: true
    }
  ];

  const filterOptions = ["Semua", "Sedang Bertugas", "Tidak Bertugas"];

  const filteredNurses = nurses.filter(nurse => {
    const matchesSearch = nurse.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "Semua" || nurse.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

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

      {/* Main Content Area: List View */}
      <div className="flex flex-col gap-4 mt-8 w-full">
        {/* Table Header */}
        <div className="flex items-center justify-between px-8 mb-4">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] flex-1 text-black font-bold text-[16px]">
            <div>Nama Perawat</div>
            <div>Status</div>
            <div>Lokasi</div>
            <div>No. Telepon</div>
          </div>
          <button 
            onClick={() => navigate('/tambah_perawat')}
            className="bg-[#214E8A] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#1c4071] transition-colors shadow-sm ml-4 whitespace-nowrap"
          >
            + Tambah Perawat
          </button>
        </div>

        {/* List Items */}
        {filteredNurses.map((nurse) => (
          <div 
            key={nurse.id} 
            className="bg-white rounded-full py-4 px-8 grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/detail_perawat')}
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100">
                  <img src={nurse.img} alt={nurse.name} className="w-full h-full object-cover" />
                </div>
                {/* Status indicator dot */}
                <div 
                  className={`absolute -bottom-0 -right-0 w-3 h-3 rounded-full border-2 border-white ${
                    nurse.isOnline ? "bg-[#79B735]" : "bg-gray-400"
                  }`}
                />
              </div>
              <span className="font-medium text-sm text-black">{nurse.name}</span>
            </div>
            <div className="text-sm text-black">{nurse.status}</div>
            <div className="text-sm text-black">{nurse.lokasi}</div>
            <div className="text-sm text-black">{nurse.phone}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
