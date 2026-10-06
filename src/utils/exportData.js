import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// rows: array of plain objects, e.g. [{ Name: "Joseph", Email: "..." }]
// Keys become column headers — pass already-shaped, human-readable data.

export function exportToCSV(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h] ?? "";
          // Escape values containing commas, quotes, or newlines
          const escaped = String(val).replace(/"/g, '""');
          return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
        })
        .join(",")
    ),
  ];
  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
}

export function exportToExcel(filename, rows) {
  if (!rows.length) return;
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToPDF(filename, title, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 16);
  autoTable(doc, {
    startY: 22,
    head: [headers],
    body: rows.map((row) => headers.map((h) => String(row[h] ?? ""))),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [31, 59, 51] }, // matches your lab-900 dark green
  });
  doc.save(`${filename}.pdf`);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}