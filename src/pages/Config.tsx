import { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Tabs, 
  Tab, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { UserRole, createUserWithRole } from '../services/auth';
import { getTheaterRooms, createTheaterRoom, updateTheaterRoom, deleteTheaterRoom } from '../services/firebase';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface TheaterRoom {
  id: string;
  name: string;
  capacity: number;
}

const Config = () => {
  const [tabValue, setTabValue] = useState(0);
  const [rooms, setRooms] = useState<TheaterRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Room form state
  const [openRoomDialog, setOpenRoomDialog] = useState(false);
  const [roomFormValues, setRoomFormValues] = useState({
    id: '',
    name: '',
    capacity: 0
  });
  const [roomFormErrors, setRoomFormErrors] = useState({
    name: false,
    capacity: false
  });
  const [isEditMode, setIsEditMode] = useState(false);
  
  // User form state
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [userFormValues, setUserFormValues] = useState({
    email: '',
    password: '',
    role: UserRole.OPERATOR
  });
  const [userFormErrors, setUserFormErrors] = useState({
    email: false,
    password: false
  });
  
  useEffect(() => {
    fetchRooms();
  }, []);
  
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const roomsData = await getTheaterRooms();
      setRooms(roomsData as TheaterRoom[]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Error al cargar las salas. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Room management functions
  const handleOpenRoomDialog = (room?: TheaterRoom) => {
    if (room) {
      setRoomFormValues({
        id: room.id,
        name: room.name,
        capacity: room.capacity
      });
      setIsEditMode(true);
    } else {
      setRoomFormValues({
        id: '',
        name: '',
        capacity: 0
      });
      setIsEditMode(false);
    }
    
    setOpenRoomDialog(true);
  };
  
  const handleCloseRoomDialog = () => {
    setOpenRoomDialog(false);
    setRoomFormErrors({
      name: false,
      capacity: false
    });
    setError(null);
    setSuccess(null);
  };
  
  const handleRoomFormChange = (field: string, value: any) => {
    setRoomFormValues({
      ...roomFormValues,
      [field]: value
    });
    
    if (field in roomFormErrors) {
      setRoomFormErrors({
        ...roomFormErrors,
        [field]: false
      });
    }
  };
  
  const validateRoomForm = (): boolean => {
    const errors = {
      name: !roomFormValues.name.trim(),
      capacity: roomFormValues.capacity <= 0
    };
    
    setRoomFormErrors(errors);
    
    return !Object.values(errors).some(Boolean);
  };
  
  const handleSaveRoom = async () => {
    if (!validateRoomForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (isEditMode) {
        await updateTheaterRoom(roomFormValues.id, {
          name: roomFormValues.name,
          capacity: roomFormValues.capacity
        });
        setSuccess('Sala actualizada exitosamente');
      } else {
        await createTheaterRoom({
          name: roomFormValues.name,
          capacity: roomFormValues.capacity
        });
        setSuccess('Sala creada exitosamente');
      }
      
      fetchRooms();
    } catch (error) {
      console.error('Error saving room:', error);
      setError('Error al guardar la sala. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteRoom = async (id: string) => {
    if (!window.confirm('¿Está seguro que desea eliminar esta sala?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await deleteTheaterRoom(id);
      fetchRooms();
      setSuccess('Sala eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting room:', error);
      setError('Error al eliminar la sala. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // User management functions
  const handleOpenUserDialog = () => {
    setUserFormValues({
      email: '',
      password: '',
      role: UserRole.OPERATOR
    });
    setOpenUserDialog(true);
  };
  
  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
    setUserFormErrors({
      email: false,
      password: false
    });
    setError(null);
    setSuccess(null);
  };
  
  const handleUserFormChange = (field: string, value: any) => {
    setUserFormValues({
      ...userFormValues,
      [field]: value
    });
    
    if (field in userFormErrors) {
      setUserFormErrors({
        ...userFormErrors,
        [field]: false
      });
    }
  };
  
  const validateUserForm = (): boolean => {
    const errors = {
      email: !userFormValues.email.trim() || !userFormValues.email.includes('@'),
      password: !userFormValues.password.trim() || userFormValues.password.length < 6
    };
    
    setUserFormErrors(errors);
    
    return !Object.values(errors).some(Boolean);
  };
  
  const handleCreateUser = async () => {
    if (!validateUserForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await createUserWithRole(
        userFormValues.email,
        userFormValues.password,
        userFormValues.role
      );
      
      setSuccess('Usuario creado exitosamente');
      
      // Reset form
      setUserFormValues({
        email: '',
        password: '',
        role: UserRole.OPERATOR
      });
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Error al crear el usuario. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Configuración
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Salas de Teatro" />
            <Tab label="Usuarios" />
          </Tabs>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Salas de Teatro</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenRoomDialog()}
            >
              Nueva Sala
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {rooms.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2, textAlign: 'center' }}>
                  No hay salas creadas
                </Typography>
              ) : (
                rooms.map((room) => (
                  <ListItem key={room.id} divider>
                    <ListItemText 
                      primary={room.name}
                      secondary={`Capacidad: ${room.capacity}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        aria-label="edit"
                        onClick={() => handleOpenRoomDialog(room)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => handleDeleteRoom(room.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              )}
            </List>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Usuarios</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenUserDialog}
              color="secondary"
            >
              Nuevo Usuario
            </Button>
          </Box>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            Desde aquí puede crear nuevos usuarios administradores u operadores.
          </Typography>
        </TabPanel>
      </Paper>
      
      {/* Room Form Dialog */}
      <Dialog open={openRoomDialog} onClose={handleCloseRoomDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? 'Editar Sala' : 'Nueva Sala'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="Nombre de la Sala"
              value={roomFormValues.name}
              onChange={(e) => handleRoomFormChange('name', e.target.value)}
              error={roomFormErrors.name}
              helperText={roomFormErrors.name ? 'Este campo es requerido' : ''}
              disabled={loading}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Capacidad"
              type="number"
              value={roomFormValues.capacity}
              onChange={(e) => handleRoomFormChange('capacity', parseInt(e.target.value, 10) || 0)}
              error={roomFormErrors.capacity}
              helperText={roomFormErrors.capacity ? 'La capacidad debe ser mayor que 0' : ''}
              disabled={loading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoomDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSaveRoom} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* User Form Dialog */}
      <Dialog open={openUserDialog} onClose={handleCloseUserDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Usuario</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={userFormValues.email}
              onChange={(e) => handleUserFormChange('email', e.target.value)}
              error={userFormErrors.email}
              helperText={userFormErrors.email ? 'Email inválido' : ''}
              disabled={loading}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={userFormValues.password}
              onChange={(e) => handleUserFormChange('password', e.target.value)}
              error={userFormErrors.password}
              helperText={userFormErrors.password ? 'La contraseña debe tener al menos 6 caracteres' : ''}
              disabled={loading}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth>
              <InputLabel id="role-select-label">Rol</InputLabel>
              <Select
                labelId="role-select-label"
                id="role"
                value={userFormValues.role}
                label="Rol"
                onChange={(e) => handleUserFormChange('role', e.target.value)}
                disabled={loading}
              >
                <MenuItem value={UserRole.ADMIN}>Administrador</MenuItem>
                <MenuItem value={UserRole.OPERATOR}>Operador</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleCreateUser} variant="contained" color="secondary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Crear Usuario'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Config; 