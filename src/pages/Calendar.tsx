import { useState, useEffect } from 'react';
import { Container, Grid, Alert } from '@mui/material';
import CalendarView from '../components/CalendarView';
import DayDetails from '../components/DayDetails';
import { UserRole } from '../services/auth';

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

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.OPERATOR);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Get the user from localStorage
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserRole(user.role as UserRole);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        setError('Error al cargar la información del usuario. Por favor, vuelva a iniciar sesión.');
      }
    }
  }, []);
  
  const handleDaySelected = (date: Date, events: CalendarEvent[]) => {
    setSelectedDate(date);
    setSelectedEvents(events);
  };
  
  const handleRefreshCalendar = () => {
    // Reset and the CalendarView will reload events
    setSelectedDate(null);
    setSelectedEvents([]);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <CalendarView onDaySelected={handleDaySelected} />
        </Grid>
        <Grid item xs={12} md={4}>
          <DayDetails 
            selectedDate={selectedDate}
            events={selectedEvents}
            userRole={userRole}
            refreshCalendar={handleRefreshCalendar}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Calendar; 