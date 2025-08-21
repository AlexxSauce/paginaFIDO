/**
 * @fileoverview Punto de entrada principal de la aplicación React
 * 
 * Este archivo inicializa la aplicación React y la monta en el DOM.
 * Utiliza React.StrictMode para ayudar a detectar problemas potenciales
 * en la aplicación durante el desarrollo.
 * 
 * @author Sistema FIDO
 * @version 1.0.0
 * @since 2025
 */

import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/**
 * Inicializa y renderiza la aplicación React
 * 
 * - Obtiene el elemento root del DOM
 * - Envuelve la aplicación en StrictMode para validaciones adicionales
 * - Renderiza el componente App principal
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
