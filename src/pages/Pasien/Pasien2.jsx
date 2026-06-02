import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { Search, Layout, List } from "lucide-react";

export default function Pasien2({ isOpen }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Membuat 30 data pasien dummy agar sesuai dengan judul "30 Pasien" di desain
  const patients = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    name: i % 2 === 0 ? "Bintang Sanjaya" : "Megawanti",
    phone: "+62 812-3456-7890", // Sesuai dengan tampilan di gambar yang terpotong
    totalTindakan: 2,
    img: i % 2 === 0 
      ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Bintang&backgroundColor=b6e3f4"
      : "https://api.dicebear.com/7.x/avataaars/svg?seed=Megawanti&backgroundColor=ffdfbf"
  }));

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          30 Pasien
        </h1>

        <div className="flex flex-wrap md:flex-nowrap items-center space-x-4 relative w-full md:w-auto justify-end">
          
          {/* View Toggles */}
          <div className="flex space-x-3 text-black">
            <Layout 
              size={28} 
              className="cursor-pointer text-gray-400 hover:text-black transition-colors" 
              onClick={() => navigate('/pasien')} 
            />
            <List size={28} className="cursor-pointer text-black" />
          </div>
          
          {/* Search Input */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Cari Pasien"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-10 py-2.5 rounded-full border border-gray-400 focus:outline-none w-[240px] text-sm text-black"
            />
            <Search size={18} className="absolute right-4 top-3 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Main Content Area: List View */}
      <div className="flex flex-col gap-4 mt-8 w-full">
        {/* Table Header */}
        <div className="flex items-center justify-between px-8 mb-4">
          <div className="grid grid-cols-[1.5fr_1fr_1fr] flex-1 text-black font-bold text-[16px]">
            <div>Nama Pasien</div>
            <div>No. Telepon</div>
            <div>Total Tindakan</div>
          </div>
        </div>

        {/* List Items */}
        {filteredPatients.map((patient) => (
          <div 
            key={patient.id} 
            className="bg-white rounded-full py-4 px-8 grid grid-cols-[1.5fr_1fr_1fr] items-center shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/detail_pasien/${patient.id}`)}
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100">
                  <img src={patient.img} alt={patient.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <span className="font-medium text-sm text-black">{patient.name}</span>
            </div>
            <div className="text-sm text-black font-medium">{patient.phone}</div>
            <div className="text-sm text-black font-medium">{patient.totalTindakan}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
