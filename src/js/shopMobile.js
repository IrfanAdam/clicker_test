import { state, getCost } from './state.js';
import { SHOP_ITEMS } from './shopConfig.js';

let raf = 0;
let pending = null;

function doCenter(container){
  if (!window.matchMedia('(max-width:768px)').matches) return;
  if (!container) return;
  const els = [...container.querySelectorAll('.shop-item')];
  if (!els.length) return;
  let target = -1;
  let cheapest = Infinity, cheapestIdx = -1;
  SHOP_ITEMS.forEach((it, i) => {
    if (state.ownedCounts[it.id]) return;
    const c = getCost(it);
    if (c < cheapest) { cheapest = c; cheapestIdx = i; }
    if (target === -1 && state.score >= c) target = i;
  });
  if (target === -1) target = cheapestIdx !== -1 ? cheapestIdx : 0;
  els[target]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

export function centerPurchasable(container) {
  if(!container) return;
  // skip scheduling entirely on desktop
  if (!window.matchMedia('(max-width:768px)').matches) return;
  pending = container;
  if(raf) return;
  raf = requestAnimationFrame(()=>{
    raf = 0;
    const c = pending; pending = null;
    doCenter(c);
  });
}

export function setupMobileSwap(container) {
  const center = () => doCenter(container);
  // initial immediate (not throttled) so shop lands correctly on load
  center();
  window.matchMedia('(max-width:768px)').addEventListener('change', () => setTimeout(center, 80));
  document.addEventListener('score:changed', ()=> centerPurchasable(container));
}
