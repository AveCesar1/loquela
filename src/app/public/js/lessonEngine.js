import { showFeedback } from './ui.js';
import { render as renderMC, validate as validateMC } from './exercises/multipleChoice.js';

window.LoquelaHandlers = window.LoquelaHandlers || {};
window.LoquelaHandlers['multiple-choice'] = { render: renderMC, validate: validateMC };

// Simple Web Audio-based sounds that complement the app aesthetic
const AudioPlayer = (() => {
  let ctx = null;

  const init = () => {
    if (ctx === null) ctx = new (window.AudioContext || window.webkitAudioContext)();
  };

  const play = (frequency, duration, type = 'sine', volume = 0.3) => {
    init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = frequency;
    osc.start();

    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.stop(ctx.currentTime + duration);
  };

  const playCorrect = () => {
    // Pleasant major arpeggio: root + major third + fifth
    play(261.63, 0.3, 'sine', 0.2); // C5
    setTimeout(() => play(329.63, 0.3, 'sine', 0.2), 80); // E5
    setTimeout(() => play(392.00, 0.3, 'sine', 0.2), 160); // G5
  };

  const playWrong = () => {
    // Short descending minor third
    play(293.66, 0.2, 'triangle', 0.15); // D5
    setTimeout(() => play(261.63, 0.15, 'triangle', 0.15), 60); // C5
  };

  return { playCorrect, playWrong };
})();

const lessonScript = document.getElementById('lesson-data');
const lesson = JSON.parse(lessonScript.textContent);
const courseId = lessonScript.dataset.courseId;
const lessonId = lessonScript.dataset.lessonId;

const exerciseRoot = document.getElementById('exercise-root');
const progressBar = document.querySelector('.lesson-progress__bar');

// Retry queue: indices of questions not yet mastered. Wrong answers go to the back.
let questionQueue = [...Array(lesson.exercises.length).keys()];
let mastered = new Set();
let correctCount = 0;
let currentHandler = null;
let awaitingContinue = false;

function updateProgress() {
  const masteredCount = mastered.size;
  const pct = lesson.exercises.length
    ? Math.round((masteredCount / lesson.exercises.length) * 100)
    : 0;
  progressBar.style.width = `${pct}%`;
}

function renderExercise() {
  // All questions mastered → lesson complete
  if (questionQueue.length === 0) {
    completeLesson();
    return;
  }

  const exerciseIndex = questionQueue[0];
  const exercise = lesson.exercises[exerciseIndex];
  currentHandler = window.LoquelaHandlers[exercise.type];
  if (!currentHandler) {
    throw new Error(`No handler registered for exercise type: ${exercise.type}`);
  }

  exerciseRoot.innerHTML = '';
  awaitingContinue = false;

  currentHandler.render(exercise, exerciseRoot, () => {
    if (awaitingContinue) return;
    handleOptionClick();
  });
  updateProgress();

  const continueBtn = document.createElement('button');
  continueBtn.type = 'button';
  continueBtn.className = 'btn continue-btn';
  continueBtn.textContent = 'Continue';
  continueBtn.classList.add('hidden');
  continueBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    handleContinue();
  });
  exerciseRoot.appendChild(continueBtn);
}

async function handleOptionClick() {
  if (awaitingContinue) return;

  const result = currentHandler.validate();
  const exerciseIndex = questionQueue[0];

  // Immediately apply Continue button state based on correctness
  const continueBtn = exerciseRoot.querySelector('.continue-btn');
  if (result.correct) {
    if (!mastered.has(exerciseIndex)) {
      mastered.add(exerciseIndex);
      correctCount++;
    }
    questionQueue.shift(); // mastered — remove from queue
    continueBtn.classList.remove('continue-btn--wrong');
    // Animate progress bar forward immediately on correct answer
    updateProgress();
    AudioPlayer.playCorrect();
  } else {
    // Not mastered — move to the back of the queue to be retried
    // Red Continue button immediately on wrong answers
    questionQueue.push(questionQueue.shift());
    continueBtn.classList.add('continue-btn--wrong');
    AudioPlayer.playWrong();
  }

  await showFeedback(result.correct, result.explanation);
  awaitingContinue = true;
  continueBtn.classList.remove('hidden');
}

async function handleContinue() {
  const continueBtn = exerciseRoot.querySelector('.continue-btn');
  continueBtn.classList.remove('continue-btn--wrong');

  if (questionQueue.length === 0) {
    completeLesson();
    return;
  }

  renderExercise();
}

async function completeLesson() {
  const accuracy = lesson.exercises.length
    ? correctCount / lesson.exercises.length
    : 0;

  showCompletionAnimation();

  await new Promise(resolve => setTimeout(resolve, 1500));

  const res = await fetch(`/api/lessons/${courseId}/${lessonId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accuracy }),
  });

  if (res.ok) {
    window.location.href = `/courses/${courseId}`;
  } else {
    alert('Failed to complete lesson. Please try again.');
  }
}

function showCompletionAnimation() {
  const existing = document.querySelector('.completion-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'completion-overlay';
  overlay.innerHTML = `
    <div class="completion-content">
      <div class="completion-checkmark">✓</div>
      <h2 class="completion-title">Lesson Complete!</h2>
      <p class="completion-message">Returning to course map&hellip;</p>
    </div>
  `;
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add('completion-overlay--active');
  });
}

renderExercise();