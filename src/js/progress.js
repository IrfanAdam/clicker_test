import { GOAL, state } from './state.js';
export function initProgress() {
  const fill = document.getElementById('progress-fill');
  const pct = document.getElementById('progress-pct');
  const goal = document.getElementById('progress-goal');
  const wrap = document.querySelector('.progress-wrap');
  if (!fill || !wrap) return;
  const render = () => {
    const p = Math.min(100, Math.round((state.score / GOAL) * 100));
    fill.style.width = p + '%';
    if (pct) pct.textContent = state.completed ? 'Goal!' : p + '%';
    if (goal) goal.textContent = `${state.score.toLocaleString()} / ${GOAL.toLocaleString()}`;
    wrap.setAttribute('aria-valuenow', String(state.score));
    wrap.classList.toggle('is-complete', state.completed);
  };
  document.addEventListener('score:changed', render);
  document.addEventListener('goal:reached', render);
  render();
}
