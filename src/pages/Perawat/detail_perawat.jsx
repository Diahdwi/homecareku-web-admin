import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

export default function DetailPerawat({ isOpen }) {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Data perawat dibuat state supaya bisa di-edit (CRUD)
  const [formData, setFormData] = useState({
    id: 1,
    name: "Bintang Gumilang, S.Kep",
    jenisKelamin: "Laki-laki",
    tanggalLahir: "2001-08-05",
    email: "abyanfaza@gmail.com",
    password: "abyan123",
    phone: "+62 809-7651-321",
    alamat: "Jl. Gundalgandul No. 2, Kudus, Jawa Tengah",
    img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bintang&backgroundColor=b6e3f4",
    sertifikat: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        sertifikat: file,
      }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    // Di aplikasi sungguhan, kamu bisa panggil API backend di sini
    alert("Perubahan data berhasil disimpan!");
  };

  const handleDeactivate = () => {
    setShowPopup(false);
    alert("Pengguna berhasil dinonaktifkan.");
    navigate("/perawat");
  };

  return (
    <div
      className={`bg-[#ECECEC] min-h-screen p-5 transition-all duration-300 ${
        isOpen ? "lg:ml-[280px]" : "lg:ml-[90px]"
      } relative`}
    >
      <Header />

      {/* Header Section */}
      <div className="flex items-center mt-8 mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-[#2B3674]">
          Detail Perawat
        </h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm max-w-4xl mb-10">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100 shrink-0">
            <img src={formData.img} alt={formData.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 w-full md:w-auto">
            <p className="font-bold text-black mb-1">Nama Perawat:</p>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="border-b border-black pb-1 min-w-[280px] w-full max-w-md text-black focus:outline-none focus:border-blue-500 bg-transparent font-medium"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-gray-200">
          <button className="font-bold text-black pb-2 border-b-2 border-black">
            Data Diri
          </button>
          <button 
            onClick={() => navigate('/capaian_perawat')}
            className="font-bold text-gray-500 pb-2 hover:text-black transition-colors"
          >
            Capaian
          </button>
        </div>

        {/* Data Fields */}
        <div className="space-y-6 mb-10">
          <div>
            <p className="text-[#818807] font-bold text-sm mb-1">Jenis Kelamin</p>
            <select
              name="jenisKelamin"
              value={formData.jenisKelamin}
              onChange={handleInputChange}
              className="text-black text-sm w-full max-w-md border-b border-gray-300 focus:outline-none focus:border-blue-500 pb-1 bg-transparent"
            >
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
          <div>
            <p className="text-[#818807] font-bold text-sm mb-1">Tanggal Lahir</p>
            <input
              type="date"
              name="tanggalLahir"
              value={formData.tanggalLahir}
              onChange={handleInputChange}
              className="text-black text-sm w-full max-w-md border-b border-gray-300 focus:outline-none focus:border-blue-500 pb-1 bg-transparent"
            />
          </div>
          <div>
            <p className="text-[#818807] font-bold text-sm mb-1">Email</p>
            <input
              type="email"
              name="email"
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
              value={formData.password}
              onChange={handleInputChange}
              className="text-black text-sm w-full max-w-md border-b border-gray-300 focus:outline-none focus:border-blue-500 pb-1 bg-transparent"
            />
          </div>
          <div>
            <p className="text-[#818807] font-bold text-sm mb-1">No. Telepon</p>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="text-black text-sm w-full max-w-md border-b border-gray-300 focus:outline-none focus:border-blue-500 pb-1 bg-transparent"
            />
          </div>
          <div>
            <p className="text-[#818807] font-bold text-sm mb-1">Alamat</p>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={handleInputChange}
              rows="2"
              className="text-black text-sm w-full max-w-md border-b border-gray-300 focus:outline-none focus:border-blue-500 pb-1 bg-transparent resize-none"
            />
          </div>
          <div>
            <p className="text-[#818807] font-bold text-sm mb-2">Sertifikat</p>
            <input 
              type="file" 
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="block w-full max-w-md text-sm text-gray-600
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-[#214E8A]
                hover:file:bg-blue-100 cursor-pointer"
            />
            {formData.sertifikat && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-3">File terpilih: {formData.sertifikat.name}</p>
                
                {/* Preview Area */}
                {formData.sertifikat.type.startsWith("image/") ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview Sertifikat" 
                    className="max-w-full h-auto max-h-[300px] rounded-lg border border-gray-200 shadow-sm" 
                  />
                ) : formData.sertifikat.type === "application/pdf" ? (
                  <iframe 
                    src={previewUrl} 
                    className="w-full max-w-md h-[400px] border border-gray-200 rounded-lg shadow-sm" 
                    title="Preview PDF" 
                  />
                ) : (
                  <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-gray-200 max-w-md">
                    Preview tidak tersedia untuk format file ini (hanya mendukung Gambar dan PDF).
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          <button 
            onClick={handleSave}
            className="w-full bg-[#D9D9D9] text-gray-700 font-medium py-3 rounded-full hover:bg-gray-300 transition-colors"
          >
            Simpan Perubahan
          </button>
          <button 
            onClick={() => setShowPopup(true)}
            className="w-full bg-[#D83F11] text-white font-medium py-3 rounded-full hover:bg-[#b8350e] transition-colors"
          >
            Nonaktifkan Pengguna
          </button>
        </div>
      </div>

      {/* Pop Up Confirmation */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Konfirmasi</h3>
            <p className="text-gray-600 mb-8">
              Apakah Anda yakin ingin menonaktifkan pengguna <strong>{formData.name}</strong>?
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDeactivate}
                className="w-full bg-[#D83F11] text-white font-medium py-2.5 rounded-full hover:bg-[#b8350e] transition-colors"
              >
                Ya, Nonaktifkan
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
