import { Star } from "lucide-react"; // Ditambahkan ikon bintang agar lebih informatif

export default function LayananEditForm({
  formData,
  setFormData,
}) {
  // ====================
  // HANDLE INPUT
  // ====================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>

      {/* NAMA */}
      <div className="mb-4">
        <label className="font-semibold block mb-2">
          Nama Layanan
        </label>

        <input
          type="text"
          name="nama"
          value={formData.nama || ""}
          onChange={handleChange}
          className="
            w-full
            border
            rounded-xl
            p-3
            outline-none
            focus:border-[#214E8A]
          "
        />
      </div>

      {/* DESKRIPSI */}
      <div className="mb-4">
        <label className="font-semibold block mb-2">
          Deskripsi
        </label>

        <textarea
          rows={4}
          name="deskripsi"
          value={formData.deskripsi || ""}
          onChange={handleChange}
          className="
            w-full
            border
            rounded-xl
            p-3
            outline-none
            focus:border-[#214E8A]
          "
        />
      </div>

      {/* HARGA */}
      <div className="mb-4">
        <label className="font-semibold block mb-2">
          Harga
        </label>

        <input
          type="text"
          name="harga"
          value={formData.harga || ""}
          onChange={handleChange}
          className="
            w-full
            border
            rounded-xl
            p-3
            outline-none
            focus:border-[#214E8A]
          "
        />
      </div>

      {/* DURASI */}
      <div className="mb-4">
        <label className="font-semibold block mb-2">
          Durasi
        </label>

        <input
          type="text"
          name="durasi"
          value={formData.durasi || ""}
          onChange={handleChange}
          className="
            w-full
            border
            rounded-xl
            p-3
            outline-none
            focus:border-[#214E8A]
          "
        />
      </div>

      {/* RATING (Hanya teks rata-rata ulasan, tanpa kolom input) */}
      <div className="mb-4">
        <label className="font-semibold block mb-1">
          Rating Layanan
        </label>
        
        <div className="flex items-center gap-2 py-2">
          {/* Badge Rating */}
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
            <Star className="text-amber-500 fill-amber-500" size={18} />
            <span className="font-bold text-amber-700 text-base">
              {formData.rating || "0.0"}
            </span>
          </div>
          
          {/* Keterangan tambahan */}
          <p className="text-xs text-gray-500 italic">
            * Diambil otomatis dari rata-rata rating semua ulasan pasien.
          </p>
        </div>
      </div>

    </div>
  );
}