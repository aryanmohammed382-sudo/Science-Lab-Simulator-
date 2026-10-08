// ---------------------------------------------------------------------------
// CHEMICAL REACTION ENGINE
// ---------------------------------------------------------------------------
// Rules are pure data.  A rule lists what it needs (left hand side), what it
// makes (right hand side), the enthalpy change, how fast it goes and any
// conditions (temperature window, catalyst, minimum concentration...).
//
// Two integration modes:
//   * `speed: 'instant'`  - fast ionic chemistry. Applied completely the moment
//     the reactants meet, in stoichiometric proportions. Neutralisation,
//     precipitation and gas evolution behave this way on a bench timescale.
//   * `speed: <number>`   - a rate constant in mol/s.  Integrated over
//     simulated time by `stepReactions`, scaled by concentration, temperature
//     (Q10 / Arrhenius), solid surface area and catalysts.  This is what makes
//     "rates of reaction" and enzyme experiments measurable.
//
// Equilibrium rules (`equilibrium: { K }`) solve for the extent that satisfies
// K = products/reactants, so Le Chatelier behaviour emerges from the numbers.
// ---------------------------------------------------------------------------

import { SPECIES, getSpecies } from './species.js';
import { SUBSTANCES } from './substances.js';
import { clamp, round } from './util.js';

const EPS = 1e-9;

export const REACTIONS = [];

function R(rule) {
  REACTIONS.push({
    type: 'reaction',
    level: ['igcse', 'as', 'a', 'ug', 'research'],
    speed: 'instant',
    deltaH: 0,
    priority: 0,
    ...rule
  });
  return rule;
}

// ---------------------------------------------------------------------------
// availability helpers
// ---------------------------------------------------------------------------
function available(mixture, entry) {
  const id = entry.id;
  switch (entry.phase) {
    case 'aq': return mixture.aqueous.get(id) || 0;
    case 'org': return mixture.organic.get(id) || 0;
    case 's': return (mixture.solids.get(id) || 0) / getSpecies(id).molarMass;
    case 'g': return mixture.gas.get(id) || 0;
    default: return mixture.molesOf(id);
  }
}
function consume(mixture, entry, mol) {
  switch (entry.phase) {
    case 'aq': mixture.aqueous.set(entry.id, Math.max(0, (mixture.aqueous.get(entry.id) || 0) - mol)); break;
    case 'org': mixture.organic.set(entry.id, Math.max(0, (mixture.organic.get(entry.id) || 0) - mol)); break;
    case 's': {
      const mm = getSpecies(entry.id).molarMass;
      mixture.solids.set(entry.id, Math.max(0, (mixture.solids.get(entry.id) || 0) - mol * mm));
      break;
    }
    case 'g': mixture.gas.set(entry.id, Math.max(0, (mixture.gas.get(entry.id) || 0) - mol)); break;
    default: {
      // no phase stated: take the material from whichever phase holds it
      const id = entry.id;
      if ((mixture.organic.get(id) || 0) > 0) {
        mixture.organic.set(id, Math.max(0, mixture.organic.get(id) - mol));
      } else if ((mixture.aqueous.get(id) || 0) > 0) {
        mixture.aqueous.set(id, Math.max(0, mixture.aqueous.get(id) - mol));
      } else if ((mixture.gas.get(id) || 0) > 0) {
        mixture.gas.set(id, Math.max(0, mixture.gas.get(id) - mol));
      } else if ((mixture.solids.get(id) || 0) > 0) {
        const mm = getSpecies(id).molarMass;
        mixture.solids.set(id, Math.max(0, mixture.solids.get(id) - mol * mm));
      }
      break;
    }
  }
}
function produce(mixture, entry, mol) {
  const id = entry.id;
  const sp = getSpecies(id);
  const phase = entry.phase || (sp.kind === 'gas' ? 'g' : sp.kind === 'solid' ? 's' : sp.miscible === false ? 'org' : 'aq');
  switch (phase) {
    case 'aq': mixture.addAqueous(id, mol); break;
    case 'org': mixture.addOrganic(id, mol); break;
    case 's': mixture.addSolidSpecies(id, mol * sp.molarMass); break;
    case 'g': mixture.addGas(id, mol); break;
    default: mixture.addAqueous(id, mol);
  }
}

// ---------------------------------------------------------------------------
// conditions
// ---------------------------------------------------------------------------
function ruleAvailable(rule, mixture, ctx = {}) {
  if (rule.requires && !rule.requires.every((id) => mixture.has(id) || (ctx.present || []).includes(id))) return false;
  for (const e of rule.lhs) if (available(mixture, e) < e.n * EPS) return false;
  const c = rule.conditions || {};
  if (c.minTempC !== undefined && mixture.temperature < c.minTempC) return false;
  if (c.maxTempC !== undefined && mixture.temperature > c.maxTempC) return false;
  if (c.minConc) {
    const V = Math.max(mixture.aqVolume, 1e-6) / 1000;
    if ((mixture.aqueous.get(c.minConc.id) || 0) / V < c.minConc.value) return false;
  }
  if (rule.needsLight && !ctx.light) return false;
  if (rule.needsIgnition && !ctx.ignition) return false;
  if (rule.needsDark && ctx.light) return false;
  if (c.catalyst) {
    const found = (ctx.catalysts || []).includes(c.catalyst)
      || (mixture.solids.get(c.catalyst) || 0) > 0
      || (mixture.aqueous.get(c.catalyst) || 0) > 0;
    if (!found) return false;
  }
  return true;
}

/** Maximum extent allowed by the limiting reactant, mol of "rule units". */
function maxExtent(rule, mixture) {
  let ext = Infinity;
  for (const e of rule.lhs) ext = Math.min(ext, available(mixture, e) / e.n);
  return Math.max(0, ext);
}

/** Solve the equilibrium extent (binary search) for reversible rules. */
function equilibriumExtent(rule, mixture) {
  const K = rule.equilibrium.K;
  const ext0 = maxExtent(rule, mixture);
  if (!isFinite(K) || ext0 <= 0) return ext0;
  const V = Math.max(mixture.aqVolume, 1e-6) / 1000;
  const q = (x) => {
    let num = 1, den = 1;
    for (const e of rule.rhs) {
      if (e.phase === 's' || e.phase === 'g' || getSpecies(e.id).kind === 'solid') continue;
      const c = Math.max((mixture.molesOf(e.id) + e.n * x) / V, 1e-12);
      num *= Math.pow(c, e.n);
    }
    for (const e of rule.lhs) {
      if (e.phase === 's' || getSpecies(e.id).kind === 'solid') continue;
      const c = Math.max((available(mixture, e) - e.n * x) / V, 1e-12);
      den *= Math.pow(c, e.n);
    }
    return num / den;
  };
  let lo = 0, hi = ext0;
  if (q(0) >= K) return 0;
  if (q(hi) <= K) return hi;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (q(mid) > K) hi = mid; else lo = mid;
  }
  return lo;
}

/** Apply a known extent of a rule and return the observation record. */
function applyExtent(rule, mixture, extent) {
  const before = mixture.colourHex;
  for (const e of rule.lhs) consume(mixture, e, e.n * extent);
  for (const e of rule.rhs) produce(mixture, e, e.n * extent);
  // enthalpy of reaction -> temperature change
  let deltaT = 0;
  if (rule.deltaH) deltaT = mixture.applyEnergy(-rule.deltaH * 1000 * extent);
  // gas products bubble out of solution until saturation
  const gasIds = rule.rhs.filter((e) => (e.phase || '') === 'g' || getSpecies(e.id).kind === 'gas').map((e) => e.id);
  const precip = rule.rhs.filter((e) => (e.phase || '') === 's' || getSpecies(e.id).kind === 'solid').map((e) => e.id);
  const after = mixture.colourHex;
  const ev = {
    id: rule.id,
    name: rule.name,
    type: rule.type,
    equation: formatEquation(rule),
    extent: round(extent, 9),
    moles: extent,
    observations: rule.observations || '',
    gas: gasIds,
    precipitate: precip,
    deltaT: round(deltaT, 3),
    deltaH: rule.deltaH,
    colourBefore: before,
    colourAfter: after,
    colourChange: before !== after ? `${before} -> ${after}` : null,
    level: rule.level,
    learningPoint: rule.learningPoint || null
  };
  mixture.reactionLog.push(ev);
  if (rule.observations) mixture.observations.push(rule.observations);
  return ev;
}

// ---------------------------------------------------------------------------
// public API
// ---------------------------------------------------------------------------
/**
 * Apply every fast rule that currently applies, repeatedly, until the mixture
 * stops changing.
 * @returns {Array} reaction events in the order they happened
 */
export function applyReactions(mixture, ctx = {}) {
  const events = [];
  const counts = new Map();
  for (let pass = 0; pass < 40; pass++) {
    let best = null, bestExtent = 0;
    for (const rule of REACTIONS) {
      const n = counts.get(rule.id) || 0;
      if (n > 30 || rule.speed !== 'instant' || !ruleAvailable(rule, mixture, ctx)) continue;
      const ext = rule.equilibrium ? equilibriumExtent(rule, mixture) : maxExtent(rule, mixture);
      if (ext <= 1e-12) continue;
      if (!best || (rule.priority || 0) > (best.priority || 0)) { best = rule; bestExtent = ext; }
    }
    if (!best) break;
    counts.set(best.id, (counts.get(best.id) || 0) + 1);
    events.push(applyExtent(best, mixture, bestExtent));
    // informational rules consume nothing, so stop after reporting them once
    if (best.note) break;
  }
  return events;
}

/**
 * Advance slow (kinetic) reactions by `dt` seconds of simulated time.
 * @returns {Array} reaction events (extent produced during this step)
 */
export function stepReactions(mixture, dt, ctx = {}) {
  const events = [];
  // Solution equilibrium first: an added solid has to dissolve before it can
  // react, and an evaporated solution crystallises.
  const { dissolved, crystallised } = mixture.dissolveSolids();
  for (const d of dissolved) {
    events.push({ id: 'dissolve:' + d.solidId, text: `The ${getSpecies(d.solidId).name} dissolves in the water.`, observations: [`${getSpecies(d.solidId).name} dissolves to give a ${getSpecies(d.solidId).colour ? 'coloured' : 'colourless'} solution.`] });
  }
  for (const c of crystallised) {
    events.push({ id: 'crystallise:' + c.solidId, text: `The solution is saturated, so ${getSpecies(c.solidId).name} crystallises out.`, observations: ['Crystals are forming as the water evaporates.'] });
  }
  for (const rule of REACTIONS) {
    if (rule.speed === 'instant' || !ruleAvailable(rule, mixture, ctx)) continue;
    const V = Math.max(mixture.aqVolume, 1e-6) / 1000;
    // concentration term (order defaults to the stoichiometric coefficient)
    let conc = 1;
    for (const e of rule.lhs) {
      // Reaction orders default to 1 per species (first order in each
      // reactant) - not to the stoichiometric coefficient. Solids do not
      // appear in the rate law; their surface area is handled below.
      const order = e.order ?? (e.phase === 's' || getSpecies(e.id).kind === 'solid' ? 0 : 1);
      if (order === 0) continue;
      const c = Math.max(available(mixture, e) / V, 1e-12);
      conc *= Math.pow(c, order);
    }
    // solid surface area term - smaller particles / more mass react faster
    let surface = 1;
    if (rule.surfaceFactor) {
      const e = rule.lhs.find((l) => l.phase === 's' || getSpecies(l.id).kind === 'solid');
      if (e) {
        const grams = mixture.solids.get(e.id) || 0;
        surface = Math.max(0.02, Math.pow(grams / (rule.referenceMassG || 2), 2 / 3));
        surface *= mixture.solidMeta?.get(e.id)?.specificSurface ?? 1;
        surface *= rule.particleFactor ?? 1;
      } else surface = 0;
    }
    // temperature factor
    let tempF = 1;
    if (rule.enzyme) {
      const { optC = 40, width = 15, denatureC = 60 } = rule.enzyme;
      tempF = Math.exp(-Math.pow((mixture.temperature - optC) / width, 2));
      if (mixture.temperature > denatureC) tempF *= Math.max(0.02, Math.exp(-(mixture.temperature - denatureC) / 5));
    } else {
      const q10 = rule.q10 ?? 2;
      tempF = Math.pow(q10, (mixture.temperature - 20) / 10);
    }
    if (rule.conditions?.minTempC && mixture.temperature < rule.conditions.minTempC) tempF = 0;
    const rate = rule.speed * conc * surface * tempF; // mol/s of rule units
    let ext = rate * dt;
    const cap = maxExtent(rule, mixture);
    if (ext > cap) ext = cap;
    if (ext <= 1e-12) continue;
    events.push(applyExtent(rule, mixture, ext));
  }
  return events;
}

/**
 * Produce an explanation for why nothing happened - used by the safety/tutor
 * layer so that "no reaction" is still educational.
 */
export function explainNoReaction(mixture, addedSpeciesId) {
  const hasAcid = (mixture.aqueous.get('H+') || 0) > 1e-6;
  const metalIds = [...mixture.solids.keys()].filter((id) => getSpecies(id).metal);
  if (hasAcid && metalIds.length) {
    const names = metalIds.map((id) => getSpecies(id).name).join(', ');
    return `No reaction. ${names} is below hydrogen in the reactivity series, so it will not displace hydrogen from a dilute acid.`;
  }
  if (hasAcid && (mixture.solids.has('Cu') || mixture.solids.has('Ag'))) {
    return 'No reaction. Copper and silver are unreactive towards dilute acids.';
  }
  if (addedSpeciesId === 'I2' && mixture.aqueous.has('starch')) {
    return 'Iodine and starch should give a blue-black complex - check that both are present.';
  }
  if (hasAcid && mixture.organic.size && !mixture.aqueous.size) {
    return 'The organic layer is not miscible with water, so it cannot reach the acid. Shake or stir to increase the contact area.';
  }
  return null;
}

/** Pretty-print a rule as a chemical equation. */
export function formatEquation(rule) {
  const side = (list) => list.map((e) => {
    const sp = getSpecies(e.id);
    const f = sp.formula || e.id;
    return (e.n > 1 ? `${trimNum(e.n)} ` : '') + f + (e.phase === 's' ? '(s)' : e.phase === 'g' ? '(g)' : e.phase === 'org' ? '(org)' : '');
  }).join(' + ');
  return `${side(rule.lhs)} -> ${side(rule.rhs)}`;
}
function trimNum(n) {
  const r = round(n, 3);
  return Number.isInteger(r) ? String(r) : String(r);
}

/** Rules that involve a given substance (used by the theory panels). */
export function rulesForSpecies(speciesId) {
  return REACTIONS.filter((r) => r.lhs.some((e) => e.id === speciesId) || r.rhs.some((e) => e.id === speciesId));
}

// ===========================================================================
// RULE DATA
// ===========================================================================
// phase: 'aq' (default for ions/molecules), 's' solid, 'org' organic layer, 'g' gas
// speed: 'instant' | mol/s    deltaH: kJ per mol of reaction as written
// ===========================================================================

// ------------------------------------------------------- acid + base (fast)
R({ id: 'neutralisation', name: 'Neutralisation', type: 'acid-base', priority: 6,
  lhs: [{ id: 'H+', n: 1 }, { id: 'OH-', n: 1 }], rhs: [{ id: 'H2O', n: 1 }], deltaH: -57.3,
  level: ['igcse', 'as', 'a', 'ug', 'research'],
  observations: 'The solution warms up as the acid and alkali neutralise each other.',
  learningPoint: 'Enthalpy of neutralisation for a strong acid and strong base is about -57 kJ/mol because the same reaction (H+ + OH- -> H2O) is happening.' });

R({ id: 'hydroxide_hydrogencarbonate', name: 'Neutralisation of hydrogencarbonate', type: 'acid-base', priority: 6,
  lhs: [{ id: 'H+', n: 1 }, { id: 'HCO3-', n: 1 }], rhs: [{ id: 'H2O', n: 1 }, { id: 'CO2', n: 1, phase: 'g' }],
  deltaH: -12, observations: 'Effervescence - carbon dioxide is released and the liquid fizzes.' });

R({ id: 'hydroxide_carbonate', name: 'Neutralisation of carbonate', type: 'acid-base', priority: 6,
  lhs: [{ id: 'H+', n: 2 }, { id: 'CO3^2-', n: 1 }], rhs: [{ id: 'H2O', n: 1 }, { id: 'CO2', n: 1, phase: 'g' }],
  deltaH: -25, observations: 'Vigorous fizzing of carbon dioxide.' });

R({ id: 'ammonia_neutralisation', name: 'Ammonia + acid', type: 'acid-base', priority: 6,
  lhs: [{ id: 'NH3', n: 1 }, { id: 'H+', n: 1 }], rhs: [{ id: 'NH4+', n: 1 }], deltaH: -52,
  observations: 'The pungent smell of ammonia disappears as the ammonium salt forms.' });

R({ id: 'ethanoic_naoh', name: 'Ethanoic acid + alkali', type: 'acid-base', priority: 6,
  lhs: [{ id: 'CH3COOH', n: 1 }, { id: 'OH-', n: 1 }], rhs: [{ id: 'CH3COO-', n: 1 }, { id: 'H2O', n: 1 }],
  deltaH: -55, level: ['as', 'a', 'ug'],
  observations: 'The vinegar smell fades as ethanoate ions form.' });

R({ id: 'citric_naoh', name: 'Citric acid + alkali', type: 'acid-base', priority: 6,
  lhs: [{ id: 'C6H8O7', n: 1 }, { id: 'OH-', n: 3 }],
  rhs: [{ id: 'C6H5O7^3-', n: 1 }, { id: 'H2O', n: 3 }], deltaH: -165,
  learningPoint: 'Citric acid is triprotic, so one mole needs three moles of hydroxide: this is the stoichiometry behind a titration curve.' });

R({ id: 'ethanoic_carbonate', name: 'Ethanoic acid + carbonate', type: 'acid-base', priority: 5,
  lhs: [{ id: 'CH3COOH', n: 2 }, { id: 'CO3^2-', n: 1 }],
  rhs: [{ id: 'CH3COO-', n: 2 }, { id: 'H2O', n: 1 }, { id: 'CO2', n: 1, phase: 'g' }], deltaH: -15,
  observations: 'Steady fizzing - a weak acid reacts more slowly than a strong acid of the same concentration.' });

R({ id: 'weak_acid_ka_ethanoic', name: 'Ethanoic acid ionisation', type: 'equilibrium', priority: 2,
  lhs: [{ id: 'CH3COOH', n: 1 }], rhs: [{ id: 'H+', n: 1 }, { id: 'CH3COO-', n: 1 }],
  deltaH: -0.4, equilibrium: { K: 1.74e-5 }, level: ['as', 'a', 'ug', 'research'],
  observations: 'Only a small fraction of the acid molecules ionise - the pH is far higher than for a strong acid of the same concentration.',
  learningPoint: 'Ka = [H+][A-]/[HA]. Solve for the extent to find the pH of a weak acid.' });

// ------------------------------------------------- acid + carbonate (kinetic)
R({ id: 'caco3_hcl', name: 'Calcium carbonate + acid', type: 'acid-carbonate', priority: 4,
  speed: 3.5e-4, q10: 2, surfaceFactor: true, referenceMassG: 2,
  lhs: [{ id: 'CaCO3', n: 1, phase: 's' }, { id: 'H+', n: 2 }],
  rhs: [{ id: 'Ca2+', n: 1 }, { id: 'H2O', n: 1 }, { id: 'CO2', n: 1, phase: 'g' }], deltaH: -15,
  observations: 'Steady stream of carbon dioxide bubbles; the chips shrink and eventually disappear.',
  learningPoint: 'Rate depends on the concentration of the acid and the surface area of the chips, not on the amount of solid in the flask.' });

R({ id: 'cuco3_hcl', name: 'Copper(II) carbonate + acid', type: 'acid-carbonate', priority: 4,
  speed: 8e-4, q10: 2, surfaceFactor: true, referenceMassG: 1,
  lhs: [{ id: 'CuCO3', n: 1, phase: 's' }, { id: 'H+', n: 4 }],
  rhs: [{ id: 'Cu2+', n: 2 }, { id: 'CO2', n: 2, phase: 'g' }, { id: 'H2O', n: 2 }], deltaH: -20,
  observations: 'Green solid dissolves to give a blue solution while carbon dioxide fizzes off.',
  colourChange: 'green solid -> blue solution' });

R({ id: 'mgco3_hcl', name: 'Magnesium carbonate + acid', type: 'acid-carbonate', priority: 4,
  speed: 6e-4, q10: 2, surfaceFactor: true, referenceMassG: 1,
  lhs: [{ id: 'MgCO3', n: 1, phase: 's' }, { id: 'H+', n: 2 }],
  rhs: [{ id: 'Mg2+', n: 1 }, { id: 'H2O', n: 1 }, { id: 'CO2', n: 1, phase: 'g' }], deltaH: -15 });

R({ id: 'baco3_hcl', name: 'Barium carbonate + acid', type: 'acid-carbonate', priority: 4,
  speed: 5e-4, q10: 2, surfaceFactor: true,
  lhs: [{ id: 'BaCO3', n: 1, phase: 's' }, { id: 'H+', n: 2 }],
  rhs: [{ id: 'Ba2+', n: 1 }, { id: 'H2O', n: 1 }, { id: 'CO2', n: 1, phase: 'g' }], deltaH: -15 });

R({ id: 'nahco3_hcl', name: 'Sodium hydrogencarbonate + acid', type: 'acid-carbonate', priority: 4,
  speed: 9e-4, q10: 2, surfaceFactor: true, referenceMassG: 1,
  lhs: [{ id: 'NaHCO3', n: 1, phase: 's' }, { id: 'H+', n: 1 }],
  rhs: [{ id: 'Na+', n: 1 }, { id: 'H2O', n: 1 }, { id: 'CO2', n: 1, phase: 'g' }], deltaH: -9,
  observations: 'Very vigorous fizzing - hydrogencarbonate releases CO2 quickly.' });

// ---------------------------------------------------------- metal + acid
R({ id: 'mg_hcl', name: 'Magnesium + acid', type: 'metal-acid', priority: 3,
  speed: 0.02, q10: 2, surfaceFactor: true, referenceMassG: 0.2,
  lhs: [{ id: 'Mg', n: 1, phase: 's' }, { id: 'H+', n: 2 }],
  rhs: [{ id: 'Mg2+', n: 1 }, { id: 'H2', n: 1, phase: 'g' }], deltaH: -466,
  observations: 'Rapid effervescence; the ribbon dissolves quickly and the mixture gets noticeably hot.',
  learningPoint: 'The rate of fizzing indicates the reactivity of the metal.' });

R({ id: 'zn_hcl', name: 'Zinc + acid', type: 'metal-acid', priority: 3,
  speed: 2.5e-3, q10: 2, surfaceFactor: true, referenceMassG: 1,
  lhs: [{ id: 'Zn', n: 1, phase: 's' }, { id: 'H+', n: 2 }],
  rhs: [{ id: 'Zn2+', n: 1 }, { id: 'H2', n: 1, phase: 'g' }], deltaH: -153,
  observations: 'Bubbles of hydrogen form steadily on the surface of the granules.' });

R({ id: 'fe_hcl', name: 'Iron + acid', type: 'metal-acid', priority: 3,
  speed: 4e-4, q10: 2, surfaceFactor: true, referenceMassG: 1,
  lhs: [{ id: 'Fe', n: 1, phase: 's' }, { id: 'H+', n: 2 }],
  rhs: [{ id: 'Fe2+', n: 1 }, { id: 'H2', n: 1, phase: 'g' }], deltaH: -89,
  observations: 'Slow bubbling; the solution gradually turns pale green.',
  learningPoint: 'Iron is less reactive than zinc, so the rate is lower - the reactivity series predicts this.' });

R({ id: 'al_hcl', name: 'Aluminium + acid', type: 'metal-acid', priority: 2,
  speed: 6e-5, q10: 2, surfaceFactor: true, referenceMassG: 1,
  lhs: [{ id: 'Al', n: 2, phase: 's' }, { id: 'H+', n: 6 }],
  rhs: [{ id: 'Al3+', n: 2 }, { id: 'H2', n: 3, phase: 'g' }], deltaH: -1050,
  observations: 'Very little happens at first - the tough oxide layer must be removed before the metal reacts.',
  learningPoint: 'Aluminium is protected by an impermeable oxide layer, which is why it resists corrosion.' });

R({ id: 'pb_hcl', name: 'Lead + acid', type: 'metal-acid', priority: 1,
  speed: 2e-5, q10: 2, surfaceFactor: true,
  lhs: [{ id: 'Pb', n: 1, phase: 's' }, { id: 'H+', n: 2 }],
  rhs: [{ id: 'Pb2+', n: 1 }, { id: 'H2', n: 1, phase: 'g' }], deltaH: -13,
  observations: 'The reaction soon stops: insoluble lead(II) chloride coats the metal and protects it.',
  level: ['as', 'a', 'ug'] });

// ---------------------------------------------- metal + alkali (amphoteric)
R({ id: 'al_naoh', name: 'Aluminium + alkali', type: 'metal-base', priority: 2,
  speed: 1e-3, q10: 2, surfaceFactor: true,
  lhs: [{ id: 'Al', n: 2, phase: 's' }, { id: 'OH-', n: 2 }, { id: 'H2O', n: 2 }],
  rhs: [{ id: 'Al(OH)4-', n: 2 }, { id: 'H2', n: 3, phase: 'g' }], deltaH: -830,
  level: ['as', 'a', 'ug'],
  observations: 'Fizzing in the alkali - aluminium is amphoteric and dissolves in both acids and alkalis.' });

// ------------------------------------------- oxides & hydroxides + acid
R({ id: 'cuo_hcl', name: 'Copper(II) oxide + acid', type: 'acid-oxide', priority: 4,
  speed: 4e-4, q10: 2, surfaceFactor: true, referenceMassG: 1,
  lhs: [{ id: 'CuO', n: 1, phase: 's' }, { id: 'H+', n: 2 }],
  rhs: [{ id: 'Cu2+', n: 1 }, { id: 'H2O', n: 1 }], deltaH: -60,
  observations: 'The black powder dissolves and the solution turns blue.',
  learningPoint: 'This is a standard preparation of a soluble salt from an insoluble base: add the oxide until it is in excess, then filter.' });

R({ id: 'mgo_hcl', name: 'Magnesium oxide + acid', type: 'acid-oxide', priority: 4,
  speed: 9e-4, q10: 2, surfaceFactor: true,
  lhs: [{ id: 'MgO', n: 1, phase: 's' }, { id: 'H+', n: 2 }], rhs: [{ id: 'Mg2+', n: 1 }, { id: 'H2O', n: 1 }], deltaH: -140 });

R({ id: 'zno_hcl', name: 'Zinc oxide + acid', type: 'acid-oxide', priority: 4,
  speed: 6e-4, q10: 2, surfaceFactor: true,
  lhs: [{ id: 'ZnO', n: 1, phase: 's' }, { id: 'H+', n: 2 }], rhs: [{ id: 'Zn2+', n: 1 }, { id: 'H2O', n: 1 }], deltaH: -90 });

R({ id: 'fe2o3_hcl', name: 'Iron(III) oxide + acid', type: 'acid-oxide', priority: 4,
  speed: 2e-4, q10: 2, surfaceFactor: true,
  lhs: [{ id: 'Fe2O3', n: 1, phase: 's' }, { id: 'H+', n: 6 }],
  rhs: [{ id: 'Fe3+', n: 2 }, { id: 'H2O', n: 3 }], deltaH: -130,
  observations: 'The red-brown solid dissolves to give a yellow-brown solution.' });

R({ id: 'cuo_h2so4', name: 'Copper(II) oxide + sulfuric acid', type: 'acid-oxide', priority: 4,
  speed: 4e-4, q10: 2, surfaceFactor: true,
  lhs: [{ id: 'CuO', n: 1, phase: 's' }, { id: 'H+', n: 2 }],
  rhs: [{ id: 'Cu2+', n: 1 }, { id: 'H2O', n: 1 }], deltaH: -60 });

R({ id: 'cuoh2_hcl', name: 'Copper(II) hydroxide + acid', type: 'acid-hydroxide', priority: 4,
  lhs: [{ id: 'Cu(OH)2', n: 1, phase: 's' }, { id: 'H+', n: 2 }],
  rhs: [{ id: 'Cu2+', n: 1 }, { id: 'H2O', n: 2 }], deltaH: -60,
  observations: 'The pale blue precipitate dissolves to give a clear blue solution.' });

R({ id: 'feoh3_hcl', name: 'Iron(III) hydroxide + acid', type: 'acid-hydroxide', priority: 4,
  lhs: [{ id: 'Fe(OH)3', n: 1, phase: 's' }, { id: 'H+', n: 3 }],
  rhs: [{ id: 'Fe3+', n: 1 }, { id: 'H2O', n: 3 }], deltaH: -90 });

R({ id: 'aloh3_hcl', name: 'Aluminium hydroxide + acid', type: 'acid-hydroxide', priority: 4,
  lhs: [{ id: 'Al(OH)3', n: 1, phase: 's' }, { id: 'H+', n: 3 }],
  rhs: [{ id: 'Al3+', n: 1 }, { id: 'H2O', n: 3 }], deltaH: -100 });

R({ id: 'aloh3_naoh', name: 'Aluminium hydroxide + excess alkali', type: 'amphoteric', priority: 4,
  lhs: [{ id: 'Al(OH)3', n: 1, phase: 's' }, { id: 'OH-', n: 1 }],
  rhs: [{ id: 'Al(OH)4-', n: 1 }], deltaH: -20, level: ['a', 'ug', 'research'],
  observations: 'The white gelatinous precipitate dissolves in excess sodium hydroxide - aluminium hydroxide is amphoteric.',
  learningPoint: 'This is how you tell aluminium ions from magnesium ions: only the aluminium precipitate redissolves in excess alkali.' });

R({ id: 'znoh2_naoh', name: 'Zinc hydroxide + excess alkali', type: 'amphoteric', priority: 4,
  lhs: [{ id: 'Zn(OH)2', n: 1, phase: 's' }, { id: 'OH-', n: 2 }],
  rhs: [{ id: 'Zn2+', n: 1 }, { id: 'H2O', n: 2 }], deltaH: -20, level: ['a', 'ug'],
  observations: 'The white precipitate dissolves in excess alkali.' });

// ------------------------------------------------------- precipitation
const precip = (id, name, lhs, rhs, observations, level = ['igcse', 'as', 'a', 'ug', 'research'], extra = {}) =>
  R({ id, name, type: 'precipitation', priority: 4, lhs, rhs, observations, level, deltaH: -20, ...extra });

precip('agcl_precip', 'Silver chloride precipitate',
  [{ id: 'Ag+', n: 1 }, { id: 'Cl-', n: 1 }], [{ id: 'AgCl', n: 1, phase: 's' }],
  'A thick white precipitate of silver chloride forms immediately.',
  ['igcse', 'as', 'a', 'ug', 'research'],
  { learningPoint: 'This is the confirmatory test for chloride ions: white precipitate that darkens in sunlight and dissolves in dilute ammonia.' });

precip('agbr_precip', 'Silver bromide precipitate',
  [{ id: 'Ag+', n: 1 }, { id: 'Br-', n: 1 }], [{ id: 'AgBr', n: 1, phase: 's' }],
  'A cream precipitate of silver bromide forms.');

precip('agi_precip', 'Silver iodide precipitate',
  [{ id: 'Ag+', n: 1 }, { id: 'I-', n: 1 }], [{ id: 'AgI', n: 1, phase: 's' }],
  'A pale yellow precipitate of silver iodide forms, insoluble in ammonia.');

precip('baso4_precip', 'Barium sulfate precipitate',
  [{ id: 'Ba2+', n: 1 }, { id: 'SO4^2-', n: 1 }], [{ id: 'BaSO4', n: 1, phase: 's' }],
  'A dense white precipitate of barium sulfate forms at once.',
  ['igcse', 'as', 'a', 'ug', 'research'],
  { learningPoint: 'The standard test for sulfate ions. The precipitate is insoluble in dilute acid, which distinguishes it from a carbonate precipitate.' });

precip('pbcl2_precip', 'Lead(II) chloride precipitate',
  [{ id: 'Pb2+', n: 1 }, { id: 'Cl-', n: 2 }], [{ id: 'PbCl2', n: 1, phase: 's' }],
  'A white precipitate of lead(II) chloride forms because the solution is concentrated.',
  ['as', 'a', 'ug'],
  { conditions: { minConc: { id: 'Cl-', value: 0.5 } },
    learningPoint: 'Lead(II) chloride is only sparingly soluble, so it appears from concentrated chloride solutions - and redissolves when the mixture is warmed.' });

precip('pbi2_precip', 'Lead(II) iodide precipitate',
  [{ id: 'Pb2+', n: 1 }, { id: 'I-', n: 2 }], [{ id: 'PbI2', n: 1, phase: 's' }],
  'A bright yellow precipitate of lead(II) iodide forms - the classic golden rain.',
  ['igcse', 'as', 'a', 'ug', 'research'],
  { learningPoint: 'Dissolve the precipitate in hot water and let it cool to grow beautiful hexagonal crystals.' });

precip('pbso4_precip', 'Lead(II) sulfate precipitate',
  [{ id: 'Pb2+', n: 1 }, { id: 'SO4^2-', n: 1 }], [{ id: 'PbSO4', n: 1, phase: 's' }],
  'A white precipitate of lead(II) sulfate forms.');

precip('pbcro4_precip', 'Lead(II) chromate precipitate',
  [{ id: 'Pb2+', n: 1 }, { id: 'CrO4^2-', n: 1 }], [{ id: 'PbCrO4', n: 1, phase: 's' }],
  'A bright yellow precipitate of lead(II) chromate forms.');

precip('ag2cro4_precip', 'Silver chromate precipitate',
  [{ id: 'Ag+', n: 2 }, { id: 'CrO4^2-', n: 1 }], [{ id: 'Ag2CrO4', n: 1, phase: 's' }],
  'A brick-red precipitate of silver chromate forms.');

precip('cuoh2_precip', 'Copper(II) hydroxide precipitate',
  [{ id: 'Cu2+', n: 1 }, { id: 'OH-', n: 2 }], [{ id: 'Cu(OH)2', n: 1, phase: 's' }],
  'A pale blue gelatinous precipitate of copper(II) hydroxide forms.',
  ['igcse', 'as', 'a', 'ug', 'research'],
  { learningPoint: 'Adding a few drops of alkali gives the hydroxide precipitate; adding excess alkali makes it dissolve again as the deep blue tetraammine complex when ammonia is used.' });

precip('feoh2_precip', 'Iron(II) hydroxide precipitate',
  [{ id: 'Fe2+', n: 1 }, { id: 'OH-', n: 2 }], [{ id: 'Fe(OH)2', n: 1, phase: 's' }],
  'A dirty green precipitate of iron(II) hydroxide forms; it darkens in air as it oxidises.');

precip('feoh3_precip', 'Iron(III) hydroxide precipitate',
  [{ id: 'Fe3+', n: 3, }, { id: 'OH-', n: 3 }], [{ id: 'Fe(OH)3', n: 1, phase: 's' }],
  'A red-brown gelatinous precipitate of iron(III) hydroxide forms.');

precip('aloh3_precip', 'Aluminium hydroxide precipitate',
  [{ id: 'Al3+', n: 1 }, { id: 'OH-', n: 3 }], [{ id: 'Al(OH)3', n: 1, phase: 's' }],
  'A white gelatinous precipitate of aluminium hydroxide forms.');

precip('mgoh2_precip', 'Magnesium hydroxide precipitate',
  [{ id: 'Mg2+', n: 1 }, { id: 'OH-', n: 2 }], [{ id: 'Mg(OH)2', n: 1, phase: 's' }],
  'A white precipitate of magnesium hydroxide forms.');

precip('znoh2_precip', 'Zinc hydroxide precipitate',
  [{ id: 'Zn2+', n: 1 }, { id: 'OH-', n: 2 }], [{ id: 'Zn(OH)2', n: 1, phase: 's' }],
  'A white precipitate of zinc hydroxide forms.');

precip('caco3_precip', 'Calcium carbonate precipitate',
  [{ id: 'Ca2+', n: 1 }, { id: 'CO3^2-', n: 1 }], [{ id: 'CaCO3', n: 1, phase: 's' }],
  'A white precipitate of calcium carbonate forms - this is why limewater goes milky with carbon dioxide.');

precip('baco3_precip', 'Barium carbonate precipitate',
  [{ id: 'Ba2+', n: 1 }, { id: 'CO3^2-', n: 1 }], [{ id: 'BaCO3', n: 1, phase: 's' }],
  'A white precipitate of barium carbonate forms.');

precip('mgco3_precip', 'Magnesium carbonate precipitate',
  [{ id: 'Mg2+', n: 1 }, { id: 'CO3^2-', n: 1 }], [{ id: 'MgCO3', n: 1, phase: 's' }],
  'A white precipitate of magnesium carbonate forms.');

precip('cuso4_carbonate', 'Basic copper carbonate precipitate',
  [{ id: 'Cu2+', n: 2 }, { id: 'CO3^2-', n: 1 }, { id: 'OH-', n: 2 }], [{ id: 'CuCO3', n: 2, phase: 's' }],
  'A blue-green precipitate of basic copper carbonate forms.');

precip('pbs_precip', 'Lead(II) sulfide precipitate',
  [{ id: 'Pb2+', n: 1 }, { id: 'S2-', n: 1 }], [{ id: 'PbS', n: 1, phase: 's' }],
  'A black precipitate of lead(II) sulfide forms.');

precip('cus_precip', 'Copper(II) sulfide precipitate',
  [{ id: 'Cu2+', n: 1 }, { id: 'S2-', n: 1 }], [{ id: 'CuS', n: 1, phase: 's' }],
  'A black precipitate of copper(II) sulfide forms.');

precip('zns_precip', 'Zinc sulfide precipitate',
  [{ id: 'Zn2+', n: 1 }, { id: 'S2-', n: 1 }], [{ id: 'ZnS', n: 1, phase: 's' }],
  'A white precipitate of zinc sulfide forms.');

precip('fes_precip', 'Iron(II) sulfide precipitate',
  [{ id: 'Fe2+', n: 1 }, { id: 'S2-', n: 1 }], [{ id: 'FeS', n: 1, phase: 's' }],
  'A black precipitate of iron(II) sulfide forms.');

precip('cac2o4_precip', 'Calcium ethanedioate precipitate',
  [{ id: 'Ca2+', n: 1 }, { id: 'C2O4^2-', n: 1 }], [{ id: 'CaC2O4', n: 1, phase: 's' }],
  'A white precipitate of calcium ethanedioate forms; it dissolves in dilute hydrochloric acid.',
  ['a', 'ug', 'research']);

// ------------------------------------------------- gas dissolving / tests
R({ id: 'co2_hydrolysis', name: 'Carbon dioxide dissolving in water', type: 'gas-solution', priority: 2,
  lhs: [{ id: 'CO2', n: 1, phase: 'aq' }], rhs: [{ id: 'H2CO3', n: 1 }], deltaH: -20,
  equilibrium: { K: 0.0025 }, level: ['as', 'a', 'ug'],
  observations: 'Carbon dioxide dissolves to give a weakly acidic solution (carbonic acid).' });

R({ id: 'hcarbonate_from_co2', name: 'Carbon dioxide + hydroxide', type: 'gas-solution', priority: 5,
  lhs: [{ id: 'CO2', n: 1, phase: 'aq' }, { id: 'OH-', n: 2 }],
  rhs: [{ id: 'CO3^2-', n: 1 }, { id: 'H2O', n: 1 }], deltaH: -100,
  observations: 'The gas is absorbed by the alkali, forming carbonate ions.' });

R({ id: 'limewater_milky', name: 'Limewater turns milky', type: 'gas-test', priority: 6,
  lhs: [{ id: 'CO2', n: 1, phase: 'aq' }, { id: 'Ca2+', n: 1 }, { id: 'OH-', n: 2 }],
  rhs: [{ id: 'CaCO3', n: 1, phase: 's' }, { id: 'H2O', n: 1 }], deltaH: -110,
  observations: 'A white precipitate of calcium carbonate appears - the limewater turns milky.',
  learningPoint: 'This is the test for carbon dioxide. Bubbling excess CO2 through will redissolve the precipitate as calcium hydrogencarbonate.' });

R({ id: 'excess_co2_dissolve', name: 'Excess carbon dioxide redissolves limewater', type: 'gas-test', priority: 5,
  speed: 3e-4, q10: 2,
  lhs: [{ id: 'CO2', n: 1, phase: 'aq' }, { id: 'CaCO3', n: 1, phase: 's' }, { id: 'H2O', n: 1 }],
  rhs: [{ id: 'Ca2+', n: 1 }, { id: 'HCO3-', n: 2 }], deltaH: -30,
  observations: 'The milky precipitate dissolves again as calcium hydrogencarbonate forms - the solution clarifies.',
  level: ['as', 'a', 'ug'],
  learningPoint: 'Excess CO2 gives the soluble hydrogencarbonate: this is why limewater turns milky and then clears if you keep bubbling.' });

R({ id: 'ammonia_water', name: 'Ammonia dissolving in water', type: 'gas-solution', priority: 3,
  lhs: [{ id: 'NH3', n: 1, phase: 'aq' }], rhs: [{ id: 'NH4+', n: 1 }, { id: 'OH-', n: 1 }],
  equilibrium: { K: 1.8e-5 }, deltaH: -30,
  observations: 'The gas dissolves readily, giving an alkaline solution.' });

R({ id: 'hcl_gas_water', name: 'Hydrogen chloride dissolving', type: 'gas-solution', priority: 3,
  lhs: [{ id: 'HCl', n: 1, phase: 'aq' }], rhs: [{ id: 'H+', n: 1 }, { id: 'Cl-', n: 1 }], deltaH: -75,
  observations: 'The funnel fills with a white mist as hydrogen chloride dissolves to make hydrochloric acid.' });

R({ id: 'cl2_water', name: 'Chlorine dissolving (bleach formation)', type: 'gas-solution', priority: 3,
  lhs: [{ id: 'Cl2', n: 1, phase: 'aq' }, { id: 'H2O', n: 1 }], rhs: [{ id: 'HClO', n: 1 }, { id: 'H+', n: 1 }, { id: 'Cl-', n: 1 }],
  deltaH: -25, level: ['a', 'ug'],
  observations: 'The pale green gas dissolves to give a solution that bleaches indicator paper.' });

R({ id: 'so2_water', name: 'Sulfur dioxide dissolving', type: 'gas-solution', priority: 3,
  lhs: [{ id: 'SO2', n: 1, phase: 'aq' }, { id: 'H2O', n: 1 }], rhs: [{ id: 'H2SO3', n: 1 }], deltaH: -30,
  observations: 'The choking gas dissolves to give sulfurous acid.' });

R({ id: 'h2s_water', name: 'Hydrogen sulfide dissolving', type: 'gas-solution', priority: 3,
  lhs: [{ id: 'H2S', n: 1, phase: 'aq' }], rhs: [{ id: 'H+', n: 2 }, { id: 'S2-', n: 1 }], deltaH: -20, level: ['a', 'ug'] });

R({ id: 'carbonate_acid_from_h2co3', name: 'Carbonic acid + alkali', type: 'acid-base', priority: 5,
  lhs: [{ id: 'H2CO3', n: 1 }, { id: 'OH-', n: 2 }],
  rhs: [{ id: 'CO3^2-', n: 1 }, { id: 'H2O', n: 2 }], deltaH: -55 });

// ------------------------------------------------ complexes & equilibria
R({ id: 'cu_ammonia_complex', name: 'Tetraamminecopper(II) complex', type: 'complex', priority: 5,
  lhs: [{ id: 'Cu2+', n: 1 }, { id: 'NH3', n: 4 }], rhs: [{ id: 'CuNH4', n: 1 }],
  equilibrium: { K: 1e12 }, deltaH: -80,
  observations: 'The blue solution turns deep royal blue as the ammine complex forms.',
  learningPoint: 'Ligand substitution: four ammonia ligands replace water molecules around the copper(II) ion.' });

R({ id: 'cuoh2_ammonia', name: 'Copper(II) hydroxide dissolves in ammonia', type: 'complex', priority: 6,
  lhs: [{ id: 'Cu(OH)2', n: 1, phase: 's' }, { id: 'NH3', n: 4 }],
  rhs: [{ id: 'CuNH4', n: 1 }, { id: 'OH-', n: 2 }], deltaH: -30,
  observations: 'The pale blue precipitate dissolves to give the deep blue ammine complex.' });

R({ id: 'agno3_ammonia', name: 'Diamminesilver(I) complex', type: 'complex', priority: 5,
  lhs: [{ id: 'Ag+', n: 1 }, { id: 'NH3', n: 2 }], rhs: [{ id: 'AgNH3', n: 1 }],
  equilibrium: { K: 1e7 }, deltaH: -60,
  observations: 'Any precipitate dissolves in excess ammonia to give a colourless solution.' });

R({ id: 'tollens_ethanal', name: "Tollens' test with ethanal", type: 'redox', priority: 6,
  speed: 2e-4, q10: 2,
  lhs: [{ id: 'CH3CHO', n: 1 }, { id: 'AgNH3', n: 2 }, { id: 'OH-', n: 2 }],
  rhs: [{ id: 'CH3COO-', n: 1 }, { id: 'Ag', n: 2, phase: 's' }, { id: 'NH3', n: 4 }, { id: 'H2O', n: 1 }],
  deltaH: -100, level: ['a', 'ug'],
  observations: 'A mirror of metallic silver coats the inside of the tube - a positive test for an aldehyde.',
  learningPoint: 'Aldehydes are oxidised to carboxylic acids while Ag+ is reduced to silver metal.' });

R({ id: 'fe_thiocyanate', name: 'Iron(III) + thiocyanate equilibrium', type: 'equilibrium', priority: 4,
  lhs: [{ id: 'Fe3+', n: 1 }, { id: 'SCN-', n: 1 }], rhs: [{ id: 'FeSCN2+', n: 1 }],
  equilibrium: { K: 800 }, deltaH: -20,
  observations: 'The solution turns blood-red as the thiocyanatoiron(III) complex forms.',
  learningPoint: 'Add more Fe3+ or SCN- and the colour deepens; add water and it fades. That is Le Chatelier - the equilibrium position, not the rate, is changing.' });

// ------------------------------------------------------------- redox titres
R({ id: 'mno4_fe2', name: 'Permanganate oxidises iron(II)', type: 'redox', priority: 7,
  lhs: [{ id: 'MnO4-', n: 1 }, { id: 'H+', n: 8 }, { id: 'Fe2+', n: 5 }],
  rhs: [{ id: 'Mn2+', n: 1 }, { id: 'Fe3+', n: 5 }, { id: 'H2O', n: 4 }], deltaH: -340,
  level: ['a', 'ug', 'research'],
  observations: 'The purple colour disappears as the permanganate is reduced - the end point of a redox titration.',
  learningPoint: 'MnO4- + 8H+ + 5e- -> Mn2+ + 4H2O and Fe2+ -> Fe3+ + e-. The first permanent pink tinge marks the end point.' });

R({ id: 'mno4_oxalate', name: 'Permanganate oxidises ethanedioate', type: 'redox', priority: 6,
  speed: 0.4, q10: 3,
  lhs: [{ id: 'MnO4-', n: 2 }, { id: 'C2O4^2-', n: 5 }, { id: 'H+', n: 16 }],
  rhs: [{ id: 'Mn2+', n: 2 }, { id: 'CO2', n: 10, phase: 'g' }, { id: 'H2O', n: 8 }], deltaH: -600,
  level: ['a', 'ug'],
  observations: 'The purple colour fades slowly at first, then rapidly - the reaction is autocatalysed by the Mn2+ it produces.',
  learningPoint: 'Autocatalysis: the reaction speeds up as its own product (Mn2+) catalyses the next steps.' });

R({ id: 'mno4_conc_hcl', name: 'Permanganate oxidises chloride (concentrated)', type: 'redox', priority: 5,
  lhs: [{ id: 'MnO4-', n: 2 }, { id: 'H+', n: 16 }, { id: 'Cl-', n: 10 }],
  rhs: [{ id: 'Mn2+', n: 2 }, { id: 'Cl2', n: 5, phase: 'g' }, { id: 'H2O', n: 8 }], deltaH: -500,
  level: ['a', 'ug'], conditions: { minConc: { id: 'H+', value: 4 } },
  observations: 'The purple solution bleaches and a yellow-green gas of chlorine is evolved.' });

R({ id: 'cr2o7_fe2', name: 'Dichromate oxidises iron(II)', type: 'redox', priority: 7,
  lhs: [{ id: 'Cr2O7^2-', n: 1 }, { id: 'H+', n: 14 }, { id: 'Fe2+', n: 6 }],
  rhs: [{ id: 'Cr3+', n: 2 }, { id: 'Fe3+', n: 6 }, { id: 'H2O', n: 7 }], deltaH: -500,
  level: ['a', 'ug'],
  observations: 'Orange dichromate turns green as chromium(III) is formed.' });

R({ id: 'cr2o7_ethanol', name: 'Acidified dichromate oxidises ethanol', type: 'redox', priority: 6,
  speed: 2e-4, q10: 2,
  lhs: [{ id: 'C2H5OH', n: 3 }, { id: 'Cr2O7^2-', n: 2 }, { id: 'H+', n: 16 }],
  rhs: [{ id: 'CH3COOH', n: 3 }, { id: 'Cr3+', n: 4 }, { id: 'H2O', n: 11 }], deltaH: -600,
  level: ['a', 'ug'],
  observations: 'The orange solution turns green as the alcohol is oxidised - the test for a primary alcohol.',
  learningPoint: 'Primary alcohol -> aldehyde -> carboxylic acid. Distil the aldehyde off before it is oxidised further.' });

R({ id: 'cr2o7_propanol', name: 'Acidified dichromate oxidises propan-1-ol', type: 'redox', priority: 6,
  speed: 1.5e-4, q10: 2,
  lhs: [{ id: 'C3H8O', n: 3 }, { id: 'Cr2O7^2-', n: 1 }, { id: 'H+', n: 8 }],
  rhs: [{ id: 'propanal', n: 3 }, { id: 'Cr3+', n: 2 }, { id: 'H2O', n: 7 }], deltaH: -400, level: ['a', 'ug'],
  observations: 'Orange turns green as propan-1-ol is oxidised to propanal.' });

R({ id: 'i2_thiosulfate', name: 'Iodine + thiosulfate', type: 'redox', priority: 7,
  lhs: [{ id: 'I2', n: 1 }, { id: 'S2O3^2-', n: 2 }],
  rhs: [{ id: 'I-', n: 2 }, { id: 'S4O6^2-', n: 1 }], deltaH: -100,
  observations: 'The brown iodine colour is discharged - the solution becomes colourless.',
  learningPoint: 'Sodium thiosulfate is the standard reducing agent for iodine titrations. Two moles of thiosulfate reduce one mole of iodine.' });

R({ id: 'h2o2_iodide', name: 'Hydrogen peroxide oxidises iodide', type: 'redox', priority: 4,
  speed: 0.05, q10: 2,
  lhs: [{ id: 'H2O2', n: 1 }, { id: 'I-', n: 2 }, { id: 'H+', n: 2 }],
  rhs: [{ id: 'I2', n: 1 }, { id: 'H2O', n: 2 }], deltaH: -210,
  level: ['a', 'ug'],
  observations: 'A brown colour of iodine develops steadily through the colourless solution.' });

R({ id: 'persulfate_iodide', name: 'Peroxodisulfate oxidises iodide (iodine clock)', type: 'redox', priority: 4,
  speed: 0.02, q10: 2.5,
  lhs: [{ id: 'S2O8^2-', n: 1 }, { id: 'I-', n: 2 }],
  rhs: [{ id: 'I2', n: 1 }, { id: 'SO4^2-', n: 2 }], deltaH: -190,
  level: ['a', 'ug', 'research'],
  observations: 'Iodine is produced slowly. With starch and a little thiosulfate the mixture stays colourless and then turns blue-black all at once - the iodine clock.' });

R({ id: 'cl2_iodide', name: 'Chlorine displaces iodine', type: 'displacement', priority: 6,
  lhs: [{ id: 'Cl2', n: 1, phase: 'aq' }, { id: 'I-', n: 2 }], rhs: [{ id: 'I2', n: 1 }, { id: 'Cl-', n: 2 }], deltaH: -160,
  observations: 'A brown colour of iodine appears: chlorine is the stronger oxidising agent.',
  learningPoint: 'A more reactive halogen displaces a less reactive halide from solution.' });

R({ id: 'cl2_bromide', name: 'Chlorine displaces bromine', type: 'displacement', priority: 6,
  lhs: [{ id: 'Cl2', n: 1, phase: 'aq' }, { id: 'Br-', n: 2 }], rhs: [{ id: 'Br2', n: 1 }, { id: 'Cl-', n: 2 }], deltaH: -100,
  observations: 'The solution turns orange-brown as bromine is liberated.' });

R({ id: 'br2_iodide', name: 'Bromine displaces iodine', type: 'displacement', priority: 6,
  lhs: [{ id: 'Br2', n: 1, phase: 'aq' }, { id: 'I-', n: 2 }], rhs: [{ id: 'I2', n: 1 }, { id: 'Br-', n: 2 }], deltaH: -60,
  observations: 'Iodine is liberated, colouring the solution brown.' });

// ------------------------------------------------- metal displacement
R({ id: 'zn_cuso4', name: 'Zinc displaces copper', type: 'displacement', priority: 5,
  speed: 1.5e-3, q10: 2, surfaceFactor: true, referenceMassG: 1,
  lhs: [{ id: 'Zn', n: 1, phase: 's' }, { id: 'Cu2+', n: 1 }],
  rhs: [{ id: 'Zn2+', n: 1 }, { id: 'Cu', n: 1, phase: 's' }], deltaH: -217,
  observations: 'The blue colour fades as a pink-brown deposit of copper forms on the zinc. The mixture warms up.',
  learningPoint: 'Zinc is above copper in the reactivity series, so it reduces the copper(II) ions. This is a redox reaction: the zinc is oxidised and the copper(II) reduced.' });

R({ id: 'mg_cuso4', name: 'Magnesium displaces copper', type: 'displacement', priority: 5,
  speed: 4e-3, q10: 2, surfaceFactor: true, referenceMassG: 0.5,
  lhs: [{ id: 'Mg', n: 1, phase: 's' }, { id: 'Cu2+', n: 1 }],
  rhs: [{ id: 'Mg2+', n: 1 }, { id: 'Cu', n: 1, phase: 's' }], deltaH: -350,
  observations: 'Vigorous reaction with the blue colour disappearing quickly and the mixture becoming hot.' });

R({ id: 'fe_cuso4', name: 'Iron displaces copper', type: 'displacement', priority: 5,
  speed: 2e-4, q10: 2, surfaceFactor: true, referenceMassG: 2,
  lhs: [{ id: 'Fe', n: 1, phase: 's' }, { id: 'Cu2+', n: 1 }],
  rhs: [{ id: 'Fe2+', n: 1 }, { id: 'Cu', n: 1, phase: 's' }], deltaH: -150,
  observations: 'A pink deposit of copper slowly coats the iron; the pale green colour of iron(II) appears.' });

R({ id: 'cu_agno3', name: 'Copper displaces silver', type: 'displacement', priority: 5,
  speed: 1e-4, q10: 2, surfaceFactor: true, referenceMassG: 2,
  lhs: [{ id: 'Cu', n: 1, phase: 's' }, { id: 'Ag+', n: 2 }],
  rhs: [{ id: 'Cu2+', n: 1 }, { id: 'Ag', n: 2, phase: 's' }], deltaH: -150,
  observations: 'Shiny grey crystals of silver grow on the copper and the solution turns blue.' });

R({ id: 'zn_agno3', name: 'Zinc displaces silver', type: 'displacement', priority: 5,
  speed: 5e-4, q10: 2, surfaceFactor: true, referenceMassG: 1,
  lhs: [{ id: 'Zn', n: 1, phase: 's' }, { id: 'Ag+', n: 2 }],
  rhs: [{ id: 'Zn2+', n: 1 }, { id: 'Ag', n: 2, phase: 's' }], deltaH: -300,
  observations: 'A sparkling deposit of silver forms on the zinc granules.' });

R({ id: 'fe_agno3', name: 'Iron displaces silver', type: 'displacement', priority: 5,
  speed: 1e-4, q10: 2, surfaceFactor: true,
  lhs: [{ id: 'Fe', n: 1, phase: 's' }, { id: 'Ag+', n: 2 }],
  rhs: [{ id: 'Fe2+', n: 1 }, { id: 'Ag', n: 2, phase: 's' }], deltaH: -250 });

R({ id: 'mg_feso4', name: 'Magnesium displaces iron', type: 'displacement', priority: 5,
  speed: 2e-3, q10: 2, surfaceFactor: true,
  lhs: [{ id: 'Mg', n: 1, phase: 's' }, { id: 'Fe2+', n: 1 }],
  rhs: [{ id: 'Mg2+', n: 1 }, { id: 'Fe', n: 1, phase: 's' }], deltaH: -320 });

R({ id: 'zn_feso4', name: 'Zinc displaces iron', type: 'displacement', priority: 5,
  speed: 3e-4, q10: 2, surfaceFactor: true,
  lhs: [{ id: 'Zn', n: 1, phase: 's' }, { id: 'Fe2+', n: 1 }],
  rhs: [{ id: 'Zn2+', n: 1 }, { id: 'Fe', n: 1, phase: 's' }], deltaH: -80 });

// --------------------------------------------- reactive metals + water
R({ id: 'na_water', name: 'Sodium + water', type: 'metal-water', priority: 9, speed: 2, q10: 2,
  surfaceFactor: true, referenceMassG: 0.2,
  lhs: [{ id: 'Na', n: 2, phase: 's' }, { id: 'H2O', n: 2 }],
  rhs: [{ id: 'Na+', n: 2 }, { id: 'OH-', n: 2 }, { id: 'H2', n: 1, phase: 'g' }], deltaH: -184,
  observations: 'The sodium melts into a ball, skitters across the surface fizzing violently and often ignites with an orange flame.',
  learningPoint: 'Group 1 metals get more reactive down the group. Never add water to sodium metal - the heat can ignite the hydrogen produced.' });

R({ id: 'ca_water', name: 'Calcium + water', type: 'metal-water', priority: 7, speed: 0.05, q10: 2,
  surfaceFactor: true, referenceMassG: 0.5,
  lhs: [{ id: 'Ca', n: 1, phase: 's' }, { id: 'H2O', n: 2 }],
  rhs: [{ id: 'Ca2+', n: 1 }, { id: 'OH-', n: 2 }, { id: 'H2', n: 1, phase: 'g' }], deltaH: -414,
  observations: 'The calcium sinks and fizzes steadily, leaving a cloudy suspension of calcium hydroxide.' });

// --------------------------------------------------------- ignition work
R({ id: 'ethanol_combustion', name: 'Combustion of ethanol', type: 'combustion', priority: 8, needsIgnition: true,
  lhs: [{ id: 'C2H5OH', n: 1 }, { id: 'O2', n: 3 }],
  rhs: [{ id: 'CO2', n: 2, phase: 'g' }, { id: 'H2O', n: 3 }], deltaH: -1367,
  observations: 'The vapour burns with a clean blue flame, giving out a great deal of heat.' });

R({ id: 'methane_combustion', name: 'Combustion of methane', type: 'combustion', priority: 8, needsIgnition: true,
  lhs: [{ id: 'CH4', n: 1 }, { id: 'O2', n: 2 }],
  rhs: [{ id: 'CO2', n: 1, phase: 'g' }, { id: 'H2O', n: 2 }], deltaH: -890,
  observations: 'A bright flame with a loud ignition when mixed with air.' });

R({ id: 'mg_combustion', name: 'Burning magnesium', type: 'combustion', priority: 8, needsIgnition: true,
  lhs: [{ id: 'Mg', n: 2, phase: 's' }, { id: 'O2', n: 1 }],
  rhs: [{ id: 'MgO', n: 2, phase: 's' }], deltaH: -1204,
  observations: 'Brilliant white light and a white powder of magnesium oxide.',
  learningPoint: 'Do not look directly at burning magnesium - the ultraviolet light can damage your eyes.' });

R({ id: 'sulfur_combustion', name: 'Burning sulfur', type: 'combustion', priority: 8, needsIgnition: true,
  lhs: [{ id: 'S8', n: 1, phase: 's' }, { id: 'O2', n: 8 }],
  rhs: [{ id: 'SO2', n: 8, phase: 'g' }], deltaH: -2370,
  observations: 'A blue flame and the choking smell of sulfur dioxide.' });

R({ id: 'mg_sulfur', name: 'Magnesium + sulfur', type: 'combination', priority: 7, needsIgnition: true,
  lhs: [{ id: 'Mg', n: 1, phase: 's' }, { id: 'S8', n: 0.125, phase: 's' }],
  rhs: [{ id: 'MgS', n: 1, phase: 's' }], deltaH: -350,
  observations: 'A bright flash and a white solid of magnesium sulfide.', level: ['a', 'ug'] });

R({ id: 'fe_sulfur', name: 'Iron + sulfur', type: 'combination', priority: 6, conditions: { minTempC: 250 },
  lhs: [{ id: 'Fe', n: 1, phase: 's' }, { id: 'S8', n: 0.125, phase: 's' }],
  rhs: [{ id: 'FeS', n: 1, phase: 's' }], deltaH: -100,
  observations: 'The mixture glows red and continues to react without further heating - a strongly exothermic combination.',
  learningPoint: 'The product is a compound, not a mixture: it is not attracted by a magnet and does not react with dilute acid in the same way as iron.' });

R({ id: 'zn_sulfur', name: 'Zinc + sulfur', type: 'combination', priority: 6, conditions: { minTempC: 250 },
  lhs: [{ id: 'Zn', n: 1, phase: 's' }, { id: 'S8', n: 0.125, phase: 's' }],
  rhs: [{ id: 'ZnS', n: 1, phase: 's' }], deltaH: -200 });

R({ id: 'thermite', name: 'Thermite reaction', type: 'combination', priority: 9, needsIgnition: true,
  lhs: [{ id: 'Al', n: 2, phase: 's' }, { id: 'Fe2O3', n: 1, phase: 's' }],
  rhs: [{ id: 'Al2O3', n: 1, phase: 's' }, { id: 'Fe', n: 2 }], deltaH: -852,
  level: ['a', 'ug', 'research'],
  observations: 'An incandescent white glow and molten iron - aluminium is a powerful reducing agent at high temperature.' });

// --------------------------------------------------- thermal decomposition
R({ id: 'caco3_decomp', name: 'Thermal decomposition of calcium carbonate', type: 'decomposition', priority: 6,
  speed: 1e-3, q10: 2, surfaceFactor: true, conditions: { minTempC: 800 },
  lhs: [{ id: 'CaCO3', n: 1, phase: 's' }],
  rhs: [{ id: 'CaO', n: 1, phase: 's' }, { id: 'CO2', n: 1, phase: 'g' }], deltaH: 178,
  level: ['igcse', 'as', 'a', 'ug'],
  observations: 'The solid glows and carbon dioxide is given off; a bunsen flame alone will not decompose limestone.',
  learningPoint: 'Requires about 800 C - this is why a roaring bunsen flame and a crucible are used, and why it is endothermic.' });

R({ id: 'cuco3_decomp', name: 'Thermal decomposition of copper(II) carbonate', type: 'decomposition', priority: 6,
  speed: 4e-3, q10: 2, surfaceFactor: true, conditions: { minTempC: 200 },
  lhs: [{ id: 'CuCO3', n: 1, phase: 's' }],
  rhs: [{ id: 'CuO', n: 2, phase: 's' }, { id: 'CO2', n: 1, phase: 'g' }, { id: 'H2O', n: 1, phase: 'g' }], deltaH: 150,
  observations: 'The green powder turns black and carbon dioxide is released.',
  learningPoint: 'Green copper carbonate -> black copper oxide + carbon dioxide. The colour change is the evidence.' });

R({ id: 'nahco3_decomp', name: 'Thermal decomposition of sodium hydrogencarbonate', type: 'decomposition', priority: 6,
  speed: 6e-3, q10: 2, surfaceFactor: true, conditions: { minTempC: 80 },
  lhs: [{ id: 'NaHCO3', n: 2, phase: 's' }],
  rhs: [{ id: 'Na2CO3' , n: 1, phase: 's' }, { id: 'H2O', n: 1, phase: 'g' }, { id: 'CO2', n: 1, phase: 'g' }], deltaH: 129,
  observations: 'The solid decomposes readily on gentle heating giving off steam and carbon dioxide.' });

R({ id: 'mgco3_decomp', name: 'Thermal decomposition of magnesium carbonate', type: 'decomposition', priority: 6,
  speed: 2e-3, q10: 2, surfaceFactor: true, conditions: { minTempC: 350 },
  lhs: [{ id: 'MgCO3', n: 1, phase: 's' }],
  rhs: [{ id: 'MgO', n: 1, phase: 's' }, { id: 'CO2', n: 1, phase: 'g' }], deltaH: 118 });

R({ id: 'cuso4_hydrate_loss', name: 'Driving off water of crystallisation', type: 'decomposition', priority: 6,
  speed: 5e-3, q10: 2, surfaceFactor: true, conditions: { minTempC: 120 },
  lhs: [{ id: 'CuSO4.5H2O', n: 1, phase: 's' }],
  rhs: [{ id: 'CuSO4', n: 1, phase: 's' }, { id: 'H2O', n: 5, phase: 'g' }], deltaH: 300,
  observations: 'The blue crystals crumble to a white powder and steam is driven off.',
  learningPoint: 'Heating reverses the hydration: add water back and the blue colour returns. This is the test for water.' });

R({ id: 'cuso4_rehydrate', name: 'Anhydrous copper sulfate + water', type: 'hydrate', priority: 6,
  lhs: [{ id: 'CuSO4', n: 1, phase: 's' }, { id: 'H2O', n: 5 }],
  rhs: [{ id: 'CuSO4.5H2O', n: 1, phase: 's' }], deltaH: -300,
  observations: 'The white powder turns blue - a positive test for water.' });



// ------------------------------------------------- kinetics classics (slow)
R({ id: 'thiosulfate_acid', name: 'Thiosulfate + acid (rate experiment)', type: 'kinetics', priority: 4,
  speed: 5e-4, q10: 2,
  lhs: [{ id: 'S2O3^2-', n: 1 }, { id: 'H+', n: 2 }],
  rhs: [{ id: 'S', n: 1, phase: 's' }, { id: 'SO2', n: 1, phase: 'g' }, { id: 'H2O', n: 1 }], deltaH: -60,
  observations: 'A pale yellow cloud of sulfur slowly makes the solution opaque.',
  learningPoint: 'Time how long the cross under the flask takes to disappear. Rate = 1/time. Doubling the concentration of either reactant halves the time.' });

R({ id: 'sulfite_acid', name: 'Sulfite + acid', type: 'kinetics', priority: 4, speed: 5e-3, q10: 2,
  lhs: [{ id: 'SO3^2-', n: 1 }, { id: 'H+', n: 2 }],
  rhs: [{ id: 'SO2', n: 1, phase: 'g' }, { id: 'H2O', n: 1 }], deltaH: -40,
  observations: 'The choking smell of sulfur dioxide appears immediately - test with acidified dichromate paper.' });

R({ id: 'sulfide_acid', name: 'Sulfide + acid', type: 'kinetics', priority: 4, speed: 5e-3, q10: 2,
  lhs: [{ id: 'S2-', n: 1 }, { id: 'H+', n: 2 }],
  rhs: [{ id: 'H2S', n: 1, phase: 'g' }], deltaH: -20,
  observations: 'The unmistakable smell of rotten eggs - hydrogen sulfide is very toxic, work in the fume hood.' });

R({ id: 'ammonium_alkali', name: 'Ammonium salt + alkali (on warming)', type: 'kinetics', priority: 4,
  speed: 0.02, q10: 2.5, conditions: { minTempC: 35 },
  lhs: [{ id: 'NH4+', n: 1 }, { id: 'OH-', n: 1 }],
  rhs: [{ id: 'NH3', n: 1, phase: 'g' }, { id: 'H2O', n: 1 }], deltaH: 20,
  observations: 'Ammonia gas is driven off on warming - it turns damp red litmus blue.' });

R({ id: 'h2o2_decomp_mno2', name: 'Decomposition of hydrogen peroxide (MnO2 catalyst)', type: 'catalysis', priority: 4,
  speed: 1.2, q10: 2, conditions: { catalyst: 'MnO2' },
  lhs: [{ id: 'H2O2', n: 2 }], rhs: [{ id: 'H2O', n: 2 }, { id: 'O2', n: 1, phase: 'g' }], deltaH: -98,
  observations: 'A violent effervescence of oxygen - the black powder is unchanged at the end, so it is a catalyst.',
  learningPoint: 'Compare this with the same peroxide without the catalyst: far less oxygen is produced. Measure the gas volume over time to find the initial rate.' });

R({ id: 'h2o2_decomp_heat', name: 'Thermal decomposition of hydrogen peroxide', type: 'decomposition', priority: 3,
  speed: 0.02, q10: 2.5, conditions: { minTempC: 60 },
  lhs: [{ id: 'H2O2', n: 2 }], rhs: [{ id: 'H2O', n: 2 }, { id: 'O2', n: 1, phase: 'g' }], deltaH: -98 });

// -------------------------------------------------------- organic chemistry
R({ id: 'bromine_alkene', name: 'Bromine water + alkene', type: 'addition', priority: 7,
  lhs: [{ id: 'Br2', n: 1, phase: 'aq' }, { id: 'C6H12', n: 1, phase: 'org' }],
  rhs: [{ id: 'C6H12Br2', n: 1, phase: 'org' }], deltaH: -120, level: ['igcse', 'as', 'a', 'ug'],
  observations: 'The orange colour of bromine water is discharged instantly - the test for a C=C double bond.',
  learningPoint: 'Bromine adds across the double bond. Shake the tube so the two layers mix: the reaction happens at the interface.' });

R({ id: 'bromine_alkane_no_reaction', name: 'Bromine water + alkane (no reaction)', type: 'note', note: true, priority: 1,
  lhs: [{ id: 'Br2', n: 1, phase: 'aq' }, { id: 'C6H14', n: 1, phase: 'org' }],
  rhs: [{ id: 'Br2', n: 1 }, { id: 'C6H14', n: 1, phase: 'org' }], deltaH: 0,
  observations: 'The orange colour stays - an alkane does not decolourise bromine water without ultraviolet light.',
  level: ['igcse', 'as', 'a', 'ug'] });

R({ id: 'esterification', name: 'Esterification (ethanol + ethanoic acid)', type: 'condensation', priority: 5,
  speed: 8e-4, q10: 2.5, conditions: { minTempC: 60 }, requires: ['H+'],
  lhs: [{ id: 'CH3COOH', n: 1 }, { id: 'C2H5OH', n: 1 }],
  rhs: [{ id: 'C4H8O2', n: 1 }, { id: 'H2O', n: 1 }], deltaH: -3,
  level: ['a', 'ug', 'research'],
  observations: 'A sweet, fruity smell develops - ethyl ethanoate. The reaction is slow and reversible, so concentrated sulfuric acid is used as a catalyst.',
  learningPoint: 'Reflux the mixture and then distil the ester. Water is also a product, so removing it shifts the equilibrium (Le Chatelier).' });

R({ id: 'ethanol_dehydration', name: 'Dehydration of ethanol to ethene', type: 'elimination', priority: 5,
  speed: 2e-3, q10: 2.5, conditions: { minTempC: 170, catalyst: 'Al2O3' },
  lhs: [{ id: 'C2H5OH', n: 1 }], rhs: [{ id: 'C2H4', n: 1, phase: 'g' }, { id: 'H2O', n: 1, phase: 'g' }], deltaH: 45,
  level: ['a', 'ug'],
  observations: 'A gas is collected that decolourises bromine water - ethene from the elimination of water.' });

R({ id: 'saponification', name: 'Saponification of a fat/oil', type: 'hydrolysis', priority: 5,
  speed: 3e-4, q10: 2, conditions: { minTempC: 70 },
  lhs: [{ id: 'lipid', n: 1, phase: 'org' }, { id: 'OH-', n: 3 }],
  rhs: [{ id: 'C3H8O3', n: 1 }, { id: 'soap', n: 3 }], deltaH: -100,
  level: ['ug', 'research'],
  observations: 'The oil thickens and a white soap forms on the surface after the mixture is left to stand with brine.' });

R({ id: 'ethanol_oxidation_aldehyde', name: 'Oxidation of ethanol to ethanal', type: 'redox', priority: 5,
  speed: 1e-4, q10: 2,
  lhs: [{ id: 'C2H5OH', n: 1 }, { id: 'Cr2O7^2-', n: 1 }, { id: 'H+', n: 8 }],
  rhs: [{ id: 'CH3CHO', n: 1 }, { id: 'Cr3+', n: 2 }, { id: 'H2O', n: 7 }], deltaH: -150, level: ['a', 'ug'] });

// ------------------------------------------------- biology / biochemistry
R({ id: 'starch_iodine', name: 'Starch + iodine', type: 'test', priority: 8,
  lhs: [{ id: 'I2', n: 1 }, { id: 'starch', n: 1 }], rhs: [{ id: 'starch_I2', n: 1 }],
  equilibrium: { K: 5000 }, deltaH: 0,
  observations: 'An intense blue-black colour appears - the test for starch.',
  learningPoint: 'The iodine molecules slip into the coil of the amylose helix and give the characteristic colour.' });

R({ id: 'benedicts_reducing_sugar', name: "Benedict's test for reducing sugar", type: 'biochem', priority: 6,
  speed: 5e-4, q10: 2, conditions: { minTempC: 60 },
  lhs: [{ id: 'C6H12O6', n: 1 }, { id: 'CuCitrate', n: 2 }, { id: 'OH-', n: 5 }],
  rhs: [{ id: 'glucose_reduced', n: 1 }, { id: 'Cu2O', n: 1, phase: 's' }, { id: 'C6H5O7^3-', n: 2 }, { id: 'H2O', n: 3 }],
  deltaH: -150,
  observations: 'The blue solution turns green, then yellow, then a brick-red precipitate of copper(I) oxide.',
  learningPoint: 'Reducing sugars reduce the blue copper(II) ions. The colour depends on the concentration of sugar, so this is semi-quantitative.' });

R({ id: 'benedicts_sucrose', name: "Benedict's test with sucrose (no reducing sugar)", type: 'note', note: true, priority: 1,
  lhs: [{ id: 'C12H22O11', n: 1 }, { id: 'CuCitrate', n: 1 }], rhs: [{ id: 'C12H22O11', n: 1 }, { id: 'CuCitrate', n: 1 }],
  observations: "Benedict's solution stays blue - sucrose is not a reducing sugar. Boil it with acid first to hydrolyse it, then neutralise and repeat the test.",
  learningPoint: 'Hydrolysis of sucrose gives glucose and fructose, both reducing sugars.' });

R({ id: 'biuret_test', name: 'Biuret test for protein', type: 'biochem', priority: 6,
  lhs: [{ id: 'protein', n: 1 }, { id: 'Cu2+', n: 1 }, { id: 'OH-', n: 4 }],
  rhs: [{ id: 'protein_Cu', n: 1 }], deltaH: -20,
  observations: 'The solution turns purple - a positive test for peptide bonds.',
  learningPoint: 'Copper(II) ions form a violet complex with the nitrogen atoms of peptide bonds.' });

R({ id: 'amylase_starch', name: 'Amylase digests starch', type: 'enzyme', priority: 6,
  speed: 5e-3, q10: 2, enzyme: { optC: 40, width: 14, denatureC: 60 },
  lhs: [{ id: 'starch', n: 1 }, { id: 'amylase', n: 0.0001 }],
  rhs: [{ id: 'C12H22O11m', n: 1 }, { id: 'amylase', n: 0.0001 }], deltaH: -10,
  observations: 'The starch is broken down to maltose - test with iodine at intervals to follow the reaction.',
  learningPoint: 'Enzymes are specific and are denatured above about 60 C. At low temperature the rate falls because molecules have less kinetic energy.' });

R({ id: 'catalase_peroxide', name: 'Catalase breaks down hydrogen peroxide', type: 'enzyme', priority: 6,
  speed: 40, q10: 2, enzyme: { optC: 35, width: 15, denatureC: 55 },
  lhs: [{ id: 'H2O2', n: 2 }, { id: 'catalase', n: 1e-6 }],
  rhs: [{ id: 'H2O', n: 2 }, { id: 'O2', n: 1, phase: 'g' }, { id: 'catalase', n: 1e-6 }], deltaH: -98,
  observations: 'An immediate froth of oxygen bubbles - a very fast enzyme-catalysed reaction.',
  learningPoint: 'Boil the tissue first and the rate collapses: the enzyme has been denatured.' });

R({ id: 'yeast_fermentation', name: 'Fermentation by yeast', type: 'enzyme', priority: 5,
  speed: 2e-4, q10: 2, enzyme: { optC: 35, width: 10, denatureC: 50 }, requires: ['yeast'],
  lhs: [{ id: 'C6H12O6', n: 1 }],
  rhs: [{ id: 'C2H5OH', n: 2 }, { id: 'CO2', n: 2, phase: 'g' }], deltaH: -70,
  observations: 'Steady bubbling of carbon dioxide in the anaerobic fermentation tube; the liquid starts to smell of ethanol.' });

R({ id: 'anaerobic_respiration', name: 'Anaerobic respiration in yeast', type: 'enzyme', priority: 4,
  speed: 1e-4, q10: 2, enzyme: { optC: 37, width: 10, denatureC: 50 }, requires: ['yeast'],
  lhs: [{ id: 'C6H12O6', n: 1 }],
  rhs: [{ id: 'C2H5OH', n: 2 }, { id: 'CO2', n: 2, phase: 'g' }], deltaH: -70, level: ['igcse', 'as', 'a'] });

R({ id: 'aerobic_respiration', name: 'Aerobic respiration', type: 'enzyme', priority: 4,
  speed: 1e-3, q10: 2, enzyme: { optC: 37, width: 12, denatureC: 55 }, conditions: { catalyst: 'respiring_tissue' },
  lhs: [{ id: 'C6H12O6', n: 1 }, { id: 'O2', n: 6 }],
  rhs: [{ id: 'CO2', n: 6, phase: 'g' }, { id: 'H2O', n: 6 }], deltaH: -2800,
  observations: 'Oxygen is taken up and carbon dioxide released; the respirometer will show a pressure change.',
  learningPoint: 'Compare the gas volumes: aerobic respiration uses six times as much oxygen as the carbon dioxide it releases.' });

R({ id: 'photosynthesis', name: 'Photosynthesis', type: 'biochem', priority: 4,
  speed: 1e-4, q10: 2, needsLight: true, conditions: { catalyst: 'chlorophyll' },
  lhs: [{ id: 'CO2', n: 6 }, { id: 'H2O', n: 6 }],
  rhs: [{ id: 'C6H12O6', n: 1 }, { id: 'O2', n: 6, phase: 'g' }], deltaH: 2800,
  observations: 'Bubbles of oxygen collect in the tube above the pondweed while the lamp is on.',
  learningPoint: 'Light is required. Move the lamp further away and the rate of bubbling falls: light intensity is the limiting factor.' });

R({ id: 'dcpip_vitamin_c', name: 'DCPIP + vitamin C', type: 'biochem', priority: 6,
  lhs: [{ id: 'C6H8O6', n: 1 }, { id: 'dcpip_ox', n: 1 }],
  rhs: [{ id: 'C6H6O6', n: 1 }, { id: 'dcpip_red', n: 1 }],
  observations: 'The blue DCPIP is decolourised - vitamin C is a reducing agent.',
  learningPoint: 'Time how long the blue colour takes to disappear for different fruit juices and compare their vitamin C content.' });
