import type { AdminRegistration } from '../server/admin-store';

export type Sheet = { name: string; columns: { header: string; width: number }[]; rows: (string | number)[][] };

const encoder = new TextEncoder();

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(data: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of data) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

// An .xlsx file is a zip of XML parts. Entries are stored uncompressed, which keeps this dependency-free.
function zip(files: { name: string; data: Uint8Array }[]) {
  const DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1;
  const local: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const { name, data } of files) {
    const nameBytes = encoder.encode(name);
    const crc = crc32(data);
    const header = new DataView(new ArrayBuffer(30));
    header.setUint32(0, 0x04034b50, true);
    header.setUint16(4, 20, true);
    header.setUint16(10, 0, true);
    header.setUint16(12, DOS_DATE, true);
    header.setUint32(14, crc, true);
    header.setUint32(18, data.length, true);
    header.setUint32(22, data.length, true);
    header.setUint16(26, nameBytes.length, true);
    local.push(new Uint8Array(header.buffer), nameBytes, data);

    const entry = new DataView(new ArrayBuffer(46));
    entry.setUint32(0, 0x02014b50, true);
    entry.setUint16(4, 20, true);
    entry.setUint16(6, 20, true);
    entry.setUint16(14, DOS_DATE, true);
    entry.setUint32(16, crc, true);
    entry.setUint32(20, data.length, true);
    entry.setUint32(24, data.length, true);
    entry.setUint16(28, nameBytes.length, true);
    entry.setUint32(42, offset, true);
    central.push(new Uint8Array(entry.buffer), nameBytes);
    offset += 30 + nameBytes.length + data.length;
  }
  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);
  const parts = [...local, ...central, new Uint8Array(end.buffer)];
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let position = 0;
  for (const part of parts) { out.set(part, position); position += part.length; }
  return out;
}

const escapeXml = (value: string) => value
  .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function columnName(index: number) {
  let name = '';
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) name = String.fromCharCode(65 + ((n - 1) % 26)) + name;
  return name;
}

// Text is always written as an inline string, never as a formula, so a cell like "=1+1" stays literal text.
const cell = (value: string | number, column: number, row: number, style = 0) => {
  const ref = `${columnName(column)}${row}`;
  return typeof value === 'number'
    ? `<c r="${ref}"${style ? ` s="${style}"` : ''}><v>${value}</v></c>`
    : `<c r="${ref}" t="inlineStr"${style ? ` s="${style}"` : ''}><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
};

export function buildXlsx(sheet: Sheet): Uint8Array {
  const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  const name = escapeXml(sheet.name.replace(/[\[\]:*?/\\]/g, ' ').slice(0, 31) || 'Sheet1');
  const rows = [sheet.columns.map(column => column.header), ...sheet.rows]
    .map((row, index) => `<row r="${index + 1}">${row.map((value, column) => cell(value, column, index + 1, index === 0 ? 1 : 0)).join('')}</row>`)
    .join('');
  const files = {
    '[Content_Types].xml': `${xml}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
    '_rels/.rels': `${xml}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    'xl/workbook.xml': `${xml}<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${name}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    'xl/_rels/workbook.xml.rels': `${xml}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    'xl/styles.xml': `${xml}<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`,
    'xl/worksheets/sheet1.xml': `${xml}<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${sheet.columns.map((column, index) => `<col min="${index + 1}" max="${index + 1}" width="${column.width}" customWidth="1"/>`).join('')}</cols><sheetData>${rows}</sheetData></worksheet>`,
  };
  return zip(Object.entries(files).map(([entryName, content]) => ({ name: entryName, data: encoder.encode(content) })));
}

const detailColumns = [
  ['phone', 'Phone', 18], ['program', 'Academic program', 18], ['grade', 'Grade / year', 12], ['country', 'Country', 16],
  ['source', 'How they heard about us', 34], ['notes', 'Notes', 34],
] as const;

export function registrationsSheet(registrations: AdminRegistration[]): Sheet {
  return {
    name: 'Registrations',
    columns: [
      { header: '#', width: 5 }, { header: 'Team', width: 26 }, { header: 'School', width: 30 },
      { header: 'Member 1', width: 22 }, { header: 'Member 2', width: 22 }, { header: 'Member 3', width: 22 },
      { header: 'Captain', width: 22 }, { header: 'Email', width: 32 },
      ...detailColumns.map(([, header, width]) => ({ header, width })),
      { header: 'Registered', width: 18 }, { header: 'Reference', width: 38 },
    ],
    rows: registrations.map(entry => [
      entry.slot, entry.team, entry.school, entry.members[0] ?? '', entry.members[1] ?? '', entry.members[2] ?? '',
      entry.captain, entry.email,
      ...detailColumns.map(([key]) => entry.details[key] ?? ''),
      entry.createdAt.slice(0, 16).replace('T', ' ') + ' UTC', entry.id,
    ]),
  };
}

export function downloadXlsx(registrations: AdminRegistration[]) {
  const bytes = buildXlsx(registrationsSheet(registrations));
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `economics-masters-registrations-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
