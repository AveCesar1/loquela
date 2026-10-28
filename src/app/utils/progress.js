import config from '../config.js';
import { readJson, writeJsonAtomic, exists } from './files.js';
import { getCourse, getLesson } from './courses.js';

let progress = null;

function defaultShape() {
  return {
    version: 1,
    lastOpened: new Date().toISOString(),
    streak: {
      current: 0,
      longest: 0,
      lastDay: null,
    },
    courses: {},
  };
}

function ensureLoaded() {
  if (progress !== null && exists(config.progressPath)) return;
  if (!exists(config.progressPath)) {
    progress = defaultShape();
    writeJsonAtomic(config.progressPath, progress);
  } else {
    progress = readJson(config.progressPath);
  }
}

export function read() {
  ensureLoaded();
  return progress;
}

export function completeLesson(courseId, lessonId, xp, accuracy) {
  ensureLoaded();

  const course = getCourse(courseId);
  if (!course) {
    const err = new Error(`Course not found: ${courseId}`);
    err.status = 404;
    throw err;
  }

  const lesson = getLesson(courseId, lessonId);
  if (!lesson) {
    const err = new Error(`Lesson not found: ${courseId}/${lessonId}`);
    err.status = 404;
    throw err;
  }

  let courseProgress = progress.courses[courseId];
  if (!courseProgress) {
    const firstLesson = course.lessons[0];
    courseProgress = {
      xp: 0,
      completedLessons: [],
      currentLesson: firstLesson ? firstLesson.id : null,
      lastPlayed: null,
    };
  }

  // Idempotent: if already completed, return current object without changes
  if (courseProgress.completedLessons.includes(lessonId)) {
    return progress;
  }

  courseProgress.completedLessons.push(lessonId);
  courseProgress.xp += xp;
  courseProgress.lastPlayed = new Date().toISOString();

  const nextLesson = course.lessons.find(
    (l) => !courseProgress.completedLessons.includes(l.id)
  );
  courseProgress.currentLesson = nextLesson ? nextLesson.id : null;

  progress.courses[courseId] = courseProgress;
  progress.lastOpened = new Date().toISOString();

  writeJsonAtomic(config.progressPath, progress);
  return progress;
}