import { useEffect, useRef } from "react";
import { auth, db, rtdb } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, collectionGroup } from "firebase/firestore";
import { ref, onValue, off } from "firebase/database";

export default function NotificationListener() {
  const isInitialBookings = useRef(true);
  const isInitialPayments = useRef(true);
  const isInitialChats = useRef(true);
  const lastUnreadMap = useRef({});

  const showNotification = (title, body) => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(title, {
          body: body,
          icon: "/logo.png",
        });
      }
    }
  };

  useEffect(() => {
    // Request permission on mount
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    let unsubBookings = null;
    let unsubPayments = null;
    let unsubChats = null;

    const unsubscribeAll = () => {
      if (unsubBookings) {
        unsubBookings();
        unsubBookings = null;
      }
      if (unsubPayments) {
        unsubPayments();
        unsubPayments = null;
      }
      if (unsubChats) {
        unsubChats();
        unsubChats = null;
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Reset flags when logging in
        isInitialBookings.current = true;
        isInitialPayments.current = true;
        isInitialChats.current = true;
        lastUnreadMap.current = {};

        // 1. Listen to bookings
        unsubBookings = onSnapshot(
          collection(db, "bookings"),
          (snapshot) => {
            if (isInitialBookings.current) {
              isInitialBookings.current = false;
              return;
            }
            snapshot.docChanges().forEach((change) => {
              if (change.type === "added") {
                const data = change.doc.data();
                showNotification(
                  "Booking Baru Masuk",
                  `${data.pasien?.nama || "Seseorang"} telah melakukan booking layanan ${data.layanan?.nama_layanan || data.layanan || ""}.`
                );
              }
            });
          },
          (err) => console.error("NotificationListener: bookings error", err)
        );

        // 2. Listen to payments (pembayaran collection group)
        unsubPayments = onSnapshot(
          collectionGroup(db, "pembayaran"),
          (snapshot) => {
            if (isInitialPayments.current) {
              isInitialPayments.current = false;
              return;
            }
            snapshot.docChanges().forEach((change) => {
              if (change.type === "added" || change.type === "modified") {
                const data = change.doc.data();
                if (data.status === "menunggu validasi" || data.status === "Selesai & Menunggu Validasi") {
                  showNotification(
                    "Pembayaran Baru Terdeteksi",
                    `Pembayaran sebesar Rp ${data.total_bayar || 0} melalui ${data.metode_pembayaran || ""} memerlukan verifikasi.`
                  );
                }
              }
            });
          },
          (err) => console.error("NotificationListener: pembayaran error", err)
        );

        // 3. Listen to RTDB chat rooms
        const roomsRef = ref(rtdb, "chat_rooms");
        const onChatValue = (snapshot) => {
          if (!snapshot.exists()) return;
          const data = snapshot.val();

          if (isInitialChats.current) {
            Object.keys(data).forEach((key) => {
              const room = data[key];
              if (room.type === "admin") {
                lastUnreadMap.current[key] = room.unread_admin || 0;
              }
            });
            isInitialChats.current = false;
            return;
          }

          Object.keys(data).forEach((key) => {
            const room = data[key];
            if (room.type === "admin") {
              const currentUnread = room.unread_admin || 0;
              const prevUnread = lastUnreadMap.current[key] || 0;
              if (currentUnread > prevUnread && room.last_message) {
                showNotification(
                  `Pesan Baru dari ${room.patient_name || "Pasien"}`,
                  room.last_message
                );
              }
              lastUnreadMap.current[key] = currentUnread;
            }
          });
        };

        onValue(roomsRef, onChatValue, (err) => console.error("NotificationListener: chat error", err));
        unsubChats = () => off(roomsRef, "value", onChatValue);
      } else {
        unsubscribeAll();
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeAll();
    };
  }, []);

  return null;
}
