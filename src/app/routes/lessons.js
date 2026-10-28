import express from 'express';
import { renderFile } from 'ejs';
import path from 'node:path';

import config from '../config.js';
import { getCourse, getLesson } from '../utils/courses.js';
import { read } from '../utils/progress.js';

const router = express.Router();
const viewsDir = path.join(config.appDir, 'views');

router.get('/:lessonId', async (req, res, next) => {
  const { lessonId } = req.params;

  // Extract courseId from originalUrl since Express app.use() mount path
  // parameters are not passed to req.params in mounted routers.
  const courseMatch = req.originalUrl.match(/^\/courses\/([^\/]+)\/lessons\//);
  const courseId = courseMatch ? courseMatch[1] : null;

  if (!courseId) {
    const err = new Error('Invalid course URL');
    err.status = 404;
    return next(err);
  }

  const lesson = getLesson(courseId, lessonId);
  if (!lesson) {
    const err = new Error(`Lesson not found: ${courseId}/${lessonId}`);
    err.status = 404;
    return next(err);
  }

  const progress = read();
  const courseProgress = progress.courses[courseId] || {
    xp: 0,
    completedLessons: [],
    currentLesson: null,
    lastPlayed: null,
  };
  const completedLessons = courseProgress.completedLessons || [];

  // Must be unlocked: either already completed (replayable) or the first
  // non-completed lesson (available). Locked lessons return 404.
  const course = getCourse(courseId);
  const firstNonCompleted = course.lessons.find(
    (l) => !completedLessons.includes(l.id)
  );

  const isCompleted = completedLessons.includes(lessonId);
  const isAvailable = firstNonCompleted && firstNonCompleted.id === lessonId;

  if (!isCompleted && !isAvailable) {
    const err = new Error(`Lesson is locked: ${lessonId}`);
    err.status = 404;
    return next(err);
  }

  res.render('pages/lesson', {
    title: lesson.title,
    scripts: '',
    courseId,
    lessonId,
    lesson,
    firstExerciseHtml: await renderFile(path.join(viewsDir, 'exercises/multipleChoice.ejs'), {
      exercise: lesson.exercises[0],
    }),
  });
});

export default router;