import { defineConfig } from 'vite';
import { spawnSync } from 'node:child_process';
function mechanicsGraphPlugin(){
  return {
    name: 'mechanics-graph',
    buildStart(){ spawnSync('node',['scripts/generate-mechanics-graph.js'],{stdio:'inherit'}); },
    configureServer(server){
      const run=()=> spawnSync('node',['scripts/generate-mechanics-graph.js'],{stdio:'inherit'});
      server.watcher.on('change', f=>{ if(f.startsWith('src/') && !f.includes('/mechanics/')) run(); });
      server.watcher.on('add', f=>{ if(f.startsWith('src/') && !f.includes('/mechanics/')) run(); });
      server.watcher.on('unlink', f=>{ if(f.startsWith('src/') && !f.includes('/mechanics/')) run(); });
    },
  };
}
export default defineConfig({ plugins:[mechanicsGraphPlugin()] });
