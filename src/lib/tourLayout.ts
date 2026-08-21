export interface TourLayout {
  spotlight: { left: number; top: number; width: number; height: number };
  card: { left: number; top: number; width: number };
  arrowPath: string;
  side: 'top' | 'right' | 'bottom' | 'left';
}

const clamp = (value: number, minimum: number, maximum: number) => Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
const point = (value: number) => Math.round(value * 10) / 10;

function arrowPath(start: { x: number; y: number }, end: { x: number; y: number }, shape: number) {
  const dx = end.x - start.x; const dy = end.y - start.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const normal = { x: -dy / length, y: dx / length };
  if (shape === 1) return `M ${point(start.x)} ${point(start.y)} L ${point(end.x)} ${point(end.y)}`;
  if (shape === 2) {
    const bend = Math.min(76, length * .35);
    return `M ${point(start.x)} ${point(start.y)} Q ${point((start.x + end.x) / 2 + normal.x * bend)} ${point((start.y + end.y) / 2 + normal.y * bend)} ${point(end.x)} ${point(end.y)}`;
  }
  const twist = shape === 3 ? -82 : 52;
  return `M ${point(start.x)} ${point(start.y)} C ${point(start.x + dx * .2 + normal.x * twist)} ${point(start.y + dy * .2 + normal.y * twist)} ${point(start.x + dx * .76 - normal.x * twist * .55)} ${point(start.y + dy * .76 - normal.y * twist * .55)} ${point(end.x)} ${point(end.y)}`;
}

export function getTourLayout(target: DOMRect, measuredWidth: number, measuredHeight: number, step: number): TourLayout {
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const mobile = viewport.width <= 680;
  const cardWidth = Math.min(measuredWidth || (mobile ? 340 : 380), viewport.width - 24);
  const cardHeight = Math.min(measuredHeight || 270, viewport.height - 24);
  const gap = mobile ? 20 : 26; const edge = 12; const bottomSafe = mobile ? 82 : edge;
  const room = { top: target.top - edge, bottom: viewport.height - bottomSafe - target.bottom, left: target.left - edge, right: viewport.width - edge - target.right };
  let side: TourLayout['side'];
  if (!mobile && room.right >= cardWidth + gap) side = 'right';
  else if (!mobile && room.left >= cardWidth + gap) side = 'left';
  else if (room.bottom >= cardHeight + gap) side = 'bottom';
  else if (room.top >= cardHeight + gap) side = 'top';
  else side = room.bottom >= room.top ? 'bottom' : 'top';
  let left = clamp(target.left + target.width / 2 - cardWidth / 2, edge, viewport.width - cardWidth - edge);
  let top = side === 'bottom' ? target.bottom + gap : target.top - cardHeight - gap;
  if (side === 'right') { left = target.right + gap; top = target.top + target.height / 2 - cardHeight / 2; }
  if (side === 'left') { left = target.left - cardWidth - gap; top = target.top + target.height / 2 - cardHeight / 2; }
  top = clamp(top, edge, viewport.height - bottomSafe - cardHeight);
  const start = side === 'bottom' ? { x: left + cardWidth / 2, y: top } : side === 'top' ? { x: left + cardWidth / 2, y: top + cardHeight } : side === 'right' ? { x: left, y: top + cardHeight / 2 } : { x: left + cardWidth, y: top + cardHeight / 2 };
  const end = side === 'bottom' ? { x: target.left + target.width / 2, y: target.bottom + 5 } : side === 'top' ? { x: target.left + target.width / 2, y: target.top - 5 } : side === 'right' ? { x: target.right + 5, y: target.top + target.height / 2 } : { x: target.left - 5, y: target.top + target.height / 2 };
  const pad = mobile ? 7 : 10;
  const spotlightLeft = clamp(target.left - pad, 3, viewport.width - 3);
  const spotlightTop = clamp(target.top - pad, 3, viewport.height - 3);
  const spotlightRight = clamp(target.right + pad, spotlightLeft, viewport.width - 3);
  const spotlightBottom = clamp(target.bottom + pad, spotlightTop, viewport.height - 3);
  return {
    card: { left, top, width: cardWidth }, side,
    spotlight: { left: spotlightLeft, top: spotlightTop, width: spotlightRight - spotlightLeft, height: spotlightBottom - spotlightTop },
    arrowPath: arrowPath(start, end, step),
  };
}
