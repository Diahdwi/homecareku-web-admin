import {
  X,
  Save,
  Trash2,
} from "lucide-react";

import LayananEditForm from "./LayananEditForm";

export default function LayananDetail({
  selected,
  formData,
  setFormData,
  onSave,
  onDelete,
  onClose,
}) {

  // ====================
  // HANDLE IMAGE
  // ====================

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setFormData({
      ...formData,
      gambar: imageUrl,
    });
  };

  return (
    <div
      className="
        bg-white
        rounded-3xl
        p-6
        shadow-sm
        sticky
        top-5
      "
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold text-[#2B3674]">
          Detail Layanan
        </h2>

        <button
          onClick={onClose}
          className="
            w-10
            h-10
            rounded-full
            bg-gray-100
            flex
            items-center
            justify-center
          "
        >
          <X size={18} />
        </button>

      </div>

      {/* GAMBAR */}
      <div className="mb-6">

        <img
          src={formData.gambar}
          alt={formData.nama}
          className="
            w-full
            h-60
            object-contain
            bg-gray-100
            rounded-2xl
          "
        />

        {/* EDIT BUTTON */}
        <label
          className="
            inline-block
            mt-3
            text-sm
            font-medium
            text-[#214E8A]
            cursor-pointer
            hover:underline
          "
        >
          Edit Gambar

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>

      </div>

      {/* FORM */}
      <LayananEditForm
        formData={formData}
        setFormData={setFormData}
      />

      {/* ACTION BUTTON */}
      <div className="mt-6 space-y-3">

        <button
          onClick={onSave}
          className="
            w-full
            bg-[#214E8A]
            text-white
            py-3
            rounded-2xl
            flex
            justify-center
            items-center
            gap-2
            hover:bg-[#193d6d]
            transition-all
          "
        >
          <Save size={18} />
          Simpan Perubahan
        </button>

        <button
          onClick={() => onDelete(selected.id)}
          className="
            w-full
            bg-red-600
            text-white
            py-3
            rounded-2xl
            flex
            justify-center
            items-center
            gap-2
            hover:bg-red-700
            transition-all
          "
        >
          <Trash2 size={18} />
          Hapus Layanan
        </button>

      </div>

    </div>
  );
}