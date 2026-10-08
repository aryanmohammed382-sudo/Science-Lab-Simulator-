import { el, clear, fmt, table, button, section } from './dom.js';
import { Dataset, downloadText, timestampName } from '../core/storage.js';

export function mountNotebookTab(that) {
  return renderNotebook(that);
}

export function renderNotebook(that) {
  const body = el('div', { class: 'modal-body' });
  body.append(el('h2', { text: that.notebook.title }));

  const nav = el('div', { class: 'tabs' });
  const content = el('div');
  let activeTab = 'entries';

  const tabs = [
    ['entries', 'Entries'],
    ['data', 'Data tables'],
    ['writeup', 'Write-up'],
    ['export', 'Export']
  ];

  const render = () => {
    clear(content);
    for (const [id, label] of tabs) {
      const b = el('button', {
        class: `smalltab ${activeTab === id ? 'active' : ''}`,
        text: label
      });
      b.addEventListener('click', () => {
        activeTab = id;
        render();
      });
      nav.append(b);
    }

    if (activeTab === 'entries') {
      content.append(
        table(['time', 'kind', 'title', 'text'],
          that.notebook.entries.slice().reverse().slice(0, 200)
            .map(e => [
              new Date(e.at).toLocaleTimeString(),
              e.kind,
              e.title,
              (e.text || '').slice(0, 160)
            ])
        ),
        el('p', { class: 'muted', text: `Total entries: ${that.notebook.entries.length}` })
      );

      const title = el('input', {
        class: 'text',
        attrs: { placeholder: 'Title' }
      });
      const text = el('textarea', {
        class: 'text',
        attrs: { placeholder: 'Observation / measurement / conclusion...', rows: 4 }
      });
      content.append(section('Add entry',
        title,
        text,
        button('Save entry', () => {
          if (!text.value.trim() && !title.value.trim()) {
            that.status('Enter a title or observation first.');
            return;
          }
          that.notebook.add({
            kind: 'observation',
            title: title.value.trim() || 'Observation',
            text: text.value.trim()
          });
          that.notebook.save();
          that.status('Notebook entry saved.');
          render();
        })
      ));
    } else if (activeTab === 'data') {
      content.append(
        table(['name', 'rows', 'columns'],
          that.notebook.datasets.map(ds => [
            ds.name,
            ds.length,
            ds.keys.join(', ')
          ])
        ),
        section('Add table',
          button('New data table', () => {
            that.notebook.datasets.push(new Dataset({ name: 'Data table' }));
            that.notebook.save();
            that.status('Data table created.');
            render();
          })
        )
      );
    } else if (activeTab === 'writeup') {
      const markdown = that.notebook.toMarkdown();
      content.append(
        el('h3', { text: 'Full write-up' }),
        el('pre', { class: 'writeup', text: markdown.slice(0, 12000) }),
        el('div', { class: 'buttonrow' },
          button('Copy', async () => {
            try {
              await navigator.clipboard?.writeText(markdown);
              that.status('Write-up copied.');
            } catch {
              that.status('Copy is unavailable in this browser.');
            }
          }),
          button('Download as markdown', () => {
            downloadText(timestampName('notebook', 'md'), markdown, 'text/markdown');
            that.status('Downloaded.');
          })
        )
      );
    } else if (activeTab === 'export') {
      content.append(
        el('h3', { text: 'Export' }),
        el('div', { class: 'buttonrow' },
          button('Download notebook as JSON', () => {
            downloadText(
              timestampName('notebook', 'json'),
              JSON.stringify(that.notebook.toJSON(), null, 2),
              'application/json'
            );
            that.status('Downloaded.');
          }),
          button('Download first table as CSV', () => {
            const ds = that.notebook.datasets[0];
            if (!ds) {
              that.status('No data tables to export.');
              return;
            }
            downloadText(timestampName('experiment', 'csv'), ds.toCSV(), 'text/csv');
            that.status('Downloaded.');
          }),
          button('Download notebook as markdown', () => {
            downloadText(timestampName('experiment', 'md'), that.notebook.toMarkdown(), 'text/markdown');
            that.status('Downloaded.');
          })
        )
      );
      if (that.notebook.datasets.length) {
        content.append(section('Available datasets',
          ...that.notebook.datasets.map(ds => {
            const box = el('div', { class: 'notebox' });
            box.append(
              el('h4', { text: ds.name }),
              table(ds.columns.map(c => c.label || c.key), ds.rows.slice(0, 12)),
              button('View all rows', () => {
                that.currentDataset = ds;
                that.status(`${ds.name}: ${ds.length} rows`);
              })
            );
            return box;
          })
        ));
      } else {
        content.append(el('p', {
          class: 'muted',
          text: 'No data tables yet. Record an instrument reading while logging in the bench tab.'
        }));
      }
    }
  };

  render();
  body.append(nav, content);
  return body;
}
