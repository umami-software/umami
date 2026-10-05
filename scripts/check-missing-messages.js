import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const messagesDir = join(__dirname, '..', 'public', 'intl', 'messages');
const sourcePath = join(messagesDir, 'en-US.json');
const removeExtraKeys = process.argv.includes('--remove-extra-keys');
const help = process.argv.includes('--help') || process.argv.includes('-h');

if (help) {
  console.log('Usage: node scripts/check-missing-messages.js [--remove-extra-keys]');
  process.exit(0);
}

const enRaw = readFileSync(sourcePath, 'utf8');
const newline = enRaw.includes('\r\n') ? '\r\n' : '\n';
const en = JSON.parse(enRaw);

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

function setNestedValue(target, flatKey, value) {
  const parts = flatKey.split('.');
  let current = target;

  for (let index = 0; index < parts.length - 1; index++) {
    current[parts[index]] ??= {};
    current = current[parts[index]];
  }

  current[parts.at(-1)] = value;
}

function buildNormalizedObject(flat) {
  const ordered = {};

  for (const key of enKeys) {
    if (key in flat) {
      setNestedValue(ordered, key, flat[key]);
    }
  }

  return ordered;
}

const enFlat = flatten(en);
const enKeys = Object.keys(enFlat);
const enKeySet = new Set(enKeys);
console.log(`en-US.json has ${enKeys.length} keys`);

const files = readdirSync(messagesDir)
  .filter(f => f.endsWith('.json') && f !== 'en-US.json')
  .sort();

const allMissing = {};
const allExtra = {};
let totalMissing = 0;
let totalExtra = 0;
let updatedFiles = 0;

for (const fname of files) {
  const filePath = join(messagesDir, fname);
  const raw = readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  const flat = flatten(data);
  const missing = enKeys.filter(k => !(k in flat));
  const extra = Object.keys(flat).filter(k => !enKeySet.has(k)).sort();

  if (missing.length) {
    allMissing[fname] = missing;
    console.log(`${fname}: ${missing.length} missing`);
    totalMissing += missing.length;
  }

  if (extra.length) {
    allExtra[fname] = extra;
    console.log(`${fname}: ${extra.length} extra`);
    totalExtra += extra.length;
  }

  if (removeExtraKeys && extra.length) {
    const normalized = buildNormalizedObject(flat);
    const nextRaw = `${JSON.stringify(normalized, null, 2).replace(/\n/g, newline)}${newline}`;

    if (nextRaw !== raw) {
      writeFileSync(filePath, nextRaw, 'utf8');
      updatedFiles++;
    }
  }
}
console.log(`\nTotal missing across all locales: ${totalMissing}`);
console.log(`Total extra across all locales: ${totalExtra}`);

if (removeExtraKeys) {
  console.log(`Files updated to remove extra keys: ${updatedFiles}`);
}

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

const extraKeyCounts = {};
for (const extra of Object.values(allExtra)) {
  for (const k of extra) {
    extraKeyCounts[k] = (extraKeyCounts[k] || 0) + 1;
  }
}
const sortedExtra = Object.entries(extraKeyCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
if (sortedExtra.length) {
  console.log('\nMost commonly extra keys:');
  for (const [k, count] of sortedExtra) {
    console.log(`  "${k}": extra in ${count} files`);
  }
}
