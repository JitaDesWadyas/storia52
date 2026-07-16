import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = path.resolve(import.meta.dirname, '..');
const source = fs.readFileSync(path.join(root, 'qr-local.js'), 'utf8');
const raw = source.match(/const encoded='([^']*)'/)?.[1] || '';
const invalid = [...new Set([...raw].filter(char => !/[A-Za-z0-9+/=_-]/.test(char)))];
const clean = raw.replace(/-/g, '+').replace(/_/g, '/').replace(/[^A-Za-z0-9+/=]/g, '').replace(/=+$/g, '');
const padded = clean.padEnd(Math.ceil(clean.length / 4) * 4, '=');
console.log(JSON.stringify({ rawLength: raw.length, cleanLength: clean.length, modulo: clean.length % 4, padding: padded.length - clean.length, invalid }, null, 2));
try {
  const bytes = Buffer.from(padded, 'base64');
  console.log(`decodedBytes=${bytes.length}`);
  const text = zlib.gunzipSync(bytes).toString('utf8');
  console.log(`gunzipBytes=${Buffer.byteLength(text)} startsCorrectly=${text.startsWith("'use strict'")}`);
} catch (error) {
  console.log(`decodeError=${error.name}: ${error.message}`);
}
