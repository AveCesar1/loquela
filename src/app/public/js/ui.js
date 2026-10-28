export function showFeedback(correct, explanation) {
  const existing = document.querySelector('.feedback');
  if (existing) existing.remove();

  const feedback = document.createElement('div');
  feedback.className = `feedback ${correct ? 'feedback--correct' : 'feedback--incorrect'}`;
  feedback.innerHTML = `
    <h3 class="feedback__title">${correct ? 'Correct!' : 'Incorrect'}</h3>
    <p class="feedback__body">${escapeHtml(explanation)}</p>
  `;

  document.getElementById('exercise-root').appendChild(feedback);

  return new Promise(resolve => {
    setTimeout(resolve, 600);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}