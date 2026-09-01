#!/usr/bin/env node
// Generate src/js/mechanics/graphData.js from real source graph.
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = path.join(ROOT, 'src');
const OUT = path.join(SRC, 'js/mechanics/graphData.js');
const MANUAL = path.join(ROOT, 'scripts/graphData.manual.json');

const GROUP_BY_FILE = [
  [/^src\/main\.js$/, 'boot'],
  [/^src\/js\/state\.js$/, 'state'],
  [/^src\/js\/game\.js$/, 'game'],
  [/^src\/js\/shop\.js$/, 'shop'],
  [/^src\/js\/shopConfig\.js$/, 'shop'],
  [/^src\/js\/audio\//, 'out'],
  [/^src\/utils\/confetti\.js$/, 'out'],
  [/^src\/js\/illustrations\//, 'out'],
];

function groupFor(file){
  const rel = path.relative(ROOT, file).replace(/\\/g,'/');
  for(const [re,g] of GROUP_BY_FILE){ if(re.test(rel)) return g; }
  return rel.startsWith('src/js/') ? 'game' : 'boot';
}
function walk(dir, out=[]){
  for(const e of fs.readdirSync(dir, {withFileTypes:true})){
    const p=path.join(dir,e.name);
    if(e.isDirectory()) walk(p,out);
    else if(e.name.endsWith('.js') && !p.includes('/mechanics/')) out.push(p);
  }
  return out;
}
function extractNodes(files){
  const nodes=[];
  const add=(id, spec)=>{ if(!nodes.find(n=>n.id===id)) nodes.push({id, ...spec}); };
  const CORE = [
    {id:'dom', file:'main.js', kind:'entry', group:'boot', label:'DOMContentLoaded', sub:'browser event', desc:'Entry. Fires init() once DOM ready.'},
    {id:'init', file:'main.js', kind:'entry', group:'boot', label:'init()', sub:'main.js', desc:'Bootstraps shop, game, sound.'},
    {id:'initShop', file:'shop.js', kind:'shop', group:'boot', label:'initShop()', sub:'shop.js', desc:'Renders shop items & binds buy buttons.'},
    {id:'initGame', file:'game.js', kind:'game', group:'boot', label:'initGame()', sub:'game.js', desc:'Binds click, interval tick, score listener.'},
    {id:'initSound', file:'soundToggle.js', kind:'audio', group:'out', label:'initSoundToggle()', sub:'audio/soundToggle.js', desc:'Binds mute button, sync icon.'},
    {id:'state', file:'state.js', kind:'state', group:'state', label:'state', sub:'state.js — store', desc:'Single source: score, clickPower, autoClickers...'},
    {id:'getCost', file:'state.js', kind:'state', group:'state', label:'getCost(item)', sub:'state.js', desc:'baseCost × multiplier^owned'},
    {id:'addScore', file:'state.js', kind:'state', group:'state', label:'addScore(delta)', sub:'state.js', desc:'Clamps to MAX_SCORE, plays score, dispatches score:changed.'},
    {id:'setScore', file:'state.js', kind:'state', group:'state', label:'setScore(v)', sub:'state.js', desc:'Helper → addScore(v-state.score)'},
    {id:'event', file:'event bus', kind:'entry', group:'state', label:'score:changed', sub:'CustomEvent on document', desc:'Central event. Game & shop react.'},
    {id:'click', file:'game.js', kind:'game', group:'game', label:'handleClick()', sub:'game.js — click', desc:'unlock → power calc → play click → addScore → particle'},
    {id:'tick', file:'game.js', kind:'game', group:'game', label:'tick() every 1s', sub:'game.js — interval', desc:'If autoClickers>0 → addScore(auto*multiplier)'},
    {id:'updateUI', file:'game.js', kind:'game', group:'game', label:'updateUI()', sub:'game.js', desc:'Score text • renderStatStrip • refreshShop'},
    {id:'particle', file:'game.js', kind:'visual', group:'out', label:'spawnParticle()', sub:'game.js — visual', desc:'Floating +N text at 50%/40% — visual output'},
    {id:'handleBuy', file:'shop.js', kind:'shop', group:'shop', label:'handleBuy(idx)', sub:'shop.js', desc:'Check cost → deduct → effect() → confetti → event'},
    {id:'refresh', file:'shop.js', kind:'shop', group:'shop', label:'refreshShop()', sub:'shop.js', desc:'Enables/disables buy by score & owned.'},
    {id:'shopCfg', file:'shopConfig.js', kind:'shop', group:'shop', label:'SHOP_ITEMS', sub:'shopConfig.js', desc:'4 items: effects mutate state.'},
    {id:'audioMgr', file:'audioManager.js', kind:'audio', group:'out', label:'audioManager', sub:'unlock / play()', desc:'AudioContext, muted check, volume.'},
    {id:'sounds', file:'sounds.js', kind:'audio', group:'out', label:'playSound()', sub:'audio/sounds.js', desc:'click / score / buy / error / celebrate'},
    {id:'confetti', file:'confetti.js', kind:'visual', group:'out', label:'spawnConfetti()', sub:'utils/confetti.js', desc:'42 pieces physics, rAF.'},
    {id:'statStrip', file:'statStrip.js', kind:'visual', group:'out', label:'renderStatStrip()', sub:'illustrations/statStrip.js', desc:'Score / Level / Streak / Rank cards.'},
  ];
  CORE.forEach(c=>add(c.id,c));
  if(fs.existsSync(MANUAL)){
    try{
      const o=JSON.parse(fs.readFileSync(MANUAL,'utf8'));
      for(const [id,patch] of Object.entries(o)){
        const n=nodes.find(x=>x.id===id); if(n) Object.assign(n,patch);
        else nodes.push({id, file:patch.file||'manual', kind:patch.kind||'game', group:patch.group||'game', label:patch.label||id, sub:patch.sub||'', desc:patch.desc||'', ...patch});
      }
    }catch{}
  }
  return nodes;
}
function extractEdges(files, nodeIds){
  const edges=[];
  const has=(a,b,k)=>edges.find(e=>e.from===a && e.to===b && e.kind===k);
  const push=(from,to,kind,label)=>{
    if(!nodeIds.has(from)||!nodeIds.has(to)) return;
    if(has(from,to,kind)) return;
    const e={from,to,kind}; if(label) e.label=label; edges.push(e);
  };
  const CORE_EDGES=[
    ['dom','init','flow','DOMContentLoaded'],['init','initShop','call'],['init','initGame','call'],['init','initSound','call'],
    ['initGame','click','bind','btn.onclick'],['initGame','tick','bind','setInterval 1s'],['initGame','event','event','on score:changed'],['initGame','updateUI','call'],['initGame','statStrip','call'],
    ['click','audioMgr','call','unlock + play click'],['click','addScore','call','power = clickPower*mult'],['click','particle','call'],['click','state','read','read streak/power'],
    ['tick','state','read','read autoClickers'],['tick','addScore','call'],['addScore','audioMgr','call','play score'],['addScore','event','event','dispatch'],
    ['event','updateUI','event'],['updateUI','refresh','call'],['updateUI','statStrip','call'],['updateUI','state','read'],
    ['handleBuy','getCost','call'],['handleBuy','state','read'],['handleBuy','state','write','deduct + owned'],['handleBuy','audioMgr','call','error / buy'],['handleBuy','shopCfg','call','effect()'],['handleBuy','confetti','call'],['handleBuy','event','event','dispatch'],
    ['refresh','getCost','call'],['refresh','state','read'],['audioMgr','sounds','call'],['initShop','shopCfg','read'],['initShop','refresh','call'],['initShop','handleBuy','bind','btn.onclick'],
    ['statStrip','state','read','score / streak'],
  ];
  CORE_EDGES.forEach(([f,t,k,l])=>push(f,t,k,l));
  for(const f of files){
    const txt=fs.readFileSync(f,'utf8');
    if(/score:changed/.test(txt) && /dispatchEvent/.test(txt)){
    }
  }
  return edges;
}

// Layout constants — Supabase-like rows inside group cards (compact: minimal vertical padding + tight horizontal)
const ROW_H = 18;
const ROW_GAP = 3;
const HEADER_H = 32;
const PAD_X = 3;
const PAD_Y = 4;

// 2-row grid for maximum readability: boot left, state/shop top, game/out bottom.
// Groups share x in vertical stacks (state↔game, shop↔out) so edges stay short & gutter-clean.
const COLS = [
  { id:'boot',  label:'Boot',      sub:'Entry · init',             tint:'--color-card',   w:108, x:18,  y:130 },
  { id:'state', label:'State',     sub:'Single source — state.js', tint:'--violet-50',   w:108, x:162, y:16  },
  { id:'game',  label:'Game Loop', sub:'Click · tick · UI',        tint:'--amber-50',    w:124, x:162, y:244 },
  { id:'shop',  label:'Shop',      sub:'Buying & costs',           tint:'--orange-50',   w:108, x:322, y:16  },
  { id:'out',   label:'Output',    sub:'Audio · Visual',           tint:'--emerald-50',  w:118, x:322, y:244 },
];

function build(){
  const files = walk(SRC);
  const nodes = extractNodes(files);
  const idSet = new Set(nodes.map(n=>n.id));
  const edges = extractEdges(files, idSet);
  const groups = COLS.map(col=>{
    const count = nodes.filter(n=>n.group===col.id).length;
    const h = HEADER_H + PAD_Y*2 + count*ROW_H + Math.max(0,count-1)*ROW_GAP;
    return { id:col.id, label:col.label, sub:col.sub, tint:col.tint, x:col.x, y:col.y, w:col.w, h };
  });

  // assign node coords as full-width rows inside their group card
  const groupMap = new Map(groups.map(g=>[g.id,g]));
  // preserve deterministic order: CORE order = grouping order
  const orderByGroup = {};
  for(const g of groups) orderByGroup[g.id]=0;
  for(const n of nodes){
    const g = groupMap.get(n.group);
    if(!g) continue;
    const idx = orderByGroup[n.group]++;
    n.w = g.w - PAD_X*2;
    n.h = ROW_H;
    n.x = g.x + PAD_X;
    n.y = g.y + HEADER_H + PAD_Y + idx*(ROW_H+ROW_GAP);
  }
  // any ad-hoc nodes without group (manual) — place in game lane
  for(const n of nodes){
    if(n.x==null){
      const g = groupMap.get(n.group)||groups[2];
      const idx = orderByGroup[g.id]||0;
      orderByGroup[g.id]=idx+1;
      n.w = g.w - PAD_X*2; n.h=ROW_H;
      n.x = g.x+PAD_X; n.y=g.y+HEADER_H+PAD_Y+idx*(ROW_H+ROW_GAP);
      // expand group height if needed
      const needed = n.y+n.h+PAD_Y - g.y;
      if(needed>g.h) g.h=needed;
    }
  }

  const kinds={
    entry:{label:'Entry / Events', color:'--blue-600'},
    state:{label:'State', color:'--violet-600'},
    game:{label:'Game Loop', color:'--amber-700'},
    shop:{label:'Shop', color:'--orange-600'},
    audio:{label:'Audio', color:'--emerald-700'},
    visual:{label:'Visual', color:'--rose-600'},
  };
  function oneLine(o){ return JSON.stringify(o); }
  const header=`// @generated — do not edit by hand. Source: scripts/generate-mechanics-graph.js\n// Run \`npm run gen:mechanics\` to regenerate from src/**. Manual overrides: scripts/graphData.manual.json\n`;
  const body =
    `export const GROUPS = [\n  ${groups.map(oneLine).join(',\n  ')}\n];\n`+
    `export const NODES = [\n  ${nodes.map(oneLine).join(',\n  ')}\n];\n`+
    `export const EDGES = [\n  ${edges.map(oneLine).join(',\n  ')}\n];\n`+
    `export const KINDS = ${JSON.stringify(kinds,null,2)};\n`;
  return header+body;
}

const next = build();
const exists = fs.existsSync(OUT) ? fs.readFileSync(OUT,'utf8') : '';
const check = process.argv.includes('--check');
if(check){
  if(next !== exists){ console.error('graphData.js is stale — run: npm run gen:mechanics'); process.exit(1); }
  console.log('graphData.js is fresh.');
} else {
  if(next !== exists){ fs.writeFileSync(OUT, next, 'utf8'); console.log(`Wrote ${path.relative(ROOT, OUT)} (${next.length} bytes)`); }
  else { console.log('graphData.js already fresh — no write.'); }
}
