import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Calendar from './pages/Calendar';
import Config from './pages/Config';
import { UserRole } from './services/auth';

// MODO DEMO: Comentamos la importación de Firebase
// import { auth } from './services/firebase';
// import { onAuthStateChanged } from 'firebase/auth';

// Define the theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRoles?: UserRole[];
}

// MODO DEMO: Usuario ficticio para pruebas
const DEMO_USER = {
  uid: 'demo-user-id',
  email: 'admin@example.com',
  role: UserRole.ADMIN
};

const App = () => {
  // MODO DEMO: Usamos el usuario ficticio directamente
  const [user, setUser] = useState(DEMO_USER);
  const [loading, setLoading] = useState(false);

  // MODO DEMO: Comentamos la lógica de Firebase
  /*
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Get user data from localStorage for role information
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              role: userData.role
            });
          } catch (error) {
            console.error('Error parsing user data:', error);
            setUser(null);
          }
        } else {
          // No user data in localStorage
          setUser(null);
        }
      } else {
        // No user logged in
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  */

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar userRole={user?.role} />
        <Routes>
          <Route path="/login" element={
            user ? <Navigate to="/" /> : <Login />
          } />
          <Route path="/" element={
            <ProtectedRoute 
              element={<Calendar />}
              allowedRoles={[UserRole.ADMIN, UserRole.OPERATOR]} 
            />
          } />
          <Route path="/config" element={
            <ProtectedRoute 
              element={<Config />}
              allowedRoles={[UserRole.ADMIN]} 
            />
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

// Protected route component
const ProtectedRoute = ({ element, allowedRoles = [] }: ProtectedRouteProps) => {
  // MODO DEMO: Siempre permitimos acceso
  return <>{element}</>;
  
  /*
  const location = useLocation();
  
  // Check if user is logged in
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    // User is not logged in, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // User is logged in, check role if necessary
  if (allowedRoles.length > 0) {
    try {
      const userData = JSON.parse(storedUser);
      const userRole = userData.role;
      
      if (!allowedRoles.includes(userRole as UserRole)) {
        // User doesn't have the required role, redirect to home
        return <Navigate to="/" replace />;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      return <Navigate to="/login" replace />;
    }
  }
  
  // User is logged in and has the required role (if any)
  return <>{element}</>;
  */
};

export default App;
