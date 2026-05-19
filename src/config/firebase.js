import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCeN_izbTvxor336zrhynDbr9SCYGeyf0",
  authDomain: "homecareku-94c61.firebaseapp.com",
  databaseURL: "https://homecareku-94c61-default-rtdb.firebaseio.com",
  projectId: "homecareku-94c61",
  storageBucket: "homecareku-94c61.appspot.com",
  messagingSenderId: "617644220368",
  appId: "1:617644220368:web:5aeecdbae8e298eeda3d5"
};

// Pastikan inisialisasi ini benar dan tidak mengembalikan string "Admin"
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);