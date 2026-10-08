// ---------------------------------------------------------------------------
// PROCEDURAL APPARATUS GEOMETRY
// ---------------------------------------------------------------------------
// Every item in the catalogue is built from real dimensions rather than loaded
// from a model file.  Scene units are centimetres (1 unit = 1 cm).
//
// A vessel is a stack of conical frusta (segments) measured from the inside
// floor upwards.  That one representation gives the glass shell, the
// volume -> liquid-height mapping, the tilt angle at which pouring starts and
// the liquid mesh itself.
// ---------------------------------------------------------------------------
import * as THREE from 'three';
import { MAT, makeGraduationTexture } from './materials.js';

export const mm = (v) => v / 10;   // catalogue dimensions are in millimetres
export const BUILDERS = {};

// --------------------------------------------------------------- cavity maths
export function makeCavity(segments) {
  const segs = segments.map((s) => ({
    h: s.h,
    r0: Math.max(s.r0, 0.02),
    r1: Math.max(s.r1, 0.02),
    y0: 0
  }));
  let y = 0;
  for (const s of segs) {
    s.y0 = y;
    s.volume = (Math.PI * s.h / 3) * (s.r0 * s.r0 + s.r0 * s.r1 + s.r1 * s.r1);
    y += s.h;
  }
  const total = segs.reduce((a, s) => a + s.volume, 0);
  const top = y;
  const rAt = (yy) => {
    for (const s of segs) {
      if (yy <= s.y0 + s.h + 1e-9) {
        const t = Math.max(0, Math.min(1, (yy - s.y0) / s.h));
        return s.r0 + (s.r1 - s.r0) * t;
      }
    }
    return segs.length ? segs[segs.length - 1].r1 : 0;
  };
  return {
    segments: segs,
    volumeCm3: total,
    height: top,
    rAt,
    volumeAt(yy) {
      let v = 0;
      for (const s of segs) {
        if (yy <= s.y0) break;
        const t = Math.min(1, (yy - s.y0) / s.h);
        const hh = t * s.h;
        const rr = s.r0 + (s.r1 - s.r0) * t;
        v += (Math.PI * hh / 3) * (s.r0 * s.r0 + s.r0 * rr + rr * rr);
        if (t < 1) break;
      }
      return v;
    },
    heightForVolume(v) {
      if (v <= 0) return 0;
      if (v >= total) return top;
      let acc = 0;
      for (const s of segs) {
        if (acc + s.volume < v) { acc += s.volume; continue; }
        let lo = 0, hi = s.h;
        for (let i = 0; i < 40; i++) {
          const mid = (lo + hi) / 2;
          const rr = s.r0 + (s.r1 - s.r0) * (mid / s.h);
          const vol = (Math.PI * mid / 3) * (s.r0 * s.r0 + s.r0 * rr + rr * rr);
          if (acc + vol < v) lo = mid; else hi = mid;
        }
        return s.y0 + (lo + hi) / 2;
      }
      return top;
    }
  };
}

/** Area of a circle of radius r on the far side of the chord x = xc. */
function areaRightOfChord(r, xc) {
  const t = Math.max(-1, Math.min(1, xc / r));
  const segment = r * r * (Math.PI / 2 + Math.asin(t) + t * Math.sqrt(Math.max(1 - t * t, 0)));
  return Math.PI * r * r - segment;
}

/**
 * Volume of liquid that stays in a vessel tipped by `tilt` radians.
 *
 * The liquid surface is horizontal, so in the vessel's own frame the surface is
 * a plane tilted by the same angle through the lip.  Integrating the part of
 * each horizontal slice that lies below that plane gives the volume that can
 * no longer reach the lip - which is why a beaker tipped further empties more,
 * and why some liquid always stays behind.
 */
export function retainedVolume(cavity, tilt, opts = {}) {
  const t = Math.abs(tilt);
  const H = cavity.height;
  const lipR = Math.max(opts.lipRadius ?? cavity.rAt(H), 0.05);
  if (t < 1e-4) return cavity.volumeCm3;
  const tan = Math.tan(Math.min(t, 1.5));
  const N = 60;
  const dy = H / N;
  let v = 0;
  for (let i = 0; i < N; i++) {
    const y = (i + 0.5) * dy;
    const r = Math.max(cavity.rAt(y), 0.02);
    const xc = lipR + (y - H) / tan;
    v += areaRightOfChord(r, xc) * dy;
  }
  return v;
}

/** Tilt (degrees) at which `volumeCm3` starts to pour over the lip. */
export function pourAngleFor(cavity, volumeCm3, opts = {}) {
  const V = Math.max(volumeCm3, 1e-6);
  let lo = 0.005, hi = 1.45;
  if (retainedVolume(cavity, hi, opts) > V) return 90;
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    if (retainedVolume(cavity, mid, opts) > V) lo = mid; else hi = mid;
  }
  return ((lo + hi) / 2) / (Math.PI / 180);
}

/** Volume that pours out of a vessel tipped by `tilt` degrees (0 if none can). */
export function pourableVolume(cavity, volumeCm3, tiltDegrees, opts = {}) {
  const kept = retainedVolume(cavity, (tiltDegrees * Math.PI) / 180, opts);
  return Math.max(0, volumeCm3 - kept);
}

// ---------------------------------------------------------------- primitives
export function makeMesh(geometry, material, name = '') {
  const m = new THREE.Mesh(geometry, material);
  m.name = name;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function vesselShell(cavity, opts = {}) {
  const { wall = 0.16, base = 0.22, mat = MAT.glass(), open = true } = opts;
  const g = new THREE.Group();
  const outer = [];
  for (const s of cavity.segments) {
    outer.push({ y: s.y0, r: s.r0 + wall });
    outer.push({ y: s.y0 + s.h, r: s.r1 + wall });
  }
  if (base > 0) {
    const bottom = makeMesh(new THREE.CylinderGeometry(outer[0].r, outer[0].r, base, 32), mat, 'base');
    bottom.position.y = base / 2;
    g.add(bottom);
  }
  const lathe = (points, name) => {
    const pts = points.map((p) => new THREE.Vector2(Math.max(p.r, 0.02), p.y));
    if (!open) pts.push(new THREE.Vector2(0.02, points[points.length - 1].y));
    return makeMesh(new THREE.LatheGeometry(pts, 40), mat, name);
  };
  g.add(lathe(outer, 'outer'));
  g.add(lathe(cavity.segments.map((s) => ({ y: s.y0, r: s.r0 })).concat([{ y: cavity.height, r: cavity.segments[cavity.segments.length - 1].r1 }]), 'inner'));
  return g;
}

function graduations(cavity, spec, opts = {}) {
  const fromY = opts.fromY ?? 0.25;
  const height = Math.max(cavity.height - fromY, 1);
  const tex = makeGraduationTexture(spec);
  if (!tex) return new THREE.Group();
  const geo = new THREE.CylinderGeometry(1, 1, 1, 36, 1, true);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide, opacity: 0.8 });
  const m = new THREE.Mesh(geo, mat);
  const r = (cavity.rAt(cavity.height) + cavity.rAt(0)) / 2 + (opts.offset ?? 0.03);
  m.scale.set(r, height / 2, r);
  m.position.y = fromY + height / 2;
  m.name = 'graduations';
  m.raycast = () => {};   // never block picking
  return m;
}

/** Liquid body for a fill height: revolved cavity profile plus a flat cap. */
export function buildLiquidGeometry(cavity, fillHeight, radial = 28, samples = 14) {
  const h = Math.max(fillHeight, 0.002);
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const y = (i / samples) * h;
    pts.push(new THREE.Vector2(Math.max(cavity.rAt(y) - 0.04, 0.03), y));
  }
  pts.push(new THREE.Vector2(0.03, h));
  return new THREE.LatheGeometry(pts, radial);
}

/** Attach cavity / lip information that the simulation layer needs. */
function finishVessel(group, cavity, opts = {}) {
  const lip = cavity.segments[cavity.segments.length - 1];
  group.userData.cavity = cavity;
  group.userData.mouthRadius = opts.mouthRadius ?? lip.r1;
  group.userData.lipRadius = lip.r1;
  group.userData.pourPoint = opts.pourPoint || new THREE.Vector3(lip.r1, cavity.height, 0);
  group.userData.ports = group.userData.ports || [];
  return group;
}

// ------------------------------------------------------------------ builders
BUILDERS.beaker = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const cavity = makeCavity([{ h: H * 0.93, r0: R * 0.97, r1: R }]);
  g.add(vesselShell(cavity, { wall: 0.14, base: 0.22 }));
  if (def.graduations) g.add(graduations(cavity, def.graduations));
  const spout = makeMesh(new THREE.ConeGeometry(R * 0.4, R * 0.9, 12), MAT.glass(), 'spout');
  spout.rotation.z = -Math.PI / 2.3;
  spout.position.set(R * 0.98, cavity.height - 0.25, 0);
  spout.scale.y = 0.5;
  spout.raycast = () => {};
  g.add(spout);
  return finishVessel(g, cavity, { pourPoint: new THREE.Vector3(R * 1.5, cavity.height - 0.4, 0), mouthRadius: R });
};

BUILDERS.conicalFlask = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const neckR = mm(def.neckMm || 20) / 2;
  const bodyH = H * 0.62, neckH = H * 0.33;
  const shoulderR = Math.max(neckR * 1.15, R * 0.3);
  const g = new THREE.Group();
  const cavity = makeCavity([
    { h: bodyH, r0: R * 0.98, r1: shoulderR },
    { h: neckH, r0: shoulderR, r1: neckR }
  ]);
  g.add(vesselShell(cavity, { wall: 0.13, base: 0.2 }));
  if (def.graduations) g.add(graduations(cavity, def.graduations));
  return finishVessel(g, cavity, { mouthRadius: neckR });
};

BUILDERS.volumetricFlask = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const neckR = mm(def.neckMm || 16) / 2;
  const g = new THREE.Group();
  const cavity = makeCavity([
    { h: H * 0.2, r0: R * 0.5, r1: R * 0.95 },
    { h: H * 0.2, r0: R * 0.95, r1: R * 0.6 },
    { h: H * 0.55, r0: neckR * 1.15, r1: neckR }
  ]);
  g.add(vesselShell(cavity, { wall: 0.12, base: 0.22 }));
  const ring = makeMesh(new THREE.TorusGeometry(neckR * 1.25, 0.1, 6, 20), MAT.glass(), 'calibrationMark');
  ring.rotation.x = Math.PI / 2;
  ring.position.y = cavity.height - H * 0.06;
  ring.raycast = () => {};
  g.add(ring);
  return finishVessel(g, cavity, { mouthRadius: neckR });
};

BUILDERS.roundBottomFlask = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const neckR = mm(def.neckMm || 20) / 2;
  // Spherical bulb of radius Rb sitting on its base, then the neck.  The bulb
  // is sliced into frusta so the volume -> height maths stays exact.
  const bulbH = H - (def.neckH ?? H * 0.3);
  const Rb = Math.min(R, bulbH / 2);
  const cy = Rb;                       // centre of the sphere above the base
  const n = 10;
  const segs = [];
  const radAt = (y) => Math.max(Math.sqrt(Math.max(Rb * Rb - (y - cy) * (y - cy), 0)) * 1.0, 0.25);
  for (let i = 0; i < n; i++) {
    const y0 = (i / n) * bulbH, y1 = ((i + 1) / n) * bulbH;
    segs.push({ h: bulbH / n, r0: radAt(y0), r1: radAt(y1) });
  }
  segs.push({ h: H - bulbH, r0: neckR * 1.35, r1: neckR });
  const g = new THREE.Group();
  const cavity = makeCavity(segs);
  g.add(vesselShell(cavity, { wall: 0.12, base: 0 }));
  return finishVessel(g, cavity, { mouthRadius: neckR });
};

BUILDERS.flatBottomFlask = BUILDERS.roundBottomFlask;
BUILDERS.filterFlask = (def) => {
  const g = BUILDERS.roundBottomFlask(def);
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const port = makeMesh(new THREE.CylinderGeometry(0.5, 0.5, R * 1.4, 12), MAT.glass(), 'sidearm');
  port.rotation.z = Math.PI / 2.6;
  port.position.set(R * 0.95, H * 0.55, 0);
  g.add(port);
  g.userData.ports.push({ id: 'sidearm', kind: 'joint', position: 'side', local: port.position.clone() });
  return g;
};

BUILDERS.distillationFlask = (def) => {
  const g = BUILDERS.roundBottomFlask(def);
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const arm = makeMesh(new THREE.CylinderGeometry(0.38, 0.45, R * 1.8, 14), MAT.glass(), 'sidearm');
  arm.rotation.z = Math.PI / 3.4;
  arm.position.set(R * 0.9, H * 0.76, 0);
  g.add(arm);
  g.userData.ports.push({ id: 'sidearm', kind: 'joint', position: 'side', local: arm.position.clone() });
  return g;
};

const tubeBuilder = () => (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const cavity = makeCavity([
    { h: H * 0.14, r0: 0.06, r1: R },
    { h: H * 0.84, r0: R, r1: R }
  ]);
  g.add(vesselShell(cavity, { wall: 0.09, base: 0 }));
  if (def.graduations) g.add(graduations(cavity, def.graduations, { offset: 0.02 }));
  return finishVessel(g, cavity);
};
BUILDERS.testTube = tubeBuilder();
BUILDERS.boilingTube = tubeBuilder();

BUILDERS.measuringCylinder = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const cavity = makeCavity([
    { h: 0.3, r0: 0.06, r1: R * 0.95 },
    { h: H * 0.91, r0: R * 0.95, r1: R }
  ]);
  g.add(vesselShell(cavity, { wall: 0.1, base: 0.16 }));
  const foot = makeMesh(new THREE.CylinderGeometry(R * 1.5, R * 1.6, 0.32, 28), MAT.glass(), 'foot');
  foot.position.y = 0.16;
  g.add(foot);
  if (def.graduations) g.add(graduations(cavity, def.graduations, { offset: 0.04 }));
  const spout = makeMesh(new THREE.ConeGeometry(R * 0.45, R * 1.1, 12), MAT.glass(), 'spout');
  spout.rotation.z = -Math.PI / 2.4;
  spout.position.set(R * 1.05, cavity.height - 0.1, 0);
  spout.scale.y = 0.5;
  g.add(spout);
  return finishVessel(g, cavity, { pourPoint: new THREE.Vector3(R * 1.6, cavity.height - 0.25, 0) });
};

BUILDERS.burette = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const tubeH = H * 0.8;
  const g = new THREE.Group();
  const cavity = makeCavity([
    { h: 0.6, r0: 0.06, r1: R },
    { h: tubeH, r0: R, r1: R }
  ]);
  g.add(vesselShell(cavity, { wall: 0.1, base: 0.15, open: false }));
  if (def.graduations) g.add(graduations(cavity, { ...def.graduations, downwards: true }, { offset: 0.05, fromY: 0.6 }));
  const tap = new THREE.Group();
  tap.name = 'buretteTap';
  const barrel = makeMesh(new THREE.CylinderGeometry(R * 1.7, R * 1.7, 1.1, 18), MAT.glassThick(), 'barrel');
  barrel.rotation.z = Math.PI / 2;
  const handle = makeMesh(new THREE.BoxGeometry(3.4, 0.4, 0.9), MAT.plasticWhite(), 'handle');
  const tip = makeMesh(new THREE.CylinderGeometry(R * 0.3, R * 0.16, 2.6, 10), MAT.glass(), 'tip');
  tip.position.y = -1.9;
  tap.add(barrel, handle, tip);
  tap.position.y = cavity.height;
  g.add(tap);
  g.userData.tap = tap;
  g.userData.tapOpen = false;
  return finishVessel(g, cavity, { pourPoint: new THREE.Vector3(0, cavity.height - 4.6, 0), mouthRadius: 0.4 });
};

const pipetteBuilder = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const cavity = makeCavity([
    { h: H * 0.45, r0: R, r1: R },
    { h: H * 0.12, r0: R * 2.8, r1: R * 2.6 },
    { h: H * 0.3, r0: R * 0.7, r1: R * 0.5 },
    { h: H * 0.1, r0: R * 0.4, r1: R * 0.2 }
  ]);
  g.add(vesselShell(cavity, { wall: 0.07, base: 0, open: false }));
  const mark = makeMesh(new THREE.TorusGeometry(Math.max(R, 0.5) * 0.9, 0.05, 6, 18), MAT.plasticGrey(), 'mark');
  mark.rotation.x = Math.PI / 2;
  mark.position.y = cavity.height * 0.78;
  mark.raycast = () => {};
  g.add(mark);
  const f = finishVessel(g, cavity, { pourPoint: new THREE.Vector3(0, 0.5, 0), mouthRadius: 0.35 });
  f.userData.fixedVolumeCm3 = def.fixedVolume || def.capacityML;
  f.userData.pipette = true;
  return f;
};
BUILDERS.pipette = pipetteBuilder;
BUILDERS.graduatedPipette = pipetteBuilder;
BUILDERS.pasteurPipette = pipetteBuilder;
BUILDERS.micropipette = (def) => {
  const H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const body = makeMesh(new THREE.CapsuleGeometry(1.1, H * 0.5, 8, 14), MAT.plasticGrey(), 'body');
  body.position.y = H * 0.4;
  const tip = makeMesh(new THREE.ConeGeometry(0.5, 4.5, 10), MAT.plasticWhite(), 'tip');
  tip.rotation.x = Math.PI;
  tip.position.y = H * 0.1;
  g.add(body, tip);
  g.userData.fixedVolumeCm3 = 0.2;
  g.userData.pipette = true;
  g.userData.pourPoint = new THREE.Vector3(0, 0.1, 0);
  return g;
};

// ------------------------------------------------------------------- bottles
const bottleBuilder = (kind) => (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const bodyH = H * 0.62, neckH = H * 0.22, capH = H * 0.13;
  const neckR = kind === 'droppingBottle' ? R * 0.3 : R * 0.36;
  const g = new THREE.Group();
  const cavity = makeCavity([
    { h: bodyH * 0.25, r0: R * 0.85, r1: R },
    { h: bodyH * 0.75, r0: R, r1: R * 0.9 },
    { h: neckH, r0: R * 0.6, r1: neckR }
  ]);
  g.add(vesselShell(cavity, { wall: 0.16, base: 0.3 }));
  const cap = makeMesh(new THREE.CylinderGeometry(neckR * 1.4, neckR * 1.4, capH, 20), kind === 'droppingBottle' ? MAT.plasticWhite() : MAT.plasticGrey(), 'cap');
  cap.position.y = cavity.height + capH / 2;
  g.add(cap);
  if (kind === 'droppingBottle') {
    const pip = makeMesh(new THREE.CylinderGeometry(0.14, 0.08, H * 0.42, 8), MAT.glass(), 'dropper');
    pip.position.y = cavity.height - H * 0.2;
    g.add(pip);
  }
  const f = finishVessel(g, cavity, { mouthRadius: neckR, pourPoint: new THREE.Vector3(neckR * 1.6, cavity.height, 0) });
  f.userData.cap = cap;
  f.userData.hasCap = true;
  f.userData.bottle = true;
  return f;
};
BUILDERS.reagentBottle = bottleBuilder('reagentBottle');
BUILDERS.droppingBottle = bottleBuilder('droppingBottle');
BUILDERS.washBottle = (def) => {
  const g = bottleBuilder('reagentBottle')(def);
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const tube = makeMesh(new THREE.CylinderGeometry(0.13, 0.13, H * 0.55, 8), MAT.plasticWhite(), 'tube');
  tube.rotation.z = 0.32;
  tube.position.set(-R * 0.45, H * 0.8, 0);
  const nozzle = makeMesh(new THREE.CylinderGeometry(0.1, 0.06, 2.6, 8), MAT.plasticWhite(), 'nozzle');
  nozzle.position.set(-R * 1.4, H * 0.95, 0);
  nozzle.rotation.z = -0.6;
  g.add(tube, nozzle);
  g.userData.washBottle = true;
  return g;
};
BUILDERS.sprayBottle = BUILDERS.washBottle;

// -------------------------------------------------------------- shallow glass
BUILDERS.watchGlass = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = Math.max(mm(def.dims.heightMm), 0.5);
  const g = new THREE.Group();
  const cavity = makeCavity([{ h: H * 0.6, r0: R * 0.25, r1: R * 0.95 }]);
  g.add(vesselShell(cavity, { wall: 0.07, base: 0.1 }));
  return finishVessel(g, cavity);
};
BUILDERS.evaporatingBasin = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const cavity = makeCavity([{ h: H, r0: R * 0.3, r1: R }]);
  g.add(vesselShell(cavity, { wall: 0.14, base: 0.2 }));
  const spout = makeMesh(new THREE.ConeGeometry(R * 0.35, R * 0.8, 10), MAT.glass(), 'spout');
  spout.rotation.z = -Math.PI / 2.3;
  spout.position.set(R * 0.95, H - 0.3, 0);
  g.add(spout);
  return finishVessel(g, cavity, { pourPoint: new THREE.Vector3(R * 1.3, H - 0.5, 0) });
};
BUILDERS.crystallisingDish = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const cavity = makeCavity([
    { h: H * 0.25, r0: R * 0.7, r1: R * 0.92 },
    { h: H * 0.75, r0: R * 0.92, r1: R }
  ]);
  g.add(vesselShell(cavity, { wall: 0.14, base: 0.22 }));
  const lid = makeMesh(new THREE.CylinderGeometry(R * 1.06, R * 1.06, 0.18, 32), MAT.glass(), 'lid');
  lid.position.y = H + 0.2;
  g.add(lid);
  const f = finishVessel(g, cavity);
  f.userData.lid = lid;
  return f;
};
BUILDERS.separatingFunnel = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const cavity = makeCavity([
    { h: H * 0.1, r0: R * 0.7, r1: R },
    { h: H * 0.42, r0: R, r1: R * 0.5 },
    { h: H * 0.2, r0: R * 0.45, r1: R * 0.25 },
    { h: H * 0.14, r0: 0.3, r1: 0.26 }
  ]);
  g.add(vesselShell(cavity, { wall: 0.12, base: 0.15, open: false }));
  const stopper = makeMesh(new THREE.CylinderGeometry(R * 0.36, R * 0.32, 1.4, 14), MAT.glassFrosted(), 'stopper');
  stopper.position.y = cavity.height + 0.8;
  g.add(stopper);
  const tap = new THREE.Group();
  tap.name = 'funnelTap';
  const barrel = makeMesh(new THREE.CylinderGeometry(0.75, 0.75, 1.0, 14), MAT.glassThick(), 'barrel');
  barrel.rotation.z = Math.PI / 2;
  const handle = makeMesh(new THREE.BoxGeometry(2.6, 0.4, 0.8), MAT.plasticWhite(), 'handle');
  const spout = makeMesh(new THREE.CylinderGeometry(0.3, 0.18, 1.8, 10), MAT.glass(), 'spout');
  spout.position.y = -1.4;
  tap.add(barrel, handle, spout);
  tap.position.y = cavity.height - H * 0.16;
  g.add(tap);
  const f = finishVessel(g, cavity, { pourPoint: new THREE.Vector3(0, cavity.height - H * 0.16 - 2.4, 0), mouthRadius: 0.4 });
  f.userData.tap = tap;
  f.userData.hasStopper = true;
  f.userData.layers = true;
  return f;
};
BUILDERS.gasJar = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const cavity = makeCavity([{ h: H * 0.94, r0: R, r1: R }]);
  g.add(vesselShell(cavity, { wall: 0.15, base: 0.3, open: false }));
  return finishVessel(g, cavity);
};
BUILDERS.gasJarLid = (def) => {
  const R = mm(def.dims.diameterMm) / 2;
  const g = new THREE.Group();
  g.add(makeMesh(new THREE.CylinderGeometry(R, R, 0.16, 28), MAT.glass(), 'plate'));
  return g;
};
BUILDERS.lid = BUILDERS.gasJarLid;
BUILDERS.deliveryTube = (def) => {
  const H = mm(def.dims.heightMm);
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, H * 0.3, 0), new THREE.Vector3(0, H * 0.72, 0),
    new THREE.Vector3(0, H * 0.88, 0.8), new THREE.Vector3(0, H * 0.8, 2.2),
    new THREE.Vector3(0, H * 0.45, 2.4)
  ]);
  const g = new THREE.Group();
  g.add(makeMesh(new THREE.TubeGeometry(curve, 40, 0.32, 10, false), MAT.glass(), 'tube'));
  g.userData.ports = [
    { id: 'in', kind: 'joint', position: 'bottom', local: new THREE.Vector3(0, H * 0.3, 0) },
    { id: 'out', kind: 'outlet', position: 'bottom', local: new THREE.Vector3(0, H * 0.45, 2.4) }
  ];
  return g;
};
BUILDERS.liebigCondenser = (def) => {
  const H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const inner = makeMesh(new THREE.CylinderGeometry(0.45, 0.45, H, 18, 1, true), MAT.glass(), 'innerTube');
  inner.position.y = H / 2;
  const jacket = makeMesh(new THREE.CylinderGeometry(1.5, 1.5, H * 0.72, 22, 1, true), MAT.glass(), 'jacket');
  jacket.position.y = H / 2;
  const inlet = makeMesh(new THREE.CylinderGeometry(0.28, 0.28, 2.4, 10), MAT.glass(), 'waterInlet');
  inlet.rotation.z = -Math.PI / 2;
  inlet.position.set(1.5, H * 0.15, 0);
  const outlet = makeMesh(new THREE.CylinderGeometry(0.28, 0.28, 2.4, 10), MAT.glass(), 'waterOutlet');
  outlet.rotation.z = -Math.PI / 2;
  outlet.position.set(1.5, H * 0.85, 0);
  g.add(inner, jacket, inlet, outlet);
  g.userData.ports = [
    { id: 'inlet', kind: 'waterIn', position: 'side', local: inlet.position.clone() },
    { id: 'outlet', kind: 'waterOut', position: 'side', local: outlet.position.clone() }
  ];
  g.userData.condenser = true;
  return g;
};
BUILDERS.fractionatingColumn = (def) => {
  const H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const tube = makeMesh(new THREE.CylinderGeometry(1.1, 1.1, H, 20, 1, true), MAT.glass(), 'column');
  tube.position.y = H / 2;
  g.add(tube);
  for (let i = 0; i < 7; i++) {
    const bead = makeMesh(new THREE.SphereGeometry(0.85, 12, 8), MAT.glassFrosted(), 'bead');
    bead.position.y = H * (0.12 + i * 0.11);
    bead.scale.y = 0.45;
    g.add(bead);
  }
  return g;
};
BUILDERS.funnel = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const cone = makeMesh(new THREE.ConeGeometry(R, H * 0.62, 28, 1, true), MAT.glass(), 'cone');
  cone.rotation.x = Math.PI;
  cone.position.y = H * 0.31;
  const stem = makeMesh(new THREE.CylinderGeometry(0.4, 0.32, H * 0.55, 14, 1, true), MAT.glass(), 'stem');
  stem.position.y = H * 0.2 - H * 0.28;
  g.add(cone, stem);
  g.userData.filterRim = R;
  g.userData.filterTop = H * 0.62;
  return g;
};
BUILDERS.filterPaper = (def) => {
  const R = mm(def.dims.diameterMm) / 2;
  const g = new THREE.Group();
  const flat = makeMesh(new THREE.CircleGeometry(R, 24), MAT.paper(), 'flat');
  flat.rotation.x = -Math.PI / 2;
  g.add(flat);
  const cone = makeMesh(new THREE.ConeGeometry(R, R * 0.85, 24, 1, true), MAT.paper(), 'folded');
  cone.rotation.x = Math.PI;
  cone.position.y = R * 0.42;
  cone.visible = false;
  g.add(cone);
  g.userData.folded = false;
  return g;
};
BUILDERS.glassRod = (def) => {
  const H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const rod = makeMesh(new THREE.CylinderGeometry(0.3, 0.3, H, 12), MAT.glass(), 'rod');
  rod.rotation.z = Math.PI / 2;
  g.add(rod);
  return g;
};
BUILDERS.stirringRod = BUILDERS.glassRod;
BUILDERS.capillaryTube = (def) => {
  const H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const t = makeMesh(new THREE.CylinderGeometry(0.15, 0.15, H, 8), MAT.glass(), 'tube');
  t.rotation.z = Math.PI / 2;
  g.add(t);
  return g;
};
BUILDERS.chromatographyPaper = (def) => {
  const W = mm(def.dims.diameterMm), H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const sheet = makeMesh(new THREE.PlaneGeometry(W, H), MAT.paper(), 'sheet');
  sheet.rotation.y = Math.PI / 2;
  sheet.position.y = H / 2;
  g.add(sheet);
  const line = makeMesh(new THREE.PlaneGeometry(W, 0.2), new THREE.MeshBasicMaterial({ color: '#8a8f95' }), 'pencilLine');
  line.rotation.y = Math.PI / 2;
  line.position.set(0, H * 0.12, 0);
  g.add(line);
  return g;
};
BUILDERS.paper = (def) => {
  const W = mm(def.dims.diameterMm), H = mm(def.dims.heightMm);
  const m = makeMesh(new THREE.PlaneGeometry(W, H), MAT.paper(), 'paper');
  m.rotation.x = -Math.PI / 2;
  const g = new THREE.Group();
  g.add(m);
  return g;
};
BUILDERS.filterPaper2 = BUILDERS.paper;
BUILDERS.thermometer = (def) => {
  const H = mm(def.dims.heightMm), R = Math.max(mm(def.dims.diameterMm) / 2, 0.28);
  const g = new THREE.Group();
  const stem = makeMesh(new THREE.CylinderGeometry(R, R, H, 14), MAT.glass(), 'stem');
  stem.position.y = H / 2;
  const bulb = makeMesh(new THREE.SphereGeometry(R * 1.7, 14, 12), MAT.glass(), 'bulb');
  bulb.position.y = R * 0.7;
  const mercury = makeMesh(new THREE.CylinderGeometry(R * 0.34, R * 0.34, 1, 8), new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.3 }), 'mercuryColumn');
  g.add(stem, bulb, mercury);
  const tex = makeGraduationTexture({ max: 110, major: 10, minor: 2, unit: 'C' });
  const label = new THREE.Mesh(new THREE.PlaneGeometry(R * 1.8, H * 0.86), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  label.position.set(R * 1.03, H * 0.5, 0);
  label.rotation.y = Math.PI / 2;
  label.raycast = () => {};
  g.add(label);
  g.userData.mercury = mercury;
  g.userData.stemHeight = H;
  g.userData.probe = { kind: 'temperature', depth: H };
  return g;
};
BUILDERS.temperatureProbe = (def) => {
  const H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const handle = makeMesh(new THREE.BoxGeometry(2.6, 3.4, 1.4), MAT.plasticBlack(), 'handle');
  handle.position.y = H - 2;
  const probe = makeMesh(new THREE.CylinderGeometry(0.22, 0.18, H - 3.4, 10), MAT.steel(), 'probe');
  probe.position.y = (H - 3.4) / 2;
  const screen = makeMesh(new THREE.PlaneGeometry(1.8, 1.0), MAT.screen(), 'screen');
  screen.position.set(0, H - 1.7, 0.72);
  screen.raycast = () => {};
  g.add(handle, probe, screen);
  g.userData.probe = { kind: 'temperature', depth: H - 3.4 };
  return g;
};
BUILDERS.crucible = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const cavity = makeCavity([{ h: H * 0.88, r0: R * 0.72, r1: R }]);
  g.add(vesselShell(cavity, { wall: 0.22, base: 0.32, mat: MAT.ceramic() }));
  const lid = makeMesh(new THREE.CylinderGeometry(R * 0.8, R * 0.84, 0.3, 24), MAT.ceramic(), 'lid');
  lid.position.y = cavity.height + 0.15;
  g.add(lid);
  return finishVessel(g, cavity);
};
BUILDERS.mortarPestle = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const cavity = makeCavity([{ h: H * 0.7, r0: R * 0.55, r1: R }]);
  g.add(vesselShell(cavity, { wall: 0.42, base: 0.5, mat: MAT.ceramic() }));
  const pestle = makeMesh(new THREE.CapsuleGeometry(R * 0.2, H * 0.55, 8, 12), MAT.ceramic(), 'pestle');
  pestle.position.set(R * 0.45, H * 0.8, 0);
  g.add(pestle);
  return finishVessel(g, cavity);
};
BUILDERS.weighingBoat = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const cavity = makeCavity([{ h: H, r0: R * 0.65, r1: R }]);
  g.add(vesselShell(cavity, { wall: 0.08, base: 0.15, mat: MAT.plasticWhite() }));
  g.userData.light = true;
  return finishVessel(g, cavity);
};
BUILDERS.polystyreneCup = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const cavity = makeCavity([{ h: H * 0.92, r0: R * 0.7, r1: R }]);
  g.add(vesselShell(cavity, { wall: 0.25, base: 0.35, mat: MAT.ceramicFibre() }));
  const lid = makeMesh(new THREE.CylinderGeometry(R + 0.2, R + 0.2, 0.25, 24), MAT.ceramicFibre(), 'lid');
  lid.position.y = cavity.height + 1.2;
  g.add(lid);
  const f = finishVessel(g, cavity);
  f.userData.lid = lid;
  f.userData.insulated = 0.9;
  return f;
};

// ------------------------------------------------------------------- support
BUILDERS.retortStand = (def) => {
  const H = mm(def.dims.heightMm), R = mm(def.dims.diameterMm) / 2;
  const g = new THREE.Group();
  const base = makeMesh(new THREE.BoxGeometry(R * 2, 1.6, R * 1.6), MAT.darkMetal(), 'base');
  base.position.y = 0.8;
  const rod = makeMesh(new THREE.CylinderGeometry(0.6, 0.6, H, 16), MAT.steel(), 'rod');
  rod.position.set(-R * 0.55, H / 2, 0);
  g.add(base, rod);
  g.userData.rod = { x: -R * 0.55, height: H, radius: 0.6 };
  return g;
};
BUILDERS.bossHead = (def) => {
  const g = new THREE.Group();
  g.add(makeMesh(new THREE.BoxGeometry(2.8, 1.8, 1.8), MAT.darkMetal(), 'body'));
  return g;
};
BUILDERS.clamp = (def) => {
  const g = new THREE.Group();
  const arm = makeMesh(new THREE.CylinderGeometry(0.35, 0.35, 13, 10), MAT.steel(), 'arm');
  arm.rotation.z = Math.PI / 2;
  arm.position.x = 6.5;
  const jawA = makeMesh(new THREE.BoxGeometry(0.7, 3.6, 3.4), MAT.steel(), 'jawA');
  jawA.position.x = 12.6;
  const jawB = makeMesh(new THREE.BoxGeometry(0.7, 3.6, 3.4), MAT.steel(), 'jawB');
  jawB.position.x = 14.4;
  g.add(arm, jawA, jawB);
  g.userData.grip = new THREE.Vector3(13.5, 0, 0);
  g.userData.clamp = true;
  return g;
};
BUILDERS.tripod = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const ring = makeMesh(new THREE.TorusGeometry(R, 0.3, 8, 26), MAT.steel(), 'ring');
  ring.rotation.x = Math.PI / 2;
  ring.position.y = H;
  g.add(ring);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    const leg = makeMesh(new THREE.CylinderGeometry(0.25, 0.25, H * 1.08, 8), MAT.steel(), 'leg');
    leg.position.set(Math.cos(a) * R * 0.88, H / 2, Math.sin(a) * R * 0.88);
    leg.rotation.z = Math.cos(a) * 0.13;
    leg.rotation.x = -Math.sin(a) * 0.13;
    g.add(leg);
  }
  g.userData.top = { y: H, radius: R };
  return g;
};
BUILDERS.gauze = (def) => {
  const R = mm(def.dims.diameterMm) / 2;
  const g = new THREE.Group();
  const plate = makeMesh(new THREE.BoxGeometry(R * 2, 0.18, R * 1.65), MAT.steel(), 'plate');
  plate.position.y = 0.09;
  const centre = makeMesh(new THREE.CylinderGeometry(R * 0.55, R * 0.55, 0.24, 20), MAT.ceramicFibre(), 'ceramic');
  centre.position.y = 0.13;
  g.add(plate, centre);
  return g;
};
BUILDERS.heatProofMat = (def) => {
  const R = mm(def.dims.diameterMm) / 2;
  const g = new THREE.Group();
  const m = makeMesh(new THREE.BoxGeometry(R * 2, 0.3, R * 1.7), MAT.ceramicFibre(), 'mat');
  m.position.y = 0.15;
  g.add(m);
  return g;
};
BUILDERS.testTubeRack = (def) => {
  const W = mm(def.dims.diameterMm), H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const base = makeMesh(new THREE.BoxGeometry(W, 1.4, W * 0.45), MAT.wood(), 'base');
  base.position.y = 0.7;
  const back = makeMesh(new THREE.BoxGeometry(W, H, 1.0), MAT.wood(), 'back');
  back.position.set(0, H / 2, -W * 0.2);
  g.add(base, back);
  for (let i = 0; i < 6; i++) {
    const x = -W / 2 + W * (i + 0.5) / 6;
    const hole = makeMesh(new THREE.CylinderGeometry(1.35, 1.35, 1.5, 14, 1, true), MAT.wood(), 'hole');
    hole.position.set(x, H * 0.72, W * 0.03);
    g.add(hole);
  }
  g.userData.slots = [];
  for (let i = 0; i < 6; i++) {
    const x = -W / 2 + W * (i + 0.5) / 6;
    g.userData.slots.push(new THREE.Vector3(x, H * 0.72, W * 0.03));
  }
  return g;
};
BUILDERS.pipeClayTriangle = () => {
  const g = new THREE.Group();
  const ring = makeMesh(new THREE.TorusGeometry(3, 0.2, 6, 20), MAT.ceramicFibre(), 'ring');
  ring.rotation.x = Math.PI / 2;
  g.add(ring);
  return g;
};
const tool = (head) => (def) => {
  const H = mm(def.dims.heightMm) || 20;
  const g = new THREE.Group();
  const handle = makeMesh(new THREE.CylinderGeometry(0.36, 0.3, H * 0.65, 10), MAT.plasticGrey(), 'handle');
  handle.rotation.z = Math.PI / 2;
  handle.position.x = -H * 0.33;
  g.add(handle);
  const h = head(H);
  h.position.x = H * 0.22;
  g.add(h);
  return g;
};
BUILDERS.spatula = tool((H) => {
  const g = new THREE.Group();
  const blade = makeMesh(new THREE.BoxGeometry(2.8, 0.2, 1.3), MAT.steel(), 'blade');
  const shaft = makeMesh(new THREE.CylinderGeometry(0.13, 0.13, H * 0.45, 8), MAT.steel(), 'shaft');
  shaft.rotation.z = Math.PI / 2;
  shaft.position.x = -H * 0.16;
  g.add(blade, shaft);
  return g;
});
BUILDERS.forceps = tool(() => makeMesh(new THREE.BoxGeometry(3.6, 0.35, 0.6), MAT.steel(), 'jaw'));
BUILDERS.tongs = tool(() => makeMesh(new THREE.BoxGeometry(3.8, 0.6, 1.8), MAT.steel(), 'jaw'));
BUILDERS.mountedNeedle = tool(() => makeMesh(new THREE.ConeGeometry(0.14, 3.2, 8), MAT.steel(), 'needle'));
BUILDERS.nichromeWire = (def) => {
  const H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const wire = makeMesh(new THREE.CylinderGeometry(0.09, 0.09, H, 8), MAT.steel(), 'wire');
  wire.rotation.z = Math.PI / 2;
  const loop = makeMesh(new THREE.TorusGeometry(0.4, 0.08, 6, 14), MAT.steel(), 'loop');
  loop.position.x = H / 2;
  g.add(wire, loop);
  return g;
};
BUILDERS.string = (def) => {
  const g = new THREE.Group();
  const reel = makeMesh(new THREE.CylinderGeometry(2, 2, 3, 14), MAT.plasticGrey(), 'reel');
  reel.rotation.z = Math.PI / 2;
  g.add(reel);
  g.userData.string = true;
  return g;
};
BUILDERS.metreRulePivot = (def) => {
  const g = new THREE.Group();
  const rule = makeMesh(new THREE.BoxGeometry(100, 0.4, 3), MAT.wood(), 'rule');
  rule.position.y = 12;
  const pivot = makeMesh(new THREE.ConeGeometry(2.4, 6, 12), MAT.steel(), 'pivot');
  pivot.position.y = 9;
  const base = makeMesh(new THREE.BoxGeometry(14, 1.2, 14), MAT.wood(), 'base');
  base.position.y = 0.6;
  g.add(rule, pivot, base);
  g.userData.rulePivot = new THREE.Vector3(0, 12, 0);
  g.userData.ruleLength = 100;
  return g;
};
BUILDERS.ruler = (def) => {
  const H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const rule = makeMesh(new THREE.BoxGeometry(H, 0.3, 2.4), MAT.wood(), 'rule');
  g.add(rule);
  const tex = makeGraduationTexture({ max: 100, major: 10, minor: 1, unit: 'cm', width: 64, height: 1024 });
  const marks = new THREE.Mesh(new THREE.PlaneGeometry(H, 2.4), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  marks.rotation.x = -Math.PI / 2;
  marks.position.y = 0.17;
  marks.raycast = () => {};
  g.add(marks);
  g.userData.lengthCm = H;
  return g;
};
BUILDERS.protractor = (def) => {
  const R = mm(def.dims.diameterMm) / 2;
  const g = new THREE.Group();
  const semi = makeMesh(new THREE.CircleGeometry(R, 32, 0, Math.PI), MAT.glass(), 'body');
  semi.rotation.x = -Math.PI / 2;
  g.add(semi);
  return g;
};
BUILDERS.booklet = BUILDERS.ruler;
BUILDERS.cuttingBoard = (def) => {
  const R = mm(def.dims.diameterMm) / 2;
  const g = new THREE.Group();
  const b = makeMesh(new THREE.BoxGeometry(R * 2, 1.6, R * 1.4), MAT.plasticWhite(), 'board');
  b.position.y = 0.8;
  g.add(b);
  return g;
};
BUILDERS.bung = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const b = makeMesh(new THREE.CylinderGeometry(R * 0.7, R, H, 16), MAT.rubber(), 'bung');
  b.position.y = H / 2;
  g.add(b);
  const hole = makeMesh(new THREE.CylinderGeometry(R * 0.22, R * 0.22, H * 1.1, 10), new THREE.MeshBasicMaterial({ color: 0x101010 }), 'hole');
  hole.position.y = H / 2;
  hole.raycast = () => {};
  g.add(hole);
  g.userData.seals = true;
  g.userData.holeDiameter = R * 0.44;
  return g;
};
BUILDERS.stopper = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const b = makeMesh(new THREE.CylinderGeometry(R, R * 0.8, H, 16), MAT.rubber(), 'stopper');
  b.position.y = H / 2;
  g.add(b);
  g.userData.seals = true;
  return g;
};
BUILDERS.cork = BUILDERS.stopper;

// ------------------------------------------------------------------ heating
BUILDERS.bunsenBurner = (def) => {
  const g = new THREE.Group();
  const base = makeMesh(new THREE.CylinderGeometry(4.5, 5, 1.4, 24), MAT.darkMetal(), 'base');
  base.position.y = 0.7;
  const barrel = makeMesh(new THREE.CylinderGeometry(0.75, 0.9, 11, 18), MAT.brass(), 'barrel');
  barrel.position.y = 6.4;
  const collar = makeMesh(new THREE.CylinderGeometry(1.15, 1.15, 2.2, 18), MAT.darkMetal(), 'collar');
  collar.position.y = 3.4;
  collar.name = 'airCollar';
  const inlet = makeMesh(new THREE.CylinderGeometry(0.45, 0.45, 3.2, 12), MAT.brass(), 'gasInlet');
  inlet.rotation.z = Math.PI / 2;
  inlet.position.set(-2.2, 2.0, 0);
  const flame = new THREE.Group();
  flame.name = 'flame';
  const inner = makeMesh(new THREE.ConeGeometry(0.75, 5.5, 16), new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false }), 'flameInner');
  inner.position.y = 2.75;
  const outer = makeMesh(new THREE.ConeGeometry(1.5, 8.5, 18), new THREE.MeshBasicMaterial({ color: 0x5aa9ff, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false }), 'flameOuter');
  outer.position.y = 4.25;
  flame.add(inner, outer);
  flame.position.y = 11.5;
  flame.visible = false;
  flame.traverse((o) => { o.raycast = () => {}; });
  g.add(base, barrel, collar, inlet, flame);
  g.userData.flame = flame;
  g.userData.heatSource = true;
  g.userData.airHole = 0.5;           // 0 = closed (yellow safety flame), 1 = fully open (roaring blue)
  g.userData.ports = [{ id: 'gasIn', kind: 'gasInlet', position: 'side', local: inlet.position.clone() }];
  g.userData.flameAnchor = new THREE.Vector3(0, 11.5, 0);
  return g;
};
BUILDERS.spiritBurner = (def) => {
  const g = new THREE.Group();
  const body = makeMesh(new THREE.CylinderGeometry(3.4, 3.6, 6.5, 20), MAT.glassThick(), 'body');
  body.position.y = 3.25;
  const wick = makeMesh(new THREE.CylinderGeometry(0.5, 0.5, 1.6, 10), MAT.cloth(), 'wick');
  wick.position.y = 7.2;
  const flame = new THREE.Group();
  flame.name = 'flame';
  const f = makeMesh(new THREE.ConeGeometry(0.9, 4.5, 14), new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }), 'spiritFlame');
  f.position.y = 2.2;
  flame.add(f);
  flame.position.y = 7.8;
  flame.visible = false;
  flame.traverse((o) => { o.raycast = () => {}; });
  g.add(body, wick, flame);
  g.userData.flame = flame;
  g.userData.heatSource = true;
  g.userData.fuel = 100;
  g.userData.powerW = 120;
  g.userData.flameAnchor = new THREE.Vector3(0, 9.5, 0);
  return g;
};
BUILDERS.hotPlate = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const body = makeMesh(new THREE.BoxGeometry(R * 2, H, R * 1.7), MAT.plasticWhite(), 'body');
  body.position.y = H / 2;
  const top = makeMesh(new THREE.CylinderGeometry(R * 0.8, R * 0.8, 0.4, 28), MAT.ceramicHot(), 'plate');
  top.position.y = H + 0.2;
  top.name = 'plateSurface';
  const knob = makeMesh(new THREE.CylinderGeometry(0.8, 0.8, 0.7, 16), MAT.plasticBlack(), 'knob');
  knob.rotation.x = Math.PI / 2;
  knob.position.set(0, H * 0.4, R * 0.85);
  g.add(body, top, knob);
  g.userData.heatSource = true;
  g.userData.powerW = 200;
  g.userData.contactPlate = { radius: R * 0.8, y: H + 0.4 };
  g.userData.setting = 0;  // 0..1
  return g;
};
BUILDERS.heatingMantle = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const body = makeMesh(new THREE.CylinderGeometry(R, R, H, 24, 1, true), MAT.ceramicFibre(), 'body');
  body.position.y = H / 2;
  const cradle = makeMesh(new THREE.SphereGeometry(R * 0.85, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), MAT.ceramicFibre(), 'cradle');
  cradle.position.y = H;
  g.add(body, cradle);
  g.userData.heatSource = true;
  g.userData.powerW = 150;
  g.userData.holdsAt = new THREE.Vector3(0, H, 0);
  return g;
};
BUILDERS.waterBath = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const cavity = makeCavity([{ h: H * 0.8, r0: R * 0.9, r1: R }]);
  g.add(vesselShell(cavity, { wall: 0.5, base: 0.7, mat: MAT.steel() }));
  const rim = makeMesh(new THREE.TorusGeometry(R + 0.5, 0.4, 8, 28), MAT.steel(), 'rim');
  rim.rotation.x = Math.PI / 2;
  rim.position.y = cavity.height;
  g.add(rim);
  const f = finishVessel(g, cavity);
  f.userData.heatSource = true;
  f.userData.powerW = 180;
  f.userData.waterBath = true;
  f.userData.holdsApparatus = true;
  return f;
};
BUILDERS.iceBath = (def) => {
  const g = BUILDERS.waterBath(def);
  g.userData.cooling = true;
  g.userData.heatSource = false;
  return g;
};
BUILDERS.kettle = BUILDERS.waterBath;
BUILDERS.draughtShield = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const wallGeo = new THREE.CylinderGeometry(R, R, H, 24, 1, true, 0, Math.PI * 1.5);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xd8dde2, metalness: 0.7, roughness: 0.4, side: THREE.DoubleSide });
  const wall = makeMesh(wallGeo, wallMat, 'shield');
  wall.position.y = H / 2;
  g.add(wall);
  g.userData.shield = true;
  return g;
};
BUILDERS.lagging = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const wrap = makeMesh(new THREE.CylinderGeometry(R, R, H, 20, 1, true), new THREE.MeshStandardMaterial({ color: 0xdfe7ef, roughness: 0.95, side: THREE.DoubleSide }), 'lagging');
  wrap.position.y = H / 2;
  g.add(wrap);
  g.userData.lagging = true;
  return g;
};
BUILDERS.immersedHeater = (def) => {
  const H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const sheath = makeMesh(new THREE.CylinderGeometry(0.5, 0.5, H * 0.6, 12), MAT.steel(), 'sheath');
  sheath.position.y = H * 0.3;
  const head = makeMesh(new THREE.CylinderGeometry(1.2, 1.2, 3, 16), MAT.plasticBlack(), 'head');
  head.position.y = H * 0.78;
  g.add(sheath, head);
  g.userData.heatSource = true;
  g.userData.powerW = 6;
  g.userData.electrical = true;
  return g;
};
BUILDERS.immersionHeater = BUILDERS.immersedHeater;

// -------------------------------------------------------------- measurement
const instrumentBody = (w, h, d, extra = {}) => {
  const g = new THREE.Group();
  const body = makeMesh(new THREE.BoxGeometry(w, h, d), extra.mat || MAT.plasticWhite(), 'body');
  body.position.y = h / 2;
  g.add(body);
  const screen = makeMesh(new THREE.PlaneGeometry(w * 0.62, h * 0.32), new THREE.MeshStandardMaterial({ color: 0x0b1f14, emissive: 0x1d7a4b, emissiveIntensity: 0.9, roughness: 0.3 }), 'screen');
  screen.position.set(0, h * 0.66, d / 2 + 0.02);
  screen.name = 'display';
  g.add(screen);
  g.userData.panel = new THREE.Vector3(0, h * 0.64, d / 2);
  g.userData.screenMesh = screen;
  return g;
};
BUILDERS.digitalBalance = (def) => {
  const R = mm(def.dims.diameterMm) / 2;
  const g = instrumentBody(R * 2.4, 4.4, R * 1.7);
  const pan = makeMesh(new THREE.CylinderGeometry(R, R * 0.95, 0.5, 24), MAT.steel(), 'pan');
  pan.position.y = 4.7;
  pan.name = 'weighPan';
  g.add(pan);
  g.userData.capacityG = 200;
  g.userData.resolutionG = 0.001;
  g.userData.instrument = 'balance';
  return g;
};
BUILDERS.mechanicalBalance = (def) => {
  const g = new THREE.Group();
  const base = makeMesh(new THREE.BoxGeometry(26, 2, 12), MAT.wood(), 'base');
  base.position.y = 1;
  const beam = makeMesh(new THREE.BoxGeometry(22, 0.5, 1.2), MAT.brass(), 'beam');
  beam.position.y = 20;
  beam.name = 'beam';
  const pillar = makeMesh(new THREE.CylinderGeometry(0.6, 0.9, 18, 12), MAT.brass(), 'pillar');
  pillar.position.y = 10;
  const panA = makeMesh(new THREE.CylinderGeometry(4.5, 4.5, 0.35, 22), MAT.brass(), 'panLeft');
  panA.position.set(-10, 17, 0);
  const panB = makeMesh(new THREE.CylinderGeometry(4.5, 4.5, 0.35, 22), MAT.brass(), 'panRight');
  panB.position.set(10, 17, 0);
  g.add(base, beam, pillar, panA, panB);
  g.userData.beam = beam;
  g.userData.pans = [panA, panB];
  g.userData.resolutionG = 0.01;
  g.userData.instrument = 'balance';
  return g;
};
BUILDERS.topPanBalance = BUILDERS.mechanicalBalance;
BUILDERS.vernierCaliper = (def) => {
  const H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const main = makeMesh(new THREE.BoxGeometry(H, 0.5, 1.6), MAT.steel(), 'main');
  const jawFixed = makeMesh(new THREE.BoxGeometry(1.2, 3.4, 1.6), MAT.steel(), 'jawFixed');
  jawFixed.position.x = -H / 2;
  const slider = makeMesh(new THREE.BoxGeometry(6, 2.6, 1.6), MAT.steel(), 'slider');
  slider.position.x = -H / 2 + 12;
  slider.name = 'slider';
  const jawMove = makeMesh(new THREE.BoxGeometry(1.2, 3.4, 1.6), MAT.steel(), 'jawMove');
  jawMove.position.set(-H / 2 + 9, 0, 0);
  slider.add(jawMove);
  g.add(main, jawFixed, slider);
  g.userData.slider = slider;
  g.userData.resolutionMm = 0.02;
  g.userData.rangeMm = 150;
  return g;
};
BUILDERS.micrometer = (def) => {
  const g = new THREE.Group();
  const frame = makeMesh(new THREE.TorusGeometry(4, 0.7, 8, 20, Math.PI), MAT.steel(), 'frame');
  const thimble = makeMesh(new THREE.CylinderGeometry(1.1, 1.1, 5, 18), MAT.steel(), 'thimble');
  thimble.rotation.z = Math.PI / 2;
  thimble.position.x = 6;
  g.add(frame, thimble);
  g.userData.resolutionMm = 0.01;
  g.userData.instrument = 'length';
  return g;
};
BUILDERS.thermometer = (def) => {
  const H = mm(def.dims.heightMm), R = mm(def.dims.diameterMm) / 2;
  const g = new THREE.Group();
  const stem = makeMesh(new THREE.CylinderGeometry(R * 0.55, R * 0.55, H * 0.82, 14), MAT.glass(), 'stem');
  stem.position.y = H * 0.41;
  const bulb = makeMesh(new THREE.SphereGeometry(R, 16, 12), MAT.glassThick(), 'bulb');
  bulb.position.y = R * 0.6;
  const tex = makeGraduationTexture({ max: 110, min: -10, major: 10, minor: 1, unit: '°C', vertical: false, width: 1024, height: 64 });
  const marks = new THREE.Mesh(new THREE.PlaneGeometry(H * 0.8, R * 1.1), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  marks.position.set(0, H * 0.41, R * 0.62);
  marks.raycast = () => {};
  marks.name = 'scale';
  const red = makeMesh(new THREE.CylinderGeometry(R * 0.2, R * 0.2, H * 0.8, 8), new THREE.MeshBasicMaterial({ color: 0xd0203a }), 'column');
  red.position.y = H * 0.4;
  red.name = 'mercuryColumn';
  red.raycast = () => {};
  g.add(stem, bulb, red, marks);
  g.userData.column = red;
  g.userData.scale = { minC: -10, maxC: 110, y0: H * 0.02, y1: H * 0.81 };
  g.userData.instrument = 'temperature';
  return g;
};
const dialGauge = (label, face) => (def) => {
  const H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const case_ = makeMesh(new THREE.CylinderGeometry(H * 0.24, H * 0.24, 4, 26), MAT.steel(), 'case');
  case_.position.y = H * 0.5;
  const faceMesh = makeMesh(new THREE.CircleGeometry(H * 0.2, 28), new THREE.MeshStandardMaterial({ color: 0xf5f7f4, roughness: 0.6 }), 'face');
  faceMesh.rotation.y = Math.PI / 2;
  faceMesh.position.set(2.02, H * 0.5, 0);
  faceMesh.name = 'dialFace';
  const needle = makeMesh(new THREE.BoxGeometry(0.3, H * 0.17, 0.4), new THREE.MeshStandardMaterial({ color: 0xcc2222 }), 'needle');
  needle.position.set(2.3, H * 0.5 + H * 0.02, 0);
  needle.name = 'needle';
  const stem = makeMesh(new THREE.CylinderGeometry(0.7, 0.7, 3, 12), MAT.steel(), 'stem');
  stem.position.y = 1.5;
  const knob = makeMesh(new THREE.CylinderGeometry(0.9, 0.9, 1.4, 14), MAT.plasticBlack(), 'adjust');
  knob.position.y = H * 0.5 + H * 0.26;
  g.add(case_, faceMesh, needle, stem, knob);
  g.userData.needle = needle;
  g.userData.face = face;
  g.userData.instrument = label;
  return g;
};
BUILDERS.pressureGauge = dialGauge('pressure', 'pressure');
BUILDERS.vacuumGauge = dialGauge('pressure', 'vacuum');
BUILDERS.manometer = (def) => {
  const g = new THREE.Group();
  const tube = makeMesh(new THREE.TorusGeometry(6, 0.9, 8, 30, Math.PI), MAT.glass(), 'tube');
  tube.rotation.z = Math.PI;
  tube.position.y = 10;
  const back = makeMesh(new THREE.BoxGeometry(14, 12, 0.4), MAT.plasticWhite(), 'back');
  back.position.set(0, 8, -1);
  const tex = makeGraduationTexture({ max: 100, min: 0, major: 20, minor: 5, unit: 'mm', width: 32, height: 512, vertical: true });
  const marks = new THREE.Mesh(new THREE.PlaneGeometry(3, 12), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  marks.position.set(0, 8, 0.1);
  marks.raycast = () => {};
  g.add(back, tube, marks);
  g.userData.instrument = 'pressure';
  return g;
};
BUILDERS.timer = (def) => {
  const g = instrumentBody(7, 5, 3.4);
  return g;
};
BUILDERS.stopwatch = (def) => {
  const g = dialGauge('time', 'time')(def);
  return g;
};
BUILDERS.ammeter = (def) => {
  const g = instrumentBody(7.5, 5.6, 3.6);
  g.userData.instrument = 'ammeter';
  g.userData.electrical = true;
  g.userData.terminals = 2;
  return g;
};
BUILDERS.voltmeter = (def) => {
  const g = instrumentBody(7.5, 5.6, 3.6);
  g.userData.instrument = 'voltmeter';
  g.userData.electrical = true;
  g.userData.terminals = 2;
  return g;
};
BUILDERS.multimeter = (def) => {
  const g = instrumentBody(8, 12, 3.6);
  g.userData.instrument = 'multimeter';
  g.userData.electrical = true;
  g.userData.terminals = 3;
  return g;
};
BUILDERS.galvanometer = BUILDERS.ammeter;
BUILDERS.ohmmeter = BUILDERS.multimeter;
BUILDERS.oscilloscope = (def) => {
  const g = instrumentBody(34, 16, 22);
  g.userData.instrument = 'oscilloscope';
  g.userData.electrical = true;
  g.userData.terminals = 2;
  return g;
};
BUILDERS.signalGenerator = (def) => {
  const g = instrumentBody(24, 10, 20);
  g.userData.instrument = 'generator';
  g.userData.electrical = true;
  g.userData.terminals = 2;
  return g;
};
BUILDERS.datalogger = (def) => {
  const g = instrumentBody(14, 6, 10);
  g.userData.instrument = 'datalogger';
  g.userData.electrical = true;
  g.userData.sensorPorts = 4;
  return g;
};
BUILDERS.sensor = (def) => {
  const g = new THREE.Group();
  const probe = makeMesh(new THREE.CylinderGeometry(0.4, 0.4, 9, 10), MAT.steel(), 'probe');
  probe.position.y = 4.5;
  const head = makeMesh(new THREE.BoxGeometry(1.8, 2, 1.8), MAT.plasticBlack(), 'head');
  head.position.y = 10;
  g.add(probe, head);
  g.userData.instrument = 'sensor';
  g.userData.electrical = true;
  return g;
};
BUILDERS.thermocouple = BUILDERS.sensor;
BUILDERS.phMeter = (def) => {
  const g = instrumentBody(8, 14, 4);
  const holder = makeMesh(new THREE.CylinderGeometry(1, 1, 3, 12), MAT.plasticGrey(), 'holder');
  holder.position.set(3, 4, 0);
  g.add(holder);
  const probe = makeMesh(new THREE.CylinderGeometry(0.5, 0.5, 12, 10), MAT.glass(), 'probe');
  probe.position.set(3, -2, 0);
  g.add(probe);
  g.userData.instrument = 'ph';
  g.userData.resolution = 0.01;
  return g;
};
BUILDERS.colorimeter = (def) => {
  const g = instrumentBody(12, 14, 12);
  const slot = makeMesh(new THREE.CylinderGeometry(1.3, 1.3, 8, 16, 1, true), MAT.plasticBlack(), 'cuvetteSlot');
  slot.position.set(0, 12, 0);
  g.add(slot);
  g.userData.instrument = 'colorimeter';
  g.userData.optical = true;
  return g;
};
BUILDERS.spectrometer = (def) => {
  const g = instrumentBody(26, 16, 20);
  g.userData.instrument = 'spectrometer';
  g.userData.optical = true;
  return g;
};
BUILDERS.meltingPointApparatus = (def) => {
  const g = makeMesh(new THREE.BoxGeometry(12, 10, 14), MAT.steel(), 'block');
  g.position.y = 5;
  const holder = new THREE.Group();
  const cap = makeMesh(new THREE.CylinderGeometry(1.1, 1.1, 12, 16), MAT.steel(), 'heater');
  cap.position.y = 6;
  const view = makeMesh(new THREE.TorusGeometry(1.3, 0.3, 8, 20), MAT.darkMetal(), 'viewer');
  view.rotation.x = Math.PI / 2;
  view.position.y = 10;
  holder.add(cap, view);
  holder.position.x = 8;
  const g2 = new THREE.Group();
  g2.add(g, holder);
  g2.userData.heatSource = true;
  g2.userData.powerW = 60;
  g2.userData.instrument = 'meltingpoint';
  return g2;
};
BUILDERS.buretteStand = BUILDERS.retortStand;
BUILDERS.barometer = BUILDERS.manometer;
BUILDERS.hygrometer = BUILDERS.manometer;
BUILDERS.lightMeter = BUILDERS.colorimeter;
BUILDERS.soundMeter = BUILDERS.timer;

// --------------------------------------------------------------- electrical
const LEAD_STUB = () => {
  const g = new THREE.Group();
  for (const s of [-1, 1]) {
    const lead = makeMesh(new THREE.CylinderGeometry(0.09, 0.09, 3.2, 8), MAT.copper(), 'lead');
    lead.rotation.z = Math.PI / 2;
    lead.position.set(s * 2.6, 0, 0);
    g.add(lead);
  }
  return g;
};
/** Component mounted on a base board with two tappable terminals. */
export function componentBase(w, d, h, name) {
  const g = new THREE.Group();
  const board = makeMesh(new THREE.BoxGeometry(w, 0.5, d), MAT.wood(), 'board');
  board.position.y = 0.25;
  g.add(board);
  const t = new THREE.Group();
  t.name = 'terminals';
  t.position.y = 0.5 + h;
  for (const s of [-1, 1]) {
    const post = makeMesh(new THREE.CylinderGeometry(0.3, 0.3, 1.2, 10), MAT.brass(), 'post');
    post.position.set(s * w * 0.36, -h / 2 - 0.4, 0);
    t.add(post);
    const cup = makeMesh(new THREE.CylinderGeometry(0.75, 0.75, 0.5, 14), MAT.brass(), 'socket');
    cup.position.set(s * w * 0.36, -h / 2 + 0.25, 0);
    t.add(cup);
  }
  g.add(t);
  g.userData.terminalNodes = [
    new THREE.Vector3(-w * 0.36, 0.5 + h * 0.5, 0),
    new THREE.Vector3(w * 0.36, 0.5 + h * 0.5, 0)
  ];
  g.userData.elComponent = name;
  g.userData.electrical = true;
  return g;
}
BUILDERS.resistor = (def) => {
  const g = componentBase(9, 5, 4.6, 'resistor');
  const body = makeMesh(new THREE.CylinderGeometry(1, 1, 4.6, 16), MAT.ceramic(), 'body');
  body.rotation.z = Math.PI / 2;
  body.position.y = 0.5 + 2.3;
  const bands = new THREE.Group();
  const colours = def.bands || ['brown', 'black', 'red', 'gold'];
  const hex = { black: 0x111111, brown: 0x6b3f1d, red: 0xd02020, orange: 0xe07000, yellow: 0xe8d020, green: 0x1f8b3a, blue: 0x1f4fd0, violet: 0x7a2fa0, grey: 0x8a8a8a, white: 0xf2f2f2, gold: 0xC9A227, silver: 0xbfc4c7 };
  colours.forEach((c, i) => {
    const ring = makeMesh(new THREE.TorusGeometry(1.01, 0.24, 6, 16), new THREE.MeshStandardMaterial({ color: hex[c] ?? 0x888888, roughness: 0.5 }), 'band' + i);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(-1.5 + i * 1.05, 0.5 + 2.3, 0);
    bands.add(ring);
  });
  g.add(body, bands);
  g.userData.resistanceOhm = def.ohm ?? 100;
  return g;
};
BUILDERS.led = (def) => {
  const g = componentBase(7, 5, 4.4, 'led');
  const dome = makeMesh(new THREE.SphereGeometry(1.1, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: def.colourHex ?? 0xd02020, transparent: true, opacity: 0.85, emissive: def.colourHex ?? 0x220000, roughness: 0.25 }), 'dome');
  dome.position.y = 0.5 + 2.4;
  dome.name = 'ledBody';
  const base = makeMesh(new THREE.CylinderGeometry(1.1, 1.1, 1.6, 18), MAT.plasticWhite(), 'ledBase');
  base.position.y = 0.5 + 1.2;
  const light = new THREE.PointLight(def.colourHex ?? 0xff2222, 0, 12, 2);
  light.position.set(0, 0.5 + 2.6, 0);
  light.raycast = () => {};
  g.add(base, dome, light);
  g.userData.light = light;
  g.userData.ledBody = dome;
  g.userData.forwardV = def.forwardV ?? 2.0;
  return g;
};
BUILDERS.diode = (def) => {
  const g = componentBase(9, 5, 4.6, 'diode');
  const body = makeMesh(new THREE.CylinderGeometry(1.05, 1.05, 4.6, 16), MAT.plasticBlack(), 'body');
  body.rotation.z = Math.PI / 2;
  body.position.y = 0.5 + 2.3;
  const ring = makeMesh(new THREE.TorusGeometry(1.06, 0.22, 6, 16), MAT.steel(), 'cathodeBand');
  ring.rotation.y = Math.PI / 2;
  ring.position.set(-1.6, 0.5 + 2.3, 0);
  g.add(body, ring);
  return g;
};
BUILDERS.lamp = (def) => {
  const g = componentBase(10, 8, 6.4, 'lamp');
  const holder = makeMesh(new THREE.CylinderGeometry(1.4, 1.7, 1.4, 20), MAT.darkMetal(), 'holder');
  holder.position.y = 0.5 + 0.7;
  const bulb = makeMesh(new THREE.SphereGeometry(2.3, 20, 14), new THREE.MeshPhysicalMaterial({ color: 0xfff6d8, transparent: true, opacity: 0.35, roughness: 0.1, transmission: 0.55 }), 'bulb');
  bulb.position.y = 0.5 + 3.4;
  const filament = makeMesh(new THREE.CylinderGeometry(0.14, 0.14, 1.8, 8), new THREE.MeshBasicMaterial({ color: 0x553311 }), 'filament');
  filament.position.y = 0.5 + 3.2;
  filament.name = 'filament';
  const light = new THREE.PointLight(0xffe6b0, 0, 60, 2);
  light.position.set(0, 0.5 + 3.4, 0);
  light.raycast = () => {};
  g.add(holder, bulb, filament, light);
  g.userData.light = light;
  g.userData.filament = filament;
  g.userData.bulb = bulb;
  g.userData.specification = def.specification || '2.5 V, 0.3 A';
  g.userData.ratedV = def.ratedV ?? 2.5;
  g.userData.ratedA = def.ratedA ?? 0.3;
  return g;
};
BUILDERS.lampStand = (def) => {
  const g = new THREE.Group();
  const base = makeMesh(new THREE.CylinderGeometry(5, 5.4, 1, 24), MAT.darkMetal(), 'base');
  base.position.y = 0.5;
  const rod = makeMesh(new THREE.CylinderGeometry(0.5, 0.5, 24, 12), MAT.steel(), 'rod');
  rod.position.y = 12.5;
  const arm = makeMesh(new THREE.CylinderGeometry(0.4, 0.4, 8, 12), MAT.steel(), 'arm');
  arm.rotation.z = Math.PI / 2;
  arm.position.set(4, 24, 0);
  const shade = makeMesh(new THREE.ConeGeometry(4, 4.5, 22, 1, true), MAT.plasticWhite(), 'shade');
  shade.position.set(8, 23.4, 0);
  shade.rotation.z = -0.9;
  const bulb = makeMesh(new THREE.SphereGeometry(1.3, 14, 10), new THREE.MeshBasicMaterial({ color: 0xfff3d0 }), 'bulb');
  bulb.position.set(8, 21.6, 0);
  const light = new THREE.SpotLight(0xfff2dc, 60, 120, 0.7, 0.5, 2);
  light.position.set(8, 22, 0);
  light.target.position.set(8, 0, 0);
  light.raycast = () => {};
  light.castShadow = true;
  g.add(base, rod, arm, shade, bulb, light, light.target);
  g.userData.light = light;
  g.userData.lampStand = true;
  return g;
};
BUILDERS.cell = (def) => {
  const g = new THREE.Group();
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const can = makeMesh(new THREE.CylinderGeometry(R, R, H, 24), MAT.metal(), 'body');
  can.position.y = H / 2;
  const band = makeMesh(new THREE.CylinderGeometry(R * 1.01, R * 1.01, H * 0.3, 24), new THREE.MeshStandardMaterial({ color: 0x1e4d8c, roughness: 0.5 }), 'label');
  band.position.y = H * 0.5;
  const nub = makeMesh(new THREE.CylinderGeometry(R * 0.3, R * 0.3, 0.6, 14), MAT.steel(), 'positive');
  nub.position.y = H + 0.3;
  nub.name = 'positiveTerminal';
  const a = makeMesh(new THREE.CylinderGeometry(R * 0.96, R * 0.96, 0.3, 20), MAT.steel(), 'negative');
  a.position.y = -0.1;
  a.name = 'negativeTerminal';
  g.add(can, band, nub, a);
  g.userData.emf = def.emf ?? 1.5;
  g.userData.internalOhm = def.internalOhm ?? 0.5;
  g.userData.electrical = true;
  g.userData.terminalNodes = [new THREE.Vector3(0, -0.2, 0), new THREE.Vector3(0, H + 0.6, 0)];
  return g;
};
BUILDERS.battery9v = (def) => {
  const g = new THREE.Group();
  const body = makeMesh(new THREE.BoxGeometry(12, 6, 8), MAT.plasticBlack(), 'body');
  body.position.y = 3;
  const capA = makeMesh(new THREE.CylinderGeometry(0.8, 0.8, 0.6, 14), MAT.brass(), 'terminalPositive');
  capA.position.set(-2.6, 6.3, 0);
  const capB = makeMesh(new THREE.CylinderGeometry(0.8, 0.8, 0.6, 14), MAT.steel(), 'terminalNegative');
  capB.position.set(2.6, 6.3, 0);
  g.add(body, capA, capB);
  g.userData.emf = 9;
  g.userData.internalOhm = 1.5;
  g.userData.electrical = true;
  g.userData.terminalNodes = [new THREE.Vector3(-2.6, 6.6, 0), new THREE.Vector3(2.6, 6.6, 0)];
  return g;
};
BUILDERS.powerSupply = (def) => {
  const g = instrumentBody(22, 14, 16);
  const knobs = new THREE.Group();
  for (let i = 0; i < 2; i++) {
    const k = makeMesh(new THREE.CylinderGeometry(1.6, 1.6, 1, 18), MAT.plasticBlack(), 'knob' + i);
    k.rotation.x = Math.PI / 2;
    k.position.set(-5 + i * 10, 3, 8.2);
    knobs.add(k);
  }
  for (let i = 0; i < 4; i++) {
    const s = makeMesh(new THREE.CylinderGeometry(0.8, 0.8, 0.5, 14), i % 2 ? MAT.plasticBlack() : new THREE.MeshStandardMaterial({ color: 0xc0392b }), 'socket' + i);
    s.rotation.x = Math.PI / 2;
    s.position.set(-6 + i * 4, 10.5, 8.2);
    knobs.add(s);
  }
  const light = new THREE.PointLight(0xffddaa, 0, 20);
  light.position.set(0, 14, 0);
  light.raycast = () => {};
  g.add(knobs, light);
  g.userData.powerSupply = true;
  g.userData.electrical = true;
  g.userData.voltage = def.voltage ?? 6;
  g.userData.maxCurrent = 2;
  g.userData.light = light;
  return g;
};
BUILDERS.transformers = BUILDERS.powerSupply;
BUILDERS.transformer = (def) => {
  const g = new THREE.Group();
  const core = makeMesh(new THREE.BoxGeometry(10, 14, 6), MAT.ironFilings(), 'core');
  core.position.y = 7;
  const p = makeMesh(new THREE.CylinderGeometry(2, 2, 12, 18), MAT.copper(), 'primary');
  p.position.set(0, 7, 0);
  const s = makeMesh(new THREE.TorusGeometry(4.4, 1.5, 8, 20), MAT.copper(), 'secondary');
  s.rotation.x = Math.PI / 2;
  s.position.set(0, 7, 0);
  const terminals = [];
  for (let i = 0; i < 4; i++) {
    const t = makeMesh(new THREE.CylinderGeometry(0.5, 0.5, 1.2, 12), MAT.brass(), 't' + i);
    t.position.set(-4 + (i % 2) * 8, 14.6, i < 2 ? -2 : 2);
    terminals.push(t);
    g.add(t);
  }
  g.add(core, p, s);
  const link = new THREE.Group();
  link.position.y = 15.2;
  g.add(link);
  g.userData.terminalNodes = terminals.map((t) => t.position.clone().add(link.position));
  g.userData.electrical = true;
  g.userData.turnsRatio = def.ratio ?? 10;
  return g;
};
BUILDERS.switch = (def) => {
  const g = componentBase(10, 6, 2.6, 'switch');
  const lever = makeMesh(new THREE.BoxGeometry(5.6, 0.5, 1.3), MAT.brass(), 'lever');
  lever.position.y = 0.5 + 2.4;
  lever.rotation.z = def.closed ? 0 : -0.35;
  lever.name = 'lever';
  const pivot = makeMesh(new THREE.CylinderGeometry(0.5, 0.5, 1.4, 12), MAT.brass(), 'pivot');
  pivot.rotation.x = Math.PI / 2;
  pivot.position.set(-2.6, 0.5 + 2.2, 0);
  g.add(lever, pivot);
  g.userData.lever = lever;
  g.userData.closed = !!def.closed;
  return g;
};
BUILDERS.rheostat = (def) => {
  const g = componentBase(16, 7, 7, 'rheostat');
  const coil = makeMesh(new THREE.CylinderGeometry(2, 2, 11, 24), MAT.copper(), 'coil');
  coil.rotation.z = Math.PI / 2;
  coil.position.y = 0.5 + 3.5;
  const slider = makeMesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), MAT.brass(), 'slider');
  slider.position.set(def.position ?? 0, 0.5 + 7.2, 0);
  slider.name = 'slider';
  const bar = makeMesh(new THREE.CylinderGeometry(0.35, 0.35, 14, 10), MAT.steel(), 'bar');
  bar.rotation.z = Math.PI / 2;
  bar.position.y = 0.5 + 7.4;
  g.add(coil, slider, bar);
  g.userData.slider = slider;
  g.userData.maxOhm = def.maxOhm ?? 20;
  g.userData.trackWidth = 11;
  return g;
};
BUILDERS.potentiometer = BUILDERS.rheostat;
BUILDERS.thermistor = (def) => {
  const g = componentBase(8, 5, 4, 'thermistor');
  const bead = makeMesh(new THREE.SphereGeometry(1.2, 16, 12), new THREE.MeshStandardMaterial({ color: 0x2b2b30, roughness: 0.7 }), 'bead');
  bead.position.y = 0.5 + 2.2;
  g.add(bead);
  g.userData.baseOhm = def.baseOhm ?? 1000;
  g.userData.betaK = def.betaK ?? 3400;
  return g;
};
BUILDERS.capacitor = (def) => {
  const g = componentBase(9, 5, 5, 'capacitor');
  const can = makeMesh(new THREE.CylinderGeometry(1.3, 1.3, 4.4, 18), MAT.plasticBlack(), 'body');
  can.position.y = 0.5 + 2.4;
  const stripe = makeMesh(new THREE.BoxGeometry(0.5, 4.4, 0.1), new THREE.MeshStandardMaterial({ color: 0xbfc4c7 }), 'stripe');
  stripe.position.set(-1.0, 0.5 + 2.4, 1.32);
  g.add(can, stripe);
  g.add(LEAD_STUB());
  g.userData.farads = def.farads ?? 0.001;
  return g;
};
BUILDERS.motor = (def) => {
  const g = new THREE.Group();
  const body = makeMesh(new THREE.CylinderGeometry(3, 3, 8, 22), MAT.darkMetal(), 'body');
  body.rotation.z = Math.PI / 2;
  body.position.y = 5;
  const shaft = makeMesh(new THREE.CylinderGeometry(0.5, 0.5, 5, 12), MAT.steel(), 'shaft');
  shaft.rotation.z = Math.PI / 2;
  shaft.position.set(6.5, 5, 0);
  const disc = makeMesh(new THREE.CylinderGeometry(3.4, 3.4, 0.4, 24), MAT.plasticWhite(), 'disc');
  disc.rotation.z = Math.PI / 2;
  disc.position.set(8, 5, 0);
  disc.name = 'spinningDisc';
  const stand = makeMesh(new THREE.BoxGeometry(8, 1, 5), MAT.wood(), 'base');
  stand.position.y = 0.5;
  g.add(body, shaft, disc, stand);
  g.userData.electrical = true;
  g.userData.motor = true;
  g.userData.spinningDisc = disc;
  g.userData.terminalNodes = [new THREE.Vector3(0, 2, 0), new THREE.Vector3(0, 8, 0)];
  return g;
};
BUILDERS.functionGenerator = (def) => {
  const g = instrumentBody(24, 10, 20);
  g.userData.instrument = 'generator';
  g.userData.electrical = true;
  g.userData.terminals = 2;
  g.userData.ac = true;
  return g;
};
BUILDERS.wire = (def) => {
  const L = def.lengthCm || 30;
  const colour = def.colourHex ?? 0xc0392b;
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: colour, roughness: 0.6 });
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.2, 0),
    new THREE.Vector3(L * 0.25, 1.4, L * 0.15),
    new THREE.Vector3(L * 0.6, 0.5, -L * 0.2),
    new THREE.Vector3(L, 0.2, 0)
  ]);
  const tube = makeMesh(new THREE.TubeGeometry(curve, 40, 0.22, 10, false), mat, 'insulation');
  tube.name = 'wire';
  const tips = new THREE.Group();
  for (const t of [0, 1]) {
    const p = curve.getPoint(t);
    const tip = makeMesh(new THREE.CylinderGeometry(0.22, 0.1, 2.2, 8), MAT.copper(), 'tip' + t);
    tip.position.copy(p);
    tip.rotation.z = Math.PI / 2;
    tips.add(tip);
  }
  g.add(tube, tips);
  g.userData.wire = true;
  g.userData.lengthCm = L;
  g.userData.endNodes = [curve.getPoint(0).clone().setY(0.2), curve.getPoint(1).clone().setY(0.2)];
  return g;
};
BUILDERS.crocodileClip = (def) => {
  const g = new THREE.Group();
  const body = makeMesh(new THREE.BoxGeometry(3.4, 0.9, 1.2), new THREE.MeshStandardMaterial({ color: def.colourHex ?? 0xc0392b, roughness: 0.5 }), 'clip');
  const jawTop = makeMesh(new THREE.BoxGeometry(2.2, 0.4, 1.1), MAT.steel(), 'jawTop');
  jawTop.position.set(2.6, 0.38, 0);
  const jawBot = makeMesh(new THREE.BoxGeometry(2.2, 0.4, 1.1), MAT.steel(), 'jawBot');
  jawBot.position.set(2.6, -0.3, 0);
  const lead = makeMesh(new THREE.CylinderGeometry(0.2, 0.2, 6, 8), MAT.copper(), 'lead');
  lead.rotation.z = Math.PI / 2;
  lead.position.x = -4.6;
  g.add(body, jawTop, jawBot, lead);
  g.userData.clip = true;
  return g;
};
BUILDERS.ammeterDigital = (def) => {
  const g = instrumentBody(7.5, 5.6, 3.6);
  g.userData.instrument = 'ammeter';
  g.userData.electrical = true;
  g.userData.terminals = 2;
  g.userData.digital = true;
  return g;
};
BUILDERS.voltmeterDigital = (def) => {
  const g = instrumentBody(7.5, 5.6, 3.6);
  g.userData.instrument = 'voltmeter';
  g.userData.electrical = true;
  g.userData.terminals = 2;
  g.userData.digital = true;
  return g;
};
BUILDERS.magneticStirrer = (def) => {
  const g = new THREE.Group();
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const body = makeMesh(new THREE.BoxGeometry(R * 2, H, R * 1.8), MAT.plasticWhite(), 'body');
  body.position.y = H / 2;
  const plate = makeMesh(new THREE.CylinderGeometry(R * 0.85, R * 0.85, 0.5, 28), MAT.ceramicHot(), 'plate');
  plate.position.y = H + 0.25;
  const stirrer = makeMesh(new THREE.BoxGeometry(4, 0.35, 1.2), MAT.plasticWhite(), 'stirBar');
  stirrer.position.y = H + 0.6;
  stirrer.name = 'stirBar';
  g.add(body, plate, stirrer);
  g.userData.heatSource = true;
  g.userData.heatPowerW = 120;
  g.userData.contactPlate = { radius: R * 0.85, y: H + 0.5 };
  g.userData.stirrer = true;
  g.userData.stirSpeed = 0;
  return g;
};
BUILDERS.transformer2 = BUILDERS.transformers;

// ------------------------------------------------------- optics and waves
BUILDERS.rayBox = (def) => {
  const g = new THREE.Group();
  const box = makeMesh(new THREE.BoxGeometry(14, 7, 6), MAT.darkMetal(), 'body');
  box.position.y = 3.5;
  const slitPlate = makeMesh(new THREE.BoxGeometry(0.5, 6, 5.4), MAT.plasticBlack(), 'slitPlate');
  slitPlate.position.set(7, 3.5, 0);
  const slits = new THREE.Group();
  for (let i = -1; i <= 1; i++) {
    const s = makeMesh(new THREE.BoxGeometry(0.6, 0.35, 0.5), new THREE.MeshBasicMaterial({ color: 0xfdfbe8 }), 'slit' + i);
    s.position.set(7.1, 3.5 + i * 1.3, 0);
    slits.add(s);
  }
  const beam = new THREE.Group();
  beam.visible = false;
  for (let i = -1; i <= 1; i++) {
    const ray = makeMesh(new THREE.CylinderGeometry(0.12, 0.12, 80, 6), new THREE.MeshBasicMaterial({ color: 0xfff6cc, transparent: true, opacity: 0.65 }), 'ray' + i);
    ray.rotation.z = -Math.PI / 2;
    ray.position.set(47, 3.5 + i * 1.3, 0);
    ray.raycast = () => {};
    beam.add(ray);
  }
  const light = new THREE.PointLight(0xfff3cc, 30, 130, 2);
  light.position.set(8, 4, 0);
  light.raycast = () => {};
  g.add(box, slitPlate, slits, beam, light);
  g.userData.beam = beam;
  g.userData.light = light;
  g.userData.lightSource = true;
  return g;
};
BUILDERS.laserPointer = (def) => {
  const g = new THREE.Group();
  const body = makeMesh(new THREE.CylinderGeometry(0.8, 0.8, 12, 16), MAT.darkMetal(), 'body');
  body.rotation.z = Math.PI / 2;
  const beam = makeMesh(new THREE.CylinderGeometry(0.08, 0.08, 300, 6), new THREE.MeshBasicMaterial({ color: 0xff2222, transparent: true, opacity: 0.55 }), 'beam');
  beam.rotation.z = -Math.PI / 2;
  beam.position.set(156, 0, 0);
  beam.visible = false;
  beam.raycast = () => {};
  g.add(body, beam);
  g.userData.beam = beam;
  g.userData.lightSource = true;
  g.userData.laser = true;
  return g;
};
BUILDERS.prism = (def) => {
  const g = new THREE.Group();
  const geo = new THREE.CylinderGeometry(3.2, 3.2, 3.6, 3);
  const m = makeMesh(geo, MAT.glass(), 'prism');
  m.rotation.x = Math.PI / 2;
  m.rotation.y = Math.PI / 2;
  m.position.y = 1.8;
  g.add(m);
  g.userData.dispersive = true;
  return g;
};
BUILDERS.glassBlock = (def) => {
  const g = new THREE.Group();
  const b = makeMesh(new THREE.BoxGeometry(10, 6, 3), MAT.glass(), 'block');
  b.position.y = 3;
  g.add(b);
  g.userData.refractiveIndex = 1.5;
  return g;
};
BUILDERS.lensConvex = (def) => {
  const g = new THREE.Group();
  const R = mm(def.dims.diameterMm) / 2 || 3;
  const shape = new THREE.LatheGeometry([
    new THREE.Vector2(0.02, -1.2), new THREE.Vector2(R * 0.55, -0.9), new THREE.Vector2(R, 0),
    new THREE.Vector2(R * 0.55, 0.9), new THREE.Vector2(0.02, 1.2)
  ], 30);
  const m = makeMesh(shape, MAT.glass(), 'lens');
  m.rotation.z = Math.PI / 2;
  m.position.y = R * 1.2;
  const handle = makeMesh(new THREE.CylinderGeometry(0.3, 0.3, 8, 10), MAT.plasticBlack(), 'handle');
  handle.rotation.z = Math.PI / 2;
  handle.position.set(R + 3, 0.6, 0);
  g.add(m, handle);
  g.userData.focalLengthCm = def.focalLengthCm ?? 15;
  g.userData.lens = true;
  return g;
};
BUILDERS.lensConcave = BUILDERS.lensConvex;
BUILDERS.handLens = BUILDERS.lensConvex;
BUILDERS.mirrorPlane = (def) => {
  const g = new THREE.Group();
  const R = mm(def.dims.diameterMm) / 2 || 5;
  const glass = makeMesh(new THREE.BoxGeometry(R * 2, R * 2, 0.3), MAT.glassThick(), 'glass');
  glass.position.y = R;
  const coat = makeMesh(new THREE.BoxGeometry(R * 1.95, R * 1.95, 0.08), new THREE.MeshStandardMaterial({ color: 0xdfe7ec, metalness: 1, roughness: 0.05 }), 'coating');
  coat.position.set(0, R, -0.2);
  const frame = makeMesh(new THREE.BoxGeometry(R * 2.2, R * 2.2, 0.4), MAT.plasticBlack(), 'frame');
  frame.position.y = R;
  const stand = makeMesh(new THREE.BoxGeometry(3, R * 2, 1), MAT.steel(), 'stand');
  stand.position.set(0, R, -0.5);
  g.add(frame, glass, coat, stand);
  g.userData.mirror = 'plane';
  return g;
};
BUILDERS.mirrorConcave = (def) => {
  const g = BUILDERS.mirrorPlane(def);
  g.userData.mirror = 'concave';
  return g;
};
BUILDERS.opticalBench = (def) => {
  const g = new THREE.Group();
  const L = mm(def.dims.heightMm) || 100;
  const rail = makeMesh(new THREE.BoxGeometry(L, 1.6, 3), MAT.darkMetal(), 'rail');
  rail.position.y = 2;
  const tex = makeGraduationTexture({ max: L, major: 10, minor: 1, unit: 'cm', width: 24, height: 2048 });
  const marks = new THREE.Mesh(new THREE.PlaneGeometry(L, 2.6), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  marks.rotation.x = -Math.PI / 2;
  marks.position.y = 2.85;
  marks.raycast = () => {};
  g.add(rail, marks);
  g.userData.railLengthCm = L;
  g.userData.bench = true;
  return g;
};
BUILDERS.diffractionGrating = (def) => {
  const g = new THREE.Group();
  const R = mm(def.dims.diameterMm) / 2 || 2.5;
  const frame = makeMesh(new THREE.BoxGeometry(R * 2.4, R * 2.4, 0.4), MAT.plasticBlack(), 'frame');
  frame.position.y = R * 1.2;
  const slide = makeMesh(new THREE.BoxGeometry(R * 2, R * 2, 0.12), new THREE.MeshPhysicalMaterial({ color: 0xc9d6e0, roughness: 0.1, transmission: 0.7, transparent: true, opacity: 0.7 }), 'grating');
  slide.position.y = R * 1.2;
  const stand = makeMesh(new THREE.BoxGeometry(2.6, R * 2.4, 1), MAT.steel(), 'stand');
  stand.position.set(0, R * 1.2, -0.6);
  g.add(stand, frame, slide);
  g.userData.linesPerMm = def.linesPerMm ?? 300;
  return g;
};
BUILDERS.screen = (def) => {
  const g = new THREE.Group();
  const R = mm(def.dims.diameterMm) / 2 || 6;
  const H = mm(def.dims.heightMm) || 9;
  const board = makeMesh(new THREE.BoxGeometry(R * 2, H, 0.4), MAT.paper(), 'screen');
  board.position.y = H / 2;
  const stand = makeMesh(new THREE.BoxGeometry(2.4, H, 1), MAT.wood(), 'stand');
  stand.position.set(0, H / 2, -0.7);
  const foot = makeMesh(new THREE.BoxGeometry(8, 1, 5), MAT.wood(), 'foot');
  foot.position.y = 0.5;
  g.add(stand, board, foot);
  g.userData.screen = true;
  return g;
};
BUILDERS.tuningFork = (def) => {
  const g = new THREE.Group();
  const handle = makeMesh(new THREE.CylinderGeometry(0.5, 0.5, 10, 12), MAT.steel(), 'handle');
  handle.position.y = 5;
  for (const s of [-1, 1]) {
    const prong = makeMesh(new THREE.BoxGeometry(0.7, 9, 1.6), MAT.steel(), 'prong' + (s < 0 ? 'L' : 'R'));
    prong.position.set(s * 1.4, 14, 0);
    g.add(prong);
  }
  const base = makeMesh(new THREE.BoxGeometry(3.5, 1.2, 1.6), MAT.steel(), 'yoke');
  base.position.y = 10;
  g.add(handle, base);
  g.userData.frequencyHz = def.frequencyHz ?? 440;
  g.userData.soundSource = true;
  return g;
};
BUILDERS.resonanceTube = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const cavity = makeCavity([{ h: H * 0.9, r0: R, r1: R }]);
  g.add(vesselShell(cavity, { wall: 0.14, base: 0.3, open: false }));
  if (def.graduations) g.add(graduations(cavity, def.graduations, { offset: 0.04 }));
  const water = makeMesh(new THREE.CylinderGeometry(R * 0.94, R * 0.94, H * 0.45, 26), MAT.water(), 'reservoir');
  water.position.y = H * 0.22;
  water.name = 'reservoirWater';
  g.add(water);
  const f = finishVessel(g, cavity, { mouthRadius: R });
  f.userData.resonanceTube = true;
  f.userData.reservoir = water;
  return f;
};
BUILDERS.trough = (def) => {
  const g = new THREE.Group();
  const W = mm(def.dims.diameterMm) / 2, D = mm(def.dims.diameterMm) / 2, H = 8;
  const wall = new THREE.MeshStandardMaterial({ color: 0x2b3a45, roughness: 0.35, side: THREE.DoubleSide });
  const shell = makeMesh(new THREE.BoxGeometry(W * 2, H, D * 2), wall, 'trough');
  shell.position.y = H / 2;
  const cavity = makeCavity([{ h: H * 0.8, r0: W * 0.95, r1: W * 0.95 }]);
  g.add(shell);
  const f = finishVessel(g, cavity, { mouthRadius: W * 0.95 });
  f.userData.trough = true;
  return f;
};
BUILDERS.rippleTank = (def) => {
  const g = BUILDERS.trough(def);
  const W = mm(def.dims.diameterMm) / 2;
  const dipper = makeMesh(new THREE.CylinderGeometry(0.2, 0.2, 14, 8), MAT.steel(), 'dipper');
  dipper.position.set(0, 14, 0);
  const bar = makeMesh(new THREE.BoxGeometry(W * 1.6, 0.6, 1.4), MAT.steel(), 'dipperBar');
  bar.position.set(0, 21, 0);
  const light = new THREE.SpotLight(0xffffff, 40, 90, 0.8, 0.6, 2);
  light.position.set(0, 40, 0);
  light.raycast = () => {};
  g.add(dipper, bar, light);
  g.userData.rippleTank = true;
  g.userData.light = light;
  return g;
};
BUILDERS.lightGate = (def) => {
  const g = new THREE.Group();
  const armA = makeMesh(new THREE.BoxGeometry(3, 1.2, 5), MAT.plasticBlack(), 'armA');
  armA.position.y = 24;
  const armB = makeMesh(new THREE.BoxGeometry(3, 1.2, 5), MAT.plasticBlack(), 'armB');
  armB.position.y = 3;
  const pillar = makeMesh(new THREE.BoxGeometry(2, 28, 4), MAT.darkMetal(), 'pillar');
  pillar.position.set(-2, 14, 0);
  const beam = makeMesh(new THREE.CylinderGeometry(0.1, 0.1, 18, 6), new THREE.MeshBasicMaterial({ color: 0xff3333, transparent: true, opacity: 0.6 }), 'beam');
  beam.position.y = 13.5;
  beam.raycast = () => {};
  g.add(armA, armB, pillar, beam, );
  g.userData.lightGate = true;
  g.userData.instrument = 'timing';
  return g;
};
BUILDERS.lightSensor = (def) => {
  const g = new THREE.Group();
  const body = makeMesh(new THREE.BoxGeometry(4, 4, 2.4), MAT.darkMetal(), 'body');
  body.position.y = 8;
  const lens = makeMesh(new THREE.SphereGeometry(1.4, 16, 10), new THREE.MeshStandardMaterial({ color: 0x101418, roughness: 0.2 }), 'lens');
  lens.position.y = 8;
  const rod = makeMesh(new THREE.CylinderGeometry(0.4, 0.4, 7, 10), MAT.steel(), 'rod');
  rod.position.y = 3.5;
  const base = makeMesh(new THREE.CylinderGeometry(2.4, 2.6, 0.8, 18), MAT.darkMetal(), 'base');
  base.position.y = 0.4;
  g.add(rod, base, body, lens);
  g.userData.instrument = 'light';
  g.userData.sensor = true;
  return g;
};
BUILDERS.pressureSensor = (def) => {
  const g = makeMesh(new THREE.BoxGeometry(5, 3, 3), MAT.plasticBlack(), 'body');
  g.position.y = 1.5;
  const port = makeMesh(new THREE.CylinderGeometry(0.5, 0.5, 3, 12), MAT.brass(), 'port');
  port.rotation.z = Math.PI / 2;
  port.position.set(3.4, 1.5, 0);
  const grp = new THREE.Group();
  grp.add(g, port);
  grp.userData.instrument = 'pressure';
  grp.userData.sensor = true;
  return grp;
};
BUILDERS.forceSensor = (def) => {
  const g = new THREE.Group();
  const body = makeMesh(new THREE.BoxGeometry(3, 12, 3), MAT.steel(), 'body');
  body.position.y = 9;
  const hook = makeMesh(new THREE.TorusGeometry(0.9, 0.18, 6, 16, Math.PI * 1.4), MAT.steel(), 'hook');
  hook.position.y = 2.6;
  const display = makeMesh(new THREE.BoxGeometry(8, 4, 1), MAT.plasticWhite(), 'display');
  display.position.set(6, 12, 0);
  g.add(body, hook, display);
  g.userData.instrument = 'force';
  g.userData.sensor = true;
  return g;
};
BUILDERS.newtonMeter = (def) => {
  const g = new THREE.Group();
  const body = makeMesh(new THREE.BoxGeometry(2.6, 12, 2.6), MAT.plasticWhite(), 'body');
  body.position.y = 8;
  const face = makeMesh(new THREE.PlaneGeometry(2.0, 8), new THREE.MeshStandardMaterial({ color: 0xf7f7f2, roughness: 0.7 }), 'face');
  face.position.set(1.32, 8, 0);
  face.rotation.y = Math.PI / 2;
  const needle = makeMesh(new THREE.BoxGeometry(0.2, 0.6, 0.4), new THREE.MeshStandardMaterial({ color: 0xcc2222 }), 'needle');
  needle.position.set(1.4, 12, 0);
  const hook = makeMesh(new THREE.TorusGeometry(0.7, 0.16, 6, 14, Math.PI * 1.5), MAT.steel(), 'hook');
  hook.position.y = 1.4;
  const ring = makeMesh(new THREE.TorusGeometry(0.7, 0.16, 6, 16), MAT.steel(), 'ring');
  ring.position.y = 14.6;
  g.add(body, face, needle, ring, hook);
  g.userData.needle = needle;
  g.userData.instrument = 'force';
  g.userData.rangeN = def.rangeN ?? 10;
  return g;
};
BUILDERS.loudspeaker = (def) => {
  const g = new THREE.Group();
  const box = makeMesh(new THREE.BoxGeometry(16, 22, 12), MAT.wood(), 'cabinet');
  box.position.y = 11;
  const cone = makeMesh(new THREE.ConeGeometry(5, 4, 26, 1, true), MAT.plasticBlack(), 'cone');
  cone.rotation.x = Math.PI / 2;
  cone.position.set(0, 12, 6.5);
  const dome = makeMesh(new THREE.SphereGeometry(1.2, 16, 10), MAT.darkMetal(), 'dome');
  dome.position.set(0, 19, 6.5);
  g.add(box, cone, dome);
  g.userData.speaker = true;
  g.userData.electrical = true;
  g.userData.terminalNodes = [new THREE.Vector3(-4, 3, 6.2), new THREE.Vector3(4, 3, 6.2)];
  return g;
};
BUILDERS.microphone = (def) => {
  const g = new THREE.Group();
  const body = makeMesh(new THREE.CylinderGeometry(1.4, 1.4, 10, 18), MAT.darkMetal(), 'body');
  body.position.y = 6;
  const head = makeMesh(new THREE.SphereGeometry(1.6, 18, 12), new THREE.MeshStandardMaterial({ color: 0x3a3f45, roughness: 0.9 }), 'grille');
  head.position.y = 12;
  const stand = makeMesh(new THREE.CylinderGeometry(3, 3.4, 1, 20), MAT.darkMetal(), 'base');
  stand.position.y = 0.5;
  g.add(stand, body, head);
  g.userData.microphone = true;
  g.userData.instrument = 'sound';
  return g;
};
BUILDERS.spectrometerTable = (def) => {
  const g = new THREE.Group();
  const top = makeMesh(new THREE.CylinderGeometry(14, 14, 1.2, 36), MAT.darkMetal(), 'table');
  top.position.y = 12;
  const column = makeMesh(new THREE.CylinderGeometry(3, 3.4, 12, 24), MAT.darkMetal(), 'column');
  column.position.y = 6;
  const base = makeMesh(new THREE.CylinderGeometry(7, 7.6, 1, 28), MAT.darkMetal(), 'base');
  base.position.y = 0.5;
  const scale = makeMesh(new THREE.TorusGeometry(14.2, 0.2, 6, 40), MAT.brass(), 'scale');
  scale.rotation.x = Math.PI / 2;
  scale.position.y = 12.7;
  g.add(base, column, top, scale);
  g.userData.table = true;
  return g;
};
BUILDERS.spectrometer2 = BUILDERS.spectrometer;

// ---------------------------------------------------------------- mechanics
BUILDERS.trolley = (def) => {
  const g = new THREE.Group();
  const bed = makeMesh(new THREE.BoxGeometry(20, 1.6, 12), MAT.darkMetal(), 'bed');
  bed.position.y = 4;
  const panel = makeMesh(new THREE.BoxGeometry(20, 2.4, 0.6), MAT.plasticBlack(), 'front');
  panel.position.set(0, 5.4, 6);
  g.add(bed, panel);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const w = makeMesh(new THREE.CylinderGeometry(1.6, 1.6, 0.8, 16), MAT.plasticBlack(), 'wheel');
    w.rotation.z = Math.PI / 2;
    w.position.set(sx * 7, 1.6, sz * 5);
    g.add(w);
  }
  g.userData.trolley = true;
  g.userData.massG = def.massG ?? 500;
  g.userData.friction = 0.15;
  return g;
};
BUILDERS.ramp = (def) => {
  const g = new THREE.Group();
  const L = mm(def.dims.heightMm) || 60;
  const ramp = makeMesh(new THREE.BoxGeometry(L, 0.8, 14), MAT.wood(), 'ramp');
  ramp.rotation.z = 0.25;
  ramp.position.set(0, L * 0.12, 0);
  const hinge = makeMesh(new THREE.BoxGeometry(14, 1.2, 14), MAT.wood(), 'base');
  hinge.position.y = 0.6;
  const prop = makeMesh(new THREE.BoxGeometry(3, L * 0.2, 3), MAT.wood(), 'prop');
  prop.position.set(L * 0.4, L * 0.1, 0);
  g.add(hinge, ramp, prop);
  g.userData.ramp = true;
  g.userData.inclination = 0.25;
  return g;
};
BUILDERS.pulley = (def) => {
  const g = new THREE.Group();
  const wheel = makeMesh(new THREE.TorusGeometry(3, 0.6, 8, 30), MAT.plasticWhite(), 'wheel');
  const hub = makeMesh(new THREE.CylinderGeometry(0.7, 0.7, 1.4, 14), MAT.steel(), 'hub');
  hub.rotation.x = Math.PI / 2;
  const bracket = makeMesh(new THREE.BoxGeometry(0.8, 7, 3), MAT.steel(), 'bracket');
  bracket.position.y = 4.4;
  const fit = makeMesh(new THREE.BoxGeometry(6, 1, 6), MAT.steel(), 'fittings');
  fit.position.y = 8;
  wheel.position.y = 0;
  g.add(wheel, hub, bracket, fit);
  g.userData.pulley = true;
  g.userData.radiusCm = 3;
  return g;
};
BUILDERS.clamp2 = BUILDERS.clamp;
BUILDERS.mass = (def) => {
  const g = new THREE.Group();
  const mass = def.massG ?? 100;
  const r = 1.6 + Math.cbrt(mass) * 0.35;
  const body = makeMesh(new THREE.CylinderGeometry(r, r * 1.05, r * 3, 22), MAT.brass(), 'mass');
  body.position.y = r * 1.5;
  const hook = makeMesh(new THREE.TorusGeometry(r * 0.35, 0.12, 6, 16, Math.PI * 1.4), MAT.steel(), 'hook');
  hook.position.y = r * 3;
  g.add(body, hook);
  g.userData.massG = mass;
  return g;
};
BUILDERS.massSet = (def) => {
  const g = new THREE.Group();
  const tray = makeMesh(new THREE.BoxGeometry(14, 1, 10), MAT.wood(), 'tray');
  tray.position.y = 0.5;
  g.add(tray);
  const sizes = [200, 100, 50, 20];
  sizes.forEach((m, i) => {
    const k = BUILDERS.mass({ massG: m });
    k.scale.setScalar(0.75 - i * 0.08);
    k.position.set(-4.5 + i * 3.2, 1, (i % 2) * 3 - 1.5);
    g.add(k);
  });
  g.userData.massSet = true;
  return g;
};
BUILDERS.spring = (def) => {
  const g = new THREE.Group();
  const coil = new THREE.Group();
  const turns = 14;
  for (let i = 0; i < turns; i++) {
    const t = makeMesh(new THREE.TorusGeometry(0.8, 0.1, 6, 14), MAT.steel(), 'turn' + i);
    t.rotation.x = Math.PI / 2;
    t.position.y = i * 0.32;
    coil.add(t);
  }
  const hookA = makeMesh(new THREE.TorusGeometry(0.6, 0.1, 6, 14, Math.PI * 1.5), MAT.steel(), 'hookA');
  hookA.position.y = turns * 0.32;
  g.add(coil, hookA);
  g.userData.spring = true;
  g.userData.naturalLengthCm = turns * 0.32;
  g.userData.springConstantNm = def.springConstantNm ?? 20;
  return g;
};
BUILDERS.pendulum = (def) => {
  const g = new THREE.Group();
  const L = def.lengthCm || 60;
  const base = makeMesh(new THREE.BoxGeometry(20, 1, 20), MAT.wood(), 'base');
  base.position.y = 0.6;
  const pillar = makeMesh(new THREE.CylinderGeometry(0.6, 0.9, 90, 14), MAT.steel(), 'pillar');
  pillar.position.y = 45;
  const arm = makeMesh(new THREE.CylinderGeometry(0.5, 0.5, 8, 12), MAT.steel(), 'arm');
  arm.rotation.z = Math.PI / 2;
  arm.position.set(4, 90, 0);
  const string = makeMesh(new THREE.CylinderGeometry(0.08, 0.08, L, 6), MAT.cloth(), 'string');
  string.position.set(8, 90 - L / 2, 0);
  const bob = makeMesh(new THREE.SphereGeometry(2, 18, 14), MAT.brass(), 'bob');
  bob.position.set(8, 90 - L, 0);
  g.add(base, pillar, arm, string, bob);
  g.userData.pendulum = true;
  g.userData.lengthCm = L;
  g.userData.pivot = new THREE.Vector3(8, 90, 0);
  return g;
};
BUILDERS.ball = (def) => {
  const g = new THREE.Group();
  const r = mm(def.dims.diameterMm) / 2 || 1.2;
  const b = makeMesh(new THREE.SphereGeometry(r, 20, 14), new THREE.MeshStandardMaterial({ color: def.colourHex ?? 0xd9d9d9, roughness: 0.35, metalness: 0.1 }), 'ball');
  b.position.y = r;
  g.add(b);
  g.userData.massG = def.massG ?? 20;
  g.userData.radiusCm = r;
  return g;
};
BUILDERS.dampingCards = (def) => {
  const g = new THREE.Group();
  const card = makeMesh(new THREE.BoxGeometry(14, 10, 0.2), MAT.paper(), 'card');
  card.position.y = 5;
  const stand = makeMesh(new THREE.BoxGeometry(1.6, 12, 1.6), MAT.wood(), 'stand');
  stand.position.set(-7, 6, 0);
  g.add(stand, card);
  g.userData.damping = 0.5;
  return g;
};
BUILDERS.pins = (def) => {
  const g = new THREE.Group();
  const tray = makeMesh(new THREE.BoxGeometry(6, 0.6, 4), MAT.plasticWhite(), 'tray');
  tray.position.y = 0.3;
  g.add(tray);
  for (let i = 0; i < 10; i++) {
    const p = makeMesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 6), MAT.steel(), 'pin' + i);
    p.position.set(-2 + (i % 5) * 1, 1.6, -1 + Math.floor(i / 5) * 2);
    g.add(p);
  }
  g.userData.pins = true;
  return g;
};
BUILDERS.paperClips = (def) => {
  const g = new THREE.Group();
  const box = makeMesh(new THREE.BoxGeometry(6, 1.2, 4), MAT.plasticGrey(), 'box');
  box.position.y = 0.6;
  g.add(box);
  for (let i = 0; i < 6; i++) {
    const c = makeMesh(new THREE.TorusGeometry(0.5, 0.07, 5, 14), MAT.steel(), 'clip' + i);
    c.rotation.x = Math.PI / 2;
    c.position.set(-1.6 + (i % 3) * 1.6, 1.3, -0.8 + Math.floor(i / 3) * 1.6);
    g.add(c);
  }
  g.userData.paperClips = true;
  return g;
};
BUILDERS.trolley2 = BUILDERS.trolley;

// ------------------------------------------------------------------ biology
BUILDERS.microscope = (def) => {
  const g = new THREE.Group();
  const base = makeMesh(new THREE.BoxGeometry(16, 3, 12), MAT.darkMetal(), 'base');
  base.position.y = 1.5;
  const arm = makeMesh(new THREE.BoxGeometry(4, 26, 5), MAT.darkMetal(), 'arm');
  arm.position.set(-5, 16, 0);
  const stage = makeMesh(new THREE.BoxGeometry(11, 0.8, 11), MAT.darkMetal(), 'stage');
  stage.position.set(1, 14, 0);
  const clip = makeMesh(new THREE.BoxGeometry(2, 0.3, 1), MAT.steel(), 'clip');
  clip.position.set(1, 14.6, 3);
  const tube = makeMesh(new THREE.CylinderGeometry(1.4, 1.4, 14, 18), MAT.plasticBlack(), 'eyepieceTube');
  tube.rotation.z = -0.18;
  tube.position.set(0.5, 28, 0);
  const objectives = new THREE.Group();
  const revolver = makeMesh(new THREE.CylinderGeometry(2, 2, 1.6, 20), MAT.darkMetal(), 'revolver');
  revolver.position.set(1, 21, 0);
  for (let i = 0; i < 3; i++) {
    const o = makeMesh(new THREE.CylinderGeometry(0.7, 0.7, 4, 14), MAT.steel(), 'objective' + i);
    const a = (i / 3) * Math.PI * 2;
    o.position.set(1 + Math.cos(a) * 1.2, 18.6, Math.sin(a) * 1.2);
    objectives.add(o);
  }
  const lamp = makeMesh(new THREE.CylinderGeometry(1.8, 1.8, 1, 16), new THREE.MeshBasicMaterial({ color: 0xfff2cc }), 'illuminator');
  lamp.position.set(1, 5, 0);
  const mirror = makeMesh(new THREE.CircleGeometry(2.4, 20), new THREE.MeshStandardMaterial({ color: 0xdfe7ec, metalness: 1, roughness: 0.08, side: THREE.DoubleSide }), 'mirror');
  mirror.position.set(1, 6, 0);
  mirror.rotation.x = -1.1;
  g.add(base, arm, stage, clip, tube, revolver, objectives, lamp, mirror);
  g.userData.microscope = true;
  g.userData.instrument = 'microscope';
  g.userData.magnifications = [4, 10, 40];
  return g;
};
BUILDERS.slide = (def) => {
  const g = new THREE.Group();
  const s = makeMesh(new THREE.BoxGeometry(7.5, 0.15, 2.6), MAT.glass(), 'slide');
  s.position.y = 0.08;
  const cover = makeMesh(new THREE.BoxGeometry(2, 0.08, 2), MAT.glassThick(), 'coverSlip');
  cover.position.set(0, 0.2, 0);
  g.add(s, cover);
  g.userData.specimen = def.specimen || null;
  return g;
};
BUILDERS.coverslip = (def) => {
  const g = new THREE.Group();
  const c = makeMesh(new THREE.BoxGeometry(1.8, 0.08, 1.8), MAT.glassThick(), 'coverSlip');
  c.position.y = 0.04;
  g.add(c);
  return g;
};
BUILDERS.graticule = (def) => {
  const g = new THREE.Group();
  const c = makeMesh(new THREE.CylinderGeometry(1.2, 1.2, 0.1, 24), MAT.glassThick(), 'graticule');
  c.position.y = 0.05;
  g.add(c);
  g.userData.graticule = true;
  return g;
};
BUILDERS.petriDish = (def) => {
  const R = mm(def.dims.diameterMm) / 2 || 4.5;
  const g = new THREE.Group();
  const base = makeMesh(new THREE.CylinderGeometry(R, R, 0.9, 32), MAT.glass(), 'base');
  base.position.y = 0.45;
  const lid = makeMesh(new THREE.CylinderGeometry(R * 1.04, R * 1.04, 0.7, 32), MAT.glass(), 'lid');
  lid.position.y = 1.7;
  lid.name = 'lid';
  g.add(base, lid);
  const cavity = makeCavity([{ h: 0.9, r0: R * 0.96, r1: R * 0.96 }]);
  const f = finishVessel(g, cavity, { mouthRadius: R });
  f.userData.petriDish = true;
  return f;
};
BUILDERS.stainingJar = (def) => {
  const R = mm(def.dims.diameterMm) / 2, H = mm(def.dims.heightMm);
  const g = new THREE.Group();
  const cavity = makeCavity([{ h: H * 0.85, r0: R, r1: R }]);
  g.add(vesselShell(cavity, { wall: 0.16, base: 0.3, open: false }));
  const lid = makeMesh(new THREE.CylinderGeometry(R * 1.1, R * 1.1, 0.6, 28), MAT.plasticWhite(), 'lid');
  lid.position.y = cavity.height + 0.3;
  g.add(lid);
  const f = finishVessel(g, cavity, { mouthRadius: R });
  f.userData.stainingJar = true;
  return f;
};
BUILDERS.dissectingTray = (def) => {
  const g = new THREE.Group();
  const tray = makeMesh(new THREE.BoxGeometry(26, 3, 18), MAT.plasticWhite(), 'tray');
  tray.position.y = 1.5;
  const wax = makeMesh(new THREE.BoxGeometry(23, 0.8, 15), MAT.plasticBlack(), 'wax');
  wax.position.y = 3;
  g.add(tray, wax);
  const cavity = makeCavity([{ h: 2.6, r0: 12, r1: 12 }]);
  const f = finishVessel(g, cavity, { mouthRadius: 12 });
  f.userData.tray = true;
  return f;
};
BUILDERS.cuttingBoard2 = BUILDERS.cuttingBoard;
BUILDERS.scalpel = (def) => {
  const g = new THREE.Group();
  const handle = makeMesh(new THREE.CylinderGeometry(0.35, 0.28, 14, 12), MAT.steel(), 'handle');
  handle.rotation.z = Math.PI / 2;
  handle.position.x = -5;
  const blade = makeMesh(new THREE.BoxGeometry(3.4, 0.8, 0.08), MAT.steel(), 'blade');
  blade.position.set(5, 0.2, 0);
  g.add(handle, blade);
  return g;
};
BUILDERS.scissors = (def) => {
  const g = new THREE.Group();
  for (const s of [-1, 1]) {
    const blade = makeMesh(new THREE.BoxGeometry(9, 0.7, 0.12), MAT.steel(), 'blade' + s);
    blade.position.set(4.5, s * 0.5, 0);
    blade.rotation.z = s * 0.06;
    const ring = makeMesh(new THREE.TorusGeometry(1.1, 0.2, 8, 18), MAT.steel(), 'ring' + s);
    ring.position.set(-5, s * 1.1, 0);
    g.add(blade, ring);
  }
  return g;
};
BUILDERS.corkBorer = (def) => {
  const g = new THREE.Group();
  const tube = makeMesh(new THREE.CylinderGeometry(0.8, 0.8, 12, 16, 1, true), MAT.steel(), 'borer');
  tube.position.y = 6;
  g.add(tube);
  return g;
};
BUILDERS.spreader = (def) => {
  const g = new THREE.Group();
  const rod = makeMesh(new THREE.CylinderGeometry(0.2, 0.2, 16, 10), MAT.glass(), 'rod');
  rod.rotation.z = Math.PI / 2;
  const hook = makeMesh(new THREE.TorusGeometry(0.9, 0.18, 6, 18), MAT.glass(), 'bend');
  hook.rotation.y = Math.PI / 2;
  hook.position.x = -8;
  g.add(rod, hook);
  return g;
};
BUILDERS.inoculatingLoop = (def) => {
  const g = new THREE.Group();
  const handle = makeMesh(new THREE.CylinderGeometry(0.3, 0.3, 12, 12), MAT.plasticGrey(), 'handle');
  handle.rotation.z = Math.PI / 2;
  handle.position.x = -6;
  const wire = makeMesh(new THREE.CylinderGeometry(0.08, 0.08, 6, 6), MAT.steel(), 'wire');
  wire.rotation.z = Math.PI / 2;
  wire.position.x = 3;
  const loop = makeMesh(new THREE.TorusGeometry(0.5, 0.07, 6, 16), MAT.steel(), 'loop');
  loop.position.x = 6.4;
  g.add(handle, wire, loop);
  return g;
};
BUILDERS.incubator = (def) => {
  const g = new THREE.Group();
  const body = makeMesh(new THREE.BoxGeometry(50, 60, 45), MAT.cabinet(), 'body');
  body.position.y = 30;
  const door = makeMesh(new THREE.BoxGeometry(44, 48, 1.5), MAT.glassThick(), 'door');
  door.position.set(0, 32, 23);
  const handle = makeMesh(new THREE.BoxGeometry(1.5, 10, 1.5), MAT.steel(), 'handle');
  handle.position.set(18, 32, 24.6);
  g.add(body, door, handle);
  g.userData.incubator = true;
  g.userData.temperatureC = 37;
  return g;
};
BUILDERS.autoclaveBin = (def) => {
  const g = new THREE.Group();
  const body = makeMesh(new THREE.CylinderGeometry(12, 12, 24, 28, 1, true), MAT.steel(), 'body');
  body.position.y = 12;
  const lid = makeMesh(new THREE.CylinderGeometry(12.6, 12.6, 1.4, 28), MAT.steel(), 'lid');
  lid.position.y = 24.6;
  g.add(body, lid);
  g.userData.autoclaveBin = true;
  return g;
};
BUILDERS.respirometer = (def) => {
  const g = new THREE.Group();
  const reservoir = makeMesh(new THREE.CylinderGeometry(4, 4, 1.6, 24), MAT.glassThick(), 'reservoir');
  reservoir.position.y = 12;
  const tube = makeMesh(new THREE.CylinderGeometry(1.6, 1.6, 26, 18), MAT.glass(), 'tube');
  tube.rotation.z = Math.PI / 2;
  tube.position.set(4, 13, 0);
  const scale = makeGraduationTexture({ max: 10, major: 1, minor: 0.2, unit: 'cm3', width: 512, height: 32 });
  const marks = new THREE.Mesh(new THREE.PlaneGeometry(26, 1.2), new THREE.MeshBasicMaterial({ map: scale, transparent: true }));
  marks.position.set(4, 12, 1.7);
  marks.raycast = () => {};
  const stand = makeMesh(new THREE.BoxGeometry(24, 1.2, 12), MAT.wood(), 'base');
  stand.position.y = 0.6;
  g.add(stand, reservoir, tube, marks);
  g.userData.respirometer = true;
  g.userData.instrument = 'gasVolume';
  return g;
};
BUILDERS.potometer = (def) => {
  const g = new THREE.Group();
  const tube = makeMesh(new THREE.CylinderGeometry(1, 1, 42, 18), MAT.glass(), 'capillary');
  tube.position.set(0, 30, 0);
  const arm = makeMesh(new THREE.CylinderGeometry(0.9, 0.9, 16, 16), MAT.glass(), 'arm');
  arm.rotation.z = Math.PI / 2;
  arm.position.set(3, 50, 0);
  const reservoir = makeMesh(new THREE.CylinderGeometry(2.6, 2.6, 4, 20), MAT.glassThick(), 'reservoir');
  reservoir.position.set(0, 20, 0);
  const scale = makeGraduationTexture({ max: 10, major: 1, minor: 0.2, unit: 'cm', width: 32, height: 1024, vertical: true });
  const marks = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 40), new THREE.MeshBasicMaterial({ map: scale, transparent: true }));
  marks.position.set(1.2, 30, 0);
  marks.raycast = () => {};
  const stand = makeMesh(new THREE.BoxGeometry(10, 1, 10), MAT.wood(), 'base');
  stand.position.y = 0.5;
  const rod = makeMesh(new THREE.CylinderGeometry(0.4, 0.4, 24, 10), MAT.steel(), 'rod');
  rod.position.set(-4, 12, 0);
  g.add(stand, rod, tube, arm, reservoir, marks);
  g.userData.potometer = true;
  g.userData.instrument = 'distance';
  return g;
};
BUILDERS.countingChamber = (def) => {
  const g = new THREE.Group();
  const slide = makeMesh(new THREE.BoxGeometry(7.5, 0.3, 2.6), MAT.glassThick(), 'chamber');
  slide.position.y = 0.15;
  g.add(slide);
  for (let i = 0; i < 3; i++) {
    const line = makeMesh(new THREE.BoxGeometry(0.06, 0.05, 2.2), new THREE.MeshBasicMaterial({ color: 0x223 }), 'grid' + i);
    line.position.set(-1 + i, 0.31, 0);
    g.add(line);
  }
  g.userData.countingChamber = true;
  return g;
};
BUILDERS.countingGrid = (def) => {
  const g = new THREE.Group();
  const plate = makeMesh(new THREE.BoxGeometry(10, 0.2, 10), MAT.glassThick(), 'plate');
  plate.position.y = 0.1;
  g.add(plate);
  for (let i = 0; i <= 4; i++) {
    const a = makeMesh(new THREE.BoxGeometry(0.08, 0.05, 9.6), new THREE.MeshBasicMaterial({ color: 0x223 }), 'v' + i);
    a.position.set(-4 + i * 2, 0.22, 0);
    const b = makeMesh(new THREE.BoxGeometry(9.6, 0.05, 0.08), new THREE.MeshBasicMaterial({ color: 0x223 }), 'h' + i);
    b.position.set(0, 0.22, -4 + i * 2);
    g.add(a, b);
  }
  g.userData.countingGrid = true;
  return g;
};
BUILDERS.viskingTubing = (def) => {
  const g = new THREE.Group();
  const tube = makeMesh(new THREE.CylinderGeometry(1.4, 1.4, 22, 18, 1, true), new THREE.MeshStandardMaterial({ color: 0xe8e4d8, roughness: 0.9, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }), 'tubing');
  tube.position.y = 11;
  g.add(tube);
  g.userData.membrane = true;
  return g;
};
BUILDERS.quadrat = (def) => {
  const g = new THREE.Group();
  const size = mm(def.dims.diameterMm) || 50;
  const mat = new THREE.MeshStandardMaterial({ color: 0xd9d4c4, roughness: 0.9 });
  for (const s of [-1, 1]) {
    const a = makeMesh(new THREE.BoxGeometry(size, 1.2, 1.2), mat, 'railV' + s);
    a.position.set(0, 0.6, s * size / 2);
    const b = makeMesh(new THREE.BoxGeometry(1.2, 1.2, size), mat, 'railH' + s);
    b.position.set(s * size / 2, 0.6, 0);
    g.add(a, b);
  }
  for (let i = 1; i < 10; i++) {
    const t = -size / 2 + (i / 10) * size;
    const a = makeMesh(new THREE.BoxGeometry(0.5, 0.4, size), new THREE.MeshStandardMaterial({ color: 0xbfb8a6 }), 'gridV' + i);
    a.position.set(t, 0.4, 0);
    const b = makeMesh(new THREE.BoxGeometry(size, 0.4, 0.5), new THREE.MeshStandardMaterial({ color: 0xbfb8a6 }), 'gridH' + i);
    b.position.set(0, 0.4, t);
    g.add(a, b);
  }
  g.userData.quadrat = true;
  g.userData.sizeCm = size;
  return g;
};
BUILDERS.cylinderSpecimen = (def) => {
  const g = new THREE.Group();
  const wood = makeMesh(new THREE.CylinderGeometry(3, 3, 20, 22), MAT.wood(), 'specimen');
  wood.position.y = 10;
  const band = makeMesh(new THREE.TorusGeometry(3.05, 0.2, 6, 26), MAT.steel(), 'band');
  band.rotation.x = Math.PI / 2;
  band.position.y = 10;
  g.add(wood, band);
  g.userData.specimenMassG = def.massG ?? 120;
  return g;
};

// ------------------------------------------------- electrostatic / magnetism
BUILDERS.magnet = (def) => {
  const g = new THREE.Group();
  const W = mm(def.dims.heightMm) || 10;
  for (const [s, mat, name] of [[-1, MAT.magnetSouth(), 'south'], [1, MAT.magnetNorth(), 'north']]) {
    const b = makeMesh(new THREE.BoxGeometry(W * 0.5, 2.4, 2.4), mat, name);
    b.position.x = s * W * 0.25;
    g.add(b);
  }
  const pole = makeMesh(new THREE.BoxGeometry(W * 0.4, 2.4, 2.4), MAT.darkMetal(), 'centre');
  pole.position.y = 2.6;
  g.add(pole);
  g.userData.poles = { north: new THREE.Vector3(W * 0.25, 1, 0), south: new THREE.Vector3(-W * 0.25, 1, 0) };
  g.userData.fieldStrengthT = def.fieldStrengthT ?? 0.1;
  return g;
};
BUILDERS.compass = (def) => {
  const g = new THREE.Group();
  const case_ = makeMesh(new THREE.CylinderGeometry(2.6, 2.6, 0.8, 26), MAT.brass(), 'case');
  case_.position.y = 0.4;
  const needle = makeMesh(new THREE.BoxGeometry(4, 0.15, 0.4), new THREE.MeshStandardMaterial({ color: 0xcc2222 }), 'needle');
  needle.position.y = 1;
  needle.name = 'needle';
  g.add(case_, needle);
  g.userData.needle = needle;
  g.userData.compass = true;
  return g;
};
BUILDERS.coil = (def) => {
  const g = new THREE.Group();
  const turns = 20;
  const core = makeMesh(new THREE.CylinderGeometry(1.4, 1.4, 14, 20), MAT.plasticWhite(), 'former');
  core.rotation.z = Math.PI / 2;
  core.position.y = 4;
  g.add(core);
  for (let i = 0; i < turns; i++) {
    const t = makeMesh(new THREE.TorusGeometry(1.7, 0.16, 6, 18), MAT.copper(), 'turn' + i);
    t.rotation.y = Math.PI / 2;
    t.position.set(-6.5 + i * (13 / turns), 4, 0);
    g.add(t);
  }
  g.userData.turns = turns;
  g.userData.electrical = true;
  g.userData.terminalNodes = [new THREE.Vector3(-7, 4, 0), new THREE.Vector3(7, 4, 0)];
  return g;
};
BUILDERS.ironCore = (def) => {
  const g = new THREE.Group();
  const core = makeMesh(new THREE.CylinderGeometry(1.2, 1.2, 14, 20), MAT.ironFilings(), 'core');
  core.rotation.z = Math.PI / 2;
  core.position.y = 4;
  g.add(core);
  g.userData.ironCore = true;
  return g;
};
BUILDERS.electrodes = (def) => {
  const g = new THREE.Group();
  const W = mm(def.dims.diameterMm) || 8;
  const mat = def.material === 'carbon' ? MAT.plasticBlack() : def.material === 'copper' ? MAT.copper() : MAT.steel();
  for (const s of [-1, 1]) {
    const rod = makeMesh(new THREE.BoxGeometry(0.6, 22, W * 0.6), mat, 'electrode' + (s < 0 ? 'L' : 'R'));
    rod.position.set(s * 4, 11, 0);
    g.add(rod);
  }
  const holder = makeMesh(new THREE.BoxGeometry(12, 1.2, 4), MAT.plasticWhite(), 'holder');
  holder.position.y = 22.6;
  for (const s of [-1, 1]) {
    const post = makeMesh(new THREE.CylinderGeometry(0.4, 0.4, 1.6, 10), MAT.brass(), 'post' + s);
    post.position.set(s * 4, 23.4, 0);
    g.add(post);
  }
  g.add(holder);
  g.userData.electrodeMetal = def.material || 'copper';
  g.userData.electrical = true;
  g.userData.inElectrolyte = true;
  g.userData.terminalNodes = [new THREE.Vector3(-4, 24, 0), new THREE.Vector3(4, 24, 0)];
  return g;
};
BUILDERS.copperElectrodes = (def) => BUILDERS.electrodes({ ...def, material: 'copper' });
BUILDERS.carbonElectrodes = (def) => BUILDERS.electrodes({ ...def, material: 'carbon' });
BUILDERS.conductivityMeter = (def) => {
  const g = instrumentBody(9, 12, 4);
  const probe = makeMesh(new THREE.CylinderGeometry(0.6, 0.6, 16, 12), MAT.plasticBlack(), 'probe');
  probe.position.set(2, 2, 0);
  const tip = makeMesh(new THREE.CylinderGeometry(0.7, 0.7, 1, 12), MAT.steel(), 'tip');
  tip.position.set(2, -6, 0);
  g.add(probe, tip);
  g.userData.instrument = 'conductivity';
  return g;
};
BUILDERS.analyticalBalance = (def) => {
  const g = new THREE.Group();
  const body = makeMesh(new THREE.BoxGeometry(30, 14, 30), MAT.plasticWhite(), 'body');
  body.position.y = 7;
  const glass = makeMesh(new THREE.BoxGeometry(24, 20, 24), MAT.glass(), 'draughtShield');
  glass.position.y = 24;
  const pan = makeMesh(new THREE.CylinderGeometry(6, 6, 0.6, 26), MAT.steel(), 'pan');
  pan.position.y = 15;
  const screen = makeMesh(new THREE.PlaneGeometry(9, 4), new THREE.MeshStandardMaterial({ color: 0x0b1f14, emissive: 0x1d7a4b }), 'display');
  screen.position.set(0, 8, 15.2);
  screen.name = 'display';
  g.add(body, glass, pan, screen);
  g.userData.instrument = 'balance';
  g.userData.resolutionG = 0.0001;
  g.userData.weighPan = pan;
  return g;
};
BUILDERS.centrifuge = (def) => {
  const g = new THREE.Group();
  const body = makeMesh(new THREE.BoxGeometry(26, 18, 26), MAT.plasticWhite(), 'body');
  body.position.y = 9;
  const lid = makeMesh(new THREE.CylinderGeometry(12, 12, 2, 26), MAT.glassThick(), 'lid');
  lid.position.y = 19;
  const rotor = new THREE.Group();
  rotor.name = 'rotor';
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const holder = makeMesh(new THREE.CylinderGeometry(1.4, 1.4, 8, 14, 1, true), MAT.steel(), 'holder' + i);
    holder.position.set(Math.cos(a) * 6, -3, Math.sin(a) * 6);
    holder.rotation.x = 0.4;
    holder.rotation.y = -a;
    rotor.add(holder);
  }
  rotor.position.y = 15;
  const hub = makeMesh(new THREE.CylinderGeometry(1.4, 1.4, 12, 14), MAT.steel(), 'hub');
  hub.position.y = 9;
  g.add(body, hub, rotor, lid);
  g.userData.centrifuge = true;
  g.userData.rotor = rotor;
  g.userData.rpm = 0;
  return g;
};
BUILDERS.dessicator = (def) => {
  const R = mm(def.dims.diameterMm) / 2 || 9, H = mm(def.dims.heightMm) || 20;
  const g = new THREE.Group();
  const cavity = makeCavity([{ h: H * 0.7, r0: R, r1: R }]);
  g.add(vesselShell(cavity, { wall: 0.18, base: 0.6, open: false }));
  const lid = makeMesh(new THREE.CylinderGeometry(R * 1.08, R * 1.08, 0.8, 30), MAT.glassThick(), 'lid');
  lid.position.y = cavity.height + 0.5;
  const knob = makeMesh(new THREE.SphereGeometry(0.9, 14, 10), MAT.glassThick(), 'knob');
  knob.position.y = cavity.height + 1.6;
  const plate = makeMesh(new THREE.CylinderGeometry(R * 0.9, R * 0.9, 0.3, 28), MAT.ceramic(), 'plate');
  plate.position.y = cavity.height * 0.45;
  g.add(lid, knob, plate);
  g.userData.dessicator = true;
  return finishVessel(g, cavity, { mouthRadius: R });
};
BUILDERS.filterStand = (def) => {
  const g = makeMesh(new THREE.BoxGeometry(12, 1, 12), MAT.steel(), 'base');
  g.position.y = 0.5;
  const rod = makeMesh(new THREE.CylinderGeometry(0.5, 0.5, 32, 12), MAT.steel(), 'rod');
  rod.position.set(-4, 16.5, 0);
  const ring = makeMesh(new THREE.TorusGeometry(5, 0.35, 8, 26), MAT.steel(), 'ring');
  ring.rotation.x = Math.PI / 2;
  ring.position.set(2, 24, 0);
  const cone = makeMesh(new THREE.ConeGeometry(4.5, 8, 24, 1, true), MAT.steel(), 'cone');
  cone.rotation.x = Math.PI;
  cone.position.set(2, 34, 0);
  const grp = new THREE.Group();
  grp.add(g, rod, ring, cone);
  grp.userData.filterStand = true;
  grp.userData.ringY = 24;
  return grp;
};
BUILDERS.filterPump = (def) => {
  const g = new THREE.Group();
  const pump = makeMesh(new THREE.BoxGeometry(10, 6, 6), MAT.darkMetal(), 'pump');
  pump.position.y = 3;
  const motor = makeMesh(new THREE.CylinderGeometry(2.6, 2.6, 8, 20), MAT.darkMetal(), 'motor');
  motor.rotation.z = Math.PI / 2;
  motor.position.set(9, 3, 0);
  const port = makeMesh(new THREE.CylinderGeometry(0.8, 0.8, 5, 12), MAT.brass(), 'port');
  port.position.set(-5, 3.6, 0);
  port.rotation.z = Math.PI / 2;
  g.add(pump, motor, port);
  g.userData.filterPump = true;
  g.userData.electrical = true;
  g.userData.terminalNodes = [new THREE.Vector3(9, 0, 0), new THREE.Vector3(9, 6, 0)];
  return g;
};
BUILDERS.gasSyringe = (def) => {
  const R = mm(def.dims.diameterMm) / 2 || 1.4, H = mm(def.dims.heightMm) || 20;
  const g = new THREE.Group();
  const barrel = makeMesh(new THREE.CylinderGeometry(R, R, H, 26, 1, true), MAT.glass(), 'barrel');
  barrel.rotation.z = Math.PI / 2;
  const tex = makeGraduationTexture({ max: 100, major: 10, minor: 2, unit: 'cm3', width: 1024, height: 48 });
  const marks = new THREE.Mesh(new THREE.PlaneGeometry(H, R * 1.6), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  marks.rotation.y = Math.PI / 2;
  marks.position.set(0, 0, R * 1.02);
  marks.raycast = () => {};
  const plunger = makeMesh(new THREE.CylinderGeometry(R * 0.94, R * 0.94, 2, 22), MAT.rubber(), 'plunger');
  plunger.rotation.z = Math.PI / 2;
  plunger.position.x = -H * 0.1;
  plunger.name = 'plunger';
  const rod = makeMesh(new THREE.CylinderGeometry(0.3, 0.3, H, 12), MAT.plasticGrey(), 'rod');
  rod.rotation.z = Math.PI / 2;
  rod.position.x = -H * 0.6;
  const cap = makeMesh(new THREE.CylinderGeometry(R * 0.4, R * 0.4, 2.6, 14), MAT.plasticGrey(), 'nozzle');
  cap.rotation.z = Math.PI / 2;
  cap.position.x = H * 0.6;
  g.add(barrel, marks, plunger, rod, cap);
  g.userData.gasSyringe = true;
  g.userData.plunger = plunger;
  g.userData.plungerRange = { min: -H * 0.1, max: H * 0.45 };
  g.userData.volumeML = def.volumeML ?? 100;
  const cavity = makeCavity([{ h: H * 0.9, r0: R * 0.94, r1: R * 0.94 }]);
  const f = finishVessel(g, cavity, { mouthRadius: R * 0.4 });
  f.userData.heightCm = H;
  return f;
};
BUILDERS.syringe = (def) => {
  // The barrel length follows the nominal volume so that the graduations and
  // the plunger travel match what the syringe can actually hold.
  const volume = def.volumeML ?? def.capacityML ?? 10;
  const diaMm = def.dims?.diameterMm ?? 16;
  const rCm = (diaMm / 10) / 2;
  // gasSyringe uses 0.94 of the radius over 0.90 of the barrel length; make the
  // plunger travel cover exactly the nominal volume.
  const lengthCm = volume / (Math.PI * Math.pow(rCm * 0.94, 2) * 0.90);
  const g = BUILDERS.gasSyringe({ ...def, dims: { diameterMm: diaMm, heightMm: lengthCm * 10 }, volumeML: volume });
  g.userData.volumeML = volume;
  g.userData.liquidTight = true;
  return g;
};
BUILDERS.releaseUnit = (def) => {
  const g = new THREE.Group();
  const body = makeMesh(new THREE.BoxGeometry(10, 3, 10), MAT.plasticBlack(), 'body');
  body.position.y = 1.5;
  const clip = makeMesh(new THREE.BoxGeometry(2, 1.4, 2), MAT.steel(), 'clip');
  clip.position.y = 3.6;
  g.add(body, clip);
  g.userData.release = true;
  return g;
};

// ------------------------------------------------------------------ fan / PPE
BUILDERS.fan = (def) => {
  const g = new THREE.Group();
  const cage = makeMesh(new THREE.CylinderGeometry(9, 9, 7, 30, 1, true), MAT.steel(), 'cage');
  cage.rotation.z = Math.PI / 2;
  const blades = new THREE.Group();
  blades.name = 'blades';
  for (let i = 0; i < 5; i++) {
    const b = makeMesh(new THREE.BoxGeometry(1, 8, 3.4), MAT.plasticGrey(), 'blade' + i);
    b.rotation.x = (i / 5) * Math.PI * 2;
    b.rotation.z = 0.3;
    b.position.set(0, Math.cos((i / 5) * Math.PI * 2) * 4, Math.sin((i / 5) * Math.PI * 2) * 4);
    blades.add(b);
  }
  blades.rotation.y = Math.PI / 2;
  const hub = makeMesh(new THREE.CylinderGeometry(1.4, 1.4, 2, 14), MAT.darkMetal(), 'hub');
  hub.rotation.z = Math.PI / 2;
  const stand = makeMesh(new THREE.BoxGeometry(6, 1, 9), MAT.darkMetal(), 'stand');
  stand.position.y = -9.5;
  blades.add(hub);
  g.add(blades, cage, stand);
  g.userData.fan = true;
  g.userData.blades = blades;
  g.userData.bladeRadiusCm = 9;
  g.userData.rpm = 0;
  g.userData.electrical = true;
  g.userData.terminalNodes = [new THREE.Vector3(0, -9, 0), new THREE.Vector3(0, -9, 4)];
  return g;
};
BUILDERS.hairDryer = (def) => {
  const g = new THREE.Group();
  const body = makeMesh(new THREE.CylinderGeometry(3, 3.4, 16, 20), MAT.plasticBlack(), 'body');
  body.rotation.z = Math.PI / 2;
  const nozzle = makeMesh(new THREE.CylinderGeometry(2.2, 3, 6, 20), MAT.plasticBlack(), 'nozzle');
  nozzle.rotation.z = -Math.PI / 2;
  nozzle.position.x = 11;
  const handle = makeMesh(new THREE.BoxGeometry(3, 9, 3), MAT.plasticBlack(), 'handle');
  handle.position.set(-4, -6, 0);
  g.add(body, nozzle, handle);
  g.userData.hairDryer = true;
  g.userData.powerW = 800;
  g.userData.electrical = true;
  g.userData.terminalNodes = [new THREE.Vector3(-8, 0, 0), new THREE.Vector3(-8, 3, 0)];
  return g;
};
const wearables = (mat) => (def) => {
  const g = new THREE.Group();
  const body = makeMesh(new THREE.BoxGeometry(30, 42, 14), mat, 'garment');
  body.position.y = 24;
  const a1 = makeMesh(new THREE.BoxGeometry(8, 26, 10), mat, 'sleeveL');
  a1.position.set(-19, 28, 0);
  a1.rotation.z = 0.12;
  const a2 = makeMesh(new THREE.BoxGeometry(8, 26, 10), mat, 'sleeveR');
  a2.position.set(19, 28, 0);
  a2.rotation.z = -0.12;
  const collar = makeMesh(new THREE.TorusGeometry(7, 1.6, 8, 22), mat, 'collar');
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 45;
  g.add(body, a1, a2, collar);
  g.userData.wearable = def.id;
  return g;
};
BUILDERS.labCoat = wearables(MAT.cloth());
BUILDERS.gloves = (def) => {
  const g = new THREE.Group();
  for (const s of [-1, 1]) {
    const hand = makeMesh(new THREE.BoxGeometry(9, 3, 14), MAT.rubber(), 'glove' + s);
    hand.position.set(s * 14, 2, 0);
    const thumb = makeMesh(new THREE.CylinderGeometry(1.4, 1.4, 6, 12), MAT.rubber(), 'thumb' + s);
    thumb.rotation.z = Math.PI / 2.4;
    thumb.position.set(s * 19, 2, 4);
    const cuff = makeMesh(new THREE.CylinderGeometry(4.4, 4.4, 8, 18, 1, true), MAT.rubber(), 'cuff' + s);
    cuff.rotation.x = Math.PI / 2;
    cuff.position.set(s * 14, 2, -10);
    g.add(hand, thumb, cuff);
  }
  g.userData.wearable = def.id;
  return g;
};
BUILDERS.goggles = (def) => {
  const g = new THREE.Group();
  const lens = makeMesh(new THREE.BoxGeometry(20, 7, 0.6), new THREE.MeshPhysicalMaterial({ color: 0xcfe6f2, transparent: true, opacity: 0.45, roughness: 0.1 }), 'lens');
  lens.position.y = 3.5;
  const frame = makeMesh(new THREE.TorusGeometry(9, 1.1, 8, 26), MAT.plasticGrey(), 'frame');
  frame.scale.set(1.1, 0.45, 1);
  frame.position.y = 3.5;
  const strap = makeMesh(new THREE.TorusGeometry(13, 0.6, 8, 28), MAT.rubber(), 'strap');
  strap.rotation.y = Math.PI / 2;
  strap.scale.set(1, 0.4, 1);
  strap.position.set(0, 3.5, 0);
  g.add(frame, lens, strap);
  g.userData.wearable = def.id;
  return g;
};
BUILDERS.whiteTile = (def) => {
  const g = new THREE.Group();
  const t = makeMesh(new THREE.BoxGeometry(10, 0.6, 10), MAT.ceramic(), 'tile');
  t.position.y = 0.3;
  const border = makeMesh(new THREE.BoxGeometry(10.6, 0.3, 10.6), MAT.plasticBlack(), 'border');
  border.position.y = 0.15;
  g.add(border, t);
  g.userData.tile = true;
  return g;
};
BUILDERS.pencil = (def) => {
  const g = new THREE.Group();
  const body = makeMesh(new THREE.CylinderGeometry(0.32, 0.32, 16, 12), new THREE.MeshStandardMaterial({ color: 0xe4a33a, roughness: 0.7 }), 'pencil');
  body.rotation.z = Math.PI / 2;
  const tip = makeMesh(new THREE.ConeGeometry(0.32, 1.6, 12), new THREE.MeshStandardMaterial({ color: 0x333333 }), 'graphite');
  tip.rotation.z = -Math.PI / 2;
  tip.position.x = 8.8;
  const ferrule = makeMesh(new THREE.CylinderGeometry(0.34, 0.34, 1.2, 12), MAT.steel(), 'ferrule');
  ferrule.rotation.z = Math.PI / 2;
  ferrule.position.x = -8.4;
  const eraser = makeMesh(new THREE.CylinderGeometry(0.34, 0.34, 1.4, 12), new THREE.MeshStandardMaterial({ color: 0xe8a0a8 }), 'eraser');
  eraser.rotation.z = Math.PI / 2;
  eraser.position.x = -9.6;
  g.add(body, tip, ferrule, eraser);
  g.userData.writable = true;
  return g;
};
BUILDERS.generic = BUILDERS.whiteTile;

BUILDERS.desiccator = BUILDERS.dessicator;

// -------------------------------------------------------- terminal / port kit
const TERMINAL_RED = () => new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.45, metalness: 0.3 });
const TERMINAL_BLACK = () => new THREE.MeshStandardMaterial({ color: 0x24272a, roughness: 0.45, metalness: 0.3 });

/** A socket that a wire can be plugged into. */
export function makeTerminalPost(index) {
  const g = new THREE.Group();
  const post = makeMesh(new THREE.CylinderGeometry(0.28, 0.28, 1.0, 10), MAT.brass(), 'post');
  post.position.y = 0.5;
  const cap = makeMesh(new THREE.CylinderGeometry(0.62, 0.62, 0.45, 14), index === 0 ? TERMINAL_RED() : TERMINAL_BLACK(), 'socket');
  cap.position.y = 1.1;
  const hole = makeMesh(new THREE.CylinderGeometry(0.18, 0.18, 0.5, 8), new THREE.MeshBasicMaterial({ color: 0x0a0a0a }), 'hole');
  hole.position.y = 1.32;
  hole.raycast = () => {};
  g.add(post, cap, hole);
  g.userData.terminalSocket = index;
  g.userData.terminalAnchor = new THREE.Vector3(0, 1.3, 0);
  return g;
}

/**
 * Where a port physically sits on a finished apparatus group.
 * Ports are described in the catalogue, this converts them to scene space.
 */
export function portAnchorFor(group, port) {
  const ud = group.userData;
  const cavity = ud.cavity;
  const height = cavity ? cavity.height : (group.userData.heightCm || 10);
  const topR = cavity ? cavity.rAt(height) : 4;
  switch (port.kind) {
    case 'open':
      return port.position === 'bottom'
        ? new THREE.Vector3(0, 0.2, 0)
        : new THREE.Vector3(0, height, 0);
    case 'tap':
      return new THREE.Vector3(0, height + 3, 0);
    case 'stopper':
      return new THREE.Vector3(0, height, 0);
    case 'spout':
      return new THREE.Vector3(topR * 1.4, height - 0.4, 0);
    case 'gasInlet':
    case 'gasIn':
    case 'waterIn':
      return new THREE.Vector3(-topR - 1.6, height * 0.28, 0);
    case 'waterOut':
      return new THREE.Vector3(topR + 1.6, height * 0.8, 0);
    case 'joint':
      return new THREE.Vector3(topR + 0.6, height * 0.72, 0);
    case 'terminal':
      return new THREE.Vector3(topR, height * 0.5, 0);
    default:
      return new THREE.Vector3(0, height, 0);
  }
}

/** Normalise the catalogue record into the flags the simulation reads. */
export function applyApparatusData(group, def) {
  const ud = group.userData;
  ud.def = def;
  ud.apparatusId = def.id;
  ud.apparatusName = def.name;
  ud.category = def.category;
  ud.container = !!def.container;
  ud.capacityML = def.capacityML || (ud.cavity ? ud.cavity.volumeCm3 : 0);
  ud.heatable = !!def.heatable;
  ud.heatSource = !!def.heatSource || !!ud.heatSource;
  ud.powerW = def.powerW ?? ud.powerW ?? 0;
  ud.maxTempC = def.maxTempC ?? ud.maxTempC ?? 400;
  ud.flameTempC = def.flameTempC;
  ud.instrument = def.instrument || ud.instrument;
  ud.measures = def.measures;
  ud.electrical = !!def.electrical || !!ud.electrical;
  ud.glass = def.glass !== false;
  ud.massG = def.massG ?? 100;
  ud.insulated = def.insulated ?? (def.material === 'polystyrene' ? 0.9 : 0);
  ud.cooling = !!def.cooling || !!ud.cooling;
  ud.holdsApparatus = !!def.holdsApparatus || !!ud.holdsApparatus;
  ud.rackable = !!def.rackable;
  ud.optical = !!def.optical || !!ud.optical;
  ud.lightSource = !!def.lightSource || !!ud.lightSource;
  ud.slots = def.slots || ud.slots;
  ud.contents = def.contents;
  ud.bottle = !!def.bottle;
  ud.bands = def.bands;
  ud.specification = def.specification || ud.specification;
  ud.componentType = def.componentType;
  ud.value = def.value;
  ud.propId = def.id;
  if (def.dims) ud.dims = def.dims;
  ud.dimensions = {
    diameterMm: def.dims?.diameterMm ?? 60,
    heightMm: def.dims?.heightMm ?? (ud.cavity ? ud.cavity.height * 10 : 100)
  };
  ud.ports = (def.ports || ud.ports || []).map((p) => ({
    ...p,
    anchor: portAnchorFor(group, p)
  }));
  if (def.terminals && def.terminals.length) {
    const count = def.terminals.length;
    if (!ud.terminalNodes) {
      const w = (def.dims?.diameterMm ?? 60) / 10;
      ud.terminalNodes = [];
      for (let i = 0; i < count; i++) {
        ud.terminalNodes.push(new THREE.Vector3(
          count === 1 ? 0 : -w * 0.32 + (i / (count - 1)) * w * 0.64,
          1.0,
          (def.dims?.heightMm ?? 60) / 20
        ));
      }
    }
    ud.terminalNames = def.terminals.map((t) => (typeof t === 'string' ? t : t.id));
  }
  if (ud.electrical && ud.terminalNodes && !ud.terminalPosts) {
    const posts = new THREE.Group();
    posts.name = 'terminalPosts';
    posts.userData.isTerminalKit = true;
    ud.terminalNodes.forEach((p, i) => {
      const post = makeTerminalPost(i);
      post.position.copy(p);
      posts.add(post);
    });
    group.add(posts);
    ud.terminalPosts = posts;
  }
  return group;
}

// -------------------------------------------------------------- entry point
/** Build a complete apparatus object from its catalogue record. */
export function buildApparatus(def, opts = {}) {
  if (!def) throw new Error('buildApparatus: no definition');
  const builder = BUILDERS[def.shape] || BUILDERS.generic;
  let group;
  try {
    group = builder(def);
  } catch (err) {
    console.warn(`buildApparatus: builder for "${def.shape}" failed, using generic`, err);
    group = BUILDERS.generic(def);
  }
  if (!group || !group.isGroup) {
    console.warn(`buildApparatus: builder for "${def.shape}" returned nothing usable`);
    group = BUILDERS.generic(def);
  }
  group.name = def.id;
  applyApparatusData(group, def);
  if (opts.liquid) group.userData.liquidConfig = opts.liquid;
  group.traverse((o) => {
    o.castShadow = true;
    o.receiveShadow = true;
  });
  return group;
}

export const HAS_BUILDER = (shape) => typeof BUILDERS[shape] === 'function';
export const SHAPES = () => Object.keys(BUILDERS).sort();

// --------------------------------------------------------- named glass shapes
BUILDERS.test_tube = tubeBuilder();
BUILDERS.boiling_tube = tubeBuilder();
BUILDERS.measuring_cylinder = BUILDERS.measuringCylinder;

// ---------------------------------------------------------- laboratory fittings
/** A tap on the bench: gas taps and water taps share a body. */
function tapBuilder(kind) {
  return (def) => {
    const g = new THREE.Group();
    const stem = makeMesh(new THREE.CylinderGeometry(0.9, 1.0, 5, 16), kind === 'gas' ? MAT.brass() : MAT.steel(), 'stem');
    stem.position.y = 2.5;
    const nozzle = makeMesh(new THREE.CylinderGeometry(0.7, 0.7, 4.5, 14), kind === 'gas' ? MAT.brass() : MAT.steel(), 'nozzle');
    nozzle.rotation.z = Math.PI / 2.2;
    nozzle.position.set(1.7, 5.6, 0);
    const knob = makeMesh(new THREE.CylinderGeometry(1.5, 1.5, 1, 18), kind === 'gas' ? MAT.redRubber() : MAT.plasticWhite(), 'knob');
    knob.rotation.x = Math.PI / 2;
    knob.position.set(-1.2, 6.4, 0);
    knob.name = 'valveKnob';
    g.add(stem, nozzle, knob);
    if (kind === 'gas') {
      const flame = makeMesh(new THREE.ConeGeometry(0.7, 3.2, 12), new THREE.MeshBasicMaterial({ color: 0x7fc4ff, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }), 'pilotFlame');
      flame.position.set(3.6, 6.5, 0);
      flame.raycast = () => {};
      g.add(flame);
    }
    g.userData.tap = kind;
    g.userData.open = false;
    g.userData.knob = knob;
    g.userData.outlet = new THREE.Vector3(kind === 'gas' ? 3.6 : 3.4, kind === 'gas' ? 6.5 : 5.4, 0);
    return g;
  };
}
BUILDERS.gasTap = tapBuilder('gas');
BUILDERS.waterTap = tapBuilder('water');
BUILDERS.electrical_socket = (def) => {
  const g = new THREE.Group();
  const plate = makeMesh(new THREE.BoxGeometry(9, 9, 1.2), MAT.plasticWhite(), 'plate');
  plate.position.y = 0.6;
  for (const x of [-1.9, 1.9]) for (const y of [-1.6, 1.6]) {
    const hole = makeMesh(new THREE.CylinderGeometry(0.5, 0.5, 1.0, 12), MAT.plasticBlack(), 'pin');
    hole.position.set(x, 6.6 + y, 0.3);
    hole.rotation.x = Math.PI / 2;
    g.add(hole);
  }
  g.add(plate);
  const out = makeMesh(new THREE.CylinderGeometry(1.1, 1.1, 2.6, 16, 1, true), MAT.plasticBlack(), 'cableGland');
  out.rotation.x = Math.PI / 2;
  out.position.set(0, 4.5, 1.2);
  g.add(out);
  g.userData.socket = true;
  g.userData.liveV = 230;
  g.userData.terminalNodes = [new THREE.Vector3(-1.9, 7.5, 1), new THREE.Vector3(1.9, 7.5, 1)];
  g.userData.electrical = true;
  return g;
};
BUILDERS.socket = BUILDERS.electrical_socket;
BUILDERS.fumeHood = (def) => {
  const g = new THREE.Group();
  const w = mm(def.dims?.diameterMm ?? 1200) || 120;
  const h = mm(def.dims?.heightMm ?? 2400) || 240;
  const d = w * 0.65;
  const body = makeMesh(new THREE.BoxGeometry(w, h * 0.82, d), MAT.cabinet(), 'body');
  body.position.y = h * 0.41;
  const cut = makeMesh(new THREE.BoxGeometry(w * 0.86, h * 0.4, d * 0.8), new THREE.MeshStandardMaterial({ color: 0x2a2f33, roughness: 0.6, metalness: 0.2 }), 'interior');
  cut.position.set(0, h * 0.36, d * 0.06);
  const sash = makeMesh(new THREE.BoxGeometry(w * 0.88, h * 0.3, 1.2), MAT.glassThick(), 'sash');
  sash.position.set(0, h * 0.62, d * 0.42);
  sash.name = 'sash';
  const worktop = makeMesh(new THREE.BoxGeometry(w * 0.9, 1.6, d * 0.7), MAT.benchTop(), 'worktop');
  worktop.position.set(0, h * 0.155, d * 0.03);
  const duct = makeMesh(new THREE.CylinderGeometry(w * 0.14, w * 0.14, h * 0.3, 22), MAT.steel(), 'duct');
  duct.position.y = h * 0.95;
  const lamp = makeMesh(new THREE.BoxGeometry(w * 0.5, 1.2, 4), new THREE.MeshBasicMaterial({ color: 0xfff4d6 }), 'light');
  lamp.position.set(0, h * 0.75, d * 0.1);
  g.add(body, cut, worktop, sash, duct, lamp);
  g.userData.fumeHood = true;
  g.userData.sash = sash;
  g.userData.sashOpen = 0.35;
  g.userData.worktopY = h * 0.155 + 0.8;
  g.userData.airflowMs = 0.5;
  return g;
};
BUILDERS.sink = (def) => {
  const g = new THREE.Group();
  const w = mm(def.dims?.diameterMm ?? 500) || 50;
  const d = w * 0.8;
  const basin = makeMesh(new THREE.BoxGeometry(w, 16, d), MAT.steel(), 'basin');
  basin.position.y = 8;
  const inner = makeMesh(new THREE.BoxGeometry(w * 0.82, 12, d * 0.76), new THREE.MeshStandardMaterial({ color: 0x8d939a, roughness: 0.3, metalness: 0.9, side: THREE.DoubleSide }), 'bowl');
  inner.position.y = 11;
  const drain = makeMesh(new THREE.CylinderGeometry(2.4, 2.4, 0.6, 18), MAT.darkMetal(), 'drain');
  drain.position.y = 16.4;
  const tapBase = makeMesh(new THREE.CylinderGeometry(1.2, 1.2, 4, 14), MAT.steel(), 'tapBase');
  tapBase.position.set(0, 18, -d / 2 + 3);
  const spout = makeMesh(new THREE.CylinderGeometry(0.9, 0.9, 12, 14), MAT.steel(), 'spout');
  spout.position.set(0, 25, -d / 2 + 5);
  const head = makeMesh(new THREE.CylinderGeometry(0.6, 0.6, 6, 12), MAT.steel(), 'spoutHead');
  head.rotation.x = 1.0;
  head.position.set(0, 29, -d / 2 + 8);
  const handle = makeMesh(new THREE.BoxGeometry(6, 0.8, 1.2), MAT.steel(), 'handle');
  handle.position.set(0, 27.6, -d / 2 + 2);
  handle.name = 'sinkHandle';
  g.add(basin, inner, drain, tapBase, spout, head, handle);
  g.userData.sink = true;
  g.userData.outlet = new THREE.Vector3(0, 30, -d / 2 + 9);
  g.userData.bowl = { w: w * 0.82, d: d * 0.76, topY: 17 };
  return g;
};
BUILDERS.eyeWash = (def) => {
  const g = new THREE.Group();
  const bowl = makeMesh(new THREE.CylinderGeometry(9, 8, 3, 26), MAT.steel(), 'bowl');
  bowl.position.y = 34;
  const pillar = makeMesh(new THREE.CylinderGeometry(2, 2.4, 32, 18), MAT.steel(), 'pillar');
  pillar.position.y = 17;
  const base = makeMesh(new THREE.CylinderGeometry(6, 6.6, 2, 24), MAT.steel(), 'base');
  base.position.y = 1;
  for (const s of [-1, 1]) {
    const jet = makeMesh(new THREE.CylinderGeometry(0.7, 0.7, 2.4, 12), MAT.steel(), 'jet' + s);
    jet.position.set(s * 2, 36, 0);
    g.add(jet);
  }
  const board = makeMesh(new THREE.BoxGeometry(30, 22, 0.6), new THREE.MeshStandardMaterial({ color: 0x1f8b3a }), 'sign');
  board.position.set(0, 74, -1);
  const cross = makeMesh(new THREE.BoxGeometry(26, 4, 0.7), new THREE.MeshStandardMaterial({ color: 0xffffff }), 'cross');
  cross.position.set(0, 74, -0.6);
  g.add(pillar, base, bowl, board, cross);
  g.userData.eyeWash = true;
  return g;
};
BUILDERS.safetyShower = (def) => {
  const g = new THREE.Group();
  const pipe = makeMesh(new THREE.CylinderGeometry(1.6, 1.6, 210, 18), MAT.steel(), 'pipe');
  pipe.position.y = 105;
  const head = makeMesh(new THREE.CylinderGeometry(7, 9, 3, 26), MAT.steel(), 'showerHead');
  head.position.y = 208;
  const lever = makeMesh(new THREE.CylinderGeometry(0.6, 0.6, 16, 10), MAT.redRubber(), 'lever');
  lever.rotation.z = Math.PI / 2.4;
  lever.position.set(6, 150, 0);
  const sign = makeMesh(new THREE.BoxGeometry(26, 20, 0.6), new THREE.MeshStandardMaterial({ color: 0x1f8b3a }), 'sign');
  sign.position.set(0, 180, -2);
  g.add(pipe, head, lever, sign);
  g.userData.safetyShower = true;
  return g;
};
BUILDERS.firstAid = (def) => {
  const g = new THREE.Group();
  const box = makeMesh(new THREE.BoxGeometry(40, 30, 14), MAT.plasticWhite(), 'box');
  box.position.y = 30;
  const crossA = makeMesh(new THREE.BoxGeometry(20, 6, 0.6), new THREE.MeshStandardMaterial({ color: 0xc0392b }), 'crossH');
  crossA.position.set(0, 30, 7.4);
  const crossB = makeMesh(new THREE.BoxGeometry(6, 20, 0.6), new THREE.MeshStandardMaterial({ color: 0xc0392b }), 'crossV');
  crossB.position.set(0, 30, 7.4);
  const handle = makeMesh(new THREE.BoxGeometry(10, 1.4, 2), MAT.steel(), 'handle');
  handle.position.set(0, 46, 6);
  g.add(box, crossA, crossB, handle);
  g.userData.firstAid = true;
  return g;
};
BUILDERS.wasteContainer = (def) => {
  const kind = def.id.includes('solvent') ? 'solvent' : def.id.includes('heavy') ? 'heavy-metal' : 'general';
  const colour = { general: 0x4a4f55, solvent: 0xc0392b, 'heavy-metal': 0xd9a441 }[kind];
  const g = new THREE.Group();
  const bin = makeMesh(new THREE.CylinderGeometry(14, 13, 46, 26), new THREE.MeshStandardMaterial({ color: colour, roughness: 0.6, metalness: 0.2 }), 'bin');
  bin.position.y = 23;
  const lid = makeMesh(new THREE.CylinderGeometry(14.6, 14.6, 2.4, 26), MAT.darkMetal(), 'lid');
  lid.position.y = 47;
  const label = makeMesh(new THREE.PlaneGeometry(16, 10), new THREE.MeshStandardMaterial({ color: 0xf5f5f0 }), 'label');
  label.position.set(0, 30, 14.1);
  g.add(bin, lid, label);
  g.userData.wasteKind = kind;
  g.userData.wasteContainer = true;
  return g;
};
BUILDERS.safetyScreen = (def) => {
  const g = new THREE.Group();
  const frame = makeMesh(new THREE.BoxGeometry(46, 44, 1.4), MAT.plasticGrey(), 'frame');
  frame.position.y = 24;
  const panel = makeMesh(new THREE.BoxGeometry(43, 41, 0.8), new THREE.MeshPhysicalMaterial({ color: 0xcfe6f2, transparent: true, opacity: 0.28, roughness: 0.08 }), 'panel');
  panel.position.y = 24;
  const foot = makeMesh(new THREE.BoxGeometry(30, 2, 14), MAT.darkMetal(), 'foot');
  foot.position.y = 1;
  g.add(foot, frame, panel);
  g.userData.safetyScreen = true;
  return g;
};
BUILDERS.fireExtinguisher = (def) => {
  const g = new THREE.Group();
  const body = makeMesh(new THREE.CylinderGeometry(7, 7, 46, 22), new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.4, metalness: 0.35 }), 'body');
  body.position.y = 25;
  const top = makeMesh(new THREE.SphereGeometry(7, 20, 12), new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.4, metalness: 0.35 }), 'top');
  top.position.y = 48;
  const valve = makeMesh(new THREE.BoxGeometry(4, 5, 4), MAT.brass(), 'valve');
  valve.position.y = 55;
  const handle = makeMesh(new THREE.BoxGeometry(9, 1.4, 2.4), MAT.brass(), 'handle');
  handle.position.set(0, 58, 0);
  const hose = makeMesh(new THREE.CylinderGeometry(0.7, 0.7, 24, 10), MAT.rubber(), 'hose');
  hose.position.set(6, 40, 3);
  hose.rotation.x = 0.3;
  hose.rotation.z = -0.3;
  g.add(body, top, valve, handle, hose);
  g.userData.fireExtinguisher = true;
  return g;
};
