// ---------------------------------------------------------------------------
// LIQUIDS: RENDERING, POURING, PIPETTING AND MIXING
// ---------------------------------------------------------------------------
// All functions take a World as their first argument so that this module has no
// import cycle with world.js; World.prototype is patched with them at the end
// of that file.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { MAT } from './materials.js';
import { makeMesh, buildLiquidGeometry, retainedVolume, pourableVolume } from './geometry.js';
import { getSubstance } from '../core/substances.js';
import { applyReactions } from '../core/reactions.js';
import { clamp, round } from '../core/util.js';

export const POUR_RATE_ML_PER_S = 14;      // a beaker tipped over empties fast
export const POUR_MIN_ANGLE = 8;           // degrees of tilt before liquid reaches the lip
const PIPETTE_RATE = 12;

/** Colour of a mixture as a hex string the renderer can use. */
export function mixtureColour(mixture) {
  if (!mixture) return '#cfe3f0';
  return mixture.colourHex || '#cfe3f0';
}

/** Liquid body for a container: rebuilt whenever the contents change shape. */
export function refreshLiquid(world, obj) {
  if (!obj.mixture || !obj.cavity) return;
  const m = obj.mixture;
  const key = `${round(m.aqVolume, 1)}|${round(m.orgVolume, 1)}|${Math.round(m.solidMass * 10)}|${m.colourHex}|${m.phaseCount}`;
  if (obj.visual.liquidKey === key && obj.visual.liquid) return;
  obj.visual.liquidKey = key;

  if (obj.visual.liquid) { obj.group.remove(obj.visual.liquid); disposeGroup(obj.visual.liquid); obj.visual.liquid = null; }
  if (m.volume < 0.05) { return; }

  const group = new THREE.Group();
  group.name = 'liquidBody';
  group.userData.isLiquid = true;
  const height = obj.cavity.heightForVolume(Math.min(m.volume, obj.capacityML));

  if (m.aqVolume > 0.02) {
    const geo = buildLiquidGeometry(obj.cavity, obj.cavity.heightForVolume(Math.min(m.aqVolume, obj.capacityML)));
    const mesh = makeMesh(geo, MAT.liquid(mixtureColour(m), 0.72), 'aqueous');
    mesh.raycast = () => {};
    group.add(mesh);
    applySolidLayer(group, obj, 0);
  }
  if (m.orgVolume > 0.02) {
    const aqH = m.aqVolume > 0 ? obj.cavity.heightForVolume(Math.min(m.aqVolume, obj.capacityML)) : 0;
    const top = obj.cavity.heightForVolume(Math.min(m.volume, obj.capacityML));
    const orgH = Math.max(top - aqH, 0.05);
    const seg = [{ h: orgH, r0: Math.max(obj.cavity.rAt(aqH) - 0.04, 0.05), r1: Math.max(obj.cavity.rAt(top) - 0.04, 0.05) }];
    const geo = buildLiquidGeometry({ rAt: obj.cavity.rAt, heightForVolume: (v) => v / Math.max(Math.PI * Math.pow((obj.cavity.rAt(top) * 0.9), 2), 0.2), segments: seg, height: orgH }, orgH);
    const mesh = makeMesh(geo, MAT.liquid(m.organicColour || '#e8d98a', 0.85), 'organic');
    mesh.position.y = aqH;
    mesh.raycast = () => {};
    group.add(mesh);
  }
  // the surface: a slightly darker disc so the level reads clearly
  const surf = makeMesh(new THREE.CircleGeometry(Math.max(obj.cavity.rAt(height) - 0.05, 0.05), 32), MAT.liquid(mixtureColour(m), 0.85), 'surface');
  surf.rotation.x = -Math.PI / 2;
  surf.position.y = height;
  surf.raycast = () => {};
  group.add(surf);

  obj.visual.liquid = group;
  obj.group.add(group);
}

function applySolidLayer(group, obj, baseY) {
  const m = obj.mixture;
  if (!m || m.solidMass < 1e-4) return;
  const r = Math.max(obj.cavity.rAt(0) * 0.92, 0.3);
  const depth = clamp(Math.cbrt(m.solidMass / Math.max(Math.PI * r * r * 0.5, 0.5)) * 0.5, 0.05, 3);
  const disc = makeMesh(new THREE.CylinderGeometry(r, r * 0.98, depth, 28), MAT.solidLiquid(m.solidColour || '#e8e8e8'), 'sediment');
  disc.position.y = baseY + depth / 2;
  disc.raycast = () => {};
  group.add(disc);
}

/** Animated effects: bubbles when boiling, crystals settling, froth. */
export function updateLiquidEffects(world, obj, dt) {
  const m = obj.mixture;
  if (!m || !obj.cavity) return;
  const nearBoil = m.temperature > 92 && m.volume > 0.2;
  if (nearBoil) {
    obj.state.bubbles += dt * 26;
    if (!obj.visual.bubbles) {
      const g = new THREE.Group();
      g.name = 'bubbles';
      g.userData.isEffect = true;
      for (let i = 0; i < 10; i++) {
        const b = makeMesh(new THREE.SphereGeometry(0.18 + Math.random() * 0.2, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }), 'bubble' + i);
        b.raycast = () => {};
        b.userData.phase = Math.random();
        g.add(b);
      }
      obj.visual.bubbles = g;
      obj.group.add(g);
    }
    const h = obj.liquidHeight();
    obj.visual.bubbles.children.forEach((b, i) => {
      const t = (obj.state.bubbles * 0.35 + b.userData.phase + i * 0.1) % 1;
      const rr = obj.cavity.rAt(t * h) * (0.3 + 0.5 * ((i * 37) % 10) / 10);
      const a = i * 2.4;
      b.position.set(Math.cos(a) * rr, t * h, Math.sin(a) * rr);
      b.scale.setScalar(0.6 + t * 0.8);
    });
    if (!obj.state.boiling) {
      obj.state.boiling = true;
      world.emit({ type: 'observation', id: obj.id, text: `The liquid in the ${obj.name} is boiling - bubbles rise steadily through it.` });
    }
  } else {
    if (obj.visual.bubbles) { obj.group.remove(obj.visual.bubbles); disposeGroup(obj.visual.bubbles); obj.visual.bubbles = null; }
    obj.state.boiling = false;
  }
}

// ----------------------------------------------------------------- pouring
/** Which object a poured stream will land in, if any. */
export function findPourTarget(world, from, point = null) {
  const lip = point || from.lipWorldPosition();
  const below = lip.clone();
  below.y -= 12;
  const candidates = world.list().filter((o) => o !== from && o.mixture);
  let best = null, bestD = Infinity;
  for (const o of candidates) {
    const dx = o.position.x - lip.x, dz = o.position.z - lip.z;
    const d = Math.hypot(dx, dz);
    if (d > o.footprintRadius() + 4) continue;
    if (o.position.y > lip.y + 2) continue;
    if (d < bestD) { bestD = d; best = o; }
  }
  return best;
}

/**
 * Tilt-driven pouring: called every frame while an object is tipped.
 * @returns {{poured:number, target:string|null}}
 */
export function pourTick(world, obj, dt, { rate = null, mouth = true } = {}) {
  if (!obj.mixture || obj.mixture.volume < 0.02) return { poured: 0, target: null };
  const tiltDeg = (Math.abs(obj.tilt) * 180) / Math.PI;
  if (tiltDeg < POUR_MIN_ANGLE) return { poured: 0, target: null };
  const canPour = pourableVolume(obj.cavity, obj.mixture.volume, tiltDeg, { lipRadius: obj.group.userData.mouthRadius });
  if (canPour < 0.02) return { poured: 0, target: null };
  const excess = clamp(canPour / Math.max(obj.mixture.volume, 0.5), 0.05, 1);
  const flow = Math.min(canPour, (rate ?? POUR_RATE_ML_PER_S) * (0.35 + 0.65 * excess) * dt);
  const target = mouth ? findPourTarget(world, obj) : null;
  const aqFirst = obj.mixture.aqVolume >= obj.mixture.orgVolume;
  const drawn = obj.mixture.drawVolume(flow, aqFirst ? 'aqueous' : 'organic');
  if (drawn.volume <= 0) return { poured: 0, target: null };
  world.stats.pourCount++;
  if (target) {
    receivePour(world, target, drawn, obj);
    world.emit({ type: 'pour', from: obj.id, to: target.id, volumeML: round(drawn.volume, 2) });
  } else {
    world.spill(obj.position.x + obj.footprintRadius(), obj.position.z, drawn.volume, null);
    world.emit({ type: 'pour', from: obj.id, to: null, volumeML: round(drawn.volume, 2) });
  }
  refreshLiquid(world, obj);
  return { poured: drawn.volume, target: target ? target.id : null };
}

/** Move a drawn volume into a receiving container. */
export function receivePour(world, target, drawn, source) {
  const m = target.mixture;
  const room = target.capacityML - m.volume;
  const volume = Math.min(drawn.volume, Math.max(room, 0));
  const frac = drawn.volume > 0 ? volume / drawn.volume : 0;
  for (const [id, mol] of drawn.aqueous) m.addAqueous(id, mol * frac);
  for (const [id, mol] of drawn.organic) m.addOrganic(id, mol * frac);
  for (const [id, g] of drawn.solids || []) m.addSolidSpecies(id, g * frac);
  // the transferred volume joins the phase it was drawn from
  if (drawn.organic && drawn.organic.size) m.orgVolume = Math.min(m.orgVolume + volume, target.capacityML);
  else m.aqVolume = Math.min(m.aqVolume + volume, target.capacityML);
  // heat travels with the liquid (lumped capacitance mixing)
  if (source?.mixture && drawn.temperature != null) {
    const c1 = m.heatCapacity, c2 = source.mixture.heatCapacity * frac;
    m.temperature = clamp((m.temperature * c1 + drawn.temperature * c2) / Math.max(c1 + c2, 0.01), -10, 1500);
  }
  const overflow = Math.max(0, m.volume - target.capacityML);
  if (overflow > 0.01) {
    m.drawVolume(overflow);
    world.spill(target.position.x + 2, target.position.z + 2, overflow, null);
  }
  const events = applyReactions(m, world.reactionContext(target));
  world.reportReactions(target, events);
  refreshLiquid(world, target);
}

/** Decant the liquid layer off a settled solid. */
export function decant(world, fromId, toId, volumeML = null) {
  const from = world.get(fromId), to = world.get(toId);
  if (!from?.mixture || !to?.mixture) return { error: 'both objects must be containers' };
  const v = volumeML ?? from.mixture.aqVolume;
  const drawn = from.mixture.drawVolume(v, 'aqueous');
  receivePour(world, to, drawn, from);
  refreshLiquid(world, from);
  world.emit({ type: 'decant', from: fromId, to: toId, volumeML: round(drawn.volume, 2) });
  return { volumeML: drawn.volume };
}

/** Draw a fixed volume with a pipette (volumetric pipettes fill to the mark). */
export function pipette(world, fromId, pipetteId, toId, volumeML = null) {
  const from = world.get(fromId), pip = world.get(pipetteId), to = toId ? world.get(toId) : null;
  if (!from?.mixture || !pip) return { error: 'need a source container and a pipette' };
  const nominal = volumeML ?? from.def.fixedVolume ?? 25;
  const drawn = from.mixture.drawVolume(Math.min(nominal, from.mixture.aqVolume), 'aqueous');
  pip.state.held = drawn;
  refreshLiquid(world, from);
  world.emit({ type: 'pipette', from: fromId, pipette: pipetteId, volumeML: round(drawn.volume, 2) });
  if (to) return dispense(world, pipetteId, toId);
  return { volumeML: drawn.volume };
}

/** Empty a pipette into a container. */
export function dispense(world, pipetteId, toId) {
  const pip = world.get(pipetteId), to = world.get(toId);
  if (!pip?.state.held || !to?.mixture) return { error: 'nothing to dispense' };
  receivePour(world, to, pip.state.held, pip);
  pip.state.held = null;
  world.emit({ type: 'dispense', pipette: pipetteId, to: toId });
  return { ok: true };
}

/** Burette delivery: the tap runs at a slow, measurable rate. */
export function buretteDeliver(world, buretteId, toId, seconds) {
  const b = world.get(buretteId), to = world.get(toId);
  if (!b?.mixture || !to?.mixture) return { error: 'need a burette and a receiving container' };
  const volume = clamp(0.6 * seconds, 0, b.mixture.aqVolume);
  const drawn = b.mixture.drawVolume(volume, 'aqueous');
  receivePour(world, to, drawn, b);
  refreshLiquid(world, b);
  return { volumeML: drawn.volume };
}

/** Stir (or swirl) a container: homogenises layers and speeds reactions. */
export function stir(world, id, seconds = 3) {
  const obj = world.get(id);
  if (!obj?.mixture) return null;
  const m = obj.mixture;
  // mixing an organic layer back in is only possible if it is miscible; a stir
  // bar mainly homogenises the aqueous phase and speeds up reactions
  const events = applyReactions(m, { ...world.reactionContext(obj), stirred: true });
  world.reportReactions(obj, events);
  obj.stirring = seconds;
  if (obj.visual.liquid) {
    obj.group.remove(obj.visual.liquid);
    disposeGroup(obj.visual.liquid);
    obj.visual.liquid = null;
    obj.visual.liquidKey = null;
    refreshLiquid(world, obj);
  }
  return { ok: true };
}

export function disposeGroup(g) {
  if (!g) return;
  g.traverse((o) => {
    if (o.isMesh) {
      o.geometry?.dispose?.();
    }
  });
  g.parent?.remove(g);
}

export const liquidMethods = {
  refreshLiquid(obj) { refreshLiquid(this, obj); },
  pourTick(obj, dt, opts) { return pourTick(this, obj, dt, opts); },
  pourInto(fromId, toId, volumeML = null) { return decant(this, fromId, toId, volumeML); },
  decantInto(fromId, toId, volumeML) { return decant(this, fromId, toId, volumeML); },
  usePipette(fromId, pipetteId, toId, volumeML) { return pipette(this, fromId, pipetteId, toId, volumeML); },
  dispenseFrom(pipetteId, toId) { return dispense(this, pipetteId, toId); },
  runBurette(buretteId, toId, seconds) { return buretteDeliver(this, buretteId, toId, seconds); },
  stir(id, seconds) { return stir(this, id, seconds); },
  mixtureColour(obj) { return mixtureColour(obj?.mixture); }
};
