// Game state — single source
import { play } from './audio/audioManager.js';

export const MAX_SCORE = 10000;
export const state = {
  score: 0,
  maxScore: MAX_SCORE,
  clickPower: 1,
  autoClickers: 0,
  multiplier: 1,
  streak: 0,
  ownedCounts: {},
};
export function getCost(item) {
  return Math.floor(item.baseCost * Math.pow(item.costMultiplier, state.ownedCounts[item.id] || 0));
}
export function addScore(delta, { pitch = 0, delay = 0 } = {}) {
  if (!delta) return 0;
  const next = Math.min(MAX_SCORE, Math.max(0, state.score + delta));
  const actual = next - state.score;
  if (!actual) return 0;
  state.score = next;
  if (actual > 0) {
    if (delay > 0) setTimeout(() => play('score', { pitch }), delay);
    else play('score', { pitch });
  }
  document.dispatchEvent(new CustomEvent('score:changed', { detail: { delta: actual, score: next } }));
  return actual;
}
export function setScore(value, opts = {}) {
  return addScore(value - state.score, opts);
}
