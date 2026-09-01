import { NODES, GROUPS, EDGES } from './graphData.js';
const cache=new Map();
export function clearRouteCache(){ cache.clear(); }
const GROUP_BY_ID=new Map(GROUPS.map(g=>[g.id,g]));
function getGroup(n){ return GROUP_BY_ID.get(n.group); }
function segHitsRect(x1,y1,x2,y2,r,pad=0){
  const rx1=r.x-pad,ry1=r.y-pad,rx2=r.x+r.w+pad,ry2=r.y+r.h+pad;
  const minX=Math.min(x1,x2),maxX=Math.max(x1,x2),minY=Math.min(y1,y2),maxY=Math.max(y1,y2);
  if(maxX<rx1||minX>rx2||maxY<ry1||minY>ry2) return false;
  if(x1===x2) return x1>=rx1&&x1<=rx2&&!(Math.max(y1,y2)<ry1||Math.min(y1,y2)>ry2);
  if(y1===y2) return y1>=ry1&&y1<=ry2&&!(Math.max(x1,x2)<rx1||Math.min(x1,x2)>rx2);
  return !(maxX<rx1||minX>rx2||maxY<ry1||minY>ry2);
}
function buildDirect(a,b,off){
  const sy=a.y+a.h/2,ty=b.y+b.h/2,ax=a.x+a.w/2,bx=b.x+b.w/2,fwd=ax<bx;
  const sx=fwd?a.x+a.w:a.x,tx=fwd?b.x:b.x+b.w,stub=10;
  const sx1=fwd?sx+stub:sx-stub,tx1=fwd?tx-stub:tx+stub,gutter=(sx+tx)/2+off;
  const pts=[{x:sx,y:sy},{x:sx1,y:sy},{x:gutter,y:sy},{x:gutter,y:ty},{x:tx1,y:ty},{x:tx,y:ty}];
  return pts.filter((p,i)=>i===0||p.x!==pts[i-1].x||p.y!==pts[i-1].y);
}
function buildBottomDetour(a,b,off,fwd){
  const sy=a.y+a.h/2,ty=b.y+b.h/2,stub=12;
  let sx,tx,sx1,tx1;
  if(fwd){sx=a.x+a.w;tx=b.x;sx1=sx+stub;tx1=tx-stub;}else{sx=a.x;tx=b.x+b.w;sx1=sx-stub;tx1=tx+stub;}
  const bottomY=Math.max(...GROUPS.map(g=>g.y+g.h))+16+off;
  const pts=[{x:sx,y:sy},{x:sx1,y:sy},{x:sx1,y:bottomY},{x:tx1,y:bottomY},{x:tx1,y:ty},{x:tx,y:ty}];
  return pts.filter((p,i)=>i===0||p.x!==pts[i-1].x||p.y!==pts[i-1].y);
}
function buildSameGroup(a,b,lane){
  const g=getGroup(a),sy=a.y+a.h/2,ty=b.y+b.h/2,stub=7;
  const sx=a.x+a.w,tx=b.x+b.w,outerX=g.x+g.w+7+lane;
  const pts=[{x:sx,y:sy},{x:sx+stub,y:sy},{x:outerX,y:sy},{x:outerX,y:ty},{x:tx+stub,y:ty},{x:tx,y:ty}];
  return pts.filter((p,i)=>i===0||p.x!==pts[i-1].x||p.y!==pts[i-1].y);
}
function buildStacked(a,b,off){
  const ga=getGroup(a),gb=getGroup(b),sy=a.y+a.h/2,ty=b.y+b.h/2,stub=10;
  const outerX=Math.max(ga.x+ga.w,gb.x+gb.w)+14+off,sx=a.x+a.w,tx=b.x+b.w;
  const pts=[{x:sx,y:sy},{x:sx+stub,y:sy},{x:outerX,y:sy},{x:outerX,y:ty},{x:tx+stub,y:ty},{x:tx,y:ty}];
  return pts.filter((p,i)=>i===0||p.x!==pts[i-1].x||p.y!==pts[i-1].y);
}
function cost(path,a,b){
  let hits=0;const ga=getGroup(a),gb=getGroup(b);
  for(const n of NODES){if(n===a||n===b) continue;for(let i=0;i<path.length-1;i++){const p=path[i],q=path[i+1];if(segHitsRect(p.x,p.y,q.x,q.y,n,6)) hits++;}}
  for(const g of GROUPS){if(g===ga||g===gb) continue;for(let i=0;i<path.length-1;i++){const p=path[i],q=path[i+1];if(p.y>g.y+g.h+8&&q.y>g.y+g.h+8) continue;if(segHitsRect(p.x,p.y,q.x,q.y,g,-2)) hits+=2;}}
  let len=0;for(let i=0;i<path.length-1;i++) len+=Math.hypot(path[i+1].x-path[i].x,path[i+1].y-path[i].y);
  return hits*120+len*0.08+(path.length-2)*5;
}
export function getRoute(a,b,ax,ay,bx,by){
  const key=`${a.id}->${b.id}|${a.x},${a.y},${b.x},${b.y}`;
  if(cache.has(key)) return cache.get(key);
  const ga=getGroup(a),gb=getGroup(b);
  if(!ga||!gb){const f=[{x:ax,y:ay},{x:bx,y:by}];const r={path:f,cost:999,ang:Math.atan2(by-ay,bx-ax),ax,ay,bx,by};cache.set(key,r);return r;}
  const same=ga.id===gb.id,forward=(a.x+a.w/2)<(b.x+b.w/2),stacked=Math.abs(ga.x-gb.x)<2&&ga.id!==gb.id;
  let best=null,bestC=Infinity;const tryCand=p=>{const c=cost(p,a,b);if(c<bestC){bestC=c;best=p;}};
  if(same){
    const groupEdges=EDGES.filter(e=>{const fa=NODES.find(n=>n.id===e.from),fb=NODES.find(n=>n.id===e.to);return fa&&fb&&fa.group===ga.id&&fb.group===ga.id;});
    groupEdges.sort((ea,eb)=>{const na=NODES.find(n=>n.id===ea.from),nb=NODES.find(n=>n.id===eb.from);return (na.y+ NODES.find(n=>n.id===ea.to).y)-(nb.y+ NODES.find(n=>n.id===eb.to).y);});
    let idx=groupEdges.findIndex(e=>e.from===a.id&&e.to===b.id);if(idx<0) idx=0;
    const lane=6+idx*9;
    best=buildSameGroup(a,b,lane);bestC=cost(best,a,b);
    const alt=buildSameGroup(a,b,lane+4);const ca=cost(alt,a,b);if(ca+6<bestC){best=alt;bestC=ca;}
  } else if(stacked){
    for(const off of [4,12,20,28]) tryCand(buildStacked(a,b,off));
    for(const off of [0,8,16,24,32]) tryCand(buildBottomDetour(a,b,off,forward));
    for(const off of [-10,-4,4,10]) tryCand(buildDirect(a,b,off));
  } else {
    for(const off of [-12,-6,0,6,12]) tryCand(buildDirect(a,b,off));
    for(const off of [0,8,16,24,32]) tryCand(buildBottomDetour(a,b,off,forward));
  }
  const sx=best[0],tx=best[best.length-1],pen=best[best.length-2];
  const ang=Math.atan2(tx.y-pen.y,tx.x-pen.x);
  const res={ax:sx.x,ay:sx.y,bx:tx.x,by:tx.y,path:best,cost:bestC,ang};
  cache.set(key,res);return res;
}
