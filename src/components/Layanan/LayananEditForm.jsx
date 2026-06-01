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

      {/* RATING */}
      <div className="mb-4">
        <label className="font-semibold block mb-2">
          Rating
        </label>

        <input
          type="text"
          name="rating"
          value={formData.rating || ""}
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

    </div>
  );
}