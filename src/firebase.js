// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Reemplaza estos valores con tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDNMdSNB-Ipa5yZC2MBiMQMhJRJXD5-tco",
  authDomain: "fido-37f41.firebaseapp.com",
  projectId: "fido-37f41",
  storageBucket: "fido-37f41.firebasestorage.app",
  messagingSenderId: "237495518878",
  appId: "1:237495518878:web:7c6b758e4aa3e1f6cf1d8f",
  measurementId: "G-5F8GXR8404"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
