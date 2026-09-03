import { state, GOAL, addScore, resetGoal } from './state.js';
import { refreshShop } from './shop.js';
import { renderStatStrip } from './illustrations/statStrip.js';
import { play, unlock } from './audio/audioManager.js';
import { celebrate, hideCelebration } from './celebrate.js';

let scoreEl, statusEl, btn, replayBtn, clickTimer = null;

export function initGame() {
  scoreEl = document.getElementById('score-value');
  statusEl = document.getElementById('status-text');
  btn = document.getElementById('click-button');
  replayBtn = document.getElementById('replay-button');
  if (btn) btn.onclick = handleClick;
  if (replayBtn) replayBtn.onclick = handleReplay;
  document.addEventListener('score:changed', updateUI);
  document.addEventListener('goal:reached', onGoalReached);
  setInterval(tick, 1000);
  renderStatStrip();
  updateUI();
}

function updateUI() {
  if (scoreEl) scoreEl.textContent = Math.floor(state.score).toLocaleString();
  renderStatStrip();
  refreshShop();
}

function handleClick() {
  if (!btn || state.completed) return;
  unlock();
  const power = Math.min(state.clickPower * state.multiplier, GOAL - state.score);
  state.streak = (state.streak || 0) + 1;
  clearTimeout(clickTimer);
  clickTimer = setTimeout(() => { state.streak = 0; updateUI(); }, 1800);
  play('click');
  if (power > 0) addScore(power, { pitch: state.streak, delay: 42 });
  else updateUI();
  const colors = ['var(--blue-600)', 'var(--amber-700)', 'var(--emerald-700)', 'var(--rose-700)', 'var(--violet-700)', 'var(--cyan-600)', 'var(--orange-900)', 'var(--orange-700)'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  spawnParticle(`+${power}`, color, state.score < 500 ? 1 : 1.3);
  setTimeout(() => { if (statusEl && !state.completed) statusEl.textContent = 'Ready to click?'; }, 600);
}

function onGoalReached() {
  unlock();
  celebrate({ scoreEl, statusEl, btn, replayBtn });
}

function handleReplay() {
  hideCelebration();
  resetGoal();
  if (scoreEl) scoreEl.classList.remove('is-goal');
  if (btn) { btn.disabled = false; btn.style.opacity = ''; btn.style.pointerEvents = ''; }
  if (replayBtn) replayBtn.hidden = true;
  if (statusEl) statusEl.textContent = 'Click the button to begin!';
  updateUI();
}

function tick() {
  if (state.completed || state.autoClickers === 0) return;
  addScore(state.autoClickers * state.multiplier);
}

function spawnParticle(text, color, scale) {
  const el = document.createElement('div');
  el.className = 'float-particle';
  el.textContent = text;
  const fs = getComputedStyle(document.documentElement).getPropertyValue('--text-title').trim() || '1.4rem';
  const fw = getComputedStyle(document.documentElement).getPropertyValue('--font-weight-extrabold').trim() || '800';
  const zi = getComputedStyle(document.documentElement).getPropertyValue('--z-particle').trim() || '1000';
  el.style.cssText = `position:fixed;left:50%;top:40%;font-size:${fs};color:${color};pointer-events:none;z-index:${zi};font-weight:${fw};opacity:0;transform:translate(-50%,-50%) scale(${scale || 1})`;
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.className = 'float-particle burst'; });
  setTimeout(() => el.remove(), 800);
}

function spawnConfettiBurst() {
  const colors = ['var(--blue-600)', 'var(--amber-600)', 'var(--emerald-600)', 'var(--rose-600)', 'var(--color-accent-soft)'];
  for (let i = 0; i < 18; i++) {
    setTimeout(() => spawnParticle('✦', colors[i % colors.length], 1.6), i * 32);
  }
}
