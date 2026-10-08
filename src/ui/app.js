import { el, clear, fmt, chip, button, select, slider, section, table, badge } from './dom.js'
import { APPARATUS, apparatusByCategory, APPARATUS_CATEGORIES, searchApparatus, allApparatus } from '../core/apparatus.js'
import { SUBSTANCES, SUBSTANCE_CATEGORIES, searchSubstances, allSubstances } from '../core/substances.js'
import { Notebook, Dataset, toCSV, downloadText, timestampName, exportJSON, saveLab, loadLab, deleteSave, makeSave, validateSave } from '../core/storage.js'
import { round } from '../core/util.js'
import { renderNotebook as renderNotebookInner } from './tabs_notebook.js';
import { renderLibraryBody } from './tabs_library.js'
import { renderSafetyLog } from './tabs_safety.js'
import { renderData } from './tabs_data.js'
import { renderResearch } from './tabs_research.js'
import { renderSaves } from './tabs_saves.js'
export class LabUI {
  constructor({ world, interaction, notebook = new Notebook(), onCameraMode = null, onGhost = null, onSelect = null }) {
    this.world = world
    this.interaction = interaction
    this.notebook = notebook
    this.onCameraMode = onCameraMode
    this.onGhost = onGhost
    this.onSelect = onSelect
    this.selectedId = null
    this.pourTarget = null
    this.pipetteSource = null
    this.pipetteTarget = null
    this.log = []
    this.tab = 'bench'
    this.inventoryFilter = { category: 'glassware' }
    const SC = SUBSTANCE_CATEGORIES
    this.reagentCategory = (SC && SC[0] && SC[0].id) || 'acid'
    this.saveLab = this._saveLab.bind(this)
    this.resetLab = this._resetLab.bind(this)
    this.loadSave = this._loadSave.bind(this)
    this.removeSave = this._removeSave.bind(this)
    this.extractSave = this._extractSave.bind(this)
    this.importSave = this._importSave.bind(this)
    this.placeFromInventory = this._placeFromInventory.bind(this)
    this.dispenseReagent = this._dispenseReagent.bind(this)
    this.renderSaves = () => this._renderSaves()
    this.renderLibrary = () => this._renderLibrary()
    this.renderNotebook = () => this._renderNotebook()
    this.renderSafetyLog = () => this._renderSafetyLog()
    this.renderData = () => this._renderData()
    this.renderResearch = () => this._renderResearch()
    this.status = this._status.bind(this)
    this.focusSelected = this._focusSelected.bind(this)
    this.recordReading = this._recordReading.bind(this)
    this._renderInspector = this._renderInspector.bind(this)
    this.dom = {}
    this.labSinks = {
      saveLab: this.saveLab, resetLab: this.resetLab, loadSave: this.loadSave,
      removeSave: this.removeSave, extractSave: this.extractSave, importSave: this.importSave,
      placeFromInventory: this.placeFromInventory, dispenseReagent: this.dispenseReagent,
      renderSaves: this.renderSaves, renderLibrary: this.renderLibrary,
      renderNotebook: this.renderNotebook, renderSafetyLog: this.renderSafetyLog,
      renderData: this.renderData, renderResearch: this.renderResearch,
      renderNotebookInner: this.renderNotebook, status: this.status,
      focusSelected: this.focusSelected, recordReading: this.recordReading,
      renderInspector: this._renderInspector, onSelect: onSelect, onGhost: onGhost,
      cameraMode: onCameraMode
    }
  }
  mount(rootContainer) {
    // Replace the HTML boot screen with the real application shell.
    // The boot screen is intentionally present in index.html so a slow load
    // never flashes a blank page, but it must not remain in the document after
    // the UI has mounted because it occupies the full viewport.
    clear(rootContainer)
    const root = el('div', { class: 'app' })
    this.dom.canvasHost = null
    root.append(this.buildTopBar())
    root.append(el('div', { class: 'main' }, this.buildLeft(), this.buildCentre(), this.buildRight()))
    root.append(this.buildStatusBar())
    rootContainer.appendChild(root)
    document.body.classList.add('lab-app')
    this.dom.notebookModal = el('div', { class: 'modal hidden' })
    return root
  }
  cameraMode(v) { if (this.interaction && v !== undefined) this.interaction.setCameraMode(v) }

  // Place an apparatus selected from the inventory without bypassing the
  // existing Interaction/ghost-placement system.
  _placeFromInventory(def) {
    if (!def) return
    if (!this.interaction) {
      this._status('Interaction system is not available.')
      return
    }
    this.interaction.startGhost(def)
  }

  // Dispense a standard 25 mL portion of a shelf reagent into the selected
  // container. This keeps the reagent shelf tied to the same World.fill()
  // chemistry/reaction engine used elsewhere in the simulator.
  _dispenseReagent(sub) {
    if (!sub) return
    const obj = this.selectedObject()
    if (!obj || !obj.mixture) {
      this._status('Select a container before dispensing a reagent.')
      return
    }
    const result = this.world.fill(obj.id, { substanceId: sub.id, volumeML: 25 })
    if (result?.error) {
      this._status(result.error, 'danger')
      return
    }
    this._status(`Added 25 mL of ${sub.name} to the ${obj.name}.`)
    this._refresh()
  }
  _focusSelected() { if (this.interaction) this.interaction.focusSelected() }
  onSelect(id) { this.selectedId = id; this._refresh(); this._renderInspector() }
  onGhost(def) { this.onGhost && this.onGhost(def) }
  _status(text, severity) {
    if (!this.dom || !this.dom.status) return
    this.dom.status.textContent = text
    this.dom.status.className = 'status-text' + (severity ? ' sev-' + severity : '')
  }
  _recordReading(obj) {
    const r = obj.state && obj.state.lastReading || {}
    if (!r.kind) { this._status('No reading to record yet.'); return }
    let ds = this.notebook.datasets.find(d => d.name === `${r.kind} readings`)
    if (!ds) {
      ds = new Dataset({ name: `${r.kind} readings`, columns: [
        { key: 't', label: 'time', unit: 's' },
        { key: 'value', label: r.kind, unit: r.unit || '' }
      ] })
      this.notebook.datasets.push(ds)
    }
    ds.addRow({ t: round(this.world ? this.world.time : 0, 1), value: r.value })
    this.notebook.add({ kind: 'measurement', title: `${obj.name} ${r.kind} reading`, text: r.text,
      data: { value: r.value, trueValue: r.trueValue }, tags: ['measurement'] })
    this.notebook.save()
    this._status(`Recorded ${r.text}.`)
    if (this.tab === 'data') this._renderData()
  }
  _refresh() {
    if (!this.dom) return
    if (this.tab === 'bench') { this._renderInventory(); this._renderReagents(); this._renderInspector() }
    if (this.tab === 'library') renderLibraryBody(this)
    if (this.tab === 'notebook') renderNotebookInner(this)
    if (this.tab === 'safety') renderSafetyLog(this)
    if (this.tab === 'data') renderData(this)
    if (this.tab === 'research') renderResearch(this)
    if (this.tab === 'saves') renderSaves(this)
  }

  buildTopBar() {
    const bar = el('header', { class: 'topbar' })
    bar.append(el('div', { class: 'brand' }, el('span', { class: 'brand-mark', text: 'VR' }), el('span', { text: 'Virtual Science Laboratory' })))
    const tabs = el('nav', { class: 'tabs' })
    const tabDefs = [['bench','Bench'],['library','Experiments'],['notebook','Notebook'],['safety','Safety log'],['data','Data & graphs'],['research','Research mode'],['saves','Saves']]
    tabDefs.forEach(([id, label]) => {
      const b = el('button', { class: `tab ${id}`, text: label, on: { click: () => this.setTab(id) } })
      tabs.append(b)
      this.dom['tab_' + id] = b
    })
    bar.append(tabs)
    const actions = el('div', { class: 'top-actions' })
    actions.append(
      el('label', { class: 'tooltip' }, el('span', { text: 'Goggles' }), el('input', { attrs: { type: 'checkbox' }, on: { change: (e) => { this.world.safetyContext.goggles = e.target.checked; this._status(e.target.checked ? 'Goggles on' : 'Goggles off'); } } })),
      el('label', { class: 'tooltip' }, el('span', { text: 'Lab coat' }), el('input', { attrs: { type: 'checkbox' }, on: { change: (e) => { this.world.safetyContext.labcoat = e.target.checked; this._status(e.target.checked ? 'Lab coat on' : 'Lab coat off'); } } })),
      el('label', { class: 'tooltip' }, el('span', { text: 'Gloves' }), el('input', { attrs: { type: 'checkbox' }, on: { change: (e) => { this.world.safetyContext.gloves = e.target.checked; this._status(e.target.checked ? 'Gloves on' : 'Gloves off'); } } })),
      select(Object.entries({ orbit: 'Orbit the lab', bench: 'Bench close-up', walk: 'Walk around' }).map(([k, v]) => ({ value: k, label: v })), 'orbit', (v) => this.cameraMode(v)),
      button('Save', () => this.saveLab(), 'primary'),
      button('Reset', () => this.resetLab(), 'danger')
    )
    bar.append(actions)
    return bar
  }

  buildLeft() {
    const panel = el('aside', { class: 'panel left' })
    this.dom.search = el('input', { class: 'search', attrs: { type: 'search', placeholder: 'Search apparatus...' } })
    this.dom.search.addEventListener('input', () => { this.inventoryFilter.q = this.dom.search.value; this._refresh() })
    this.dom.cats = el('div', { class: 'chips' })
    this.dom.inventory = el('div', { class: 'inventory-list' })
    this.dom.reagents = el('div', { class: 'inventory-list' })
    this.dom.reagentCats = el('div', { class: 'chips' })
    panel.append(this.dom.search)
    panel.append(section('Apparatus', this.dom.cats, this.dom.inventory))
    panel.append(section('Reagents on the shelf', this.dom.reagentCats, this.dom.reagents))
    return panel
  }

  buildCentre() {
    const wrap = el('main', { class: 'viewport' })
    const host = el('div', { class: 'canvas-host' })
    host.id = 'canvasHost'
    this.dom.canvasHost = host
    const overlay = el('div', { class: 'overlay hidden' })
    this.dom.overlay = overlay
    host.append(overlay)
    const hint = el('div', { class: 'hint', text: 'Drag to move apparatus · R+drag to rotate · T+drag to tilt · Shift+click terminals to wire · C camera · F focus · Del remove' })
    wrap.append(host, hint)
    return wrap
  }

  buildRight() {
    const panel = el('aside', { class: 'panel right' })
    this.dom.inspector = el('div', { class: 'inspector-body' })
    panel.append(el('h2', { class: 'panel-heading', text: 'Inspector' }), this.dom.inspector)
    return panel
  }

  buildStatusBar() {
    const bar = el('footer', { class: 'statusbar' })
    this.dom.status = el('span', { class: 'status-text', text: 'Ready.' })
    this.dom.clock = el('span', { class: 'status-clock', text: 't = 0 s' })
    bar.append(this.dom.status, this.dom.clock)
    return bar
  }

  _renderInventory() {
    const cats = this.dom.cats
    const list = this.dom.inventory
    if (!cats || !list) return
    clear(cats)
    const allCount = allApparatus().length
    const catOptions = [{ id: 'all', label: `All (${allCount})` }].concat(APPARATUS_CATEGORIES.map(c => ({ id: c.id, label: c.label })))
    catOptions.forEach(c => {
      const count = c.id === 'all' ? allCount : apparatusByCategory(c.id).length
      const b = el('button', { class: `chip-btn ${this.inventoryFilter.category === c.id ? 'active' : ''}`, text: `${c.label} (${count})` })
      b.addEventListener('click', () => { this.inventoryFilter.category = c.id; this._renderInventory() })
      cats.append(b)
    })
    const items = this.inventoryFilter.category === 'all' ? allApparatus() : apparatusByCategory(this.inventoryFilter.category)
    const filtered = this.inventoryFilter.q ? searchApparatus(this.inventoryFilter.q) : items
    clear(list)
    filtered.forEach(def => {
      const row = el('div', { class: 'inv-item' })
      row.append(el('span', { class: 'inv-name', text: def.name }))
      const flags = []
      if (def.container) flags.push('container ' + (def.capacityML != null ? def.capacityML + ' cm³' : 'no volume'))
      if (def.heatSource) flags.push('heat ' + (def.powerW != null ? def.powerW + ' W' : '? W'))
      if (def.instrument) flags.push('instrument')
      if (def.electrical) flags.push('electrical')
      row.append(el('span', { class: 'inv-meta', text: flags.length ? flags.join(' · ') : '' }))
      row.addEventListener('click', () => this.placeFromInventory(def))
      list.append(row)
    })
    if (!filtered.length) list.append(el('p', { class: 'muted', text: 'No apparatus matches your search.' }))
  }

  _renderReagents() {
    const cats = this.dom.reagentCats
    const list = this.dom.reagents
    if (!cats || !list) return
    clear(cats)
    SUBSTANCE_CATEGORIES.forEach(c => {
      const b = el('button', { class: `chip-btn ${this.reagentCategory === c.id ? 'active' : ''}`, text: c.label || c.id })
      b.addEventListener('click', () => { this.reagentCategory = c.id; this._renderReagents() })
      cats.append(b)
    })
    clear(list)
    allSubstances().filter(s => s.category === this.reagentCategory).forEach(sub => {
      const row = el('div', { class: 'inv-item reagent' })
      const swatch = el('span', { class: 'swatch' })
      swatch.style.background = sub.colour || '#cfd8e0'
      row.append(swatch, el('span', { class: 'inv-name', text: sub.name }))
      const haz = (sub.ghs || []).length
      row.append(el('span', { class: 'inv-meta', text: haz ? `${haz} hazard${haz !== 1 ? 's' : ''}` : 'low hazard' }))
      row.addEventListener('click', () => this.dispenseReagent(sub))
      list.append(row)
    })
  }

  setTab(tab) {
    if (!['bench','library','notebook','safety','data','research','saves'].includes(tab)) tab = 'bench'
    this.tab = tab
    if (this.dom) {
      Object.keys(this.dom).forEach(k => { if (k.startsWith('tab_')) this.dom[k].classList.toggle('active', k === 'tab_' + tab) })
    }
    if (this.dom && this.dom.overlay) {
      this.dom.overlay.classList.toggle('hidden', tab === 'bench')
      if (tab !== 'bench') {
        clear(this.dom.overlay)
        switch (tab) {
          case 'library':
            this.dom.overlay.append(renderLibraryBody(this))
            break
          case 'notebook':
            this.dom.overlay.append(renderNotebookInner(this))
            break
          case 'safety':
            renderSafetyLog(this)
            break
          case 'data':
            renderData(this)
            break
          case 'research':
            renderResearch(this)
            break
          case 'saves':
            renderSaves(this)
            break
        }
      }
    }
    this._refresh()
  }

  selectedObject() { return this.selectedId && this.world ? this.world.get(this.selectedId) : null }

  _renderInspector() {
    const body = this.dom.inspector
    if (!body) return
    clear(body)
    const obj = this.selectedObject()
    if (!obj) {
      body.append(
        el('p', { class: 'muted', text: 'Click a piece of apparatus in the scene to inspect it. Nothing is selected yet.' }),
        section('Quick actions',
          el('div', { class: 'buttonrow' },
            button('Clear the bench', () => { for (const o of this.world.list()) this.world.remove(o.id); this._status('Cleared.'); this._refresh() }),
            button('Add 250 mL beaker', () => { this.world.add('beaker_250', { surfaceId: 'bench_chem', x: 0, z: 0 }); this._status('Beaker placed.'); this._refresh() })
          )
        )
      )
      return
    }
    const info = this.world.inspect(obj.id)
    body.append(
      el('h3', { class: 'obj-name', text: info.name }),
      el('p', { class: 'muted', text: `${info.def.category} · ${info.def.material || ''}` }),
      el('div', { class: 'chips' },
        chip(`on ${info.surfaceId.replace(/_/g, ' ')}`),
        chip(`${fmt(info.temperatureC,1)} °C`, info.temperatureC > 60 ? 'warn' : ''),
        info.volumeML != null ? chip(`${fmt(info.volumeML,1)} cm³`, info.fillPercent > 90 ? 'warn' : '') : null,
        info.ph != null ? chip(`pH ${fmt(info.ph,2)}`, info.ph < 3 || info.ph > 11 ? 'warn' : '') : null,
        info.wired ? chip(`${info.wired} lead(s)`) : null,
        info.currentA != null ? chip(`${fmt(Math.abs(info.currentA),3)} A`) : null,
        info.voltageV != null ? chip(`${fmt(info.voltageV,2)} V`) : null
      )
    )
    if (obj.mixture) {
      body.append(section('Contents',
        info.layers > 1 ? el('p', { class: 'muted', text: `${info.layers} liquid layers - pour, decant or separate them.` }) : null,
        table(['name','formula','amount','state'],
          info.contents.map(c => [c.name, c.formula,
            c.grams != null ? `${fmt(c.grams,3)} g` : `${fmt(c.mol*1000,2)} mmol`,
            c.kind
          ]), { maxHeight: '180px' }),
        info.observations && info.observations.length ? el('ul', { class: 'observations' },
          ...info.observations.slice(-6).map(t => el('li', { text: t }))) : null
      ))
    }
    const controls = el('div', { class: 'buttonrow' })
    controls.append(
      button('Level it', () => { this.world.setTilt(obj.id, 0); this._refresh() }),
      button('Turn ±90°', () => { this.world.turn(obj.id, Math.PI/2); this._refresh() })
    )
    if (obj.mixture) {
      controls.append(button('Stir', () => { this.world.stir(obj.id); this._status(`Stirred the ${obj.name}.`); this._refresh() }))
      controls.append(button('Empty', () => { obj.mixture.clear(); this.world.refreshLiquid(obj); this._status(`${obj.name} emptied.`); this._refresh() }))
    }
    controls.append(button('Remove', () => { this.world.remove(obj.id); this.selectedId = null; this._status('Removed.'); this._refresh() }, 'danger'))
    body.append(section('Manipulate', controls))
    if (obj.group.userData.heatSource) {
      const heatControls = el('div', { class: 'buttonrow' })
      heatControls.append(
        button(obj.heatOn ? 'Turn off' : 'Turn on', () => { if (obj.heatOn) { this.world.setHeat(obj.id, false) } else { this.world.setHeat(obj.id, true, 1) }; this._refresh() }, obj.heatOn ? 'danger' : 'primary'),
        button('Full blast', () => { this.world.setHeat(obj.id, true, 1); this._refresh() }),
        button('Gentle', () => { this.world.setHeat(obj.id, true, 0.35); this._refresh() })
      )
      body.append(section('Heat', heatControls))
      if (obj.group.userData.flame) {
        const airSlider = slider({ min: 0, max: 1, step: 0.05, value: obj.group.userData.airHole ?? 0.5, label: 'air hole', onInput: (v) => { this.world.setAirHole(obj.id, v) } })
        body.append(section('Flame', airSlider))
      }
    }
    const others = this.world.list().filter(o => o.mixture && o !== obj)
    if (obj.mixture && others.length) {
      const target = select(others.map(o => ({ value: o.id, label: o.name })), this.pourTarget ?? (others[0] ? others[0].id : null), (v) => { this.pourTarget = v })
      const row = el('div', { class: 'buttonrow' })
      row.append(
        button('Pour in', () => { const t = this.world.get(this.pourTarget); if (t) { this.world.decantInto(t.id, obj.id); this._status(`Poured the ${obj.name} into the ${t.name}.`); this._refresh() } }, 'primary'),
        button('Pour out', () => { const t = this.world.get(this.pourTarget); if (t) { this.world.decantInto(obj.id, t.id); this._status(`Poured from the ${obj.name} into the ${t.name}.`); this._refresh() } }),
        button('Decant', () => { const t = this.world.get(this.pourTarget); if (t) { this.world.decantInto(obj.id, t.id, obj.mixture.aqVolume); this._status('Decanted.'); this._refresh() } })
      )
      body.append(section('Transfer to', target, row))
    }

    if (obj.electrical) {
      const leads = this.world.wiresOf(obj.id)
      body.append(section('Circuit',
        el('div', { class: 'chips' },
          ...leads.map(w => {
            const toName = this.world.get(w.to.objectId)?.name ?? '?'
            const fromName = this.world.get(w.from.objectId)?.name ?? '?'
            return chip(`${toName} ${w.to.terminal} ←→ ${fromName} ${w.from.terminal}`)
          })
        ),
        el('p', { class: 'muted', text: 'Shift+click a terminal in the scene to start a lead, then click another terminal.' }),
        obj.state.lastReading ? el('p', { class: 'reading', text: `${obj.name}: ${obj.state.lastReading.text}` }) : null
      ))
      if (obj.def.componentType === 'switch') {
        body.append(el('div', { class: 'buttonrow' },
          button(obj.state.closed ? 'Open the switch' : 'Close the switch', () => {
            obj.state.closed = !obj.state.closed
            this._status(`Switch ${obj.state.closed ? 'closed' : 'open'}.`)
            this._refresh()
          })
        ))
      }
    }
    if (obj.state.lastReading) {
      body.append(section('Reading',
        el('p', { class: 'reading', text: `${obj.name}: ${obj.state.lastReading.text}` }),
        el('p', { class: 'muted', text: `True value ${fmt(obj.state.lastReading.trueValue,3)} ${obj.state.lastReading.unit || ''} · resolution ${obj.state.lastReading.resolution ?? '-'}` }),
        el('div', { class: 'buttonrow' },
          button('Record in notebook', () => { this._recordReading(obj) }),
          button(this.world.logging?.has(obj.id) ? 'Stop logging' : 'Start logging', () => {
            if (this.world.logging?.has(obj.id)) this.world.stopLogging(obj.id)
            else this.world.startLogging(obj.id)
            this._status(this.world.logging?.has(obj.id) ? 'Logging to the data table.' : 'Logging stopped.')
            this._refresh()
          })
        )
      ))
    }
    if (info.polarity) body.append(el('p', { class: 'muted', text: `This electrode is acting as the ${info.polarity}.` }))
    if (info.safetyHint) body.append(el('p', { class: 'warning', text: info.safetyHint }))

    // Note box: changing the textarea saves an observation to the notebook.
    const noteBox = el('textarea', {
      class: 'note-box',
      attrs: { placeholder: 'Observation about this apparatus...', rows: 3 }
    })
    noteBox.addEventListener('change', (e) => {
      this.notebook.add({ kind: 'observation', title: `${obj.name}`, text: e.target.value, apparatusId: obj.id })
      this.notebook.save()
      this._status('Note saved.')
      this._renderNotebook()
    })
    body.append(section('Notes', noteBox))
  }

  _renderSaves() { renderSaves(this) }
  _renderLibrary() {
    if (!this.dom.overlay) return
    clear(this.dom.overlay)
    this.dom.overlay.append(renderLibraryBody(this))
  }
  _renderNotebook() {
    if (!this.dom.overlay) return
    clear(this.dom.overlay)
    this.dom.overlay.append(renderNotebookInner(this))
  }
  _renderSafetyLog() { renderSafetyLog(this) }
  _renderData() { renderData(this) }
  _renderResearch() { renderResearch(this) }

  _saveLab() {
    const name = prompt('Experiment name', 'Untitled experiment')
    if (!name || !name.trim()) return
    const description = prompt('Description (optional)') || ''
    const data = {
      name: name.trim(),
      description,
      subject: this.experimentFilter ? this.experimentFilter.subject || 'chemistry' : 'chemistry',
      level: this.experimentFilter ? this.experimentFilter.level || 'igcse' : 'igcse',
      notebook: this.notebook.toJSON(),
      world: this.world?.serialize?.() ?? null
    }
    try {
      const save = saveLab(makeSave({
        world: data.world,
        name: data.name,
        description: data.description,
        subject: data.subject,
        level: data.level,
        notebook: data.notebook
      }))
      if (save) this._status(`Saved "${data.name}" as ${save.id}`)
      else this._status('Save failed.')
    } catch (err) { this._status('Save failed: ' + err.message) }
    this._renderSaves()
  }

  _resetLab() {
    if (!confirm('Reset the entire laboratory? This will remove all apparatus and liquids.')) return
    for (const o of this.world.list()) this.world.remove(o.id)
    this.notebook.clear()
    this.notebook.save()
    this.selectedId = null
    this._status('Lab reset.')
    this._refresh()
    this._renderSaves()
  }

  _loadSave(id) {
    try {
      const result = loadLab(id)
      if (!result?.ok) { this._status(`Load failed: ${result?.error || 'save not found'}`); return }
      const data = result.data
      if (this.world && data.world) this.world.restore(data.world)
      if (data.notebook) this.notebook = Notebook.fromJSON(data.notebook)
      if (data.subject && this.experimentFilter) this.experimentFilter.subject = data.subject
      if (data.level && this.experimentFilter) this.experimentFilter.level = data.level
      this._status(`Loaded "${data.name}".`)
      this._refresh()
      this._renderSaves()
    } catch (err) { this._status('Load failed: ' + err.message) }
  }

  _removeSave(id) {
    try {
      deleteSave(id)
      this._status(`Removed save ${id}.`)
      this._renderSaves()
    } catch (err) { this._status('Remove failed: ' + err.message) }
  }

  _extractSave(name) { this._loadSave(name) }

  _importSave() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result)
          const resolved = makeSave({
            world: data.world,
            name: data.name || 'Imported experiment',
            description: data.description || '',
            level: data.level || 'igcse',
            subject: data.subject || 'chemistry',
            notebook: data.notebook || null,
            camera: data.camera || null
          })
          const problems = validateSave(resolved)
          if (problems.length) throw new Error(problems.join('; '))
          const saved = saveLab(resolved)
          this._status(`Imported "${saved.name}" (id: ${saved.id})`)
          this._renderSaves()
        } catch (err) { this._status('Import failed: ' + err.message) }
      }
    }
    input.click()
  }

  runFrame() {
    let last = performance.now()
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (this.interaction) this.interaction.update(dt)
      if (this.dom && this.dom.clock) this.dom.clock.textContent = `t = ${round(this.world.time,0)} s`
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }
}

export function createLabUI(opts = {}) { return new LabUI(opts) }
