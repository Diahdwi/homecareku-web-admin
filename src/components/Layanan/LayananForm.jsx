import { X, Upload, Star } from "lucide-react"; // Ditambahkan ikon Star
import { useState } from "react";

export default function LayananForm({
  onClose,
  onSave,
}) {
  const [formData, setFormData] = useState({
    nama: "",
    harga: "",
    durasi: "",
    rating: "0", // Default dimulai dari 0 karena layanan baru belum punya ulasan
    gambar: "",
    deskripsi: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setFormData({
      ...formData,
      gambar: imageUrl,
    });
  };

  const handleSubmit = () => {
    if (!formData.nama) {
      alert("Nama layanan wajib diisi");
      return;
    }

    onSave(formData);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md sticky top-5">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#214E8A]">
          Tambah Layanan
        </h2>

        <button onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      {/* UPLOAD GAMBAR */}
      <div className="mb-5">
        <label className="font-semibold block mb-3">
          Upload Gambar
        </label>

        <label
          className="
            border-2
            border-dashed
            border-gray-300
            rounded-2xl
            h-52
            flex
            flex-col
            items-center
            justify-center
            cursor-pointer
            overflow-hidden
            bg-gray-50
            hover:border-[#214E8A]
            transition-all
          "
        >
          {formData.gambar ? (
            <img
              src={formData.gambar}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <Upload
                size={40}
                className="text-gray-400 mb-3"
              />

              <p className="text-gray-500 text-sm">
                Klik untuk upload gambar
              </p>
            </>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
      </div>

      {/* NAMA */}
      <div className="mb-4">
        <label className="font-semibold block mb-2">
          Nama Layanan
        </label>

        <input
          type="text"
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          className="w-full border rounded-xl p-3 outline-none focus:border-[#214E8A]"
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
          value={formData.deskripsi}
          onChange={handleChange}
          className="w-full border rounded-xl p-3 outline-none focus:border-[#214E8A]"
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
          value={formData.harga}
          onChange={handleChange}
          className="w-full border rounded-xl p-3 outline-none focus:border-[#214E8A]"
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
          value={formData.durasi}
          onChange={handleChange}
          className="w-full border rounded-xl p-3 outline-none focus:border-[#214E8A]"
        />
      </div>

      {/* RATING (Hanya tampilan info statis bernilai 0) */}
      <div className="mb-6">
        <label className="font-semibold block mb-1">
          Rating Awal
        </label>
        
        <div className="flex items-center gap-2 py-2">
          {/* Badge Rating Default 0 */}
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
            <Star className="text-amber-500 fill-amber-500" size={18} />
            <span className="font-bold text-amber-700 text-base">
              {formData.rating}
            </span>
          </div>
          
          {/* Keterangan */}
          <p className="text-xs text-gray-500 italic">
            * Layanan baru otomatis dimulai dari rating 0.
          </p>
        </div>
      </div>

      {/* BUTTON */}
      <button
        onClick={handleSubmit}
        className="
          w-full
          bg-[#214E8A]
          text-white
          py-3
          rounded-xl
          hover:bg-[#183965]
          transition-colors
        "
      >
        Simpan Layanan
      </button>

    </div>
  );
}