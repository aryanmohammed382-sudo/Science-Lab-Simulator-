// ---------------------------------------------------------------------------
// Shared materials.  Keeping them in one place means the whole laboratory
// shares a consistent look and only a handful of programmes are compiled.
// ---------------------------------------------------------------------------
import * as THREE from 'three';

const cache = new Map();
const memo = (key, make) => {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key);
};

export const MAT = {
  glass: () => memo('glass', () => new THREE.MeshPhysicalMaterial({
    color: 0xdfefff, metalness: 0, roughness: 0.04, transmission: 0.92, thickness: 0.4,
    transparent: true, opacity: 0.36, ior: 1.5, side: THREE.DoubleSide, depthWrite: false,
    clearcoat: 1, clearcoatRoughness: 0.05
  })),
  glassThick: () => memo('glassThick', () => new THREE.MeshPhysicalMaterial({
    color: 0xcfe4f5, metalness: 0, roughness: 0.1, transmission: 0.85, thickness: 0.8,
    transparent: true, opacity: 0.5, ior: 1.52, side: THREE.DoubleSide, depthWrite: false
  })),
  glassFrosted: () => memo('glassFrosted', () => new THREE.MeshStandardMaterial({
    color: 0xf2f7fb, roughness: 0.75, metalness: 0, transparent: true, opacity: 0.85
  })),
  metal: () => memo('metal', () => new THREE.MeshStandardMaterial({ color: 0xb9c0c7, roughness: 0.32, metalness: 0.85 })),
  darkMetal: () => memo('darkMetal', () => new THREE.MeshStandardMaterial({ color: 0x4a4f55, roughness: 0.45, metalness: 0.8 })),
  steel: () => memo('steel', () => new THREE.MeshStandardMaterial({ color: 0x8d939a, roughness: 0.28, metalness: 0.9 })),
  brass: () => memo('brass', () => new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.35, metalness: 0.85 })),
  copper: () => memo('copper', () => new THREE.MeshStandardMaterial({ color: 0xb87333, roughness: 0.35, metalness: 0.9 })),
  rubber: () => memo('rubber', () => new THREE.MeshStandardMaterial({ color: 0x2f3235, roughness: 0.9 })),
  redRubber: () => memo('redRubber', () => new THREE.MeshStandardMaterial({ color: 0xa33328, roughness: 0.85 })),
  plasticWhite: () => memo('plasticWhite', () => new THREE.MeshStandardMaterial({ color: 0xeceff2, roughness: 0.55 })),
  plasticGrey: () => memo('plasticGrey', () => new THREE.MeshStandardMaterial({ color: 0x8a9096, roughness: 0.6 })),
  plasticBlack: () => memo('plasticBlack', () => new THREE.MeshStandardMaterial({ color: 0x24272a, roughness: 0.55 })),
  wood: () => memo('wood', () => new THREE.MeshStandardMaterial({ color: 0x8a6039, roughness: 0.72 })),
  ceramic: () => memo('ceramic', () => new THREE.MeshStandardMaterial({ color: 0xf3f1ea, roughness: 0.4 })),
  ceramicFibre: () => memo('ceramicFibre', () => new THREE.MeshStandardMaterial({ color: 0xcfc9b6, roughness: 0.95 })),
  ceramicHot: () => memo('ceramicHot', () => new THREE.MeshStandardMaterial({ color: 0x6a6560, roughness: 0.9 })),
  benchTop: () => memo('benchTop', () => new THREE.MeshStandardMaterial({ color: 0x2f3a3f, roughness: 0.42, metalness: 0.05 })),
  cabinet: () => memo('cabinet', () => new THREE.MeshStandardMaterial({ color: 0xd7dade, roughness: 0.35 })),
  floor: () => memo('floor', () => new THREE.MeshStandardMaterial({ color: 0xb9b6ae, roughness: 0.85 })),
  wall: () => memo('wall', () => new THREE.MeshStandardMaterial({ color: 0xe8ecef, roughness: 0.9 })),
  water: () => memo('water', () => new THREE.MeshPhysicalMaterial({
    color: 0xcfe9ff, transparent: true, opacity: 0.62, roughness: 0.08, metalness: 0,
    transmission: 0.7, thickness: 0.3, ior: 1.33, depthWrite: false
  })),
  flame: () => memo('flame', () => new THREE.MeshBasicMaterial({
    color: 0x8fd0ff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false
  })),
  glow: () => memo('glow', () => new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })),
  screen: () => memo('screen', () => new THREE.MeshStandardMaterial({ color: 0x0d1a18, emissive: 0x1e6f5c, emissiveIntensity: 0.7, roughness: 0.35 })),
  paper: () => memo('paper', () => new THREE.MeshStandardMaterial({ color: 0xfdfcf6, roughness: 0.9, side: THREE.DoubleSide })),
  cloth: () => memo('cloth', () => new THREE.MeshStandardMaterial({ color: 0xf4f6f8, roughness: 0.95 })),
  ironFilings: () => memo('ironFilings', () => new THREE.MeshStandardMaterial({ color: 0x4b4d52, roughness: 0.8 })),
  magnetNorth: () => memo('magnetNorth', () => new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.4 })),
  magnetSouth: () => memo('magnetSouth', () => new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.4 })),
  liquid: (hex, opacity = 0.75) => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(hex || '#cfe9ff'), transparent: true, opacity, roughness: 0.12,
    metalness: 0, transmission: 0.55, thickness: 0.5, ior: 1.34, depthWrite: false
  }),
  solidLiquid: (hex) => new THREE.MeshStandardMaterial({ color: new THREE.Color(hex || '#e8e8e8'), roughness: 0.8 })
};

/** Graduation marks and labels, drawn once into a canvas texture. */
export function makeGraduationTexture(opts = {}) {
  const { max = 50, major = 10, minor = 2, height = 512, unit = 'cm3', downwards = false, width = 256 } = opts;
  // Headless environments (unit tests) have no canvas: return null and let
  // callers skip the decoration instead of failing the whole build.
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(30,40,50,0.85)';
  ctx.fillStyle = 'rgba(20,30,40,0.9)';
  ctx.font = '18px system-ui, sans-serif';
  ctx.lineWidth = 2;
  const steps = minor > 0 ? Math.round(max / minor) : Math.round(max / Math.max(major, 1));
  for (let i = 0; i <= steps; i++) {
    const value = minor > 0 ? i * minor : i * major;
    const t = value / max;
    const y = downwards ? t * (height - 40) + 20 : height - 20 - t * (height - 40);
    const isMajor = Math.abs(value % major) < 1e-6;
    const len = isMajor ? width * 0.42 : width * 0.24;
    ctx.beginPath();
    ctx.lineWidth = isMajor ? 3 : 1.5;
    ctx.moveTo(width - len - 8, y);
    ctx.lineTo(width - 8, y);
    ctx.stroke();
    if (isMajor) {
      ctx.fillText(String(Math.round(value * 100) / 100), 8, y + 6);
    }
  }
  if (unit) { ctx.font = 'bold 20px system-ui, sans-serif'; ctx.fillText(unit, 8, height - 6); }
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/** A label texture for reagent bottles and equipment. */
export function makeLabelTexture(lines, opts = {}) {
  const w = opts.width || 256, h = opts.height || 128;
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = opts.background || '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = opts.border || '#9aa4ad';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, w - 4, h - 4);
  ctx.fillStyle = opts.ink || '#1c2b36';
  const arr = Array.isArray(lines) ? lines : [lines];
  arr.forEach((line, i) => {
    ctx.font = `${i === 0 ? 'bold ' : ''}${opts.size || 26}px system-ui, sans-serif`;
    ctx.fillText(line, 12, 40 + i * 34);
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

export function disposeMaterials() { for (const m of cache.values()) m.dispose?.(); cache.clear(); }
