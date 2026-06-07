import { useState } from "react";
import {
  X,
  Save,
  Trash2,
  Camera,
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
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  // ====================
  // HANDLE IMAGE
  // ====================

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        gambar: reader.result,
      });
    };
    reader.readAsDataURL(file);
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
      <div className="mb-6 relative">
        <div className="relative group shrink-0">
          <div
            onClick={() => setShowPhotoOptions(!showPhotoOptions)}
            className="w-full h-60 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer relative hover:brightness-95 transition-all flex items-center justify-center"
          >
            <img
              src={formData.gambar || "https://via.placeholder.com/150"}
              alt={formData.nama}
              className="w-full h-full object-contain p-2"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
              <Camera className="text-white" size={24} />
            </div>
          </div>

          {/* Photo Selector Popover Box */}
          {showPhotoOptions && (
            <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 z-20 w-[300px]">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#214E8A] hover:underline cursor-pointer block text-center py-2 bg-blue-50 rounded-lg">
                  Unggah Gambar Baru
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      handleImageChange(e);
                      setShowPhotoOptions(false);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, gambar: "" });
                    setShowPhotoOptions(false);
                  }}
                  className="text-sm font-semibold text-red-500 hover:underline block text-center py-2 border border-red-100 rounded-lg"
                >
                  Hapus Gambar
                </button>
              </div>
            </div>
          )}
        </div>
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