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
  const shopArea = document.querySelector('.shop-area');
  const gameArea = document.getElementById('action-zone');
  const gameLayout = document.querySelector('.game-layout');
  const progressWrap = document.querySelector('.progress-wrap');
  if (!shopArea || !gameArea || !gameLayout) return;
  let lastMobile = null;
  const reposition = () => {
    const isMobile = window.matchMedia('(max-width:768px)').matches;
    if (isMobile === lastMobile) return;
    lastMobile = isMobile;
    if (isMobile) {
      if (shopArea.parentElement !== gameArea) {
        if (progressWrap?.parentElement === gameArea) progressWrap.after(shopArea);
        else gameArea.prepend(shopArea);
      }
    } else if (shopArea.parentElement !== gameLayout) gameLayout.appendChild(shopArea);
    setTimeout(() => centerPurchasable(container), 80);
  };
  reposition();
  window.matchMedia('(max-width:768px)').addEventListener('change', reposition);
  document.addEventListener('score:changed', () => centerPurchasable(container));
}
