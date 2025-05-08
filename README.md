# Museo Viajero - Sistema de Reservas

Este es un sistema interno de reservas para el equipo de "El Museo Viajero", que permite gestionar funciones teatrales y funciones viajeras, junto con sus respectivas reservas.

## Características principales

- **Vista de calendario**: Visualización de funciones programadas
- **Gestión de funciones**: Creación de funciones teatrales y viajeras
- **Gestión de reservas**: Registro de reservas para cada función
- **Exportación**: Exportar información de reservas a PDF/Excel
- **Configuración**: Gestión de salas de teatro y usuarios del sistema

## Tecnologías utilizadas

- **Frontend**: React con TypeScript y Vite
- **Backend**: Firebase (Firestore + Autenticación)
- **UI**: Material UI

## Requisitos para desarrollo

- Node.js 16+
- npm o yarn
- Cuenta en Firebase

## Configuración

1. Clone el repositorio

   ```
   git clone [url-repositorio]
   cd museo-viajero
   ```

2. Instale las dependencias

   ```
   npm install
   ```

3. Configure Firebase

   - Cree un proyecto en Firebase Console (https://console.firebase.google.com/)
   - Active Authentication (con email/password)
   - Active Firestore Database
   - Copie las credenciales de configuración de Firebase

4. Configure las credenciales en el archivo `src/services/firebase.ts`:

   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
   };
   ```

5. Cree un usuario administrador inicial:
   - Abra la consola de Firebase Authentication
   - Cree un usuario con email y contraseña
   - En Firestore Database, cree una colección `users`
   - Añada un documento con el mismo ID que el UID del usuario de Authentication
   - Agregar campos:
     ```
     email: "email-del-usuario"
     role: "admin"
     createdAt: (timestamp)
     ```

## Ejecutar el proyecto

Para desarrollo:

```
npm run dev
```

Para compilar y crear versión de producción:

```
npm run build
```

## Estructura del proyecto

```
/src
├── components         # Componentes reutilizables
├── pages              # Páginas principales
├── services           # Servicios (Firebase)
├── utils              # Funciones de utilidad (exportación, etc.)
├── App.tsx            # Componente principal
└── main.tsx           # Punto de entrada
```

## Roles de usuario

- **Administrador**: Acceso completo a todas las funciones.
- **Operador**: Solo puede registrar reservas y ver la agenda.

## Flujo de uso

1. Iniciar sesión en el sistema
2. Utilizar el calendario para crear funciones (teatro o viajeras)
3. Registrar reservas para cada función
4. Exportar información cuando sea necesario

## Mantenimiento y soporte

Para consultas o soporte:

- Email: [su-email]
- Documentación adicional: [enlace-a-docs]
