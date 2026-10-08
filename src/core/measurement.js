// ---------------------------------------------------------------------------
// MEASUREMENT SYSTEM
// ---------------------------------------------------------------------------
// Every reading in the laboratory comes from an instrument with a real range,
// resolution and uncertainty, applied to a value that came out of the
// simulation.  Nothing here invents a number.
// ---------------------------------------------------------------------------

import { clamp, round } from './util.js';
import { makeRng } from './util.js';

/** id -> {name, measures, unit, min, max, resolution, accuracy, decimals} */
export const INSTRUMENTS = {
  thermometer: { name: 'Laboratory thermometer (-10 to 110 °C)', measures: 'temperature', unit: '°C', min: -10, max: 110, resolution: 1, accuracy: 0.5 },
  thermometer_precise: { name: 'Precision thermometer', measures: 'temperature', unit: '°C', min: -10, max: 110, resolution: 0.2, accuracy: 0.1 },
  temperature_probe: { name: 'Digital temperature probe', measures: 'temperature', unit: '°C', min: -50, max: 150, resolution: 0.1, accuracy: 0.2 },
  balance_top_pan: { name: 'Top-pan balance', measures: 'mass', unit: 'g', min: 0, max: 2000, resolution: 0.01, accuracy: 0.02 },
  balance_analytical: { name: 'Analytical balance', measures: 'mass', unit: 'g', min: 0, max: 220, resolution: 0.0001, accuracy: 0.0002 },
  measuring_cylinder_10: { name: 'Measuring cylinder 10 cm3', measures: 'volume', unit: 'cm³', min: 0, max: 10, resolution: 0.1, accuracy: 0.05 },
  measuring_cylinder_25: { name: 'Measuring cylinder 25 cm3', measures: 'volume', unit: 'cm³', min: 0, max: 25, resolution: 0.5, accuracy: 0.25 },
  measuring_cylinder_50: { name: 'Measuring cylinder 50 cm3', measures: 'volume', unit: 'cm³', min: 0, max: 50, resolution: 1, accuracy: 0.5 },
  measuring_cylinder_100: { name: 'Measuring cylinder 100 cm3', measures: 'volume', unit: 'cm³', min: 0, max: 100, resolution: 1, accuracy: 0.5 },
  burette: { name: 'Burette 50 cm3', measures: 'volume', unit: 'cm³', min: 0, max: 50, resolution: 0.05, accuracy: 0.05 },
  pipette_25: { name: 'Pipette 25 cm3 (grade B)', measures: 'volume', unit: 'cm³', min: 25, max: 25, resolution: 0.03, accuracy: 0.03 },
  gas_syringe: { name: 'Gas syringe 100 cm3', measures: 'gas volume', unit: 'cm³', min: 0, max: 100, resolution: 1, accuracy: 0.5 },
  stopwatch: { name: 'Stopwatch', measures: 'time', unit: 's', min: 0, max: 3600, resolution: 0.01, accuracy: 0.05 },
  light_gate: { name: 'Light gate timer', measures: 'time', unit: 's', min: 0, max: 60, resolution: 0.001, accuracy: 0.001 },
  ruler: { name: 'Metre rule', measures: 'length', unit: 'mm', min: 0, max: 1000, resolution: 1, accuracy: 0.5 },
  vernier_caliper: { name: 'Vernier callipers', measures: 'length', unit: 'mm', min: 0, max: 150, resolution: 0.1, accuracy: 0.05 },
  micrometer: { name: 'Micrometer screw gauge', measures: 'length', unit: 'mm', min: 0, max: 25, resolution: 0.01, accuracy: 0.005 },
  ammeter_analogue: { name: 'Analogue ammeter', measures: 'current', unit: 'A', min: -1, max: 1, resolution: 0.02, accuracy: 0.01 },
  ammeter_digital: { name: 'Digital ammeter', measures: 'current', unit: 'A', min: -10, max: 10, resolution: 0.001, accuracy: 0.005 },
  voltmeter_analogue: { name: 'Analogue voltmeter', measures: 'voltage', unit: 'V', min: -5, max: 5, resolution: 0.1, accuracy: 0.05 },
  voltmeter_digital: { name: 'Digital voltmeter', measures: 'voltage', unit: 'V', min: -20, max: 20, resolution: 0.01, accuracy: 0.02 },
  multimeter: { name: 'Digital multimeter', measures: 'voltage/current/resistance', unit: 'auto', min: -600, max: 600, resolution: 0.01, accuracy: 0.5 },
  ph_meter: { name: 'pH meter', measures: 'pH', unit: 'pH', min: 0, max: 14, resolution: 0.01, accuracy: 0.05 },
  ph_probe_education: { name: 'pH probe (educational)', measures: 'pH', unit: 'pH', min: 0, max: 14, resolution: 0.1, accuracy: 0.2 },
  conductivity_meter: { name: 'Conductivity meter', measures: 'conductivity', unit: 'mS/cm', min: 0, max: 200, resolution: 0.01, accuracy: 0.05 },
  pressure_sensor: { name: 'Pressure sensor', measures: 'pressure', unit: 'kPa', min: 0, max: 250, resolution: 0.1, accuracy: 0.2 },
  force_sensor: { name: 'Force sensor', measures: 'force', unit: 'N', min: -50, max: 50, resolution: 0.01, accuracy: 0.02 },
  light_sensor: { name: 'Light sensor', measures: 'light intensity', unit: 'lux', min: 0, max: 100000, resolution: 1, accuracy: 5 },
  colorimeter: { name: 'Colorimeter', measures: 'absorbance', unit: 'A', min: 0, max: 2, resolution: 0.001, accuracy: 0.005 },
  oscilloscope: { name: 'Oscilloscope', measures: 'voltage/time', unit: 'V', min: -20, max: 20, resolution: 0.05, accuracy: 0.05 },
  dalogger: { name: 'Data logger', measures: 'any sensor', unit: 'auto', min: -1000, max: 1000, resolution: 0.01, accuracy: 0.05 }
};

const rng = makeRng(20261008);

/**
 * Take a reading with a given instrument.
 * @param {string} instrumentId
 * @param {number} trueValue
 * @param {{noisy?:boolean, resolution?:number}} opts
 */
export function readInstrument(instrumentId, trueValue, opts = {}) {
  const inst = INSTRUMENTS[instrumentId] || INSTRUMENTS.thermometer;
  if (trueValue < inst.min || trueValue > inst.max) {
    return {
      ok: false, instrument: inst.name, unit: inst.unit,
      value: clamp(trueValue, inst.min, inst.max),
      note: trueValue > inst.max ? `Over range: this instrument reads up to ${inst.max} ${inst.unit}.`
        : `Below the range of this instrument (minimum ${inst.min} ${inst.unit}).`
    };
  }
  const res = opts.resolution ?? inst.resolution;
  const quantum = Math.round(trueValue / res) * res;
  const noise = opts.noisy === false ? 0 : (rng() - 0.5) * 2 * inst.accuracy;
  const value = quantum + noise;
  const uncertainty = Math.max(res / 2, inst.accuracy);
  return {
    ok: true,
    instrument: inst.name,
    unit: inst.unit,
    measures: inst.measures,
    value,
    display: formatReading(value, res, inst.unit),
    resolution: res,
    uncertainty: round(uncertainty, 6),
    percentUncertainty: trueValue !== 0 ? round((uncertainty / Math.abs(trueValue)) * 100, 3) : null,
    note: uncertainty >= Math.abs(trueValue) * 0.1 ? 'The uncertainty is a large fraction of this reading - consider a more precise instrument or a bigger quantity.' : null
  };
}

/** Format a reading with the right number of decimal places for its resolution. */
export function formatReading(value, resolution, unit = '') {
  const dp = resolution >= 1 ? 0 : Math.min(4, Math.ceil(-Math.log10(resolution)));
  return `${value.toFixed(dp)}${unit ? ' ' + unit : ''}`;
}

// ------------------------------------------------------------------ statistics
export function mean(values) { return values.reduce((a, b) => a + b, 0) / Math.max(values.length, 1); }
export function stdDev(values) {
  const m = mean(values);
  const v = values.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(values.length - 1, 1);
  return Math.sqrt(v);
}
export function range(values) { return Math.max(...values) - Math.min(...values); }

/** Uncertainty of the mean from repeated readings. */
export function uncertaintyOfMean(values) {
  if (values.length < 2) return null;
  return stdDev(values) / Math.sqrt(values.length);
}
export function uncertaintyFromRange(values) {
  return values.length < 2 ? null : range(values) / 2;
}

/** Indices of readings that are anomalous (further than `threshold` sd from the mean). */
export function identifyAnomalies(values, threshold = 2) {
  if (values.length < 4) return [];
  const m = mean(values), sd = stdDev(values);
  if (sd === 0) return [];
  const out = [];
  values.forEach((v, i) => { if (Math.abs(v - m) > threshold * sd) out.push(i); });
  return out;
}

/** Percentage uncertainty of a measured quantity. */
export function percentUncertainty(value, uncertainty) {
  return value === 0 ? null : (uncertainty / Math.abs(value)) * 100;
}

/** Combine absolute uncertainties for a sum or difference. */
export function uncertaintyOfSum(absUncertainties) {
  return Math.sqrt(absUncertainties.reduce((s, u) => s + u * u, 0));
}

/** Combine relative (%) uncertainties for a product or quotient. */
export function uncertaintyOfProduct(relUncertainties) {
  return Math.sqrt(relUncertainties.reduce((s, u) => s + u * u, 0));
}

/** Absolute uncertainty of a result given its relative uncertainty (%). */
export function absoluteFromPercent(value, percent) {
  return Math.abs(value) * percent / 100;
}

/** Sensible number of significant figures for a result of a measurement. */
export function significantFigures(value, uncertainty) {
  if (!isFinite(value)) return '';
  if (!uncertainty || uncertainty <= 0) return String(value);
  const dp = Math.max(0, -Math.floor(Math.log10(uncertainty)));
  return value.toFixed(Math.min(dp, 6));
}

/** Percentage difference between an experimental and a true value. */
export function percentageDifference(experimental, theoretical) {
  return theoretical === 0 ? null : ((experimental - theoretical) / theoretical) * 100;
}
/** Percentage error (as a positive magnitude). */
export function percentageError(experimental, theoretical) {
  const d = percentageDifference(experimental, theoretical);
  return d === null ? null : Math.abs(d);
}
