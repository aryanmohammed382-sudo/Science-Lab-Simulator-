// ---------------------------------------------------------------------------
// VIRTUAL SCIENCE LABORATORY — application entry point
// ---------------------------------------------------------------------------
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createRenderer, createCamera, scene, runLoop } from './three/main.js';
import { Interaction } from './three/interaction.js';
import { provideBuilders } from './three/interaction.js';
import { buildApparatus } from './three/geometry.js';
import { World } from './three/world.js';
import { buildLaboratory } from './three/lab.js';
import { LabUI } from './ui/app.js';
import { Notebook } from './core/storage.js';
import './styles.css';

provideBuilders({ buildApparatus });

const appRoot = document.getElementById('app');
const showStartupError = (error, phase = 'startup') => {
  console.error('Virtual Science Laboratory startup error:', error);
  if (!appRoot) return;
  const message = error instanceof Error ? error.message : String(error);
  appRoot.innerHTML = `
    <div style="height:100vh;width:100vw;display:flex;align-items:center;justify-content:center;background:#0e151c;color:#d9e1e8;font-family:system-ui,sans-serif;padding:32px">
      <div style="max-width:760px;border:1px solid #35424f;background:#151e25;border-radius:10px;padding:28px;box-shadow:0 20px 60px rgba(0,0,0,.4)">
        <h1 style="margin:0 0 10px;font-size:22px">Virtual Science Laboratory could not start</h1>
        <p style="color:#aebbc5;margin:0 0 18px">The page loaded, but the simulator stopped during <b>${phase}</b>.</p>
        <pre style="white-space:pre-wrap;background:#0a0f13;border:1px solid #27333d;padding:16px;border-radius:6px;color:#e9c149;overflow:auto">${message.replace(/[&<>]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]))}</pre>
        <p style="color:#7d8b95;margin:18px 0 0;font-size:12px">Open the browser console for the full stack trace.</p>
      </div>
    </div>`;
};
window.addEventListener('error', (event) => {
  if (!window.__lab) showStartupError(event.error || event.message, 'JavaScript initialization');
});
window.addEventListener('unhandledrejection', (event) => {
  if (!window.__lab) showStartupError(event.reason, 'asynchronous initialization');
});

const WORLD_HEIGHT = 600;
const WORLD_DEPTH = 700;
const WORLD_WIDTH = 900;

let renderer;
try {
  renderer = createRenderer({
    width: window.innerWidth,
    height: window.innerHeight,
    antialias: true
  });
} catch (error) {
  showStartupError(error, 'WebGL renderer creation');
  throw error;
}
renderer.domElement.classList.add('lab-canvas');
renderer.domElement.style.display = 'block';
renderer.domElement.style.width = '100%';
renderer.domElement.style.height = '100%';

const camera = createCamera({
  position: new THREE.Vector3(0, 140, 260)
});
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.dampingFactor = 0.08;
orbit.maxPolarAngle = Math.PI / 2.02;
orbit.minDistance = 40;
orbit.maxDistance = 520;

const world = new World({ scene });
try {
  buildLaboratory(scene);
} catch (error) {
  showStartupError(error, 'laboratory scene construction');
  throw error;
}

// A small welcome run: a bench and a beaker so the scene isn't empty on
// first load.
const bench = world.add('beaker_250', { surfaceId: 'bench_chem', x: -15, z: 0 });
world.fill(bench.id, { substanceId: 'distilled_water', volumeML: 100 });

const interaction = new Interaction({
  renderer,
  scene,
  camera,
  world,
  canvas: renderer.domElement
});

const notebook = new Notebook();
let statusSink = null;

const ui = new LabUI({
  world,
  interaction,
  notebook,
  onCameraMode: (mode) => interaction.setCameraMode(mode),
  onGhost: (def) => interaction.startGhost(def),
  onSelect: (id) => { ui.selectedId = id; ui._refresh(); ui._renderInspector(); }
});
statusSink = ui.status;
interaction.onStatus = (text, severity) => statusSink?.(text, severity);

try {
  ui.mount(appRoot);
} catch (error) {
  showStartupError(error, 'user interface construction');
  throw error;
}
ui.dom.canvasHost.appendChild(renderer.domElement);
ui.setTab('bench');
world.onEvent = (ev) => {
  if (ev.type === 'reaction' || ev.type === 'electrolysis' || ev.type === 'prediction') {
    notebook.add({
      kind: 'observation',
      title: ev.type === 'prediction' ? 'Prediction' : ev.type === 'reaction' ? 'Reaction' : 'Observation',
      text: ev.text,
      data: { equation: ev.equation, observations: ev.observations },
      tags: [ev.type]
    });
  }
  if (ev.type === 'safety') {
    notebook.add({
      kind: 'safety',
      title: `Safety: ${ev.severity || 'info'}`,
      text: ev.text,
      tags: ['safety', ev.severity || 'info']
    });
  }
};

// wire a function that lets the notebook tab save directly from the UI
window.lab = {
  saveLab: () => ui.saveLab(),
  resetLab: () => ui.resetLab(),
  loadSave: (id) => ui.loadSave(id),
  removeSave: (id) => ui.removeSave(id),
  extractSave: (name) => ui.extractSave(name),
  importSave: () => ui.importSave(),
  placeFromInventory: (def) => ui.placeFromInventory(def),
  dispenseReagent: (sub) => ui.dispenseReagent(sub),
  renderSaves: () => ui.renderSaves(),
  renderLibrary: () => ui.renderLibrary(),
  renderNotebook: () => ui.renderNotebook(),
  renderSafetyLog: () => ui.renderSafetyLog(),
  renderData: () => ui.renderData(),
  renderResearch: () => ui.renderResearch(),
  renderNotebookInner: () => ui.renderNotebookInner(),
  status: (text, severity) => ui.status(text, severity),
  focusSelected: () => ui.focusSelected(),
  recordReading: (obj) => ui.recordReading(obj),
  renderInspector: () => ui.renderInspector(),
  onSelect: (id) => ui.onSelect(id),
  onGhost: (def) => ui.onGhost(def),
  cameraMode: (mode) => ui.cameraMode(mode)
};

// attach a couple of convenience globals the inspector and the notebook tab
// both use to reload themselves after a world event
window.labSinks = ui.labSinks;

// Initial render seeds
ui._refresh();

// start the main loop
runLoop(renderer, scene, camera, world, interaction);

// Expose for the browser console the world model and the interaction
window.__lab = { world, scene, camera, interaction, ui, notebook };

// resize the renderer when the window changes size
window.addEventListener('resize', () => {
  const host = ui.dom.canvasHost;
  const width = host?.clientWidth || window.innerWidth;
  const height = host?.clientHeight || window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
});
