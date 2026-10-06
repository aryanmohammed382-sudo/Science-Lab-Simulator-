# Science Lab Simulator

A fast, browser-based virtual laboratory for students. It runs entirely on the client, with experiment state and notebook data stored locally in the browser.

## Current curriculum

The library now includes 36 practical simulations across four tracks:

### Physics
Ohm's Law · Series Circuits · Parallel Circuits · Resistivity · Electrical Power · Density · Hooke's Law · Simple Pendulum · Principle of Moments · Friction · Convex Lens · Refraction and Snell's Law · Specific Heat Capacity · Gas Pressure and Volume

### Chemistry
Acid–Base Titration · Acids, Bases and Indicators · Filtration and Separation · Paper Chromatography · Rate of Reaction · Electrolysis · Metal Displacement · Flame Tests · Preparation of a Soluble Salt

### Biology
Food Tests · Light Microscope · Osmosis · Enzyme Activity · Photosynthesis and Light · Respiration and Temperature · Transpiration · Quadrat Sampling

### Environmental Science
Water Quality Testing · Soil Composition · Greenhouse Effect · Weather Station

## Design goals

- **Instant startup:** no runtime API, backend, database, image CDN or font CDN is required.
- **Accurate core relationships:** calculations use standard school-level equations such as V = IR, T = 2π√(L/g), density = mass/volume, P = VI, the lens equation, Snell's law and Q = It.
- **Visually structured:** each practical uses a reusable virtual bench, live readings, controls, an observation table and a mission.
- **Student-safe:** every experiment has a materials list and a safety note.
- **Offline-friendly architecture:** the simulations are local JavaScript and CSS, so GitHub Pages does not need a server.
- **Expandable:** experiments are data-driven in `experiments.js`; simulation behaviour is handled by reusable engines in `app.js`.

## Important modelling note

These are educational simulations, not substitutes for supervised laboratory work. Where a real experiment involves complex apparatus, uncertainty, heat transfer, reaction kinetics or biological variation, the simulator uses a clearly labelled idealised model rather than pretending to reproduce every real-world effect.

## Files

- `index.html` — application shell
- `styles.css` — responsive visual system and apparatus
- `experiments.js` — curriculum catalogue, objectives, controls, materials and safety
- `app.js` — simulation calculations, navigation, observation recording and local progress

## Running

Open `index.html` directly or publish the repository with GitHub Pages. No build step is required.
