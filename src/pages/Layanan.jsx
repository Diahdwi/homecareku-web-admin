import { useState } from "react";
import { Plus } from "lucide-react";

import Header from "../components/Header";
import LayananCard from "../components/Layanan/LayananCard";
import LayananDetail from "../components/Layanan/LayananDetail";
import LayananForm from "../components/Layanan/LayananForm";

export default function Layanan({ isOpen }) {
  const [layanan, setLayanan] = useState([
    {
      id: 1,
      nama: "Khitan Modern",
      harga: "Rp 850.000",
      durasi: "60 Menit",
      rating: "4.9",
      gambar: "/khitan.png",
      deskripsi:
        "Layanan khitan modern dengan metode minim rasa sakit dan proses penyembuhan lebih cepat.",
    },
    {
      id: 2,
      nama: "Pasang Kateter",
      harga: "Rp 250.000",
      durasi: "30 Menit",
      rating: "4.8",
      gambar: "/kateter.png",
      deskripsi:
        "Pemasangan kateter urine secara steril oleh tenaga medis profesional.",
    },
    {
      id: 3,
      nama: "Terapi Bekam",
      harga: "Rp 150.000",
      durasi: "45 Menit",
      rating: "4.7",
      gambar: "/bekam.png",
      deskripsi:
        "Terapi bekam untuk membantu melancarkan peredaran darah dan menjaga kesehatan tubuh.",
    },
    {
      id: 4,
      nama: "Pasang NGT",
      harga: "Rp 350.000",
      durasi: "40 Menit",
      rating: "4.8",
      gambar: "/ngt.png",
      deskripsi:
        "Pemasangan NGT untuk pasien yang membutuhkan bantuan asupan nutrisi.",
    },
    {
      id: 5,
      nama: "Perawatan Luka",
      harga: "Rp 200.000",
      durasi: "45 Menit",
      rating: "4.9",
      gambar: "/luka.png",
      deskripsi:
        "Perawatan luka steril untuk mempercepat proses penyembuhan pasien.",
    },
    {
      id: 6,
      nama: "Terapi Inframerah",
      harga: "Rp 180.000",
      durasi: "30 Menit",
      rating: "4.6",
      gambar: "/inframerah.png",
      deskripsi:
        "Terapi menggunakan sinar inframerah untuk membantu pemulihan otot dan sendi.",
    },
    {
      id: 7,
      nama: "Pasang Infus",
      harga: "Rp 220.000",
      durasi: "25 Menit",
      rating: "4.8",
      gambar: "/infus.png",
      deskripsi:
        "Pemasangan infus untuk kebutuhan cairan dan pengobatan pasien.",
    },
    {
      id: 8,
      nama: "Cek Lab Mini",
      harga: "Rp 175.000",
      durasi: "20 Menit",
      rating: "4.7",
      gambar: "/lab_mini.png",
      deskripsi:
        "Pemeriksaan laboratorium sederhana yang dapat dilakukan di rumah.",
    },
  ]);

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
  const handleUpdate = () => {
    setLayanan((prev) =>
      prev.map((item) =>
        item.id === formData.id ? formData : item
      )
    );

    setSelectedLayanan(formData);

    alert("Layanan berhasil diperbarui");
  };

  // DELETE
  const handleDelete = () => {
    const confirmDelete = window.confirm(
      "Yakin ingin menghapus layanan ini?"
    );

    if (!confirmDelete) return;

    setLayanan((prev) =>
      prev.filter((item) => item.id !== formData.id)
    );

    setSelectedLayanan(null);
  };

  // CREATE
  const handleAddLayanan = (newLayanan) => {
    const layananBaru = {
      id: Date.now(),
      ...newLayanan,
    };

    setLayanan((prev) => [...prev, layananBaru]);

    setShowCreateForm(false);
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
            ? "lg:ml-[280px]"
            : "lg:ml-[90px]"
        }
      `}
    >
      <Header />

      {/* HEADER */}
      <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-[#2B3674]">
          {layanan.length} Layanan
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
    </div>
  );
}