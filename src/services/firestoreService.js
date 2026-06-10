import { db } from "../config/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  addDoc,
  Timestamp,
  onSnapshot,
  collectionGroup
} from "firebase/firestore";
import { initializeApp, getApps, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// Firebase config for secondary auth instance (so we don't sign out the admin)
const firebaseConfig = {
  apiKey: "AIzaSyCCeN_izbTvxor336zrhynDbr9SCYGeyf0",
  authDomain: "homecareku-94c61.firebaseapp.com",
  databaseURL: "https://homecareku-94c61-default-rtdb.firebaseio.com",
  projectId: "homecareku-94c61",
  storageBucket: "homecareku-94c61.appspot.com",
  messagingSenderId: "617644220368",
  appId: "1:617644220368:web:5aeecdbae8e298eeda3d5"
};

// Avatars mapping
export const avatars = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bintang&backgroundColor=b6e3f4", // 0
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Megawanti&backgroundColor=ffdfbf", // 1
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Abyan&backgroundColor=c0aede", // 2
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Nala&backgroundColor=d1f4ff", // 3
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jovan&backgroundColor=ffd5dc", // 4
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zahra&backgroundColor=e8ffdb"  // 5
];

// Helper silhouette placeholder
export const defaultAvatarPlaceholder = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

// Helper: convert any string to Title Case
export function toTitleCase(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper to convert Firestore status to UI status
const mapStatusToUI = (dbStatus) => {
  return dbStatus === "on_shift" ? "Sedang Bertugas" : "Tidak Bertugas";
};

// Helper to convert UI status to DB status
const mapStatusToDB = (uiStatus) => {
  return uiStatus === "Sedang Bertugas" ? "on_shift" : "tidak_bertugas";
};

// Helper to convert DB lokasi to UI lokasi
const mapLokasiToUI = (dbLokasi) => {
  return dbLokasi === true ? "Rumah Pasien" : "Klinik";
};

// Helper to convert UI lokasi to DB lokasi
const mapLokasiToDB = (uiLokasi) => {
  return uiLokasi === "Rumah Pasien";
};

// Get all nurses
export async function getNurses() {
  try {
    const q = query(
      collection(db, "users"), 
      where("id_role", "==", "/roles/2")
    );
    const querySnapshot = await getDocs(q);
    const nursesList = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const statusUI = mapStatusToUI(data.status);
      const lokasiUI = mapLokasiToUI(data.lokasi);
      const avatarIdx = data.avatar_index !== undefined ? parseInt(data.avatar_index) : -1;
      
      nursesList.push({
        id: doc.id,
        name: toTitleCase(data.nama || ""),
        email: data.email || "",
        phone: data.no_hp || "",
        alamat: data.alamat || "",
        noSertifikat: data.no_sertifikat || "-",
        status: statusUI,
        lokasi: lokasiUI,
        jenisKelamin: data.jenis_kelamin || "",
        tanggalLahir: data.tanggal_lahir instanceof Timestamp 
          ? data.tanggal_lahir.toDate().toISOString().split('T')[0] 
          : data.tanggal_lahir || "",
        isOnline: data.status === "on_shift",
        avatarIndex: avatarIdx,
        photoBase64: data.photoBase64 || null,
        img: data.photoBase64 
          ? `data:image/jpeg;base64,${data.photoBase64}` 
          : (avatarIdx >= 0 && avatars[avatarIdx] ? avatars[avatarIdx] : defaultAvatarPlaceholder),
        isActive: data.is_active !== false
      });
    });
    return nursesList.filter(n => n.isActive);
  } catch (error) {
    console.error("Error in getNurses:", error);
    throw error;
  }
}

// Subscribe to real-time updates for all active nurses
export function subscribeNurses(onUpdate, onError) {
  const q = query(
    collection(db, "users"), 
    where("id_role", "==", "/roles/2")
  );
  return onSnapshot(q, (querySnapshot) => {
    const nursesList = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const statusUI = mapStatusToUI(data.status);
      const lokasiUI = mapLokasiToUI(data.lokasi);
      const avatarIdx = data.avatar_index !== undefined ? parseInt(data.avatar_index) : -1;

      nursesList.push({
        id: doc.id,
        name: toTitleCase(data.nama || ""),
        email: data.email || "",
        phone: data.no_hp || "",
        alamat: data.alamat || "",
        noSertifikat: data.no_sertifikat || "-",
        status: statusUI,
        lokasi: lokasiUI,
        jenisKelamin: data.jenis_kelamin || "",
        tanggalLahir: data.tanggal_lahir instanceof Timestamp 
          ? data.tanggal_lahir.toDate().toISOString().split('T')[0] 
          : data.tanggal_lahir || "",
        isOnline: data.status === "on_shift",
        avatarIndex: avatarIdx,
        photoBase64: data.photoBase64 || null,
        img: data.photoBase64 
          ? `data:image/jpeg;base64,${data.photoBase64}` 
          : (avatarIdx >= 0 && avatars[avatarIdx] ? avatars[avatarIdx] : defaultAvatarPlaceholder),
        isActive: data.is_active !== false
      });
    });
    onUpdate(nursesList.filter(n => n.isActive));
  }, (error) => {
    console.error("Error subscribing to nurses:", error);
    if (onError) onError(error);
  });
}

// Get nurse by ID
export async function getNurseById(id) {
  try {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("Nurse not found");
    }
    const data = docSnap.data();
    const statusUI = mapStatusToUI(data.status);
    const lokasiUI = mapLokasiToUI(data.lokasi);
    const avatarIdx = data.avatar_index !== undefined ? parseInt(data.avatar_index) : -1;

    return {
      id: docSnap.id,
      name: toTitleCase(data.nama || ""),
      email: data.email || "",
      phone: data.no_hp || "",
      alamat: data.alamat || "",
      noSertifikat: data.no_sertifikat || "",
      status: statusUI,
      lokasi: lokasiUI,
      jenisKelamin: data.jenis_kelamin || "",
      tanggalLahir: data.tanggal_lahir instanceof Timestamp 
        ? data.tanggal_lahir.toDate().toISOString().split('T')[0] 
        : data.tanggal_lahir || "",
      isOnline: data.status === "on_shift",
      password: data.password || "",
      avatarIndex: avatarIdx,
      photoBase64: data.photoBase64 || null,
      img: data.photoBase64 
        ? `data:image/jpeg;base64,${data.photoBase64}` 
        : (avatarIdx >= 0 && avatars[avatarIdx] ? avatars[avatarIdx] : defaultAvatarPlaceholder),
      isActive: data.is_active !== false
    };
  } catch (error) {
    console.error("Error in getNurseById:", error);
    throw error;
  }
}

// Create new nurse
export async function addNurse(nurseData) {
  try {
    // 1. Create account in Firebase Auth using a separate Firebase App instance
    // to prevent logging out the current admin user session
    const secondaryAppName = `TempApp_${Date.now()}`;
    const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
    const secondaryAuth = getAuth(secondaryApp);
    
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth, 
      nurseData.email, 
      nurseData.password
    );
    const uid = userCredential.user.uid;
    
    // Clean up temporary app instance
    await deleteApp(secondaryApp);

    // 2. Save document to Firestore
    const nurseDocRef = doc(db, "users", uid);
    const docPayload = {
      nama: nurseData.name,
      email: nurseData.email,
      password: nurseData.password,
      no_hp: nurseData.phone,
      alamat: nurseData.alamat,
      no_sertifikat: nurseData.noSertifikat || "",
      jenis_kelamin: nurseData.jenisKelamin,
      id_role: "/roles/2",
      status: mapStatusToDB(nurseData.status || "Tidak Bertugas"),
      lokasi: mapLokasiToDB(nurseData.lokasi),
      is_active: true,
      avatar_index: nurseData.avatarIndex !== undefined ? parseInt(nurseData.avatarIndex) : -1,
      tanggal_lahir: nurseData.tanggalLahir 
        ? Timestamp.fromDate(new Date(nurseData.tanggalLahir)) 
        : Timestamp.fromDate(new Date()),
      created_at: Timestamp.fromDate(new Date())
    };

    if (nurseData.photoBase64) {
      docPayload.photoBase64 = nurseData.photoBase64;
    }

    await setDoc(nurseDocRef, docPayload);
    return uid;
  } catch (error) {
    console.error("Error in addNurse:", error);
    throw error;
  }
}

// Update nurse
export async function updateNurse(id, nurseData) {
  try {
    const docRef = doc(db, "users", id);
    const docPayload = {
      nama: nurseData.name,
      email: nurseData.email,
      no_hp: nurseData.phone,
      alamat: nurseData.alamat,
      no_sertifikat: nurseData.noSertifikat || "",
      jenis_kelamin: nurseData.jenisKelamin,
      status: mapStatusToDB(nurseData.status || "Tidak Bertugas"),
      lokasi: mapLokasiToDB(nurseData.lokasi),
      avatar_index: nurseData.avatarIndex !== undefined ? parseInt(nurseData.avatarIndex) : -1
    };
    
    if (nurseData.tanggalLahir) {
      docPayload.tanggal_lahir = Timestamp.fromDate(new Date(nurseData.tanggalLahir));
    }
    
    if (nurseData.password) {
      docPayload.password = nurseData.password;
    }

    if (nurseData.photoBase64 !== undefined) {
      docPayload.photoBase64 = nurseData.photoBase64;
    }

    await updateDoc(docRef, docPayload);
  } catch (error) {
    console.error("Error in updateNurse:", error);
    throw error;
  }
}

// Deactivate/delete nurse
export async function deactivateNurse(id) {
  try {
    const docRef = doc(db, "users", id);
    await updateDoc(docRef, { is_active: false });
  } catch (error) {
    console.error("Error in deactivateNurse:", error);
    throw error;
  }
}

// Get nurse achievements/orders
export async function getNurseCapaian(nurseId) {
  try {
    const q = query(
      collection(db, "pesanan"),
      where("id_perawat", "==", nurseId)
    );
    const querySnapshot = await getDocs(q);
    const achievements = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      achievements.push({
        id: doc.id,
        layanan: data.nama_layanan || data.layanan || "Layanan",
        layananImg: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.nama_layanan || "layanan"}&backgroundColor=b6e3f4`,
        tipe: data.tipe_layanan || "Rumah",
        pasien: toTitleCase(data.nama_pasien || "Pasien"),
        waktu: data.waktu || "10.00 - 12.00",
        tanggal: data.tanggal_booking instanceof Timestamp 
          ? data.tanggal_booking.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
          : data.tanggal_booking || "12 Mei 2026",
        rekamMedis: data.rekam_medis || data.catatan || "-"
      });
    });
    return achievements;
  } catch (error) {
    console.error("Error in getNurseCapaian:", error);
    return [];
  }
}

// Subscribe to real-time updates for active patients
export function subscribePatients(onUpdate, onError) {
  const q = query(
    collection(db, "users"), 
    where("id_role", "==", "/roles/3")
  );
  
  const pesananQuery = collection(db, "pesanan");

  let latestPatients = [];
  let latestPesanan = [];

  const checkAndEmit = () => {
    const countMap = {};
    latestPesanan.forEach(p => {
      const pid = p.id_pasien;
      if (pid) {
        countMap[pid] = (countMap[pid] || 0) + 1;
      }
    });

    const mapped = latestPatients.map(docData => {
      const avatarIdx = docData.avatar_index !== undefined ? parseInt(docData.avatar_index) : -1;
      return {
        id: docData.id,
        name: toTitleCase(docData.nama || ""),
        email: docData.email || "",
        phone: docData.no_hp || "",
        alamat: docData.alamat || "",
        jenisKelamin: docData.jenis_kelamin || "",
        tanggalLahir: docData.tanggal_lahir instanceof Timestamp 
          ? docData.tanggal_lahir.toDate().toISOString().split('T')[0] 
          : docData.tanggal_lahir || "",
        avatarIndex: avatarIdx,
        photoBase64: docData.photoBase64 || null,
        img: docData.photoBase64 
          ? `data:image/jpeg;base64,${docData.photoBase64}` 
          : (avatarIdx >= 0 && avatars[avatarIdx] ? avatars[avatarIdx] : defaultAvatarPlaceholder),
        totalTindakan: countMap[docData.id] || 0,
        isActive: docData.is_active !== false
      };
    }).filter(p => p.isActive);

    onUpdate(mapped);
  };

  const unsubscribeUsers = onSnapshot(q, (snapshot) => {
    const list = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    latestPatients = list;
    checkAndEmit();
  }, onError);

  const unsubscribePesanan = onSnapshot(pesananQuery, (snapshot) => {
    const list = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    latestPesanan = list;
    checkAndEmit();
  }, onError);

  return () => {
    unsubscribeUsers();
    unsubscribePesanan();
  };
}

// Get patient by ID
export async function getPatientById(id) {
  try {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("Patient not found");
    }
    const data = docSnap.data();
    
    // Fetch their total order count
    const q = query(
      collection(db, "pesanan"),
      where("id_pasien", "==", id)
    );
    const querySnapshot = await getDocs(q);
    const totalTindakan = querySnapshot.size;

    const avatarIdx = data.avatar_index !== undefined ? parseInt(data.avatar_index) : -1;

    return {
      id: docSnap.id,
      name: toTitleCase(data.nama || ""),
      email: data.email || "",
      phone: data.no_hp || "",
      alamat: data.alamat || "",
      jenisKelamin: data.jenis_kelamin || "",
      tanggalLahir: data.tanggal_lahir instanceof Timestamp 
        ? data.tanggal_lahir.toDate().toISOString().split('T')[0] 
        : data.tanggal_lahir || "",
      avatarIndex: avatarIdx,
      photoBase64: data.photoBase64 || null,
      img: data.photoBase64 
        ? `data:image/jpeg;base64,${data.photoBase64}` 
        : (avatarIdx >= 0 && avatars[avatarIdx] ? avatars[avatarIdx] : defaultAvatarPlaceholder),
      totalTindakan: totalTindakan,
      isActive: data.is_active !== false
    };
  } catch (error) {
    console.error("Error in getPatientById:", error);
    throw error;
  }
}

// Delete patient (sets is_active to false)
export async function deletePatient(id) {
  try {
    const docRef = doc(db, "users", id);
    await updateDoc(docRef, { is_active: false });
  } catch (error) {
    console.error("Error in deletePatient:", error);
    throw error;
  }
}
export async function getPatientMedicalRecords(patientId) {
  try {
    const q = query(
      collection(db, "pesanan"),
      where("id_pasien", "==", patientId)
    );
    const querySnapshot = await getDocs(q);
    const records = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        id: doc.id,
        layanan: data.nama_layanan || data.layanan || "Layanan",
        tanggal: data.tanggal_booking instanceof Timestamp
          ? data.tanggal_booking.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
          : data.tanggal_booking || "",
        waktu: data.waktu || "",
        perawat: toTitleCase(data.nama_perawat || data.perawat || ""),
        catatan: data.rekam_medis || data.catatan || ""
      });
    });
    return records;
  } catch (error) {
    console.error("Error in getPatientMedicalRecords:", error);
    throw error;
  }
}

// Subscribe to real-time updates for Layanan
export function subscribeLayanan(onUpdate, onError) {
  const q = collection(db, "layanan");
  return onSnapshot(q, (querySnapshot) => {
    const list = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      list.push({
        id: doc.id,
        nama: data.nama_layanan || data.nama || "",
        harga: data.harga || "",
        durasi: data.durasi || "",
        rating: data.rating || "0",
        gambar: data.gambar || "",
        deskripsi: data.deskripsi_umum || data.deksripsi_umum || data.deskripsi || ""
      });
    });
    onUpdate(list);
  }, (error) => {
    console.error("Error subscribing to layanan:", error);
    if (onError) onError(error);
  });
}

// Add new Layanan
export async function addLayanan(layananData) {
  try {
    const docRef = await addDoc(collection(db, "layanan"), {
      nama_layanan: layananData.nama,
      nama: layananData.nama,
      harga: layananData.harga,
      durasi: layananData.durasi,
      rating: layananData.rating || "0",
      gambar: layananData.gambar || "",
      deskripsi_umum: layananData.deskripsi || "",
      deksripsi_umum: layananData.deskripsi || "",
      deskripsi: layananData.deskripsi || ""
    });
    return docRef.id;
  } catch (error) {
    console.error("Error in addLayanan:", error);
    throw error;
  }
}

// Update Layanan
export async function updateLayanan(id, layananData) {
  try {
    const docRef = doc(db, "layanan", id);
    await updateDoc(docRef, {
      nama_layanan: layananData.nama,
      nama: layananData.nama,
      harga: layananData.harga,
      durasi: layananData.durasi,
      rating: layananData.rating || "0",
      gambar: layananData.gambar || "",
      deskripsi_umum: layananData.deskripsi || "",
      deksripsi_umum: layananData.deskripsi || "",
      deskripsi: layananData.deskripsi || ""
    });
  } catch (error) {
    console.error("Error in updateLayanan:", error);
    throw error;
  }
}

// Delete Layanan
export async function deleteLayanan(id) {
  try {
    const docRef = doc(db, "layanan", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error in deleteLayanan:", error);
    throw error;
  }
}

// Subscribe to real-time updates for all transactions (bookings & pembayaran subcollections)
export function subscribeTransactions(onUpdate, onError) {
  let latestBookings = [];
  let latestPayments = [];
  let userCache = {};

  const emitUpdates = () => {
    const list = [];
    latestBookings.forEach((bDoc) => {
      const bData = bDoc.data;
      const bId = bDoc.id;

      // Find pembayaran matching this booking ID
      const payment = latestPayments.find((p) => p.bookingId === bId);
      
      // Get patient name
      const patientId = bData.pasien?.id_pasien || "";
      const patientName = userCache[patientId] || "Pasien";

      // Map status
      const paymentStatus = payment?.status || "pending";
      let uiStatus = "Lunas";
      if (paymentStatus.toLowerCase() === "batal" || paymentStatus.toLowerCase() === "tidak selesai") {
        uiStatus = "Batal";
      }

      // Map method
      const rawMethod = payment?.metode_pembayaran || "cash";
      let uiMethod = "Tunai";
      if (rawMethod.toLowerCase() === "qris") {
        uiMethod = "Qris";
      }

      // Timestamp
      const bookingTime = bData.alamat?.created_at || payment?.tanggal_bayar;

      list.push({
        id: bId,
        id_pesanan: `#${bId.substring(0, 6).toUpperCase()}`,
        id_pasien: patientId,
        nama_pasien: patientName,
        layanan: bData.layanan?.nama_layanan || "Layanan",
        jam_booking: bookingTime instanceof Timestamp
          ? bookingTime.toDate().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })
          : "08:00",
        tanggal_booking: bookingTime,
        tempat_layanan: "Rumah",
        alamat_detail: bData.alamat?.nama_jalan || "",
        catatan: bData.alamat?.catatan || "",
        status: uiStatus,
        status_detail: paymentStatus === "selesai" ? "Selesai" : paymentStatus === "menunggu validasi" || paymentStatus === "Selesai & Menunggu Validasi" ? "Selesai & Menunggu Validasi" : "Menunggu Validasi",
        metode_pembayaran: uiMethod,
        harga: payment?.total_bayar || 0,
        created_at: bookingTime
      });
    });

    onUpdate(list);
  };

  // 1. Listen to users
  const qUsers = query(collection(db, "users"), where("id_role", "==", "/roles/3"));
  const unsubUsers = onSnapshot(qUsers, (snapshot) => {
    snapshot.forEach((uDoc) => {
      userCache[uDoc.id] = toTitleCase(uDoc.data().nama || "");
    });
    emitUpdates();
  }, onError);

  // 2. Listen to bookings
  const qBookings = collection(db, "bookings");
  const unsubBookings = onSnapshot(qBookings, (snapshot) => {
    const bookingsList = [];
    snapshot.forEach((docSnap) => {
      bookingsList.push({
        id: docSnap.id,
        data: docSnap.data()
      });
    });
    latestBookings = bookingsList;
    emitUpdates();
  }, onError);

  // 3. Listen to pembayaran collection group
  const qPayments = collectionGroup(db, "pembayaran");
  const unsubPayments = onSnapshot(qPayments, (snapshot) => {
    const paymentsList = [];
    snapshot.forEach((docSnap) => {
      const bookingId = docSnap.ref.parent.parent?.id;
      if (bookingId) {
        paymentsList.push({
          id: docSnap.id,
          bookingId,
          ...docSnap.data()
        });
      }
    });
    latestPayments = paymentsList;
    emitUpdates();
  }, onError);

  return () => {
    unsubUsers();
    unsubBookings();
    unsubPayments();
  };
}

// Verify a payment / update status of an order
export async function verifyPayment(bookingId, statusDetail, status) {
  try {
    const pembayaranRef = collection(db, "bookings", bookingId, "pembayaran");
    const snapshot = await getDocs(pembayaranRef);
    if (!snapshot.empty) {
      // Update each document in the pembayaran subcollection
      const promises = snapshot.docs.map((paymentDoc) => {
        return updateDoc(doc(db, "bookings", bookingId, "pembayaran", paymentDoc.id), {
          status: statusDetail === "Selesai" ? "selesai" : statusDetail.toLowerCase()
        });
      });
      await Promise.all(promises);
    }
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    throw error;
  }
}


