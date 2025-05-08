import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  Paper,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { TheaterFunction, TravelingFunction } from '../utils/exportUtils';
import { getTheaterFunctionsByDate, getTravelingFunctionsByDate } from '../services/firebase';

// Setup localizer
moment.locale('es');
const localizer = momentLocalizer(moment);

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

interface CalendarViewProps {
  onDaySelected: (date: Date, events: CalendarEvent[]) => void;
}

const CalendarView = ({ onDaySelected }: CalendarViewProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [view, setView] = useState<string>(isMobile ? Views.AGENDA : Views.MONTH);
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    fetchEvents(new Date());
  }, []);

  const fetchEvents = async (currentDate: Date) => {
    try {
      // We'll fetch events for the current month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const allEvents: CalendarEvent[] = [];
      
      // Get all days in the month
      const daysInMonth = endOfMonth.getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        
        // Fetch theater functions
        const theaterFunctions = await getTheaterFunctionsByDate(currentDay);
        // Fetch traveling functions
        const travelingFunctions = await getTravelingFunctionsByDate(currentDay);
        
        // Transform to calendar events
        if (theaterFunctions.length > 0) {
          theaterFunctions.forEach((theaterFunction: any) => {
            const eventDate = theaterFunction.date.toDate ? 
              theaterFunction.date.toDate() : 
              new Date(theaterFunction.date);
              
            const endDate = new Date(eventDate);
            endDate.setHours(eventDate.getHours() + 1); // Default 1 hour duration
            
            allEvents.push({
              id: `theater-${theaterFunction.id}`,
              title: `Teatro - ${theaterFunction.roomName || 'Sala'}`,
              start: eventDate,
              end: endDate,
              type: 'theater',
              theaterId: theaterFunction.id,
              room: theaterFunction.roomName
            });
          });
        }
        
        if (travelingFunctions.length > 0) {
          travelingFunctions.forEach((travelingFunction: any) => {
            const eventDate = travelingFunction.date.toDate ? 
              travelingFunction.date.toDate() : 
              new Date(travelingFunction.date);
              
            const endDate = new Date(eventDate);
            endDate.setHours(eventDate.getHours() + 1); // Default 1 hour duration
            
            const modalityMap: Record<string, string> = {
              '1': '1 función',
              '2': '2 funciones (mismo turno)',
              '3': '1 función por turno',
              '4': '4 funciones'
            };
            
            allEvents.push({
              id: `traveling-${travelingFunction.id}`,
              title: `Viajera - ${modalityMap[travelingFunction.modalityType] || 'Sin especificar'}`,
              start: eventDate,
              end: endDate,
              type: 'traveling',
              travelingId: travelingFunction.id,
              modalityType: travelingFunction.modalityType
            });
          });
        }
      }
      
      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
    if (newDate.getMonth() !== date.getMonth() || 
        newDate.getFullYear() !== date.getFullYear()) {
      fetchEvents(newDate);
    }
  };

  const handleSelectView = (_: React.MouseEvent<HTMLElement>, newView: string | null) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    // When a day is clicked, we find all events for that day
    const dayStart = new Date(start);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(start);
    dayEnd.setHours(23, 59, 59, 999);
    
    const dailyEvents = events.filter(
      event => event.start >= dayStart && event.start <= dayEnd
    );
    
    onDaySelected(dayStart, dailyEvents);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '';
    
    if (event.type === 'theater') {
      backgroundColor = theme.palette.primary.main;
    } else if (event.type === 'traveling') {
      backgroundColor = theme.palette.secondary.main;
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        color: '#fff',
        border: 'none',
        display: 'block'
      }
    };
  };

  const views = isMobile 
    ? { agenda: true, day: true } 
    : { month: true, week: true, day: true, agenda: true };

  return (
    <Paper elevation={3} sx={{ p: 2, height: 'calc(100vh - 160px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Calendario</Typography>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleSelectView}
          aria-label="calendar view"
          size="small"
        >
          {!isMobile && (
            <ToggleButton value={Views.MONTH} aria-label="month view">
              Mes
            </ToggleButton>
          )}
          <ToggleButton value={Views.AGENDA} aria-label="agenda view">
            Agenda
          </ToggleButton>
          <ToggleButton value={Views.DAY} aria-label="day view">
            Día
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100% - 50px)' }}
        views={views}
        view={view as any}
        onView={(newView) => setView(newView)}
        date={date}
        onNavigate={handleNavigate}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={(event) => handleSelectSlot({ start: event.start })}
        eventPropGetter={eventStyleGetter}
        popup
        messages={{
          today: 'Hoy',
          previous: 'Anterior',
          next: 'Siguiente',
          month: 'Mes',
          week: 'Semana',
          day: 'Día',
          agenda: 'Agenda',
          date: 'Fecha',
          time: 'Hora',
          event: 'Evento',
          noEventsInRange: 'No hay eventos en este período',
          showMore: (total) => `+ ${total} más`
        }}
      />
    </Paper>
  );
};

export default CalendarView; 