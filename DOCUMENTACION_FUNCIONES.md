# 📚 Documentación de Funciones - Sistema FIDO

## 🎯 Componentes Principales

### 1. Estadisticas.jsx - Funciones Principales

#### 🔍 Funciones de Diagnóstico

##### `testFirebaseConnection()`
```javascript
/**
 * Prueba la conectividad con Firebase y muestra información de debug
 * @async
 * @returns {Promise<void>}
 */
```

**Funcionalidades:**
- ✅ Verifica conexión con Firestore
- 📊 Muestra total de documentos en `feedingRecords`
- 🔍 Ejecuta consulta filtrada de prueba
- ⚠️ Maneja errores de permisos e índices
- 📝 Logging detallado en consola

**Casos de uso:**
- Debugging de problemas de conexión
- Verificación de permisos de Firestore
- Validación de estructura de datos

---

#### 📊 Funciones de Consulta de Datos

##### `fetchData()`
```javascript
/**
 * Función principal para obtener y procesar datos de Firestore
 * @async
 * @returns {Promise<void>}
 */
```

**Flujo de trabajo:**
1. **Validación** - Verifica filtros seleccionados
2. **Consulta** - Obtiene datos según tipo de filtro
3. **Procesamiento** - Agrupa y convierte datos
4. **Estadísticas** - Calcula métricas detalladas
5. **Actualización** - Actualiza estados del componente

**Tipos de consulta:**
- `week`: Agrupa datos día a día (Lunes-Domingo)
- `dateRange`: Agrupa datos por rango de fechas

**Estados actualizados:**
- `chartData`: Datos formateados para gráficas
- `detailedStats`: Estadísticas calculadas

---

##### `convertToGrams(amount, unit)`
```javascript
/**
 * Convierte diferentes unidades de peso a gramos
 * @param {number} amount - Cantidad a convertir
 * @param {string} unit - Unidad original
 * @returns {number} Cantidad en gramos
 */
```

**Unidades soportadas:**
- `gramos` - Sin conversión (valor por defecto)
- `kg` - Multiplica por 1000
- `libras` / `pounds` - Multiplica por 453.592

**Ejemplos:**
```javascript
convertToGrams(1, 'kg')      // → 1000
convertToGrams(2, 'libras')  // → 907.184
convertToGrams(500, 'gramos') // → 500
```

---

##### `calculateDetailedStats(feedings)`
```javascript
/**
 * Calcula estadísticas detalladas de los registros
 * @param {Array} feedings - Array de objetos de alimentación
 * @returns {Object} Estadísticas calculadas
 */
```

**Métricas calculadas:**
- `totalFeedings` - Total de registros
- `averageAmount` - Promedio de cantidad (en gramos)
- `automaticFeedings` - Alimentaciones automáticas (`type: 'automatic'`)
- `dispenserFeedings` - Alimentaciones por dispensador (`source: 'dispenser'`)
- `scheduledFeedings` - Alimentaciones programadas (`type: 'scheduled'`)
- `completedFeedings` - Alimentaciones completadas (`status: 'completed'`)

---

#### 📁 Funciones de Exportación

##### `handleDownloadPDF()`
```javascript
/**
 * Genera y descarga un reporte PDF con los datos
 * @async
 * @returns {Promise<void>}
 */
```

**Características del PDF:**
- 📋 Header profesional con branding
- 📅 Información del período consultado
- 📊 Tabla de datos formateada
- 🎨 Colores y diseño consistente
- 📝 Metadatos y fecha de generación

**Elementos incluidos:**
```
┌─────────────────────────────────────┐
│  🐾 Sistema FIDO - Reporte          │
│  📊 Registros de Alimentación       │
│  📅 Período: [fecha seleccionada]   │
├─────────────────────────────────────┤
│  📋 Tabla de Datos                  │
│  - Día/Fecha                        │
│  - Cantidad (gramos)                │
│  - Número de alimentaciones         │
├─────────────────────────────────────┤
│  📊 Estadísticas Resumidas          │
│  - Total alimentaciones             │
│  - Promedio por día                 │
│  - Distribución por tipo            │
└─────────────────────────────────────┘
```

---

#### 🧪 Funciones de Testing

##### `generateTestData()`
```javascript
/**
 * Genera datos de prueba para testing del sistema
 * @returns {void}
 */
```

**Datos generados:**
- 📊 Valores simulados para 7 días
- 📈 Estadísticas de ejemplo calculadas
- 🎲 Números aleatorios realistas
- ⚡ Actualización inmediata del estado

**Estructura de datos de prueba:**
```javascript
{
  labels: ["Lunes", "Martes", ..., "Domingo"],
  values: [450, 320, 580, 210, 390, 670, 520],
  detailedStats: {
    totalFeedings: 25,
    averageAmount: 456,
    automaticFeedings: 18,
    dispenserFeedings: 15,
    scheduledFeedings: 20,
    completedFeedings: 23
  }
}
```

---

### 2. Charts.jsx - Componente de Gráficas

#### 📈 Tipos de Gráficas Disponibles

##### Gráfica de Barras
```javascript
{
  type: 'bar',
  data: {
    labels: ['Lun', 'Mar', 'Mié', ...],
    datasets: [{
      label: 'Cantidad de Comida (gramos)',
      data: chartData.values,
      backgroundColor: 'rgba(139, 69, 19, 0.8)'
    }]
  }
}
```

##### Gráfica de Líneas
```javascript
{
  type: 'line',
  data: {
    datasets: [{
      label: 'Tendencia de Alimentación',
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.4
    }]
  }
}
```

##### Gráfica de Pastel
```javascript
{
  type: 'pie',
  data: {
    datasets: [{
      data: chartData.values,
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56',
        '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384'
      ]
    }]
  }
}
```

##### Gráfica de Área
```javascript
{
  type: 'line',
  data: {
    datasets: [{
      fill: true,
      backgroundColor: 'rgba(255, 99, 132, 0.3)',
      borderColor: 'rgba(255, 99, 132, 1)'
    }]
  }
}
```

---

### 3. DataSummary.jsx - Resumen Estadístico

#### 📊 Métricas Mostradas

##### Cálculos Automáticos
```javascript
const valores = chartData.values.filter(val => val > 0);
const total = valores.reduce((sum, val) => sum + val, 0);
const promedio = valores.length > 0 ? total / valores.length : 0;
const maximo = valores.length > 0 ? Math.max(...valores) : 0;
const minimo = valores.length > 0 ? Math.min(...valores) : 0;
```

##### Obtención del Último Registro
```javascript
const q = query(
  collection(db, 'graficas'),
  orderBy('fecha', 'desc'),
  limit(1)
);
```

---

### 4. Dashboard.jsx - Panel Principal

#### 🔐 Verificación de Roles

##### `verificarRol()`
```javascript
/**
 * Verifica el rol del usuario en Firestore
 * @async
 * @returns {Promise<void>}
 */
```

**Flujo de autenticación:**
1. **Verificación de sesión** - Confirma usuario autenticado
2. **Consulta de rol** - Busca en colección `usuarios`
3. **Validación de permisos** - Verifica rol autorizado
4. **Redirección** - Redirige según resultado

**Roles soportados:**
- `admin` - Acceso completo al sistema
- `consulta` - Solo lectura de datos

---

### 5. RegistroAlimento.jsx - Registro de Alimentación

#### 📝 Validaciones del Formulario

##### `handleSubmit(e)`
```javascript
/**
 * Procesa y guarda un nuevo registro de alimentación
 * @param {Event} e - Evento del formulario
 * @async
 * @returns {Promise<void>}
 */
```

**Validaciones aplicadas:**
- ✅ Cantidad > 0
- ✅ Campos obligatorios completos
- ✅ Formato de fecha válido
- ✅ Unidad de medida válida

**Estructura del documento guardado:**
```javascript
{
  amount: parseFloat(formData.cantidad),
  amountUnit: formData.unidad,
  timestamp: new Date().toISOString(),
  status: 'completed',
  type: 'manual',
  source: 'app',
  petId: formData.mascota || 'default',
  userId: currentUser.uid,
  notes: formData.notas || ''
}
```

---

## 🛠️ Utilidades Globales

### Manejo de Fechas

#### `getDatesOfWeek(weekString)`
```javascript
/**
 * Calcula las fechas de una semana específica
 * @param {string} weekString - Formato "YYYY-Www"
 * @returns {string[]} Array de fechas ISO
 */
```

**Algoritmo:**
1. Parsea año y número de semana
2. Calcula primer día del año
3. Determina offset para la semana
4. Genera array de 7 fechas consecutivas

---

### Animaciones con Framer Motion

#### Configuraciones Estándar

##### Animaciones de Entrada
```javascript
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};
```

##### Efectos Hover
```javascript
const hoverScale = {
  whileHover: { 
    scale: 1.05, 
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)" 
  },
  whileTap: { scale: 0.95 }
};
```

##### Stagger Animations
```javascript
const staggerContainer = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

---

## 🔧 APIs y Integraciones

### Firebase Firestore

#### Configuración de Consultas

##### Consulta Básica
```javascript
const q = query(collection(db, 'feedingRecords'));
const snapshot = await getDocs(q);
```

##### Consulta con Filtros
```javascript
const q = query(
  collection(db, 'feedingRecords'),
  where('timestamp', '>=', startDate),
  where('timestamp', '<=', endDate),
  orderBy('timestamp', 'desc')
);
```

##### Consulta con Límite
```javascript
const q = query(
  collection(db, 'feedingRecords'),
  orderBy('timestamp', 'desc'),
  limit(10)
);
```

#### Manejo de Errores Comunes

| Código de Error | Descripción | Solución |
|-----------------|-------------|----------|
| `permission-denied` | Sin permisos para acceder | Revisar reglas de Firestore |
| `failed-precondition` | Índice requerido | Crear índice compuesto |
| `not-found` | Colección no existe | Verificar nombre de colección |
| `quota-exceeded` | Límite de consultas | Implementar paginación |

---

### Chart.js Configuración

#### Opciones Responsivas
```javascript
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Alimentación de Mascotas'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Cantidad (gramos)'
      }
    }
  }
};
```

---

## 🚀 Performance y Optimización

### Mejores Prácticas

#### 1. Lazy Loading de Componentes
```javascript
const Charts = React.lazy(() => import('./Charts'));
const DataSummary = React.lazy(() => import('./DataSummary'));
```

#### 2. Memoización de Cálculos
```javascript
const memoizedStats = useMemo(() => 
  calculateDetailedStats(feedingRecords), 
  [feedingRecords]
);
```

#### 3. Debounce en Búsquedas
```javascript
const debouncedSearch = useDebounce(searchTerm, 300);
```

#### 4. Paginación en Consultas
```javascript
const pageSize = 25;
const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
const next = query(
  collection(db, 'feedingRecords'),
  orderBy('timestamp'),
  startAfter(lastVisible),
  limit(pageSize)
);
```

---

## 🐛 Debugging y Troubleshooting

### Funciones de Debug

#### Logging Detallado
```javascript
const debugLog = (context, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🐛 [${context}]:`, data);
  }
};
```

#### Test de Conectividad
```javascript
const healthCheck = async () => {
  try {
    const testRef = doc(db, 'test', 'connection');
    await setDoc(testRef, { timestamp: new Date() });
    console.log('✅ Firebase conectado correctamente');
    await deleteDoc(testRef);
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
};
```

### Problemas Comunes y Soluciones

| Problema | Síntomas | Solución |
|----------|----------|----------|
| No se muestran datos | Gráficas vacías | 1. Verificar reglas Firestore<br>2. Comprobar autenticación<br>3. Validar estructura de datos |
| Error de permisos | `permission-denied` | 1. Revisar rol del usuario<br>2. Actualizar reglas Firestore<br>3. Verificar autenticación |
| Gráficas no cargan | Errores de Chart.js | 1. Validar formato de datos<br>2. Comprobar dependencias<br>3. Revisar configuración |
| PDF no genera | Error de jsPDF | 1. Verificar datos disponibles<br>2. Comprobar permisos navegador<br>3. Validar configuración |

---

**Sistema FIDO - Documentación Técnica**
*Desarrollado con ❤️ para el cuidado de nuestras mascotas*
