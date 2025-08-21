/**
 * @fileoverview Componente selector de rango de fechas del Sistema FIDO
 * 
 * Este componente proporciona una interfaz para seleccionar un rango de fechas
 * (fecha inicio y fecha fin) para filtrar los datos de alimentación de mascotas.
 * 
 * Características:
 * - Dos inputs de tipo date para inicio y fin
 * - Diseño responsivo que se adapta a diferentes tamaños de pantalla
 * - Validación HTML5 automática de fechas
 * - Integración con el sistema de filtros temporales
 * 
 * @author Sistema FIDO
 * @version 1.0.0
 * @since 2025
 */

import React from 'react';

/**
 * Componente selector de rango de fechas
 * 
 * @component
 * @param {Object} props - Props del componente
 * @param {string} props.startDate - Fecha de inicio en formato YYYY-MM-DD
 * @param {string} props.endDate - Fecha de fin en formato YYYY-MM-DD
 * @param {Function} props.setStartDate - Función para actualizar la fecha de inicio
 * @param {Function} props.setEndDate - Función para actualizar la fecha de fin
 * @returns {JSX.Element} Interfaz de selección de rango de fechas
 * 
 * @example
 * ```jsx
 * <DateRangePicker 
 *   startDate="2025-08-01"
 *   endDate="2025-08-31"
 *   setStartDate={(date) => setStartDate(date)}
 *   setEndDate={(date) => setEndDate(date)}
 * />
 * ```
 */
export default function DateRangePicker({ startDate, endDate, setStartDate, setEndDate }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      {/* Campo de fecha de inicio */}
      <div className="flex flex-col">
        <label 
          htmlFor="start-date" 
          className="text-sm font-medium text-gray-700 mb-1"
        >
          Fecha Inicio:
        </label>
        <input
          type="date"
          id="start-date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Selecciona la fecha de inicio para el filtro"
        />
      </div>
      
      {/* Campo de fecha de fin */}
      <div className="flex flex-col">
        <label 
          htmlFor="end-date" 
          className="text-sm font-medium text-gray-700 mb-1"
        >
          Fecha Fin:
        </label>
        <input
          type="date"
          id="end-date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Selecciona la fecha de fin para el filtro"
        />
      </div>
    </div>
  );
}
