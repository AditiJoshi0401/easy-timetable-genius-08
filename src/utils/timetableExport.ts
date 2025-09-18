import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { getSubjectColor, isColorDark } from '@/utils/subjectColors';
// Helper to generate export file name
function generateExportFileName(type: 'PDF' | 'Excel' | 'JSON', details: string) {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateStr = `${pad(now.getDate())}_${pad(now.getMonth() + 1)}_${now.getFullYear()}`;
  return `${dateStr}_TimeTable_${details}.${type === 'PDF' ? 'pdf' : type === 'Excel' ? 'xlsx' : 'json'}`;
}

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

export const exportTimetableToPDF = async (timetableData: TimetableExportData, domElement?: HTMLElement | null): Promise<void> => {
  // If a DOM element is provided, prefer rendering the exact UI and converting to PDF via html2canvas
  if (domElement) {
    try {
      const html2canvas = await import('html2canvas');
      // Use a high scale for better quality and capture full element
      const canvas = await html2canvas.default(domElement, { scale: 2, useCORS: true, scrollY: -window.scrollY });
      const imgData = canvas.toDataURL('image/png');
      // Set PDF size to match image size (in px)
      const pdfWidth = canvas.width;
      const pdfHeight = canvas.height;
      const pdf = new jsPDF({ orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait', unit: 'px', format: [pdfWidth, pdfHeight] });
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const fileName = generateExportFileName('PDF', timetableData.entityName || timetableData.name);
      pdf.save(fileName);
      return;
    } catch (err) {
      console.warn('html2canvas PDF export failed or not available, falling back to table PDF export', err);
      // fallthrough to autoTable fallback
    }
  }

  // Fallback: construct a simple autoTable-based PDF (no DOM capture)
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(16);
  doc.text(`${timetableData.name}${timetableData.entityName ? ` - ${timetableData.entityName}` : ''}`, 14, 20);

  const OFFICIAL_DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dataDays = OFFICIAL_DAYS_ORDER.filter(day => timetableData.data && timetableData.data[day]);

  const allPeriodsSet = new Set<string>();
  if (timetableData.data) {
    for (const d of Object.keys(timetableData.data)) {
      const daySlots = timetableData.data[d] || {};
      Object.keys(daySlots).forEach(p => allPeriodsSet.add(p));
    }
  }

  const OFFICIAL_TIME_SLOTS_ORDER = [
    '9:30 - 10:30', '10:30 - 11:30', '11:30 - 12:30', '12:30 - 1:30', '1:30 - 2:30', '2:30 - 3:30', '3:30 - 4:30', '4:30 - 5:30'
  ];

  const allPeriods = Array.from(allPeriodsSet);
  const periods = allPeriods.sort((a, b) => {
    const ia = OFFICIAL_TIME_SLOTS_ORDER.indexOf(a);
    const ib = OFFICIAL_TIME_SLOTS_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });

  const head = ['Period', ...dataDays];
  const body: any[] = [];

  for (const period of periods) {
    const row: any[] = [period];
    for (const day of dataDays) {
      const slot = timetableData.data?.[day]?.[period] || null;
      if (!slot) row.push('');
      else {
        const parts: string[] = [];
        if (slot.subject) parts.push(typeof slot.subject === 'object' ? slot.subject.name : slot.subject);
        if (slot.teacher) parts.push(typeof slot.teacher === 'object' ? slot.teacher.name : slot.teacher);
        if (slot.rooms && Array.isArray(slot.rooms)) parts.push('Rooms: ' + slot.rooms.map((r: any) => typeof r === 'string' ? r : r.number || r.id).join(', '));
        else if (slot.room) parts.push('Room: ' + (typeof slot.room === 'object' ? slot.room.number || slot.room.id : slot.room));
        if (slot.type) parts.push('Type: ' + slot.type);
        row.push(parts.join('\n'));
      }
    }
    body.push(row);
  }

  (doc as any).autoTable({
    head: [head],
    body,
    startY: 30,
    styles: { fontSize: 9, cellPadding: 4, textColor: [0, 0, 0] },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    didParseCell: function (data: any) {
      if (data.section === 'body' && data.column.index > 0 && data.cell.raw) {
        const rawText = String(data.cell.raw);
        const firstLine = rawText.split('\n')[0];
        const color = getSubjectColor(firstLine) || '#FFFFFF';
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        data.cell.styles.fillColor = [r, g, b];
        data.cell.styles.textColor = isColorDark(color) ? 255 : 0;
      }
    }
  });
  const fileName = `${timetableData.name.replace(/\s+/g, '_')}_${timetableData.type}${timetableData.entityName ? `_${timetableData.entityName.replace(/\s+/g, '_')}` : ''}.pdf`;
  doc.save(fileName);
};

export const exportTimetableToExcel = (timetableData: TimetableExportData, fileNameDetails: string = ""): void => {
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

  // Data cell styling and fills based on subject color, with font color contrast
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_ref = XLSX.utils.encode_cell({ c: C, r: R });
      const cell = ws[cell_ref];
      if (!cell) continue;
      cell.s = cell.s || {};
      cell.s.alignment = { wrapText: true, vertical: 'center', horizontal: 'center' };
      if (C > 0 && cell.v && typeof cell.v === 'string' && cell.v.trim() !== '') {
        const firstLine = (cell.v as string).split('\n')[0];
        const color = getSubjectColor(firstLine) || '#FFFFFF';
        const rgb = color.replace('#', '').toUpperCase();
        cell.s.fill = { fgColor: { rgb: `FF${rgb}` } };
        cell.s.font = { color: { rgb: isColorDark(color) ? 'FFFFFFFF' : 'FF000000' }, bold: true };
      }
    }
  }

  // Add worksheet to workbook
  const sheetName = `${timetableData.type}_timetable`;
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // File name
  const fileName = generateExportFileName('Excel', fileNameDetails || timetableData.entityName || timetableData.name);
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