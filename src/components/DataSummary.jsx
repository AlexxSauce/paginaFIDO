/**
 * @fileoverview Componente de resumen estadístico del Sistema FIDO
 * 
 * Este componente muestra un resumen visual de las estadísticas
 * calculadas a partir de los datos de alimentación de mascotas.
 * 
 * Métricas mostradas:
 * - Total: Suma total de alimentación en gramos
 * - Promedio: Cantidad promedio por registro
 * - Máximo: Mayor cantidad registrada
 * - Mínimo: Menor cantidad registrada
 * - Último Registro: Fecha del registro más reciente
 * 
 * @author Sistema FIDO
 * @version 1.0.0
 * @since 2025
 */

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { motion } from 'framer-motion';

/**
 * Componente de resumen estadístico para datos de alimentación
 * 
 * @component
 * @param {Object} props - Props del componente
 * @param {Object} props.chartData - Datos procesados para mostrar estadísticas
 * @param {string[]} props.chartData.labels - Etiquetas de los datos
 * @param {number[]} props.chartData.values - Valores numéricos para calcular estadísticas
 * @returns {JSX.Element} Tarjeta con resumen estadístico animado
 */
export default function DataSummary({ chartData }) {
  // ==================== ESTADO ====================
  
  /**
   * Estado para almacenar las estadísticas calculadas
   * @type {Object}
   */
  const [totalData, setTotalData] = useState({
    total: 0,         // Suma total en gramos
    promedio: 0,      // Promedio por registro
    maximo: 0,        // Valor máximo registrado
    minimo: 0,        // Valor mínimo registrado
    ultimoRegistro: null  // Fecha del último registro
  });

  // ==================== EFECTOS ====================
  
  /**
   * Efecto para calcular estadísticas basadas en chartData
   * Se ejecuta cada vez que chartData cambia
   */
  useEffect(() => {
    if (chartData.values && chartData.values.length > 0) {
      const valores = chartData.values.filter(val => val > 0);
      const total = valores.reduce((sum, val) => sum + val, 0);
      const promedio = valores.length > 0 ? total / valores.length : 0;
      const maximo = valores.length > 0 ? Math.max(...valores) : 0;
      const minimo = valores.length > 0 ? Math.min(...valores) : 0;

      setTotalData({
        total,
        promedio: Math.round(promedio * 100) / 100,
        maximo,
        minimo,
        ultimoRegistro: null
      });
    }
  }, [chartData]);

  /**
   * Efecto para obtener el último registro de la base de datos
   * Se ejecuta una sola vez al montar el componente
   */
  useEffect(() => {
    /**
     * Obtiene el registro más reciente de la colección graficas
     * @async
     * @function fetchLastRecord
     */
    const fetchLastRecord = async () => {
      try {
        const q = query(
          collection(db, 'graficas'),
          orderBy('fecha', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const lastDoc = snapshot.docs[0].data();
          setTotalData(prev => ({
            ...prev,
            ultimoRegistro: lastDoc
          }));
        }
      } catch (error) {
        console.error('Error al obtener último registro:', error);
      }
    };

    fetchLastRecord();
  }, []);

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md p-6 mb-6"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h3 
        className="text-lg font-semibold mb-4 text-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Resumen de Datos
      </motion.h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div 
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.div 
            className="text-2xl font-bold text-blue-600"
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          >
            {totalData.total}g
          </motion.div>
          <div className="text-sm text-gray-500">Total</div>
        </motion.div>
        
        <motion.div 
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.div 
            className="text-2xl font-bold text-green-600"
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            {totalData.promedio}g
          </motion.div>
          <div className="text-sm text-gray-500">Promedio</div>
        </motion.div>
        
        <motion.div 
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.div 
            className="text-2xl font-bold text-red-600"
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
          >
            {totalData.maximo}g
          </motion.div>
          <div className="text-sm text-gray-500">Máximo</div>
        </motion.div>
        
        <motion.div 
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.div 
            className="text-2xl font-bold text-yellow-600"
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
          >
            {totalData.minimo}g
          </motion.div>
          <div className="text-sm text-gray-500">Mínimo</div>
        </motion.div>
        
        <motion.div 
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.div 
            className="text-sm font-bold text-purple-600"
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
          >
            {totalData.ultimoRegistro ? totalData.ultimoRegistro.fecha : 'N/A'}
          </motion.div>
          <div className="text-sm text-gray-500">Último Registro</div>
        </motion.div>
      </div>
    </motion.div>
  );
}
