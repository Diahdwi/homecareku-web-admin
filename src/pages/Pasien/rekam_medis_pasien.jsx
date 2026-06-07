import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import { getPatientById, getPatientMedicalRecords } from "../../services/firestoreService";
import { Loader2 } from "lucide-react";

export default function RekamMedisPasien({ isOpen }) {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        // Load patient details
        const patientData = await getPatientById(id);
        setPatient(patientData);

        // Load patient medical records (pesanan)
        const records = await getPatientMedicalRecords(id);
        setMedicalRecords(records);
      } catch (err) {
        console.error("Gagal memuat rekam medis:", err);
        setError("Gagal memuat data rekam medis pasien.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  return (
    <div
      className={`bg-[#ECECEC] min-h-screen p-5 transition-all duration-300 ${
        isOpen ? "ml-[280px]" : "ml-[90px]"
      } relative`}
    >
      <Header />

      {/* Header Section */}
      <div className="flex items-center mt-8 mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-[#2B3674]">
          Detail Pasien
        </h1>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-3xl p-8 shadow-sm">
          <Loader2 className="animate-spin text-[#214E8A] mb-2" size={40} />
          <p className="text-gray-600 font-medium">Memuat rekam medis...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-3xl text-center font-medium max-w-lg mx-auto mt-10 shadow-sm">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 shadow-sm max-w-4xl mb-10">
          {/* Top Section */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100 border border-gray-200 shrink-0">
              <img src={patient?.img} alt={patient?.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 w-full md:w-auto">
              <p className="font-bold text-black mb-1">Nama Pasien:</p>
              <div className="border-b border-gray-300 pb-1 text-black font-semibold text-lg max-w-md">
                {patient?.name}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-8 mb-8 border-b border-gray-200">
            <button 
              onClick={() => navigate(`/detail_pasien/${id}`)} 
              className="font-bold text-gray-500 pb-2 hover:text-black transition-colors"
            >
              Data Diri
            </button>
            <button className="font-bold text-black pb-2 border-b-2 border-black">
              Rekam Medis
            </button>
          </div>

          {/* Medical Records List */}
          <div className="space-y-6">
            {medicalRecords.length > 0 ? (
              medicalRecords.map((record) => (
                <div key={record.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-[#818807] font-bold text-sm block mb-1">Layanan</span>
                      <span className="text-black font-medium">{record.layanan}</span>
                    </div>
                    <div>
                      <span className="text-[#818807] font-bold text-sm block mb-1">Perawat</span>
                      <span className="text-black font-medium">{record.perawat || "-"}</span>
                    </div>
                    <div>
                      <span className="text-[#818807] font-bold text-sm block mb-1">Tanggal</span>
                      <span className="text-black font-medium">{record.tanggal || "-"}</span>
                    </div>
                    <div>
                      <span className="text-[#818807] font-bold text-sm block mb-1">Waktu</span>
                      <span className="text-black font-medium">{record.waktu || "-"}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[#818807] font-bold text-sm block mb-1">Catatan</span>
                    <p className="text-black text-sm leading-relaxed whitespace-pre-wrap">{record.catatan || "-"}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 italic py-8">Belum ada rekam medis untuk pasien ini.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
