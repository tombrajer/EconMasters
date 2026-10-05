import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildXlsx, registrationsSheet } from '../src/xlsx.ts';

function entries(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const end = bytes.length - 22;
  assert.equal(view.getUint32(end, true), 0x06054b50);
  const count = view.getUint16(end + 10, true);
  let position = view.getUint32(end + 16, true);
  const files: Record<string, string> = {};
  for (let index = 0; index < count; index++) {
    assert.equal(view.getUint32(position, true), 0x02014b50);
    const nameLength = view.getUint16(position + 28, true);
    const offset = view.getUint32(position + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(position + 46, position + 46 + nameLength));
    assert.equal(view.getUint32(offset, true), 0x04034b50);
    const size = view.getUint32(offset + 18, true);
    const start = offset + 30 + view.getUint16(offset + 26, true) + view.getUint16(offset + 28, true);
    assert.equal(view.getUint16(offset + 8, true), 0);
    files[name] = new TextDecoder().decode(bytes.subarray(start, start + size));
    position += 46 + nameLength;
  }
  return files;
}

const registration = {
  slot: 7, id: '5418c821-7245-4844-82b4-d5f1a3b63884', team: '=HYPERLINK("http://x","go")', school: 'Žďár & <Co>',
  members: ['Štěpán', 'Zoë', '李雷'], captain: 'Štěpán', email: 'a@b.cz', details: { phone: '+420 123', notes: 'bad \u0001 char' }, createdAt: '2026-10-05T11:40:12.000Z',
};

test('the workbook is a well-formed zip containing every required part', () => {
  const files = entries(buildXlsx(registrationsSheet([registration])));
  assert.deepEqual(Object.keys(files).sort(), ['[Content_Types].xml', '_rels/.rels', 'xl/_rels/workbook.xml.rels', 'xl/styles.xml', 'xl/workbook.xml', 'xl/worksheets/sheet1.xml']);
  for (const content of Object.values(files)) assert.match(content, /^<\?xml/);
});

test('text stays text: formulas are not evaluated and XML is escaped', () => {
  const sheet = entries(buildXlsx(registrationsSheet([registration])))['xl/worksheets/sheet1.xml'];
  assert.doesNotMatch(sheet, /<f>/);
  assert.match(sheet, /t="inlineStr"[^>]*><is><t xml:space="preserve">=HYPERLINK\(&quot;http:\/\/x&quot;,&quot;go&quot;\)<\/t>/);
  assert.match(sheet, /Žďár &amp; &lt;Co&gt;/);
  assert.match(sheet, /李雷/);
  assert.doesNotMatch(sheet, /\u0001/);
});

test('the sheet has a header row, one row per team and the slot as a number', () => {
  const sheet = entries(buildXlsx(registrationsSheet([registration, { ...registration, id: 'x', slot: 8 }])))['xl/worksheets/sheet1.xml'];
  assert.equal((sheet.match(/<row /g) ?? []).length, 3);
  assert.match(sheet, /<c r="A2"><v>7<\/v><\/c>/);
  assert.match(sheet, /<c r="A3"><v>8<\/v><\/c>/);
});

test('stored zip entries carry a valid CRC-32', () => {
  const bytes = buildXlsx(registrationsSheet([registration]));
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const first = new TextEncoder().encode(entries(bytes)['[Content_Types].xml']);
  assert.equal(view.getUint32(14, true), crcOf(first));
});

function crcOf(data: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let k = 0; k < 8; k++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
