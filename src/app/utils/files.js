import fs from 'node:fs';

export function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    throw new Error(`Failed to read JSON file "${filePath}": ${err.message}`);
  }
}

export function writeJsonAtomic(filePath, data) {
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, filePath);
}

export function exists(filePath) {
  return fs.existsSync(filePath);
}