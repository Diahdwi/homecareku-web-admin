import { Wallet, Clock3, Star } from "lucide-react";

export default function LayananCard({
  layanan,
  onClick,
  isSelected,
}) {
  if (!layanan) return null;

  return (
    <div
      onClick={onClick}
      className={`
      cursor-pointer
      bg-white
      rounded-3xl
      p-5
      border
      border-gray-200
      shadow-sm
      transition-colors
      duration-200
      ${
      isSelected
        ? "border-[#214E8A]"
        : ""
      }
`}
    >
      <div className="flex gap-4">
        
        <div className="w-28 h-28 rounded-2xl bg-[#F4F7FE] overflow-hidden flex items-center justify-center">
          <img
            src={layanan.gambar}
            alt={layanan.nama}
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/150";
            }}
          />
        </div>

        <div className="flex-1">
          <h2 className="font-bold text-xl text-[#2B3674] mb-3">
            {layanan.nama}
          </h2>

          <div className="space-y-2 text-sm text-gray-600">

            <div className="flex items-center gap-2">
              <Wallet size={16} />
              {layanan.harga}
            </div>

            <div className="flex items-center gap-2">
              <Clock3 size={16} />
              {layanan.durasi}
            </div>

            <div className="flex items-center gap-2 text-yellow-500">
              <Star size={16} fill="currentColor" />
              {layanan.rating}
            </div>

          </div>

          <p className="text-sm text-gray-500 mt-4 line-clamp-2">
            {layanan.deskripsi}
          </p>
        </div>
      </div>
    </div>
  );
}