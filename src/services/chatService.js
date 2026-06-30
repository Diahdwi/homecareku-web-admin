import { rtdb, db } from "../config/firebase";
import { ref, onValue, push, set, update, off, serverTimestamp } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { avatars, defaultAvatarPlaceholder } from "./firestoreService";

export function toTitleCase(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Subscribe to chat rooms for admin in real-time.
 * Filtered by type === "admin"
 */
export function subscribeAdminChatRooms(callback) {
  const roomsRef = ref(rtdb, "chat_rooms");
  
  const listener = onValue(roomsRef, async (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    
    const data = snapshot.val();
    const roomsList = [];
    
    for (const key of Object.keys(data)) {
      const room = data[key];
      // Admin sees chats with patients (type "admin") and nurses (type "admin_nurse")
      if (room.type === "admin" || room.type === "admin_nurse") {
        let avatar = defaultAvatarPlaceholder;
        
        const dbAvatar = room.patient_avatar || room.nurse_avatar;
        const dbName = room.patient_name || room.nurse_name || (room.type === "admin_nurse" ? "Perawat" : "Pasien");
        const dbUserId = room.patient_id || room.nurse_id;
        
        // Try to map avatar from RTDB room first
        if (dbAvatar) {
          if (dbAvatar.startsWith("data:") || dbAvatar.startsWith("http")) {
            avatar = dbAvatar;
          } else {
            avatar = `data:image/jpeg;base64,${dbAvatar}`;
          }
        } else if (room.avatarIndex !== undefined && room.avatarIndex >= 0) {
          avatar = defaultAvatarPlaceholder;
        } else if (dbUserId) {
          // Fallback: fetch profile from Firestore
          try {
            const userDocRef = doc(db, "users", dbUserId);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
              const pData = userSnap.data();
              const pAvatarIdx = pData.avatar_index !== undefined ? parseInt(pData.avatar_index) : -1;
              if (pData.photoBase64) {
                avatar = `data:image/jpeg;base64,${pData.photoBase64}`;
              } else {
                avatar = defaultAvatarPlaceholder;
              }
            }
          } catch (err) {
            console.warn("Could not fetch avatar from Firestore:", err);
          }
        }

        roomsList.push({
          id: key,
          name: toTitleCase(dbName),
          avatar: avatar,
          lastMessage: room.last_message || "",
          lastTime: room.last_message_at ? new Date(room.last_message_at) : new Date(room.created_at || Date.now()),
          unread: room.unread_admin || 0,
          patientId: room.patient_id || "",
          nurseId: room.nurse_id || "",
          type: room.type, // "admin" or "admin_nurse"
          idBookings: room.id_bookings || ""
        });
      }
    }
    
    // Sort by last message time descending
    roomsList.sort((a, b) => b.lastTime - a.lastTime);
    callback(roomsList);
  }, (error) => {
    console.error("Error subscribing to chat rooms:", error);
  });
  
  return () => off(roomsRef, "value", listener);
}

/**
 * Subscribe to messages in a specific chat room.
 */
export function subscribeMessages(roomId, callback) {
  const messagesRef = ref(rtdb, `messages/${roomId}`);
  
  const listener = onValue(messagesRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    
    const data = snapshot.val();
    const messagesList = [];
    
    for (const key of Object.keys(data)) {
      const msg = data[key];
      const date = new Date(msg.waktu);
      const timeStr = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      
      messagesList.push({
        id: key,
        text: msg.pesan || "",
        isAdmin: msg.sender_role === "admin",
        senderId: msg.sender_id,
        senderRole: msg.sender_role,
        time: timeStr,
        timestamp: msg.waktu,
        type: msg.type || "text",
        imageUrl: msg.type === "image" ? msg.file_url : undefined,
        fileName: msg.type === "document" ? msg.file_name : undefined,
        fileUrl: msg.file_url
      });
    }
    
    // Sort chronologically
    messagesList.sort((a, b) => a.timestamp - b.timestamp);
    callback(messagesList);
  }, (error) => {
    console.error("Error subscribing to messages:", error);
  });
  
  return () => off(messagesRef, "value", listener);
}

/**
 * Send a message and update room details.
 */
export async function sendChatMessage(roomId, adminUid, text, type = "text", fileData = null) {
  try {
    const messagesRef = ref(rtdb, `messages/${roomId}`);
    const newMsgRef = push(messagesRef);
    const msgId = newMsgRef.key;
    
    const messagePayload = {
      id_chat: msgId,
      id_chat_rooms: roomId,
      pesan: text,
      sender_id: adminUid,
      sender_role: "admin",
      waktu: serverTimestamp(),
      is_read: false,
      type: type
    };
    
    if (type !== "text" && fileData) {
      // fileData: { url (base64 data url), name }
      messagePayload.file_url = fileData.url;
      if (fileData.name) {
        messagePayload.file_name = fileData.name;
      }
    }
    
    // 1. Write the message
    await set(newMsgRef, messagePayload);
    
    // 2. Update room details
    const roomRef = ref(rtdb, `chat_rooms/${roomId}`);
    
    // Increment patient/nurse unread count
    let roomSnap = await new Promise((resolve) => {
      onValue(roomRef, (snap) => resolve(snap), { onlyOnce: true });
    });
    
    let currentUnreadUser = 0;
    let isNurse = false;
    if (roomSnap.exists()) {
      const roomVal = roomSnap.val();
      isNurse = roomVal.type === "admin_nurse";
      currentUnreadUser = isNurse ? (roomVal.unread_nurse || 0) : (roomVal.unread_patient || 0);
    }
    
    await update(roomRef, {
      last_message: text || (type === "image" ? "📷 Foto" : "📄 Dokumen"),
      last_message_at: serverTimestamp(),
      [isNurse ? "unread_nurse" : "unread_patient"]: currentUnreadUser + 1,
      unread_admin: 0 // Admin is the sender, so admin unread count is reset
    });
    
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

/**
 * Reset admin unread count for a chat room.
 */
export async function markChatAsRead(roomId) {
  try {
    const roomRef = ref(rtdb, `chat_rooms/${roomId}`);
    await update(roomRef, {
      unread_admin: 0
    });
  } catch (error) {
    console.error("Error marking chat as read:", error);
  }
}
