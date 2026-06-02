import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

export default function RekamMedisPasien({ isOpen }) {
  const navigate = useNavigate();

  // Mock data rekam medis
  const medicalRecords = [
    {
      id: 1,
      layanan: "Terapi Bekam",
      tanggal: "12 Oktober 2026",
      waktu: "14:00 - 15:30",
      perawat: "Bintang Gumilang, S.Kep",
      catatan: "Pasien mengeluh pegal di bagian punggung bawah. Telah dilakukan terapi bekam basah sebanyak 5 titik. Tekanan darah normal. Disarankan untuk banyak minum air putih."
    },
    {
      id: 2,
      layanan: "Perawatan Luka",
      tanggal: "05 Oktober 2026",
      waktu: "09:00 - 10:00",
      perawat: "Megawanti, S.Kep",
      catatan: "Luka pasca operasi di bagian kaki mulai mengering. Tidak ada tanda-tanda infeksi. Telah dilakukan penggantian perban dan pembersihan luka."
    }
  ];

  return (
    <div
      className={`bg-[#ECECEC] min-h-screen p-5 transition-all duration-300 ${
        isOpen ? "lg:ml-[280px]" : "lg:ml-[90px]"
      } relative`}
    >
      <Header />

      {/* Header Section */}
      <div className="flex items-center mt-8 mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-[#2B3674]">
          Detail Pasien
        </h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm max-w-4xl mb-10">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100 shrink-0">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Bintang&backgroundColor=b6e3f4" alt="Bintang Sanjaya" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 w-full md:w-auto">
            <p className="font-bold text-black mb-1">Nama Pasien:</p>
            <input
              type="text"
              name="name"
              value="Bintang Sanjaya"
              readOnly
              className="border-b border-black pb-1 min-w-[280px] w-full max-w-md text-black focus:outline-none bg-transparent font-medium"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-gray-200">
          <button 
            onClick={() => navigate(-1)} 
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
                    <span className="text-black font-medium">{record.perawat}</span>
                  </div>
                  <div>
                    <span className="text-[#818807] font-bold text-sm block mb-1">Tanggal</span>
                    <span className="text-black font-medium">{record.tanggal}</span>
                  </div>
                  <div>
                    <span className="text-[#818807] font-bold text-sm block mb-1">Waktu</span>
                    <span className="text-black font-medium">{record.waktu}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[#818807] font-bold text-sm block mb-1">Catatan</span>
                  <p className="text-black text-sm leading-relaxed">{record.catatan}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 italic py-8">Belum ada rekam medis untuk pasien ini.</p>
          )}
        </div>
      </div>
    </div>
  );
}
