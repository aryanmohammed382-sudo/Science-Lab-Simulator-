// ---------------------------------------------------------------------------
// MIXTURE - the contents of one container.
// ---------------------------------------------------------------------------
// A mixture tracks three phases:
//   aqueous  Map(speciesId -> mol)   ions and dissolved molecules in water
//   organic  Map(speciesId -> mol)   one combined non-polar layer
//   solids   Map(speciesId -> g)     undissolved solid (crystals, precipitates)
// plus a head-space gas phase Map(speciesId -> mol).
//
// Volume is tracked explicitly (mL) because every measurement in the lab is
// volumetric; the amount of material is tracked in moles so that the reaction
// engine can do real stoichiometry.
// ---------------------------------------------------------------------------

import { SPECIES, getSpecies } from './species.js';
import { SUBSTANCES } from './substances.js';
import { combineColours, clamp, hexToRgb, rgbToHex, mixRgb, round } from './util.js';

export const AMBIENT_C = 20;
const WATER_MOLAR_MASS = 18.015;
/** Scales (mol/L) into an optical density for colour blending. */
const OD_SCALE = 2.5;

export class Mixture {
  constructor({ capacity = 250, temperature = AMBIENT_C } = {}) {
    this.capacity = capacity;
    this.aqueous = new Map();
    this.organic = new Map();
    this.solids = new Map();
    this.gas = new Map();
    /** speciesId -> { particle, specificSurface } for rate-of-reaction work */
    this.solidMeta = new Map();
    this.aqVolume = 0;
    this.orgVolume = 0;
    this.temperature = temperature;
    this.reactionLog = [];
    /** free-form observations for the current contents (set by reactions) */
    this.observations = [];
    this.spilled = 0;
  }

  // ------------------------------------------------------------- quantities
  get volume() { return this.aqVolume + this.orgVolume; }
  get headroom() { return Math.max(0, this.capacity - this.volume); }
  get isFull() { return this.volume >= this.capacity - 1e-9; }
  /** Number of visible liquid layers (aqueous and/or organic). */
  get phaseCount() { return (this.aqVolume > 0.01 ? 1 : 0) + (this.orgVolume > 0.01 ? 1 : 0); }

  /** Total mass of the contents in grams. */
  get mass() {
    let m = 0;
    for (const [id, mol] of this.aqueous) m += mol * getSpecies(id).molarMass;
    for (const [id, mol] of this.organic) m += mol * getSpecies(id).molarMass;
    for (const [, g] of this.solids) m += g;
    // Aqueous volume that is pure water is already counted through H2O moles.
    return m;
  }
  /** Heat capacity of the contents, J/K. */
  get heatCapacity() {
    let c = 0;
    for (const [id, mol] of this.aqueous) c += mol * (getSpecies(id).cp ?? 90);
    for (const [id, mol] of this.organic) c += mol * (getSpecies(id).cp ?? 130);
    for (const [, g] of this.solids) c += g * 0.8;
    return Math.max(c, 4); // a nearly empty container still holds a little
  }
  get soluteMass() {
    let m = 0;
    for (const [id, mol] of this.aqueous) { const s = getSpecies(id); if (id !== 'H2O') m += mol * s.molarMass; }
    for (const [id, mol] of this.organic) m += mol * getSpecies(id).molarMass;
    return m + this.solidMass;
  }
  get solidMass() { let m = 0; for (const [, g] of this.solids) m += g; return m; }
  get precipitateMass() {
    let m = 0;
    for (const [id, g] of this.solids) if (getSpecies(id).kind === 'solid' && getSpecies(id).solubility < 0.5) m += g;
    return m;
  }
  get gasMoles() { let m = 0; for (const [, mol] of this.gas) m += mol; return m; }

  molesOf(id) {
    if (this.aqueous.has(id)) return this.aqueous.get(id);
    if (this.organic.has(id)) return this.organic.get(id);
    if (this.solids.has(id)) return this.solids.get(id) / getSpecies(id).molarMass;
    if (this.gas.has(id)) return this.gas.get(id);
    return 0;
  }
  /** Concentration of a species in the aqueous phase, mol/dm3. */
  concentrationOf(id) {
    const V = Math.max(this.aqVolume, 1e-6) / 1000;
    return this.aqueous.get(id) / V || 0;
  }
  /** Mass of a species present as undissolved solid, g. */
  solidMassOf(id) { return this.solids.get(id) || 0; }
  massOfSpecies(id) {
    const sp = getSpecies(id);
    return this.aqueous.get(id) * sp.molarMass + this.organic.get(id) * sp.molarMass + (this.solids.get(id) || 0);
  }
  has(id) { return this.molesOf(id) > 1e-12; }
  isEmpty() {
    return this.volume < 0.001 && this.solids.size === 0 && this.gas.size === 0
      && this.aqueous.size === 0 && this.organic.size === 0;
  }

  // ----------------------------------------------------------------- adding
  addAqueous(id, mol) {
    if (mol <= 0) return;
    this.aqueous.set(id, (this.aqueous.get(id) || 0) + mol);
  }
  addOrganic(id, mol) {
    if (mol <= 0) return;
    this.organic.set(id, (this.organic.get(id) || 0) + mol);
  }
  addSolidSpecies(id, grams, meta = null) {
    if (grams <= 0) return;
    this.solids.set(id, (this.solids.get(id) || 0) + grams);
    if (meta) {
      const prev = this.solidMeta.get(id);
      this.solidMeta.set(id, {
        particle: meta.particle || prev?.particle || 'granule',
        // the coarsest form present controls the effective surface area
        specificSurface: Math.min(prev?.specificSurface ?? Infinity, meta.specificSurface ?? 1)
      });
    }
  }
  addGas(id, mol) {
    if (mol <= 0) return;
    this.gas.set(id, (this.gas.get(id) || 0) + mol);
  }
  /** Add pure water (or another solvent) by volume. */
  addSolvent(id, mL) {
    if (mL <= 0) return;
    const sp = getSpecies(id);
    const mol = (mL * (sp.density ?? 1)) / sp.molarMass;
    if (sp.miscible === false) { this.addOrganic(id, mol); this.orgVolume += mL; }
    else { this.addAqueous(id, mol); this.aqVolume += mL; }
  }

  /**
   * Add a reagent from the shelf.
   * @param {string} substanceId
   * @param {{massG?:number, volumeML?:number}} amount
   */
  addSubstance(substanceId, amount = {}) {
    const sub = SUBSTANCES[substanceId];
    if (!sub) return { error: `Unknown substance ${substanceId}` };
    const result = { substance: sub, dissolved: 0, undissolved: 0, volumeAdded: 0, events: [] };

    if (sub.type === 'gas') {
      const mol = amount.mol ?? ((amount.volumeML ?? 100) / 24000);
      this.addGas(sub.dissolveTo[0].id, mol);
      result.gasAdded = mol;
      return result;
    }

    const isLiquidLike = sub.type === 'solution' || sub.type === 'liquid' || sub.type === 'suspension';
    if (isLiquidLike) {
      const mL = amount.volumeML ?? 10;
      const density = sub.density ?? 1;
      let mol = amount.mol;
      if (mol === undefined) {
        mol = sub.concentration ? (sub.concentration * mL) / 1000 : (mL * density) / (sub.molarMass || 100);
      }
      const solventId = sub.category === 'organic' ? (sub.solvent || sub.dissolveTo?.[0]?.id) : 'H2O';
      const solventIsOrganic = sub.category === 'organic' || sub.category === 'solvent';
      // solvent volume first so the solutes have somewhere to live
      if (solventIsOrganic) {
        for (const d of sub.dissolveTo || []) this.addOrganic(d.id, d.n * mol);
        this.orgVolume += mL;
      } else {
        const waterVol = amount.waterVolume ?? mL * 0.98;
        this.addSolvent('H2O', Math.max(waterVol, 0));
        for (const d of sub.dissolveTo || []) this.addAqueous(d.id, d.n * mol);
        // the dissolved material occupies the rest of the measured volume
        this.aqVolume += Math.max(0, mL - waterVol);
      }
      result.volumeAdded = mL;
      result.mol = mol;
      return result;
    }

    // ------------------------------------------------------------- solids
    const grams = amount.massG ?? 1;
    const mm = sub.molarMass ?? getSpecies(sub.solidForm).molarMass;
    const totalMol = grams / mm;
    const canDissolve = sub.dissolveTo && sub.dissolveTo.length > 0;
    const solidId = sub.solidForm || (canDissolve ? sub.dissolveTo[0].id : 'unknown_solid');
    if (!canDissolve) {
      this.addSolidSpecies(solidId, grams, { particle: sub.particle, specificSurface: sub.specificSurface });
      result.undissolved = grams;
      return result;
    }
    // solubility limit (g per 100 mL of aqueous phase)
    const solubility = sub.solubility ?? getSpecies(solidId).solubility ?? 100;
    if (this.aqVolume <= 0.01) {
      this.addSolidSpecies(solidId, grams);
      result.undissolved = grams;
      return result;
    }
    const maxG = (solubility * this.aqVolume) / 100;
    const alreadySolid = this.solids.get(solidId) || 0;
    const spareG = Math.max(0, maxG - alreadySolid);
    const dissolveG = Math.min(grams, spareG);
    const dissolveMol = dissolveG / mm;
    for (const d of sub.dissolveTo) this.addAqueous(d.id, d.n * dissolveMol);
    if (grams - dissolveG > 1e-9) {
      this.addSolidSpecies(solidId, grams - dissolveG, { particle: sub.particle, specificSurface: sub.specificSurface });
    }
    result.dissolved = dissolveG;
    result.undissolved = grams - dissolveG;
    result.saturated = spareG < grams - 1e-9;
    return result;
  }

  // --------------------------------------------------- dissolution balance
  /**
   * Bring every soluble solid and every dissolved salt into equilibrium with
   * the water that is present.  This is what makes "add the crystals to the
   * water and stir" work, and it also crystallises a solution that has been
   * evaporated past saturation.
   *
   * @returns {{dissolved:Array, crystallised:Array}}
   */
  dissolveSolids() {
    const dissolved = [], crystallised = [];
    if (this.aqVolume <= 0.01) return { dissolved, crystallised };
    for (const sub of Object.values(SUBSTANCES)) {
      const diss = sub.dissolveTo;
      if (!diss || !diss.length) continue;
      const solidId = sub.solidForm || diss[0].id;
      const mm = sub.molarMass ?? getSpecies(solidId).molarMass ?? 100;
      if (!mm || !isFinite(mm)) continue;
      const solubility = sub.solubility ?? getSpecies(solidId).solubility ?? 0;
      const limitMol = (solubility * this.aqVolume) / 100 / mm;   // mol the water can hold
      const presentSolid = this.solids.get(solidId) || 0;
      // how much of this formula unit the dissolved ions amount to
      let effectiveMol = Infinity;
      for (const d of diss) effectiveMol = Math.min(effectiveMol, (this.aqueous.get(d.id) || 0) / d.n);
      if (!isFinite(effectiveMol)) effectiveMol = 0;
      if (solubility <= 0.002) {
        // effectively insoluble: any solid stays solid, ions are not created
        continue;
      }
      if (presentSolid > 1e-9) {
        // ---- dissolve what the water can still take
        const canTakeMol = Math.max(0, limitMol - effectiveMol);
        const gramsToDissolve = Math.min(presentSolid, canTakeMol * mm);
        if (gramsToDissolve > 1e-9) {
          for (const d of diss) this.addAqueous(d.id, (gramsToDissolve / mm) * d.n);
          const left = presentSolid - gramsToDissolve;
          if (left <= 1e-9) this.solids.delete(solidId); else this.solids.set(solidId, left);
          dissolved.push({ solidId, substanceId: sub.id, grams: gramsToDissolve });
        }
      } else if (effectiveMol > limitMol * 1.0001) {
        // ---- crystallise the excess, e.g. after evaporating the water
        const excessMol = effectiveMol - limitMol;
        for (const d of diss) {
          const next = (this.aqueous.get(d.id) || 0) - excessMol * d.n;
          if (next <= 1e-12) this.aqueous.delete(d.id); else this.aqueous.set(d.id, next);
        }
        this.addSolidSpecies(solidId, excessMol * mm, { particle: 'crystal' });
        crystallised.push({ solidId, substanceId: sub.id, grams: excessMol * mm });
      }
    }
    return { dissolved, crystallised };
  }

  // -------------------------------------------------------------- removing
  /**
   * Take a portion of a liquid phase out (pouring / pipetting / dispensing).
   * @returns {{volume:number, aqueous:Map, organic:Map, temperature:number}}
   */
  drawVolume(mL, phase = 'aqueous') {
    const out = { volume: 0, aqueous: new Map(), organic: new Map(), temperature: this.temperature, solids: new Map() };
    if (mL <= 0) return out;
    if (phase === 'organic' && this.orgVolume > 0) {
      // take `mL` when there is enough, otherwise everything that is there
      const taken = Math.min(mL, this.orgVolume);
      const f = taken / this.orgVolume;
      for (const [id, mol] of this.organic) out.organic.set(id, mol * f);
      for (const [id, mol] of this.organic) this.organic.set(id, mol * (1 - f));
      this.orgVolume -= taken;
      out.volume = taken;
      clean(this.organic);
    } else if (this.aqVolume > 0) {
      const taken = Math.min(mL, this.aqVolume);
      const f = taken / this.aqVolume;
      for (const [id, mol] of this.aqueous) out.aqueous.set(id, mol * f);
      for (const [id, mol] of this.aqueous) this.aqueous.set(id, mol * (1 - f));
      this.aqVolume -= taken;
      out.volume = taken;
      // fine suspended precipitate can be carried over when decanting slowly
      for (const [id, g] of this.solids) {
        const sp = getSpecies(id);
        if (sp.solubility > 0.05) continue; // settled solids stay behind
        out.solids.set(id, g * f * 0.15);
        this.solids.set(id, g * (1 - f * 0.15));
      }
      clean(this.aqueous);
    }
    return out;
  }

  /** Remove everything (emptying / resetting a container). */
  clear() {
    const snapshot = this.snapshot();
    this.aqueous = new Map(); this.organic = new Map(); this.solids = new Map();
    this.gas = new Map(); this.solidMeta = new Map();
    this.aqVolume = 0; this.orgVolume = 0; this.observations = [];
    return snapshot;
  }

  /** Proportionally remove a fraction of the water (evaporation / boiling). */
  evaporate(mL) {
    if (this.aqVolume <= 0 || mL <= 0) return 0;
    const f = Math.min(1, mL / this.aqVolume);
    this.aqVolume -= mL * f;
    for (const [id, mol] of this.aqueous) this.aqueous.set(id, mol * (1 - f));
    clean(this.aqueous);
    return mL * f;
  }

  /** Move dissolved gas in/out of solution toward saturation. */
  equilibrateGas() {
    const V = Math.max(this.aqVolume, 1e-6) / 1000;
    for (const [id, mol] of [...this.gas]) {
      const sp = getSpecies(id);
      const sol = sp.solubility ?? 0;
      if (sol > 0 && this.aqVolume > 0.1) {
        const satMolL = (sol / Math.max(sp.molarMass, 1)) * 10; // g/100mL -> mol/L
        const target = Math.min(satMolL * V, mol + (this.aqueous.get(id) || 0));
        const dissolvedNow = this.aqueous.get(id) || 0;
        const move = target - dissolvedNow;
        if (move > 0) { this.addAqueous(id, move); this.gas.set(id, Math.max(0, mol - move)); }
      }
      // volatile solutes leave solution
      const dissolved = this.aqueous.get(id);
      if (dissolved && sol > 0) {
        const satMolL = (sol / Math.max(sp.molarMass, 1)) * 10;
        if (dissolved / V > satMolL * 1.2) {
          const excess = dissolved - satMolL * 1.2 * V;
          this.addGas(id, excess);
          this.aqueous.set(id, dissolved - excess);
        }
      }
    }
  }

  // ------------------------------------------------------------------- pH
  /** pH of the aqueous phase (approximate but physically motivated). */
  get ph() {
    const V = Math.max(this.aqVolume, 1e-3) / 1000; // dm3
    const nH = this.aqueous.get('H+') || 0;
    const nOH = this.aqueous.get('OH-') || 0;
    const excess = nH - nOH;
    if (Math.abs(excess) > 1e-10) {
      const p = clamp(-Math.log10(Math.max(Math.abs(excess) / V, 1e-14)), 0, 14);
      return excess > 0 ? p : clamp(14 - p, 0, 14);
    }
    // Weak acid / weak base contributions
    let h = 1e-7;
    for (const [id, mol] of this.aqueous) {
      const sp = SPECIES[id];
      if (!sp || sp.pKa === undefined) continue;
      const c = mol / V;
      h += Math.sqrt(Math.pow(10, -sp.pKa) * c);
    }
    const nh3 = this.aqueous.get('NH3') || 0;
    if (nh3 > 0) {
      const oh = Math.sqrt(Math.pow(10, -4.75) * (nh3 / V));
      h = Math.max(h, 1e-14 / Math.max(oh, 1e-14));
    }
    return clamp(-Math.log10(Math.max(h, 1e-14)), 0, 14);
  }

  // --------------------------------------------------------------- colour
  /** Colour of the aqueous phase as a hex string. */
  get aqueousColour() {
    const V = Math.max(this.aqVolume, 1) / 1000;
    const entries = [];
    for (const [id, mol] of this.aqueous) {
      const sp = SPECIES[id];
      if (!sp || !sp.colour || id === 'H2O') continue;
      entries.push({ colour: sp.colour, strength: (sp.strength ?? 1) * OD_SCALE, weight: mol / V });
    }
    const ind = this.indicatorColour();
    if (ind) entries.push({ colour: ind, strength: 1.2 * OD_SCALE, weight: 0.05 });
    const rgb = combineColours(entries.map((e) => ({ colour: e.colour, weight: e.weight, strength: e.strength })));
    return rgbToHex(rgb);
  }
  get organicColour() {
    const V = Math.max(this.orgVolume, 0.001) / 1000;
    const entries = [];
    for (const [id, mol] of this.organic) {
      const sp = SPECIES[id];
      if (!sp || !sp.colour) continue;
      entries.push({ colour: sp.colour, strength: (sp.strength ?? 1) * OD_SCALE, weight: mol / V });
    }
    return rgbToHex(combineColours(entries));
  }
  /** Colour of the undissolved solid layer. */
  get solidColour() {
    let best = null, bestG = 0, total = 0;
    for (const [id, g] of this.solids) {
      const sp = getSpecies(id);
      total += g;
      if (g > bestG) { bestG = g; best = sp.colour || '#e8e8e8'; }
    }
    if (!best) return null;
    const a = hexToRgb(best);
    const white = { r: 1, g: 1, b: 1 };
    return rgbToHex(mixRgb(a, white, Math.min(0.5, 1 / (1 + total))));
  }

  /** Indicator colour for the current pH, or null. */
  indicatorColour() {
    const inds = [];
    for (const id of this.aqueous.keys()) {
      const sub = findIndicatorBySpecies(id);
      if (sub) inds.push(sub.indicator);
    }
    if (!inds.length) return null;
    const ph = this.ph;
    let acc = null;
    for (const ind of inds) {
      const c = indicatorHex(ind, ph);
      if (!c) continue;
      acc = acc ? mixRgb(hexToRgb(acc), hexToRgb(c), 0.5) : hexToRgb(c);
    }
    return acc ? rgbToHex(acc) : null;
  }

  /** Overall appearance for a simple 2D swatch (blend of phases). */
  get colourHex() {
    const a = hexToRgb(this.aqueousColour);
    const total = this.volume || 1;
    if (this.orgVolume > 0) {
      const o = hexToRgb(this.organicColour);
      const t = this.orgVolume / total;
      return rgbToHex(mixRgb(a, o, t));
    }
    return rgbToHex(a);
  }

  // ------------------------------------------------------ thermal plumbing
  /** Apply an energy change in joules (positive = heating). */
  applyEnergy(J) {
    if (!isFinite(J) || J === 0) return 0;
    const dT = J / this.heatCapacity;
    this.temperature += dT;
    return dT;
  }

  // -------------------------------------------------------------- snapshot
  snapshot() {
    return {
      capacity: this.capacity,
      temperature: round(this.temperature, 2),
      aqVolume: round(this.aqVolume, 3),
      orgVolume: round(this.orgVolume, 3),
      aqueous: mapToObject(this.aqueous),
      organic: mapToObject(this.organic),
      solids: mapToObject(this.solids),
      solidMeta: Object.fromEntries(this.solidMeta),
      gas: mapToObject(this.gas),
      ph: round(this.ph, 2)
    };
  }
  static fromSnapshot(s) {
    const m = new Mixture({ capacity: s.capacity, temperature: s.temperature });
    m.aqVolume = s.aqVolume || 0;
    m.orgVolume = s.orgVolume || 0;
    for (const [k, v] of Object.entries(s.aqueous || {})) m.aqueous.set(k, v);
    for (const [k, v] of Object.entries(s.organic || {})) m.organic.set(k, v);
    for (const [k, v] of Object.entries(s.solids || {})) m.solids.set(k, v);
    for (const [k, v] of Object.entries(s.solidMeta || {})) m.solidMeta.set(k, v);
    for (const [k, v] of Object.entries(s.gas || {})) m.gas.set(k, v);
    return m;
  }

  /** Human readable contents list for the inspector. */
  describe() {
    const rows = [];
    for (const [id, mol] of sortByAmount(this.aqueous)) {
      if (id === 'H2O' || mol < 1e-9) continue;
      const sp = getSpecies(id);
      rows.push({ id, name: sp.name, formula: sp.formula, mol, kind: 'dissolved', colour: sp.colour });
    }
    for (const [id, mol] of sortByAmount(this.organic)) {
      if (mol < 1e-9) continue;
      const sp = getSpecies(id);
      rows.push({ id, name: sp.name, formula: sp.formula, mol, kind: 'organic layer', colour: sp.colour });
    }
    for (const [id, g] of this.solids) {
      if (g < 1e-6) continue;
      const sp = getSpecies(id);
      rows.push({ id, name: sp.name, formula: sp.formula, grams: g, kind: 'undissolved solid', colour: sp.colour });
    }
    for (const [id, mol] of this.gas) {
      if (mol < 1e-9) continue;
      const sp = getSpecies(id);
      rows.push({ id, name: sp.name, formula: sp.formula, mol, kind: 'gas', colour: sp.colour });
    }
    return rows;
  }
}

// ------------------------------------------------------------------ helpers
function clean(map) { for (const [k, v] of [...map]) if (v < 1e-12) map.delete(k); }
function mapToObject(map) { const o = {}; for (const [k, v] of map) if (v > 1e-12) o[k] = v; return o; }
function sortByAmount(map) { return [...map.entries()].sort((a, b) => b[1] - a[1]); }

/** Find a shelf reagent that supplies a given species as an indicator. */
function findIndicatorBySpecies(speciesId) {
  for (const sub of Object.values(SUBSTANCES)) {
    if (!sub.indicator) continue;
    if ((sub.dissolveTo || []).some((d) => d.id === speciesId)) return sub;
  }
  return null;
}

/** Convert a pH into an indicator colour. */
export function indicatorHex(ind, ph) {
  if (!ind) return null;
  switch (ind.kind) {
    case 'universal': {
      const stops = [
        [1, '#d32f2f'], [3, '#e2621f'], [5, '#e8b01f'], [7, '#4caf50'],
        [9, '#2e9e9e'], [11, '#2f6fd0'], [14, '#5b2a86']
      ];
      return gradientHex(stops, ph);
    }
    case 'methyl_orange': return ind.low ? (ph <= ind.range[0] ? ind.low : ph >= ind.range[1] ? ind.high : null) : null;
    default: {
      if (ph <= ind.range[0]) return ind.low || null;
      if (ph >= ind.range[1]) return ind.high || null;
      if (ind.low && ind.high) return rgbToHex(mixRgb(hexToRgb(ind.low), hexToRgb(ind.high), (ph - ind.range[0]) / (ind.range[1] - ind.range[0])));
      return null;
    }
  }
}
function gradientHex(stops, x) {
  for (let i = 0; i < stops.length - 1; i++) {
    const [x0, c0] = stops[i], [x1, c1] = stops[i + 1];
    if (x <= x1) {
      const t = clamp((x - x0) / (x1 - x0), 0, 1);
      return rgbToHex(mixRgb(hexToRgb(c0), hexToRgb(c1), t));
    }
  }
  return stops[stops.length - 1][1];
}
