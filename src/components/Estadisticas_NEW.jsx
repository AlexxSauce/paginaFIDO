import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import WeekPicker from './WeekPicker';
import DateRangePicker from './DateRangePicker';
import Charts from './Charts';
import DataSummary from './DataSummary';

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

function getDayNamesES() {
  return ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
}

export default function Estadisticas() {
  const navigate = useNavigate();
  const [selectedWeek, setSelectedWeek] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState('week');
  const [chartData, setChartData] = useState({ labels: [], values: [] });
  const [detailedStats, setDetailedStats] = useState({
    totalFeedings: 0,
    averageAmount: 0,
    manualFeedings: 0,
    dispenserFeedings: 0,
    pendingFeedings: 0,
    completedFeedings: 0
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Test de conexión a Firebase
  const testFirebaseConnection = async () => {
    try {
      console.log('🔗 Probando conexión a Firebase...');
      
      const testQuery = query(collection(db, 'feedingRecords'));
      const testSnapshot = await getDocs(testQuery);
      
      console.log('📊 Conexión exitosa! Documentos encontrados:', testSnapshot.size);
      
      if (testSnapshot.size > 0) {
        console.log('📋 Estructura de los primeros 3 documentos:');
        testSnapshot.docs.slice(0, 3).forEach((doc, index) => {
          const data = doc.data();
          console.log(`Documento ${index + 1}:`, {
            id: doc.id,
            amount: data.amount,
            amountUnit: data.amountUnit,
            timestamp: data.timestamp,
            type: data.type,
            source: data.source,
            status: data.status,
            petId: data.petId,
            userId: data.userId
          });
        });
        
        alert(`✅ Conexión exitosa! Se encontraron ${testSnapshot.size} documentos en feedingRecords. Revisa la consola para ver la estructura.`);
      } else {
        alert('⚠️ Conexión exitosa, pero no hay documentos en feedingRecords.');
      }
      
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      alert('❌ Error de conexión a Firebase: ' + error.message);
    }
  };

  // Función principal para consultar datos
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
      let allFeedings = [];
      
      if (filterType === 'week') {
        const weekDates = getDatesOfWeek(selectedWeek);
        const weekStart = weekDates[0] + 'T00:00:00.000Z';
        const weekEnd = weekDates[6] + 'T23:59:59.999Z';
        
        console.log('📊 Fechas de semana calculadas:', weekDates);
        console.log('🔍 Consultando desde:', weekStart, 'hasta:', weekEnd);
        
        // Consulta simple sin orderBy para evitar problemas de índices
        const queryRef = query(
          collection(db, 'feedingRecords'),
          where('timestamp', '>=', weekStart),
          where('timestamp', '<=', weekEnd)
        );

        const querySnapshot = await getDocs(queryRef);
        console.log('📊 Documentos encontrados:', querySnapshot.size);
        
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
          }
        });

        setChartData({
          labels: getDayNamesES(),
          values: weekDates.map(date => Math.round(dataByDay[date]))
        });
        
      } else {
        // Filtro por rango de fechas
        const rangeStart = startDate + 'T00:00:00.000Z';
        const rangeEnd = endDate + 'T23:59:59.999Z';
        
        console.log('🔍 Consultando rango desde:', rangeStart, 'hasta:', rangeEnd);
        
        const queryRef = query(
          collection(db, 'feedingRecords'),
          where('timestamp', '>=', rangeStart),
          where('timestamp', '<=', rangeEnd)
        );

        const querySnapshot = await getDocs(queryRef);
        console.log('📊 Documentos en rango encontrados:', querySnapshot.size);
        
        const dataByDate = {};
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          allFeedings.push(data);
          
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
          }
        });

        const sortedDates = Object.keys(dataByDate).sort();
        setChartData({
          labels: sortedDates,
          values: sortedDates.map(date => Math.round(dataByDate[date]))
        });
      }

      // Calcular estadísticas detalladas con la estructura real
      const totalFeedings = allFeedings.length;
      const manualFeedings = allFeedings.filter(f => f.type === 'manual').length;
      const automaticFeedings = allFeedings.filter(f => f.type === 'automatic').length;
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
        manualFeedings,
        dispenserFeedings: automaticFeedings, // Mostrar automáticas
        pendingFeedings: scheduledFeedings, // Mostrar programadas
        completedFeedings
      });

      console.log('📊 Estadísticas calculadas:', {
        totalFeedings,
        averageAmount,
        manualFeedings,
        automaticFeedings,
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

  // Generar datos de prueba
  const generateTestData = () => {
    const dayNames = getDayNamesES();
    const testValues = [450, 320, 580, 210, 390, 670, 520];
    
    const totalFeedings = Math.floor(Math.random() * 20) + 15;
    const manualFeedings = Math.floor(totalFeedings * 0.1);
    const automaticFeedings = totalFeedings - manualFeedings;
    const scheduledFeedings = Math.floor(totalFeedings * 0.7);
    const completedFeedings = totalFeedings - scheduledFeedings;
    const averageAmount = Math.round(testValues.reduce((sum, val) => sum + val, 0) / testValues.length);
    
    setChartData({
      labels: dayNames,
      values: testValues
    });
    
    setDetailedStats({
      totalFeedings,
      averageAmount,
      manualFeedings,
      dispenserFeedings: automaticFeedings,
      pendingFeedings: scheduledFeedings,
      completedFeedings
    });
    
    alert('Datos de prueba de alimentación generados. Revisa las gráficas y estadísticas.');
  };

  // Función para generar PDF (simplificada)
  const handleDownloadPDF = async () => {
    if (!chartData.labels.length || !chartData.values.length) {
      alert('Primero consulta los datos antes de descargar el PDF.');
      return;
    }

    setIsGeneratingPDF(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const pdf = new jsPDF();
      
      pdf.setFontSize(20);
      pdf.text('Reporte de Alimentación de Mascotas', 105, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text('Sistema FIDO - Registros de Comida', 105, 30, { align: 'center' });
      
      // Tabla simple
      let currentY = 50;
      pdf.setFontSize(11);
      
      chartData.labels.forEach((label, idx) => {
        pdf.text(`${label}: ${chartData.values[idx]}g`, 20, currentY);
        currentY += 8;
      });
      
      // Estadísticas
      currentY += 10;
      pdf.text(`Total Alimentaciones: ${detailedStats.totalFeedings}`, 20, currentY);
      currentY += 8;
      pdf.text(`Promedio: ${detailedStats.averageAmount}g`, 20, currentY);
      
      const fileName = `reporte-alimentacion-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      alert('¡PDF generado exitosamente!');
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF.');
    } finally {
      setIsGeneratingPDF(false);
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

        {/* Estadísticas detalladas */}
        {chartData.labels.length > 0 && (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div className="bg-blue-100 p-4 rounded-lg text-center border-2 border-blue-200" whileHover={{ scale: 1.05 }}>
              <div className="text-2xl font-bold text-blue-600">{detailedStats.totalFeedings}</div>
              <div className="text-sm text-blue-800">Total Alimentaciones</div>
            </motion.div>
            
            <motion.div className="bg-green-100 p-4 rounded-lg text-center border-2 border-green-200" whileHover={{ scale: 1.05 }}>
              <div className="text-2xl font-bold text-green-600">{detailedStats.averageAmount}g</div>
              <div className="text-sm text-green-800">Promedio por Comida</div>
            </motion.div>
            
            <motion.div className="bg-purple-100 p-4 rounded-lg text-center border-2 border-purple-200" whileHover={{ scale: 1.05 }}>
              <div className="text-2xl font-bold text-purple-600">{detailedStats.manualFeedings}</div>
              <div className="text-sm text-purple-800">Alimentación Manual</div>
            </motion.div>
            
            <motion.div className="bg-orange-100 p-4 rounded-lg text-center border-2 border-orange-200" whileHover={{ scale: 1.05 }}>
              <div className="text-2xl font-bold text-orange-600">{detailedStats.dispenserFeedings}</div>
              <div className="text-sm text-orange-800">Automáticas</div>
            </motion.div>
            
            <motion.div className="bg-yellow-100 p-4 rounded-lg text-center border-2 border-yellow-200" whileHover={{ scale: 1.05 }}>
              <div className="text-2xl font-bold text-yellow-600">{detailedStats.pendingFeedings}</div>
              <div className="text-sm text-yellow-800">Programadas</div>
            </motion.div>
            
            <motion.div className="bg-emerald-100 p-4 rounded-lg text-center border-2 border-emerald-200" whileHover={{ scale: 1.05 }}>
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
            <motion.div className="flex gap-4 mb-4">
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

            {/* Filtros */}
            <motion.div key={filterType}>
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
            
            {/* Botones */}
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button
                onClick={testFirebaseConnection}
                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔗 Probar Conexión
              </motion.button>
              
              <motion.button
                onClick={fetchData}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Consultar Datos
              </motion.button>

              <motion.button
                onClick={generateTestData}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Generar Datos de Prueba
              </motion.button>
              
              <motion.button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className={`text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300 ${
                  isGeneratingPDF ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-700'
                }`}
                whileHover={!isGeneratingPDF ? { scale: 1.05 } : {}}
                whileTap={!isGeneratingPDF ? { scale: 0.95 } : {}}
              >
                {isGeneratingPDF ? 'Generando PDF...' : 'Descargar PDF'}
              </motion.button>
            </div>
          </motion.div>
        </motion.section>
      </main>

      <footer className="bg-purple-200 p-4 mt-8 shadow-md text-center text-gray-800 text-sm">
        <span>SISTEMA FIDO TODOS LOS DERECHOS RESERVADOS 2025</span>
      </footer>
    </motion.div>
  );
}
