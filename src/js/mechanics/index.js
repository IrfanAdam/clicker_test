import { createMechanicsCanvas } from './canvas.js';
let engine = null;
let view=null, gameLayout=null, appFooter=null;
export function initMechanics(){
  view = document.getElementById('mechanics-view');
  gameLayout = document.querySelector('.game-layout');
  appFooter = document.querySelector('.app-footer');
  const link = document.getElementById('mechanics-link');
  const back = document.getElementById('mechanics-back');
  const canvas = document.getElementById('mechanics-canvas');
  const tip = document.getElementById('mechanics-tooltip');
  const toggle = document.getElementById('mechanics-chrome-toggle');
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
    if(toggle){ toggle.setAttribute('aria-pressed', String(clean)); toggle.textContent=clean?'◳ Show chrome':'◱ Hide chrome'; }
    if(engine) engine.resize();
  }
  if(toggle) toggle.addEventListener('click', toggleChrome);
  function show(){
    view.hidden=false;
    if(gameLayout) gameLayout.style.display='none';
    if(appFooter) appFooter.style.display='none';
    document.body.style.overflow='hidden';
    if(!inited){ engine=createMechanicsCanvas(canvas,tip); inited=true; }
    else engine.resize();
    back.focus();
    history.pushState({mechanics:true},'');
  }
  function hide(){
    view.hidden=true;
    if(gameLayout) gameLayout.style.display='';
    if(appFooter) appFooter.style.display='';
    document.body.style.overflow='';
    if(history.state && history.state.mechanics) history.back();
    document.getElementById('mechanics-link')?.focus();
  }
  window.addEventListener('popstate', ()=>{ if(!view.hidden) { view.hidden=true; if(gameLayout) gameLayout.style.display=''; if(appFooter) appFooter.style.display=''; document.body.style.overflow=''; }});
}
