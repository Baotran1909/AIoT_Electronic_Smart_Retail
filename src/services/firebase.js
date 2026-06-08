import { initializeApp, getApps, getApp } from "firebase/app"; // Thêm getApps, getApp
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCY2iMV8qWGMkhSYKG4wJV_1lksX2TTyRA",
  authDomain: "aiot-c4e17.firebaseapp.com",
  projectId: "aiot-c4e17",
  storageBucket: "aiot-c4e17.firebasestorage.app",
  messagingSenderId: "238944357772",
  appId: "1:238944357772:web:e08a75fae373f311839aa9",
  measurementId: "G-9ZPCRT1XK7",
  // Đảm bảo dòng này CHÍNH XÁC như console yêu cầu
  databaseURL: "https://aiot-c4e17-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// KIỂM TRA NẾU APP CHƯA TỒN TẠI THÌ MỚI KHỞI TẠO
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);