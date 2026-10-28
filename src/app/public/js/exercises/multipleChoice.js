let selectedIndex = null;
let correctIndex = null;
let explanation = '';

export function render(exercise, container, onOptionClick) {
  selectedIndex = null;
  correctIndex = exercise.correctIndex;
  explanation = exercise.explanation || '';

  container.dataset.correctIndex = String(correctIndex);

  const html = `
    <div class="exercise">
      <p class="exercise__prompt">${escapeHtml(exercise.prompt)}</p>
      <div class="exercise__options">
        ${exercise.options.map((option, i) => `
          <button type="button" class="option" data-index="${i}">${escapeHtml(option)}</button>
        `).join('')}
      </div>
    </div>
  `;
  container.innerHTML = html;

  container.querySelectorAll('.option').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.option').forEach(b => b.classList.remove('option--selected'));
      btn.classList.add('option--selected');
      selectedIndex = parseInt(btn.dataset.index, 10);
      if (onOptionClick) onOptionClick(selectedIndex);
    });
  });
}

export function validate() {
  return {
    correct: selectedIndex === correctIndex,
    explanation,
  };
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

window.LoquelaHandlers = window.LoquelaHandlers || {};
window.LoquelaHandlers['multiple-choice'] = { render, validate };