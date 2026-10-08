// ---------------------------------------------------------------------------
// THE SIMULATION STEP
// ---------------------------------------------------------------------------
// Everything that happens to the apparatus as time passes: heat, boiling,
// evaporation, pressure, chemistry, electrolysis, circuits, instruments and
// safety.  Functions take a World so there is no import cycle with world.js.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { stepThermal, AMBIENT_C, pressureKPa } from '../core/thermal.js';
import { applyReactions, stepReactions } from '../core/reactions.js';
import { solveCircuit } from '../core/circuit.js';
import { readInstrument, formatReading, INSTRUMENTS } from '../core/measurement.js';
import { checkSafety } from '../core/safety.js';
import { electrolyse, predictElectrolysis, isConductive, conductivityRank } from '../core/electrolysis.js';
import { clamp, round, uid } from '../core/util.js';
import { getSpecies } from '../core/species.js';
import { refreshLiquid, updateLiquidEffects } from './liquid.js';
import { circuitElementFor } from './electrical.js';

const ROOM_TEMP = AMBIENT_C;
const MAX_STEP = 0.1;
const MAX_DT = 300;                 // never fast-forward more than 5 simulated minutes per tick

// --------------------------------------------------------------- heat sources
/** Effective heat source reaching an object, from flames, plates and baths. */
export function heatSourcesFor(world, obj) {
  const sources = [];
  const contact = [];
  for (const other of world.list()) {
    if (other === obj) continue;
    const ud = other.group.userData;
    const d = Math.hypot(other.position.x - obj.position.x, other.position.z - obj.position.z);
    // ---- flames
    if (ud.heatSource && ud.flame && ud.flame.visible) {
      const anchor = other.group.localToWorld((ud.flameAnchor || new THREE.Vector3(0, 0, 0)).clone());
      const vertical = obj.position.y - anchor.y;
      const dist = Math.hypot(obj.position.x - anchor.x, obj.position.z - anchor.z);
      // The flame has a real length: a beaker standing over the burner has its
      // base inside the flame, so the effective gap (not the gap to the burner
      // base) is what limits heat transfer.  A closed air hole (yellow safety
      // flame) is much cooler than a roaring blue flame.
      const airHole = other.group.userData.airHole ?? 0.5;
      const flameLength = 8 + 6 * clamp(airHole, 0, 1);
      const powerScale = 0.35 + 0.65 * clamp(airHole, 0, 1);
      if (vertical > -3 && vertical < flameLength + 9 && dist < 9) {
        const power = (other.def.powerW ?? ud.powerW ?? 250) * (other.setting ?? 1) * powerScale;
        const gap = Math.max(vertical - flameLength, 0);
        sources.push({
          powerW: power,
          distanceM: clamp(gap / 100, 0.004, 0.14),
          targetDiameter: (ud.dimensions?.diameterMm ?? 60) / 1000,
          targetTemperatureC: (other.def.flameTempC ?? ud.flameTempC ?? 900) * (0.45 + 0.55 * airHole),
          on: true
        });
      }
    }
    // ---- hot surfaces (hot plate, mantle, stirrer plate, bath)
    if (ud.contactPlate || ud.holdsApparatus || ud.heatingMantle) {
      const plateY = other.position.y + (ud.contactPlate?.y ?? ud.holdsAt?.y ?? 0);
      const dx = Math.hypot(obj.position.x - other.position.x, obj.position.z - other.position.z);
      const radius = ud.contactPlate?.radius ?? (ud.dimensions?.diameterMm ?? 150) / 20;
      if (dx < radius + 2 && Math.abs(obj.position.y - plateY) < 6) {
        const on = other.heatOn || other.state.setting > 0 || other.setting > 0;
        const power = (other.def.powerW ?? ud.powerW ?? 200) * clamp(other.setting || (on ? 1 : 0), 0, 1);
        const target = on ? (other.def.maxTempC ?? ud.maxTempC ?? 300) : AMBIENT_C;
        if (on) sources.push({ powerW: power, distanceM: 0.006, targetDiameter: 0.09, targetTemperatureC: target, on: true });
        else contact.push({ temperatureC: AMBIENT_C, conductanceWperK: 0.6 });
      }
      // ---- baths: the object sits IN the liquid
      if (ud.holdsApparatus && other.mixture && other.mixture.volume > 5) {
        const below = obj.position.y < other.position.y + (ud.cavity?.height ?? 10);
        const inside = dx < (ud.cavity?.rAt((ud.cavity?.height ?? 10) * 0.6) ?? 8);
        if (below && inside) {
          contact.push({ temperatureC: other.mixture.temperature, conductanceWperK: 3.2 * (obj.def.glass === false ? 1.6 : 1) });
        }
      }
    }
    // ---- cooling bath (ice)
    if (ud.cooling && other.mixture) {
      const dx = Math.hypot(obj.position.x - other.position.x, obj.position.z - other.position.z);
      if (dx < (ud.cavity?.rAt(2) ?? 8) && obj.position.y < other.position.y + 12) {
        contact.push({ temperatureC: other.mixture.temperature, conductanceWperK: 2.5 });
      }
    }
  }
  return { sources, contact };
}

/**
 * A container can touch several things at once (bench, water bath, lagging).
 * Combine them into one conductance-weighted contact so the lumped model can
 * use it: Teff = sum(k.T) / sum(k).
 */
export function lumpContacts(contacts) {
  if (!contacts || !contacts.length) return null;
  let k = 0, kt = 0;
  for (const c of contacts) {
    const kk = Math.max(c.conductanceWperK ?? 0, 0);
    k += kk;
    kt += kk * (c.temperatureC ?? ROOM_TEMP);
  }
  k += 0.4;          // always something (the bench under it)
  kt += 0.4 * ROOM_TEMP;
  return { temperatureC: kt / k, conductanceWperK: k };
}

/** Air movement from a fan or the fume cupboard sash. */
export function airFlowFor(world, obj) {
  let flow = 0;
  for (const other of world.list()) {
    if (other.group.userData.fan && other.state.rpm > 30) {
      const d = Math.hypot(other.position.x - obj.position.x, other.position.z - obj.position.z);
      if (d < 60) flow += clamp(1 - d / 60, 0, 1) * 2.2;
    }
    if (other.group.userData.fumeHood && obj.surfaceId === 'hood_deck') flow += 1.2;
  }
  return flow;
}

/** The lumped-capacitance state the thermal model wants for an object. */
export function thermalStateFor(world, obj) {
  const m = obj.mixture;
  if (m) {
    return {
      ...obj.state,
      temperature: m.temperature,
      heatCapacity: m.heatCapacity,
      volumeML: m.volume,
      massG: m.mass + (obj.def.massG ?? 100),
      surfaceArea: 2 * Math.PI * Math.pow((obj.cavity?.rAt(obj.cavity.height * 0.5) ?? 3) / 100, 2) + 2 * Math.PI * ((obj.cavity?.rAt(2) ?? 3) / 100) * ((obj.cavity?.height ?? 10) / 100),
      boilingPoint: boilingPointOf(m),
      isWater: (m.aqueous.get('H2O') || 0) > 1e-6,
      insulated: obj.group.userData.insulated || (obj.heldBy && world.get(obj.heldBy)?.def.material === 'polystyrene' ? 0.85 : 0),
      sealed: !!obj.sealed,
      gasMoles: m.gasMoles,
      headspaceL: Math.max(obj.capacityML - m.volume, 5) / 1000,
      iceMassG: obj.state.iceMassG || 0
    };
  }
  return {
    ...obj.state,
    temperature: obj.state.temperatureC ?? AMBIENT_C,
    heatCapacity: (obj.def.massG ?? 200) * (obj.def.material === 'copper' ? 0.39 : 0.9),
    volumeML: 0,
    surfaceArea: 0.03,
    boilingPoint: 2000,
    isWater: false
  };
}

/** Boiling point elevation from dissolved solutes (a first-order estimate). */
export function boilingPointOf(mixture) {
  let mol = 0;
  for (const [id, n] of mixture.aqueous) if (id !== 'H2O') mol += n;
  const V = Math.max(mixture.aqVolume / 1000, 1e-6);
  const molality = mol / Math.max(mixture.aqVolume / 1000, 1e-6);
  return 100 + Math.min(molality * 0.9, 22);
}

// ------------------------------------------------------------- the thermal step
export function thermalTick(world, obj, dt) {
  const state = thermalStateFor(world, obj);
  const { sources, contact } = heatSourcesFor(world, obj);
  const flow = airFlowFor(world, obj);
  // lump several contact paths (bath + bench + lagging) into one conductance
  const lumped = lumpContacts(contact);
  const res = stepThermal(state, dt, {
    ambientC: ROOM_TEMP,
    sources,
    contact: lumped,
    h: 14 + flow * 12,
    area: state.surfaceArea
  });
  const heated = res.dT !== 0 || res.evaporatedML > 0 || res.meltedIceG > 0 || res.boilRateMLperS > 0;
  if (obj.mixture) {
    obj.mixture.temperature = state.temperature;
    if (res.evaporatedML > 0) {
      const vapour = obj.mixture.evaporate(res.evaporatedML * (1 + flow));
      if (vapour > 0) {
        obj.state.vapourG = (obj.state.vapourG || 0) + vapour;
        if (!obj.sealed) world.noteVapour(obj);
      }
    }
    if (res.boiledDry && obj.mixture.volume < 1) {
      world.emit({ type: 'observation', id: obj.id, text: `The ${obj.name} has boiled dry - remove it from the heat before the glass cracks.`, severity: 'caution' });
    }
    obj.state.gasPressureKPa = pressureKPa(obj.mixture.gasMoles, Math.max(obj.capacityML - obj.mixture.volume, 5) / 1000, obj.mixture.temperature);
    if (obj.sealed && obj.state.gasPressureKPa > 180) {
      world.emit({ type: 'safety', severity: 'critical', text: `The sealed ${obj.name} is over-pressurised (${Math.round(obj.state.gasPressureKPa)} kPa). It must be vented or unsealed.`, id: obj.id });
    }
  } else if (heated) {
    obj.state.temperatureC = state.temperature;
  }
  // heat sources themselves heat up (their bodies glow / show a temperature)
  const ud = obj.group.userData;
  if (ud.heatSource) {
    const on = obj.heatOn || (ud.flame && ud.flame.visible);
    const target = on ? (obj.def.maxTempC ?? 300) : ROOM_TEMP;
    obj.state.bodyTempC = clamp((obj.state.bodyTempC ?? ROOM_TEMP) + (target - (obj.state.bodyTempC ?? ROOM_TEMP)) * clamp(dt / 12, 0, 1), ROOM_TEMP, target);
    if (ud.contactPlate && obj.state.bodyTempC > 60) world.hotSurfaceNote(obj, obj.state.bodyTempC);
  }
  if (obj.def?.insulated) { /* lagging keeps its own negligible heat */ }
  return res;
}

// ----------------------------------------------------------------- chemistry
export function chemistryTick(world, obj, dt) {
  const m = obj.mixture;
  if (!m) return;
  const ctx = world.reactionContext(obj);
  const slow = stepReactions(m, dt, ctx);
  const fast = applyReactions(m, ctx);
  if (slow.length || fast.length) world.reportReactions(obj, [...slow, ...fast]);
}

// --------------------------------------------------------------------- gases
/** Gas leaving a bubbling container is either collected or lost to the room. */
export function gasTick(world, obj, dt) {
  const m = obj.mixture;
  if (!m) return;
  // connected delivery tube: move gas to the receiving vessel
  const tube = world.tubeFrom(obj.id);
  if (tube && m.gasMoles > 1e-7) {
    const target = world.get(tube.to);
    if (target) {
      let moved = 0;
      for (const [id, mol] of [...m.gas]) {
        const take = mol * clamp(dt * 2.5, 0, 1);
        m.gas.set(id, mol - take);
        if (m.gas.get(id) < 1e-12) m.gas.delete(id);
        target.mixture ? target.mixture.addGas(id, take) : (target.state.colledGas = (target.state.colledGas || 0) + take);
        moved += take;
      }
      if (moved > 1e-6 && !obj.state.bubblingNoted) {
        obj.state.bubblingNoted = true;
        world.emit({ type: 'observation', id: obj.id, text: `Gas is collecting in the ${target.name}.` });
      }
    }
  } else if (m.gasMoles > 1e-6 && !obj.sealed && m.temperature > 60) {
    // gas escapes to the fume cupboard / room
    const loss = m.gasMoles * clamp(dt * 0.9, 0, 1) * 0.05;
    world.noteGasLoss(obj, loss);
  }
  // gases dissolve back into the liquid when cold and unsealed
  if (!obj.sealed && m.temperature < 40 && m.gas.size) {
    for (const [id, mol] of [...m.gas]) {
      const sp = getSpeciesOrNull(id);
      if (!sp || (sp.solubility ?? 0) < 0.1) continue;
      const back = mol * clamp(dt * 0.02, 0, 0.2);
      m.gas.set(id, mol - back);
      m.aqueous.set(id, (m.aqueous.get(id) || 0) + back);
    }
  }
}

function getSpeciesOrNull(id) {
  try { return getSpecies(id); } catch { return null; }
}

// ------------------------------------------------------------------- circuits
export function circuitTick(world, dt) {
  const comps = [];
  for (const obj of world.list()) {
    if (!obj.electrical) continue;
    if (!world.isWired(obj.id)) { obj.state.currentA = 0; obj.state.voltageV = 0; continue; }
    if (obj.def.componentType === 'electrode') updateElectrodeResistance(world, obj);
    comps.push(circuitElementFor(obj.def, obj));
  }
  const wires = world.wires.filter((w) => world.get(w.from.objectId) && world.get(w.to.objectId))
    .map((w) => ({ from: { componentId: w.from.objectId, terminal: w.from.terminal }, to: { componentId: w.to.objectId, terminal: w.to.terminal } }));
  if (!comps.length || !wires.length) { world.circuitSolution = null; return; }
  const solution = solveCircuit(comps, wires);
  world.circuitSolution = solution;
  if (!solution.ok) {
    if (solution.reason && world.lastCircuitReason !== solution.reason) {
      world.lastCircuitReason = solution.reason;
      world.emit({ type: 'circuit', severity: 'caution', text: solution.reason });
    }
    return;
  }
  world.lastCircuitReason = null;
  for (const warning of solution.warnings || []) {
    if (world.seenWarning !== warning) { world.seenWarning = warning; world.emit({ type: 'circuit', severity: 'caution', text: warning }); }
  }
  for (const obj of world.list()) {
    if (!obj.electrical) continue;
    const el = solution.elements[obj.id];
    if (!el) continue;
    obj.state.currentA = el.current ?? 0;
    obj.state.voltageV = Math.abs(el.potentialDifference ?? 0);
    obj.state.powerW = Math.abs((el.current ?? 0) * (el.potentialDifference ?? 0));
    world.stats.currentMax = Math.max(world.stats.currentMax, Math.abs(obj.state.currentA));
    applyElectricalVisual(world, obj, el, dt);
  }
}

function applyElectricalVisual(world, obj, el, dt) {
  const ud = obj.group.userData;
  const rated = obj.def.ratedPower ?? 1;
  const power = Math.abs(obj.state.powerW || 0);
  const load = clamp(power / Math.max(rated, 1e-6), 0, 6);
  // ---- lamps
  if (ud.light && obj.def.componentType === 'lamp') {
    const brightness = clamp(power / Math.max(rated, 1e-6), 0, 1.4);
    obj.state.lit = brightness;
    ud.light.intensity = 40 * brightness;
    if (ud.filament) {
      const col = new THREE.Color().setHSL(0.11, 1, 0.35 + 0.4 * brightness);
      ud.filament.material.color.copy(col);
    }
    if (obj.def.ratedPower && power > obj.def.ratedPower * 2.2) {
      if (!obj.state.failed) {
        obj.state.failed = true;
        ud.light.intensity = 0;
        world.emit({ type: 'circuit', severity: 'caution', text: `The lamp in the ${obj.name} has blown: ${formatVolts(obj.state.voltageV)} across a lamp rated ${obj.def.specification || ''}.` });
      }
    }
  }
  // ---- LEDs
  if (obj.def.componentType === 'led') {
    const on = (el.current ?? 0) > 5e-4 && !obj.state.failed;
    obj.state.lit = on ? 1 : 0;
    if (ud.light) ud.light.intensity = on ? 6 : 0;
    if (ud.ledBody) ud.ledBody.material.emissiveIntensity = on ? 1.6 : 0.05;
    if (!on && el.reverse) obj.state.reverse = true;
  }
  // ---- motors and fans
  if (obj.group.userData.spinningDisc || obj.group.userData.motor) {
    const w = clamp(obj.state.powerW / Math.max(rated, 0.5), 0, 3) * 40;
    obj.state.rpm = (obj.state.rpm ?? 0) + (w - (obj.state.rpm ?? 0)) * clamp(dt * 2, 0, 1);
    if (obj.group.userData.spinningDisc) obj.group.userData.spinningDisc.rotation.x += (obj.state.rpm / 60) * dt * Math.PI * 2;
  }
  if (obj.group.userData.fan) {
    obj.state.rpm = clamp(obj.state.powerW / 2, 0, 2000) * 0.9;
    if (obj.group.userData.blades) obj.group.userData.blades.rotation.x += (obj.state.rpm / 60) * dt * Math.PI * 2 * 0.4;
  }
  // ---- heaters (immersion heater, kettle, dryer) raise the temperature of
  //      whatever they are standing in
  if (/heater|hairDryer|kettle/.test(obj.def.componentType || obj.def.id) && obj.state.powerW > 0.1) {
    const target = world.find((o) => o !== obj && o.mixture && Math.hypot(o.position.x - obj.position.x, o.position.z - obj.position.z) < 8 && o.position.y <= obj.position.y + 14);
    if (target) {
      const J = obj.state.powerW * dt * 0.85;
      const dT = target.mixture.applyEnergy(J);
      if (dT) world.emit({ type: 'heating', id: target.id, dT });
    }
  }
}

const formatVolts = (v) => `${round(v, 2)} V`;

// ---------------------------------------------------------------- electrolysis
/** Resistance of the electrolysis cell, set by how well the electrolyte conducts. */
export function updateElectrodeResistance(world, obj) {
  const vessel = electrolyteVessel(world, obj);
  if (!vessel || vessel.mixture.volume < 1) { obj.state.electrolyteResistanceC = 1e6; return null; }
  const rank = conductivityRank(vessel.mixture);
  // rank 0 = insulator, ~1 = ordinary bench solution
  obj.state.electrolyteResistanceC = rank < 0.1 ? 1e6 : clamp(160 / rank, 12, 4000);
  return vessel;
}

/** The container whose liquid the electrodes are dipping into. */
export function electrolyteVessel(world, obj) {
  return world.list().find((o) => o !== obj && o.mixture && o.mixture.volume > 1
    && Math.hypot(o.position.x - obj.position.x, o.position.z - obj.position.z) < o.footprintRadius() + 4
    && (obj.position.y < o.position.y + (o.cavity?.height ?? 10) + 6));
}

export function electrolysisTick(world, obj, dt) {
  if (obj.def.componentType !== 'electrode') return;
  if (!world.isWired(obj.id)) return;
  const vessel = electrolyteVessel(world, obj);
  if (!vessel) return;
  const sol = world.circuitSolution;
  const current = Math.abs(obj.state.currentA || 0);
  const metal = obj.group.userData.electrodeMetal || 'copper';
  if (!sol || !sol.ok || current < 1e-4) {
    if (!vessel.state.electrolyteNote && current < 1e-4) {
      vessel.state.electrolyteNote = true;
      if (!isConductive(vessel.mixture)) {
        world.emit({ type: 'observation', id: vessel.id, text: 'Nothing happens: this liquid does not conduct electricity. Use an aqueous solution of an ionic compound.' });
      } else {
        world.emit({ type: 'observation', id: vessel.id, text: 'No current is flowing through the cell - check the circuit is complete and the voltage is high enough.' });
      }
    }
    return;
  }
  vessel.state.electrolyteNote = false;
  const prediction = predictElectrolysis({ mixture: vessel.mixture, anode: metal, cathode: 'carbon', voltageV: Math.abs(obj.state.voltageV || 0) });
  if (!prediction.ok) return;
  if (!vessel.state.predictionDone) {
    vessel.state.predictionDone = true;
    world.emit({
      type: 'prediction', id: vessel.id, severity: 'info',
      text: `At the cathode: ${prediction.cathode.formula} (${prediction.cathode.halfEquation}). At the anode: ${prediction.anode.formula} (${prediction.anode.halfEquation}).`,
      notes: prediction.notes
    });
  }
  const charge = current * dt;
  obj.state.chargeC += charge;
  const result = electrolyse({ mixture: vessel.mixture, anode: metal, cathode: 'carbon', chargeCoulombs: charge });
  // Products form continuously; report them about once a second with the
  // amounts accumulated in between so the log stays readable.
  obj.state.pendingProducts = obj.state.pendingProducts || new Map();
  for (const ev of result.events) {
    const key = `${ev.electrode}:${ev.species}`;
    const prev = obj.state.pendingProducts.get(key) || { ...ev, moles: 0 };
    prev.moles += ev.moles;
    obj.state.pendingProducts.set(key, prev);
  }
  obj.state.productTimer = (obj.state.productTimer || 0) + dt;
  if (obj.state.productTimer >= 1 && obj.state.pendingProducts.size) {
    obj.state.productTimer = 0;
    for (const [, ev] of obj.state.pendingProducts) {
      world.emit({
        type: 'electrolysis', id: vessel.id, severity: 'info',
        text: ev.text, species: ev.species, moles: round(ev.moles, 6), electrode: ev.electrode
      });
    }
    obj.state.pendingProducts.clear();
    vessel.mixture.observations.push('Gas bubbles stream from the electrodes.');
    refreshLiquid(world, vessel);
  }
}

// ---------------------------------------------------------------- instruments
/** True value measured by an instrument object. */
export function instrumentReading(world, obj) {
  const ud = obj.group.userData;
  const inst = obj.def.instrument || ud.instrument;
  if (!inst) return null;
  const near = (pred) => world.list().find((o) => o !== obj && pred(o));
  switch (ud.measures || inst) {
    case 'temperature': {
      const target = near((o) => o.mixture && Math.hypot(o.position.x - obj.position.x, o.position.z - obj.position.z) < o.footprintRadius() + 3);
      const trueV = target ? target.mixture.temperature : (obj.surfaceId === 'hood_deck' ? ROOM_TEMP : ROOM_TEMP);
      return { kind: 'temperature', trueValue: trueV, unit: 'C', instrument: inst };
    }
    case 'ph': {
      const target = near((o) => o.mixture && Math.hypot(o.position.x - obj.position.x, o.position.z - obj.position.z) < o.footprintRadius() + 3);
      if (!target) return { kind: 'ph', trueValue: null, note: 'Dip the probe into a solution.', instrument: inst };
      return { kind: 'ph', trueValue: target.mixture.ph, unit: 'pH', instrument: inst, targetId: target.id };
    }
    case 'current':
      return { kind: 'current', trueValue: obj.state.currentA, unit: 'A', instrument: inst };
    case 'voltage':
      return { kind: 'voltage', trueValue: obj.state.voltageV, unit: 'V', instrument: inst };
    case 'resistance': {
      const target = near((o) => o.electrical && o !== obj && Math.hypot(o.position.x - obj.position.x, o.position.z - obj.position.z) < 8);
      return { kind: 'resistance', trueValue: target ? (target.def.value || 0) : obj.state.probingOhm ?? null, unit: 'ohm', instrument: inst, note: target ? null : 'Connect the meter across a component.' };
    }
    case 'mass': case 'balance': {
      const held = obj.state.weighedG ?? world.loadOn(obj);
      return { kind: 'mass', trueValue: held, unit: 'g', instrument: inst };
    }
    case 'volume': {
      const target = near((o) => o.mixture && Math.hypot(o.position.x - obj.position.x, o.position.z - obj.position.z) < o.footprintRadius() + 3);
      return { kind: 'volume', trueValue: target ? target.mixture.volume : null, unit: 'cm3', instrument: inst, targetId: target?.id };
    }
    case 'light': {
      const lit = world.list().reduce((a, o) => a + (o.state.lit || 0) * clamp(1 - Math.hypot(o.position.x - obj.position.x, o.position.z - obj.position.z) / 120, 0, 1), 0);
      return { kind: 'light', trueValue: lit * 100, unit: 'lux', instrument: inst };
    }
    case 'force': {
      const load = world.loadOn(obj);
      return { kind: 'force', trueValue: load * G_PER_N, unit: 'N', instrument: inst };
    }
    default:
      return { kind: ud.measures || inst, trueValue: null, unit: '', instrument: inst };
  }
}
const G_PER_N = 9.81 / 1000;

/** Weight resting on an object (for balances and force meters). */
export function loadOn(world, obj) {
  let g = -999;
  for (const other of world.list()) {
    if (other === obj) continue;
    const d = Math.hypot(other.position.x - obj.position.x, other.position.z - obj.position.z);
    if (d > other.footprintRadius() + 4) continue;
    if (other.position.y < obj.position.y - 0.5) continue;
    if (obj.group.userData.weighPan || obj.group.userData.instrument === 'balance') {
      const mass = (other.def.massG ?? 50) + (other.mixture?.mass ?? 0) * 0.5;
      g = Math.max(g, mass);
    } else if (obj.group.userData.hook || obj.group.userData.instrument === 'force') {
      g = Math.max(g, (other.def.massG ?? 50) / 1000);
    }
  }
  return g < 0 ? 0 : g;
}

export function instrumentTick(world, obj, dt) {
  const reading = instrumentReading(world, obj);
  if (!reading) return;
  const inst = INSTRUMENTS[reading.instrument] || null;
  if (reading.trueValue == null) { obj.state.lastReading = null; obj.state.readingText = reading.note || ''; return; }
  const out = readInstrument(reading.instrument, reading.trueValue);
  obj.state.lastReading = { ...out, ...reading, value: out.value, text: formatReading(out.value, out.resolution, reading.unit) };
  obj.state.readingText = obj.state.lastReading.text;
  // digital displays get updated text
  const display = obj.group.userData.screenMesh;
  if (display && obj.visual.displayTexture !== obj.state.readingText) {
    obj.visual.displayTexture = obj.state.readingText;
  }
  // logging: instruments with a datalogger connected record a dataset
  if (world.logging && world.logging.has(obj.id)) {
    const ds = world.logging.get(obj.id);
    ds.addRow({ t: round(world.time, 1), value: out.value });
  }
}

// ------------------------------------------------------------------- safety
export function safetyTick(world, dt) {
  world.safetyTimer = (world.safetyTimer || 0) + dt;
  if (world.safetyTimer < 0.5) return;
  world.safetyTimer = 0;
  const ctx = {
    ...world.safetyContext,
    time: world.time,
    items: world.list().map((o) => ({
      id: o.id,
      name: o.name,
      surfaceId: o.surfaceId,
      temperatureC: o.temperatureC,
      volumeML: o.volumeML,
      sealed: o.sealed,
      glass: o.def.glass,
      substanceIds: o.mixture ? [...o.mixture.aqueous.keys(), ...o.mixture.solids.keys(), ...o.mixture.gas.keys(), ...o.mixture.organic.keys()]
        .map((id) => id) : [],
      substances: o.mixture ? substanceIdsFor(o) : [],
      heatOn: o.heatOn,
      currentA: o.state.currentA,
      pressureKPa: o.state.gasPressureKPa,
      lit: o.state.lit,
      lidOn: !!o.group.userData.lid,
      spill: false
    })),
    spills: world.spills.filter((s) => world.time - s.at < 120),
    ventilation: world.ventilationFactor ? world.ventilationFactor() : 1,
    mainsInUse: world.list().some((o) => o.def.id === 'electrical_socket' && world.isWired(o.id)),
    observations: [],
    apparatus: { fumeHood: !!world.get('hood') }
  };
  const findings = checkSafety(ctx);
  for (const f of findings) {
    const key = `${f.rule || f.id}|${f.itemId || ''}`;
    world.seenSafety = world.seenSafety || new Set();
    if (world.seenSafety.has(key)) continue;
    world.seenSafety.add(key);
    world.emit({ type: 'safety', severity: f.severity, text: f.message, rule: f.rule, id: f.itemId });
  }
}

function substanceIdsFor(obj) {
  const out = new Set();
  for (const [id] of obj.mixture.aqueous) out.add(id);
  for (const [id] of obj.mixture.solids) out.add(id);
  return [...out];
}

// -------------------------------------------------------------- the whole tick
export function stepWorld(world, dtRaw) {
  const dt = clamp(dtRaw, 0, MAX_DT);
  world.time += dt;
  // sub-step so fast chemistry and heat stay stable
  const steps = Math.max(1, Math.ceil(dt / MAX_STEP));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    for (const obj of world.list()) {
      thermalTick(world, obj, h);
      if (obj.mixture) {
        chemistryTick(world, obj, h);
        gasTick(world, obj, h);
      }
    }
    circuitTick(world, h);
    for (const obj of world.list()) {
      if (obj.def.componentType === 'electrode') electrolysisTick(world, obj, h);
    }
  }
  // visuals + instruments run once per frame
  for (const obj of world.list()) {
    if (obj.mixture) { refreshLiquid(world, obj); updateLiquidEffects(world, obj, dt); }
    instrumentTick(world, obj, dt);
    if (obj.stirring > 0) obj.stirring = Math.max(0, obj.stirring - dt);
    if (obj.tilt !== 0 && world.autoPour) world.pourTick(obj, dt);
  }
  safetyTick(world, dt);
  world.stats.peakTempC = Math.max(world.stats.peakTempC, ...world.list().map((o) => o.temperatureC || 0));
  world.stats.lowestPH = Math.min(world.stats.lowestPH, ...world.list().filter((o) => o.mixture?.aqVolume > 1).map((o) => o.mixture.ph));
}

export const simMethods = {
  step(dt) { stepWorld(this, dt); },
  heatSources(obj) { return heatSourcesFor(this, obj); },
  reading(obj) { return instrumentReading(this, obj); },
  loadOn(obj) { return loadOn(this, obj); },
  boilingPoint(obj) { return obj.mixture ? boilingPointOf(obj.mixture) : null; }
};
