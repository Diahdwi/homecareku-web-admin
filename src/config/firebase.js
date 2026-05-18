import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Sesuaikan dengan config milik Firebase Console project Homecareku kamu
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "homecareku-xxx.firebaseapp.com",
  projectId: "homecareku-xxx",
  storageBucket: "homecareku-xxx.appspot.com",
  messagingSenderId: "xxxxxx",
  appId: "xxxxxx"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);