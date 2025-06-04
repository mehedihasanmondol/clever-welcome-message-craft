import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

export interface ExportData {
  headers: string[];
  data: (string | number)[][];
}

export function useDataExport() {
  const exportToCSV = useCallback((data: ExportData, filename: string = 'export') => {
    const csvContent = [
      data.headers.join(','),
      ...data.data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, []);

  const exportToExcel = useCallback((data: ExportData, filename: string = 'export') => {
    const ws = XLSX.utils.aoa_to_sheet([data.headers, ...data.data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }, []);

  const exportToPDF = useCallback((data: ExportData, filename: string = 'export', title?: string) => {
    const doc = new jsPDF();
    
    if (title) {
      doc.setFontSize(16);
      doc.text(title, 20, 20);
    }

    doc.autoTable({
      head: [data.headers],
      body: data.data,
      startY: title ? 30 : 20,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    doc.save(`${filename}.pdf`);
  }, []);

  const printData = useCallback((data: ExportData, title?: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title || 'Print Data'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            tr:nth-child(even) { background-color: #f8f9fa; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${title ? `<h1>${title}</h1>` : ''}
          <table>
            <thead>
              <tr>
                ${data.headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.data.map(row => 
                `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
              ).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }, []);

  return {
    exportToCSV,
    exportToExcel,
    exportToPDF,
    printData,
  };
}