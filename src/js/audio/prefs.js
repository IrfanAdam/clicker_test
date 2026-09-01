const KEY = 'clicker:sound';
const defaults = { muted: false, volume: 0.7 };

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    const p = JSON.parse(raw);
    return {
      muted: typeof p.muted === 'boolean' ? p.muted : defaults.muted,
      volume: typeof p.volume === 'number' ? p.volume : defaults.volume,
    };
  } catch {
    return { ...defaults };
  }
}

export function savePrefs(prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {}
}

export function getDefaults() {
  return { ...defaults };
}
