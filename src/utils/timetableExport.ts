import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { getSubjectColor } from '@/utils/subjectColors';

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
      const canvas = await html2canvas.default(domElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape' });

      // Fit image to PDF width while preserving aspect
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeightAvailable = pdf.internal.pageSize.getHeight() - 20; // leave top margin

      const img = new Image();
      img.src = imgData;
      await new Promise((res) => (img.onload = res));

      // Source canvas pixel dimensions
      const srcW = canvas.width;
      const srcH = canvas.height;

      // Destination width in PDF points
      const dstW = pdfWidth;
      const dstHTotal = (srcH * dstW) / srcW;

      if (dstHTotal <= pdfHeightAvailable) {
        // Fits on one page
        pdf.addImage(imgData, 'PNG', 0, 10, dstW, dstHTotal);
      } else {
        // Need to split into multiple pages vertically.
        // Compute height in source pixels that maps to one PDF page
        const pxPerPdfPoint = srcW / dstW; // source pixels per PDF point horizontally
        const pagePxHeight = Math.floor(pdfHeightAvailable * pxPerPdfPoint);

        let offsetY = 0;
        let page = 0;
        while (offsetY < srcH) {
          // Create a temp canvas for the page slice
          const tmpCanvas = document.createElement('canvas');
          tmpCanvas.width = srcW;
          tmpCanvas.height = Math.min(pagePxHeight, srcH - offsetY);
          const ctx = tmpCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
            ctx.drawImage(canvas, 0, offsetY, srcW, tmpCanvas.height, 0, 0, srcW, tmpCanvas.height);
          }
          const pageImg = tmpCanvas.toDataURL('image/png');
          const pageDstH = (tmpCanvas.height * dstW) / srcW;
          if (page > 0) pdf.addPage();
          pdf.addImage(pageImg, 'PNG', 0, 10, dstW, pageDstH);
          offsetY += tmpCanvas.height;
          page++;
        }
      }

      const fileName = `${timetableData.name.replace(/\s+/g, '_')}_${timetableData.type}${timetableData.entityName ? `_${timetableData.entityName.replace(/\s+/g, '_')}` : ''}.pdf`;
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
        data.cell.styles.textColor = [0, 0, 0];
      }
    }
  });
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