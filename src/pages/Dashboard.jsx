import {
  Bell,
  MessageSquare,
  Search,
} from "lucide-react";

export default function Dashboard({ isOpen }) {
  const nominalTunai = 3250000;
  const nominalQris = 2200000;
  const totalPemasukan = nominalTunai + nominalQris;

  const totalNominal = nominalTunai + nominalQris;
  const tunaiPercentage = (nominalTunai / totalNominal) * 100;

  const formatRupiah = (val) => {
    return "Rp. " + val.toLocaleString("id-ID");
  };

  return (
    <div
      className={`bg-[#F4F7FE] min-h-screen px-8 py-8 transition-all duration-300
      ${isOpen ? "ml-64" : "ml-20"}`}
    >
      {/* ================= HEADER ================= */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-10">
        
        {/* LEFT */}
        <div className="flex gap-4">
          <button className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center shadow-sm">
            <Bell size={20} className="text-[#9E9D24]" />
          </button>

          <button className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center shadow-sm">
            <MessageSquare size={20} className="text-[#9E9D24]" />
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative w-full lg:w-[350px]">
          <input
            type="text"
            placeholder="Cari yang Anda butuhkan"
            className="w-full h-[50px] rounded-full border border-gray-200 bg-white px-5 pr-12 outline-none"
          />

          <Search
            size={20}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* ================= CARD SECTION ================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        
        {/* PEMASUKAN */}
        <div className="bg-white rounded-[25px] p-6 flex items-center justify-between">
          
          <div>
            <h3 className="text-[15px] font-semibold text-black">
              Total Pemasukan
            </h3>

            <h1 className="text-[22px] font-bold text-[#2B3674] mt-4">
              {formatRupiah(totalPemasukan)}
            </h1>

            <div className="mt-5 space-y-1">
              
              <div className="text-sm">
                <span className="text-[#F28B0C] font-medium">
                  Tunai
                </span>

                <span className="text-gray-400 ml-2">
                  {formatRupiah(nominalTunai)}
                </span>
              </div>

              <div className="text-sm">
                <span className="text-[#9E9D24] font-medium">
                  Qris
                </span>

                <span className="text-gray-400 ml-2">
                  {formatRupiah(nominalQris)}
                </span>
              </div>
            </div>
          </div>

          {/* DONUT */}
          <div className="relative w-[120px] h-[120px]">
            
            <svg
              className="w-full h-full -rotate-90"
              viewBox="0 0 36 36"
            >
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#A5A51F"
                strokeWidth="5"
              />

              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#D8E34F"
                strokeWidth="5"
                strokeDasharray={`${tunaiPercentage} 100`}
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[65px] h-[65px] bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* CARD 2 */}
        <div className="bg-white rounded-[25px] flex flex-col items-center justify-center p-6">
          <h3 className="text-lg font-medium">
            Total Pasien
          </h3>

          <h1 className="text-[55px] font-bold text-[#2B3674] mt-4">
            20
          </h1>
        </div>

        {/* CARD 3 */}
        <div className="bg-white rounded-[25px] flex flex-col items-center justify-center p-6">
          <h3 className="text-lg font-medium">
            Total Perawat
          </h3>

          <h1 className="text-[55px] font-bold text-[#2B3674] mt-4">
            2
          </h1>
        </div>

        {/* CARD 4 */}
        <div className="bg-white rounded-[25px] flex flex-col items-center justify-center p-6">
          <h3 className="text-lg font-medium">
            Total Layanan
          </h3>

          <h1 className="text-[55px] font-bold text-[#2B3674] mt-4">
            8
          </h1>
        </div>
      </div>

      {/* ================= TABLE ================= */}

      <div className="bg-white rounded-[25px] mt-8 min-h-[420px] p-8">
        
        <h1 className="text-[30px] font-semibold text-[#2D2D2D]">
          Tabel Data Pasien Hari Ini
        </h1>

        <div className="w-full h-[1px] bg-gray-200 mt-5"></div>

        <div className="flex items-center justify-center h-[280px] text-gray-400 text-xl">
          Data Tabel Akan Ditampilkan Di Sini
        </div>
      </div>
    </div>
  );
}