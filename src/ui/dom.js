// Tiny DOM helpers used by the interface.  No framework: the lab is a single
// long-lived screen, so plain elements with direct updates are the simplest
// thing that works and keeps the bundle small.
export function el(tag, opts = {}, ...children) {
  const node = document.createElement(tag);
  if (opts.class) node.className = opts.class;
  if (opts.id) node.id = opts.id;
  if (opts.text != null) node.textContent = opts.text;
  if (opts.html != null) node.innerHTML = opts.html;
  if (opts.style) Object.assign(node.style, opts.style);
  if (opts.attrs) for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
  if (opts.on) for (const [k, v] of Object.entries(opts.on)) node.addEventListener(k, v);
  if (opts.dataset) Object.assign(node.dataset, opts.dataset);
  for (const c of children) if (c) node.append(c);
  return node;
}
export const qs = (sel, root = document) => root.querySelector(sel);
export const clear = (node) => { while (node.firstChild) node.removeChild(node.firstChild); return node; };
export const fmt = (v, dp = 1) => (v == null || Number.isNaN(v) ? '-' : Number(v).toFixed(dp));
export const chip = (text, cls = '') => el('span', { class: `chip ${cls}`.trim(), text });
export function button(label, onClick, cls = '') {
  return el('button', { class: `btn ${cls}`.trim(), text: label, on: { click: onClick } });
}
export function select(options, value, onChange) {
  const s = el('select', { class: 'select' });
  for (const o of options) {
    const opt = el('option', { text: o.label, attrs: { value: o.value } });
    if (o.value === value) opt.selected = true;
    s.append(opt);
  }
  s.addEventListener('change', () => onChange(s.value));
  return s;
}
export function slider({ min, max, step, value, onInput, label }) {
  const wrap = el('div', { class: 'sliderRow' });
  const input = el('input', { attrs: { type: 'range', min, max, step, value }, class: 'slider' });
  const out = el('span', { class: 'sliderValue', text: String(value) });
  input.addEventListener('input', () => { out.textContent = input.value; onInput(parseFloat(input.value)); });
  wrap.append(el('span', { class: 'sliderLabel', text: label || '' }), input, out);
  return wrap;
}
export function section(title, ...children) {
  const s = el('section', { class: 'panel-section' });
  s.append(el('h3', { class: 'panel-title', text: title }));
  for (const c of children) if (c) s.append(c);
  return s;
}
export function table(columns, rows, opts = {}) {
  const t = el('table', { class: 'data-table' });
  const thead = el('thead');
  const tr = el('tr');
  for (const c of columns) tr.append(el('th', { text: c.label ?? c }));
  thead.append(tr);
  const tbody = el('tbody');
  for (const r of rows) {
    const row = el('tr');
    for (const c of columns) {
      const key = c.key ?? c;
      const v = typeof r === 'object' ? r[key] : r;
      row.append(el('td', { text: v == null ? '' : String(v) }));
    }
    tbody.append(row);
  }
  t.append(thead, tbody);
  if (opts.maxHeight) t.style.maxHeight = opts.maxHeight;
  return t;
}
export function badge(text, kind = 'info') {
  return el('span', { class: `badge badge-${kind}`, text });
}
