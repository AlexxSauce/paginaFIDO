/**
 * @fileoverview Componente de gráficas interactivas del Sistema FIDO
 * 
 * Este componente renderiza diferentes tipos de gráficas usando Chart.js
 * para visualizar los datos de alimentación de mascotas.
 * 
 * Tipos de gráficas disponibles:
 * - Barras: Comparación de cantidades por período
 * - Líneas: Tendencias temporales
 * - Pastel: Distribución porcentual
 * - Área: Visualización de volumen acumulado
 * 
 * @author Sistema FIDO
 * @version 1.0.0
 * @since 2025
 */

import React, { useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Registro de componentes de Chart.js
ChartJS.register(
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

/**
 * Componente de gráficas interactivas para visualización de datos de alimentación
 * 
 * @component
 * @param {Object} props - Props del componente
 * @param {Object} props.chartData - Datos para renderizar las gráficas
 * @param {string[]} props.chartData.labels - Etiquetas para el eje X
 * @param {number[]} props.chartData.values - Valores para el eje Y
 * @returns {JSX.Element} Componente de gráficas con selector de tipo
 */
export default function Charts({ chartData }) {
  // ==================== ESTADO ====================
  const [chartType, setChartType] = useState('bar');
  
  // ==================== CONFIGURACIÓN DE CHART.JS ====================
  
  /**
   * Configuración base para todas las gráficas
   * Incluye opciones de responsividad, plugins y estilos
   */
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top', // Coloca la leyenda en la parte superior
        labels: {
          color: '#374151', // Color del texto de la leyenda (gray-700)
        }
      },
      tooltip: {
        backgroundColor: '#374151', // Fondo del tooltip
        titleColor: '#F9FAFB', // Color del título del tooltip
        bodyColor: '#F9FAFB', // Color del cuerpo del tooltip
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#374151', // Color de las etiquetas del eje X
        },
        grid: {
          color: 'rgba(209, 213, 219, 0.5)', // Color de las líneas de la cuadrícula X (gray-300 con opacidad)
          borderColor: '#D1D5DB', // Color del borde del eje X (gray-300)
        }
      },
      y: {
        ticks: {
          color: '#374151', // Color de las etiquetas del eje Y
        },
        grid: {
          color: 'rgba(209, 213, 219, 0.5)', // Color de las líneas de la cuadrícula Y
          borderColor: '#D1D5DB', // Color del borde del eje Y
        }
      }
    }
  };

  
  // ==================== CONFIGURACIONES DE DATOS ====================
  
  /**
   * Configuración de datos para gráfica de barras
   * Muestra cantidades discretas por período de tiempo
   */
  const barData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Cantidad de Comida Servida (g)',
        data: chartData.values,
        backgroundColor: '#3B82F6', // blue-500
        borderColor: '#2563EB', // blue-600
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  /**
   * Configuración de datos para gráfica de líneas
   * Muestra tendencias temporales con área rellena
   */
  const lineData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Cantidad de Comida Servida (g)',
        data: chartData.values,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3B82F6',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
      },
    ],
  };

  /**
   * Configuración de datos para gráfica de pastel
   * Muestra distribución proporcional de los datos
   */
  const pieData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Cantidad de Comida Servida (g)',
        data: chartData.values,
        backgroundColor: [
          '#EF4444', // red-500
          '#F97316', // orange-500
          '#EAB308', // yellow-500
          '#22C55E', // green-500
          '#3B82F6', // blue-500
          '#8B5CF6', // violet-500
          '#EC4899', // pink-500
        ],
        borderWidth: 3,
        borderColor: '#FFFFFF',
        hoverBorderWidth: 4,
        hoverOffset: 10,
      },
    ],
  };

  /**
   * Configuración de datos para gráfica de área
   * Similar a líneas pero con más énfasis en el volumen
   */
  const areaData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Volumen Acumulado (g)',
        data: chartData.values,
        backgroundColor: 'rgba(139, 92, 246, 0.3)',
        borderColor: '#8B5CF6',
        borderWidth: 3,
        fill: 'origin',
        tension: 0.2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // ==================== FUNCIONES DE RENDERIZADO ====================
  
  /**
   * Renderiza la gráfica correspondiente según el tipo seleccionado
   * 
   * @function renderChart
   * @returns {JSX.Element} Componente de Chart.js correspondiente
   * 
   * Tipos disponibles:
   * - 'bar': Gráfica de barras (predeterminada)
   * - 'line': Gráfica de líneas con área
   * - 'pie': Gráfica de pastel
   * - 'area': Gráfica de área
   */
  const renderChart = () => {
    switch(chartType) {
      case 'line':
        return <Line data={lineData} options={options} />;
      case 'pie':
        return <Pie data={pieData} options={{...options, scales: {}}} />;
      case 'area':
        return <Line data={areaData} options={options} />;
      default:
        return <Bar data={barData} options={options} />;
    }
  };

  // ==================== CONFIGURACIONES DE ANIMACIÓN ====================

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div 
      className="flex-1 p-6 flex flex-col items-center justify-center text-center text-gray-600 font-semibold text-lg md:text-xl p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h3 
        className="text-xl font-semibold mb-4 text-gray-700"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Gráfico de Alimentación de Mascotas
      </motion.h3>
      
      {/* Selector de tipo de gráfica */}
      <motion.div 
        className="mb-4 flex gap-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <motion.button
          onClick={() => setChartType('bar')}
          className={`px-3 py-1 rounded transition-all duration-300 ${chartType === 'bar' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Barras
        </motion.button>
        <motion.button
          onClick={() => setChartType('line')}
          className={`px-3 py-1 rounded transition-all duration-300 ${chartType === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Líneas
        </motion.button>
        <motion.button
          onClick={() => setChartType('pie')}
          className={`px-3 py-1 rounded transition-all duration-300 ${chartType === 'pie' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Pastel
        </motion.button>
      </motion.div>

      {/* Contenedor para el gráfico con altura definida y ancho completo */}
      <motion.div 
        className="w-full h-80 md:h-96"
        key={chartType} // Fuerza re-animación cuando cambia el tipo
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {renderChart()}
      </motion.div>
    </motion.div>
  );
}