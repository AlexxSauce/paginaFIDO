/**
 * @fileoverview Componente principal de estadísticas del Sistema FIDO
 * 
 * Este componente maneja la visualización de datos de alimentación de mascotas
 * a través de gráficas interactivas, filtros temporales y estadísticas detalladas.
 * 
 * @author Sistema FIDO
 * @version 1.0.0
 * @since 2025
 */

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import WeekPicker from './WeekPicker';
import DateRangePicker from './DateRangePicker';
import Charts from './Charts';
import DataSummary from './DataSummary';

/**
 * Calcula las fechas de una semana específica basada en el formato ISO (YYYY-Www)
 * 
 * @param {string} weekString - String en formato "YYYY-Www" (ej: "2025-W33")
 * @returns {string[]} Array de fechas en formato ISO (YYYY-MM-DD)
 * 
 * @example
 * getDatesOfWeek("2025-W33") // Returns ["2025-08-11", "2025-08-12", ...]
 */
function getDatesOfWeek(weekString) {
  if (!weekString) return [];
  
  try {
    const [year, week] = weekString.split('-W').map(Number);
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = ((week - 1) * 7) + (firstDayOfYear.getDay() <= 4 ? 1 - firstDayOfYear.getDay() : 8 - firstDayOfYear.getDay());
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(year, 0, 1 + daysOffset + i);
      weekDates.push(d.toISOString().slice(0, 10));
    }
    return weekDates;
  } catch (error) {
    console.error('Error al calcular fechas de la semana:', error);
    return [];
  }
}

/**
 * Retorna los nombres de los días de la semana en español
 * 
 * @returns {string[]} Array con nombres de días en español
 */
function getDayNamesES() {
  return ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
}

/**
 * Componente principal de Estadísticas del Sistema FIDO
 * 
 * Funcionalidades principales:
 * - Visualización de datos de alimentación en gráficas interactivas
 * - Filtros por semana o rango de fechas
 * - Cálculo de estadísticas detalladas
 * - Exportación a PDF
 * - Test de conectividad con Firebase
 * - Generación de datos de prueba
 * 
 * @component
 * @returns {JSX.Element} Interfaz completa de estadísticas
 */
export default function Estadisticas() {
  // ==================== HOOKS Y ESTADO ====================
  const navigate = useNavigate();
  
  // Estados para filtros temporales
  const [selectedWeek, setSelectedWeek] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState('week'); // 'week' | 'dateRange'
  
  // Estados para datos y visualización
  const [chartData, setChartData] = useState({ labels: [], values: [] });
  const [detailedStats, setDetailedStats] = useState({
    totalFeedings: 0,
    averageAmount: 0,
    automaticFeedings: 0,
    dispenserFeedings: 0,
    scheduledFeedings: 0,
    completedFeedings: 0
  });
  
  // Estados para procesos asincrónicos
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // ==================== FUNCIONES DE DIAGNÓSTICO ====================
  
  /**
   * Prueba la conectividad con Firebase y muestra información de debug
   * 
   * @async
   * @function testFirebaseConnection
   * @returns {Promise<void>}
   * 
   * Funcionalidades:
   * - Verifica conexión con Firestore
   * - Muestra total de documentos
   * - Ejecuta consulta filtrada de prueba
   * - Maneja errores de permisos e índices
   */
  const testFirebaseConnection = async () => {
    try {
      console.log('🔍 Probando conexión a Firebase...');
      console.log('🔗 Proyecto conectado:', db.app.options.projectId);
      
      // Primer intento: obtener todos los documentos sin filtros
      const testQuery = query(collection(db, 'feedingRecords'));
      const testSnapshot = await getDocs(testQuery);
      
      console.log('📊 Total documentos en feedingRecords:', testSnapshot.size);
      
      if (testSnapshot.size > 0) {
        console.log('✅ Conexión exitosa! Primeros 5 documentos:');
        testSnapshot.docs.slice(0, 5).forEach((doc, index) => {
          const data = doc.data();
          console.log(`Documento ${index + 1}:`, {
            id: doc.id,
            amount: data.amount,
            amountUnit: data.amountUnit,
            timestamp: data.timestamp,
            status: data.status,
            type: data.type,
            source: data.source
          });
        });
        
        // Intentar consulta con filtro de fecha reciente
        const recentDate = '2025-08-01T00:00:00.000Z';
        console.log('🔍 Intentando consulta filtrada desde:', recentDate);
        
        const filteredQuery = query(
          collection(db, 'feedingRecords'),
          where('timestamp', '>=', recentDate),
          orderBy('timestamp', 'desc')
        );
        
        const filteredSnapshot = await getDocs(filteredQuery);
        console.log('📊 Documentos filtrados encontrados:', filteredSnapshot.size);
        
        alert(`✅ Conexión exitosa!\n\nTotal documentos: ${testSnapshot.size}\nDocumentos recientes: ${filteredSnapshot.size}\n\nRevisa la consola para más detalles.`);
      } else {
        alert('⚠️ Conexión exitosa pero no hay documentos en feedingRecords. Verifica que la colección existe y tiene datos.');
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      if (error.code === 'permission-denied') {
        alert('❌ Error de permisos: Tu usuario no tiene acceso a la colección feedingRecords.');
      } else if (error.code === 'failed-precondition') {
        alert('❌ Error de índice: La consulta requiere un índice. Revisa la consola para más detalles.');
      } else {
        alert('❌ Error de conexión a Firebase: ' + error.message);
      }
    }
  };

  
  // ==================== FUNCIONES DE EXPORTACIÓN ====================
  
  /**
   * Genera y descarga un reporte PDF con los datos de alimentación
   * 
   * @async
   * @function handleDownloadPDF
   * @returns {Promise<void>}
   * 
   * Funcionalidades:
   * - Valida que existan datos para exportar
   * - Genera PDF con diseño profesional
   * - Incluye tabla de datos con formato
   * - Añade metadatos y fecha de generación
   * - Maneja errores de generación
   * 
   * Elementos del PDF:
   * - Header con logo y título del sistema
   * - Información del período consultado
   * - Tabla de datos formateada
   * - Footer con derechos de autor
   */
  const handleDownloadPDF = async () => {
    if (!chartData.labels.length || !chartData.values.length) {
      alert('Primero consulta los datos antes de descargar el PDF.');
      return;
    }

    setIsGeneratingPDF(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const pdf = new jsPDF();
      
      const headerBg = [196, 181, 253];
      const headerText = [75, 0, 110];
      const rowBg1 = [243, 244, 246];
      const rowBg2 = [229, 231, 235];
      const borderColor = [0, 0, 0];
      const textColor = [34, 34, 34];

      pdf.setFillColor(headerBg[0], headerBg[1], headerBg[2]);
      pdf.rect(0, 0, 210, 35, 'F');
      
      pdf.setTextColor(headerText[0], headerText[1], headerText[2]);
      pdf.setFontSize(20);
      pdf.text('Reporte de Alimentación de Mascotas', 105, 18, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.text('Sistema FIDO - Registros de Comida', 105, 25, { align: 'center' });
      
      pdf.setFontSize(11);
      let periodoTexto = '';
      if (filterType === 'week' && selectedWeek) {
        periodoTexto = `Semana: ${selectedWeek}`;
      } else if (filterType === 'dateRange' && startDate && endDate) {
        periodoTexto = `Período: ${startDate} al ${endDate}`;
      }
      if (periodoTexto) {
        pdf.text(periodoTexto, 105, 32, { align: 'center' });
      }

      const tableStartY = 45;
      pdf.setFontSize(13);
      pdf.setTextColor(255, 255, 255);
      pdf.setFillColor(124, 58, 237);
      pdf.rect(15, tableStartY, 180, 10, 'F');
      pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      pdf.rect(15, tableStartY, 180, 10);
      
      if (filterType === 'week') {
        pdf.text('Día', 25, tableStartY + 7);
        pdf.text('Fecha', 80, tableStartY + 7);
        pdf.text('Cantidad (g)', 150, tableStartY + 7);
      } else {
        pdf.text('Fecha', 25, tableStartY + 7);
        pdf.text('Cantidad (g)', 120, tableStartY + 7);
      }

      let currentY = tableStartY + 17;
      chartData.labels.forEach((label, idx) => {
        const bgColor = idx % 2 === 0 ? rowBg1 : rowBg2;
        pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        pdf.rect(15, currentY - 7, 180, 12, 'F');
        pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        pdf.rect(15, currentY - 7, 180, 12);
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

        if (filterType === 'week') {
          const weekDates = getDatesOfWeek(selectedWeek);
          pdf.text(label, 25, currentY);
          pdf.text(weekDates[idx] || 'N/A', 80, currentY);
          pdf.text(String(chartData.values[idx]) + 'g', 150, currentY);
        } else {
          pdf.text(label, 25, currentY);
          pdf.text(String(chartData.values[idx]) + 'g', 120, currentY);
        }
        
        currentY += 12;
      });

      const valores = chartData.values.filter(val => val > 0);
      const total = valores.reduce((sum, val) => sum + val, 0);
      const promedio = valores.length > 0 ? (total / valores.length).toFixed(1) : 0;
      const maximo = valores.length > 0 ? Math.max(...valores) : 0;
      const minimo = valores.length > 0 ? Math.min(...valores) : 0;

      currentY += 15;
      pdf.setFontSize(14);
      pdf.setTextColor(headerText[0], headerText[1], headerText[2]);
      pdf.text('Resumen Estadístico:', 15, currentY);
      
      currentY += 10;
      pdf.setFontSize(11);
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.text(`Total: ${total}g`, 15, currentY);
      pdf.text(`Promedio: ${promedio}g`, 70, currentY);
      pdf.text(`Máximo: ${maximo}g`, 125, currentY);
      pdf.text(`Mínimo: ${minimo}g`, 175, currentY);

      currentY += 15;
      pdf.setFontSize(14);
      pdf.setTextColor(headerText[0], headerText[1], headerText[2]);
      pdf.text('Detalles de Alimentación:', 15, currentY);
      
      currentY += 10;
      pdf.setFontSize(11);
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.text(`Total Alimentaciones: ${detailedStats.totalFeedings}`, 15, currentY);
      pdf.text(`Promedio por Comida: ${detailedStats.averageAmount}g`, 80, currentY);
      pdf.text(`Automáticas: ${detailedStats.automaticFeedings}`, 155, currentY);
      
      currentY += 8;
      pdf.text(`Dispensador: ${detailedStats.dispenserFeedings}`, 15, currentY);
      pdf.text(`Programadas: ${detailedStats.scheduledFeedings}`, 80, currentY);
      pdf.text(`Completadas: ${detailedStats.completedFeedings}`, 155, currentY);

      pdf.setFontSize(10);
      pdf.setTextColor(102, 102, 102);
      
      pdf.text('SISTEMA FIDO TODOS LOS DERECHOS RESERVADOS 2025', 105, 290, { align: 'center' });
      pdf.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 105, 280, { align: 'center' });

      let fileName = 'reporte-alimentacion-';
      if (filterType === 'week' && selectedWeek) {
        fileName += `semana-${selectedWeek}.pdf`;
      } else if (filterType === 'dateRange' && startDate && endDate) {
        fileName += `${startDate}-al-${endDate}.pdf`;
      } else {
        fileName += `${new Date().toISOString().split('T')[0]}.pdf`;
      }

      pdf.save(fileName);
      alert('¡PDF generado exitosamente!');
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  
  // ==================== FUNCIONES DE UTILIDAD ====================
  
  /**
   * Convierte diferentes unidades de peso a gramos
   * 
   * @param {number} amount - Cantidad a convertir
   * @param {string} unit - Unidad original ('gramos' | 'kg' | 'libras' | 'pounds')
   * @returns {number} Cantidad convertida a gramos
   * 
   * @example
   * convertToGrams(1, 'kg') // Returns 1000
   * convertToGrams(2, 'libras') // Returns 907.184
   */
  const convertToGrams = (amount, unit) => {
    switch (unit) {
      case 'kg':
        return amount * 1000;
      case 'libras':
      case 'pounds':
        return amount * 453.592;
      default:
        return amount; // Ya está en gramos
    }
  };

  /**
   * Calcula estadísticas detalladas de los registros de alimentación
   * 
   * @param {Array} feedings - Array de objetos de alimentación
   * @returns {Object} Objeto con estadísticas calculadas
   * 
   * Estadísticas incluidas:
   * - totalFeedings: Total de alimentaciones
   * - averageAmount: Promedio de cantidad por alimentación
   * - automaticFeedings: Alimentaciones automáticas
   * - dispenserFeedings: Alimentaciones por dispensador
   * - scheduledFeedings: Alimentaciones programadas
   * - completedFeedings: Alimentaciones completadas
   */
  const calculateDetailedStats = (feedings) => {
    const stats = {
      totalFeedings: feedings.length,
      averageAmount: 0,
      automaticFeedings: 0,
      dispenserFeedings: 0,
      scheduledFeedings: 0,
      completedFeedings: 0
    };
    
    if (feedings.length === 0) return stats;
    
    let totalAmount = 0;
    
    feedings.forEach(feeding => {
      // Convertir cantidad a gramos
      const amount = convertToGrams(Number(feeding.amount) || 0, feeding.amountUnit);
      totalAmount += amount;
      
      // Contar por tipo
      if (feeding.type === 'automatic') stats.automaticFeedings++;
      if (feeding.source === 'dispenser') stats.dispenserFeedings++;
      if (feeding.type === 'scheduled') stats.scheduledFeedings++;
      if (feeding.status === 'completed') stats.completedFeedings++;
    });
    
    stats.averageAmount = Math.round(totalAmount / feedings.length);
    
    return stats;
  };

  /**
   * Genera datos de prueba para testing del sistema
   * 
   * @function generateTestData
   * @returns {void}
   * 
   * Funcionalidades:
   * - Crea datos simulados para la semana
   * - Calcula estadísticas de ejemplo
   * - Actualiza el estado con datos de prueba
   */
  const generateTestData = () => {
    const dayNames = getDayNamesES();
    const testValues = [450, 320, 580, 210, 390, 670, 520];
    
    const totalFeedings = Math.floor(Math.random() * 20) + 15;
    const automaticFeedings = Math.floor(totalFeedings * 0.7);
    const dispenserFeedings = Math.floor(totalFeedings * 0.6);
    const scheduledFeedings = Math.floor(totalFeedings * 0.8);
    const completedFeedings = totalFeedings - Math.floor(totalFeedings * 0.1);
    const averageAmount = Math.round(testValues.reduce((sum, val) => sum + val, 0) / testValues.length);
    
    setChartData({
      labels: dayNames,
      values: testValues
    });
    
    setDetailedStats({
      totalFeedings,
      averageAmount,
      automaticFeedings,
      dispenserFeedings,
      scheduledFeedings,
      completedFeedings
    });
    
    alert('Datos de prueba de alimentación generados exitosamente.');
  };

  
  // ==================== FUNCIONES DE CONSULTA DE DATOS ====================
  
  /**
   * Función principal para obtener y procesar datos de Firestore
   * 
   * @async
   * @function fetchData
   * @returns {Promise<void>}
   * 
   * Funcionalidades:
   * - Valida filtros seleccionados
   * - Consulta Firestore según tipo de filtro (semana/rango)
   * - Procesa y agrupa datos por período
   * - Convierte unidades a gramos
   * - Calcula estadísticas detalladas
   * - Actualiza estados con datos procesados
   * 
   * Tipos de consulta:
   * - Por semana: Agrupa datos día a día (Lun-Dom)
   * - Por rango: Agrupa datos por fecha específica
   */
  const fetchData = async () => {
    if (filterType === 'week' && !selectedWeek) {
      alert("Por favor, selecciona una semana para consultar los datos.");
      return;
    }
    
    if (filterType === 'dateRange' && (!startDate || !endDate)) {
      alert("Por favor, selecciona ambas fechas para consultar los datos.");
      return;
    }

    console.log('🔍 Iniciando consulta de feedingRecords...');
    console.log('📊 Tipo de filtro:', filterType);
    console.log('📅 Semana seleccionada:', selectedWeek);
    console.log('📅 Rango de fechas:', startDate, 'a', endDate);

    try {
      let queryRef;
      let allFeedings = [];
      
      if (filterType === 'week') {
        const weekDates = getDatesOfWeek(selectedWeek);
        const weekStart = weekDates[0] + 'T00:00:00.000Z';
        const weekEnd = weekDates[6] + 'T23:59:59.999Z';
        
        console.log('📊 Fechas de semana calculadas:', weekDates);
        console.log('🔍 Consultando desde:', weekStart, 'hasta:', weekEnd);
        
        try {
          const testQuery = query(collection(db, 'feedingRecords'));
          const testSnapshot = await getDocs(testQuery);
          
          console.log('📊 Total documentos en feedingRecords:', testSnapshot.size);
          
          if (testSnapshot.size > 0) {
            console.log('📋 Muestra de documentos encontrados:');
            testSnapshot.docs.slice(0, 3).forEach((doc, index) => {
              console.log(`Documento ${index + 1}:`, doc.id, doc.data());
            });
          }
          
          queryRef = query(
            collection(db, 'feedingRecords'),
            where('timestamp', '>=', weekStart),
            where('timestamp', '<=', weekEnd),
            orderBy('timestamp')
          );

          const querySnapshot = await getDocs(queryRef);
          console.log('📊 Documentos filtrados encontrados:', querySnapshot.size);
          
          const dataByDay = {};
          weekDates.forEach(date => { dataByDay[date] = 0; });
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            allFeedings.push(data);
            
            console.log('📄 Procesando documento:', doc.id, data);
            
            const feedingDate = data.timestamp ? data.timestamp.split('T')[0] : null;
            
            if (feedingDate && dataByDay[feedingDate] !== undefined) {
              let amountInGrams = Number(data.amount) || 0;
              if (data.amountUnit === 'kg') {
                amountInGrams = amountInGrams * 1000;
              } else if (data.amountUnit === 'pounds') {
                amountInGrams = amountInGrams * 453.592;
              }
              dataByDay[feedingDate] += amountInGrams;
              
              console.log(`✅ Agregando ${amountInGrams}g a fecha ${feedingDate}`);
            } else {
              console.log('⚠️ Fecha no válida o fuera del rango:', feedingDate);
            }
          });

          setChartData({
            labels: getDayNamesES(),
            values: weekDates.map(date => Math.round(dataByDay[date]))
          });
          
          console.log('📈 Datos finales por día:', dataByDay);
          
        } catch (queryError) {
          console.error('❌ Error en consulta con filtros:', queryError);
          alert('Error al consultar datos filtrados. Revisa la consola para más detalles.');
          return;
        }
        
      } else {
        const rangeStart = startDate + 'T00:00:00.000Z';
        const rangeEnd = endDate + 'T23:59:59.999Z';
        
        console.log('🔍 Consultando rango desde:', rangeStart, 'hasta:', rangeEnd);
        
        queryRef = query(
          collection(db, 'feedingRecords'),
          where('timestamp', '>=', rangeStart),
          where('timestamp', '<=', rangeEnd),
          orderBy('timestamp')
        );

        const querySnapshot = await getDocs(queryRef);
        console.log('📊 Documentos en rango encontrados:', querySnapshot.size);
        
        const dataByDate = {};
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          allFeedings.push(data);
          
          console.log('📄 Procesando documento:', doc.id, data);
          
          const feedingDate = data.timestamp ? data.timestamp.split('T')[0] : null;
          
          if (feedingDate) {
            let amountInGrams = Number(data.amount) || 0;
            if (data.amountUnit === 'kg') {
              amountInGrams = amountInGrams * 1000;
            } else if (data.amountUnit === 'pounds') {
              amountInGrams = amountInGrams * 453.592;
            }
            
            if (dataByDate[feedingDate]) {
              dataByDate[feedingDate] += amountInGrams;
            } else {
              dataByDate[feedingDate] = amountInGrams;
            }
            
            console.log(`✅ Agregando ${amountInGrams}g a fecha ${feedingDate}`);
          }
        });

        const sortedDates = Object.keys(dataByDate).sort();
        setChartData({
          labels: sortedDates,
          values: sortedDates.map(date => Math.round(dataByDate[date]))
        });
        
        console.log('📈 Datos finales por fecha:', dataByDate);
      }

      const totalFeedings = allFeedings.length;
      const automaticFeedings = allFeedings.filter(f => f.type === 'automatic').length;
      const dispenserFeedings = allFeedings.filter(f => f.source === 'dispenser').length;
      const scheduledFeedings = allFeedings.filter(f => f.status === 'scheduled').length;
      const completedFeedings = allFeedings.filter(f => f.status === 'completed').length;
      
      const totalAmount = allFeedings.reduce((sum, feeding) => {
        let amountInGrams = Number(feeding.amount) || 0;
        if (feeding.amountUnit === 'kg') {
          amountInGrams *= 1000;
        } else if (feeding.amountUnit === 'pounds') {
          amountInGrams *= 453.592;
        }
        return sum + amountInGrams;
      }, 0);
      
      const averageAmount = totalFeedings > 0 ? Math.round(totalAmount / totalFeedings) : 0;

      setDetailedStats({
        totalFeedings,
        averageAmount,
        automaticFeedings,
        dispenserFeedings,
        scheduledFeedings,
        completedFeedings
      });

      console.log('📊 Estadísticas calculadas:', {
        totalFeedings,
        averageAmount,
        automaticFeedings,
        dispenserFeedings,
        scheduledFeedings,
        completedFeedings
      });

      if (totalFeedings === 0) {
        alert('No se encontraron registros de alimentación para el período seleccionado.');
      } else {
        alert(`✅ Se encontraron ${totalFeedings} registros de alimentación.`);
      }

    } catch (error) {
      console.error("❌ Error al obtener datos de feedingRecords:", error);
      alert("Error al cargar los datos de alimentación: " + error.message);
      setChartData({ labels: [], values: [] });
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
                Estadísticas de Alimentación de Mascotas
              </h1>
              <p className="text-sm text-gray-600">Sistema FIDO - Registros de Comida</p>
            </div>
          </motion.div>

          {/* Menú de navegación */}
          <motion.div 
            className="flex items-center gap-2"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <motion.button
              onClick={() => navigate('/registro-alimento')}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200"
              title="Ir a Registrar Alimento"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="hidden sm:inline">Registrar Alimento</span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200"
              title="Registrar Usuarios"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
              <span className="hidden sm:inline">Registrar Usuarios</span>
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="inline-block p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:shadow-outline"
              title="Volver al Dashboard"
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </motion.header>

      <main className="flex-1 container mx-auto p-4">
        {/* Resumen de datos */}
        {chartData.labels.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <DataSummary chartData={chartData} />
          </motion.div>
        )}

        {/* Estadísticas detalladas de alimentación */}
        {chartData.labels.length > 0 && (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div 
              className="bg-blue-100 p-4 rounded-lg text-center border-2 border-blue-200"
              whileHover={{ scale: 1.05, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
            >
              <div className="text-2xl font-bold text-blue-600">{detailedStats.totalFeedings}</div>
              <div className="text-sm text-blue-800">Total Alimentaciones</div>
            </motion.div>
            
            <motion.div 
              className="bg-green-100 p-4 rounded-lg text-center border-2 border-green-200"
              whileHover={{ scale: 1.05, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
            >
              <div className="text-2xl font-bold text-green-600">{detailedStats.averageAmount}g</div>
              <div className="text-sm text-green-800">Promedio por Comida</div>
            </motion.div>
            
            <motion.div 
              className="bg-purple-100 p-4 rounded-lg text-center border-2 border-purple-200"
              whileHover={{ scale: 1.05, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
            >
              <div className="text-2xl font-bold text-purple-600">{detailedStats.automaticFeedings}</div>
              <div className="text-sm text-purple-800">Automáticas</div>
            </motion.div>
            
            <motion.div 
              className="bg-orange-100 p-4 rounded-lg text-center border-2 border-orange-200"
              whileHover={{ scale: 1.05, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
            >
              <div className="text-2xl font-bold text-orange-600">{detailedStats.dispenserFeedings}</div>
              <div className="text-sm text-orange-800">Dispensador</div>
            </motion.div>
            
            <motion.div 
              className="bg-yellow-100 p-4 rounded-lg text-center border-2 border-yellow-200"
              whileHover={{ scale: 1.05, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
            >
              <div className="text-2xl font-bold text-yellow-600">{detailedStats.scheduledFeedings}</div>
              <div className="text-sm text-yellow-800">Programadas</div>
            </motion.div>
            
            <motion.div 
              className="bg-emerald-100 p-4 rounded-lg text-center border-2 border-emerald-200"
              whileHover={{ scale: 1.05, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
            >
              <div className="text-2xl font-bold text-emerald-600">{detailedStats.completedFeedings}</div>
              <div className="text-sm text-emerald-800">Completadas</div>
            </motion.div>
          </motion.div>
        )}
        
        <motion.section 
          className="bg-gray-100 rounded-3xl shadow-lg overflow-hidden border-4 border-black"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-600 font-semibold text-lg md:text-xl p-8">
              {chartData.labels.length > 0 ? (
                <Charts chartData={chartData} />
              ) : (
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  Selecciona un período y consulta los registros de alimentación de mascotas.
                </motion.p>
              )}
            </div>
          </div>
          <motion.div 
            className="p-6 border-t border-gray-300 flex flex-col items-center gap-4"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {/* Selector de tipo de filtro */}
            <motion.div 
              className="flex gap-4 mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <motion.button
                onClick={() => setFilterType('week')}
                className={`px-4 py-2 rounded transition-all duration-300 ${filterType === 'week' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Por Semana
              </motion.button>
              <motion.button
                onClick={() => setFilterType('dateRange')}
                className={`px-4 py-2 rounded transition-all duration-300 ${filterType === 'dateRange' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Por Rango de Fechas
              </motion.button>
            </motion.div>

            {/* Filtros condicionalmente */}
            <motion.div
              key={filterType}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {filterType === 'week' ? (
                <WeekPicker selectedWeek={selectedWeek} setSelectedWeek={setSelectedWeek} />
              ) : (
                <DateRangePicker 
                  startDate={startDate} 
                  endDate={endDate} 
                  setStartDate={setStartDate} 
                  setEndDate={setEndDate} 
                />
              )}
            </motion.div>
            
            <motion.button
              onClick={fetchData}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(59, 130, 246, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              Consultar Datos
            </motion.button>

            {/* Botón de test de conexión */}
            <motion.button
              onClick={testFirebaseConnection}
              className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(99, 102, 241, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.05 }}
            >
              Probar Conexión Firebase
            </motion.button>

            {/* Botón de datos de prueba */}
            <motion.button
              onClick={generateTestData}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(234, 179, 8, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            >
              Generar Datos de Alimentación de Prueba
            </motion.button>

            <motion.button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className={`text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full md:w-auto mt-2 transition-all duration-300 ${
                isGeneratingPDF 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-700'
              }`}
              whileHover={!isGeneratingPDF ? { scale: 1.05, boxShadow: "0 5px 15px rgba(34, 197, 94, 0.4)" } : {}}
              whileTap={!isGeneratingPDF ? { scale: 0.95 } : {}}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              {isGeneratingPDF ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner mr-2"></div>
                  Generando PDF...
                </div>
              ) : (
                'Descargar PDF'
              )}
            </motion.button>
          </motion.div>
        </motion.section>
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
