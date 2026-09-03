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
      // Act 1 — rising hero chord C5 E5 G5 C6
      chord(ctx, [523.25, 659.25, 783.99, 1046.5], { type: 'triangle', duration: 0.32, gain: 0.18 * v, gap: 55 });
      // Act 2 — higher sparkle C6 E6 G6 after 220ms
      setTimeout(() => chord(ctx, [1046.5, 1318.5, 1567.9], { type: 'sine', duration: 0.4, gain: 0.15 * v, gap: 45 }), 220);
      // Act 3 — warm bass resolve C4 + C5 with shimmer
      setTimeout(() => {
        tone(ctx, { freq: 130.81, type: 'triangle', duration: 0.7, gain: 0.19 * v, slideTo: 65 });
        tone(ctx, { freq: 523.25, type: 'sine', duration: 0.55, gain: 0.1 * v });
      }, 380);
      // Shimmer layer — quick octave ping
      setTimeout(() => tone(ctx, { freq: 2093, type: 'sine', duration: 0.18, gain: 0.07 * v }), 300);
      setTimeout(() => tone(ctx, { freq: 2637, type: 'sine', duration: 0.2, gain: 0.06 * v }), 520);
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
