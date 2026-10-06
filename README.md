# Science Lab Simulator

A fast, browser-based virtual laboratory for students. It runs entirely on the client, with experiment state and notebook data stored locally in the browser.

## Cambridge curriculum coverage

The library now contains **200 practical simulations: 50 Physics, 50 Chemistry, 50 Biology and 50 Environmental Management**.

The science tracks are designed around the progression from **Cambridge IGCSE** into **Cambridge International AS & A Level**:

- **Physics:** Cambridge IGCSE Physics 0625/0972 and AS & A Level Physics 9702
- **Chemistry:** Cambridge IGCSE Chemistry 0620/0971 and AS & A Level Chemistry 9701
- **Biology:** Cambridge IGCSE Biology 0610/0970 and AS & A Level Biology 9700
- **Environmental Management:** Cambridge IGCSE Environmental Management 0680 and Cambridge International AS Level Environmental Management 8291

The Physics, Chemistry and Biology selections deliberately include both familiar IGCSE practical contexts and more advanced AS/A Level investigations. The practical design emphasises measurement, manipulation, data presentation, analysis, conclusions and evaluation, matching the practical-skills focus of the Cambridge science syllabuses.

Environmental Management is aligned to IGCSE 0680 and AS 8291. Cambridge currently offers this subject at AS rather than a corresponding A Level, so the simulator does not falsely label it as an A Level track.

## Experiment areas

### Physics — 50
Measurement and uncertainty · motion and acceleration · forces · momentum · energy and power · pressure and density · elasticity · thermal physics · waves and sound · optics · electromagnetic effects · radioactivity · electricity and electronics.

### Chemistry — 50
Quantitative chemistry · titration · gravimetric analysis · gas volumes · energetics · kinetics · equilibrium · acids and bases · electrochemistry · qualitative analysis · organic chemistry · chromatography · separation and purification · spectroscopy.

### Biology — 50
Microscopy · cells and membranes · biological molecules · enzymes · transport · photosynthesis · respiration · plant physiology · human physiology · ecology · biodiversity · sampling · genetics · evolution · microbiology.

### Environmental Management — 50
Water quality · pollution · water treatment · eutrophication · soils · agriculture · biodiversity · populations · habitat management · resource management · fisheries · energy · waste · carbon cycling · climate change · environmental impact assessment.

## Practical-skill design

The simulator is intended to build the skills needed for Cambridge practical assessments:

- selecting and using appropriate apparatus
- making measurements and repeated readings
- controlling variables
- recording observations and quantitative data
- presenting results in tables
- identifying relationships between variables
- calculating derived quantities
- drawing conclusions from evidence
- evaluating procedures and suggesting improvements
- working safely with laboratory and field equipment

These skills are particularly important because Cambridge IGCSE practical assessment tests experimental skills and contexts, while the AS & A Level science courses place strong emphasis on advanced practical skills and experimental investigation.

## Scientific simulation layer

The latest laboratory upgrade adds an experiment-specific science layer on top of the reusable apparatus engine. Every catalogue entry now resolves to a named scientific profile containing its own apparatus, variables, equations/formulas, laws and principles, procedure, observations, explanation of why the observed event occurs, and experiment-specific takeaways. This keeps the 200-practical catalogue maintainable without presenting the student with a generic “change two numbers” experiment.

The laboratory workspace now includes:

- **Key Details** with objective, apparatus/materials, formulas, symbol meanings, laws/principles, reaction information and key takeaways
- **Live observation** text that changes with the simulated experimental state
- **Experiment status** that progresses from ready to performing/reaction to complete
- **Specific apparatus scenes** for circuits, pendulums, titrations, precipitation, electrolysis, pH testing, food tests, microscopy, optics, thermal work, waves, fieldwork and more
- **Progressive reaction states** for relevant chemistry/biology/environmental practicals rather than an instant before/after swap
- **Reaction-specific colours and precipitation states**, including nucleation, suspension and settling behaviour where appropriate
- **Measurement-linked recording**, so recorded readings are generated from the current simulated state rather than decorative graph points
- **Why did this happen?** explanations connected to the scientific principle or equation behind an observed event
- **Experiment completion summary and XP feedback** after the required measurements are recorded

The chemistry precipitation model is deliberately state-driven: clear solution → initial nucleation → increasing suspended particles/cloudiness → settling → accumulated solid layer. Particle positions are deterministic from the reaction state, so the solid does not visually jump between frames. Precipitate colour is selected from the named reaction rather than using one universal coloured block. Qualitative-analysis simulations use named ion tests (for example chloride, bromide, iodide, sulfate and carbonate) with reaction-specific equations and observations.

## Design goals

- **Instant startup:** no runtime API, backend, database, image CDN or font CDN is required.
- **Accurate core relationships:** existing simulations use standard school-level equations such as V = IR, T = 2π√(L/g), density = mass/volume, P = VI, the lens equation, Snell's law and Q = It.
- **Visually structured:** each practical uses a reusable virtual bench, live readings, controls, an observation table and a mission.
- **Student-safe:** every experiment has a materials list and a safety note.
- **Offline-friendly architecture:** the simulations are local JavaScript and CSS, so GitHub Pages does not need a server.
- **Expandable:** experiments are data-driven in `experiments.js`; simulation behaviour is handled by reusable engines in `app.js`.

## Important modelling note

These are educational simulations, not substitutes for supervised laboratory work. Where a real experiment involves complex apparatus, uncertainty, heat transfer, reaction kinetics or biological variation, the simulator uses an idealised educational model rather than pretending to reproduce every real-world effect.

The catalogue has been audited so every one of the 200 practicals resolves to an apparatus, variables, units, formula/law set, procedure and takeaways. Chemistry entries that previously fell through to generic placeholder chemistry now have named reactions or physical-process descriptions, dedicated apparatus scenes where needed, and reaction-specific visual states. The reusable engine remains underneath this data layer so the catalogue stays maintainable.

## Files

- `index.html` — application shell
- `styles.css` — responsive visual system and apparatus
- `experiments.js` — curriculum catalogue, objectives, controls, materials and safety
- `app.js` — simulation calculations, navigation, observation recording and local progress

## Running

Open `index.html` directly or publish the repository with GitHub Pages. No build step is required.
