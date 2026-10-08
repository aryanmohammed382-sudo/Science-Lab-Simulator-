// Small shared helpers used by every layer of the simulator.
// This file deliberately imports nothing so the physics/chemistry core can be
// unit-tested in plain Node without a browser or three.js.

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const sum = (arr) => arr.reduce((a, b) => a + b, 0);
export const round = (v, dp = 2) => {
  const f = Math.pow(10, dp);
  return Math.round(v * f + Number.EPSILON * Math.sign(v)) / f;
};
export const sigFig = (v, n = 3) => {
  if (!isFinite(v)) return String(v);
  if (v === 0) return '0';
  const digits = Math.ceil(Math.log10(Math.abs(v)));
  const dp = clamp(n - digits, 0, 12);
  return v.toFixed(dp);
};

/** Parse '#rrggbb' into a normalised {r,g,b} triplet. */
export function hexToRgb(hex) {
  if (Array.isArray(hex)) return { r: hex[0], g: hex[1], b: hex[2] };
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}
export function rgbToHex({ r, g, b }) {
  const c = (v) => clamp(Math.round(v * 255), 0, 255).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}
export function mixRgb(a, b, t) {
  return { r: lerp(a.r, b.r, t), g: lerp(a.g, b.g, t), b: lerp(a.b, b.b, t) };
}

/**
 * Beer-Lambert style combination of dissolved species colours.
 * Each entry contributes an optical density; transmittances multiply so that
 * blue + yellow gives green, and everything eventually goes dark when very
 * concentrated (as in a real solution).
 */
export function combineColours(entries) {
  let tr = 1, tg = 1, tb = 1, any = false;
  for (const e of entries) {
    if (!e || !e.colour) continue;
    const c = hexToRgb(e.colour);
    const od = clamp((e.weight ?? 1) * (e.strength ?? 1), 0, 8);
    if (od <= 0) continue;
    any = true;
    // Absorbance is strongest in the channel that is *not* transmitted.
    tr *= Math.exp(-(1 - c.r) * od);
    tg *= Math.exp(-(1 - c.g) * od);
    tb *= Math.exp(-(1 - c.b) * od);
  }
  if (!any) return { r: 1, g: 1, b: 1 };
  // A floor on transmittance keeps very concentrated solutions deeply coloured
  // instead of turning black.
  const FLOOR = 0.075;
  return { r: Math.max(tr, FLOOR), g: Math.max(tg, FLOOR), b: Math.max(tb, FLOOR) };
}

/** Deterministic pseudo-random generator (mulberry32) so sessions replay. */
export function makeRng(seed = 1) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function deepClone(v) {
  return typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v));
}

export function formatVolume(mL) {
  if (Math.abs(mL) >= 1000) return `${round(mL / 1000, 3)} L`;
  return `${round(mL, mL < 10 ? 2 : 1)} mL`;
}
export function formatMass(g) {
  if (Math.abs(g) >= 1000) return `${round(g / 1000, 4)} kg`;
  if (Math.abs(g) < 0.01 && g !== 0) return `${round(g * 1000, 2)} mg`;
  return `${round(g, g < 1 ? 3 : 2)} g`;
}
