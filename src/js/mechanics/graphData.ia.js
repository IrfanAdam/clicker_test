// Manual IA — tree hierarchy. Same shape as graphData.js, tree layout for clear containment.
export const GROUPS = [
  {"id":"shell","label":"Shell","sub":"Frame · header/footer","tint":"--color-card","x":166,"y":16,"w":108,"h":142},
  {"id":"layout","label":"Layout","sub":"Grid · regions","tint":"--violet-50","x":166,"y":190,"w":108,"h":100},
  {"id":"game","label":"Game Display","sub":"Score · click · progress","tint":"--amber-50","x":40,"y":330,"w":124,"h":163},
  {"id":"commerce","label":"Commerce","sub":"Shop · buying","tint":"--orange-50","x":292,"y":330,"w":108,"h":121},
  {"id":"feedback","label":"Feedback","sub":"Overlays · effects","tint":"--emerald-50","x":322,"y":190,"w":118,"h":100}
];
export const NODES = [
  {"id":"app","file":"index.html","kind":"entry","group":"shell","label":"App (#app)","sub":"1200px container","desc":"Root. Holds header, game-layout, footer; stateless frame.","w":102,"h":18,"x":169,"y":52},
  {"id":"header","file":"index.html","kind":"entry","group":"shell","label":"Header","sub":".app-header","desc":"Container: title + nav + sound toggle. State: none.","w":102,"h":18,"x":169,"y":73},
  {"id":"navMech","file":"index.html","kind":"entry","group":"shell","label":"Nav · Mechanics","sub":"#mechanics-link","desc":"Link inside header. Opens mechanics overlay. State: none.","w":102,"h":18,"x":169,"y":94},
  {"id":"soundToggle","file":"index.html","kind":"entry","group":"shell","label":"Sound Toggle","sub":"#sound-toggle","desc":"Button in header. Toggles mute. Reads state via audio prefs.","w":102,"h":18,"x":169,"y":115},
  {"id":"footer","file":"index.html","kind":"entry","group":"shell","label":"Footer","sub":".app-footer","desc":"Container: copyright line. Reads year only. State: none.","w":102,"h":18,"x":169,"y":136},
  {"id":"gameLayout","file":"index.html","kind":"state","group":"layout","label":"game-layout","sub":"grid 1fr 360px","desc":"DOM grid. Contains game-area + shop-area. State: layout only.","w":102,"h":18,"x":169,"y":226},
  {"id":"gameArea","file":"index.html","kind":"state","group":"layout","label":"game-area","sub":"#action-zone","desc":"Container inside layout. Holds stats, progress, score, buttons. State: display target.","w":102,"h":18,"x":169,"y":247},
  {"id":"shopArea","file":"index.html","kind":"state","group":"layout","label":"shop-area","sub":"aside.shop-area","desc":"Container inside layout. Holds shop header + items. Reads ownedCounts for disabled state.","w":102,"h":18,"x":169,"y":268},
  {"id":"statStrip","file":"index.html","kind":"game","group":"game","label":"Stat Strip","sub":"#stat-strip ×4","desc":"DOM widget. Reads state.score / streak / clickPower. Renders 4 cards.","w":118,"h":18,"x":43,"y":366},
  {"id":"progress","file":"index.html","kind":"game","group":"game","label":"Progress","sub":".progress-wrap","desc":"DOM bar. Reads state.score / GOAL → width%. ARIA progressbar.","w":118,"h":18,"x":43,"y":387},
  {"id":"scoreArea","file":"index.html","kind":"game","group":"game","label":"Score Area","sub":"#score-area","desc":"DOM. Reads state.score · score:changed → score-value text.","w":118,"h":18,"x":43,"y":408},
  {"id":"clickBtn","file":"index.html","kind":"game","group":"game","label":"Click Button","sub":"#click-button","desc":"DOM button. Triggers handleClick → state.score + streak. Writes state.","w":118,"h":18,"x":43,"y":429},
  {"id":"replayBtn","file":"index.html","kind":"game","group":"game","label":"Replay","sub":"#replay-button","desc":"DOM button. Resets state via resetGoal → score:changed.","w":118,"h":18,"x":43,"y":450},
  {"id":"particles","file":"index.html","kind":"game","group":"game","label":"Particles","sub":"#particle-container","desc":"DOM layer. Spawned by handleClick. Visual only, no state store.","w":118,"h":18,"x":43,"y":471},
  {"id":"shopHeader","file":"index.html","kind":"shop","group":"commerce","label":"Shop Header","sub":".shop-header","desc":"DOM text: spend points copy. Stateless.","w":102,"h":18,"x":295,"y":366},
  {"id":"shopItems","file":"index.html","kind":"shop","group":"commerce","label":"Shop Items","sub":"#shop-items","desc":"DOM list. Reads state.score + ownedCounts. Contains 4 item cards.","w":102,"h":18,"x":295,"y":387},
  {"id":"shopCard","file":"index.html","kind":"shop","group":"commerce","label":"Shop Card","sub":".shop-item ×4","desc":"DOM row: icon+name+buy. Reads cost via getCost(); buy writes state.","w":102,"h":18,"x":295,"y":408},
  {"id":"buyBtn","file":"index.html","kind":"shop","group":"commerce","label":"Buy Button","sub":".buy-button","desc":"DOM button inside card. Deducts cost → effect() → dispatch.","w":102,"h":18,"x":295,"y":429},
  {"id":"backdrop","file":"index.html","kind":"visual","group":"feedback","label":"Backdrop","sub":"#shop-backdrop","desc":"Overlay behind shop (mobile). Toggles hidden. No state.","w":112,"h":18,"x":325,"y":226},
  {"id":"celebration","file":"index.html","kind":"visual","group":"feedback","label":"Celebration","sub":".celebration-overlay","desc":"Overlay. Shown on goal:reached (state.completed). Confetti + haptics.","w":112,"h":18,"x":325,"y":247},
  {"id":"mechanicsView","file":"index.html","kind":"visual","group":"feedback","label":"Mechanics View","sub":"#mechanics-view","desc":"Overlay. Canvas + legends. Reads localStorage mechanics:mode.","w":112,"h":18,"x":325,"y":268}
];
export const EDGES = [
  {"from":"app","to":"header","kind":"call","label":"contains"},
  {"from":"app","to":"gameLayout","kind":"call","label":"contains"},
  {"from":"app","to":"footer","kind":"call","label":"contains"},
  {"from":"app","to":"backdrop","kind":"call","label":"contains"},
  {"from":"app","to":"celebration","kind":"call","label":"contains"},
  {"from":"app","to":"mechanicsView","kind":"call","label":"contains"},
  {"from":"header","to":"navMech","kind":"call","label":"contains"},
  {"from":"header","to":"soundToggle","kind":"call","label":"contains"},
  {"from":"gameLayout","to":"gameArea","kind":"call","label":"contains"},
  {"from":"gameLayout","to":"shopArea","kind":"call","label":"contains"},
  {"from":"gameArea","to":"statStrip","kind":"call","label":"contains"},
  {"from":"gameArea","to":"progress","kind":"call","label":"contains"},
  {"from":"gameArea","to":"scoreArea","kind":"call","label":"contains"},
  {"from":"gameArea","to":"clickBtn","kind":"call","label":"contains"},
  {"from":"gameArea","to":"replayBtn","kind":"call","label":"contains"},
  {"from":"gameArea","to":"particles","kind":"call","label":"contains"},
  {"from":"shopArea","to":"shopHeader","kind":"call","label":"contains"},
  {"from":"shopArea","to":"shopItems","kind":"call","label":"contains"},
  {"from":"shopItems","to":"shopCard","kind":"call","label":"contains"},
  {"from":"shopCard","to":"buyBtn","kind":"call","label":"contains"}
];
export const KINDS = {
  "entry": {"label": "Shell / Frame","color": "--blue-600"},
  "state": {"label": "Layout","color": "--violet-600"},
  "game": {"label": "Game Display","color": "--amber-700"},
  "shop": {"label": "Commerce","color": "--orange-600"},
  "audio": {"label": "System","color": "--emerald-700"},
  "visual": {"label": "Feedback","color": "--rose-600"}
};
