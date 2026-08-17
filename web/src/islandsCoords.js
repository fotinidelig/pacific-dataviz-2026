/**
 * Scatter small island marks between land radius and EEZ radius.
 * Used by light + dark maps so the count encoding stays consistent.
 *
 * Pass `seed` (e.g. REF_AREA) for stable positions across re-renders / year changes.
 */

export function mulberry32(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFromString(str) {
  let h = 2166136261;
  for (let i = 0; i < String(str).length; i++) {
    h ^= String(str).charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h;
}

export function islandsCoords({ x, y, r1, r2, num_islands, seed }) {
  if (num_islands <= 1) return [];
  const rand = mulberry32(seedFromString(seed ?? `${x},${y},${num_islands}`));
  const coords = [];
  const offset = rand() * 2 * Math.PI;
  for (let i = 0; i < num_islands; i++) {
    // outer radius is 60% of the eez radius for a more compact layout
    const r = r1 * 1.05 + (r2 * 0.6 - r1 * 1.05) * Math.sqrt(rand());
    const angle = offset + (i * (2 * Math.PI)) / num_islands;
    coords.push({
      x: x + r * Math.cos(angle),
      y: y + r * Math.sin(angle),
    });
  }
  return coords;
}
