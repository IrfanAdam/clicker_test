# Mechanics directionality — audit & plan

## 1. Audit: where direction lies today

6 kinds, 6 heads. Arrow = "dependency", except when it isn't.

| Edge | Drawn as | Actual flow | Problem |
|---|---|---|---|
| `call` (12x) e.g. `click -> addScore` | `->` caller to callee | control `->`, return value `<-` (hidden) | can't tell fire-and-forget vs uses-return. `handleBuy -> getCost` returns a cost but looks one-way |
| `read` (7x) e.g. `click -> state` | `->` caller to store | data flows `<-` store to caller | arrow points **opposite** to data. Worst offender |
| `write` (1x) `handleBuy -> state` | `->` caller to store | data flows `->` | correct — but sits as a **2nd parallel edge** next to `handleBuy -> state (read)`. Two lines, same endpoints, router/hit-test do double work |
| `event` subscribe `initGame -> event` vs dispatch `addScore -> event`, `event -> updateUI` | mixed `->` / `<-` around the bus | subscribe is `bus -> me`, dispatch is `me -> bus` | same kind points both ways depending on row. Unreadable |
| `bind` (3x) e.g. `initShop -> handleBuy` | `->` binder to handler | setup goes `->`, runtime invocation goes `<-` | setup vs invocation conflated |
| `flow` (1x) `dom -> init` | `->` | `->` | fine, but doesn't justify its own kind/head |

Bonus finds: `click -> state` is really read**+write** (`state.streak++` unmodelled);
`refresh -> getCost`, `handleBuy -> getCost` are round-trips drawn one-way.

## 2. Proposed system: 3 kinds + head-count = sidedness

One rule: **arrow stays dependency-direction (`from -> to`), head-count says
one-side or both.** No arrow-flipping, minimal logic churn.

- `call` — control. Folds old `call` + `bind` + `flow`. Stone solid, `▶` head.
  Label carries the nuance (`btn.onclick`, `setInterval 1s`, `DOMContentLoaded`).
  One-way by default.
- `data` — state/config access. Merges old `read` + `write` + calls-that-return
  (`getCost`). Violet solid. **Single edge per pair** with
  `access: 'read' | 'write' | 'both'`. `both` draws a head on **each end**
  (`◀ ▶`), label reads `reads + writes`.
- `signal` — async pub/sub. Replaces old `event`. Amber dashed, `◆` head.
  Convention: producers `-> bus`, bus `-> consumers`; subscriptions are **not**
  edges (they're what `bus -> consumer` already means). Deletes the backwards
  `initGame -> event` row.

Result: 6 kinds/heads -> 3. Parallel duplicate (`handleBuy -> state` x2) -> 1
bidirectional edge. Router, hit-test, popover all handle fewer, unique pairs.

## 3. Old -> new mapping

| Old | New |
|---|---|
| `call`, `bind`, `flow` | `call`, label preserved |
| `read` alone (`tick -> state`, `statStrip -> state`) | `data` / `access:'read'`, single head (option A: head stays at `to`) |
| `read` + `write` same pair (`handleBuy <-> state`, `click <-> state`) | one `data` / `access:'both'`, heads both ends |
| `getCost` calls | `data` / `access:'both'` (call + return) |
| `event` dispatch / deliver | `signal`, one-way |
| `event` subscribe (`initGame -> event`) | **delete** — covered by `event -> updateUI` |

Decision: **option A** (keep heads at `to` always, `both` = head each end).
Zero edge flips. Option B (flip `read` arrows to point at the receiver) is
semantically purer but touches 7 edges + popover In/Out + retraining — rejected
for churn.

## 4. Overlap analysis

- After the merge, **max one edge per node pair** — audit confirms no pair needs
  two kinds (the only duplicate pair is `handleBuy <-> state`, merged to one).
  Router keys on the unordered pair, so parallel-path overlap is impossible.
- The `both` edge is **one path, two heads** (tip head + tail head), not two
  lines — nothing overlaps, hit-test runs once.
- Possible confusion: which head means what. Convention: tip head = invocation /
  dependency direction, tail head = data/return coming back. Popover + label
  (`reads + writes`, `↔`) disambiguate on hover/click.
- Head shapes stay distinct per kind (`▶` call, chevron data, `◆` signal), so a
  bidirectional `data` edge can't be mistaken for two one-way `call` edges.

## 5. Migration (small)

1. `scripts/generate-mechanics-graph.js` + `graphData.js`: fold kinds, merge
   `handleBuy -> state` pair, add `access`, fix `click -> state` to `both`,
   convert `getCost` edges to `data`/`both`, drop `initGame -> event`.
2. `render.js`: `EDGE_STYLES` 6 -> 3, `drawHead` 6 -> 3 + tail-head for `both`;
   delete per-kind head fns.
3. `popover.js`: badges show `->` / `<->` + `reads / writes / reads + writes`;
   In/Out derived from direction, not kind.
4. `route.js`: cache key + dedupe on unordered pair (one route per pair now);
   legend in HTML/CSS updated.
