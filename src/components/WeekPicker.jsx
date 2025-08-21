/**
 * @fileoverview Componente selector de semana del Sistema FIDO
 * 
 * Este componente proporciona una interfaz para seleccionar una semana específica
 * usando el input HTML5 de tipo "week". Permite filtrar los datos de alimentación
 * por semana completa (de lunes a domingo).
 * 
 * Características:
 * - Input tipo "week" con formato ISO (YYYY-Www)
 * - Rango de años configurable (2023-2030)
 * - Información de compatibilidad del navegador
 * - Integración con el sistema de filtros temporales
 * 
 * @author Sistema FIDO
 * @version 1.0.0
 * @since 2025
 */

import React from 'react';

/**
 * Componente selector de semana
 * 
 * @component
 * @param {Object} props - Props del componente
 * @param {string} props.selectedWeek - Semana seleccionada en formato ISO (YYYY-Www)
 * @param {Function} props.setSelectedWeek - Función para actualizar la semana seleccionada
 * @returns {JSX.Element} Interfaz de selección de semana
 * 
 * @example
 * ```jsx
 * <WeekPicker 
 *   selectedWeek="2025-W33"
 *   setSelectedWeek={(week) => setSelectedWeek(week)}
 * />
 * ```
 * 
 * @note El input tipo "week" tiene soporte limitado en navegadores:
 * - ✅ Chrome, Edge, Opera
 * - ❌ Firefox, Safari (funcionalidad limitada)
 */
export default function WeekPicker({ selectedWeek, setSelectedWeek }) {
  return (
    // Contenedor principal del selector de semana
    <div className="mb-4">
      {/* Etiqueta descriptiva del campo */}
      <label 
        htmlFor="semana" 
        className="block text-gray-700 text-sm font-bold mb-2"
      >
        Seleccione una Semana:
      </label>
      
      {/* Input de selección de semana */}
      <input
        type="week"
        id="semana"
        value={selectedWeek}
        onChange={(e) => setSelectedWeek(e.target.value)}
        min="2023-W01"  // Semana mínima: primera semana de 2023
        max="2030-W52"  // Semana máxima: última semana de 2030
        placeholder="Año-Semana"
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        title="Selecciona una semana específica para filtrar los datos"
      />
      
      {/* Información sobre compatibilidad del navegador */}
      <div className="text-sm text-gray-500 mt-2">
        * El selector de semana funciona mejor en navegadores compatibles (Chrome, Edge, Opera).
      </div>
    </div>
  );
}
