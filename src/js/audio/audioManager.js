import { loadPrefs, savePrefs } from './prefs.js';
import { playSound } from './sounds.js';

let ctx = null;
let unlocked = false;
let prefs = loadPrefs();

function createCtx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

function ensureCtx() {
  const c = createCtx();
  if (!c) return null;
  if (c.state === 'suspended') c.resume().catch(() => {});
  return c;
}

export function unlock() {
  if (unlocked) {
    const c = ensureCtx();
    if (c && c.state === 'suspended') c.resume().catch(() => {});
    return;
  }
  unlocked = true;
  ensureCtx();
}

export function isMuted() {
  if (prefs.muted) return true;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return prefs.muted;
  }
}

export function setMuted(v) {
  prefs.muted = !!v;
  savePrefs(prefs);
}

export function getVolume() {
  return prefs.volume;
}

export function setVolume(v) {
  prefs.volume = Math.max(0, Math.min(1, v));
  savePrefs(prefs);
}

export function play(name, opts = {}) {
  if (isMuted()) return;
  const c = ensureCtx();
  if (!c) return;
  const volume = opts.volume ?? prefs.volume;
  playSound(c, name, { ...opts, volume });
}

export function getCtx() {
  return ctx;
}

['click', 'keydown', 'touchstart'].forEach((evt) => {
  window.addEventListener(evt, unlock, { once: true, passive: true });
});

document.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  if (document.hidden) ctx.suspend().catch(() => {});
  else if (!isMuted() && ctx.state === 'suspended') ctx.resume().catch(() => {});
});
