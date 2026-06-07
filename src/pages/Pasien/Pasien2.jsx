import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { Search, Layout, List, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { subscribePatients } from "../../services/firestoreService";

export default function Pasien2({ isOpen }) {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribePatients(
      (data) => {
        setPatients(data);
        setLoading(false);
      },
      (err) => {
        console.error("Gagal mengambil data pasien:", err);
        setError("Gagal memuat data pasien.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Filter logic
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

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
          {filteredPatients.length} Pasien
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

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="animate-spin text-[#214E8A] mb-2" size={40} />
          <p className="text-gray-600 font-medium">Memuat data pasien...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-3xl text-center font-medium max-w-lg mx-auto mt-10 shadow-sm">
          {error}
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-8 w-full overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Table Header aligned with rows */}
            <div className="grid grid-cols-[60px_1.5fr_1fr_1fr] items-center px-8 mb-4 text-black font-bold text-[16px]">
              <div>No</div>
              <div>Nama Pasien</div>
              <div>No. Telepon</div>
              <div>Total Tindakan</div>
            </div>

            {/* List Items */}
            <div className="flex flex-col gap-4">
              {paginatedPatients.map((patient, index) => (
                <div 
                  key={patient.id} 
                  className="bg-white rounded-full py-4 px-8 grid grid-cols-[60px_1.5fr_1fr_1fr] items-center shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                  onClick={() => navigate(`/detail_pasien/${patient.id}`)}
                >
                  <div className="text-sm font-semibold text-gray-500">
                    {startIndex + index + 1}
                  </div>
                  <div className="flex items-center space-x-4 overflow-hidden pr-2">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 border border-gray-200">
                        <img src={patient.img} alt={patient.name} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <span className="font-medium text-sm text-black truncate" title={patient.name}>
                      {patient.name}
                    </span>
                  </div>
                  <div className="text-sm text-black truncate font-medium">{patient.phone || "-"}</div>
                  <div className="text-sm text-black truncate font-medium">{patient.totalTindakan}</div>
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

          {filteredPatients.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm text-gray-500 font-medium mt-4">
              Tidak ada data pasien ditemukan
            </div>
          )}
        </div>
      )}
    </div>
  );
}
