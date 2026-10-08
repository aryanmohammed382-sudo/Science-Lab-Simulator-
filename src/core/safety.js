// ---------------------------------------------------------------------------
// SAFETY / HAZARD ENGINE
// ---------------------------------------------------------------------------
// The simulator never silently blocks a student: unsafe actions produce a
// warning that explains (1) what happened, (2) why it is dangerous and (3) how
// to correct it - and then the simulation carries on with realistic
// consequences wherever that is possible.
// ---------------------------------------------------------------------------

import { getSpecies } from './species.js';
import { SUBSTANCES } from './substances.js';
import { clamp } from './util.js';

export const SEVERITY = { info: 0, caution: 1, danger: 2, critical: 3 };

/**
 * A rule is { id, severity, when(ctx), title, what, why, fix, ppe? }
 * `when` receives a context object and returns true when the rule applies.
 */
export const SAFETY_RULES = [
  {
    id: 'no_goggles_corrosive', severity: 'caution', ppe: ['goggles'],
    when: (c) => c.action === 'pour' && !c.ppe?.goggles && c.involvesCorrosive,
    title: 'Eyes are not protected',
    what: 'You are handling a corrosive substance without goggles.',
    why: 'A single splash of acid or alkali can cause permanent damage to the cornea.',
    fix: 'Put your safety goggles on before you pour. In a real laboratory this is compulsory.'
  },
  {
    id: 'no_gloves_corrosive', severity: 'caution', ppe: ['gloves'],
    when: (c) => c.involvesCorrosive && !c.ppe?.gloves && ['pour', 'handle', 'pick'].includes(c.action),
    title: 'Bare hands on a corrosive reagent',
    what: 'You are handling a corrosive reagent without gloves.',
    why: 'Concentrated acids and alkalis attack skin proteins and cause deep burns (and the burn may not be felt at once).',
    fix: 'Wear nitrile gloves when handling concentrated reagents.'
  },
  {
    id: 'no_labcoat', severity: 'info', ppe: ['labcoat'],
    when: (c) => !c.ppe?.labcoat && ['pour', 'heat', 'mix'].includes(c.action),
    title: 'No laboratory coat',
    what: 'You are working without a laboratory coat.',
    why: 'A lab coat protects your clothes and skin from spills and from flames.',
    fix: 'Put on a laboratory coat.'
  },
  {
    id: 'water_to_conc_acid', severity: 'critical',
    when: (c) => c.action === 'pour' && c.pouringInto === 'conc_acid' && c.sourceIsWater,
    title: 'Never add water to concentrated acid',
    what: 'You are pouring water onto concentrated sulfuric acid.',
    why: 'The dilution is extremely exothermic. Local boiling can spit acid out of the container.',
    fix: 'Always add the acid to the water, slowly, while stirring. If it happens: stand back, do not add more, and let it cool.'
  },
  {
    id: 'acid_into_alkali_conc', severity: 'danger',
    when: (c) => c.action === 'pour' && c.sourceIsConcAcid && c.destHasAlkali,
    title: 'Concentrated acid into alkali',
    what: 'Concentrated acid is being poured into a strong alkali.',
    why: 'Neutralisation releases about 57 kJ per mole; with concentrated reagents the mixture can boil and spit.',
    fix: 'Dilute both reagents first and add them slowly with stirring and cooling.'
  },
  {
    id: 'sodium_water', severity: 'critical',
    when: (c) => c.action === 'add' && c.substanceIds?.includes('sodium_metal_oil') && c.destHasWater,
    title: 'Sodium metal and water react violently',
    what: 'Sodium metal has been added to water.',
    why: 'The reaction produces hydrogen and enough heat to ignite it. Molten sodium can be thrown out of the container.',
    fix: 'React sodium only with a small piece of dry filter paper and a safety screen, never with water in a beaker. Clear the area and cover the container.'
  },
  {
    id: 'flammable_near_flame', severity: 'critical',
    when: (c) => c.flameOn && c.flammableVapour,
    title: 'Flammable vapour near a naked flame',
    what: 'There is a flammable solvent vapour in the air while a Bunsen burner is lit.',
    why: 'Ethanol, propanone and hexane vapours ignite readily and the flame can flash back to the bottle.',
    fix: 'Extinguish the flame, open the windows or use the fume hood, and use a water bath or heating mantle instead.'
  },
  {
    id: 'sealed_heating', severity: 'danger',
    when: (c) => c.action === 'heat' && c.sealed && c.gasMoles > 1e-4,
    title: 'Heating a sealed container',
    what: 'A closed container is being heated.',
    why: 'The pressure of the trapped gas rises with temperature (p ∝ T). The stopper can be blown out or the vessel can burst.',
    fix: 'Remove the stopper, or fit a delivery tube so the gas can escape.'
  },
  {
    id: 'overpressure', severity: 'critical',
    when: (c) => c.pressureKPa > 250,
    title: 'Dangerous pressure',
    what: (c) => `The pressure inside the vessel is about ${Math.round(c.pressureKPa || 0)} kPa.`,
    why: 'Glassware is not designed for high pressure - above roughly 2-3 bar it fails explosively.',
    fix: 'Vent the vessel immediately or reduce the temperature.'
  },
  {
    id: 'toxic_gas_indoor', severity: 'danger',
    when: (c) => c.action === 'react' && c.gases?.some((g) => ['Cl2', 'SO2', 'H2S', 'NO2', 'NH3', 'HCl', 'CO'].includes(g)) && !c.inFumeHood,
    title: 'Toxic gas outside the fume hood',
    what: (c) => `This reaction releases ${(c.gases || []).map(describeGas).join(', ')}.`,
    why: 'These gases irritate or poison the lungs; chlorine and hydrogen sulfide can be dangerous in quite small amounts.',
    fix: 'Move the experiment into the fume hood, or collect the gas through a delivery tube with the mouth of the tube just under water.'
  },
  {
    id: 'fume_hood_required', severity: 'caution',
    when: (c) => c.action === 'pick' && c.substanceFumeOnly && !c.inFumeHood,
    title: 'This reagent belongs in the fume hood',
    what: 'A fuming reagent has been taken to the bench.',
    why: 'It gives off harmful vapour while it is open.',
    fix: 'Work with it inside the fume hood with the sash lowered.'
  },
  {
    id: 'short_circuit', severity: 'danger',
    when: (c) => c.circuitWarnings?.some((w) => /short circuit/i.test(w)),
    title: 'Short circuit',
    what: 'A very large current is flowing because a cell is connected straight across a wire.',
    why: 'The cell overheats, the wire gets hot and the cell may leak or vent.',
    fix: 'Break the connection immediately and put a resistor, lamp or motor in the circuit.'
  },
  {
    id: 'overloaded_component', severity: 'caution',
    when: (c) => c.overloaded?.length > 0,
    title: 'Component is over its power rating',
    what: (c) => `Component(s) ${(c.overloaded || []).join(', ')} are dissipating more than their rated power.`,
    why: 'Resistors and lamps that run beyond their rating overheat and can fail.',
    fix: 'Increase the series resistance or reduce the supply voltage.'
  },
  {
    id: 'ammeter_in_parallel', severity: 'danger',
    when: (c) => c.ammeterInParallel,
    title: 'Ammeter connected in parallel',
    what: 'An ammeter has been connected across a component instead of in series with it.',
    why: 'An ammeter has almost no resistance, so it short circuits whatever it is connected across and draws a huge current.',
    fix: 'Break the circuit and connect the ammeter in series with the component you are measuring.'
  },
  {
    id: 'voltmeter_in_series', severity: 'caution',
    when: (c) => c.voltmeterInSeries,
    title: 'Voltmeter connected in series',
    what: 'A voltmeter has been connected in series with the rest of the circuit.',
    why: 'A voltmeter has a very high resistance, so almost no current flows and nothing works - but nothing is damaged.',
    fix: 'Connect the voltmeter in parallel with (across) the component.'
  },
  {
    id: 'thermometer_over_range', severity: 'caution',
    when: (c) => c.reading && c.reading.ok === false && c.instrument === 'thermometer',
    title: 'Thermometer over range',
    what: 'The temperature is beyond the scale of this thermometer.',
    why: 'A spirit thermometer whose liquid reaches the top can burst, and the reading is meaningless.',
    fix: 'Use a probe or a higher-range thermometer, or let the mixture cool first.'
  },
  {
    id: 'overfilled', severity: 'caution',
    when: (c) => c.fillFraction > 1.0,
    title: 'Container overfilled',
    what: 'The container is more than full.',
    why: 'Liquid spills over the bench, and hot liquid can crack cold glass.',
    fix: 'Pour some out or use a larger vessel. Keep the level below about two-thirds for heating.'
  },
  {
    id: 'heating_too_full', severity: 'caution',
    when: (c) => c.action === 'heat' && c.fillFraction > 0.6,
    title: 'Heating a nearly full vessel',
    what: 'A container more than two-thirds full is being heated.',
    why: 'Liquid can bump or froth over, and there is no room for the vapour.',
    fix: 'Pour some out first, and add anti-bumping granules.'
  },
  {
    id: 'bunsen_hot_apparatus', severity: 'caution',
    when: (c) => c.hotGlass && c.action === 'pick',
    title: 'Picking up hot glassware',
    what: 'You picked up apparatus that is still hot.',
    why: 'Hot glass looks exactly like cold glass and burns immediately.',
    fix: 'Use tongs, or let it cool on the bench (with a warning notice).'
  },
  {
    id: 'broken_glassware', severity: 'danger',
    when: (c) => c.broken,
    title: 'Broken glassware',
    what: 'A piece of apparatus has cracked or shattered.',
    why: 'Broken glass causes cuts, and any chemicals that were in it are now on the bench.',
    fix: 'Do not pick it up with your hands. Sweep it into the sharps bin and neutralise/wipe up the spill.'
  },
  {
    id: 'spillage', severity: 'caution',
    when: (c) => c.spilledML > 0.5,
    title: 'Spillage on the bench',
    what: (c) => `${c.spilledML.toFixed(1)} cm³ has been spilled.`,
    why: 'Spilled reagents contaminate the bench and your notes; concentrated ones damage surfaces and clothing.',
    fix: 'Wipe it up straight away with a paper towel and wash the area with water.'
  },
  {
    id: 'waste_into_sink', severity: 'caution',
    when: (c) => c.action === 'discard_sink' && c.hazardousToDrain,
    title: 'Hazardous waste into the sink',
    what: 'A substance that must not go down the drain has been poured away.',
    why: 'Heavy metal ions and organic solvents poison water courses and are difficult to remove.',
    fix: 'Pour it into the labelled heavy-metal or organic waste bottle instead.'
  },
  {
    id: 'bromine_skin', severity: 'danger',
    when: (c) => c.contactsSkin && c.substanceIds?.some((s) => ['bromine_water'].includes(s)),
    title: 'Bromine on the skin',
    what: 'Bromine water has touched your skin.',
    why: 'Liquid bromine burns the skin painfully and its vapour damages the lungs.',
    fix: 'Wash with plenty of water for at least 10 minutes and tell the teacher. Keep the tube in the fume hood.'
  },
  {
    id: 'silver_nitrate_stains', severity: 'info',
    when: (c) => c.contactsSkin && c.substanceIds?.some((s) => s?.startsWith('agno3')),
    title: 'Silver nitrate stains',
    what: 'Silver nitrate has touched your skin.',
    why: 'It leaves black stains that last for days as the silver is reduced by light and skin proteins.',
    fix: 'Rinse with water immediately. It is harmless but unsightly - gloves prevent it.'
  },
  {
    id: 'methanol_ingest', severity: 'critical',
    when: (c) => c.ingested && c.substanceIds?.includes('methanol'),
    title: 'Never taste or drink anything in the laboratory',
    what: 'Methanol is toxic.',
    why: 'As little as 10 cm³ causes blindness and it can be fatal.',
    fix: 'This is a chemical burn / poisoning emergency: seek medical help at once. Take the labelled bottle with you.'
  },
  {
    id: 'eye_splash', severity: 'critical',
    when: (c) => c.splashToEyes,
    title: 'Splash to the eyes',
    what: 'A corrosive liquid has splashed towards your face.',
    why: 'Alkalis in particular continue to damage tissue for hours.',
    fix: 'Go straight to the eye-wash station, hold the eyes open and irrigate for at least 15 minutes while someone calls for help.'
  },
  {
    id: 'bunsen_leak', severity: 'danger',
    when: (c) => c.action === 'light_bunsen' && c.labcoatsNearby,
    title: 'Loose clothing near the flame',
    what: 'There are loose items near the lit Bunsen burner.',
    why: 'Ties, sleeves and long hair catch fire very easily.',
    fix: 'Tie hair back, tuck in ties and roll up sleeves before lighting the burner.'
  },
  {
    id: 'taking_reagent_to_own_bench', severity: 'info',
    when: (c) => c.action === 'carry_open_bottle',
    title: 'Carrying an open bottle',
    what: 'You are carrying an open reagent bottle.',
    why: 'A stumble spills the reagent over you and the floor.',
    fix: 'Hold the bottle with its label in your palm and your hand over the stopper, and only carry what you need.'
  },
  {
    id: 'handling_hot_bath', severity: 'caution',
    when: (c) => c.action === 'pick' && c.temperature > 60,
    title: 'Hot apparatus',
    what: (c) => `This apparatus is at about ${Math.round(c.temperature)} °C.`,
    why: 'Anything above about 60 °C will burn skin on contact.',
    fix: 'Use tongs or heat-proof gloves, or let it cool.'
  }
];

function describeGas(id) {
  const s = getSpecies(id);
  return `${s.name} (${s.odour ?? 'harmful'})`;
}

/**
 * Evaluate the safety rules against a context object.
 * @returns {Array} warnings sorted most severe first
 */
export function checkSafety(ctx) {
  const warnings = [];
  for (const rule of SAFETY_RULES) {
    let applies = false;
    try { applies = !!rule.when(ctx); } catch { applies = false; }
    if (!applies) continue;
    warnings.push({
      id: rule.id,
      severity: rule.severity,
      level: SEVERITY[rule.severity] ?? 0,
      title: rule.title,
      what: typeof rule.what === 'function' ? rule.what(ctx) : rule.what,
      why: rule.why,
      fix: typeof rule.fix === 'function' ? rule.fix(ctx) : rule.fix,
      ppe: rule.ppe || []
    });
  }
  return warnings.sort((a, b) => b.level - a.level);
}

/** Is this substance corrosive/irritant enough to need eye protection? */
export function isCorrosive(substanceId) {
  const s = SUBSTANCES[substanceId];
  if (!s) return false;
  return (s.ghs || []).some((g) => ['corrosive', 'irritant', 'toxic', 'oxidising'].includes(g));
}
/** Should this reagent never go down the sink? */
export function isDrainHazardous(substanceId) {
  const s = SUBSTANCES[substanceId];
  if (!s) return false;
  return (s.ghs || []).some((g) => ['toxic', 'carcinogen', 'harmful', 'corrosive'].includes(g))
    || ['salt'].includes(s.category) && /copper|lead|silver|barium|nickel|cobalt|chrom/i.test(s.name);
}
/** The PPE this reagent demands. */
export function requiredPPE(substanceIds = []) {
  const needed = new Set(['labcoat', 'goggles']);
  for (const id of substanceIds) {
    const s = SUBSTANCES[id];
    if (!s) continue;
    for (const p of s.ppe || []) needed.add(p);
  }
  return [...needed];
}

/**
 * Realistic consequence of a spill: how much area is contaminated, and what the
 * student must do about it.
 */
export function spillConsequence(volumeML, substanceId) {
  const s = SUBSTANCES[substanceId];
  const areaCm2 = clamp(volumeML * 12, 5, 4000);
  const alkaline = (s?.category === 'base');
  return {
    areaCm2,
    neutraliseWith: alkaline ? 'dilute ethanoic acid then water' : 'sodium hydrogencarbonate then water',
    note: `About ${volumeML.toFixed(1)} cm³ has spread over roughly ${Math.round(areaCm2)} cm² of bench.`
  };
}
