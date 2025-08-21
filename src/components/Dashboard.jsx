import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const navigate = useNavigate();
  const [rol, setRol] = useState('');

  useEffect(() => {
    const verificarRol = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.log('⚠️ No hay sesión, cerrando...');
        navigate('/login');
        return;
      }

      try {
        console.log('🔍 Verificando rol para usuario:', currentUser.uid);
        console.log('🔗 Proyecto conectado:', db.app.options.projectId);
        
        const docRef = doc(db, 'usuarios', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          const userRol = userData.rol?.toLowerCase();
          console.log('✅ Rol detectado en Dashboard:', userRol);
          console.log('📄 Datos completos del usuario:', userData);

          if (userRol !== 'admin' && userRol !== 'consulta') {
            alert('Acceso denegado: rol no autorizado.');
            await signOut(auth);
            navigate('/login');
          } else {
            setRol(userRol);
          }
        } else {
          console.log('⚠️ No se encontró documento de usuario en la colección usuarios');
          alert('Tu usuario no está registrado en el sistema. Contacta al administrador.');
          await signOut(auth);
          navigate('/login');
        }
      } catch (error) {
        console.error('❌ Error verificando rol:', error);
        console.error('Código de error:', error.code);
        console.error('Mensaje de error:', error.message);
        
        if (error.code === 'permission-denied') {
          alert('Error de permisos: No tienes acceso para verificar tu rol. Contacta al administrador.');
        } else if (error.code === 'unavailable') {
          alert('Servicio temporalmente no disponible. Inténtalo de nuevo en unos momentos.');
        } else {
          alert('Error al verificar permisos: ' + error.message);
        }
        
        await signOut(auth);
        navigate('/login');
      }
    };

    verificarRol();
  }, [navigate]);
const handleLogout = async () => {
  await signOut(auth);
  navigate('/login');
};

// Variantes de animación
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const cardHoverVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

return (
  <motion.div 
    className="min-h-screen bg-purple-100 flex flex-col font-sans"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.header 
      className="bg-purple-200 p-4 shadow-md mb-8"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
    >
      <div className="flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Panel de {rol === 'admin' ? 'Administración' : rol === 'consulta' ? 'Consulta' : ''}
              </h1>
              <p className="text-sm text-gray-600">Sistema FIDO</p>
            </div>
          </motion.div>
        <motion.button 
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-red-100 focus:outline-none focus:shadow-outline"
          title="Cerrar sesión"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H9m0 0l3-3m-3 3l3 3" />
          </svg>
        </motion.button>
      </div>
    </motion.header>

    <main className="flex-1 container mx-auto p-4">
      {rol === 'admin' && (
        <motion.section 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="bg-gray-100 rounded-3xl shadow-lg border-4 border-black p-6 text-center"
            variants={itemVariants}
            whileHover="hover"
            {...cardHoverVariants}
          >
            <motion.h2 
              className="text-xl font-semibold mb-4 text-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Usuarios
            </motion.h2>
            <Link 
              to="/register"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-block transition-all duration-300 hover:scale-105"
            >
              Registrar Usuarios
            </Link>
          </motion.div>

          <motion.div 
            className="bg-gray-100 rounded-3xl shadow-lg border-4 border-black p-6 text-center"
            variants={itemVariants}
            whileHover="hover"
            {...cardHoverVariants}
          >
            <motion.h2 
              className="text-xl font-semibold mb-4 text-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Alimentos
            </motion.h2>
            <Link 
              to="/registro-alimento"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-block transition-all duration-300 hover:scale-105"
            >
              Registrar Alimento
            </Link>
          </motion.div>

          <motion.div 
            className="bg-gray-100 rounded-3xl shadow-lg border-4 border-black p-6 text-center"
            variants={itemVariants}
            whileHover="hover"
            {...cardHoverVariants}
          >
            <motion.h2 
              className="text-xl font-semibold mb-4 text-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Reportes
            </motion.h2>
            <Link 
              to="/estadisticas"
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-block transition-all duration-300 hover:scale-105"
            >
              Ver Estadísticas
            </Link>
          </motion.div>
        </motion.section>
      )}
      
      {rol === 'consulta' && (
        <motion.section 
          className="max-w-md mx-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        >
          <motion.div 
            className="bg-gray-100 rounded-3xl shadow-lg border-4 border-black p-8 text-center"
            whileHover="hover"
            {...cardHoverVariants}
          >
            <motion.h2 
              className="text-xl font-semibold mb-4 text-gray-700"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Bienvenido
            </motion.h2>
            <motion.p 
              className="text-gray-600 mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Usuario de consulta. Solo puedes acceder a estadísticas.
            </motion.p>
            <Link 
              to="/estadisticas"
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-block transition-all duration-300 hover:scale-105"
            >
              Ver Estadísticas
            </Link>
          </motion.div>
        </motion.section>
      )}
    </main>

    <footer className="bg-purple-200 p-4 mt-8 shadow-md text-center text-gray-800 text-sm flex flex-col items-center">
      <div className="flex gap-4 justify-center mb-2">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook">
          <svg className="w-6 h-6 text-blue-600 hover:text-blue-800" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.405 24 24 23.408 24 22.674V1.326C24 .592 23.405 0 22.675 0"/></svg>
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram">
          <svg className="w-6 h-6 text-pink-500 hover:text-pink-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.497 5.783 2.225 7.149 2.163 8.415 2.105 8.795 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.363 3.678 1.344c-.98.98-1.213 2.092-1.272 3.373C2.013 8.332 2 8.741 2 12c0 3.259.013 3.668.072 4.948.059 1.281.292 2.393 1.272 3.373.981.981 2.093 1.213 3.374 1.272C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.059 2.393-.292 3.373-1.272.981-.981 1.213-2.093 1.272-3.374.059-1.28.072-1.689.072-4.948 0-3.259-.013-3.668-.072-4.948-.059-1.281-.292-2.393-1.272-3.373-.98-.981-2.092-1.213-3.373-1.272C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
        </a>
        <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" title="WhatsApp">
          <svg className="w-6 h-6 text-green-500 hover:text-green-700" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.12.56 4.18 1.62 5.98L0 24l6.18-1.62A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.93 0-3.8-.5-5.44-1.44l-.39-.23-3.67.96.98-3.58-.25-.37A9.93 9.93 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.13-7.47c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.34-.26.27-1 1-1 2.43s1.02 2.81 1.16 3.01c.14.2 2.01 3.07 4.88 4.18.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.12.55-.08 1.65-.67 1.89-1.32.23-.65.23-1.21.16-1.32-.07-.11-.25-.18-.53-.32z"/></svg>
        </a>
      </div>
      <span>SISTEMA FIDO TODOS LOS DERECHOS RESERVADOS 2025</span>
    </footer>
  </motion.div>
);
}
