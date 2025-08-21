# 🐾 Sistema FIDO - Alimentación de Mascotas

## 📖 Descripción General

FIDO es un sistema integral para el monitoreo y gestión de la alimentación de mascotas. Permite registrar, visualizar y analizar datos de alimentación a través de gráficas interactivas y estadísticas detalladas.

## 🏗️ Arquitectura del Proyecto

### Stack Tecnológico
- **Frontend**: React 19.1.0 + Vite
- **Estilos**: Tailwind CSS 4.1.11
- **Animaciones**: Framer Motion 12.23.12
- **Base de Datos**: Firebase Firestore
- **Autenticación**: Firebase Authentication
- **Gráficas**: Chart.js + React-Chart.js-2
- **Routing**: React Router DOM
- **Exportación PDF**: jsPDF + html2canvas

### Estructura de Directorios

```
src/
├── App.jsx                 # Componente principal y routing
├── main.jsx               # Punto de entrada de la aplicación
├── index.css              # Estilos globales
├── firebase.js            # Configuración de Firebase
├── components/
│   ├── Login.jsx          # Autenticación de usuarios
│   ├── register.jsx       # Registro de usuarios (admin)
│   ├── UserRegister.jsx   # Interfaz de registro
│   ├── Dashboard.jsx      # Panel principal
│   ├── RegistroAlimento.jsx # Formulario registro alimentación
│   ├── Estadisticas.jsx   # Vista principal de estadísticas
│   ├── Charts.jsx         # Componente de gráficas
│   ├── DataSummary.jsx    # Resumen estadístico
│   ├── DateRangePicker.jsx # Selector de fechas
│   └── WeekPicker.jsx     # Selector de semanas
└── assets/
    └── images/
        └── logo.js        # Logo del sistema
```

## 🔧 Configuración del Proyecto

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

### Variables de Entorno

El proyecto utiliza Firebase con la siguiente configuración (archivo `firebase.js`):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDNMdSNB-Ipa5yZC2MBiMQMhJRJXD5-tco",
  authDomain: "fido-37f41.firebaseapp.com",
  projectId: "fido-37f41",
  storageBucket: "fido-37f41.firebasestorage.app",
  messagingSenderId: "237495518878",
  appId: "1:237495518878:web:7c6b758e4aa3e1f6cf1d8f",
  measurementId: "G-5F8GXR8404"
};
```

## 📊 Base de Datos - Firestore

### Colecciones Principales

#### `usuarios`
```javascript
{
  uid: string,           // ID único del usuario
  email: string,         // Correo electrónico
  rol: string,          // 'admin' | 'consulta'
  fechaCreacion: timestamp
}
```

#### `feedingRecords` (Registros de Alimentación)
```javascript
{
  amount: number,        // Cantidad de comida
  amountUnit: string,    // 'gramos' | 'kg' | 'libras'
  timestamp: timestamp,  // Fecha y hora del registro
  status: string,        // 'completed' | 'pending' | 'cancelled'
  type: string,         // 'manual' | 'automatic' | 'scheduled'
  source: string,       // 'manual' | 'dispenser' | 'app'
  petId: string,        // ID de la mascota
  userId: string        // ID del usuario que registra
}
```

#### `pets` (Mascotas)
```javascript
{
  name: string,         // Nombre de la mascota
  species: string,      // 'perro' | 'gato' | 'otro'
  weight: number,       // Peso en kg
  userId: string,       // ID del propietario
  feedingTimes: [],     // Horarios de alimentación
  portions: []          // Porciones recomendadas
}
```

## 🎯 Componentes Principales

### 1. App.jsx
**Función**: Componente raíz que maneja el routing de la aplicación.

**Características**:
- Define las rutas principales del sistema
- Implementa navegación protegida
- Redirige automáticamente a `/login`

**Rutas disponibles**:
- `/` → Redirige a `/login`
- `/login` → Pantalla de autenticación
- `/dashboard` → Panel principal (requiere autenticación)
- `/register` → Registro de usuarios (solo admin)
- `/registro-alimento` → Formulario de registro de alimentación
- `/estadisticas` → Vista de gráficas y estadísticas

### 2. Login.jsx
**Función**: Maneja la autenticación de usuarios en Firebase Auth.

**Funciones principales**:
- `handleLogin()`: Autentica usuario con email/password
- Validación de credenciales
- Redirección automática al dashboard
- Manejo de errores de autenticación

**Estados**:
- `email`: Correo electrónico del usuario
- `password`: Contraseña del usuario
- `error`: Mensajes de error

### 3. Dashboard.jsx
**Función**: Panel principal del sistema con verificación de roles.

**Funciones principales**:
- `verificarRol()`: Verifica el rol del usuario en Firestore
- `handleLogout()`: Cierra sesión del usuario
- Control de acceso basado en roles (admin/consulta)

**Estados**:
- `rol`: Rol del usuario actual ('admin' | 'consulta')

**Características**:
- Verificación automática de permisos
- Navegación a diferentes módulos
- Animaciones con Framer Motion
- Logout seguro

### 4. RegistroAlimento.jsx
**Función**: Formulario para registrar nuevos datos de alimentación.

**Funciones principales**:
- `handleSubmit()`: Guarda registro en Firestore
- `resetForm()`: Limpia el formulario
- Validación de datos de entrada

**Estados**:
- `formData`: Datos del formulario
  - `cantidad`: Cantidad de comida
  - `unidad`: Unidad de medida
  - `mascota`: ID de la mascota
  - `tipo`: Tipo de alimentación
  - `notas`: Observaciones adicionales

**Validaciones**:
- Cantidad > 0
- Campos obligatorios
- Formato de fecha válido

### 5. Estadisticas.jsx
**Función**: Vista principal de análisis con gráficas y estadísticas.

**Funciones principales**:

#### Consulta de Datos
- `fetchData()`: Obtiene registros de Firestore
- `filterDataByDateRange()`: Filtra por rango de fechas
- `filterDataByWeek()`: Filtra por semana específica
- `testFirebaseConnection()`: Prueba conectividad con Firebase

#### Procesamiento de Datos
- `convertToGrams()`: Convierte unidades a gramos
- `processDataForChart()`: Prepara datos para gráficas
- `calculateDetailedStats()`: Calcula estadísticas detalladas

#### Utilidades
- `generateTestData()`: Genera datos de prueba
- `exportToPDF()`: Exporta gráficas a PDF

**Estados principales**:
- `chartData`: Datos procesados para gráficas
- `filterType`: Tipo de filtro ('week' | 'dateRange')
- `selectedWeek`: Semana seleccionada
- `startDate`/`endDate`: Rango de fechas
- `detailedStats`: Estadísticas calculadas

**Estadísticas calculadas**:
- Total de alimentaciones
- Promedio de cantidad por comida
- Alimentaciones manuales vs automáticas
- Alimentaciones completadas vs pendientes
- Alimentaciones por dispensador
- Cantidad total de comida

### 6. Charts.jsx
**Función**: Renderiza gráficas interactivas usando Chart.js.

**Tipos de gráficas**:
- **Barras**: Cantidad por día/período
- **Líneas**: Tendencia temporal
- **Pastel**: Distribución por tipo
- **Área**: Acumulado temporal

**Funciones principales**:
- `renderChart()`: Renderiza gráfica según tipo seleccionado
- Configuración responsiva
- Tooltips personalizados
- Animaciones suaves

**Estados**:
- `chartType`: Tipo de gráfica actual
- `chartData`: Datos recibidos del componente padre

**Configuraciones de Chart.js**:
- Responsive: true
- Plugins personalizados
- Escalas configurables
- Colores temáticos

### 7. DataSummary.jsx
**Función**: Muestra resumen estadístico de los datos.

**Métricas mostradas**:
- **Total**: Suma total de alimentación
- **Promedio**: Cantidad promedio por registro
- **Máximo**: Mayor cantidad registrada
- **Mínimo**: Menor cantidad registrada
- **Último Registro**: Fecha del último registro

**Funciones**:
- `fetchLastRecord()`: Obtiene último registro de Firestore
- Cálculos automáticos basados en `chartData`
- Animaciones de entrada con Framer Motion

### 8. DateRangePicker.jsx
**Función**: Selector de rango de fechas personalizado.

**Características**:
- Fecha inicio y fin
- Validación de rangos válidos
- Integración con el sistema de filtros
- Diseño responsivo

### 9. WeekPicker.jsx
**Función**: Selector de semanas para análisis semanal.

**Características**:
- Navegación por semanas
- Cálculo automático de inicio/fin de semana
- Integración con filtros temporales

## 🔐 Sistema de Autenticación y Roles

### Flujo de Autenticación

1. **Login**: Usuario ingresa email/password
2. **Verificación Firebase Auth**: Valida credenciales
3. **Consulta de Rol**: Busca rol en colección `usuarios`
4. **Autorización**: Permite/deniega acceso según rol
5. **Sesión**: Mantiene estado de autenticación

### Roles del Sistema

#### Admin
- Acceso completo al sistema
- Puede registrar nuevos usuarios
- Puede crear/editar/eliminar registros
- Acceso a todas las estadísticas

#### Consulta
- Solo lectura de datos
- Acceso a estadísticas y gráficas
- No puede modificar registros
- No puede registrar usuarios

## 📈 Sistema de Gráficas

### Tipos de Visualización

1. **Gráfica de Barras**
   - Muestra cantidad por período
   - Ideal para comparaciones diarias/semanales
   - Colores diferenciados por tipo

2. **Gráfica de Líneas**
   - Tendencia temporal
   - Útil para identificar patrones
   - Suavizado de curvas

3. **Gráfica de Pastel**
   - Distribución por categorías
   - Porcentajes automáticos
   - Colores temáticos

4. **Gráfica de Área**
   - Acumulado temporal
   - Visualización de volumen total
   - Gradientes de color

### Filtros Temporales

#### Por Semana
- Selector de semana específica
- Cálculo automático lunes-domingo
- Navegación anterior/siguiente

#### Por Rango de Fechas
- Fecha inicio y fin personalizables
- Validación de rangos válidos
- Máximo 90 días de rango

## 🎨 Sistema de Animaciones

### Framer Motion - Configuraciones

#### Animaciones de Entrada
```javascript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}
```

#### Hover Effects
```javascript
whileHover={{ scale: 1.05, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
whileTap={{ scale: 0.95 }}
```

#### Stagger Animations
```javascript
variants={{
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
}}
```

## 🔧 Funcionalidades Avanzadas

### Conversión de Unidades
```javascript
const convertToGrams = (amount, unit) => {
  switch (unit) {
    case 'kg': return amount * 1000;
    case 'libras': return amount * 453.592;
    default: return amount; // gramos
  }
};
```

### Exportación a PDF
- Utiliza html2canvas para capturar gráficas
- jsPDF para generar documento
- Incluye metadatos y fecha de generación
- Formato optimizado para impresión

### Diagnóstico y Debug
- Funciones de test de conectividad Firebase
- Logging detallado en consola
- Alertas informativas para usuarios
- Manejo de errores robusto

## 🚀 Deployment y Producción

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor local en http://localhost:5173

# Producción
npm run build        # Construye para producción
npm run preview      # Vista previa de build

# Calidad de Código
npm run lint         # Ejecuta ESLint
```

### Optimizaciones

1. **Bundle Splitting**: Vite automáticamente divide el código
2. **Lazy Loading**: Componentes cargados bajo demanda
3. **Tree Shaking**: Eliminación de código no utilizado
4. **Minificación**: CSS y JS optimizados
5. **Compresión**: Assets comprimidos

## 🔒 Seguridad

### Firestore Rules
Las reglas de seguridad están configuradas para:
- Usuarios solo pueden acceder a sus datos
- Verificación de autenticación en todas las operaciones
- Roles validados en servidor
- Prevención de acceso no autorizado

### Validaciones
- Input sanitization en formularios
- Validación de tipos de datos
- Límites en consultas de base de datos
- Rate limiting en operaciones críticas

## 🐛 Debugging y Troubleshooting

### Funciones de Diagnóstico

#### Test de Conexión Firebase
```javascript
const testFirebaseConnection = async () => {
  try {
    const testQuery = query(collection(db, 'feedingRecords'));
    const testSnapshot = await getDocs(testQuery);
    console.log('📊 Conexión exitosa:', testSnapshot.size);
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
};
```

#### Logging Detallado
- Estados de componentes en tiempo real
- Errores de Firestore con contexto
- Métricas de performance
- Flujo de datos documentado

### Problemas Comunes

1. **No se muestran datos**: Verificar reglas de Firestore
2. **Error de permisos**: Confirmar rol del usuario
3. **Gráficas vacías**: Validar estructura de datos
4. **Fallos de autenticación**: Revisar configuración Firebase

## 📚 Guías de Uso

### Para Administradores
1. Configurar usuarios en Firebase Auth
2. Asignar roles en colección `usuarios`
3. Configurar reglas de Firestore
4. Monitorear registros de alimentación

### Para Usuarios Finales
1. Iniciar sesión con credenciales
2. Registrar alimentaciones diarias
3. Consultar estadísticas y gráficas
4. Exportar reportes en PDF

## 🔄 Actualizaciones y Mantenimiento

### Versionado
- Semantic Versioning (SemVer)
- Changelog documentado
- Migrations de base de datos cuando necesario

### Backup y Recuperación
- Backups automáticos de Firestore
- Exportación de datos en formato JSON
- Procedimientos de recuperación documentados

## 📧 Soporte y Contacto

Para soporte técnico o consultas sobre el sistema:
- Email: [soporte@fido.com](mailto:soporte@fido.com)
- Documentación: Este README.md
- Issues: GitHub Issues para reportar bugs

---

**Sistema FIDO - Todos los derechos reservados 2025**

*Desarrollado con ❤️ para el cuidado de nuestras mascotas*+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
