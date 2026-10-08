import { E } from './schema.js';

// =================== ADVANCED / RESEARCH TEMPLATES ===========================
// These are deliberately open: you choose the apparatus, the variables and the
// analysis.  Each one defines a research question, a suggested design and the
// data treatment that a good report would need.

E('research', 'research', 'Design your own kinetics investigation', 'Investigate how one variable of your choice affects the rate of a reaction you select, and determine the order and rate constant.', {
  mode: 'research', duration: 'open ended', tags: 'kinetics, design, rate constant',
  apparatus: 'conical_flask_250, gas_syringe, colorimeter, stopwatch, water_bath, thermometer, burette_50, measuring_cylinder_25, retort_stand',
  substances: 'hcl_1m:100 cm3, marble_chips:10 g, na2s2o3_0_1m:100 cm3, ki_1m:50 cm3, kmno4_0_02m:50 cm3',
  theory: 'Rate = k[A]^m[B]^n. Determinations of order need measurements in which only one concentration changes at a time; the rate constant follows from the rate equation, and the activation energy from the temperature dependence.',
  safety: 'Write your own risk assessment before starting|Any gas-producing reaction must be vented, never sealed|Corrosive, oxidising and toxic reagents require goggles, gloves and a fume hood',
  procedure: 'Choose the reaction and write down the rate equation you expect|Decide the independent variable, the dependent variable and the control variables and justify each choice|Choose the apparatus and the measurement method that give the best resolution and range|Plan at least five readings with repeats and state how you will reduce random error|Collect the data, plot it appropriately and determine the order, the rate constant and their uncertainties',
  observations: 'Record everything that changes as well as the numbers: colour, temperature, any precipitate or gas.',
  measurements: 'at least two measured quantities per reading, with the instrument resolution and uncertainty for each',
  variables: 'independent: your chosen variable|dependent: the rate measured from your raw data|control: everything else that could affect the rate, justified',
  expected: 'A defensible conclusion supported by graphs and a quantitative uncertainty analysis, with limitations discussed.',
  calculations: 'rate from the gradient of your raw data|order from a log-log plot|rate constant with units|Arrhenius treatment if you vary the temperature|propagate uncertainties',
  questions: 'What is the biggest source of uncertainty in your design?|How would you improve the reliability of the most uncertain measurement?|Would a different technique for measuring the rate change your conclusion?',
  configurable: { rate: true, concentrations: true, temperature: true, catalyst: true, apparatus: true },
  dataAnalysis: { plots: ['raw data against time', 'rate against concentration', 'log rate against log concentration', 'Arrhenius plot'], exports: ['csv', 'json'] }
});

E('research', 'research', 'Volumetric analysis with an uncertainty budget', 'Determine the concentration of an unknown solution by titration and produce a full uncertainty budget for the result.', {
  mode: 'research', duration: 'open ended', tags: 'titration, uncertainty, validation',
  apparatus: 'burette_50, pipette_25, conical_flask_250, volumetric_flask_250, ph_meter, colorimeter, top_pan_balance, retort_stand, clamp',
  substances: 'unknown_weak_acid:100 cm3, naoh_0_1m:500 cm3, phenolphthalein:10 cm3, ph_buffer_7:50 cm3',
  theory: 'Every measurement carries an uncertainty that propagates into the final concentration. The dominant term tells you which measurement to improve, and comparing with a second method validates the result.',
  safety: 'Corrosive reagents require goggles, gloves and a coat|Never pipette by mouth|Report and clean up spills at once',
  procedure: 'Standardise your titrant against a primary standard or a solution of known concentration|Titrate the unknown at least five times and identify concordant results|Repeat the determination using an independent method such as a pH or colorimetric method|Calculate the concentration and propagate the uncertainties from the balance, the volumetric flask and the burette|Compare the two methods and state which is more reliable and why',
  observations: 'Record the indicator colour changes, the end point volume and any systematic differences between the two methods.',
  measurements: 'mass of primary standard (g)|burette readings (cm3)|pH or absorbance for the second method|temperature (°C)',
  variables: 'independent: the method or the sample used|dependent: the calculated concentration|control: same standard, same technique, same temperature',
  expected: 'Agreement between methods within the combined uncertainty, with the dominant uncertainty identified.',
  calculations: 'concentration with its absolute and percentage uncertainty|sensitivity of the result to each measurement|combined uncertainty by quadrature|compare the methods statistically',
  questions: 'Which measurement limits the precision of your final answer?|Is the difference between the two methods significant?|How would you redesign the experiment to halve the uncertainty?',
  configurable: { titrantConcentration: true, indicator: true, method: true, replicates: true },
  dataAnalysis: { plots: ['titre replicates', 'pH against volume', 'residuals'], exports: ['csv', 'json'] }
});

E('research', 'research', 'Thermal properties: design a cooling investigation', 'Design and carry out an investigation into how a thermal property of your choice depends on one variable.', {
  mode: 'research', duration: 'open ended', tags: 'thermal, insulation, specific heat capacity',
  apparatus: 'beaker_250 x3, thermometer_precise x2, datalogger, hot_plate, ice_bath, top_pan_balance, measuring_cylinder_100, lagging_material',
  substances: 'distilled_water:1000 cm3, sodium_chloride_solid:50 g, vegetable_oil:200 cm3',
  theory: 'Cooling follows Newton\'s law when the temperature difference is small. Specific heat capacity and latent heat come from energy balances; both are affected by heat losses that you must quantify.',
  safety: 'Hot water scalds - use tongs and never fill a beaker more than two-thirds|Keep electrical apparatus and leads away from the water',
  procedure: 'State the property you will measure and the variable you will change|Design the calorimeter and insulation to minimise heat loss and justify your choice|Measure the cooling curve or the temperature change with a data logger, with repeats|Extract the property from the data using an energy balance, including a heat-loss correction|Quantify the uncertainty and compare with a data-book value',
  observations: 'Note any steam, condensation, cracking of glass or unexpected temperature jumps.',
  measurements: 'mass of liquid (g)|temperature against time (°C, s)|ambient temperature (°C)|applied power or energy (W, J)',
  variables: 'independent: your chosen variable|dependent: the thermal property measured|control: volume and starting temperature, insulation, ambient conditions',
  expected: 'A value consistent with the data book within a stated uncertainty, with the heat loss quantified.',
  calculations: 'Q = mcΔT|latent heat from an energy balance|cooling correction by extrapolation|uncertainty propagation from mass, temperature and time',
  questions: 'How much of your energy input was lost and how do you know?|Would a different container change the conclusion?|What is the most significant source of systematic error?',
  configurable: { substance: true, insulation: true, startingTemperature: true, power: true },
  dataAnalysis: { plots: ['cooling curve', 'cooling rate against temperature excess', 'energy balance'], exports: ['csv', 'json'] }
});

E('research', 'research', 'Circuit investigation: I-V characteristics of a chosen component', 'Choose a component, measure its current-voltage characteristic and model its behaviour.', {
  mode: 'research', duration: 'open ended', tags: 'electricity, characterisation, modelling',
  apparatus: 'power_supply, multimeter, ammeter_digital, voltmeter_digital, rheostat, thermistor, diode, lamp_6v, resistor_220, water_bath',
  substances: '',
  theory: 'Ohmic conductors give a straight line; lamps, diodes and thermistors do not. A model such as R = R0(1 + aΔT) or the diode equation lets you predict the behaviour.',
  safety: 'Keep the current within the rating of every component|Check the polarity and switch off between changes|Water and electricity must be kept apart',
  procedure: 'Choose the component and state the model you expect to fit|Decide the voltage range and step size that will show the behaviour clearly|Record current and voltage at each step, repeating one point to check reproducibility|Plot the characteristic and fit a model to the data|Discuss how the component could be used as a sensor',
  observations: 'Watch for heating, a change of gradient, or a threshold voltage.',
  measurements: 'voltage (V) and current (A) at each setting|temperature of the component (°C)',
  variables: 'independent: applied voltage (or temperature)|dependent: current|control: same component, quick readings, same series resistance',
  expected: 'A correctly identified characteristic with a quantitative model and its uncertainty.',
  calculations: 'R = V/I at each point|percentage change in R|model parameters from a suitable plot|uncertainty from the meter resolution',
  questions: 'Which feature of the graph identifies a non-ohmic component?|How would your model predict behaviour outside the measured range?|How could the component be used in a sensing circuit?',
  configurable: { component: true, voltageRange: true, temperature: true },
  dataAnalysis: { plots: ['I against V', 'R against V', 'ln R against 1/T'], exports: ['csv', 'json'] }
});

E('research', 'research', 'Osmosis and water potential: your own design', 'Design a quantitative investigation into osmosis in plant tissue and determine the water potential of the tissue.', {
  mode: 'research', duration: 'open ended', tags: 'osmosis, water potential, plant tissue',
  apparatus: 'cork_borer, scalpel, white_tile, test_tube x8, test_tube_rack, top_pan_balance, measuring_cylinder_25 x8, stopwatch, forceps, ruler',
  substances: 'sucrose_solution_1pct:400 cm3, distilled_water:300 cm3, potato_tissue:40 g',
  theory: 'Water moves from a solution of higher water potential to one of lower water potential. The point of zero mass change identifies the water potential of the tissue, which can be converted from concentration using a calibration table.',
  safety: 'Use the cork borer and scalpel away from your hands on a tile|Label every tube and keep the tissue fully submerged|Discard the sugar solutions after use',
  procedure: 'Decide the concentration range and the number of replicates you need, and justify them|Control the tissue volume, temperature and time of immersion|Measure mass changes precisely and use percentage change to allow for differences in starting mass|Plot a line of best fit and determine the intercept with its uncertainty|Convert to water potential and compare with a literature value',
  observations: 'Record how the texture of the tissue changes as well as the masses.',
  measurements: 'initial and final masses (g)|concentrations (mol/dm3)|time (min)|temperature (°C)|tissue dimensions (mm)',
  variables: 'independent: the concentration of the external solution|dependent: percentage change in mass|control: same tissue, same size, same time and temperature',
  expected: 'A linear relationship with a well-defined intercept and a water potential quoted with an uncertainty.',
  calculations: 'percentage change in mass|intercept from the regression line|conversion from concentration to water potential|confidence interval for the intercept|compare replicate variability',
  questions: 'Why might the relationship not be exactly linear at high concentrations?|How could you reduce the uncertainty in the intercept?|How does the tissue type affect the result?',
  configurable: { tissue: true, concentrationRange: true, replicates: true, immersionTime: true },
  dataAnalysis: { plots: ['percentage mass change against concentration', 'regression with confidence limits'], exports: ['csv', 'json'] }
});

E('research', 'research', 'Enzyme investigation: design your own protocol', 'Investigate how one factor affects the rate of an enzyme-controlled reaction and determine an important constant.', {
  mode: 'research', duration: 'open ended', tags: 'enzymes, kinetics, design',
  apparatus: 'test_tube x8, water_bath, colorimeter, ph_meter, stopwatch, pipette_25, measuring_cylinder_25, syringe_20, datalogger',
  substances: 'amylase_solution:20 cm3, starch_suspension_1pct:100 cm3, catalase_solution:20 cm3, hydrogen_peroxide_20vol:50 cm3, iodine_solution:10 cm3, ph_buffer_7:50 cm3',
  theory: 'Enzyme activity depends on substrate concentration, pH and temperature. Vmax and Km describe the kinetics; the temperature optimum reflects the balance between kinetic energy and denaturation.',
  safety: 'Goggles, lab coat and gloves|Peroxide bleaches skin; iodine stains|Keep the water bath stable and handle hot tubes with tongs',
  procedure: 'State your hypothesis and the variable you will change|Decide how you will measure the initial rate and why that measure is valid|Control the enzyme concentration, pH and temperature throughout|Take at least five readings with repeats and tabulate the raw data|Analyse the data quantitatively and evaluate the design',
  observations: 'Record the qualitative signs of the reaction as well as the numbers.',
  measurements: 'rate data with the resolution of the timing and the measuring instrument|temperature and pH throughout',
  variables: 'independent: your chosen factor|dependent: initial rate|control: enzyme and substrate concentration, pH, temperature, volume',
  expected: 'A quantitative relationship with an appropriate model (Michaelis-Menten, Q10 or a pH optimum) and a clear evaluation.',
  calculations: 'initial rate from your raw data|Km and Vmax if you vary the substrate concentration|Q10 for two temperatures|uncertainty in the fitted parameters',
  questions: 'Is your rate measurement a true initial rate?|What is the main limitation of your method?|How would you test whether the enzyme has been denatured or merely slowed?',
  configurable: { enzyme: true, substrate: true, temperature: true, pH: true, inhibitor: true },
  dataAnalysis: { plots: ['rate against variable', 'Michaelis-Menten curve', 'reciprocal plot', 'Arrhenius or Q10 plot'], exports: ['csv', 'json'] }
});

E('research', 'research', 'Spectroscopic/colorimetric calibration and unknown determination', 'Build a calibration curve with a chosen analytical technique and determine an unknown concentration with a full uncertainty budget.', {
  mode: 'research', duration: 'open ended', tags: 'analytical, calibration, beer-lambert',
  apparatus: 'colorimeter, volumetric_flask_100 x6, pipette_25, test_tube x7, top_pan_balance, datalogger',
  substances: 'cuso4_0_5m:50 cm3, kmno4_0_02m:25 cm3, dcpip:10 cm3, distilled_water:1000 cm3',
  theory: 'Beer-Lambert behaviour gives absorbance proportional to concentration, so a linear calibration converts absorbance readings into concentrations. Deviations from linearity, stray light and cuvette handling are the usual error sources.',
  safety: 'Goggles, lab coat and gloves|Permanganate and copper solutions must go into the correct waste bottle|Handle cuvettes by the frosted faces only',
  procedure: 'Choose the analyte, the wavelength and the concentration range|Prepare at least five standards by serial dilution and measure each in triplicate|Fit the calibration line and check the residuals for linearity|Measure the unknown at a dilution inside the range|Report the concentration with the uncertainty from the fit, the dilution and the repeats',
  observations: 'Note any colour drift, bubbles or scratches on the cuvette.',
  measurements: 'absorbance in triplicate for each standard and the unknown|masses, volumes and dilution factors|wavelength used',
  variables: 'independent: concentration of the standard|dependent: absorbance|control: same cuvette, same wavelength, same temperature, blanked correctly',
  expected: 'A linear calibration with an R2 above 0.99 and an unknown concentration reported with an uncertainty.',
  calculations: 'least-squares line with its standard error|c(unknown) from the line|dilution correction|combined uncertainty|detection limit if you take enough blank readings',
  questions: 'Is the calibration linear over the whole range you tested?|What is the detection limit of your method?|Which error source dominates your uncertainty?',
  configurable: { analyte: true, wavelength: true, range: true, replicates: true },
  dataAnalysis: { plots: ['absorbance against concentration', 'residuals', 'absorbance against time'], exports: ['csv', 'json'] }
});

E('research', 'research', 'Electrochemistry: Faraday\'s law investigation', 'Design an electrolysis investigation and use your results to determine a physical constant.', {
  mode: 'research', duration: 'open ended', tags: 'electrochemistry, electrolysis, Faraday',
  apparatus: 'beaker_250, power_supply, ammeter_digital, stopwatch, analytical_balance, copper_electrodes, carbon_electrodes, wire_red x2, crocodile_clip x4',
  substances: 'cuso4_0_5m:250 cm3, nacl_1m:250 cm3, ethanol:20 cm3',
  theory: 'Faraday\'s laws relate the mass deposited to the charge passed: m = MIt/(zF). The number of electrons transferred depends on the electrode reaction, which depends on the electrolyte and the electrode material.',
  safety: 'Goggles, lab coat and gloves|Keep the current within the rating of the apparatus|Chlorine may be evolved from brine: use the fume hood|Metal solutions must not go down the sink',
  procedure: 'Define the electrode reactions you expect for your chosen electrolyte and predict the products|Design the cell so that the current is steady and measurable and the electrodes can be weighed accurately|Electrolyse for a measured time at a constant current, recording the current every minute|Rinse, dry and reweigh the electrodes and compare the anode and cathode changes|Calculate F and compare with the accepted value, with an uncertainty budget',
  observations: 'Record gas evolution, colour changes, any deposit and whether the electrolyte changes over time.',
  measurements: 'current (A)|time (s)|mass before and after (g)|volume of gas if collected (cm3)',
  variables: 'independent: charge passed, electrolyte or electrode material|dependent: mass deposited or gas evolved|control: concentration, electrode area, temperature',
  expected: 'Faraday\'s law obeyed within a few per cent, with the electrode reactions confirmed by the observations.',
  calculations: 'charge = I t|moles of electrons|F from m = MIt/(zF)|uncertainty from the mass, current and time|compare the anode and cathode mass changes',
  questions: 'Does the electrolyte concentration change with inert electrodes, and why?|What limits the accuracy of your value of F?|How would you confirm the identity of the gas produced?',
  configurable: { electrolyte: true, electrodeMaterial: true, current: true, duration: true },
  dataAnalysis: { plots: ['mass against charge', 'current against time', 'Faraday constant replicates'], exports: ['csv', 'json'] }
});
