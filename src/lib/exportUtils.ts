import * as XLSX from 'xlsx';

type ExportOptions = {
  filename: string;
  sheets: Array<{
    name: string;
    data: Record<string, unknown>[];
  }>;
};

export function exportToExcel({ filename, sheets }: ExportOptions) {
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, data }) => {
    const ws = XLSX.utils.json_to_sheet(data);
    // Auto-width columns
    const colWidths = Object.keys(data[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...data.map((row) => String(row[key] ?? '').length)) + 2,
    }));
    ws['!cols'] = colWidths;
    XLSX.utils.book_append_sheet(wb, ws, name);
  });
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
