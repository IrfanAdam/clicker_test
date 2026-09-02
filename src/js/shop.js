import { state, getCost } from './state.js';
import { SHOP_ITEMS } from './shopConfig.js';
import { spawnConfetti } from '../utils/confetti.js';
import { icon } from './illustrations/icons.js';
import { play, unlock } from './audio/audioManager.js';
import { centerPurchasable, setupMobileSwap } from './shopMobile.js';

let container = null;

export function initShop() {
  container = document.getElementById('shop-items');
  if (!container) return;
  container.innerHTML = '';
  SHOP_ITEMS.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'shop-item';
    el.innerHTML = `<div class="shop-icon-wrap" style="background:${item.bg}"><span class="illus-blob-sm"></span>${icon(item.icon, { size: 32 })}</div><div class="shop-item-info"><div class="shop-item-name"><strong>${item.name}</strong></div><div class="shop-item-description">${item.description}</div></div><div class="shop-item-action"><button class="buy-button">Buy</button><div class="shop-item-cost">${item.baseCost}</div></div>`;
    el.querySelector('.buy-button').onclick = () => handleBuy(idx);
    container.appendChild(el);
  });
  refreshShop();
  setupMobileSwap(container);
}

export function refreshShop() {
  if (!container) return;
  if (state.completed) {
    const els = container.querySelectorAll('.shop-item');
    els.forEach((el) => {
      el.classList.add('disabled');
      el.querySelector('.buy-button')?.classList.add('disabled');
      const c = el.querySelector('.shop-item-cost');
      if (c) c.textContent = 'Done';
    });
    centerPurchasable(container);
    return;
  }
  const els = container.querySelectorAll('.shop-item');
  SHOP_ITEMS.forEach((item, i) => {
    const el = els[i]; if (!el) return;
    const owned = !!state.ownedCounts[item.id];
    if (owned) {
      el.classList.add('disabled');
      el.querySelector('.buy-button').classList.add('disabled');
      el.querySelector('.shop-item-cost').textContent = 'Owned';
      return;
    }
    const cost = getCost(item);
    const can = state.score >= cost;
    el.classList.toggle('disabled', !can);
    el.querySelector('.buy-button').classList.toggle('disabled', !can);
    el.querySelector('.shop-item-cost').textContent = `Cost: ${cost}`;
  });
  centerPurchasable(container);
}

function handleBuy(idx) {
  const item = SHOP_ITEMS[idx]; if (!item) return;
  const cost = getCost(item);
  unlock();
  if (state.score < cost) { play('error'); return; }
  state.score = Math.max(0, state.score - cost);
  item.effect();
  state.ownedCounts[item.id] = (state.ownedCounts[item.id] || 0) + 1;
  document.dispatchEvent(new CustomEvent('score:changed'));
  play('buy');
  const btn = container.querySelectorAll('.buy-button')[idx];
  if (btn) { const r = btn.getBoundingClientRect(); spawnConfetti(r.left + r.width / 2, r.top + r.height / 2); }
}
