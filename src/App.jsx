/**
 * @fileoverview Componente principal de la aplicación FIDO
 * 
 * Este componente define la estructura de enrutamiento de la aplicación
 * y configura todas las rutas disponibles para los diferentes módulos
 * del sistema de alimentación de mascotas.
 * 
 * Rutas disponibles:
 * - / : Redirección automática a login
 * - /login : Autenticación de usuarios
 * - /dashboard : Panel principal del sistema
 * - /register : Registro de nuevos usuarios (solo admin)
 * - /registro-alimento : Registro de alimentación de mascotas
 * - /estadisticas : Visualización de estadísticas y gráficos
 * 
 * @author Sistema FIDO
 * @version 1.0.0
 * @since 2025
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Importación de componentes principales
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserRegister from './components/UserRegister';
import RegistroAlimento from './components/RegistroAlimento';
import Estadisticas from './components/Estadisticas';

/**
 * Componente principal de la aplicación
 * 
 * Configura el enrutador principal y define todas las rutas
 * accesibles en la aplicación FIDO.
 * 
 * @component
 * @returns {JSX.Element} Estructura de enrutamiento de la aplicación
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Redirección por defecto al login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Ruta de autenticación */}
        <Route path="/login" element={<Login />} />
        
        {/* Panel principal del sistema */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Registro de usuarios (solo administradores) */}
        <Route path="/register" element={<UserRegister />} />
        
        {/* Registro de alimentación de mascotas */}
        <Route path="/registro-alimento" element={<RegistroAlimento />} />
        
        {/* Visualización de estadísticas y gráficos */}
        <Route path="/estadisticas" element={<Estadisticas />} />
      </Routes>
    </Router>
  );
}

export default App;

