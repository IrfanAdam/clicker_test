import { NODES, GROUPS } from './graphData.js';
const cache=new Map();
export function clearRouteCache(){ cache.clear(); }
const GROUP_BY_ID=new Map(GROUPS.map(g=>[g.id,g]));
function getGroup(node){ return GROUP_BY_ID.get(node.group); }
function segHitsRect(x1,y1,x2,y2, rect, pad=0){
  const rx1=rect.x-pad,ry1=rect.y-pad,rx2=rect.x+rect.w+pad,ry2=rect.y+rect.h+pad;
  const minX=Math.min(x1,x2),maxX=Math.max(x1,x2),minY=Math.min(y1,y2),maxY=Math.max(y1,y2);
  if(maxX<rx1||minX>rx2||maxY<ry1||minY>ry2) return false;
  if(x1===x2) return x1>=rx1&&x1<=rx2 && !(Math.max(y1,y2)<ry1 || Math.min(y1,y2)>ry2);
  if(y1===y2) return y1>=ry1&&y1<=ry2 && !(Math.max(x1,x2)<rx1 || Math.min(x1,x2)>rx2);
  return !(maxX<rx1||minX>rx2||maxY<ry1||minY>ry2);
}
// Intelligent side selection: pick left/right entry based on actual flow direction (center dx)
function buildDirect(a,b,off){
  const sy=a.y+a.h/2, ty=b.y+b.h/2;
  const ax=a.x+a.w/2, bx=b.x+b.w/2;
  const forward=ax < bx;
  const sx=forward ? a.x+a.w : a.x;
  const tx=forward ? b.x : b.x+b.w;
  const stub=10;
  const sx1=forward ? sx+stub : sx-stub;
  const tx1=forward ? tx-stub : tx+stub;
  const gutter=(sx+tx)/2 + off;
  const pts=[{x:sx,y:sy},{x:sx1,y:sy},{x:gutter,y:sy},{x:gutter,y:ty},{x:tx1,y:ty},{x:tx,y:ty}];
  return pts.filter((p,i)=>i===0||p.x!==pts[i-1].x||p.y!==pts[i-1].y);
}
function buildBottomDetour(a,b, bottomOff, forward){
  const sy=a.y+a.h/2, ty=b.y+b.h/2;
  const stub=12;
  let sx,tx,sx1,tx1;
  if(forward){ sx=a.x+a.w; tx=b.x; sx1=sx+stub; tx1=tx-stub; }
  else { sx=a.x; tx=b.x+b.w; sx1=sx-stub; tx1=tx+stub; }
  const maxBottom=Math.max(...GROUPS.map(g=>g.y+g.h));
  const bottomY=maxBottom + 16 + bottomOff;
  const pts=[{x:sx,y:sy},{x:sx1,y:sy},{x:sx1,y:bottomY},{x:tx1,y:bottomY},{x:tx1,y:ty},{x:tx,y:ty}];
  return pts.filter((p,i)=>i===0||p.x!==pts[i-1].x||p.y!==pts[i-1].y);
}
function buildSameGroup(a,b, off){
  const g=getGroup(a);
  const sy=a.y+a.h/2, ty=b.y+b.h/2;
  const sx=a.x+a.w, tx=b.x+b.w;
  const stub=10;
  const outerX=g.x+g.w+12+off;
  const pts=[{x:sx,y:sy},{x:sx+stub,y:sy},{x:outerX,y:sy},{x:outerX,y:ty},{x:tx+stub,y:ty},{x:tx,y:ty}];
  return pts.filter((p,i)=>i===0||p.x!==pts[i-1].x||p.y!==pts[i-1].y);
}
function buildStacked(a,b,off){
  const ga=getGroup(a), gb=getGroup(b);
  const sy=a.y+a.h/2, ty=b.y+b.h/2;
  const stub=10;
  const outerX=Math.max(ga.x+ga.w, gb.x+gb.w)+14+off;
  const sx=a.x+a.w, tx=b.x+b.w;
  const pts=[{x:sx,y:sy},{x:sx+stub,y:sy},{x:outerX,y:sy},{x:outerX,y:ty},{x:tx+stub,y:ty},{x:tx,y:ty}];
  return pts.filter((p,i)=>i===0||p.x!==pts[i-1].x||p.y!==pts[i-1].y);
}
function cost(path,a,b){
  let hits=0;
  const ga=getGroup(a), gb=getGroup(b);
  for(const n of NODES){
    if(n===a||n===b) continue;
    for(let i=0;i<path.length-1;i++){
      const p=path[i],q=path[i+1];
      if(segHitsRect(p.x,p.y,q.x,q.y,n,6)) hits++;
    }
  }
  for(const g of GROUPS){
    if(g===ga||g===gb) continue;
    for(let i=0;i<path.length-1;i++){
      const p=path[i],q=path[i+1];
      if(p.y> g.y+g.h+8 || q.y> g.y+g.h+8) continue;
      if(segHitsRect(p.x,p.y,q.x,q.y,g, -2)) hits+=2;
    }
  }
  let len=0;
  for(let i=0;i<path.length-1;i++) len+=Math.hypot(path[i+1].x-path[i].x,path[i+1].y-path[i].y);
  const corners=(path.length-2)*5;
  return hits*120+len*0.08+corners;
}
export function getRoute(a,b,ax,ay,bx,by,A,B){
  const key=`${a.id}->${b.id}|${a.x},${a.y},${b.x},${b.y}`;
  if(cache.has(key)) return cache.get(key);
  const ga=getGroup(a), gb=getGroup(b);
  if(!ga||!gb){ const fallback=[{x:ax,y:ay},{x:bx,y:by}]; const r={path:fallback,cost:999,ang:Math.atan2(by-ay,bx-ax),ax,ay,bx,by}; cache.set(key,r); return r; }
  const sameGroup=ga.id===gb.id;
  const axc=a.x+a.w/2, bxc=b.x+b.w/2;
  const forward=axc < bxc;
  const stacked=Math.abs(ga.x - gb.x)<2 && ga.id!==gb.id;
  let best=null,bestC=Infinity;
  const tryCand=(p)=>{ const c=cost(p,a,b); if(c<bestC){bestC=c;best=p;}};
  if(sameGroup){
    for(const off of [-10,-2,6,14,22]) tryCand(buildSameGroup(a,b,off));
  } else if(stacked){
    for(const off of [4,12,20,28]) tryCand(buildStacked(a,b,off));
    for(const off of [0,8,16,24,32]) tryCand(buildBottomDetour(a,b,off,forward));
    for(const off of [-10,-4,4,10]) tryCand(buildDirect(a,b,off));
  } else {
    for(const off of [-12,-6,0,6,12]) tryCand(buildDirect(a,b,off));
    for(const off of [0,8,16,24,32]) tryCand(buildBottomDetour(a,b,off,forward));
  }
  const sx=best[0], tx=best[best.length-1];
  const pen=best[best.length-2];
  const ang=Math.atan2(tx.y-pen.y, tx.x-pen.x);
  const res={ax:sx.x,ay:sx.y,bx:tx.x,by:tx.y,path:best,cost:bestC,ang};
  cache.set(key,res);
  return res;
}
