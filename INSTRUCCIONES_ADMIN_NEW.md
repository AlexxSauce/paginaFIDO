# 🔧 Instrucciones para Administrador - Configuración de Firestore

## ❌ **Problema Actual:**
```
Error: Missing or insufficient permissions
```

El usuario no puede acceder a la colección `usuarios` en Firestore debido a reglas de seguridad restrictivas.

## ✅ **Solución: Configurar Reglas de Firestore**

### Paso 1: Acceder a Firebase Console
1. Ve a: https://console.firebase.google.com/
2. Selecciona el proyecto: **fido-37f41**
3. En el menú lateral, haz clic en **"Firestore Database"**
4. Ve a la pestaña **"Rules"**

### Paso 2: Configurar Reglas Básicas

Reemplaza las reglas actuales con estas reglas corregidas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Usuarios: cada usuario solo puede leer/escribir su propio documento
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId && resource == null;
    }

    // NUEVA: Colección usuarios (que usa tu app)
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId && resource == null;
    }

    // NUEVA: Colección graficas (para estadísticas)
    match /graficas/{document} {
      allow read, write: if request.auth != null;
    }

    // Mascotas y subcolecciones
    match /pets/{petId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;

      // Subcolección de horarios de alimentación
      match /feedingTimes/{timeId} {
        allow read, write, create: if request.auth != null &&
          get(/databases/$(database)/documents/pets/$(petId)).data.userId == request.auth.uid;
      }

      // Subcolección de porciones
      match /portions/{portionId} {
        allow read, write, create: if request.auth != null &&
          get(/databases/$(database)/documents/pets/$(petId)).data.userId == request.auth.uid;
      }

      // Subcolección de historial de alimentación
      match /feedingHistory/{historyId} {
        allow read, write, create: if request.auth != null &&
          get(/databases/$(database)/documents/pets/$(petId)).data.userId == request.auth.uid;
      }
    }

    // Registros de alimentación - REGLA SIMPLIFICADA para que funcione con tu app
    match /feedingRecords/{recordId} {
      allow read, write: if request.auth != null;
    }

    // Horarios de alimentación (colección independiente)
    match /feeding_schedules/{scheduleId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // Dispensadores
    match /dispensers/{dispenserId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // Estadísticas
    match /statistics/{statId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // Mensajes de contacto: cualquiera puede crear, nadie puede leer/editar/borrar
    match /contactMessages/{msgId} {
      allow create: if true;
      allow read, update, delete: if false;
    }

    // Denegar acceso a cualquier otra colección no especificada
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Paso 3: Reglas Más Específicas (Opcional - Después de que funcione)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Función auxiliar para verificar si es admin
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/usuarios/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'admin';
    }
    
    // Función auxiliar para verificar si el usuario está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Reglas para la colección usuarios
    match /usuarios/{userId} {
      // Los usuarios pueden leer solo su propio documento
      allow read: if isAuthenticated() && request.auth.uid == userId;
      // Solo los admins pueden crear/actualizar usuarios
      allow write: if isAdmin();
    }
    
    // Reglas para la colección feedingRecords
    match /feedingRecords/{recordId} {
      // Todos los usuarios autenticados pueden leer
      allow read: if isAuthenticated();
      // Solo los admins pueden escribir
      allow write: if isAdmin();
    }
    
    // Reglas para otras colecciones
    match /graficas/{document} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

### Paso 4: Aplicar las Reglas

1. Copia y pega las reglas en el editor
2. Haz clic en **"Publicar"**
3. Confirma la acción

## 🔍 **Verificar que los Datos Existen**

### Paso 1: Verificar Colección `usuarios`
1. En Firebase Console → Firestore Database → "Data"
2. Busca la colección **"usuarios"**
3. Verifica que existe un documento con el ID del usuario autenticado
4. El documento debe tener la estructura:
   ```javascript
   {
     email: "usuario@ejemplo.com",
     rol: "admin", // o "consulta"
     fechaCreacion: Timestamp
   }
   ```

### Paso 2: Verificar Colección `feedingRecords`
1. Busca la colección **"feedingRecords"**
2. Verifica que hay documentos con la estructura esperada:
   ```javascript
   {
     amount: 150,
     amountUnit: "grams",
     timestamp: "2025-08-19T16:56:15.272Z",
     status: "scheduled",
     type: "automatic",
     source: "dispenser",
     petId: "...",
     userId: "..."
   }
   ```

## 🚨 **Reglas Temporales para Testing (Solo Desarrollo)**

Si necesitas acceso inmediato para pruebas, puedes usar estas reglas temporales:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ ADVERTENCIA**: Estas reglas permiten acceso completo. NO las uses en producción.

## 📝 **Crear Usuario Administrador Inicial**

Si no existe un usuario administrador, créalo manualmente:

### Opción 1: Desde Firebase Console
1. Ve a Firestore Database → Data
2. Crea la colección "usuarios" si no existe
3. Crea un documento con el ID del usuario actual
4. Agrega los campos:
   - `email`: correo del usuario
   - `rol`: "admin"
   - `fechaCreacion`: timestamp actual

### Opción 2: Desde la App (Temporal)
1. Usa las reglas temporales de arriba
2. Accede a la página de registro en la app
3. Crea el usuario administrador
4. Cambia las reglas a las reglas de producción

## 🔧 **Pasos de Verificación**

Después de aplicar las reglas:

1. **Reinicia la aplicación** (cierra y abre el navegador)
2. **Inicia sesión** con el usuario administrador
3. **Revisa la consola del navegador** para ver logs detallados
4. **Verifica que aparece el Dashboard** sin errores

## 📞 **Si Persiste el Problema**

Si después de aplicar las reglas el problema continúa:

1. **Captura de pantalla** de las reglas aplicadas
2. **Captura de pantalla** de la estructura de datos en Firestore
3. **Logs de la consola** del navegador con el error detallado
4. **ID del usuario** que está teniendo problemas

---

**Nota**: El sistema necesita tanto la configuración correcta de Firebase como los permisos adecuados en Firestore para funcionar correctamente.
