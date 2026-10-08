import { E } from './schema.js';

// ============================== IGCSE CHEMISTRY ==============================
E('chemistry', 'igcse', 'Neutralisation: temperature change', 'Measure the temperature rise when hydrochloric acid is neutralised by sodium hydroxide.', {
  duration: '25 min', tags: 'exothermic, enthalpy, neutralisation',
  apparatus: 'conical_flask_250, thermometer, measuring_cylinder_25 x2, heat_proof_mat',
  substances: 'hcl_1m:50 cm3, naoh_1m:50 cm3',
  theory: 'Neutralisation is exothermic. H+ + OH- -> H2O releases about 57 kJ per mole of water formed.',
  safety: 'Goggles and a lab coat must be worn; both reagents are corrosive to the eyes|Wipe up any spill immediately with water',
  procedure: 'Measure 50 cm3 of sodium hydroxide into the flask and record its temperature|Measure 50 cm3 of acid and record its temperature|Pour the acid into the flask and stir once with the thermometer|Record the highest temperature reached|Repeat with 25 cm3 of each reagent and compare',
  observations: 'The temperature rises quickly to a maximum and then falls slowly as heat is lost.',
  measurements: 'temperature of the acid|temperature of the alkali|highest temperature of the mixture',
  variables: 'independent: total volume of reagents|dependent: maximum temperature rise|control: starting temperature, same reagents, same flask',
  expected: 'A rise of about 6-7 °C when 0.05 mol of water is formed; the same rise for 25 cm3 of each.',
  calculations: 'energy released = mass x 4.18 x temperature rise|energy per mole = energy / moles of water formed',
  questions: 'Why is the temperature rise the same when you halve both volumes?|Why does the temperature fall after the maximum?|Suggest two improvements to reduce heat loss.',
  notes: 'The flask is not lagged, so some heat escapes and the experimental value is a little low.'
});

E('chemistry', 'igcse', 'Acid plus carbonate: rate and concentration', 'Investigate how the rate of reaction between marble chips and hydrochloric acid changes with acid concentration.', {
  duration: '40 min', tags: 'rates, gas, carbonate',
  apparatus: 'conical_flask_250, gas_syringe, delivery_tube, bung, measuring_cylinder_50, stopwatch, top_pan_balance',
  substances: 'marble_chips:2 g, hcl_0_1m:50 cm3, hcl_1m:50 cm3, hcl_2m:50 cm3',
  theory: 'Rate = change in amount / time. Doubling the acid concentration doubles the collision frequency, so the initial rate doubles.',
  safety: 'Goggles and lab coat; acid is corrosive|Fit the bung firmly and check that the syringe plunger moves freely',
  procedure: 'Set up the flask with the delivery tube leading to the gas syringe|Weigh out 2 g of marble chips|Add 50 cm3 of acid quickly, start the stopwatch and record the volume every 10 s for two minutes|Repeat with the other concentrations, rinsing the flask each time|Plot volume against time for all three',
  observations: 'Fast steady bubbling that slows and stops as the acid is used up.',
  measurements: 'gas volume (cm3) every 10 s|time (s)|mass of chips (g)',
  variables: 'independent: concentration of hydrochloric acid|dependent: volume of carbon dioxide per unit time|control: mass and size of chips, temperature, volume of acid',
  expected: 'The 2 mol/dm3 acid gives twice the initial gradient; all three level off at a similar final volume because the chips are in excess.',
  calculations: 'initial rate = change in volume / change in time (cm3/s)|moles of CO2 = volume / 24000|moles CaCO3 = mass / 100',
  questions: 'Why do all three curves reach the same final volume?|How would the graph change with powder instead of chips?',
  notes: 'Draw the tangent at t = 0 for the most reliable initial rate.'
});

E('chemistry', 'igcse', 'Rate and surface area', 'Compare the rate at which marble chips and powdered calcium carbonate react with the same acid.', {
  duration: '30 min', tags: 'rates, surface area',
  apparatus: 'conical_flask_250, gas_syringe, delivery_tube, bung, top_pan_balance, stopwatch',
  substances: 'marble_chips:2 g, calcium_carbonate_powder:2 g, hcl_1m:50 cm3',
  theory: 'Reaction happens at the surface. Powder has a much larger surface area per gram, so collisions are more frequent.',
  safety: 'Goggles and lab coat|Rinse the flask thoroughly between runs',
  procedure: 'Run the experiment with 2 g of chips, collecting gas every 10 s|Empty, rinse and dry the flask|Repeat with 2 g of powder using the same acid|Plot both sets of results on the same axes',
  observations: 'The powder fizzes violently and is used up in seconds; the chips fizz steadily for minutes.',
  measurements: 'gas volume every 10 s|mass of solid|time to finish',
  variables: 'independent: particle size (surface area)|dependent: volume of gas per unit time|control: mass of solid, acid concentration and volume, temperature',
  expected: 'A much steeper initial gradient for the powder but the same final gas volume.',
  calculations: 'initial rate = gradient at t = 0|final volume = moles of CaCO3 x 24000',
  questions: 'Why is the final volume the same?|Why must the masses be equal for a fair test?'
});

E('chemistry', 'igcse', 'The disappearing cross: temperature and rate', 'Use the sodium thiosulfate clock to measure the effect of temperature on the rate of reaction.', {
  duration: '40 min', tags: 'rates, temperature, clock',
  apparatus: 'conical_flask_250, measuring_cylinder_25 x2, thermometer, stopwatch, white_tile, water_bath',
  substances: 'na2s2o3_0_1m:25 cm3, hcl_0_1m:25 cm3',
  theory: 'A cross drawn on paper is hidden when enough sulfur has been precipitated. Rate = 1/time and the rate roughly doubles for every 10 °C rise.',
  safety: 'Ventilate the room: sulfur dioxide is given off|Goggles and lab coat; sulfur stains clothing',
  procedure: 'Draw a cross on the tile and stand the flask over it|Warm 25 cm3 of thiosulfate to the chosen temperature in the water bath|Add 25 cm3 of acid, start the stopwatch and swirl once|Time how long the cross takes to disappear|Repeat at 10, 20, 30, 40 and 50 °C',
  observations: 'A pale yellow cloud of sulfur forms and thickens until the cross cannot be seen.',
  measurements: 'temperature (°C)|time for the cross to disappear (s)',
  variables: 'independent: temperature of the mixture|dependent: time for the cross to disappear|control: volumes, concentrations, flask size, same observer',
  expected: 'Time halves for roughly every 10 °C rise; a graph of 1/time against temperature curves upwards.',
  calculations: 'mean time for each temperature|rate = 1 / time (s-1)|plot rate against temperature',
  questions: 'Why is 1/time used as a measure of rate?|Why is the same observer better?'
});

E('chemistry', 'igcse', 'Catalysts: decomposition of hydrogen peroxide', 'Show that manganese(IV) oxide catalyses the decomposition of hydrogen peroxide.', {
  duration: '25 min', tags: 'catalysis, gas',
  apparatus: 'conical_flask_250, gas_syringe, delivery_tube, bung, measuring_cylinder_25, spatula, top_pan_balance, stopwatch',
  substances: 'hydrogen_peroxide_20vol:20 cm3, manganese_dioxide:0.5 g',
  theory: '2H2O2 -> 2H2O + O2. A catalyst speeds up a reaction without being used up, so it can be recovered unchanged.',
  safety: 'Goggles and lab coat; 20-volume peroxide bleaches skin|Never stopper the flask without a delivery tube',
  procedure: 'Measure 20 cm3 of peroxide and record the gas volume for 60 s with no catalyst|Add 0.5 g of manganese(IV) oxide and record the volume every 5 s|Compare the two rates|Filter, dry and reweigh the catalyst to show it is unchanged',
  observations: 'Without catalyst only a few bubbles; with it a violent froth of oxygen.',
  measurements: 'gas volume (cm3) at set times|mass of catalyst added and recovered',
  variables: 'independent: presence of a catalyst|dependent: volume of oxygen per unit time|control: volume and concentration of peroxide, temperature',
  expected: 'The catalysed reaction releases several times more oxygen in the same time and the catalyst mass is unchanged.',
  calculations: 'initial rate with and without the catalyst|ratio of the two rates',
  questions: 'Why does a catalyst not appear in the rate law?|How would the graph change with more catalyst?'
});

E('chemistry', 'igcse', 'Preparing a soluble salt: copper(II) sulfate', 'Prepare crystals of copper(II) sulfate from copper(II) oxide and dilute sulfuric acid.', {
  duration: '60 min', tags: 'preparation, salt, crystallisation',
  apparatus: 'beaker_250, glass_rod, bunsen_burner, tripod, gauze, funnel, filter_paper, evaporating_basin, heat_proof_mat, spatula, top_pan_balance',
  substances: 'copper_oxide:2 g, h2so4_0_5m:50 cm3',
  theory: 'An insoluble base reacts with an acid to give a soluble salt and water. Adding the base in excess ensures all the acid is used up.',
  safety: 'Goggles, lab coat and gloves|Hot apparatus - use tongs|Do not boil the solution dry',
  procedure: 'Warm 50 cm3 of dilute sulfuric acid in the beaker|Add copper(II) oxide a spatula at a time until it stops dissolving|Filter the warm mixture to remove the excess oxide|Evaporate the blue filtrate slowly until crystals just begin to form|Let it crystallise and dry the crystals on filter paper',
  observations: 'The black oxide dissolves to give a clear blue solution; blue crystals form as the water evaporates.',
  measurements: 'mass of oxide added (g)|volume of acid (cm3)|mass of dry crystals (g)|yield (%)',
  variables: 'independent: mass of copper(II) oxide added|dependent: mass of crystals obtained|control: volume and concentration of acid',
  expected: 'About 6 g of CuSO4.5H2O from 0.025 mol of acid (theoretical yield 6.2 g).',
  calculations: 'moles of H2SO4 = concentration x volume / 1000|theoretical mass = moles x 249.7|percentage yield',
  questions: 'Why is the oxide added in excess?|Why must you not evaporate to dryness?|Suggest why the yield is below 100 %.'
});

E('chemistry', 'igcse', 'Preparing an insoluble salt: lead(II) iodide', 'Prepare lead(II) iodide by precipitation and recover it by filtration.', {
  duration: '35 min', tags: 'precipitation, salt, separation',
  apparatus: 'beaker_100 x2, glass_rod, funnel, filter_paper, measuring_cylinder_25 x2, wash_bottle',
  substances: 'pb_no3_0_5m:20 cm3, ki_1m:20 cm3, distilled_water:100 cm3',
  theory: 'Two soluble salts react to give an insoluble salt: Pb2+ + 2I- -> PbI2(s). Precipitation is the best route to an insoluble salt.',
  safety: 'Lead compounds are toxic - goggles, gloves and lab coat|Do not pour lead solutions down the sink; use the heavy-metal waste bottle',
  procedure: 'Measure 20 cm3 of lead(II) nitrate into a beaker|Add 20 cm3 of potassium iodide solution and stir|Filter the mixture and wash the residue with distilled water|Scrape the yellow solid onto filter paper to dry|Weigh the dry product',
  observations: 'A bright yellow precipitate forms immediately; the filtrate is colourless.',
  measurements: 'volume of each solution|mass of dry precipitate (g)|yield',
  variables: 'independent: volume of KI solution added|dependent: mass of precipitate|control: volume of lead(II) nitrate, temperature',
  expected: 'Pb(NO3)2 is limiting: 0.01 mol gives 4.61 g of PbI2.',
  calculations: 'moles of each reactant|limiting reagent|theoretical and percentage yield',
  questions: 'Why can this salt not be made by reacting lead with iodine?|Which reactant is in excess and how do you know?'
});

E('chemistry', 'igcse', 'Flame tests for metal ions', 'Identify metal ions from the colour they give in a flame.', {
  duration: '25 min', tags: 'qualitative analysis, flame test, ions',
  apparatus: 'bunsen_burner, nichrome_wire, watch_glass, heat_proof_mat',
  substances: 'nacl_1m:few drops, kcl_1m:few drops, cuso4_0_5m:few drops, limewater:few drops',
  theory: 'Heat excites electrons to higher energy levels; as they fall back they emit light of a characteristic wavelength, so each metal has its own flame colour.',
  safety: 'Goggles; tie back long hair|The wire stays hot - hold the cool end|Clean the wire between tests to avoid contamination',
  procedure: 'Dip the clean nichrome wire into the first solution|Hold it at the edge of the blue Bunsen flame and note the colour|Clean the wire in dilute acid and repeat for each solution|Record each colour beside the metal ion',
  observations: 'Sodium: yellow-gold. Potassium: lilac. Copper: blue-green. Calcium: brick red.',
  measurements: 'flame colour for each ion|(extension) wavelength using a spectroscope',
  variables: 'independent: the metal ion in the solution|dependent: colour of the flame|control: same wire, same flame, cleaned between tests',
  expected: 'Each ion gives its characteristic colour; traces of sodium mask the potassium flame.',
  calculations: 'not applicable - this is a qualitative test',
  questions: 'Why must the wire be cleaned between tests?|Why is a blue Bunsen flame used rather than a yellow one?'
});

E('chemistry', 'igcse', 'Testing for gases', 'Carry out the standard tests for hydrogen, oxygen, carbon dioxide and chlorine.', {
  duration: '30 min', tags: 'gas tests, qualitative analysis',
  apparatus: 'test_tube x4, delivery_tube, bung, test_tube_rack, bunsen_burner, limewater_bottle, measuring_cylinder_25',
  substances: 'zinc_granules:1 g, hcl_1m:20 cm3, hydrogen_peroxide_20vol:10 cm3, manganese_dioxide:0.2 g, marble_chips:1 g, limewater:20 cm3',
  theory: 'Each gas has a characteristic test: lighted splint for hydrogen (pop), glowing splint for oxygen (relights), limewater for carbon dioxide (milky) and damp litmus for chlorine (bleached).',
  safety: 'Goggles and lab coat|Prepare chlorine only in the fume hood|Point test tubes away from yourself and others',
  procedure: 'Make hydrogen by adding dilute acid to zinc and test with a lighted splint|Make oxygen from hydrogen peroxide and test with a glowing splint|Bubble carbon dioxide through limewater|Make chlorine from bleach and acid in the fume hood, test with damp litmus|Record the test, observation and conclusion for each gas',
  observations: 'Hydrogen pops, oxygen relights the splint, limewater turns milky, damp litmus is bleached.',
  measurements: 'observations; optionally the time to collect 20 cm3 of each gas',
  variables: 'independent: the gas being tested|dependent: the result of the test|control: fresh splint, fresh limewater',
  expected: 'Every test gives its characteristic result and the four gases are distinguished.',
  calculations: 'balanced equations for each preparation',
  questions: 'Why is limewater better than a splint for carbon dioxide?|Why must chlorine be prepared in a fume hood?'
});

E('chemistry', 'igcse', 'Testing for water', 'Use anhydrous copper(II) sulfate and cobalt chloride paper to test for water.', {
  duration: '20 min', tags: 'qualitative analysis, water test',
  apparatus: 'test_tube x2, dropping_bottle, spatula, watch_glass',
  substances: 'anhydrous_copper_sulfate:0.5 g, cobalt_chloride_paper:1 strip, ethanol:2 cm3, distilled_water:5 cm3',
  theory: 'Anhydrous copper(II) sulfate is white and turns blue as it takes up water of crystallisation; cobalt chloride paper turns from blue to pink. The tests detect water, not purity.',
  safety: 'Goggles and lab coat|Cobalt compounds are toxic - use forceps|Ethanol is flammable - keep it away from the flame',
  procedure: 'Place a spatula of anhydrous copper(II) sulfate in a dry tube|Add a few drops of ethanol: note that nothing changes|Add a few drops of water to a fresh sample: note the colour change|Hold cobalt chloride paper in the steam from boiling water',
  observations: 'White copper(II) sulfate turns blue with water; cobalt chloride paper turns from blue to pink.',
  measurements: 'colour change (qualitative)|mass of hydrated salt (quantitative extension)',
  variables: 'independent: liquid added (ethanol, water, sugar solution)|dependent: colour change|control: mass of salt, temperature',
  expected: 'Only liquids containing water give the colour change.',
  calculations: 'moles of water driven off = mass loss / 18',
  questions: 'Why does ethanol give no colour change?|How would you find x in CuSO4.xH2O?'
});

E('chemistry', 'igcse', 'Electrolysis of copper(II) sulfate', 'Observe the products of the electrolysis of copper(II) sulfate solution with copper electrodes.', {
  duration: '40 min', tags: 'electrolysis, redox',
  apparatus: 'beaker_250, power_supply, wire_red x2, crocodile_clip x2, carbon_electrodes, top_pan_balance, ammeter, stopwatch',
  substances: 'cuso4_0_5m:100 cm3',
  theory: 'At the cathode Cu2+ + 2e- -> Cu; at the anode copper dissolves: Cu -> Cu2+ + 2e-. The mass deposited follows Faraday\'s law.',
  safety: 'Goggles and lab coat; copper solutions must not go down the sink|Keep the voltage below about 6 V and do not let the electrodes touch',
  procedure: 'Weigh both electrodes and record the masses|Connect the circuit with the ammeter in series and the electrodes in the solution|Switch on and record the current every minute for 15 minutes|Switch off, rinse and dry the electrodes, then reweigh|Compare the mass lost at the anode with the mass gained at the cathode',
  observations: 'A pink-brown layer of copper appears on the cathode while the anode becomes thinner.',
  measurements: 'current (A)|time (s)|mass of each electrode before and after',
  variables: 'independent: time (or current)|dependent: mass of copper deposited|control: concentration, electrode area, temperature',
  expected: 'The mass gained at the cathode equals the mass lost from the anode.',
  calculations: 'charge = current x time|moles of electrons = charge / 96500|moles of Cu = charge / (2 x 96500)|mass = moles x 63.5',
  questions: 'Why does the blue colour stay the same with copper electrodes?|Why is the ammeter in series?'
});

E('chemistry', 'igcse', 'The reactivity series: metals and acid', 'Order four metals by how vigorously they react with dilute hydrochloric acid.', {
  duration: '30 min', tags: 'reactivity, metal, hydrogen',
  apparatus: 'test_tube x4, test_tube_rack, top_pan_balance, stopwatch, thermometer',
  substances: 'magnesium_ribbon:2 cm, zinc_granules:1 g, iron_filings:1 g, copper_turnings:1 g, hcl_1m:20 cm3',
  theory: 'A metal above hydrogen in the reactivity series displaces hydrogen from a dilute acid; the vigour shows how reactive the metal is.',
  safety: 'Goggles and lab coat|Magnesium reacts very vigorously - use only a short piece|Keep tubes pointing away from your face',
  procedure: 'Put 5 cm3 of acid in each of four tubes|Add the same mass of each metal and start the stopwatch|Record the bubbling rate and temperature rise over two minutes|Test the gas with a lighted splint|Arrange the metals in order of reactivity',
  observations: 'Magnesium: violent fizzing, big temperature rise. Zinc: steady bubbling. Iron: slow. Copper: no reaction.',
  measurements: 'time for the metal to react completely|temperature rise (°C)|bubbling rate',
  variables: 'independent: the metal used|dependent: rate of reaction|control: mass of metal, acid volume and concentration, temperature',
  expected: 'Mg > Zn > Fe > Cu, matching the reactivity series.',
  calculations: 'moles of H2 = moles of metal reacted|rate = 1/time',
  questions: 'Why does copper not react?|Write the ionic equation for zinc with acid.'
});

E('chemistry', 'igcse', 'Displacement: zinc and copper(II) sulfate', 'Show that zinc displaces copper from copper(II) sulfate solution.', {
  duration: '30 min', tags: 'displacement, redox, exothermic',
  apparatus: 'beaker_100, thermometer, top_pan_balance, glass_rod, stopwatch',
  substances: 'cuso4_0_5m:50 cm3, zinc_granules:2 g',
  theory: 'Zinc is more reactive than copper, so it reduces Cu2+ to copper while being oxidised itself: Zn + Cu2+ -> Zn2+ + Cu.',
  safety: 'Goggles and lab coat; copper salts harm aquatic life - use the heavy-metal waste bottle',
  procedure: 'Record the temperature of 50 cm3 of copper(II) sulfate solution|Add 2 g of zinc granules and start the stopwatch|Record the temperature every 30 s for five minutes|Note the colour change and the deposit on the zinc|Filter and weigh the copper produced (extension)',
  observations: 'The blue colour fades to colourless, a pink-brown solid appears and the temperature rises several degrees.',
  measurements: 'temperature every 30 s|colour at each stage|mass of copper produced (extension)',
  variables: 'independent: mass of zinc added|dependent: temperature change and mass of copper|control: volume and concentration of the solution',
  expected: 'About +10 °C; the blue colour disappears as the copper(II) ions are used up.',
  calculations: 'moles of Cu2+ = 0.5 x 0.05 = 0.025|theoretical mass of Cu = 1.59 g|percentage yield',
  questions: 'Why is this a redox reaction?|Why does the temperature rise?'
});

E('chemistry', 'igcse', 'Paper chromatography of inks', 'Separate the dyes in a mixture of inks and identify the components.', {
  duration: '35 min', tags: 'separation, chromatography, analysis',
  apparatus: 'beaker_250, chromatography_paper, capillary_tube, ruler, pencil, stopwatch',
  substances: 'ink_black:few drops, ink_red:few drops, distilled_water:20 cm3',
  theory: 'Components travel at different speeds between the stationary (paper) and mobile (solvent) phases, so they separate. Rf = distance moved by the dye / distance moved by the solvent.',
  safety: 'Goggles; some inks contain harmful solvents|Do not let the solvent level start above the spots',
  procedure: 'Draw the start line in pencil about 2 cm from the bottom of the paper|Put a small spot of each ink on the line and let it dry|Lower the paper into the beaker without wetting the spots|Remove the paper when the solvent front nears the top and mark the front|Measure the distances and calculate Rf for each spot',
  observations: 'The black ink separates into several coloured spots that travel different distances.',
  measurements: 'distance moved by the solvent front (mm)|distance moved by each spot (mm)',
  variables: 'independent: the ink tested|dependent: the distance each dye travels (Rf)|control: same paper, solvent and running time',
  expected: 'The black ink contains at least three dyes with different Rf values; matching Rf values identify a dye.',
  calculations: 'Rf = distance to the centre of the spot / distance to the solvent front',
  questions: 'Why is the start line drawn in pencil?|Why must the spots be above the solvent?|How could Rf values identify a food colouring?'
});

// ============================ AS LEVEL CHEMISTRY =============================
E('chemistry', 'as', 'Acid-base titration: standard solution', 'Determine the concentration of a sodium hydroxide solution by titration with a standard hydrochloric acid solution.', {
  duration: '45 min', tags: 'titration, volumetric, concentration',
  apparatus: 'burette_50, pipette_25, conical_flask_250, retort_stand, clamp, boss_head, funnel, white_tile, wash_bottle, measuring_cylinder_100',
  substances: 'hcl_0_1m:100 cm3, naoh_0_1m:250 cm3, phenolphthalein:few drops',
  theory: 'At the end point moles of H+ equal moles of OH-. A standard solution of known concentration is used to find the unknown concentration by titration.',
  safety: 'Goggles and lab coat; both solutions are corrosive|Rinse the burette with acid before filling and read the bottom of the meniscus at eye level',
  procedure: 'Rinse and fill the burette with the standard acid, removing the air bubble from the tip|Pipette 25.0 cm3 of alkali into a conical flask and add three drops of indicator|Record the initial burette reading to 0.05 cm3|Titrate with swirling until one drop gives a permanent colour change|Repeat until you obtain at least two concordant titres within 0.10 cm3',
  observations: 'The pink colour disappears on swirling and reappears with the next drop; the end point is a single lasting drop.',
  measurements: 'initial and final burette readings for each titre|volume of alkali delivered by the pipette',
  variables: 'independent: volume of acid added|dependent: the end point (colour change)|control: same pipette volume, same indicator volume, same technique',
  expected: 'Concordant titres within 0.05 cm3 of each other; the mean titre is used to calculate the concentration.',
  calculations: 'mean titre = mean of the concordant results|moles HCl = concentration x titre / 1000|moles NaOH = moles HCl (1:1)|concentration NaOH = moles / 0.025|percentage uncertainty = 0.05 / titre x 100',
  questions: 'Why is a pipette used instead of a measuring cylinder?|Why are the last two titres used rather than the first?|Why should the flask be washed down with distilled water during the titration?'
});

E('chemistry', 'as', 'Enthalpy of neutralisation', 'Measure the enthalpy change of neutralisation of hydrochloric acid with sodium hydroxide.', {
  duration: '40 min', tags: 'enthalpy, calorimetry, exothermic',
  apparatus: 'polystyrene_cup, thermometer_precise, measuring_cylinder_25 x2, top_pan_balance, stopwatch, beaker_250',
  substances: 'hcl_1m:50 cm3, naoh_1m:50 cm3',
  theory: 'For a strong acid and strong base the only reaction is H+ + OH- -> H2O, so ΔH(neut) is close to -57 kJ/mol whatever the acid is.',
  safety: 'Goggles and lab coat; the alkali is corrosive|Add the acid to the alkali quickly and stir gently to limit heat loss',
  procedure: 'Measure 50.0 cm3 of alkali into the polystyrene cup and record its temperature for 30 s|Record the temperature of the acid separately|Add the acid to the cup, stir gently and record the temperature every 10 s for three minutes|Plot the cooling curve and extrapolate back to the time of mixing|Repeat the whole experiment and average the results',
  observations: 'A sharp temperature rise of about 6-7 °C followed by slow cooling.',
  measurements: 'initial temperature of each solution|temperature every 10 s after mixing|maximum temperature rise from the extrapolation',
  variables: 'independent: the acid used|dependent: temperature rise|control: volumes, concentrations, same cup and thermometer',
  expected: 'ΔH(neut) close to -57 kJ/mol; the same value for a different strong acid.',
  calculations: 'moles of water formed = 0.1 x 0.05 = 0.005|energy = mass x 4.18 x ΔT|cooling correction by extrapolation|ΔH = -energy / moles',
  questions: 'Why is a polystyrene cup used?|Why is the extrapolated value more reliable than the maximum temperature?|Why is the value for a weak acid smaller in magnitude?'
});

E('chemistry', 'as', 'Enthalpy of combustion of an alcohol', 'Determine the enthalpy of combustion of ethanol using a spirit burner.', {
  duration: '45 min', tags: 'enthalpy, combustion, calorimetry',
  apparatus: 'spirit_burner, beaker_250, thermometer_precise, top_pan_balance, measuring_cylinder_100, tripod, gauze, draught_shield, stopwatch',
  substances: 'ethanol:100 cm3, distilled_water:150 cm3',
  theory: 'The energy transferred to the water equals the energy released by the fuel: ΔH = -m c ΔT / moles of fuel burned. Much energy is lost to the surroundings, so the value is always too low in magnitude.',
  safety: 'Ethanol is highly flammable - no other flames nearby and keep the bottle closed|Goggles and lab coat|The beaker gets very hot',
  procedure: 'Weigh the spirit burner and record the mass|Measure 150 cm3 of water into the beaker and record its temperature|Light the burner, heat the water until it rises by about 30 °C, then extinguish the flame|Reweigh the burner immediately|Calculate the energy transferred and the enthalpy of combustion',
  observations: 'The water warms steadily; soot may form under the beaker.',
  measurements: 'mass of burner before and after (g)|mass of water (g)|temperature before and after (°C)',
  variables: 'independent: the alcohol used|dependent: temperature rise of the water|control: volume of water, distance from the flame, same beaker',
  expected: 'ΔH(c) is roughly -1000 kJ/mol, well short of the data-book value of -1367 kJ/mol because of heat loss.',
  calculations: 'moles burned = mass burned / 46|energy to water = m x 4.18 x ΔT|ΔH(c) = -energy / moles|percentage error against the data book',
  questions: 'Why is the experimental value always less exothermic than the data-book value?|Suggest three ways to reduce the error.',
  notes: 'Use a metal calorimeter and a draught shield on the research level to compare calorimeters.'
});

E('chemistry', 'as', 'Molar volume of a gas', 'Determine the molar volume of a gas by reacting magnesium with excess acid.', {
  duration: '40 min', tags: 'moles, gas, molar volume',
  apparatus: 'conical_flask_250, gas_syringe, delivery_tube, bung, top_pan_balance, measuring_cylinder_50, stopwatch, thermometer',
  substances: 'magnesium_ribbon:0.05 g, hcl_1m:50 cm3',
  theory: 'One mole of any gas occupies about 24 dm3 at room temperature and pressure. Mg + 2HCl -> MgCl2 + H2, so the moles of hydrogen equal the moles of magnesium.',
  safety: 'Goggles and lab coat; acid is corrosive|Check the apparatus for leaks before you start and let the syringe cool to room temperature before reading',
  procedure: 'Set up the flask with the delivery tube into the gas syringe and test for leaks|Weigh about 0.05 g of magnesium ribbon, after cleaning it with emery paper|Add the acid, drop in the magnesium and start the stopwatch|Record the maximum volume of gas collected when the reaction has finished|Repeat with three different masses of magnesium',
  observations: 'Rapid effervescence that stops when the metal has dissolved; the syringe plunger moves out smoothly.',
  measurements: 'mass of magnesium (g)|volume of hydrogen (cm3)|room temperature (°C)|atmospheric pressure (kPa)',
  variables: 'independent: mass of magnesium|dependent: volume of hydrogen|control: excess acid, same apparatus, temperature',
  expected: 'About 50 cm3 of hydrogen from 0.05 g of magnesium, giving a molar volume close to 24 dm3/mol.',
  calculations: 'moles Mg = mass / 24.3|molar volume = volume / moles (cm3/mol)|convert to dm3/mol and compare with 24.0|percentage error',
  questions: 'Why must the acid be in excess?|Why must the syringe be left to cool before the final reading?|How would a leak affect the result?'
});

E('chemistry', 'as', 'Iodine clock: initial rates', 'Use the iodine clock reaction to determine how the initial rate depends on the concentration of iodide ions.', {
  duration: '50 min', tags: 'kinetics, clock, order',
  apparatus: 'conical_flask_250, measuring_cylinder_25 x3, stopwatch, burette_50, white_tile, thermometer',
  substances: 'ki_1m:25 cm3, sodium_thiosulfate_0_1m_lib:50 cm3, starch_solution:5 cm3, ammonium_persulfate_1m:50 cm3',
  theory: '(NH4)2S2O8 + 2KI -> I2 + ... The iodine produced is instantly reduced by a fixed amount of thiosulfate, so the solution stays colourless until the thiosulfate is used up, then turns blue-black with starch. 1/time is proportional to the initial rate.',
  safety: 'Goggles and lab coat|Persulfate is an oxidiser - keep it away from reducing agents until you mix them deliberately',
  procedure: 'Mix the iodide, thiosulfate, starch and water in the flask|Add the persulfate solution, start the stopwatch and swirl once|Time how long it takes for the blue-black colour to appear|Repeat with different volumes of iodide solution, topping up with distilled water to keep the total volume constant|Plot 1/time against the concentration of iodide',
  observations: 'The mixture stays colourless and then turns blue-black all at once.',
  measurements: 'time for the colour to appear (s)|volumes of each solution (cm3)|temperature (°C)',
  variables: 'independent: concentration of iodide ions|dependent: 1/time (initial rate)|control: total volume, thiosulfate amount, temperature, same observer',
  expected: 'A straight line through the origin: the reaction is first order with respect to iodide.',
  calculations: 'initial rate ∝ 1/time|concentration of iodide = moles / total volume|plot 1/time against [I-] and comment on the shape',
  questions: 'Why does the colour appear suddenly rather than gradually?|Why must the total volume be kept constant?|What would happen if you doubled the thiosulfate volume?'
});

E('chemistry', 'as', 'Equilibrium: iron(III) and thiocyanate', 'Investigate how adding reagents shifts the position of an equilibrium.', {
  duration: '35 min', tags: 'equilibrium, le chatelier, colour',
  apparatus: 'test_tube x5, test_tube_rack, dropping_bottle x2, measuring_cylinder_10',
  substances: 'fecl3_0_5m:10 cm3, iron_thiocyanate:10 cm3, distilled_water:50 cm3, naoh_0_1m:5 cm3',
  theory: 'Fe3+ + SCN- ⇌ FeSCN2+ is blood-red. Changing the concentration of a reactant shifts the position of equilibrium; adding water dilutes everything but the colour becomes paler for all species.',
  safety: 'Goggles and lab coat; both reagents irritate the skin|Keep the volumes identical so the colours can be compared fairly',
  procedure: 'Mix 5 cm3 of each solution and top up to 20 cm3 with water to make the stock mixture|Divide it equally between four tubes and label them|Add more Fe3+ to one, more SCN- to a second, water to a third, and keep the fourth as a control|Compare the depth of red colour in each tube|Add sodium hydroxide to the fifth tube and explain the change',
  observations: 'The blood-red colour deepens on adding either reactant and is diluted by water; adding alkali removes Fe3+ as a brown precipitate and the red colour fades.',
  measurements: 'volumes added (cm3)|relative colour intensity (comparison with the control)',
  variables: 'independent: the reagent added|dependent: the depth of red colour|control: volume of the stock mixture, temperature',
  expected: 'Adding Fe3+ or SCN- deepens the colour, adding water dilutes it and adding alkali shifts the equilibrium to the left.',
  calculations: 'not required; explain each change using Le Chatelier\'s principle',
  questions: 'Why is the mixture, not the pure complex, used?|Why does removing Fe3+ change the colour?|Why does an increase in temperature shift the equilibrium?'
});

E('chemistry', 'as', 'Redox titration: potassium manganate(VII) with iron(II)', 'Determine the concentration of an iron(II) solution by titration with potassium manganate(VII).', {
  duration: '45 min', tags: 'titration, redox, manganate',
  apparatus: 'burette_50, pipette_25, conical_flask_250, retort_stand, clamp, white_tile, measuring_cylinder_50, water_bath',
  substances: 'kmno4_0_02m:100 cm3, iron_solution_unknown:250 cm3, h2so4_1m:50 cm3',
  theory: 'MnO4- + 8H+ + 5Fe2+ -> Mn2+ + 5Fe3+ + 4H2O. The purple permanganate is its own indicator; the first permanent pink tinge marks the end point.',
  safety: 'Goggles, lab coat and gloves; permanganate stains skin and clothing brown|Acidify the iron solution in the flask before titrating',
  procedure: 'Rinse and fill the burette with potassium manganate(VII)|Pipette 25.0 cm3 of the iron(II) solution into a flask and add 10 cm3 of dilute sulfuric acid|Titrate until the first permanent pink colour that lasts for 30 s|Repeat until two concordant titres are within 0.10 cm3|Calculate the concentration of the iron(II) solution',
  observations: 'The purple colour disappears as it is added; the end point is a pale pink that persists.',
  measurements: 'initial and final burette readings|mean titre (cm3)',
  variables: 'independent: volume of manganate(VII) added|dependent: the end point|control: same pipette volume, fresh acid, same technique',
  expected: 'A mean titre that gives a sensible concentration for the unknown iron solution.',
  calculations: 'moles MnO4- = concentration x titre / 1000|moles Fe2+ = 5 x moles MnO4-|[Fe2+] = moles / 0.025|percentage uncertainty in the titre',
  questions: 'Why is no indicator needed?|Why is sulfuric acid used rather than hydrochloric acid?|Why is the flask swirled during the titration?'
});

E('chemistry', 'as', 'Qualitative analysis of cations', 'Identify unknown cations using sodium hydroxide and ammonia solutions.', {
  duration: '45 min', tags: 'qualitative analysis, cations, tests',
  apparatus: 'test_tube x8, test_tube_rack, dropping_bottle x3, glass_rod, bunsen_burner',
  substances: 'naoh_0_1m:20 cm3, ammonia_1m:20 cm3, copper_sulfate_solid:2 g, iron_sulfate_solid:2 g, zinc_sulfate:2 g, distilled_water:100 cm3',
  theory: 'Many metal ions give a characteristic hydroxide precipitate whose colour and solubility in excess alkali identify the cation.',
  safety: 'Goggles, lab coat and gloves; ammonia vapour is an irritant - use the fume hood or a well-ventilated bench|Label every tube',
  procedure: 'Make up 2 cm3 of each unknown solution in a labelled tube|Add sodium hydroxide dropwise and record the colour of any precipitate|Add excess sodium hydroxide and note whether the precipitate dissolves|Repeat with ammonia solution and compare|Identify each ion from your results table',
  observations: 'Cu2+: pale blue precipitate, dissolves in ammonia to deep blue. Fe2+: green. Fe3+: brown. Zn2+: white, dissolves in excess of both alkalis.',
  measurements: 'colour of precipitate|effect of excess alkali (dissolves or not)|effect of excess ammonia',
  variables: 'independent: the cation being tested|dependent: the colour and solubility of the precipitate|control: same volumes and drop size, fresh tubes',
  expected: 'Every unknown is identified correctly and the results are recorded in a table.',
  calculations: 'symbol equations for each hydroxide precipitation',
  questions: 'Why does the copper precipitate dissolve in excess ammonia?|How would you distinguish zinc ions from aluminium ions using these reagents?'
});

E('chemistry', 'as', 'Testing for anions', 'Identify carbonate, sulfate and halide ions in unknown solutions.', {
  duration: '40 min', tags: 'qualitative analysis, anions, tests',
  apparatus: 'test_tube x6, test_tube_rack, dropping_bottle x3, delivery_tube, bung, measuring_cylinder_10',
  substances: 'sodium_sulfate_0_5m:10 cm3, nacl_1m:10 cm3, na2co3_0_5m:10 cm3, hcl_1m:10 cm3, bacl2_0_5m:10 cm3, agno3_0_1m:10 cm3, limewater:10 cm3',
  theory: 'Carbonates fizz with acid giving CO2; sulfates give a white precipitate with barium ions that does not dissolve in acid; halides give precipitates with silver ions and react differently with ammonia.',
  safety: 'Goggles, lab coat and gloves|Silver nitrate stains skin; barium chloride is toxic|Use the fume hood for the acid reactions',
  procedure: 'Add dilute acid to the first unknown and test any gas with limewater|Add barium chloride solution to the second and then dilute acid|Add silver nitrate to the third and fourth and record the colour of the precipitate|Test the solubility of each silver halide in dilute and concentrated ammonia|Identify each anion',
  observations: 'Carbonate: fizzes, limewater turns milky. Sulfate: white precipitate insoluble in acid. Chloride: white precipitate soluble in dilute ammonia. Iodide: yellow precipitate insoluble in ammonia.',
  measurements: 'observations; volumes added',
  variables: 'independent: the anion present|dependent: the test result|control: same volumes and concentrations, same order of tests',
  expected: 'Each unknown is identified and the distinguishing observations noted.',
  calculations: 'ionic equations: Ag+ + Cl- -> AgCl(s), Ba2+ + SO4^2- -> BaSO4(s), CO3^2- + 2H+ -> CO2 + H2O',
  questions: 'Why must the barium chloride test be acidified?|Why is the iodide precipitate insoluble in ammonia while the chloride is soluble?'
});

E('chemistry', 'as', 'Preparing and testing carbon dioxide', 'Prepare carbon dioxide from a carbonate and an acid, and collect it over water.', {
  duration: '35 min', tags: 'gas preparation, gas tests',
  apparatus: 'conical_flask_250, delivery_tube, bung, gas_jar, trough, measuring_cylinder_50, top_pan_balance',
  substances: 'marble_chips:5 g, hcl_1m:50 cm3, limewater:20 cm3',
  theory: 'CaCO3 + 2HCl -> CaCl2 + H2O + CO2. A gas less soluble than water (or denser than air) can be collected over water or by upward delivery.',
  safety: 'Goggles and lab coat|Add the acid slowly and do not stopper the flask without a delivery tube',
  procedure: 'Place the marble chips in the flask and fit the delivery tube|Add 50 cm3 of dilute acid and collect the gas over water|When the jar is full, slide the glass plate over the mouth|Test the gas with limewater and with a burning splint',
  observations: 'Brisk bubbling; the gas turns limewater milky and extinguishes a lighted splint.',
  measurements: 'volume of gas collected (cm3)|mass of chips used (g)|time taken (s)',
  variables: 'independent: mass of carbonate used|dependent: volume of gas collected|control: acid volume and concentration, temperature',
  expected: 'About 1.2 dm3 of CO2 from 5 g of marble (0.05 mol x 24 dm3/mol).',
  calculations: 'moles CaCO3 = mass / 100|volume CO2 = moles x 24000 cm3|percentage of the theoretical volume collected',
  questions: 'Why is the gas collected over water and not by downward delivery?|Why does the limewater eventually clear if you keep bubbling?'
});

E('chemistry', 'as', 'Temperature and rate: gas syringe method', 'Measure the initial rate of the magnesium-acid reaction at different temperatures.', {
  duration: '45 min', tags: 'kinetics, temperature, initial rate',
  apparatus: 'conical_flask_250, gas_syringe, delivery_tube, bung, water_bath, thermometer, stopwatch, top_pan_balance',
  substances: 'magnesium_ribbon:0.05 g x4, hcl_1m:25 cm3',
  theory: 'The rate constant increases with temperature. A graph of ln(rate) against 1/T is a straight line of gradient -Ea/R, so the activation energy can be found.',
  safety: 'Goggles and lab coat|Hydrogen is evolved - keep flames away|Handle the water bath with care',
  procedure: 'Bring the acid to the required temperature in the water bath|Add the magnesium and start the stopwatch, recording the gas volume every 5 s|Repeat at four temperatures between 20 and 50 °C|Plot volume against time and draw the tangent at t = 0 for each run',
  observations: 'The reaction goes faster at higher temperature and the initial gradient is steeper.',
  measurements: 'volume of gas every 5 s (cm3)|temperature (°C)|mass of magnesium (g)',
  variables: 'independent: temperature of the acid|dependent: initial rate of gas production|control: mass of magnesium, acid volume and concentration, apparatus',
  expected: 'The initial rate roughly doubles for a 10 °C rise; ln(rate) against 1/T is linear.',
  calculations: 'initial rate = initial gradient (cm3/s)|ln(initial rate) plotted against 1/T|activation energy = -gradient x R',
  questions: 'Why is the initial rate used rather than the total volume?|Why must the magnesium be added quickly?'
});

E('chemistry', 'as', 'Water of crystallisation by weighing', 'Determine x in hydrated copper(II) sulfate, CuSO4.xH2O, by heating to constant mass.', {
  duration: '45 min', tags: 'gravimetric, moles, water of crystallisation',
  apparatus: 'crucible, pipe_clay_triangle, tripod, bunsen_burner, top_pan_balance, desiccator, tongs, heat_proof_mat',
  substances: 'copper_sulfate_solid:3 g',
  theory: 'Heating drives off the water of crystallisation. The mass lost is water and the residue is anhydrous CuSO4, so the ratio of moles gives x.',
  safety: 'Goggles and lab coat|The crucible is extremely hot - use tongs and a heat-proof mat|Heat gently at first to avoid spitting',
  procedure: 'Weigh the empty crucible and lid, then weigh in about 3 g of the blue crystals|Heat gently, then strongly for five minutes with the lid slightly ajar|Cool in a desiccator and reweigh|Repeat the heating and weighing until the mass is constant|Calculate x from the masses',
  observations: 'The blue crystals turn white and steam is driven off; the mass falls until it is constant.',
  measurements: 'mass of empty crucible (g)|mass of crucible + crystals (g)|mass after each heating (g)',
  variables: 'independent: number of heatings|dependent: mass of the residue|control: same crucible, cooling in a desiccator, constant flame',
  expected: 'x is close to 5; the residue is anhydrous copper(II) sulfate.',
  calculations: 'mass of water lost|moles of water = mass / 18|moles of CuSO4 = residue mass / 159.6|x = moles water / moles CuSO4',
  questions: 'Why is the crucible cooled in a desiccator?|Why is heating to constant mass necessary?|Why might x come out slightly low?'
});

E('chemistry', 'as', 'Electrolysis with inert electrodes', 'Electrolyse copper(II) sulfate solution with carbon electrodes and identify the products.', {
  duration: '40 min', tags: 'electrolysis, inert electrodes, redox',
  apparatus: 'beaker_250, power_supply, carbon_electrodes, wire_red x2, crocodile_clip x2, ammeter, stopwatch, test_tube x2',
  substances: 'cuso4_0_5m:150 cm3',
  theory: 'With inert electrodes the cathode reaction is Cu2+ + 2e- -> Cu and the anode reaction is the oxidation of water: 2H2O -> O2 + 4H+ + 4e-, so the solution becomes acidic.',
  safety: 'Goggles and lab coat|Do not let the electrodes touch|Copper solutions must go to the heavy-metal waste bottle',
  procedure: 'Set up the circuit with the ammeter in series|Electrolyse for 15 minutes and collect the gas from the anode in an inverted tube|Test the gas with a glowing splint|Measure the pH before and after and record the mass gained at the cathode',
  observations: 'Copper is deposited on the cathode, oxygen collects at the anode, and the solution becomes more acidic.',
  measurements: 'current (A)|time (s)|mass of cathode before and after (g)|pH before and after',
  variables: 'independent: time of electrolysis|dependent: mass of copper deposited, pH change|control: current, concentration, electrode area',
  expected: 'Mass deposited matches Faraday\'s law and the pH falls from about 4 to about 2.',
  calculations: 'charge = I t|moles Cu = charge / (2F)|predicted mass|pH change from the moles of H+ produced',
  questions: 'Why does the anode not dissolve?|Why does the solution become acidic?'
});

// ============================ A LEVEL CHEMISTRY =============================
E('chemistry', 'a', 'Determining Ka of a weak acid', 'Determine the acid dissociation constant of ethanoic acid by measuring the pH of solutions of known concentration.', {
  duration: '45 min', tags: 'acids, Ka, pH, equilibrium',
  apparatus: 'beaker_100 x4, ph_meter, measuring_cylinder_50, volumetric_flask_100, pipette_25, top_pan_balance',
  substances: 'ch3cooh_1m:100 cm3, ph_buffer_4:50 cm3, ph_buffer_7:50 cm3, distilled_water:500 cm3',
  theory: 'For a weak acid Ka = [H+]^2 / [HA] if the degree of dissociation is small, so Ka = 10^(-2pH) / c. The approximation must be checked.',
  safety: 'Goggles and lab coat|Calibrate the pH meter with buffers 4 and 7 before use|Rinse the probe in distilled water between readings',
  procedure: 'Make up 100 cm3 of 1.0, 0.1, 0.01 and 0.001 mol/dm3 ethanoic acid solutions|Calibrate the pH meter using the two buffer solutions|Measure the pH of each solution, rinsing the probe between readings|Record each pH to two decimal places|Calculate Ka for each solution and comment on the consistency',
  observations: 'The pH rises by about 0.5 per tenfold dilution instead of 1, showing partial dissociation.',
  measurements: 'pH of each solution|concentrations|temperature (°C)',
  variables: 'independent: concentration of the acid|dependent: pH|control: same meter and calibration, same temperature',
  expected: 'Ka is close to 1.8 x 10^-5 mol/dm3 for all four solutions.',
  calculations: '[H+] = 10^(-pH)|Ka = [H+]^2 / (c - [H+])|pKa = -log Ka|percentage error against the data-book value',
  questions: 'Why is the difference in pH smaller than 1 per tenfold dilution?|When does the approximation Ka = [H+]^2/c fail?'
});

E('chemistry', 'a', 'Titration curve of a weak acid', 'Plot a pH titration curve for ethanoic acid against sodium hydroxide and locate the half-equivalence point.', {
  duration: '60 min', tags: 'titration curve, pH, buffers',
  apparatus: 'burette_50, beaker_250, ph_meter, retort_stand, clamp, stirring_rod, measuring_cylinder_50',
  substances: 'ch3cooh_1m:25 cm3, naoh_1m:100 cm3',
  theory: 'At half neutralisation [HA] = [A-], so pH = pKa. The shape of the curve determines which indicator is suitable.',
  safety: 'Goggles and lab coat|Take readings slowly near the end point|Keep the probe submerged and stir gently',
  procedure: 'Pipette 25.0 cm3 of acid into the beaker with 25 cm3 of water|Record the pH before any alkali is added|Add alkali in 2 cm3 portions, recording the pH after each addition and stirring|Add in 0.1 cm3 portions between pH 5 and 9|Plot pH against volume and identify the half-equivalence and equivalence points',
  observations: 'A gradual rise, a rapid change through the equivalence point and a shallow buffer region before it.',
  measurements: 'volume of alkali added (cm3)|pH after each addition|temperature',
  variables: 'independent: volume of alkali added|dependent: pH|control: same acid volume and concentration, same meter calibration',
  expected: 'The half-equivalence pH is about 4.76, equal to the pKa of ethanoic acid; the steep section spans pH 6-10, so phenolphthalein is suitable and methyl orange is not.',
  calculations: 'volume at half equivalence|pKa = pH at half equivalence|Ka = 10^-pKa|sketch the curve and mark both points',
  questions: 'Why is phenolphthalein more suitable than methyl orange here?|Why is the pH change so gradual near half neutralisation?'
});

E('chemistry', 'a', 'Autocatalysis: permanganate and ethanedioate', 'Investigate the autocatalytic reaction between potassium manganate(VII) and ethanedioate ions.', {
  duration: '50 min', tags: 'kinetics, autocatalysis, redox',
  apparatus: 'conical_flask_250, water_bath, thermometer, stopwatch, burette_50, measuring_cylinder_25',
  substances: 'kmno4_0_02m:25 cm3, sodium_ethanedioate_0_5m:25 cm3, h2so4_1m:25 cm3',
  theory: '2MnO4- + 5C2O4^2- + 16H+ -> 2Mn2+ + 10CO2 + 8H2O. The Mn2+ produced catalyses the reaction, so the rate starts slowly, accelerates, then slows as the reactants run out.',
  safety: 'Goggles, lab coat and gloves|Manganate(VII) stains skin brown|Work in the fume hood: carbon dioxide and steam are evolved',
  procedure: 'Warm the acid and ethanedioate mixture to 60 °C in the water bath|Add the manganate(VII) solution, start the stopwatch and swirl|Record the time at which the purple colour disappears for a series of temperatures|Plot time against temperature and describe the shape of the rate curve',
  observations: 'The purple colour fades very slowly at first, then rapidly, before slowing again.',
  measurements: 'temperature (°C)|time for decolourisation (s)|volumes (cm3)',
  variables: 'independent: temperature|dependent: time for the colour to disappear|control: volumes, concentrations, same flask',
  expected: 'The time falls sharply with temperature; the rate passes through a maximum because Mn2+ catalyses the reaction.',
  calculations: 'rate = 1/time|plot ln(rate) against 1/T|explain the S-shaped rate curve',
  questions: 'What evidence shows the reaction is autocatalytic?|Why is the flask swirled?'
});

E('chemistry', 'a', 'Determination of Kc for an esterification', 'Find the equilibrium constant for the reaction of ethanol with ethanoic acid.', {
  duration: '60 min', tags: 'equilibrium, Kc, esterification',
  apparatus: 'conical_flask_250, burette_50, pipette_25, water_bath, dropping_bottle, measuring_cylinder_25, retort_stand',
  substances: 'ethanol:50 cm3, ethanoic_acid_glacial_bottle:50 cm3, h2so4_conc:2 cm3, naoh_1m:250 cm3, phenolphthalein:few drops',
  theory: 'CH3COOH + C2H5OH ⇌ CH3COOC2H5 + H2O. Kc = [ester][water] / [acid][alcohol]. Titrating the remaining acid gives the equilibrium amounts.',
  safety: 'Goggles, lab coat and gloves; concentrated sulfuric acid is very corrosive and glacial ethanoic acid burns skin|Reflux in the fume hood, never with a closed system',
  procedure: 'Mix 25.0 cm3 of glacial ethanoic acid with 25.0 cm3 of ethanol and add 2 cm3 of concentrated sulfuric acid as a catalyst|Stopper and leave the mixture for one week (or reflux for one hour) to reach equilibrium|Titrate 5.00 cm3 samples with standard alkali to find the acid remaining|Calculate the equilibrium amounts of each species|Evaluate Kc',
  observations: 'A fruity smell develops and the titres fall as the acid is used up.',
  measurements: 'initial moles of acid and alcohol|titre of alkali for a 5 cm3 sample|mean titre',
  variables: 'independent: the starting mixture composition|dependent: the equilibrium titre|control: same catalyst amount, temperature, equilibration time',
  expected: 'Kc is around 4 at room temperature and is unaffected by the catalyst.',
  calculations: 'moles acid left = moles alkali used|moles ester = initial - remaining|Kc = [ester][water]/([acid][alcohol])|comment on units',
  questions: 'Why does the catalyst not change Kc?|Why must the mixture be left long enough?|What would happen to Kc if the temperature were raised?'
});

E('chemistry', 'a', 'Preparation of ethyl ethanoate', 'Prepare and purify an ester by refluxing ethanol with ethanoic acid.', {
  duration: '90 min', tags: 'organic, esterification, distillation, preparation',
  apparatus: 'round_bottom_flask_250, liebig_condenser, heating_mantle, separating_funnel_100, distillation_flask_250, beaker_250, measuring_cylinder_50, retort_stand, clamp, thermometer, top_pan_balance',
  substances: 'ethanol:30 cm3, ethanoic_acid_glacial_bottle:30 cm3, h2so4_conc:2 cm3, na2co3_0_5m:50 cm3',
  theory: 'Refluxing drives the reversible esterification; distillation separates the volatile ester, and washing with sodium carbonate removes unreacted acid.',
  safety: 'Goggles, lab coat and gloves; the ester is flammable and the acid is corrosive|Add anti-bumping granules and never heat a closed system|Vent the separating funnel frequently',
  procedure: 'Reflux the acid, alcohol and catalyst for 45 minutes|Distil the mixture and collect the fraction boiling below 90 °C|Shake the distillate with sodium carbonate solution to remove the acid, venting the funnel|Separate the upper ester layer and dry it|Distil again and record the boiling range and the mass of the product',
  observations: 'A sweet-smelling liquid is collected; the boiling range is close to 77 °C.',
  measurements: 'masses of reactants (g)|volume of ester obtained (cm3)|boiling range (°C)|purity check',
  variables: 'independent: the alcohol used|dependent: mass and purity of the ester|control: same catalyst, same reflux time',
  expected: 'About 20-25 cm3 of ester, a yield of 50-60 % because the reaction is an equilibrium.',
  calculations: 'moles of each reactant and the limiting reagent|theoretical yield|percentage yield|comment on the boiling range as a purity test',
  questions: 'Why is the yield less than 100 %?|Why is sodium carbonate used rather than water?|Why should the thermometer bulb sit at the branch of the still head?'
});

E('chemistry', 'a', 'Oxidation of propan-1-ol', 'Oxidise propan-1-ol with acidified dichromate(VI) and distil the aldehyde produced.', {
  duration: '60 min', tags: 'organic, oxidation, distillation',
  apparatus: 'round_bottom_flask_250, liebig_condenser, heating_mantle, distillation_flask_250, test_tube x3, measuring_cylinder_25, thermometer, retort_stand',
  substances: 'propan_1_ol:10 cm3, k2cr2o7_0_1m:25 cm3, h2so4_1m:25 cm3, ethanal_solution:5 cm3',
  theory: 'A primary alcohol is oxidised by acidified dichromate(VI) first to an aldehyde and then to a carboxylic acid. Distilling the aldehyde off as it forms prevents further oxidation.',
  safety: 'Goggles, lab coat and gloves; chromium(VI) compounds are carcinogenic and the aldehyde is flammable|Distil with the receiver cooled in an ice bath and never heat a closed system',
  procedure: 'Place the alcohol and acidified dichromate in the flask with anti-bumping granules|Distil slowly, collecting the fraction that boils below 50 °C|Confirm the aldehyde with Tollens\' reagent and with Fehling\'s solution|Comment on the colour change in the flask',
  observations: 'Orange dichromate turns green as the alcohol is oxidised; the distillate gives a silver mirror with Tollens\' reagent.',
  measurements: 'temperature of the distillate|volume of product|time for the colour change',
  variables: 'independent: the alcohol used (primary, secondary, tertiary)|dependent: the product formed|control: same oxidant and conditions',
  expected: 'Propan-1-ol gives propanal, which is confirmed by the silver mirror; a tertiary alcohol gives no reaction.',
  calculations: 'oxidation states of chromium before and after|balanced half equation|moles of oxidant needed per mole of alcohol',
  questions: 'Why is the aldehyde distilled off as it forms?|Why does propan-2-ol give a ketone that does not react with Tollens\' reagent?'
});

E('chemistry', 'a', 'Tests for aldehydes and ketones', 'Distinguish between an aldehyde and a ketone using Tollens\' and Fehling\'s tests.', {
  duration: '40 min', tags: 'organic, qualitative, carbonyl',
  apparatus: 'test_tube x6, test_tube_rack, water_bath, dropping_bottle x2, thermometer',
  substances: 'ethanal_solution:10 cm3, propanone:10 cm3, agno3_0_1m:10 cm3, ammonia_conc:10 cm3, hcl_1m:5 cm3',
  theory: 'Aldehydes are readily oxidised, so they reduce Ag+ to silver metal and Cu2+ to copper(I) oxide. Ketones are not oxidised under these conditions.',
  safety: 'Goggles and lab coat; Tollens\' reagent forms explosive silver fulminate if left to stand - make it fresh and wash it away at once|Work in the fume hood',
  procedure: 'Make Tollens\' reagent by adding dilute ammonia to silver nitrate until the brown precipitate just dissolves|Add the aldehyde to one tube and the ketone to another and warm in the water bath|Record the result and then repeat the tests with Fehling\'s solution|Use the results to classify each unknown',
  observations: 'The aldehyde gives a silver mirror and a brick-red precipitate; the ketone gives no visible change in either test.',
  measurements: 'qualitative observations|temperature of the bath|time for the mirror to form',
  variables: 'independent: the carbonyl compound tested|dependent: result of each test|control: same reagent volumes and temperature',
  expected: 'Only the aldehyde gives positive results in both tests.',
  calculations: 'balanced equations for the oxidation of the aldehyde',
  questions: 'Why must Tollens\' reagent be freshly prepared?|Why are ketones not oxidised by these reagents?'
});

E('chemistry', 'a', 'Bromine water and alkenes', 'Use bromine water to distinguish an alkane from an alkene.', {
  duration: '30 min', tags: 'organic, addition, test',
  apparatus: 'test_tube x4, test_tube_rack, dropping_bottle, measuring_cylinder_10',
  substances: 'bromine_water:20 cm3, hex_1_ene:5 cm3, hexane:5 cm3, cyclohexene:5 cm3',
  theory: 'Bromine adds across a C=C double bond, removing the orange colour. Alkanes do not react without ultraviolet light, so the colour persists.',
  safety: 'Goggles, lab coat and gloves; bromine water is toxic and corrosive|Work in the fume hood|Shake the tubes gently to mix the layers',
  procedure: 'Place 5 cm3 of bromine water in each of three tubes|Add a few drops of the alkene to one, the alkane to another and the second alkene to the third|Stopper each tube and shake, then record the colour|Leave the alkane tube in sunlight for ten minutes and observe again',
  observations: 'The alkene tubes are decolourised immediately; the alkane tube stays orange until it is exposed to light, when it slowly bleaches by substitution.',
  measurements: 'colour before and after (qualitative)|time for decolourisation',
  variables: 'independent: the hydrocarbon tested|dependent: decolourisation of bromine water|control: same volume of bromine water and drop size',
  expected: 'Both alkenes decolourise bromine water instantly; the alkane does not in the dark.',
  calculations: 'equation for the addition of bromine to hex-1-ene|compare with the substitution reaction of an alkane',
  questions: 'Why must the tube be shaken?|Why does the alkane react slowly in light?'
});

E('chemistry', 'a', 'Solvent extraction and distillation', 'Separate a mixture of an organic solvent and an aqueous solution using a separating funnel.', {
  duration: '50 min', tags: 'separation, solvent extraction, distillation',
  apparatus: 'separating_funnel_100, beaker_100 x2, distillation_flask_250, liebig_condenser, heating_mantle, retort_stand, measuring_cylinder_50, test_tube',
  substances: 'iodine_solution:30 cm3, hexane:30 cm3, distilled_water:50 cm3',
  theory: 'Iodine is much more soluble in hexane than in water, so it partitions into the organic layer. The layers are separated by density and the solvent is recovered by distillation.',
  safety: 'Goggles, lab coat and gloves; hexane is flammable and iodine stains and irritates|Vent the funnel frequently, pointing the stem away from everyone|No flames near the solvent',
  procedure: 'Pour the iodine solution and hexane into the separating funnel and stopper it|Invert and shake gently, venting the funnel every few shakes|Allow the layers to separate and run off the lower aqueous layer into a beaker|Run the upper purple hexane layer into a flask and distil off the solvent|Re-weigh and identify the solute left behind',
  observations: 'The purple colour transfers from the water to the top hexane layer; distillation leaves dark iodine crystals.',
  measurements: 'volumes of each layer|temperature range during distillation|mass of residue',
  variables: 'independent: volume of solvent used|dependent: amount extracted|control: same volume of solution, same shaking time, temperature',
  expected: 'Most of the iodine is extracted in two extractions; adding a second aliquot of hexane recovers more.',
  calculations: 'compare one extraction of 30 cm3 with two of 15 cm3 using the partition coefficient idea',
  questions: 'Why is extraction more efficient with two small volumes than one large one?|Why must the funnel be vented?|How is the identity of the residue confirmed?'
});

E('chemistry', 'a', 'Iodine-thiosulfate titration', 'Determine the copper content of a solution by an iodine-thiosulfate titration.', {
  duration: '60 min', tags: 'titration, redox, iodine',
  apparatus: 'burette_50, conical_flask_250, pipette_25, measuring_cylinder_25, white_tile, retort_stand',
  substances: 'cuso4_0_5m:25 cm3, ki_1m:25 cm3, na2s2o3_0_1m:250 cm3, starch_solution:5 cm3, ch3cooh_1m:10 cm3',
  theory: 'Cu2+ + 2I- -> CuI + 1/2 I2 (with iodide in excess). The iodine liberated is titrated with thiosulfate: I2 + 2S2O3^2- -> 2I- + S4O6^2-. Starch is added near the end point.',
  safety: 'Goggles, lab coat and gloves|Iodine stains and the copper solution is harmful|Add starch only when the solution is pale straw-coloured',
  procedure: 'Pipette 25.0 cm3 of copper(II) solution into a conical flask|Add excess potassium iodide solution and acidify with ethanoic acid|Titrate the liberated iodine with thiosulfate until the brown colour fades to straw|Add 2 cm3 of starch solution and continue until the blue-black colour disappears|Record the mean titre and calculate the copper concentration',
  observations: 'The solution is deep brown and turns blue-black with starch, then colourless at the end point.',
  measurements: 'initial and final burette readings|mean titre (cm3)',
  variables: 'independent: volume of thiosulfate added|dependent: the end point|control: same pipette volume, excess iodide, added starch at the same point',
  expected: 'The titration gives the expected concentration of the copper solution within about 2 %.',
  calculations: 'moles thiosulfate = concentration x titre / 1000|moles I2 = moles thiosulfate / 2|moles Cu2+ = 2 x moles I2|[Cu2+] and percentage error',
  questions: 'Why is starch added near the end point?|Why must the iodide be in excess?'
});

E('chemistry', 'a', 'Colorimetry: the Beer-Lambert law', 'Use a colorimeter to find the concentration of an unknown copper(II) sulfate solution.', {
  duration: '50 min', tags: 'analytical, colorimetry, calibration',
  apparatus: 'colorimeter, volumetric_flask_100 x5, pipette_25, beaker_100, test_tube x5, wash_bottle',
  substances: 'cuso4_0_5m:50 cm3, distilled_water:500 cm3',
  theory: 'Absorbance A = ecl, so a graph of absorbance against concentration is a straight line through the origin. The unknown concentration is read from the calibration curve.',
  safety: 'Goggles and lab coat|Rinse the cuvettes with distilled water before each reading and handle them by the frosted sides|Copper solutions go to the heavy-metal waste bottle',
  procedure: 'Dilute the stock solution to make five standard solutions of known concentration|Set the colorimeter to the red filter (about 600 nm) and zero it with distilled water|Measure the absorbance of each standard, rinsing the cuvette between readings|Plot a calibration curve of absorbance against concentration|Measure the unknown and read its concentration from the graph',
  observations: 'The blue colour deepens with concentration and the absorbance readings are proportional to concentration.',
  measurements: 'concentrations of the standards|absorbance of each standard|absorbance of the unknown',
  variables: 'independent: concentration of copper(II) sulfate|dependent: absorbance|control: same filter and path length, zeroed instrument, same temperature',
  expected: 'A straight line through the origin; the unknown concentration is found to within about 0.005 mol/dm3.',
  calculations: 'plot A against c and find the gradient (the molar absorptivity x path length)|c(unknown) = A(unknown) / gradient|estimate the uncertainty from the scatter of the points',
  questions: 'Why must the colorimeter be zeroed with distilled water?|Why is a red filter used for a blue solution?|How would a dirty cuvette affect the result?'
});

// =========================== UNDERGRADUATE CHEMISTRY ========================
E('chemistry', 'ug', 'Determination of Ka by titration curve analysis', 'Obtain the pKa of a weak monoprotic acid from a pH titration curve and quantify the uncertainty.', {
  duration: '90 min', tags: 'uncertainty, titration curve, pKa, research',
  apparatus: 'burette_50, beaker_250, ph_meter, magnetic_stirrer, volumetric_flask_250, pipette_25, datalogger',
  substances: 'unknown_weak_acid:25 cm3, naoh_0_1m:250 cm3, ph_buffer_4:50 cm3, ph_buffer_7:50 cm3, ph_buffer_10:50 cm3',
  theory: 'At half neutralisation pH = pKa. Fitting the whole curve with the Henderson-Hasselbalch equation gives a more reliable value than a single point. Uncertainties in the burette reading and pH propagate through the result.',
  safety: 'Goggles, lab coat and gloves|Calibrate the pH meter against three buffers and record the calibration slope|Stir continuously to avoid a pH drift',
  procedure: 'Calibrate the pH meter with buffers 4, 7 and 10 and record the response slope|Pipette 25.0 cm3 of the unknown acid into the beaker and titrate with standard alkali, logging pH every second with the datalogger|Continue past the equivalence point to the buffer region|Plot pH against volume and locate the equivalence and half-equivalence points|Determine pKa and combine the uncertainties using the standard rules',
  observations: 'A well-defined inflection at the equivalence point and a flat buffer region before it.',
  measurements: 'pH against volume (datalogger)|burette readings at the equivalence point|calibration slope|temperature',
  variables: 'independent: volume of alkali added|dependent: pH|control: temperature, stirring rate, same electrode and calibration',
  expected: 'pKa determined to within about 0.05 units with a full uncertainty budget.',
  calculations: 'pKa from the half-equivalence point|Henderson-Hasselbalch fit across the buffer region|percentage and absolute uncertainties|combined uncertainty in pKa using quadrature',
  questions: 'Why does the half-equivalence method fail if the acid concentration is very low?|Which measurement contributes most to the uncertainty in pKa?|How would dissolved carbon dioxide affect the result?'
});

E('chemistry', 'ug', 'Kinetics: order of reaction and rate constant', 'Determine the order of reaction and the rate constant for a reaction using the initial rates method.', {
  duration: '120 min', tags: 'kinetics, order, rate constant, uncertainty',
  apparatus: 'conical_flask_250 x5, burette_50, stopwatch, colorimeter, measuring_cylinder_25 x4, water_bath, thermometer',
  substances: 'kmno4_0_02m:50 cm3, sodium_ethanedioate_0_5m:50 cm3, h2so4_1m:100 cm3',
  theory: 'For rate = k[A]^m[B]^n the orders are found by changing one concentration at a time. The overall order and k follow, and the activation energy comes from the temperature dependence.',
  safety: 'Goggles, lab coat and gloves|Chromium-free oxidant but permanganate stains badly|Use the fume hood for the hot runs',
  procedure: 'Carry out five runs in which the concentration of one reactant is varied while the other is held constant, following the reaction colorimetrically|Take the initial rate from the tangent at t = 0 for each run|Determine the order with respect to each reactant from the rate ratios|Calculate k at each temperature using the rate equation|Determine the activation energy from a plot of ln k against 1/T',
  observations: 'Doubling a reactant doubles or quadruples the initial rate depending on its order; higher temperatures give steeper initial gradients.',
  measurements: 'absorbance against time for each run|initial rates|concentrations|temperature',
  variables: 'independent: concentration of each reactant and temperature|dependent: initial rate and rate constant|control: total volume, ionic strength, same apparatus',
  expected: 'First order in each reactant (second order overall) with an activation energy of roughly 50-90 kJ/mol.',
  calculations: 'initial rate from the tangent|orders from rate ratios|k = rate / ([A][B])|Arrhenius plot: ln k = ln A - Ea/RT|uncertainty in Ea',
  questions: 'Why must the total volume be constant?|Why is the initial rate taken rather than the average rate?|How does autocatalysis affect the shape of the absorbance-time curve?'
});

E('chemistry', 'ug', 'Synthesis and recrystallisation of benzoic acid', 'Synthesise a solid organic product, purify it by recrystallisation and assess its purity.', {
  duration: '150 min', tags: 'synthesis, recrystallisation, yield, purity',
  apparatus: 'round_bottom_flask_250, liebig_condenser, heating_mantle, filter_flask_250, funnel, filter_paper, beaker_250, ice_bath, melting_point_apparatus, top_pan_balance',
  substances: 'benzoic_acid:5 g, ethanol:30 cm3, distilled_water:200 cm3, naoh_1m:20 cm3, hcl_1m:30 cm3',
  theory: 'Recrystallisation exploits the difference in solubility between hot and cold solvent. The melting point range is the classic purity criterion.',
  safety: 'Goggles, lab coat and gloves|Hot solvent burns; use a hot-water funnel and stemless funnel|Never boil a flammable solvent over a flame',
  procedure: 'Dissolve the crude product in the minimum volume of hot solvent|Filter hot to remove insoluble impurities and coloured material|Cool slowly in ice to crystallise and collect the product under suction|Wash the crystals with a little cold solvent and dry them|Record the mass, melting point range and yield; compare with the literature value',
  observations: 'Crystals form on cooling; the melting point range narrows with each recrystallisation.',
  measurements: 'mass of crude and purified product (g)|melting point range (°C)|volume of solvent used',
  variables: 'independent: the recrystallisation solvent and cooling rate|dependent: purity (melting range) and yield|control: same starting material mass',
  expected: 'Yield of 60-80 % with a melting point within 1 °C of the literature value.',
  calculations: 'percentage yield|percentage recovery of the recrystallisation|comment on the melting point range as a measure of purity',
  questions: 'Why must the crystals be washed with cold rather than warm solvent?|Why does slow cooling give purer crystals?|What does a wide melting range indicate?'
});

E('chemistry', 'ug', 'Electrolysis: Faraday\'s law and the Faraday constant', 'Determine the Faraday constant by measuring the mass of copper deposited during electrolysis.', {
  duration: '120 min', tags: 'electrochemistry, Faraday, uncertainty',
  apparatus: 'beaker_250, power_supply, ammeter_digital, stopwatch, analytical_balance, copper_electrodes, wire_red x2, crocodile_clip x2',
  substances: 'cuso4_0_5m:200 cm3, ethanol:20 cm3',
  theory: 'The mass deposited is m = MIt/(zF). Measuring m, I and t gives F. Accurate work uses a constant current and a digital balance.',
  safety: 'Goggles, lab coat and gloves|Keep the current below the rating of the apparatus|Copper solutions must not go down the sink',
  procedure: 'Clean, dry and weigh the cathode with the analytical balance|Electrolyse at a measured constant current for a measured time|Switch off, rinse the cathode with water and then ethanol, dry and reweigh|Repeat the run to check consistency|Calculate F and compare with the accepted value, with an uncertainty budget',
  observations: 'A uniform copper layer forms; the mass gain is small but measurable to 0.1 mg.',
  measurements: 'current (A) every minute|time (s)|mass before and after (g)',
  variables: 'independent: charge passed|dependent: mass of copper deposited|control: concentration, electrode area, temperature',
  expected: 'F found within about 2 % of 96485 C/mol.',
  calculations: 'charge = I t|moles Cu = mass / 63.5|F = I t / (2 x moles)|percentage and absolute uncertainty from mass and current',
  questions: 'Why is the electrode rinsed with ethanol?|Which measurement limits the precision?|How would a fluctuating current affect the result?'
});

E('chemistry', 'ug', 'Thermochemistry: Hess\'s law cycle', 'Test Hess\'s law by comparing two routes to the same enthalpy change.', {
  duration: '120 min', tags: 'enthalpy, Hess law, calorimetry, uncertainty',
  apparatus: 'polystyrene_cup x2, thermometer_precise, measuring_cylinder_50 x2, top_pan_balance, burette_50',
  substances: 'naoh_1m:100 cm3, hcl_1m:100 cm3, naoh_pellets:4 g, distilled_water:100 cm3',
  theory: 'Dissolving solid sodium hydroxide has a large negative enthalpy of solution; neutralising the resulting solution completes a cycle whose sum must equal the direct neutralisation enthalpy.',
  safety: 'Goggles, lab coat and gloves; sodium hydroxide pellets are very corrosive and the dissolution is strongly exothermic|Add the pellets slowly and stir|Do not handle pellets with bare hands',
  procedure: 'Measure the enthalpy of neutralisation of NaOH solution with HCl using a polystyrene cup|Measure the enthalpy of solution of solid NaOH in water in a second cup|Repeat both experiments to obtain an average|Combine the results in a Hess cycle and compare with the direct value',
  observations: 'Both reactions warm the solution; the dissolution is markedly exothermic and warms it further.',
  measurements: 'temperature change for each experiment (°C)|masses and volumes|moles of NaOH',
  variables: 'independent: the route taken (solution + neutralisation, or direct neutralisation)|dependent: overall enthalpy change|control: same final solution composition, same calorimeter type',
  expected: 'The two routes agree within the combined experimental uncertainty (a few kJ/mol).',
  calculations: 'energy = m c ΔT|ΔH per mole|Hess cycle sum|combined uncertainty using quadrature|comment on the size of the heat losses',
  questions: 'Which route loses more heat and why?|How could the calorimeter be improved?|Why must the final solutions be equivalent?'
});
