import express from 'express';
import { renderFile } from 'ejs';
import path from 'node:path';

import config from '../config.js';
import { getCourse } from '../utils/courses.js';
import { read } from '../utils/progress.js';

const router = express.Router();
const viewsDir = path.join(config.appDir, 'views');

router.get('/:courseId', async (req, res, next) => {
  const course = getCourse(req.params.courseId);
  if (!course) {
    const err = new Error(`Course not found: ${req.params.courseId}`);
    err.status = 404;
    return next(err);
  }

  const progress = read();
  const courseProgress = progress.courses[course.id] || {
    xp: 0,
    completedLessons: [],
    currentLesson: course.lessons[0] ? course.lessons[0].id : null,
    lastPlayed: null,
  };
  const completedLessons = courseProgress.completedLessons;
  const currentLessonId = courseProgress.currentLesson;

  const lessonStates = course.lessons.map((lesson) => {
    if (completedLessons.includes(lesson.id)) {
      return { id: lesson.id, title: lesson.title, state: 'completed' };
    }
    if (currentLessonId !== null && currentLessonId === lesson.id) {
      return { id: lesson.id, title: lesson.title, state: 'available' };
    }
    // Edge case: currentLesson is null but lessons remain uncompleted.
    // Mark the first non-completed lesson as available so the user can continue.
    if (currentLessonId === null) {
      const firstNonCompleted = course.lessons.find(
        (l) => !completedLessons.includes(l.id)
      );
      if (firstNonCompleted && firstNonCompleted.id === lesson.id) {
        return { id: lesson.id, title: lesson.title, state: 'available' };
      }
    }
    return { id: lesson.id, title: lesson.title, state: 'locked' };
  });

  const lessonNodes = await Promise.all(
    lessonStates.map((state) =>
      renderFile(path.join(viewsDir, 'partials/lessonNode.ejs'), {
        courseId: course.id,
        id: state.id,
        title: state.title,
        state: state.state,
      })
    )
  );

  res.render('pages/course', {
    title: course.title,
    scripts: '',
    course,
    progress: courseProgress,
    lessonStates,
    lessonNodes: lessonNodes.join(''),
  });
});

export default router;