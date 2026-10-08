// ---------------------------------------------------------------------------
// SUBSTANCE (REAGENT) DATABASE
// ---------------------------------------------------------------------------
// These are the physical things a student takes off the shelf: bottles of
// solution, jars of solid, gas cylinders, biological reagents.
//
// A substance knows how it turns into `species` when it enters a container:
//   solidForm  species id of the undissolved solid (metals, marble chips...)
//   dissolveTo species produced per mole of the substance when it dissolves
//   concentration / solvent for solutions
//
// Everything the inspector shows (state, colour, density, solubility, hazards,
// melting/boiling points, conductivity, compatibility) is declared here, so
// new reagents are pure data.
// ---------------------------------------------------------------------------

import { SPECIES, getSpecies } from './species.js';

export const SUBSTANCES = {};

/**
 * @param {object} s partial substance record
 * @returns {object} completed record
 */
function S(s) {
  const rec = {
    type: 'solid',
    category: 'reagent',
    subjects: ['chemistry'],
    levels: ['igcse', 'as', 'a', 'ug', 'research'],
    colour: null,
    ppe: ['goggles', 'labcoat'],
    ghs: [],
    incompatible: [],
    storage: 'chemical-store',
    conductivity: 'none',
    ...s
  };
  // Species the reagent introduces into a container.
  rec.species = rec.solidForm || (rec.dissolveTo && rec.dissolveTo[0] ? rec.dissolveTo[0].id : null) || null;
  // Neat-solution pH (where meaningful) so the inspector can display it.
  if (rec.ph === undefined) rec.ph = computeNeatPH(rec);
  // Buffer/standard solutions declare a pH rather than a concentration: derive
  // the matching concentration of H+ or OH- so the chemistry stays consistent.
  if (rec.ph !== undefined && rec.type === 'solution' && rec.concentration === undefined) {
    const ph = rec.ph;
    if (ph < 6.99) { rec.concentration = Math.pow(10, -ph); rec.dissolveTo = [{ id: 'H+', n: 1 }]; }
    else if (ph > 7.01) { rec.concentration = Math.pow(10, ph - 14); rec.dissolveTo = [{ id: 'OH-', n: 1 }]; }
    else { rec.concentration = 1e-7; rec.dissolveTo = [{ id: 'H+', n: 1 }]; }
  }
  SUBSTANCES[rec.id] = rec;
  return rec;
}

/** Approximate pH of the reagent as supplied (strong acids/bases fully split). */
function computeNeatPH(s) {
  if (s.type !== 'solution' && s.type !== 'liquid') return null;
  if (s.strongAcid) {
    const c = (s.concentration || 1) * (s.protons || 1);
    return -Math.log10(Math.max(c, 1e-14));
  }
  if (s.strongBase) {
    const c = (s.concentration || 1) * (s.hydroxides || 1);
    return 14 + Math.log10(Math.max(c, 1e-14));
  }
  if (s.weakAcid && s.pKa !== undefined) {
    const c = s.concentration || 1;
    const Ka = s.Ka !== undefined ? s.Ka : Math.pow(10, -s.pKa);
    const h = Math.sqrt(Ka * c); // simple weak-acid approximation
    return -Math.log10(Math.max(h, 1e-14));
  }
  if (s.category === 'water') return 7;
  return null;
}

const acid = (id, name, formula, opts) => S({
  id, name, formula, type: 'solution', category: 'acid', strongAcid: true,
  ppe: ['goggles', 'labcoat', 'gloves'], ghs: ['corrosive', 'irritant'],
  conductivity: 'strong', storage: 'acid-cabinet',
  ...opts
});

const base = (id, name, formula, opts) => S({
  id, name, formula, type: 'solution', category: 'base', strongBase: true,
  ppe: ['goggles', 'labcoat', 'gloves'], ghs: ['corrosive', 'irritant'],
  conductivity: 'strong', storage: 'base-shelf',
  ...opts
});

// ------------------------------------------------------------------ ACIDS
acid('hcl_0_1m', 'Hydrochloric acid, 0.1 mol/dm3', 'HCl(aq)', {
  concentration: 0.1, protons: 1, density: 1.0, dissolveTo: [{ id: 'H+', n: 1 }, { id: 'Cl-', n: 1 }],
  notes: 'Dilute bench acid. Corrosive to eyes, irritant to skin.', dispense: 'bottle', volume: 500
});
acid('hcl_1m', 'Hydrochloric acid, 1.0 mol/dm3', 'HCl(aq)', {
  concentration: 1.0, protons: 1, density: 1.02, dissolveTo: [{ id: 'H+', n: 1 }, { id: 'Cl-', n: 1 }],
  notes: 'Standard bench concentration for rates of reaction and titrations.', dispense: 'bottle', volume: 500
});
acid('hcl_2m', 'Hydrochloric acid, 2.0 mol/dm3', 'HCl(aq)', {
  concentration: 2.0, protons: 1, density: 1.03, dissolveTo: [{ id: 'H+', n: 1 }, { id: 'Cl-', n: 1 }],
  notes: 'More concentrated bench acid; fume hood recommended.', dispense: 'bottle', volume: 500
});
acid('hcl_conc', 'Hydrochloric acid, concentrated (~11 mol/dm3)', 'HCl(aq)', {
  concentration: 11, protons: 1, density: 1.18, dissolveTo: [{ id: 'H+', n: 1 }, { id: 'Cl-', n: 1 }],
  ghs: ['corrosive', 'toxic', 'fumes'], notes: 'Fuming. Always dispense in the fume hood.', dispense: 'bottle', volume: 250, fumeOnly: true
});
acid('h2so4_0_5m', 'Sulfuric acid, 0.5 mol/dm3', 'H2SO4(aq)', {
  concentration: 0.5, protons: 2, density: 1.03, dissolveTo: [{ id: 'H+', n: 2 }, { id: 'SO4^2-', n: 1 }],
  dispense: 'bottle', volume: 500
});
acid('h2so4_1m', 'Sulfuric acid, 1.0 mol/dm3', 'H2SO4(aq)', {
  concentration: 1.0, protons: 2, density: 1.06, dissolveTo: [{ id: 'H+', n: 2 }, { id: 'SO4^2-', n: 1 }],
  dispense: 'bottle', volume: 500
});
acid('h2so4_conc', 'Sulfuric acid, concentrated (18 mol/dm3)', 'H2SO4(aq)', {
  concentration: 18, protons: 2, density: 1.84, dissolveTo: [{ id: 'H+', n: 2 }, { id: 'SO4^2-', n: 1 }],
  ghs: ['corrosive', 'dehydrating'], notes: 'Add acid to water, never water to acid.', dispense: 'bottle', volume: 250, fumeOnly: true
});
acid('hno3_0_5m', 'Nitric acid, 0.5 mol/dm3', 'HNO3(aq)', {
  concentration: 0.5, protons: 1, density: 1.01, dissolveTo: [{ id: 'H+', n: 1 }, { id: 'NO3-', n: 1 }],
  dispense: 'bottle', volume: 500
});
acid('hno3_2m', 'Nitric acid, 2.0 mol/dm3', 'HNO3(aq)', {
  concentration: 2.0, protons: 1, density: 1.06, dissolveTo: [{ id: 'H+', n: 1 }, { id: 'NO3-', n: 1 }],
  dispense: 'bottle', volume: 500
});
acid('hno3_conc', 'Nitric acid, concentrated (15 mol/dm3)', 'HNO3(aq)', {
  concentration: 15, protons: 1, density: 1.51, dissolveTo: [{ id: 'H+', n: 1 }, { id: 'NO3-', n: 1 }],
  ghs: ['corrosive', 'oxidising', 'fumes'], notes: 'Strong oxidiser - keep away from organics.', dispense: 'bottle', volume: 250, fumeOnly: true
});
S({
  id: 'ch3cooh_1m', name: 'Ethanoic acid, 1.0 mol/dm3', formula: 'CH3COOH(aq)',
  type: 'solution', category: 'acid', weakAcid: true, pKa: 4.76, concentration: 1.0,
  density: 1.0, dissolveTo: [{ id: 'CH3COOH', n: 1 }], level: 'irritant',
  ghs: ['irritant'], ppe: ['goggles', 'labcoat'], conductivity: 'weak',
  notes: 'Weak acid: only about 0.4 % ionised at this concentration.', dispense: 'bottle', volume: 500
});
S({
  id: 'ch3cooh_glacial', name: 'Ethanoic acid, glacial (17.4 mol/dm3)', formula: 'CH3COOH(l)',
  type: 'liquid', category: 'acid', weakAcid: true, pKa: 4.76, concentration: 17.4,
  density: 1.049, molarMass: 60.052, dissolveTo: [{ id: 'CH3COOH', n: 1 }],
  ghs: ['corrosive', 'flammable'], ppe: ['goggles', 'labcoat', 'gloves'],
  conductivity: 'weak', storage: 'acid-cabinet', dispense: 'bottle', volume: 500, mp: 16.6, bp: 118.1,
  notes: 'Sharp vinegary smell; freezes near room temperature.'
});
S({
  id: 'citric_1m', name: 'Citric acid, 1.0 mol/dm3', formula: 'C6H8O7(aq)',
  type: 'solution', category: 'acid', weakAcid: true, pKa: 3.13, concentration: 1.0,
  dissolveTo: [{ id: 'C6H8O7', n: 1 }], ghs: [], notes: 'Food-grade weak acid used in buffer and rate work.',
  dispense: 'bottle', volume: 500, conductivity: 'weak'
});
S({
  id: 'h3po4_1m', name: 'Phosphoric(V) acid, 1.0 mol/dm3', formula: 'H3PO4(aq)',
  type: 'solution', category: 'acid', weakAcid: true, pKa: 2.15, concentration: 1.0,
  dissolveTo: [{ id: 'H+', n: 1 }, { id: 'H2PO4-', n: 1 }], ghs: ['irritant'], dispense: 'bottle', volume: 500,
  conductivity: 'weak'
});

// ------------------------------------------------------------ BASES / ALKALIS
base('naoh_0_1m', 'Sodium hydroxide, 0.1 mol/dm3', 'NaOH(aq)', {
  concentration: 0.1, hydroxides: 1, density: 1.0, dissolveTo: [{ id: 'Na+', n: 1 }, { id: 'OH-', n: 1 }],
  dispense: 'bottle', volume: 500
});
base('naoh_1m', 'Sodium hydroxide, 1.0 mol/dm3', 'NaOH(aq)', {
  concentration: 1.0, hydroxides: 1, density: 1.04, dissolveTo: [{ id: 'Na+', n: 1 }, { id: 'OH-', n: 1 }],
  dispense: 'bottle', volume: 500, notes: 'Standard alkali for titrations. Very slippery - clean spills at once.'
});
base('koh_0_5m', 'Potassium hydroxide, 0.5 mol/dm3', 'KOH(aq)', {
  concentration: 0.5, hydroxides: 1, density: 1.02, dissolveTo: [{ id: 'K+', n: 1 }, { id: 'OH-', n: 1 }],
  dispense: 'bottle', volume: 500
});
base('ammonia_1m', 'Ammonia solution, 1.0 mol/dm3', 'NH3(aq)', {
  concentration: 1.0, hydroxides: 1, density: 0.99, weakBase: true, pKb: 4.75,
  dissolveTo: [{ id: 'NH3', n: 1 }], ghs: ['irritant', 'fumes'], ppe: ['goggles', 'labcoat'],
  conductivity: 'weak', dispense: 'bottle', volume: 500, fumeOnly: true,
  notes: 'Pungent. Where there is ammonia there should be a fume hood.'
});
base('ammonia_conc', 'Ammonia solution, concentrated (14 mol/dm3)', 'NH3(aq)', {
  concentration: 14, weakBase: true, pKb: 4.75, density: 0.9, dissolveTo: [{ id: 'NH3', n: 1 }],
  ghs: ['corrosive', 'toxic', 'fumes'], ppe: ['goggles', 'labcoat', 'gloves'],
  conductivity: 'weak', dispense: 'bottle', volume: 250, fumeOnly: true
});
S({
  id: 'limewater', name: 'Limewater (calcium hydroxide, saturated)', formula: 'Ca(OH)2(aq)',
  type: 'solution', category: 'base', concentration: 0.02, hydroxides: 2, strongBase: true,
  density: 1.0, dissolveTo: [{ id: 'Ca2+', n: 1 }, { id: 'OH-', n: 2 }], ghs: [], ppe: ['goggles'],
  notes: 'The standard test for carbon dioxide: turns milky.', dispense: 'bottle', volume: 500, conductivity: 'weak'
});
S({
  id: 'na2co3_0_5m', name: 'Sodium carbonate, 0.5 mol/dm3', formula: 'Na2CO3(aq)',
  type: 'solution', category: 'base', concentration: 0.5, density: 1.05,
  dissolveTo: [{ id: 'Na+', n: 2 }, { id: 'CO3^2-', n: 1 }], ghs: ['irritant'],
  notes: 'Alkaline solution used for neutralisation and volumetric work.', dispense: 'bottle', volume: 500
});
S({
  id: 'nahco3_0_5m', name: 'Sodium hydrogencarbonate, 0.5 mol/dm3', formula: 'NaHCO3(aq)',
  type: 'solution', category: 'base', concentration: 0.5, density: 1.03,
  dissolveTo: [{ id: 'Na+', n: 1 }, { id: 'HCO3-', n: 1 }], ghs: [], ppe: ['goggles'], dispense: 'bottle', volume: 500
});
S({
  id: 'barium_hydroxide_0_1m', name: 'Barium hydroxide, 0.1 mol/dm3', formula: 'Ba(OH)2(aq)',
  type: 'solution', category: 'base', concentration: 0.1, hydroxides: 2, strongBase: true,
  density: 1.02, dissolveTo: [{ id: 'Ba2+', n: 1 }, { id: 'OH-', n: 2 }],
  ghs: ['toxic', 'irritant'], ppe: ['goggles', 'labcoat', 'gloves'], dispense: 'bottle', volume: 500
});
S({ id: 'naoh_pellets', name: 'Sodium hydroxide pellets', formula: 'NaOH(s)', type: 'solid', category: 'base',
  dissolveTo: [{ id: 'Na+', n: 1 }, { id: 'OH-', n: 1 }], solubility: 109, density: 2.13, ghs: ['corrosive'], ppe: ['goggles', 'labcoat', 'gloves'],
  storage: 'base-shelf', notes: 'Dissolving pellets is strongly exothermic - add them slowly to water.', dispense: 'jar', mp: 318, bp: 1388 });
S({ id: 'na2co3_solid', name: 'Sodium carbonate, anhydrous', formula: 'Na2CO3(s)', type: 'solid', category: 'base',
  dissolveTo: [{ id: 'Na+', n: 2 }, { id: 'CO3^2-', n: 1 }], solubility: 21, ghs: ['irritant'],
  dispense: 'jar', mp: 851 });
S({ id: 'nahco3_solid', name: 'Sodium hydrogencarbonate (baking soda)', formula: 'NaHCO3(s)', type: 'solid',
  category: 'base', dissolveTo: [{ id: 'Na+', n: 1 }, { id: 'HCO3-', n: 1 }], solubility: 9.6, ghs: [],
  dispense: 'jar', notes: 'Decomposes above 50 C releasing carbon dioxide.' });
S({ id: 'calcium_oxide', name: 'Calcium oxide (quicklime)', formula: 'CaO(s)', type: 'solid', category: 'base',
  solidForm: 'CaO', dissolveTo: [{ id: 'Ca2+', n: 1 }, { id: 'OH-', n: 2 }], solubility: 0.13,
  ghs: ['corrosive'], ppe: ['goggles', 'labcoat', 'gloves'], dispense: 'jar', mp: 2613,
  notes: 'Reacts violently with water (slaking) giving off a lot of heat.' });

// ------------------------------------------------------------- INDICATORS
S({
  id: 'universal_indicator', name: 'Universal indicator solution', formula: 'indicator mixture',
  type: 'solution', category: 'indicator', colour: '#3f8f3f', density: 1.0, concentration: 0.02,
  dissolveTo: [{ id: 'dye_UI', n: 1 }],
  indicator: { kind: 'universal' }, ghs: ['flammable'], ppe: ['goggles'],
  notes: 'Gives a continuous colour scale from red (pH 1) to purple (pH 14).', dispense: 'dropper', volume: 100
});
S({
  id: 'litmus_solution', name: 'Litmus solution', formula: 'dye mixture', type: 'solution',
  category: 'indicator', colour: '#5b4b8a', concentration: 0.02, dissolveTo: [{ id: 'dye_litmus', n: 1 }],
  indicator: { kind: 'litmus', range: [4.5, 8.3], low: '#c0392b', high: '#2a52be' },
  ghs: [], ppe: ['goggles'], dispense: 'dropper', volume: 100
});
S({
  id: 'methyl_orange', name: 'Methyl orange indicator', formula: 'C14H14N3NaO3S', type: 'solution',
  category: 'indicator', colour: '#e8862a', concentration: 0.02, dissolveTo: [{ id: 'dye_MO', n: 1 }],
  indicator: { kind: 'methyl_orange', range: [3.1, 4.4], low: '#d64520', high: '#f2d024' },
  ghs: ['toxic'], ppe: ['goggles', 'gloves'], dispense: 'dropper', volume: 100
});
S({
  id: 'phenolphthalein', name: 'Phenolphthalein indicator', formula: 'C20H14O4', type: 'solution',
  category: 'indicator', colour: null, concentration: 0.02, dissolveTo: [{ id: 'dye_PP', n: 1 }],
  indicator: { kind: 'phenolphthalein', range: [8.2, 10.0], low: null, high: '#e545a0' },
  ghs: ['flammable'], ppe: ['goggles'], dispense: 'dropper', volume: 100,
  notes: 'Colourless in acid, pink in alkali - the classic titration indicator.'
});
S({
  id: 'bromothymol_blue', name: 'Bromothymol blue indicator', formula: 'C27H28Br2O5S', type: 'solution',
  category: 'indicator', colour: '#2e6fbf', concentration: 0.02, dissolveTo: [{ id: 'dye_BTB', n: 1 }],
  indicator: { kind: 'bromothymol', range: [6.0, 7.6], low: '#f2d024', high: '#2a52be' },
  ghs: [], ppe: ['goggles'], dispense: 'dropper', volume: 100
});
S({
  id: 'starch_solution', name: 'Starch solution, 1 %', formula: '(C6H10O5)n(aq)', type: 'solution',
  category: 'indicator', colour: '#f6f3e6', density: 1.0, concentration: 0.01, dissolveTo: [{ id: 'starch', n: 1 }],
  ghs: [], ppe: ['goggles'], dispense: 'dropper', volume: 100,
  notes: 'Goes blue-black in the presence of iodine. Used to time iodine/thiosulfate reactions.'
});

// ------------------------------------------------------- SALTS & SOLUTIONS
const sol = (id, name, formula, concentration, dissolveTo, opts = {}) => S({
  id, name, formula, type: 'solution', category: 'salt', concentration, dissolveTo, ...opts
});

sol('cuso4_0_5m', 'Copper(II) sulfate, 0.5 mol/dm3', 'CuSO4(aq)', 0.5,
  [{ id: 'Cu2+', n: 1 }, { id: 'SO4^2-', n: 1 }],
  { colour: '#2f6fd0', density: 1.06, ghs: ['irritant', 'harmful'], ppe: ['goggles', 'labcoat', 'gloves'],
    notes: 'Blue solution. Harmful to aquatic life - do not pour down the sink.', dispense: 'bottle', volume: 500 });
sol('cuso4_1m', 'Copper(II) sulfate, 1.0 mol/dm3', 'CuSO4(aq)', 1.0,
  [{ id: 'Cu2+', n: 1 }, { id: 'SO4^2-', n: 1 }],
  { colour: '#1f56b5', density: 1.12, ghs: ['irritant', 'harmful'], ppe: ['goggles', 'labcoat', 'gloves'],
    notes: 'Used for electrolysis and displacement reactions.', dispense: 'bottle', volume: 500 });
sol('feso4_0_5m', 'Iron(II) sulfate, 0.5 mol/dm3', 'FeSO4(aq)', 0.5,
  [{ id: 'Fe2+', n: 1 }, { id: 'SO4^2-', n: 1 }],
  { colour: '#a8d5b5', density: 1.05, ghs: ['irritant'], dispense: 'bottle', volume: 500,
    notes: 'Pale green. Oxidises in air to iron(III) - use freshly made solution.' });
sol('fecl3_0_5m', 'Iron(III) chloride, 0.5 mol/dm3', 'FeCl3(aq)', 0.5,
  [{ id: 'Fe3+', n: 1 }, { id: 'Cl-', n: 3 }],
  { colour: '#b9761f', density: 1.06, ghs: ['irritant', 'corrosive'], dispense: 'bottle', volume: 500 });
sol('agno3_0_1m', 'Silver nitrate, 0.1 mol/dm3', 'AgNO3(aq)', 0.1,
  [{ id: 'Ag+', n: 1 }, { id: 'NO3-', n: 1 }],
  { density: 1.01, ghs: ['oxidising', 'corrosive'], ppe: ['goggles', 'labcoat', 'gloves'],
    notes: 'Stains skin black. Used for halide tests and volumetric analysis.', dispense: 'dropper', volume: 250 });
sol('pb_no3_0_5m', 'Lead(II) nitrate, 0.5 mol/dm3', 'Pb(NO3)2(aq)', 0.5,
  [{ id: 'Pb2+', n: 1 }, { id: 'NO3-', n: 2 }],
  { density: 1.06, ghs: ['toxic', 'oxidising'], ppe: ['goggles', 'labcoat', 'gloves'], storage: 'poison-cabinet',
    notes: 'TOXIC. Do not ingest. Wash hands. Report all spills.', dispense: 'bottle', volume: 250 });
sol('bacl2_0_5m', 'Barium chloride, 0.5 mol/dm3', 'BaCl2(aq)', 0.5,
  [{ id: 'Ba2+', n: 1 }, { id: 'Cl-', n: 2 }],
  { density: 1.06, ghs: ['toxic', 'harmful'], ppe: ['goggles', 'labcoat', 'gloves'],
    notes: 'Used to test for sulfate ions. Toxic - handle with care.', dispense: 'dropper', volume: 250 });
sol('kcl_1m', 'Potassium chloride, 1.0 mol/dm3', 'KCl(aq)', 1.0,
  [{ id: 'K+', n: 1 }, { id: 'Cl-', n: 1 }], { density: 1.04, ghs: [], dispense: 'bottle', volume: 500 });
sol('nacl_1m', 'Sodium chloride, 1.0 mol/dm3', 'NaCl(aq)', 1.0,
  [{ id: 'Na+', n: 1 }, { id: 'Cl-', n: 1 }], { density: 1.04, ghs: [], dispense: 'bottle', volume: 500 });
sol('ki_1m', 'Potassium iodide, 1.0 mol/dm3', 'KI(aq)', 1.0,
  [{ id: 'K+', n: 1 }, { id: 'I-', n: 1 }], { density: 1.09, ghs: ['irritant'], dispense: 'dropper', volume: 250 });
sol('kmno4_0_02m', 'Potassium manganate(VII), 0.02 mol/dm3', 'KMnO4(aq)', 0.02,
  [{ id: 'K+', n: 1 }, { id: 'MnO4-', n: 1 }],
  { colour: '#6a1bab', density: 1.0, ghs: ['oxidising', 'harmful'], ppe: ['goggles', 'labcoat', 'gloves'],
    storage: 'dark-cupboard', notes: 'Deep purple. Strong oxidising agent. Standard permanganate titrant.',
    dispense: 'bottle', volume: 500 });
sol('na2s2o3_0_1m', 'Sodium thiosulfate, 0.1 mol/dm3', 'Na2S2O3(aq)', 0.1,
  [{ id: 'Na+', n: 2 }, { id: 'S2O3^2-', n: 1 }], { density: 1.02, ghs: [], dispense: 'bottle', volume: 500,
    notes: 'Used with acid for the classic rate-of-reaction experiment.' });
sol('sodium_sulfate_0_5m', 'Sodium sulfate, 0.5 mol/dm3', 'Na2SO4(aq)', 0.5,
  [{ id: 'Na+', n: 2 }, { id: 'SO4^2-', n: 1 }], { density: 1.05, ghs: [], dispense: 'bottle', volume: 500 });
sol('k2cro4_0_1m', 'Potassium chromate(VI), 0.1 mol/dm3', 'K2CrO4(aq)', 0.1,
  [{ id: 'K+', n: 2 }, { id: 'CrO4^2-', n: 1 }],
  { colour: '#f2c200', ghs: ['carcinogen', 'toxic'], ppe: ['goggles', 'labcoat', 'gloves'],
    storage: 'dark-cupboard', notes: 'Yellow. Chromium(VI) compounds are carcinogenic.', dispense: 'dropper', volume: 250 });
sol('k2cr2o7_0_1m', 'Potassium dichromate(VI), 0.1 mol/dm3 (acidified on use)', 'K2Cr2O7(aq)', 0.1,
  [{ id: 'K+', n: 2 }, { id: 'Cr2O7^2-', n: 1 }],
  { colour: '#e8620d', ghs: ['carcinogen', 'toxic', 'oxidising'], ppe: ['goggles', 'labcoat', 'gloves'],
    storage: 'dark-cupboard', notes: 'Orange oxidising agent.', dispense: 'dropper', volume: 250 });
sol('bromine_water', 'Bromine water', 'Br2(aq)', 0.02,
  [{ id: 'Br2', n: 1 }], { colour: '#e88a3a', ghs: ['toxic', 'corrosive'], ppe: ['goggles', 'labcoat', 'gloves'],
    notes: 'Tests for alkenes: orange bromine water is decolourised.', dispense: 'dropper', volume: 100 });
sol('iodine_solution', 'Iodine solution (I2/KI)', 'I2(aq)', 0.05,
  [{ id: 'I2', n: 1 }], { colour: '#6b3a12', ghs: ['harmful', 'irritant'], dispense: 'dropper', volume: 250,
    notes: 'Food test reagent: gives a blue-black colour with starch.' });
sol('iron_thiocyanate', 'Potassium thiocyanate, 0.1 mol/dm3', 'KSCN(aq)', 0.1,
  [{ id: 'K+', n: 1 }, { id: 'SCN-', n: 1 }], { ghs: ['irritant'], dispense: 'dropper', volume: 250,
    notes: 'Turns blood-red with iron(III) ions - the classic equilibrium demo.' });

// ------------------------------------------------------------ SOLID SALTS
const solidSalt = (id, name, formula, solidForm, opts = {}) => S({
  id, name, formula, type: 'solid', category: 'salt', solidForm, ...opts
});
solidSalt('copper_sulfate_solid', 'Copper(II) sulfate crystals', 'CuSO4.5H2O(s)', 'CuSO4.5H2O',
  { dissolveTo: [{ id: 'Cu2+', n: 1 }, { id: 'SO4^2-', n: 1 }], solubility: 32, colour: '#1f7fbf',
    ghs: ['irritant', 'harmful'], dispense: 'jar', mp: 110,
    notes: 'Blue hydrated crystals; turn white when heated (water of crystallisation driven off).' });
solidSalt('copper_carbonate', 'Copper(II) carbonate (basic)', 'CuCO3.Cu(OH)2(s)', 'CuCO3',
  { dissolveTo: [], solubility: 0.0001, colour: '#2f7f5f', ghs: ['irritant', 'harmful'], dispense: 'jar', particle: 'powder', specificSurface: 3,
    notes: 'Green solid; reacts with acid releasing carbon dioxide.' });
solidSalt('copper_oxide', 'Copper(II) oxide', 'CuO(s)', 'CuO',
  { dissolveTo: [], solubility: 0.0001, colour: '#1b1b1b', ghs: ['harmful'], dispense: 'jar', particle: 'powder', specificSurface: 3,
    notes: 'Black solid; acid + CuO gives a blue solution.' });
solidSalt('manganese_dioxide', 'Manganese(IV) oxide', 'MnO2(s)', 'MnO2',
  { dissolveTo: [], solubility: 0.0001, colour: '#1f1f22', ghs: ['harmful'], dispense: 'jar', particle: 'powder', specificSurface: 4,
    notes: 'Black powder. Catalyst for hydrogen peroxide decomposition.' });
solidSalt('marble_chips', 'Marble chips (calcium carbonate)', 'CaCO3(s)', 'CaCO3',
  { dissolveTo: [], solubility: 0.0013, colour: '#f2f2ee', ghs: [], dispense: 'jar', particle: 'chips', specificSurface: 0.7,
    notes: 'Large chips give a slow, controllable reaction with acid.' });
solidSalt('calcium_carbonate_powder', 'Calcium carbonate powder', 'CaCO3(s)', 'CaCO3',
  { dissolveTo: [], solubility: 0.0013, colour: '#fbfbf8', ghs: [], dispense: 'jar', particle: 'powder', specificSurface: 4,
    notes: 'Fine powder - much faster reaction than chips (bigger surface area).' });
solidSalt('potassium_nitrate_solid', 'Potassium nitrate', 'KNO3(s)', 'KNO3',
  { dissolveTo: [{ id: 'K+', n: 1 }, { id: 'NO3-', n: 1 }], solubility: 31, ghs: ['oxidising'],
    dispense: 'jar', mp: 334, notes: 'Used for recrystallisation and solubility curves.' });
solidSalt('potassium_iodide_solid', 'Potassium iodide', 'KI(s)', null,
  { dissolveTo: [{ id: 'K+', n: 1 }, { id: 'I-', n: 1 }], solubility: 148, ghs: ['irritant'], dispense: 'jar', mp: 681 });
solidSalt('sodium_chloride_solid', 'Sodium chloride', 'NaCl(s)', 'NaCl',
  { dissolveTo: [{ id: 'Na+', n: 1 }, { id: 'Cl-', n: 1 }], solubility: 36, ghs: [], dispense: 'jar', mp: 801 });
solidSalt('iron_filings', 'Iron filings', 'Fe(s)', 'Fe',
  { dissolveTo: [], solubility: 0, colour: '#6d7178', ghs: ['flammable'], dispense: 'jar', metal: true, particle: 'filings', specificSurface: 3 });
solidSalt('zinc_granules', 'Zinc granules', 'Zn(s)', 'Zn',
  { dissolveTo: [], solubility: 0, colour: '#a9b0b7', ghs: ['flammable', 'harmful'], dispense: 'jar', metal: true, particle: 'granules', specificSurface: 2,
    notes: 'Sits at the bottom of the flask; react by mixing with dilute acid.' });
solidSalt('magnesium_ribbon', 'Magnesium ribbon', 'Mg(s)', 'Mg',
  { dissolveTo: [], solubility: 0, colour: '#c8ccd2', ghs: ['flammable', 'irritant'], dispense: 'jar', metal: true, particle: 'ribbon', specificSurface: 0.6,
    notes: 'Clean the oxide layer with emery paper before reacting.' });
solidSalt('copper_turnings', 'Copper turnings', 'Cu(s)', 'Cu',
  { dissolveTo: [], solubility: 0, colour: '#b87333', ghs: ['harmful'], dispense: 'jar', metal: true });
solidSalt('aluminium_foil', 'Aluminium foil', 'Al(s)', 'Al',
  { dissolveTo: [], solubility: 0, colour: '#cfd3d8', ghs: ['flammable'], dispense: 'jar', metal: true,
    notes: 'Protected by an oxide layer - reacts slowly unless the layer is removed.' });
solidSalt('lead_granules', 'Lead granules', 'Pb(s)', 'Pb',
  { dissolveTo: [], solubility: 0, colour: '#7a7d85', ghs: ['toxic', 'harmful'], ppe: ['goggles', 'labcoat', 'gloves'],
    dispense: 'jar', metal: true, storage: 'poison-cabinet' });
solidSalt('sulfur_powder', 'Sulfur powder', 'S8(s)', 'S8',
  { dissolveTo: [], solubility: 0.0002, colour: '#f2e04a', ghs: ['irritant'], dispense: 'jar', mp: 115,
    notes: 'Burns with a blue flame; iron + sulfur makes iron sulfide.' });
solidSalt('iodine_solid', 'Iodine crystals', 'I2(s)', 'I2',
  { dissolveTo: [{ id: 'I2', n: 1 }], solubility: 0.03, colour: '#4a2f1c', ghs: ['harmful', 'irritant'],
    dispense: 'jar', mp: 114, notes: 'Sublimes on warming - use the fume hood.' });
solidSalt('charcoal', 'Charcoal powder', 'C(s)', 'C',
  { dissolveTo: [], solubility: 0, colour: '#1c1c1c', ghs: ['flammable'], dispense: 'jar' });
solidSalt('sand', 'Sand', 'SiO2(s)', 'SiO2',
  { dissolveTo: [], solubility: 0, colour: '#e6d9b8', ghs: [], dispense: 'jar',
    notes: 'Inert - used for filter/decant demonstrations and chromatography bearings.' });

// --------------------------------------------------------------- ORGANICS
const organic = (id, name, formula, speciesId, opts = {}) => S({
  id, name, formula, type: 'liquid', category: 'organic', molarMass: SPECIES[speciesId]?.molarMass,
  dissolveTo: [{ id: speciesId, n: 1 }], density: SPECIES[speciesId]?.density,
  ghs: ['flammable', 'irritant'], ppe: ['goggles', 'labcoat'],
  storage: 'solvent-cupboard', conductivity: 'none', dispense: 'bottle', volume: 500,
  bp: SPECIES[speciesId]?.bp, ...opts
});
organic('ethanol', 'Ethanol (absolute)', 'C2H5OH(l)', 'C2H5OH', { density: 0.789, bp: 78.4,
  notes: 'Highly flammable - no naked flames. The fuel for spirit burners.' });
organic('methanol', 'Methanol', 'CH3OH(l)', 'CH3OH', { ghs: ['flammable', 'toxic'],
  notes: 'Toxic if swallowed; causes blindness.' });
organic('propan_1_ol', 'Propan-1-ol', 'C3H7OH(l)', 'C3H8O', { bp: 97.2 });
organic('butan_1_ol', 'Butan-1-ol', 'C4H9OH(l)', 'C4H10O', { bp: 117.7 });
organic('hexane', 'Hexane', 'C6H14(l)', 'C6H14',
  { ghs: ['flammable', 'irritant', 'aspiration'], notes: 'Non-polar solvent; immiscible with water.' });
organic('cyclohexane', 'Cyclohexane', 'C6H12(l)', 'C6H12',
  { ghs: ['flammable', 'aspiration'], notes: 'Used for distribution / solvent extraction work.' });
organic('benzene', 'Benzene', 'C6H6(l)', 'C6H6',
  { ghs: ['flammable', 'carcinogen', 'toxic'], ppe: ['goggles', 'labcoat', 'gloves'],
    notes: 'CARCINOGEN. Use only in the fume hood with the smallest possible quantity.' });
organic('propanone', 'Propanone (acetone)', 'CH3COCH3(l)', 'C3H6O',
  { ghs: ['flammable', 'irritant'], notes: 'Volatile, flammable solvent; cleans glassware well.' });
organic('ethyl_ethanoate', 'Ethyl ethanoate', 'CH3COOC2H5(l)', 'C4H8O2',
  { ghs: ['flammable', 'irritant'], notes: 'Sweet-smelling ester made from ethanol + ethanoic acid.', bp: 77.1 });
organic('ethanal_solution', 'Ethanal solution (40 %)', 'CH3CHO(aq)', 'CH3CHO',
  { ghs: ['flammable', 'harmful', 'carcinogen'], type: 'solution', concentration: 7,
    notes: 'Tollens\' reagent test: silver mirror with aldehydes.' });
organic('methanal_solution', 'Methanal solution (formalin, 37 %)', 'HCHO(aq)', 'HCHO',
  { ghs: ['toxic', 'carcinogen'], type: 'solution', concentration: 12, ppe: ['goggles', 'labcoat', 'gloves'] });
organic('glycerol', 'Glycerol (propane-1,2,3-triol)', 'C3H8O3(l)', 'C3H8O3',
  { ghs: [], notes: 'Viscous triol; used for making soap and for slide mounting.' });
organic('vegetable_oil', 'Vegetable oil', 'triglyceride(l)', 'lipid',
  { ghs: [], notes: 'Tested with Sudan III; can be emulsified with detergents.' });
organic('hex_1_ene', 'Hex-1-ene', 'C6H12(l)', 'C6H12',
  { ghs: ['flammable', 'irritant'], notes: 'Alkene: decolourises bromine water instantly.' });
organic('cyclohexene', 'Cyclohexene', 'C6H10(l)', 'C6H12',
  { ghs: ['flammable', 'irritant'], notes: 'Typical alkene for bromine-water tests.' });
organic('ethanoic_acid_glacial_bottle', 'Ethanoic acid, glacial', 'CH3COOH(l)', 'CH3COOH',
  { type: 'liquid', category: 'acid', weakAcid: true, pKa: 4.76, concentration: 17.4, density: 1.049,
    ghs: ['corrosive', 'flammable'], ppe: ['goggles', 'labcoat', 'gloves'], conductivity: 'weak',
    mp: 16.6, bp: 118.1, notes: 'Reacted with an alcohol to make an ester.' });
organic('distilled_water', 'Distilled water', 'H2O(l)', 'H2O',
  { category: 'water', ghs: [], molarMass: 18.015, density: 0.998, conductivity: 'none',
    dispense: 'bottle', volume: 1000, notes: 'Use distilled water for accurate volumetric work.' });
organic('deionised_water', 'Deionised water', 'H2O(l)', 'H2O',
  { category: 'water', ghs: [], molarMass: 18.015, density: 0.998, dispense: 'bottle', volume: 1000 });
organic('tap_water', 'Tap water', 'H2O(l)', 'H2O',
  { category: 'water', ghs: [], molarMass: 18.015, density: 0.998, dispense: 'bottle', volume: 1000,
    notes: 'Contains dissolved ions - not suitable for quantitative work.' });

// ------------------------------------------------------ BIOLOGY REAGENTS
const bio = (id, name, formula, opts) => S({
  id, name, formula, type: 'solution', category: 'biochem', subjects: ['biology'],
  ppe: ['goggles', 'labcoat'], ghs: [], dispense: 'dropper', volume: 250, storage: 'bio-bench', ...opts
});
bio('benedicts_reagent', "Benedict's solution", 'Cu(II) citrate complex',
  { colour: '#2f6fd0', dissolveTo: [{ id: 'CuCitrate', n: 1 }, { id: 'OH-', n: 3 }],
    concentration: 0.05, ghs: ['irritant'],
    notes: 'Alkaline copper(II) citrate. Turns from blue to green -> yellow -> brick-red with reducing sugars on heating.' });
bio('biuret_reagent', 'Biuret reagent (NaOH + dilute CuSO4)', 'Cu2+ in alkaline solution',
  { colour: '#2f6fd0', concentration: 0.05, dissolveTo: [{ id: 'Cu2+', n: 1 }, { id: 'OH-', n: 4 }],
    ghs: ['corrosive'], ppe: ['goggles', 'labcoat', 'gloves'], notes: 'Turns purple with protein.' });
bio('sudan_iii', 'Sudan III stain', 'C22H16N4O', { colour: '#d63b1f', concentration: 0.01,
  dissolveTo: [{ id: 'I2', n: 0 }], ghs: ['irritant'], notes: 'Stains lipids red/orange.' });
bio('dcpip', 'DCPIP solution (2,6-dichlorophenolindophenol)', 'C12H7Cl2NO2',
  { colour: '#2a52be', concentration: 0.001, dissolveTo: [{ id: 'dcpip_ox', n: 1 }], ghs: ['irritant'],
    notes: 'Blue dye decolourised by reducing agents such as vitamin C.' });
bio('methylene_blue_stain', 'Methylene blue stain, 1 %', 'C16H18ClN3S', { colour: '#2a52be', concentration: 0.03,
  ghs: ['irritant'], notes: 'Stains nuclei and DNA blue for microscopy.' });
bio('iodine_stain', 'Iodine in potassium iodide (microscopy stain)', 'I2/KI(aq)',
  { colour: '#6b3a12', concentration: 0.05, dissolveTo: [{ id: 'I2', n: 1 }],
    notes: 'Stains starch granules blue-black.' });
bio('sodium_hydroxide_0_1m_bio', 'Sodium hydroxide, 0.1 mol/dm3 (biology)', 'NaOH(aq)',
  { concentration: 0.1, dissolveTo: [{ id: 'Na+', n: 1 }, { id: 'OH-', n: 1 }], ghs: ['irritant'], dispense: 'bottle' });
bio('nitric_acid_0_1m_bio', 'Nitric acid, 0.1 mol/dm3 (for DNA extraction)', 'HNO3(aq)',
  { concentration: 0.1, dissolveTo: [{ id: 'H+', n: 1 }, { id: 'NO3-', n: 1 }], ghs: ['corrosive'], dispense: 'bottle' });
bio('yeast_suspension', 'Yeast suspension (Saccharomyces)', 'living cells',
  { type: 'suspension', colour: '#d8c9a3', concentration: 0.1, dissolveTo: [{ id: 'yeast', n: 0.05 }],
    notes: 'Respirometers and fermentation work. Keep at 30-40 C, not hotter.' });
bio('hydrogen_peroxide_20vol', 'Hydrogen peroxide, 20 volume (1.7 mol/dm3)', 'H2O2(aq)',
  { concentration: 1.7, colour: null, dissolveTo: [{ id: 'H2O2', n: 1 }], ghs: ['oxidising', 'irritant'],
    ppe: ['goggles', 'labcoat', 'gloves'], dispense: 'bottle', notes: 'Decomposes rapidly with catalase or MnO2.' });
bio('glucose_solution_1pct', 'Glucose solution, 1 % (0.056 mol/dm3)', 'C6H12O6(aq)',
  { concentration: 0.056, dissolveTo: [{ id: 'C6H12O6', n: 1 }], notes: 'A reducing sugar for food tests.' });
bio('sucrose_solution_1pct', 'Sucrose solution, 1 %', 'C12H22O11(aq)',
  { concentration: 0.029, dissolveTo: [{ id: 'C12H22O11', n: 1 }], notes: 'Non-reducing unless first hydrolysed.' });
bio('starch_suspension_1pct', 'Starch suspension, 1 %', '(C6H10O5)n(aq)',
  { colour: '#f4f0dc', concentration: 0.01, dissolveTo: [{ id: 'starch', n: 1 }] });
bio('milk_sample', 'Milk', 'emulsion', { type: 'suspension', colour: '#f7f4ec',
  dissolveTo: [{ id: 'protein', n: 0.00005 }, { id: 'lipid', n: 0.0001 }, { id: 'C12H22O11m', n: 0.0001 }],
  notes: 'Contains protein, lipid and the reducing sugar lactose.' });
bio('egg_albumen', 'Egg albumen (protein solution)', 'protein(aq)', { type: 'suspension', colour: '#f4f0dd',
  dissolveTo: [{ id: 'protein', n: 0.00005 }] });
bio('pond_water', 'Pond water sample', 'natural sample', { type: 'suspension', colour: '#7f9a6a',
  dissolveTo: [{ id: 'protein', n: 0.00001 }], notes: 'Contains micro-organisms; wash hands after handling.' });
bio('amylase_solution', 'Amylase solution, 1 %', 'enzyme(aq)', { colour: '#f6f2e0', concentration: 0.001,
  dissolveTo: [{ id: 'amylase', n: 1 }], storage: 'fridge', notes: 'Starch-digesting enzyme. Denatured above ~60 C.' });
bio('catalase_solution', 'Catalase solution (from liver/potato)', 'enzyme(aq)', { colour: '#f2ebd6', concentration: 0.001,
  dissolveTo: [{ id: 'catalase', n: 1 }], notes: 'Splits hydrogen peroxide into water and oxygen.' });
bio('potato_tissue', 'Potato tissue (discs)', 'plant tissue', { type: 'solid', colour: '#e8dcae',
  solidForm: 'starch', notes: 'Contains catalase and starch; used for osmosis and enzyme work.' });
bio('onion_tissue', 'Onion epidermis (red onion)', 'plant tissue', { type: 'solid', colour: '#d98cb8',
  solidForm: 'protein', notes: 'Ideal specimen for viewing plant cells and plasmolysis.' });

// ------------------------------------------------------------------- GASES
const gas = (id, name, formula, speciesId, opts = {}) => S({
  id, name, formula, type: 'gas', category: 'gas', molarMass: SPECIES[speciesId]?.molarMass,
  dissolveTo: [{ id: speciesId, n: 1 }], ghs: [], ppe: ['goggles', 'labcoat'], dispense: 'cylinder',
  storage: 'gas-store', ...opts
});
gas('oxygen_gas', 'Oxygen', 'O2(g)', 'O2', { notes: 'Relights a glowing splint. Supports combustion.' });
gas('hydrogen_gas', 'Hydrogen', 'H2(g)', 'H2', { ghs: ['flammable'], notes: 'Burns with a squeaky pop with a lit splint.' });
gas('carbon_dioxide_gas', 'Carbon dioxide', 'CO2(g)', 'CO2', { notes: 'Turns limewater milky; puts out a lit splint.' });
gas('nitrogen_gas', 'Nitrogen', 'N2(g)', 'N2', { notes: 'Inert atmosphere for air-sensitive work.' });
gas('air_gas', 'Compressed air', 'N2/O2', 'air', { notes: 'General purpose air supply.' });
gas('chlorine_gas', 'Chlorine', 'Cl2(g)', 'Cl2',
  { ghs: ['toxic', 'oxidising'], ppe: ['goggles', 'labcoat', 'gloves'], notes: 'TOXIC. Fume hood only. Bleaches damp litmus.' });
gas('ammonia_gas', 'Ammonia', 'NH3(g)', 'NH3',
  { ghs: ['toxic', 'corrosive'], ppe: ['goggles', 'labcoat'], notes: 'Fume hood only. Turns damp red litmus blue.' });
gas('sulfur_dioxide_gas', 'Sulfur dioxide', 'SO2(g)', 'SO2',
  { ghs: ['toxic'], notes: 'Fume hood only. Turns acidified dichromate green.' });
gas('hydrogen_sulfide_gas', 'Hydrogen sulfide', 'H2S(g)', 'H2S',
  { ghs: ['toxic', 'flammable'], notes: 'TOXIC. Fume hood only. Smells of rotten eggs.' });
gas('methane_gas', 'Methane (natural gas)', 'CH4(g)', 'CH4', { ghs: ['flammable'], notes: 'Laboratory gas supply.' });
gas('nitrogen_dioxide_gas', 'Nitrogen dioxide', 'NO2(g)', 'NO2',
  { ghs: ['toxic', 'corrosive'], notes: 'Brown toxic gas; fume hood only.' });

// --------------------------------------------------------------- MISC LAB
S({ id: 'universal_indicator_paper', name: 'Universal indicator paper', formula: 'paper strips',
  type: 'solid', category: 'indicator', colour: '#e8d98a', indicator: { kind: 'universal' },
  dispense: 'pack', notes: 'Dip and compare with the colour chart.' });
S({ id: 'ph_buffer_4', name: 'Buffer solution pH 4.00', formula: 'phthalate buffer', type: 'solution',
  category: 'reagent', ph: 4.0, dissolveTo: [], dispense: 'bottle', volume: 500, ghs: [], ppe: ['goggles'],
  notes: 'Calibration standard for a pH meter.' });
S({ id: 'ph_buffer_7', name: 'Buffer solution pH 7.00', formula: 'phosphate buffer', type: 'solution',
  category: 'reagent', ph: 7.0, dissolveTo: [], dispense: 'bottle', volume: 500, ghs: [], ppe: ['goggles'] });
S({ id: 'ph_buffer_10', name: 'Buffer solution pH 10.00', formula: 'borate buffer', type: 'solution',
  category: 'reagent', ph: 10.0, dissolveTo: [], dispense: 'bottle', volume: 500, ghs: [], ppe: ['goggles'] });
S({ id: 'anhydrous_copper_sulfate', name: 'Anhydrous copper(II) sulfate (water test)', formula: 'CuSO4(s)',
  type: 'solid', category: 'reagent', solidForm: 'CuSO4', dissolveTo: [{ id: 'Cu2+', n: 1 }, { id: 'SO4^2-', n: 1 }],
  colour: '#f6f6f6', ghs: ['irritant'], dispense: 'jar', notes: 'White -> blue in the presence of water.' });
S({ id: 'cobalt_chloride_paper', name: 'Cobalt chloride paper', formula: 'CoCl2 paper', type: 'solid',
  category: 'reagent', colour: '#3a6fd0', ghs: ['toxic'], dispense: 'pack', notes: 'Blue -> pink in the presence of water.' });
S({ id: 'sodium_metal_oil', name: 'Sodium metal (in oil)', formula: 'Na(s)', type: 'solid', category: 'reagent',
  solidForm: 'Na', dissolveTo: [], ghs: ['flammable', 'corrosive', 'water-reactive'],
  ppe: ['goggles', 'labcoat', 'gloves'], storage: 'flammable-cabinet', dispense: 'jar',
  notes: 'NEVER add water directly. Reacts violently, fizzes and may ignite.' });

// ------------------------------------------------------------------ QUERIES
export function getSubstance(id) {
  return SUBSTANCES[id] || null;
}
export function allSubstances() {
  return Object.values(SUBSTANCES);
}
export function substancesByCategory(cat) {
  return allSubstances().filter((s) => s.category === cat);
}
export function substancesFor(subject) {
  return allSubstances().filter((s) => s.subjects.includes(subject) || s.subjects.includes('chemistry') || s.subjects.includes('all'));
}
export function searchSubstances(q) {
  const t = q.trim().toLowerCase();
  if (!t) return allSubstances();
  return allSubstances().filter((s) =>
    s.name.toLowerCase().includes(t) || s.formula.toLowerCase().includes(t) || s.id.includes(t));
}
/** Categories used by the inventory tree, in display order. */
export const SUBSTANCE_CATEGORIES = [
  { id: 'acid', label: 'Acids' },
  { id: 'base', label: 'Bases & alkalis' },
  { id: 'salt', label: 'Salts & solutions' },
  { id: 'indicator', label: 'Indicators' },
  { id: 'organic', label: 'Organic compounds & solvents' },
  { id: 'biochem', label: 'Biology reagents' },
  { id: 'gas', label: 'Gases' },
  { id: 'reagent', label: 'Other reagents' },
  { id: 'water', label: 'Water' }
];

// --------------------------------------- extra reagents used by experiment data
S({ id: 'beetroot_tissue', name: 'Beetroot tissue (cylinders)', formula: 'plant tissue', type: 'solid',
  category: 'biochem', subjects: ['biology'], solidForm: 'protein', colour: '#8e1b3a', dispense: 'jar',
  notes: 'Betalain pigment leaks out when the cell membranes are damaged by heat or alcohol.' });
S({ id: 'germinating_peas', name: 'Germinating peas', formula: 'living tissue', type: 'solid',
  category: 'biochem', subjects: ['biology'], solidForm: 'respiring_tissue', colour: '#9fbf6a',
  dispense: 'jar', notes: 'Respiring tissue for respirometer work; kill them by boiling for a control.' });
S({ id: 'nutrient_agar', name: 'Nutrient agar (sterile, in a bottle)', formula: 'agar + nutrients',
  type: 'liquid', category: 'biochem', subjects: ['biology'], colour: '#e8d9a8', density: 1.02,
  molarMass: 100, dissolveTo: [{ id: 'protein', n: 0.00001 }], dispense: 'bottle',
  notes: 'Melt and pour into a Petri dish. Keep the lid on and do not open a cultured dish.' });
S({ id: 'agar_blocks', name: 'Agar blocks (with indicator)', formula: 'agar gel', type: 'solid',
  category: 'biochem', subjects: ['biology'], solidForm: 'protein', colour: '#f2e6c8',
  dispense: 'jar', notes: 'For diffusion experiments: cut blocks of different size and time the colour change.' });
S({ id: 'garlic_root_tip', name: 'Garlic root tips (growing)', formula: 'plant tissue', type: 'solid',
  category: 'biochem', subjects: ['biology'], solidForm: 'protein', colour: '#f0ead0',
  dispense: 'jar', notes: 'Growing root tips contain cells actively dividing - root tip squash for mitosis.' });
S({ id: 'orcein_stain', name: 'Acetic orcein stain', formula: 'orcein in ethanoic acid', type: 'solution',
  category: 'biochem', subjects: ['biology'], colour: '#8e2f6f', concentration: 0.02,
  dissolveTo: [{ id: 'protein', n: 0.0001 }], dispense: 'dropper',
  notes: 'Stains chromosomes dark purple-red in a root tip squash.' });
S({ id: 'antibiotic_discs', name: 'Antibiotic discs', formula: 'impregnated paper', type: 'solid',
  category: 'biochem', subjects: ['biology'], solidForm: 'protein', colour: '#f4f4f4', dispense: 'pack',
  notes: 'Placed on a lawn of micro-organisms to show the effect of antibiotics.' });
S({ id: 'detergent', name: 'Washing-up liquid (detergent)', formula: 'surfactant solution', type: 'liquid',
  category: 'reagent', colour: '#c8e6d0', density: 1.0, molarMass: 300,
  dissolveTo: [{ id: 'soap', n: 0.001 }], dispense: 'bottle',
  notes: 'Breaks down lipid membranes - used in DNA extraction and in emulsification tests.' });
S({ id: 'cobalt_chloride_solution', name: 'Cobalt chloride solution', formula: 'CoCl2(aq)', type: 'solution',
  category: 'reagent', concentration: 0.1, colour: '#e07a9a', dissolveTo: [{ id: 'Co2+', n: 1 }, { id: 'Cl-', n: 2 }],
  ghs: ['toxic'], ppe: ['goggles', 'labcoat', 'gloves'], dispense: 'dropper',
  notes: 'Dries from pink (hydrated) to blue (anhydrous) - the cobalt chloride paper test for water.' });

// --------------------------- additional library reagents ---------------------
S({ id: 'ammonium_persulfate_1m', name: 'Ammonium peroxodisulfate, 1.0 mol/dm3', formula: '(NH4)2S2O8(aq)',
  type: 'solution', category: 'reagent', concentration: 1.0, density: 1.12,
  dissolveTo: [{ id: 'NH4+', n: 2 }, { id: 'S2O8^2-', n: 1 }], ghs: ['oxidising', 'irritant'],
  ppe: ['goggles', 'labcoat', 'gloves'], dispense: 'bottle', volume: 250,
  notes: 'Strong oxidiser used in the iodine clock. Make it fresh each time.' });
S({ id: 'sodium_ethanedioate_0_5m', name: 'Sodium ethanedioate, 0.5 mol/dm3', formula: 'Na2C2O4(aq)',
  type: 'solution', category: 'reagent', concentration: 0.5, density: 1.05,
  dissolveTo: [{ id: 'Na+', n: 2 }, { id: 'C2O4^2-', n: 1 }], ghs: ['harmful'], dispense: 'bottle', volume: 250,
  notes: 'Toxic if swallowed - handle with care and wash hands.' });
S({ id: 'iron_solution_unknown', name: 'Iron(II) solution, unknown concentration', formula: 'FeSO4(aq)',
  type: 'solution', category: 'salt', concentration: 0.05, density: 1.02, colour: '#a8d5b5',
  dissolveTo: [{ id: 'Fe2+', n: 1 }, { id: 'SO4^2-', n: 1 }], ghs: ['irritant'], dispense: 'bottle', volume: 500,
  notes: 'Your unknown sample - determine its concentration by titration.' });
S({ id: 'unknown_weak_acid', name: 'Unknown weak monoprotic acid', formula: 'HA(aq)', type: 'solution',
  category: 'reagent', concentration: 0.1, density: 1.0, weakAcid: true, pKa: 4.5,
  dissolveTo: [{ id: 'C6H8O7', n: 1 }], ghs: ['irritant'], dispense: 'bottle', volume: 500,
  notes: 'Determine its pKa from a pH titration curve.' });
S({ id: 'casein_solution', name: 'Casein suspension, 2 %', formula: 'protein(aq)', type: 'suspension',
  category: 'biochem', subjects: ['biology'], colour: '#f7f5ec', density: 1.0,
  dissolveTo: [{ id: 'protein', n: 0.00005 }], dispense: 'bottle', volume: 500,
  notes: 'Milk protein used as the substrate for protease and for the biuret assay.' });
S({ id: 'protease_solution', name: 'Protease (trypsin) solution', formula: 'enzyme(aq)', type: 'solution',
  category: 'biochem', subjects: ['biology'], colour: '#f6f3e2', concentration: 0.001,
  dissolveTo: [{ id: 'protein', n: 1e-6 }], dispense: 'dropper', volume: 100, storage: 'fridge',
  notes: 'Digests casein; denatured above about 60 °C. Keep cold until use.' });
S({ id: 'protein_standard', name: 'Protein standard (bovine serum albumin)', formula: 'protein(s)', type: 'solid',
  category: 'biochem', subjects: ['biology'], solidForm: 'protein', colour: '#fdfdf8', dispense: 'jar',
  notes: 'Weigh out accurately and dissolve to make the calibration standards.' });
S({ id: 'soda_lime', name: 'Soda lime (self-indicating)', formula: 'NaOH/CaO', type: 'solid',
  category: 'reagent', solidForm: 'NaOH', colour: '#f4f4f0', ghs: ['corrosive'],
  ppe: ['goggles', 'labcoat', 'gloves'], dispense: 'jar', storage: 'base-shelf',
  notes: 'Absorbs carbon dioxide. Corrosive - use a spatula, never your fingers.' });
S({ id: 'ice', name: 'Crushed ice', formula: 'H2O(s)', type: 'solid', category: 'water', solidForm: 'H2O',
  colour: '#eaf6ff', ghs: [], dispense: 'jar', notes: 'For ice baths, latent heat work and controlling temperature.' });
S({ id: 'distilled_water_apparatus', name: 'Distilled water (wash bottle)', formula: 'H2O(l)', type: 'liquid',
  category: 'water', molarMass: 18.015, density: 0.998, dissolveTo: [{ id: 'H2O', n: 1 }],
  dispense: 'bottle', volume: 1000, notes: 'Use for rinsing and for making up solutions.' });
S({ id: 'buffer_solution_ph4', name: 'Buffer solution pH 4.0 (for enzyme work)', formula: 'phthalate buffer',
  type: 'solution', category: 'reagent', ph: 4.0, dissolveTo: [{ id: 'H+', n: 0.0001 }], dispense: 'bottle', volume: 250 });
S({ id: 'buffer_solution_ph10', name: 'Buffer solution pH 10.0 (for enzyme work)', formula: 'borate buffer',
  type: 'solution', category: 'reagent', ph: 10.0, dissolveTo: [{ id: 'OH-', n: 0.0001 }], dispense: 'bottle', volume: 250 });
S({ id: 'ink_black', name: 'Black ink (mixture of dyes)', formula: 'dye mixture', type: 'solution',
  category: 'reagent', colour: '#22202b', dissolveTo: [{ id: 'C6H6', n: 0.001 }], dispense: 'dropper', volume: 50,
  notes: 'A mixture of dyes for chromatography.' });
S({ id: 'ink_red', name: 'Red food colouring', formula: 'dye mixture', type: 'solution', category: 'reagent',
  colour: '#c0392b', dissolveTo: [{ id: 'C6H6', n: 0.001 }], dispense: 'dropper', volume: 50 });
S({ id: 'disinfectant_solution', name: 'Disinfectant (clear phenolic)', formula: 'disinfectant', type: 'solution',
  category: 'reagent', concentration: 0.01, colour: '#f2e8d0', ghs: ['irritant', 'harmful'],
  ppe: ['goggles', 'labcoat', 'gloves'], dispense: 'bottle', volume: 500,
  notes: 'Used to clean the bench in microbiology work; do not mix with other cleaners.' });
S({ id: 'spinach_leaves', name: 'Spinach leaves (fresh)', formula: 'leaf tissue', type: 'solid',
  category: 'biochem', subjects: ['biology'], solidForm: 'chlorophyll', colour: '#1f6f2f', dispense: 'pack',
  notes: 'Source of chloroplasts and of the photosynthetic pigments.' });
S({ id: 'leafy_shoot', name: 'Leafy shoot (Pellia/Holly)', formula: 'plant shoot', type: 'solid',
  category: 'biochem', subjects: ['biology'], solidForm: 'protein', colour: '#2f7f4f', dispense: 'jar',
  notes: 'Cut under water immediately before fitting to the potometer.' });
S({ id: 'pondweed', name: 'Pondweed (Elodea) sprig', formula: 'aquatic plant', type: 'solid',
  category: 'biochem', subjects: ['biology'], solidForm: 'chlorophyll', colour: '#2f6f3f', dispense: 'jar',
  notes: 'Bubbles of oxygen are released from the cut stem during photosynthesis.' });
S({ id: 'vaseline', name: 'Vaseline (petroleum jelly)', formula: 'hydrocarbon mixture', type: 'solid',
  category: 'reagent', solidForm: 'lipid', colour: '#f6f2d8', dispense: 'jar',
  notes: 'Seals joints in gas and transpiration experiments.' });
S({ id: 'zinc_sulfate', name: 'Zinc sulfate', formula: 'ZnSO4(s)', type: 'solid', category: 'salt',
  dissolveTo: [{ id: 'Zn2+', n: 1 }, { id: 'SO4^2-', n: 1 }], solubility: 54, colour: '#fdfdfd', dispense: 'jar',
  notes: 'Soluble salt used for qualitative analysis of zinc ions.' });
S({ id: 'iron_sulfate_solid', name: 'Iron(II) sulfate-7-water', formula: 'FeSO4.7H2O(s)', type: 'solid',
  category: 'salt', solidForm: 'FeSO4.7H2O', dissolveTo: [{ id: 'Fe2+', n: 1 }, { id: 'SO4^2-', n: 1 }],
  solubility: 30, colour: '#9fd6b0', ghs: ['irritant', 'harmful'], dispense: 'jar', mp: 64,
  notes: 'Pale green crystals; oxidise in air so make solutions fresh.' });

S({ id: 'sodium_thiosulfate_0_1m_lib', name: 'Sodium thiosulfate, 0.1 mol/dm3', formula: 'Na2S2O3(aq)',
  type: 'solution', category: 'salt', concentration: 0.1, density: 1.02,
  dissolveTo: [{ id: 'Na+', n: 2 }, { id: 'S2O3^2-', n: 1 }], dispense: 'bottle', volume: 500,
  notes: 'The reducing agent for the iodine clock and for iodine titrations.' });
S({ id: 'benzoic_acid', name: 'Benzoic acid (crude)', formula: 'C6H5COOH(s)', type: 'solid', category: 'organic',
  solidForm: 'C6H5COOH', dissolveTo: [{ id: 'C6H5COOH', n: 1 }], solubility: 0.34, colour: '#fdfdfa',
  ghs: ['irritant'], dispense: 'jar', mp: 122.4, notes: 'Purify by recrystallisation from hot water; melting point 122 °C.' });
S({ id: 'paper_clips_substance', name: 'Paper clips (for electromagnet tests)', formula: 'Fe', type: 'solid',
  category: 'reagent', solidForm: 'Fe', colour: '#9aa1a8', dispense: 'pack', notes: 'Steel clips used to compare the strength of electromagnets.' });
S({ id: 'sodium_hydrogencarbonate_lib', name: 'Sodium hydrogencarbonate (for photosynthesis)', formula: 'NaHCO3(s)',
  type: 'solid', category: 'base', dissolveTo: [{ id: 'Na+', n: 1 }, { id: 'HCO3-', n: 1 }], solubility: 9.6,
  colour: '#fdfdfd', dispense: 'jar', notes: 'Supplies carbon dioxide to a pondweed photosynthesis experiment.' });
S({ id: 'hydrochloric_acid_0_1m_lib', name: 'Hydrochloric acid, 0.1 mol/dm3 (biology)', formula: 'HCl(aq)',
  type: 'solution', category: 'acid', strongAcid: true, concentration: 0.1, protons: 1, density: 1.0,
  dissolveTo: [{ id: 'H+', n: 1 }, { id: 'Cl-', n: 1 }], ghs: ['irritant'], ppe: ['goggles', 'labcoat'],
  dispense: 'bottle', volume: 500, notes: 'Used to acidify and for diffusion demonstrations.' });
S({ id: 'buffer_solution_ph7_lib', name: 'Buffer solution pH 7.0 (enzyme work)', formula: 'phosphate buffer',
  type: 'solution', category: 'reagent', ph: 7.0, dissolveTo: [{ id: 'H+', n: 1e-7 }], dispense: 'bottle', volume: 250,
  notes: 'Keeps the enzyme at its optimum pH during kinetic runs.' });
