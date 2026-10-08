// ---------------------------------------------------------------------------
// EXPERIMENT LIBRARY SCHEMA
// ---------------------------------------------------------------------------
// Every experiment is a data record with two sides that map onto the two tabs
// of the experiment panel:
//
//   TAB 1 - APPARATUS & MATERIALS : apparatus [], substances [], quantities,
//           safetyEquipment []
//   TAB 2 - PROCEDURE / NOTES     : objective, theory, safety, procedure,
//           observations, variables, expected, calculations, questions, notes
//
// Adding an experiment is writing one record - the engine, the inventory, the
// notebook and the report all read from here.
// ---------------------------------------------------------------------------

import { APPARATUS } from '../apparatus.js';
import { SUBSTANCES } from '../substances.js';

export const SUBJECTS = [
  { id: 'chemistry', label: 'Chemistry', blurb: 'Reactions, analysis, synthesis and physical chemistry' },
  { id: 'physics', label: 'Physics', blurb: 'Mechanics, electricity, waves, optics and thermal physics' },
  { id: 'biology', label: 'Biology', blurb: 'Cells, enzymes, transport, physiology and microbiology' },
  { id: 'research', label: 'Advanced & Research', blurb: 'Open-ended investigation templates you configure yourself' }
];

export const LEVELS = [
  { id: 'igcse', label: 'IGCSE', blurb: 'Guided work, simple measurements, heavy scaffolding' },
  { id: 'as', label: 'AS Level', blurb: 'More independence, quantitative analysis, uncertainty' },
  { id: 'a', label: 'A Level', blurb: 'Multi-stage practicals, graphs, calculations, error analysis' },
  { id: 'ug', label: 'Undergraduate', blurb: 'Instrumentation, experimental design, statistical treatment' },
  { id: 'research', label: 'Research / Advanced', blurb: 'You design the procedure, variables and analysis' }
];

export const SLUG = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48);
const arr = (v) => (Array.isArray(v) ? v : v === undefined || v === null ? [] : String(v).split('|').map((s) => s.trim()).filter(Boolean));

/** 'beaker_250 x2, thermometer' -> [{id, qty}] */
export function parseApparatus(str) {
  return arr(String(str || '').split(',').map((s) => s.trim()))
    .map((chunk) => {
      const m = /^([a-z0-9_]+)\s*(?:x\s*(\d+))?$/i.exec(chunk.trim());
      if (!m) return { id: chunk.trim(), qty: 1, unknown: !APPARATUS[chunk.trim()] };
      return { id: m[1], qty: m[2] ? parseInt(m[2], 10) : 1, unknown: !APPARATUS[m[1]] };
    })
    .filter((e) => e.id);
}
/** 'hcl_1m:25 cm3, marble_chips:2 g' -> [{id, amount}] */
export function parseSubstances(str) {
  if (!str) return [];
  return String(str).split(',').map((s) => s.trim()).filter(Boolean).map((chunk) => {
    const i = chunk.indexOf(':');
    const id = (i < 0 ? chunk : chunk.slice(0, i)).trim();
    const amount = i < 0 ? 'as required' : chunk.slice(i + 1).trim();
    return { id, amount, unknown: !SUBSTANCES[id] };
  });
}

function parseVariables(v) {
  if (!v) return { independent: '', dependent: '', controlled: [] };
  const out = { independent: '', dependent: '', controlled: [] };
  for (const part of String(v).split('|')) {
    const [k, ...rest] = part.split(':');
    const val = rest.join(':').trim();
    const key = k.trim().toLowerCase();
    if (key.startsWith('indep')) out.independent = val;
    else if (key.startsWith('dep')) out.dependent = val;
    else if (key.startsWith('control')) out.controlled = val.split(/\s*,\s*/).filter(Boolean);
  }
  return out;
}

export const EXPERIMENTS = [];

/**
 * Register one experiment.
 * @param {'chemistry'|'physics'|'biology'|'research'} subject
 * @param {'igcse'|'as'|'a'|'ug'|'research'} level
 */
export function E(subject, level, name, objective, d = {}) {
  const rec = {
    id: `${level}-${subject.slice(0, 4)}-${SLUG(name)}`,
    subject,
    level,
    name,
    objective,
    mode: d.mode || (level === 'research' ? 'research' : 'guided'),
    duration: d.duration || '30-40 min',
    apparatus: parseApparatus(d.apparatus),
    substances: parseSubstances(d.substances),
    safetyEquipment: arr(d.safetyEquipment || 'goggles|lab coat').map((s) => s.toLowerCase()),
    safety: arr(d.safety),
    theory: d.theory || '',
    procedure: arr(d.procedure),
    observations: d.observations || '',
    measurements: arr(d.measurements),
    variables: parseVariables(d.variables),
    expected: d.expected || '',
    calculations: arr(d.calculations),
    questions: arr(d.questions),
    notes: arr(d.notes),
    tags: arr(d.tags),
    configurable: d.configurable || null,
    dataAnalysis: d.dataAnalysis || null
  };
  EXPERIMENTS.push(rec);
  return rec;
}

export function experimentsBy(filter = {}) {
  return EXPERIMENTS.filter((e) =>
    (!filter.subject || e.subject === filter.subject)
    && (!filter.level || e.level === filter.level)
    && (!filter.mode || e.mode === filter.mode)
    && (!filter.tag || e.tags.includes(filter.tag)));
}
export function getExperiment(id) { return EXPERIMENTS.find((e) => e.id === id) || null; }
export function searchExperiments(q, filter = {}) {
  const t = q.trim().toLowerCase();
  const base = experimentsBy(filter);
  if (!t) return base;
  return base.filter((e) => e.name.toLowerCase().includes(t) || e.objective.toLowerCase().includes(t)
    || e.tags.some((tag) => tag.includes(t)));
}
export function experimentCounts() {
  const counts = {};
  for (const s of SUBJECTS) for (const l of LEVELS) counts[`${s.id}/${l.id}`] = experimentsBy({ subject: s.id, level: l.id }).length;
  return counts;
}
/** All apparatus / substances used across the library (for the inventory). */
export function usedApparatus() { const s = new Set(); for (const e of EXPERIMENTS) for (const a of e.apparatus) s.add(a.id); return [...s]; }
export function usedSubstances() { const s = new Set(); for (const e of EXPERIMENTS) for (const a of e.substances) s.add(a.id); return [...s]; }
