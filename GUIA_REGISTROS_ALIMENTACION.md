# Guía de Registros de Alimentación de Mascotas

## ✨ Nueva Funcionalidad Integrada

La aplicación ahora puede leer y mostrar datos de la colección **`feedingRecords`** de Firebase, mostrando información detallada sobre la alimentación de mascotas.

## 📊 Campos que se Procesan

Los registros de alimentación contienen los siguientes campos:

- **`amount`** (número): Cantidad de comida
- **`amountUnit`** (cadena): Unidad de medida ("grams", "kg", "pounds")
- **`createdAt`** (cadena): Fecha de creación del registro
- **`feedingTimeId`** (nulo): ID del horario de alimentación
- **`petId`** (cadena): ID de la mascota
- **`source`** (cadena): Origen ("dispenser" o "manual")
- **`status`** (cadena): Estado ("pending", "completed")
- **`timestamp`** (cadena): Timestamp ISO de la alimentación
- **`type`** (cadena): Tipo de alimentación ("manual", "automatic")
- **`userId`** (cadena): ID del usuario

## 🔄 Conversiones Automáticas

La aplicación convierte automáticamente diferentes unidades de medida a gramos:
- **grams**: Sin conversión
- **kg**: Se multiplica por 1000
- **pounds**: Se multiplica por 453.592

## 📈 Características de las Gráficas

### Visualización de Datos
- **Gráfico de Barras**: Muestra la cantidad diaria de comida servida
- **Gráfico de Líneas**: Tendencia de alimentación a lo largo del tiempo
- **Gráfico de Pastel**: Distribución por días/fechas

### Filtros Disponibles
1. **Por Semana**: Selecciona una semana específica usando el selector de semanas
2. **Por Rango de Fechas**: Define fechas de inicio y fin personalizadas

### Estadísticas Detalladas
La aplicación ahora muestra 6 métricas clave:
- **Total Alimentaciones**: Número total de registros
- **Promedio por Comida**: Cantidad promedio en gramos
- **Alimentación Manual**: Registros de tipo "manual"
- **Dispensador**: Registros con source "dispenser"
- **Pendientes**: Registros con status "pending"
- **Completadas**: Registros con status "completed"

## 🚀 Cómo Usar

1. **Acceder a Estadísticas**: Desde el Dashboard, haz clic en "Ver Estadísticas"

2. **Seleccionar Filtro**:
   - Elige "Por Semana" para ver datos semanales
   - Elige "Por Rango de Fechas" para períodos personalizados

3. **Consultar Datos**: Haz clic en "Consultar Datos" para cargar información de Firebase

4. **Visualizar Resultados**:
   - Ve las estadísticas detalladas en tarjetas coloridas
   - Explora diferentes tipos de gráficas (Barras, Líneas, Pastel)
   - Descarga un reporte PDF completo

5. **Generar Reporte PDF**: El PDF incluye:
   - Datos tabulados por fecha
   - Resumen estadístico
   - Detalles de alimentación completos

## 🧪 Datos de Prueba

Para probar la funcionalidad sin datos reales:
1. Haz clic en "Generar Datos de Alimentación de Prueba"
2. Se crearán datos simulados para la semana actual
3. Podrás ver todas las funcionalidades en acción

## 🔧 Configuración Técnica

### Base de Datos
- **Colección**: `feedingRecords`
- **Consultas**: Filtradas por campo `timestamp`
- **Ordenamiento**: Por `timestamp` ascendente

### Rendimiento
- Las consultas están optimizadas con índices en `timestamp`
- Los datos se procesan localmente para mejorar la experiencia

## 📝 Notas Importantes

- Los datos se consultan en tiempo real desde Firebase
- Las conversiones de unidades se realizan automáticamente
- El PDF se genera completamente en el cliente (sin servidor)
- Todas las gráficas son responsivas y animadas

## 🎯 Casos de Uso

### Para Dueños de Mascotas:
- Monitorear patrones de alimentación
- Verificar cantidad de comida diaria
- Identificar tendencias semanales

### Para Veterinarios:
- Analizar historial de alimentación
- Generar reportes para consultas
- Evaluar cumplimiento de dietas

### Para Cuidadores:
- Verificar alimentaciones completadas
- Revisar alimentaciones pendientes
- Controlar dispensador vs. manual

---

**Sistema FIDO** - Gestión inteligente de alimentación de mascotas 🐕🐱
