// text helpers — zoom-invariant fit & wrap (world units → screen via scale)
export function fitText(ctx, text, maxWorldW, baseWorld, scale, family, weight){
  let world = baseWorld;
  let screen = world / scale;
  ctx.font = `${weight} ${screen}px ${family}`;
  const maxScreen = maxWorldW * scale;
  let tw = ctx.measureText(text).width;
  if(tw > maxScreen){
    world = Math.max(6, world * maxScreen / tw);
    screen = world / scale;
    ctx.font = `${weight} ${screen}px ${family}`;
    tw = ctx.measureText(text).width;
  }
  let t = text;
  while(tw > maxScreen && t.length > 4){
    t = t.slice(0,-2) + '…';
    tw = ctx.measureText(t).width;
  }
  return { text: t, font: ctx.font, world };
}
export function wrapText(ctx, text, maxWorldW, baseWorld, scale, family, maxLines){
  const maxScreen = maxWorldW * scale;
  const screen = baseWorld / scale;
  ctx.font = `500 ${screen}px ${family}`;
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for(const w of words){
    const test = cur ? cur + ' ' + w : w;
    if(ctx.measureText(test).width <= maxScreen) cur = test;
    else {
      if(cur) lines.push(cur);
      cur = w;
      if(lines.length >= maxLines) break;
      // single word too long → truncate
      while(ctx.measureText(cur).width > maxScreen && cur.length > 4) cur = cur.slice(0,-2) + '…';
    }
  }
  if(cur && lines.length < maxLines) lines.push(cur);
  if(lines.length > maxLines) lines.length = maxLines;
  // ellipsis last line if original overflowed
  const all = words.join(' ');
  if(lines.join(' ').length < all.length && lines.length){
    let last = lines[lines.length-1];
    while(ctx.measureText(last).width > maxScreen && last.length > 4) last = last.slice(0,-2) + '…';
    if(!last.endsWith('…')) {
      while(ctx.measureText(last + '…').width > maxScreen && last.length > 1) last = last.slice(0,-1);
      last += '…';
    }
    lines[lines.length-1] = last;
  }
  return lines;
}
