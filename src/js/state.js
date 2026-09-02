// Game state — single source
import { play } from './audio/audioManager.js';

export const GOAL = 500;
export const MAX_SCORE = GOAL;
export const state = {
  score: 0,
  maxScore: GOAL,
  clickPower: 1,
  autoClickers: 0,
  multiplier: 1,
  streak: 0,
  ownedCounts: {},
  completed: false,
};
export function getCost(item) {
  return Math.floor(item.baseCost * Math.pow(item.costMultiplier, state.ownedCounts[item.id] || 0));
}
export function addScore(delta, { pitch = 0, delay = 0 } = {}) {
  if (!delta || state.completed) return 0;
  const next = Math.min(GOAL, Math.max(0, state.score + delta));
  const actual = next - state.score;
  if (!actual) return 0;
  state.score = next;
  if (actual > 0) {
    if (delay > 0) setTimeout(() => play('score', { pitch }), delay);
    else play('score', { pitch });
  }
  document.dispatchEvent(new CustomEvent('score:changed', { detail: { delta: actual, score: next } }));
  if (next >= GOAL && !state.completed) {
    state.completed = true;
    document.dispatchEvent(new CustomEvent('goal:reached', { detail: { score: next } }));
  }
  return actual;
}
export function setScore(value, opts = {}) {
  return addScore(value - state.score, opts);
}
export function resetGoal() {
  state.score = 0;
  state.completed = false;
  state.clickPower = 1;
  state.autoClickers = 0;
  state.multiplier = 1;
  state.streak = 0;
  state.ownedCounts = {};
  document.dispatchEvent(new CustomEvent('score:changed', { detail: { score: 0 } }));
}
