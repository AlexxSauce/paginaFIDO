import React from 'react';

export default function WeekPicker({ selectedWeek, setSelectedWeek }) {
  return (
    // Contenedor principal de la sección de selección de semana
    <div className="mb-4"> {/* Margen inferior para separarlo del botón de Consulta */}
      <label htmlFor="semana" className="block text-gray-700 text-sm font-bold mb-2">
        Seleccione una Semana:
      </label>
      <input
        type="week"
        id="semana" // Añadimos un id para asociar con el label
        value={selectedWeek}
        onChange={(e) => setSelectedWeek(e.target.value)}
        min="2023-W01"
        max="2030-W52"
        placeholder="Año-Semana"
        // Clases de Tailwind para el input
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
      {/* Información sobre la compatibilidad del selector de semana */}
      <div className="text-sm text-gray-500 mt-2"> {/* Ajustamos el tamaño de fuente y color */}
        * El selector de semana solo funciona en navegadores compatibles (Chrome, Edge, Opera).
      </div>
    </div>
  );
}
