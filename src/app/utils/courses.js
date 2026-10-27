import fs from 'node:fs';
import path from 'node:path';

import config from '../config.js';
import { readJson, exists } from './files.js';
import { validateCourse, validateLesson } from './validate.js';

const courses = new Map();

export function loadAll() {
  if (!exists(config.coursesDir)) {
    throw new Error(`Courses directory not found: ${config.coursesDir}`);
  }

  const courseDirs = fs.readdirSync(config.coursesDir);

  for (const courseId of courseDirs) {
    const courseDir = path.join(config.coursesDir, courseId);
    if (!fs.statSync(courseDir).isDirectory()) continue;

    const coursePath = path.join(courseDir, 'course.json');
    const course = readJson(coursePath);
    validateCourse(course);

    if (course.id !== courseId) {
      throw new Error(
        `Invalid ${coursePath}: field 'id' is "${course.id}" but the folder name is "${courseId}"`
      );
    }

    const lessonsDir = path.join(courseDir, 'lessons');
    const lessonMap = new Map();
    const lessons = [];

    for (const lessonId of course.lessons) {
      const lessonPath = path.join(lessonsDir, `${lessonId}.json`);
      const lesson = readJson(lessonPath);
      validateLesson(lesson);

      if (lesson.id !== lessonId) {
        throw new Error(
          `Invalid ${lessonPath}: field 'id' is "${lesson.id}" but the filename is "${lessonId}.json"`
        );
      }

      lessonMap.set(lessonId, lesson);
      lessons.push(lesson);
    }

    course.lessons = lessons;
    course.lessonMap = lessonMap;
    courses.set(courseId, course);
  }
}

export function listCourses() {
  return [...courses.values()].map((course) => ({
    id: course.id,
    title: course.title,
    subtitle: course.subtitle,
    description: course.description,
    level: course.level,
    color: course.color,
    icon: course.icon,
    lessonCount: course.lessons.length,
    completedCount: 0,
  }));
}

export function getCourse(id) {
  return courses.get(id);
}

export function getLesson(courseId, lessonId) {
  const course = courses.get(courseId);
  if (!course) return undefined;
  return course.lessonMap.get(lessonId);
}

export function existsCourse(id) {
  return courses.has(id);
}

export function existsLesson(courseId, lessonId) {
  const course = courses.get(courseId);
  if (!course) return false;
  return course.lessonMap.has(lessonId);
}