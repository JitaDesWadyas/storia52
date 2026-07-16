import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const vendor = path.join(root, 'node_modules', 'qrcode-terminal', 'vendor', 'QRCode');
const readVendor = name => fs.readFileSync(path.join(vendor, `${name}.js`), 'utf8').replace(/\r/g, '');
const parts = [];

for (const [name, variable] of [['QRMode', 'QRMode'], ['QRErrorCorrectLevel', 'QRErrorCorrectLevel'], ['QRMaskPattern', 'QRMaskPattern']]) {
  parts.push(readVendor(name).replace('module.exports =', `var ${variable} =`));
}

parts.push(readVendor('QRMath').replace(/\nmodule\.exports = QRMath;\s*$/, '\n'));
parts.push(readVendor('QRPolynomial').replace(/^var QRMath = require\([^\n]+\);\n\n/, '').replace(/\nmodule\.exports = QRPolynomial;\s*$/, '\n'));
parts.push(readVendor('QRRSBlock').replace(/^var QRErrorCorrectLevel = require\([^\n]+\);\n\n/, '').replace(/\nmodule\.exports = QRRSBlock;\s*$/, '\n'));
parts.push(readVendor('QRBitBuffer').replace(/\nmodule\.exports = QRBitBuffer;\s*$/, '\n'));
parts.push(readVendor('QR8bitByte').replace(/^var QRMode = require\([^\n]+\);\n\n/, '').replace(/\nmodule\.exports = QR8bitByte;\s*$/, '\n'));
parts.push(readVendor('QRUtil')
  .replace(/^var QRMode = require\([^\n]+\);\nvar QRPolynomial = require\([^\n]+\);\nvar QRMath = require\([^\n]+\);\nvar QRMaskPattern = require\([^\n]+\);\n\n/, '')
  .replace(/\nmodule\.exports = QRUtil;\s*$/, '\n'));
parts.push(readVendor('index')
  .replace(/^[\s\S]*?Modified to work in node for this project \(and some refactoring\)\n\/\/---------------------------------------------------------------------\n\n/, '')
  .replace(/^var QR8bitByte = require\([^\n]+\);\nvar QRUtil = require\([^\n]+\);\nvar QRPolynomial = require\([^\n]+\);\nvar QRRSBlock = require\([^\n]+\);\nvar QRBitBuffer = require\([^\n]+\);\n\n/, '')
  .replace(/\nmodule\.exports = QRCode;\s*$/, '\n'));

const header = `'use strict';\n/*\n * QRCode for JavaScript — Copyright (c) 2009 Kazuhiko Arase\n * MIT License. QR Code is a registered trademark of DENSO WAVE INCORPORATED.\n * Vendored locally so invite contents never leave the browser.\n */\n(() => {\n`;
const footer = `\nconst escapeAttr = value => String(value).replace(/[&<>\"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' })[char]);\nconst toSvg = (text, options = {}) => {\n  const value = String(text || '');\n  if (!value) throw new Error('Contenuto QR vuoto');\n  const qr = new QRCode(-1, QRErrorCorrectLevel.Q);\n  qr.addData(value);\n  qr.make();\n  const count = qr.getModuleCount();\n  const margin = Math.max(0, Math.min(12, Number(options.margin) || 4));\n  const size = count + margin * 2;\n  const commands = [];\n  for (let row = 0; row < count; row++) {\n    let start = -1;\n    for (let col = 0; col <= count; col++) {\n      const dark = col < count && qr.isDark(row, col);\n      if (dark && start < 0) start = col;\n      if (!dark && start >= 0) {\n        commands.push('M' + (start + margin) + ' ' + (row + margin) + 'h' + (col - start) + 'v1h-' + (col - start) + 'z');\n        start = -1;\n      }\n    }\n  }\n  const dark = escapeAttr(options.dark || '#2d2418');\n  const light = escapeAttr(options.light || '#fff9ee');\n  const label = escapeAttr(options.label || 'QR code');\n  return '<svg class="epoi-qr-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="' + label + '" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="' + light + '"/><path fill="' + dark + '" d="' + commands.join('') + '"/></svg>';\n};\nwindow.EpoiQr = Object.freeze({ toSvg });\nwindow.EpoiQrReady = Promise.resolve(window.EpoiQr);\n})();\n`;

fs.writeFileSync(path.join(root, 'qr-local.js'), header + parts.join('\n') + footer);
console.log('qr-local.js generato localmente.');
