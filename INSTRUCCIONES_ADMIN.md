# Instrucciones para Crear Usuario Administrador

## Problema Identificado
El sistema requiere un usuario con rol "admin" para poder registrar nuevos usuarios, pero si no existe ningún admin, no se puede acceder a la función de registro.

## Solución Temporal
Para crear el primer usuario administrador, puedes usar una de estas opciones:

### Opción 1: Crear Admin desde Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a "Authentication" > "Users"
4. Crea un nuevo usuario con email y contraseña
5. Copia el UID del usuario creado
6. Ve a "Firestore Database"
7. Crea un documento en la colección "usuarios" con:
   - ID del documento: el UID del usuario
   - Campos:
     ```
     email: "admin@test.com"
     rol: "admin"
     fechaCreacion: (timestamp actual)
     ```

### Opción 2: Registrar Usuario Temporal y Cambiar Rol
1. Comenta temporalmente la verificación de admin en UserRegister.jsx
2. Registra un usuario
3. Ve a Firestore y cambia su rol a "admin"
4. Descomenta la verificación

### Opción 3: Usar la Consola del Navegador
1. Abre las herramientas de desarrollador (F12)
2. Ve a la consola
3. Ejecuta este código:

```javascript
// Crear usuario admin directamente
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

const createAdmin = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, 'admin@test.com', '123456');
    await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
      email: 'admin@test.com',
      rol: 'admin',
      fechaCreacion: new Date()
    });
    console.log('Admin creado exitosamente');
  } catch (error) {
    console.error('Error:', error);
  }
};

createAdmin();
```

## Usuario Admin de Prueba Sugerido
- **Email:** admin@test.com
- **Contraseña:** 123456
- **Rol:** admin

Una vez que tengas un usuario admin, podrás usar el sistema normalmente para registrar más usuarios.
