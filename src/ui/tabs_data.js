import { el, clear, button, select, section, table, chip } from './dom.js';
import { Chart } from './charts.js';
import { Dataset } from '../core/storage.js';
import { downloadText, timestampName, toCSV } from '../core/storage.js';
import { identifyAnomalies, stdDev, uncertaintyOfMean, mean, percentageError, significantFigures } from '../core/measurement.js';

export function renderData(that) {
  if (!that.dom.overlay) return null;
  const o = that.dom.overlay;
  clear(o);
  const body = el('div', { class: 'modal-body' });
  body.append( el('h2', { text: 'Data and graphs' }),
    el('p', { class: 'muted', text: 'Every instrument reading logged at the bench is collected here and plotted.' }) );
  const panels = el('div', { class: 'grid' });
  body.append(panels);
  const logs = that.world ? that.world.logs() : [];
  for (const log of logs) {
    const canvas = el('canvas', { attrs: { width: '460', height: '220' } });
    const row = el('div', { class: 'notebox' });
    row.append( el('h3', { text: log.name } ) );
    row.append( canvas );
    const chart = new Chart(canvas);
    const ds = log.dataset;
    if (ds.length) {
      chart.setData(ds.paired('t', 'value'), { xLabel: 'time (s)', yLabel: ds.columns.find(c=>c.key==='value')?.label || 'value' });
      row.append( el('p', { class: 'muted', text: `${ds.length} readings · mean ${fmt(mean(ds.series('value')),3)} · ${ds.errors && ds.errors.length ? ds.errors.length + ' anomalies' : ''}` }) );
      row.append( el('div', { class: 'buttonrow' },
        button('Update', () => { chart.setData(ds.paired('t','value'), { xLabel:'time (s)', yLabel: ds.columns.find(c=>c.key==='value')?.label || 'value' }); }),
        button('Clear readings', () => { ds.clear(); that.status('Clear readings.'); }),
        button('Export CSV', () => { downloadText(timestampName('data', 'csv'), ds.toCSV(), 'text/csv'); that.status('Downloaded.'); }) ) );
    }
    panels.append(row);
  }
  if (!logs.length) {
    body.append( el('p', { class: 'muted', text: 'No data logged yet. Switch to the bench, start logging an instrument, then come back here.' }) );
  }
  o.append(body);
  return o;
}

function fmt(v, dp) { return v == null || Number.isNaN(v) ? '-' : Number(v).toFixed(dp||2); }
