import { state } from './state.js';
export const SHOP_ITEMS = [
  { id:'click_power_1', name:'Stronger Fingers', description:'Each click gives +2 extra power.', baseCost:15, costMultiplier:1.6, icon:'web', bg:'var(--illus-blue)', effect:()=>{ state.clickPower+=2; } },
  { id:'auto_clicker_1', name:'Reliable Assistant', description:'Generates 1 point every second.', baseCost:50, costMultiplier:1.8, icon:'clock', bg:'var(--illus-yellow)', effect:()=>{ state.autoClickers+=1; } },
  { id:'streak_1', name:'Quick Reflexes', description:'Streak bonus grows faster.', baseCost:100, costMultiplier:1.7, icon:'flame', bg:'var(--illus-orange)', effect:()=>{ state.clickPower+=1; state.streak+=1; } },
  { id:'multiplier_1', name:'Mega Market', description:'Double your total production.', baseCost:250, costMultiplier:2.5, icon:'trophy', bg:'var(--illus-pink)', effect:()=>{ state.multiplier*=2; } },
];
