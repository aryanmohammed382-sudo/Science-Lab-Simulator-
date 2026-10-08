// ---------------------------------------------------------------------------
// CAMERA, PICKING AND DIRECT MANIPULATION
// ---------------------------------------------------------------------------
// Three camera modes (orbit the bench, close-up work, and a walking view), ray
// picking with a highlight, dragging apparatus over the surfaces, rotating and
// tilting it, plugging wires into terminals, and reading the liquid level under
// the pointer.
//
// Nothing in here decides chemistry: it only changes what the world model is
// told to do.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SURFACES, surfaceAt, surfaceById, BENCH_Y } from './lab.js';
import { clamp, round } from '../core/util.js';

export const CAMERA_MODES = {
  orbit: 'Orbit the laboratory',
  bench: 'Bench close-up',
  walk: 'Walk around'
};

const HIGHLIGHT_COLOUR = 0x7fd4ff;

export class Interaction {
  constructor({ renderer, scene, camera, world, canvas, onSelect = null, onStatus = null }) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.world = world;
    this.canvas = canvas || renderer.domElement;
    this.onSelect = onSelect;
    this.onStatus = onStatus;

    this.mode = 'orbit';
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.hover = null;
    this.selected = null;
    this.marker = null;

    this.drag = null;         // {objectId, offset, plane}
    this.rotateDrag = null;
    this.tiltDrag = null;
    this.wireFrom = null;     // {objectId, terminal}
    this.ghost = null;        // preview for placing new apparatus
    this.keys = new Set();
    this.clock = new THREE.Clock();
    this.lastPointer = { x: 0, y: 0 };
    this.walk = { yaw: 0, pitch: -0.1, speed: 260 };   // cm/s
    this.pointerNDC = new THREE.Vector2();

    this.controls = new OrbitControls(camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI * 0.495;
    this.controls.minDistance = 25;
    this.controls.maxDistance = 900;
    this.controls.target.set(-20, BENCH_Y + 12, 0);
    this.setCameraMode('orbit');

    this.selectionBox = new THREE.Box3Helper(new THREE.Box3(), HIGHLIGHT_COLOUR);
    this.selectionBox.visible = false;
    this.scene.add(this.selectionBox);

    this.bind();
  }

  // ------------------------------------------------------------------ input
  bind() {
    const el = this.canvas;
    el.addEventListener('pointermove', (e) => this.onPointerMove(e));
    el.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    el.addEventListener('pointerup', (e) => this.onPointerUp(e));
    el.addEventListener('wheel', () => { }, { passive: true });
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => this.keys.clear());
  }

  pointerFromEvent(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.lastPointer = { x: e.clientX, y: e.clientY };
    return this.pointer;
  }

  /** The first world object under the pointer (terminals and liquids included). */
  pickAt(e) {
    this.pointerFromEvent(e);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const roots = this.world.list().map((o) => o.group);
    const hits = this.raycaster.intersectObjects(roots, true);
    for (const hit of hits) {
      let node = hit.object;
      while (node && !node.userData.apparatusId) node = node.parent;
      if (!node) continue;
      const obj = this.world.objects.get(node.userData.apparatusId) || this.world.find((o) => o.group === node);
      if (!obj) continue;
      const terminal = this.terminalFromHit(obj, node, hit.point);
      return { obj, point: hit.point, node, terminal };
    }
    return null;
  }

  /** Which terminal of an object was hit (nearest terminal node). */
  terminalFromHit(obj, node, point) {
    if (!obj || !obj.terminalNodes?.length) return null;
    let best = null, bestD = 1.6;
    obj.terminalNodes.forEach((p, i) => {
      const wp = obj.group.localToWorld(p.clone());
      const d = wp.distanceTo(point);
      if (d < bestD) { bestD = d; best = { index: i, name: obj.terminalNames[i] || (i ? 'b' : 'a'), point: wp }; }
    });
    return best;
  }

  onPointerMove(e) {
    if (this.keys.has('shift') && this.wireFrom) {
      this.updateWirePreview(e);
      return;
    }
    if (this.drag) { this.updateDrag(e); return; }
    if (this.rotateDrag) {
      const dx = e.clientX - this.rotateDrag.x;
      this.rotateDrag.x = e.clientX;
      this.world.turn(this.rotateDrag.id, dx * 0.01);
      this.world.updateWires();
      return;
    }
    if (this.tiltDrag) {
      const dy = e.clientY - this.tiltDrag.y;
      this.tiltDrag.y = e.clientY;
      const obj = this.world.get(this.tiltDrag.id);
      if (obj) {
        this.world.setTilt(obj.id, clamp(obj.tilt + dy * 0.008, -1.45, 1.45));
        this.world.updateWires();
        this.status(`${obj.name} tilted ${round((this.world.get(obj.id).tilt * 180) / Math.PI, 0)} degrees`);
      }
      return;
    }
    const hit = this.pickAt(e);
    this.setHover(hit ? hit.obj : null, hit);
  }

  onPointerDown(e) {
    if (e.button !== 0) return;
    const hit = this.pickAt(e);
    if (!hit) { this.select(null); return; }
    this.select(hit.obj);
    if (this.ghost) { this.placeGhost(hit.point); return; }
    // Shift-click on a terminal starts a wire
    if (hit.terminal && (e.shiftKey || this.keys.has('shift'))) {
      if (!this.wireFrom) {
        this.wireFrom = { objectId: hit.obj.id, terminal: hit.terminal.name };
        this.status(`Lead started at ${hit.obj.name} terminal ${hit.terminal.name}. Click the other terminal to finish.`);
      } else {
        const res = this.world.connect(this.wireFrom.objectId, this.wireFrom.terminal, hit.obj.id, hit.terminal.name);
        this.status(res.ok ? 'Lead connected.' : `Could not connect: ${res.error}`);
        this.wireFrom = null;
      }
      return;
    }
    if (this.keys.has('r') || this.keys.has('e')) { this.rotateDrag = { id: hit.obj.id, x: e.clientX }; this.controls.enabled = false; return; }
    if (this.keys.has('t') || this.keys.has('q')) { this.tiltDrag = { id: hit.obj.id, y: e.clientY }; this.controls.enabled = false; return; }
    // otherwise: drag it
    this.beginDrag(hit);
  }

  onPointerUp(e) {
    if (this.drag) this.endDrag();
    if (this.rotateDrag) { this.rotateDrag = null; this.controls.enabled = true; }
    if (this.tiltDrag) { this.tiltDrag = null; this.controls.enabled = true; }
    if (this.wireFrom && this.keys.has('shift')) { /* keep waiting for the other terminal */ }
  }

  onKeyDown(e) {
    const k = e.key.toLowerCase();
    this.keys.add(k);
    if (k === 'escape') { this.cancelGhost(); this.wireFrom = null; this.select(null); }
    if (k === 'delete' || k === 'backspace') { if (this.selected) this.world.remove(this.selected.id); this.select(null); }
    if (k === 'c') this.cycleCameraMode();
    if (k === 'f') this.focusSelected();
    if (k === ' ') e.preventDefault();
  }

  // ----------------------------------------------------------------- camera
  setCameraMode(mode) {
    if (!CAMERA_MODES[mode]) return;
    this.mode = mode;
    this.controls.enabled = mode !== 'walk';
    if (mode === 'orbit') {
      this.camera.position.set(-120, BENCH_Y + 190, 330);
      this.controls.target.set(-20, BENCH_Y + 10, 0);
      this.controls.minDistance = 60;
      this.controls.maxDistance = 900;
    } else if (mode === 'bench') {
      this.camera.position.set(-60, BENCH_Y + 46, 120);
      this.controls.target.set(-20, BENCH_Y + 6, 0);
      this.controls.minDistance = 20;
      this.controls.maxDistance = 320;
    } else {
      this.camera.position.set(-40, 168, 250);
      this.walk.yaw = Math.PI;
      this.walk.pitch = -0.12;
    }
    this.controls.update();
    this.status(`Camera: ${CAMERA_MODES[mode]}`);
  }

  cycleCameraMode() {
    const keys = Object.keys(CAMERA_MODES);
    this.setCameraMode(keys[(keys.indexOf(this.mode) + 1) % keys.length]);
  }

  focusSelected() {
    if (!this.selected) return;
    const p = this.selected.position.clone();
    this.controls.target.copy(p);
    const dir = new THREE.Vector3(0.6, 0.7, 1).normalize();
    this.camera.position.copy(p.clone().add(dir.multiplyScalar(90)));
    this.controls.update();
  }

  /** Per-frame: walking, keyboard nudging, hover feedback. */
  update(dt) {
    if (this.mode === 'walk') this.updateWalk(dt);
    else this.controls.update();
    this.updateSelectionBox();
    this.updateGhostHover();
  }

  updateWalk(dt) {
    const k = this.keys;
    if (k.has('arrowleft')) this.walk.yaw += dt * 1.6;
    if (k.has('arrowright')) this.walk.yaw -= dt * 1.6;
    if (k.has('arrowup')) this.walk.pitch = clamp(this.walk.pitch + dt, -1.2, 1.2);
    if (k.has('arrowdown')) this.walk.pitch = clamp(this.walk.pitch - dt, -1.2, 1.2);
    const forward = new THREE.Vector3(Math.sin(this.walk.yaw), 0, Math.cos(this.walk.yaw));
    const right = new THREE.Vector3(forward.z, 0, -forward.x);
    const move = new THREE.Vector3();
    if (k.has('w')) move.add(forward);
    if (k.has('s')) move.sub(forward);
    if (k.has('a')) move.sub(right);
    if (k.has('d')) move.add(right);
    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(this.walk.speed * dt * (k.has('shift') ? 2 : 1));
      this.camera.position.add(move);
      this.camera.position.y = clamp(this.camera.position.y, 100, 280);
      this.camera.position.x = clamp(this.camera.position.x, -430, 430);
      this.camera.position.z = clamp(this.camera.position.z, -330, 330);
    }
    const look = forward.clone().multiplyScalar(Math.cos(this.walk.pitch)).setY(Math.sin(this.walk.pitch));
    this.camera.lookAt(this.camera.position.clone().add(look));
  }

  // -------------------------------------------------------------- selection
  select(obj) {
    this.selected = obj || null;
    this.updateSelectionBox();
    if (this.onSelect) this.onSelect(obj ? obj.id : null);
    if (obj) this.status(`${obj.name} selected`);
  }

  updateSelectionBox() {
    if (!this.selected || !this.selected.group.parent) { this.selectionBox.visible = false; return; }
    const box = new THREE.Box3().setFromObject(this.selected.group);
    if (!isFinite(box.min.x)) { this.selectionBox.visible = false; return; }
    this.selectionBox.box.copy(box);
    this.selectionBox.visible = true;
  }

  setHover(obj, hit) {
    if (this.hover === obj) {
      if (hit && hit.terminal) this.status(`${obj.name}: terminal ${hit.terminal.name}`);
      else if (obj) this.status(`${obj.name}${obj.mixture ? ` - ${round(obj.volumeML, 1)} cm3 at ${round(obj.temperatureC, 1)} C` : ''}`);
      return;
    }
    if (this.hover) this.setEmissive(this.hover, null);
    this.hover = obj;
    if (obj) this.setEmissive(obj, 0x1d3a4a);
  }

  setEmissive(obj, colour) {
    obj.group.traverse((o) => {
      if (!o.isMesh || !o.material || Array.isArray(o.material)) return;
      if (!o.material.emissive) return;
      if (colour == null) {
        if (o.userData._em !== undefined) { o.material.emissive.setHex(o.userData._od ?? 0x000000); delete o.userData._em; }
      } else if (o.userData._em === undefined) {
        o.userData._od = o.material.emissive.getHex();
        o.material.emissive.setHex(colour);
        o.userData._em = true;
      }
    });
  }

  // ------------------------------------------------------------------ drag
  beginDrag(hit) {
    const obj = hit.obj;
    if (obj.def.container === false && obj.group.userData.fixedFixture) { this.status('This fixture is part of the laboratory.'); return; }
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -hit.point.y);
    const intersect = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(plane, intersect);
    this.drag = {
      objectId: obj.id,
      plane,
      offset: intersect ? obj.position.clone().sub(intersect.setY(0)) : new THREE.Vector3(),
      y: obj.position.y,
      pickY: hit.point.y
    };
    this.controls.enabled = false;
    this.status(`Moving ${obj.name}. Drop it on a bench, or press Delete to remove it.`);
  }

  updateDrag(e) {
    this.pointerFromEvent(e);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -this.drag.pickY);
    const p = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(plane, p)) return;
    const x = p.x - this.drag.offset.x;
    const z = p.z - this.drag.offset.z;
    const surface = surfaceAt(x, z, this.drag.pickY) || surfaceById(this.drag.surfaceId || 'bench_chem');
    this.world.move(this.drag.objectId, { x, z, surfaceId: surface.id });
    this.world.updateWires();
    this.updateSelectionBox();
  }

  endDrag() {
    const obj = this.world.get(this.drag.objectId);
    this.drag = null;
    this.controls.enabled = this.mode !== 'walk';
    if (obj) {
      const surface = surfaceById(obj.surfaceId);
      this.status(`${obj.name} placed on the ${surface ? surface.label : 'bench'}.`);
      if (surface?.kind === 'hood') obj.userData.fumeHoodUsed = true;
      if (obj.def.glass && obj.position.y < 2) {
        this.world.emit({ type: 'safety', severity: 'caution', text: `${obj.name} is on the floor where it could be kicked - put it back on the bench.` });
      }
    }
  }

  // ------------------------------------------------------------- wire preview
  updateWirePreview(e) {
    const hit = this.pickAt(e);
    if (!hit || !hit.terminal) return;
    if (this._preview) { this.scene.remove(this._preview); this._preview = null; }
    const from = this.world.get(this.wireFrom.objectId);
    if (!from) return;
    const i = Math.max(0, from.terminalNames.indexOf(this.wireFrom.terminal));
    const a = from.terminalWorldPosition(i);
    const geo = new THREE.BufferGeometry().setFromPoints([a, hit.terminal.point]);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x7fd4ff }));
    line.raycast = () => {};
    this._preview = line;
    this.scene.add(line);
    this.status(`Connect to ${hit.obj.name} terminal ${hit.terminal.name}: click to finish.`);
  }

  // ------------------------------------------------------------------ ghost
  /** Start placing new apparatus from the inventory. */
  startGhost(def, opts = {}) {
    this.cancelGhost();
    const { buildApparatus } = Interaction._mods;
    const group = buildApparatus(def);
    group.userData.ghost = true;
    group.traverse((o) => { o.raycast = () => {}; if (o.material) o.material = o.material.clone?.() ?? o.material; });
    this.ghost = { def, group, opts };
    this.scene.add(group);
    this.status(`Placing ${def.name}: move over a surface and click to drop it (Esc to cancel).`);
  }

  cancelGhost() {
    if (!this.ghost) return;
    this.scene.remove(this.ghost.group);
    this.ghost = null;
  }

  updateGhostHover() {
    if (!this.ghost) return;
    this.pointerFromEvent({ clientX: this.lastPointer.x, clientY: this.lastPointer.y });
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -BENCH_Y);
    const p = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(plane, p)) {
      const surface = surfaceAt(p.x, p.z, BENCH_Y + 10) || surfaceById('bench_chem');
      this.ghost.group.position.set(p.x, surface.y, p.z);
    }
  }

  placeGhost(point) {
    const g = this.ghost;
    if (!g) return;
    const x = g.group.position.x, z = g.group.position.z;
    const surface = surfaceAt(x, z, BENCH_Y + 10) || surfaceById('bench_chem');
    const obj = this.world.add(g.def.id, { x, z, surfaceId: surface.id, ...g.opts });
    this.cancelGhost();
    this.select(obj);
    this.status(`${obj.name} placed on the ${surface.label}.`);
  }
}

// Late binding so interaction.js does not import the geometry factory at module
// load time in environments that only need the data.
Interaction._mods = {};
export function provideBuilders(mods) { Object.assign(Interaction._mods, mods); }
