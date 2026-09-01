import { isMuted, setMuted, unlock, play } from './audioManager.js';

export function initSoundToggle() {
  const btn = document.getElementById('sound-toggle');
  if (!btn) return;
  const sync = () => {
    const muted = isMuted();
    btn.setAttribute('aria-pressed', String(!muted));
    btn.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
    const icon = btn.querySelector('.sound-icon');
    if (icon) icon.textContent = muted ? '🔇' : '🔊';
    btn.title = muted ? 'Sound off — click to unmute' : 'Sound on — click to mute';
  };
  btn.addEventListener('click', () => {
    unlock();
    setMuted(!isMuted());
    sync();
    if (!isMuted()) play('click', { pitch: 2 });
  });
  try {
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', sync);
  } catch {}
  sync();
}
