import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { UserRole } from '../services/auth';
import { logoutUser } from '../services/firebase';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Event as EventIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

interface NavbarProps {
  userRole?: UserRole;
}

const Navbar = ({ userRole }: NavbarProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchor(null);
  };
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  
  const isAdmin = userRole === UserRole.ADMIN;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold'
          }}
        >
          Museo Viajero
        </Typography>
        
        {!userRole ? (
          <Button color="inherit" component={RouterLink} to="/login">
            Iniciar Sesión
          </Button>
        ) : isMobile ? (
          <>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuOpen}
            >
              <MenuIcon />
            </IconButton>
            
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => { handleMenuClose(); navigate('/'); }}>
                <ListItemIcon>
                  <EventIcon fontSize="small" />
                </ListItemIcon>
                Calendario
              </MenuItem>
              
              {isAdmin && (
                <MenuItem onClick={() => { handleMenuClose(); navigate('/config'); }}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  Configuración
                </MenuItem>
              )}
              
              <Divider />
              
              <MenuItem onClick={() => { handleMenuClose(); handleLogout(); }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Cerrar Sesión
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex' }}>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/"
              startIcon={<EventIcon />}
            >
              Calendario
            </Button>
            
            {isAdmin && (
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/config"
                startIcon={<SettingsIcon />}
              >
                Configuración
              </Button>
            )}
            
            <Button 
              color="inherit" 
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              Cerrar Sesión
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 