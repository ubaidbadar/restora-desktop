'use strict';

const fs = require('node:fs');
const path = require('node:path');

const file = path.join(__dirname, '..', 'native', 'print-engine.exe');
let size = 0;
try {
  size = fs.statSync(file).size;
} catch { /* missing build */ }
if (size < 100_000) {
  console.error('The bundled native printing engine is missing. Build the pinned Rust source before packaging Restora Desktop.');
  process.exit(1);
}
console.log('Bundled Windows printing engine:', file, '(' + size + ' bytes)');
