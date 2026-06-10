import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCeN_izbTvxor336zrhynDbr9SCYGeyf0",
  authDomain: "homecareku-94c61.firebaseapp.com",
  databaseURL: "https://homecareku-94c61-default-rtdb.firebaseio.com",
  projectId: "homecareku-94c61",
  storageBucket: "homecareku-94c61.appspot.com",
  messagingSenderId: "617644220368",
  appId: "1:617644220368:web:5aeecdbae8e298eeda3d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const rtdb = getDatabase(app);

async function simulatePatientChat() {
  const dummyPatientId = "dummy_patient_123";
  const roomId = dummyPatientId; // For admin support, room ID is the patient's UID
  const now = Date.now();

  console.log("Memulai simulasi chat dari pasien...");

  // 1. Buat Room Chat baru di /chat_rooms/dummy_patient_123
  const roomRef = ref(rtdb, `chat_rooms/${roomId}`);
  await set(roomRef, {
    id_chat_rooms: roomId,
    type: "admin",
    patient_id: dummyPatientId,
    patient_name: "Budi Handoko (Testing Pasien)",
    patient_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi&backgroundColor=b6e3f4",
    last_message: "Halo Admin, saya butuh bantuan untuk mengganti jadwal kunjungan perawat.",
    last_message_at: now,
    created_at: now,
    unread_admin: 1, // Agar admin melihat ada 1 pesan baru
    unread_patient: 0
  });
  console.log("Room chat berhasil dibuat!");

  // 2. Kirim pesan pertama dari pasien di /messages/dummy_patient_123
  const messagesRef = ref(rtdb, `messages/${roomId}`);
  const newMsgRef = push(messagesRef);
  await set(newMsgRef, {
    id_chat: newMsgRef.key,
    id_chat_rooms: roomId,
    pesan: "Halo Admin, saya butuh bantuan untuk mengganti jadwal kunjungan perawat.",
    sender_id: dummyPatientId,
    sender_role: "patient",
    waktu: now,
    is_read: false,
    type: "text"
  });

  console.log("Pesan pertama dari pasien berhasil dikirim!");
  console.log("Silakan buka halaman Chat di website admin untuk melihat hasilnya!");
  process.exit(0);
}

simulatePatientChat().catch(console.error);
