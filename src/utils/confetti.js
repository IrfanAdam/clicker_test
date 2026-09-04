/**
 * Smooth confetti — lightweight, 60fps GPU-only.
 * Optimized: fewer particles, cached styles, single rAF.
 * @param {number} x - origin X
 * @param {number} y - origin Y
 */
let _confettiZi = null;
function getConfettiZi(){
  if(_confettiZi) return _confettiZi;
  _confettiZi = getComputedStyle(document.documentElement).getPropertyValue('--z-confetti').trim() || '9999';
  return _confettiZi;
}

export function spawnConfetti(x, y) {
  const colors = ['var(--blue-600)','var(--amber-700)','var(--emerald-600)','var(--rose-500)','var(--violet-600)'];
  const count = 20;
  const zi = getConfettiZi();
  const frag = document.createDocumentFragment();
  const items = [];
  const ih = window.innerHeight;
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
  // Single rAF loop (was 20) — less scheduler pressure
  let alive = items.length;
  const tick = (now) => {
    alive = 0;
    for(const it of items){
      if(!it.el.parentNode) continue;
      const dt = Math.min(32, now - it.t0) / 16.6;
      it.vx *= it.drag; it.vy += it.grav * dt;
      it.cx += it.vx * dt * .6; it.cy += it.vy * dt * .6; it.rx += it.rv * dt * .6;
      const p = (now - it.t0) / it.dur; it.op = .95 * (1 - p);
      it.el.style.transform = `translate3d(${it.cx}px,${it.cy}px,0) rotate(${it.rx}deg) scale(${it.scl})`;
      it.el.style.opacity = String(Math.max(0, it.op));
      if (p < 1 && it.op > .02 && it.cy < ih + 60) alive++;
      else it.el.remove();
    }
    if(alive>0) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
