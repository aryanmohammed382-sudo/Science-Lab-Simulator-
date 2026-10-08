// ---------------------------------------------------------------------------
// THERMAL MODEL
// ---------------------------------------------------------------------------
// A single lumped-capacitance model shared by every heated object in the lab:
//
//   dQ/dt = sum(absorbed power from heat sources) - h.A.(T - T_ambient)
//
// with phase changes (boiling, evaporation, melting ice) consuming latent heat.
// Powers are calibrated against real bench behaviour: a 50 mL beaker of water
// on a roaring Bunsen flame reaches 100 C in roughly a minute and a half, and a
// beaker of hot water left on the bench cools to room temperature in ~10 min.
// ---------------------------------------------------------------------------

export const AMBIENT_C = 20;
export const C_WATER = 4.18;          // J/g/K
export const LATENT_VAPORISATION = 2260; // J/g for water
export const LATENT_FUSION = 334;     // J/g for ice

/** Effective power (W) that actually reaches a container from a flame at `d` m. */
export function absorbedPower(source, distanceM) {
  const nominal = source.powerW ?? 250;
  const d = Math.max(0, distanceM);
  const falloff = 1 / (1 + Math.pow(d / 0.045, 2));
  const spread = Math.min(1, (source.targetDiameter ?? 0.06) / 0.06);
  const on = source.on === false ? 0 : 1;
  return nominal * falloff * spread * on;
}

/**
 * Advance one object through dt seconds.
 *
 * @param {object} state
 *   temperature  C            heatCapacity  J/K        surfaceArea m2
 *   volumeML     mL of liquid (for evaporation)
 *   boilingPoint C            meltingPoint  C
 *   massG        total mass   isWater       boolean (latent heat applies)
 *   insulated    0..1 lagging factor (1 = perfectly lagged)
 *   sealed       boolean -> pressure builds up
 *   gasMoles     mol of gas in the head space (for pressure)
 *   headspaceL   L of head space
 *   iceMassG     g of ice present (ice bath)
 * @param {number} dt seconds
 * @param {object} env
 *   ambientC, sources:[{powerW,distanceM,targetDiameter,on}], contact:{temperatureC,conductanceWperK},
 *   h (W/m2K), area (m2)
 * @returns {{dT:number, evaporatedML:number, meltedIceG:number, boiledDry:boolean, boilRateMLperS:number}}
 */
export function stepThermal(state, dt, env = {}) {
  const ambient = env.ambientC ?? AMBIENT_C;
  const area = env.area ?? state.surfaceArea ?? 0.02;
  const h = (env.h ?? 20) * (1 - 0.9 * (state.insulated ?? 0));
  let Q = 0; // joules into the object (positive = warming)

  // heat sources (flames, hot plates, mantles)
  for (const s of env.sources || []) {
    if (s.on === false) continue;
    const target = s.targetTemperatureC ?? Infinity;
    // a source cannot push the object above its own temperature
    if (state.temperature >= target) continue;
    const p = absorbedPower(s, s.distanceM ?? 0.02);
    Q += p * dt;
  }
  // direct contact with a water bath / hot plate / ice bath
  if (env.contact) {
    const k = env.contact.conductanceWperK ?? 2.5;
    Q += k * (env.contact.temperatureC - state.temperature) * dt;
  }
  // Newton cooling (or warming) to the surroundings
  Q += h * area * (ambient - state.temperature) * dt;

  let dT = Q / Math.max(state.heatCapacity, 1e-6);
  let evaporatedML = 0, meltedIceG = 0, boiledDry = false, boilRate = 0;

  const bp = state.boilingPoint ?? Infinity;
  if (state.temperature + dT > bp) {
    // the excess energy goes into vapourising liquid instead of raising T
    const excess = (state.temperature + dT - bp) * state.heatCapacity;
    dT = bp - state.temperature;
    if (state.volumeML > 0.01 && (state.isWater ?? true)) {
      const couldVaporiseG = excess / LATENT_VAPORISATION;
      const availableG = state.volumeML * 0.998;
      const vaporisedG = Math.min(couldVaporiseG, availableG);
      evaporatedML = vaporisedG / 0.998;
      boilRate = evaporatedML / dt;
      if (vaporisedG >= availableG - 1e-9) boiledDry = true;
    }
  }
  if (state.temperature + dT > 100.5 && (state.volumeML ?? 0) > 0.01 && (state.isWater ?? true)) {
    // steady evaporation from the surface once it is hot (not just at the boil)
    const evap = Math.min(state.volumeML * 0.002, 2e-5 * area * (state.temperature - 60) * dt);
    if (evap > 0) { evaporatedML += evap; state.volumeML -= evap; }
  }
  // ice in an ice bath holds the temperature at 0 C until it has all melted
  if ((state.iceMassG ?? 0) > 0 && state.temperature + dT < 0 && (env.sources || []).every((s) => s.on === false)) {
    dT = 0 - state.temperature;
    const needed = -Q / LATENT_FUSION;
    meltedIceG = Math.max(0, needed);
  }
  state.temperature += dT;

  return { dT, evaporatedML, meltedIceG, boiledDry, boilRateMLperS: boilRate };
}

/** Pressure (kPa) inside a sealed vessel from the ideal gas law. */
export function pressureKPa(gasMoles, headspaceL, temperatureC) {
  const R = 8.314; // J/mol/K
  const T = temperatureC + 273.15;
  const V = Math.max(headspaceL, 1e-6) / 1000; // L -> m3
  return ((gasMoles * R * T) / V) / 1000;
}

/** Water bath: a container whose temperature is controlled and shared. */
export function stepWaterBath(bath, dt, env = {}) {
  const res = stepThermal(bath, dt, env);
  return res;
}

/**
 * Reach an equilibrium temperature when two bodies are mixed (used for mixing
 * two liquid volumes of different temperature).
 */
export function mixedTemperature(hc1, t1, hc2, t2) {
  return (hc1 * t1 + hc2 * t2) / Math.max(hc1 + hc2, 1e-9);
}
