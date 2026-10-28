import express from 'express';

import { getCourse, getLesson } from '../utils/courses.js';
import { completeLesson } from '../utils/progress.js';

const router = express.Router();

router.post('/lessons/:courseId/:lessonId/complete', (req, res, next) => {
  const { courseId, lessonId } = req.params;
  const { accuracy } = req.body;

  const course = getCourse(courseId);
  if (!course) {
    const err = new Error(`Course not found: ${courseId}`);
    err.status = 404;
    return next(err);
  }

  const lesson = getLesson(courseId, lessonId);
  if (!lesson) {
    const err = new Error(`Lesson not found: ${courseId}/${lessonId}`);
    err.status = 404;
    return next(err);
  }

  if (
    accuracy === undefined ||
    typeof accuracy !== 'number' ||
    !Number.isFinite(accuracy) ||
    accuracy < 0 ||
    accuracy > 1
  ) {
    return res.status(400).json({
      ok: false,
      error: 'accuracy must be a number between 0 and 1',
    });
  }

  // XP is derived server-side from the lesson; client-supplied values are ignored.
  const progress = completeLesson(courseId, lessonId, lesson.xp, accuracy);
  res.json({ ok: true, progress });
});

export default router;