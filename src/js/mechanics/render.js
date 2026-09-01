import { NODES, EDGES, KINDS, GROUPS } from './graphData.js';
import { fitText } from './text.js';
import { getRoute } from './route.js';
export function token(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim()||getComputedStyle(document.documentElement).getPropertyValue('--stone-900').trim(); }
export function kindColor(k){ return token(KINDS[k]?.color || '--stone-500'); }
export function drawRound(c,x,y,w,h,r){ c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath(); }

// Supabase-style: groups are elevated table cards, nodes are list rows inside
const EDGE_STYLES={ call:{color:'--stone-500',dash:[],w:1.25,head:'tri'}, read:{color:'--violet-600',dash:[],w:1.2,head:'chevron'}, write:{color:'--orange-600',dash:[],w:1.7,head:'triTick'}, event:{color:'--amber-600',dash:[7,5],w:1.25,head:'diamond'}, bind:{color:'--blue-600',dash:[2.5,5],w:1.25,head:'circleTri'}, flow:{color:'--blue-600',dash:[],w:1.6,head:'double'} };
function drawHead(ctx,head,s,scale,color){ ctx.fillStyle=color; ctx.strokeStyle=color; if(head==='tri'){ ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-9/s,-4/s);ctx.lineTo(-9/s,4/s);ctx.closePath();ctx.fill(); } else if(head==='chevron'){ ctx.lineWidth=1.7/s; ctx.beginPath();ctx.moveTo(-7/s,-4.5/s);ctx.lineTo(0,0);ctx.lineTo(-7/s,4.5/s);ctx.stroke(); } else if(head==='triTick'){ ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-9/s,-4/s);ctx.lineTo(-9/s,4/s);ctx.closePath();ctx.fill(); ctx.lineWidth=1.2/s; ctx.beginPath();ctx.moveTo(-4.5/s,-3.2/s);ctx.lineTo(-4.5/s,3.2/s);ctx.stroke(); } else if(head==='diamond'){ ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-5/s,-4/s);ctx.lineTo(-10/s,0);ctx.lineTo(-5/s,4/s);ctx.closePath();ctx.fill(); } else if(head==='circleTri'){ ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-9/s,-4/s);ctx.lineTo(-9/s,4/s);ctx.closePath();ctx.fill(); ctx.beginPath();ctx.arc(-6/s,0,2.6/s,0,Math.PI*2);ctx.fillStyle=token('--color-card');ctx.fill(); ctx.strokeStyle=color;ctx.lineWidth=1.2/s;ctx.stroke(); } else if(head==='double'){ ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-7/s,-3.5/s);ctx.lineTo(-7/s,3.5/s);ctx.closePath();ctx.fill(); ctx.beginPath();ctx.moveTo(-7/s,0);ctx.lineTo(-14/s,-3.5/s);ctx.lineTo(-14/s,3.5/s);ctx.closePath();ctx.fill(); } }

export function drawGroups(ctx,scale,hoverGroup,selected){
  const inc=new Set(); if(selected){ EDGES.forEach(e=>{ if(e.from===selected.id||e.to===selected.id){ inc.add(e.from); inc.add(e.to); }}); const sg=NODES.find(n=>n.id===selected.id)?.group; if(sg) inc.add(sg); }
  GROUPS.forEach(g=>{
    const dim=selected && !inc.has(g.id) && !NODES.some(n=>n.group===g.id && inc.has(n.id));
    const hg=hoverGroup===g;
    ctx.save();
    if(dim) ctx.globalAlpha=.48;
    // Lane card: ghost idle — no shadow, faint dashed stroke; hover reveals solid + tint (Task 1)
    ctx.shadowColor=hg?'rgba(28,25,23,.09)':'transparent'; ctx.shadowBlur=hg?14:0; ctx.shadowOffsetY=hg?2:0;
    drawRound(ctx,g.x,g.y,g.w,g.h,12); ctx.fillStyle=token('--color-card'); ctx.fill();
    ctx.shadowColor='transparent';
    // hover-only border + tint — idle: faint 6% dashed (ghost), hover: solid + wash
    if(hg){
      ctx.strokeStyle=token('--stone-300'); ctx.lineWidth=1.25/scale; ctx.setLineDash([]); ctx.stroke();
      ctx.fillStyle=token('--amber-50'); ctx.globalAlpha=.34; drawRound(ctx,g.x,g.y,g.w,g.h,12); ctx.fill(); ctx.globalAlpha=dim?.48:1;
    } else {
      ctx.strokeStyle='rgba(28,25,23,.07)'; ctx.lineWidth=1/scale; ctx.setLineDash([6/scale,6/scale]); ctx.stroke(); ctx.setLineDash([]);
    }
    // header band — 32h hug, subtler idle tint for ghost feel
    const tintCol=token(g.tint);
    ctx.globalAlpha=dim?.52:1;
    ctx.fillStyle=tintCol; ctx.globalAlpha=hg? .52 : dim? .22 : .28;
    drawRound(ctx,g.x,g.y,g.w,32,12); ctx.fill();
    // cut bottom of header round
    ctx.beginPath(); ctx.rect(g.x,g.y+20,g.w,12); ctx.fill();
    ctx.globalAlpha=1;
    // header bottom border — only visible on hover
    ctx.strokeStyle=hg?token('--stone-200'): 'rgba(0,0,0,0)'; ctx.lineWidth=1/scale; ctx.beginPath(); ctx.moveTo(g.x,g.y+32); ctx.lineTo(g.x+g.w,g.y+32); ctx.stroke();
    // header text
    ctx.fillStyle=hg?token('--stone-900'):token('--stone-800'); ctx.font=`700 ${11/scale}px Poppins, sans-serif`; ctx.fillText(g.label,g.x+11,g.y+16);
    ctx.fillStyle=token('--stone-500'); ctx.font=`500 ${8.5/scale}px Inter, sans-serif`; ctx.fillText(g.sub,g.x+11,g.y+26);
    // subtle inner row guides (light horizontal lines behind rows) — hint of Supabase column separators
    ctx.strokeStyle=token('--stone-100'); ctx.lineWidth=1/scale; ctx.globalAlpha=.9;
    // indicate row slots? optional light separators between rows? we draw them as part of nodes instead
    ctx.restore();
  });
}
export function drawGrid(ctx,ox,oy,scale,W,H){ ctx.strokeStyle=token('--stone-200'); ctx.globalAlpha=.30; ctx.lineWidth=1/scale; const s=40,minX=-ox/scale,minY=-oy/scale; ctx.beginPath();
  for(let x=Math.floor(minX/s)*s;x<minX+W/scale;x+=s){ ctx.moveTo(x,minY);ctx.lineTo(x,minY+H/scale); }
  for(let y=Math.floor(minY/s)*s;y<minY+H/scale;y+=s){ ctx.moveTo(minX,y);ctx.lineTo(minX+W/scale,y); } ctx.stroke(); ctx.globalAlpha=1; }

function clamp(v,lo,hi){ return Math.max(lo,Math.min(hi,v)); }

// Intelligent port: chooses left/right edge based on flow direction (target side), falls back to right for stacked columns
function anchor(from,to){
  const fx=from.x+from.w/2,fy=from.y+from.h/2,tx=to.x+to.w/2,ty=to.y+to.h/2,dx=tx-fx;
  if(Math.abs(dx) > 2){
    if(dx>0) return {x:from.x+from.w,y:clamp(fy,from.y+4,from.y+from.h-4),nx:1,ny:0};
    return {x:from.x,y:clamp(fy,from.y+4,from.y+from.h-4),nx:-1,ny:0};
  }
  // stacked / same-x: use right edge outward (outer loop) — intelligent default
  if(fy<ty) return {x:from.x+from.w,y:clamp(fy,from.y+4,from.y+from.h-4),nx:1,ny:0};
  return {x:from.x+from.w,y:clamp(fy,from.y+4,from.y+from.h-4),nx:1,ny:0}; }

export function drawEdges(ctx,scale,hover,selected){
  // Sort: longer / bottom-detour first so shorter/halo on top
  const sorted=[...EDGES].sort((a,b)=>{
    const na=NODES.find(n=>n.id===a.from), nb=NODES.find(n=>n.id===a.to);
    const ca=NODES.find(n=>n.id===b.from), cb=NODES.find(n=>n.id===b.to);
    if(!na||!nb||!ca||!cb) return 0;
    const da=Math.hypot((nb.x-nb.w)-(na.x+na.w),(nb.y-na.y));
    const db=Math.hypot((cb.x-cb.w)-(ca.x+ca.w),(cb.y-ca.y));
    return db-da;
  });
  sorted.forEach(e=>{
    const a=NODES.find(n=>n.id===e.from),b=NODES.find(n=>n.id===e.to); if(!a||!b) return;
    const sel=selected&&(e.from===selected.id||e.to===selected.id), hov=hover&&(e.from===hover.id||e.to===hover.id);
    const A=anchor(a,b),B=anchor(b,a);
    const st=EDGE_STYLES[e.kind]||EDGE_STYLES.call;
    const r=getRoute(a,b,A.x,A.y,B.x,B.y,A,B), path=r.path;
    const ang=r.ang;
    // discernability: fade non-incident edges when selection active
    const isDim=selected && !sel;
    const alpha = isDim ? .20 : sel ? 1 : hov ? .95 : .72;
    const lw = sel ? 2.1/scale : hov ? 1.65/scale : st.w/scale;
    const haloW = lw + 3.6/scale;
    const rad=8/scale;
    // halo — EXACT same path as line (white outline for separation)
    ctx.save(); ctx.globalAlpha=isDim? .18 : .95; ctx.strokeStyle=token('--color-card'); ctx.lineWidth=haloW; ctx.lineJoin='round'; ctx.lineCap='round'; ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(path[0].x,path[0].y);
    for(let i=1;i<path.length-1;i++) ctx.arcTo(path[i].x,path[i].y,path[i+1].x,path[i+1].y,rad);
    ctx.lineTo(r.bx,r.by); ctx.stroke(); ctx.restore();
    // main line — same geometry as halo, no fringe
    ctx.save(); ctx.globalAlpha=alpha; ctx.beginPath(); ctx.moveTo(path[0].x,path[0].y);
    for(let i=1;i<path.length-1;i++) ctx.arcTo(path[i].x,path[i].y,path[i+1].x,path[i+1].y,rad);
    ctx.lineTo(r.bx,r.by);
    if(sel) ctx.strokeStyle=token('--stone-900'); else if(hov) ctx.strokeStyle=token('--stone-700'); else ctx.strokeStyle=token(st.color);
    ctx.lineWidth=lw; ctx.lineJoin='round'; ctx.lineCap='round'; ctx.setLineDash(st.dash.length?st.dash.map(v=>v/scale):[]); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    // arrow head
    ctx.save(); ctx.globalAlpha=isDim? .25 : 1; ctx.translate(r.bx,r.by); ctx.rotate(ang); drawHead(ctx,st.head,scale, sel?token('--stone-900'): hov?token('--stone-700'):token(st.color)); ctx.restore();
    // Supabase port dot at source — small circle with white border for discernability
    const srcKind=NODES.find(n=>n.id===e.from)?.kind; const dotCol=kindColor(srcKind||'game');
    ctx.save(); ctx.globalAlpha=isDim? .24 : sel||hov ? 1 : .88;
    ctx.beginPath(); ctx.arc(path[0].x,path[0].y,3.8/scale,0,Math.PI*2); ctx.fillStyle=sel?token('--stone-900'):hov?token('--stone-700'):dotCol; ctx.fill(); ctx.strokeStyle=token('--color-card'); ctx.lineWidth=1.7/scale; ctx.stroke();
    // inner white dot for kind distinction
    if(!sel){ ctx.beginPath(); ctx.arc(path[0].x,path[0].y,1.35/scale,0,Math.PI*2); ctx.fillStyle=token('--color-card'); ctx.globalAlpha=.96; ctx.fill(); }
    ctx.restore();
    // label — Supabase: show only on hover/selected to keep lines clean
    const dist=Math.hypot(r.bx-path[0].x,r.by-path[0].y);
    const showLabel=e.label && (sel||hov) && dist*scale>34;
    if(showLabel){
      const mid=path[Math.floor(path.length/2)], prev=path[Math.floor(path.length/2)-1]||mid; const lx=(mid.x+prev.x)/2+4/scale, ly=(mid.y+prev.y)/2-5/scale; ctx.font=`${9.5/scale}px Inter, sans-serif`;
      const isEvent=e.kind==='event', isBind=e.kind==='bind', bg=isEvent?'--amber-50':isBind?'--blue-50':'--stone-50';
      const tw=ctx.measureText(e.label).width,th=12/scale; ctx.fillStyle=token(bg); if(!token(bg)) ctx.fillStyle=token('--color-card'); ctx.globalAlpha=.98;
      drawRound(ctx,lx-5/scale,ly-th+2/scale,tw+10/scale,th+4/scale,5/scale); ctx.fill(); ctx.globalAlpha=1;
      ctx.strokeStyle=token('--color-border'); ctx.lineWidth=1/scale; ctx.stroke();
      ctx.fillStyle=token('--stone-700'); ctx.fillText(e.label,lx,ly);
    }
  });
}
export function drawNodes(ctx,scale,hover,selected){
  const inc=new Set(); if(selected){ EDGES.forEach(e=>{ if(e.from===selected.id||e.to===selected.id){ inc.add(e.from); inc.add(e.to);} }); }
  NODES.forEach(n=>{
    const act=n===hover||n===selected;
    const isInc=selected && inc.has(n.id);
    const dim=selected && !act && !isInc;
    ctx.save();
    if(dim) ctx.globalAlpha=.52;
    const kc=kindColor(n.kind);
    const showContainer = act;
    // container only visible on hover/selected — idle is ghost (no card) — compact padding
    if(showContainer){
      ctx.shadowColor='rgba(28,25,23,.14)'; ctx.shadowBlur=10; ctx.shadowOffsetY=2;
      drawRound(ctx,n.x,n.y,n.w,n.h,6); ctx.fillStyle=token('--amber-50'); ctx.globalAlpha=dim? .72:1; ctx.fill();
      ctx.shadowColor='transparent';
      ctx.globalAlpha=dim? .55:1;
      ctx.strokeStyle=token('--stone-900'); ctx.lineWidth=1.7/scale; ctx.stroke();
      // left accent strip — only when container visible
      ctx.save(); ctx.globalAlpha=dim? .45:1;
      drawRound(ctx,n.x,n.y,n.w,n.h,6); ctx.clip();
      ctx.fillStyle=kc; ctx.fillRect(n.x,n.y,2.5,n.h);
      ctx.restore();
    } else {
      ctx.shadowColor='transparent';
    }
    // kind dot — always visible (tight)
    ctx.beginPath(); ctx.arc(n.x+7,n.y+n.h/2,2.8,0,Math.PI*2); ctx.fillStyle=kc; ctx.fill(); ctx.strokeStyle=token('--color-card'); ctx.lineWidth=1.2; ctx.stroke();
    // label — left aligned with dot offset (compact horizontal padding)
    const leftPad=12;
    const contentW=n.w-leftPad-4;
    // use 7.2 world size for Supabase compact rows
    const labelFit=fitText(ctx,n.label,contentW,7.2,scale,'Inter, sans-serif','600');
    ctx.font=labelFit.font; ctx.fillStyle=dim? token('--stone-500'): token('--stone-900'); ctx.textAlign='left'; ctx.textBaseline='middle';
    ctx.fillText(labelFit.text,n.x+leftPad,n.y+n.h/2+0.3);
    // file/sub hint on right if space — Supabase shows type on right in muted
    // only show sub/file Badge when width allows and not cramped; truncate
    if(n.w>88 && contentW>40){
      const subText=n.sub.split('·')[0].trim()||n.sub;
      // measure remaining
      ctx.font=`500 ${7/scale}px Inter, sans-serif`; ctx.fillStyle=token('--stone-500'); ctx.textAlign='right';
      const tw=ctx.measureText(labelFit.text).width/scale;
      const avail=contentW - tw - 4;
      if(avail>22){
        let t=subText; const maxW=avail;
        // truncate
        while(t.length>4 && ctx.measureText(t).width/scale > maxW) t=t.slice(0,-2)+'…';
        ctx.globalAlpha=dim? .6 : .72;
        ctx.fillText(t,n.x+n.w-4,n.y+n.h/2+0.3);
        ctx.globalAlpha=1;
      }
    }
    ctx.textAlign='left'; ctx.textBaseline='alphabetic';
    ctx.restore();
  });
}
