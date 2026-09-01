# Mechanism Diagram — Incremental Update Task List

> Goal: de-bug and polish the **current canvas mechanics view** in small, shippable slices. No full ghost-UI rewrite — keep `graphData.js` generated, keep `canvas.js` drag/pan/zoom, iterate `render.js` + `route.js` + `mechanics.css`.

**How to use:** Work top → down. Each task is ≤1 file, ≤~40 lines changed, independently reviewable + revertable. Check off when `npm run build` + manual hover/drag test passes.

---

## 1) Fix lane chrome — light ghost idle (low risk, high visual win)

- **File:** `src/js/mechanics/render.js` → `drawGroups()`
- **Change:** idle lanes: thin `rgba(0,0,0,.06)` stroke, no shadow/tint; hover: solid `stone-200` + `amber-50` wash (already half-done — just reduce idle alpha `.42→.28` and remove idle shadow).
- **Accept:** lanes read as containers only on hover; grid behind still visible.

## 2) Fix halo/line mismatch (bug)

- **Files:** `src/js/mechanics/render.js` `drawEdges()` + `route.js`
- **Change:** ensure halo path == line path (halo `lineWidth = lw + 3.6/scale`, solid white, `globalAlpha .92`). Consolidate `getRoute()` to return single `path` used for both.
- **Accept:** no white fringe offset when panning at 1.5x zoom; screenshot `e2`/`e4` at 100%/150% looks clean.

## 3) Consolidate bus routing — one bottom highway

- **File:** `src/js/mechanics/route.js` → `buildBottomDetour()`
- **Change:** `maxBottom + 16 + bottomOff` already exists — lock `bottomOff` steps to `[0,8,16,24,32]` (5 lanes), cost penalty for group-crossing ×2. Remove ad-hoc diagonals.
- **Accept:** non-adjacent edges (e.g. `click→addScore`, `handleBuy→confetti`) share same y, zero crossings through lanes.

## 4) Mono lines — kind via dot + head, not rainbow

- **File:** `src/js/mechanics/render.js` → `EDGE_STYLES`
- **Change:** keep `dotColor = kindColor(srcKind)` but set **line** `stroke` to `stone-500` idle / `stone-700` hover / `stone-900` selected. Head `fill` follows line color. Keep `dash` for `event`/`bind` only.
- **Accept:** legend still shows kind colors (dots), but canvas lines are quiet mono; eye follows one thick story.

## 5) Labels on hover/selected only

- **File:** `src/js/mechanics/render.js` → `drawEdges()` label block
- **Change:** already gated `sel||hov` — tighten to `dist*scale>34` + dim non-incident edges to `.20` when selected. Pill bg `stone-50` + border.
- **Accept:** idle canvas has zero label pills; hover `click` shows 1–2 pills centered, no overlap at 1x.

## 6) Node hover polish — minimal fill

- **File:** `src/js/mechanics/render.js` → `drawNodes()`
- **Change:** idle: `fill --color-card`, `stroke --color-border` 1px, hollow dot; hover/active: `fill --amber-50`, `stroke --stone-900` 1.7px, filled violet dot. Keep left 3px kind strip.
- **Accept:** nodes feel ghost until hover; `fitText` still truncates correctly; tooltip not clipped.

## 7) Canvas interaction affordances

- **File:** `src/js/mechanics/canvas.js` + `src/styles/mechanics.css`
- **Change:** `canvas.style.cursor` → `grab`/`pointer`; add `:focus-visible` ring on header drag handle; `hint` text responsive (hide on <640px already ✓); debounce `draw()` via rAF already ✓.
- **Accept:** keyboard Tab reaches lane groups, Escape closes view, double-click header resets lane.

## 8) Verify + snapshot

- **Command:** `npm run gen:mechanics && npm run verify:mechanics && npm run build`
- **Manual:** Open Mechanics → hover Boot/State → drag State group → pan/zoom 0.35–1.8x → check halo, bus, labels, tooltip edge cases (right/bottom overflow).
- **Accept:** `graphData.js` fresh, no console errors, FPS >50 on drag.

---

### Out of scope (deferred)

- Full SVG ghost spec (mechanics-new-plan.html) — keep as reference, not implementation
- Minimap, search-to-dim, PNG export — stretch after 1–8 ships
- 100-lines/file refactor — do only if task touches file anyway

### Definition of Done per task

- [ ] ≤40 lines changed, `npm run build` green
- [ ] Manual check at 1x + 1.5x zoom, light + dark?
- [ ] No new `#hex` outside `tokens.css` (use `token('--stone-700')`)
- [ ] Screenshot before/after in PR description
