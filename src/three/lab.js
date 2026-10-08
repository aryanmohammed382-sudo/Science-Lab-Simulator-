// ---------------------------------------------------------------------------
// THE LABORATORY
// ---------------------------------------------------------------------------
// The room, the benches, the services (gas, water, power), the safety stations
// and the reagent shelf.  Scene units are centimetres.  The floor is y = 0 and
// the main bench top is BENCH_Y.
//
// Every place an object can be put down is a "surface": a labelled rectangle
// with a height.  The world model snaps objects to surfaces, and the health and
// safety system knows which surfaces are inside the fume cupboard, over the
// sink, or on the floor.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { MAT } from './materials.js';
import { buildApparatus, makeMesh } from './geometry.js';
import { APPARATUS } from '../core/apparatus.js';
import { SUBSTANCES } from '../core/substances.js';

export const BENCH_Y = 90;          // cm, height of the main bench top
export const BENCH_DEPTH = 75;
export const ROOM = { width: 900, depth: 700, height: 300 };

/** Rectangular place zones. `y` is the height of the top surface. */
export const SURFACES = [
  { id: 'bench_main', label: 'Main bench', kind: 'bench', y: BENCH_Y, x0: -300, x1: -60, z0: -30, z1: 30, services: ['gas', 'power'] },
  { id: 'bench_chem', label: 'Chemistry bench', kind: 'bench', y: BENCH_Y, x0: -30, x1: 210, z0: -30, z1: 30, services: ['gas', 'water', 'power'] },
  { id: 'bench_elec', label: 'Electrical bench', kind: 'bench', y: BENCH_Y, x0: 240, x1: 430, z0: -30, z1: 30, services: ['power'] },
  { id: 'hood_deck', label: 'Fume cupboard deck', kind: 'hood', y: BENCH_Y + 46, x0: 430, x1: 600, z0: -34, z1: 26, services: ['gas', 'power'], ventilated: true },
  { id: 'sink_deck', label: 'Sink surround', kind: 'sink', y: BENCH_Y + 2, x0: -300, x1: -190, z0: 60, z1: 120, services: ['water'] },
  { id: 'side_bench', label: 'Side bench', kind: 'bench', y: BENCH_Y, x0: -170, x1: 40, z0: 60, z1: 115, services: ['power'] },
  { id: 'balance_bench', label: 'Balance bench', kind: 'bench', y: BENCH_Y + 2, x0: 80, x1: 210, z0: 62, z1: 115, services: ['power'] },
  { id: 'shelf_top', label: 'Reagent shelf', kind: 'shelf', y: 176, x0: 240, x1: 430, z0: -92, z1: -66, services: [] },
  { id: 'shelf_mid', label: 'Reagent shelf (lower)', kind: 'shelf', y: 132, x0: 240, x1: 430, z0: -92, z1: -66, services: [] },
  { id: 'floor', label: 'Floor', kind: 'floor', y: 0, x0: -420, x1: 420, z0: 130, z1: 300, services: [] }
];

export function surfaceById(id) { return SURFACES.find((s) => s.id === id) || null; }

/** Which surface a world position sits on (used when dropping objects). */
export function surfaceAt(x, z, y = BENCH_Y) {
  const candidates = SURFACES.filter((s) => x >= s.x0 - 4 && x <= s.x1 + 4 && z >= s.z0 - 4 && z <= s.z1 + 4);
  if (!candidates.length) return null;
  // prefer the surface whose height is closest below the drop height
  candidates.sort((a, b) => Math.abs(a.y - y) - Math.abs(b.y - y));
  return candidates[0];
}

// ------------------------------------------------------------------- fixtures
function benchUnits(scene) {
  const g = new THREE.Group();
  g.name = 'benches';
  const top = makeMesh(new THREE.BoxGeometry(380, 6, BENCH_DEPTH), MAT.benchTop(), 'benchTopA');
  top.position.set(-110, BENCH_Y - 3, 0);
  const cab = makeMesh(new THREE.BoxGeometry(380, BENCH_Y - 6, BENCH_DEPTH - 10), MAT.cabinet(), 'cabinetA');
  cab.position.set(-110, (BENCH_Y - 6) / 2, 0);
  const topB = makeMesh(new THREE.BoxGeometry(200, 6, BENCH_DEPTH), MAT.benchTop(), 'benchTopB');
  topB.position.set(330, BENCH_Y - 3, 0);
  const cabB = makeMesh(new THREE.BoxGeometry(200, BENCH_Y - 6, BENCH_DEPTH - 10), MAT.cabinet(), 'cabinetB');
  cabB.position.set(330, (BENCH_Y - 6) / 2, 0);
  // drawers on the front of each bench unit
  for (let i = 0; i < 7; i++) {
    const d = makeMesh(new THREE.BoxGeometry(46, 22, 1.6), MAT.cabinet(), 'drawer' + i);
    d.position.set(-280 + i * 55, BENCH_Y - 22, -BENCH_DEPTH / 2 + 5);
    g.add(d);
    const handle = makeMesh(new THREE.BoxGeometry(16, 1.6, 2), MAT.steel(), 'handle' + i);
    handle.position.set(-280 + i * 55, BENCH_Y - 22, -BENCH_DEPTH / 2 + 4);
    g.add(handle);
  }
  const side = makeMesh(new THREE.BoxGeometry(210, BENCH_Y, 55), MAT.benchTop(), 'sideBench');
  side.position.set(-65, BENCH_Y / 2, 88);
  const balanceBench = makeMesh(new THREE.BoxGeometry(130, BENCH_Y, 55), MAT.benchTop(), 'balanceBench');
  balanceBench.position.set(145, BENCH_Y / 2, 88);
  const stool = new THREE.Group();
  for (const s of [-1, 1]) {
    const st = makeMesh(new THREE.CylinderGeometry(16, 16, 4, 20), MAT.plasticBlack(), 'stoolTop' + s);
    st.position.set(-150 + s * 60, 52, 55);
    const leg = makeMesh(new THREE.CylinderGeometry(2, 2, 50, 10), MAT.darkMetal(), 'stoolLeg' + s);
    leg.position.set(-150 + s * 60, 27, 55);
    stool.add(st, leg);
  }
  g.add(top, cab, topB, cabB, side, balanceBench, stool);
  scene.add(g);
  return g;
}

function roomShell(scene) {
  const g = new THREE.Group();
  g.name = 'room';
  const floor = makeMesh(new THREE.BoxGeometry(ROOM.width, 4, ROOM.depth), MAT.floor(), 'floor');
  floor.position.y = -2;
  const wallBack = makeMesh(new THREE.BoxGeometry(ROOM.width, ROOM.height, 4), MAT.wall(), 'wallBack');
  wallBack.position.set(0, ROOM.height / 2, -ROOM.depth / 2);
  const wallLeft = makeMesh(new THREE.BoxGeometry(4, ROOM.height, ROOM.depth), MAT.wall(), 'wallLeft');
  wallLeft.position.set(-ROOM.width / 2, ROOM.height / 2, 0);
  const wallRight = makeMesh(new THREE.BoxGeometry(4, ROOM.height, ROOM.depth), MAT.wall(), 'wallRight');
  wallRight.position.set(ROOM.width / 2, ROOM.height / 2, 0);
  const ceiling = makeMesh(new THREE.BoxGeometry(ROOM.width, 3, ROOM.depth), MAT.wall(), 'ceiling');
  ceiling.position.y = ROOM.height;
  const skirting = makeMesh(new THREE.BoxGeometry(ROOM.width, 10, 2), MAT.darkMetal(), 'skirting');
  skirting.position.set(0, 5, -ROOM.depth / 2 + 3);
  g.add(floor, wallBack, wallLeft, wallRight, ceiling, skirting);
  // windows on the right wall
  for (let i = 0; i < 2; i++) {
    const win = makeMesh(new THREE.BoxGeometry(2, 90, 140), new THREE.MeshPhysicalMaterial({ color: 0xd8ecf7, transparent: true, opacity: 0.4, roughness: 0.1 }), 'window' + i);
    win.position.set(ROOM.width / 2 - 3, 170, -120 + i * 260);
    const frame = makeMesh(new THREE.BoxGeometry(4, 94, 144), MAT.cabinet(), 'windowFrame' + i);
    frame.position.set(ROOM.width / 2 - 5, 170, -120 + i * 260);
    g.add(frame, win);
  }
  // ceiling lights
  for (const x of [-220, 0, 220]) {
    for (const z of [-120, 120]) {
      const panel = makeMesh(new THREE.BoxGeometry(90, 3, 40), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf8fbff, emissiveIntensity: 0.65, roughness: 0.4 }), 'ceilingLight');
      panel.position.set(x, ROOM.height - 4, z);
      panel.raycast = () => {};
      g.add(panel);
      const dl = new THREE.DirectionalLight(0xffffff, 0.5);
      dl.position.set(x, ROOM.height - 10, z);
      dl.target.position.set(x, 0, z);
      dl.raycast = () => {};
      g.add(dl, dl.target);
    }
  }
  scene.add(g);
  return g;
}

function services(scene) {
  const g = new THREE.Group();
  g.name = 'services';
  const taps = [
    ['gas', -250, -26], ['gas', -60, -26], ['gas', 120, -26], ['gas', 380, -26], ['gas', 520, -30]
  ];
  const def = APPARATUS.gas_tap || { id: 'gas_tap', shape: 'gasTap', dims: { diameterMm: 60, heightMm: 70 } };
  const defW = APPARATUS.water_tap || { id: 'water_tap', shape: 'waterTap', dims: { diameterMm: 60, heightMm: 70 } };
  for (const [, x, z] of taps) {
    const t = buildApparatus({ ...def, id: `gasTap_${x}` });
    t.position.set(x, BENCH_Y, z);
    g.add(t);
    gases.push(t);
  }
  const w = buildApparatus({ ...defW, id: 'waterTap_sink' });
  w.position.set(-250, BENCH_Y + 14, 55);
  g.add(w);
  waterTaps.push(w);
  // electrical sockets along the wall
  const socketDef = APPARATUS.electrical_socket || APPARATUS.socket;
  if (socketDef) {
    for (let i = 0; i < 6; i++) {
      const x = -300 + i * 140;
      const s = buildApparatus({ ...socketDef, id: `socket_${i}` });
      s.position.set(x, 40, -ROOM.depth / 2 + 8);
      s.rotation.y = 0;
      g.add(s);
      sockets.push(s);
    }
  }
  scene.add(g);
  return g;
}
/** Live lists of the fitted services, so wires and hoses can find them. */
export const gases = [];
export const waterTaps = [];
export const sockets = [];

function fumeCupboard(scene) {
  const def = APPARATUS.fume_hood || { id: 'fume_hood', shape: 'fumeHood', dims: { diameterMm: 1800, heightMm: 240 } };
  const hood = buildApparatus({ ...def, dims: { diameterMm: 1700, heightMm: 210 } });
  hood.position.set(515, BENCH_Y + 44, -4);
  hood.userData.surfaceId = 'hood_deck';
  scene.add(hood);
  return hood;
}

function sinkArea(scene) {
  const g = new THREE.Group();
  g.name = 'sinkArea';
  const trough = makeMesh(new THREE.BoxGeometry(120, 16, 60), MAT.steel(), 'sinkTrough');
  trough.position.set(-245, BENCH_Y - 8, 90);
  const bowl = makeMesh(new THREE.BoxGeometry(104, 14, 48), new THREE.MeshStandardMaterial({ color: 0x9aa2a9, roughness: 0.3, metalness: 0.9, side: THREE.DoubleSide }), 'sinkBowl');
  bowl.position.set(-245, BENCH_Y - 6, 90);
  const tapBase = makeMesh(new THREE.CylinderGeometry(1.4, 1.4, 14, 14), MAT.steel(), 'sinkTapBase');
  tapBase.position.set(-245, BENCH_Y + 7, 62);
  const spout = makeMesh(new THREE.CylinderGeometry(1, 1, 16, 14), MAT.steel(), 'sinkSpout');
  spout.rotation.x = 1.1;
  spout.position.set(-245, BENCH_Y + 16, 68);
  const handle = makeMesh(new THREE.BoxGeometry(8, 1.2, 1.6), MAT.steel(), 'sinkHandle');
  handle.position.set(-245, BENCH_Y + 13, 62);
  g.add(trough, bowl, tapBase, spout, handle);
  scene.add(g);
  return g;
}

function safetyStations(scene) {
  const g = new THREE.Group();
  g.name = 'safety';
  const shower = buildApparatus(APPARATUS.safety_shower || { id: 'safety_shower', shape: 'safetyShower', dims: {} });
  shower.position.set(-430, 0, -180);
  const eyewash = buildApparatus(APPARATUS.eye_wash_station || { id: 'eye_wash_station', shape: 'eyeWash', dims: {} });
  eyewash.position.set(-330, 0, -200);
  const firstAid = buildApparatus(APPARATUS.first_aid || { id: 'first_aid', shape: 'firstAid', dims: {} });
  firstAid.position.set(-180, 0, -330);
  const extinguisher = buildApparatus(APPARATUS.fire_extinguisher || { id: 'fire_extinguisher', shape: 'fireExtinguisher', dims: {} });
  extinguisher.position.set(60, 0, -330);
  const screen = buildApparatus(APPARATUS.safety_screen || { id: 'safety_screen', shape: 'safetyScreen', dims: {} });
  screen.position.set(-70, BENCH_Y, 26);
  g.add(shower, eyewash, firstAid, extinguisher, screen);
  for (const [id, x] of [['waste_container', 260], ['solvent_waste', 330], ['heavy_metal_waste', 400]]) {
    const bin = buildApparatus(APPARATUS[id] || { id, shape: 'wasteContainer', dims: {} });
    bin.position.set(x, 0, -60);
    g.add(bin);
  }
  scene.add(g);
  return { group: g, shower, eyewash, firstAid, extinguisher, screen };
}

function reagentShelf(scene) {
  const g = new THREE.Group();
  g.name = 'reagentShelf';
  const shelves = [BENCH_Y + 42, BENCH_Y + 86, BENCH_Y + 130];
  for (const y of shelves) {
    const plank = makeMesh(new THREE.BoxGeometry(200, 3, 26), MAT.cabinet(), 'shelf');
    plank.position.set(330, y, -80);
    g.add(plank);
  }
  for (const x of [238, 422]) {
    const upright = makeMesh(new THREE.BoxGeometry(4, 140, 26), MAT.cabinet(), 'upright');
    upright.position.set(x, BENCH_Y + 70, -80);
    g.add(upright);
  }
  // decorative reagent bottles: a real one is created on demand by the inventory
  const sample = Object.values(SUBSTANCES).filter((s) => s.type === 'solution').slice(0, 12);
  let i = 0;
  for (const y of shelves.slice(0, 2)) {
    for (let k = 0; k < 6; k++) {
      const sub = sample[i++ % sample.length];
      if (!sub) break;
      const bottle = buildApparatus({
        ...(APPARATUS.reagent_bottle || { id: 'reagent_bottle', shape: 'reagentBottle', dims: { diameterMm: 78, heightMm: 185 } }),
        id: `shelf_${sub.id}_${y}`,
        dims: { diameterMm: 60, heightMm: 140 }
      });
      const liquidBody = makeMesh(new THREE.CylinderGeometry(2.6, 2.6, 5.5, 20), MAT.liquid(sub.colour || '#3b6ea5'), 'shelfLiquid');
      liquidBody.position.y = 3.4;
      liquidBody.raycast = () => {};
      bottle.add(liquidBody);
      const tex = null;
      bottle.position.set(250 + k * 32, y + 1.5, -80);
      bottle.userData.decor = true;
      bottle.userData.substanceId = sub.id;
      g.add(bottle);
    }
  }
  scene.add(g);
  return g;
}

function periodicTable(scene) {
  const g = new THREE.Group();
  g.name = 'periodicTable';
  const board = makeMesh(new THREE.BoxGeometry(150, 84, 2), MAT.cabinet(), 'board');
  board.position.set(-330, 190, -ROOM.depth / 2 + 6);
  g.add(board);
  const cells = new THREE.Group();
  const n = 18, rows = 7;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < n; c++) {
      const cell = makeMesh(new THREE.BoxGeometry(7, 10, 0.6), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(((r * n + c) % 12) / 12, 0.45, 0.6), roughness: 0.7 }), 'cell');
      cell.position.set(-330 - 66 + c * 7.8, 190 + 30 - r * 11, -ROOM.depth / 2 + 8);
      cell.raycast = () => {};
      cells.add(cell);
    }
  }
  g.add(cells);
  scene.add(g);
  return g;
}

function posters(scene) {
  const g = new THREE.Group();
  g.name = 'posters';
  const items = [
    { x: -120, w: 90, h: 60, colour: 0x2b6cb0, title: 'hazard symbols' },
    { x: 0, w: 70, h: 50, colour: 0x1f8b3a, title: 'safety rules' },
    { x: 110, w: 90, h: 60, colour: 0xb7791f, title: 'apparatus guide' }
  ];
  for (const it of items) {
    const p = makeMesh(new THREE.BoxGeometry(it.w, it.h, 1.4), new THREE.MeshStandardMaterial({ color: it.colour, roughness: 0.8 }), `poster_${it.title.replace(/\s/g, '_')}`);
    p.position.set(it.x, 200, -ROOM.depth / 2 + 5);
    p.raycast = () => {};
    g.add(p);
  }
  scene.add(g);
  return g;
}

function dryingRack(scene) {
  const g = new THREE.Group();
  g.name = 'dryingRack';
  const board = makeMesh(new THREE.BoxGeometry(90, 2, 30), MAT.cabinet(), 'pegboard');
  board.position.set(220, BENCH_Y + 70, -ROOM.depth / 2 + 8);
  g.add(board);
  for (let i = 0; i < 8; i++) {
    const peg = makeMesh(new THREE.CylinderGeometry(0.4, 0.4, 10, 8), MAT.steel(), 'peg' + i);
    peg.rotation.x = Math.PI / 2;
    peg.position.set(180 + i * 11, BENCH_Y + 70, -ROOM.depth / 2 + 20);
    g.add(peg);
  }
  scene.add(g);
  return g;
}

// -------------------------------------------------------------------- lighting
export function buildLighting(scene) {
  const hemi = new THREE.HemisphereLight(0xffffff, 0x9aa3ad, 0.55);
  hemi.name = 'ambient';
  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(-260, 420, 260);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  const cam = key.shadow.camera;
  cam.left = -420; cam.right = 420; cam.top = 420; cam.bottom = -420; cam.near = 10; cam.far = 1200;
  key.shadow.bias = -0.0004;
  key.name = 'keyLight';
  const fill = new THREE.DirectionalLight(0xdfe9ff, 0.35);
  fill.position.set(300, 260, -300);
  fill.name = 'fillLight';
  scene.add(hemi, key, fill);
  return { hemi, key, fill };
}

// ------------------------------------------------------------------ assembly
/** Build the whole room and return handles the UI needs. */
export function buildLaboratory(scene) {
  roomShell(scene);
  const benches = benchUnits(scene);
  const servicesGroup = services(scene);
  const hood = fumeCupboard(scene);
  const sink = sinkArea(scene);
  const safety = safetyStations(scene);
  const shelf = reagentShelf(scene);
  periodicTable(scene);
  posters(scene);
  dryingRack(scene);
  const lights = buildLighting(scene);
  return { benches, services: servicesGroup, hood, sink, safety, shelf, lights, gases, waterTaps, sockets };
}
