// @generated — do not edit by hand. Source: scripts/generate-mechanics-graph.js
// Run `npm run gen:mechanics` to regenerate from src/**. Manual overrides: scripts/graphData.manual.json
export const GROUPS = [
  {"id":"boot","label":"Boot","sub":"Entry · init","tint":"--color-card","x":18,"y":130,"w":108,"h":121},
  {"id":"state","label":"State","sub":"Single source — state.js","tint":"--violet-50","x":162,"y":16,"w":108,"h":142},
  {"id":"game","label":"Game Loop","sub":"Click · tick · UI","tint":"--amber-50","x":162,"y":244,"w":124,"h":100},
  {"id":"shop","label":"Shop","sub":"Buying & costs","tint":"--orange-50","x":322,"y":16,"w":108,"h":100},
  {"id":"out","label":"Output","sub":"Audio · Visual","tint":"--emerald-50","x":322,"y":244,"w":118,"h":163}
];
export const NODES = [
  {"id":"dom","file":"main.js","kind":"entry","group":"boot","label":"DOMContentLoaded","sub":"browser event","desc":"Entry. Fires init() once DOM ready.","w":102,"h":18,"x":21,"y":166},
  {"id":"init","file":"main.js","kind":"entry","group":"boot","label":"init()","sub":"main.js","desc":"Bootstraps shop, game, sound.","w":102,"h":18,"x":21,"y":187},
  {"id":"initShop","file":"shop.js","kind":"shop","group":"boot","label":"initShop()","sub":"shop.js","desc":"Renders shop items & binds buy buttons.","w":102,"h":18,"x":21,"y":208},
  {"id":"initGame","file":"game.js","kind":"game","group":"boot","label":"initGame()","sub":"game.js","desc":"Binds click, interval tick, score listener.","w":102,"h":18,"x":21,"y":229},
  {"id":"initSound","file":"soundToggle.js","kind":"audio","group":"out","label":"initSoundToggle()","sub":"audio/soundToggle.js","desc":"Binds mute button, sync icon.","w":112,"h":18,"x":325,"y":280},
  {"id":"state","file":"state.js","kind":"state","group":"state","label":"state","sub":"state.js — store","desc":"Single source: score, clickPower, autoClickers...","w":102,"h":18,"x":165,"y":52},
  {"id":"getCost","file":"state.js","kind":"state","group":"state","label":"getCost(item)","sub":"state.js","desc":"baseCost × multiplier^owned","w":102,"h":18,"x":165,"y":73},
  {"id":"addScore","file":"state.js","kind":"state","group":"state","label":"addScore(delta)","sub":"state.js","desc":"Clamps to MAX_SCORE, plays score, dispatches score:changed.","w":102,"h":18,"x":165,"y":94},
  {"id":"setScore","file":"state.js","kind":"state","group":"state","label":"setScore(v)","sub":"state.js","desc":"Helper → addScore(v-state.score)","w":102,"h":18,"x":165,"y":115},
  {"id":"event","file":"event bus","kind":"entry","group":"state","label":"score:changed","sub":"CustomEvent on document","desc":"Central event. Game & shop react.","w":102,"h":18,"x":165,"y":136},
  {"id":"click","file":"game.js","kind":"game","group":"game","label":"handleClick()","sub":"game.js — click","desc":"unlock → power calc → play click → addScore → particle","w":118,"h":18,"x":165,"y":280},
  {"id":"tick","file":"game.js","kind":"game","group":"game","label":"tick() every 1s","sub":"game.js — interval","desc":"If autoClickers>0 → addScore(auto*multiplier)","w":118,"h":18,"x":165,"y":301},
  {"id":"updateUI","file":"game.js","kind":"game","group":"game","label":"updateUI()","sub":"game.js","desc":"Score text • renderStatStrip • refreshShop","w":118,"h":18,"x":165,"y":322},
  {"id":"particle","file":"game.js","kind":"visual","group":"out","label":"spawnParticle()","sub":"game.js — visual","desc":"Floating +N text at 50%/40% — visual output","w":112,"h":18,"x":325,"y":301},
  {"id":"handleBuy","file":"shop.js","kind":"shop","group":"shop","label":"handleBuy(idx)","sub":"shop.js","desc":"Check cost → deduct → effect() → confetti → event","w":102,"h":18,"x":325,"y":52},
  {"id":"refresh","file":"shop.js","kind":"shop","group":"shop","label":"refreshShop()","sub":"shop.js","desc":"Enables/disables buy by score & owned.","w":102,"h":18,"x":325,"y":73},
  {"id":"shopCfg","file":"shopConfig.js","kind":"shop","group":"shop","label":"SHOP_ITEMS","sub":"shopConfig.js","desc":"4 items: effects mutate state.","w":102,"h":18,"x":325,"y":94},
  {"id":"audioMgr","file":"audioManager.js","kind":"audio","group":"out","label":"audioManager","sub":"unlock / play()","desc":"AudioContext, muted check, volume.","w":112,"h":18,"x":325,"y":322},
  {"id":"sounds","file":"sounds.js","kind":"audio","group":"out","label":"playSound()","sub":"audio/sounds.js","desc":"click / score / buy / error / celebrate","w":112,"h":18,"x":325,"y":343},
  {"id":"confetti","file":"confetti.js","kind":"visual","group":"out","label":"spawnConfetti()","sub":"utils/confetti.js","desc":"42 pieces physics, rAF.","w":112,"h":18,"x":325,"y":364},
  {"id":"statStrip","file":"statStrip.js","kind":"visual","group":"out","label":"renderStatStrip()","sub":"illustrations/statStrip.js","desc":"Score / Level / Streak / Rank cards.","w":112,"h":18,"x":325,"y":385}
];
export const EDGES = [
  {"from":"dom","to":"init","kind":"call","label":"DOMContentLoaded"},
  {"from":"init","to":"initShop","kind":"call"},
  {"from":"init","to":"initGame","kind":"call"},
  {"from":"init","to":"initSound","kind":"call"},
  {"from":"initGame","to":"click","kind":"call","label":"btn.onclick"},
  {"from":"initGame","to":"tick","kind":"call","label":"setInterval 1s"},
  {"from":"initGame","to":"updateUI","kind":"call"},
  {"from":"initGame","to":"statStrip","kind":"call"},
  {"from":"click","to":"audioMgr","kind":"call","label":"unlock + play click"},
  {"from":"click","to":"addScore","kind":"call","label":"power = clickPower*mult"},
  {"from":"click","to":"particle","kind":"call"},
  {"from":"click","to":"state","kind":"data","label":"reads + writes streak/power","access":"both"},
  {"from":"tick","to":"state","kind":"data","label":"read autoClickers","access":"read"},
  {"from":"tick","to":"addScore","kind":"call"},
  {"from":"addScore","to":"audioMgr","kind":"call","label":"play score"},
  {"from":"addScore","to":"event","kind":"signal","label":"dispatch"},
  {"from":"event","to":"updateUI","kind":"signal"},
  {"from":"updateUI","to":"refresh","kind":"call"},
  {"from":"updateUI","to":"statStrip","kind":"call"},
  {"from":"updateUI","to":"state","kind":"data","access":"read"},
  {"from":"handleBuy","to":"getCost","kind":"data","access":"both"},
  {"from":"handleBuy","to":"state","kind":"data","label":"reads + writes: deduct + owned","access":"both"},
  {"from":"handleBuy","to":"audioMgr","kind":"call","label":"error / buy"},
  {"from":"handleBuy","to":"shopCfg","kind":"call","label":"effect()"},
  {"from":"handleBuy","to":"confetti","kind":"call"},
  {"from":"handleBuy","to":"event","kind":"signal","label":"dispatch"},
  {"from":"refresh","to":"getCost","kind":"data","access":"both"},
  {"from":"refresh","to":"state","kind":"data","access":"read"},
  {"from":"audioMgr","to":"sounds","kind":"call"},
  {"from":"initShop","to":"shopCfg","kind":"data","access":"read"},
  {"from":"initShop","to":"refresh","kind":"call"},
  {"from":"initShop","to":"handleBuy","kind":"call","label":"btn.onclick"},
  {"from":"statStrip","to":"state","kind":"data","label":"score / streak","access":"read"}
];
export const KINDS = {
  "entry": {
    "label": "Entry / Events",
    "color": "--blue-600"
  },
  "state": {
    "label": "State",
    "color": "--violet-600"
  },
  "game": {
    "label": "Game Loop",
    "color": "--amber-700"
  },
  "shop": {
    "label": "Shop",
    "color": "--orange-600"
  },
  "audio": {
    "label": "Audio",
    "color": "--emerald-700"
  },
  "visual": {
    "label": "Visual",
    "color": "--rose-600"
  }
};
