import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

export default function TambahPerawat({ isOpen }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Data Diri");
  const [previewUrl, setPreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    jenisKelamin: "Laki-laki",
    tanggalLahir: "",
    email: "",
    password: "",
    phone: "",
    alamat: "",
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
    alert("Perawat baru berhasil ditambahkan!");
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
          Tambah Perawat
        </h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm max-w-6xl mb-10 overflow-x-auto">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center text-gray-400">
            {/* Generic avatar icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1 w-full md:w-auto">
            <p className="font-bold text-black mb-1">Nama Perawat:</p>
            <input
              type="text"
              name="name"
              placeholder="Masukkan nama perawat..."
              value={formData.name}
              onChange={handleInputChange}
              className="border-b border-black pb-1 min-w-[280px] w-full max-w-md text-black focus:outline-none focus:border-blue-500 bg-transparent font-medium"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab("Data Diri")}
            className={`font-bold pb-2 ${activeTab === "Data Diri" ? "text-black border-b-2 border-black" : "text-gray-500 hover:text-black transition-colors"}`}
          >
            Data Diri
          </button>
          <button 
            onClick={() => setActiveTab("Capaian")}
            className={`font-bold pb-2 ${activeTab === "Capaian" ? "text-black border-b-2 border-black" : "text-gray-500 hover:text-black transition-colors"}`}
          >
            Capaian
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "Data Diri" ? (
          <>
            <div className="space-y-6 mb-10 max-w-4xl">
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
                <p className="text-[#818807] font-bold text-sm mb-1">No. Telepon</p>
                <input
                  type="text"
                  name="phone"
                  placeholder="Misal: +62 812-3456-7890"
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
                        Preview tidak tersedia untuk format file ini.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 max-w-4xl">
              <button 
                onClick={handleSave}
                className="w-full bg-[#D9D9D9] text-black font-medium py-3 rounded-full hover:bg-gray-300 transition-colors"
              >
                Simpan Perawat
              </button>
              <button 
                onClick={() => navigate('/perawat')}
                className="w-full bg-gray-100 text-gray-600 font-medium py-3 rounded-full hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
            </div>
          </>
        ) : (
          <div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-[#818807]">0</span>
              <span className="text-lg font-bold text-gray-800">total tindakan</span>
            </div>

            <div className="min-w-[900px]">
              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr_2fr] px-6 text-gray-800 font-medium text-[15px] mb-3">
                <div>Layanan</div>
                <div>Tipe Layanan</div>
                <div>Pasien</div>
                <div>Waktu</div>
                <div>Tanggal</div>
                <div>Rekam Medis</div>
              </div>
              <div className="flex justify-center items-center h-40 text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-300 shadow-sm">
                Belum ada capaian/tindakan (Perawat belum didaftarkan)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
