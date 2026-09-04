import { defineConfig } from 'vite';
import { spawn } from 'node:child_process';
function mechanicsGraphPlugin(){
  let timer=null, busy=false, queued=false;
  function run(){
    if(busy){ queued=true; return; }
    busy=true;
    const p=spawn('node',['scripts/generate-mechanics-graph.js'],{stdio:'inherit'});
    p.on('close',()=>{ busy=false; if(queued){ queued=false; run(); } });
    p.on('error',()=>{ busy=false; });
  }
  function debounced(){ clearTimeout(timer); timer=setTimeout(run,150); }
  return {
    name: 'mechanics-graph',
    buildStart(){ return new Promise(res=>{ const p=spawn('node',['scripts/generate-mechanics-graph.js'],{stdio:'inherit'}); p.on('close',res); p.on('error',res); }); },
    configureServer(server){
      server.watcher.on('change', f=>{ if(f.startsWith('src/') && !f.includes('/mechanics/')) debounced(); });
      server.watcher.on('add', f=>{ if(f.startsWith('src/') && !f.includes('/mechanics/')) debounced(); });
      server.watcher.on('unlink', f=>{ if(f.startsWith('src/') && !f.includes('/mechanics/')) debounced(); });
    },
  };
}
export default defineConfig({ plugins:[mechanicsGraphPlugin()] });
