import { E } from './schema.js';

// =============================== IGCSE PHYSICS ===============================
E('physics', 'igcse', 'Density of a regular solid', 'Measure the density of a rectangular block from its mass and dimensions.', {
  duration: '30 min', tags: 'density, measurement, uncertainty',
  apparatus: 'top_pan_balance, ruler, vernier_caliper',
  substances: '',
  theory: 'Density = mass / volume. Volume is measured from dimensions, so the density uncertainty combines the mass and length uncertainties.',
  safety: 'Normal laboratory care; keep the balance level and on a firm bench',
  procedure: 'Measure the mass of the block on the top-pan balance|Measure its length, width and height three times with the ruler and once with the callipers|Calculate the mean volume in cm3|Calculate the density in g/cm3 and comment on the precision of each instrument',
  observations: 'The callipers give more consistent readings than the ruler.',
  measurements: 'mass (g)|length, width, height (mm)|volume (cm3)',
  variables: 'independent: the measuring instrument used|dependent: calculated density|control: same block, same balance',
  expected: 'A density consistent with the material, with a smaller uncertainty from the callipers.',
  calculations: 'volume = l x w x h|density = m / V|percentage uncertainty = mass % + 3 x length %',
  questions: 'Which instrument limits the precision of the result?|Why is a solid metal block better than a sponge for this experiment?'
});

E('physics', 'igcse', 'Density of an irregular solid', 'Find the density of an irregular object using the displacement method.', {
  duration: '25 min', tags: 'density, displacement, volume',
  apparatus: 'measuring_cylinder_100, measuring_cylinder_50, top_pan_balance, beaker_250, string',
  substances: 'distilled_water:200 cm3',
  theory: 'The volume of an irregular solid equals the volume of water it displaces.',
  safety: 'Goggles; lower the object in slowly so water does not splash out|Dry the object before weighing',
  procedure: 'Weigh the object|Put 50 cm3 of water in the measuring cylinder and read the volume at eye level|Lower the object in on a string until it is fully covered and read the new volume|Repeat three times and calculate the mean density',
  observations: 'The water level rises by the volume of the object; air bubbles must be tapped off.',
  measurements: 'mass (g)|initial and final water volumes (cm3)',
  variables: 'independent: the object tested|dependent: volume displaced and density|control: same cylinder and initial volume',
  expected: 'A density close to the accepted value for the metal, within about 5 %.',
  calculations: 'volume = final - initial|density = mass / volume|percentage difference from the data-book value',
  questions: 'Why must the object be fully covered with no air bubbles?|Why is a 50 cm3 cylinder better than a 100 cm3 one for a small object?'
});

E('physics', 'igcse', 'Speed and acceleration with light gates', 'Measure the speed of a dynamics trolley with light gates and calculate its acceleration on a ramp.', {
  duration: '40 min', tags: 'mechanics, speed, acceleration, light gates',
  apparatus: 'ramp, dynamics_trolley, light_gate x2, ruler, stopwatch',
  substances: '',
  theory: 'A light gate times the interruption of a beam, so speed = length of card / time. Acceleration = (v - u)/t.',
  safety: 'Keep the trolley on the track and the track clamps tight|Catch the trolley at the bottom of the ramp',
  procedure: 'Set the ramp at a small angle and fix two light gates a measured distance apart|Attach a card of known length to the trolley and measure its length|Release the trolley from rest and record both times|Repeat three times and calculate the speeds and the acceleration',
  observations: 'The trolley speeds up down the ramp and the second gate time is shorter.',
  measurements: 'card length (mm)|time through each gate (s)|distance between the gates (mm)',
  variables: 'independent: the height of the ramp|dependent: acceleration|control: same trolley, same card, same gate spacing',
  expected: 'An acceleration of the order of 0.1-1 m/s2 that increases with ramp height.',
  calculations: 'v = length / time|a = (v - u) / t|percentage difference between the two gates|uncertainty in a',
  questions: 'Why do you need the card length?|Why is the average speed through a gate not exactly the instantaneous speed?'
});

E('physics', 'igcse', 'Hooke\'s law: force and extension', 'Investigate how the extension of a spring depends on the load applied.', {
  duration: '35 min', tags: 'mechanics, hooke, spring constant',
  apparatus: 'retort_stand, clamp, boss_head, spring, mass_set, ruler, newton_meter',
  substances: '',
  theory: 'For a spring within its elastic limit, F = kx: the extension is proportional to the load.',
  safety: 'Clamp the stand to the bench and put a cushion below the masses in case they fall|Do not exceed the elastic limit of the spring',
  procedure: 'Hang the spring from the clamp and record the unstretched position with the ruler|Add masses one at a time, recording the new position and the total weight|Repeat for six loads and then unload one at a time to check for elastic behaviour|Plot a graph of extension against load',
  observations: 'The extension is proportional to load over the straight section; beyond the limit the graph curves and the spring does not return to its original length.',
  measurements: 'load (N)|position (mm)|extension (mm)',
  variables: 'independent: load applied|dependent: extension of the spring|control: same spring and ruler, same zero position',
  expected: 'A straight line through the origin with gradient 1/k; k about 20 N/m for the school spring.',
  calculations: 'extension = position - initial position|weight = mass x 9.81|k = gradient of the linear section|estimate the elastic limit',
  questions: 'Why does the graph curve at large loads?|Why is a safety cushion needed?'
});

E('physics', 'igcse', 'Moments and balance', 'Investigate the principle of moments with a beam and slotted masses.', {
  duration: '35 min', tags: 'mechanics, moments, equilibrium',
  apparatus: 'metre_rule_pivot, mass_set, ruler, retort_stand',
  substances: '',
  theory: 'For a body in equilibrium, the sum of clockwise moments equals the sum of anticlockwise moments about any point.',
  safety: 'Clamp the pivot so the rule cannot fall|Keep feet clear of the falling masses',
  procedure: 'Balance the metre rule on the pivot and record the position of the centre of gravity|Hang a 100 g mass 20 cm from the pivot on the left|Move a 200 g mass on the right until the rule balances and record the distance|Repeat with different masses and distances, checking the moment equation each time',
  observations: 'The rule balances when the moments are equal; the heavier mass sits closer to the pivot.',
  measurements: 'masses (g)|distances from the pivot (mm)|moment (N m)',
  variables: 'independent: mass and position of the load|dependent: balancing position|control: same rule and pivot',
  expected: 'The moments balance within the reading uncertainty of about 2 %.',
  calculations: 'moment = force x perpendicular distance|clockwise = anticlockwise|find the mass of the rule from its own moment',
  questions: 'Why must distances be measured from the pivot?|How could you find the mass of the rule itself?'
});

E('physics', 'igcse', 'Ohm\'s law for a fixed resistor', 'Investigate the relationship between current and potential difference for a fixed resistor.', {
  duration: '40 min', tags: 'electricity, ohm, resistance',
  apparatus: 'power_supply, resistor_100, ammeter, voltmeter, wire_red x2, wire_black x2, crocodile_clip x4',
  substances: '',
  theory: 'For an ohmic conductor V = IR, so a graph of current against voltage is a straight line through the origin whose gradient is 1/R.',
  safety: 'Keep the voltage low so the resistor does not overheat|Check the meter polarity before switching on|Switch off between readings',
  procedure: 'Connect the resistor in series with the ammeter and the power supply|Connect the voltmeter in parallel with the resistor|Increase the voltage in 0.5 V steps, recording both readings|Plot current against voltage and find the gradient',
  observations: 'Current rises in proportion to voltage; the resistor stays cool at these currents.',
  measurements: 'voltage (V)|current (A) at each setting',
  variables: 'independent: potential difference across the resistor|dependent: current|control: same resistor, temperature, connection',
  expected: 'A straight line through the origin giving R close to 100 ohm.',
  calculations: 'R = V / I for each pair|gradient = 1/R|percentage difference from the marked value',
  questions: 'Why must the ammeter be in series and the voltmeter in parallel?|Why does the gradient give 1/R rather than R?'
});

E('physics', 'igcse', 'Series and parallel circuits', 'Compare current and voltage in series and parallel circuits.', {
  duration: '40 min', tags: 'electricity, circuits, kirchhoff',
  apparatus: 'power_supply, resistor_100, resistor_220, ammeter, voltmeter, wire_red x4, wire_black x4, crocodile_clip x6',
  substances: '',
  theory: 'In series the current is the same everywhere and the voltages add; in parallel the voltage is the same across each branch and the currents add.',
  safety: 'Keep the supply at or below 6 V|Check the circuit before switching on and disconnect between measurements',
  procedure: 'Build a series circuit with two resistors and measure the current at three points and the voltage across each resistor|Rebuild as a parallel circuit and repeat|Record the readings in a table|Compare the sums with the source values',
  observations: 'Series: identical currents, voltages adding to the supply p.d. Parallel: branch currents adding to the supply current.',
  measurements: 'current at each point (A)|voltage across each component (V)|supply voltage (V)',
  variables: 'independent: circuit arrangement (series or parallel)|dependent: currents and voltages|control: same resistors and supply voltage',
  expected: 'Readings agree with the conservation of charge and energy within 5 %.',
  calculations: 'series R = R1 + R2|parallel 1/R = 1/R1 + 1/R2|compare the measured total resistance with the calculated value',
  questions: 'Why is the current the same at all points in a series circuit?|Why is the total resistance in parallel less than the smallest resistor?'
});

E('physics', 'igcse', 'I-V characteristics of a lamp and a diode', 'Compare the current-voltage graphs for a resistor, a lamp and a diode.', {
  duration: '45 min', tags: 'electricity, non-ohmic, iv graph',
  apparatus: 'power_supply, lamp_6v, diode, resistor_220, ammeter_digital, voltmeter_digital, wire_red x4, crocodile_clip x6, potentiometer_kit',
  substances: '',
  theory: 'A lamp is non-ohmic: as it heats up its resistance increases, so the graph curves. A diode conducts in one direction only.',
  safety: 'Do not exceed the lamp rating|Reverse the connections carefully, switching off each time|The lamp gets hot',
  procedure: 'Connect the lamp with an ammeter in series and a voltmeter in parallel|Increase the voltage in steps up to the rating and record I and V|Reverse the supply and repeat for negative values|Repeat the whole procedure with the diode and plot both graphs',
  observations: 'The lamp graph is an S-shaped curve; the diode conducts only above about 0.7 V in the forward direction.',
  measurements: 'voltage (V) and current (A) for positive and negative values|temperature of the lamp (touch test)',
  variables: 'independent: voltage across the component|dependent: current|control: same component and connections',
  expected: 'The resistor is a straight line, the lamp curves, and the diode blocks current when reversed.',
  calculations: 'R = V/I at several points to show the change for the lamp|identify the threshold voltage of the diode',
  questions: 'Why does the lamp resistance change?|Why is the diode described as a one-way valve?'
});

E('physics', 'igcse', 'Magnetic field of a bar magnet', 'Plot the magnetic field around a bar magnet using a plotting compass.', {
  duration: '35 min', tags: 'magnetism, field lines',
  apparatus: 'magnet, plotting_compass x1, paper, pencil, iron_core',
  substances: 'iron_filings:few grams',
  theory: 'A plotting compass aligns with the field, so following it maps the field lines from north to south pole.',
  safety: 'Keep magnets away from watches, phones and computer disks|Do not drop the magnets - they are brittle',
  procedure: 'Place the magnet under a sheet of paper and mark its poles|Put the compass near the north pole and mark the direction it points|Move the compass to the mark and repeat to trace a full field line|Repeat for several starting points, then sprinkle iron filings and compare the patterns',
  observations: 'Field lines curve from the north to the south pole and are closest together near the poles.',
  measurements: 'field line shapes (qualitative)|(extension) field strength in mT with a probe',
  variables: 'independent: starting position of the compass|dependent: direction of the field|control: same magnet and paper',
  expected: 'A symmetrical pattern of lines with the arrows pointing from N to S outside the magnet.',
  calculations: 'not applicable; describe the pattern and the direction convention',
  questions: 'Why do the lines never cross?|How would two magnets facing north to north change the pattern?'
});

E('physics', 'igcse', 'Strength of an electromagnet', 'Investigate how the current and the number of turns affect the strength of an electromagnet.', {
  duration: '35 min', tags: 'electromagnetism, coil, current',
  apparatus: 'coil, iron_core, power_supply, ammeter, wire_red x2, paper_clips, rheostat',
  substances: 'paper_clips_substance:20',
  theory: 'The magnetic field of a solenoid increases with the current and with the number of turns per metre. An iron core concentrates the field.',
  safety: 'The coil may get warm - switch off between readings|Do not exceed 2 A|Keep magnetic media away',
  procedure: 'Wind 20 turns on the iron core and connect the coil in series with the ammeter and rheostat|Set the current to 0.5 A and count how many paper clips are lifted|Repeat at 1.0 and 1.5 A|Repeat the whole set with 40 turns and compare',
  observations: 'More clips are lifted at higher current and with more turns; the iron core makes a large difference.',
  measurements: 'current (A)|number of paper clips lifted|number of turns',
  variables: 'independent: current and number of turns|dependent: number of clips lifted|control: same core, same clips, same coil length',
  expected: 'The number of clips rises steadily with current and roughly doubles when the turns double.',
  calculations: 'plot clips against current|compare the two turn numbers|comment on the effect of the iron core',
  questions: 'Why does the iron core strengthen the magnet?|Why must the coil not get hot?'
});

E('physics', 'igcse', 'Reflection in a plane mirror', 'Investigate the reflection of light at a plane mirror and check the law of reflection.', {
  duration: '30 min', tags: 'optics, reflection',
  apparatus: 'ray_box, mirror_plane, protractor, paper, ruler, screen',
  substances: '',
  theory: 'The angle of incidence equals the angle of reflection, both measured from the normal to the mirror surface.',
  safety: 'Never look directly into the ray box or the reflected beam|Keep the bench dark to see the rays clearly',
  procedure: 'Draw a line for the mirror and a normal at the point of incidence on the paper|Direct a single ray at the mirror and mark the incident and reflected rays|Measure both angles from the normal with the protractor|Repeat for five different angles of incidence and tabulate the results',
  observations: 'The reflected ray is always on the other side of the normal and the two angles are equal.',
  measurements: 'angle of incidence (°)|angle of reflection (°)',
  variables: 'independent: angle of incidence|dependent: angle of reflection|control: same mirror position and ray width',
  expected: 'The two angles agree within about 2°, the experimental uncertainty of the protractor.',
  calculations: 'tabulate i and r|calculate the mean difference|plot r against i to show a straight line of gradient 1',
  questions: 'Why are the angles measured from the normal and not from the mirror surface?|What does a gradient of exactly 1 prove?'
});

E('physics', 'igcse', 'Refraction through a glass block', 'Measure how light bends when it passes through a rectangular glass block.', {
  duration: '40 min', tags: 'optics, refraction, snell',
  apparatus: 'ray_box, glass_block, protractor, paper, ruler, pins',
  substances: '',
  theory: 'Light slows in glass, so it bends towards the normal on entering and away on leaving. n = sin i / sin r.',
  safety: 'Do not look into the beam|Handle the block carefully - chipped edges scatter the light',
  procedure: 'Draw the outline of the block and a normal at one face|Direct a ray at the face at 30° to the normal and mark the emergent ray with pins|Remove the block and join the marks to find the refracted ray inside|Measure r and repeat for five angles|Plot sin i against sin r and find the gradient',
  observations: 'The ray bends towards the normal on entry and away on exit; the emergent ray is parallel to the incident ray.',
  measurements: 'angle of incidence i (°)|angle of refraction r (°)',
  variables: 'independent: angle of incidence|dependent: angle of refraction|control: same block, same wavelength of light',
  expected: 'n is close to 1.5 for the school glass block, with a straight-line graph through the origin.',
  calculations: 'n = sin i / sin r for each pair|gradient of the sin i against sin r graph = n|percentage error against 1.5',
  questions: 'Why is the emergent ray parallel to the incident ray?|Why is the graph a straight line only for angles below 80°?'
});

E('physics', 'igcse', 'Speed of sound with a resonance tube', 'Measure the speed of sound in air using a resonance tube and a tuning fork.', {
  duration: '40 min', tags: 'waves, sound, resonance',
  apparatus: 'resonance_tube, tuning_fork, ruler, water_bath',
  substances: 'distilled_water:800 cm3',
  theory: 'At the first resonance the tube length plus the end correction is a quarter of a wavelength, so the speed is c = f x 4L.',
  safety: 'Strike the tuning fork on the rubber bung, not the bench|Keep water away from the electrical apparatus',
  procedure: 'Fill the tube with water and lower the level slowly while holding the vibrating tuning fork over the top|Mark the water level where the sound is loudest (first resonance)|Repeat three times and take the mean length|Repeat with a second tuning fork of a different frequency and calculate the speed for each',
  observations: 'A clear increase in loudness at the resonance positions; a second louder position occurs at about three times the length.',
  measurements: 'frequency of each tuning fork (Hz)|resonance length (mm)|temperature (°C)',
  variables: 'independent: frequency of the tuning fork|dependent: resonance length|control: same tube, same temperature',
  expected: 'A speed of about 340 m/s at room temperature.',
  calculations: 'wavelength = 4 x length (+ end correction)|c = f x wavelength|mean speed and percentage error',
  questions: 'Why is the end correction needed?|How would a higher room temperature affect the result?'
});

E('physics', 'igcse', 'Cooling and insulation', 'Compare how quickly hot water cools in insulated and uninsulated containers.', {
  duration: '45 min', tags: 'thermal, cooling, insulation',
  apparatus: 'beaker_250 x2, thermometer_precise x2, stopwatch, lagging_material, measuring_cylinder_100, kettle_area',
  substances: 'distilled_water:300 cm3',
  theory: 'The rate of cooling depends on the exposed surface area and on how well the container is insulated - Newton\'s law of cooling.',
  safety: 'Goggles; hot water can scald|Use tongs or a cloth to move the beakers',
  procedure: 'Pour 150 cm3 of hot water into each beaker and record the starting temperature|Wrap one beaker in lagging and leave the other bare|Record both temperatures every minute for 15 minutes|Plot both cooling curves on the same axes',
  observations: 'The lagged beaker cools much more slowly; both curves flatten as they approach room temperature.',
  measurements: 'temperature every minute (°C)|time (min)|room temperature (°C)',
  variables: 'independent: presence of insulation|dependent: rate of cooling|control: same water volume and starting temperature, same room',
  expected: 'The lagged beaker stays hot for much longer; the initial cooling rate is steeper for both.',
  calculations: 'cooling rate = temperature drop / time|compare the two initial rates|comment on the shape of the curves',
  questions: 'Why does the cooling rate decrease with time?|Why is the initial part of the curve the best place to compare rates?'
});

// =============================== AS LEVEL PHYSICS ============================
E('physics', 'as', 'Acceleration on a ramp', 'Determine the acceleration of a trolley down a ramp from a velocity-time graph.', {
  duration: '45 min', tags: 'mechanics, acceleration, graphs',
  apparatus: 'ramp, dynamics_trolley, light_gate x2, ruler, stopwatch, mass_set',
  substances: '',
  theory: 'With constant acceleration the velocity-time graph is a straight line and the gradient is the acceleration.',
  safety: 'Clamp the ramp firmly and catch the trolley|Keep the ramp clear of obstructions',
  procedure: 'Measure the length of the card on the trolley|Fix the gates at known distances apart and set the ramp at a fixed height|Release the trolley from rest and record the time through each gate|Repeat for five different ramp heights|Plot a velocity-time graph and take the gradient',
  observations: 'The trolley accelerates uniformly; a steeper ramp gives a longer gradient.',
  measurements: 'card length (mm)|times through each gate (s)|distance (mm)|ramp height (mm)',
  variables: 'independent: ramp height|dependent: acceleration|control: same trolley and card, same gate spacing',
  expected: 'a increases linearly with ramp height, with a = g sin θ for an ideal frictionless ramp.',
  calculations: 'v = length / time|a = (v2 - v1)/t|compare with g sin θ|percentage uncertainty in a',
  questions: 'Why is the measured acceleration less than g sin θ?|Why is the card length needed?'
});

E('physics', 'as', 'Newton\'s second law', 'Investigate the relationship between force, mass and acceleration using a trolley and falling masses.', {
  duration: '50 min', tags: 'mechanics, newton, force',
  apparatus: 'ramp, dynamics_trolley, light_gate, pulley, mass_set, string, top_pan_balance, stopwatch',
  substances: '',
  theory: 'F = ma. The accelerating force is the weight of the falling masses and the mass accelerated includes the trolley, so a = mg/(M+m).',
  safety: 'Cushion the place where the masses land|Clamp the pulley and keep fingers clear of the string',
  procedure: 'Weigh the trolley and the masses used to accelerate it|Set the string over the pulley with the falling mass just off the floor|Release and time the trolley over a measured distance, repeating three times|Vary the falling mass and record the acceleration each time|Plot acceleration against the accelerating force and against 1/total mass',
  observations: 'Acceleration increases with the falling mass and decreases when extra mass is added to the trolley.',
  measurements: 'falling mass (g)|trolley mass (g)|time (s)|distance (mm)',
  variables: 'independent: the accelerating force (or the total mass)|dependent: acceleration|control: same trolley, same distance, same friction/compensation',
  expected: 'A straight line through the origin for a against F and for a against 1/m, with F = ma satisfied.',
  calculations: 'a = 2s/t2 (from rest)|plot a against F|plot a against 1/m|compare the gradients with the mass and the force',
  questions: 'Why must the ramp be compensated for friction?|Why is the tension not exactly equal to the weight of the falling masses?'
});

E('physics', 'as', 'EMF and internal resistance', 'Determine the e.m.f. and internal resistance of a cell from a graph of terminal p.d. against current.', {
  duration: '45 min', tags: 'electricity, emf, internal resistance',
  apparatus: 'cell_1_5v, rheostat, ammeter, voltmeter, wire_red x2, crocodile_clip x4',
  substances: '',
  theory: 'V = E - Ir, so a graph of terminal p.d. against current has intercept E and gradient -r.',
  safety: 'Keep the current small and the cell cool|Switch off between readings to avoid draining the cell',
  procedure: 'Connect the cell, rheostat and ammeter in series with the voltmeter across the cell|For six rheostat settings record the current and terminal p.d.|Plot terminal p.d. against current|Read the intercept and gradient to find E and r',
  observations: 'The terminal p.d. falls as the current increases; the cell warms slightly at the highest current.',
  measurements: 'current (A)|terminal p.d. (V) for each setting',
  variables: 'independent: the resistance of the rheostat|dependent: terminal p.d.|control: same cell and temperature',
  expected: 'E close to 1.5 V and r of the order of 0.5 ohm.',
  calculations: 'gradient = -r|intercept = E|percentage error|uncertainty in r from the maximum and minimum gradients',
  questions: 'Why does the terminal p.d. fall as the current rises?|Why should readings be taken quickly?'
});

E('physics', 'as', 'Potential divider', 'Investigate how the output voltage of a potential divider depends on the resistors.', {
  duration: '40 min', tags: 'electricity, potential divider',
  apparatus: 'power_supply, resistor_220, resistor_470, rheostat, voltmeter, wire_red x2, crocodile_clip x4',
  substances: '',
  theory: 'Vout = Vin x R2/(R1+R2). A variable resistor makes an adjustable supply.',
  safety: 'Keep the supply at 6 V or below and check the wiring before switching on',
  procedure: 'Build a potential divider with a fixed and a variable resistor|Measure the output voltage across the variable resistor for six settings|Compare with the predicted values|Replace the fixed resistor with one of a different value and repeat',
  observations: 'The output voltage varies from 0 V to the supply voltage as the rheostat changes.',
  measurements: 'output voltage (V)|resistance settings (ohm)|supply voltage (V)',
  variables: 'independent: the resistance of the rheostat|dependent: output voltage|control: supply voltage, same components',
  expected: 'The measured voltages follow the potential divider equation within about 5 %.',
  calculations: 'Vout = Vin R2/(R1+R2)|plot Vout against R2|comment on the loading of the voltmeter',
  questions: 'Why does a voltmeter of finite resistance slightly reduce the output voltage?|Where is a potential divider used in a real circuit?'
});

E('physics', 'as', 'Specific heat capacity by electrical heating', 'Measure the specific heat capacity of water using an immersion heater.', {
  duration: '50 min', tags: 'thermal, specific heat capacity, energy',
  apparatus: 'beaker_250, immersed_heater, power_supply, ammeter_digital, voltmeter_digital, thermometer_precise, top_pan_balance, stopwatch, lagging_material',
  substances: 'distilled_water:200 cm3',
  theory: 'Electrical energy IVt is transferred to the water, so c = IVt / (m ΔT). Heat losses make the experimental value high.',
  safety: 'The heater becomes very hot - switch off before removing it|Keep water away from the electrical connections|Do not let the heater boil dry',
  procedure: 'Weigh the empty beaker, add water and reweigh to find the mass of water|Record the starting temperature and switch on the heater, starting the stopwatch|Record the current and voltage, and the temperature every 30 s|Switch off at about 40 °C and plot a graph of temperature against time; extrapolate to correct for cooling|Calculate the specific heat capacity',
  observations: 'The temperature rises steadily, most quickly while the water is cool.',
  measurements: 'mass of water (g)|current (A)|voltage (V)|time (s)|temperature rise (°C)',
  variables: 'independent: the heating time|dependent: temperature rise|control: same heater, same mass of water, lagged beaker',
  expected: 'A value within about 10 % of 4180 J/kg/K, usually high because of heat losses.',
  calculations: 'energy = I V t|c = IVt / (m ΔT)|cooling correction from the gradient after switching off|percentage error',
  questions: 'Why is the experimental value usually too high?|Why is the beaker lagged?|Why must the mass of water include the beaker in a more careful analysis?'
});

E('physics', 'as', 'Latent heat of fusion of ice', 'Measure the specific latent heat of fusion of ice.', {
  duration: '45 min', tags: 'thermal, latent heat, ice',
  apparatus: 'beaker_250, funnel, ice_bath, thermometer_precise, top_pan_balance, stopwatch, measuring_cylinder_100',
  substances: 'ice:100 g, distilled_water:200 cm3',
  theory: 'Melting ice absorbs energy without changing temperature, so L = energy / mass melted. The energy comes from the water and from the surroundings.',
  safety: 'Handle ice with care and wipe up meltwater immediately|The ice bath must be at 0 °C before use',
  procedure: 'Crush the ice and leave it in the funnel to drain until the meltwater is at 0 °C|Weigh the empty dry beaker|Collect the meltwater for a measured time and weigh the beaker again|Compare the two methods - weighing the meltwater and measuring the temperature change of warm water - and identify which is more reliable',
  observations: 'Meltwater drips steadily from the funnel at a constant rate once the ice is well drained.',
  measurements: 'mass of meltwater (g)|time (s)|temperature of the water bath (°C)',
  variables: 'independent: the method used|dependent: the value of L|control: same ice, same drainage time',
  expected: 'L is close to 334 kJ/kg but higher than the accepted value because of heat from the surroundings.',
  calculations: 'L = energy / mass|energy = m c ΔT for the water method|percentage error|estimate the rate of heat leakage',
  questions: 'Why must the ice be dried and drained first?|Why is the accepted value lower than the experimental one?'
});

E('physics', 'as', 'Refractive index and total internal reflection', 'Determine the refractive index of a prism and find its critical angle.', {
  duration: '45 min', tags: 'optics, refraction, critical angle',
  apparatus: 'ray_box, prism, protractor, paper, ruler, screen',
  substances: '',
  theory: 'At the critical angle C, sin C = 1/n, and total internal reflection occurs beyond it - the basis of optical fibres.',
  safety: 'Do not look into the ray box|Handle the glass prism carefully',
  procedure: 'Trace the prism outline and direct a ray at one face as in the block experiment|Measure i and r and calculate n for five angles|Direct the ray at the inside of a face and increase the angle until the ray no longer emerges|Record the critical angle and calculate n from sin C = 1/n',
  observations: 'Below the critical angle light refracts out of the glass; beyond it the ray reflects entirely inside.',
  measurements: 'angles of incidence and refraction (°)|critical angle (°)',
  variables: 'independent: angle of incidence|dependent: angle of refraction or refraction/reflection behaviour|control: same prism, same wavelength',
  expected: 'n about 1.5 and C about 42°, consistent between the two methods.',
  calculations: 'n = sin i / sin r|C = sin^-1(1/n)|compare the two values of n',
  questions: 'Why does total internal reflection only happen going from glass to air?|How does this explain how an optical fibre works?'
});

E('physics', 'as', 'Thermistor characteristics', 'Investigate how the resistance of a thermistor changes with temperature.', {
  duration: '45 min', tags: 'electricity, thermistor, temperature',
  apparatus: 'thermistor, water_bath, beaker_250, ohmmeter, thermometer_precise, hot_plate, ice_bath, wire_red x2',
  substances: 'distilled_water:300 cm3',
  theory: 'A thermistor is a semiconductor: more charge carriers are released as it warms, so its resistance falls - it is therefore useful in temperature sensing.',
  safety: 'The water bath gets hot - use tongs|Keep the electrical connections dry',
  procedure: 'Connect the thermistor to the ohmmeter and immerse it in the water bath|Record the resistance from 0 °C to 90 °C in 10 °C steps, stirring before each reading|Plot resistance against temperature and also ln R against 1/T|Comment on the sensitivity and suggest a use',
  observations: 'The resistance falls steeply at low temperatures and more gently when hot.',
  measurements: 'temperature (°C)|resistance (ohm)',
  variables: 'independent: temperature of the water|dependent: resistance of the thermistor|control: same thermistor, fully immersed, stirred water',
  expected: 'R falls from about 10 kohm at 0 °C to a few hundred ohm at 90 °C; ln R against 1/T is linear.',
  calculations: 'percentage change in resistance per 10 °C|gradient of ln R against 1/T|find the activation energy using R = R0 exp(B/T)',
  questions: 'Why is a thermistor better than a metal wire for measuring small temperature changes?|Why must the water be stirred?'
});

// =============================== A LEVEL PHYSICS =============================
E('physics', 'a', 'Acceleration of free fall g', 'Determine g by timing a falling object through a light gate.', {
  duration: '45 min', tags: 'mechanics, free fall, g',
  apparatus: 'retort_stand, clamp, light_gate, ruler, stopwatch, ball_bearing, electromagnet_release',
  substances: '',
  theory: 'For an object falling from rest h = ½gt², so a graph of h against t² has gradient g/2.',
  safety: 'Catch the ball bearing in a tray so it does not roll off the bench|Do not drop masses near feet',
  procedure: 'Clamp the light gate below the release electromagnet and measure the height to the card on the falling mass|Release the mass and record the time, repeating three times for each height|Repeat for six heights between 0.2 and 1.0 m|Plot h against t² and take the gradient',
  observations: 'The fall is quicker from greater heights and the timings are consistent to about 1 %.',
  measurements: 'height (mm)|time of fall (s)',
  variables: 'independent: height of fall|dependent: time of fall|control: same mass, released from rest, same gate',
  expected: 'g within 5 % of 9.81 m/s² with a straight-line graph of h against t².',
  calculations: 't² for each height|gradient = g/2|g = 2 x gradient|uncertainty in g from the steepest and shallowest lines',
  questions: 'Why is the graph h against t² better than h against t?|What systematic error does air resistance introduce?'
});

E('physics', 'a', 'Simple harmonic motion: the pendulum', 'Measure g from the period of a simple pendulum and investigate how the period depends on length.', {
  duration: '50 min', tags: 'shm, pendulum, period, g',
  apparatus: 'retort_stand, clamp, pendulum_bob, ruler, stopwatch, protractor',
  substances: '',
  theory: 'T = 2π√(l/g) for small angles, so a graph of T² against l has gradient 4π²/g.',
  safety: 'Clamp the stand to the bench|Keep the swing angle below about 10°',
  procedure: 'Set the pendulum length to 0.20 m and displace it by less than 10°|Time 20 oscillations and divide by 20 to reduce the timing uncertainty|Repeat for lengths from 0.20 to 1.00 m|Plot T² against l and find g from the gradient',
  observations: 'The period increases with length; the amplitude slowly decays.',
  measurements: 'length (mm)|time for 20 oscillations (s)|amplitude (mm)',
  variables: 'independent: length of the pendulum|dependent: period|control: same bob and angle, timing from the equilibrium point',
  expected: 'g within 2 % of 9.81 m/s²; T² against l is a straight line through the origin.',
  calculations: 'T = time / 20|T² for each length|gradient = 4π²/g|uncertainty in g',
  questions: 'Why time 20 oscillations?|Why must the angle be small?|Why is the equilibrium point the best place to start timing?'
});

E('physics', 'a', 'Stretching a spring: stress and strain energy', 'Find the spring constant and the energy stored from the force-extension graph.', {
  duration: '45 min', tags: 'materials, hooke, energy',
  apparatus: 'retort_stand, clamp, spring, mass_set, ruler, micrometer',
  substances: '',
  theory: 'Within the elastic limit F = kx and the stored energy is the area under the force-extension graph, ½Fx.',
  safety: 'Clamp the stand and place a cushion below the masses|Do not exceed the elastic limit',
  procedure: 'Measure the diameter of the spring wire with the micrometer and record the unstretched length|Add masses in 0.1 kg steps, recording the extension each time, up to the elastic limit|Unload and check that the spring returns to its original length|Plot force against extension and find k; then find the energy stored at the largest load from the area',
  observations: 'The graph is linear up to the elastic limit and then curves as the spring is permanently deformed.',
  measurements: 'extension (mm)|force (N)|wire diameter (mm)',
  variables: 'independent: applied load|dependent: extension|control: same spring, same ruler, unloaded between runs',
  expected: 'k around 20 N/m; the energy stored matches ½kx² within about 5 %.',
  calculations: 'F = mg|k = gradient|energy = ½ F x|theoretical energy = ½kx²|stress = F/A and strain = x/l',
  questions: 'Why is the area under the graph equal to the stored energy?|What happens to the energy when the spring is stretched beyond its elastic limit?'
});

E('physics', 'a', 'Internal resistance by graphical method', 'Find the e.m.f. and internal resistance of a cell with a graphical method and quantify the uncertainty.', {
  duration: '50 min', tags: 'electricity, emf, uncertainty',
  apparatus: 'cell_1_5v, rheostat, ammeter_digital, voltmeter_digital, wire_red x2, crocodile_clip x4, switch',
  substances: '',
  theory: 'V = E - Ir. The gradient is -r and the intercept E, so the uncertainty in r comes from the scatter of the points.',
  safety: 'Keep the current below 1 A and switch off between readings|The cell gets warm if you draw current continuously',
  procedure: 'Set up the circuit with a switch so the cell is only loaded while reading|Take six pairs of readings of terminal p.d. and current spread over the range|Plot V against I and draw the best straight line, plus the steepest and shallowest lines|Determine E and r with their uncertainties',
  observations: 'The terminal p.d. decreases linearly with current.',
  measurements: 'current (A)|terminal p.d. (V)',
  variables: 'independent: current drawn|dependent: terminal p.d.|control: same cell, quick readings to limit heating',
  expected: 'E about 1.5 V, r about 0.5 ohm with an uncertainty of about 10 %.',
  calculations: 'gradient and intercept|r = -gradient|absolute and percentage uncertainty in r and E from the maximum and minimum gradients',
  questions: 'Why does heating the cell change the result?|Why is the value of r only roughly constant?'
});

E('physics', 'a', 'Capacitor discharge: RC time constant', 'Measure the time constant of an RC circuit and use it to find the capacitance.', {
  duration: '50 min', tags: 'electricity, capacitor, exponential',
  apparatus: 'power_supply, capacitor, resistor_100k, voltmeter_digital, stopwatch, switch, wire_red x2, crocodile_clip x3',
  substances: '',
  theory: 'A capacitor discharges through a resistor as V = V0 e^(-t/RC), so ln V against t is a straight line of gradient -1/RC.',
  safety: 'Observe the correct polarity for the electrolytic capacitor|Discharge the capacitor after use|Keep the maximum voltage below the capacitor rating',
  procedure: 'Charge the capacitor to the supply voltage and note V0|Disconnect the supply and start the stopwatch, recording V every 10 s for two minutes|Plot ln V against t and find the gradient|Calculate the time constant and the capacitance, and compare with the marked value',
  observations: 'The voltage falls quickly at first and then more slowly, never quite reaching zero.',
  measurements: 'voltage every 10 s (V)|time (s)|resistance (kohm)',
  variables: 'independent: time after discharge starts|dependent: voltage across the capacitor|control: same capacitor and resistor, same starting voltage',
  expected: 'Time constant within 10 % of RC; ln V against t is linear.',
  calculations: 'ln V for each reading|gradient = -1/RC|C = -1/(R x gradient)|half-life = 0.693 RC',
  questions: 'Why is the discharge not linear?|Why is a large resistance used?|How would the graph change with a larger capacitance?'
});

E('physics', 'a', 'Speed of sound with a signal generator', 'Measure the wavelength of sound and hence its speed using a loudspeaker and microphone.', {
  duration: '50 min', tags: 'waves, sound, superposition',
  apparatus: 'signal_generator, loudspeaker, microphone, oscilloscope, ruler, retort_stand',
  substances: '',
  theory: 'Standing waves between the speaker and a reflector give nodes and antinodes; the distance between successive minima is half a wavelength.',
  safety: 'Keep the volume moderate - loud tones are uncomfortable and can damage hearing|Keep water away from the electrical equipment',
  procedure: 'Set the signal generator to a known frequency and place the microphone facing the loudspeaker|Move the microphone along a ruler and note the positions where the signal is a minimum|Measure the distance between successive minima and average them to find half a wavelength|Repeat for three frequencies and calculate the speed of sound',
  observations: 'The oscilloscope trace grows and shrinks smoothly as the microphone moves; the minima are evenly spaced.',
  measurements: 'frequency (Hz)|positions of minima (mm)|wavelength (mm)',
  variables: 'independent: frequency of the sound|dependent: wavelength|control: same apparatus geometry, same temperature',
  expected: 'A speed of about 340 m/s with a wavelength inversely proportional to frequency.',
  calculations: 'wavelength = 2 x mean spacing|c = f x wavelength|plot wavelength against 1/f and find c from the gradient',
  questions: 'Why is the distance between minima half a wavelength?|Why is plotting wavelength against 1/f better than calculating c three times?'
});

E('physics', 'a', 'Wavelength of light with a diffraction grating', 'Measure the wavelength of laser light using a diffraction grating.', {
  duration: '40 min', tags: 'optics, diffraction, wavelength',
  apparatus: 'diffraction_grating, laser_pointer, screen, ruler, protractor, retort_stand',
  substances: '',
  theory: 'd sin θ = nλ. Measuring the positions of the diffraction orders gives the wavelength.',
  safety: 'NEVER look directly into the laser beam or at its reflection|Keep the beam below eye level and switch it off when not reading|Work in a darkened room',
  procedure: 'Mount the grating a measured distance from the screen and shine the laser through it|Measure the distance between the two first-order spots and the grating-screen distance|Calculate sin θ for the first order and hence λ|Repeat with the second order and with a different grating spacing',
  observations: 'A bright central spot with dimmer spots either side at equal angles.',
  measurements: 'grating spacing (mm)|distance from grating to screen (mm)|position of each order (mm)',
  variables: 'independent: the order of diffraction (or the grating spacing)|dependent: the angle of diffraction|control: same laser, same geometry',
  expected: 'λ within about 5 % of the marked laser wavelength (about 630-650 nm for a red pointer).',
  calculations: 'tan θ = x / L so θ = tan^-1(x/L)|λ = d sin θ / n|percentage difference from the marked value',
  questions: 'Why are the higher orders dimmer?|Why must the screen be a long way from the grating?'
});

E('physics', 'a', 'I-V characteristics of a thermistor and a diode', 'Compare the current-voltage behaviour of a thermistor and a diode and explain each in terms of charge carriers.', {
  duration: '50 min', tags: 'electricity, semiconductors, iv graph',
  apparatus: 'power_supply, thermistor, diode, resistor_470, ammeter_digital, voltmeter_digital, water_bath, wire_red x4, crocodile_clip x6',
  substances: 'distilled_water:300 cm3',
  theory: 'A diode conducts only when forward biased above about 0.7 V; a thermistor resistance falls as temperature rises because more charge carriers are released.',
  safety: 'Keep the diode current below 20 mA by using a series resistor|Water and electricity: keep connections dry',
  procedure: 'Obtain the forward and reverse I-V curve of the diode with the series resistor|Immerse the thermistor in a water bath and obtain its I-V curve at 20 °C, 50 °C and 80 °C|Plot all the graphs on the same axes where possible|Explain each shape in terms of the charge carriers',
  observations: 'The diode cuts in sharply at about 0.7 V and blocks reverse current; the thermistor obeys Ohm\'s law at each temperature but with a different gradient.',
  measurements: 'current (A) and voltage (V) at each setting and temperature',
  variables: 'independent: applied voltage and temperature|dependent: current|control: same components, same series resistor',
  expected: 'A threshold voltage of about 0.7 V for the diode and a resistance that falls by roughly a factor of two per 10 °C for the thermistor.',
  calculations: 'R = V/I at each temperature|percentage change in R per 10 °C|comment on the non-linear diode characteristic',
  questions: 'Why does a diode need a series resistor?|Why is a thermistor not ohmic over a wide temperature range?'
});

E('physics', 'a', 'Resolution and uncertainty in density measurement', 'Measure the density of a metal cylinder using a micrometer and evaluate which measurement limits the precision.', {
  duration: '50 min', tags: 'uncertainty, measurement, density',
  apparatus: 'micrometer, vernier_caliper, ruler, top_pan_balance, metal_cylinder',
  substances: '',
  theory: 'Density = m / (πr²h). Small lengths measured with a micrometer have a much smaller percentage uncertainty than the same length measured with a ruler.',
  safety: 'Close the micrometer gently using the ratchet to avoid crushing the cylinder|Do not over-tighten the callipers',
  procedure: 'Measure the mass of the cylinder three times on the balance|Measure the diameter and length at five places with the micrometer and callipers and take means|Calculate the density and the percentage uncertainty using the quadrature rule|Repeat the calculation using ruler measurements and compare the total uncertainties',
  observations: 'The micrometer readings vary by less than 0.02 mm while the ruler readings vary by 1 mm.',
  measurements: 'mass (g)|diameter (mm) at five positions|length (mm) at five positions',
  variables: 'independent: the instrument used|dependent: the percentage uncertainty in the density|control: same cylinder, same operator',
  expected: 'The micrometer method gives a density uncertainty of about 0.5 %, the ruler method about 2 %.',
  calculations: 'percentage uncertainty in d, h and m|total = sqrt(%d² x 4 + %h² + %m²)|density and its absolute uncertainty|compare with the data-book value and comment',
  questions: 'Why does the diameter contribute four times as much as a length of the same percentage uncertainty?|Which instrument should you improve first to get a better result?'
});

// =========================== UNDERGRADUATE PHYSICS ==========================
E('physics', 'ug', 'Damped simple harmonic motion', 'Measure the logarithmic decrement of a damped pendulum and determine the damping coefficient.', {
  duration: '90 min', tags: 'shm, damping, uncertainty, research',
  apparatus: 'retort_stand, clamp, pendulum_bob, ruler, stopwatch, datalogger, light_gate, card_dampers',
  substances: '',
  theory: 'For light damping the amplitude decays as A = A0 e^(-λt), so ln A against t is linear with gradient -λ. Energy decays twice as fast as amplitude.',
  safety: 'Clamp the stand; keep the swing clear of other apparatus|Do not let the bob hit the clamp',
  procedure: 'Displace the pendulum by a fixed amplitude and release it|Record the amplitude of successive swings with the datalogger or by timing|Plot ln A against the number of swings and find the logarithmic decrement|Repeat with a card of known area attached to the bob and compare the damping coefficients',
  observations: 'The amplitude decays exponentially; the card increases the damping several-fold.',
  measurements: 'amplitude of each swing (mm)|period (s)|number of swings',
  variables: 'independent: the damping (card area)|dependent: logarithmic decrement|control: same pendulum length, mass and starting amplitude',
  expected: 'λ is proportional to the card area within experimental scatter; the period is almost unchanged for light damping.',
  calculations: 'ln A against t|gradient = -λ|quality factor Q = π/λ|percentage uncertainty in λ from the line of best fit',
  questions: 'Why is the period almost unaffected by light damping?|How does the energy decay compare with the amplitude decay?'
});

E('physics', 'ug', 'RC charging and discharging with a data logger', 'Determine the time constant of an RC circuit from logged data and compare with the theoretical value.', {
  duration: '90 min', tags: 'electronics, capacitor, data logging',
  apparatus: 'power_supply, capacitor, resistor_100k, datalogger, voltmeter_digital, switch, wire_red x2',
  substances: '',
  theory: 'V = V0(1 - e^(-t/RC)) on charging and V = V0 e^(-t/RC) on discharging. Logged data allows a full curve fit rather than a single point.',
  safety: 'Observe the polarity of the electrolytic capacitor|Discharge the capacitor before handling|Keep the supply below the capacitor rating',
  procedure: 'Connect the capacitor, resistor and switch to the data logger and set the sampling rate to 10 Hz|Log the voltage while charging and again while discharging|Plot ln(V0/V) against t and fit a straight line for the time constant|Compare charging and discharging time constants and comment on the agreement',
  observations: 'Both curves are smooth exponentials; the two time constants agree closely.',
  measurements: 'voltage against time (V, s)|resistance (kohm)|capacitance (µF)',
  variables: 'independent: time|dependent: voltage|control: same components, same starting conditions',
  expected: 'The measured time constant matches RC within 5 % and is the same for charging and discharging.',
  calculations: 'ln(V0/V) against t gives 1/RC|C = t/(R x gradient)|fit residuals and uncertainty|half-life = ln2 x RC',
  questions: 'Why are the charging and discharging time constants equal?|How would a leaky capacitor show up in the data?'
});

E('physics', 'ug', 'Newton\'s law of cooling with data logging', 'Measure the cooling curve of a liquid and test Newton\'s law of cooling.', {
  duration: '90 min', tags: 'thermal, cooling, data logging, modelling',
  apparatus: 'beaker_250, thermometer_precise, datalogger, hot_plate, stopwatch, lagging_material, lid',
  substances: 'distilled_water:200 cm3',
  theory: 'Newton\'s law of cooling predicts dT/dt = -k(T - Troom). A plot of cooling rate against temperature difference should be a straight line of gradient -k.',
  safety: 'Goggles; hot water scalds|Carry the beaker with a cloth|Keep electrical apparatus away from the water',
  procedure: 'Heat 200 cm3 of water to about 80 °C and log the temperature for 20 minutes|Tabulate the cooling rate at each temperature by taking gradients from the curve|Plot the cooling rate against the temperature excess and fit a straight line|Repeat with a lid and with lagging and compare the values of k',
  observations: 'The cooling rate falls as the water approaches room temperature; the fit is good above a 20 °C excess.',
  measurements: 'temperature against time (°C, s)|cooling rate (°C/min)|room temperature (°C)',
  variables: 'independent: temperature excess|dependent: cooling rate|control: same volume, same container, same room conditions',
  expected: 'A straight line with a negative gradient; lagging reduces k by a factor of two or more.',
  calculations: 'gradients from the curve|k = -gradient|compare k with and without lagging|comment on the deviations close to room temperature',
  questions: 'Why does the model fail close to room temperature?|Why does surface area matter?|How could the experiment be improved for the low-temperature region?'
});

E('physics', 'ug', 'Dispersion and refractive index of a prism', 'Measure the refractive index of a prism at minimum deviation and observe dispersion.', {
  duration: '120 min', tags: 'optics, dispersion, spectrometer',
  apparatus: 'prism, ray_box, spectrometer_table, protractor, screen, diffraction_grating',
  substances: '',
  theory: 'At minimum deviation n = sin((A + D)/2) / sin(A/2), where A is the prism angle and D the angle of minimum deviation.',
  safety: 'Handle the prism carefully - scratches ruin the optical surfaces|Do not look directly into the ray box or laser',
  procedure: 'Measure the angle A of the prism by tracing its outline|Rotate the prism to find the position of minimum deviation for a single colour and measure D|Calculate n for red, green and blue by filtering the light|Plot n against wavelength and comment on dispersion',
  observations: 'The deviation is least at one prism orientation; blue light deviates more than red.',
  measurements: 'prism angle A (°)|minimum deviation D (°) for each colour|wavelength if a grating is available (nm)',
  variables: 'independent: the colour (wavelength) of the light|dependent: minimum deviation and refractive index|control: same prism and orientation, same room lighting',
  expected: 'n about 1.52 for red and 1.54 for blue, with a smooth increase towards shorter wavelengths.',
  calculations: 'n = sin((A+D)/2)/sin(A/2)|uncertainty in n from the angles|comment on the shape of the dispersion curve',
  questions: 'Why does blue light bend more than red?|Why is minimum deviation the best position for measuring n?'
});
