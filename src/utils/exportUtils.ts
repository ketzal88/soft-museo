import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// Define common interfaces for both theater and traveling functions
export interface ReservationBase {
  id: string;
  schoolName: string;
  email: string;
  phoneNumber: string;
}

export interface TheaterReservation extends ReservationBase {
  studentCount: number;
  companionCount: number;
}

export interface TravelingReservation extends ReservationBase {
  address: string;
  functionType: '1' | '2' | '3' | '4'; // 1 function, 2 functions same session, 1 in each session, 4 functions
}

export interface FunctionBase {
  id: string;
  date: Date;
}

export interface TheaterFunction extends FunctionBase {
  roomId: string;
  roomName?: string;
  time?: string;
  capacity: number;
}

export interface TravelingFunction extends FunctionBase {
  modalityType: '1' | '2' | '3' | '4';
}

// Helper for date formatting
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Export to PDF
export const exportToPDF = (
  date: Date,
  theaterFunctions: TheaterFunction[],
  theaterReservations: Record<string, TheaterReservation[]>,
  travelingFunctions: TravelingFunction[],
  travelingReservations: Record<string, TravelingReservation[]>
): void => {
  const formattedDate = formatDate(date);
  const doc = new jsPDF();
  let yPosition = 10;
  
  // Title
  doc.setFontSize(16);
  doc.text(`Reservas para el día ${formattedDate}`, 10, yPosition);
  yPosition += 10;
  
  // Theater functions section
  if (theaterFunctions.length > 0) {
    doc.setFontSize(14);
    doc.text('Funciones en Teatro', 10, yPosition);
    yPosition += 10;
    
    theaterFunctions.forEach((theaterFunction, index) => {
      const functionTime = theaterFunction.time ? ` - ${theaterFunction.time}` : '';
      doc.setFontSize(12);
      doc.text(`Sala: ${theaterFunction.roomName || 'Sin nombre'} ${functionTime}`, 10, yPosition);
      yPosition += 7;
      
      const reservations = theaterReservations[theaterFunction.id] || [];
      if (reservations.length === 0) {
        doc.setFontSize(10);
        doc.text('No hay reservas para esta función', 15, yPosition);
        yPosition += 7;
      } else {
        // Header
        doc.setFontSize(10);
        doc.text('Escuela', 15, yPosition);
        doc.text('Alumnos', 100, yPosition);
        doc.text('Acompañantes', 125, yPosition);
        doc.text('Teléfono', 170, yPosition);
        yPosition += 7;
        
        // Reservations
        reservations.forEach(reservation => {
          doc.text(reservation.schoolName.substring(0, 40), 15, yPosition);
          doc.text(reservation.studentCount.toString(), 100, yPosition);
          doc.text(reservation.companionCount.toString(), 125, yPosition);
          doc.text(reservation.phoneNumber, 170, yPosition);
          yPosition += 7;
          
          // Check if we need a new page
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 10;
          }
        });
      }
      
      yPosition += 5;
      
      // Check if we need a new page for the next function
      if (yPosition > 260 && index < theaterFunctions.length - 1) {
        doc.addPage();
        yPosition = 10;
      }
    });
  }
  
  // Check if we need a new page for traveling functions
  if (theaterFunctions.length > 0 && travelingFunctions.length > 0 && yPosition > 240) {
    doc.addPage();
    yPosition = 10;
  }
  
  // Traveling functions section
  if (travelingFunctions.length > 0) {
    doc.setFontSize(14);
    doc.text('Funciones Viajeras', 10, yPosition);
    yPosition += 10;
    
    travelingFunctions.forEach((travelingFunction, index) => {
      const modalityMap: Record<string, string> = {
        '1': '1 función',
        '2': '2 funciones en el mismo turno',
        '3': '1 función en cada turno',
        '4': '4 funciones'
      };
      
      doc.setFontSize(12);
      doc.text(`Modalidad: ${modalityMap[travelingFunction.modalityType]}`, 10, yPosition);
      yPosition += 7;
      
      const reservations = travelingReservations[travelingFunction.id] || [];
      if (reservations.length === 0) {
        doc.setFontSize(10);
        doc.text('No hay reservas para esta función', 15, yPosition);
        yPosition += 7;
      } else {
        // Header
        doc.setFontSize(10);
        doc.text('Escuela', 15, yPosition);
        doc.text('Dirección', 90, yPosition);
        doc.text('Teléfono', 170, yPosition);
        yPosition += 7;
        
        // Reservations
        reservations.forEach(reservation => {
          doc.text(reservation.schoolName.substring(0, 30), 15, yPosition);
          doc.text(reservation.address.substring(0, 40), 90, yPosition);
          doc.text(reservation.phoneNumber, 170, yPosition);
          yPosition += 7;
          
          // Check if we need a new page
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 10;
          }
        });
      }
      
      yPosition += 5;
      
      // Check if we need a new page for the next function
      if (yPosition > 260 && index < travelingFunctions.length - 1) {
        doc.addPage();
        yPosition = 10;
      }
    });
  }
  
  // Save the PDF
  doc.save(`reservas_${date.toISOString().split('T')[0]}.pdf`);
};

// Export to Excel
export const exportToExcel = (
  date: Date,
  theaterFunctions: TheaterFunction[],
  theaterReservations: Record<string, TheaterReservation[]>,
  travelingFunctions: TravelingFunction[],
  travelingReservations: Record<string, TravelingReservation[]>
): void => {
  const formattedDate = formatDate(date);
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  
  // Theater functions data
  const theaterData: any[] = [];
  
  theaterFunctions.forEach(theaterFunction => {
    const reservations = theaterReservations[theaterFunction.id] || [];
    
    if (reservations.length === 0) {
      theaterData.push({
        'Sala': theaterFunction.roomName || 'Sin nombre',
        'Horario': theaterFunction.time || 'No especificado',
        'Escuela': 'No hay reservas',
        'Alumnos': '',
        'Acompañantes': '',
        'Email': '',
        'Teléfono': ''
      });
    } else {
      reservations.forEach(reservation => {
        theaterData.push({
          'Sala': theaterFunction.roomName || 'Sin nombre',
          'Horario': theaterFunction.time || 'No especificado',
          'Escuela': reservation.schoolName,
          'Alumnos': reservation.studentCount,
          'Acompañantes': reservation.companionCount,
          'Email': reservation.email,
          'Teléfono': reservation.phoneNumber
        });
      });
    }
  });
  
  // Traveling functions data
  const travelingData: any[] = [];
  
  travelingFunctions.forEach(travelingFunction => {
    const reservations = travelingReservations[travelingFunction.id] || [];
    const modalityMap: Record<string, string> = {
      '1': '1 función',
      '2': '2 funciones en el mismo turno',
      '3': '1 función en cada turno',
      '4': '4 funciones'
    };
    
    if (reservations.length === 0) {
      travelingData.push({
        'Modalidad': modalityMap[travelingFunction.modalityType],
        'Escuela': 'No hay reservas',
        'Dirección': '',
        'Email': '',
        'Teléfono': ''
      });
    } else {
      reservations.forEach(reservation => {
        travelingData.push({
          'Modalidad': modalityMap[travelingFunction.modalityType],
          'Escuela': reservation.schoolName,
          'Dirección': reservation.address,
          'Email': reservation.email,
          'Teléfono': reservation.phoneNumber
        });
      });
    }
  });
  
  // Add worksheets to workbook
  if (theaterData.length > 0) {
    const theaterSheet = XLSX.utils.json_to_sheet(theaterData);
    XLSX.utils.book_append_sheet(workbook, theaterSheet, 'Funciones Teatro');
  }
  
  if (travelingData.length > 0) {
    const travelingSheet = XLSX.utils.json_to_sheet(travelingData);
    XLSX.utils.book_append_sheet(workbook, travelingSheet, 'Funciones Viajeras');
  }
  
  // Write the workbook
  XLSX.writeFile(workbook, `reservas_${date.toISOString().split('T')[0]}.xlsx`);
}; 