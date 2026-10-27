import fs from 'node:fs';

import config from '../config.js';

export function loadAll() {
  fs.readdirSync(config.coursesDir);
}

export function listCourses() {
  return [];
}