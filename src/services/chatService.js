import { rtdb, db } from "../config/firebase";
import { ref, onValue, push, set, update, off } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { avatars, defaultAvatarPlaceholder } from "./firestoreService";

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
      // Admin only sees chats with patients directed to admin
      if (room.type === "admin") {
        let avatar = defaultAvatarPlaceholder;
        // Try to map patient avatar
        if (room.patient_avatar) {
          avatar = room.patient_avatar;
        } else if (room.avatarIndex !== undefined && room.avatarIndex >= 0 && avatars[room.avatarIndex]) {
          avatar = avatars[room.avatarIndex];
        }

        roomsList.push({
          id: key,
          name: room.patient_name || "Pasien",
          avatar: avatar,
          lastMessage: room.last_message || "",
          lastTime: room.last_message_at ? new Date(room.last_message_at) : new Date(room.created_at || Date.now()),
          unread: room.unread_admin || 0,
          patientId: room.patient_id,
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
    const now = Date.now();
    
    const messagePayload = {
      id_chat: msgId,
      id_chat_rooms: roomId,
      pesan: text,
      sender_id: adminUid,
      sender_role: "admin",
      waktu: now,
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
    
    // Increment patient unread count
    let roomSnap = await new Promise((resolve) => {
      onValue(roomRef, (snap) => resolve(snap), { onlyOnce: true });
    });
    
    let currentUnreadPatient = 0;
    if (roomSnap.exists()) {
      const roomVal = roomSnap.val();
      currentUnreadPatient = roomVal.unread_patient || 0;
    }
    
    await update(roomRef, {
      last_message: text || (type === "image" ? "📷 Foto" : "📄 Dokumen"),
      last_message_at: now,
      unread_patient: currentUnreadPatient + 1,
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
