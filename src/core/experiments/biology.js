import { E } from './schema.js';

// ============================== IGCSE BIOLOGY ================================
E('biology', 'igcse', 'Cells of an onion epidermis', 'Prepare a slide of onion epidermis and identify the main plant cell structures.', {
  duration: '40 min', tags: 'microscopy, cells, staining',
  apparatus: 'microscope, glass_slide, coverslip, forceps, mounted_needle, dropping_bottle, staining_jar, hand_lens, white_tile',
  substances: 'onion_tissue:1 piece, iodine_stain:5 cm3, distilled_water:20 cm3',
  theory: 'Plant cells have a cell wall, a large vacuole and a nucleus; staining adds contrast because most structures are colourless.',
  safety: 'Goggles; iodine stains skin and clothing|Handle the glass slide and coverslip carefully|Carry the microscope with two hands',
  procedure: 'Peel a thin layer of epidermis from the inner surface of an onion scale|Lay it flat on a drop of water on the slide and lower the coverslip at an angle to avoid air bubbles|Add a drop of iodine stain at one side and draw it through with filter paper|Focus on low power and then on medium power and draw the cells you can see|Label the cell wall, cytoplasm, vacuole, nucleus and cell membrane',
  observations: 'Rectangular cells in a regular pattern; the stained nuclei appear as dark rounded structures.',
  measurements: 'number of cells across the field of view|length of one cell (mm) using the field diameter',
  variables: 'independent: the specimen and stain used|dependent: the structures that can be identified|control: same magnification and lighting',
  expected: 'A clear drawing of at least five cells with the main structures labelled.',
  calculations: 'actual cell length = measured length / magnification|cell width in µm',
  questions: 'Why is a thin layer of tissue needed?|Why is iodine used?|Which structures were visible without stain?'
});

E('biology', 'igcse', 'Measuring cell size with a microscope', 'Estimate the size of cells from the field of view and check the estimate with a graticule.', {
  duration: '35 min', tags: 'microscopy, measurement, scale',
  apparatus: 'microscope, glass_slide, coverslip, ruler, graticule, stage_micrometer',
  substances: 'onion_tissue:1 piece, distilled_water:10 cm3',
  theory: 'Magnification = image size / actual size, so once the field diameter is known the size of a cell follows from how many cells fit across it.',
  safety: 'Handle the stage micrometer carefully; it is a precision scale|Ocular lenses must not be removed',
  procedure: 'Measure the diameter of the field of view at each magnification with a ruler and a stage micrometer|Place your specimen on the stage and count how many cells fit across the field|Calculate the actual cell length|Calibrate the eyepiece graticule at each magnification and repeat the measurement',
  observations: 'The graticule gives more consistent measurements than counting cells.',
  measurements: 'field diameter (mm) at each magnification|number of cells across the field|graticule units per cell',
  variables: 'independent: the magnification used|dependent: the measured cell size|control: same specimen and calibration',
  expected: 'Onion cells are about 100-200 µm long; estimates from the graticule and the field count agree within 20 %.',
  calculations: 'actual size = image size / magnification|µm per graticule unit|percentage difference between the two methods',
  questions: 'Why is the graticule method more reliable?|Why must the graticule be recalibrated at each magnification?'
});

E('biology', 'igcse', 'Osmosis in potato tissue', 'Investigate the effect of sugar solution concentration on the mass of potato tissue.', {
  duration: '60 min', tags: 'osmosis, water potential, mass change',
  apparatus: 'cork_borer, scalpel, white_tile, test_tube x5, test_tube_rack, top_pan_balance, measuring_cylinder_25, stopwatch, ruler, forceps',
  substances: 'sucrose_solution_1pct:100 cm3, distilled_water:100 cm3',
  theory: 'Water moves by osmosis from a dilute solution to a more concentrated one across a partially permeable membrane, so the potato gains or loses mass.',
  safety: 'Goggles; use the cork borer away from your hand and cut on the tile|Sucrose solutions may grow micro-organisms - discard them',
  procedure: 'Cut five cylinders of potato of the same length and diameter with the cork borer and scalpel|Blot them dry and weigh each one|Place one in water and the others in sugar solutions of increasing concentration|Leave for 30 minutes and remove, blot and reweigh|Calculate the percentage change in mass and plot it against concentration',
  observations: 'The potato in water gains mass and becomes firm; the potato in the strongest sugar solution loses mass and becomes floppy.',
  measurements: 'initial and final mass of each cylinder (g)|concentration of each solution (mol/dm3)|length of the cylinders (mm)',
  variables: 'independent: concentration of the sugar solution|dependent: percentage change in mass|control: same potato, same cylinder size, same time and temperature',
  expected: 'A straight line of negative gradient crossing zero at the concentration of the potato cell contents (about 0.3 mol/dm3).',
  calculations: 'percentage change = (final - initial)/initial x 100|plot percentage change against concentration|read off the concentration at zero change',
  questions: 'Why must the cylinders be the same size?|Why is a percentage change used rather than the mass change?|Why is the total change in mass of all the tissue more reliable than the change in each piece?'
});

E('biology', 'igcse', 'Osmosis in visking tubing', 'Demonstrate osmosis and diffusion across a partially permeable membrane.', {
  duration: '60 min', tags: 'osmosis, diffusion, membrane',
  apparatus: 'visking_tubing, beaker_250, string, glass_rod, measuring_cylinder_100, top_pan_balance, syringe_20',
  substances: 'starch_suspension_1pct:20 cm3, glucose_solution_1pct:20 cm3, iodine_solution:5 cm3, distilled_water:200 cm3',
  theory: 'The membrane is permeable to water and small molecules such as glucose but impermeable to large molecules such as starch.',
  safety: 'Goggles and lab coat|Do not allow iodine to touch skin or clothing|Rinse the tubing thoroughly',
  procedure: 'Soak a length of visking tubing in water and tie one end|Fill it with the starch and glucose mixture and tie the other end, leaving some air space|Weigh the tubing and place it in a beaker of distilled water|After 30 minutes test the water outside with iodine and with Benedict\'s reagent after heating',
  observations: 'The tubing gains mass; the outside water gives a positive Benedict\'s test but no blue-black colour with iodine.',
  measurements: 'mass of tubing before and after (g)|volume of water (cm3)|test results at 10, 20 and 30 minutes',
  variables: 'independent: time in the water|dependent: mass change and the substances detected outside|control: same tubing, same starting concentrations, same temperature',
  expected: 'Glucose diffuses out but starch does not, showing the selective permeability of the membrane.',
  calculations: 'percentage mass change|estimate the rate of diffusion from the test results at each time',
  questions: 'Why does starch not diffuse out?|Why does the tubing gain mass?|How would a more concentrated sugar solution inside change the result?'
});

E('biology', 'igcse', 'Food tests', 'Test food samples for starch, reducing sugar, protein and lipid.', {
  duration: '45 min', tags: 'food tests, biochemistry',
  apparatus: 'test_tube x8, test_tube_rack, dropping_bottle x3, water_bath, bunsen_burner, tripod, gauze, measuring_cylinder_10, white_tile, glass_rod',
  substances: 'starch_suspension_1pct:20 cm3, glucose_solution_1pct:20 cm3, egg_albumen:20 cm3, vegetable_oil:10 cm3, milk_sample:20 cm3, iodine_solution:5 cm3, benedicts_reagent:20 cm3, biuret_reagent:20 cm3, sudan_iii:5 cm3, distilled_water:100 cm3',
  theory: 'Each food group has a specific reagent: iodine for starch, Benedict\'s for reducing sugar (needs heat), biuret for protein and Sudan III or the emulsion test for lipid.',
  safety: 'Goggles and lab coat|Benedict\'s reagent is an irritant and the water bath is hot - use tongs|Sudan III is flammable - keep it away from flames',
  procedure: 'Put 2 cm3 of each sample in a labelled tube and add three drops of iodine to one set|Add 2 cm3 of Benedict\'s reagent to another set and heat in the water bath for five minutes|Add biuret reagent to a third set and shake gently|Test for lipid by adding three drops of Sudan III and shaking, or by shaking with ethanol and water|Record every result in a results table with the observation and the conclusion',
  observations: 'Starch: blue-black with iodine. Reducing sugar: green to brick-red with Benedict\'s. Protein: purple with biuret. Lipid: red-orange droplets with Sudan III.',
  measurements: 'colour of each test|time to the first colour change|temperature of the water bath (°C)',
  variables: 'independent: the food sample tested|dependent: the result of each test|control: same volumes of sample and reagent, same heating time',
  expected: 'Milk is positive for reducing sugar (lactose), protein and lipid; glucose is positive only for reducing sugar.',
  calculations: 'not required; use a table with observation, test and conclusion',
  questions: 'Why must the sample be heated with Benedict\'s reagent?|Why is the biuret test done last?|Why does starch give a negative Benedict\'s result?'
});

E('biology', 'igcse', 'Amylase and starch: temperature and enzymes', 'Investigate the effect of temperature on the rate at which amylase digests starch.', {
  duration: '50 min', tags: 'enzymes, temperature, digestion',
  apparatus: 'test_tube x5, test_tube_rack, water_bath, thermometer, stopwatch, white_tile, measuring_cylinder_10 x2, syringe_20',
  substances: 'starch_suspension_1pct:25 cm3, amylase_solution:10 cm3, iodine_solution:5 cm3',
  theory: 'Amylase breaks starch down to maltose. Raising the temperature increases the rate of collision until the enzyme is denatured above about 60 °C.',
  safety: 'Goggles and lab coat|Iodine stains skin|Handle the hot water bath with care',
  procedure: 'Put 2 cm3 of starch into each of five tubes and bring them to the chosen temperature in the water bath|Add 1 cm3 of amylase, start the stopwatch and remove a drop every 30 s onto a spotting tile with iodine|Record the time at which iodine gives no blue-black colour|Repeat at 20, 30, 40, 50 and 60 °C and plot rate (1/time) against temperature',
  observations: 'The starch is digested fastest at about 40 °C; at 60 °C the blue-black colour never disappears.',
  measurements: 'temperature (°C)|time for starch to disappear (s)|colour of the iodine test at each time',
  variables: 'independent: temperature|dependent: time for starch to be digested|control: same volumes, concentrations and enzyme batch',
  expected: 'An optimum around 40 °C with the rate falling to zero at 60 °C as the enzyme denatures.',
  calculations: 'rate = 1/time|plot rate against temperature|describe the shape of the curve',
  questions: 'Why does the rate fall at low temperatures but not stop completely?|Why is the enzyme denatured above 60 °C?|How would you show that the substrate, not the enzyme, is the limiting factor at low temperature?'
});

E('biology', 'igcse', 'Catalase and hydrogen peroxide', 'Investigate how the rate of an enzyme reaction depends on the surface area of the tissue.', {
  duration: '45 min', tags: 'enzymes, catalysts, gas',
  apparatus: 'conical_flask_250, gas_syringe, delivery_tube, bung, cork_borer, scalpel, white_tile, ruler, stopwatch, top_pan_balance',
  substances: 'hydrogen_peroxide_20vol:50 cm3, potato_tissue:30 g',
  theory: 'Catalase from potato tissue breaks down hydrogen peroxide into water and oxygen. More exposed surface means more enzyme in contact with the substrate.',
  safety: 'Goggles and lab coat; 20-volume peroxide bleaches skin and irritates the eyes|Keep the flask open to the gas syringe and never sealed|Cut the tissue on the tile, away from your fingers',
  procedure: 'Cut the potato into discs of the same mass but different surface area (whole, halved, sliced, diced)|Place each sample in the flask with 20 cm3 of peroxide and immediately fit the syringe|Record the volume of oxygen produced in 60 s|Repeat for each sample and plot the volume against surface area',
  observations: 'The diced potato froths violently and produces much more gas in the same time.',
  measurements: 'volume of oxygen in 60 s (cm3)|mass of tissue (g)|number of pieces and their dimensions (mm)',
  variables: 'independent: surface area of the tissue|dependent: volume of oxygen produced per minute|control: same mass of tissue, same volume and concentration of peroxide, same temperature',
  expected: 'The volume of oxygen increases with surface area but approaches a limit set by the amount of enzyme.',
  calculations: 'rate = volume / time|surface area of each sample|plot rate against surface area',
  questions: 'Why does the rate not increase without limit?|Why must the mass of tissue be the same?|Predict the effect of boiling the potato first.'
});

E('biology', 'igcse', 'Photosynthesis: pondweed and light intensity', 'Investigate how light intensity affects the rate of photosynthesis.', {
  duration: '50 min', tags: 'photosynthesis, limiting factors, gas',
  apparatus: 'boiling_tube, beaker_600, lamp, ruler, stopwatch, thermometer, test_tube_rack',
  substances: 'pondweed:1 strand, distilled_water:500 cm3, sodium_hydrogencarbonate_lib:2 g',
  theory: 'Pondweed releases oxygen as it photosynthesises. Light intensity falls with the square of the distance, so the rate should be proportional to 1/d².',
  safety: 'Goggles; the lamp gets hot - keep it away from the water and from the pondweed|Do not look at the lamp directly',
  procedure: 'Place the pondweed in a boiling tube of water with a little hydrogencarbonate and put it in the beaker|Put the lamp 10 cm away and leave it for two minutes to acclimatise|Count the bubbles released in one minute and repeat three times|Repeat at 20, 30, 40 and 50 cm and plot the rate against 1/d²',
  observations: 'Bubbles of oxygen stream from the cut stem; the rate falls as the lamp is moved further away.',
  measurements: 'distance from the lamp (cm)|number of bubbles per minute|temperature (°C)',
  variables: 'independent: light intensity (distance from the lamp)|dependent: number of bubbles per minute|control: same pondweed, same temperature, same hydrogencarbonate concentration',
  expected: 'A straight line through the origin for bubbles per minute against 1/d², until light stops being the limiting factor.',
  calculations: 'light intensity ∝ 1/d²|plot rate against 1/d²|identify where the graph flattens',
  questions: 'Why does the graph flatten at high light intensity?|Why is hydrogencarbonate added?|Why is counting bubbles a poor measure of the true rate?'
});

E('biology', 'igcse', 'Respiration: fermentation by yeast', 'Investigate the effect of temperature on the rate of fermentation by yeast.', {
  duration: '60 min', tags: 'respiration, yeast, gas',
  apparatus: 'conical_flask_250, delivery_tube, bung, gas_syringe, water_bath, thermometer, measuring_cylinder_50, stopwatch, top_pan_balance',
  substances: 'yeast_suspension:20 cm3, glucose_solution_1pct:50 cm3, distilled_water:50 cm3',
  theory: 'Yeast respires anaerobically: glucose -> ethanol + carbon dioxide. Enzymes control the rate, so temperature has a large effect up to the point of denaturation.',
  safety: 'Goggles and lab coat|Keep the connection to the gas syringe secure|Wash hands after handling yeast',
  procedure: 'Mix 10 cm3 of yeast suspension with 10 cm3 of glucose solution in the flask|Fit the delivery tube to the gas syringe and place the flask in the water bath at the chosen temperature|Leave for two minutes to reach temperature and record the gas volume every minute for ten minutes|Repeat at 20, 30, 40, 50 and 60 °C',
  observations: 'Steady frothing and gas production; the rate is fastest at about 35-40 °C and nearly stops at 60 °C.',
  measurements: 'temperature (°C)|gas volume every minute (cm3)|time (min)',
  variables: 'independent: temperature|dependent: volume of carbon dioxide per minute|control: same yeast and glucose concentrations, same volumes',
  expected: 'An optimum near 35-40 °C and a sharp fall at 60 °C because the enzymes are denatured.',
  calculations: 'rate = initial gradient (cm3/min)|plot rate against temperature|compare with the amylase result',
  questions: 'Why is the rate lower at 20 °C than at 35 °C?|Why does the rate collapse at 60 °C?|How could you test whether ethanol is produced?'
});

E('biology', 'igcse', 'Aseptic technique and culturing micro-organisms', 'Use aseptic technique to culture yeast on agar and investigate its growth.', {
  duration: '60 min plus incubation', tags: 'microbiology, aseptic technique',
  apparatus: 'petri_dish x3, inoculating_loop, bunsen_burner, incubator, autoclave_bin, disinfectant, marker_pen, glass_rod',
  substances: 'nutrient_agar:60 cm3, yeast_suspension:5 cm3, disinfectant_solution:100 cm3',
  theory: 'Aseptic technique prevents contamination: sterilise the loop, work near a flame, keep the lid on and never open a cultured dish.',
  safety: 'Goggles and lab coat|Sterilise the loop in the flame before and after use and do not put it down|Keep the dish closed once inoculated and incubate below 30 °C to avoid growing human pathogens|Wash hands before and after',
  procedure: 'Pour the molten agar into three dishes and let it set with the lid on|Flame the loop until it glows, cool it and pick up some yeast suspension|Lift the lid only enough to streak the agar and close it at once|Tape the dish, label it, invert it and incubate at 25-30 °C for two days|Count the colonies and record their appearance; then seal the dish for disposal',
  observations: 'Creamy circular colonies appear after two days; contaminated dishes show colonies of a different colour or shape.',
  measurements: 'number of colonies|colony diameter (mm)|incubation time and temperature',
  variables: 'independent: the sample or dilution plated|dependent: number of colonies|control: an unopened plate to check the agar and a plate opened in the air to show contamination',
  expected: 'Well separated colonies with no contamination on the streaked plate.',
  calculations: 'colonies per cm3 = colonies x dilution factor / volume plated',
  questions: 'Why is the lid only lifted slightly?|Why is the dish incubated below 30 °C?|Why must the dish never be opened after incubation?'
});

E('biology', 'igcse', 'Quadrat sampling of a habitat', 'Use a quadrat to estimate the population of a species and calculate the mean density.', {
  duration: '50 min', tags: 'ecology, sampling, estimation',
  apparatus: 'quadrat, ruler, pen, notebook, identification_key',
  substances: '',
  theory: 'Counting in randomly placed quadrats gives an estimate of population density. The estimate is only valid if the sampling is random and the sample size is large enough.',
  safety: 'Fieldwork hazard assessment first: wash hands after touching soil or plants and avoid protected or hazardous species',
  procedure: 'Mark out the study area and choose ten random positions using random numbers|Place the quadrat at each position and count the number of the chosen species|Record the number and the percentage cover in each quadrat|Calculate the mean number per quadrat and estimate the population of the whole area',
  observations: 'Density varies from quadrat to quadrat; more quadrats give a more stable estimate.',
  measurements: 'number of plants per quadrat|percentage cover|area of each quadrat (m²)|total area sampled (m²)',
  variables: 'independent: the position of the quadrat|dependent: number of individuals counted|control: same quadrat size, same observer, random sampling',
  expected: 'The mean density stabilises after about eight to ten quadrats.',
  calculations: 'mean per quadrat|estimated population = mean x total area / quadrat area|range and standard deviation as an indication of the spread',
  questions: 'Why must the quadrats be placed randomly?|How could you decide how many quadrats to use?|Why is percentage cover sometimes better than counting?'
});

// ============================== AS LEVEL BIOLOGY =============================
E('biology', 'as', 'Water potential of potato tissue', 'Determine the water potential of potato tissue from a graph of mass change against sucrose concentration.', {
  duration: '90 min', tags: 'osmosis, water potential, graph',
  apparatus: 'cork_borer, scalpel, white_tile, test_tube x7, test_tube_rack, top_pan_balance, measuring_cylinder_25 x7, stopwatch, forceps, ruler',
  substances: 'sucrose_solution_1pct:300 cm3, distilled_water:200 cm3',
  theory: 'At the concentration where the tissue neither gains nor loses mass, the external solution has the same water potential as the cell contents. Above that concentration the cells become plasmolysed.',
  safety: 'Goggles and lab coat|Cut away from your hand on the tile|Discard the sugar solutions after use and wash the bench',
  procedure: 'Make up seven sucrose solutions from 0.0 to 0.6 mol/dm3 and label them|Cut seven equal potato cylinders with the cork borer and blot them dry|Weigh each cylinder and place one in each solution for 45 minutes|Remove, blot and reweigh, then calculate the percentage mass change|Plot percentage change against concentration and read the value at zero change',
  observations: 'Cylinders in water are firm and heavier; those in strong sugar solution are floppy and lighter.',
  measurements: 'initial and final mass (g)|concentration (mol/dm3)|length and diameter (mm)|temperature (°C)',
  variables: 'independent: sucrose concentration|dependent: percentage change in mass|control: same potato, same cylinder dimensions, same time and temperature',
  expected: 'A line of best fit crossing zero at about 0.30-0.35 mol/dm3, corresponding to a water potential of about -800 to -1000 kPa.',
  calculations: 'percentage change = (m2 - m1)/m1 x 100|plot and find the intercept|convert the sucrose concentration to water potential using a conversion table|range of the repeat readings at each concentration',
  questions: 'Why is percentage change used rather than absolute change?|Why is the water potential expressed as a negative value?|Why might the graph be slightly curved at high concentrations?'
});

E('biology', 'as', 'Enzyme kinetics: substrate concentration', 'Find how the initial rate of an enzyme reaction depends on substrate concentration.', {
  duration: '75 min', tags: 'enzymes, kinetics, vmax',
  apparatus: 'test_tube x6, water_bath, stopwatch, colorimeter, measuring_cylinder_10, pipette_25, syringe_20, white_tile',
  substances: 'starch_suspension_1pct:100 cm3, amylase_solution:20 cm3, iodine_solution:5 cm3, distilled_water:100 cm3',
  theory: 'At low substrate concentration the rate is proportional to [S], but at high concentration all the active sites are occupied so the rate levels off at Vmax. Km is the concentration giving half of Vmax.',
  safety: 'Goggles and lab coat|Iodine stains|Keep the water bath at a constant 25 °C to control the enzyme activity',
  procedure: 'Prepare six starch concentrations, keeping the total volume constant|Bring all the tubes to 25 °C in the water bath|Add the same volume of amylase to each, mix and start the stopwatch|Withdraw a sample every 30 s into iodine and record the time for the starch to disappear|Calculate the initial rate for each concentration and plot rate against [S]',
  observations: 'The rate increases steeply at low substrate concentration then flattens at high concentration.',
  measurements: 'substrate concentration (%)|time for starch to be digested (s)|rate (1/time)|temperature (°C)',
  variables: 'independent: substrate concentration|dependent: initial rate|control: enzyme concentration and volume, pH, temperature',
  expected: 'A rectangular hyperbola whose upper plateau is Vmax and whose Km can be read at half of Vmax.',
  calculations: 'rate = 1/time|plot rate against [S]|estimate Vmax from the plateau and Km as the concentration at Vmax/2|reciprocal plot to confirm',
  questions: 'Why does the rate level off at high substrate concentration?|Why must the enzyme volume be identical in all the tubes?|Why is the initial rate used rather than the total reaction time?'
});

E('biology', 'as', 'Effect of temperature on membrane permeability', 'Use beetroot tissue to investigate how temperature affects cell membrane permeability.', {
  duration: '60 min', tags: 'membranes, permeability, colorimeter',
  apparatus: 'cork_borer, scalpel, white_tile, test_tube x6, water_bath, thermometer, colorimeter, stopwatch, top_pan_balance, ruler',
  substances: 'beetroot_tissue:30 g, distilled_water:300 cm3',
  theory: 'Heating denatures membrane proteins and increases the fluidity of the phospholipid bilayer, so the pigment betalain leaks out. The absorbance of the water measures how much membrane damage has occurred.',
  safety: 'Goggles and lab coat|Use the scalpel on the tile away from your fingers|Hot water scalds - handle the tubes with tongs|Beetroot stains benches and clothing',
  procedure: 'Cut equal cylinders of beetroot with the cork borer, rinse them until the water is clear and blot them|Place one piece in 10 cm3 of distilled water at each of six temperatures for 15 minutes|Remove the pieces and allow the solutions to cool to room temperature|Measure the absorbance of each solution with a green filter and plot absorbance against temperature',
  observations: 'Almost no pigment leaks below 40 °C; above 60 °C the water becomes strongly pink and the absorbance rises steeply.',
  measurements: 'temperature (°C)|absorbance of each solution|mass and dimensions of each piece',
  variables: 'independent: temperature|dependent: absorbance (amount of pigment released)|control: same tissue mass and dimensions, same volume and time',
  expected: 'A sharp rise in absorbance between 50 and 70 °C as the membrane proteins are denatured.',
  calculations: 'plot absorbance against temperature|identify the temperature at which the membrane is significantly damaged|percentage increase in absorbance per 10 °C',
  questions: 'Why is equal tissue mass important?|Why is the pigment release a measure of membrane damage?|Why must the beetroot be rinsed before heating?'
});

E('biology', 'as', 'Cell counts with a haemocytometer', 'Use a counting chamber to estimate the concentration of yeast cells in a suspension.', {
  duration: '60 min', tags: 'microscopy, counting, dilution',
  apparatus: 'microscope, counting_chamber, coverslip, pipette_25, capillary_tube, test_tube x3, measuring_cylinder_10, stopwatch',
  substances: 'yeast_suspension:10 cm3, distilled_water:30 cm3, methylene_blue_stain:2 cm3',
  theory: 'The chamber has a known depth and grid area, so counting cells in defined squares gives the concentration. A vital stain such as methylene blue distinguishes living (colourless) from dead (blue) cells.',
  safety: 'Goggles and lab coat|Handle the coverslip and chamber carefully|Dispose of the yeast suspension hygienically',
  procedure: 'Dilute the yeast suspension if the cells are too crowded for accurate counting|Fill the chamber with the diluted suspension using a capillary tube and let the cells settle|Count the cells in five large squares at 400x magnification|Repeat three times and calculate the mean cell count per cm3',
  observations: 'Cells appear as small oval structures; some take up the methylene blue and are therefore dead.',
  measurements: 'cells per large square|number of squares counted|dilution factor|depth of the chamber (mm)',
  variables: 'independent: the dilution used|dependent: cell concentration|control: same chamber, same settling time, same magnification',
  expected: 'A cell concentration with a precision of about 10 % using the mean of three counts.',
  calculations: 'concentration = mean count per square x dilution factor / volume of one square (cm3)|percentage of viable cells from the stain|standard deviation of the three counts',
  questions: 'Why is the chamber filled by capillary action rather than by dropping the sample on top?|Why is the standard deviation of the counts important?|Why must dead cells be excluded from a viability estimate?'
});

E('biology', 'as', 'Respirometer: rate of respiration', 'Measure the rate of aerobic respiration of germinating peas using a respirometer.', {
  duration: '75 min', tags: 'respiration, respirometer, temperature',
  apparatus: 'respirometer, syringe_20, water_bath, thermometer, stopwatch, top_pan_balance, clamp, retort_stand, measuring_cylinder_25',
  substances: 'germinating_peas:20 g, soda_lime:10 g, distilled_water:50 cm3',
  theory: 'Carbon dioxide produced is absorbed by soda lime, so the volume change is due to oxygen uptake. The rate of respiration is the volume of oxygen used per gram per minute.',
  safety: 'Goggles and lab coat|Soda lime is corrosive to the eyes and skin - handle it with a spatula and wear gloves|Equalise the pressure in the syringes before each reading',
  procedure: 'Put the same mass of germinating peas in the test tube and add soda lime above them|Set up the respirometer and place it in the water bath at 20 °C for five minutes|Read the syringe each minute for ten minutes, adjusting the control syringe to equalise pressure|Repeat with boiled peas as a control and calculate the rate per gram per minute',
  observations: 'The dye moves steadily towards the respiring peas; the boiled peas show almost no movement.',
  measurements: 'volume of gas taken up (cm3) each minute|mass of peas (g)|temperature (°C)|time (min)',
  variables: 'independent: the tissue used (germinating, boiled) or the temperature|dependent: oxygen uptake per gram per minute|control: same mass of tissue, sealed apparatus, equalised pressure, same temperature',
  expected: 'A steady rate of about 0.02 cm3 per gram per minute at 20 °C, rising with temperature up to about 40 °C.',
  calculations: 'rate = volume / (mass x time)|plot volume against time and find the gradient|Q10 for two temperatures|percentage difference between the germinating and boiled tissue',
  questions: 'Why is soda lime used?|Why is the control syringe needed?|Why does the rate depend on the mass of tissue?'
});

E('biology', 'as', 'Photosynthesis: limiting factors', 'Investigate how light intensity and carbon dioxide concentration limit the rate of photosynthesis.', {
  duration: '75 min', tags: 'photosynthesis, limiting factors',
  apparatus: 'boiling_tube, beaker_600, lamp, ruler, stopwatch, thermometer, gas_syringe, test_tube_rack, light_sensor',
  substances: 'pondweed:2 strands, distilled_water:600 cm3, sodium_hydrogencarbonate_lib:5 g',
  theory: 'The rate of photosynthesis is limited by the factor in shortest supply; increasing light intensity raises the rate until carbon dioxide or temperature becomes limiting.',
  safety: 'Goggles and lab coat|The lamp becomes very hot - do not touch the bulb and keep it clear of water',
  procedure: 'Place the pondweed in a tube of hydrogencarbonate solution in the water bath at 25 °C|Measure the light intensity at each lamp distance with the light sensor|Count the bubbles produced in one minute for each distance, taking three repeats|Repeat the series with a higher hydrogencarbonate concentration|Plot the rate against light intensity for both concentrations',
  observations: 'The rate rises steeply with light at low intensity and then flattens; the plateau is higher with more hydrogencarbonate.',
  measurements: 'light intensity (lux)|bubbles per minute|concentration of hydrogencarbonate|temperature (°C)',
  variables: 'independent: light intensity and carbon dioxide concentration|dependent: rate of oxygen production|control: same pondweed, same temperature, same volume',
  expected: 'Two curves both rising and then flattening, with the higher CO2 curve flattening at a higher rate.',
  calculations: 'plot rate against light intensity|identify the limiting factor for each section of the curve|percentage increase in the plateau from doubling the hydrogencarbonate',
  questions: 'What limits the rate on the flat part of the curve?|Why must the pondweed be left to acclimatise?|Why is counting bubbles less reliable than collecting the gas?'
});

E('biology', 'as', 'Chromatography of leaf pigments', 'Separate and identify the photosynthetic pigments in a leaf extract.', {
  duration: '60 min', tags: 'chromatography, pigments, plants',
  apparatus: 'chromatography_paper, capillary_tube, beaker_250, mortar_pestle, funnel, filter_paper, ruler, pencil, hair_dryer, test_tube',
  substances: 'spinach_leaves:5 g, propanone:20 cm3, sand:2 g, distilled_water:20 cm3',
  theory: 'Pigments partition between the non-polar solvent and the water in the paper, so they separate according to their solubility and adsorption; Rf values identify them.',
  safety: 'Goggles, lab coat and gloves; propanone is highly flammable and irritates the eyes|Grind the leaf in the fume hood and keep the solvent away from flames|Do not let the solvent run above the top of the paper',
  procedure: 'Grind the leaves with sand and propanone and filter the extract into a test tube|Draw a pencil line 2 cm from the bottom of the chromatography paper and spot the extract repeatedly, drying between spots|Stand the paper in the solvent in a covered beaker|When the solvent front is near the top, remove and mark it, then measure each pigment band|Calculate the Rf value for each pigment',
  observations: 'Four bands separate: orange-yellow carotene at the top, then yellow xanthophyll, then blue-green chlorophyll a and yellow-green chlorophyll b.',
  measurements: 'distance to the solvent front (mm)|distance to each pigment band (mm)|Rf values',
  variables: 'independent: the solvent used|dependent: Rf value and separation|control: same paper, same run length, same extract volume',
  expected: 'Rf values of about 0.95, 0.7, 0.5 and 0.45 for carotene, xanthophyll, chlorophyll a and chlorophyll b.',
  calculations: 'Rf = distance moved by the pigment / distance moved by the solvent|compare with the literature values|comment on the polarity of each pigment',
  questions: 'Why is propanone used rather than water?|Why is the spot dried between applications?|Why does carotene travel furthest?'
});

E('biology', 'as', 'Serial dilution and viable counts', 'Make a serial dilution and estimate the number of viable yeast cells by plating.', {
  duration: '90 min plus incubation', tags: 'microbiology, dilution, statistics',
  apparatus: 'petri_dish x5, test_tube x6, micropipette, inoculating_loop, bunsen_burner, incubator, marker_pen, glass_rod',
  substances: 'yeast_suspension:20 cm3, nutrient_agar:100 cm3, distilled_water:90 cm3',
  theory: 'A serial dilution reduces the cell concentration by a known factor so that plating gives countable colonies (30-300 per plate), from which the original concentration follows.',
  safety: 'Goggles and lab coat|Aseptic technique throughout: flame the loop and work near the Bunsen flame|Incubate below 30 °C and never open the plates afterwards|Wash hands',
  procedure: 'Make a ten-fold serial dilution of the yeast suspension through five tubes, mixing each thoroughly|Plate 0.1 cm3 from the last three dilutions onto separate agar plates and spread with a sterile spreader|Tape, label and invert the plates, then incubate at 25 °C for two days|Count the colonies on the plate with 30-300 colonies and calculate the original cell concentration',
  observations: 'The higher dilutions give fewer, well-separated colonies after two days.',
  measurements: 'number of colonies per plate|dilution factor|volume plated (cm3)|incubation temperature and time',
  variables: 'independent: the dilution factor|dependent: number of colonies|control: sterile water blank plate, same spreading technique and incubation',
  expected: 'Countable plates from the appropriate dilution giving a cell concentration of about 10^7 per cm3.',
  calculations: 'cells per cm3 = colonies / (volume plated x dilution)|mean of the replicate plates|standard deviation and 95 % confidence interval',
  questions: 'Why are counts between 30 and 300 used?|Why must the spreader be kept sterile?|Why is the plate counted only once?'
});

// ============================== A LEVEL BIOLOGY ==============================
E('biology', 'a', 'Effect of pH on enzyme activity', 'Determine the optimum pH of a protease and explain the shape of the curve.', {
  duration: '75 min', tags: 'enzymes, pH, optimum',
  apparatus: 'test_tube x6, test_tube_rack, water_bath, colorimeter, volumetric_flask_100 x5, pipette_25, ph_meter, stopwatch, measuring_cylinder_10',
  substances: 'casein_solution:100 cm3, protease_solution:20 cm3, ph_buffer_4:50 cm3, ph_buffer_7:50 cm3, ph_buffer_10:50 cm3',
  theory: 'pH affects the charges on the active site. Changing the pH away from the optimum denatures the enzyme and the rate falls sharply.',
  safety: 'Goggles and lab coat|Buffers irritate the eyes|Do not let the enzyme solution stand for long before use',
  procedure: 'Set up five buffers between pH 3 and pH 11 and add the same volume of casein to each|Bring the tubes to 37 °C in the water bath|Add the enzyme, mix and start the stopwatch|Measure the turbidity of a sample every two minutes with the colorimeter|Calculate the initial rate at each pH and plot rate against pH',
  observations: 'The reaction is fastest near pH 7-8; below pH 4 and above pH 10 the turbidity hardly changes.',
  measurements: 'pH of each tube|absorbance every two minutes|initial rate (change in absorbance per minute)|temperature (°C)',
  variables: 'independent: pH of the buffer|dependent: initial rate of the reaction|control: same enzyme and substrate concentrations, same temperature and volume',
  expected: 'A bell-shaped curve with a clear optimum around pH 7-8 and a sharp fall either side.',
  calculations: 'initial rate from the tangent|plot rate against pH|identify the optimum and the pH range where the enzyme works well',
  questions: 'Why does the rate fall either side of the optimum?|Why is the fall on the acid side steeper than on the alkaline side?|Why is the initial rate used?'
});

E('biology', 'a', 'Respiratory quotient of germinating seeds', 'Determine the respiratory quotient of germinating seeds using a respirometer.', {
  duration: '90 min', tags: 'respiration, RQ, respirometer',
  apparatus: 'respirometer, syringe_20, water_bath, thermometer, stopwatch, top_pan_balance, retort_stand, clamp',
  substances: 'germinating_peas:20 g, soda_lime:10 g, distilled_water:50 cm3, glucose_solution_1pct:20 cm3',
  theory: 'RQ = CO2 produced / O2 consumed. It is about 1 for carbohydrate, about 0.7 for lipid and greater than 1 during anaerobic respiration.',
  safety: 'Goggles and gloves|Soda lime is corrosive - handle with a spatula|Equalise the pressure before every reading',
  procedure: 'Measure the oxygen uptake over ten minutes with soda lime in the apparatus|Repeat without soda lime to measure the net volume change|From the two results find the carbon dioxide produced and calculate the RQ|Repeat with the seeds soaked in glucose solution and compare the values',
  observations: 'The dye moves in steadily with soda lime; without it the movement is much smaller because the carbon dioxide replaces the oxygen used.',
  measurements: 'volume change with soda lime (cm3)|volume change without soda lime (cm3)|mass of seeds (g)|time (min)|temperature (°C)',
  variables: 'independent: the substrate available|dependent: the respiratory quotient|control: same mass of seeds, sealed apparatus, equalised pressure, same temperature',
  expected: 'An RQ close to 1.0 with germinating seeds respiring carbohydrate.',
  calculations: 'O2 used = volume with soda lime|CO2 produced = O2 used - net volume change without soda lime|RQ = CO2/O2|comment on the substrate being respired',
  questions: 'Why is the pressure equalised before every reading?|What would an RQ of 0.7 suggest?|Why does anaerobic respiration give an RQ greater than 1?'
});

E('biology', 'a', 'Hill reaction with DCPIP', 'Use isolated chloroplasts and DCPIP to measure the rate of the light-dependent reaction.', {
  duration: '90 min', tags: 'photosynthesis, chloroplasts, redox, colorimeter',
  apparatus: 'centrifuge, mortar_pestle, funnel, filter_paper, beaker_250, colorimeter, test_tube x5, lamp, stopwatch, measuring_cylinder_10, ice_bath',
  substances: 'spinach_leaves:20 g, dcpip:10 cm3, sucrose_solution_1pct:100 cm3, distilled_water:200 cm3, buffer_solution_ph7_lib:50 cm3',
  theory: 'Chloroplasts reduce DCPIP (blue) to a colourless form in the light as electrons are passed down the electron transport chain; the rate of decolourisation measures the light-dependent stage.',
  safety: 'Goggles and lab coat|DCPIP stains and the centrifuge must be balanced|Keep the chloroplast suspension ice-cold until use|The lamp becomes hot',
  procedure: 'Grind the leaves in cold buffer with sand and filter the homogenate|Centrifuge to sediment the chloroplasts and resuspend them in cold sucrose solution|Add the same volume of DCPIP and chloroplast suspension to each tube|Place one tube in the dark and the others at different distances from the lamp|Record the absorbance every 30 s and calculate the initial rate at each light intensity',
  observations: 'The blue DCPIP fades fastest close to the lamp; the dark control stays blue.',
  measurements: 'absorbance every 30 s|distance from the lamp (cm)|light intensity (lux)|temperature (°C)',
  variables: 'independent: light intensity|dependent: initial rate of DCPIP reduction|control: dark tube, same chloroplast and DCPIP volume, same temperature',
  expected: 'The rate increases with light intensity and flattens at high intensity; the dark control shows no reaction.',
  calculations: 'initial rate = change in absorbance per minute|plot rate against light intensity|compare with the whole-plant pondweed results',
  questions: 'Why is the suspension kept cold?|Why is a dark control essential?|What does the DCPIP replace in the chloroplast?'
});

E('biology', 'a', 'Mitotic index in a root tip squash', 'Prepare a root tip squash and calculate the mitotic index.', {
  duration: '75 min', tags: 'mitosis, microscopy, cell cycle',
  apparatus: 'microscope, glass_slide, coverslip, forceps, scalpel, mounting_needle, water_bath, stopwatch, white_tile, dropping_bottle',
  substances: 'garlic_root_tip:3 pieces, orcein_stain:5 cm3, hcl_1m:10 cm3',
  theory: 'Cells in the zone of cell division are actively dividing, so the proportion of cells showing visible chromosomes (the mitotic index) is high there and zero in the elongation zone.',
  safety: 'Goggles and lab coat; acetic orcein stains and the acid is corrosive|Squash gently with the thumb, not with force, to avoid breaking the slide|Dispose of the acid carefully',
  procedure: 'Warm the root tips in 1 mol/dm3 hydrochloric acid at 60 °C for five minutes|Stain with acetic orcein for two minutes and place on a slide|Lower the coverslip and squash gently with the thumb, without lateral movement|Examine at 400x and count the cells in each stage of mitosis and those not dividing|Calculate the mitotic index for the root tip and for the elongation zone',
  observations: 'Many cells in the tip show condensed chromosomes or spindles; the older part of the root shows mostly interphase cells.',
  measurements: 'total number of cells counted|number of cells in each stage|mitotic index',
  variables: 'independent: the region of the root sampled|dependent: the mitotic index|control: same root, same stain time, same magnification',
  expected: 'A mitotic index of about 5-15 % in the root tip and close to zero in the older tissue.',
  calculations: 'mitotic index = cells with visible chromosomes / total cells x 100|chi-squared or standard deviation between fields of view|comment on the reliability of the counts',
  questions: 'Why is the acid treatment needed?|Why is the root tip used?|Why should at least 1000 cells be counted?'
});

E('biology', 'a', 'Diffusion and surface area to volume ratio', 'Investigate how the rate of diffusion into agar blocks depends on their size.', {
  duration: '60 min', tags: 'diffusion, surface area, modelling',
  apparatus: 'scalpel, white_tile, ruler, stopwatch, beaker_250, forceps, measuring_cylinder_100',
  substances: 'agar_blocks:1 batch, hydrochloric_acid_0_1m_lib:100 cm3, distilled_water:100 cm3',
  theory: 'The larger the surface-area-to-volume ratio, the faster the centre of an organism can be reached by diffusion; this is why large organisms need transport systems.',
  safety: 'Goggles and lab coat|Cut the agar on the tile away from your fingers|Dilute acid is an eye irritant - avoid splashing',
  procedure: 'Cut three cubes of agar with sides of 5, 10 and 15 mm and three blocks of the same volume but different shapes|Immerse them in acid and start the stopwatch|Remove and cut each block in half every two minutes to measure how far the colour has changed|Record the depth of penetration and the time and calculate the surface-area-to-volume ratio for each block',
  observations: 'The acid penetrates only a few millimetres in the same time whatever the size of the block.',
  measurements: 'dimensions of each block (mm)|depth of decolourisation (mm)|time (min)|surface area and volume (mm2, mm3)',
  variables: 'independent: the size (and therefore the surface-area-to-volume ratio) of the block|dependent: the depth of diffusion in a given time|control: same agar, acid concentration and temperature',
  expected: 'The depth of penetration is the same for all sizes while the percentage of the block affected falls as the size increases.',
  calculations: 'surface area and volume of each block|surface area to volume ratio|percentage of the block that has changed colour|comment on the implications for multicellular organisms',
  questions: 'Why does the centre of a large block never change colour?|How does this model explain the need for a circulatory system?|Why is the depth of penetration the same for all the blocks?'
});

E('biology', 'a', 'Transpiration and environmental factors', 'Use a potometer to measure the effect of wind speed on the rate of transpiration.', {
  duration: '75 min', tags: 'transpiration, potometer, plants',
  apparatus: 'potometer, stopwatch, fan, ruler, thermometer, lamp, retort_stand, clamp, cutting_board, scalpel, beaker_250',
  substances: 'leafy_shoot:1, distilled_water:200 cm3, vaseline:1 g',
  theory: 'Water lost by transpiration is replaced from the shoot, so the movement of the air bubble in the potometer measures the rate of uptake. Wind removes the boundary layer of water vapour and increases the gradient.',
  safety: 'Goggles and lab coat|Cut the stem under water to prevent air locks and take care with the scalpel|Keep the potometer airtight and do not let the fan touch the apparatus',
  procedure: 'Cut a leafy shoot under water and fit it to the potometer with vaseline to make it airtight|Introduce an air bubble by lifting the reservoir briefly|Record the distance moved by the bubble in one minute with the fan off, taking three readings|Repeat with the fan at increasing speeds and with the lamp on|Calculate the rate of water uptake and compare the treatments',
  observations: 'The bubble moves fastest with the fan on and slowest in still, humid air.',
  measurements: 'distance moved by the bubble (mm)|time (min)|air speed (arbitrary units)|temperature and light intensity',
  variables: 'independent: wind speed (and light intensity, humidity)|dependent: rate of water uptake|control: same shoot and apparatus, sealed joints, same starting bubble position, similar temperature',
  expected: 'The rate increases markedly with wind speed and then levels off as stomatal resistance becomes limiting.',
  calculations: 'rate = distance / time (mm/min)|percentage increase from still air|plot rate against wind speed and describe the shape',
  questions: 'Why is the shoot cut under water?|Why must the apparatus be airtight?|Why does the graph level off at high wind speeds?'
});

E('biology', 'a', 'Effect of antibiotics on microbial growth', 'Investigate how the concentration of an antibiotic affects the growth of a micro-organism.', {
  duration: '90 min plus incubation', tags: 'microbiology, antibiotics, inhibition',
  apparatus: 'petri_dish x3, inoculating_loop, bunsen_burner, incubator, marker_pen, ruler, glass_rod, forceps',
  substances: 'nutrient_agar:100 cm3, yeast_suspension:5 cm3, antibiotic_discs:9, disinfectant_solution:100 cm3',
  theory: 'An antibiotic diffuses from the disc into the agar; the size of the clear zone depends on how sensitive the micro-organism is and on the concentration of the antibiotic.',
  safety: 'Goggles and lab coat|Aseptic technique throughout and flame the loop and forceps|Incubate below 30 °C and never open the plates after incubation|Sterilise or autoclave the plates before disposal',
  procedure: 'Pour a lawn of the yeast suspension over the agar and remove the excess|Place three discs with different antibiotic concentrations on each plate using sterile forceps|Tape, label, invert and incubate at 25-30 °C for two days|Measure the diameter of the clear zone around each disc in two directions and take the mean',
  observations: 'Clear circular zones of inhibition appear around the discs; the zone is larger where the antibiotic concentration is higher.',
  measurements: 'diameter of the zone of inhibition (mm) in two directions|concentration of the antibiotic disc|incubation time and temperature',
  variables: 'independent: the antibiotic concentration|dependent: the diameter of the zone of inhibition|control: a disc soaked in water only, same agar and incubation conditions',
  expected: 'The zone diameter increases with antibiotic concentration in a roughly linear way over the range tested.',
  calculations: 'mean diameter of each zone|area of inhibition|plot diameter against concentration|comment on the reliability of a two-direction measurement',
  questions: 'Why is the zone circular?|Why does the disc soaked in water show no inhibition?|Why must the plates be sealed before disposal?'
});

// =========================== UNDERGRADUATE BIOLOGY ==========================
E('biology', 'ug', 'Enzyme kinetics: Km and Vmax', 'Determine Km and Vmax for an enzyme using a substrate concentration series and a linearised plot.', {
  duration: '120 min', tags: 'enzymes, michaelis-menten, kinetics, uncertainty',
  apparatus: 'colorimeter, test_tube x7, water_bath, pipette_25, measuring_cylinder_10, volumetric_flask_100 x5, stopwatch, ph_meter',
  substances: 'casein_solution:100 cm3, protease_solution:20 cm3, buffer_solution_ph7_lib:50 cm3, distilled_water:200 cm3',
  theory: 'The Michaelis-Menten equation v = Vmax[S]/(Km+[S]) can be linearised (for example by the Lineweaver-Burk, Hanes or Eadie-Hofstee form) and Km and Vmax found from the intercepts. The choice of plot affects the weighting of the errors.',
  safety: 'Goggles and lab coat|Keep the enzyme cool and use it quickly|Buffer solutions irritate the eyes',
  procedure: 'Prepare seven substrate concentrations spanning at least one order of magnitude around the expected Km|Equilibrate all the tubes at 37 °C and start the reaction by adding the enzyme|Follow the reaction colorimetrically and take the initial rate for each concentration|Plot the data in both linearised forms and determine Km and Vmax with their uncertainties|Compare the two analyses and comment on the error structure',
  observations: 'The rate rises steeply at low substrate concentration and forms a plateau at high concentration.',
  measurements: 'substrate concentration (mol/dm3)|initial rate (absorbance/min)|temperature and pH',
  variables: 'independent: substrate concentration|dependent: initial rate|control: enzyme concentration, pH, temperature, total volume',
  expected: 'Km and Vmax consistent between the two linearisations within about 10 %.',
  calculations: 'initial rates from the tangents|reciprocal plot: 1/v against 1/[S] gives 1/Vmax and -1/Km|Hanes plot: [S]/v against [S]|uncertainty from the confidence limits of the fit|compare Km with the literature value',
  questions: 'Why do different linearisations give slightly different answers?|Why must the initial rates be measured with the same enzyme concentration?|Why is the initial rate proportional to enzyme concentration?'
});

E('biology', 'ug', 'Protein assay with a calibration curve', 'Determine the protein concentration of an unknown sample by colorimetry and quantify the uncertainty.', {
  duration: '120 min', tags: 'colorimetry, protein assay, calibration, uncertainty',
  apparatus: 'colorimeter, volumetric_flask_100 x6, pipette_25, test_tube x7, water_bath, top_pan_balance, stopwatch',
  substances: 'biuret_reagent:50 cm3, egg_albumen:5 cm3, distilled_water:500 cm3, protein_standard:5 g',
  theory: 'The biuret reaction gives a colour whose absorbance is proportional to protein concentration, so a calibration curve converts absorbance into concentration. The uncertainty of the unknown comes from the fit and from the dilution.',
  safety: 'Goggles, lab coat and gloves|Biuret reagent is alkaline and contains copper(II) - avoid skin contact|Do not pipette by mouth',
  procedure: 'Prepare a blank and five protein standards from the stock standard solution|Add the same volume of biuret reagent to each tube, mix and leave for the specified time|Measure the absorbance of each standard and plot the calibration curve|Dilute the unknown so it falls within the range, measure its absorbance in triplicate|Read the concentration from the line of best fit and combine the uncertainties',
  observations: 'A stable purple colour develops and the standard curve is linear over the chosen range.',
  measurements: 'absorbance of each standard and of the unknown (three repeats)|masses and volumes used|dilution factor',
  variables: 'independent: protein concentration|dependent: absorbance|control: same reagent volume, same incubation time and temperature',
  expected: 'A linear calibration curve with the unknown concentration determined to within about 5 %.',
  calculations: 'plot absorbance against concentration and fit a line|concentration of the diluted unknown|correct for the dilution|combined uncertainty from the fit, the dilution and the replicate absorbances',
  questions: 'Why must the unknown absorbance fall inside the calibration range?|Which source of uncertainty dominates the final result?|Why is a blank essential?'
});

E('biology', 'ug', 'Viable counts and statistical treatment', 'Estimate a viable cell population and express the result with a confidence interval.', {
  duration: '150 min plus incubation', tags: 'microbiology, statistics, uncertainty',
  apparatus: 'petri_dish x10, test_tube x7, micropipette, spreader, bunsen_burner, incubator, marker_pen, counting_aid',
  substances: 'yeast_suspension:20 cm3, nutrient_agar:200 cm3, distilled_water:90 cm3',
  theory: 'Plate counts follow a Poisson distribution, so the standard deviation of a count of n colonies is roughly √n. Reports should state a mean with a confidence interval and consider the plating efficiency.',
  safety: 'Goggles and lab coat|Aseptic technique throughout|Incubate below 30 °C and do not open the plates afterwards|Autoclave before disposal',
  procedure: 'Prepare a ten-fold dilution series and plate three replicates at each of three dilutions|Incubate at 25 °C for two days and count the colonies on every plate|Select the plates with 30-300 colonies and calculate the concentration for each|Compute the mean, standard deviation and 95 % confidence interval|Comment on the sources of error, including pipetting and spreading',
  observations: 'Replicate plates agree to within about 20 % of each other.',
  measurements: 'colony counts for each plate|dilution factors|volume plated (cm3)',
  variables: 'independent: the dilution plated|dependent: viable count per cm3|control: sterile blank plate, same incubation conditions',
  expected: 'A viable count with a confidence interval of about ±10 % of the mean.',
  calculations: 'concentration = count / (volume x dilution)|mean, standard deviation and standard error|95 % confidence interval = mean ± 1.96 x SE|propagate the pipetting uncertainty',
  questions: 'Why does the standard deviation of a count follow √n?|Why must at least three replicates be plated?|Why is a viable count always an underestimate?'
});

E('biology', 'ug', 'Photosynthesis irradiance response curve', 'Record a photosynthesis-light response curve with a data logger and derive the initial slope and saturation point.', {
  duration: '120 min', tags: 'photosynthesis, irradiance, data logging',
  apparatus: 'datalogger, light_sensor, boiling_tube, beaker_600, lamp, ruler, gas_syringe, water_bath, thermometer',
  substances: 'pondweed:2 strands, distilled_water:600 cm3, sodium_hydrogencarbonate_lib:10 g',
  theory: 'The initial slope of the photosynthesis-irradiance curve is the quantum efficiency at the limit of light, and the curve saturates when another factor becomes limiting; photoinhibition can reduce the rate at very high irradiance.',
  safety: 'Goggles and lab coat|The lamp becomes very hot; keep it away from water|Check the electrical connections for water',
  procedure: 'Set up the pondweed in hydrogencarbonate solution at a controlled temperature with a light sensor beside it|Increase the light intensity stepwise by moving the lamp and log the oxygen production or the bubble rate for each intensity|Hold each intensity for two minutes before recording to allow acclimatisation|Plot the rate against irradiance and identify the initial slope, the saturation point and any photoinhibition',
  observations: 'The rate rises linearly at low irradiance, curves over and becomes constant; at very high intensity the rate may fall slightly.',
  measurements: 'irradiance (lux) and rate (bubbles/min or cm3/min)|temperature (°C)|time (s)',
  variables: 'independent: irradiance|dependent: rate of oxygen production|control: same pondweed and CO2 concentration, controlled temperature',
  expected: 'A classic saturating curve with the initial slope proportional to quantum yield and saturation at moderate irradiance.',
  calculations: 'initial slope = Δrate/Δirradiance|saturation irradiance|compare the curves at two temperatures|comment on the limiting factors in each region',
  questions: 'Which factor limits the rate in the linear region and which in the plateau?|Why must the temperature be controlled?|Why is measured oxygen production a net, not gross, rate?'
});
