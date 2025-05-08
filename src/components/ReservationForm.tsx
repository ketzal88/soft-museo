import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Grid,
  CircularProgress,
  Alert,
  Typography
} from '@mui/material';
import { createReservation } from '../services/firebase';
import { TheaterFunction, TravelingFunction } from '../utils/exportUtils';

interface ReservationFormProps {
  functionType: 'theater' | 'traveling';
  functionId: string;
  onSuccess: () => void;
  functionDetails?: TheaterFunction | TravelingFunction;
}

const ReservationForm = ({ 
  functionType, 
  functionId, 
  onSuccess,
  functionDetails
}: ReservationFormProps) => {
  const isTheaterFunction = functionType === 'theater';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Common fields
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Theater specific fields
  const [studentCount, setStudentCount] = useState(0);
  const [companionCount, setCompanionCount] = useState(0);
  
  // Traveling specific fields
  const [address, setAddress] = useState('');
  
  // Form validation
  const [formErrors, setFormErrors] = useState({
    schoolName: false,
    email: false,
    phoneNumber: false,
    studentCount: false,
    companionCount: false,
    address: false
  });
  
  const validateForm = (): boolean => {
    const errors = {
      schoolName: !schoolName.trim(),
      email: !email.trim() || !email.includes('@'),
      phoneNumber: !phoneNumber.trim(),
      studentCount: isTheaterFunction && studentCount <= 0,
      companionCount: isTheaterFunction && companionCount < 0,
      address: !isTheaterFunction && !address.trim()
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
      if (isTheaterFunction) {
        // Check if we have enough capacity
        const theaterFunction = functionDetails as TheaterFunction;
        const totalAttendees = studentCount + companionCount;
        
        if (theaterFunction && theaterFunction.capacity < totalAttendees) {
          setError(`La cantidad de asistentes (${totalAttendees}) supera la capacidad disponible (${theaterFunction.capacity}).`);
          setLoading(false);
          return;
        }
        
        await createReservation('theater', functionId, {
          schoolName,
          email,
          phoneNumber,
          studentCount,
          companionCount
        });
      } else {
        const travelingFunction = functionDetails as TravelingFunction;
        
        await createReservation('traveling', functionId, {
          schoolName,
          email,
          phoneNumber,
          address,
          functionType: travelingFunction?.modalityType || '1'
        });
      }
      
      setSuccess(true);
      
      // Reset form
      setSchoolName('');
      setEmail('');
      setPhoneNumber('');
      setStudentCount(0);
      setCompanionCount(0);
      setAddress('');
      
      // Notify parent component
      onSuccess();
    } catch (error) {
      console.error('Error creating reservation:', error);
      setError('Error al crear la reserva. Por favor, intente nuevamente.');
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
          Reserva creada exitosamente
        </Alert>
      )}
      
      <Grid container spacing={2}>
        {/* Common Fields */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Nombre de la Escuela"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            error={formErrors.schoolName}
            helperText={formErrors.schoolName ? 'Este campo es requerido' : ''}
            disabled={loading}
            required
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={formErrors.email}
            helperText={formErrors.email ? 'Email inválido' : ''}
            disabled={loading}
            required
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Teléfono celular de la maestra"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            error={formErrors.phoneNumber}
            helperText={formErrors.phoneNumber ? 'Este campo es requerido' : ''}
            disabled={loading}
            required
          />
        </Grid>
        
        {/* Theater specific fields */}
        {isTheaterFunction && (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cantidad de alumnos"
                type="number"
                value={studentCount}
                onChange={(e) => setStudentCount(parseInt(e.target.value, 10) || 0)}
                error={formErrors.studentCount}
                helperText={formErrors.studentCount ? 'Debe ser mayor que 0' : ''}
                disabled={loading}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cantidad de acompañantes"
                type="number"
                value={companionCount}
                onChange={(e) => setCompanionCount(parseInt(e.target.value, 10) || 0)}
                error={formErrors.companionCount}
                helperText={formErrors.companionCount ? 'No puede ser negativo' : ''}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                Total de asistentes: {studentCount + companionCount}
              </Typography>
              {functionDetails && (
                <Typography variant="body2" color="primary">
                  Capacidad de la sala: {(functionDetails as TheaterFunction).capacity}
                </Typography>
              )}
            </Grid>
          </>
        )}
        
        {/* Traveling specific fields */}
        {!isTheaterFunction && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Dirección"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              error={formErrors.address}
              helperText={formErrors.address ? 'Este campo es requerido' : ''}
              disabled={loading}
              required
              multiline
              rows={2}
            />
          </Grid>
        )}
        
        <Grid item xs={12}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Crear Reserva'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReservationForm; 