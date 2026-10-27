// src/app/server.js
//
// Loquela — application entry point.
//
// This file is a SKELETON. Every piece below has a comment explaining
// what it must do and where the logic lives. Do not implement business
// logic here: this file only wires modules together.
//
// See RESUME.md §6.1 for the full contract of this file.
// See RESUME.md §16 for the invariants this file must preserve.

import express from 'express';
import path from 'node:path';

import config from './config.js';
import { loadAll } from './utils/courses.js';
import errorHandler from './middleware/errors.js';

import indexRouter   from './routes/index.js';
import coursesRouter from './routes/courses.js';
import lessonsRouter from './routes/lessons.js';
import apiRouter     from './routes/api.js';

const app = express();

// ---------------------------------------------------------------------------
// View engine
// ---------------------------------------------------------------------------
// EJS is the only templating engine. Views live in src/app/views.
// The layout.ejs shell is chosen per-page, not globally, so each page can
// declare its own <title> and optional per-page scripts.
// ---------------------------------------------------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(config.appDir, 'views'));

// ---------------------------------------------------------------------------
// Static assets
// ---------------------------------------------------------------------------
// CSS, client JS, and images live in src/app/public. Served as-is.
// ---------------------------------------------------------------------------
app.use(express.static(path.join(config.appDir, 'public')));

// ---------------------------------------------------------------------------
// Body parsing
// ---------------------------------------------------------------------------
// Only /api/* uses JSON bodies. Mounted globally for simplicity.
// ---------------------------------------------------------------------------
app.use(express.json());

// ---------------------------------------------------------------------------
// Routers
// ---------------------------------------------------------------------------
// Mount order matters only for overlapping path prefixes.
//   - /courses/:courseId/lessons  → lesson view
//   - /courses                    → course map
//   - /api                        → JSON endpoints
//   - /                           → home page (mounted last so it catches
//                                    only the root and 404s, never swallows
//                                    the prefixes above)
// ---------------------------------------------------------------------------
app.use('/courses/:courseId/lessons', lessonsRouter);
app.use('/courses',                   coursesRouter);
app.use('/api',                       apiRouter);
app.use('/',                          indexRouter);

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------
// Must be mounted LAST, after every router. Handles both 404 (via next(err)
// from routes) and unexpected 500s. Must never leak stack traces to the
// browser. See middleware/errors.js.
// ---------------------------------------------------------------------------
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Startup: load and validate content
// ---------------------------------------------------------------------------
// loadAll() reads every course under courses/, validates each course and
// lesson against the schemas in RESUME.md §7, and caches them in memory.
// It also runs detectAIPatterns() and logs warnings (never throws on them).
//
// If any course or lesson fails validation, loadAll() throws. We exit with
// a non-zero code so the failure is impossible to miss. Do not swallow the
// error and continue with partial state — that leads to silent 404s later.
// ---------------------------------------------------------------------------
try {
  loadAll();
} catch (err) {
  console.error('[loquela] Failed to load courses:');
  console.error(err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Listen
// ---------------------------------------------------------------------------
app.listen(config.port, () => {
  console.log(`[loquela] Listening on http://localhost:${config.port}`);
});