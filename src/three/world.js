// ---------------------------------------------------------------------------
// THE WORLD MODEL
// ---------------------------------------------------------------------------
// Holds every apparatus object in the lab, its contents, its temperature, its
// wiring and its position, and advances all of them in simulated time.
//
// It deliberately knows nothing about WebGL: it only needs a THREE.Scene, so
// the whole simulation can be unit tested in Node.  Rendering (camera,
// controls, renderer) lives in interaction.js / main.js.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { buildApparatus, pourAngleFor } from './geometry.js';
import { surfaceById } from './lab.js';
import { getApparatus } from '../core/apparatus.js';
import { getSubstance } from '../core/substances.js';
import { Mixture } from '../core/mixture.js';
import { applyReactions } from '../core/reactions.js';
import { AMBIENT_C } from '../core/thermal.js';
import { clamp, uid, round } from '../core/util.js';
import { Dataset, saveLab, listSaves, loadLab, deleteSave as deleteSaved, makeSave, serializeMixture, deserializeMixture } from '../core/storage.js';
import { circuitElementFor, makeWireMesh } from './electrical.js';
import { liquidMethods, disposeGroup, refreshLiquid, pourTick, decant, pipette, dispense, buretteDeliver, stir as stirFn } from './liquid.js';
import { simMethods } from './sim.js';

export { circuitElementFor };
export const GRAVITY = 981;              // cm/s2
export const POUR_MIN_ANGLE = 8;        // degrees of tilt before liquid reaches the lip
const MAX_STEP = 0.1;                   // s, keeps integration stable at low frame rates
const ROOM_TEMP = AMBIENT_C;

// --------------------------------------------------------------- small maths
const v3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const deg = (r) => (r * 180) / Math.PI;

/** A live object in the lab. */
export class LabObject {
  constructor(world, { id, def, group, surfaceId = 'bench_chem', x = 0, z = 0, y = null }) {
    this.world = world;
    this.id = id;
    this.def = def;
    this.group = group;
    this.surfaceId = surfaceId;
    this.rotationY = 0;
    this.tilt = 0;                       // radians about the local X axis
    this.position = v3(x, y ?? (surfaceById(surfaceId)?.y ?? BENCH_Y), z);
    this.mixture = def.container ? new Mixture({ capacity: def.capacityML || (group.userData.cavity?.volumeCm3 ?? 150) }) : null;
    this.heldBy = null;                  // id of the object this sits in/on
    this.heatOn = false;
    this.setting = 0;                    // hot plate / heat control
    this.sealed = false;
    this.stirring = 0;
    this.wires = [];
    this.state = {
      failed: false,
      dropped: 0,
      bubbles: 0,
      boiling: false,
      froth: 0,
      gasPressureKPa: 101.3,
      chargeC: 0,
      currentA: 0,
      lit: 0,
      fillLevel: 0,
      spilledML: 0,
      lastReading: null
    };
    this.visual = {};
    this.applyTransform();
  }

  get isContainer() { return !!this.mixture; }
  get capacityML() { return this.mixture?.capacity ?? 0; }
  get volumeML() { return this.mixture?.volume ?? 0; }
  get cavity() { return this.group.userData.cavity; }
  get surface() { return surfaceById(this.surfaceId); }
  get temperatureC() { return this.mixture ? this.mixture.temperature : this.state.temperatureC ?? ROOM_TEMP; }
  get name() { return this.def.name || this.def.id; }
  get electrical() { return !!this.group.userData.electrical; }
  get terminalNodes() { return this.group.userData.terminalNodes || []; }
  get terminalNames() { return this.group.userData.terminalNames || (this.group.userData.terminalNodes || []).map((_, i) => (i === 0 ? 'a' : 'b')); }

  /** Fill height (cm from the inside floor) for the current contents. */
  liquidHeight() {
    if (!this.mixture || !this.cavity) return 0;
    const v = Math.min(this.mixture.volume, this.capacityML);
    return this.cavity.heightForVolume(v);
  }

  applyTransform() {
    this.group.position.copy(this.position);
    this.group.rotation.set(0, this.rotationY, 0);
    if (this.tilt) {
      // Tip about the base edge on the pouring side so the lip stays still and
      // the liquid level is measured against a realistic pivot.
      const lip = this.group.userData.pourPoint || v3(0, 0, 0);
      const pivot = v3(lip.x * 0.55, 0, 0);
      const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), this.tilt);
      this.group.quaternion.setFromEuler(new THREE.Euler(0, this.rotationY, 0)).premultiply(q);
      const offset = pivot.clone().sub(pivot.clone().applyQuaternion(q));
      this.group.position.add(offset);
    } else {
      this.group.quaternion.identity();
    }
  }

  /** World position of the pouring lip (or the object's mouth). */
  lipWorldPosition() {
    const lip = (this.group.userData.pourPoint || v3(0, this.cavity?.height ?? 4, 0)).clone();
    return this.group.localToWorld(lip);
  }

  mouthWorldPosition() {
    const mouth = v3(0, (this.cavity?.height ?? 4) + 0.5, 0);
    return this.group.localToWorld(mouth);
  }

  terminalWorldPosition(i) {
    const node = this.terminalNodes[i];
    return node ? this.group.localToWorld(node.clone()) : this.position.clone();
  }

  /** Rough radius of the object's footprint, for hit testing and stacking. */
  footprintRadius() {
    const d = this.group.userData.dimensions?.diameterMm ?? 60;
    return Math.max(2, d / 20);
  }

  /** Colour of the contents right now. */
  contentsColour() {
    if (!this.mixture) return null;
    return this.mixture.colourHex;
  }
}

// ------------------------------------------------------------------- the world
export class World {
  constructor({ scene, onEvent = null, storage = null } = {}) {
    this.scene = scene;
    this.storage = storage;
    this.objects = new Map();
    this.wires = [];
    this.events = [];
    this.time = 0;
    this.onEvent = onEvent;
    this.warnings = [];
    this.spills = [];                   // {x, z, volumeML, substanceId, colour}
    this.recordings = new Map();        // objectId -> Dataset
    this.circuitSolution = null;
    this.safetyContext = {
      goggles: false, labcoat: false, gloves: false,
      fumeHoodUsed: false, windowOpen: false, sandBucket: false
    };
    this.stats = { reactions: 0, pourCount: 0, currentMax: 0, peakTempC: ROOM_TEMP, lowestPH: 14 };
  }

  // ------------------------------------------------------------ object API
  add(defId, opts = {}) {
    const def = getApparatus(defId) || { id: defId, name: defId, shape: 'generic', dims: opts.dims || { diameterMm: 60, heightMm: 100 } };
    const id = opts.id || uid(defId.slice(0, 10));
    const surfaceId = opts.surfaceId || 'bench_chem';
    const surface = surfaceById(surfaceId);
    const x = opts.x ?? (surface ? (surface.x0 + surface.x1) / 2 : 0);
    const z = opts.z ?? (surface ? (surface.z0 + surface.z1) / 2 : 0);
    const group = buildApparatus(def, { liquid: opts.liquid });
    const obj = new LabObject(this, { id, def, group, surfaceId, x, z, y: opts.y ?? null });
    if (opts.rotationY) { obj.rotationY = opts.rotationY; }
    obj.applyTransform();
    this.scene.add(group);
    this.objects.set(id, obj);
    if (opts.contents) this.fill(id, opts.contents);
    return obj;
  }

  remove(id) {
    const obj = this.objects.get(id);
    if (!obj) return false;
    this.disconnectAll(id);
    this.scene.remove(obj.group);
    disposeGroup(obj.group);
    this.objects.delete(id);
    this.recordings.delete(id);
    return true;
  }

  get(id) { return this.objects.get(id) || null; }
  list() { return [...this.objects.values()]; }
  find(predicate) { return this.list().find(predicate) || null; }

  /** Objects whose footprint contains a world point (for picking / dropping). */
  objectsNear(x, z, radius = 6) {
    return this.list().filter((o) => {
      const dx = o.position.x - x, dz = o.position.z - z;
      return Math.hypot(dx, dz) < o.footprintRadius() + radius;
    });
  }

  /** Move an object to a surface position, handling stacking and spills. */
  move(id, { x, z, surfaceId, y = null }) {
    const obj = this.get(id);
    if (!obj) return null;
    if (surfaceId) obj.surfaceId = surfaceId;
    obj.position.x = x ?? obj.position.x;
    obj.position.z = z ?? obj.position.z;
    obj.heldBy = null;
    // find something to stand on: another object's top, else the surface
    const support = this.find((other) => other !== obj
      && other.group.userData.holdTopY != null
      && Math.hypot(other.position.x - obj.position.x, other.position.z - obj.position.z) < other.footprintRadius() * 0.9);
    const surface = surfaceById(obj.surfaceId);
    let baseY = surface ? surface.y : 0;
    if (support) {
      baseY = support.position.y + support.group.userData.holdTopY;
      obj.heldBy = support.id;
    }
    // a surface an object occupies (sink bowl, rack slot) may set its own height
    obj.position.y = y ?? baseY;
    obj.applyTransform();
    this.emit({ type: 'moved', id, surfaceId: obj.surfaceId, position: obj.position.clone() });
    return obj;
  }

  setTilt(id, radians) {
    const obj = this.get(id);
    if (!obj) return;
    obj.tilt = clamp(radians, -1.45, 1.45);
    obj.applyTransform();
  }

  turn(id, radians) {
    const obj = this.get(id);
    if (!obj) return;
    obj.rotationY += radians;
    obj.applyTransform();
  }

  // --------------------------------------------------------------- contents
  /** Add a shelf reagent to a container. */
  fill(id, spec) {
    const obj = this.get(id);
    if (!obj || !obj.mixture) return { error: 'not a container' };
    if (typeof spec === 'string') spec = { substanceId: spec, volumeML: 25 };
    const { substanceId, volumeML = 0, massG = 0, moles = 0, species = null } = spec;
    const before = obj.mixture.volume;
    let result = { added: 0 };
    if (species) {
      obj.mixture.addAqueous(species, moles);
    } else if (substanceId) {
      const sub = getSubstance(substanceId);
      if (!sub) return { error: `unknown substance ${substanceId}` };
      if (sub.type === 'gas') result = obj.mixture.addSubstance(substanceId, { mol: moles || volumeML / 24000 });
      else if (massG > 0) result = obj.mixture.addSubstance(substanceId, { massG });
      else result = obj.mixture.addSubstance(substanceId, { volumeML: volumeML || 25 });
    }
    const overflow = Math.max(0, obj.mixture.volume - obj.capacityML);
    if (overflow > 0) {
      obj.mixture.drawVolume(overflow);
      this.spill(obj.position.x, obj.position.z, overflow, substanceId);
    }
    const events = applyReactions(obj.mixture, this.reactionContext(obj));
    this.reportReactions(obj, events);
    this.refreshLiquid(obj);
    this.emit({ type: 'filled', id, substanceId, addedML: round(obj.mixture.volume - before, 2) });
    return { ...result, volumeML: obj.mixture.volume };
  }

  /** Whatever the reaction engine needs to know about where a container is. */
  reactionContext(obj) {
    return {
      temperature: obj.mixture?.temperature ?? ROOM_TEMP,
      light: !!this.nearLight(obj),
      catalyst: this.catalystFor(obj),
      stirred: obj.stirring > 0 || !!obj.group.userData.stirring,
      electrode: this.electrodeMetalFor(obj),
      fumeHood: obj.surfaceId === 'hood_deck'
    };
  }

  catalystFor(obj) {
    if (obj.heldBy) {
      const support = this.get(obj.heldBy);
      if (support && /catalyst/i.test(support.def.name || '')) return support.def.id;
    }
    return null;
  }

  electrodeMetalFor(obj) {
    const e = this.find((o) => o.group.userData.electrodeMetal && Math.hypot(o.position.x - obj.position.x, o.position.z - obj.position.z) < 6);
    return e ? e.group.userData.electrodeMetal : null;
  }

  nearLight(obj) {
    return this.find((o) => o.group.userData.lightSource || o.id === 'lamp_stand');
  }

  /** Note reaction events as observations and safety messages. */
  reportReactions(obj, events) {
    for (const ev of events || []) {
      this.stats.reactions++;
      if (ev.observations?.length) for (const o of ev.observations) obj.mixture.observations.push(o);
      this.emit({
        type: 'reaction',
        id: obj.id,
        text: ev.text || ev.equation || 'reaction',
        equation: ev.equation,
        observations: ev.observations || [],
        temperatureC: round(obj.mixture.temperature, 1)
      });
    }
  }

  spill(x, z, volumeML, substanceId = null) {
    if (volumeML <= 0.01) return;
    const colour = substanceId ? (getSubstance(substanceId)?.colour || '#cfe3f0') : '#cfe3f0';
    this.spills.push({ x, z, volumeML, substanceId, colour, at: this.time });
    this.emit({ type: 'spill', x, z, volumeML: round(volumeML, 1), substanceId });
    if (substanceId) {
      const sub = getSubstance(substanceId);
      if (sub && (sub.ghs || []).length) this.emit({ type: 'safety', severity: 'caution', text: `Clean up the ${sub.name} spill immediately: dilute with plenty of water and wipe from the outside in.` });
    }
  }

  /** Bubbles of gas escaping to the room. */
  noteGasLoss(obj, moles) {
    if (moles <= 1e-7) return;
    const fume = obj.surfaceId === 'hood_deck';
    if (this.escapingNoted && this.time - this.escapingNoted < 20) return;
    this.escapingNoted = this.time;
    this.emit({
      type: 'gas', id: obj.id, severity: fume ? 'info' : 'caution',
      text: fume
        ? 'Gas is being drawn away by the fume cupboard.'
        : 'Gas is escaping into the laboratory - do this in the fume cupboard or collect the gas.'
    });
  }

  noteVapour(obj) {
    if (this.vapourNoted && this.time - this.vapourNoted < 30) return;
    this.vapourNoted = this.time;
    this.emit({ type: 'observation', id: obj.id, text: `Vapour is rising from the ${obj.name}.` });
  }

  hotSurfaceNote(obj, tempC) {
    if (this.hotNoted && this.time - this.hotNoted < 30) return;
    this.hotNoted = this.time;
    this.emit({ type: 'safety', severity: 'caution', id: obj.id, text: `The ${obj.name} is hot (${Math.round(tempC)} C). Warn people nearby and let it cool before touching it.` });
  }

  // ------------------------------------------------------------- wiring API
  isWired(id) { return this.wires.some((w) => w.from.objectId === id || w.to.objectId === id); }

  wiresOf(id) { return this.wires.filter((w) => w.from.objectId === id || w.to.objectId === id); }

  /** Plug a lead between two terminals. */
  connect(fromId, fromTerminal, toId, toTerminal = 'a', opts = {}) {
    const a = this.get(fromId), b = this.get(toId);
    if (!a || !b) return { error: 'both ends must exist' };
    if (!a.electrical || !b.electrical) return { error: 'only components with terminals can be wired' };
    const same = (a, b) => a.objectId === b.objectId && a.terminal === b.terminal;
    const duplicate = this.wires.find((w) => (same(w.from, { objectId: fromId, terminal: fromTerminal }) && same(w.to, { objectId: toId, terminal: toTerminal }))
      || (same(w.from, { objectId: toId, terminal: toTerminal }) && same(w.to, { objectId: fromId, terminal: fromTerminal })));
    if (duplicate) return { error: 'already connected' };
    const wire = {
      id: uid('wire'),
      from: { objectId: fromId, terminal: fromTerminal },
      to: { objectId: toId, terminal: toTerminal },
      colour: opts.colour ?? 0xc0392b
    };
    wire.mesh = makeWireMesh(a.terminalWorldPosition(0), b.terminalWorldPosition(0), wire.colour);
    this.scene.add(wire.mesh);
    this.wires.push(wire);
    a.wires.push(wire.id);
    b.wires.push(wire.id);
    this.emit({ type: 'wired', from: fromId, to: toId });
    return { ok: true, wire };
  }

  disconnect(wireId) {
    const i = this.wires.findIndex((w) => w.id === wireId);
    if (i < 0) return false;
    const [w] = this.wires.splice(i, 1);
    if (w.mesh) { this.scene.remove(w.mesh); disposeGroup(w.mesh); }
    const a = this.get(w.from.objectId), b = this.get(w.to.objectId);
    if (a) a.wires = a.wires.filter((x) => x !== wireId);
    if (b) b.wires = b.wires.filter((x) => x !== wireId);
    this.emit({ type: 'unwired', wire: wireId });
    return true;
  }

  disconnectAll(objectId) {
    for (const w of this.wiresOf(objectId)) this.disconnect(w.id);
  }

  /** Refresh lead geometry (after moving components). */
  updateWires() {
    for (const w of this.wires) {
      const a = this.get(w.from.objectId), b = this.get(w.to.objectId);
      if (!a || !b || !w.mesh) continue;
      this.scene.remove(w.mesh);
      disposeGroup(w.mesh);
      const idxA = Math.max(0, a.terminalNames.indexOf(w.from.terminal));
      const idxB = Math.max(0, b.terminalNames.indexOf(w.to.terminal));
      w.mesh = makeWireMesh(a.terminalWorldPosition(idxA), b.terminalWorldPosition(idxB), w.colour);
      this.scene.add(w.mesh);
    }
  }

  /** 'cathode' / 'anode' for an electrode, from the settled circuit. */
  polarityOf(id) {
    const sol = this.circuitSolution;
    if (!sol || !sol.ok) return null;
    const el = sol.elements[id];
    if (!el) return null;
    if (Math.abs(el.current ?? 0) < 1e-5) return null;
    const comp = this.get(id);
    if (!comp) return null;
    const va = this.nodeVoltageFor(comp, 'a', sol);
    const vb = this.nodeVoltageFor(comp, 'b', sol);
    // pick the terminal with the higher potential: current enters there
    return (el.current > 0) !== (va < vb) ? 'cathode' : 'anode';
  }

  nodeVoltageFor(obj, terminal, sol) {
    const i = Math.max(0, obj.terminalNames.indexOf(terminal));
    const node = sol.nodes[[...sol.nodeVoltages.keys?.() ?? []].length ? 0 : 0];
    const key = `${obj.id}.${obj.terminalNames[i]}`;
    const idx = sol.nodeIndex ? sol.nodeIndex.get(key) : undefined;
    if (idx != null) return sol.nodeVoltages[idx] ?? 0;
    return 0;
  }

  // -------------------------------------------------------------- tube / gas
  /** A delivery tube joining two vessels, if one has been attached. */
  tubeFrom(id) { return (this.tubes || []).find((t) => t.from === id) || null; }
  attachTube(fromId, toId) {
    this.tubes = this.tubes || [];
    this.tubes.push({ from: fromId, to: toId });
    this.emit({ type: 'tube', from: fromId, to: toId });
    return { ok: true };
  }

  // ---------------------------------------------------------------- logging
  startLogging(objectId) {
    const ds = new Dataset({ name: `Log - ${this.get(objectId)?.name || objectId}`, columns: [{ key: 't', label: 'time', unit: 's' }, { key: 'value', label: 'reading', unit: '' }] });
    this.logging = this.logging || new Map();
    this.logging.set(objectId, ds);
    return ds;
  }
  stopLogging(objectId) { this.logging?.delete(objectId); }
  logs() { return [...(this.logging?.entries() ?? [])].map(([id, ds]) => ({ id, name: this.get(id)?.name, dataset: ds })); }

  // ------------------------------------------------------------------- heat
  setHeat(id, on, setting = null) {
    const obj = this.get(id);
    if (!obj) return null;
    obj.heatOn = !!on;
    if (setting != null) obj.setting = clamp(setting, 0, 1);
    else obj.setting = on ? 1 : 0;
    const ud = obj.group.userData;
    if (ud.flame) {
      ud.flame.visible = !!on;
      const inner = ud.flame.getObjectByName('flameInner');
      const outer = ud.flame.getObjectByName('flameOuter');
      const airHole = ud.airHole ?? 0.5;
      const blue = clamp(airHole, 0, 1);
      if (inner) inner.material.color.setHex(blue > 0.35 ? 0x9fd8ff : 0xffcc66);
      if (outer) {
        outer.material.color.setHex(blue > 0.35 ? 0x5aa9ff : 0xff9a3c);
        outer.material.opacity = 0.32 + (1 - blue) * 0.3;
      }
      if (on) {
        this.emit({
          type: 'observation', id,
          text: blue > 0.35
            ? `The Bunsen burner is lit with a roaring blue flame - the air hole is open, so the flame is hot (about ${this.get(id).def.flameTempC ?? 1500} C).`
            : 'The Bunsen burner is lit with a yellow safety flame and the air hole closed: it is visible but much cooler.'
        });
        if (blue < 0.25) this.emit({ type: 'safety', severity: 'caution', id, text: 'A yellow safety flame soots the apparatus and is too cool for most heating. Open the air hole for a blue flame.' });
      }
    }
    if (ud.stirrer && on) obj.state.stirring = true;
    this.emit({ type: 'heat', id, on: !!on, setting: obj.setting });
    return obj;
  }

  setAirHole(id, value) {
    const obj = this.get(id);
    if (!obj) return null;
    obj.group.userData.airHole = clamp(value, 0, 1);
    // collar position shows the air hole setting
    const collar = obj.group.getObjectByName('airCollar');
    if (collar) collar.rotation.y = clamp(value, 0, 1) * Math.PI * 0.6;
    this.emit({ type: 'observation', id, text: value > 0.5 ? 'The air hole is open.' : 'The air hole is closed.' });
    return obj;
  }

  // ------------------------------------------------------------- ventilation
  ventilationFactor() {
    let f = 1;
    for (const o of this.list()) {
      if (o.group.userData.fumeHood) f += 3 * (o.sashOpen ?? 0.35);
      if (o.group.userData.fan && o.state.rpm > 30) f += 1;
    }
    if (this.safetyContext.windowOpen) f += 1;
    return f;
  }

  // ----------------------------------------------------------- serialisation
  serialize() {
    return {
      time: round(this.time, 1),
      stats: { ...this.stats },
      safetyContext: { ...this.safetyContext },
      objects: this.list().map((o) => ({
        id: o.id,
        defId: o.def.id,
        surfaceId: o.surfaceId,
        x: round(o.position.x, 2), y: round(o.position.y, 2), z: round(o.position.z, 2),
        rotationY: round(o.rotationY, 4),
        tilt: round(o.tilt, 4),
        heatOn: o.heatOn,
        setting: o.setting,
        sealed: o.sealed,
        heldBy: o.heldBy,
        state: {
          temperatureC: o.state.temperatureC,
          closed: o.state.closed,
          failed: o.state.failed,
          chargeC: o.state.chargeC,
          voltageV: o.state.voltageV,
          rpm: o.state.rpm,
          weighing: o.state.weighedG
        },
        mixture: o.mixture ? serializeMixture(o.mixture) : null
      })),
      wires: this.wires.map((w) => ({ id: w.id, from: w.from, to: w.to, colour: w.colour })),
      tubes: this.tubes || [],
      spills: this.spills.map((s) => ({ ...s }))
    };
  }

  restore(data, { clear = true } = {}) {
    if (clear) for (const o of this.list()) this.remove(o.id);
    for (const rec of data.objects || []) {
      const def = getApparatus(rec.defId);
      if (!def) continue;
      const obj = this.add(rec.defId, { id: rec.id, surfaceId: rec.surfaceId, x: rec.x, z: rec.z, y: rec.y });
      obj.rotationY = rec.rotationY || 0;
      obj.tilt = rec.tilt || 0;
      obj.heatOn = !!rec.heatOn;
      obj.setting = rec.setting || 0;
      obj.sealed = !!rec.sealed;
      obj.heldBy = rec.heldBy || null;
      Object.assign(obj.state, rec.state || {});
      if (rec.mixture && obj.mixture) {
        obj.mixture = deserializeMixture(rec.mixture);
        refreshLiquid(this, obj);
      }
      obj.applyTransform();
    }
    for (const w of data.wires || []) this.connect(w.from.objectId, w.from.terminal, w.to.objectId, w.to.terminal, { colour: w.colour });
    this.tubes = data.tubes || [];
    this.spills = (data.spills || []).map((s) => ({ ...s }));
    this.time = data.time || 0;
    if (data.safetyContext) this.safetyContext = { ...this.safetyContext, ...data.safetyContext };
    this.emit({ type: 'loaded', objects: this.objects.size });
    return this;
  }

  // ------------------------------------------------------------- save / load
  save(name, extra = {}) {
    return saveLab(makeSave({ world: this.serialize(), name, ...extra }), this.storage ?? undefined);
  }
  saves() { return listSaves(this.storage ?? undefined); }
  load(id) {
    const res = loadLab(id, this.storage ?? undefined);
    if (!res.ok) return res;
    this.restore(res.data.world);
    return res;
  }
  removeSave(id) { return deleteSaved(id, this.storage ?? undefined); }

  // ----------------------------------------------------------------- events
  emit(ev) {
    const event = { ...ev, at: this.time, wallClock: new Date().toISOString() };
    if (ev.text || ev.type === 'reaction' || ev.type === 'safety') {
      event.id = event.id || uid('ev');
      this.events.push(event);
      if (this.events.length > 400) this.events.shift();
    }
    if (this.onEvent) this.onEvent(event);
    return event;
  }

  clearEvents() { this.events.length = 0; }

  /** Everything the inspector panel wants for one object. */
  inspect(id) {
    const obj = this.get(id);
    if (!obj) return null;
    const m = obj.mixture;
    return {
      id: obj.id,
      name: obj.name,
      def: obj.def,
      surfaceId: obj.surfaceId,
      position: obj.position.clone(),
      tiltDeg: round((obj.tilt * 180) / Math.PI, 1),
      rotationY: obj.rotationY,
      heatOn: obj.heatOn,
      setting: obj.setting,
      sealed: obj.sealed,
      volumeML: m ? round(m.volume, 1) : null,
      capacityML: obj.capacityML || null,
      fillPercent: m && obj.capacityML ? Math.round((m.volume / obj.capacityML) * 100) : null,
      temperatureC: round(obj.temperatureC, 1),
      ph: m && m.aqVolume > 0.05 ? round(m.ph, 2) : null,
      colour: m ? m.colourHex : null,
      layers: m ? m.phaseCount : 0,
      contents: m ? m.describe() : [],
      solidMassG: m ? round(m.solidMass, 2) : null,
      precipitateG: m ? round(m.precipitateMass, 2) : null,
      gasMoles: m ? m.gasMoles : null,
      pressureKPa: round(obj.state.gasPressureKPa ?? 101.3, 1),
      observations: m ? m.observations.slice(-12) : [],
      readings: obj.state.lastReading,
      polarity: this.polarityOf(obj.id),
      wired: obj.wires.length,
      currentA: obj.state.currentA,
      voltageV: obj.state.voltageV,
      rpm: obj.state.rpm,
      connectedTubes: (this.tubes || []).filter((t) => t.from === id || t.to === id).length,
      safetyHint: obj.def.glass && obj.temperatureC > 90 ? 'This glass is hot - use tongs.' : null
    };
  }
}

// --------------------------------------------------------------- mix in systems
// The simulation and liquid logic live in their own modules so that this file
// stays readable; they are plain functions that take a World.
Object.assign(World.prototype, liquidMethods, simMethods);
export { liquidMethods, simMethods };

