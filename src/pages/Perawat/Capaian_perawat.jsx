import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

export default function CapaianPerawat({ isOpen }) {
  const navigate = useNavigate();

  // Data perawat untuk header atas
  const nurse = {
    id: 1,
    name: "Bintang Gumilang, S.Kep",
    img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bintang&backgroundColor=b6e3f4"
  };

  // Mock data untuk daftar tindakan
  const capaianList = Array(8).fill({
    layanan: "Terapi Bekam",
    layananImg: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bintang&backgroundColor=b6e3f4",
    tipe: "Rumah",
    pasien: "Golang",
    waktu: "10.00 - 12.00",
    tanggal: "12 Mei 2026",
    rekamMedis: "Lorem ipsum dolor sit amet sit dolor"
  });

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
          Detail Perawat
        </h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm max-w-6xl mb-10 overflow-x-auto">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100 shrink-0">
            <img src={nurse.img} alt={nurse.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 w-full md:w-auto">
            <p className="font-bold text-black mb-1">Nama Perawat:</p>
            <div className="border-b border-black pb-1 min-w-[280px] inline-block text-black font-medium">
              {nurse.name}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-gray-200">
          <button 
            onClick={() => navigate('/detail_perawat')}
            className="font-bold text-gray-500 pb-2 hover:text-black transition-colors"
          >
            Data Diri
          </button>
          <button className="font-bold text-black pb-2 border-b-2 border-black">
            Capaian
          </button>
        </div>

        {/* Capaian Content */}
        <div>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-bold text-[#818807]">15</span>
            <span className="text-lg font-bold text-gray-800">total tindakan</span>
          </div>

          <div className="min-w-[900px]">
            {/* Table Header */}
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr_2fr] px-6 text-gray-800 font-medium text-[15px] mb-3">
              <div>Layanan</div>
              <div>Tipe Layanan</div>
              <div>Pasien</div>
              <div>Waktu</div>
              <div>Tanggal</div>
              <div>Rekam Medis</div>
            </div>

            {/* Table Rows */}
            <div className="flex flex-col gap-2">
              {capaianList.map((item, idx) => (
                <div 
                  key={idx} 
                  className="bg-[#E4E9F2] rounded-full py-2.5 px-6 grid grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr_2fr] items-center text-sm text-gray-800 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white shrink-0">
                      <img src={item.layananImg} alt={item.layanan} className="w-full h-full object-cover" />
                    </div>
                    <span>{item.layanan}</span>
                  </div>
                  <div>{item.tipe}</div>
                  <div>{item.pasien}</div>
                  <div>{item.waktu}</div>
                  <div>{item.tanggal}</div>
                  <div className="truncate pr-4" title={item.rekamMedis}>
                    {item.rekamMedis}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
