import { el, clear, button, section } from './dom.js';
import { Chart } from './charts.js';
import { Dataset } from '../core/storage.js';
import { downloadText, timestampName, toCSV } from '../core/storage.js';
import { mean, uncertaintyOfMean, identifyAnomalies } from '../core/measurement.js';

export function renderResearch(that) {
  if (!that.dom.overlay) return null;
  const o = that.dom.overlay;
  clear(o);
  const body = el('div', { class: 'modal-body' });
  if (!that.research) that.research = { title:'', hypothesis:'', runs:[], dataset:null, variables:{ independent:'', dependent:'', controlled:[] } };

  body.append(
    section('Investigation design',
      el('input', { class: 'text', placeholder: 'Investigation title',
        on: { input: (e) => that.research.title = e.target.value } }),
      el('textarea', { class: 'text', placeholder: 'Hypothesis / research question', rows: 3,
        on: { input: (e) => that.research.hypothesis = e.target.value } }),
      el('div', { class: 'row' },
        el('span', { text: 'Independent variable:' }),
        el('input', { class: 'text', placeholder: 'e.g. concentration of acid',
          on: { input: (e) => that.research.variables.independent = e.target.value } }),
        el('span', { text: 'Dependent variable:' }),
        el('input', { class: 'text', placeholder: 'e.g. volume of gas per 10 s',
          on: { input: (e) => that.research.variables.dependent = e.target.value } }) ),
      el('div', { class: 'row' },
        el('span', { text: 'Controls:' }),
        el('input', { class: 'text', placeholder: 'temperature, acid volume, surface area',
          on: { input: (e) => that.research.variables.controlled = commaSplit(e.target.value) } }) ) )); // intentionally: inner row with 4 args

  body.append(section('Raw data',
    el('p', { class: 'muted', text: 'Enter the independent variable value for this run, then the list of readings.' })));
  const tableWrap = el('div', { class: 'data-table-wrap' });
  body.append(tableWrap);

  body.append(section('Add a run',
    el('div', { class: 'row' },
      el('span', { text: 'Independent variable:' }),
      el('input', { class: 'text', placeholder: 'e.g. 1.0 mol/dm3',
        on: { input: (e) => that.research.variables.independent = e.target.value } }) ),
    el('textarea', { class: 'text', placeholder: 'Readings separated by commas (e.g. 4.2, 4.4, 4.3, 4.5, 4.3)', rows: 2,
      on: { input: (e) => that.research.runs = commaNumbers(e.target.value) } }),
    button('Record', () => { recordRun(that); that.renderResearch(); })));

  body.append(section('Analysis',
    button('Analyse readings', () => { analyse(that); }),
    button('Show graph', () => { showGraph(that); }),
    button('Export CSV', () => { exportCsv(that); })));

  o.append(body);
  return o;
}

function commaSplit(v) { try { if (!v) return []; return v.split(',').map(s=>s.trim()).filter(Boolean); } catch { return []; } }
function commaNumbers(v) { try { if (!v) return []; return v.split(',').map(s=>parseFloat(s.trim())).filter(n=>Number.isFinite(n)); } catch { return []; } }

function recordRun(that) {
  const ds = that.research.dataset || new Dataset({
    name: that.research.title || 'Research data',
    columns: [
      { key: 'trial', label: 'trial', unit: '' },
      { key: 'value', label: that.research.variables.dependent || 'reading', unit: '' },
      { key: 'x', label: that.research.variables.independent || 'independent', unit: '' }
    ]
  });
  if (!that.research.dataset) that.research.dataset = ds;
  const xLabel = that.research.variables.independent || '';
  if (xLabel && that.research.runs && that.research.runs.length) {
    for (let i = 0; i < that.research.runs.length; i++) {
      ds.addRow({ trial: ds.length + 1, value: that.research.runs[i], x: xLabel });
    }
  }
  that.research.runs = [];
  that.research.variables.independent = '';
  that.status('Run recorded. Add more or analyse the data.');
}

function analyse(that) {
  const ds = that.research?.dataset;
  if (!ds) { that.status('Record at least one run first.'); return; }
  const values = ds.series('value');
  const m = mean(values);
  const u = uncertaintyOfMean(values);
  const anomalies = identifyAnomalies(values, 2);
  that.status(`Mean: ${m.toFixed(4)} ± ${u.toFixed(4)} · ${anomalies.length} anomaly(s) · ${values.length} readings`);
}

function showGraph(that) {
  const ds = that.research?.dataset;
  if (!ds) { that.status('Record at least one run first.'); return; }
  const canvas = document.createElement('canvas');
  canvas.width = 560; canvas.height = 260;
  const chart = new Chart(canvas);
  const xLabel = ds.columns.find(c=>c.key==='value')?.label || '';
  const yLabel = ds.columns.find(c=>c.key==='x')?.label || 'independent';
  chart.setData(ds.paired('trial', 'value'), { xLabel, yLabel });
  that.dom.overlay.append(canvas);
  that.status('Graph shown.');
}

function exportCsv(that) {
  const ds = that.research?.dataset;
  if (!ds) { that.status('Record at least one run first.'); return; }
  downloadText(timestampName('research', 'csv'), ds.toCSV(), 'text/csv');
  that.status('Research data exported.');
}
