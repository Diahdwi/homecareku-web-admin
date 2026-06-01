import Header from "../components/Header";
import {
  Plus,
  Star,
  Clock3,
  Wallet,
} from "lucide-react";

export default function Layanan({ isOpen }) {
  const layanan = [
    {
      nama: "Khitan Modern",
      harga: "Rp 850.000",
      durasi: "60 Menit",
      rating: "4.9",
      gambar: "/khitan.png",
    },
    {
      nama: "Pasang Kateter",
      harga: "Rp 250.000",
      durasi: "30 Menit",
      rating: "4.8",
      gambar: "/kateter.png",
    },
    {
      nama: "Terapi Bekam",
      harga: "Rp 150.000",
      durasi: "45 Menit",
      rating: "4.7",
      gambar: "/bekam.png",
    },
    {
      nama: "Pasang NGT",
      harga: "Rp 350.000",
      durasi: "40 Menit",
      rating: "4.8",
      gambar: "/ngt.png",
    },
    {
      nama: "Perawatan Luka",
      harga: "Rp 200.000",
      durasi: "45 Menit",
      rating: "4.9",
      gambar: "/luka.png",
    },
    {
      nama: "Terapi Inframerah",
      harga: "Rp 180.000",
      durasi: "30 Menit",
      rating: "4.6",
      gambar: "/inframerah.png",
    },
    {
      nama: "Pasang Infus",
      harga: "Rp 220.000",
      durasi: "25 Menit",
      rating: "4.8",
      gambar: "/infus.png",
    },
    {
      nama: "Cek Lab Mini",
      harga: "Rp 175.000",
      durasi: "20 Menit",
      rating: "4.7",
      gambar: "/lab_mini.png",
    },
  ];

  return (
    <div
      className={`
        bg-[#ECECEC]
        min-h-screen
        p-5
        transition-all
        duration-300
        pl-[110px]
        ${isOpen ? "lg:pl-[300px]" : "lg:pl-[110px]"}
      `}
    >
      <Header />

      {/* TITLE + BUTTON */}
      <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-[#2B3674]">
          {layanan.length} Layanan
        </h1>

        <button
          className="
            flex items-center
            gap-2
            bg-[#214E8A]
            text-white
            px-5
            py-3
            rounded-2xl
            hover:bg-[#1b4070]
            transition
            w-fit
          "
        >
          <Plus size={20} />
          Tambah Layanan
        </button>
      </div>

      {/* GRID */}
      <div
        className="mt-8 grid gap-5"
        style={{
          gridTemplateColumns:
            "repeat(auto-fit, minmax(350px, 1fr))",
        }}
      >
        {layanan.map((item, index) => (
          <div
            key={index}
            className="
              bg-white
              rounded-3xl
              p-4
              shadow-sm
              hover:shadow-md
              transition
            "
          >
            <div className="flex gap-4 items-center">

              {/* GAMBAR */}
              <div
                className="
                  w-24
                  h-24
                  sm:w-28
                  sm:h-28
                  flex-shrink-0
                  rounded-2xl
                  overflow-hidden
                  bg-gray-100
                "
              >
                <img
                  src={item.gambar}
                  alt={item.nama}
                  className="w-full h-full object-contain p-2"
                />
              </div>

              {/* DETAIL */}
              <div className="flex-1 min-w-0">

                <h2
                  className="
                    text-lg
                    font-bold
                    text-[#2B3674]
                    truncate
                    mb-2
                  "
                >
                  {item.nama}
                </h2>

                <div className="space-y-1 text-sm">

                  <div className="flex items-center gap-2">
                    <Wallet size={16} />
                    <span>{item.harga}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock3 size={16} />
                    <span>{item.durasi}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Star
                      size={16}
                      fill="currentColor"
                    />
                    <span>{item.rating}/5</span>
                  </div>

                </div>

              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}