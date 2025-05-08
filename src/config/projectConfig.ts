/**
 * Museo Viajero - Project Configuration
 * 
 * Project Description:
 * Museo Viajero es una aplicación web para la gestión de funciones teatrales y viajeras.
 * El sistema permite administrar reservas, funciones y salas de teatro, con un enfoque
 * especial en la gestión de grupos escolares.
 * 
 * Objetivos Principales:
 * 1. Gestión de Funciones:
 *    - Funciones en teatros (con salas específicas y su capacidad)
 *    - Funciones viajeras (con diferentes modalidades, estas son funciones de teatro que van fisicamente a una escuela)
 *    - Calendario integrado para visualización y gestión
 * 
 * 2. Sistema de Reservas:
 *    - Reservas para grupos escolares
 *    - Gestión de capacidad y disponibilidad
 *    - Registro de información de contacto y detalles del grupo
 * 
 * 3. Gestión de Salas:
 *    - Integración con Google Sheets para datos de salas y obras
 *    - Control de capacidad y disponibilidad
 *    - Visualización de salas en el calendario
 * 
 * 4. Roles y Permisos:
 *    - Administradores: Acceso total al sistema
 *    - Operadores: Gestión de funciones y reservas
 * 
 * 5. Exportación y Reportes:
 *    - Exportación a PDF y Excel
 *    - Reportes de asistencia y ocupación
 * 
 * Estado Actual:
 * - Implementación de la estructura base
 * - Integración con Google Sheets para datos de salas
 * - Sistema de autenticación y roles
 * - Calendario y gestión de funciones
 * 
 * Próximos Pasos:
 * - Completar la integración con Google Sheets
 * - Implementar sistema de reservas
 * - Mejorar la exportación de datos
 * - Optimizar la interfaz de usuario
 */

// Google Sheets Configuration
export const GOOGLE_SHEETS_CONFIG = {
  SPREADSHEET_ID: '1ZWVllf4g9nsJP-H_Jkk0Fg0eQg7s_QnXR9iNZJGaMeA',
  SHEETS: {
    FUNCIONES: '393736360',
    RECURSOS: '1257531079',
    TEMAS: '1888943415',
    VIDEOS: '1389993981',
    SLIDER: '394605623',
    SALAS: '129995417',
    OBRAS: '0',
    CATEGORIAS_RECURSOS: '2079661031',
    PRENSA: '210931182',
    CALCULATOR: '954763227'
  }
};

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// User Roles
export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator'
}

// Theater Room Interface
export interface TheaterRoom {
  id: string;
  name: string;
  capacity: number;
}

// Theater Function Interface
export interface TheaterFunction {
  id: string;
  date: Date;
  roomId: string;
  roomName?: string;
  time?: string;
  capacity: number;
}

// Traveling Function Interface
export interface TravelingFunction {
  id: string;
  date: Date;
  modalityType: '1' | '2' | '3' | '4';
}

// Reservation Interface
export interface Reservation {
  id: string;
  functionId: string;
  functionType: 'theater' | 'traveling';
  schoolName: string;
  grade: string;
  studentsCount: number;
  teachersCount: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: Date;
}

// Calendar Event Interface
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'theater' | 'traveling';
  theaterId?: string;
  travelingId?: string;
  room?: string;
  modalityType?: string;
}

// Project Structure
export const PROJECT_STRUCTURE = {
  COMPONENTS: {
    NAVBAR: 'components/Navbar',
    CALENDAR_VIEW: 'components/CalendarView',
    DAY_DETAILS: 'components/DayDetails',
    THEATER_FUNCTION_FORM: 'components/TheaterFunctionForm',
    TRAVELING_FUNCTION_FORM: 'components/TravelingFunctionForm',
    RESERVATION_FORM: 'components/ReservationForm'
  },
  PAGES: {
    LOGIN: 'pages/Login',
    CALENDAR: 'pages/Calendar',
    CONFIG: 'pages/Config'
  },
  SERVICES: {
    AUTH: 'services/auth',
    FIREBASE: 'services/firebase'
  },
  UTILS: {
    EXPORT: 'utils/exportUtils'
  }
};

// Demo Mode Configuration
export const DEMO_CONFIG = {
  USER: {
    uid: 'demo-user-id',
    email: 'admin@example.com',
    role: UserRole.ADMIN
  }
};

// Theme Configuration
export const THEME_CONFIG = {
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  }
};

// Routes Configuration
export const ROUTES = {
  LOGIN: '/login',
  HOME: '/',
  CONFIG: '/config'
};

// Protected Routes Configuration
export const PROTECTED_ROUTES = {
  [ROUTES.HOME]: [UserRole.ADMIN, UserRole.OPERATOR],
  [ROUTES.CONFIG]: [UserRole.ADMIN]
}; 