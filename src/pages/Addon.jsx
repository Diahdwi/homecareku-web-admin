import { useState, useEffect } from "react";
import { Plus, Loader2, Edit, Trash2 } from "lucide-react";
import Header from "../components/Header";
import { subscribeAddons, addAddon, updateAddon } from "../services/firestoreService";

export default function Addon({ isOpen }) {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: null, nama_addon: "", harga_default: "" });

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeAddons(
      (data) => {
        setAddons(data);
        setLoading(false);
      },
      (err) => {
        console.error("Gagal mengambil data addon:", err);
        setError("Gagal memuat data addon.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      nama_addon: item.nama_addon,
      harga_default: item.harga_default,
    });
    setShowForm(true);
  };

  const handleToggleActive = async (item) => {
    try {
      await updateAddon(item.id, { ...item, is_active: !item.is_active });
    } catch (err) {
      console.error(err);
      alert("Gagal mengubah status addon");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await updateAddon(formData.id, formData);
        alert("Addon berhasil diperbarui");
      } else {
        await addAddon(formData);
        alert("Addon berhasil ditambahkan");
      }
      setShowForm(false);
      setFormData({ id: null, nama_addon: "", harga_default: "" });
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan addon");
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  };

  return (
    <div
      className={`
        bg-[#ECECEC]
        min-h-screen
        p-5
        transition-all
        duration-300
        ${isOpen ? "ml-[280px]" : "ml-[90px]"}
      `}
    >
      <Header />

      <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-[#2B3674]">
          {loading ? "Loading..." : `${addons.length} Add-On`}
        </h1>

        <button
          onClick={() => {
            setFormData({ id: null, nama_addon: "", harga_default: "" });
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-[#214E8A] text-white px-5 py-2.5 rounded-full hover:bg-[#193d6d] font-semibold"
        >
          <Plus size={20} />
          Tambah Add-On
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-3xl p-8 shadow-sm mt-8">
          <Loader2 className="animate-spin text-[#214E8A] mb-2" size={40} />
          <p className="text-gray-600 font-medium">Memuat data addon...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-3xl text-center font-medium max-w-lg mx-auto mt-10 shadow-sm">
          {error}
        </div>
      ) : (
        <div className="mt-8 flex flex-col 2xl:flex-row gap-6">
          <div className={`grid gap-5 flex-1 ${showForm ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
            {addons.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="font-bold text-xl text-[#2B3674] mb-2">{item.nama_addon}</h2>
                  <p className="text-lg font-semibold text-[#79B735]">{formatCurrency(item.harga_default)}</p>
                </div>
                <div className="flex gap-2 mt-4 items-center">
                  <button onClick={() => handleEdit(item)} className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-xl transition-colors font-medium">
                    <Edit size={16} /> Edit
                  </button>
                  <div className="flex-1 flex items-center justify-between bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                    <span className={`text-sm font-semibold ${item.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                    <button 
                      onClick={() => handleToggleActive(item)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showForm && (
            <div className="w-full 2xl:w-[430px] flex-shrink-0 bg-white rounded-3xl p-6 shadow-sm self-start sticky top-24">
              <h2 className="text-xl font-bold text-[#2B3674] mb-6">
                {formData.id ? "Edit Add-On" : "Tambah Add-On"}
              </h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Add-On</label>
                  <input
                    type="text"
                    required
                    value={formData.nama_addon}
                    onChange={(e) => setFormData({ ...formData, nama_addon: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#214E8A]"
                    placeholder="Contoh: Vitamin C"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formData.harga_default}
                    onChange={(e) => setFormData({ ...formData, harga_default: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#214E8A]"
                    placeholder="Contoh: 150000"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold transition-colors">Batal</button>
                  <button type="submit" className="flex-1 bg-[#214E8A] hover:bg-[#193d6d] text-white py-2.5 rounded-xl font-semibold transition-colors">Simpan</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
