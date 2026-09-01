/**
 * Smooth confetti — diverse shapes, higher count, 60fps GPU-only.
 * @param {number} x - origin X
 * @param {number} y - origin Y
 */
import { play } from '../js/audio/audioManager.js';

export function spawnConfetti(x, y) {
  play('celebrate');
  const colors = ['var(--blue-600)', 'var(--blue-500)', 'var(--amber-700)', 'var(--amber-400)', 'var(--emerald-700)', 'var(--emerald-500)', 'var(--illus-blob)', 'var(--rose-500)', 'var(--violet-300)'];
  const count = 42;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const shape = Math.random();
    const size = shape > .85 ? Math.random() * 4 + 8 : shape > .6 ? Math.random() * 5 + 6 : Math.random() * 4 + 5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    let extra = '';
    if (shape < .35) extra = 'border-radius:50%';
    else if (shape < .6) extra = 'border-radius:2px';
    else if (shape < .85) extra = 'clip-path:polygon(50% 0%,0% 100%,100% 100%)';
    else extra = `width:${size * 2}px;height:2px;border-radius:999px`;
    const w = shape > .85 ? size * 2 : size;
    const h = shape > .85 ? 2 : size;
    el.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${color};${extra};opacity:0.95;pointer-events:none;z-index:9999;will-change:transform,opacity;transform:translate3d(0,0,0)`;
    document.body.appendChild(el);
    const angle = (Math.random() - .5) * Math.PI * 1.15;
    const vel = Math.random() * 6 + 4;
    let vx = Math.cos(angle) * vel + (Math.random() - .5) * 3;
    let vy = Math.sin(angle) * vel - Math.random() * 6 - 2;
    let rx = Math.random() * 360, rv = (Math.random() - .5) * 9;
    let cx = 0, cy = 0, op = .95, scl = shape > .85 ? 1 : 0.9 + Math.random() * .3;
    let grav = .22, drag = .995;
    const t0 = performance.now(), dur = 1100 + Math.random() * 500;
    const step = (now) => {
      const dt = Math.min(32, now - t0) / 16.6;
      vx *= drag; vy += grav * dt;
      cx += vx * dt * .55; cy += vy * dt * .55; rx += rv * dt * .6;
      const p = (now - t0) / dur; op = .95 * (1 - p);
      el.style.transform = `translate3d(${cx}px,${cy}px,0) rotate(${rx}deg) scale(${scl})`;
      el.style.opacity = String(Math.max(0, op));
      if (p < 1 && op > 0 && cy < window.innerHeight + 40) requestAnimationFrame(step);
      else el.remove();
    };
    requestAnimationFrame(step);
  }
}
/**
 * Creates a floating text particle (e.g., \"+1\") that drifts upward.
 * @param {number} x - Screen X
 * @param {number} y - Screen Y
 * @param {string} text - Text to display
 */
export function createParticle(x, y, text) {
  const p = document.createElement('div');
  p.className = 'click-particle';
  p.textContent = text;
  Object.assign(p.style, {
    position: 'fixed',
    left: `${x}px`,
    top: `${y}px`,
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--color-primary)',
    pointerEvents: 'none',
    zIndex: '9999',
    transition: 'transform .8s ease-out,opacity .8s ease-out',
  });
  document.body.appendChild(p);
  requestAnimationFrame(() => {
    p.style.transform = 'translateY(-50px)';
    p.style.opacity = '0';
  });
  setTimeout(() => p.remove(), 800);
}
