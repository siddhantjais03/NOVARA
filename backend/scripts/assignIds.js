import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catPath = path.join(__dirname, '..', 'data', 'catalogue80.js');
let content = fs.readFileSync(catPath, 'utf8');

let nextNum = 22;
// Regex to find items that have '    sku: 'NOV-' without an immediately preceding _id
content = content.replace(/(\n  \{\n)(    sku: 'NOV-[A-Z]+-[0-9]+',)/g, (match, prefix, skuLine) => {
  const pad = String(nextNum).padStart(4, '0');
  nextNum++;
  const idLine = `    _id: '672801a1e1b2c3d4e5f6${pad}',\n`;
  return prefix + idLine + skuLine;
});

fs.writeFileSync(catPath, content, 'utf8');
console.log('Assigned IDs up to:', nextNum - 1);

