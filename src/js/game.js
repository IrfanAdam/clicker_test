import { state, GOAL, addScore, resetGoal } from './state.js';
import { refreshShop } from './shop.js';
import { renderStatStrip } from './illustrations/statStrip.js';
import { play, unlock } from './audio/audioManager.js';
import { celebrate, hideCelebration } from './celebrate.js';

let scoreEl, statusEl, btn, replayBtn, clickTimer = null, tickId = null;
let _particleStyle = null;
function getParticleStyle(){
  if(_particleStyle) return _particleStyle;
  const s = getComputedStyle(document.documentElement);
  _particleStyle = {
    fs: s.getPropertyValue('--text-title').trim() || '1.4rem',
    fw: s.getPropertyValue('--font-weight-extrabold').trim() || '800',
    zi: s.getPropertyValue('--z-particle').trim() || '1000',
  };
  return _particleStyle;
}
function ensureTick(){
  const need = state.autoClickers > 0 && !state.completed;
  if(need && !tickId) tickId = setInterval(tick, 1000);
  else if(!need && tickId){ clearInterval(tickId); tickId = null; }
}

export function initGame() {
  scoreEl = document.getElementById('score-value');
  statusEl = document.getElementById('status-text');
  btn = document.getElementById('click-button');
  replayBtn = document.getElementById('replay-button');
  if (btn) btn.onclick = handleClick;
  if (replayBtn) replayBtn.onclick = handleReplay;
  document.addEventListener('score:changed', updateUI);
  document.addEventListener('goal:reached', onGoalReached);
  ensureTick();
  renderStatStrip();
  updateUI();
}

function updateUI() {
  if (scoreEl) scoreEl.textContent = Math.floor(state.score).toLocaleString();
  renderStatStrip();
  refreshShop();
  ensureTick();
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
  spawnParticle(`+${power}`, color, state.score < GOAL ? 1 : 1.3);
  setTimeout(() => { if (statusEl && !state.completed) statusEl.textContent = 'Keep tapping!'; }, 600);
}

function onGoalReached() {
  unlock();
  ensureTick();
  celebrate({ scoreEl, statusEl, btn, replayBtn });
}

function handleReplay() {
  hideCelebration();
  resetGoal();
  if (scoreEl) scoreEl.classList.remove('is-goal');
  if (btn) { btn.disabled = false; btn.style.opacity = ''; btn.style.pointerEvents = ''; }
  if (replayBtn) replayBtn.hidden = true;
  if (statusEl) statusEl.textContent = 'Tap the button to begin!';
  updateUI();
  ensureTick();
}

function tick() {
  if (state.completed || state.autoClickers === 0) return;
  addScore(state.autoClickers * state.multiplier);
}

function spawnParticle(text, color, scale) {
  const el = document.createElement('div');
  el.className = 'float-particle';
  el.textContent = text;
  const { fs, fw, zi } = getParticleStyle();
  el.style.cssText = `position:fixed;left:50%;top:40%;font-size:${fs};color:${color};pointer-events:none;z-index:${zi};font-weight:${fw};opacity:0;transform:translate(-50%,-50%) scale(${scale || 1})`;
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.className = 'float-particle burst'; });
  setTimeout(() => el.remove(), 800);
}
