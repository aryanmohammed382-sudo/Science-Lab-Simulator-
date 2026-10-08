import { el, clear, fmt, table, button, select, section } from './dom.js';
import { Notebook, Dataset, toCSV, downloadText, timestampName, exportJSON } from '../core/storage.js';
import { identifyAnomalies, mean, stdDev, uncertaintyOfMean, percentageError, significantFigures } from '../core/measurement.js';

export function mountNotebookTab(that) {
  return {
    render() { return that.renderNotebook(); },
    refresh() { that.renderNotebook(); }
  };
}
export function renderNotebook(that) {
  const modal = that.dom.notebookModal;
  if (!modal) return null;
  clear(modal.classList.add('hidden'));
  const body = el('div', { class: 'modal-body' });
  body.append(el('h2', { text: that.notebook.title }));
  const nav = el('div', { class: 'tabs' });
  const notebookTabs = [
    { id: 'entries', label: 'Entries' },
    { id: 'data', label: 'Data tables' },
    { id: 'writeup', label: 'Write-up' },
    { id: 'export', label: 'Export' }
  ];
  let notebookTab = 'entries';
  for (const t of notebookTabs) {
    const b = el('button', { class: `smalltab`, text: t.label, attrs: { id: 'nbTab_' + t.id } });
    b.addEventListener('click', () => { notebookTab = t.id; renderNotebookInner(that, modal, notebookTab); });
    nav.append(b);
  }
  body.append(nav, section('Contents', el('p', { class: 'muted', text: `Click any experiment to write in this notebook alongside the live run.` }) ));
  modal.append(body, el('div', { class: 'modal-foot' },
    el('div', { class: 'buttonrow' },
      button('Add entry', () => { that.notebook.add({ kind: 'observation', kind: 'observation', title: 'Untitled', text: '', tags: ['notebook'] }); that.notebook.save(); that.renderNotebook(); }),
      button('Clear', () => { if (confirm('Clear all notebook entries?')) { that.notebook.clear(); that.notebook.save(); that.renderNotebook(); } }))));

  return modal;
}

function renderNotebookInner(that, modal, tab) {
  const body = modal.querySelector('.modal-body');
  clear(body);
  if (tab === 'entries') {
    body.append(table(['time', 'kind', 'title', 'text'],
      that.notebook.entries.slice().reverse().slice(0, 200)
        .map((e) => ({ time: new Date(e.at).toLocaleTimeString(), kind: e.kind, title: e.title, text: (e.text || '').slice(0, 120) }))
        .map((r) => [r.time, r.kind, r.title, r.text])),
      el('p', { class: 'muted', text: `Total entries: ${that.notebook.entries.length}` }));
    body.append(section('Add entry',
      el('input', { class: 'text', attrs: { placeholder: 'Title' } }),
      el('textarea', { class: 'text', attrs: { placeholder: 'Observation / measurement / conclusion...', rows: 4 } }),
      button('Save', () => { that.notebook.add({ kind: 'observation', title: '', text: '' }); that.notebook.save(); that.renderNotebook(); })));
  } else if (tab === 'data') {
    body.append(table(['name', 'rows', 'columns'],
      that.notebook.datasets.map((ds) => ({ name: ds.name, rows: ds.length, columns: ds.keys.join(', ') })),
      { maxHeight: '200px' }));
    body.append(section('Add table',
      el('input', { class: 'text', attrs: { placeholder: 'Table name (e.g. Temperature over time)' } }),
      button('New table', () => { that.notebook.datasets.push(new Dataset({ name: 'Data table' })); that.notebook.save(); that.renderNotebook(); })));
  } else if (tab === 'writeup') {
    body.append(el('h3', { text: 'Full write-up' }));
    body.append(el('pre', { class: 'writeup', text: that.notebook.toMarkdown().slice(0, 6000) }));
    body.append(el('div', { class: 'buttonrow' },
      button('Copy', () => { navigator.clipboard?.writeText(that.notebook.toMarkdown()); that.status('Write-up copied.'); }),
      button('Download as markdown', () => { downloadText(timestampName('notebook', 'md'), that.notebook.toMarkdown(), 'text/markdown'); that.status('Downloaded.'); })));
  } else if (tab === 'export') {
    body.append(el('h3', { text: 'Export' }));
    body.append(el('div', { class: 'buttonrow' },
      button('Download notebook as JSON', () => { downloadText(timestampName('notebook', 'json'), JSON.stringify(that.notebook.toJSON(), null, 2), 'application/json'); that.status('Downloaded.'); }),
      button('Download CSV of first table', () => { that.notebook.datasets[0]?.toCSV() ? downloadText(timestampName('experiment', 'csv'), that.notebook.datasets[0]?.toCSV() || '', 'text/csv') : that.status('No tables to export.'); }),
      button('Download notebook as markdown', () => { downloadText(timestampName('experiment', 'md'), that.notebook.toMarkdown(), 'text/markdown'); })));

    const tableList = el('div', { class: 'panel-section' });
    if (that.notebook.datasets.length) {
      tableList.append(el('p', { class: 'muted', text: 'Available datasets' }));
      for (const ds of that.notebook.datasets) {
        const box = el('div', { class: 'notebox' });
        box.append(el('h4', { text: ds.name }));
        box.append(table(ds.columns.map((c) => c.label || c.key), ds.rows.slice(0, 12)));
        box.append(button('View all rows', () => { that.currentDataset = ds; that.renderNotebook(); }));
        tableList.append(box);
      }
    }
    body.append(tableList);
    if (that.notebook.datasets.length === 0) body.append(el('p', { class: 'muted', text: 'No data tables yet. Record an instrument reading while logged in the bench tab.' }));
  }
}
