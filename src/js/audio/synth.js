export function tone(ctx, { freq = 440, type = 'sine', duration = 0.12, gain = 0.25, slideTo } = {}) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  if (slideTo != null) {
    osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + duration * 0.9);
  }
  const t0 = ctx.currentTime;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.connect(g).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration);
}

export function chord(ctx, freqs, opts = {}) {
  const gap = opts.gap ?? 70;
  freqs.forEach((f, i) => {
    setTimeout(() => tone(ctx, { ...opts, freq: f }), i * gap);
  });
}
