import { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography,
  FormHelperText,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { getTheaterRooms, createTheaterFunction } from '../services/firebase';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

interface TheaterRoom {
  id: string;
  name: string;
  capacity: number;
}

interface TheaterFunctionFormProps {
  date: Date;
  onSuccess: () => void;
}

const TheaterFunctionForm = ({ date, onSuccess }: TheaterFunctionFormProps) => {
  const [rooms, setRooms] = useState<TheaterRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formValues, setFormValues] = useState({
    roomId: '',
    time: null as Date | null,
    capacity: 0,
  });
  
  const [formErrors, setFormErrors] = useState({
    roomId: false,
    capacity: false,
  });
  
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsData = await getTheaterRooms();
        const mappedRooms = roomsData.map(room => ({
          id: room.id,
          name: room.name,
          capacity: room.capacity
        }));
        setRooms(mappedRooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setError('No se pudieron cargar las salas. Por favor, intente nuevamente.');
      }
    };
    
    fetchRooms();
  }, []);
  
  const handleChange = (field: string, value: any) => {
    setFormValues({
      ...formValues,
      [field]: value
    });
    
    // Reset errors
    if (field in formErrors) {
      setFormErrors({
        ...formErrors,
        [field]: false
      });
    }
    
    // If changing room, set default capacity
    if (field === 'roomId' && value) {
      const selectedRoom = rooms.find(r => r.id === value);
      if (selectedRoom) {
        setFormValues(prev => ({
          ...prev,
          roomId: value,
          capacity: selectedRoom.capacity
        }));
      }
    }
  };
  
  const validateForm = (): boolean => {
    const errors = {
      roomId: !formValues.roomId,
      capacity: formValues.capacity <= 0
    };
    
    setFormErrors(errors);
    
    return !Object.values(errors).some(Boolean);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const selectedRoom = rooms.find(room => room.id === formValues.roomId);
      
      if (!selectedRoom) {
        throw new Error('Sala no encontrada');
      }
      
      // Create function date with time if provided
      const functionDate = new Date(date);
      if (formValues.time) {
        functionDate.setHours(
          formValues.time.getHours(),
          formValues.time.getMinutes(),
          0,
          0
        );
      }
      
      await createTheaterFunction({
        date: functionDate,
        roomId: formValues.roomId,
        roomName: selectedRoom.name,
        time: formValues.time 
          ? `${formValues.time.getHours()}:${formValues.time.getMinutes().toString().padStart(2, '0')}`
          : null,
        capacity: formValues.capacity
      });
      
      setSuccess(true);
      
      // Reset form
      setFormValues({
        roomId: '',
        time: null,
        capacity: 0,
      });
      
      // Notify parent component
      onSuccess();
    } catch (error) {
      console.error('Error creating theater function:', error);
      setError('Error al crear la función. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Función creada exitosamente
        </Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth error={formErrors.roomId}>
            <InputLabel id="room-select-label">Sala</InputLabel>
            <Select
              labelId="room-select-label"
              id="room"
              value={formValues.roomId}
              label="Sala"
              onChange={(e) => handleChange('roomId', e.target.value)}
              disabled={loading}
            >
              {rooms.map((room) => (
                <MenuItem key={room.id} value={room.id}>
                  {room.name} (Cap. {room.capacity})
                </MenuItem>
              ))}
            </Select>
            {formErrors.roomId && (
              <FormHelperText>Por favor, seleccione una sala</FormHelperText>
            )}
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <TimePicker
              label="Horario (opcional)"
              value={formValues.time}
              onChange={(newTime) => handleChange('time', newTime)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                  disabled: loading
                }
              }}
            />
          </LocalizationProvider>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Capacidad"
            type="number"
            value={formValues.capacity}
            onChange={(e) => handleChange('capacity', parseInt(e.target.value, 10) || 0)}
            error={formErrors.capacity}
            helperText={formErrors.capacity ? 'La capacidad debe ser mayor que 0' : ''}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary" sx={{ my: 1 }}>
            Fecha: {date.toLocaleDateString('es-AR')}
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Crear Función'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TheaterFunctionForm; 