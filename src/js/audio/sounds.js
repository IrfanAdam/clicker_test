import { tone, chord } from './synth.js';

export function playSound(ctx, name, { pitch = 0, volume = 0.7 } = {}) {
  const v = volume;
  switch (name) {
    case 'click': {
      // tactile: thock (low) + snap (mid) + air tick (high)
      tone(ctx, { freq: 220, type: 'triangle', duration: 0.065, gain: 0.25 * v, slideTo: 82 });
      tone(ctx, { freq: 1120, type: 'square', duration: 0.038, gain: 0.17 * v, slideTo: 480 });
      setTimeout(() => tone(ctx, { freq: 3100, type: 'sine', duration: 0.014, gain: 0.07 * v }), 5);
      break;
    }
    case 'score':
    case 'point':
    case 'pop': {
      const base = 880 + Math.min(pitch, 12) * 32;
      tone(ctx, { freq: base, type: 'sine', duration: 0.11, gain: 0.22 * v, slideTo: Math.max(480, base - 160) });
      break;
    }
    case 'buy': {
      chord(ctx, [523.25, 659.25], { type: 'triangle', duration: 0.2, gain: 0.22 * v, gap: 60 });
      setTimeout(() => tone(ctx, { freq: 783.99, type: 'sine', duration: 0.24, gain: 0.16 * v }), 110);
      break;
    }
    case 'error': {
      tone(ctx, { freq: 175, type: 'sawtooth', duration: 0.2, gain: 0.18 * v });
      setTimeout(() => tone(ctx, { freq: 140, type: 'sawtooth', duration: 0.22, gain: 0.14 * v }), 90);
      break;
    }
    case 'celebrate': {
      chord(ctx, [523.25, 659.25, 783.99, 1046.5], { type: 'sine', duration: 0.28, gain: 0.16 * v, gap: 75 });
      break;
    }
    case 'tick': {
      tone(ctx, { freq: 1200, type: 'square', duration: 0.06, gain: 0.1 * v });
      break;
    }
    default:
      break;
  }
}
