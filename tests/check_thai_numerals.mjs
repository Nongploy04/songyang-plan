import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

const thaiNumRegex = /[๐-๙]/g;
const violations = [];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (/\.(tsx?|jsx?|json|css)$/.test(entry.name)) {
      // Exclude thaiNumerals.ts conversion tables itself where Thai digits are needed for translation
      if (entry.name === 'thaiNumerals.ts') continue;
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(thaiNumRegex);
      if (matches) {
        violations.push({
          file: path.relative(srcDir, fullPath),
          matchCount: matches.length,
          sample: matches.slice(0, 5),
        });
      }
    }
  }
}

scanDir(srcDir);

console.log(JSON.stringify({
  thaiNumeralViolationsCount: violations.length,
  violations
}, null, 2));
