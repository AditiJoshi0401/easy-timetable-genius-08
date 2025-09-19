/*
 * Simple CSV -> JSON converter for the data templates.
 * Run: `node convert-csv-to-json.js subjects.csv subjects.json` from this folder.
 * For production use, replace this with a robust CSV parser.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1);
  
  return rows.map(line => {
    // naive splitting - assumes no quoted commas
    const values = line.split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] || "";
    });
    return obj;
  });
}

function toTyped(obj) {
  const out = { ...obj };
  
  // convert common numeric fields
  if ('credits' in out) out.credits = Number(out.credits || 0);
  if ('lectures' in out) out.lectures = Number(out.lectures || 0);
  if ('tutorials' in out) out.tutorials = Number(out.tutorials || 0);
  if ('practicals' in out) out.practicals = Number(out.practicals || 0);
  if ('capacity' in out) out.capacity = Number(out.capacity || 0);
  if ('semesters' in out) out.semesters = Number(out.semesters || 0);
  if ('strength' in out) out.strength = Number(out.strength || 0);
  
  // Subject-specific fields
  if ('semester' in out) {
    // Keep semester as string for subjects (as shown in schema)
    out.semester = String(out.semester || '');
  }
  
  // Room-specific fields
  if ('number' in out) {
    // Keep room number as string
    out.number = String(out.number || '');
  }
  
  // Teacher-specific fields - handle both naming conventions
  if ('maxLectures' in out) out.maxLectures = Number(out.maxLectures || 0);
  if ('maxLabs' in out) out.maxLabs = Number(out.maxLabs || 0);
  if ('maxTutorials' in out) out.maxTutorials = Number(out.maxTutorials || 0);
  if ('max_lectures' in out) {
    out.max_lectures = Number(out.max_lectures || 0);
    // Also set camelCase version for consistency
    out.maxLectures = out.max_lectures;
  }
  if ('max_labs' in out) {
    out.max_labs = Number(out.max_labs || 0);
    out.maxLabs = out.max_labs;
  }
  if ('max_tutorials' in out) {
    out.max_tutorials = Number(out.max_tutorials || 0);
    out.maxTutorials = out.max_tutorials;
  }
  
  // convert semicolon/comma lists -> arrays
  for (const k of Object.keys(out)) {
    if (typeof out[k] === 'string' && (out[k].includes(';') || out[k].includes(','))) {
      out[k] = out[k].split(/[;,]/).map(s => s.trim()).filter(Boolean);
    }
  }
  
  // Handle specific array fields that might be strings
  const arrayFields = ['roles', 'subjects', 'streams'];
  for (const field of arrayFields) {
    if (field in out && typeof out[field] === 'string') {
      if (out[field].includes(';') || out[field].includes(',')) {
        out[field] = out[field].split(/[;,]/).map(s => s.trim()).filter(Boolean);
      } else if (out[field].trim()) {
        out[field] = [out[field].trim()];
      } else {
        out[field] = [];
      }
    }
  }
  
  // booleans - handle both isTA and ista
  if ('isTA' in out) {
    const v = String(out.isTA).toLowerCase();
    out.isTA = (v === 'true' || v === '1');
    // Also set snake_case version for consistency with API
    out.ista = out.isTA;
  }
  if ('ista' in out) {
    const v = String(out.ista).toLowerCase();
    out.ista = (v === 'true' || v === '1');
    out.isTA = out.ista;
  }
  
  // empty strings to null for optional fields
  if ('id' in out && out.id === '') delete out.id;
  if ('cabin' in out && out.cabin === '') out.cabin = null;
  if ('created_at' in out && out.created_at === '') delete out.created_at;
  
  // Clean up empty strings for required string fields
  const stringFields = ['name', 'code', 'email', 'specialization', 'type'];
  for (const field of stringFields) {
    if (field in out && out[field] === '') {
      out[field] = '';
    }
  }
  
  return out;
}

// Check if this is the main module (ES module equivalent of require.main === module)
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, input, output] = process.argv;
  
  if (!input || !output) {
    console.error('Usage: node convert-csv-to-json.js input.csv output.json');
    process.exit(2);
  }
  
  const content = fs.readFileSync(path.resolve(input), 'utf8');
  const parsed = parseCSV(content).map(toTyped);
  
  fs.writeFileSync(path.resolve(output), JSON.stringify(parsed, null, 2), 'utf8');
  console.log('Wrote', output);
}