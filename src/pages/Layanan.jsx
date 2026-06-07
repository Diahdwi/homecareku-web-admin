import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";

import Header from "../components/Header";
import LayananCard from "../components/Layanan/LayananCard";
import LayananDetail from "../components/Layanan/LayananDetail";
import LayananForm from "../components/Layanan/LayananForm";
import { subscribeLayanan, addLayanan, updateLayanan, deleteLayanan } from "../services/firestoreService";

export default function Layanan({ isOpen }) {
  const [layanan, setLayanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedLayanan, setSelectedLayanan] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    harga: "",
    durasi: "",
    rating: "",
    gambar: "",
    deskripsi: "",
  });

  // Fetch real-time Layanan
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeLayanan(
      (data) => {
        setLayanan(data);
        setLoading(false);
      },
      (err) => {
        console.error("Gagal mengambil data layanan:", err);
        setError("Gagal memuat data layanan.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // OPEN DETAIL
  const handleSelectLayanan = (item) => {
    setSelectedLayanan(item);

    setFormData({
      id: item.id,
      nama: item.nama,
      harga: item.harga,
      durasi: item.durasi,
      rating: item.rating,
      gambar: item.gambar,
      deskripsi: item.deskripsi,
    });

    setShowCreateForm(false);
  };

  // UPDATE
  const handleUpdate = async () => {
    try {
      await updateLayanan(formData.id, formData);
      alert("Layanan berhasil diperbarui");
      setSelectedLayanan(null);
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui layanan");
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Yakin ingin menghapus layanan ini?"
    );

    if (!confirmDelete) return;

    try {
      await deleteLayanan(id);
      setSelectedLayanan(null);
      alert("Layanan berhasil dihapus");
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus layanan");
    }
  };

  // CREATE
  const handleAddLayanan = async (newLayanan) => {
    try {
      await addLayanan(newLayanan);
      setShowCreateForm(false);
      alert("Layanan berhasil ditambahkan");
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan layanan");
    }
  };

  return (
    <div
      className={`
        bg-[#ECECEC]
        min-h-screen
        p-5
        transition-all
        duration-300

        ${
          isOpen
            ? "ml-[280px]"
            : "ml-[90px]"
        }
      `}
    >
      <Header />

      {/* HEADER */}
      <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-[#2B3674]">
          {loading ? "Loading..." : `${layanan.length} Layanan`}
        </h1>

        <button
          onClick={() => {
            setSelectedLayanan(null);
            setShowCreateForm(true);
          }}
          className="
            flex items-center
            gap-2
            bg-[#214E8A]
            text-white
            px-5
            py-3
            rounded-2xl
            hover:bg-[#193d6d]
          "
        >
          <Plus size={20} />
          Tambah Layanan
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-3xl p-8 shadow-sm mt-8">
          <Loader2 className="animate-spin text-[#214E8A] mb-2" size={40} />
          <p className="text-gray-600 font-medium">Memuat data layanan...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-3xl text-center font-medium max-w-lg mx-auto mt-10 shadow-sm">
          {error}
        </div>
      ) : (
        <div className="mt-8 flex flex-col 2xl:flex-row gap-6">

          {/* LIST */}
          <div
            className={`
              grid gap-5 flex-1

              ${
                selectedLayanan || showCreateForm
                  ? "grid-cols-1 lg:grid-cols-2"
                  : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
              }
            `}
          >
            {layanan.map((item) => (
              <LayananCard
                key={item.id}
                layanan={item}
                isSelected={
                  selectedLayanan?.id === item.id
                }
                onClick={() =>
                  handleSelectLayanan(item)
                }
              />
            ))}
          </div>

          {/* DETAIL EDIT */}
          {selectedLayanan && (
            <div className="w-full 2xl:w-[430px] flex-shrink-0">
              <LayananDetail
                selected={selectedLayanan}
                formData={formData}
                setFormData={setFormData}
                onSave={handleUpdate}
                onDelete={handleDelete}
                onClose={() => setSelectedLayanan(null)}
              />
            </div>
          )}

          {/* CREATE */}
          {showCreateForm && (
            <div className="w-full 2xl:w-[430px] flex-shrink-0">
              <LayananForm
                onClose={() => setShowCreateForm(false)}
                onSave={handleAddLayanan}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}