/* Mascot "Sparky" — bolt-hamster hybrid. Inline SVG. Swappable with generated raster later. */
export function mascot(pose='idle',{size=56}={}){
  const base=`<svg viewBox="0 0 64 64" width="${size}" height="${size}" class="mascot" role="img" aria-label="Sparky">`;
  const body=`<g stroke="var(--illus-outline)" stroke-width="1.5" stroke-linejoin="round">`;
  const idle=`${body}<ellipse cx="32" cy="38" rx="18" ry="16" fill="var(--mascot-skin)"/><ellipse cx="32" cy="42" rx="11" ry="8" fill="var(--mascot-cheek)"/><circle cx="26" cy="30" r="3.2" fill="var(--illus-outline)" stroke="none"/><circle cx="38" cy="30" r="3.2" fill="var(--illus-outline)" stroke="none"/><circle cx="27" cy="29" r="1" fill="var(--color-card)" stroke="none"/><circle cx="39" cy="29" r="1" fill="var(--color-card)" stroke="none"/><path d="M29 36 Q32 39 35 36" fill="none" stroke-width="1.3"/><path d="M18 22 Q16 16 20 12 Q22 16 18 22" fill="var(--mascot-skin)"/><path d="M46 22 Q48 16 44 12 Q42 16 46 22" fill="var(--mascot-skin)"/><path d="M8 44 L14 38 L12 48 Z" fill="var(--illus-yellow)"/></g>`;
  const excited=`${body}<ellipse cx="32" cy="40" rx="17" ry="14" fill="var(--mascot-skin)"/><ellipse cx="32" cy="43" rx="10" ry="7" fill="var(--mascot-cheek)"/><circle cx="26" cy="30" r="3" fill="var(--illus-outline)" stroke="none"/><circle cx="38" cy="30" r="3" fill="var(--illus-outline)" stroke="none"/><path d="M29 36 Q32 40 35 36" fill="none"/><path d="M14 28 L8 16 L16 20 Z" fill="var(--illus-pink)"/><path d="M50 28 L56 16 L48 20 Z" fill="var(--illus-pink)"/></g>`;
  const cheer=`${body}<ellipse cx="32" cy="38" rx="17" ry="15" fill="var(--mascot-skin)"/><ellipse cx="32" cy="42" rx="10" ry="7" fill="var(--mascot-cheek)"/><circle cx="26" cy="29" r="3" fill="var(--illus-outline)" stroke="none"/><circle cx="38" cy="29" r="3" fill="var(--illus-outline)" stroke="none"/><path d="M30 35 Q32 37 34 35" fill="none"/><g transform="translate(44,10)"><path d="M0 6 L2 2 L6 0 L2 -2 L0 -6 L-2 -2 L-6 0 L-2 2 Z" fill="var(--illus-yellow)"/></g></g>`;
  const map={idle,excited,cheer};
  return `${base}${map[pose]||map.idle}</svg>`;
}
export function mascotImg(src,{size=56,alt='Sparky'}={}){
  return `<img src="${src}" width="${size}" height="${size}" alt="${alt}" class="mascot" style="object-fit:contain"/>`;
}
