// ---------------------------------------------------------------------------
// CIRCUIT SOLVER (Modified Nodal Analysis)
// ---------------------------------------------------------------------------
// Real nodal analysis, not a lookup table.  Wires are ideal conductors, so the
// terminals they join are merged into single nodes with a union-find before the
// linear system is assembled.  Voltage sources (cells) are handled with the
// standard MNA branch-current unknowns; diodes and LEDs use a piecewise-linear
// model (forward voltage Vf in series with Ron) solved by iteration.
//
// Everything here is plain arithmetic so it can be unit tested in Node.
// ---------------------------------------------------------------------------

/** Nominal forward voltages / on-resistances for common indicator devices. */
export const DIODE_TYPES = {
  diode: { vf: 0.7, ron: 5 },
  led_red: { vf: 1.8, ron: 20 },
  led_yellow: { vf: 2.0, ron: 20 },
  led_green: { vf: 2.2, ron: 20 },
  led_blue: { vf: 3.2, ron: 20 }
};

// ------------------------------------------------------------------ nodes
class UnionFind {
  constructor() { this.parent = new Map(); }
  find(x) {
    if (!this.parent.has(x)) { this.parent.set(x, x); return x; }
    const p = this.parent.get(x);
    if (p === x) return x;
    const r = this.find(p);
    this.parent.set(x, r);
    return r;
  }
  union(a, b) { const ra = this.find(a), rb = this.find(b); if (ra !== rb) this.parent.set(ra, rb); }
}

/** Linear solver: Gaussian elimination with partial pivoting. */
function solveLinear(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col, best = Math.abs(M[col][col]);
    for (let r = col + 1; r < n; r++) { const v = Math.abs(M[r][col]); if (v > best) { best = v; piv = r; } }
    if (best < 1e-14) return null;
    if (piv !== col) { const t = M[piv]; M[piv] = M[col]; M[col] = t; }
    const p = M[col][col];
    for (let r = col + 1; r < n; r++) {
      const f = M[r][col] / p;
      if (f === 0) continue;
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let c = r + 1; c < n; c++) s -= M[r][c] * x[c];
    x[r] = s / M[r][r];
  }
  return x;
}

const TERM = (compId, t) => `${compId}.${t}`;

/**
 * Resolve the electrical nodes of a wired circuit.
 * @param {Array} components [{id, type, terminals:['a','b'], value, internalResistance, ...}]
 * @param {Array} wires [{from:{componentId, terminal}, to:{componentId, terminal}}]
 * @param {Array} probes connections to any point, e.g. meter leads [{componentId, terminal}]
 */
export function buildNodes(components, wires) {
  const uf = new UnionFind();
  for (const c of components) for (const t of c.terminals || ['a', 'b']) uf.find(TERM(c.id, t));
  for (const w of wires) {
    const a = typeof w.from === 'string' ? w.from : TERM(w.from.componentId, w.from.terminal || 'a');
    const b = typeof w.to === 'string' ? w.to : TERM(w.to.componentId, w.to.terminal || 'a');
    uf.union(a, b);
  }
  const nodeOf = new Map();
  const nodes = [];
  for (const c of components) {
    for (const t of c.terminals || ['a', 'b']) {
      const root = uf.find(TERM(c.id, t));
      if (!nodeOf.has(root)) { nodeOf.set(root, nodes.length); nodes.push([]); }
      nodes[nodeOf.get(root)].push(TERM(c.id, t));
    }
  }
  return { nodeOf, nodes, key: (compId, t) => nodeOf.get(uf.find(TERM(compId, t))) };
}

/**
 * Solve a wired circuit.
 * @returns {{ok:boolean, reason?:string, nodeVoltages:number[], elements:Object, nodes:number[][], warnings:string[]}}
 */
export function solveCircuit(components, wires) {
  const { nodeOf, nodes, key } = buildNodes(components, wires);
  const warnings = [];
  if (!components.length) return { ok: false, reason: 'No components in the circuit.', nodes, elements: {}, nodeVoltages: [] };

  // Ground the negative terminal of the first source, else terminal a of the first component
  const source = components.find((c) => c.type === 'cell' || c.type === 'battery' || c.type === 'powerSupply');
  let groundNode = 0;
  if (source) groundNode = key(source.id, 'b');
  else groundNode = key(components[0].id, 'a');

  // Elements for the linear system
  const conductances = [];   // {a,b,g}
  const sources = [];        // {a,b,v,id,internalA}
  const currentInjections = []; // {a,b,j}  (Norton equivalents for diodes)
  const elementMeta = new Map();

  for (const c of components) {
    const a = key(c.id, 'a');
    const b = key(c.id, 'b');
    switch (c.type) {
      case 'resistor':
      case 'lamp':
      case 'bulb':
        conductances.push({ a, b, g: 1 / Math.max(c.value ?? 10, 1e-6), id: c.id });
        break;
      case 'rheostat':
      case 'variableResistor':
        conductances.push({ a, b, g: 1 / Math.max(c.value ?? 50, 1e-6), id: c.id });
        break;
      case 'motor':
        conductances.push({ a, b, g: 1 / Math.max(c.value ?? 20, 1e-6), id: c.id });
        break;
      case 'heater':
        conductances.push({ a, b, g: 1 / Math.max(c.value ?? 12, 1e-6), id: c.id });
        break;
      case 'ammeter':
        conductances.push({ a, b, g: 1 / 0.01, id: c.id });
        break;
      case 'voltmeter':
        conductances.push({ a, b, g: 1 / 1e6, id: c.id });
        break;
      case 'multimeter':
        if ((c.mode || 'voltmeter') === 'ammeter') conductances.push({ a, b, g: 1 / 0.01, id: c.id });
        else conductances.push({ a, b, g: 1 / 1e6, id: c.id });
        break;
      case 'switch':
        conductances.push({ a, b, g: c.closed ? 1 / 1e-3 : 1e-12, id: c.id });
        break;
      case 'diode':
      case 'led':
        // start switched off; the iteration below turns them on when biased
        conductances.push({ a, b, g: 1e-9, id: c.id, diode: true, on: false });
        break;
      case 'cell':
      case 'battery':
      case 'powerSupply': {
        const v = c.value ?? 1.5;
        const r = Math.max(c.internalResistance ?? 0, 0);
        if (r > 0) {
          // model as an internal node with a series resistance
          const internalKey = `internal_${c.id}`;
          if (!nodeOf.has(internalKey)) { nodeOf.set(internalKey, nodes.length); nodes.push([internalKey]); }
          const internal = nodeOf.get(internalKey);
          sources.push({ a: internal, b, v, id: c.id });
          conductances.push({ a: internal, b: a, g: 1 / r, id: `${c.id}_internal` });
        } else {
          sources.push({ a, b, v, id: c.id });
        }
        break;
      }
      case 'wire':
        break;
      default:
        break;
    }
    elementMeta.set(c.id, c);
  }

  if (!sources.length) return { ok: false, reason: 'There is no source of potential difference in the circuit.', nodes, elements: {}, nodeVoltages: [] };

  // node index -> matrix index (ground row/col removed)
  const idx = new Array(nodes.length).fill(-1);
  let m = 0;
  for (let i = 0; i < nodes.length; i++) if (i !== groundNode) idx[i] = m++;
  const size = m + sources.length;
  if (size === 0) return { ok: false, reason: 'Circuit is empty.', nodes, elements: {}, nodeVoltages: [] };

  const solveOnce = (diodeStates) => {
    const A = Array.from({ length: size }, () => new Array(size).fill(0));
    const rhs = new Array(size).fill(0);
    const add = (i, j, v) => { if (i >= 0 && j >= 0) A[i][j] += v; };
    for (const el of conductances) {
      let g = el.g;
      if (el.diode) {
        const st = diodeStates.get(el.id);
        g = st.on ? 1 / st.ron : 1e-9;
        if (st.on) {
          const j = g * st.vf; // Norton equivalent of Vf + Ron
          add(idx[el.a], 0, 0); // no-op keeps linters quiet
          if (idx[el.a] >= 0) rhs[idx[el.a]] += j;
          if (idx[el.b] >= 0) rhs[idx[el.b]] -= j;
        }
      }
      add(idx[el.a], idx[el.a], g);
      add(idx[el.b], idx[el.b], g);
      add(idx[el.a], idx[el.b], -g);
      add(idx[el.b], idx[el.a], -g);
    }
    for (const j of currentInjections) {
      if (idx[j.a] >= 0) rhs[idx[j.a]] += j.j;
      if (idx[j.b] >= 0) rhs[idx[j.b]] -= j.j;
    }
    sources.forEach((s, k) => {
      const row = m + k;
      add(idx[s.a], row, 1); add(idx[s.b], row, -1);
      add(row, idx[s.a], 1); add(row, idx[s.b], -1);
      rhs[row] = s.v;
    });
    return solveLinear(A, rhs);
  };

  // ---- iterate diode/LED states until stable
  const diodeStates = new Map();
  for (const c of components) {
    if (c.type === 'diode' || c.type === 'led') {
      const type = c.ledColour ? `led_${c.ledColour}` : (c.diodeType || (c.type === 'led' ? 'led_red' : 'diode'));
      const d = DIODE_TYPES[type] || DIODE_TYPES.diode;
      diodeStates.set(c.id, { on: false, vf: c.forwardVoltage ?? d.vf, ron: c.onResistance ?? d.ron });
    }
  }
  let x = null, converged = false;
  for (let iter = 0; iter < 60; iter++) {
    x = solveOnce(diodeStates);
    if (!x) return { ok: false, reason: 'The circuit cannot be solved (check for a short circuit or a floating section).', nodes, elements: {}, nodeVoltages: [] };
    let changed = false;
    for (const c of components) {
      if (c.type !== 'diode' && c.type !== 'led') continue;
      const st = diodeStates.get(c.id);
      const a = idx[key(c.id, 'a')], b = idx[key(c.id, 'b')];
      const va = a>=0 ? x[a] : 0, vb = b>=0 ? x[b] : 0;
      const vd = va - vb;
      const forwardCurrent = st.on ? (vd - st.vf) / st.ron : 0;
      if (!st.on && vd > st.vf + 1e-6) { st.on = true; changed = true; }
      else if (st.on && forwardCurrent < -1e-9) { st.on = false; changed = true; }
    }
    if (!changed) { converged = true; break; }
  }
  if (!converged) warnings.push('Diode model did not fully converge.');

  // ---- recover node voltages
  const nodeVoltages = new Array(nodes.length).fill(0);
  for (let i = 0; i < nodes.length; i++) nodeVoltages[i] = idx[i] >= 0 ? x[idx[i]] : 0;

  // ---- element currents and readings
  const elements = {};
  const vOf = (i) => nodeVoltages[i];
  for (const c of components) {
    const a = key(c.id, 'a'), b = key(c.id, 'b');
    const v = vOf(a) - vOf(b);
    let i = 0, r = Infinity;
    switch (c.type) {
      case 'resistor': case 'lamp': case 'bulb': case 'rheostat': case 'variableResistor':
      case 'motor': case 'heater':
        r = Math.max(c.value ?? 10, 1e-6); i = v / r; break;
      case 'ammeter': case 'multimeter':
        if (c.type === 'ammeter' || (c.mode || 'voltmeter') === 'ammeter') { r = 0.01; i = v / r; }
        else { r = 1e6; i = v / r; }
        break;
      case 'voltmeter': r = 1e6; i = v / r; break;
      case 'switch': r = c.closed ? 1e-3 : Infinity; i = c.closed ? v / 1e-3 : 0; break;
      case 'diode': case 'led': {
        const st = diodeStates.get(c.id);
        r = st.on ? st.ron : Infinity;
        i = st.on ? (v - st.vf) / st.ron : 0;
        break;
      }
      case 'cell': case 'battery': case 'powerSupply':
        // current leaving the positive terminal a
        i = -v / Math.max(c.internalResistance ?? 0, 1e-6) + (c.value ?? 1.5) / Math.max(c.internalResistance ?? 0, 1e-6);
        if (!(c.internalResistance > 0)) {
          const k = sources.findIndex((s) => s.id === c.id);
          i = k >= 0 ? -x[m + k] : 0;
        }
        break;
      default: break;
    }
    const power = Math.abs(v * i);
    elements[c.id] = {
      id: c.id, type: c.type, voltage: v, current: i, resistance: r,
      power,
      on: c.type === 'led' || c.type === 'diode'
        ? (diodeStates.get(c.id)?.on ?? false) && Math.abs(i) > 1e-6
        : Math.abs(i) > 1e-6,
      brightness: c.type === 'lamp' || c.type === 'bulb'
        ? Math.min(1, power / Math.max(c.ratedPower ?? 1, 1e-6))
        : undefined
    };
  }

  // ---- sanity warnings that the safety layer turns into teaching moments
  const shortCircuit = Object.values(elements).some((e) => (e.type === 'cell' || e.type === 'battery' || e.type === 'powerSupply') && e.current > 5);
  if (shortCircuit) warnings.push('Short circuit: a very large current is flowing through the source.');

  return { ok: true, nodes, nodeVoltages, elements, warnings, groundNode };
}

/**
 * Human-readable analysis of a solved circuit: total resistance, source
 * current, and whether elements are in series or parallel with each other.
 */
export function analyseCircuit(components, wires, solution) {
  if (!solution?.ok) return { ok: false, reason: solution?.reason || 'not solved' };
  const sources = components.filter((c) => ['cell', 'battery', 'powerSupply'].includes(c.type));
  const loads = components.filter((c) => ['resistor', 'lamp', 'bulb', 'rheostat', 'variableResistor', 'motor', 'heater'].includes(c.type));
  const totalCurrent = sources.reduce((s, c) => s + (solution.elements[c.id]?.current || 0), 0);
  const emf = sources.reduce((s, c) => s + (c.value || 0), 0);
  const totalPower = loads.reduce((s, c) => s + (solution.elements[c.id]?.power || 0), 0);
  const rTotal = Math.abs(totalCurrent) > 1e-9 ? emf / Math.abs(totalCurrent) : Infinity;
  // series / parallel inference from shared node pairs
  const { key } = buildNodes(components, wires);
  const groups = new Map();
  for (const c of loads) {
    const k = [key(c.id, 'a'), key(c.id, 'b')].sort((x, y) => x - y).join('-');
    groups.set(k, (groups.get(k) || 0) + 1);
  }
  const inParallel = [...groups.values()].filter((n) => n > 1).length > 0;
  return {
    ok: true,
    emf,
    totalCurrent,
    totalResistance: rTotal,
    totalPower,
    inParallel,
    arrangement: inParallel ? 'parallel (and/or series) combination' : 'series (single loop)',
    loads: loads.map((c) => ({ id: c.id, type: c.type, ...solution.elements[c.id] }))
  };
}

/** Resistors in parallel: 1/R = sum(1/Ri). */
export function parallelResistance(values) {
  const inv = values.reduce((s, r) => s + 1 / r, 0);
  return 1 / inv;
}
/** Resistors in series. */
export function seriesResistance(values) { return values.reduce((a, b) => a + b, 0); }
