// ---------------------------------------------------------------------------
// ELECTROLYSIS
// ---------------------------------------------------------------------------
// Predicts the products at each electrode from the ions present, the electrode
// material and whether the electrolyte is aqueous or molten.  The rules follow
// the standard IGCSE/AS selectivity order:
//
//   cathode:  (most easily reduced first)
//     Ag+ > Cu2+ > Pb2+ > Fe2+ > Zn2+ > H+ (from water) > Na+ / K+ / Ca2+ / Mg2+ / Al3+
//   anode (inert, e.g. carbon/platinum), aqueous:
//     I- > Br- > Cl- > water -> O2
//   anode (reactive metal, e.g. copper): the metal dissolves.
//
// Products are written into the mixture as real species so the ordinary
// reaction engine (and the colour model) then deals with them.
// ---------------------------------------------------------------------------

import { SPECIES, getSpecies } from './species.js';
import { clamp } from './util.js';

/** Reduction order at the cathode (higher = discharged in preference to H+). */
const CATHODE_ORDER = ['Ag+', 'Cu2+', 'Hg2+', 'Fe3+', 'Pb2+', 'Sn2+', 'Fe2+', 'Zn2+', 'H+', 'Al3+', 'Mg2+', 'Ca2+', 'Na+', 'K+', 'Li+'];
/** Oxidation order at the anode for inert electrodes (higher = discharged first). */
const ANODE_ORDER = ['I-', 'Br-', 'Cl-', 'OH-', 'SO4^2-', 'NO3-', 'F-'];
/** Metals that dissolve as ions at the anode before water is oxidised. */
const REACTIVE_ANODE = {
  Cu: { ion: 'Cu2+', charge: 2, potential: 1.1, label: 'copper' },
  Ag: { ion: 'Ag+', charge: 1, potential: 0.8, label: 'silver' },
  Zn: { ion: 'Zn2+', charge: 2, potential: 1.2, label: 'zinc' },
  Fe: { ion: 'Fe2+', charge: 2, potential: 1.4, label: 'iron' },
  Ni: { ion: 'Ni2+', charge: 2, potential: 1.3, label: 'nickel' },
  Pb: { ion: 'Pb2+', charge: 2, potential: 1.2, label: 'lead' },
  Sn: { ion: 'Sn2+', charge: 2, potential: 1.2, label: 'tin' }
};
/** Electrode materials can be named symbolically ('Cu') or by name ('copper'). */
const METAL_ALIAS = {
  cu: 'Cu', copper: 'Cu', ag: 'Ag', silver: 'Ag', zn: 'Zn', zinc: 'Zn',
  fe: 'Fe', iron: 'Fe', ni: 'Ni', nickel: 'Ni', pb: 'Pb', lead: 'Pb',
  sn: 'Sn', tin: 'Sn'
};
export function electrodeMetal(material) {
  if (!material) return null;
  return METAL_ALIAS[String(material).toLowerCase()] || (REACTIVE_ANODE[material] ? material : null);
}
/** Elements that stay in solution no matter what (spectator ions). */
const SPECTATOR = new Set(['Na+', 'K+', 'Li+', 'Ca2+', 'Mg2+', 'Al3+', 'SO4^2-', 'NO3-', 'F-']);

export const ELECTROLYSIS_REGIMES = {
  aqueous: 'aqueous solution',
  molten: 'molten (liquid) electrolyte',
  dilute: 'dilute aqueous solution',
  concentrated: 'concentrated aqueous solution'
};

/** Conduction: ions must be mobile, so there must be an aqueous phase or a melt. */
export function isConductive(mixture) {
  if (!mixture) return false;
  const ions = [...mixture.aqueous.keys()].filter((id) => (getSpecies(id).charge || 0) !== 0);
  const ionicMoles = ions.reduce((a, id) => a + mixture.aqueous.get(id), 0);
  if (mixture.aqVolume > 0.5 && ionicMoles > 1e-6) return true;
  if (mixture.molten) return true;
  return false;
}

export function conductivityRank(mixture) {
  if (!isConductive(mixture)) return 0;
  const ions = [...mixture.aqueous.keys()].filter((id) => (getSpecies(id).charge || 0) !== 0);
  const c = ions.reduce((a, id) => a + mixture.aqueous.get(id), 0) / Math.max(mixture.aqVolume / 1000, 1e-6);
  if (mixture.molten) return 2;
  if (c > 0.5) return 1.4;
  if (c > 0.05) return 1.0;
  if (c > 0.005) return 0.6;
  return 0.25;
}

function present(mixture, id) {
  return (mixture.aqueous.get(id) || 0) > 1e-9;
}
function rank(list, id) {
  const i = list.indexOf(id);
  return i < 0 ? -1 : list.length - i;
}

/**
 * Decide what happens at each electrode.
 * @param {object} opts {electrolyte:{mixture}, anode, cathode, voltageV, inertAnode}
 * @returns {{ok, cathode:{formula, species, molesPerFaraday, halfEquation}, anode:{...}, notes:[], eCellV}}
 */
export function predictElectrolysis({ mixture, anode = 'carbon', cathode = 'carbon', voltageV = 6 } = {}) {
  const notes = [];
  if (!mixture) return { ok: false, reason: 'No electrolyte.' };
  if (!isConductive(mixture)) {
    return {
      ok: false,
      reason: 'The electrolyte does not conduct. Use an aqueous solution of an ionic compound (or a molten salt); solid salts and pure water do not conduct.',
      notes
    };
  }
  const anodeMetal = electrodeMetal(anode);
  const inertAnode = !anodeMetal;
  const cations = [...mixture.aqueous.keys()]
    .filter((id) => (getSpecies(id).charge || 0) > 0 && !SPECTATOR.has(id))
    .sort((a, b) => rank(CATHODE_ORDER, b) - rank(CATHODE_ORDER, a));
  const anions = [...mixture.aqueous.keys()]
    .filter((id) => (getSpecies(id).charge || 0) < 0)
    .sort((a, b) => rank(ANODE_ORDER, b) - rank(ANODE_ORDER, a));

  // ------------------------------------------------------------- cathode
  let cathodeResult;
  const waterAvailable = mixture.aqVolume > 0.5;
  const best = cations.find((id) => present(mixture, id));
  if (best && rank(CATHODE_ORDER, best) > rank(CATHODE_ORDER, 'H+')) {
    const sp = getSpecies(best);
    const z = Math.abs(sp.charge || 1);
    const metal = metalFromIon(best);
    const electrons = z === 1 ? 'e-' : `${z}e-`;
    cathodeResult = {
      species: best,
      formula: sp.name || sp.formula,
      halfEquation: `${sp.formula} + ${electrons} -> ${metal}`,
      product: metal,
      molesPerFaraday: 1 / z
    };
    notes.push(`${sp.formula} ions are discharged in preference to hydrogen because ${metalFromIon(best)} is below hydrogen in the electrochemical series.`);
  } else if (waterAvailable && best !== 'H+' && !best) {
    cathodeResult = {
      species: 'H2',
      formula: 'hydrogen',
      halfEquation: '2H2O + 2e- -> H2 + 2OH-',
      product: 'H2',
      molesPerFaraday: 0.5
    };
    notes.push('The only cations are very reactive (Na+, K+, Mg2+, Al3+...), so hydrogen is produced from water instead.');
  } else {
    cathodeResult = {
      species: 'H2',
      formula: 'hydrogen',
      halfEquation: '2H+ + 2e- -> H2',
      product: 'H2',
      molesPerFaraday: 0.5
    };
    if (best === 'H+') notes.push('Hydrogen ions are discharged at the cathode to give hydrogen gas.');
    else notes.push('Hydrogen is released from the water because the metal ions present are too reactive to be reduced in aqueous solution.');
  }

  // --------------------------------------------------------------- anode
  let anodeResult;
  const reactive = anodeMetal ? REACTIVE_ANODE[anodeMetal] : null;
  if (!inertAnode && reactive) {
    anodeResult = {
      species: reactive.ion,
      formula: `${reactive.label} ions`,
      halfEquation: `${anode} -> ${anode}2+ + 2e-  (${reactive.label} anode dissolves)`.
        replace(`${anode}2+`, reactive.ion),
      product: reactive.ion,
      molesPerFaraday: 0.5,
      dissolves: true
    };
    notes.push(`The ${reactive.label} anode is not inert: it dissolves as ${reactive.ion} instead of oxidising the solution.`);
  } else {
    const an = anions.find((id) => present(mixture, id) && halidePreferred(mixture, id));
    if (an) {
      const sp = getSpecies(an);
      const molesPerFaraday = 0.5 / Math.abs(sp.charge || 1);
      const isHydroxide = an === 'OH-';
      anodeResult = {
        species: an,
        formula: sp.name || sp.formula,
        halfEquation: isHydroxide
          ? '4OH- -> O2 + 2H2O + 4e-'
          : `2${sp.formula} -> ${elementOf(sp.formula)}2 + 2e-`,
        product: elementOf(sp.formula),
        molesPerFaraday: isHydroxide ? 0.25 : molesPerFaraday,
        atAnode: an
      };
      if (isHydroxide) {
        notes.push('Hydroxide ions from the water are oxidised, so oxygen is evolved at the anode.');
      } else {
        notes.push(`${sp.formula} is oxidised in preference to water, so ${elementOf(sp.formula)} is evolved at the anode.`);
      }
    } else {
      anodeResult = {
        species: 'O2',
        formula: 'oxygen',
        halfEquation: '2H2O -> O2 + 4H+ + 4e-',
        product: 'O2',
        molesPerFaraday: 0.25
      };
      notes.push('No halide ions are present, so oxygen is produced from the water (the solution becomes acidic).');
    }
  }
  if (voltageV < 1.2 && !anodeResult.dissolves) notes.push('Below about 1.2 V the electrolysis of aqueous solutions is very slow.');

  return { ok: true, cathode: cathodeResult, anode: anodeResult, notes, inertAnode, regime: mixture.molten ? 'molten' : 'aqueous' };
}

/** Iodide is always discharged; chloride and bromide need a reasonable concentration. */
function halidePreferred(mixture, id) {
  if (id === 'I-') return true;
  if (id === 'OH-') return true;
  if (id === 'Cl-' || id === 'Br-') {
    const conc = (mixture.aqueous.get(id) || 0) / Math.max(mixture.aqVolume / 1000, 1e-6);
    return conc >= 0.35;   // dilute halide solutions lose to water
  }
  return false;
}

function chargeText(c) {
  const n = Math.abs(c || 0);
  return `${n === 1 ? '+' : n + '+'}`;
}
function elementOf(formula) {
  const m = String(formula).match(/^([A-Z][a-z]?)/);
  return m ? m[1] : 'X';
}
function metalFromIon(ion) {
  const m = String(ion).match(/^([A-Z][a-z]?)/);
  return m ? m[1] : ion;
}

/**
 * Apply `chargeCoulombs` of charge through the cell to a mixture.
 * Faraday = 96485 C per mole of electrons.
 * @returns {{events:Array, molesElectrons:number, cathode:number, anode:number}}
 */
export function electrolyse({ mixture, anode, cathode, chargeCoulombs, efficiency = 0.95, faraday = 96485 }) {
  const prediction = predictElectrolysis({ mixture, anode, cathode });
  if (!prediction.ok) return { events: [], molesElectrons: 0, prediction };
  const n = (chargeCoulombs * clamp(efficiency, 0, 1)) / faraday;
  const events = [];

  // ---- cathode: reduce
  const c = prediction.cathode;
  if (c.product === 'H2') {
    const moles = n * 0.5;
    mixture.addGas('H2', moles);
    // water is consumed and hydroxide left behind -> the solution becomes alkaline
    consumeWater(mixture, moles);
    mixture.addAqueous('OH-', n);
    events.push({ electrode: 'cathode', species: 'H2', moles, text: 'Hydrogen gas bubbles steadily from the cathode.' });
  } else {
    const metal = c.product;
    const moles = n * (c.molesPerFaraday || 1);
    mixture.aqueous.set(c.species, Math.max(0, (mixture.aqueous.get(c.species) || 0) - moles));
    mixture.addSolidSpecies(metal, moles * getSpecies(metal).molarMass, { particle: 'deposit' });
    events.push({ electrode: 'cathode', species: metal, moles, text: `${getSpecies(metal).name} is deposited as a pink/grey coating on the cathode.` });
  }

  // ---- anode: oxidise
  const a = prediction.anode;
  if (a.dissolves) {
    const moles = n * 0.5;
    mixture.addAqueous(a.species, moles);
    if (mixture.solids.has(anode)) mixture.solids.set(anode, Math.max(0, mixture.solids.get(anode) - moles * getSpecies(anode).molarMass));
    events.push({ electrode: 'anode', species: a.species, moles, text: `The ${anode} anode gradually dissolves.` });
  } else if (a.product === 'O2') {
    const moles = n * 0.25;
    mixture.addGas('O2', moles);
    consumeWater(mixture, moles * 2);
    mixture.addAqueous('H+', n);
    events.push({ electrode: 'anode', species: 'O2', moles, text: 'Oxygen gas is produced at the anode (this is usually a slower, smaller stream).' });
  } else {
    const moles = n * (a.molesPerFaraday || 0.5);
    const gas = a.product;
    if (SPECIES[gas]) mixture.addGas(gas, moles);
    mixture.aqueous.set(a.species, Math.max(0, (mixture.aqueous.get(a.species) || 0) - moles * Math.abs(getSpecies(a.species).charge || 1)));
    events.push({ electrode: 'anode', species: gas, moles, text: `${getSpecies(gas)?.name || gas} is evolved at the anode.` });
  }
  return { events, molesElectrons: n, prediction };
}

function consumeWater(mixture, moles) {
  const water = mixture.aqueous.get('H2O') || 0;
  const removed = Math.min(water, moles);
  if (removed > 0) {
    mixture.aqueous.set('H2O', water - removed);
    // 1 mol of water is 18.015 cm3, so the aqueous volume falls with it
    mixture.aqVolume = Math.max(0, mixture.aqVolume - removed * 18.015);
  }
}

/** Charge from a steady current for a time. */
export function chargeFrom(currentA, seconds) { return Math.max(0, currentA) * Math.max(0, seconds); }
/** Moles of electrons for a charge. */
export function molesOfElectrons(chargeCoulombs, faraday = 96485) { return chargeCoulombs / faraday; }
/** Mass deposited by a given charge: m = (Q/F) x (M/z). */
export function massDeposited({ currentA, seconds, molarMass, charge, faraday = 96485 }) {
  return (currentA * seconds / faraday) * (molarMass / Math.abs(charge || 1));
}
