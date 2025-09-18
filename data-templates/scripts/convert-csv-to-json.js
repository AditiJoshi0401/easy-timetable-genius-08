/* Simple CSV -> JSON converter for the data templates.
   - Run: `node convert-csv-to-json.js subjects.csv subjects.json` from this folder.
   - For production use, replace this with a robust CSV parser.
*/

const fs = require('fs');
const path = require('path');

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
  // convert common fields
  if ('credits' in out) out.credits = Number(out.credits || 0);
  if ('semester' in out) out.semester = Number(out.semester || 0);
  if ('lectures' in out) out.lectures = Number(out.lectures || 0);
  if ('tutorials' in out) out.tutorials = Number(out.tutorials || 0);
  if ('practicals' in out) out.practicals = Number(out.practicals || 0);
  if ('capacity' in out) out.capacity = Number(out.capacity || 0);
  if ('semesters' in out) out.semesters = Number(out.semesters || 0);
  if ('strength' in out) out.strength = Number(out.strength || 0);
  if ('maxLectures' in out) out.maxLectures = Number(out.maxLectures || 0);
  if ('maxLabs' in out) out.maxLabs = Number(out.maxLabs || 0);
  if ('maxTutorials' in out) out.maxTutorials = Number(out.maxTutorials || 0);

  // convert semicolon lists -> arrays
  for (const k of Object.keys(out)) {
    if (typeof out[k] === 'string' && out[k].includes(';')) {
      out[k] = out[k].split(';').map(s => s.trim()).filter(Boolean);
    }
  }

  // booleans
  if ('isTA' in out) {
    const v = String(out.isTA).toLowerCase();
    out.isTA = (v === 'true' || v === '1');
  }

  // empty strings to null for optional ids
  if ('id' in out && out.id === '') delete out.id;

  return out;
}

if (require.main === module) {
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
