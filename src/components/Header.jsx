import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, MessageSquare, Search, Camera } from "lucide-react";
import ChatPopup from "./ChatPopup";
import NotifPopup from "./NotifPopup";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { avatars, defaultAvatarPlaceholder, subscribeAdminNotifications } from "../services/firestoreService";
import { subscribeAdminChatRooms } from "../services/chatService";


export default function Header() {
  const navigate = useNavigate();

  // Chat popup state
  const [showChatPopup, setShowChatPopup] = useState(false);
  const chatRef = useRef(null);
  const chatHoverTimeout = useRef(null);

  // Notif popup state
  const [showNotifPopup, setShowNotifPopup] = useState(false);
  const notifRef = useRef(null);
  const notifHoverTimeout = useRef(null);

  // Admin profile state
  const [adminUid, setAdminUid] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const profileMenuRef = useRef(null);

  // Real-time unread chat count
  const [totalUnreadChat, setTotalUnreadChat] = useState(0);

  // Real-time admin notifications
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeAdminNotifications((list) => {
      setNotifications(list);
    });
    return () => unsubscribe();
  }, []);

  const unreadNotifCount = notifications.filter(
    (n) => localStorage.getItem(`read_notif_${n.id}`) !== "true"
  ).length;

  const markNotifAsRead = (id) => {
    localStorage.setItem(`read_notif_${id}`, "true");
    setNotifications((prev) => [...prev]);
  };


  useEffect(() => {
    const unsubscribe = subscribeAdminChatRooms((roomList) => {
      const total = roomList.reduce((sum, r) => sum + (r.unread || 0), 0);
      setTotalUnreadChat(total);
    });
    return () => unsubscribe();
  }, []);

  // Close popups on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (chatRef.current && !chatRef.current.contains(e.target)) {
        setShowChatPopup(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifPopup(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowPhotoOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen to auth state and fetch admin profile data in real-time
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdminUid(user.uid);
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const avatarIdx = data.avatar_index !== undefined ? parseInt(data.avatar_index) : -1;
            const photoBase64 = data.photoBase64 || null;
            
            let profileImg = defaultAvatarPlaceholder;
            if (photoBase64) {
              profileImg = `data:image/jpeg;base64,${photoBase64}`;
            } else if (avatarIdx >= 0 && avatars[avatarIdx]) {
              profileImg = avatars[avatarIdx];
            }

            setAdminData({
              name: data.nama || "Admin",
              avatarIndex: avatarIdx,
              photoBase64: photoBase64,
              img: profileImg
            });
          } else {
            setAdminData({
              name: "Admin",
              avatarIndex: -1,
              photoBase64: null,
              img: defaultAvatarPlaceholder
            });
          }
        }, (err) => {
          console.error("Gagal mengambil data admin:", err);
        });
        return () => unsubscribeDoc();
      } else {
        setAdminUid(null);
        setAdminData(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Avatar Selection Handlers
  const handleAvatarSelect = async (idx) => {
    if (!adminUid) return;
    try {
      const userDocRef = doc(db, "users", adminUid);
      await updateDoc(userDocRef, {
        avatar_index: idx,
        photoBase64: null
      });
      setShowPhotoOptions(false);
    } catch (error) {
      console.error("Gagal mengupdate avatar admin:", error);
      alert("Gagal memperbarui avatar.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && adminUid) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result.split(",")[1];
        try {
          const userDocRef = doc(db, "users", adminUid);
          await updateDoc(userDocRef, {
            photoBase64: base64String,
            avatar_index: -1
          });
          setShowPhotoOptions(false);
        } catch (error) {
          console.error("Gagal mengupload foto admin:", error);
          alert("Gagal mengunggah foto.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = async () => {
    if (!adminUid) return;
    try {
      const userDocRef = doc(db, "users", adminUid);
      await updateDoc(userDocRef, {
        photoBase64: null,
        avatar_index: -1
      });
      setShowPhotoOptions(false);
    } catch (error) {
      console.error("Gagal menghapus foto admin:", error);
      alert("Gagal menghapus foto profil.");
    }
  };

  // Chat hover handlers
  const handleChatMouseEnter = () => {
    clearTimeout(chatHoverTimeout.current);
    chatHoverTimeout.current = setTimeout(() => setShowChatPopup(true), 200);
  };
  const handleChatMouseLeave = () => {
    clearTimeout(chatHoverTimeout.current);
    chatHoverTimeout.current = setTimeout(() => setShowChatPopup(false), 300);
  };

  // Notif hover handlers
  const handleNotifMouseEnter = () => {
    clearTimeout(notifHoverTimeout.current);
    notifHoverTimeout.current = setTimeout(() => setShowNotifPopup(true), 200);
  };
  const handleNotifMouseLeave = () => {
    clearTimeout(notifHoverTimeout.current);
    notifHoverTimeout.current = setTimeout(() => setShowNotifPopup(false), 300);
  };

  return (
    <div className="bg-white rounded-[20px] px-6 py-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">

        {/* SEARCH */}
        <div className="flex-1 min-w-[250px] relative">
          <Search
            size={20}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="text"
            placeholder="Cari yang Anda butuhkan"
            className="
              w-full
              h-12
              rounded-full
              border
              border-[#214E8A]
              pl-14
              pr-5
              outline-none
            "
          />
        </div>

        {/* NOTIF */}
        <div
          ref={notifRef}
          className="relative"
          onMouseEnter={handleNotifMouseEnter}
          onMouseLeave={handleNotifMouseLeave}
        >
          <button
            onClick={() => {
              setShowNotifPopup(false);
              navigate("/notifikasi");
            }}
            className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center relative"
          >
            <Bell size={20} className="text-[#214E8A]" />

            {/* Unread Badge */}
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* Hover Popup */}
          {showNotifPopup && (
            <NotifPopup
              notifications={notifications}
              markAsRead={markNotifAsRead}
            />
          )}
        </div>

        {/* CHAT */}
        <div
          ref={chatRef}
          className="relative"
          onMouseEnter={handleChatMouseEnter}
          onMouseLeave={handleChatMouseLeave}
        >
          <button
            onClick={() => {
              setShowChatPopup(false);
              navigate("/chat");
            }}
            className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center relative"
          >
            <MessageSquare size={20} className="text-[#214E8A]" />

            {/* Unread Badge — synced with Firebase real-time */}
            {totalUnreadChat > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#214E8A] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalUnreadChat > 99 ? "99+" : totalUnreadChat}
              </span>
            )}
          </button>

          {/* Hover Popup */}
          {showChatPopup && <ChatPopup />}
        </div>

        {/* PROFILE */}
        <div className="relative" ref={profileMenuRef}>
          <div
            onClick={() => setShowPhotoOptions(!showPhotoOptions)}
            className="flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0 relative group">
              <img
                src={adminData ? adminData.img : defaultAvatarPlaceholder}
                alt="admin"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={14} />
              </div>
            </div>

            <span className="font-medium text-black">
              {adminData ? adminData.name : "Admin"}
            </span>
          </div>

          {/* Photo Selector Popover Box */}
          {showPhotoOptions && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 z-50 w-[300px]">
              <p className="font-bold text-xs text-gray-500 mb-2">Pilih Avatar Bawaan:</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {avatars.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAvatarSelect(idx)}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                      adminData && adminData.avatarIndex === idx && !adminData.photoBase64 
                        ? "border-[#214E8A]" 
                        : "border-transparent"
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
      </div>
    </div>
  );
}