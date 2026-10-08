import { el, clear, button, select, section, table, chip, badge } from './dom.js';
import { SUBJECTS, LEVELS, experimentsBy, searchExperiments, experimentCounts } from '../core/experiments/index.js';

function buildLibraryBody(that) {
  const body = el('div', { class: 'modal-body' });
  body.append(el('h2', { text: 'Experiments' }));

  const search = el('input', {
    class: 'search',
    attrs: { type: 'search', placeholder: 'Search experiments...' }
  });
  const filters = el('div', { class: 'chips' });
  const results = el('div');

  const renderResults = () => {
    clear(results);
    const counts = experimentCounts();
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const q = search.value.trim();
    const experiments = q
      ? searchExperiments(q, { subject: that.experimentFilter?.subject, level: that.experimentFilter?.level })
      : experimentsBy(that.experimentFilter || {});

    const box = section('Results', el('p', {
      class: 'muted',
      text: `${experiments.length} of ${total} experiments`
    }));

    if (!experiments.length) {
      box.append(el('p', {
        class: 'muted',
        text: 'No experiments match your search. Try a different subject, level or keyword.'
      }));
      results.append(box);
      return;
    }

    const grid = el('div', { class: 'grid' });
    for (const experiment of experiments) {
      const card = el('div', { class: 'card experiment' });
      card.append(
        el('h3', { text: experiment.name }),
        el('p', { class: 'muted', text: `${experiment.subject} · ${experiment.level} · ${experiment.duration}` }),
        el('p', { class: 'obj-name', text: experiment.objective })
      );
      if (experiment.theory) {
        card.append(el('p', { class: 'muted', text: experiment.theory.slice(0, 280) }));
      }
      card.append(section('Setup',
        el('p', { text: `Apparatus: ${experiment.apparatus.map(a => a.name || a.id).join(', ') || 'As required'}` }),
        el('p', { text: `Substances: ${experiment.substances.map(s => s.name || s.id).join(', ') || 'As required'}` })
      ));
      if (experiment.safety?.length) {
        card.append(section('Safety',
          el('div', { class: 'chips' }, ...experiment.safety.map((s) => badge(s, 'caution')))
        ));
      }
      if (experiment.questions?.length) {
        card.append(section('Questions', ...experiment.questions.slice(0, 4).map(q => el('p', { text: q }))));
      }
      card.addEventListener('click', () => {
        that.openExperiment = experiment;
        that.status(`Selected experiment: ${experiment.name}`);
        renderResults();
      });
      grid.append(card);
    }
    box.append(grid);
    results.append(box);
  };

  search.addEventListener('input', renderResults);

  const addFilter = (label, options, current, setter) => {
    const wrap = el('div', { class: 'chips' });
    wrap.append(el('span', { class: 'muted', text: label }));
    for (const option of options) {
      const b = el('button', {
        class: `chip-btn ${current === option.id ? 'active' : ''}`,
        text: option.label
      });
      b.addEventListener('click', () => {
        setter(option.id);
        clear(filters);
        buildFilters();
        renderResults();
      });
      wrap.append(b);
    }
    return wrap;
  };

  const buildFilters = () => {
    clear(filters);
    const subjectWrap = addFilter(
      'Subject:',
      [{ id: '', label: 'All subjects' }, ...SUBJECTS],
      that.experimentFilter?.subject || '',
      (id) => { that.experimentFilter.subject = id; }
    );
    const levelWrap = addFilter(
      'Level:',
      [{ id: '', label: 'All levels' }, ...LEVELS],
      that.experimentFilter?.level || '',
      (id) => { that.experimentFilter.level = id; }
    );
    filters.append(subjectWrap, levelWrap);
  };

  that.experimentFilter ||= { subject: '', level: '', q: '' };
  buildFilters();
  body.append(search, filters, results);
  renderResults();
  return body;
}

export function renderLibrary(that) {
  if (!that.dom.overlay) return null;
  const o = that.dom.overlay;
  clear(o);
  const body = buildLibraryBody(that);
  o.append(body);
  return o;
}

export function renderLibraryBody(that) {
  return buildLibraryBody(that);
}
