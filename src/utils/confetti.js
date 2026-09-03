/**
 * Smooth confetti — lightweight, 60fps GPU-only.
 * Optimized: fewer particles, cached styles, cheaper physics.
 * @param {number} x - origin X
 * @param {number} y - origin Y
 */
export function spawnConfetti(x, y) {
  const colors = ['var(--blue-600)','var(--amber-700)','var(--emerald-600)','var(--rose-500)','var(--violet-600)'];
  const count = 20;
  const zi = getComputedStyle(document.documentElement).getPropertyValue('--z-confetti').trim() || '9999';
  const frag = document.createDocumentFragment();
  const items = [];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const shape = Math.random();
    const size = shape > .85 ? 9 : shape > .6 ? 7 : 5;
    const color = colors[i % colors.length];
    let extra = '';
    if (shape < .4) extra = 'border-radius:50%';
    else if (shape < .7) extra = 'border-radius:2px';
    else if (shape < .85) extra = 'clip-path:polygon(50% 0%,0% 100%,100% 100%)';
    else extra = 'border-radius:999px';
    const w = shape > .85 ? size * 2 : size;
    const h = shape > .85 ? 2 : size;
    el.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${color};${extra};opacity:.95;pointer-events:none;z-index:${zi};will-change:transform,opacity;transform:translate3d(0,0,0)`;
    frag.appendChild(el);
    const angle = (Math.random() - .5) * Math.PI * 1.05;
    const vel = Math.random() * 5 + 4;
    items.push({
      el,
      vx: Math.cos(angle) * vel + (Math.random() - .5) * 2,
      vy: Math.sin(angle) * vel - Math.random() * 5 - 2,
      rx: Math.random() * 360, rv: (Math.random() - .5) * 7,
      cx: 0, cy: 0, op: .95, scl: 0.95 + Math.random() * .15,
      grav: .20, drag: .996,
      t0: performance.now(), dur: 980 + Math.random() * 320
    });
  }
  document.body.appendChild(frag);
  for (const it of items) {
    const step = (now) => {
      const dt = Math.min(32, now - it.t0) / 16.6;
      it.vx *= it.drag; it.vy += it.grav * dt;
      it.cx += it.vx * dt * .6; it.cy += it.vy * dt * .6; it.rx += it.rv * dt * .6;
      const p = (now - it.t0) / it.dur; it.op = .95 * (1 - p);
      it.el.style.transform = `translate3d(${it.cx}px,${it.cy}px,0) rotate(${it.rx}deg) scale(${it.scl})`;
      it.el.style.opacity = String(Math.max(0, it.op));
      if (p < 1 && it.op > .02 && it.cy < window.innerHeight + 60) requestAnimationFrame(step);
      else it.el.remove();
    };
    requestAnimationFrame(step);
  }
}

/**
 * Creates a floating text particle (e.g., "+1") that drifts upward.
 * @param {number} x - Screen X
 * @param {number} y - Screen Y
 * @param {string} text - Text to display
 */
export function createParticle(x, y, text) {
  const p = document.createElement('div');
  p.className = 'click-particle';
  p.textContent = text;
  const fs = getComputedStyle(document.documentElement).getPropertyValue('--text-heading').trim() || '1.5rem';
  const fw = getComputedStyle(document.documentElement).getPropertyValue('--font-weight-bold').trim() || '700';
  const zi = getComputedStyle(document.documentElement).getPropertyValue('--z-particle').trim() || '9999';
  const dur = getComputedStyle(document.documentElement).getPropertyValue('--duration-slow').trim() || '.8s';
  Object.assign(p.style, {
    position: 'fixed',
    left: `${x}px`,
    top: `${y}px`,
    fontSize: fs,
    fontWeight: fw,
    color: 'var(--color-primary)',
    pointerEvents: 'none',
    zIndex: zi,
    transition: `transform ${dur} var(--ease-out),opacity ${dur} var(--ease-out)`,
  });
  document.body.appendChild(p);
  requestAnimationFrame(() => {
    p.style.transform = 'translateY(calc((var(--space-24) + var(--space-1)) * -1))';
    p.style.opacity = '0';
  });
  setTimeout(() => p.remove(), 800);
}
