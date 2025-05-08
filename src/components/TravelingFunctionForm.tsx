import { useState } from 'react';
import { 
  Box, 
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
import { createTravelingFunction } from '../services/firebase';

interface TravelingFunctionFormProps {
  date: Date;
  onSuccess: () => void;
}

type ModalityType = '1' | '2' | '3' | '4';

const TravelingFunctionForm = ({ date, onSuccess }: TravelingFunctionFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formValues, setFormValues] = useState({
    modalityType: '' as ModalityType | '',
  });
  
  const [formErrors, setFormErrors] = useState({
    modalityType: false,
  });
  
  const modalityOptions = [
    { value: '1', label: '1 función' },
    { value: '2', label: '2 funciones en el mismo turno' },
    { value: '3', label: '1 función en cada turno' },
    { value: '4', label: '4 funciones' },
  ];
  
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
  };
  
  const validateForm = (): boolean => {
    const errors = {
      modalityType: !formValues.modalityType,
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
      await createTravelingFunction({
        date,
        modalityType: formValues.modalityType,
      });
      
      setSuccess(true);
      
      // Reset form
      setFormValues({
        modalityType: '',
      });
      
      // Notify parent component
      onSuccess();
    } catch (error) {
      console.error('Error creating traveling function:', error);
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
          Función viajera creada exitosamente
        </Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth error={formErrors.modalityType}>
            <InputLabel id="modality-select-label">Modalidad</InputLabel>
            <Select
              labelId="modality-select-label"
              id="modality"
              value={formValues.modalityType}
              label="Modalidad"
              onChange={(e) => handleChange('modalityType', e.target.value)}
              disabled={loading}
            >
              {modalityOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {formErrors.modalityType && (
              <FormHelperText>Por favor, seleccione una modalidad</FormHelperText>
            )}
          </FormControl>
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
            color="secondary"
          >
            {loading ? <CircularProgress size={24} /> : 'Crear Función Viajera'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TravelingFunctionForm; 