import { useState, useEffect, useRef } from "react";
import { X, Search, MapPin, Save, Loader2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { db, auth } from "../config/firebase";
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";

// Fix leaflet default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationMarker({ position, setPosition, onPositionChange }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      if (onPositionChange) onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const newPos = e.target.getLatLng();
          setPosition(newPos);
          if (onPositionChange) onPositionChange(newPos.lat, newPos.lng);
        },
      }}
    ></Marker>
  );
}

export default function EditKlinikModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [docId, setDocId] = useState(null);

  const [formData, setFormData] = useState({
    nama_klinik: "Klinik Homecare-Ku",
    telepon: "",
    alamat_lengkap: "",
    provinsi: "",
    kota: "",
    kode_pos: "",
    catatan: "",
    jam_senin_jumat: "08:00 - 17:00",
    jam_sabtu: "08:00 - 13:00",
    jam_minggu: "Tutup",
  });

  const [position, setPosition] = useState({ lat: -7.0543, lng: 110.4368 });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchKlinikData();
    }
  }, [isOpen]);

  const fetchKlinikData = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "alamat_klinik"));
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();
        setDocId(docSnap.id);
        
        setFormData({
          nama_klinik: data.nama_klinik || "",
          telepon: data.telepon || "",
          alamat_lengkap: data.alamat_lengkap || "",
          provinsi: data.provinsi || "",
          kota: data.kota || "",
          kode_pos: data.kode_pos || "",
          catatan: data.catatan || "",
          jam_senin_jumat: data.jam_operasional?.senin_jumat || "",
          jam_sabtu: data.jam_operasional?.sabtu || "",
          jam_minggu: data.jam_operasional?.minggu || "",
        });

        if (data.lat && data.lon) {
          setPosition({ lat: parseFloat(data.lat), lng: parseFloat(data.lon) });
        }
      }
    } catch (error) {
      console.error("Error fetching alamat_klinik: ", error);
    }
    setLoading(false);
  };

  const fetchAddressFromCoords = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      if (data && data.address) {
        setFormData((prev) => ({
          ...prev,
          alamat_lengkap: data.display_name || prev.alamat_lengkap,
          kota: data.address.city || data.address.town || data.address.village || data.address.county || prev.kota,
          provinsi: data.address.state || data.address.province || prev.provinsi,
          kode_pos: data.address.postcode || prev.kode_pos,
        }));
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setPosition({ lat, lng: lon });
    
    // Auto-fill address parts based on what Nominatim returns
    setFormData((prev) => ({
      ...prev,
      alamat_lengkap: result.display_name,
      kota: result.address?.city || result.address?.town || result.address?.village || result.address?.county || prev.kota,
      provinsi: result.address?.state || result.address?.province || prev.provinsi,
      kode_pos: result.address?.postcode || prev.kode_pos,
    }));
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      const dataToSave = {
        nama_klinik: formData.nama_klinik,
        telepon: formData.telepon,
        alamat_lengkap: formData.alamat_lengkap,
        provinsi: formData.provinsi,
        kota: formData.kota,
        kode_pos: formData.kode_pos,
        catatan: formData.catatan,
        lat: position.lat,
        lon: position.lng,
        is_aktif: true,
        is_pusat: true,
        jam_operasional: {
          senin_jumat: formData.jam_senin_jumat,
          sabtu: formData.jam_sabtu,
          minggu: formData.jam_minggu,
        },
        updated_at: serverTimestamp(),
      };

      if (docId) {
        // Update existing
        await updateDoc(doc(db, "alamat_klinik", docId), dataToSave);
      } else {
        // Add new
        dataToSave.created_at = serverTimestamp();
        dataToSave.created_by = user ? user.email || "admin" : "admin";
        await addDoc(collection(db, "alamat_klinik"), dataToSave);
      }
      
      alert("Lokasi Klinik berhasil disimpan!");
      onClose();
    } catch (error) {
      console.error("Error saving alamat_klinik: ", error);
      alert("Gagal menyimpan data klinik.");
    }
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#214E8A] text-white">
          <div className="flex items-center gap-3">
            <MapPin size={24} />
            <h2 className="text-xl font-bold font-['Poppins']">Pengaturan Lokasi Klinik</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-[#214E8A]" size={40} />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            {/* Form Section */}
            <div className="w-full lg:w-1/2 p-6 overflow-y-auto border-r border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 font-['Poppins']">Informasi Klinik</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Nama Klinik</label>
                  <input type="text" name="nama_klinik" value={formData.nama_klinik} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214E8A] outline-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Telepon</label>
                    <input type="text" name="telepon" value={formData.telepon} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214E8A] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Kode Pos</label>
                    <input type="text" name="kode_pos" value={formData.kode_pos} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214E8A] outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Alamat Lengkap</label>
                  <textarea name="alamat_lengkap" value={formData.alamat_lengkap} onChange={handleChange} rows="2" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214E8A] outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Kota</label>
                    <input type="text" name="kota" value={formData.kota} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214E8A] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Provinsi</label>
                    <input type="text" name="provinsi" value={formData.provinsi} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214E8A] outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Catatan Tambahan (cth: Patokan Jalan)</label>
                  <input type="text" name="catatan" value={formData.catatan} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#214E8A] outline-none" />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4 font-['Poppins']">Jam Operasional</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Senin - Jumat</label>
                      <input type="text" name="jam_senin_jumat" value={formData.jam_senin_jumat} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-sm" placeholder="08:00 - 17:00" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Sabtu</label>
                      <input type="text" name="jam_sabtu" value={formData.jam_sabtu} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-sm" placeholder="08:00 - 13:00" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Minggu</label>
                      <input type="text" name="jam_minggu" value={formData.jam_minggu} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-sm" placeholder="Tutup" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="w-full lg:w-1/2 bg-gray-50 flex flex-col relative h-[400px] lg:h-auto">
              <div className="absolute top-4 left-4 right-4 z-[400]">
                <div className="flex shadow-lg rounded-lg overflow-hidden bg-white">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Cari lokasi (cth: Tembalang, Semarang)"
                    className="flex-1 p-3 outline-none"
                  />
                  <button onClick={handleSearch} className="bg-[#214E8A] text-white px-4 hover:bg-blue-800 transition-colors">
                    <Search size={20} />
                  </button>
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-2 bg-white rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {searchResults.map((res, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectSearchResult(res)}
                        className="p-3 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-50"
                      >
                        {res.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 w-full h-full">
                <MapContainer center={position} zoom={15} style={{ height: "100%", width: "100%", zIndex: 10 }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker position={position} setPosition={setPosition} onPositionChange={fetchAddressFromCoords} />
                </MapContainer>
              </div>

              <div className="absolute bottom-4 left-4 right-4 z-[400] bg-white p-3 rounded-lg shadow-lg flex items-center justify-between">
                <div className="text-xs text-gray-500 font-mono">
                  Lat: {position.lat.toFixed(6)} <br/> Lon: {position.lng.toFixed(6)}
                </div>
                <div className="text-sm font-semibold text-[#214E8A]">
                  Tarik pin atau klik peta untuk ubah lokasi
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors font-medium">
            Batal
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving || loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#214E8A] text-white rounded-lg hover:bg-blue-800 transition-colors font-medium disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? "Menyimpan..." : "Simpan Lokasi"}
          </button>
        </div>
      </div>
    </div>
  );
}
