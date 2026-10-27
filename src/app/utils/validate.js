const SUPPORTED_TYPES = new Set([
  'multiple-choice',
  'translate',
  'matching',
  'order',
  'fill-blank',
  'true-false',
]);

function isString(value) {
  return typeof value === 'string';
}

function isInteger(value) {
  return Number.isInteger(value);
}

function isBoolean(value) {
  return typeof value === 'boolean';
}

function isArray(value) {
  return Array.isArray(value);
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function required(obj, field) {
  if (!(field in obj)) {
    throw new Error(`Missing required field '${field}'`);
  }
  return obj[field];
}

function checkType(value, field, expected) {
  let ok = false;
  if (expected === 'string') ok = isString(value);
  else if (expected === 'integer') ok = isInteger(value);
  else if (expected === 'boolean') ok = isBoolean(value);
  else if (expected === 'array') ok = isArray(value);
  else if (expected === 'object') ok = isPlainObject(value);
  if (!ok) {
    throw new Error(`Field '${field}' must be a ${expected}`);
  }
}

export function validateCourse(course) {
  if (!isPlainObject(course)) {
    throw new Error('course must be an object');
  }
  for (const field of ['id', 'title', 'subtitle', 'description', 'level', 'color', 'icon', 'order', 'lessons']) {
    required(course, field);
  }
  checkType(course.id, 'id', 'string');
  checkType(course.title, 'title', 'string');
  checkType(course.subtitle, 'subtitle', 'string');
  checkType(course.description, 'description', 'string');
  checkType(course.level, 'level', 'string');
  checkType(course.color, 'color', 'string');
  checkType(course.icon, 'icon', 'string');
  checkType(course.order, 'order', 'integer');
  checkType(course.lessons, 'lessons', 'array');
  if (!course.lessons.every(isString)) {
    throw new Error("Field 'lessons' must be an array of strings");
  }
}

export function validateLesson(lesson) {
  if (!isPlainObject(lesson)) {
    throw new Error('lesson must be an object');
  }
  for (const field of ['id', 'title', 'subtitle', 'description', 'xp', 'order', 'exercises']) {
    required(lesson, field);
  }
  checkType(lesson.id, 'id', 'string');
  checkType(lesson.title, 'title', 'string');
  checkType(lesson.subtitle, 'subtitle', 'string');
  checkType(lesson.description, 'description', 'string');
  checkType(lesson.xp, 'xp', 'integer');
  if (lesson.xp < 5 || lesson.xp > 100) {
    throw new Error("Field 'xp' must be an integer between 5 and 100");
  }
  checkType(lesson.order, 'order', 'integer');
  if (lesson.shuffle !== undefined) {
    checkType(lesson.shuffle, 'shuffle', 'boolean');
  }
  if (lesson.completionMessage !== undefined) {
    checkType(lesson.completionMessage, 'completionMessage', 'string');
  }
  checkType(lesson.exercises, 'exercises', 'array');
  if (lesson.exercises.length === 0) {
    throw new Error("Field 'exercises' must be a non-empty array");
  }
  for (const exercise of lesson.exercises) {
    validateExercise(exercise);
  }
function validateExercise(exercise) {
  if (!isPlainObject(exercise)) {
    throw new Error('exercise must be an object');
  }
  required(exercise, 'type');
  checkType(exercise.type, 'type', 'string');
  if (!SUPPORTED_TYPES.has(exercise.type)) {
    throw new Error(`Field 'type' must be one of ${[...SUPPORTED_TYPES].join(', ')}`);
  }
  switch (exercise.type) {
    case 'multiple-choice':
      validateMultipleChoice(exercise);
      break;
    case 'translate':
      validateTranslate(exercise);
      break;
    case 'matching':
      validateMatching(exercise);
      break;
    case 'order':
      validateOrder(exercise);
      break;
    case 'fill-blank':
      validateFillBlank(exercise);
      break;
    case 'true-false':
      validateTrueFalse(exercise);
      break;
    default:
      throw new Error(`Unsupported exercise type '${exercise.type}'`);
  }
}

function validateMultipleChoice(exercise) {
  required(exercise, 'prompt');
  checkType(exercise.prompt, 'prompt', 'string');
  required(exercise, 'options');
  checkType(exercise.options, 'options', 'array');
  if (exercise.options.length < 2 || exercise.options.length > 6) {
    throw new Error("Field 'options' must contain between 2 and 6 items");
  }
  if (!exercise.options.every(isString)) {
    throw new Error("Field 'options' must be an array of strings");
  }
  required(exercise, 'correctIndex');
  checkType(exercise.correctIndex, 'correctIndex', 'integer');
  if (exercise.correctIndex < 0 || exercise.correctIndex >= exercise.options.length) {
    throw new Error("Field 'correctIndex' must be a valid index into 'options'");
  }
  if (exercise.explanation !== undefined) {
    checkType(exercise.explanation, 'explanation', 'string');
  }
}

function validateTranslate(exercise) {
  required(exercise, 'direction');
  checkType(exercise.direction, 'direction', 'string');
  if (!['en-la', 'la-en'].includes(exercise.direction)) {
    throw new Error("Field 'direction' must be 'en-la' or 'la-en'");
  }
  required(exercise, 'source');
  checkType(exercise.source, 'source', 'string');
  required(exercise, 'correct');
  checkType(exercise.correct, 'correct', 'array');
  if (!exercise.correct.every(isString)) {
    throw new Error("Field 'correct' must be an array of strings");
  }
  if (exercise.hint !== undefined) {
    checkType(exercise.hint, 'hint', 'string');
  }
  if (exercise.explanation !== undefined) {
    checkType(exercise.explanation, 'explanation', 'string');
  }
}

function validateMatching(exercise) {
  required(exercise, 'prompt');
  checkType(exercise.prompt, 'prompt', 'string');
  required(exercise, 'pairs');
  checkType(exercise.pairs, 'pairs', 'array');
  if (exercise.pairs.length < 2 || exercise.pairs.length > 6) {
    throw new Error("Field 'pairs' must contain between 2 and 6 items");
  }
  for (const pair of exercise.pairs) {
    if (!isPlainObject(pair)) {
      throw new Error("Each item in field 'pairs' must be an object");
    }
    required(pair, 'left');
    required(pair, 'right');
    checkType(pair.left, 'left', 'string');
    checkType(pair.right, 'right', 'string');
  }
  if (exercise.explanation !== undefined) {
    checkType(exercise.explanation, 'explanation', 'string');
  }
}

function validateOrder(exercise) {
  required(exercise, 'prompt');
  checkType(exercise.prompt, 'prompt', 'string');
  required(exercise, 'tokens');
  checkType(exercise.tokens, 'tokens', 'array');
  if (exercise.tokens.length < 2 || exercise.tokens.length > 10) {
    throw new Error("Field 'tokens' must contain between 2 and 10 items");
  }
  if (!exercise.tokens.every(isString)) {
    throw new Error("Field 'tokens' must be an array of strings");
  }
  required(exercise, 'correct');
  checkType(exercise.correct, 'correct', 'array');
  if (!exercise.correct.every(isString)) {
    throw new Error("Field 'correct' must be an array of strings");
  }
  if (exercise.explanation !== undefined) {
    checkType(exercise.explanation, 'explanation', 'string');
  }
}

function validateFillBlank(exercise) {
  required(exercise, 'prompt');
  checkType(exercise.prompt, 'prompt', 'string');
  required(exercise, 'before');
  checkType(exercise.before, 'before', 'string');
  required(exercise, 'after');
  checkType(exercise.after, 'after', 'string');
  required(exercise, 'correct');
  checkType(exercise.correct, 'correct', 'array');
  if (!exercise.correct.every(isString)) {
    throw new Error("Field 'correct' must be an array of strings");
  }
  if (exercise.explanation !== undefined) {
    checkType(exercise.explanation, 'explanation', 'string');
  }
}

function validateTrueFalse(exercise) {
  required(exercise, 'prompt');
  checkType(exercise.prompt, 'prompt', 'string');
  required(exercise, 'correct');
  checkType(exercise.correct, 'correct', 'boolean');
  if (exercise.explanation !== undefined) {
    checkType(exercise.explanation, 'explanation', 'string');
  }
}
}