// ---------------------------------------------------------------------------
// SPECIES DATABASE
// ---------------------------------------------------------------------------
// Everything that can exist *inside* a container is described here: ions in
// solution, dissolved molecules, gaseous species and insoluble solids
// (precipitates and residues).  Bulk reagents that a student picks up from the
// shelf live in `substances.js` and are converted into species when they are
// dissolved / poured.
//
// Adding a new species is purely data work - no engine change is required.
//
//   kind       'ion' | 'molecule' | 'solid' | 'gas'
//   state      'aq' | 'l' | 's' | 'g'
//   molarMass  g/mol
//   colour     null = colourless, else '#rrggbb'
//   strength   optical density factor used to blend solution colours
//   cp         molar heat capacity J/mol/K (optional)
//   solubility g per 100 mL water at 20 C (solids)
// ---------------------------------------------------------------------------

const I = (id, name, formula, molarMass, charge, colour = null, extra = {}) =>
  ({ id, name, formula, kind: 'ion', state: 'aq', molarMass, charge, colour, ...extra });

export const SPECIES = {};
const add = (list) => { for (const s of list) SPECIES[s.id] = s; };

add([
  // ---------------------------------------------------------------- cations
  I('H+', 'Hydrogen ion (proton)', 'H+', 1.008, 1),
  I('Li+', 'Lithium ion', 'Li+', 6.94, 1),
  I('Na+', 'Sodium ion', 'Na+', 22.99, 1),
  I('K+', 'Potassium ion', 'K+', 39.098, 1),
  I('Cs+', 'Caesium ion', 'Cs+', 132.905, 1),
  I('NH4+', 'Ammonium ion', 'NH4+', 18.039, 1),
  I('Mg2+', 'Magnesium ion', 'Mg2+', 24.305, 2),
  I('Ca2+', 'Calcium ion', 'Ca2+', 40.078, 2),
  I('Sr2+', 'Strontium ion', 'Sr2+', 87.62, 2),
  I('Ba2+', 'Barium ion', 'Ba2+', 137.327, 2),
  I('Al3+', 'Aluminium ion', 'Al3+', 26.982, 3),
  I('Zn2+', 'Zinc ion', 'Zn2+', 65.38, 2),
  I('Cu+', 'Copper(I) ion', 'Cu+', 63.546, 1, '#a8c8a8'),
  I('Cu2+', 'Copper(II) ion', 'Cu2+', 63.546, 2, '#2f6fd0', { strength: 0.9 }),
  I('Fe2+', 'Iron(II) ion', 'Fe2+', 55.845, 2, '#7fc79b', { strength: 0.55 }),
  I('Fe3+', 'Iron(III) ion', 'Fe3+', 55.845, 3, '#b9761f', { strength: 0.8 }),
  I('Mn2+', 'Manganese(II) ion', 'Mn2+', 54.938, 2, '#f2c6d0', { strength: 0.25 }),
  I('Cr3+', 'Chromium(III) ion', 'Cr3+', 52.0, 3, '#4f7f52', { strength: 0.8 }),
  I('Ni2+', 'Nickel(II) ion', 'Ni2+', 58.693, 2, '#3fbf8f', { strength: 0.8 }),
  I('Co2+', 'Cobalt(II) ion', 'Co2+', 58.933, 2, '#e07a9a', { strength: 0.8 }),
  I('Pb2+', 'Lead(II) ion', 'Pb2+', 207.2, 2),
  I('Ag+', 'Silver ion', 'Ag+', 107.868, 1),
  I('Sn2+', 'Tin(II) ion', 'Sn2+', 118.71, 2),
  I('CuNH4', 'Tetraamminecopper(II) complex', '[Cu(NH3)4]2+', 131.6, 2, '#1b2fbf', { strength: 1.4 }),

  // ---------------------------------------------------------------- anions
  I('OH-', 'Hydroxide ion', 'OH-', 17.008, -1),
  I('F-', 'Fluoride ion', 'F-', 18.998, -1),
  I('Cl-', 'Chloride ion', 'Cl-', 35.45, -1),
  I('Br-', 'Bromide ion', 'Br-', 79.904, -1),
  I('I-', 'Iodide ion', 'I-', 126.904, -1),
  I('NO3-', 'Nitrate ion', 'NO3-', 62.004, -1),
  I('NO2-', 'Nitrite ion', 'NO2-', 46.005, -1),
  I('HCO3-', 'Hydrogencarbonate ion', 'HCO3-', 61.017, -1),
  I('CH3COO-', 'Ethanoate ion', 'CH3COO-', 59.044, -1),
  I('MnO4-', 'Permanganate ion', 'MnO4-', 118.936, -1, '#6a1bab', { strength: 2.4 }),
  I('ClO-', 'Hypochlorite ion', 'ClO-', 51.452, -1),
  I('ClO3-', 'Chlorate ion', 'ClO3-', 83.452, -1),
  I('SCN-', 'Thiocyanate ion', 'SCN-', 58.08, -1),
  I('HSO4-', 'Hydrogensulfate ion', 'HSO4-', 97.07, -1),
  I('SO4^2-', 'Sulfate ion', 'SO4^2-', 96.06, -2),
  I('SO3^2-', 'Sulfite ion', 'SO3^2-', 80.06, -2),
  I('CO3^2-', 'Carbonate ion', 'CO3^2-', 60.009, -2),
  I('S2-', 'Sulfide ion', 'S2-', 32.06, -2),
  I('S2O3^2-', 'Thiosulfate ion', 'S2O3^2-', 112.13, -2),
  I('C2O4^2-', 'Ethanedioate (oxalate) ion', 'C2O4^2-', 88.02, -2),
  I('CrO4^2-', 'Chromate ion', 'CrO4^2-', 115.99, -2, '#f2c200', { strength: 1.6 }),
  I('Cr2O7^2-', 'Dichromate ion', 'Cr2O7^2-', 215.99, -2, '#e8620d', { strength: 2.0 }),
  I('PO4^3-', 'Phosphate ion', 'PO4^3-', 94.97, -3),
  I('H2PO4-', 'Dihydrogenphosphate ion', 'H2PO4-', 96.99, -1),
  I('HPO4^2-', 'Hydrogenphosphate ion', 'HPO4^2-', 95.98, -2),
]);

add([
  // ------------------------------------------------- molecules & solvents
  { id: 'H2O', name: 'Water', formula: 'H2O', kind: 'molecule', state: 'l', molarMass: 18.015, colour: null, cp: 75.3, density: 0.998, bp: 100, mp: 0 },
  { id: 'H2O2', name: 'Hydrogen peroxide', formula: 'H2O2', kind: 'molecule', state: 'l', molarMass: 34.014, colour: null, density: 1.45, bp: 150.2 },
  { id: 'CH3COOH', name: 'Ethanoic acid (undissociated)', formula: 'CH3COOH', kind: 'molecule', state: 'aq', molarMass: 60.052, colour: null, pKa: 4.76, cp: 123 },
  { id: 'C6H8O7', name: 'Citric acid (undissociated)', formula: 'C6H8O7', kind: 'molecule', state: 'aq', molarMass: 192.124, colour: null, pKa: 3.13 },
  { id: 'H2CO3', name: 'Carbonic acid', formula: 'H2CO3', kind: 'molecule', state: 'aq', molarMass: 62.03, colour: null, pKa: 6.35 },
  { id: 'C2H5OH', name: 'Ethanol', formula: 'C2H5OH', kind: 'molecule', state: 'l', molarMass: 46.068, colour: null, density: 0.789, bp: 78.4, cp: 112, flammable: true },
  { id: 'CH3OH', name: 'Methanol', formula: 'CH3OH', kind: 'molecule', state: 'l', molarMass: 32.042, colour: null, density: 0.792, bp: 64.7, cp: 81, flammable: true },
  { id: 'C3H8O', name: 'Propan-1-ol', formula: 'C3H7OH', kind: 'molecule', state: 'l', molarMass: 60.096, colour: null, density: 0.803, bp: 97.2, flammable: true },
  { id: 'C4H10O', name: 'Butan-1-ol', formula: 'C4H9OH', kind: 'molecule', state: 'l', molarMass: 74.12, colour: null, density: 0.81, bp: 117.7, flammable: true },
  { id: 'C3H8O3', name: 'Glycerol (propane-1,2,3-triol)', formula: 'C3H8O3', kind: 'molecule', state: 'l', molarMass: 92.094, colour: null, density: 1.261, bp: 290 },
  { id: 'C6H14', name: 'Hexane', formula: 'C6H14', kind: 'molecule', state: 'l', molarMass: 86.178, colour: null, density: 0.659, bp: 68.7, flammable: true },
  { id: 'C6H6', name: 'Benzene', formula: 'C6H6', kind: 'molecule', state: 'l', molarMass: 78.11, colour: null, density: 0.876, bp: 80.1, flammable: true, carcinogen: true },
  { id: 'C7H8', name: 'Methylbenzene (toluene)', formula: 'C7H8', kind: 'molecule', state: 'l', molarMass: 92.14, colour: null, density: 0.867, bp: 110.6, flammable: true },
  { id: 'CH3CHO', name: 'Ethanal (acetaldehyde)', formula: 'CH3CHO', kind: 'molecule', state: 'l', molarMass: 44.053, colour: null, density: 0.784, bp: 20.2, flammable: true },
  { id: 'HCHO', name: 'Methanal (formaldehyde)', formula: 'HCHO', kind: 'molecule', state: 'aq', molarMass: 30.026, colour: null, bp: -19, toxic: true },
  { id: 'C3H6O', name: 'Propanone (acetone)', formula: 'CH3COCH3', kind: 'molecule', state: 'l', molarMass: 58.08, colour: null, density: 0.784, bp: 56.1, flammable: true },
  { id: 'C4H8O2', name: 'Ethyl ethanoate', formula: 'CH3COOC2H5', kind: 'molecule', state: 'l', molarMass: 88.105, colour: null, density: 0.902, bp: 77.1, flammable: true },
  { id: 'C6H12O6', name: 'Glucose', formula: 'C6H12O6', kind: 'molecule', state: 'aq', molarMass: 180.156, colour: null, reducing: true },
  { id: 'C6H12O6f', name: 'Fructose', formula: 'C6H12O6', kind: 'molecule', state: 'aq', molarMass: 180.156, colour: null, reducing: true },
  { id: 'C12H22O11', name: 'Sucrose', formula: 'C12H22O11', kind: 'molecule', state: 'aq', molarMass: 342.296, colour: null, reducing: false },
  { id: 'C12H22O11m', name: 'Maltose', formula: 'C12H22O11', kind: 'molecule', state: 'aq', molarMass: 342.296, colour: null, reducing: true },
  { id: 'C6H8O6', name: 'Ascorbic acid (vitamin C)', formula: 'C6H8O6', kind: 'molecule', state: 'aq', molarMass: 176.12, colour: null, reducing: true, pKa: 4.1 },
  { id: 'C2H5NO2', name: 'Glycine (amino acid)', formula: 'H2NCH2COOH', kind: 'molecule', state: 'aq', molarMass: 75.067, colour: null },
  { id: 'CH4N2O', name: 'Urea', formula: 'CO(NH2)2', kind: 'molecule', state: 'aq', molarMass: 60.056, colour: null },
  { id: 'C6H5COOH', name: 'Benzoic acid', formula: 'C6H5COOH', kind: 'solid', state: 's', molarMass: 122.12, colour: '#ffffff', pKa: 4.2, solubility: 0.34 },
  { id: 'I2', name: 'Iodine (dissolved)', formula: 'I2', kind: 'molecule', state: 'aq', molarMass: 253.809, colour: '#6b3a12', strength: 2.2, solubility: 0.03 },
  { id: 'Br2', name: 'Bromine', formula: 'Br2', kind: 'molecule', state: 'l', molarMass: 159.808, colour: '#a8451f', strength: 2.4, density: 3.12, bp: 58.8, toxic: true },
  { id: 'I3-', name: 'Triiodide (starch-iodine complex)', formula: 'I3-', kind: 'molecule', state: 'aq', molarMass: 380.713, colour: '#1d2f6f', strength: 4.0 },
  { id: 'starch', name: 'Starch (colloid)', formula: '(C6H10O5)n', kind: 'molecule', state: 'aq', molarMass: 1000, colour: '#f7f4e8', strength: 0.1 },
  { id: 'protein', name: 'Protein (albumen / gelatine)', formula: '--', kind: 'molecule', state: 'aq', molarMass: 20000, colour: '#f2f0e4', strength: 0.1 },
  { id: 'lipid', name: 'Lipid (oil / fat emulsion)', formula: '--', kind: 'molecule', state: 'l', molarMass: 800, colour: '#f6efc8', strength: 0.3, density: 0.92 },
  { id: 'DNA', name: 'DNA (extracted)', formula: '--', kind: 'molecule', state: 'aq', molarMass: 1000000, colour: '#f4f6f8', strength: 0.15 },
  { id: 'amylase', name: 'Amylase (enzyme)', formula: '--', kind: 'molecule', state: 'aq', molarMass: 50000, colour: '#f8f6ea', strength: 0.1, enzyme: true },
  { id: 'catalase', name: 'Catalase (enzyme)', formula: '--', kind: 'molecule', state: 'aq', molarMass: 240000, colour: '#f8f6ea', strength: 0.1, enzyme: true },
  { id: 'diastase', name: 'Diastase (enzyme)', formula: '--', kind: 'molecule', state: 'aq', molarMass: 50000, colour: '#f8f6ea', strength: 0.1, enzyme: true },
]);

add([
  // ---------------------------------------------------------------- gases
  { id: 'CO2', name: 'Carbon dioxide', formula: 'CO2', kind: 'gas', state: 'g', molarMass: 44.01, colour: null, cp: 37.1, odour: 'odourless', solubility: 0.145 },
  { id: 'O2', name: 'Oxygen', formula: 'O2', kind: 'gas', state: 'g', molarMass: 31.998, colour: null, cp: 29.4, odour: 'odourless', solubility: 0.004, supportsCombustion: true },
  { id: 'H2', name: 'Hydrogen', formula: 'H2', kind: 'gas', state: 'g', molarMass: 2.016, colour: null, cp: 28.8, odour: 'odourless', flammable: true, solubility: 0.0002 },
  { id: 'N2', name: 'Nitrogen', formula: 'N2', kind: 'gas', state: 'g', molarMass: 28.014, colour: null, cp: 29.1, odour: 'odourless' },
  { id: 'Cl2', name: 'Chlorine', formula: 'Cl2', kind: 'gas', state: 'g', molarMass: 70.906, colour: '#d8e34a', cp: 33.9, odour: 'pungent and irritating', toxic: true, solubility: 0.73 },
  { id: 'NH3', name: 'Ammonia', formula: 'NH3', kind: 'gas', state: 'g', molarMass: 17.031, colour: null, cp: 35.1, odour: 'sharp and pungent', toxic: true, solubility: 47, alkaline: true },
  { id: 'HCl', name: 'Hydrogen chloride', formula: 'HCl', kind: 'gas', state: 'g', molarMass: 36.461, colour: null, cp: 29.1, odour: 'sharp and choking', toxic: true, solubility: 72 },
  { id: 'SO2', name: 'Sulfur dioxide', formula: 'SO2', kind: 'gas', state: 'g', molarMass: 64.066, colour: null, cp: 39.9, odour: 'choking, like burnt matches', toxic: true, solubility: 9.4 },
  { id: 'H2S', name: 'Hydrogen sulfide', formula: 'H2S', kind: 'gas', state: 'g', molarMass: 34.08, colour: null, cp: 34.2, odour: 'rotten eggs', toxic: true, solubility: 0.4 },
  { id: 'NO', name: 'Nitrogen monoxide', formula: 'NO', kind: 'gas', state: 'g', molarMass: 30.006, colour: null, cp: 29.8, odour: 'odourless', toxic: true },
  { id: 'NO2', name: 'Nitrogen dioxide', formula: 'NO2', kind: 'gas', state: 'g', molarMass: 46.005, colour: '#a4551d', cp: 36.9, odour: 'sharp and choking', toxic: true },
  { id: 'CH4', name: 'Methane', formula: 'CH4', kind: 'gas', state: 'g', molarMass: 16.043, colour: null, cp: 35.7, odour: 'odourless', flammable: true },
  { id: 'C2H4', name: 'Ethene', formula: 'C2H4', kind: 'gas', state: 'g', molarMass: 28.054, colour: null, cp: 43.6, odour: 'faint sweet', flammable: true },
  { id: 'C2H2', name: 'Ethyne (acetylene)', formula: 'C2H2', kind: 'gas', state: 'g', molarMass: 26.038, colour: null, cp: 44, odour: 'garlic-like', flammable: true },
  { id: 'CO', name: 'Carbon monoxide', formula: 'CO', kind: 'gas', state: 'g', molarMass: 28.01, colour: null, cp: 29.1, odour: 'odourless', toxic: true },
  { id: 'He', name: 'Helium', formula: 'He', kind: 'gas', state: 'g', molarMass: 4.003, colour: null, cp: 20.8, odour: 'odourless' },
  { id: 'H2O_g', name: 'Water vapour (steam)', formula: 'H2O(g)', kind: 'gas', state: 'g', molarMass: 18.015, colour: null, cp: 33.6, odour: 'odourless' },
  { id: 'air', name: 'Air', formula: 'N2/O2 mixture', kind: 'gas', state: 'g', molarMass: 28.96, colour: null, odour: 'odourless' },

  // ------------------------------------------- insoluble solids (residues)
  { id: 'AgCl', name: 'Silver chloride', formula: 'AgCl', kind: 'solid', state: 's', molarMass: 143.321, colour: '#f4f4f4', solubility: 0.00019 },
  { id: 'AgBr', name: 'Silver bromide', formula: 'AgBr', kind: 'solid', state: 's', molarMass: 187.772, colour: '#f0ebd6', solubility: 0.000014 },
  { id: 'AgI', name: 'Silver iodide', formula: 'AgI', kind: 'solid', state: 's', molarMass: 234.773, colour: '#f5e07a', solubility: 0.000003 },
  { id: 'Ag2CO3', name: 'Silver carbonate', formula: 'Ag2CO3', kind: 'solid', state: 's', molarMass: 275.745, colour: '#efe6c8', solubility: 0.0032 },
  { id: 'BaSO4', name: 'Barium sulfate', formula: 'BaSO4', kind: 'solid', state: 's', molarMass: 233.39, colour: '#fbfbfb', solubility: 0.00024 },
  { id: 'BaCO3', name: 'Barium carbonate', formula: 'BaCO3', kind: 'solid', state: 's', molarMass: 197.34, colour: '#fdfdfd', solubility: 0.002 },
  { id: 'CaCO3', name: 'Calcium carbonate', formula: 'CaCO3', kind: 'solid', state: 's', molarMass: 100.087, colour: '#f7f7f2', solubility: 0.0013 },
  { id: 'CaSO4', name: 'Calcium sulfate', formula: 'CaSO4', kind: 'solid', state: 's', molarMass: 136.14, colour: '#fbfbf8', solubility: 0.24 },
  { id: 'MgCO3', name: 'Magnesium carbonate', formula: 'MgCO3', kind: 'solid', state: 's', molarMass: 84.314, colour: '#f8f8f4', solubility: 0.04 },
  { id: 'CuCO3', name: 'Copper(II) carbonate (basic)', formula: 'CuCO3.Cu(OH)2', kind: 'solid', state: 's', molarMass: 221.11, colour: '#2f7f5f', solubility: 0.0001 },
  { id: 'Cu(OH)2', name: 'Copper(II) hydroxide', formula: 'Cu(OH)2', kind: 'solid', state: 's', molarMass: 97.561, colour: '#4fb3d9', solubility: 0.0001 },
  { id: 'Fe(OH)2', name: 'Iron(II) hydroxide', formula: 'Fe(OH)2', kind: 'solid', state: 's', molarMass: 89.859, colour: '#4d7a4d', solubility: 0.0001 },
  { id: 'Fe(OH)3', name: 'Iron(III) hydroxide', formula: 'Fe(OH)3', kind: 'solid', state: 's', molarMass: 106.867, colour: '#8b3a1d', solubility: 0.00002 },
  { id: 'Al(OH)3', name: 'Aluminium hydroxide', formula: 'Al(OH)3', kind: 'solid', state: 's', molarMass: 78.004, colour: '#f6f6f6', solubility: 0.0001 },
  { id: 'Mg(OH)2', name: 'Magnesium hydroxide', formula: 'Mg(OH)2', kind: 'solid', state: 's', molarMass: 58.32, colour: '#fafafa', solubility: 0.0009 },
  { id: 'Zn(OH)2', name: 'Zinc hydroxide', formula: 'Zn(OH)2', kind: 'solid', state: 's', molarMass: 99.4, colour: '#f9f9f9', solubility: 0.0004 },
  { id: 'Pb(OH)2', name: 'Lead(II) hydroxide', formula: 'Pb(OH)2', kind: 'solid', state: 's', molarMass: 241.21, colour: '#f8f8f8', solubility: 0.0155 },
  { id: 'PbI2', name: 'Lead(II) iodide', formula: 'PbI2', kind: 'solid', state: 's', molarMass: 461.0, colour: '#f6d32d', solubility: 0.076 },
  { id: 'PbCl2', name: 'Lead(II) chloride', formula: 'PbCl2', kind: 'solid', state: 's', molarMass: 278.1, colour: '#fafafa', solubility: 0.99 },
  { id: 'PbSO4', name: 'Lead(II) sulfate', formula: 'PbSO4', kind: 'solid', state: 's', molarMass: 303.26, colour: '#fcfcfc', solubility: 0.0043 },
  { id: 'PbCrO4', name: 'Lead(II) chromate', formula: 'PbCrO4', kind: 'solid', state: 's', molarMass: 323.19, colour: '#f2d024', solubility: 0.000006 },
  { id: 'PbS', name: 'Lead(II) sulfide', formula: 'PbS', kind: 'solid', state: 's', molarMass: 239.27, colour: '#2b2b2b', solubility: 0.000086 },
  { id: 'CuS', name: 'Copper(II) sulfide', formula: 'CuS', kind: 'solid', state: 's', molarMass: 95.61, colour: '#222222', solubility: 0.000003 },
  { id: 'FeS', name: 'Iron(II) sulfide', formula: 'FeS', kind: 'solid', state: 's', molarMass: 87.91, colour: '#2e2e2e', solubility: 0.0006 },
  { id: 'ZnS', name: 'Zinc sulfide', formula: 'ZnS', kind: 'solid', state: 's', molarMass: 97.45, colour: '#f4f4f0', solubility: 0.00007 },
  { id: 'MnO2', name: 'Manganese(IV) oxide', formula: 'MnO2', kind: 'solid', state: 's', molarMass: 86.937, colour: '#1f1f22', solubility: 0.0001 },
  { id: 'CuO', name: 'Copper(II) oxide', formula: 'CuO', kind: 'solid', state: 's', molarMass: 79.545, colour: '#1b1b1b', solubility: 0.0001 },
  { id: 'Cu2O', name: 'Copper(I) oxide', formula: 'Cu2O', kind: 'solid', state: 's', molarMass: 143.09, colour: '#b5451f', solubility: 0.0001 },
  { id: 'Fe2O3', name: 'Iron(III) oxide', formula: 'Fe2O3', kind: 'solid', state: 's', molarMass: 159.687, colour: '#8f2d16', solubility: 0.0001 },
  { id: 'ZnO', name: 'Zinc oxide', formula: 'ZnO', kind: 'solid', state: 's', molarMass: 81.379, colour: '#fbfbf7', solubility: 0.0004 },
  { id: 'MgO', name: 'Magnesium oxide', formula: 'MgO', kind: 'solid', state: 's', molarMass: 40.304, colour: '#fbfbfb', solubility: 0.0086 },
  { id: 'CaO', name: 'Calcium oxide', formula: 'CaO', kind: 'solid', state: 's', molarMass: 56.077, colour: '#fbfbfb', solubility: 0.13 },
  { id: 'Al2O3', name: 'Aluminium oxide', formula: 'Al2O3', kind: 'solid', state: 's', molarMass: 101.96, colour: '#f8f8f8', solubility: 0.0001 },
  { id: 'S8', name: 'Sulfur', formula: 'S8', kind: 'solid', state: 's', molarMass: 256.52, colour: '#f2e04a', solubility: 0.0002, mp: 115, bp: 444 },
  { id: 'C', name: 'Carbon (graphite)', formula: 'C', kind: 'solid', state: 's', molarMass: 12.011, colour: '#1c1c1c', solubility: 0 },
  { id: 'SiO2', name: 'Silicon dioxide (sand)', formula: 'SiO2', kind: 'solid', state: 's', molarMass: 60.084, colour: '#e6d9b8', solubility: 0 },
  { id: 'CuSO4', name: 'Copper(II) sulfate (anhydrous)', formula: 'CuSO4', kind: 'solid', state: 's', molarMass: 159.609, colour: '#f6f6f6', solubility: 20 },
  { id: 'CuSO4.5H2O', name: 'Copper(II) sulfate-5-water', formula: 'CuSO4.5H2O', kind: 'solid', state: 's', molarMass: 249.685, colour: '#1f7fbf', solubility: 32, mp: 110 },
  { id: 'CaC2O4', name: 'Calcium ethanedioate', formula: 'CaC2O4', kind: 'solid', state: 's', molarMass: 128.1, colour: '#fbfbfb', solubility: 0.0007 },
  { id: 'KNO3', name: 'Potassium nitrate (crystals)', formula: 'KNO3', kind: 'solid', state: 's', molarMass: 101.103, colour: '#fdfdfd', solubility: 31 },
  { id: 'NaCl', name: 'Sodium chloride (crystals)', formula: 'NaCl', kind: 'solid', state: 's', molarMass: 58.44, colour: '#fdfdfd', solubility: 36 },
  { id: 'catalyst_A', name: 'Catalyst surface', formula: '--', kind: 'solid', state: 's', molarMass: 1, colour: '#c0c0c0', catalyst: true },
]);

/** Sensible fallback so a typo in the data cannot crash a simulation. */
export function getSpecies(id) {
  return SPECIES[id] || { id, name: id, formula: id, kind: 'molecule', state: 'aq', molarMass: 50, colour: null };
}
export const isSpecies = (id) => Object.prototype.hasOwnProperty.call(SPECIES, id);

// --------------------------------------------------------------- metals
// Metals appear both as bulk reagents (ribbon, granules, foil) and as
// undissolved solids inside a container, so they need species entries too.
add([
  { id: 'Mg', name: 'Magnesium', formula: 'Mg', kind: 'solid', state: 's', molarMass: 24.305, colour: '#c9ccd1', solubility: 0, metal: true, reactivity: 5 },
  { id: 'Zn', name: 'Zinc', formula: 'Zn', kind: 'solid', state: 's', molarMass: 65.38, colour: '#b8bfc6', solubility: 0, metal: true, reactivity: 3 },
  { id: 'Fe', name: 'Iron', formula: 'Fe', kind: 'solid', state: 's', molarMass: 55.845, colour: '#8d9199', solubility: 0, metal: true, reactivity: 2 },
  { id: 'Cu', name: 'Copper', formula: 'Cu', kind: 'solid', state: 's', molarMass: 63.546, colour: '#b87333', solubility: 0, metal: true, reactivity: 1 },
  { id: 'Al', name: 'Aluminium', formula: 'Al', kind: 'solid', state: 's', molarMass: 26.982, colour: '#cfd3d8', solubility: 0, metal: true, reactivity: 4, passivates: true },
  { id: 'Pb', name: 'Lead', formula: 'Pb', kind: 'solid', state: 's', molarMass: 207.2, colour: '#7a7d85', solubility: 0, metal: true, reactivity: 1.5, toxic: true },
  { id: 'Ca', name: 'Calcium', formula: 'Ca', kind: 'solid', state: 's', molarMass: 40.078, colour: '#d5d8dc', solubility: 0, metal: true, reactivity: 6 },
  { id: 'Na', name: 'Sodium', formula: 'Na', kind: 'solid', state: 's', molarMass: 22.99, colour: '#d9dce0', solubility: 0, metal: true, reactivity: 7 },
  { id: 'K', name: 'Potassium', formula: 'K', kind: 'solid', state: 's', molarMass: 39.098, colour: '#d9dce0', solubility: 0, metal: true, reactivity: 8 },
]);

// ------------------------------------------------- complexes & extra ions
add([
  I('C6H5O7^3-', 'Citrate ion', 'C6H5O7^3-', 189.1, -3),
  I('Al(OH)4-', 'Tetrahydroxoaluminate (aluminate) ion', 'Al(OH)4-', 95.01, -1),
  I('FeSCN2+', 'Thiocyanatoiron(III) complex', 'FeSCN2+', 113.93, 2, '#8b1a1a', { strength: 2.2 }),
  I('S4O6^2-', 'Tetrathionate ion', 'S4O6^2-', 224.26, -2),
  I('C6H11O7-', 'Gluconate ion', 'C6H11O7-', 195.15, -1),
  I('IO3-', 'Iodate ion', 'IO3-', 174.9, -1),
  I('C6H12O7', 'Gluconic acid', 'C6H12O7', 196.16, 0),
  { id: 'HClO', name: 'Hypochlorous acid', formula: 'HClO', kind: 'molecule', state: 'aq', molarMass: 52.46, colour: null, pKa: 7.5 },
  { id: 'C6H12Br2', name: '1,2-Dibromocyclohexane', formula: 'C6H10Br2', kind: 'molecule', state: 'l', molarMass: 241.95, colour: null, density: 1.7, miscible: false },
  { id: 'C6H12Cl2', name: '1,2-Dichlorohexane', formula: 'C6H12Cl2', kind: 'molecule', state: 'l', molarMass: 155.07, colour: null, density: 1.07, miscible: false },
  { id: 'protein_Cu', name: 'Protein-copper(II) complex (biuret)', formula: 'Cu-protein', kind: 'molecule', state: 'aq', molarMass: 20000, colour: '#7d3c98', strength: 1.6 },
  { id: 'starch_I2', name: 'Starch-iodine complex', formula: 'starch.I2', kind: 'molecule', state: 'aq', molarMass: 1254, colour: '#141a3a', strength: 4.5 },
  { id: 'brom_alkene', name: 'Dibromoalkane (bromine water test product)', formula: 'R-CHBr-CHBr-R', kind: 'molecule', state: 'aq', molarMass: 242, colour: null },
  { id: 'Ag2CrO4', name: 'Silver chromate(VI)', formula: 'Ag2CrO4', kind: 'solid', state: 's', molarMass: 331.73, colour: '#a03a1f', solubility: 0.0022 },
  { id: 'MgS', name: 'Magnesium sulfide', formula: 'MgS', kind: 'solid', state: 's', molarMass: 56.37, colour: '#d8c9c0', solubility: 0.0001 },
  { id: 'Cu2S', name: 'Copper(I) sulfide', formula: 'Cu2S', kind: 'solid', state: 's', molarMass: 159.16, colour: '#1c1c1c', solubility: 0.0001 },
  { id: 'CuCl2', name: 'Copper(II) chloride (solution)', formula: 'CuCl2', kind: 'solid', state: 's', molarMass: 134.45, colour: '#2f9fd0', solubility: 70 },
  { id: 'CaCl2', name: 'Calcium chloride', formula: 'CaCl2', kind: 'solid', state: 's', molarMass: 110.98, colour: '#fbfbfb', solubility: 74 },
  { id: 'glucose_reduced', name: 'Gluconate (oxidised sugar product)', formula: 'C6H11O7-', kind: 'molecule', state: 'aq', molarMass: 195.15, colour: null },
]);

// Immiscibility / density data used by the layer model.
const IMMISCIBLE = ['C6H14', 'C6H6', 'C7H8', 'lipid', 'C6H12Br2', 'C6H12Cl2', 'C8H18'];
for (const id of IMMISCIBLE) if (SPECIES[id]) { SPECIES[id].miscible = false; SPECIES[id].density ??= 0.7; }
if (SPECIES.H2O) SPECIES.H2O.miscible = true;
if (SPECIES.C6H12) { SPECIES.C6H12.miscible = false; SPECIES.C6H12.density ??= 0.78; }
if (SPECIES.cyclohexene) SPECIES.cyclohexene.miscible = false;

// -------------------------------------- extra species used by reaction rules
add([
  I('HSO3-', 'Hydrogensulfite ion', 'HSO3-', 81.07, -1),
  I('AgNH3', 'Diamminesilver(I) ion', '[Ag(NH3)2]+', 141.93, 1),
  I('NO+', 'Nitrosonium ion', 'NO+', 30.0, 1),
  { id: 'H2SO3', name: 'Sulfurous acid', formula: 'H2SO3', kind: 'molecule', state: 'aq', molarMass: 82.08, colour: null, pKa: 1.8 },
  { id: 'Ag', name: 'Silver', formula: 'Ag', kind: 'solid', state: 's', molarMass: 107.868, colour: '#e8e8ea', solubility: 0, metal: true },
  { id: 'Cu(s)', name: 'Copper (deposited)', formula: 'Cu', kind: 'solid', state: 's', molarMass: 63.546, colour: '#b87333', solubility: 0, metal: true },
  { id: 'S', name: 'Sulfur (precipitated)', formula: 'S', kind: 'solid', state: 's', molarMass: 32.06, colour: '#f5e97a', solubility: 0 },
  { id: 'C6H10O5', name: 'Starch unit (maltose precursor)', formula: 'C6H10O5', kind: 'molecule', state: 'aq', molarMass: 162.14, colour: null },
  { id: 'O2_air', name: 'Atmospheric oxygen', formula: 'O2', kind: 'gas', state: 'g', molarMass: 31.998, colour: null, cp: 29.4, solubility: 0.004 },
]);

add([
  I('S2O8^2-', 'Peroxodisulfate ion', 'S2O8^2-', 192.12, -2),
  I('MnO4^2-', 'Manganate(VI) ion', 'MnO4^2-', 118.94, -2, '#1f7f4f', { strength: 20 }),
  { id: 'soap', name: 'Soap (sodium carboxylate)', formula: 'RCOO-Na+', kind: 'molecule', state: 'aq', molarMass: 305, colour: '#f7f4e6', strength: 0.2 },
  { id: 'chlorophyll', name: 'Chlorophyll (in plant tissue)', formula: '--', kind: 'molecule', state: 's', molarMass: 900, colour: '#1f6f2f', catalyst: true },
  { id: 'respiring_tissue', name: 'Respiring tissue (enzymes present)', formula: '--', kind: 'molecule', state: 's', molarMass: 1000, colour: '#d9c9a0', catalyst: true },
]);

add([
  { id: 'propanal', name: 'Propanal', formula: 'CH3CH2CHO', kind: 'molecule', state: 'l', molarMass: 58.08, colour: null, density: 0.81, bp: 48 },
  { id: 'propanone', name: 'Propanone', formula: 'CH3COCH3', kind: 'molecule', state: 'l', molarMass: 58.08, colour: null, density: 0.784, bp: 56.1 },
  { id: 'butanal', name: 'Butanal', formula: 'CH3CH2CH2CHO', kind: 'molecule', state: 'l', molarMass: 72.11, colour: null, density: 0.8, bp: 75 },
]);

add([
  { id: 'Na2CO3', name: 'Sodium carbonate (anhydrous)', formula: 'Na2CO3', kind: 'solid', state: 's', molarMass: 105.99, colour: '#fdfdfd', solubility: 21, mp: 851 },
  { id: 'NaOH', name: 'Sodium hydroxide (solid)', formula: 'NaOH', kind: 'solid', state: 's', molarMass: 39.997, colour: '#fdfdfd', solubility: 109, mp: 318 },
  { id: 'NaHCO3', name: 'Sodium hydrogencarbonate (solid)', formula: 'NaHCO3', kind: 'solid', state: 's', molarMass: 84.007, colour: '#fdfdfd', solubility: 9.6 },
  { id: 'KI', name: 'Potassium iodide (solid)', formula: 'KI', kind: 'solid', state: 's', molarMass: 166.003, colour: '#fdfdfd', solubility: 148, mp: 681 },
  { id: 'KCl', name: 'Potassium chloride (solid)', formula: 'KCl', kind: 'solid', state: 's', molarMass: 74.551, colour: '#fdfdfd', solubility: 34 },
  { id: 'NaCl', name: 'Sodium chloride (crystals)', formula: 'NaCl', kind: 'solid', state: 's', molarMass: 58.44, colour: '#fdfdfd', solubility: 36 },
  { id: 'C12H22O11s', name: 'Sucrose (solid)', formula: 'C12H22O11', kind: 'solid', state: 's', molarMass: 342.296, colour: '#fdfdfd', solubility: 200 },
  { id: 'C6H12O6s', name: 'Glucose (solid)', formula: 'C6H12O6', kind: 'solid', state: 's', molarMass: 180.156, colour: '#fdfdfd', solubility: 91 },
  { id: 'CH3COONa', name: 'Sodium ethanoate', formula: 'CH3COONa', kind: 'solid', state: 's', molarMass: 82.034, colour: '#fdfdfd', solubility: 46 },
  { id: 'NaNO3', name: 'Sodium nitrate', formula: 'NaNO3', kind: 'solid', state: 's', molarMass: 84.995, colour: '#fdfdfd', solubility: 91 },
  { id: 'CuNO3', name: 'Copper(II) nitrate (hydrated)', formula: 'Cu(NO3)2.3H2O', kind: 'solid', state: 's', molarMass: 241.6, colour: '#2f6fd0', solubility: 137 },
]);

add([
  { id: 'dcpip_ox', name: 'DCPIP (oxidised, blue)', formula: 'C12H7Cl2NO2', kind: 'molecule', state: 'aq', molarMass: 268.1, colour: '#2a52be', strength: 12 },
  { id: 'dcpip_red', name: 'DCPIP (reduced, colourless)', formula: 'C12H9Cl2NO2', kind: 'molecule', state: 'aq', molarMass: 270.1, colour: null },
  { id: 'C6H6O6', name: 'Dehydroascorbic acid', formula: 'C6H6O6', kind: 'molecule', state: 'aq', molarMass: 174.11, colour: null },
  { id: 'yeast', name: 'Yeast cells (enzymes)', formula: '--', kind: 'molecule', state: 'aq', molarMass: 100000, colour: '#e8dcc0', strength: 0.3, catalyst: true },
]);

add([
  { id: 'C6H12', name: 'Cyclohexane / hex-1-ene', formula: 'C6H12', kind: 'molecule', state: 'l', molarMass: 84.16,
    colour: null, density: 0.78, bp: 80.7, flammable: true, miscible: false },
]);

add([
  { id: 'CuCitrate', name: 'Copper(II) citrate complex (Benedict\'s reagent)', formula: '[Cu(citrate)]-',
    kind: 'molecule', state: 'aq', molarMass: 253.7, colour: '#2f6fd0', strength: 0.9 },
]);

// Indicator dyes: the colour is supplied by the indicator logic, not by the
// species entry, so these are colourless carriers whose presence in the
// aqueous phase switches the indicator colouring on.
add([
  { id: 'dye_UI', name: 'Universal indicator dye', formula: 'dye mixture', kind: 'molecule', state: 'aq', molarMass: 300, colour: null },
  { id: 'dye_litmus', name: 'Litmus dye', formula: 'dye mixture', kind: 'molecule', state: 'aq', molarMass: 300, colour: null },
  { id: 'dye_MO', name: 'Methyl orange dye', formula: 'C14H14N3NaO3S', kind: 'molecule', state: 'aq', molarMass: 327.3, colour: null },
  { id: 'dye_PP', name: 'Phenolphthalein dye', formula: 'C20H14O4', kind: 'molecule', state: 'aq', molarMass: 318.3, colour: null },
  { id: 'dye_BTB', name: 'Bromothymol blue dye', formula: 'C27H28Br2O5S', kind: 'molecule', state: 'aq', molarMass: 624.4, colour: null }
]);
