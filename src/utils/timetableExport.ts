import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Extend jsPDF to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface TimetableExportData {
  name: string;
  data: any;
  type: 'division' | 'teacher' | 'room';
  entityName?: string;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timeSlots = [
  '09:00-10:00',
  '10:00-11:00', 
  '11:30-12:30',
  '12:30-13:30',
  '14:30-15:30',
  '15:30-16:30'
];

export const exportTimetableToPDF = (timetableData: TimetableExportData): void => {
  const doc = new jsPDF('landscape');
  
  // Title
  doc.setFontSize(16);
  doc.text(`${timetableData.name}${timetableData.entityName ? ` - ${timetableData.entityName}` : ''}`, 14, 20);
  
  // Prepare table data
  const tableData = [];
  
  // Header row
  const headers = ['Time', ...daysOfWeek];
  
  // Data rows
  for (const timeSlot of timeSlots) {
    const row = [timeSlot];
    
    for (const day of daysOfWeek) {
      const slot = timetableData.data?.[day]?.[timeSlot];
      if (slot) {
        let cellContent = '';
        if (slot.subject) {
          cellContent += typeof slot.subject === 'object' ? slot.subject.name : slot.subject;
        }
        if (slot.teacher && timetableData.type !== 'teacher') {
          cellContent += `\n${typeof slot.teacher === 'object' ? slot.teacher.name : slot.teacher}`;
        }
        if (slot.room && timetableData.type !== 'room') {
          cellContent += `\n${typeof slot.room === 'object' ? slot.room.number : slot.room}`;
        }
        row.push(cellContent.trim());
      } else {
        row.push('');
      }
    }
    
    tableData.push(row);
  }
  
  // Generate table
  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: 30,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
    },
    columnStyles: {
      0: { cellWidth: 25 }
    },
    margin: { top: 30 }
  });
  
  // Save the PDF
  const fileName = `${timetableData.name.replace(/\s+/g, '_')}_${timetableData.type}${timetableData.entityName ? `_${timetableData.entityName.replace(/\s+/g, '_')}` : ''}.pdf`;
  doc.save(fileName);
};

export const exportTimetableToExcel = (timetableData: TimetableExportData): void => {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Prepare data for Excel
  const excelData = [];
  
  // Header row
  excelData.push(['Time', ...daysOfWeek]);
  
  // Data rows
  for (const timeSlot of timeSlots) {
    const row = [timeSlot];
    
    for (const day of daysOfWeek) {
      const slot = timetableData.data?.[day]?.[timeSlot];
      if (slot) {
        let cellContent = '';
        if (slot.subject) {
          cellContent += typeof slot.subject === 'object' ? slot.subject.name : slot.subject;
        }
        if (slot.teacher && timetableData.type !== 'teacher') {
          cellContent += `\n${typeof slot.teacher === 'object' ? slot.teacher.name : slot.teacher}`;
        }
        if (slot.room && timetableData.type !== 'room') {
          cellContent += `\n${typeof slot.room === 'object' ? slot.room.number : slot.room}`;
        }
        row.push(cellContent.trim());
      } else {
        row.push('');
      }
    }
    
    excelData.push(row);
  }
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(excelData);
  
  // Add worksheet to workbook
  const sheetName = `${timetableData.type}_timetable`;
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Save the Excel file
  const fileName = `${timetableData.name.replace(/\s+/g, '_')}_${timetableData.type}${timetableData.entityName ? `_${timetableData.entityName.replace(/\s+/g, '_')}` : ''}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportTimetableToJSON = (timetableData: TimetableExportData): void => {
  const jsonData = {
    name: timetableData.name,
    type: timetableData.type,
    entityName: timetableData.entityName,
    data: timetableData.data,
    exportedAt: new Date().toISOString()
  };
  
  const dataStr = JSON.stringify(jsonData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${timetableData.name.replace(/\s+/g, '_')}_${timetableData.type}${timetableData.entityName ? `_${timetableData.entityName.replace(/\s+/g, '_')}` : ''}.json`;
  link.click();
  URL.revokeObjectURL(url);
};