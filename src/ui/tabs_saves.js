import { el, clear, button, table, section, chip, select, badge, fmt } from './dom.js';
import { listSaves, loadLab, deleteSave as deleteLab, saveLab, validateSave, importJSON, exportJSON, makeSave, timestampName, downloadText } from '../core/storage.js';

export function renderSaves(that) {
  if (!that.dom.overlay) return null;
  const o = that.dom.overlay;
  clear(o);
  const body = el('div', { class: 'modal-body' });
  body.append(el('h2', { text: 'Saved experiments' }));

  body.append(
    section('Manage',
      button('New experiment', () => { that.saveLab(true); }),
      button('Import', () => { that.importSave(); }),
      button('Delete first', () => {
        const saves = that.saves();
        if (saves.length === 0) { that.status('No saves to delete.'); return; }
        if (confirm('Delete the first save?')) {
          const id = saves[0].id;
          that.removeSave(id);
          that.status(`Deleted ${id}`);
          that.renderSaves();
        }
      }),
      button('Export all as JSON', () => {
        const saves = that.saves();
        const backup = {
          exportedAt: new Date().toISOString(),
          saves: saves.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description || '',
            subject: s.subject,
            level: s.level,
            savedAt: s.savedAt,
            world: s.world,
            notebook: s.notebook
          }))
        };
        downloadText(timestampName('vsl-backup', 'json'), JSON.stringify(backup, null, 2), 'application/json');
        that.status('Downloaded.');
      }) ) );

  if (that.saves && that.saves().length) {
    const rows = that.saves().map(s => {
      const nameCell = el('strong', { text: s.name });
      const descCell = el('span', { class: 'muted', text: s.description || '' });
      const subjectCell = el('span', { text: s.subject });
      const levelCell = el('span', { text: s.level });
      const timeCell = el('span', { text: new Date(s.savedAt).toLocaleString() });
      const actionCell = el('div', { class: 'btn-group' },
        button('Load', { click: () => that.loadSave(s.id) }),
        button('Remove', { class: 'danger', click: () => { that.removeSave(s.id); that.renderSaves(); } }) );
      return [nameCell, descCell, subjectCell, levelCell, timeCell, actionCell];
    });
    body.append(section('Saved experiments',
      table(['Name', 'Description', 'Subject', 'Level', 'Time', 'Actions'], rows) ) );
  } else {
    body.append(section('No saves yet',
      el('p', { class: 'muted', text: 'Create an experiment, build it up on the bench, then save your work.' })));
  }

  o.append(body);
  return o;
}

renderSaves.afterSave = function(that, name) {
  that.renderSaves();
};

export { listSaves, loadLab, deleteLab, saveLab, validateSave, importJSON, exportJSON, makeSave, timestampName, downloadText, fmt };
