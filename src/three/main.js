// ---------------------------------------------------------------------------
// THREE.JS CORE — renderer, scene, camera, lights
// ---------------------------------------------------------------------------
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function createRenderer({ width, height, antialias = true } = {}) {
  const w = width || window.innerWidth;
  const h = height || window.innerHeight;
  const renderer = new THREE.WebGLRenderer({
    antialias,
    alpha: false
  });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  return renderer;
}

export function createCamera({ fov = 45, near = 0.5, far = 2000, position = null } = {}) {
  const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
  camera.position.set(0, 0, 0);
  if (position) camera.position.set(position.x, position.y, position.z);
  camera.lookAt(0, 90, 0);
  return camera;
}

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0f13);
scene.fog = new THREE.Fog(0x0a0f13, 500, 900);

export { OrbitControls };

export function runLoop(renderer, scene, camera, world, interaction, opts = {}) {
  const { maxDt = 0.05 } = opts;
  let last = performance.now();
  const step = (now) => {
    const realDt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const dt = Math.min(realDt, maxDt);
    if (world && world.step) world.step(dt);
    if (interaction && interaction.update) interaction.update(dt);
    renderer.render(scene, camera);
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export { scene as default };
