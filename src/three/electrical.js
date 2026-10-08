// ---------------------------------------------------------------------------
// WIRING AND CIRCUITS
// ---------------------------------------------------------------------------
// Turns wired apparatus into the component list the MNA solver expects, adds
// the wires, keeps the meters honest and pushes the solution back into the
// scene (lamp brightness, LED glow, motor spin) and into the electrolysis cell.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { MAT } from './materials.js';
import { makeMesh } from './geometry.js';
import { solveCircuit, analyseCircuit } from '../core/circuit.js';
import { clamp, round } from '../core/util.js';
import { isConductive, electrolyse, predictElectrolysis } from '../core/electrolysis.js';

/** The circuit element a piece of apparatus represents. */
export function circuitElementFor(def, obj = null) {
  const type = def.componentType || def.id;
  const base = {
    id: obj ? obj.id : def.id,
    type,
    terminals: (def.terminals || ['a', 'b']).map((t) => (typeof t === 'string' ? t : t.id)),
    value: def.value ?? 0,
    internalResistance: def.internalResistance ?? 0,
    closed: obj ? !!obj.state.closed : !!def.closed,
    ledColour: def.ledColour,
    diodeType: def.diodeType
  };
  switch (type) {
    case 'lamp': case 'bulb':
      base.value = def.value ?? 8.3;
      break;
    case 'led':
      base.type = 'led';
      base.ledColour = def.ledColour || 'red';
      break;
    case 'thermistor': {
      // NTC: resistance falls as it gets hotter
      base.type = 'resistor';
      const T = obj ? obj.temperatureC : 20;
      const r25 = def.value || 1000;
      base.value = r25 * Math.exp(3400 * (1 / (T + 273.15) - 1 / 298.15));
      break;
    }
    case 'electrode': {
      base.type = 'heater';
      const R = obj?.state.electrolyteResistanceC ?? 40;
      base.value = clamp(R, 0.5, 1e5);
      break;
    }
    case 'motor': case 'fan':
      base.value = def.value ?? 20;
      break;
    case 'hairDryer': case 'heater': case 'kettle':
      base.value = def.value ?? 60;
      break;
    case 'rheostat': case 'variableResistor':
      base.value = obj ? obj.setting * (def.variable?.max ?? def.value ?? 50) : (def.value ?? 50);
      break;
    case 'switch':
      base.closed = obj ? !!obj.state.closed : !!def.closed;
      break;
    case 'socket':
      base.type = 'powerSupply';
      base.value = 230;
      base.internalResistance = 0.5;
      break;
    case 'coil': case 'capacitor':
      base.type = 'resistor';
      base.value = def.value || 2;
      break;
    case 'transformer': {
      // modelled as two coupled windings: primary load + secondary source
      base.type = 'resistor';
      base.value = 8;
      break;
    }
    case 'multimeter':
      base.type = def.mode === 'ammeter' ? 'ammeter' : 'voltmeter';
      break;
    default:
      break;
  }
  return base;
}

/** Every component in the lab that is part of a wired circuit. */
export function collectComponents(world) {
  const comps = [];
  for (const obj of world.list()) {
    if (!obj.electrical) continue;
    if (!world.isWired(obj.id)) continue;
    comps.push(circuitElementFor(obj.def, obj));
  }
  return comps;
}

/** Draw an insulated lead between two terminals (visual only). */
export function makeWireMesh(a, b, colourHex = 0xc0392b) {
  const g = new THREE.Group();
  const mid = a.clone().lerp(b, 0.5);
  const sag = Math.min(12, a.distanceTo(b) * 0.25);
  mid.y -= sag;
  const curve = new THREE.CatmullRomCurve3([a.clone(), mid, b.clone()]);
  const mat = new THREE.MeshStandardMaterial({ color: colourHex, roughness: 0.6 });
  const tube = makeMesh(new THREE.TubeGeometry(curve, 32, 0.22, 8, false), mat, 'lead');
  tube.raycast = () => {};
  const tips = [];
  for (const p of [a, b]) {
    const t = makeMesh(new THREE.CylinderGeometry(0.28, 0.12, 1.4, 8), MAT.copper(), 'plug');
    t.position.copy(p);
    t.rotation.z = Math.PI / 2;
    t.raycast = () => {};
    tips.push(t);
  }
  g.add(tube, ...tips);
  g.name = 'wire';
  g.userData.wireVisual = true;
  return g;
}
