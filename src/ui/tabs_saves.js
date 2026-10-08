import { el, clear, button, table, section } from './dom.js';
import { listSaves, loadLab as readSave, deleteSave as deleteLab, exportJSON, timestampName, downloadText } from '../core/storage.js';

export function renderSaves(that) {
  if (!that.dom.overlay) return null;
  const o = that.dom.overlay;
  clear(o);
  const body = el('div', { class: 'modal-body' });
  body.append(el('h2', { text: 'Saved experiments' }));

  const saves = listSaves();

  body.append(section('Manage',
    button('New experiment', () => that.saveLab()),
    button('Import', () => that.importSave()),
    button('Delete first', () => {
      const current = listSaves();
      if (!current.length) {
        that.status('No saves to delete.');
        return;
      }
      if (confirm(`Delete "${current[0].name}"?`)) {
        that.removeSave(current[0].id);
        renderSaves(that);
      }
    }),
    button('Export all as JSON', () => {
      const current = listSaves();
      const records = current
        .map(s => readSave(s.id))
        .filter(r => r?.ok)
        .map(r => r.data);
      downloadText(
        timestampName('vsl-backup', 'json'),
        JSON.stringify({ exportedAt: new Date().toISOString(), saves: records }, null, 2),
        'application/json'
      );
      that.status('Saved experiments exported.');
    })
  ));

  if (saves.length) {
    const rows = saves.map(s => [
      s.name,
      s.description || '',
      s.subject || '',
      s.level || '',
      new Date(s.savedAt).toLocaleString(),
      el('div', { class: 'btn-group' },
        button('Load', () => that.loadSave(s.id)),
        button('Remove', () => {
          that.removeSave(s.id);
          renderSaves(that);
        }, 'danger')
      )
    ]);
    body.append(section('Saved experiments',
      table(['Name', 'Description', 'Subject', 'Level', 'Time', 'Actions'], rows)
    ));
  } else {
    body.append(section('No saves yet',
      el('p', {
        class: 'muted',
        text: 'Create an experiment, build it up on the bench, then save your work.'
      })
    ));
  }

  o.append(body);
  return o;
}

export { listSaves, readSave, deleteLab, exportJSON, timestampName, downloadText };
