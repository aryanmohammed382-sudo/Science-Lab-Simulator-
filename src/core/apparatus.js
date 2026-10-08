// ---------------------------------------------------------------------------
// APPARATUS CATALOGUE
// ---------------------------------------------------------------------------
// Every item in the laboratory is described here as data: its shape (which the
// 3D factory turns into real geometry), its physical size, its capacity, its
// ports (where things can be connected) and how it behaves.
//
// Adding new apparatus = adding one record.  Nothing else has to change.
//
// Flags used by the simulation:
//   container    holds a Mixture (capacityML)
//   heatable     may be placed on a heat source
//   heatSource   supplies heat (powerW, maxTempC)
//   instrument   produces readings (instrument: id from measurement.js)
//   electrical   has terminals and takes part in the circuit solver
//   glass        breaks if dropped / thermally shocked
//   ports        [{id, kind:'mouth'|'sidearm'|'spout'|'gasIn'|'joint'|'terminal', position:'top'|'bottom'|'side', sizeMm, accepts}]
// ---------------------------------------------------------------------------

export const APPARATUS = {};

function A(o) {
  const rec = {
    category: 'glassware',
    subjects: ['chemistry', 'physics', 'biology'],
    levels: ['igcse', 'as', 'a', 'ug', 'research'],
    material: 'borosilicate glass',
    shape: 'generic',
    container: false,
    heatable: false,
    glass: true,
    massG: 100,
    dims: { diameterMm: 60, heightMm: 100 },
    ports: [],
    ...o
  };
  rec.id = o.id;
  APPARATUS[rec.id] = rec;
  return rec;
}

// ------------------------------------------------------------------ glassware
const glass = (id, name, dims, extra = {}) => A({
  id, name, shape: extra.shape || id.replace(/_\d+$/, ''), dims,
  container: true, heatable: !(extra.noHeat), capacityML: extra.capacityML,
  massG: extra.massG ?? Math.round(dims.diameterMm * dims.heightMm / 40),
  category: extra.category || 'glassware',
  ports: extra.ports || [{ id: 'mouth', kind: 'open', position: 'top', sizeMm: dims.diameterMm * 0.85 }],
  ...extra
});

glass('beaker_50', 'Beaker, 50 cm3', { diameterMm: 42, heightMm: 55 }, { capacityML: 50, graduations: { max: 40, major: 10, minor: 5 } });
glass('beaker_100', 'Beaker, 100 cm3', { diameterMm: 50, heightMm: 70 }, { capacityML: 100, graduations: { max: 80, major: 20, minor: 10 } });
glass('beaker_250', 'Beaker, 250 cm3', { diameterMm: 68, heightMm: 95 }, { capacityML: 250, graduations: { max: 200, major: 50, minor: 25 } });
glass('beaker_400', 'Beaker, 400 cm3', { diameterMm: 80, heightMm: 110 }, { capacityML: 400, graduations: { max: 350, major: 50, minor: 25 } });
glass('beaker_600', 'Beaker, 600 cm3', { diameterMm: 95, heightMm: 130 }, { capacityML: 600, graduations: { max: 500, major: 100, minor: 50 } });
glass('conical_flask_100', 'Conical flask, 100 cm3', { diameterMm: 64, heightMm: 105 }, { shape: 'conicalFlask', capacityML: 100, neckMm: 18, graduations: { max: 80, major: 20, minor: 10 } });
glass('conical_flask_250', 'Conical flask, 250 cm3', { diameterMm: 85, heightMm: 145 }, { shape: 'conicalFlask', capacityML: 250, neckMm: 22, graduations: { max: 200, major: 50, minor: 25 } });
glass('volumetric_flask_100', 'Volumetric flask, 100 cm3', { diameterMm: 62, heightMm: 180 }, { shape: 'volumetricFlask', capacityML: 100, neckMm: 14, graduations: { max: 100, major: 100, minor: 0 }, fixedVolume: 100 });
glass('volumetric_flask_250', 'Volumetric flask, 250 cm3', { diameterMm: 78, heightMm: 220 }, { shape: 'volumetricFlask', capacityML: 250, neckMm: 18, graduations: { max: 250, major: 250, minor: 0 }, fixedVolume: 250 });
glass('round_bottom_flask_250', 'Round-bottom flask, 250 cm3', { diameterMm: 85, heightMm: 130 }, { shape: 'roundBottomFlask', capacityML: 250, neckMm: 22 });
glass('flat_bottom_flask_250', 'Flat-bottom flask, 250 cm3', { diameterMm: 85, heightMm: 140 }, { shape: 'flatBottomFlask', capacityML: 250, neckMm: 22 });
glass('distillation_flask_250', 'Distillation flask, 250 cm3', { diameterMm: 85, heightMm: 130 }, { shape: 'distillationFlask', capacityML: 250, neckMm: 22, category: 'separation' });
glass('filter_flask_250', 'Buchner (filter) flask, 250 cm3', { diameterMm: 85, heightMm: 130 }, { shape: 'filterFlask', capacityML: 250, neckMm: 30, category: 'separation' });
glass('test_tube', 'Test tube, 150 x 16 mm', { diameterMm: 16, heightMm: 150 }, { capacityML: 25, graduations: { max: 20, major: 10, minor: 5 }, rackable: true });
glass('boiling_tube', 'Boiling tube, 150 x 25 mm', { diameterMm: 25, heightMm: 150 }, { capacityML: 60, graduations: { max: 40, major: 10, minor: 5 }, rackable: true });
glass('measuring_cylinder_10', 'Measuring cylinder, 10 cm3', { diameterMm: 14, heightMm: 150 }, { capacityML: 10, graduations: { max: 10, major: 2, minor: 0.2 }, instrument: 'measuring_cylinder_10' });
glass('measuring_cylinder_25', 'Measuring cylinder, 25 cm3', { diameterMm: 18, heightMm: 180 }, { capacityML: 25, graduations: { max: 25, major: 5, minor: 1 }, instrument: 'measuring_cylinder_25' });
glass('measuring_cylinder_50', 'Measuring cylinder, 50 cm3', { diameterMm: 22, heightMm: 220 }, { capacityML: 50, graduations: { max: 50, major: 10, minor: 2 }, instrument: 'measuring_cylinder_50' });
glass('measuring_cylinder_100', 'Measuring cylinder, 100 cm3', { diameterMm: 28, heightMm: 260 }, { capacityML: 100, graduations: { max: 100, major: 20, minor: 5 }, instrument: 'measuring_cylinder_100' });
glass('burette_50', 'Burette, 50 cm3', { diameterMm: 12, heightMm: 700 }, {
  shape: 'burette', capacityML: 50, standHeightMm: 380,
  graduations: { max: 50, major: 5, minor: 0.1, downwards: true }, instrument: 'burette',
  ports: [{ id: 'mouth', kind: 'open', position: 'top', sizeMm: 6 }, { id: 'tip', kind: 'tap', position: 'bottom', sizeMm: 2 }],
  tap: true, category: 'measurement'
});
glass('pipette_25', 'Volumetric pipette, 25 cm3', { diameterMm: 9, heightMm: 400 }, {
  shape: 'pipette', capacityML: 25, fixedVolume: 25, instrument: 'pipette_25', category: 'measurement',
  ports: [{ id: 'mouth', kind: 'open', position: 'top', sizeMm: 5 }, { id: 'tip', kind: 'open', position: 'bottom', sizeMm: 2 }]
});
glass('graduated_pipette_10', 'Graduated (Mohr) pipette, 10 cm3', { diameterMm: 9, heightMm: 360 }, {
  shape: 'graduatedPipette', capacityML: 10, calibrations: { max: 10, major: 1, minor: 0.1 }, category: 'measurement'
});
glass('pasteur_pipette', 'Pasteur pipette (dropper)', { diameterMm: 7, heightMm: 150 }, { shape: 'pasteurPipette', capacityML: 3, category: 'glassware' });
glass('dropping_bottle', 'Dropping bottle', { diameterMm: 40, heightMm: 110 }, { shape: 'droppingBottle', capacityML: 50, category: 'reagent', bottle: true });
glass('reagent_bottle', 'Reagent bottle (with stopper)', { diameterMm: 78, heightMm: 185 }, { shape: 'reagentBottle', capacityML: 500, bottle: true, category: 'reagent' });
glass('watch_glass', 'Watch glass', { diameterMm: 75, heightMm: 12 }, { shape: 'watchGlass', capacityML: 12, noHeat: false, category: 'glassware' });
glass('evaporating_basin', 'Evaporating basin', { diameterMm: 80, heightMm: 40 }, { shape: 'evaporatingBasin', capacityML: 90, category: 'glassware' });
glass('crystallising_dish', 'Crystallising dish', { diameterMm: 90, heightMm: 50 }, { shape: 'crystallisingDish', capacityML: 150, category: 'glassware' });
glass('separating_funnel_100', 'Separating funnel, 100 cm3', { diameterMm: 45, heightMm: 260 }, {
  shape: 'separatingFunnel', capacityML: 100, category: 'separation',
  ports: [{ id: 'mouth', kind: 'stopper', position: 'top', sizeMm: 22 }, { id: 'tap', kind: 'tap', position: 'bottom', sizeMm: 8 }],
  layers: true
});
glass('gas_jar', 'Gas jar', { diameterMm: 60, heightMm: 200 }, { shape: 'gasJar', capacityML: 500, category: 'gas' });
glass('gas_jar_lid', 'Gas jar lid (glass plate)', { diameterMm: 70, heightMm: 6 }, { shape: 'gasJarLid', container: false, category: 'gas' });
glass('delivery_tube', 'Delivery tube (bent)', { diameterMm: 7, heightMm: 200 }, { shape: 'deliveryTube', container: false, category: 'gas' });
glass('liebig_condenser', 'Liebig condenser', { diameterMm: 30, heightMm: 400 }, {
  shape: 'liebigCondenser', container: false, category: 'separation',
  ports: [{ id: 'inlet', kind: 'waterIn', position: 'bottom', sizeMm: 8 }, { id: 'outlet', kind: 'waterOut', position: 'top', sizeMm: 8 }]
});
glass('fractionating_column', 'Fractionating column', { diameterMm: 25, heightMm: 400 }, { shape: 'fractionatingColumn', container: false, category: 'separation' });
glass('funnel', 'Filter funnel', { diameterMm: 75, heightMm: 90 }, { shape: 'funnel', container: false, category: 'separation' });
glass('filter_paper', 'Filter paper (disc)', { diameterMm: 90, heightMm: 1 }, { shape: 'filterPaper', container: false, glass: false, material: 'paper', category: 'separation' });
glass('glass_rod', 'Glass stirring rod', { diameterMm: 6, heightMm: 200 }, { shape: 'glassRod', container: false, category: 'support' });
glass('thermometer', 'Thermometer', { diameterMm: 7, heightMm: 300 }, {
  shape: 'thermometer', container: false, instrument: 'thermometer', category: 'measurement',
  measures: 'temperature', range: [-10, 110]
});
glass('wash_bottle', 'Wash bottle (distilled water)', { diameterMm: 82, heightMm: 215 }, { shape: 'washBottle', container: true, capacityML: 500, category: 'support', contents: 'distilled_water' });

// ------------------------------------------------------------------- support
A({ id: 'retort_stand', name: 'Retort stand', shape: 'retortStand', category: 'support', container: false, glass: false, material: 'steel', massG: 2500, dims: { diameterMm: 200, heightMm: 600 } });
A({ id: 'boss_head', name: 'Boss head', shape: 'bossHead', category: 'support', container: false, glass: false, material: 'metal', massG: 120, dims: { diameterMm: 50, heightMm: 50 } });
A({ id: 'clamp', name: 'Clamp', shape: 'clamp', category: 'support', container: false, glass: false, material: 'metal', massG: 150, dims: { diameterMm: 120, heightMm: 40 } });
A({ id: 'tripod', name: 'Tripod', shape: 'tripod', category: 'support', container: false, glass: false, material: 'steel', massG: 400, dims: { diameterMm: 180, heightMm: 130 } });
A({ id: 'gauze', name: 'Wire gauze with ceramic centre', shape: 'gauze', category: 'support', container: false, glass: false, material: 'steel/ceramic', massG: 60, dims: { diameterMm: 130, heightMm: 6 } });
A({ id: 'heat_proof_mat', name: 'Heat-proof mat', shape: 'heatProofMat', category: 'support', container: false, glass: false, material: 'ceramic fibre', massG: 200, dims: { diameterMm: 200, heightMm: 10 } });
A({ id: 'test_tube_rack', name: 'Test-tube rack', shape: 'testTubeRack', category: 'support', container: false, glass: false, material: 'wood', massG: 500, dims: { diameterMm: 200, heightMm: 90 }, slots: 6 });
A({ id: 'bung', name: 'Rubber bung (single hole)', shape: 'bung', category: 'support', container: false, glass: false, material: 'rubber', massG: 20, dims: { diameterMm: 24, heightMm: 25 }, seals: true });
A({ id: 'stopper', name: 'Solid stopper', shape: 'stopper', category: 'support', container: false, glass: false, material: 'rubber', massG: 15, dims: { diameterMm: 22, heightMm: 22 }, seals: true });
A({ id: 'cork', name: 'Cork', shape: 'cork', category: 'support', container: false, glass: false, material: 'cork', massG: 8, dims: { diameterMm: 20, heightMm: 22 }, seals: true });
A({ id: 'spatula', name: 'Spatula', shape: 'spatula', category: 'support', container: false, glass: false, material: 'stainless steel', massG: 30, dims: { diameterMm: 15, heightMm: 200 } });
A({ id: 'forceps', name: 'Forceps', shape: 'forceps', category: 'support', container: false, glass: false, material: 'stainless steel', massG: 25, dims: { diameterMm: 12, heightMm: 130 } });
A({ id: 'tongs', name: 'Crucible tongs', shape: 'tongs', category: 'support', container: false, glass: false, material: 'stainless steel', massG: 80, dims: { diameterMm: 20, heightMm: 250 } });
A({ id: 'crucible', name: 'Crucible with lid', shape: 'crucible', category: 'glassware', container: true, heatable: true, capacityML: 30, material: 'ceramic', glass: false, massG: 40, dims: { diameterMm: 40, heightMm: 40 }, maxTempC: 1200 });
A({ id: 'mortar_pestle', name: 'Mortar and pestle', shape: 'mortarPestle', category: 'support', container: true, capacityML: 100, material: 'ceramic', glass: false, massG: 400, dims: { diameterMm: 100, heightMm: 70 } });
A({ id: 'weighing_boat', name: 'Weighing boat', shape: 'weighingBoat', category: 'support', container: true, capacityML: 30, material: 'polystyrene', glass: false, massG: 3, dims: { diameterMm: 60, heightMm: 20 } });
A({ id: 'filter_stand', name: 'Filter funnel stand', shape: 'filterStand', category: 'support', container: false, glass: false, massG: 300, dims: { diameterMm: 150, heightMm: 250 } });
A({ id: 'white_tile', name: 'White tile', shape: 'whiteTile', category: 'support', container: false, glass: false, material: 'ceramic', massG: 150, dims: { diameterMm: 100, heightMm: 10 } });
A({ id: 'pipe_clay_triangle', name: 'Pipe-clay triangle', shape: 'pipeClayTriangle', category: 'support', container: false, glass: false, massG: 20, dims: { diameterMm: 60, heightMm: 15 } });

// -------------------------------------------------------------------- heating
A({ id: 'bunsen_burner', name: 'Bunsen burner', shape: 'bunsenBurner', category: 'heating', container: false, glass: false, material: 'metal', massG: 300, heatSource: true, powerW: 250, maxTempC: 900, flameTempC: 1500, dims: { diameterMm: 90, heightMm: 160 }, ports: [{ id: 'gasIn', kind: 'gasInlet', position: 'side', sizeMm: 8 }] });
A({ id: 'spirit_burner', name: 'Spirit burner', shape: 'spiritBurner', category: 'heating', container: false, glass: false, material: 'glass/metal', massG: 180, heatSource: true, powerW: 120, maxTempC: 500, flameTempC: 600, dims: { diameterMm: 70, heightMm: 100 }, fuel: 'ethanol' });
A({ id: 'hot_plate', name: 'Hot plate', shape: 'hotPlate', category: 'heating', container: false, glass: false, massG: 1800, heatSource: true, powerW: 200, maxTempC: 300, dims: { diameterMm: 200, heightMm: 90 } });
A({ id: 'heating_mantle', name: 'Heating mantle', shape: 'heatingMantle', category: 'heating', container: false, glass: false, massG: 800, heatSource: true, powerW: 150, maxTempC: 400, dims: { diameterMm: 150, heightMm: 110 }, fits: ['round_bottom_flask_250'] });
A({ id: 'water_bath', name: 'Water bath', shape: 'waterBath', category: 'heating', container: true, capacityML: 800, heatable: true, heatSource: true, powerW: 180, maxTempC: 100, massG: 900, dims: { diameterMm: 180, heightMm: 110 }, holdsApparatus: true });
A({ id: 'ice_bath', name: 'Ice bath', shape: 'iceBath', category: 'heating', container: true, capacityML: 800, massG: 900, dims: { diameterMm: 180, heightMm: 110 }, cooling: true, holdsApparatus: true });

// ---------------------------------------------------------------- measurement
A({ id: 'top_pan_balance', name: 'Top-pan balance', shape: 'topPanBalance', category: 'measurement', container: false, glass: false, massG: 2500, instrument: 'balance_top_pan', measures: 'mass', dims: { diameterMm: 220, heightMm: 90 } });
A({ id: 'analytical_balance', name: 'Analytical balance', shape: 'analyticalBalance', category: 'measurement', container: false, glass: false, massG: 6000, instrument: 'balance_analytical', measures: 'mass', dims: { diameterMm: 300, heightMm: 300 } });
A({ id: 'stopwatch', name: 'Stopwatch', shape: 'stopwatch', category: 'measurement', container: false, glass: false, massG: 60, instrument: 'stopwatch', measures: 'time', dims: { diameterMm: 60, heightMm: 20 } });
A({ id: 'ruler', name: 'Metre rule', shape: 'ruler', category: 'measurement', container: false, glass: false, massG: 150, instrument: 'ruler', measures: 'length', dims: { diameterMm: 25, heightMm: 1000 } });
A({ id: 'vernier_caliper', name: 'Vernier callipers', shape: 'vernierCaliper', category: 'measurement', container: false, glass: false, massG: 120, instrument: 'vernier_caliper', measures: 'length', dims: { diameterMm: 60, heightMm: 200 } });
A({ id: 'micrometer', name: 'Micrometer screw gauge', shape: 'micrometer', category: 'measurement', container: false, glass: false, massG: 180, instrument: 'micrometer', measures: 'length', dims: { diameterMm: 60, heightMm: 150 } });
A({ id: 'temperature_probe', name: 'Temperature probe', shape: 'temperatureProbe', category: 'measurement', container: false, glass: false, massG: 80, instrument: 'temperature_probe', measures: 'temperature', dims: { diameterMm: 10, heightMm: 180 } });
A({ id: 'ph_meter', name: 'pH meter', shape: 'phMeter', category: 'measurement', container: false, glass: false, massG: 300, instrument: 'ph_meter', measures: 'pH', dims: { diameterMm: 80, heightMm: 180 } });
A({ id: 'conductivity_meter', name: 'Conductivity meter', shape: 'conductivityMeter', category: 'measurement', container: false, glass: false, massG: 300, instrument: 'conductivity_meter', measures: 'conductivity', dims: { diameterMm: 80, heightMm: 180 } });
A({ id: 'pressure_sensor', name: 'Pressure sensor', shape: 'pressureSensor', category: 'measurement', container: false, glass: false, massG: 200, instrument: 'pressure_sensor', measures: 'pressure', dims: { diameterMm: 60, heightMm: 120 } });
A({ id: 'force_sensor', name: 'Force sensor (newton meter)', shape: 'forceSensor', category: 'measurement', container: false, glass: false, massG: 150, instrument: 'force_sensor', measures: 'force', dims: { diameterMm: 40, heightMm: 180 } });
A({ id: 'light_sensor', name: 'Light sensor', shape: 'lightSensor', category: 'measurement', container: false, glass: false, massG: 120, instrument: 'light_sensor', measures: 'light intensity', dims: { diameterMm: 40, heightMm: 100 } });
A({ id: 'colorimeter', name: 'Colorimeter', shape: 'colorimeter', category: 'measurement', container: false, glass: false, massG: 900, instrument: 'colorimeter', measures: 'absorbance', dims: { diameterMm: 180, heightMm: 140 } });
A({ id: 'gas_syringe', name: 'Gas syringe, 100 cm3', shape: 'gasSyringe', category: 'measurement', container: true, capacityML: 100, instrument: 'gas_syringe', measures: 'gas volume', massG: 150, dims: { diameterMm: 40, heightMm: 300 }, ports: [{ id: 'inlet', kind: 'gasIn', position: 'side', sizeMm: 8 }] });
A({ id: 'light_gate', name: 'Light gate', shape: 'lightGate', category: 'measurement', container: false, glass: false, massG: 200, instrument: 'light_gate', measures: 'time', dims: { diameterMm: 60, heightMm: 120 }, electrical: false });
A({ id: 'datalogger', name: 'Data logger', shape: 'datalogger', category: 'measurement', container: false, glass: false, massG: 500, instrument: 'dalogger', measures: 'any', dims: { diameterMm: 200, heightMm: 60 } });
A({ id: 'oscilloscope', name: 'Oscilloscope', shape: 'oscilloscope', category: 'measurement', container: false, glass: false, massG: 4000, instrument: 'oscilloscope', measures: 'voltage', dims: { diameterMm: 350, heightMm: 200 }, electrical: true, terminals: ['ch1', 'gnd'] });
A({ id: 'function_generator', name: 'Signal generator', shape: 'functionGenerator', category: 'physics', container: false, glass: false, massG: 2000, dims: { diameterMm: 280, heightMm: 120 }, electrical: true, terminals: ['a', 'b'] });

// ------------------------------------------------------------------ electrical
const comp = (id, name, componentType, value, extra = {}) => A({
  id, name, shape: extra.shape || componentType, category: 'electrical', container: false, glass: false,
  material: 'plastic/metal', massG: 60, electrical: true, componentType, value,
  terminals: [{ id: 'a', label: extra.labelA || '+' }, { id: 'b', label: extra.labelB || '-' }],
  dims: { diameterMm: 40, heightMm: 30 },
  ...extra
});
comp('cell_1_5v', 'Cell, 1.5 V', 'cell', 1.5, { internalResistance: 0.5, labelA: '+', labelB: '-', shape: 'cell', ratedPower: 0.5 });
comp('battery_9v', 'Battery, 9 V', 'battery', 9, { internalResistance: 1.5, shape: 'battery9v', ratedPower: 2 });
comp('power_supply', 'Variable power supply', 'powerSupply', 6, {
  internalResistance: 0.2, shape: 'powerSupply', dims: { diameterMm: 240, heightMm: 120 }, massG: 1500,
  variable: { min: 0, max: 12, step: 0.5 }, ratedPower: 20
});
comp('resistor_10', 'Resistor, 10 ohm', 'resistor', 10, { shape: 'resistor' });
comp('resistor_47', 'Resistor, 47 ohm', 'resistor', 47, { shape: 'resistor' });
comp('resistor_100', 'Resistor, 100 ohm', 'resistor', 100, { shape: 'resistor' });
comp('resistor_220', 'Resistor, 220 ohm', 'resistor', 220, { shape: 'resistor' });
comp('resistor_470', 'Resistor, 470 ohm', 'resistor', 470, { shape: 'resistor' });
comp('resistor_1k', 'Resistor, 1 kohm', 'resistor', 1000, { shape: 'resistor' });
comp('rheostat', 'Variable resistor (rheostat)', 'rheostat', 50, {
  shape: 'rheostat', variable: { min: 0, max: 50, step: 1 }, dims: { diameterMm: 70, heightMm: 60 }, ratedPower: 5
});
comp('lamp_2_5v', 'Lamp, 2.5 V 0.3 A', 'lamp', 8.3, { ratedPower: 0.75, shape: 'lamp', dims: { diameterMm: 30, heightMm: 60 } });
comp('lamp_6v', 'Lamp, 6 V 0.06 A', 'lamp', 100, { ratedPower: 0.36, shape: 'lamp', dims: { diameterMm: 25, heightMm: 55 } });
comp('led_red', 'LED, red', 'led', 0, { ledColour: 'red', ratedPower: 0.06, shape: 'led' });
comp('led_green', 'LED, green', 'led', 0, { ledColour: 'green', ratedPower: 0.07, shape: 'led' });
comp('led_blue', 'LED, blue', 'led', 0, { ledColour: 'blue', ratedPower: 0.09, shape: 'led' });
comp('diode', 'Silicon diode', 'diode', 0, { shape: 'diode' });
comp('switch', 'Switch', 'switch', 0, { closed: false, shape: 'switch' });
comp('motor', 'Electric motor', 'motor', 20, { ratedPower: 2, shape: 'motor' });
comp('ammeter', 'Ammeter (analogue)', 'ammeter', 0, { shape: 'ammeter', instrument: 'ammeter_analogue', measures: 'current', range: [0, 1] });
comp('ammeter_digital', 'Ammeter (digital)', 'ammeter', 0, { shape: 'ammeterDigital', instrument: 'ammeter_digital', measures: 'current', range: [0, 10] });
comp('voltmeter', 'Voltmeter (analogue)', 'voltmeter', 0, { shape: 'voltmeter', instrument: 'voltmeter_analogue', measures: 'voltage', range: [0, 5] });
comp('voltmeter_digital', 'Voltmeter (digital)', 'voltmeter', 0, { shape: 'voltmeterDigital', instrument: 'voltmeter_digital', measures: 'voltage', range: [0, 20] });
comp('multimeter', 'Multimeter', 'multimeter', 0, { mode: 'voltmeter', shape: 'multimeter', instrument: 'multimeter', measures: 'voltage/current/resistance', range: 'auto' });
comp('capacitor', 'Capacitor, 1000 uF', 'capacitor', 1e-3, { shape: 'capacitor', ratedPower: 0.1 });
comp('coil', 'Induction coil (600 turns)', 'coil', 2, { shape: 'coil', dims: { diameterMm: 60, heightMm: 60 } });
comp('transformer', 'Transformer', 'transformer', 0, { shape: 'transformer', dims: { diameterMm: 120, heightMm: 80 } });
comp('magnet', 'Bar magnet', 'magnet', 0, { shape: 'magnet', dims: { diameterMm: 20, heightMm: 100 } });
comp('wire_red', 'Connecting wire (red)', 'wire', 0, { shape: 'wire', colour: '#c0392b', massG: 15, dims: { diameterMm: 4, heightMm: 300 } });
comp('wire_black', 'Connecting wire (black)', 'wire', 0, { shape: 'wire', colour: '#2c3e50', massG: 15, dims: { diameterMm: 4, heightMm: 300 } });
comp('crocodile_clip', 'Crocodile clip', 'wire', 0, { shape: 'crocodileClip', massG: 8, dims: { diameterMm: 10, heightMm: 45 } });

// ------------------------------------------------------- physics (mechanics)
A({ id: 'optical_bench', name: 'Optical bench', shape: 'opticalBench', category: 'physics-optics', container: false, glass: false, massG: 3000, dims: { diameterMm: 60, heightMm: 1000 }, holdsApparatus: true });
A({ id: 'ray_box', name: 'Ray box', shape: 'rayBox', category: 'physics-optics', container: false, glass: false, massG: 600, dims: { diameterMm: 130, heightMm: 90 }, lightSource: true });
A({ id: 'lens_convex', name: 'Convex lens', shape: 'lensConvex', category: 'physics-optics', container: false, glass: true, massG: 40, dims: { diameterMm: 60, heightMm: 8 }, focalLengthMm: 150 });
A({ id: 'mirror_plane', name: 'Plane mirror', shape: 'mirrorPlane', category: 'physics-optics', container: false, glass: true, massG: 90, dims: { diameterMm: 80, heightMm: 6 } });
A({ id: 'prism', name: 'Glass prism', shape: 'prism', category: 'physics-optics', container: false, glass: true, massG: 120, dims: { diameterMm: 60, heightMm: 60 } });
A({ id: 'glass_block', name: 'Rectangular glass block', shape: 'glassBlock', category: 'physics-optics', container: false, glass: true, massG: 250, dims: { diameterMm: 100, heightMm: 60 } });
A({ id: 'screen', name: 'White screen', shape: 'screen', category: 'physics-optics', container: false, glass: false, massG: 200, dims: { diameterMm: 150, heightMm: 150 } });
A({ id: 'pendulum_bob', name: 'Pendulum bob and string', shape: 'pendulum', category: 'physics-mechanics', container: false, glass: false, massG: 120, dims: { diameterMm: 30, heightMm: 700 }, stringLengthMm: 700 });
A({ id: 'pulley', name: 'Pulley on clamp', shape: 'pulley', category: 'physics-mechanics', container: false, glass: false, massG: 80, dims: { diameterMm: 70, heightMm: 40 } });
A({ id: 'mass_100g', name: 'Mass, 100 g (slotted)', shape: 'mass', category: 'physics-mechanics', container: false, glass: false, massG: 100, dims: { diameterMm: 45, heightMm: 20 }, values: { 100: 1 } });
A({ id: 'mass_set', name: 'Slotted mass set (100-500 g)', shape: 'massSet', category: 'physics-mechanics', container: false, glass: false, massG: 500, dims: { diameterMm: 60, heightMm: 60 } });
A({ id: 'spring', name: 'Spring', shape: 'spring', category: 'physics-mechanics', container: false, glass: false, massG: 30, dims: { diameterMm: 20, heightMm: 150 }, springConstantNm: 20 });
A({ id: 'dynamics_trolley', name: 'Dynamics trolley', shape: 'trolley', category: 'physics-mechanics', container: false, glass: false, massG: 500, dims: { diameterMm: 120, heightMm: 70 }, massKg: 0.5 });
A({ id: 'ramp', name: 'Ramp (slotted track)', shape: 'ramp', category: 'physics-mechanics', container: false, glass: false, massG: 1500, dims: { diameterMm: 200, heightMm: 1200 } });
A({ id: 'newton_meter', name: 'Newton meter', shape: 'newtonMeter', category: 'physics-mechanics', container: false, glass: false, massG: 120, instrument: 'force_sensor', measures: 'force', dims: { diameterMm: 40, heightMm: 200 } });
A({ id: 'protractor', name: 'Protractor', shape: 'protractor', category: 'physics', container: false, glass: false, massG: 50, dims: { diameterMm: 150, heightMm: 3 } });
A({ id: 'tuning_fork', name: 'Tuning fork', shape: 'tuningFork', category: 'physics-waves', container: false, glass: false, massG: 150, dims: { diameterMm: 30, heightMm: 200 }, frequencyHz: 256 });
A({ id: 'signal_generator', name: 'Signal generator', shape: 'functionGenerator', category: 'physics-waves', container: false, glass: false, massG: 2000, dims: { diameterMm: 280, heightMm: 120 }, electrical: true, terminals: ['a', 'b'] });
A({ id: 'loudspeaker', name: 'Loudspeaker', shape: 'loudspeaker', category: 'physics-waves', container: false, glass: false, massG: 400, dims: { diameterMm: 120, heightMm: 120 }, electrical: true, terminals: ['a', 'b'] });
A({ id: 'microphone', name: 'Microphone / sound sensor', shape: 'microphone', category: 'physics-waves', container: false, glass: false, massG: 150, dims: { diameterMm: 40, heightMm: 150 }, electrical: true, terminals: ['a', 'b'] });
A({ id: 'ripple_tank', name: 'Ripple tank', shape: 'rippleTank', category: 'physics-waves', container: false, glass: false, massG: 5000, dims: { diameterMm: 400, heightMm: 300 } });
A({ id: 'resonance_tube', name: 'Resonance tube', shape: 'resonanceTube', category: 'physics-waves', container: true, capacityML: 1000, dims: { diameterMm: 60, heightMm: 900 } });
A({ id: 'thermistor', name: 'Thermistor', shape: 'thermistor', category: 'physics-thermal', container: false, glass: false, massG: 10, electrical: true, componentType: 'resistor', value: 1000, terminals: ['a', 'b'], dims: { diameterMm: 8, heightMm: 20 } });
A({ id: 'immersed_heater', name: 'Immersion heater (12 V, 6 W)', shape: 'immersedHeater', category: 'physics-thermal', container: false, glass: false, massG: 120, heatSource: true, powerW: 6, maxTempC: 100, electrical: true, componentType: 'heater', value: 24, terminals: ['a', 'b'], dims: { diameterMm: 20, heightMm: 150 } });

// -------------------------------------------------------------------- biology
A({ id: 'microscope', name: 'Light microscope', shape: 'microscope', category: 'biology-microscopy', container: false, glass: false, massG: 2500, dims: { diameterMm: 200, heightMm: 380 }, magnifications: [4, 10, 40, 100] });
A({ id: 'glass_slide', name: 'Microscope slide', shape: 'slide', category: 'biology-microscopy', container: false, glass: true, massG: 5, dims: { diameterMm: 25, heightMm: 75 } });
A({ id: 'coverslip', name: 'Coverslip', shape: 'coverslip', category: 'biology-microscopy', container: false, glass: true, massG: 1, dims: { diameterMm: 22, heightMm: 1 } });
A({ id: 'hand_lens', name: 'Hand lens', shape: 'handLens', category: 'biology-microscopy', container: false, glass: true, massG: 40, dims: { diameterMm: 40, heightMm: 60 } });
A({ id: 'petri_dish', name: 'Petri dish', shape: 'petriDish', category: 'biology', container: true, capacityML: 50, glass: false, material: 'polystyrene', massG: 20, dims: { diameterMm: 90, heightMm: 15 } });
A({ id: 'staining_jar', name: 'Staining jar', shape: 'stainingJar', category: 'biology', container: true, capacityML: 50, massG: 120, dims: { diameterMm: 60, heightMm: 90 } });
A({ id: 'centrifuge', name: 'Centrifuge', shape: 'centrifuge', category: 'biology', container: false, glass: false, massG: 6000, dims: { diameterMm: 300, heightMm: 250 }, rpm: 4000 });
A({ id: 'incubator', name: 'Incubator (25-45 °C)', shape: 'incubator', category: 'biology', container: false, glass: false, massG: 12000, dims: { diameterMm: 400, heightMm: 500 }, maxTempC: 45, heatSource: true, powerW: 100 });
A({ id: 'scalpel', name: 'Scalpel', shape: 'scalpel', category: 'biology-dissection', container: false, glass: false, massG: 30, sharp: true, dims: { diameterMm: 15, heightMm: 150 } });
A({ id: 'scissors', name: 'Dissecting scissors', shape: 'scissors', category: 'biology-dissection', container: false, glass: false, massG: 40, sharp: true, dims: { diameterMm: 20, heightMm: 140 } });
A({ id: 'mounted_needle', name: 'Mounted needle', shape: 'mountedNeedle', category: 'biology-dissection', container: false, glass: false, massG: 10, sharp: true, dims: { diameterMm: 8, heightMm: 130 } });
A({ id: 'dissecting_tray', name: 'Dissecting tray', shape: 'dissectingTray', category: 'biology-dissection', container: true, capacityML: 500, glass: false, massG: 500, dims: { diameterMm: 250, heightMm: 40 } });
A({ id: 'quadrat', name: 'Quadrat (0.5 m x 0.5 m)', shape: 'quadrat', category: 'biology-ecology', container: false, glass: false, massG: 400, dims: { diameterMm: 500, heightMm: 500 } });
A({ id: 'potometer', name: 'Potometer', shape: 'potometer', category: 'biology-plant', container: false, glass: true, massG: 300, dims: { diameterMm: 60, heightMm: 400 }, instrument: 'gas_syringe', measures: 'water uptake' });
A({ id: 'respirometer', name: 'Respirometer', shape: 'respirometer', category: 'biology', container: false, glass: true, massG: 500, dims: { diameterMm: 120, heightMm: 300 }, instrument: 'gas_syringe', measures: 'gas volume' });
A({ id: 'cork_borer', name: 'Cork borer set', shape: 'corkBorer', category: 'biology-plant', container: false, glass: false, massG: 80, sharp: true, dims: { diameterMm: 20, heightMm: 120 } });
A({ id: 'visking_tubing', name: 'Visking (dialysis) tubing', shape: 'viskingTubing', category: 'biology', container: true, capacityML: 30, glass: false, material: 'cellulose', massG: 5, dims: { diameterMm: 20, heightMm: 150 } });
A({ id: 'syringe_20', name: 'Syringe, 20 cm3', shape: 'syringe', category: 'biology', container: true, capacityML: 20, glass: false, massG: 30, dims: { diameterMm: 25, heightMm: 180 }, instrument: 'measuring_cylinder_25' });
A({ id: 'counting_chamber', name: 'Haemocytometer', shape: 'countingChamber', category: 'biology-microscopy', container: false, glass: true, massG: 60, dims: { diameterMm: 30, heightMm: 80 } });
A({ id: 'filter_pump', name: 'Water vacuum pump', shape: 'filterPump', category: 'separation', container: false, glass: false, massG: 400, dims: { diameterMm: 100, heightMm: 250 } });

// ------------------------------------------------------- safety & lab fixtures
const fixture = (id, name, shape, dims, extra = {}) => A({
  id, name, shape, dims, category: 'safety', container: false, glass: false, fixture: true, ...extra
});
fixture('fume_hood', 'Fume hood', 'fumeHood', { diameterMm: 1200, heightMm: 900 }, { massG: 50000, safety: true });
fixture('fire_extinguisher', 'Fire extinguisher (CO2)', 'fireExtinguisher', { diameterMm: 150, heightMm: 600 }, { massG: 5000, safety: true });
fixture('eye_wash_station', 'Eye-wash station', 'eyeWash', { diameterMm: 300, heightMm: 900 }, { massG: 8000, safety: true });
fixture('safety_shower', 'Safety shower', 'safetyShower', { diameterMm: 250, heightMm: 2100 }, { massG: 12000, safety: true });
fixture('first_aid', 'First-aid station', 'firstAid', { diameterMm: 300, heightMm: 450 }, { massG: 3000, safety: true });
fixture('sink', 'Laboratory sink', 'sink', { diameterMm: 500, heightMm: 950 }, { massG: 20000, water: true });
fixture('gas_tap', 'Gas tap', 'gasTap', { diameterMm: 60, heightMm: 120 }, { gas: true });
fixture('water_tap', 'Water tap', 'waterTap', { diameterMm: 60, heightMm: 200 }, { water: true });
fixture('electrical_socket', 'Bench electrical supply (0-12 V d.c.)', 'socket', { diameterMm: 120, heightMm: 90 }, { electrical: true, outputVoltage: 12 });
fixture('waste_container', 'Waste container', 'wasteContainer', { diameterMm: 250, heightMm: 400 }, { waste: true });
fixture('solvent_waste', 'Organic solvent waste bottle', 'wasteContainer', { diameterMm: 200, heightMm: 350 }, { waste: true, hazard: 'organic' });
fixture('heavy_metal_waste', 'Heavy-metal waste bottle', 'wasteContainer', { diameterMm: 200, heightMm: 350 }, { waste: true, hazard: 'heavy-metal' });
fixture('safety_screen', 'Safety screen', 'safetyScreen', { diameterMm: 400, heightMm: 400 }, { safety: true });

// -------------------------------------------------------------- PPE (wearable)
A({ id: 'goggles', name: 'Safety goggles', shape: 'goggles', category: 'ppe', container: false, glass: false, massG: 60, ppeSlot: 'goggles', dims: { diameterMm: 150, heightMm: 60 } });
A({ id: 'gloves', name: 'Nitrile gloves (pair)', shape: 'gloves', category: 'ppe', container: false, glass: false, massG: 20, ppeSlot: 'gloves', dims: { diameterMm: 120, heightMm: 250 } });
A({ id: 'lab_coat', name: 'Laboratory coat', shape: 'labCoat', category: 'ppe', container: false, glass: false, massG: 500, ppeSlot: 'labcoat', dims: { diameterMm: 500, heightMm: 1000 } });

// ------------------------------------------------------------------- queries
export const APPARATUS_CATEGORIES = [
  { id: 'glassware', label: 'Glassware' },
  { id: 'support', label: 'Support & handling' },
  { id: 'heating', label: 'Heating & cooling' },
  { id: 'measurement', label: 'Measuring instruments' },
  { id: 'separation', label: 'Separation' },
  { id: 'gas', label: 'Gas preparation & collection' },
  { id: 'reagent', label: 'Reagent bottles' },
  { id: 'electrical', label: 'Electrical components' },
  { id: 'physics-mechanics', label: 'Mechanics' },
  { id: 'physics-optics', label: 'Optics' },
  { id: 'physics-waves', label: 'Waves & sound' },
  { id: 'physics-thermal', label: 'Thermal physics' },
  { id: 'biology-microscopy', label: 'Microscopy' },
  { id: 'biology-dissection', label: 'Dissection' },
  { id: 'biology-plant', label: 'Plant physiology' },
  { id: 'biology-ecology', label: 'Ecology' },
  { id: 'biology', label: 'Biology equipment' },
  { id: 'ppe', label: 'Personal protective equipment' },
  { id: 'safety', label: 'Safety & laboratory fixtures' }
];

export function getApparatus(id) { return APPARATUS[id] || null; }
export function allApparatus() { return Object.values(APPARATUS); }
export function apparatusByCategory(cat) { return allApparatus().filter((a) => a.category === cat); }
export function apparatusFor(subject) {
  return allApparatus().filter((a) => !a.fixture && (a.subjects.includes(subject) || a.subjects.includes('all')));
}
export function searchApparatus(q) {
  const t = q.trim().toLowerCase();
  if (!t) return allApparatus();
  return allApparatus().filter((a) => a.name.toLowerCase().includes(t) || a.id.includes(t) || a.category.includes(t));
}
/** Items that can hold liquid. */
export function containers() { return allApparatus().filter((a) => a.container && a.capacityML); }
/** Items that supply heat. */
export function heatSources() { return allApparatus().filter((a) => a.heatSource); }
/** Items that make measurements. */
export function instruments() { return allApparatus().filter((a) => a.instrument); }

A({ id: 'marker_pen', name: 'Marker pen (labelling)', shape: 'pencil', category: 'support', container: false, glass: false, massG: 12, dims: { diameterMm: 10, heightMm: 140 } });
A({ id: 'mounting_needle', name: 'Mounting needle', shape: 'mountedNeedle', category: 'biology-dissection', container: false, glass: false, massG: 10, sharp: true, dims: { diameterMm: 8, heightMm: 130 } });
A({ id: 'spectrometer_table', name: 'Spectrometer table', shape: 'spectrometerTable', category: 'physics-optics', container: false, glass: false, massG: 3000, dims: { diameterMm: 300, heightMm: 250 } });
A({ id: 'burette_stand_clamp', name: 'Burette clamp and stand', shape: 'retortStand', category: 'support', container: false, glass: false, massG: 2400, dims: { diameterMm: 200, heightMm: 700 } });
A({ id: 'plotting_compass', name: 'Plotting compass', shape: 'compass', category: 'physics', container: false, glass: true, massG: 60, dims: { diameterMm: 50, heightMm: 15 } });
A({ id: 'iron_core', name: 'Soft-iron core', shape: 'ironCore', category: 'physics', container: false, glass: false, massG: 200, dims: { diameterMm: 15, heightMm: 120 } });
A({ id: 'plotting_pins', name: 'Optical pins', shape: 'pins', category: 'physics-optics', container: false, glass: false, massG: 10, dims: { diameterMm: 5, heightMm: 40 } });
A({ id: 'diffraction_grating', name: 'Diffraction grating (300 lines/mm)', shape: 'diffractionGrating', category: 'physics-optics', container: false, glass: true, massG: 20, dims: { diameterMm: 50, heightMm: 5 } });

// -------------------------- additional items used by the experiment library --
A({ id: 'nichrome_wire', name: 'Nichrome wire (flame test loop)', shape: 'nichromeWire', category: 'support', container: false, glass: false, massG: 5, dims: { diameterMm: 3, heightMm: 120 } });
A({ id: 'limewater_bottle', name: 'Limewater dropping bottle', shape: 'droppingBottle', category: 'reagent', container: true, capacityML: 100, bottle: true, massG: 90, dims: { diameterMm: 45, heightMm: 120 } });
A({ id: 'carbon_electrodes', name: 'Carbon (graphite) electrodes, pair', shape: 'carbonElectrodes', category: 'electrical', container: false, glass: false, massG: 40, dims: { diameterMm: 10, heightMm: 150 }, electrical: true, componentType: 'electrode', terminals: ['a', 'b'], electrode: 'carbon' });
A({ id: 'copper_electrodes', name: 'Copper electrodes, pair', shape: 'copperElectrodes', category: 'electrical', container: false, glass: false, massG: 60, dims: { diameterMm: 20, heightMm: 120 }, electrical: true, componentType: 'electrode', terminals: ['a', 'b'], electrode: 'copper' });
A({ id: 'chromatography_paper', name: 'Chromatography paper', shape: 'chromatographyPaper', category: 'separation', container: false, glass: false, material: 'paper', massG: 3, dims: { diameterMm: 90, heightMm: 200 } });
A({ id: 'capillary_tube', name: 'Capillary tube', shape: 'capillaryTube', category: 'glassware', container: false, glass: true, massG: 3, dims: { diameterMm: 2, heightMm: 100 } });
A({ id: 'pencil', name: 'Pencil', shape: 'pencil', category: 'support', container: false, glass: false, material: 'wood/graphite', massG: 10, dims: { diameterMm: 8, heightMm: 180 } });
A({ id: 'pen', name: 'Marker pen', shape: 'pencil', category: 'support', container: false, glass: false, massG: 12, dims: { diameterMm: 10, heightMm: 140 } });
A({ id: 'paper', name: 'Sheet of white paper', shape: 'paper', category: 'support', container: false, glass: false, material: 'paper', massG: 5, dims: { diameterMm: 210, heightMm: 300 } });
A({ id: 'polystyrene_cup', name: 'Polystyrene calorimeter cup', shape: 'polystyreneCup', category: 'glassware', container: true, capacityML: 250, heatable: false, insulated: 0.9, material: 'polystyrene', glass: false, massG: 5, dims: { diameterMm: 70, heightMm: 95 } });
A({ id: 'thermometer_precise', name: 'Precision thermometer', shape: 'thermometer', category: 'measurement', container: false, glass: true, massG: 40, instrument: 'thermometer_precise', measures: 'temperature', dims: { diameterMm: 7, heightMm: 300 } });
A({ id: 'draught_shield', name: 'Draught shield', shape: 'draughtShield', category: 'support', container: false, glass: false, material: 'aluminium', massG: 150, dims: { diameterMm: 160, heightMm: 150 } });
A({ id: 'trough', name: 'Pneumatic trough', shape: 'trough', category: 'gas', container: true, capacityML: 3000, glass: false, material: 'plastic', massG: 900, dims: { diameterMm: 300, heightMm: 120 } });
A({ id: 'desiccator', name: 'Desiccator', shape: 'desiccator', category: 'glassware', container: false, glass: true, massG: 2000, dims: { diameterMm: 200, heightMm: 250 } });
A({ id: 'stirring_rod', name: 'Stirring rod', shape: 'glassRod', category: 'support', container: false, glass: true, massG: 35, dims: { diameterMm: 6, heightMm: 220 } });
A({ id: 'magnetic_stirrer', name: 'Magnetic stirrer', shape: 'magneticStirrer', category: 'support', container: false, glass: false, massG: 1500, dims: { diameterMm: 180, heightMm: 70 }, electrical: true, terminals: ['a', 'b'] });
A({ id: 'melting_point_apparatus', name: 'Melting point apparatus', shape: 'meltingPointApparatus', category: 'measurement', container: false, glass: false, massG: 1200, instrument: 'temperature_probe', measures: 'temperature', dims: { diameterMm: 180, heightMm: 200 } });
A({ id: 'string', name: 'String (on a reel)', shape: 'string', category: 'support', container: false, glass: false, material: 'cotton', massG: 20, dims: { diameterMm: 40, heightMm: 60 } });
A({ id: 'metre_rule_pivot', name: 'Metre rule on a pivot', shape: 'metreRulePivot', category: 'physics-mechanics', container: false, glass: false, massG: 200, dims: { diameterMm: 60, heightMm: 1000 } });
A({ id: 'potentiometer_kit', name: 'Potentiometer / potential divider board', shape: 'potentiometer', category: 'electrical', container: false, glass: false, massG: 400, electrical: true, componentType: 'rheostat', value: 100, terminals: ['a', 'b'], dims: { diameterMm: 160, heightMm: 60 } });
A({ id: 'paper_clips', name: 'Paper clips (box)', shape: 'paperClips', category: 'support', container: false, glass: false, material: 'steel', massG: 50, dims: { diameterMm: 50, heightMm: 20 } });
A({ id: 'pins', name: 'Optical pins (box)', shape: 'pins', category: 'physics-optics', container: false, glass: false, massG: 15, dims: { diameterMm: 40, heightMm: 20 } });
A({ id: 'lagging_material', name: 'Lagging material (bubble wrap)', shape: 'lagging', category: 'heating', container: false, glass: false, material: 'plastic', massG: 30, dims: { diameterMm: 200, heightMm: 300 } });
A({ id: 'kettle_area', name: 'Hot-water jug (kettle)', shape: 'kettle', category: 'heating', container: true, capacityML: 1700, glass: false, massG: 900, dims: { diameterMm: 150, heightMm: 250 }, heatSource: true, powerW: 120 });
A({ id: 'fan', name: 'Electric fan', shape: 'fan', category: 'physics', container: false, glass: false, massG: 1200, dims: { diameterMm: 250, heightMm: 300 }, electrical: true, terminals: ['a', 'b'] });
A({ id: 'lamp', name: 'Lamp on a stand', shape: 'lampStand', category: 'physics-optics', container: false, glass: true, massG: 400, dims: { diameterMm: 150, heightMm: 250 }, lightSource: true, electrical: true, terminals: ['a', 'b'] });
A({ id: 'laser_pointer', name: 'Laser pointer (class 2)', shape: 'laserPointer', category: 'physics-optics', container: false, glass: false, massG: 80, dims: { diameterMm: 15, heightMm: 120 }, lightSource: true });
A({ id: 'lid', name: 'Lid (watch-glass type)', shape: 'lid', category: 'glassware', container: false, glass: true, massG: 30, dims: { diameterMm: 80, heightMm: 10 } });
A({ id: 'ball_bearing', name: 'Steel ball bearing', shape: 'ball', category: 'physics-mechanics', container: false, glass: false, material: 'steel', massG: 28, dims: { diameterMm: 19, heightMm: 19 } });
A({ id: 'electromagnet_release', name: 'Electromagnet release unit', shape: 'releaseUnit', category: 'physics-mechanics', container: false, glass: false, massG: 300, electrical: true, terminals: ['a', 'b'], dims: { diameterMm: 60, heightMm: 90 } });
A({ id: 'ohmmeter', name: 'Ohmmeter', shape: 'multimeter', category: 'measurement', container: false, glass: false, massG: 250, instrument: 'multimeter', measures: 'resistance', dims: { diameterMm: 90, heightMm: 60 } });
A({ id: 'resistor_100k', name: 'Resistor, 100 kohm', shape: 'resistor', category: 'electrical', container: false, glass: false, massG: 15, electrical: true, componentType: 'resistor', value: 100000, terminals: ['a', 'b'], dims: { diameterMm: 25, heightMm: 10 } });
A({ id: 'graticule', name: 'Eyepiece graticule', shape: 'graticule', category: 'biology-microscopy', container: false, glass: true, massG: 5, dims: { diameterMm: 20, heightMm: 2 } });
A({ id: 'stage_micrometer', name: 'Stage micrometer', shape: 'slide', category: 'biology-microscopy', container: false, glass: true, massG: 5, dims: { diameterMm: 25, heightMm: 75 } });
A({ id: 'inoculating_loop', name: 'Inoculating loop', shape: 'inoculatingLoop', category: 'biology', container: false, glass: false, massG: 15, dims: { diameterMm: 5, heightMm: 200 } });
A({ id: 'spreader', name: 'L-shaped spreader', shape: 'spreader', category: 'biology', container: false, glass: false, massG: 20, dims: { diameterMm: 10, heightMm: 200 } });
A({ id: 'micropipette', name: 'Micropipette (20-200 microlitre)', shape: 'micropipette', category: 'measurement', container: false, glass: false, massG: 120, instrument: 'pipette_25', measures: 'volume', dims: { diameterMm: 25, heightMm: 250 } });
A({ id: 'counting_aid', name: 'Colony counter grid', shape: 'countingGrid', category: 'biology', container: false, glass: false, massG: 100, dims: { diameterMm: 150, heightMm: 5 } });
A({ id: 'spatula_general', name: 'Spatula (wide)', shape: 'spatula', category: 'support', container: false, glass: false, massG: 35, dims: { diameterMm: 20, heightMm: 220 } });
A({ id: 'cutting_board', name: 'Cutting board', shape: 'cuttingBoard', category: 'biology-dissection', container: false, glass: false, massG: 400, dims: { diameterMm: 250, heightMm: 20 } });
A({ id: 'mounted_needle_bio', name: 'Mounted needle (biology)', shape: 'mountedNeedle', category: 'biology-dissection', container: false, glass: false, massG: 10, dims: { diameterMm: 8, heightMm: 130 } });
A({ id: 'disinfectant', name: 'Disinfectant spray bottle', shape: 'sprayBottle', category: 'biology', container: true, capacityML: 500, glass: false, massG: 550, dims: { diameterMm: 80, heightMm: 250 } });
A({ id: 'autoclave_bin', name: 'Autoclave / biohazard bin', shape: 'autoclaveBin', category: 'biology', container: false, glass: false, massG: 3000, dims: { diameterMm: 300, heightMm: 600 } });
A({ id: 'hair_dryer', name: 'Hair dryer (for drying chromatograms)', shape: 'hairDryer', category: 'support', container: false, glass: false, massG: 500, electrical: true, terminals: ['a', 'b'], dims: { diameterMm: 100, heightMm: 250 } });
A({ id: 'identification_key', name: 'Species identification key', shape: 'booklet', category: 'biology-ecology', container: false, glass: false, massG: 100, dims: { diameterMm: 150, heightMm: 210 } });
A({ id: 'notebook', name: 'Laboratory notebook', shape: 'booklet', category: 'support', container: false, glass: false, massG: 250, dims: { diameterMm: 150, heightMm: 210 } });
A({ id: 'card_dampers', name: 'Damping cards (set)', shape: 'dampingCards', category: 'physics', container: false, glass: false, material: 'card', massG: 20, dims: { diameterMm: 80, heightMm: 20 } });
A({ id: 'metal_cylinder', name: 'Metal cylinder (density specimen)', shape: 'cylinderSpecimen', category: 'physics-mechanics', container: false, glass: false, massG: 85, dims: { diameterMm: 20, heightMm: 50 } });
A({ id: 'buffer_solution_ph7', name: 'Buffer solution pH 7 (apparatus entry)', shape: 'droppingBottle', category: 'reagent', container: true, capacityML: 100, bottle: true, massG: 100, dims: { diameterMm: 45, heightMm: 120 } });
