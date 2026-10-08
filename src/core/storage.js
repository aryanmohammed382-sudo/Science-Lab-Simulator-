// ---------------------------------------------------------------------------
// SAVING, LOADING, THE LAB NOTEBOOK AND DATA EXPORT
// ---------------------------------------------------------------------------
// Everything here is plain data in / plain data out so it can be unit tested
// in Node without a browser.  The only browser dependency is localStorage,
// which is passed in (or falls back to an in-memory store).
// ---------------------------------------------------------------------------

import { Mixture } from './mixture.js';
import { clamp, uid } from './util.js';

export const SAVE_VERSION = 3;
export const SAVE_PREFIX = 'vsl.save.';
export const NOTEBOOK_PREFIX = 'vsl.notebook.';

// --------------------------------------------------------------- memory store
/** Minimal localStorage stand-in so the module works in Node and in private
 *  browsing modes where localStorage throws. */
export function memoryStorage() {
  const map = new Map();
  return {
    get length() { return map.size; },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(String(k), String(v)); },
    removeItem: (k) => { map.delete(k); },
    clear: () => map.clear(),
    _map: map
  };
}

/** localStorage if it is usable, otherwise a memory store. */
export function safeStorage() {
  try {
    if (typeof localStorage !== 'undefined') {
      const probe = '__vsl_probe__';
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      return localStorage;
    }
  } catch { /* fall through */ }
  return memoryStorage();
}

// ------------------------------------------------------------- mixture state
export function serializeMixture(m) {
  return {
    capacity: m.capacity,
    temperature: m.temperature,
    aqVolume: m.aqVolume,
    orgVolume: m.orgVolume,
    aqueous: [...m.aqueous].map(([id, mol]) => [id, round6(mol)]),
    organic: [...m.organic].map(([id, mol]) => [id, round6(mol)]),
    solids: [...m.solids].map(([id, g]) => [id, round6(g)]),
    gas: [...m.gas].map(([id, mol]) => [id, round6(mol)]),
    solidMeta: [...m.solidMeta].map(([id, meta]) => [id, { ...meta }]),
    observations: m.observations.slice(-40),
    reactionLog: m.reactionLog.slice(-60)
  };
}

export function deserializeMixture(data) {
  const m = new Mixture({ capacity: data.capacity ?? 250, temperature: data.temperature ?? 20 });
  m.aqueous = new Map(data.aqueous || []);
  m.organic = new Map(data.organic || []);
  m.solids = new Map(data.solids || []);
  m.gas = new Map(data.gas || []);
  m.solidMeta = new Map(data.solidMeta || []);
  m.aqVolume = data.aqVolume ?? 0;
  m.orgVolume = data.orgVolume ?? 0;
  m.observations = data.observations || [];
  m.reactionLog = data.reactionLog || [];
  return m;
}

const round6 = (v) => Math.round(v * 1e6) / 1e6;

// ----------------------------------------------------------------- the lab
/**
 * Wrap a serialised world in an envelope with metadata.  `world` is produced by
 * the 3D world model's `serialize()`; nothing here inspects its internals, so
 * the format can evolve as long as the version is bumped.
 */
export function makeSave({ world, name, description = '', level = 'igcse', subject = 'chemistry', notebook = null, camera = null }) {
  return {
    version: SAVE_VERSION,
    id: uid('save'),
    name: name || 'Untitled experiment',
    description,
    level,
    subject,
    savedAt: new Date().toISOString(),
    camera,
    world,
    notebook: notebook ? (notebook.toJSON ? notebook.toJSON() : notebook) : null
  };
}

export function validateSave(data) {
  const problems = [];
  if (!data || typeof data !== 'object') return ['save data is not an object'];
  if (typeof data.version !== 'number') problems.push('missing version');
  if (data.version > SAVE_VERSION) problems.push(`save was written by a newer version (v${data.version})`);
  if (!data.world) problems.push('no world data');
  if (!data.name) problems.push('no name');
  return problems;
}

export function saveLab(save, storage = safeStorage()) {
  const record = { ...save, version: SAVE_VERSION, savedAt: new Date().toISOString() };
  storage.setItem(SAVE_PREFIX + record.id, JSON.stringify(record));
  return record;
}

export function listSaves(storage = safeStorage()) {
  const out = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key || !key.startsWith(SAVE_PREFIX)) continue;
    try {
      const rec = JSON.parse(storage.getItem(key));
      out.push({ id: rec.id, name: rec.name, description: rec.description, subject: rec.subject, level: rec.level, savedAt: rec.savedAt, version: rec.version, bytes: storage.getItem(key).length });
    } catch { /* skip corrupt entry */ }
  }
  return out.sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt)));
}

export function loadLab(id, storage = safeStorage()) {
  const raw = storage.getItem(SAVE_PREFIX + id);
  if (!raw) return { ok: false, error: 'save not found' };
  try {
    const data = JSON.parse(raw);
    const problems = validateSave(data);
    if (problems.length) return { ok: false, error: problems.join('; '), data };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: 'save file is corrupt: ' + e.message };
  }
}

export function deleteSave(id, storage = safeStorage()) {
  storage.removeItem(SAVE_PREFIX + id);
  return true;
}

export function renameSave(id, name, storage = safeStorage()) {
  const res = loadLab(id, storage);
  if (!res.ok) return res;
  res.data.name = name;
  saveLab(res.data, storage);
  return { ok: true, data: res.data };
}

// ------------------------------------------------------------ file transfer
export function exportJSON(save) {
  return JSON.stringify({ ...save, version: SAVE_VERSION, exportedAt: new Date().toISOString() }, null, 2);
}

export function importJSON(text) {
  let data;
  try { data = JSON.parse(text); } catch (e) { return { ok: false, error: 'not valid JSON: ' + e.message }; }
  const problems = validateSave(data);
  if (problems.length) return { ok: false, error: problems.join('; ') };
  // Fresh id so an import never overwrites an existing save.
  data.id = uid('save');
  data.name = (data.name || 'Imported') + ' (imported)';
  return { ok: true, data };
}

// --------------------------------------------------------------- data tables
/** A named table of readings: the notebook's data grid and chart source. */
export class Dataset {
  constructor({ name = 'Data', columns = [], unit = '' } = {}) {
    this.name = name;
    this.columns = columns.map((c) => (typeof c === 'string' ? { key: c, label: c, unit } : c));
    this.rows = [];
  }
  get keys() { return this.columns.map((c) => c.key); }
  addRow(values) {
    const row = {};
    for (const c of this.columns) {
      const v = values instanceof Map ? values.get(c.key) : values[c.key];
      const n = typeof v === 'number' ? v : parseFloat(v);
      row[c.key] = Number.isFinite(n) ? n : (v ?? '');
    }
    row._t = Date.now();
    this.rows.push(row);
    return row;
  }
  addColumn(key, label, unit = '') {
    this.columns.push({ key, label: label || key, unit });
    for (const r of this.rows) r[key] = '';
    return this;
  }
  get length() { return this.rows.length; }
  /** Numeric series for one column, in insertion order. */
  series(key) {
    return this.rows.map((r) => (typeof r[key] === 'number' ? r[key] : NaN)).filter((v) => Number.isFinite(v));
  }
  paired(xKey, yKey) {
    return this.rows
      .filter((r) => Number.isFinite(+r[xKey]) && Number.isFinite(+r[yKey]))
      .map((r) => ({ x: +r[xKey], y: +r[yKey] }));
  }
  clear() { this.rows.length = 0; }
  removeRow(i) { this.rows.splice(i, 1); }
  toCSV() {
    const head = ['#', ...this.columns.map((c) => (c.unit ? `${c.label} / ${c.unit}` : c.label))];
    const lines = [head.join(',')];
    this.rows.forEach((r, i) => {
      lines.push([i + 1, ...this.keys.map((k) => csvCell(r[k]))].join(','));
    });
    return lines.join('\n');
  }
  toJSON() { return { name: this.name, columns: this.columns, rows: this.rows }; }
  static fromJSON(d) {
    const ds = new Dataset({ name: d.name, columns: d.columns });
    ds.rows = d.rows || [];
    return ds;
  }
  /** Least-squares fit of one column against another, for graph overlays. */
  regression(xKey, yKey) {
    const pts = this.paired(xKey, yKey);
    const n = pts.length;
    if (n < 2) return null;
    const sx = pts.reduce((a, p) => a + p.x, 0);
    const sy = pts.reduce((a, p) => a + p.y, 0);
    const sxx = pts.reduce((a, p) => a + p.x * p.x, 0);
    const sxy = pts.reduce((a, p) => a + p.x * p.y, 0);
    const denom = n * sxx - sx * sx;
    if (Math.abs(denom) < 1e-12) return null;
    const m = (n * sxy - sx * sy) / denom;
    const c = (sy - m * sx) / n;
    const my = sy / n;
    const ssTot = pts.reduce((a, p) => a + (p.y - my) ** 2, 0);
    const ssRes = pts.reduce((a, p) => a + (p.y - (m * p.x + c)) ** 2, 0);
    return { slope: m, intercept: c, r2: ssTot > 0 ? 1 - ssRes / ssTot : 1, n };
  }
}

function csvCell(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(columns, rows) {
  const head = columns.map((c) => (typeof c === 'string' ? c : c.label || c.key));
  const keys = columns.map((c) => (typeof c === 'string' ? c : c.key));
  return [head.join(','), ...rows.map((r) => keys.map((k) => csvCell(r[k])).join(','))].join('\n');
}

// ------------------------------------------------------------- lab notebook
/** Timestamped observations, measurements, calculations and conclusions. */
export class Notebook {
  constructor({ title = 'Laboratory notebook' } = {}) {
    this.title = title;
    this.entries = [];
    this.datasets = [];
  }
  add(entry) {
    const rec = {
      id: uid('note'),
      at: entry.at || new Date().toISOString(),
      kind: entry.kind || 'observation',   // observation | measurement | calculation | conclusion | method | safety | result
      title: entry.title || '',
      text: entry.text || '',
      level: entry.level,
      subject: entry.subject,
      experimentId: entry.experimentId,
      apparatusId: entry.apparatusId,
      data: entry.data,
      tags: entry.tags || []
    };
    this.entries.push(rec);
    return rec;
  }
  remove(id) {
    const i = this.entries.findIndex((e) => e.id === id);
    if (i >= 0) { this.entries.splice(i, 1); return true; }
    return false;
  }
  update(id, patch) {
    const e = this.entries.find((x) => x.id === id);
    if (!e) return null;
    Object.assign(e, patch);
    return e;
  }
  byKind(kind) { return this.entries.filter((e) => e.kind === kind); }
  search(q) {
    const needle = String(q).toLowerCase();
    return this.entries.filter((e) => `${e.title} ${e.text} ${e.tags.join(' ')}`.toLowerCase().includes(needle));
  }
  clear() { this.entries.length = 0; }
  /** The classic write-up, in the order a student hands it in. */
  toMarkdown() {
    const order = ['method', 'safety', 'observation', 'measurement', 'calculation', 'result', 'conclusion'];
    const lines = [`# ${this.title}`, '', `Generated ${new Date().toLocaleString()}`, ''];
    for (const kind of order) {
      const group = this.entries.filter((e) => e.kind === kind);
      if (!group.length) continue;
      lines.push(`## ${kind[0].toUpperCase() + kind.slice(1)}`, '');
      for (const e of group) {
        lines.push(`### ${e.title || '(untitled)'}`, '', e.text, '', `*${e.at}*`, '');
      }
    }
    const other = this.entries.filter((e) => !order.includes(e.kind));
    if (other.length) {
      lines.push('## Other notes', '');
      for (const e of other) lines.push(`- **${e.title}** — ${e.text} (${e.at})`);
      lines.push('');
    }
    for (const ds of this.datasets) {
      lines.push(`## Data: ${ds.name}`, '');
      lines.push('```csv', ds.toCSV(), '```', '');
    }
    return lines.join('\n');
  }
  toJSON() {
    return { title: this.title, entries: this.entries, datasets: this.datasets.map((d) => d.toJSON()) };
  }
  static fromJSON(d) {
    const nb = new Notebook({ title: d.title });
    nb.entries = d.entries || [];
    nb.datasets = (d.datasets || []).map(Dataset.fromJSON);
    return nb;
  }
  save(storage = safeStorage(), key = NOTEBOOK_PREFIX + 'current') {
    storage.setItem(key, JSON.stringify(this.toJSON()));
    return this;
  }
  static load(storage = safeStorage(), key = NOTEBOOK_PREFIX + 'current') {
    const raw = storage.getItem(key);
    if (!raw) return new Notebook();
    try { return Notebook.fromJSON(JSON.parse(raw)); } catch { return new Notebook(); }
  }
}

// --------------------------------------------------------------- export files
export function downloadText(filename, text, mime = 'text/plain') {
  if (typeof document === 'undefined') return false;
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

export function timestampName(prefix, ext) {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${prefix}_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.${ext}`;
}

export { clamp };
