import { state, getCost } from './state.js';
import { SHOP_ITEMS } from './shopConfig.js';

export function centerPurchasable(container) {
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

export function setupMobileSwap(container) {
  // Shop stays as its own separate container (sibling to game-area in .game-layout).
  // No DOM reparenting — only auto-scroll to the cheapest purchasable item on mobile.
  const center = () => centerPurchasable(container);
  center();
  window.matchMedia('(max-width:768px)').addEventListener('change', () => setTimeout(center, 80));
  document.addEventListener('score:changed', center);
}
