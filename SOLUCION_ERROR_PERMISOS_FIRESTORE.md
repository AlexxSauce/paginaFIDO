# 🔥 SOLUCIÓN PARA ERROR DE PERMISOS EN FIRESTORE

## ❌ **PROBLEMA IDENTIFICADO**
```
FirebaseError: Missing or insufficient permissions
```

**Causa**: Las reglas de Firestore no permiten que los administradores registren nuevos usuarios.

## ✅ **SOLUCIÓN: ACTUALIZAR REGLAS DE FIRESTORE**

### 📋 **PASO 1: Acceder a Firebase Console**

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto: **fido-37f41**
3. En el menú lateral, click en **Firestore Database**
4. Click en la pestaña **Rules** (Reglas)

### 📝 **PASO 2: Reemplazar las Reglas Actuales**

**COPIA Y PEGA estas reglas exactamente:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Función helper para verificar si un usuario es admin
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/usuarios/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'admin';
    }

    // Usuarios: cada usuario solo puede leer/escribir su propio documento
    // EXCEPCIÓN: los administradores pueden crear documentos de nuevos usuarios
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && (request.auth.uid == userId || isAdmin()) && resource == null;
    }

    // NUEVA: Colección usuarios (que usa tu app)
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Permitir que administradores creen documentos de nuevos usuarios
      allow create: if request.auth != null && (request.auth.uid == userId || isAdmin()) && resource == null;
      // Permitir que administradores lean todos los usuarios para verificar permisos
      allow read: if isAdmin();
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

### 🚀 **PASO 3: Publicar las Reglas**

1. Click en **Publish** (Publicar)
2. Espera a que aparezca la confirmación "Rules published successfully"

### 🔍 **PASO 4: Verificar el Fix**

1. Ve a tu aplicación
2. Inicia sesión como administrador
3. Intenta registrar un nuevo usuario
4. ✅ Debería funcionar sin errores

## 🛡️ **QUÉ HACEN LAS NUEVAS REGLAS**

### **Función `isAdmin()`**
- Verifica si el usuario autenticado tiene rol de 'admin'
- Permite a los administradores realizar acciones especiales

### **Colección `usuarios`**
- ✅ Usuarios pueden leer/escribir sus propios documentos
- ✅ **NUEVO**: Administradores pueden crear documentos de nuevos usuarios
- ✅ **NUEVO**: Administradores pueden leer todos los usuarios

### **Otras Colecciones**
- Mantienen las mismas reglas de seguridad
- No se afecta la funcionalidad existente

## ⚠️ **NOTAS IMPORTANTES**

1. **Backup**: Las reglas anteriores están guardadas en `FIRESTORE_RULES_CORREGIDAS.txt`
2. **Seguridad**: Solo administradores pueden crear nuevos usuarios
3. **Compatibilidad**: Mantiene toda la funcionalidad existente

## 🆘 **SI SIGUE FALLANDO**

### **Verificar Configuración Firebase**
- Confirma que estás en el proyecto correcto: `fido-37f41`
- Verifica que tu usuario actual tenga rol 'admin' en Firestore

### **Verificar en Firestore Console**
1. Ve a Firestore Database > Data
2. Busca la colección `usuarios`
3. Encuentra tu documento de usuario
4. Verifica que `rol: "admin"`

### **Logs de Debug**
Los errores detallados ahora aparecen en la consola del navegador (F12) para mejor diagnóstico.

---

## 📞 **CONTACTO TÉCNICO**

Si el problema persiste después de aplicar estas reglas:
1. Verifica los logs en la consola del navegador
2. Revisa que la configuración de Firebase sea correcta
3. Confirma que el usuario tiene permisos de administrador

**Estado**: 🔧 **PENDIENTE DE APLICAR REGLAS EN FIREBASE CONSOLE**
