import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logoBase64 } from './logoBase64';

export function downloadCsv(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? '';
          const escaped = String(value).replaceAll('"', '""');
          return `"${escaped}"`;
        })
        .join(',')
    )
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function printCurrentPage() {
  window.print();
}

export function downloadPdf(filename, rows) {
  if (!rows.length) return;
  const doc = new jsPDF('landscape');
  const headers = Object.keys(rows[0]);
  
  const data = rows.map(row => headers.map(h => {
    let val = row[h] ?? '';
    if (typeof val === 'number') {
      const isMoney = h.toLowerCase().includes('balance') || h.toLowerCase().includes('debit') || h.toLowerCase().includes('credit') || h.toLowerCase().includes('amount') || h.toLowerCase().includes('outstanding') || h.toLowerCase().includes('limit');
      if (isMoney) return 'Rs. ' + val.toLocaleString('en-IN');
      return val.toString();
    }
    return String(val);
  }));

  const reportTitle = filename.replace('.pdf', '').toUpperCase().replace(/-/g, ' ');
  const dateStr = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  // --- IMAGE LOGO ---
  doc.addImage(logoBase64, 'PNG', 14, 14, 18, 18);

  // --- HEADER TEXT ---
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('GANGA MAXX CREDIT', 38, 24);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('123 Financial District, Tech Park', 38, 30);
  doc.text('Hyderabad, TG 500032 | GSTIN: 29XXXXX1234X1Z5', 38, 35);

  // --- REPORT DETAILS (Right Side) ---
  const pageWidth = doc.internal.pageSize.width;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(reportTitle, pageWidth - 14, 24, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${dateStr}`, pageWidth - 14, 30, { align: 'right' });
  doc.text('Status: OFFICIAL REPORT', pageWidth - 14, 35, { align: 'right' });

  // --- DIVIDER LINE ---
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(14, 42, pageWidth - 14, 42);

  // --- COLUMN ALIGNMENT ---
  const colStyles = {};
  headers.forEach((h, i) => {
    const text = h.toLowerCase();
    if (text.includes('balance') || text.includes('debit') || text.includes('credit') || text.includes('amount') || text.includes('outstanding') || text.includes('limit')) {
      colStyles[i] = { halign: 'right' };
    }
  });

  // --- STYLED DATA TABLE ---
  autoTable(doc, {
    head: [headers.map(h => h.replace(/_/g, ' ').toUpperCase())],
    body: data,
    startY: 48,
    theme: 'grid',
    styles: { 
      fontSize: 9, 
      cellPadding: 6,
      textColor: [51, 65, 85], // slate-700
      font: 'helvetica',
      lineColor: [241, 245, 249], // slate-100
      lineWidth: 0.5
    },
    headStyles: { 
      fillColor: [248, 250, 252], // slate-50
      textColor: [15, 23, 42], // slate-900
      fontStyle: 'bold',
      lineColor: [226, 232, 240], // slate-200
      lineWidth: { bottom: 1, top: 0, left: 0, right: 0 }
    },
    alternateRowStyles: { 
      fillColor: [255, 255, 255]
    },
    columnStyles: colStyles,
    margin: { top: 48, right: 14, bottom: 25, left: 14 },
    didDrawPage: function (data) {
      const str = 'Page ' + doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 12);
      doc.text('Ganga Maxx Credit Ltd. | Confidential & Proprietary', doc.internal.pageSize.width - data.settings.margin.right, doc.internal.pageSize.height - 12, { align: 'right' });
    }
  });
  
  doc.save(filename);
}

import html2canvas from 'html2canvas';

export async function exportPdfWithCharts(filename, rows, chartElementId) {
  if (!rows.length) return;
  const doc = new jsPDF('landscape');
  const headers = Object.keys(rows[0]);
  
  const data = rows.map(row => headers.map(h => {
    let val = row[h] ?? '';
    if (typeof val === 'number') {
      const isMoney = h.toLowerCase().includes('balance') || h.toLowerCase().includes('debit') || h.toLowerCase().includes('credit') || h.toLowerCase().includes('amount') || h.toLowerCase().includes('outstanding') || h.toLowerCase().includes('limit');
      if (isMoney) return 'Rs. ' + val.toLocaleString('en-IN');
      return val.toString();
    }
    return String(val);
  }));

  const reportTitle = filename.replace('.pdf', '').toUpperCase().replace(/-/g, ' ');
  const dateStr = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  // --- IMAGE LOGO ---
  doc.addImage(logoBase64, 'PNG', 14, 14, 18, 18);

  // --- HEADER TEXT ---
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('GANGA MAXX CREDIT', 38, 24);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('123 Financial District, Tech Park', 38, 30);
  doc.text('Hyderabad, TG 500032 | GSTIN: 29XXXXX1234X1Z5', 38, 35);

  // --- REPORT DETAILS (Right Side) ---
  const pageWidth = doc.internal.pageSize.width;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(reportTitle, pageWidth - 14, 24, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${dateStr}`, pageWidth - 14, 30, { align: 'right' });
  doc.text('Status: OFFICIAL REPORT', pageWidth - 14, 35, { align: 'right' });

  // --- DIVIDER LINE ---
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 42, pageWidth - 14, 42);

  let currentY = 48;

  // --- CAPTURE & EMBED CHART ---
  if (chartElementId) {
    const chartEl = document.getElementById(chartElementId);
    if (chartEl) {
      try {
        const canvas = await html2canvas(chartEl, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        // Render chart width = half of page, keep aspect ratio
        const chartWidth = 150; 
        const chartHeight = (canvas.height * chartWidth) / canvas.width;
        doc.addImage(imgData, 'PNG', 14, currentY, chartWidth, chartHeight);
        currentY += chartHeight + 10;
      } catch (err) {
        console.error('Failed to capture chart', err);
      }
    }
  }

  // --- COLUMN ALIGNMENT ---
  const colStyles = {};
  headers.forEach((h, i) => {
    const text = h.toLowerCase();
    if (text.includes('balance') || text.includes('debit') || text.includes('credit') || text.includes('amount') || text.includes('outstanding') || text.includes('limit')) {
      colStyles[i] = { halign: 'right' };
    }
  });

  // --- STYLED DATA TABLE ---
  autoTable(doc, {
    head: [headers.map(h => h.replace(/_/g, ' ').toUpperCase())],
    body: data,
    startY: currentY,
    theme: 'grid',
    styles: { 
      fontSize: 9, 
      cellPadding: 6,
      textColor: [51, 65, 85],
      font: 'helvetica',
      lineColor: [241, 245, 249],
      lineWidth: 0.5
    },
    headStyles: { 
      fillColor: [248, 250, 252],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      lineColor: [226, 232, 240],
      lineWidth: { bottom: 1, top: 0, left: 0, right: 0 }
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    columnStyles: colStyles,
    margin: { top: 48, right: 14, bottom: 25, left: 14 },
    didDrawPage: function (data) {
      const str = 'Page ' + doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 12);
      doc.text('Ganga Maxx Credit Ltd. | Confidential & Proprietary', doc.internal.pageSize.width - data.settings.margin.right, doc.internal.pageSize.height - 12, { align: 'right' });
    }
  });
  
  doc.save(filename);
}
