import { el, clear, badge, table } from './dom.js';

export function renderSafetyLog(that) {
  if (!that.dom.overlay) return null;
  const o = that.dom.overlay;
  clear(o);
  const body = el('div', { class: 'modal-body' });
  body.append( el('h2', { text: 'Safety log' }),
    el('p', { class: 'muted', text: 'Every reaction, electrolysis prediction and safety finding is recorded here live as the simulation runs.' }) );
  const log = that.log || [];
  if (log) {
    body.append( table(['time', 'severity', 'message'],
      log.slice(0, 300).map((e) => ({ time: new Date(e.at).toLocaleTimeString(), severity: e.severity || 'info', message: (e.text || '').slice(0, 100) + (e.text?.length > 100 ? '…' : '') }))
        .map((r) => [r.time, badge(r.severity || 'info', r.severity || 'info'), r.message]) ));
  }
  o.append(body);
  return o;
}
