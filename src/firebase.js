/**
 * @fileoverview Configuración de Firebase para la aplicación FIDO
 * 
 * Este archivo inicializa y configura los servicios de Firebase necesarios
 * para la aplicación, incluyendo autenticación y Firestore.
 * 
 * Servicios configurados:
 * - Firebase Auth: Para autenticación de usuarios
 * - Firebase Firestore: Para almacenamiento de datos NoSQL
 * 
 * @author Sistema FIDO
 * @version 1.0.0
 * @since 2025
 * @requires firebase/app
 * @requires firebase/auth
 * @requires firebase/firestore
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Configuración de Firebase para el proyecto FIDO
 * 
 * @warning En producción, estas credenciales deben moverse a variables de entorno
 * @note Configuración para proyecto fido-37f41
 */
const firebaseConfig = {
  apiKey: "AIzaSyDNMdSNB-Ipa5yZC2MBiMQMhJRJXD5-tco",
  authDomain: "fido-37f41.firebaseapp.com",
  projectId: "fido-37f41",
  storageBucket: "fido-37f41.firebasestorage.app",
  messagingSenderId: "237495518878",
  appId: "1:237495518878:web:7c6b758e4aa3e1f6cf1d8f",
  measurementId: "G-5F8GXR8404"
};

// Inicialización de la aplicación Firebase
const app = initializeApp(firebaseConfig);

/**
 * Instancia de Firebase Authentication
 * Utilizada para manejo de sesiones y autenticación de usuarios
 */
const auth = getAuth(app);

/**
 * Instancia de Firebase Firestore
 * Utilizada para almacenamiento y consulta de datos NoSQL
 * 
 * Colecciones principales:
 * - usuarios: Información de usuarios del sistema
 * - feedingRecords: Registros de alimentación de mascotas
 * - pets: Información de las mascotas
 * - graficas: Datos para visualización de estadísticas
 */
const db = getFirestore(app);

export { auth, db };
