import { NODES, KINDS, GROUPS } from './graphData.js';
import { token, drawGroups, drawGrid, drawEdges, drawNodes } from './render.js';
import { clearRouteCache } from './route.js';
const RH=18,RG=3,HH=32,PY=4,PX=3;
export function createMechanicsCanvas(canvas, tooltip){
  const ctx=canvas.getContext('2d');
  let W=0,H=0,dpr=1,scale=1,ox=0,oy=0,dragGroup=null,dragNode=null,pan=null,hover=null,hoverGroup=null,selected=null,anim=null;
  function getBB(){ let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    GROUPS.forEach(g=>{ minX=Math.min(minX,g.x);minY=Math.min(minY,g.y);maxX=Math.max(maxX,g.x+g.w);maxY=Math.max(maxY,g.y+g.h);});
    NODES.forEach(n=>{ minX=Math.min(minX,n.x);minY=Math.min(minY,n.y);maxX=Math.max(maxX,n.x+n.w);maxY=Math.max(maxY,n.y+n.h);});
    return {minX,minY,w:maxX-minX,h:maxY-minY}; }
  function resize(){
    const r=canvas.parentElement.getBoundingClientRect(); dpr=Math.min(window.devicePixelRatio||1,2);
    W=r.width;H=r.height; canvas.width=W*dpr; canvas.height=H*dpr;
    canvas.style.width=W+'px'; canvas.style.height=H+'px'; ctx.setTransform(dpr,0,0,dpr,0,0);
    if(!ox&&!oy){ const b=getBB(); scale=Math.min(1,(W-48)/b.w,(H-80)/b.h); ox=(W-b.w*scale)/2-b.minX*scale; oy=(H-b.h*scale)/2-b.minY*scale; }
    draw();
  }
  function world(e){ const r=canvas.getBoundingClientRect(); return {x:(e.clientX-r.left-ox)/scale,y:(e.clientY-r.top-oy)/scale}; }
  function hitNode(p){ for(let i=NODES.length-1;i>=0;i--){ const n=NODES[i]; if(p.x>=n.x-4&&p.x<=n.x+n.w+4&&p.y>=n.y-4&&p.y<=n.y+n.h+4) return n;} return null; }
  function hitGroup(p){ for(let i=GROUPS.length-1;i>=0;i--){ const g=GROUPS[i]; if(p.x>=g.x&&p.x<=g.x+g.w&&p.y>=g.y&&p.y<=g.y+32) return g;} return null; }
  function layoutGroup(g){
    const list=NODES.filter(n=>n.group===g.id).sort((a,b)=>a.y-b.y);
    list.forEach((n,i)=>{ n.y=g.y+HH+PY+i*(RH+RG); n.x=g.x+PX; });
  }
  function reorderNode(node, worldY){
    const g=GROUPS.find(x=>x.id===node.group); if(!g) return;
    const list=NODES.filter(n=>n.group===g.id).sort((a,b)=>a.y-b.y);
    const cur=list.indexOf(node); if(cur<0) return;
    let tgt=Math.floor((worldY - g.y - HH - PY + RH/2)/(RH+RG));
    tgt=Math.max(0,Math.min(list.length-1,tgt));
    if(tgt===cur) return;
    list.splice(cur,1); list.splice(tgt,0,node);
    list.forEach((n,i)=>{ n.y=g.y+HH+PY+i*(RH+RG); n.x=g.x+PX; });
    clearRouteCache();
  }
  function draw(){
    if(anim) cancelAnimationFrame(anim);
    anim=requestAnimationFrame(()=>{
      ctx.clearRect(0,0,W,H); ctx.fillStyle=token('--stone-100'); ctx.fillRect(0,0,W,H);
      ctx.save(); ctx.translate(ox,oy); ctx.scale(scale,scale);
      drawGroups(ctx,scale,hoverGroup,selected); drawGrid(ctx,ox,oy,scale,W,H);
      drawEdges(ctx,scale,hover,selected); drawNodes(ctx,scale,hover,selected);
      ctx.restore();
    });
  }
  function tip(n){
    if(!n){ tooltip.hidden=true; return; } tooltip.hidden=false;
    tooltip.innerHTML=`<strong>${n.label}</strong><span style="margin-top:4px;line-height:1.4">${n.desc}</span><em>${n.file} · ${KINDS[n.kind]?.label||n.kind} · ${n.sub}</em>`;
    let x=(n.x*scale+ox)+n.w*scale+10, y=(n.y*scale+oy); const tw=280;
    if(x+tw>W-12) x=(n.x*scale+ox)-tw-10; if(y+110>H-12) y=H-122; if(y<8) y=8; if(x<8) x=8;
    tooltip.style.left=x+'px'; tooltip.style.top=y+'px';
  }
  canvas.addEventListener('pointermove',e=>{
    const p=world(e);
    if(dragGroup){
      const dx=p.x-dragGroup.offX, dy=p.y-dragGroup.offY;
      dragGroup.g.x=dragGroup.sx+dx; dragGroup.g.y=dragGroup.sy+dy;
      dragGroup.members.forEach(m=>{ m.n.x=m.sx+dx; m.n.y=m.sy+dy; });
      clearRouteCache(); draw(); return;
    }
    if(dragNode){ reorderNode(dragNode,p.y); draw(); tip(dragNode); return; }
    if(pan){ ox=e.clientX-pan.sx; oy=e.clientY-pan.sy; draw(); return; }
    const hg=hitGroup(p), h=hitNode(p);
    const hgChanged=hg!==hoverGroup; hoverGroup=hg;
    if(h!==hover || hgChanged){ hover=h; canvas.style.cursor= hg? 'grab' : h? 'ns-resize':'grab'; draw(); }
    if(h) tip(h); else tooltip.hidden=true;
  });
  canvas.addEventListener('pointerdown',e=>{
    const p=world(e), hg=hitGroup(p);
    if(hg){
      selected=null;
      const members=NODES.filter(n=>n.group===hg.id).map(n=>({n,sx:n.x,sy:n.y}));
      dragGroup={g:hg,sx:hg.x,sy:hg.y,offX:p.x,offY:p.y,members};
      canvas.setPointerCapture(e.pointerId); draw(); return;
    }
    const h=hitNode(p);
    if(h){ selected=h; dragNode=h; canvas.setPointerCapture(e.pointerId); draw(); tip(h); return; }
    pan={sx:e.clientX-ox,sy:e.clientY-oy}; canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointerup',e=>{
    if(dragGroup && dragGroup.g){
      const moved=Math.hypot(dragGroup.g.x-dragGroup.sx, dragGroup.g.y-dragGroup.sy);
      if(moved<2) selected=null;
    }
    dragNode=null; dragGroup=null; pan=null; try{canvas.releasePointerCapture(e.pointerId);}catch{}
    draw();
  });
  canvas.addEventListener('dblclick',e=>{
    const p=world(e), hg=hitGroup(p); if(!hg) return;
    const base={boot:{x:18,y:130},state:{x:162,y:16},game:{x:162,y:244},shop:{x:322,y:16},out:{x:322,y:244}}[hg.id];
    if(!base) return;
    const dx=base.x-hg.x, dy=base.y-hg.y; hg.x=base.x; hg.y=base.y;
    layoutGroup(hg);
    NODES.filter(n=>n.group===hg.id).forEach(n=>{ n.x+=0; });
    clearRouteCache(); draw();
  });
  canvas.addEventListener('wheel',e=>{
    e.preventDefault(); const r=canvas.getBoundingClientRect(), mx=e.clientX-r.left, my=e.clientY-r.top;
    const k=e.deltaY>0?.92:1.08, ns=Math.max(.18,Math.min(3.8,scale*k));
    ox=mx-(mx-ox)*(ns/scale); oy=my-(my-oy)*(ns/scale); scale=ns; draw();
    const p=world(e), h=hitNode(p); if(h||hover) tip(h||hover);
  },{passive:false});
  canvas.addEventListener('click',e=>{
    const p=world(e);
    if(hitGroup(p)) return;
    const h=hitNode(p); if(h){ selected=h; draw(); tip(h); } else if(!pan&&!dragNode&&!dragGroup){ selected=null; draw(); tooltip.hidden=true; }
  });
  canvas.addEventListener('pointerleave',()=>{ hover=null; hoverGroup=null; tooltip.hidden=true; draw(); });
  window.addEventListener('resize',resize); resize();
  return { resize, draw };
}
