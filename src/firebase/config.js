import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDb-MjaasYl9V4GZcIJXufUPXhlPjub8jE",
  authDomain: "anomsgapp.firebaseapp.com",
  projectId: "anomsgapp",
  storageBucket: "anomsgapp.firebasestorage.app",
  messagingSenderId: "960476010012",
  appId: "1:960476010012:web:baa23aaa2e1fca7b5231d9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
