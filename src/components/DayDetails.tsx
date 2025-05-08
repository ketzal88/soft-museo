import { useState, useEffect } from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  Divider, 
  List, 
  ListItem, 
  ListItemText,
  Button, 
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudDownload as CloudDownloadIcon,
  Description as DescriptionIcon,
  TableChart as TableChartIcon
} from '@mui/icons-material';
import { UserRole } from '../services/auth';
import { getReservationsForFunction } from '../services/firebase';
import { TheaterReservation, TravelingReservation, TheaterFunction, TravelingFunction, exportToPDF, exportToExcel } from '../utils/exportUtils';
import TheaterFunctionForm from './TheaterFunctionForm';
import TravelingFunctionForm from './TravelingFunctionForm';
import ReservationForm from './ReservationForm';

interface CalendarEvent {
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

interface DayDetailsProps {
  selectedDate: Date | null;
  events: CalendarEvent[];
  userRole: UserRole;
  refreshCalendar: () => void;
}

const DayDetails = ({ selectedDate, events, userRole, refreshCalendar }: DayDetailsProps) => {
  const [tabValue, setTabValue] = useState(0);
  const [theaterFunctions, setTheaterFunctions] = useState<TheaterFunction[]>([]);
  const [travelingFunctions, setTravelingFunctions] = useState<TravelingFunction[]>([]);
  const [theaterReservations, setTheaterReservations] = useState<Record<string, TheaterReservation[]>>({});
  const [travelingReservations, setTravelingReservations] = useState<Record<string, TravelingReservation[]>>({});
  
  const [openTheaterForm, setOpenTheaterForm] = useState(false);
  const [openTravelingForm, setOpenTravelingForm] = useState(false);
  const [openReservationForm, setOpenReservationForm] = useState(false);
  const [selectedFunctionType, setSelectedFunctionType] = useState<'theater' | 'traveling' | null>(null);
  const [selectedFunctionId, setSelectedFunctionId] = useState<string | null>(null);
  
  const isAdmin = userRole === UserRole.ADMIN;
  
  useEffect(() => {
    if (selectedDate && events.length > 0) {
      // Organize events by type
      const theaterEvents = events.filter(e => e.type === 'theater');
      const travelingEvents = events.filter(e => e.type === 'traveling');
      
      // Transform events to functions
      const theaterFuncs = theaterEvents.map(e => ({
        id: e.theaterId || '',
        date: e.start,
        roomId: '',
        roomName: e.room || 'Sala sin especificar',
        capacity: 0
      }));
      
      const travelingFuncs = travelingEvents.map(e => ({
        id: e.travelingId || '',
        date: e.start,
        modalityType: e.modalityType as '1' | '2' | '3' | '4' || '1'
      }));
      
      setTheaterFunctions(theaterFuncs);
      setTravelingFunctions(travelingFuncs);
      
      // Fetch reservations for each function
      fetchReservations(theaterEvents, travelingEvents);
    } else {
      // Clear data when no date is selected
      setTheaterFunctions([]);
      setTravelingFunctions([]);
      setTheaterReservations({});
      setTravelingReservations({});
    }
  }, [selectedDate, events]);
  
  const fetchReservations = async (theaterEvents: CalendarEvent[], travelingEvents: CalendarEvent[]) => {
    const theaterReservs: Record<string, TheaterReservation[]> = {};
    const travelingReservs: Record<string, TravelingReservation[]> = {};
    
    // Fetch theater reservations
    for (const event of theaterEvents) {
      if (event.theaterId) {
        const reservations = await getReservationsForFunction('theater', event.theaterId);
        theaterReservs[event.theaterId] = reservations as TheaterReservation[];
      }
    }
    
    // Fetch traveling reservations
    for (const event of travelingEvents) {
      if (event.travelingId) {
        const reservations = await getReservationsForFunction('traveling', event.travelingId);
        travelingReservs[event.travelingId] = reservations as TravelingReservation[];
      }
    }
    
    setTheaterReservations(theaterReservs);
    setTravelingReservations(travelingReservs);
  };
  
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleOpenTheaterForm = () => {
    setOpenTheaterForm(true);
  };
  
  const handleCloseTheaterForm = (refresh = false) => {
    setOpenTheaterForm(false);
    if (refresh) {
      refreshCalendar();
    }
  };
  
  const handleOpenTravelingForm = () => {
    setOpenTravelingForm(true);
  };
  
  const handleCloseTravelingForm = (refresh = false) => {
    setOpenTravelingForm(false);
    if (refresh) {
      refreshCalendar();
    }
  };
  
  const handleOpenReservationForm = (type: 'theater' | 'traveling', id: string) => {
    setSelectedFunctionType(type);
    setSelectedFunctionId(id);
    setOpenReservationForm(true);
  };
  
  const handleCloseReservationForm = (refresh = false) => {
    setOpenReservationForm(false);
    setSelectedFunctionType(null);
    setSelectedFunctionId(null);
    if (refresh) {
      fetchReservations(
        events.filter(e => e.type === 'theater'),
        events.filter(e => e.type === 'traveling')
      );
    }
  };
  
  const handleExportPDF = () => {
    if (selectedDate) {
      exportToPDF(
        selectedDate,
        theaterFunctions,
        theaterReservations,
        travelingFunctions,
        travelingReservations
      );
    }
  };
  
  const handleExportExcel = () => {
    if (selectedDate) {
      exportToExcel(
        selectedDate,
        theaterFunctions,
        theaterReservations,
        travelingFunctions,
        travelingReservations
      );
    }
  };
  
  if (!selectedDate) {
    return (
      <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
        <Typography variant="subtitle1" color="textSecondary" align="center" sx={{ mt: 4 }}>
          Selecciona un día en el calendario para ver sus detalles
        </Typography>
      </Paper>
    );
  }
  
  const formattedDate = selectedDate.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const modalityMap: Record<string, string> = {
    '1': '1 función',
    '2': '2 funciones en el mismo turno',
    '3': '1 función en cada turno',
    '4': '4 funciones'
  };

  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2" sx={{ textTransform: 'capitalize' }}>
          {formattedDate}
        </Typography>
        
        <Box>
          <Tooltip title="Exportar a PDF">
            <IconButton onClick={handleExportPDF}>
              <DescriptionIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Exportar a Excel">
            <IconButton onClick={handleExportExcel}>
              <TableChartIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Funciones Teatro" />
        <Tab label="Funciones Viajeras" />
      </Tabs>
      
      {tabValue === 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">Funciones en Teatro</Typography>
            
            {isAdmin && (
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={handleOpenTheaterForm}
                size="small"
              >
                Nueva Función
              </Button>
            )}
          </Box>
          
          {theaterFunctions.length === 0 ? (
            <Typography color="textSecondary" sx={{ my: 2 }}>
              No hay funciones de teatro en esta fecha
            </Typography>
          ) : (
            theaterFunctions.map((theaterFunction) => (
              <Paper key={theaterFunction.id} elevation={1} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">
                    Sala: {theaterFunction.roomName}
                    {theaterFunction.time && ` - ${theaterFunction.time}`}
                  </Typography>
                  
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={() => handleOpenReservationForm('theater', theaterFunction.id)}
                  >
                    Agregar Reserva
                  </Button>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {theaterReservations[theaterFunction.id]?.length || 0} reservas
                </Typography>
                
                {theaterReservations[theaterFunction.id]?.length > 0 ? (
                  <List dense>
                    {theaterReservations[theaterFunction.id].map((reservation) => (
                      <ListItem key={reservation.id}>
                        <ListItemText
                          primary={reservation.schoolName}
                          secondary={`${reservation.studentCount} alumnos, ${reservation.companionCount} acompañantes - Tel: ${reservation.phoneNumber}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Sin reservas
                  </Typography>
                )}
              </Paper>
            ))
          )}
        </>
      )}
      
      {tabValue === 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">Funciones Viajeras</Typography>
            
            {isAdmin && (
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={handleOpenTravelingForm}
                size="small"
              >
                Nueva Función
              </Button>
            )}
          </Box>
          
          {travelingFunctions.length === 0 ? (
            <Typography color="textSecondary" sx={{ my: 2 }}>
              No hay funciones viajeras en esta fecha
            </Typography>
          ) : (
            travelingFunctions.map((travelingFunction) => (
              <Paper key={travelingFunction.id} elevation={1} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1">
                      Modalidad: {modalityMap[travelingFunction.modalityType] || 'Sin especificar'}
                    </Typography>
                  </Box>
                  
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={() => handleOpenReservationForm('traveling', travelingFunction.id)}
                  >
                    Agregar Reserva
                  </Button>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {travelingReservations[travelingFunction.id]?.length || 0} reservas
                </Typography>
                
                {travelingReservations[travelingFunction.id]?.length > 0 ? (
                  <List dense>
                    {travelingReservations[travelingFunction.id].map((reservation) => (
                      <ListItem key={reservation.id}>
                        <ListItemText
                          primary={reservation.schoolName}
                          secondary={`${reservation.address} - Tel: ${reservation.phoneNumber}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Sin reservas
                  </Typography>
                )}
              </Paper>
            ))
          )}
        </>
      )}
      
      {/* Theater Function Form Dialog */}
      <Dialog open={openTheaterForm} onClose={() => handleCloseTheaterForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Función de Teatro</DialogTitle>
        <DialogContent>
          <TheaterFunctionForm 
            date={selectedDate} 
            onSuccess={() => handleCloseTheaterForm(true)} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCloseTheaterForm(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
      
      {/* Traveling Function Form Dialog */}
      <Dialog open={openTravelingForm} onClose={() => handleCloseTravelingForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Función Viajera</DialogTitle>
        <DialogContent>
          <TravelingFunctionForm 
            date={selectedDate} 
            onSuccess={() => handleCloseTravelingForm(true)} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCloseTravelingForm(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
      
      {/* Reservation Form Dialog */}
      <Dialog open={openReservationForm} onClose={() => handleCloseReservationForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Nueva Reserva para {selectedFunctionType === 'theater' ? 'Teatro' : 'Función Viajera'}
        </DialogTitle>
        <DialogContent>
          {selectedFunctionType && selectedFunctionId && (
            <ReservationForm 
              functionType={selectedFunctionType}
              functionId={selectedFunctionId}
              onSuccess={() => handleCloseReservationForm(true)} 
              functionDetails={
                selectedFunctionType === 'theater' 
                  ? theaterFunctions.find(f => f.id === selectedFunctionId) 
                  : travelingFunctions.find(f => f.id === selectedFunctionId)
              }
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCloseReservationForm(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DayDetails; 