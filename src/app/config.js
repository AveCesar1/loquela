import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default Object.freeze({
  port: Number(process.env.PORT) || 3000,
  rootDir: path.resolve(__dirname, '..', '..'),
  appDir: path.resolve(__dirname),
  coursesDir: path.resolve(__dirname, '..', '..', 'courses'),
  progressPath: path.resolve(__dirname, '..', '..', 'progress.json'),
});