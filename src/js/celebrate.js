import { play } from './audio/audioManager.js';
import { spawnConfetti } from '../utils/confetti.js';
import { GOAL } from './state.js';

let overlay = null;

function ensureOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.className = 'celebration-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Goal reached celebration');
  overlay.innerHTML = `
    <div class="celebration-card">
      <div class="celebration-badge">✦ You've tapped enough</div>
      <h2 class="celebration-title"><span>${GOAL} / ${GOAL}</span> — now go touch grass</h2>
      <p class="celebration-sub">${GOAL} taps of pure dedication. Your finger's officially tired, your screen's traumatized — take a bow, tap legend.</p>
      <div class="celebration-actions">
        <button type="button" class="celebration-again">Play again</button>
        <button type="button" class="celebration-close">Close</button>
      </div>
    </div>`;
  overlay.querySelector('.celebration-close').onclick = hideCelebration;
  overlay.querySelector('.celebration-again').onclick = () => {
    hideCelebration();
    document.getElementById('replay-button')?.click();
  };
  overlay.addEventListener('click', (e) => { if (e.target === overlay) hideCelebration(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay?.classList.contains('is-open')) hideCelebration(); });
  document.body.appendChild(overlay);
  return overlay;
}

export function hideCelebration() {
  if (!overlay) return;
  overlay.classList.remove('is-open');
}

export function celebrate({ scoreEl, statusEl, btn, replayBtn } = {}) {
  const ov = ensureOverlay();
  if (ov.classList.contains('is-open')) return;
  // Haptics
  try { navigator.vibrate?.([40, 30, 60]); } catch {}
  // Sound — single fanfare (confetti no longer triggers audio)
  play('celebrate');
  // Score & area glow
  const gameArea = document.getElementById('action-zone') || document.querySelector('.game-area');
  if (scoreEl) scoreEl.classList.add('is-goal');
  if (gameArea) {
    gameArea.classList.remove('is-celebrating'); void gameArea.offsetWidth;
    gameArea.classList.add('is-celebrating');
    gameArea.classList.add('shake');
    setTimeout(() => gameArea.classList.remove('shake'), 500);
    setTimeout(() => gameArea.classList.remove('is-celebrating'), 1400);
  }
  if (statusEl) statusEl.textContent = 'You’ve tapped enough! 🎉 — now go touch grass';
  // Confetti — two waves only (was 3), lighter count (20 each vs 42)
  const cx = window.innerWidth / 2, cy = window.innerHeight * 0.34;
  const bx = btn?.getBoundingClientRect();
  const bX = bx ? bx.left + bx.width / 2 : cx;
  const bY = bx ? bx.top + bx.height / 2 : cy + 80;
  spawnConfetti(cx, cy);
  setTimeout(() => spawnConfetti(bX, bY), 160);
  // Single star burst (was 2×14=28)
  burstStars(cx, cy);
  // Reveal overlay late — let particles start first
  setTimeout(() => ov.classList.add('is-open'), 420);
  // Also ensure replay visible
  if (replayBtn) replayBtn.hidden = false;
  if (btn) { btn.disabled = true; btn.style.opacity = '.55'; btn.style.pointerEvents = 'none'; }
}

function burstStars(x, y) {
  const colors = ['var(--amber-400)', 'var(--amber-700)', 'var(--rose-500)', 'var(--violet-600)'];
  for (let i = 0; i < 8; i++) {
    const el = document.createElement('div');
    el.textContent = '✦';
    const c = colors[i % colors.length];
    const sz = 12 + Math.random() * 6;
    el.style.cssText = `position:fixed;left:${x}px;top:${y}px;font-size:${sz}px;color:${c};pointer-events:none;z-index:9999;line-height:1;will-change:transform,opacity;transform:translate3d(0,0,0)`;
    document.body.appendChild(el);
    const ang = (Math.PI * 2 * i) / 8 + (Math.random() - .5) * .25;
    const dist = 60 + Math.random() * 70;
    const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 18;
    const dur = 560 + Math.random() * 200;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.style.transform = `translate3d(${dx * eased}px,${dy * eased}px,0) rotate(${p * 140}deg)`;
      el.style.opacity = String(1 - p);
      if (p < 1) requestAnimationFrame(step); else el.remove();
    };
    requestAnimationFrame(step);
  }
}
