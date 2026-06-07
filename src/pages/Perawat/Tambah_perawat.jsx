import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { addNurse, avatars, defaultAvatarPlaceholder } from "../../services/firestoreService";
import { Loader2, Camera, Edit2 } from "lucide-react";

export default function TambahPerawat({ isOpen }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    jenisKelamin: "", // Starts empty for manual choice
    tanggalLahir: "",
    email: "",
    password: "",
    phone: "",
    alamat: "",
    noSertifikat: "",
    status: "Tidak Bertugas",
    lokasi: "", // Starts empty for "Pilih Lokasi"
    avatarIndex: -1,
    photoBase64: null,
    img: defaultAvatarPlaceholder
  });

  // Date picker selectors
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

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const years = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString());

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDayChange = (val) => {
    setDobDay(val);
    updateBirthDate(val, dobMonth, dobYear);
  };

  const handleMonthChange = (val) => {
    setDobMonth(val);
    updateBirthDate(dobDay, val, dobYear);
  };

  const handleYearChange = (val) => {
    setDobYear(val);
    updateBirthDate(dobDay, dobMonth, val);
  };

  const updateBirthDate = (d, m, y) => {
    if (d && m && y) {
      const paddedDay = d.padStart(2, "0");
      const paddedMonth = m.padStart(2, "0");
      const formattedDate = `${y}-${paddedMonth}-${paddedDay}`;
      setFormData(prev => ({ ...prev, tanggalLahir: formattedDate }));
    }
  };

  // Avatar Selection
  const handleAvatarSelect = (idx) => {
    setFormData(prev => ({
      ...prev,
      avatarIndex: idx,
      photoBase64: null,
      img: avatars[idx]
    }));
    setShowPhotoOptions(false);
  };

  // Convert uploaded image to Base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1];
        setFormData(prev => ({
          ...prev,
          photoBase64: base64String,
          avatarIndex: -1,
          img: reader.result
        }));
      };
      reader.readAsDataURL(file);
      setShowPhotoOptions(false);
    }
  };

  // Reset/Delete Profile Photo
  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photoBase64: null,
      avatarIndex: -1,
      img: defaultAvatarPlaceholder
    }));
    setShowPhotoOptions(false);
  };

  const validateAndSubmit = () => {
    if (!formData.name.trim()) {
      alert("Nama Lengkap wajib diisi!");
      return;
    }
    if (!formData.jenisKelamin) {
      alert("Pilih Jenis Kelamin!");
      return;
    }
    if (!formData.tanggalLahir) {
      alert("Pilih Tanggal Lahir!");
      return;
    }
    if (!formData.lokasi) {
      alert("Pilih Lokasi Kerja!");
      return;
    }
    if (!formData.email.trim() || !formData.password.trim()) {
      alert("Email dan Password wajib diisi!");
      return;
    }
    const cleanPhone = formData.phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 11) {
      alert("Nomor telepon harus minimal 11 angka!");
      return;
    }

    // Show save confirmation dialog
    setShowSaveConfirm(true);
  };

  const handleSave = async () => {
    setShowSaveConfirm(false);
    try {
      setSaving(true);
      setError(null);
      await addNurse(formData);
      alert("Perawat baru berhasil ditambahkan!");
      navigate("/perawat");
    } catch (err) {
      console.error("Gagal menambahkan perawat:", err);
      setError(err.message || "Gagal menyimpan perawat.");
    } finally {
      setSaving(false);
    }
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
          Tambah Perawat
        </h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm max-w-6xl mb-10">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 relative">
          <div className="relative group shrink-0">
            <div 
              onClick={() => setShowPhotoOptions(!showPhotoOptions)}
              className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0 cursor-pointer relative hover:brightness-95 transition-all flex items-center justify-center"
            >
              <img src={formData.img} alt="Preview Avatar" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={20} />
              </div>
            </div>

            {/* Photo Selector Popover Box */}
            {showPhotoOptions && (
              <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 z-20 w-[300px]">
                <p className="font-bold text-xs text-gray-500 mb-2">Pilih Avatar Bawaan:</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {avatars.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAvatarSelect(idx)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                        formData.avatarIndex === idx && !formData.photoBase64 ? "border-[#214E8A]" : "border-transparent"
                      }`}
                    >
                      <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                
                <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#214E8A] hover:underline cursor-pointer block text-center py-1 bg-blue-50 rounded-lg">
                    Unggah Foto Baru
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                  <button 
                    type="button" 
                    onClick={handleRemovePhoto}
                    className="text-xs font-semibold text-red-500 hover:underline block text-center py-1"
                  >
                    Hapus Foto Profil
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 w-full md:w-auto">
            <p className="font-bold text-black mb-1">Nama Perawat:</p>
            <div className="flex items-center gap-2 max-w-md border-b border-black pb-1">
              <input
                type="text"
                name="name"
                placeholder="Masukkan nama perawat..."
                value={formData.name}
                onChange={handleInputChange}
                className="w-full text-black focus:outline-none bg-transparent font-medium"
              />
              <Edit2 size={16} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Data Fields */}
        <div className="space-y-6 mb-10">
          {/* Status Perawat */}
          <div>
            <p className="text-[#818807] font-bold text-sm mb-1">Status Perawat</p>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="text-black text-sm w-full max-w-md border-b border-gray-300 focus:outline-none focus:border-blue-500 pb-1 bg-transparent"
            >
              <option value="Sedang Bertugas">Sedang Bekerja (Bertugas)</option>
              <option value="Tidak Bertugas">Tidak Bekerja (Tidak Bertugas)</option>
            </select>
          </div>

          {/* Lokasi Kerja (Boolean dropdown) */}
          <div>
            <p className="text-[#818807] font-bold text-sm mb-1">Lokasi Kerja</p>
            <select
              name="lokasi"
              value={formData.lokasi}
              onChange={handleInputChange}
              className="text-black text-sm w-full max-w-md border-b border-gray-300 focus:outline-none focus:border-blue-500 pb-1 bg-transparent"
            >
              <option value="" disabled>Pilih Lokasi Kerja</option>
              <option value="Rumah Pasien">Rumah Pasien</option>
              <option value="Klinik">Klinik</option>
            </select>
          </div>

          {/* Gender Selection */}
          <div>
            <p className="text-[#818807] font-bold text-sm mb-1">Jenis Kelamin</p>
            <select
              name="jenisKelamin"
              value={formData.jenisKelamin}
              onChange={handleInputChange}
              className="text-black text-sm w-full max-w-md border-b border-gray-300 focus:outline-none focus:border-blue-500 pb-1 bg-transparent"
            >
              <option value="" disabled>Pilih Jenis Kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          {/* Friendly Date Selection */}
          <div>
            <p className="text-[#818807] font-bold text-sm mb-2">Tanggal Lahir</p>
            <div className="flex gap-3 max-w-md">
              <select
                value={dobDay}
                onChange={(e) => handleDayChange(e.target.value)}
                className="flex-1 text-black text-sm border-b border-gray-300 focus:outline-none focus:border-blue-500 pb-1 bg-transparent"
              >
                <option value="">Hari</option>
                {days.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={dobMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="flex-1 text-black text-sm border-b border-gray-300 focus:outline-none focus:border-blue-500 pb-1 bg-transparent"
              >
                <option value="">Bulan</option>
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>

              <select
                value={dobYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="flex-1 text-black text-sm border-b border-gray-300 focus:outline-none focus:border-blue-500 pb-1 bg-transparent"
              >
                <option value="">Tahun</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Nomor Sertifikat (Placed above Email) */}
          <div>
            <p className="text-[#818807] font-bold text-sm mb-1">Nomor Sertifikat</p>
            <input
              type="text"
              name="noSertifikat"
              value={formData.noSertifikat}
              onChange={handleInputChange}
              placeholder="Masukkan nomor sertifikat..."
              className="text-black text-sm w-full max-w-md border-b border-gray-300 focus:outline-none focus:border-blue-500 pb-1 bg-transparent"
            />
          </div>

          <div>
            <p className="text-[#818807] font-bold text-sm mb-1">Email</p>
            <input
              type="email"
              name="email"
              placeholder="Masukkan email..."
              value={formData.email}
              onChange={handleInputChange}
              className="text-black text-sm w-full max-w-md border-b border-gray-300 focus:outline-none focus:border-blue-500 pb-1 bg-transparent"
            />
          </div>
          <div>
            <p className="text-[#818807] font-bold text-sm mb-1">Password</p>
            <input
              type="text"
              name="password"
              placeholder="Buat password..."
              value={formData.password}
              onChange={handleInputChange}
              className="text-black text-sm w-full max-w-md border-b border-gray-300 focus:outline-none focus:border-blue-500 pb-1 bg-transparent"
            />
          </div>
          <div>
            <p className="text-[#818807] font-bold text-sm mb-1">No. Telepon (Min. 11 angka)</p>
            <input
              type="text"
              name="phone"
              placeholder="Misal: 081234567890"
              value={formData.phone}
              onChange={handleInputChange}
              className="text-black text-sm w-full max-w-md border-b border-gray-300 focus:outline-none focus:border-blue-500 pb-1 bg-transparent"
            />
          </div>
          <div>
            <p className="text-[#818807] font-bold text-sm mb-1">Alamat</p>
            <textarea
              name="alamat"
              placeholder="Masukkan alamat lengkap..."
              value={formData.alamat}
              onChange={handleInputChange}
              rows="2"
              className="text-black text-sm w-full max-w-md border-b border-gray-300 focus:outline-none focus:border-blue-500 pb-1 bg-transparent resize-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 max-w-4xl">
          <button 
            onClick={validateAndSubmit}
            disabled={saving}
            className="w-full bg-[#214E8A] text-white font-medium py-3 rounded-full hover:bg-[#1a3e6e] transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {saving && <Loader2 className="animate-spin" size={20} />}
            {saving ? "Menyimpan..." : "Simpan Perawat"}
          </button>
          <button 
            onClick={() => navigate('/perawat')}
            disabled={saving}
            className="w-full bg-gray-100 text-gray-600 font-medium py-3 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
        </div>
      </div>

      {/* Pop Up Save Confirmation */}
      {showSaveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Konfirmasi Simpan</h3>
            <p className="text-gray-600 mb-8">
              Apakah Anda yakin ingin mendaftarkan perawat baru ini?
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleSave}
                className="w-full bg-[#214E8A] text-white font-medium py-2.5 rounded-full hover:bg-[#1a3e6e] transition-colors"
              >
                Ya, Simpan
              </button>
              <button 
                onClick={() => setShowSaveConfirm(false)}
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
