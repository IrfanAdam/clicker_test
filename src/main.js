import './styles/tokens.css';
import './styles/layout.css';
import './styles/game.css';
import './styles/shop.css';
import './styles/illustration.css';
import './styles/sound.css';
import './styles/mechanics.css';
import './styles/celebration.css';
import './styles/responsive.css';
import { initShop } from './js/shop.js';
import { initGame } from './js/game.js';
import { initSoundToggle } from './js/audio/soundToggle.js';
import { initProgress } from './js/progress.js';
function init() {
  initShop();
  initGame();
  initSoundToggle();
  initProgress();
  // Mechanics: lazy-load on demand (saves ~18KB initial JS)
  const link = document.getElementById('mechanics-link');
  if(link){
    let loaded = false;
    link.addEventListener('click', async e=>{
      e.preventDefault();
      if(!loaded){
        const { initMechanics } = await import('./js/mechanics/index.js');
        initMechanics();
        loaded = true;
        // re-dispatch click so initMechanics' handler runs (it listens for click)
        link.click();
      }
    }, { once: true });
  }
  const y = document.getElementById('copyright-year');
  if (y) y.textContent = new Date().getFullYear();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
