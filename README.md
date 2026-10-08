# Science Lab Simulator

A browser-based virtual science laboratory built with Vite and Three.js. It runs entirely on the client: experiment state, notebook data and saves are stored locally in the browser (localStorage).

## What it simulates

- **Chemistry** — substances, ions, mixtures, precipitation, gas evolution, redox, neutralisation, electrolysis, pH, colour changes, temperature, reaction kinetics and equilibrium.
- **Physics** — electrical circuits solved with a Modified Nodal Analysis engine (wires, cells, resistors, lamps, diodes/LEDs, switches, ammeters, voltmeters), thermal heating/boiling, and measurement with resolution/uncertainty.
- **Biology** — food tests, enzyme reactions, microscopy-style observations and qualitative tests.
- **Environmental Management** — practicals with reagents, measurements and safety notes.

The laboratory includes a 3D bench environment (benches, shelf, fume hood, sink, safety stations), a procedural apparatus catalogue, a liquid system (fill, pour, decant, pipette, burette, tilt-based pouring), wiring terminals for circuits, heat sources (Bunsen burner/hot plate), instruments (thermometer, voltmeter, ammeter, rheostat, stopwatch, pH meter) and a safety rule engine with educational warnings.

## Built

- `npm install` (or use the bundled package-lock.json)
- `npm run dev` — live dev server
- `npm run build` — production build into `dist/`
- `npm run preview` — preview the production build locally
- `npm test` — run the Node unit tests (chemistry, circuit, library and world simulation)

## Files

- `index.html` — application shell (loads the built bundle in production; in dev it loads `src/main.js` via Vite)
- `package.json` / `package-lock.json` / `vite.config.js` — build tooling
- `src/main.js` — app entry point (renderer, camera, controls, world, UI, loop)
- `src/styles.css` — full interface stylesheet
- `src/ui/` — LabUI (top bar, left inventory, centre viewport, right inspector, tabs for bench / experiments / notebook / safety log / data & graphs / research / saves)
- `src/three/` — renderer, camera, run loop, world model, laboratory geometry, procedural apparatus mesh factory, interaction (pick/drag/rotate/tilt/wire), liquid system, electrical wiring, simulation step loop, materials
- `src/core/` — science engines: species, substances, mixtures, reactions, circuit (MNA), electrolysis, thermal, measurement, safety, apparatus catalogue, storage, util
- `src/core/experiments/` — chemistry, biology, physics, research, schema, index

## Running on GitHub Pages

After pushing `main`, enable GitHub Pages for the repository and set the source to the `main` branch `/ (root)`. The root `index.html` loads the built bundle, so publish the `dist/` output or build and serve the root `index.html` against the built assets.

For a pure static-pages setup without a build step on GitHub, build locally first (`npm run build`) and either:
- push the `dist/` contents to a `gh-pages` branch, or
- configure GitHub Pages to serve the `dist/` folder if supported, or
- replace the root `index.html` with one that loads a prebuilt bundle you commit.

## Important modelling note

These are educational simulations, not substitutes for supervised laboratory work. Where a real experiment involves complex apparatus, uncertainty, heat transfer, reaction kinetics or biological variation, the simulator uses an idealised educational model rather than pretending to reproduce every real-world effect.

## License

Copyright Aryan Mohammed. Edit the LICENSE file or add one as needed before publishing.
