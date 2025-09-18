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

  // Determine days (use official ordering but only include days present in data)
  const OFFICIAL_DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dataDays = OFFICIAL_DAYS_ORDER.filter(day => timetableData.data && timetableData.data[day]);

  // Determine periods (collect all periods and sort according to official order)
  const OFFICIAL_TIME_SLOTS_ORDER = [
    '9:30 - 10:30',
    '10:30 - 11:30',
    '11:30 - 12:30',
    '12:30 - 1:30',
    '1:30 - 2:30',
    '2:30 - 3:30',
    '3:30 - 4:30',
    '4:30 - 5:30'
  ];

  const allPeriodsSet = new Set<string>();
  if (timetableData.data) {
    for (const d of Object.keys(timetableData.data)) {
      const daySlots = timetableData.data[d] || {};
      Object.keys(daySlots).forEach(p => allPeriodsSet.add(p));
    }
  }

  const allPeriods = Array.from(allPeriodsSet);
  const periods = allPeriods.sort((a, b) => {
    const ia = OFFICIAL_TIME_SLOTS_ORDER.indexOf(a);
    const ib = OFFICIAL_TIME_SLOTS_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });

  // Subject color palette (same feel as UI)
  const SUBJECT_COLORS = [
    '#F2FCE2', '#FEF7CD', '#FEC6A1', '#E5DEFF', '#FFDEE2', '#FDE1D3', '#D3E4FD', '#F1F0FB', '#E0F2F1', '#EDE7F6', '#FFF3E0', '#E8F5E9', '#F3E5F5', '#E1F5FE', '#FFF8E1'
  ];

  const subjectColorMap = new Map<string, string>();
  const getSubjectColor = (subject: any) => {
    const subjectId = typeof subject === 'string' ? subject : subject?.id || subject?.name;
    if (!subjectId) return '#FFFFFF';
    if (!subjectColorMap.has(subjectId)) {
      const idx = subjectColorMap.size % SUBJECT_COLORS.length;
      subjectColorMap.set(subjectId, SUBJECT_COLORS[idx]);
    }
    return subjectColorMap.get(subjectId) as string;
  };

  // Build AOA (array of arrays) with header
  const aoa: any[] = [];
  const header = ['Period', ...dataDays];
  aoa.push(header);

  // Helper to create cell text
  const buildCellText = (slot: any) => {
    if (!slot) return '';
    const parts: string[] = [];
    if (slot.subject) parts.push(typeof slot.subject === 'object' ? slot.subject.name : slot.subject);
    if (slot.teacher) parts.push(typeof slot.teacher === 'object' ? slot.teacher.name : slot.teacher);
    if (slot.rooms && Array.isArray(slot.rooms)) {
      parts.push('Rooms: ' + slot.rooms.map((r: any) => typeof r === 'string' ? r : r.number || r.id).join(', '));
    } else if (slot.room) {
      parts.push('Room: ' + (typeof slot.room === 'object' ? slot.room.number || slot.room.id : slot.room));
    }
    if (slot.type) parts.push('Type: ' + slot.type);
    if (slot.stream || slot.division || slot.year) {
      const meta: string[] = [];
      if (slot.stream) meta.push(slot.stream);
      if (slot.division) meta.push(slot.division);
      if (slot.year) meta.push('Year ' + slot.year);
      parts.push(meta.join(' - '));
    }
    return parts.join('\n');
  };

  // Build rows
  for (const period of periods) {
    const row: any[] = [period];
    for (const day of dataDays) {
      const slot = timetableData.data?.[day]?.[period] || null;
      row.push(buildCellText(slot));
    }
    aoa.push(row);
  }

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Apply styles: header bold + fill, set column widths, wrap text, apply subject cell fills
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');

  // Column widths: first column wider for period
  ws['!cols'] = [{ wch: 18 }, ...dataDays.map(() => ({ wch: 30 }))];

  // Header styling
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell_address = { c: C, r: 0 };
    const cell_ref = XLSX.utils.encode_cell(cell_address);
    const cell = ws[cell_ref];
    if (cell) {
      cell.s = cell.s || {};
      cell.s.font = { bold: true };
      cell.s.fill = { fgColor: { rgb: 'FF2980B9' } }; // bluish header
      cell.s.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
      cell.s.font = { color: { rgb: 'FFFFFFFF' }, bold: true };
    }
  }

  // Data cell styling and fills based on subject color
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_ref = XLSX.utils.encode_cell({ c: C, r: R });
      const cell = ws[cell_ref];
      if (!cell) continue;

      // Wrap text and center
      cell.s = cell.s || {};
      cell.s.alignment = { wrapText: true, vertical: 'center', horizontal: 'center' };

      // If this is a subject cell (non-empty and not the period column), try to pick color
      if (C > 0 && cell.v && typeof cell.v === 'string' && cell.v.trim() !== '') {
        // Try to extract the subject name from first line
        const firstLine = (cell.v as string).split('\n')[0];
        const color = getSubjectColor(firstLine) || '#FFFFFF';
        const rgb = color.replace('#', '').toUpperCase();
        // Excel expects ARGB
        cell.s.fill = { fgColor: { rgb: `FF${rgb}` } };
      }
    }
  }

  // Add worksheet to workbook
  const sheetName = `${timetableData.type}_timetable`;
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // File name
  const fileName = `${timetableData.name.replace(/\s+/g, '_')}_${timetableData.type}${timetableData.entityName ? `_${timetableData.entityName.replace(/\s+/g, '_')}` : ''}.xlsx`;
  // Write file
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