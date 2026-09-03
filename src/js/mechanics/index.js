import { createMechanicsCanvas } from './canvas.js';
import { isMuted, setMuted } from '../audio/audioManager.js';
import { syncSoundToggle } from '../audio/soundToggle.js';
import { getMode } from './graph.js';
let engine = null;
let view=null, gameLayout=null, appFooter=null;
let autoMuted=false;
export function initMechanics(){
  view = document.getElementById('mechanics-view');
  gameLayout = document.querySelector('.game-layout');
  appFooter = document.querySelector('.app-footer');
  const link = document.getElementById('mechanics-link');
  const back = document.getElementById('mechanics-back');
  const canvas = document.getElementById('mechanics-canvas');
  const tip = document.getElementById('mechanics-tooltip');
  const toggle = document.getElementById('mechanics-chrome-toggle');
  const modeSelect = document.getElementById('mechanics-mode');
  const subtitle = document.querySelector('.mechanics-title p');
  if(!view || !link || !back || !canvas) return;
  link.addEventListener('click', e=>{ e.preventDefault(); show(); });
  back.addEventListener('click', hide);
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape' && !view.hidden) hide();
    if((e.key==='h'||e.key==='H') && !view.hidden && !e.metaKey && !e.ctrlKey){
      if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') return;
      toggleChrome();
    }
  });
  let inited=false;
  function toggleChrome(){
    const clean=view.classList.toggle('mechanics-view--clean');
    if(toggle){ toggle.setAttribute('aria-pressed', String(clean)); toggle.textContent=clean?'◳ Show':'◱ Hide'; }
    if(engine) engine.resize();
  }
  if(toggle) toggle.addEventListener('click', toggleChrome);
  function syncModeUI(){
    const m = engine ? engine.getMode() : getMode();
    if(modeSelect) modeSelect.value = m;
    if(subtitle){
      subtitle.textContent = m==='components' ? 'Component hierarchy · layout · IA' : 'Function wiring · events · data flow';
    }
    const lanePills = document.querySelectorAll('.mechanics-float-legends .mech-pill--lane');
    if(lanePills.length>=5){
      if(m==='components'){
        lanePills[0].lastChild.textContent=' Shell';
        lanePills[1].lastChild.textContent=' Layout';
        lanePills[2].lastChild.textContent=' Game Display';
        lanePills[3].lastChild.textContent=' Commerce';
        lanePills[4].lastChild.textContent=' Feedback';
      } else {
        lanePills[0].lastChild.textContent=' Boot';
        lanePills[1].lastChild.textContent=' State';
        lanePills[2].lastChild.textContent=' Game';
        lanePills[3].lastChild.textContent=' Shop';
        lanePills[4].lastChild.textContent=' Out';
      }
    }
    const footerFlow = document.querySelector('.mechanics-footer span:first-child');
    if(footerFlow){
      footerFlow.innerHTML = m==='components'
        ? '<strong>IA:</strong> app → header/layout → game-area/shop-area → widgets → feedback overlays'
        : '<strong>Flow:</strong> init → initGame/initShop → click / tick → addScore → score:changed → updateUI → refreshShop + statStrip';
    }
  }
  if(modeSelect){
    try{ modeSelect.value = getMode(); }catch{}
    modeSelect.addEventListener('change', e=>{
      if(!engine){ try{ localStorage.setItem('mechanics:mode', e.target.value); }catch{} syncModeUI(); return; }
      engine.setMode(e.target.value);
      syncModeUI();
    });
    document.addEventListener('mechanics:mode', syncModeUI);
  }
  function restoreMuteIfNeeded(){
    if(!autoMuted) return;
    try{
      const forced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(!forced && isMuted()){ setMuted(false); syncSoundToggle(); }
    }catch{ if(isMuted()){ setMuted(false); syncSoundToggle(); } }
    autoMuted=false;
  }
  function show(){
    if(!isMuted()){ autoMuted=true; setMuted(true); syncSoundToggle(); }
    else autoMuted=false;
    view.hidden=false;
    if(gameLayout) gameLayout.style.display='none';
    if(appFooter) appFooter.style.display='none';
    document.body.style.overflow='hidden';
    if(!inited){ engine=createMechanicsCanvas(canvas,tip); inited=true; }
    else engine.resize();
    syncModeUI();
    back.focus();
    history.pushState({mechanics:true},'');
  }
  function hide(){
    if(view.hidden) return;
    view.hidden=true;
    if(gameLayout) gameLayout.style.display='';
    if(appFooter) appFooter.style.display='';
    document.body.style.overflow='';
    const shouldRestore=autoMuted;
    if(shouldRestore) restoreMuteIfNeeded(); else autoMuted=false;
    if(history.state && history.state.mechanics) history.back();
    else document.getElementById('mechanics-link')?.focus();
  }
  window.addEventListener('popstate', ()=>{
    if(view.hidden) return;
    view.hidden=true;
    if(gameLayout) gameLayout.style.display='';
    if(appFooter) appFooter.style.display='';
    document.body.style.overflow='';
    if(autoMuted) restoreMuteIfNeeded();
  });
}
