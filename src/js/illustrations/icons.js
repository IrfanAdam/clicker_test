/* Icons — thick-outline flat sticker style. Pure SVG strings. */
const S = 'stroke="var(--illus-outline)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"';
export function icon(name,{size=38}={}){
  const svg=(inner,fill='var(--color-card)')=>`<svg viewBox="0 0 44 44" width="${size}" height="${size}" class="illus-icon" fill="${fill}" ${S}>${inner}</svg>`;
  const m={
    zap: svg('<path d="M24 4 L10 24 L19 24 L14 40 L32 18 L22 18 Z" fill="var(--illus-yellow)"/>','none'),
    diamond: svg('<path d="M22 6 L36 18 L22 38 L8 18 Z"/><path d="M8 18 L22 26 L36 18" fill="none"/><path d="M14 12 L18 18 M30 12 L26 18" stroke-width="1.2"/>','var(--illus-blue)'),
    flame: svg('<path d="M22 6 C18 14 11 16 13 26 C15 32 29 32 31 26 C33 16 26 14 22 6Z" fill="var(--illus-orange)"/><path d="M22 14 C19 19 16 20 17 25 C18 28 26 28 27 25 C28 20 25 19 22 14Z" fill="var(--orange-400)" stroke="none"/>','none'),
    trophy: svg('<path d="M14 8 H30 V16 C30 22 26 26 22 26 C18 26 14 22 14 16 V8Z" fill="var(--illus-pink)"/><path d="M14 12 H10 C8 12 8 16 10 16 H14 M30 12 H34 C36 12 36 16 34 16 H30" fill="none"/><path d="M18 26 H26 L24 32 H20 Z M16 34 H28" fill="var(--illus-yellow)"/>','none'),
    web: svg('<circle cx="22" cy="22" r="10" fill="var(--illus-blue)"/><path d="M22 12 V32 M12 22 H32 M15 15 L29 29 M29 15 L15 29" fill="none"/><circle cx="22" cy="22" r="3" fill="var(--color-card)"/>','none'),
    clock: svg('<circle cx="22" cy="22" r="10" fill="var(--illus-blue)"/><path d="M22 16 V22 L27 25" fill="none" stroke-width="1.6"/>','none'),
    star: svg('<path d="M22 8 L25.5 16.5 L34 17 L27.5 22.5 L29 31 L22 26.5 L15 31 L16.5 22.5 L10 17 L18.5 16.5 Z" fill="var(--illus-yellow)"/>','none'),
  };
  return m[name]||m.zap;
}
