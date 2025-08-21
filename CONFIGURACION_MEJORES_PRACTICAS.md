# ⚙️ Configuración y Mejores Prácticas - Sistema FIDO

## 🛠️ Configuración del Entorno

### Variables de Entorno Recomendadas

Crear archivo `.env.local` en la raíz del proyecto:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyDNMdSNB-Ipa5yZC2MBiMQMhJRJXD5-tco
VITE_FIREBASE_AUTH_DOMAIN=fido-37f41.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fido-37f41
VITE_FIREBASE_STORAGE_BUCKET=fido-37f41.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=237495518878
VITE_FIREBASE_APP_ID=1:237495518878:web:7c6b758e4aa3e1f6cf1d8f
VITE_FIREBASE_MEASUREMENT_ID=G-5F8GXR8404

# Development Settings
VITE_NODE_ENV=development
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

### Configuración de Firebase Actualizada

```javascript
// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

## 📋 Mejores Prácticas de Desarrollo

### 1. Estructura de Componentes

#### Organización Recomendada
```
src/
├── components/
│   ├── common/           # Componentes reutilizables
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   └── LoadingSpinner.jsx
│   ├── forms/           # Formularios específicos
│   │   ├── LoginForm.jsx
│   │   └── FeedingForm.jsx
│   ├── charts/          # Componentes de visualización
│   │   ├── Charts.jsx
│   │   ├── DataSummary.jsx
│   │   └── StatCard.jsx
│   └── layout/          # Componentes de layout
│       ├── Header.jsx
│       ├── Footer.jsx
│       └── Sidebar.jsx
├── hooks/               # Custom hooks
│   ├── useAuth.js
│   ├── useFirestore.js
│   └── useDebounce.js
├── utils/              # Funciones utilitarias
│   ├── dateHelpers.js
│   ├── formatters.js
│   └── validators.js
├── config/             # Configuraciones
│   ├── firebase.js
│   ├── constants.js
│   └── theme.js
└── services/           # Servicios API
    ├── authService.js
    ├── firestoreService.js
    └── pdfService.js
```

### 2. Custom Hooks Recomendados

#### useAuth Hook
```javascript
// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
};
```

#### useFirestore Hook
```javascript
// src/hooks/useFirestore.js
import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useFirestore = (collectionName, queryConstraints = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, collectionName), ...queryConstraints);
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(results);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, queryConstraints]);

  return { data, loading, error };
};
```

### 3. Servicios Organizados

#### Servicio de Autenticación
```javascript
// src/services/authService.js
import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const authService = {
  login: async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  register: async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
```

#### Servicio de Firestore
```javascript
// src/services/firestoreService.js
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const firestoreService = {
  // Crear documento
  create: async (collectionName, data) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obtener todos los documentos
  getAll: async (collectionName, queryConstraints = []) => {
    try {
      const q = query(collection(db, collectionName), ...queryConstraints);
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obtener documento por ID
  getById: async (collectionName, id) => {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { 
          success: true, 
          data: { id: docSnap.id, ...docSnap.data() } 
        };
      } else {
        return { success: false, error: 'Documento no encontrado' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Actualizar documento
  update: async (collectionName, id, data) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Eliminar documento
  delete: async (collectionName, id) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
```

### 4. Utilidades y Helpers

#### Helpers de Fecha
```javascript
// src/utils/dateHelpers.js

/**
 * Formatea una fecha para mostrar en español
 */
export const formatDateES = (date) => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};

/**
 * Obtiene el inicio y fin de una semana
 */
export const getWeekRange = (weekString) => {
  const [year, week] = weekString.split('-W').map(Number);
  const firstDayOfYear = new Date(year, 0, 1);
  const daysOffset = ((week - 1) * 7) + (firstDayOfYear.getDay() <= 4 ? 1 - firstDayOfYear.getDay() : 8 - firstDayOfYear.getDay());
  
  const startDate = new Date(year, 0, 1 + daysOffset);
  const endDate = new Date(year, 0, 1 + daysOffset + 6);
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
};

/**
 * Valida si una fecha está en formato válido
 */
export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};
```

#### Formateadores
```javascript
// src/utils/formatters.js

/**
 * Formatea números con separadores de miles
 */
export const formatNumber = (number) => {
  return new Intl.NumberFormat('es-ES').format(number);
};

/**
 * Formatea cantidades con unidades
 */
export const formatAmount = (amount, unit = 'gramos') => {
  const formatted = formatNumber(amount);
  const unitMap = {
    'gramos': 'g',
    'kg': 'kg',
    'libras': 'lb'
  };
  return `${formatted} ${unitMap[unit] || unit}`;
};

/**
 * Convierte bytes a formato legible
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
```

#### Validadores
```javascript
// src/utils/validators.js

/**
 * Valida email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida contraseña fuerte
 */
export const isStrongPassword = (password) => {
  // Al menos 8 caracteres, una mayúscula, una minúscula, un número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Valida cantidad numérica positiva
 */
export const isValidAmount = (amount) => {
  const number = parseFloat(amount);
  return !isNaN(number) && number > 0;
};

/**
 * Valida rango de fechas
 */
export const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end && start <= new Date();
};
```

### 5. Constantes y Configuración

#### Constantes del Sistema
```javascript
// src/config/constants.js

export const ROLES = {
  ADMIN: 'admin',
  CONSULTA: 'consulta'
};

export const FEEDING_TYPES = {
  MANUAL: 'manual',
  AUTOMATIC: 'automatic',
  SCHEDULED: 'scheduled'
};

export const FEEDING_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  CANCELLED: 'cancelled'
};

export const FEEDING_SOURCES = {
  MANUAL: 'manual',
  DISPENSER: 'dispenser',
  APP: 'app'
};

export const UNITS = {
  GRAMOS: 'gramos',
  KILOGRAMOS: 'kg',
  LIBRAS: 'libras'
};

export const CHART_TYPES = {
  BAR: 'bar',
  LINE: 'line',
  PIE: 'pie',
  AREA: 'area'
};

export const COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#6B7280',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6'
};

export const FIRESTORE_COLLECTIONS = {
  USERS: 'usuarios',
  FEEDING_RECORDS: 'feedingRecords',
  PETS: 'pets',
  GRAPHICS: 'graficas'
};
```

#### Configuración de Tema
```javascript
// src/config/theme.js

export const theme = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8'
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      500: '#6b7280',
      700: '#374151',
      900: '#111827'
    }
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '1.5rem'
  }
};
```

---

## 🔧 Configuración de Desarrollo

### ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn'
  }
};
```

### Prettier Configuration
```javascript
// .prettierrc.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false
};
```

### Vite Configuration
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@config': path.resolve(__dirname, './src/config')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          charts: ['chart.js', 'react-chartjs-2']
        }
      }
    }
  }
});
```

---

## 🧪 Testing

### Configuración de Testing
```javascript
// src/utils/testUtils.js
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

export const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

export const mockFirebaseUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User'
};
```

### Ejemplo de Test
```javascript
// src/components/__tests__/Login.test.jsx
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../../utils/testUtils';
import Login from '../Login';

describe('Login Component', () => {
  test('renders login form', () => {
    renderWithRouter(<Login />);
    
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
  });

  test('shows error on invalid credentials', async () => {
    renderWithRouter(<Login />);
    
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'invalid@email.com' }
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'wrongpassword' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/credenciales incorrectas/i)).toBeInTheDocument();
    });
  });
});
```

---

## 🚀 Optimización de Performance

### Code Splitting
```javascript
// src/App.jsx
import { lazy, Suspense } from 'react';
import LoadingSpinner from './components/common/LoadingSpinner';

const Dashboard = lazy(() => import('./components/Dashboard'));
const Estadisticas = lazy(() => import('./components/Estadisticas'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
      </Routes>
    </Suspense>
  );
}
```

### Memoización
```javascript
// Ejemplo de optimización con memo
import { memo, useMemo } from 'react';

const ExpensiveComponent = memo(({ data, config }) => {
  const processedData = useMemo(() => {
    return data.map(item => expensiveCalculation(item));
  }, [data]);

  return <div>{/* render processedData */}</div>;
});
```

---

**Sistema FIDO - Configuración y Mejores Prácticas**
*Desarrollado con ❤️ para el cuidado de nuestras mascotas*
