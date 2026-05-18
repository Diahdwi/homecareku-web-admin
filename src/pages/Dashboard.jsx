import { Bell, MessageSquare, Search, HelpCircle } from "lucide-react";

export default function Dashboard() {
  // DATA DINAMIS
  const nominalTunai = 3250000;
  const nominalQris = 2200000;
  const totalPemasukan = nominalTunai + nominalQris;

  // Hitung persentase untuk lingkaran donat
  const tunaiPercentage = (nominalTunai / totalPemasukan) * 100;

  // Format ke Rupiah
  const formatRupiah = (val) => {
    return "Rp. " + val.toLocaleString("id-ID");
  };

  return (
    <div className="flex-1 bg-[#F4F7FE] min-h-screen">
      {/* ========================================== */}
      {/* 1. HEADER ATAS (FULL WIDTH) */}
      {/* ========================================== */}
      <header className="flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-4">
          {/* Avatar Admin */}
          <div className="w-[55px] h-[55px] bg-[#F28B0C]/20 rounded-full flex items-center justify-center text-[#F28B0C]">
            <HelpCircle size={35} />
          </div>
          {/* Teks Selamat Malam */}
          <div>
            <p className="text-xs font-medium text-gray-700">Selamat Malam,</p>
            <h1 className="text-lg font-bold text-black">Admin</h1>
          </div>
          {/* Ikon Notifikasi & Chat */}
          <div className="flex gap-3 ml-6">
            <button className="w-[45px] h-[45px] bg-white rounded-full flex items-center justify-center text-[#818807] hover:bg-gray-100 transition-all">
              <Bell size={22} />
            </button>
            <button className="w-[45px] h-[45px] bg-white rounded-full flex items-center justify-center text-[#818807] hover:bg-gray-100 transition-all">
              <MessageSquare size={22} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-[350px]">
          <input
            type="text"
            placeholder="Cari yang Anda butuhkan"
            className="w-full h-[45px] pl-5 pr-12 text-sm bg-white border border-gray-300 rounded-[25px] outline-none text-gray-700 focus:border-gray-400"
          />
          <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </header>

      {/* ========================================== */}
      {/* 2. KONTEN UTAMA */}
      {/* ========================================== */}
      <main className="px-10 pb-10">
        
        {/* Row Kartu Statistik (SISTEM 4 KOLOM SAMA RATA) */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 items-stretch">
          
          {/* Kartu Pemasukan + Donut Chart */}
          <div className="p-6 bg-white rounded-[15px] shadow-sm flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-2">
              <h3 className="text-[13px] font-bold text-black truncate">Total Pemasukan</h3>
              <p className="text-xl 2xl:text-2xl font-bold text-[#2B3674] mt-2 mb-3 truncate">
                {formatRupiah(totalPemasukan)}
              </p>
              
              {/* Legenda */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-medium text-[#F28B0C]">
                  <div className="w-2 h-2 rounded-full bg-[#D4E157]"></div>
                  <span>Tunai <span className="text-gray-500 font-normal">{formatRupiah(nominalTunai)}</span></span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-[#818807]">
                  <div className="w-2 h-2 rounded-full bg-[#9E9D24]"></div>
                  <span>Qris <span className="text-gray-500 font-normal">{formatRupiah(nominalQris)}</span></span>
                </div>
              </div>
            </div>

            {/* SVG Donut Chart Custom (Ukuran disesuaikan agar muat) */}
            <div className="relative w-[85px] h-[85px] flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background lingkar / QRIS (Hijau Zaitun) */}
                <circle cx="18" cy="18" r="14" fill="none" stroke="#9E9D24" strokeWidth="5" />
                {/* Atas lingkar / Tunai (Kuning Kehijauan) */}
                <circle
                  cx="18" cy="18" r="14"
                  fill="none" stroke="#D4E157" strokeWidth="5"
                  strokeDasharray={`${tunaiPercentage} 100`}
                />
              </svg>
              {/* Lubang Putih Tengah Donat */}
              <div className="absolute w-[60%] h-[60%] bg-white rounded-full"></div>
            </div>
          </div>

          {/* Kartu Statistik Kecil 1 */}
          <div className="p-6 bg-white rounded-[15px] shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold text-black text-center">Total Pasien</h3>
            <p className="text-[36px] font-bold text-[#2B3674] mt-2">20</p>
          </div>

          {/* Kartu Statistik Kecil 2 */}
          <div className="p-6 bg-white rounded-[15px] shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold text-black text-center">Total Perawat</h3>
            <p className="text-[36px] font-bold text-[#2B3674] mt-2">2</p>
          </div>

          {/* Kartu Statistik Kecil 3 */}
          <div className="p-6 bg-white rounded-[15px] shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold text-black text-center">Total Layanan</h3>
            <p className="text-[36px] font-bold text-[#2B3674] mt-2">8</p>
          </div>
        </div>

        {/* Tabel Data Pasien Hari Ini */}
        <div className="w-full min-h-[400px] mt-8 p-8 bg-white rounded-[15px] shadow-sm">
          <h3 className="text-base font-bold text-gray-800">Tabel Data Pasien Hari Ini</h3>
          <div className="w-full h-[1px] bg-gray-200 my-6"></div>
          
          <div className="flex items-center justify-center min-h-[250px]">
            <p className="text-gray-400 font-medium">Data Tabel Akan Ditampilkan Di Sini</p>
          </div>
        </div>
      </main>
    </div>
  );
}