import { el, clear, button, select, section, table, chip, badge } from './dom.js';
import { SUBJECTS, LEVELS, experimentsBy, searchExperiments, experimentCounts, getExperiment } from '../core/experiments/index.js';
import { EXPERIMENTS } from '../core/experiments/schema.js';

export function renderLibrary(that) {
  if (!that.dom.overlay) return null;
  const o = that.dom.overlay;
  clear(o);
  const body = el('div', { class: 'modal-body' });
  body.append(el('h2', { text: 'Experiments' }));
  const search = el('input', { class: 'search', attrs: { type: 'search', placeholder: 'Search experiments...' } });
  search.addEventListener('input', () => { that.experimentFilter.q = search.value; that._renderLibraryBody(body); });
  const filters = el('div', { class: 'chips' });
  const subjectBtns = SUBJECTS.map((s) => ({ id: s.id, label: s.label }));
  const levelBtns = LEVELS.map((l) => ({ id: l.id, label: l.label }));
  filters.append(el('span', { text: 'All ' + subjectBtns.length + ' subjects' }));
  for (const s of subjectBtns) {
    const b = el('button', { class: `chip-btn ${that.experimentFilter.subject === s.id ? 'active' : ''}`, text: s.label });
    b.addEventListener('click', () => { that.experimentFilter.subject = s.id; that._renderLibraryBody(body); });
    filters.append(b);
  }
  body.append( search, filters );
  body.append(that._renderLibraryBody(body));
  o.append(body);
  return o;
}

renderLibrary._renderLibraryBody = function(that, body) {
  const counts = experimentCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const q = that.experimentFilter.q;
  const experiments = q ? searchExperiments(q) : experimentsBy(that.experimentFilter);
  const box = section('Results', el('p', { class: 'muted', text: `${experiments.length} of ${total} experiments` }));
  if (experiments.length) {
    const grid = el('div', { class: 'grid' });
    box.append(grid);
    for (const e of experiments) {
      const card = el('div', { class: 'card experiment' });
      card.append( el('h3', { text: e.name }), el('p', { class: 'muted', text: `${e.subject} · ${e.level} · ${e.duration}` }) );
      card.append( el('p', { class: 'obj-name', text: e.objective }) );
      if (e.theory) card.append( el('p', { class: 'muted', text: e.theory.slice(0, 280) }) );
      card.append( section('Setup',
        el('p', { text: `Apparatus: ${e.apparatus.map(a=>a.name).join(', ')}` }),
        el('p', { text: `Substances: ${e.substances.map(s=>s.name).join(', ')}` }) ));
      if (e.safety.length) {
        const sev = e.safetyText ? e.safetyText : e.safety.length;
        card.append( section('Safety',
          el('div', { class: 'chips' }, ...e.safety.map((s)=>badge(s, 'caution'))),
          el('p', { class: 'muted', text: sev }) ));
      }
      if (e.questions) card.append( section('Questions', ...e.questions.slice(0,4).map(q=> el('p', { text: q }))) );
      card.addEventListener('click', () => { that.openExperiment = e; that.renderLibrary(); that.renderNotebook(); });
      grid.append(card);
    }
  } else {
    box.append( el('p', { class: 'muted', text: 'No experiments match your search. Try a different subject, level or keyword.' }) );
  }
  return box;
};

export function renderLibraryBody(that) {
  const body = document.createElement('div');
  return renderLibrary(that).__renderLibraryBody(that, body);
}
