import express from 'express';
import { renderFile } from 'ejs';
import path from 'node:path';

import config from '../config.js';
import { listCourses } from '../utils/courses.js';

const router = express.Router();
const viewsDir = path.join(config.appDir, 'views');

router.get('/', async (req, res) => {
  const courses = listCourses();
  const cards = await Promise.all(
    courses.map((course) =>
      renderFile(path.join(viewsDir, 'partials/courseCard.ejs'), { course })
    )
  );
  res.render('pages/index', {
    title: 'Loquela',
    scripts: '',
    courses,
    cards: cards.join(''),
  });
});

export default router;