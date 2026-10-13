/**
 * Protection against CSV formula injection (CSV Injection / Formula Injection)
 * Spreadsheets (Excel, LibreOffice, Google Sheets) execute cells beginning with
 * '=', '+', '-', '@', '\t', '\r' as formulas, which can lead to data exfiltration or code execution.
 */

export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  let str = String(value);

  // If the cell starts with a trigger character, prefix with a single quote (')
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape double quotes by doubling them
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    str = `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function generateSafeCsv(
  headers: string[],
  rows: Array<Array<unknown>>
): string {
  const headerRow = headers.map(sanitizeCsvCell).join(",");
  const dataRows = rows.map((row) => row.map(sanitizeCsvCell).join(","));
  return [headerRow, ...dataRows].join("\r\n");
}
