import { state, MAX_SCORE, addScore } from './state.js';
import { refreshShop } from './shop.js';
import { renderStatStrip } from './illustrations/statStrip.js';
import { play, unlock } from './audio/audioManager.js';

let scoreEl, statusEl, btn, clickTimer = null;

export function initGame() {
  scoreEl = document.getElementById('score-value');
  statusEl = document.getElementById('status-text');
  btn = document.getElementById('click-button');
  if (btn) btn.onclick = handleClick;
  document.addEventListener('score:changed', updateUI);
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
  if (!btn) return;
  unlock();
  const power = Math.min(state.clickPower * state.multiplier, MAX_SCORE - state.score);
  state.streak = (state.streak || 0) + 1;
  clearTimeout(clickTimer);
  clickTimer = setTimeout(() => { state.streak = 0; updateUI(); }, 1800);
  // tactile press — immediate
  play('click');
  // score increment — via common path, 42ms after tactile for separation
  if (power > 0) addScore(power, { pitch: state.streak, delay: 42 });
  else updateUI();
  const colors = ['var(--blue-600)', 'var(--amber-700)', 'var(--emerald-700)', 'var(--rose-700)', 'var(--violet-700)', 'var(--cyan-600)', 'var(--orange-900)', 'var(--orange-700)'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  spawnParticle(`+${power}`, color, state.score < 500 ? 1 : 1.3);
  setTimeout(() => { if (statusEl) statusEl.textContent = 'Ready to click?'; }, 600);
}

function tick() {
  if (state.autoClickers > 0) addScore(state.autoClickers * state.multiplier);
}

function spawnParticle(text, color, scale) {
  const el = document.createElement('div');
  el.className = 'float-particle';
  el.textContent = text;
  el.style.cssText = `position:fixed;left:50%;top:40%;font-size:1.4rem;color:${color};pointer-events:none;z-index:1000;font-weight:800;opacity:0;transform:translate(-50%,-50%) scale(${scale || 1})`;
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.className = 'float-particle burst'; });
  setTimeout(() => el.remove(), 800);
}
