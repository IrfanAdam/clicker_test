import { EDGES, NODES } from './graph.js';
const KIND_TOKEN = { call: '--stone-500', data: '--violet-600', signal: '--amber-600' };
const ACCESS_LABEL = { read: 'reads', write: 'writes', both: 'reads + writes' };
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const byId = id => NODES.find(m => m.id === id);
function badge(e, other, dir) {
  const both = e.kind === 'data' && e.access === 'both';
  const arrow = both ? '↔' : dir === 'out' ? '→' : '←';
  const name = esc(other?.label || (dir === 'out' ? e.to : e.from));
  const access = e.kind === 'data' ? (ACCESS_LABEL[e.access] || 'reads') + (e.label ? ` — ${e.label}` : '') : (e.label || e.kind);
  const sub = esc(access);
  return `<span class="mech-rel" title="${sub} · ${e.kind}${e.access ? '/' + e.access : ''}"><i style="background:var(${KIND_TOKEN[e.kind] || '--stone-500'})"></i>${arrow}&nbsp;${name}</span>`;
}
function section(title, list, dir) {
  if (!list.length) return '';
  return `<div class="mech-rels"><span class="mech-rels-label">${title} (${list.length})</span>${list.map(e => badge(e, byId(dir === 'out' ? e.to : e.from), dir)).join('')}</div>`;
}
export function nodeTipHTML(n, kinds) {
  const kindLabel = kinds?.[n.kind]?.label || n.kind;
  return `<strong>${esc(n.label)}</strong><span style="margin-top:var(--space-2);line-height:var(--leading-normal)">${esc(n.desc)}</span>`
    + section('Out', EDGES.filter(e => e.from === n.id), 'out')
    + section('In', EDGES.filter(e => e.to === n.id), 'in')
    + `<em>${esc(n.file)} · ${esc(kindLabel)} · ${esc(n.sub)}</em>`;
}
