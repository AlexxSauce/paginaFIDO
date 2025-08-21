/**
 * @fileoverview Componente de registro de usuarios del Sistema FIDO
 * 
 * Este componente permite a los administradores registrar nuevos usuarios
 * en el sistema. Utiliza una instancia secundaria de Firebase para evitar
 * que se cierre la sesión del administrador durante el proceso de registro.
 * 
 * Características principales:
 * - Verificación de permisos de administrador
 * - Registro de usuarios sin afectar la sesión activa
 * - Asignación de roles (admin/consulta)
 * - Validaciones de formulario
 * - Animaciones con Framer Motion
 * - Manejo de errores y estados de carga
 * 
 * @author Sistema FIDO
 * @version 1.0.0
 * @since 2025
 */

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut as signOutSecondary, onAuthStateChanged } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Configuración de Firebase para instancia secundaria
 * Se usa para crear usuarios sin afectar la sesión principal del administrador
 * 
 * @note Esta configuración debe coincidir exactamente con firebase.js
 * @warning En producción, mover a variables de entorno
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

/**
 * Componente de registro de usuarios
 * 
 * Solo accesible por administradores. Permite crear nuevos usuarios
 * con diferentes roles y almacenar su información en Firestore.
 * 
 * @component
 * @returns {JSX.Element} Interfaz de registro de usuarios
 */
export default function Register() {
  /**
   * Estados del componente para manejar el formulario y UI
   */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('consulta');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * Verifica si el usuario actual tiene permisos de administrador
   * Solo los administradores pueden acceder a esta página
   */
  useEffect(() => {
    let unsubscribe;
    
    /**
     * Función interna para verificar el rol de administrador
     * @async
     * @function verificarRolAdmin
     */
    const verificarRolAdmin = async () => {
      try {
        // Esperar a que Firebase Auth se inicialice
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!user) {
            console.log('No hay usuario logueado');
            setAuthLoading(false);
            navigate('/login');
            return;
          }

          try {
            // Obtener documento del usuario desde Firestore
            const docRef = doc(db, 'usuarios', user.uid);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
              console.log('No se encontró el documento del usuario');
              setError('Error: No se encontró información del usuario');
              setAuthLoading(false);
              return;
            }

            // Verificar si el usuario tiene rol de administrador
            const userRol = docSnap.data()?.rol?.toLowerCase();
            console.log('Rol del usuario:', userRol);

            if (userRol !== 'admin') {
              setError('Acceso denegado: solo administradores pueden registrar usuarios.');
              setTimeout(() => {
                navigate('/dashboard');
              }, 2000);
            } else {
              console.log('Usuario admin verificado');
            }
            setAuthLoading(false);
          } catch (error) {
            console.error('Error al verificar rol:', error);
            setError('Error al verificar permisos');
            setAuthLoading(false);
          }
        });
      } catch (error) {
        console.error('Error en verificación:', error);
        setAuthLoading(false);
      }
    };

    verificarRolAdmin();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [navigate]);

  /**
   * Maneja el registro de un nuevo usuario
   * 
   * Utiliza una instancia secundaria de Firebase Auth para crear el usuario
   * sin afectar la sesión del administrador que está logueado.
   * 
   * @async
   * @function handleRegister
   * @param {Event} e - Evento del formulario
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validaciones básicas del formulario
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    
    try {
      // Verifica si la aplicación secundaria ya está inicializada
      let secondaryApp;
      if (!getApps().some(app => app.name === "Secondary")) {
        secondaryApp = initializeApp(firebaseConfig, "Secondary");
      } else {
        secondaryApp = getApps().find(app => app.name === "Secondary");
      }

      const secondaryAuth = getAuth(secondaryApp);

      // Crea usuario en Auth secundario (NO cambia sesión principal)
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);

      // Guarda documento del usuario en Firestore
      const userDocRef = doc(db, 'usuarios', userCredential.user.uid);
      await setDoc(userDocRef, {
        email: email,
        rol: rol,
        fechaCreacion: new Date()
      });

      // Cierra sesión de Auth secundario para limpiar
      await signOutSecondary(secondaryAuth); 

      setSuccess(`✅ Usuario registrado exitosamente con rol: ${rol}`);
      // Limpia el formulario después del registro exitoso
      setEmail('');
      setPassword('');
      setRol('consulta');

    } catch (error) {
      console.error('Error completo:', error);
      console.error('Código de error:', error.code);
      console.error('Mensaje:', error.message);
      
      // Manejo específico de errores de Firebase
      if (error.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado');
      } else if (error.code === 'auth/weak-password') {
        setError('La contraseña es muy débil');
      } else if (error.code === 'auth/invalid-email') {
        setError('Correo electrónico inválido');
      } else if (error.code === 'permission-denied' || error.message.includes('permissions')) {
        setError('⚠️ Error de permisos: Las reglas de Firestore necesitan ser actualizadas. Contacta al administrador del sistema.');
      } else if (error.code === 'unavailable') {
        setError('🌐 Servicio no disponible. Verifica tu conexión a internet.');
      } else {
        setError(`❌ Error al registrar usuario: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja el cierre de sesión del administrador
   * @async
   * @function handleLogout
   */
  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  /**
   * Pantalla de carga mientras se verifica la autenticación
   * Se muestra mientras el sistema verifica los permisos del usuario
   */
  if (authLoading) {
    return (
      <div className="min-h-screen bg-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  /**
   * Interfaz principal del componente
   * 
   * Renderiza el formulario de registro con animaciones de Framer Motion
   * y maneja la visualización de mensajes de error y éxito.
   */
  return (
    <motion.div 
      className="min-h-screen bg-purple-100 flex flex-col font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header con título y botón de logout */}
      <motion.header 
        className="bg-purple-200 p-4 shadow-md mb-8"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex justify-between items-center">
          <motion.h1 
            className="text-2xl font-bold text-gray-800"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Registrar Nuevo Usuario
          </motion.h1>

          {/* Menú de navegación */}
          <motion.div 
            className="flex items-center gap-2"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <motion.button
              onClick={() => navigate('/registro-alimento')}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg shadow-md transition-colors duration-200"
              title="Ir a Registrar Alimento"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="hidden sm:inline text-sm">Registrar</span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/estadisticas')}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg shadow-md transition-colors duration-200"
              title="Ver Estadísticas"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
              <span className="hidden sm:inline text-sm">Estadísticas</span>
            </motion.button>
            
            <motion.button 
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-red-100 focus:outline-none focus:shadow-outline transition-colors duration-200"
              title="Cerrar sesión"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Icono de logout */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H9m0 0l3-3m-3 3l3 3" />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </motion.header>

      {/* Contenido principal con formulario de registro */}
      <main className="flex-1 container mx-auto p-4 flex items-center justify-center">
        {/* Tarjeta del formulario con animaciones */}
        <motion.section 
          className="bg-gray-100 rounded-3xl shadow-lg overflow-hidden border-4 border-black max-w-md w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="p-8">
            <motion.h2 
              className="text-xl font-semibold mb-6 text-gray-700 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Nuevo Usuario
            </motion.h2>

            {/* Mensaje de error */}
            {error && (
              <motion.div 
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            {/* Mensaje de éxito */}
            {success && (
              <motion.div 
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {success}
              </motion.div>
            )}

            {/* Formulario de registro */}
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Campo de correo electrónico */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:opacity-50"
                />
              </motion.div>
              
              {/* Campo de contraseña */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="Contraseña (mínimo 6 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:opacity-50"
                />
              </motion.div>
              
              {/* Selector de rol de usuario */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Rol
                </label>
                <select 
                  value={rol} 
                  onChange={(e) => setRol(e.target.value)}
                  disabled={loading}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:opacity-50"
                >
                  <option value="admin">Admin</option>
                  <option value="consulta">Consulta</option>
                </select>
              </motion.div>
              
              {/* Botón de registro con estado de carga */}
              <motion.button 
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition-colors duration-200"
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Registrando...
                  </div>
                ) : (
                  'Registrar Usuario'
                )}
              </motion.button>
            </form>
            
            {/* Botón para volver al dashboard */}
            <motion.div 
              className="mt-6 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              <Link 
                to="/dashboard"
                className="inline-block p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:shadow-outline transition-colors duration-200"
                title="Volver al Dashboard"
              >
                {/* Icono de flecha hacia atrás */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <motion.footer 
        className="bg-purple-200 p-4 mt-8 shadow-md text-center text-gray-800 text-sm flex flex-col items-center"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <div className="flex gap-4 justify-center mb-2">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook">
            <svg className="w-6 h-6 text-blue-600 hover:text-blue-800" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.405 24 24 23.408 24 22.674V1.326C24 .592 23.405 0 22.675 0"/>
            </svg>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram">
            <svg className="w-6 h-6 text-pink-500 hover:text-pink-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.497 5.783 2.225 7.149 2.163 8.415 2.105 8.795 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.363 3.678 1.344c-.98.98-1.213 2.092-1.272 3.373C2.013 8.332 2 8.741 2 12c0 3.259.013 3.668.072 4.948.059 1.281.292 2.393 1.272 3.373.981.981 2.093 1.213 3.374 1.272C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.059 2.393-.292 3.373-1.272.981-.981 1.213-2.093 1.272-3.374.059-1.28.072-1.689.072-4.948 0-3.259-.013-3.668-.072-4.948-.059-1.281-.292-2.393-1.272-3.373-.98-.981-2.092-1.213-3.373-1.272C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
            </svg>
          </a>
          <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" title="WhatsApp">
            <svg className="w-6 h-6 text-green-500 hover:text-green-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.12.56 4.18 1.62 5.98L0 24l6.18-1.62A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.93 0-3.8-.5-5.44-1.44l-.39-.23-3.67.96.98-3.58-.25-.37A9.93 9.93 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.13-7.47c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.34-.26.27-1 1-1 2.43s1.02 2.81 1.16 3.01c.14.2 2.01 3.07 4.88 4.18.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.12.55-.08 1.65-.67 1.89-1.32.23-.65.23-1.21.16-1.32-.07-.11-.25-.18-.53-.32z"/>
            </svg>
          </a>
        </div>
        <span>SISTEMA FIDO TODOS LOS DERECHOS RESERVADOS 2025</span>
      </motion.footer>
    </motion.div>
  );
}