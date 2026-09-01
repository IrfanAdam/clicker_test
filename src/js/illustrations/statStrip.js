import { icon } from './icons.js';
import { state } from '../state.js';
function levelOf(score){ return Math.floor(score/100)+1; }
function rankOf(score){
  if(score>=1000) return '#3';
  if(score>=500) return '#7';
  if(score>=200) return '#12';
  if(score>=50) return '#28';
  return '#47';
}
export function renderStatStrip(){
  const el=document.getElementById('stat-strip');
  if(!el) return;
  const score=state.score||0;
  const streak=state.streak||0;
  const cards=[
    {label:'Score',value:String(score),bg:'var(--illus-yellow)',icon:'zap'},
    {label:'Level',value:'Lv '+levelOf(score),bg:'var(--illus-blue)',icon:'diamond'},
    {label:'Streak',value:streak?`×${streak}`:'—',bg:'var(--illus-orange)',icon:'flame'},
    {label:'Rank',value:rankOf(score),bg:'var(--illus-pink)',icon:'trophy'},
  ];
  el.innerHTML=cards.map(c=>`
    <div class="illus-card stat-card" style="background:${c.bg}">
      <span class="illus-blob-bg"></span>
      <span class="stat-label">${c.label}</span>
      <span class="stat-value">${c.value}</span>
      <span class="stat-icon-wrap">${icon(c.icon,{size:34})}</span>
    </div>`).join('');
}
