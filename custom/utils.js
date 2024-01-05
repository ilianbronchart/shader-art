export function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

export function createGraphics(p, width, height) {
  let g = p.createGraphics(width, height, p.WEBGL);
  g.imageMode(p.CENTER);
  g.rectMode(p.CENTER);
  return g;
}
