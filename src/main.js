import { initShop } from './js/shop.js';
import { initGame } from './js/game.js';
import { initSoundToggle } from './js/audio/soundToggle.js';
import { initMechanics } from './js/mechanics/index.js';
import { initProgress } from './js/progress.js';
function init() {
  initShop();
  initGame();
  initSoundToggle();
  initMechanics();
  initProgress();
  const y = document.getElementById('copyright-year');
  if (y) y.textContent = new Date().getFullYear();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
