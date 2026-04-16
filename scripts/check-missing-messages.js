import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const messagesDir = join(__dirname, '..', 'public', 'intl', 'messages');

const en = JSON.parse(readFileSync(join(messagesDir, 'en-US.json'), 'utf8'));

// Flatten nested structure: { label: { foo: 'bar' } } -> { 'label.foo': 'bar' }
function flatten(obj, prefix = '') {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null) {
      Object.assign(result, flatten(v, key));
    } else {
      result[key] = v;
    }
  }
  return result;
}

const enFlat = flatten(en);
const enKeys = Object.keys(enFlat);
console.log(`en-US.json has ${enKeys.length} keys`);

const files = readdirSync(messagesDir)
  .filter(f => f.endsWith('.json') && f !== 'en-US.json')
  .sort();

const allMissing = {};
let total = 0;

for (const fname of files) {
  const data = JSON.parse(readFileSync(join(messagesDir, fname), 'utf8'));
  const flat = flatten(data);
  const missing = enKeys.filter(k => !(k in flat));
  if (missing.length) {
    allMissing[fname] = missing;
    console.log(`${fname}: ${missing.length} missing`);
    total += missing.length;
  }
}
console.log(`\nTotal missing across all locales: ${total}`);

const keyCounts = {};
for (const missing of Object.values(allMissing)) {
  for (const k of missing) {
    keyCounts[k] = (keyCounts[k] || 0) + 1;
  }
}
const sorted = Object.entries(keyCounts).sort((a, b) => b[1] - a[1]);
if (sorted.length) {
  console.log('\nMost commonly missing keys:');
  for (const [k, count] of sorted) {
    console.log(`  "${k}": missing from ${count} files (en value: "${enFlat[k]}")`);
  }
}
