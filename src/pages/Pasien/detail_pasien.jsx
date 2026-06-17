import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import { getPatientById, deletePatient } from "../../services/firestoreService";
import { Loader2, Trash2 } from "lucide-react";

export default function DetailPasien({ isOpen }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    jenisKelamin: "",
    tanggalLahir: "",
    email: "",
    password: "",
    phone: "",
    alamat: "",
    img: ""
  });

  // Date parsing for UI display
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");

  const months = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" }
  ];

  useEffect(() => {
    async function loadPatient() {
      try {
        setLoading(true);
        const data = await getPatientById(id);
        setFormData({
          name: data.name,
          jenisKelamin: data.jenisKelamin,
          tanggalLahir: data.tanggalLahir,
          email: data.email,
          password: data.password,
          phone: data.phone,
          alamat: data.alamat,
          img: data.img
        });

        if (data.tanggalLahir) {
          const parts = data.tanggalLahir.split("-");
          if (parts.length === 3) {
            setDobYear(parts[0]);
            setDobMonth(parseInt(parts[1]).toString());
            setDobDay(parseInt(parts[2]).toString());
          }
        }
      } catch (err) {
        console.error("Gagal memuat detail pasien:", err);
        setError("Gagal memuat detail pasien. Data mungkin tidak ditemukan.");
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadPatient();
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      setShowPopup(false);
      setDeleting(true);
      await deletePatient(id);
      alert("Akun pasien berhasil dihapus.");
      navigate("/pasien");
    } catch (err) {
      console.error("Gagal menghapus pasien:", err);
      alert("Gagal menghapus akun pasien.");
    } finally {
      setDeleting(false);
    }
  };

  const getMonthLabel = (val) => {
    const found = months.find(m => m.value === val);
    return found ? found.label : "";
  };

  return (
    <div
      className={`bg-[#ECECEC] min-h-screen p-5 transition-all duration-300 ${
        isOpen ? "ml-[280px]" : "ml-[90px]"
      } relative`}
    >
      <Header />

      {/* Header Section */}
      <div className="flex items-center mt-8 mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-[#2B3674]">
          Detail Pasien
        </h1>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-3xl p-8 shadow-sm">
          <Loader2 className="animate-spin text-[#214E8A] mb-2" size={40} />
          <p className="text-gray-600 font-medium">Memuat data pasien...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-3xl text-center font-medium max-w-lg mx-auto mt-10 shadow-sm">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 shadow-sm max-w-6xl mb-10">
          {/* Top Section */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100 border border-gray-200 shrink-0">
              <img src={formData.img} alt={formData.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 w-full md:w-auto">
              <p className="font-bold text-black mb-1">Nama Pasien:</p>
              <div className="border-b border-gray-300 pb-1 text-black font-semibold text-lg max-w-md">
                {formData.name}
              </div>
            </div>
          </div>

          {/* Data Fields */}
          <div className="space-y-6 mb-10 max-w-md">
            <div>
              <p className="text-[#818807] font-bold text-sm mb-1">Tanggal Lahir</p>
              <div className="text-black text-sm border-b border-gray-200 pb-1 font-medium">
                {dobDay && dobMonth && dobYear 
                  ? `${dobDay} ${getMonthLabel(dobMonth)} ${dobYear}` 
                  : "-"}
              </div>
            </div>
            <div>
              <p className="text-[#818807] font-bold text-sm mb-1">Email</p>
              <div className="text-black text-sm border-b border-gray-200 pb-1 font-medium">
                {formData.email || "-"}
              </div>
            </div>
            <div>
              <p className="text-[#818807] font-bold text-sm mb-1">No. Telepon</p>
              <div className="text-black text-sm border-b border-gray-200 pb-1 font-medium">
                {formData.phone || "-"}
              </div>
            </div>
            <div>
              <p className="text-[#818807] font-bold text-sm mb-1">Alamat</p>
              <div className="text-black text-sm border-b border-gray-200 pb-1 font-medium whitespace-pre-wrap">
                {formData.alamat || "-"}
              </div>
            </div>
          </div>

          {/* Delete Button (No Save/Update options) */}
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => setShowPopup(true)}
              disabled={deleting}
              className="w-full bg-[#D83F11] text-white font-medium py-3 rounded-full hover:bg-[#b8350e] transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {deleting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Trash2 size={18} />
              )}
              Hapus Akun Pasien
            </button>
          </div>
        </div>
      )}

      {/* Pop Up Confirmation */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Konfirmasi</h3>
            <p className="text-gray-600 mb-8">
              Apakah Anda yakin ingin menghapus akun pasien <strong>{formData.name}</strong>?
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDelete}
                className="w-full bg-[#D83F11] text-white font-medium py-2.5 rounded-full hover:bg-[#b8350e] transition-colors flex justify-center items-center gap-2"
              >
                <Trash2 size={18} />
                Ya, Hapus Akun
              </button>
              <button 
                onClick={() => setShowPopup(false)}
                className="w-full bg-gray-200 text-gray-800 font-medium py-2.5 rounded-full hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
