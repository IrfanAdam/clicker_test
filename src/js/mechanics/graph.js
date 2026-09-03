import * as Functions from './graphData.js';
import * as IA from './graphData.ia.js';

const STORE = {
  functions: Functions,
  components: IA,
};

let mode = (typeof localStorage !== 'undefined' && localStorage.getItem('mechanics:mode') === 'components') ? 'components' : 'functions';

export let GROUPS = STORE[mode].GROUPS;
export let NODES = STORE[mode].NODES;
export let EDGES = STORE[mode].EDGES;
export let KINDS = STORE[mode].KINDS;

export function getMode(){ return mode; }
export function setMode(next){
  if(next !== 'functions' && next !== 'components') return;
  if(next === mode) return;
  mode = next;
  try{ localStorage.setItem('mechanics:mode', mode); }catch{}
  GROUPS = STORE[mode].GROUPS;
  NODES = STORE[mode].NODES;
  EDGES = STORE[mode].EDGES;
  KINDS = STORE[mode].KINDS;
  try{ document.dispatchEvent(new CustomEvent('mechanics:mode', {detail:{mode}})); }catch{}
}
export function getGraph(){ return STORE[mode]; }
export const GRAPHS = STORE;
