import express from 'express';

import { getCourse } from '../utils/courses.js';

const router = express.Router();

router.get('/:courseId', (req, res, next) => {
  const course = getCourse(req.params.courseId);
  if (!course) {
    const err = new Error(`Course not found: ${req.params.courseId}`);
    err.status = 404;
    return next(err);
  }
  res.render('pages/course', {
    title: course.title,
    scripts: '',
    course,
  });
});

export default router;