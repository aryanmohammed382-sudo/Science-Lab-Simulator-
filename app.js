(()=>{"use strict";
const E=window.EXPERIMENTS||[],$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let subject=null,current=null,S=null,drag=null,toastTimer;
const esc=x=>String(x??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const subjectInfo={Physics:{label:"Physics",icon:"⚛",class:"physics"},Chemistry:{label:"Chemistry",icon:"⚗",class:"chemistry"},Biology:{label:"Biology",icon:"◉",class:"biology"},Environmental:{label:"Environmental Science",icon:"◎",class:"environmental"}};
const normalizeSubject=s=>s==="Environmental Science"?"Environmental":s;
const fallback={Physics:["DC power supply","Ammeter","Voltmeter","Connecting wires"],Chemistry:["Beaker","Conical flask","Measuring cylinder","Thermometer"],Biology:["Microscope","Microscope slide","Coverslip","Plant sample"],Environmental:["Quadrat","Soil sample","Measuring instruments","Data sheet"]};
const ranges=n=>{n=n.toLowerCase();if(n.includes("ph"))return[1,14,.1,7];if(n.includes("angle"))return[0,85,1,30];if(n.includes("temperature"))return[5,90,1,25];if(n.includes("voltage"))return[0,12,.1,6];if(n.includes("resistance"))return[1,100,1,20];if(n.includes("mass"))return[1,500,1,50];if(/length|distance|height|diameter|volume/.test(n))return[1,100,.1,20];if(n.includes("time"))return[1,120,1,10];return[0,100,.1,20]};
const CHEMISTRY_APPARATUS={"acid-base":["Burette","Volumetric pipette","Conical flask","Retort stand","Burette clamp","White tile","Wash bottle"],"ph-indicators":["Spotting tile","Dropping pipette","Test-tube rack","Test tube"],"separation":["Filter funnel","Filter paper","Beaker","Evaporating basin","Balance","Glass rod"],"chromatography":["Chromatography paper","Capillary tube","Beaker","Pencil","Ruler"],"rates":["Conical flask","Measuring cylinder","Stopwatch","Thermometer","White tile"],"electrolysis":["Beaker","Graphite electrodes","DC power supply","Connecting wires","Switch"],"displacement":["Test tubes","Test-tube rack","Metal strips","Measuring cylinder"],"flame-tests":["Nichrome wire","Bunsen burner","Test tube","Test-tube rack"],"salt-preparation":["Conical flask","Evaporating basin","Filter funnel","Filter paper","Crystallising dish","Glass rod","Bunsen burner","Tripod"],"determining-water-of-crystallisation":["Evaporating basin","Balance","Bunsen burner","Tripod","Tongs","Desiccator"],"qualitative-analysis-of-cations":["Test tubes","Test-tube rack","Dropping pipette","Glass rod"],"qualitative-analysis-of-anions":["Test tubes","Test-tube rack","Dropping pipette","Glass rod"],"test-for-halide-ions":["Test tubes","Test-tube rack","Dropping pipette","Glass rod"],"test-for-sulfate-ions":["Test tubes","Test-tube rack","Dropping pipette","Glass rod"],"test-for-ammonium-ions":["Test tube","Test-tube rack","Dropping pipette","Bunsen burner","Damp red litmus paper"],"alkene-addition-reaction-model":["Test tube","Test-tube rack","Dropping pipette"],"alcohol-oxidation":["Test tube","Test-tube rack","Dropping pipette","Water bath","Thermometer"],"organic-functional-group-tests":["Test tubes","Test-tube rack","Dropping pipette","Water bath","Bunsen burner"],"gas-volume-from-a-carbonate":["Conical flask","Gas syringe","Delivery tube","Rubber bung","Balance"],"gas-volume-and-molar-volume":["Conical flask","Gas syringe","Delivery tube","Rubber bung","Balance","Measuring cylinder"],"relative-formula-mass-by-mass-data":["Balance","Crucible","Tongs","Bunsen burner","Tripod"],"moles-and-avogadro-constant":["Balance","Volumetric flask","Measuring cylinder","Beaker","Glass rod"],"preparation-of-a-standard-solution":["Balance","Beaker","Glass rod","Funnel","Volumetric flask","Wash bottle"],"acid-alkali-titration-with-concordant-results":["Burette","Volumetric pipette","Conical flask","Retort stand","Burette clamp","White tile"],"back-titration":["Balance","Burette","Volumetric pipette","Conical flask","Measuring cylinder","Retort stand","Burette clamp"],"redox-titration-with-potassium-manganate-vii":["Burette","Volumetric pipette","Conical flask","Retort stand","Burette clamp","White tile"],"iodine-thiosulfate-titration":["Burette","Volumetric pipette","Conical flask","Retort stand","Burette clamp","White tile"],"gravimetric-analysis-of-a-carbonate":["Balance","Beaker","Filter funnel","Filter paper","Evaporating basin","Bunsen burner"],"enthalpy-change-of-neutralisation":["Polystyrene cup","Thermometer","Measuring cylinder","Stirring rod","Stopwatch"],"enthalpy-change-of-combustion":["Spirit burner","Copper calorimeter","Thermometer","Balance","Tripod"],"enthalpy-change-by-calorimetry":["Polystyrene cup","Thermometer","Measuring cylinder","Stirring rod","Balance"],"hess-s-law-investigation":["Polystyrene cup","Thermometer","Measuring cylinder","Stirring rod","Balance"],"bond-enthalpy-model":["Molecular model kit","Balance","Thermometer","Stopwatch"],"rate-and-concentration":["Conical flask","Measuring cylinder","Stopwatch","White tile"],"rate-and-temperature":["Conical flask","Water bath","Thermometer","Stopwatch","Measuring cylinder"],"rate-and-surface-area":["Conical flask","Balance","Stopwatch","Measuring cylinder"],"rate-and-catalyst":["Conical flask","Stopwatch","Measuring cylinder","Gas syringe"],"activation-energy-from-arrhenius-data":["Water bath","Thermometer","Stopwatch","Conical flask"],"equilibrium-and-concentration":["Test tubes","Test-tube rack","Dropping pipette","Measuring cylinder"],"equilibrium-and-temperature":["Test tubes","Test-tube rack","Water bath","Thermometer"],"equilibrium-and-pressure":["Gas syringe","Pressure sensor","Temperature sensor"],"ph-measurement-with-a-ph-meter":["pH meter","Beaker","Wash bottle","Stirring rod"],"buffer-solution-investigation":["pH meter","Burette","Volumetric pipette","Conical flask","Beaker"],"solubility-and-temperature":["Test tube","Water bath","Thermometer","Balance","Measuring cylinder"],"ksp-precipitation-model":["Test tubes","Test-tube rack","Dropping pipette","Measuring cylinder"],"electrochemical-cell-voltage":["Beaker","Voltmeter","Connecting wires","Metal electrodes","Salt bridge"],"electrochemical-series":["Beaker","Voltmeter","Connecting wires","Metal electrodes","Salt bridge"],"electrolysis-and-faraday-s-law":["Beaker","Graphite electrodes","DC power supply","Ammeter","Stopwatch","Connecting wires","Balance"],"electroplating":["Beaker","DC power supply","Ammeter","Metal electrodes","Connecting wires"],"conductivity-of-ionic-solutions":["Beaker","Conductivity probe","DC power supply","Ammeter","Connecting wires"]};

const PRACTICAL_APPARATUS_BY_ID={
 // Physics
 "measurement-of-length-with-vernier-calipers":["Vernier calipers","Ruler","Object"],
 "measurement-of-small-diameter-with-a-micrometer":["Micrometer screw gauge","Object"],
 "measurement-of-time-with-a-stopwatch":["Stopwatch","Object"],
 "acceleration-down-an-inclined-plane":["Inclined plane","Trolley","Metre rule","Stopwatch"],
 "determining-g-with-a-free-fall-method":["Clamp stand","Steel ball","Stopwatch","Metre rule"],
 "determining-g-with-a-pendulum":["Clamp stand","String","Pendulum bob","Stopwatch","Metre rule"],
 "projectile-motion":["Projectile launcher","Metre rule","Stopwatch","Carbon paper"],
 "conservation-of-momentum":["Dynamics trolley","Track","Balance","Photogates"],
 "elastic-collision-on-a-track":["Dynamics trolley","Track","Photogates"],
 "kinetic-energy-and-speed":["Dynamics trolley","Track","Photogates","Balance"],
 "gravitational-potential-energy":["Mass hanger","Metre rule","Balance"],
 "work-done-by-a-force":["Force meter","Metre rule","Block"],
 "efficiency-of-a-mechanical-system":["Force meter","Metre rule","Pulley","Masses"],
 "power-of-a-motor":["Motor","Power supply","Stopwatch","Balance"],
 "pressure-in-a-liquid":["Pressure sensor","Measuring cylinder","Metre rule"],
 "archimedes-principle":["Eureka can","Measuring cylinder","Balance","Force meter"],
 "upthrust-and-floating":["Measuring cylinder","Balance","Force meter","Object"],
 "elastic-potential-energy-in-a-spring":["Spring","Clamp stand","Masses","Metre rule"],
 "stress-and-strain":["Wire","Clamp stand","Masses","Metre rule","Micrometer screw gauge"],
 "young-modulus":["Wire","Clamp stand","Masses","Metre rule","Micrometer screw gauge"],
 "thermal-expansion-of-a-solid":["Expansion apparatus","Thermometer","Heat source"],
 "cooling-curve":["Beaker","Thermometer","Stopwatch","Heat source"],
 "heating-curve-and-specific-heat-capacity":["Beaker","Thermometer","Balance","Heater","Stopwatch"],
 "latent-heat-of-fusion":["Ice","Heater","Thermometer","Balance","Stopwatch"],
 "latent-heat-of-vaporisation":["Beaker","Heater","Thermometer","Balance","Stopwatch"],
 "thermal-conductivity":["Metal rods","Heat source","Thermometers","Stopwatch"],
 "waves-on-a-string":["Signal generator","String","Pulley","Mass hanger","Metre rule"],
 "frequency-and-wavelength":["Signal generator","String","Metre rule","Stopwatch"],
 "sound-speed-and-resonance":["Resonance tube","Signal generator","Stopwatch","Metre rule"],
 "standing-waves-in-an-air-column":["Resonance tube","Signal generator","Metre rule"],
 "diffraction-through-a-single-slit":["Ray box","Single slit","Screen","Metre rule"],
 "interference-with-double-slits":["Laser/light source","Double slit","Screen","Metre rule"],
 "polarisation-of-light":["Light source","Polarising filters","Screen","Protractor"],
 "reflection-from-a-plane-mirror":["Plane mirror","Optics pins","Ruler","Protractor"],
 "refraction-through-a-glass-block":["Ray box","Glass block","Protractor","Ruler"],
 "critical-angle-and-total-internal-reflection":["Ray box","Semicircular glass block","Protractor","Ruler"],

 // Biology
 "measurement-with-a-light-microscope":["Microscope","Prepared slide","Stage micrometer"],
 "preparing-a-temporary-microscope-slide":["Microscope","Microscope slide","Coverslip","Dropping pipette"],
 "staining-plant-cells":["Microscope","Microscope slide","Coverslip","Dropping pipette","Stain"],
 "staining-animal-cells":["Microscope","Microscope slide","Coverslip","Dropping pipette","Stain"],
 "microscope-calibration-with-a-stage-micrometer":["Microscope","Stage micrometer","Eyepiece graticule"],
 "cell-size-and-surface-area-to-volume-ratio":["Ruler","Cork borer","Balance","Measuring cylinder"],
 "osmosis-in-potato-tissue":["Cork borer","Measuring cylinder","Balance","Test tubes"],
 "water-potential-and-osmosis":["Cork borer","Measuring cylinder","Balance","Test tubes"],
 "plasmolysis-in-plant-cells":["Microscope","Microscope slide","Coverslip","Dropping pipette"],
 "diffusion-through-a-membrane":["Beaker","Partially permeable membrane","Dropping pipette","Stopwatch"],
 "food-test-for-starch":["Test tubes","Dropping pipette","Spotting tile","Iodine reagent"],
 "food-test-for-reducing-sugars":["Test tubes","Dropping pipette","Water bath","Benedict's reagent"],
 "food-test-for-protein":["Test tubes","Dropping pipette","Spotting tile","Biuret reagent"],
 "food-test-for-lipids":["Test tubes","Dropping pipette","Ethanol","Water"],
 "vitamin-c-investigation":["Test tubes","Dropping pipette","Measuring cylinder","Stopwatch"],
 "enzyme-activity-and-temperature":["Test tubes","Water bath","Thermometer","Stopwatch","Dropping pipette"],
 "enzyme-activity-and-ph":["Test tubes","pH solutions","Dropping pipette","Stopwatch"],
 "enzyme-concentration-and-rate":["Test tubes","Dropping pipette","Stopwatch"],
 "substrate-concentration-and-enzyme-rate":["Test tubes","Measuring cylinder","Dropping pipette","Stopwatch"],
 "competitive-inhibition-model":["Test tubes","Dropping pipette","Stopwatch"],
 "photosynthesis-and-light-intensity":["Aquatic plant","Lamp","Beaker","Ruler","Stopwatch"],
 "photosynthesis-and-carbon-dioxide":["Aquatic plant","Beaker","Measuring cylinder","Stopwatch"],
 "photosynthesis-and-temperature":["Aquatic plant","Water bath","Thermometer","Stopwatch"],
 "leaf-starch-test":["Water bath","Test tube","Iodine solution","Forceps"],
 "chlorophyll-separation-by-chromatography":["Chromatography paper","Capillary tube","Solvent","Beaker","Pencil"],
 "respiration-in-germinating-seeds":["Respirometer","Thermometer","Stopwatch"],
 "respiration-and-temperature":["Respirometer","Water bath","Thermometer","Stopwatch"],
 "respiration-and-oxygen-availability":["Respirometer","Gas syringe","Stopwatch"],
 "anaerobic-respiration-in-yeast":["Test tubes","Delivery tube","Water bath","Stopwatch"],
 "respiratory-quotient-model":["Respirometer","Gas syringe","Stopwatch"],
 "transpiration-and-air-movement":["Potometer","Lamp","Fan","Stopwatch"],
 "transpiration-and-humidity":["Potometer","Humidity chamber","Stopwatch"],
 "transpiration-and-light":["Potometer","Lamp","Stopwatch"],
 "potometer-investigation":["Potometer","Ruler","Stopwatch"],
 "water-uptake-by-roots":["Measuring cylinder","Balance","Stopwatch"],
 "mineral-ion-uptake-model":["Beakers","Balance","Measuring cylinder"],
 "heart-rate-and-exercise":["Stopwatch","Heart-rate sensor"],
 "respiration-rate-and-exercise":["Stopwatch","Respiration-rate sensor"],
 "population-sampling-with-quadrats":["Quadrat frame","Tape measure","Field notebook"],
 "transect-sampling":["Transect tape","Quadrat frame","Field notebook"],
 "capture-recapture-population-estimate":["Quadrat frame","Marker tags","Counting tray"],
 "species-distribution-and-abiotic-factors":["Quadrat frame","Transect tape","Thermometer","Light meter","pH meter"],

 // Environmental Management
 "water-ph-survey":["Sample bottles","pH meter","Measuring cylinder"],
 "dissolved-oxygen-survey":["Sample bottles","DO meter","Thermometer"],
 "biochemical-oxygen-demand-model":["Sample bottles","DO meter","Incubator","Stopwatch"],
 "water-turbidity-investigation":["Turbidity tube","Sample bottles"],
 "nitrate-pollution-investigation":["Sample bottles","Colorimeter","Measuring cylinder"],
 "phosphate-pollution-investigation":["Sample bottles","Colorimeter","Measuring cylinder"],
 "water-hardness-test":["Test tubes","Measuring cylinder","Dropping pipette"],
 "water-treatment-sequence":["Beaker","Filter funnel","Filter paper","Measuring cylinder"],
 "chlorination-model":["Beaker","Measuring cylinder","Dropping pipette","Chlorine test kit"],
 "eutrophication-investigation":["Beakers","Measuring cylinder","Thermometer","Light meter"],
 "soil-texture-by-sedimentation":["Measuring cylinder","Balance","Soil sample","Stopwatch"],
 "soil-moisture-investigation":["Balance","Oven","Soil sample","Crucible"],
 "soil-ph-investigation":["pH meter","Beaker","Measuring cylinder"],
 "soil-organic-matter":["Balance","Crucible","Heat source"],
 "soil-permeability":["Permeameter","Measuring cylinder","Stopwatch"],
 "soil-infiltration-rate":["Infiltration ring","Measuring cylinder","Stopwatch"],
 "soil-erosion-investigation":["Soil trays","Water source","Balance"],
 "soil-nutrient-comparison":["Soil test kit","Sample bags","Balance"],
 "compost-decomposition":["Balance","Thermometer","Compost containers","Stopwatch"],
 "crop-yield-and-soil-fertility":["Quadrat frame","Balance","Ruler","Field notebook"],
 "quadrat-biodiversity-survey":["Quadrat frame","Tape measure","Field notebook"],
 "transect-biodiversity-survey":["Transect tape","Quadrat frame","Field notebook"],
 "population-density-survey":["Quadrat frame","Tape measure","Counting tray"],
 "species-frequency-investigation":["Quadrat frame","Field notebook"],
 "species-abundance-investigation":["Quadrat frame","Counting tray","Field notebook"],
 "simpson-s-diversity-index":["Quadrat frame","Counting tray","Field notebook"],
 "deforestation-and-carbon-storage":["Quadrat frame","Measuring tape","Balance","Field notebook"],
 "forest-regeneration-model":["Quadrat frame","Measuring tape","Field notebook"],
 "habitat-fragmentation":["Measuring tape","Quadrat frame","Field notebook"],
 "carrying-capacity-model":["Quadrat frame","Counting tray","Field notebook"],
 "fish-stock-sustainability":["Measuring tape","Sample net","Counting tray","Field notebook"],
 "maximum-sustainable-yield":["Counting tray","Balance","Field notebook"],
 "water-resource-demand":["Measuring cylinder","Stopwatch","Balance"],
 "irrigation-efficiency":["Measuring cylinder","Measuring tape","Balance","Stopwatch"],
 "agricultural-runoff-model":["Beakers","Measuring cylinder","Soil trays","Colorimeter"],
 "fertiliser-use-and-yield":["Balance","Measuring cylinder","Quadrat frame","Field notebook"],
 "pesticide-bioaccumulation-model":["Beakers","Measuring cylinder","Balance","Field notebook"],
 "food-chain-biomagnification":["Beakers","Measuring cylinder","Balance","Field notebook"],
 "carbon-cycle-model":["Beakers","Balance","Gas sensor","Thermometer"],
 "nitrogen-cycle-model":["Beakers","Test tubes","Colorimeter","Measuring cylinder"],
 "greenhouse-gas-emissions":["Gas sensor","Gas syringe","Thermometer","Stopwatch"],
 "carbon-footprint-comparison":["Balance","Energy meter","Data sheet"],
 "climate-change-temperature-model":["Temperature sensors","Data logger","Thermometer"],
 "sea-level-rise-model":["Measuring cylinder","Ruler","Water tray"],
 "energy-resource-comparison":["Energy meter","Thermometer","Stopwatch","Balance"]
};
function mappedApparatus(e){
 if(!e)return[];
 if(PRACTICAL_APPARATUS_BY_ID[e.id])return PRACTICAL_APPARATUS_BY_ID[e.id];
 const s=normalizeSubject(e.subject);
 if(s==="Chemistry"&&CHEMISTRY_APPARATUS[e.id])return CHEMISTRY_APPARATUS[e.id];
 if(s==="Biology"){
  if(e.id==="food-tests")return["Test tubes","Test-tube rack","Dropping pipette","Water bath","Spotting tile"];
  if(e.id==="microscope")return["Microscope","Prepared slide","Coverslip","Lens paper"];
  if(e.id==="osmosis")return["Cork borer","Measuring cylinder","Balance","Test tubes","Stopwatch"];
  if(e.id==="enzyme")return["Test tubes","Water baths","Thermometer","Stopwatch","Dropping pipette"];
  if(e.id==="photosynthesis")return["Aquatic plant","Beaker","Lamp","Stopwatch"];
  if(e.id==="respiration")return["Respirometer","Thermometer","Water bath","Stopwatch"];
  if(e.id==="transpiration")return["Potometer","Stopwatch","Lamp","Scale"];
  if(e.id==="ecology-quadrat")return["Quadrat frame","Tape measure","Field notebook"];
  return["Microscope","Measuring cylinder","Dropping pipette","Test tubes","Stopwatch"].slice(0,5);
 }
 if(s==="Environmental"){
  if(e.id==="water-quality")return["Sample bottles","pH meter","Turbidity tube","DO kit"];
  if(e.id==="soil-composition")return["Measuring cylinder","Balance","Soil sample","Water"];
  if(e.id==="greenhouse")return["Two chambers","Temperature sensors","Heat source","Data logger"];
  if(e.id==="weather")return["Barometer","Thermometer","Hygrometer","Anemometer"];
  if(/quadrat|population|species|biodiversity|deforestation|forest|habitat/.test((e.name||"").toLowerCase()))return["Quadrat frame","Transect tape","Field notebook"];
  if(/water|dissolved|nitrate|phosphate|chlorination|eutrophication/.test((e.name||"").toLowerCase()))return["Sample bottles","Measuring cylinder","Field data sheet"];
  if(/soil|compost|fertility|erosion|infiltration|permeability/.test((e.name||"").toLowerCase()))return["Soil sampling kit","Measuring cylinder","Balance","Stopwatch"];
  if(/weather|climate|temperature/.test((e.name||"").toLowerCase()))return["Thermometer","Temperature sensor","Data logger"];
  return["Field sampling kit","Measuring instruments","Field data sheet"];
 }
 if(s==="Physics"){
  if(e.id==="measurement-of-length-with-vernier-calipers")return PRACTICAL_APPARATUS_BY_ID[e.id];
  if(e.id==="measurement-of-small-diameter-with-a-micrometer")return PRACTICAL_APPARATUS_BY_ID[e.id];
  if(/pendulum/.test((e.name||"").toLowerCase()))return["Clamp stand","String","Pendulum bob","Stopwatch","Metre rule"];
  if(/lens|refraction|reflection|polarisation|diffraction|interference/.test((e.name||"").toLowerCase()))return["Ray box","Optical component","Screen","Metre rule","Protractor"];
  if(/thermal|heat|cooling|heating|latent/.test((e.name||"").toLowerCase()))return["Heater","Thermometer","Balance","Stopwatch","Beaker"];
  if(/wave|sound|resonance/.test((e.name||"").toLowerCase()))return["Signal generator","String/air column","Metre rule","Stopwatch"];
  if(/force|moment|friction|energy|work|power|spring|stress|young/.test((e.name||"").toLowerCase()))return["Force meter","Metre rule","Masses","Clamp stand"];
  if(/gas|pressure/.test((e.name||"").toLowerCase()))return["Gas syringe","Pressure sensor","Measuring cylinder","Thermometer"];
  return["DC power supply","Ammeter","Voltmeter","Connecting wires"];
 }
 return[];
}

const req=e=>{if(!e)return [];const mapped=mappedApparatus(e);if(mapped.length)return [...new Set(mapped)].slice(0,8);const s=normalizeSubject(e.subject);const raw=(e.materials?.length?e.materials:fallback[e?.subject]||fallback.Physics).filter(Boolean).filter(x=>!["Standard laboratory apparatus","Standard laboratory glassware","Chemical reagents","Measuring equipment","Measuring instruments","Data sheet","Field data sheet"].includes(x));return [...new Set(raw)].slice(0,8)};
const newState=e=>({setup:[],values:(e.controls||["Variable A","Variable B"]).slice(0,2).map((n,i)=>ranges(n)[3]),rows:[],running:false,completed:false,chemicals:{},pours:[],connections:[],markers:[],resistorResistance:20,apparatusOps:{},selectedApparatus:null,fieldSamples:[],environment:{light:500,temp:25,soilPH:7,turbidity:0}});
function toast(t){const x=$("#toast");if(!x)return;x.textContent=t;x.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>x.classList.remove("show"),1900)}
function save(){localStorage.setItem("sls-redesign-state",JSON.stringify({subject,current:current?.id,S}))}
function formula(e){const a=+S.values[0]||0,b=+S.values[1]||0;switch(e.type){case"ohm":return a/(b||1);case"series":return a/(b+20);case"parallel":return a/(b||1);case"resistivity":return .0175*a/(Math.PI*Math.pow(b/2000,2));case"power":return a*a/(b||1);case"density":return a/(b||1);case"hooke":return a/(b||1);case"pendulum":return 2*Math.PI*Math.sqrt(Math.max(.01,a/100));case"moments":case"friction":return a*b;case"lens":return a===b?Infinity:a*b/(a-b);case"refraction":return Math.asin(Math.sin(a*Math.PI/180)/(b||1))*180/Math.PI;case"thermal":return a*50;case"gas":return a?b*100/a:0;default:return(a+b)/2}}
function equation(e){return{ohm:"V = I × R",series:"Rₜ = R₁ + R₂",parallel:"1/Rₜ = 1/R₁ + 1/R₂",resistivity:"R = ρL/A",power:"P = V × I",density:"ρ = m/V",hooke:"F = kx",pendulum:"T = 2π√(L/g)",moments:"Clockwise = Anticlockwise",friction:"F = μN",lens:"1/f = 1/u + 1/v",refraction:"n₁sinθ₁ = n₂sinθ₂",thermal:"Q = mcΔT",gas:"PV = constant"}[e.type]||"Use the recorded evidence to identify the relationship."}
function apparatusSvg(name){const n=String(name).toLowerCase(),label=esc(name);const w=b=>'<svg class="apparatus-svg" viewBox="0 0 180 140" aria-label="'+label+'">'+b+"</svg>";
if(n.includes("ammeter")||n.includes("voltmeter")){const u=n.includes("ammeter")?"A":"V";return w('<rect x="22" y="18" width="136" height="100" rx="18" class="metal"/><rect x="42" y="37" width="96" height="42" rx="6" class="screen"/><text x="90" y="66" text-anchor="middle" class="digital">0.00 '+u+'</text><circle cx="62" cy="98" r="9" class="knob"/><circle cx="118" cy="98" r="9" class="knob"/><circle cx="35" cy="98" r="5" class="port"/><circle cx="145" cy="98" r="5" class="port"/>')}
if(/power supply|battery|dc supply/.test(n))return w('<rect x="15" y="35" width="150" height="78" rx="12" class="metal"/><rect x="29" y="48" width="67" height="30" rx="5" class="screen"/><text x="62" y="68" text-anchor="middle" class="digital">6.0 V</text><circle cx="128" cy="63" r="18" class="knob"/><circle cx="42" cy="96" r="6" class="port"/><circle cx="138" cy="96" r="6" class="port"/>');
if(n.includes("resistor"))return w('<line x1="12" y1="70" x2="43" y2="70" class="wire-svg"/><path d="M43 70 L55 48 L68 92 L81 48 L94 92 L107 48 L120 70" class="resistor-svg"/><line x1="120" y1="70" x2="168" y2="70" class="wire-svg"/>');
if(n.includes("wire"))return w('<path d="M15 82 C45 15 135 15 165 82" class="wire-coil"/><circle cx="15" cy="82" r="8" class="port"/><circle cx="165" cy="82" r="8" class="port"/>');
if(n.includes("evaporating basin")||n.includes("crucible"))return w('<path d="M38 50 Q90 108 142 50 L130 101 Q90 128 50 101 Z" class="glass"/><path d="M52 79 Q90 68 128 79 L124 99 Q90 116 56 99 Z" class="liquid"/><ellipse cx="90" cy="50" rx="52" ry="12" class="glass-rim"/>');
if(n.includes("beaker"))return w('<path d="M46 24 H134 L126 111 Q90 128 54 111 Z" class="glass"/><path d="M54 73 Q90 64 126 73 L121 107 Q90 119 59 107 Z" class="liquid"/><line x1="46" y1="24" x2="134" y2="24" class="glass-rim"/>');
if(n.includes("flask"))return w('<path d="M72 15 H108 V50 L138 104 Q143 118 128 122 H52 Q37 118 42 104 L72 50 Z" class="glass"/><path d="M51 90 Q90 81 129 90 L134 108 Q135 116 125 117 H55 Q45 116 46 108 Z" class="liquid"/><line x1="72" y1="15" x2="108" y2="15" class="glass-rim"/>');
if(n.includes("test tube"))return w('<rect x="64" y="13" width="52" height="108" rx="26" class="glass"/><path d="M68 66 H112 V93 Q90 109 68 93 Z" class="liquid"/>');
if(n.includes("microscope"))return w('<path d="M67 20 H89 V63 L115 87" class="scope"/><path d="M115 87 Q146 99 129 120 H52 Q42 120 42 109 H114" class="metal"/><rect x="60" y="82" width="70" height="14" rx="4" class="stage"/><circle cx="121" cy="58" r="13" class="knob"/>');
if(n.includes("thermometer"))return w('<rect x="80" y="10" width="20" height="94" rx="10" class="glass"/><circle cx="90" cy="105" r="18" class="liquid-red"/><rect x="86" y="42" width="8" height="65" class="liquid-red"/><line x1="106" y1="25" x2="128" y2="25" class="scale-svg"/><line x1="106" y1="48" x2="123" y2="48" class="scale-svg"/>');
if(n.includes("balance"))return w('<rect x="28" y="91" width="124" height="26" rx="5" class="metal"/><path d="M52 91 L63 43 H117 L128 91" class="metal"/><rect x="72" y="47" width="36" height="25" rx="3" class="screen"/><circle cx="52" cy="94" r="9" class="pan"/><circle cx="128" cy="94" r="9" class="pan"/>');
if(/ruler|meter rule/.test(n))return w('<rect x="12" y="54" width="156" height="32" rx="3" class="ruler"/>'+Array.from({length:14},(_,i)=>'<line x1="'+(19+i*11)+'" y1="54" x2="'+(19+i*11)+'" y2="'+(i%5===0?76:68)+'" class="tick"/>').join(""));
if(n.includes("stopwatch"))return w('<circle cx="90" cy="75" r="48" class="metal"/><circle cx="90" cy="75" r="37" class="screen"/><line x1="90" y1="75" x2="90" y2="48" class="hand"/><line x1="90" y1="75" x2="111" y2="85" class="hand"/><rect x="80" y="12" width="20" height="12" rx="4" class="metal"/>');
if(n.includes("lens"))return w('<ellipse cx="90" cy="70" rx="28" ry="53" class="lens"/><line x1="90" y1="17" x2="90" y2="123" class="lens-axis"/>');
if(n.includes("quadrat"))return w('<rect x="34" y="22" width="112" height="96" class="quadrat"/><line x1="71" y1="22" x2="71" y2="118" class="quadrat-line"/><line x1="109" y1="22" x2="109" y2="118" class="quadrat-line"/><line x1="34" y1="54" x2="146" y2="54" class="quadrat-line"/><line x1="34" y1="86" x2="146" y2="86" class="quadrat-line"/>');
return w('<path d="M52 28 H128 L118 108 Q90 123 62 108 Z" class="glass"/><path d="M58 76 Q90 67 122 76 L117 104 Q90 114 63 104 Z" class="liquid"/>')}
function specialApparatusSvg(name){const n=String(name).toLowerCase(),w=b=>'<svg class="apparatus-svg" viewBox="0 0 180 140" aria-label="'+esc(name)+'">'+b+'</svg>';if(n.includes("burette clamp"))return w('<rect x="42" y="62" width="96" height="12" rx="5" class="metal"/><rect x="84" y="20" width="12" height="96" class="metal"/><circle cx="48" cy="68" r="10" class="knob"/><circle cx="132" cy="68" r="10" class="knob"/>');
if(n==="white tile"||n.includes("white tile"))return w('<rect x="25" y="35" width="130" height="70" rx="5" class="tile"/><rect x="36" y="46" width="108" height="48" rx="3" class="white-surface"/>');
if(n.includes("glass block"))return w('<path d="M42 36 H138 V104 H42 Z" class="glass"/><line x1="90" y1="36" x2="90" y2="104" class="scale-svg"/>');
if(n.includes("force meter")||n.includes("newton meter"))return w('<rect x="65" y="20" width="50" height="92" rx="10" class="metal"/><rect x="76" y="36" width="28" height="46" class="screen"/><line x1="90" y1="82" x2="90" y2="105" class="spring-svg"/><text x="90" y="63" text-anchor="middle" class="digital">0.0 N</text>');
if(n.includes("micrometer"))return w('<path d="M48 96 Q48 42 98 42 H128 V58 H98 Q75 58 75 96 H48 Z" class="metal"/><line x1="98" y1="50" x2="145" y2="50" class="metal"/><circle cx="145" cy="50" r="14" class="knob"/><line x1="52" y1="96" x2="128" y2="96" class="metal"/>');
if(n.includes("ray box"))return w('<rect x="32" y="48" width="72" height="54" rx="8" class="metal"/><circle cx="72" cy="75" r="16" class="screen"/><path d="M104 70 H151" class="ray-svg"/><path d="M104 80 H151" class="ray-svg"/>');
if(n.includes("glass block"))return w('<rect x="45" y="35" width="90" height="70" class="glass"/>');
if(n.includes("protractor"))return w('<path d="M28 104 Q90 25 152 104 Z" class="protractor-svg"/><path d="M43 101 Q90 48 137 101" class="protractor-inner"/>');
if(n.includes("pressure sensor"))return w('<rect x="42" y="40" width="96" height="62" rx="8" class="metal"/><rect x="56" y="53" width="68" height="25" class="screen"/><text x="90" y="70" text-anchor="middle" class="digital">101 kPa</text>');
if(n.includes("cork borer"))return w('<rect x="55" y="26" width="70" height="18" rx="7" class="metal"/><path d="M125 26 L145 35 L125 44 Z" class="metal"/>');
if(n.includes("potometer"))return w('<path d="M30 65 H115 V85 H30 Z" class="glass"/><path d="M115 65 H145 V45" class="glass-line-svg"/><circle cx="90" cy="75" r="6" class="bubble-svg"/>');
if(n.includes("respirometer"))return w('<path d="M48 50 H118 V98 H48 Z" class="glass"/><path d="M118 62 H150 V84 H118" class="glass-line-svg"/><circle cx="126" cy="73" r="5" class="bubble-svg"/>');
if(n.includes("turbidity tube"))return w('<rect x="65" y="15" width="50" height="110" rx="8" class="glass"/><path d="M70 78 H110 V116 H70 Z" class="liquid"/><circle cx="90" cy="109" r="7" class="target-dot"/>');
if(n.includes("barometer"))return w('<circle cx="90" cy="70" r="45" class="metal"/><circle cx="90" cy="70" r="35" class="screen"/><line x1="90" y1="70" x2="116" y2="50" class="hand"/>');
if(n.includes("hygrometer"))return w('<rect x="44" y="40" width="92" height="60" rx="8" class="metal"/><text x="90" y="75" text-anchor="middle" class="digital">RH 50%</text>');
if(n.includes("anemometer"))return w('<circle cx="90" cy="70" r="8" class="knob"/><path d="M90 62 L55 35 Q45 28 38 38" class="metal"/><path d="M98 70 L130 45 Q140 37 147 47" class="metal"/><path d="M90 78 L115 110 Q122 120 112 126" class="metal"/>');
if(n.includes("burette"))return w('<path d="M78 12 H102 V103 L90 121 L78 103 Z" class="glass"/><rect x="83" y="30" width="14" height="54" class="liquid"/><line x1="106" y1="25" x2="126" y2="25" class="scale-svg"/><line x1="106" y1="44" x2="122" y2="44" class="scale-svg"/><circle cx="90" cy="104" r="6" class="knob"/>');if(n.includes("volumetric pipette")||n==="pipette")return w('<path d="M84 17 Q90 8 96 17 V47 Q90 59 84 47 Z M84 47 V116 Q90 128 96 116 V47" class="glass"/><ellipse cx="90" cy="48" rx="15" ry="10" class="glass-rim"/>');if(n.includes("measuring cylinder"))return w('<path d="M65 14 H115 L109 119 Q90 128 71 119 Z" class="glass"/><path d="M71 73 Q90 66 109 73 L106 114 Q90 121 74 114 Z" class="liquid"/><line x1="112" y1="35" x2="127" y2="35" class="scale-svg"/><line x1="112" y1="55" x2="124" y2="55" class="scale-svg"/><line x1="112" y1="75" x2="127" y2="75" class="scale-svg"/>');if(n.includes("filter funnel")||n==="funnel")return w('<path d="M34 22 H146 L101 76 V120 H79 V76 Z" class="glass"/>');if(n.includes("spotting tile"))return w('<rect x="25" y="32" width="130" height="76" rx="9" class="tile"/><circle cx="50" cy="55" r="7" class="well"/><circle cx="75" cy="55" r="7" class="well"/><circle cx="100" cy="55" r="7" class="well"/><circle cx="125" cy="55" r="7" class="well"/><circle cx="50" cy="82" r="7" class="well"/><circle cx="75" cy="82" r="7" class="well"/><circle cx="100" cy="82" r="7" class="well"/><circle cx="125" cy="82" r="7" class="well"/>');if(n.includes("nichrome wire"))return w('<path d="M43 106 L70 77 L87 47 L107 25" class="wire-svg"/><circle cx="43" cy="106" r="9" class="handle"/><circle cx="108" cy="24" r="5" class="wire-tip"/>');if(n.includes("bunsen burner"))return w('<rect x="61" y="94" width="58" height="22" rx="4" class="metal"/><rect x="78" y="45" width="24" height="50" class="metal"/><path d="M90 45 C76 30 87 13 90 10 C93 13 104 30 90 45" class="flame-svg"/>');if(n.includes("gas syringe"))return w('<rect x="42" y="48" width="90" height="40" rx="6" class="glass"/><rect x="57" y="55" width="48" height="26" class="liquid"/><rect x="105" y="43" width="10" height="50" class="plunger"/>');
if(n.includes("chromatography paper"))return w('<rect x="58" y="12" width="64" height="116" class="paper-svg"/><line x1="58" y1="92" x2="122" y2="92" class="baseline-svg"/><circle cx="76" cy="92" r="5" class="spot-svg"/><circle cx="92" cy="92" r="5" class="spot-svg"/><circle cx="108" cy="92" r="5" class="spot-svg"/><path d="M76 88 C78 64 80 42 82 20" class="chromatogram-svg"/><path d="M92 88 C94 58 97 38 100 20" class="chromatogram-svg"/><path d="M108 88 C110 70 114 44 118 20" class="chromatogram-svg"/>');
if(n.includes("capillary tube"))return w('<rect x="84" y="16" width="12" height="108" rx="6" class="glass"/><line x1="87" y1="34" x2="93" y2="34" class="scale-svg"/>');
if(n==="pencil"||n.includes("pencil"))return w('<path d="M42 105 L118 29 L135 46 L59 122 Z" class="pencil-svg"/><path d="M118 29 L132 15 L146 30 L135 46 Z" class="pencil-svg"/><path d="M42 105 L30 118 L59 122 Z" class="pencil-tip-svg"/>');
if(n.includes("test tube rack"))return w('<rect x="24" y="80" width="132" height="24" rx="5" class="rack-svg"/><circle cx="48" cy="70" r="15" class="rack-hole"/><circle cx="82" cy="70" r="15" class="rack-hole"/><circle cx="116" cy="70" r="15" class="rack-hole"/><line x1="33" y1="58" x2="33" y2="105" class="rack-leg"/><line x1="147" y1="58" x2="147" y2="105" class="rack-leg"/>');
if(n.includes("retort stand"))return w('<rect x="27" y="111" width="126" height="10" rx="3" class="metal"/><rect x="77" y="20" width="8" height="91" class="metal"/><rect x="82" y="35" width="55" height="7" class="metal"/><circle cx="84" cy="38" r="7" class="knob"/>');
if(n.includes("burette clamp"))return w('<rect x="42" y="62" width="96" height="12" rx="5" class="metal"/><rect x="84" y="20" width="12" height="96" class="metal"/><circle cx="48" cy="68" r="10" class="knob"/><circle cx="132" cy="68" r="10" class="knob"/>');
if(n.includes("pipette filler"))return w('<ellipse cx="90" cy="65" rx="38" ry="28" class="rubber-svg"/><path d="M55 65 H38 M125 65 H142" class="glass-line-svg"/><circle cx="90" cy="37" r="7" class="valve-svg"/>');
if(n.includes("wash bottle"))return w('<path d="M61 44 Q60 22 75 18 H106 Q120 23 119 44 L110 116 H70 Z" class="plastic-svg"/><path d="M96 20 Q126 8 144 24 L139 32 Q119 25 99 31 Z" class="glass-line-svg"/><path d="M78 70 Q90 64 104 70 L102 105 Q90 112 78 105 Z" class="liquid"/>');
if(n.includes("tripod")||n.includes("gauze"))return w('<path d="M46 38 H134 L119 70 H61 Z" class="gauze-svg"/><line x1="58" y1="70" x2="45" y2="119" class="metal"/><line x1="90" y1="70" x2="90" y2="119" class="metal"/><line x1="122" y1="70" x2="135" y2="119" class="metal"/>');
if(n.includes("petri dish"))return w('<ellipse cx="90" cy="70" rx="65" ry="28" class="glass"/><ellipse cx="90" cy="65" rx="58" ry="22" class="glass-rim"/>');
if(n.includes("microscope slide")||n.includes("slide"))return w('<rect x="24" y="52" width="132" height="36" rx="4" class="glass"/><rect x="55" y="58" width="70" height="24" rx="3" class="specimen-svg"/>');
if(n.includes("cover slip"))return w('<rect x="45" y="43" width="90" height="54" rx="2" class="glass"/>');
if(n.includes("transect tape")||n.includes("measuring tape"))return w('<path d="M38 43 Q90 15 142 43 Q155 52 142 66 Q90 95 38 66 Q25 55 38 43 Z" class="tape-svg"/><line x1="48" y1="53" x2="132" y2="53" class="baseline-svg"/>');
if(n.includes("quadrat"))return w('<rect x="30" y="20" width="120" height="100" class="quadrat"/><line x1="70" y1="20" x2="70" y2="120" class="quadrat-line"/><line x1="110" y1="20" x2="110" y2="120" class="quadrat-line"/><line x1="30" y1="53" x2="150" y2="53" class="quadrat-line"/><line x1="30" y1="86" x2="150" y2="86" class="quadrat-line"/>');
if(n.includes("pH meter"))return w('<rect x="44" y="45" width="92" height="56" rx="8" class="metal"/><rect x="58" y="56" width="60" height="22" class="screen"/><text x="88" y="72" text-anchor="middle" class="digital">pH 7.00</text>');if(n.includes("graphite electrode")||n.includes("metal electrode")||n==="electrodes")return w('<rect x="58" y="28" width="18" height="86" rx="5" class="electrode"/><rect x="104" y="28" width="18" height="86" rx="5" class="electrode"/>');if(n.includes("water bath"))return w('<rect x="28" y="38" width="124" height="70" rx="9" class="metal"/><path d="M35 64 Q90 54 145 64 V99 Q90 110 35 99 Z" class="liquid"/>');return null}const baseApparatusSvg=apparatusSvg;apparatusSvg=function(name){return specialApparatusSvg(name)||baseApparatusSvg(name)};
function mini(name){return apparatusSvg(name).replace('class="apparatus-svg"','class="apparatus-svg mini-svg"')}
function setupOK(){const have=S.setup.map(x=>String(x.name).toLowerCase());return req(current).every(r=>have.some(h=>h===r.toLowerCase()||h.includes(r.toLowerCase())||r.toLowerCase().includes(h)))}
function subjectCards(){const groups=["Physics","Chemistry","Biology","Environmental"];const html=groups.map(s=>{const i=subjectInfo[s],n=E.filter(e=>normalizeSubject(e.subject)===s).length;return'<button class="subject-card '+i.class+(subject===s?" active":"")+'" data-subject="'+s+'"><span class="subject-icon">'+i.icon+'</span><b>'+i.label+'</b><small>'+n+' experiments</small></button>'}).join("");$("#subjectGrid").innerHTML=html;$("#modalSubjects").innerHTML=groups.map(s=>{const i=subjectInfo[s],n=E.filter(e=>normalizeSubject(e.subject)===s).length;return'<button class="modal-subject '+i.class+'" data-subject="'+s+'">'+i.icon+' '+i.label+'<small>'+n+' experiments</small></button>'}).join("");$$("[data-subject]").forEach(b=>b.addEventListener("click",()=>chooseSubject(b.dataset.subject)))}
function chooseSubject(s){subject=s;$("#subjectModal").classList.add("hidden");subjectCards();renderExperimentList();const first=E.find(e=>normalizeSubject(e.subject)===subject);if(first)load(first);window.scrollTo({top:0,behavior:"smooth"});save()}
function renderExperimentList(){const box=$("#experimentList"),q=($("#experimentSearch").value||"").toLowerCase(),arr=E.filter(e=>normalizeSubject(e.subject)===subject&&(!q||[e.name,e.objective].join(" ").toLowerCase().includes(q)));$("#experimentCountLabel").textContent=arr.length+" available";box.innerHTML=arr.map(e=>'<button class="experiment-item '+(current?.id===e.id?"active":"")+'" data-id="'+esc(e.id)+'"><span class="experiment-thumb">'+mini(req(e)[0]||"Beaker")+'</span><span><h3>'+esc(e.name)+'</h3><p>'+esc(e.subject)+' · '+(e.level===1?"Beginner":e.level===2?"Intermediate":"Advanced")+'</p><small>'+req(e).length+' apparatus · Practical</small></span></button>').join("")||'<div style="padding:20px;color:#789;font-size:10px">No experiments found.</div>';box.querySelectorAll("[data-id]").forEach(b=>b.addEventListener("click",()=>load(E.find(e=>e.id===b.dataset.id))))}
function load(e){if(!e)return;current=e;S=newState(e);renderExperimentList();renderAll();save();document.querySelector(".lab-column")?.scrollIntoView({behavior:"smooth",block:"start"})}
function renderAll(){if(!current)return;$("#activeTitle").textContent=current.name;$("#activeObjective").textContent=current.objective;$("#overviewText").textContent=current.objective+" "+(current.text||"");$("#variablesText").innerHTML="<b>Independent:</b> "+esc(current.controls?.[0]||"Variable A")+"<br><b>Dependent:</b> "+esc(current.columns?.[3]||"Result")+"<br><b>Controlled:</b> Keep other conditions constant.";$("#equationText").textContent=equation(current);
 const chemicalDetails=$("#chemicalDetailsText"),profile=chemistryProfile(current);
 if(chemicalDetails)chemicalDetails.innerHTML=profile?profile.requirements.map(r=>"<b>"+esc(r.chemical)+"</b> — "+(r.unit==="drops"?r.amount+" drops":r.amount+" "+r.unit)+(r.concentration?" · "+esc(r.concentration):"")+" → "+esc(r.target)).join("<br>"):"No chemical addition specified for this experiment.";$("#outcomesText").innerHTML="<li>Understand "+esc(current.name)+"</li><li>Collect repeated measurements</li><li>Analyse and explain evidence</li>";renderBench();renderDrawer();renderControls();renderProcedure();renderReadings();renderTable();renderNotebook();updateState()}

function renderInteractionGraphics(){
 const layer=$("#connectionLayer"),markers=$("#fiducials");
 if(layer)layer.innerHTML=(S.connections||[]).map(c=>{
  const a=S.setup[c.a],b=S.setup[c.b];if(!a||!b)return "";
  return '<line x1="'+a.x+'%" y1="'+a.y+'%" x2="'+b.x+'%" y2="'+b.y+'%" class="connection-line"/><circle cx="'+a.x+'%" cy="'+a.y+'%" r="1.5" class="connection-node"/><circle cx="'+b.x+'%" cy="'+b.y+'%" r="1.5" class="connection-node"/>';
 }).join("");
 if(markers)markers.innerHTML=(S.markers||[]).map(m=>'<div class="fiducial-marker" style="left:'+m.x+'%;top:'+m.y+'%"><span>'+m.id+'</span></div>').join("");
}
function selectConnection(index){
 if(!connectionMode)return false;
 if(connectionFirst===null){
  connectionFirst=index;
  document.querySelectorAll(".placed-item").forEach(x=>x.classList.toggle("connection-first",+x.dataset.index===index));
  toast("Now click the second apparatus");
  return true;
 }
 if(connectionFirst===index)return true;
 const exists=S.connections.some(c=>(c.a===connectionFirst&&c.b===index)||(c.a===index&&c.b===connectionFirst));
 if(!exists)S.connections.push({a:connectionFirst,b:index});
 connectionFirst=null;connectionMode=false;
 renderAll();save();toast("Wire connection added");
 return true;
}
function placeMarkerAtEvent(e){
 if(!markerMode)return false;
 const r=$("#bench").getBoundingClientRect();
 const x=Math.max(5,Math.min(95,((e.clientX-r.left)/r.width)*100));
 const y=Math.max(7,Math.min(90,((e.clientY-r.top)/r.height)*100));
 S.markers.push({id:S.markers.length+1,x:+x.toFixed(2),y:+y.toFixed(2)});
 markerMode=false;renderAll();save();toast("Fiducial marker "+S.markers.length+" placed");
 return true;
}

function enablePlacedDrag(el){
 el.addEventListener("pointerdown",e=>{
  if(e.target.closest(".remove-apparatus"))return;
  const i=+el.dataset.index;
  if(pourMode){e.preventDefault();pourChemical(i);return}
  if(selectConnection(i)){e.preventDefault();return}
  if(markerMode){e.preventDefault();return}
  e.preventDefault();
  const bench=$("#bench"),r=bench.getBoundingClientRect(),item=S.setup[i];
  const move=ev=>{const x=Math.max(6,Math.min(94,((ev.clientX-r.left)/r.width)*100));const y=Math.max(10,Math.min(88,((ev.clientY-r.top)/r.height)*100));item.x=+x.toFixed(2);item.y=+y.toFixed(2);el.style.left=item.x+"%";el.style.top=item.y+"%";renderInteractionGraphics()};
  const up=ev=>{el.releasePointerCapture?.(ev.pointerId);el.classList.remove("moving");el.removeEventListener("pointermove",move);el.removeEventListener("pointerup",up);save()};
  el.setPointerCapture?.(e.pointerId);el.classList.add("moving");el.addEventListener("pointermove",move);el.addEventListener("pointerup",up);
 });
}
function renderBench(){const p=$("#placedApparatus");p.innerHTML=S.setup.map((item,i)=>'<div class="placed-item" data-index="'+i+'" style="left:'+item.x+'%;top:'+item.y+'%"><span class="placed-visual">'+apparatusSvg(item.name)+'</span><b>'+esc(item.name)+'</b><button class="remove-apparatus" data-remove="'+i+'">×</button></div>').join("");$("#benchTip").classList.toggle("hidden",S.setup.length>0);p.querySelectorAll(".remove-apparatus").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();S.setup.splice(+b.dataset.remove,1);renderAll();toast("Apparatus removed")}));p.querySelectorAll(".placed-item").forEach(el=>enablePlacedDrag(el))}
function renderDrawer(){const box=$("#apparatusTray"),q=($("#apparatusSearch").value||"").toLowerCase(),items=req(current).filter(n=>n.toLowerCase().includes(q));box.innerHTML=items.map(n=>{const placed=S.setup.some(x=>x.name===n);return'<button class="apparatus-card '+(placed?"placed":"required")+'" data-name="'+esc(n)+'" '+(placed?"disabled":"")+'><span class="drawer-visual">'+apparatusSvg(n)+'</span><b>'+esc(n)+'</b><small>'+(placed?"PLACED":"REQUIRED")+'</small></button>'}).join("")||'<span style="font-size:9px;color:#aac">No matching apparatus.</span>';box.querySelectorAll(".apparatus-card:not([disabled])").forEach(b=>enableTrayDrag(b))}
function enableTrayDrag(el){el.addEventListener("pointerdown",e=>{if(e.button!==0)return;e.preventDefault();drag={name:el.dataset.name,moved:false,startX:e.clientX,startY:e.clientY,ghost:null,pointerId:e.pointerId};el.setPointerCapture?.(e.pointerId);document.addEventListener("pointermove",dragMove);document.addEventListener("pointerup",dragEnd,{once:true})})}
function dragMove(e){if(!drag)return;if(!drag.moved&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<4)return;if(!drag.moved){drag.moved=true;drag.ghost=document.createElement("div");drag.ghost.className="drag-ghost";drag.ghost.innerHTML=apparatusSvg(drag.name);document.body.appendChild(drag.ghost);$("#bench").classList.add("drag-target")}if(drag.ghost){drag.ghost.style.left=e.clientX+"px";drag.ghost.style.top=e.clientY+"px"}}
function dragEnd(e){if(!drag)return;const d=drag;drag=null;document.removeEventListener("pointermove",dragMove);$("#bench").classList.remove("drag-target");if(d.ghost)d.ghost.remove();if(!d.moved){toast("Drag the apparatus onto the bench to place it");return}const r=$("#bench").getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom){toast("Release the apparatus over the bench");return}placeAt(d.name,e.clientX,e.clientY)}
function placeAt(name,clientX,clientY){if(S.setup.some(x=>x.name===name)){toast(name+" is already on the bench");return}const r=$("#bench").getBoundingClientRect();const x=Math.max(6,Math.min(94,((clientX-r.left)/r.width)*100));const y=Math.max(10,Math.min(88,((clientY-r.top)/r.height)*100));S.setup.push({name,x:+x.toFixed(2),y:+y.toFixed(2),resistance:/resistor/i.test(name)?(S.resistorResistance||20):undefined});renderAll();toast(name+" placed exactly where you dropped it")}

function renderControls(){const box=$("#controls"),cs=(current.controls||["Variable A","Variable B"]).slice(0,2);box.innerHTML=cs.map((n,i)=>{const r=ranges(n);return'<div class="control"><label><span>'+esc(n)+'</span><output id="out'+i+'">'+S.values[i]+'</output></label><input class="range" data-i="'+i+'" type="range" min="'+r[0]+'" max="'+r[1]+'" step="'+r[2]+'" value="'+S.values[i]+'"></div>'}).join("");box.querySelectorAll(".range").forEach(x=>x.addEventListener("input",()=>{S.values[+x.dataset.i]=+x.value;$("#out"+x.dataset.i).textContent=x.value;renderReadings();save()}))}
function renderProcedure(){const items=["Read the objective: "+current.objective,"Place every required apparatus on the bench using the drawer.","Set "+(current.controls?.[0]||"the first variable")+" and "+(current.controls?.[1]||"the second variable")+" using the controls.","Start the experiment and observe the live response.","Record at least three measurements, changing one variable at a time.","Compare the evidence with the expected relationship: "+equation(current)];$("#procedureTab").innerHTML='<h3 class="procedure-title">Step-by-Step Guide</h3>'+items.map((t,i)=>'<div class="step"><span class="step-num">'+(i+1)+'</span><p>'+esc(t)+'</p></div>').join("")+'<div class="apparatus-check"><h4>Required Apparatus</h4>'+req(current).map(n=>{const done=S.setup.some(x=>x.name===n);return'<div class="check-row '+(done?"done":"")+'"><span>'+(done?"✓":"")+'</span>'+esc(n)+'</div>'}).join("")+'</div><p class="procedure-note">'+esc(current.safety||"Follow normal laboratory safety procedures.")+'</p>'}
function renderReadings(){const r=formula(current),b=$("#readings"),result=Number.isFinite(r)?r.toFixed(3):"∞";b.innerHTML='<div class="reading"><small>'+esc(current.controls?.[0]||"Variable A")+'</small><strong>'+Number(S.values[0]).toFixed(2)+'</strong><em>'+esc(current.units?.[0]||"")+'</em></div><div class="reading"><small>'+esc(current.controls?.[1]||"Variable B")+'</small><strong>'+Number(S.values[1]).toFixed(2)+'</strong><em>'+esc(current.units?.[1]||"")+'</em></div><div class="reading"><small>Calculated result</small><strong>'+result+'</strong><em>live simulation</em></div>'}
function renderTable(){const h=$("#thead"),b=$("#tbody"),cols=current.columns?.length?current.columns:["Trial","Variable A","Variable B","Result"];h.innerHTML=cols.map(c=>"<th>"+esc(c)+"</th>").join("");b.innerHTML=S.rows.map(r=>"<tr>"+r.map(v=>"<td>"+esc(v)+"</td>").join("")+"</tr>").join("")}
function updateState(){const ok=setupOK(),x=$("#runState");x.textContent=S.completed?"COMPLETE":S.running?"RUNNING":ok?"READY":"SETUP REQUIRED";x.className="run-state "+(S.completed||ok?"ready":S.running?"running":"");$("#startBtn").disabled=!ok||S.running;$("#recordBtn").disabled=!S.running||!ok;renderProcedure()}
function renderNotebook(){const box=$("#notebookTab"),raw=JSON.parse(localStorage.getItem("sls-redesign-notes")||"[]");box.innerHTML=raw.length?raw.slice(-15).reverse().map(n=>'<div class="notebook-entry"><b>'+esc(n.name)+'</b><small>'+esc(n.date)+'</small><p>'+esc(n.note)+'</p></div>').join(""):"<p style='font-size:9px;color:#72869a'>Recorded experiment notes will appear here.</p>"}
function start(){if(!setupOK())return toast("Place every required apparatus first");S.running=true;updateState();toast("Experiment started")}
function record(){if(!S.running)return toast("Start the experiment first");if(!setupOK())return toast("Complete the apparatus setup first");S.rows.push([String(S.rows.length+1),Number(S.values[0]).toFixed(2),Number(S.values[1]).toFixed(2),Number(formula(current)).toFixed(3)]);renderTable();toast("Reading recorded");save()}
function reset(){S=newState(current);renderAll();toast("Experiment reset")}
function finish(){if(!setupOK())return toast("Complete the apparatus setup first");if(S.rows.length<3)return toast("Record at least 3 measurements first");S.completed=true;updateState();const raw=JSON.parse(localStorage.getItem("sls-redesign-notes")||"[]");raw.push({name:current.name,date:new Date().toLocaleString(),note:"Completed with "+S.rows.length+" recorded measurements."});localStorage.setItem("sls-redesign-notes",JSON.stringify(raw.slice(-30)));renderNotebook();toast("Experiment complete");save()}
function bind(){$("#experimentSearch").addEventListener("input",renderExperimentList);$("#apparatusSearch").addEventListener("input",renderDrawer);$("#startBtn").addEventListener("click",start);$("#recordBtn").addEventListener("click",record);$("#resetBtn").addEventListener("click",reset);$("#finishBtn").addEventListener("click",finish);$("#instructionBtn").addEventListener("click",()=>document.querySelector(".procedure-panel").scrollIntoView({behavior:"smooth",block:"start"}));$("#experimentNav").addEventListener("click",()=>document.querySelector(".workspace-grid").scrollIntoView({behavior:"smooth"}));$("#learnNav").addEventListener("click",()=>document.querySelector(".info-grid").scrollIntoView({behavior:"smooth"}));$$(".tab").forEach(t=>t.addEventListener("click",()=>{$$(".tab").forEach(x=>x.classList.toggle("active",x===t));["procedure","notes","notebook"].forEach(id=>$("#"+id+"Tab").classList.toggle("hidden",id!==t.dataset.tab))}));$("#notesBox").addEventListener("input",()=>localStorage.setItem("sls-redesign-note-draft",$("#notesBox").value))}
function init(){subjectCards();bind();subject=null;current=null;S=null;$("#subjectModal").classList.remove("hidden");const draft=localStorage.getItem("sls-redesign-note-draft");if(draft)$("#notesBox").value=draft}

const CHEMICALS={
 "Water":{color:"#8fd7ff",symbol:"H2O"},
 "Dilute hydrochloric acid":{color:"#dcecff",symbol:"HCl"},
 "Dilute sodium hydroxide":{color:"#cfe7ff",symbol:"NaOH"},
 "Universal indicator":{color:"#7f8cff",symbol:"UI"},
 "Sodium thiosulfate solution":{color:"#d8e9ef",symbol:"Na2S2O3"},
 "Hydrogen peroxide":{color:"#d8f5ff",symbol:"H2O2"},
 "Iodine solution":{color:"#8b5a2b",symbol:"I2"},
 "Sodium hydrogencarbonate solution":{color:"#d7f1ff",symbol:"NaHCO3"},
 "Sucrose solution":{color:"#dcecff",symbol:"Sucrose"},
 "Salt solution":{color:"#dcecff",symbol:"Salt"},
 "Solvent":{color:"#d7f1ff",symbol:"Solvent"},
 "Ink sample":{color:"#394f9b",symbol:"Ink"},
 "Electrolyte solution":{color:"#b8e9f4",symbol:"Electrolyte"},
 "Metal salt solution":{color:"#7ec5d7",symbol:"Salt"}
};
let selectedChemical=null,pourMode=false,connectionMode=false,connectionFirst=null,markerMode=false,pourQuantity=10;
const APPARATUS_CAPACITY_ML={
 "test tube":20,"test tubes":20,"beaker":100,"conical flask":100,"flask":100,
 "evaporating basin":75,"crucible":30,"volumetric flask":100,"measuring cylinder":100,
 "burette":50,"volumetric pipette":25,"pipette":25,"spotting tile":5,"gas syringe":100
};
function apparatusCapacity(name){
 const n=String(name||"").toLowerCase();
 const key=Object.keys(APPARATUS_CAPACITY_ML).find(k=>n.includes(k));
 return key?APPARATUS_CAPACITY_ML[key]:100;
}
function formatQuantity(amount,unit){
 const a=Number(amount)||0;
 return unit==="drops"?a.toFixed(0)+" drops":a.toFixed(unit==="g"||unit==="mg"?2:1)+" "+unit;
}
function chemicalColor(chemical){
 const c=String(chemical||"").toLowerCase();
 if(c.includes("copper(ii) sulfate")||c.includes("copper sulfate"))return "#4b8fe8";
 if(c.includes("potassium manganate")||c.includes("permanganate"))return "#8d2ac4";
 if(c.includes("bromine"))return "#e78b25";
 if(c.includes("iodine"))return "#6b4326";
 if(c.includes("methyl orange"))return "#f4a84a";
 if(c.includes("universal indicator"))return "#5b67d8";
 if(c.includes("thymolphthalein"))return "#8aa8ff";
 if(c.includes("hydrated copper"))return "#3d8ee8";
 if(c.includes("metal salt"))return "#7ec5d7";
 if(c.includes("water"))return "#8fd7ff";
 return CHEMICALS[chemical]?.color||"#cfe7ff";
}
function targetLiquidState(target){
 const liquids=target?.liquid||[];
 const total=liquids.filter(x=>x.unit==="mL").reduce((s,x)=>s+Number(x.amount||0),0);
 const cap=apparatusCapacity(target?.name);
 const byChemical={};
 liquids.forEach(x=>{byChemical[x.chemical]=(byChemical[x.chemical]||0)+Number(x.amount||0)});
 let color=liquids.length?chemicalColor(liquids[liquids.length-1].chemical):"#8fd7ff";
 const names=Object.keys(byChemical).map(x=>x.toLowerCase());
 if(names.some(x=>x.includes("methyl orange"))&&names.some(x=>x.includes("sodium hydroxide")))color="#f4d34f";
 if(names.some(x=>x.includes("methyl orange"))&&names.some(x=>x.includes("sulfuric acid"))){
   const acidKey=Object.keys(byChemical).find(x=>x.toLowerCase().includes("sulfuric acid"));
   const acid=acidKey?byChemical[acidKey]:0;
   color=acid<20?"#f4a84a":acid===20?"#f28c3c":"#e65a4d";
 }
 if(names.some(x=>x.includes("copper(ii) sulfate"))&&names.some(x=>x.includes("sodium hydroxide")))color="#9ac9f4";
 if(names.some(x=>x.includes("copper(ii) sulfate"))&&names.some(x=>x.includes("aqueous ammonia")))color="#244fce";
 const height=Math.max(3,Math.min(48,(total/cap)*100));
 return {total,cap,color,height,percent:Math.min(100,(total/cap)*100)};
}


/* IGCSE 0620 chemistry accuracy layer: quantities, concentrations and observable results.
   Quantities below are virtual-practical settings based on Cambridge IGCSE examples and the
   standard 2026-2028 bench reagents. Cambridge's confidential instructions can vary by exam. */
Object.assign(CHEMICALS,{
 "Aqueous sodium hydroxide":{color:"#cfe7ff",symbol:"NaOH"},
 "Sulfuric acid":{color:"#e4efff",symbol:"H2SO4"},
 "Methyl orange indicator":{color:"#f4a84a",symbol:"MO"},
 "Thymolphthalein indicator":{color:"#8aa8ff",symbol:"TP"},
 "Copper(II) sulfate solution":{color:"#4b8fe8",symbol:"CuSO4"},
 "Dilute nitric acid":{color:"#eaf4ff",symbol:"HNO3"},
 "Aqueous silver nitrate":{color:"#e7eef4",symbol:"AgNO3"},
 "Aqueous barium nitrate":{color:"#e7eef4",symbol:"Ba(NO3)2"},
 "Aqueous ammonia":{color:"#eef7ff",symbol:"NH3"},
 "Potassium manganate(VII)":{color:"#7d2bb8",symbol:"KMnO4"},
 "Acidified potassium manganate(VII)":{color:"#8d2ac4",symbol:"KMnO4"},
 "Potassium iodide":{color:"#e8f3ff",symbol:"KI"},
 "Limewater":{color:"#f8fbff",symbol:"Ca(OH)2"},
 "Calcium carbonate":{color:"#f0f0ea",symbol:"CaCO3"},
 "Bromine water":{color:"#e78b25",symbol:"Br2"},
 "Anhydrous copper(II) sulfate":{color:"#f4f4f0",symbol:"CuSO4"},
 "Hydrated copper(II) sulfate":{color:"#3d8ee8",symbol:"CuSO4·5H2O"},
 "Alkene sample":{color:"#eef8ff",symbol:"C=C"},
 "Sulfite sample":{color:"#eef8ff",symbol:"SO3²−"},
 "Sodium carbonate solution":{color:"#e7f1ff",symbol:"Na2CO3"},
 "Chloride sample":{color:"#dcecff",symbol:"Cl−"},
 "Bromide sample":{color:"#dcecff",symbol:"Br−"},
 "Iodide sample":{color:"#dcecff",symbol:"I−"},
 "Sulfate sample":{color:"#dcecff",symbol:"SO4²−"},
 "Carbonate sample":{color:"#dcecff",symbol:"CO3²−"},
 "Ammonium sample":{color:"#dcecff",symbol:"NH4+"},
 "Nitrate sample":{color:"#dcecff",symbol:"NO3−"},
 "Metal salt sample":{color:"#dcecff",symbol:"Salt"},
 "Ethanol sample":{color:"#eef8ff",symbol:"C2H5OH"},
 "Ethanoic acid sample":{color:"#eef8ff",symbol:"CH3COOH"},
 "Magnesium ribbon":{color:"#b7bec6",symbol:"Mg"},
 "Aluminium foil":{color:"#d9dde2",symbol:"Al"},
 "Hydrated copper(II) sulfate":{color:"#3d8ee8",symbol:"CuSO4·5H2O"}
});

const IGCSE_CHEMISTRY={
 "acid-base":{
  label:"Acid–alkali titration",
  basis:"Cambridge IGCSE 0620 titration example",
  requirements:[
   {chemical:"Aqueous sodium hydroxide",amount:25,unit:"mL",concentration:"0.200 mol/dm³",target:"Conical flask",role:"sample"},
   {chemical:"Methyl orange indicator",amount:3,unit:"drops",target:"Conical flask",role:"indicator"},
   {chemical:"Sulfuric acid",amount:20,unit:"mL",concentration:"unknown; endpoint example 20.0 mL",target:"Burette",role:"titrant"}
  ],
  observation:"Methyl orange is yellow in the alkaline flask and changes through orange at the end-point. Red means the end-point has been overshot.",
  reaction:"H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O"
 },
 "ph-indicators":{
  label:"Indicators across the pH scale",
  basis:"IGCSE practical observation of indicator colour",
  requirements:[
   {chemical:"Universal indicator",amount:10,unit:"mL",target:"Spotting tile",role:"indicator sample"}
  ],
  observation:"Universal indicator gives a gradual colour scale: strongly acidic solutions are red/orange, neutral is green, and strongly alkaline solutions are blue/purple.",
  reaction:"No new substance is required; this is an indicator colour observation."
 },
 "rates":{
  label:"Rate of reaction — thiosulfate and acid",
  basis:"IGCSE rate-of-reaction practical model",
  requirements:[
   {chemical:"Sodium thiosulfate solution",amount:50,unit:"mL",concentration:"0.10 mol/dm³",target:"Conical flask",role:"reactant"},
   {chemical:"Dilute hydrochloric acid",amount:10,unit:"mL",concentration:"1.0 mol/dm³",target:"Conical flask",role:"reactant"}
  ],
  observation:"The initially clear mixture becomes cloudy as sulfur forms; the cloudiness increases until the marked endpoint is obscured.",
  reaction:"Na₂S₂O₃ + 2HCl → 2NaCl + SO₂ + S + H₂O"
 },
 "electrolysis":{
  label:"Electrolysis of aqueous copper(II) sulfate",
  basis:"Cambridge 0620 electrolysis context",
  requirements:[
   {chemical:"Copper(II) sulfate solution",amount:50,unit:"mL",concentration:"0.10 mol/dm³",target:"Beaker",role:"electrolyte"}
  ],
  observation:"With inert carbon/graphite electrodes, copper forms as a reddish-brown deposit at the cathode, oxygen bubbles form at the anode, and the blue solution becomes paler as Cu²⁺ ions are removed.",
  reaction:"Cathode: Cu²⁺ + 2e⁻ → Cu; anode: 4OH⁻ → O₂ + 2H₂O + 4e⁻"
 },
 "displacement":{
  label:"Metal displacement from copper(II) sulfate",
  basis:"Cambridge IGCSE displacement practical examples",
  requirements:[
   {chemical:"Copper(II) sulfate solution",amount:25,unit:"mL",concentration:"0.10 mol/dm³",target:"Beaker",role:"salt solution"}
  ],
  observation:"With iron, the blue Cu²⁺ solution changes toward green as Fe²⁺ forms and a brown copper deposit appears. With zinc, the blue solution becomes colourless and brown copper is deposited. Copper itself gives no displacement.",
  reaction:"Fe + CuSO₄ → FeSO₄ + Cu"
 },
 "flame":{
  label:"Flame tests",
  basis:"Cambridge 0620 qualitative analysis",
  requirements:[
   {chemical:"Metal salt sample",amount:0.1,unit:"g",target:"Nichrome wire",role:"salt sample"},
   {chemical:"Dilute hydrochloric acid",amount:2,unit:"mL",concentration:"1.0 mol/dm³",target:"Nichrome wire",role:"cleaning acid"}
  ],
  observation:"Characteristic flame colours: Li⁺ red, Na⁺ yellow, K⁺ lilac, Ca²⁺ orange-red, Ba²⁺ light green, Cu²⁺ blue-green.",
  reaction:"No single solution colour change; the diagnostic observation is the flame colour."
 },
 "salt-preparation":{
  label:"Preparation of a soluble salt by neutralisation",
  basis:"IGCSE salt-preparation method",
  requirements:[
   {chemical:"Dilute hydrochloric acid",amount:25,unit:"mL",concentration:"1.0 mol/dm³",target:"Conical flask",role:"acid"},
   {chemical:"Aqueous sodium hydroxide",amount:25,unit:"mL",concentration:"1.0 mol/dm³",target:"Conical flask",role:"alkali"}
  ],
  observation:"Neutralisation itself has no required diagnostic colour change; the product solution should be concentrated and crystallised rather than judged by an indicator.",
  reaction:"HCl + NaOH → NaCl + H₂O"
 },
 "water-of-crystallisation":{
  label:"Determining water of crystallisation",
  basis:"Cambridge IGCSE 0620: heat a hydrated salt to constant mass",
  requirements:[
   {chemical:"Hydrated copper(II) sulfate",amount:2,unit:"g",target:"Evaporating basin",role:"hydrated salt"}
  ],
  observation:"Blue hydrated copper(II) sulfate loses water on heating and becomes white/grey anhydrous copper(II) sulfate. Repeated heating and weighing should give two consecutive equal masses (constant mass).",
  reaction:"CuSO₄·5H₂O(s) ⇌ CuSO₄(s) + 5H₂O(g)"
 },
 "gravimetric-carbonate":{
  label:"Carbonate reaction",
  basis:"IGCSE carbonate test",
  requirements:[
   {chemical:"Carbonate sample",amount:2,unit:"mL",target:"Test tube",role:"sample"},
   {chemical:"Dilute hydrochloric acid",amount:2,unit:"mL",concentration:"1.0 mol/dm³",target:"Test tube",role:"acid"}
  ],
  observation:"Effervescence occurs as carbon dioxide is produced. The gas turns limewater milky.",
  reaction:"CO₃²⁻ + 2H⁺ → CO₂ + H₂O"
 },
 "gas-volume-from-carbonate":{
  label:"Gas volume from a carbonate",
  basis:"IGCSE quantitative carbonate–acid experiment",
  requirements:[
   {chemical:"Dilute hydrochloric acid",amount:25,unit:"mL",concentration:"1.0 mol/dm³",target:"Conical flask",role:"acid"},
   {chemical:"Calcium carbonate",amount:1,unit:"g",target:"Conical flask",role:"solid carbonate"}
  ],
  observation:"Rapid effervescence produces carbon dioxide; the rate falls as the limiting reactant is consumed.",
  reaction:"CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂"
 },
 "enthalpy-neutralisation":{
  label:"Enthalpy change of neutralisation",
  basis:"IGCSE temperature-change practical",
  requirements:[
   {chemical:"Dilute hydrochloric acid",amount:25,unit:"mL",concentration:"1.0 mol/dm³",target:"Insulating cup",role:"acid"},
   {chemical:"Aqueous sodium hydroxide",amount:25,unit:"mL",concentration:"1.0 mol/dm³",target:"Insulating cup",role:"alkali"}
  ],
  observation:"The temperature rises because neutralisation is exothermic. No diagnostic colour change is required.",
  reaction:"H⁺ + OH⁻ → H₂O"
 },
 "rate-and-concentration":{
  label:"Rate and concentration",
  basis:"IGCSE rate practical",
  requirements:[
   {chemical:"Sodium thiosulfate solution",amount:25,unit:"mL",concentration:"variable",target:"Conical flask",role:"reactant"},
   {chemical:"Dilute hydrochloric acid",amount:10,unit:"mL",concentration:"1.0 mol/dm³",target:"Conical flask",role:"reactant"}
  ],
  observation:"The mixture becomes increasingly cloudy as sulfur precipitates. Higher thiosulfate concentration gives a shorter time to the visual endpoint when the acid volume is controlled.",
  reaction:"Na₂S₂O₃ + 2HCl → 2NaCl + SO₂ + S + H₂O"
 },
 "rate-and-temperature":{
  label:"Rate and temperature",
  basis:"IGCSE rate practical",
  requirements:[
   {chemical:"Sodium thiosulfate solution",amount:25,unit:"mL",concentration:"0.10 mol/dm³",target:"Conical flask",role:"reactant"},
   {chemical:"Dilute hydrochloric acid",amount:10,unit:"mL",concentration:"1.0 mol/dm³",target:"Conical flask",role:"reactant"}
  ],
  observation:"The same sulfur-forming reaction is timed at different controlled temperatures; the visible endpoint is cloudiness.",
  reaction:"Na₂S₂O₃ + 2HCl → 2NaCl + SO₂ + S + H₂O"
 },
 "rate-surface":{
  label:"Rate and surface area",
  basis:"IGCSE marble–acid rate practical",
  requirements:[
   {chemical:"Dilute hydrochloric acid",amount:25,unit:"mL",concentration:"1.0 mol/dm³",target:"Conical flask",role:"acid"},
   {chemical:"Calcium carbonate",amount:1,unit:"g",target:"Conical flask",role:"solid carbonate"}
  ],
  observation:"Effervescence produces CO₂. Powdered carbonate reacts faster than the same mass as larger chips because it has greater surface area.",
  reaction:"CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂"
 },
 "qualitative-cations":{
  label:"Qualitative analysis — aqueous cations",
  basis:"Cambridge 0620 qualitative-analysis notes",
  requirements:[
   {chemical:"Copper(II) sulfate solution",amount:2,unit:"mL",concentration:"sample concentration",target:"Test tube",role:"cation sample"},
   {chemical:"Aqueous sodium hydroxide",amount:2,unit:"mL",concentration:"1.0 mol/dm³",target:"Test tube",role:"test reagent"},
   {chemical:"Aqueous ammonia",amount:2,unit:"mL",concentration:"1.0 mol/dm³",target:"Test tube",role:"separate test portion"}
  ],
  observation:"For Cu²⁺, sodium hydroxide gives a light-blue precipitate insoluble in excess. Aqueous ammonia gives a light-blue precipitate that dissolves in excess to form a dark-blue solution. Other IGCSE cations have the characteristic results listed in the Cambridge qualitative-analysis notes.",
  reaction:"Cu²⁺ + 2OH⁻ → Cu(OH)₂(s)"
 },
 "qualitative-anions":{
  label:"Qualitative analysis — aqueous anions",
  basis:"Cambridge 0620 qualitative-analysis notes",
  requirements:[
   {chemical:"Chloride sample",amount:2,unit:"mL",target:"Test tube",role:"example unknown"},
   {chemical:"Dilute nitric acid",amount:1,unit:"mL",concentration:"1.0 mol/dm³",target:"Test tube",role:"acidify"},
   {chemical:"Aqueous silver nitrate",amount:1,unit:"mL",concentration:"0.05 mol/dm³",target:"Test tube",role:"halide test reagent"}
  ],
  observation:"IGCSE anion tests are distinct tests on separate portions: chloride gives a white silver halide precipitate, bromide cream, iodide yellow; nitrate gives ammonia after sodium hydroxide and aluminium foil on warming; sulfate gives a white barium sulfate precipitate; sulfite decolourises acidified manganate(VII); carbonate gives effervescence and carbon dioxide.",
  reaction:"Ag⁺ + Cl⁻ → AgCl(s); Ba²⁺ + SO₄²⁻ → BaSO₄(s)"
 },
 "halide":{
  label:"Test for halide ions",
  basis:"Cambridge 0620 qualitative-analysis notes",
  requirements:[
   {chemical:"Chloride sample",amount:2,unit:"mL",target:"Test tube",role:"sample"},
   {chemical:"Dilute nitric acid",amount:1,unit:"mL",concentration:"1.0 mol/dm³",target:"Test tube",role:"acidify"},
   {chemical:"Aqueous silver nitrate",amount:1,unit:"mL",concentration:"0.05 mol/dm³",target:"Test tube",role:"test reagent"}
  ],
  observation:"Silver nitrate gives a white precipitate for chloride, cream for bromide and yellow for iodide.",
  reaction:"Ag⁺ + X⁻ → AgX(s)"
 },
 "sulfate":{
  label:"Test for sulfate ions",
  basis:"Cambridge 0620 qualitative-analysis notes",
  requirements:[
   {chemical:"Sulfate sample",amount:2,unit:"mL",target:"Test tube",role:"sample"},
   {chemical:"Dilute nitric acid",amount:1,unit:"mL",concentration:"1.0 mol/dm³",target:"Test tube",role:"acidify"},
   {chemical:"Aqueous barium nitrate",amount:1,unit:"mL",concentration:"0.10 mol/dm³",target:"Test tube",role:"test reagent"}
  ],
  observation:"A white precipitate of barium sulfate forms.",
  reaction:"Ba²⁺ + SO₄²⁻ → BaSO₄(s)"
 },
 "ammonium":{
  label:"Test for ammonium ions",
  basis:"Cambridge 0620 qualitative-analysis notes",
  requirements:[
   {chemical:"Ammonium sample",amount:2,unit:"mL",target:"Test tube",role:"sample"},
   {chemical:"Aqueous sodium hydroxide",amount:2,unit:"mL",concentration:"1.0 mol/dm³",target:"Test tube",role:"test reagent"}
  ],
  observation:"On warming, ammonia gas is produced and turns damp red litmus paper blue.",
  reaction:"NH₄⁺ + OH⁻ → NH₃ + H₂O"
 },
 "water-test":{
  label:"Chemical test for water",
  basis:"Cambridge IGCSE water-test context",
  requirements:[
   {chemical:"Anhydrous copper(II) sulfate",amount:1,unit:"g",target:"Test tube",role:"test solid"},
   {chemical:"Water",amount:2,unit:"mL",target:"Test tube",role:"sample"}
  ],
  observation:"White anhydrous copper(II) sulfate turns blue when water is added.",
  reaction:"CuSO₄ + 5H₂O → CuSO₄·5H₂O"
 },
 "alkene":{
  label:"Test for an unsaturated hydrocarbon",
  basis:"Cambridge IGCSE bromine-water test",
  requirements:[
   {chemical:"Alkene sample",amount:2,unit:"mL",target:"Test tube",role:"unknown hydrocarbon"},
   {chemical:"Bromine water",amount:2,unit:"mL",target:"Test tube",role:"test reagent"}
  ],
  observation:"Bromine water is orange/brown and decolourises when an alkene is present; a saturated hydrocarbon leaves the bromine colour unchanged.",
  reaction:"C=C + Br₂ → dibromo compound"
 },
 "alcohol-oxidation":{
  label:"Alcohol oxidation",
  basis:"Cambridge IGCSE 0620 organic chemistry",
  requirements:[
   {chemical:"Ethanol sample",amount:2,unit:"mL",target:"Test tube",role:"alcohol sample"},
   {chemical:"Acidified potassium manganate(VII)",amount:2,unit:"mL",concentration:"0.01 mol/dm³ KMnO₄ in 0.5 mol/dm³ H₂SO₄",target:"Test tube",role:"oxidising agent"}
  ],
  observation:"On warming an ethanol sample with acidified potassium manganate(VII), the purple oxidising solution is decolourised as ethanol is oxidised; with sufficient oxidation, ethanoic acid is formed.",
  reaction:"CH₃CH₂OH + 2[O] → CH₃COOH + H₂O"
 },
 "sulfite":{
  label:"Test for sulfite",
  basis:"Cambridge 0620 qualitative-analysis notes",
  requirements:[
   {chemical:"Acidified potassium manganate(VII)",amount:2,unit:"mL",concentration:"0.01 mol/dm³ KMnO₄ in 0.5 mol/dm³ H₂SO₄",target:"Test tube",role:"test reagent"}
  ],
  observation:"Acidified potassium manganate(VII) changes from purple to colourless when sulfite/SO₂ reduces it.",
  reaction:"MnO₄⁻ is reduced as the reducing agent is oxidised."
 }
};

function chemistryProfile(e){
 const id=(e?.id||"").toLowerCase(),t=(e?.type||"").toLowerCase(),n=(e?.name||"").toLowerCase();
 if(id==="acid-base")return IGCSE_CHEMISTRY["acid-base"];
 if(id==="ph-indicators")return IGCSE_CHEMISTRY["ph-indicators"];
 if(id==="rates")return IGCSE_CHEMISTRY.rates;
 if(id==="electrolysis")return IGCSE_CHEMISTRY.electrolysis;
 if(id==="displacement")return IGCSE_CHEMISTRY.displacement;
 if(id==="flame-tests")return IGCSE_CHEMISTRY.flame;
 if(id==="salt-preparation")return IGCSE_CHEMISTRY["salt-preparation"];
 if(id==="determining-water-of-crystallisation")return IGCSE_CHEMISTRY["water-of-crystallisation"];
 if(id==="gravimetric-analysis-of-a-carbonate")return IGCSE_CHEMISTRY["gravimetric-carbonate"];
 if(id==="gas-volume-from-a-carbonate")return IGCSE_CHEMISTRY["gas-volume-from-carbonate"];
 if(id==="enthalpy-change-of-neutralisation")return IGCSE_CHEMISTRY["enthalpy-neutralisation"];
 if(id==="rate-and-concentration")return IGCSE_CHEMISTRY["rate-and-concentration"];
 if(id==="rate-and-temperature")return IGCSE_CHEMISTRY["rate-and-temperature"];
 if(id==="rate-and-surface-area")return IGCSE_CHEMISTRY["rate-surface"];
 if(id==="qualitative-analysis-of-cations")return IGCSE_CHEMISTRY["qualitative-cations"];
 if(id==="qualitative-analysis-of-anions")return IGCSE_CHEMISTRY["qualitative-anions"];
 if(id==="test-for-halide-ions")return IGCSE_CHEMISTRY.halide;
 if(id==="test-for-sulfate-ions")return IGCSE_CHEMISTRY.sulfate;
 if(id==="test-for-ammonium-ions")return IGCSE_CHEMISTRY.ammonium;
 if(id==="organic-functional-group-tests")return IGCSE_CHEMISTRY["alcohol-oxidation"];
 if(id==="alcohol-oxidation")return IGCSE_CHEMISTRY["alcohol-oxidation"];
 if(id==="alkene-addition-reaction-model"||n.includes("alkene addition"))return IGCSE_CHEMISTRY.alkene;
 if(n.includes("water")&&n.includes("crystall"))return IGCSE_CHEMISTRY["water-of-crystallisation"];
 if(n.includes("water")&&n.includes("test"))return IGCSE_CHEMISTRY["water-test"];
 if(n.includes("sulfite"))return IGCSE_CHEMISTRY.sulfite;
 if(t==="rates")return IGCSE_CHEMISTRY.rates;
 return null;
}

function chemistryAmount(chemical){
 return (S.pours||[]).filter(p=>p.chemical===chemical).reduce((sum,p)=>sum+(p.amount||0),0);
}
function chemistryNeed(profile,chemical){
 return (profile?.requirements||[]).find(r=>r.chemical===chemical);
}
function chemistryFulfilled(profile,need){
 return chemistryAmount(need.chemical)>=need.amount;
}
function targetMatches(target,need){
 const n=(target?.name||"").toLowerCase(),t=(need?.target||"").toLowerCase();
 if(t==="bench"||t==="spotting tile"&&n.includes("spotting"))return true;
 return n===t||n.includes(t)||t.includes(n);
}

function ensureInteractionState(){
 if(!S.chemicals)S.chemicals={};
 if(!S.pours)S.pours=[];
 if(!S.connections)S.connections=[];
 if(!S.markers)S.markers=[];
 const profile=chemistryProfile(current);
 (profile?.requirements||[]).forEach(r=>{
  if(!S.chemicals[r.chemical])S.chemicals[r.chemical]={quantity:/^(g|mg)$/.test(r.unit)?100:250,unit:r.unit};
 });
}

function interactionSpec(e){
 const profile=normalizeSubject(e?.subject)==="Chemistry"?chemistryProfile(e):null;
 const t=(e?.type||"").toLowerCase(),m=(e?.materials||[]).join(" ").toLowerCase();
 const wires=/wire|wires|connecting/.test(m)||["ohm","series","parallel","electrolysis"].includes(t);
 const markers=/lens|refraction|diffraction|interference|projectile|pendulum|free-fall|inclined|wave|calibration|measurement/.test((e?.name||"").toLowerCase());
 return {
  chemicals:(profile?.requirements||[]).map(r=>r.chemical),
  requirements:profile?.requirements||[],
  profile,
  wires,
  connections:wires?(t==="series"||t==="parallel"?3:1):0,
  markers:markers?2:0
 };
}

function interactionOK(){
 ensureInteractionState();
 const spec=interactionSpec(current);
 return {
  chemOK:spec.requirements.every(r=>chemistryFulfilled(spec.profile,r)),
  wireOK:!spec.wires||S.connections.length>=spec.connections,
  markerOK:!spec.markers||S.markers.length>=spec.markers,
  spec
 };
}

function setupOK(){
 ensureInteractionState();
 const have=S.setup.map(x=>String(x.name).toLowerCase());
 const apparatusOK=req(current).every(r=>have.some(h=>h===r.toLowerCase()||h.includes(r.toLowerCase())||r.toLowerCase().includes(h)));
 const io=interactionOK();
 return apparatusOK&&io.chemOK&&io.wireOK&&io.markerOK;
}

function renderChemicals(){
 ensureInteractionState();
 const box=$("#chemicalTray"),status=$("#chemicalStatus"),spec=interactionSpec(current);
 if(!box||!current)return;
 const reqs=spec.requirements||[];
 if(!reqs.length){
  box.innerHTML='<div class="chemical-empty"><b>No reagent addition required</b><small>This experiment uses apparatus, samples or measurements rather than a reagent transfer.</small></div>';
  if(status)status.textContent="No reagent setup required.";
  return;
 }
 const activeNeed=selectedChemical?chemistryNeed(spec.profile,selectedChemical):reqs.find(r=>!chemistryFulfilled(spec.profile,r));
 const activeRemaining=activeNeed?Math.max(0,activeNeed.amount-chemistryAmount(activeNeed.chemical)):0;
 const quantityChoices=activeNeed?(activeNeed.unit==="drops"?[1,2,3,5]:activeNeed.unit==="g"?[0.1,0.5,1,2,5,10]:[1,2,5,10,20,25,50]).filter(v=>v<=activeRemaining||v===activeRemaining).map(v=>'<option value="'+v+'">'+v+' '+(activeNeed.unit==="drops"?"drops":activeNeed.unit)+'</option>').join(""):"";
 const targetOptions=S.setup.map((x,i)=>'<option value="'+i+'">'+esc(x.name)+'</option>').join("");
 const options=reqs.map(r=>{
  const done=Math.min(chemistryAmount(r.chemical),r.amount);
  const label=r.unit==="drops"?r.amount+" drops":r.amount+" "+r.unit;
  return '<option value="'+esc(r.chemical)+'" '+(selectedChemical===r.chemical?"selected":"")+' '+(done>=r.amount?"disabled":"")+'>'+esc(r.chemical)+' — '+done.toFixed(r.unit==="drops"?0:1)+' / '+label+(r.concentration?" · "+esc(r.concentration):"")+'</option>';
 }).join("");
 box.innerHTML=
 '<div class="chemical-selected-card"><span class="chemical-bottle-icon">🧪</span><div><b>Set a chemical</b><small>Choose the reagent, amount and target apparatus.</small></div></div>'+
 '<label class="picker-label">Chemical / indicator</label><select id="chemicalSelect" class="interaction-select"><option value="">Choose a chemical…</option>'+options+'</select>'+
 '<label class="picker-label">Quantity</label><select id="quantitySelect" class="interaction-select">'+(quantityChoices||'<option value="">Complete / choose chemical</option>')+'</select>'+
 '<label class="picker-label">Target apparatus</label><select id="chemicalTargetSelect" class="interaction-select"><option value="">Choose target…</option>'+targetOptions+'</select>'+
 '<button id="chemicalPourBtn" class="interaction-action '+(pourMode?"active":"")+'">💧 '+(pourMode?"Click apparatus to add":"Add / pour into target")+'</button>'+
 '<button id="chemicalPourModeBtn" class="chemical-mode-btn '+(pourMode?"active":"")+'">Direct placement mode</button>'+
 '<div class="chemical-stock-title">Required reagents</div>'+
 '<div class="chemical-stock-grid">'+reqs.map(r=>{
   const stock=S.chemicals[r.chemical]||{};
   const available=stock.quantity!=null?stock.quantity:(stock.volume??(/^(g|mg)$/.test(r.unit)?100:250));
   const done=Math.min(chemistryAmount(r.chemical),r.amount);
   return '<div class="stock-chip '+(done>=r.amount?"complete":"")+'"><b>'+esc(r.chemical)+'</b><small>Need '+(r.unit==="drops"?r.amount+" drops":r.amount+" "+r.unit)+' · Done '+done.toFixed(r.unit==="drops"?0:1)+' · Stock '+available.toFixed(1)+' '+esc(r.unit)+'</small></div>';
 }).join("")+'</div>'+
 '<div class="chemical-status-box">'+(selectedChemical?"Selected: <b>"+esc(selectedChemical)+"</b>":"Select a reagent to begin.")+'</div>';

 $("#chemicalSelect")?.addEventListener("change",()=>{
  selectedChemical=$("#chemicalSelect").value||null;
  const selectedNeed=selectedChemical?chemistryNeed(spec.profile,selectedChemical):null;
  pourQuantity=selectedNeed?Math.min(10,Math.max(selectedNeed.unit==="drops"?1:0.1,selectedNeed.amount-chemistryAmount(selectedNeed.chemical))):10;
  const qs=$("#quantitySelect");
  if(qs&&selectedNeed){
   const vals=selectedNeed.unit==="drops"?[1,2,3,5]:selectedNeed.unit==="g"?[0.1,0.5,1,2,5,10]:[1,2,5,10,20,25,50];
   const left=Math.max(0,selectedNeed.amount-chemistryAmount(selectedNeed.chemical));
   qs.innerHTML=vals.filter(v=>v<=left).map(v=>'<option value="'+v+'">'+v+' '+(selectedNeed.unit==="drops"?"drops":selectedNeed.unit)+'</option>').join("")||'<option value="">Complete</option>';
   if(qs.options.length)qs.value=String(Math.min(pourQuantity,+qs.options[qs.options.length-1].value));
  }
  renderChemicals();
 });
 $("#quantitySelect")?.addEventListener("change",()=>{pourQuantity=+$("#quantitySelect").value||pourQuantity});
 $("#chemicalTargetSelect")?.addEventListener("change",e=>{
   const idx=Number(e.target.value);
   if(Number.isInteger(idx)){S.selectedApparatus=idx;renderConnections();renderBench();save();}
 });
 $("#chemicalPourBtn")?.addEventListener("click",()=>{
   const need=chemistryNeed(spec.profile,selectedChemical);
   const target=Number($("#chemicalTargetSelect")?.value);
   if(!need)return toast("Choose one of the required reagents first");
   if(Number.isInteger(target)){pourChemical(target);}
   else {pourMode=true;connectionMode=false;connectionFirst=null;markerMode=false;document.querySelectorAll(".placed-item").forEach(x=>x.classList.add("pour-target"));renderConnections();toast("Select the target apparatus on the bench")}
 });
 $("#chemicalPourModeBtn")?.addEventListener("click",()=>{
   pourMode=!pourMode;
   if(pourMode){connectionMode=false;connectionFirst=null;markerMode=false}
   document.querySelectorAll(".placed-item").forEach(x=>x.classList.toggle("pour-target",pourMode));
   renderChemicals();
 });
 if(status)status.textContent=selectedChemical?"Selected "+selectedChemical:"Choose a chemical for this experiment.";
 renderConnections();
}

function renderReactionProfile(spec){
 const p=spec.profile;if(!p)return "";
 const rows=p.requirements.map(r=>{
  const done=Math.min(chemistryAmount(r.chemical),r.amount);
  const target=esc(r.target),amount=(r.unit==="drops"?r.amount+" drops":r.amount+" "+r.unit);
  return '<div class="reaction-row '+(done>=r.amount?"done":"")+'"><span>'+(done>=r.amount?"✓":"○")+'</span><b>'+esc(r.chemical)+'</b><small>'+done.toFixed(r.unit==="drops"?0:1)+' / '+amount+(r.concentration?" · "+esc(r.concentration):"")+' · '+target+'</small></div>';
 }).join("");
 const ready=p.requirements.every(r=>chemistryFulfilled(p,r));
 return '<div class="reaction-profile"><div class="reaction-profile-head"><strong>IGCSE-aligned reaction profile</strong><small>'+esc(p.basis)+'</small><small>Quantities shown are virtual-practical settings unless the profile cites a Cambridge example; exam Confidential Instructions may vary.</small></div>'+rows+
  '<div class="reaction-observation"><b>Expected observation:</b> '+esc(p.observation)+'</div>'+
  '<div class="reaction-equation"><b>Equation / principle:</b> '+esc(p.reaction)+'</div>'+
  '<div class="reaction-ready '+(ready?"ready":"")+'">'+(ready?"Setup quantities complete — observe the expected result.":"Complete the specified quantities before starting.")+'</div></div>';
}


function opKind(name){
 const n=String(name||"").toLowerCase();
 if(n.includes("burette"))return"burette";
 if(n.includes("dropping pipette")||n.includes("teat pipette")||n.includes("dropper")||n.includes("pasteur pipette"))return"dropper";
 if(n.includes("volumetric pipette")||n==="pipette"||n.includes("pipette "))return"pipette";
 if(n.includes("syringe"))return"syringe";
 if(n.includes("measuring cylinder"))return"cylinder";
 if(n.includes("thermometer"))return"thermometer";
 if(n.includes("balance"))return"balance";
 if(n.includes("microscope"))return"microscope";
 if(n.includes("quadrat"))return"quadrat";
 if(n.includes("transect"))return"transect";
 if(n.includes("ruler")||n.includes("meter rule")||n.includes("measuring tape"))return"length";
 if(n.includes("stopwatch")||n.includes("stop-clock"))return"stopwatch";
 if(/power supply|battery|dc supply/.test(n))return"power";
 if(n.includes("ammeter"))return"ammeter";
 if(n.includes("voltmeter"))return"voltmeter";
 if(n.includes("resistor"))return"resistor";
 if(n.includes("water bath"))return"waterbath";
 if(n.includes("pH meter"))return"phmeter";
 return"container";
}
function ensureOps(){
 if(!S.apparatusOps)S.apparatusOps={};
 S.setup.forEach((item,i)=>{
  if(!S.apparatusOps[i])S.apparatusOps[i]={opening:100,duration:1,temp:25,magnification:40,pH:7,voltage:6,running:false,tare:0,mass:0,samples:0,distance:0};
 });
 if(S.selectedApparatus!=null&&(!S.setup[S.selectedApparatus]))S.selectedApparatus=null;
}
function liquidTotal(item,unit){
 return (item?.liquid||[]).filter(x=>x.unit===unit).reduce((s,x)=>s+Number(x.amount||0),0);
}
function removeLiquid(item,amount,unit,chemical){
 let left=amount;
 for(let i=item.liquid.length-1;i>=0&&left>1e-9;i--){
  const x=item.liquid[i];
  if(x.unit!==unit|| (chemical&&x.chemical!==chemical))continue;
  const take=Math.min(left,Number(x.amount)||0);
  x.amount=+(x.amount-take).toFixed(4);left-=take;
  if(x.amount<=1e-9)item.liquid.splice(i,1);
 }
 return amount-left;
}
function addLiquid(item,chemical,amount,unit){
 item.liquid=item.liquid||[];
 item.liquid.push({chemical,amount:+amount.toFixed(4),unit});
}
function transferApparatus(sourceIndex,targetIndex,amount,unit="mL",chemical=null){
 const source=S.setup[sourceIndex],target=S.setup[targetIndex];
 if(!source||!target)return toast("Select a valid source and target");
 if(sourceIndex===targetIndex)return toast("Source and target must be different");
 const available=liquidTotal(source,unit);
 if(available<=0)return toast("The "+source.name+" is empty");
 const used=Math.min(Math.max(0,amount),available);
 const chosen=chemical||source.liquid.find(x=>x.unit===unit)?.chemical;
 if(!chosen)return toast("No transferable liquid is present");
 const actual=removeLiquid(source,used,unit,chosen);
 if(!actual)return toast("No matching liquid is available");
 if(unit==="mL"&&liquidTotal(target,"mL")+actual>apparatusCapacity(target.name)+0.0001){
  addLiquid(source,chosen,actual,unit);return toast("That would exceed the "+target.name+" capacity");
 }
 addLiquid(target,chosen,actual,unit);
 S.pours.push({chemical:chosen,target:target.name,source:source.name,amount:actual,unit,transfer:true});
 renderAll();save();toast(formatQuantity(actual,unit)+" of "+chosen+" transferred from "+source.name+" to "+target.name);
}
function dispenseFrom(index,amount,unit="mL"){
 const item=S.setup[index],kind=opKind(item?.name);
 if(!item)return;
 if(kind==="burette"){
  const opening=Number(S.apparatusOps[index]?.opening||0);
  const duration=Number(S.apparatusOps[index]?.duration||1);
  amount=Math.min(amount||1,duration*1.0*(opening/100));
 }
 if(kind==="dropper")amount=Math.min(amount||0.05,0.05);
 if(kind==="pipette")amount=Math.min(amount||25,25);
 if(kind==="syringe")amount=Math.min(amount||1,10);
 const targets=S.setup.map((x,i)=>({x,i})).filter(o=>o.i!==index);
 const targetIndex=targets.find(o=>o.i===S.apparatusOps[index]?.targetIndex)?.i;
 if(targetIndex==null)return toast("Choose a target apparatus first");
 const sourceChemical=item.liquid?.find(x=>x.unit===unit)?.chemical;
 if(!sourceChemical)return toast("Fill the "+item.name+" before dispensing");
 transferApparatus(index,targetIndex,amount,unit,sourceChemical);
}
function selectApparatus(index){
 ensureOps();S.selectedApparatus=index;renderConnections();document.querySelectorAll(".placed-item").forEach(x=>x.classList.toggle("apparatus-selected",+x.dataset.index===index));toast("Selected "+S.setup[index].name);
}
function operationPanel(){
 ensureOps();
 const i=S.selectedApparatus,item=i!=null?S.setup[i]:null;
 if(!item)return '<div class="operation-empty"><b>Apparatus controls</b><span>Click a placed apparatus to operate it. Controls are specific to the equipment.</span></div>';
 const k=opKind(item.name),o=S.apparatusOps[i],targets=S.setup.map((x,j)=>j!==i?'<option value="'+j+'" '+(o.targetIndex===j?"selected":"")+'>'+esc(x.name)+'</option>':"").join("");
 const liquid=(item.liquid||[]).filter(x=>x.unit==="mL").reduce((s,x)=>s+x.amount,0);
 let body='<div class="operation-head"><b>'+esc(item.name)+'</b><button id="clearSelectedApparatus">Clear selection</button></div><div class="operation-grid">';
 body+='<label>Target<select id="opTarget"><option value="">Choose target…</option>'+targets+'</select></label>';
 if(k==="burette")body+='<label>Tap opening <output id="opOpeningOut">'+o.opening+'%</output><input id="opOpening" type="range" min="0" max="100" step="1" value="'+o.opening+'"></label><label>Open time <select id="opDuration"><option>0.1</option><option>0.2</option><option>0.5</option><option selected>1</option><option>2</option><option>5</option></select> s</label><button id="opDrop">1 drop</button><button id="opDispense">Dispense at current opening</button><small>Flow is proportional to tap opening: 100% ≈ 1.00 mL/s in this virtual model. Burette capacity: 50 mL.</small>';
 else if(k==="dropper")body+='<button id="opDrop">1 drop</button><button id="opDispense">Dispense 0.05 mL</button><small>One virtual drop = 0.05 mL for quantity accounting.</small>';
 else if(k==="pipette")body+='<button id="opDispense">Transfer 25 mL (calibrated pipette)</button><button id="opTransfer">Transfer custom amount</button><small>Cambridge IGCSE uses a 25 cm³ volumetric pipette.</small>';
 else if(k==="syringe")body+='<label>Transfer amount <input id="opAmount" type="number" min="0.1" max="10" step="0.1" value="1"></label><button id="opTransfer">Transfer measured amount</button>';
 else if(k==="cylinder")body+='<label>Transfer amount <input id="opAmount" type="number" min="0.1" max="100" step="0.1" value="10"></label><button id="opTransfer">Transfer measured amount</button>';
 else if(k==="thermometer"||k==="waterbath")body+='<label>Temperature <output id="opTempOut">'+o.temp.toFixed(0)+' °C</output><input id="opTemp" type="range" min="0" max="100" step="1" value="'+o.temp+'"></label><small>Temperature changes feed into the experiment state instead of being decorative.</small>';
 else if(k==="microscope")body+='<label>Magnification <select id="opMag"><option '+(o.magnification===40?"selected":"")+' value="40">×40</option><option '+(o.magnification===100?"selected":"")+' value="100">×100</option><option '+(o.magnification===400?"selected":"")+' value="400">×400</option></select></label><button id="opObserve">Observe specimen</button>';
 else if(k==="quadrat")body+='<button id="opSample">Place / sample quadrat</button><label>Samples <output>'+o.samples+'</output></label><small>Each sample is recorded as an actual field observation.</small>';
 else if(k==="transect")body+='<label>Distance <input id="opDistance" type="number" min="0" max="100" step="0.1" value="'+o.distance+'"> m</label><button id="opSample">Record transect point</button>';
 else if(k==="length")body+='<label>Measured length <input id="opDistance" type="number" min="0" max="1000" step="1" value="'+o.distance+'"> mm</label><button id="opSample">Record measurement</button>';
 else if(k==="power")body+='<label>Supply voltage <output id="opVoltageOut">'+o.voltage.toFixed(1)+' V</output><input id="opVoltage" type="range" min="0" max="12" step="0.1" value="'+o.voltage+'"></label><small>Connected-circuit readings use this supply voltage.</small>';
 else if(k==="resistor")body+='<label>Resistance <select id="opResistance">'+[1,2,5,10,20,50,100,220,330,470,1000].map(v=>'<option value="'+v+'" '+(Number(item.resistance||20)===v?"selected":"")+'>'+v+' Ω</option>').join("")+'</select></label>';
 else if(k==="ammeter"||k==="voltmeter")body+='<div class="live-reading" id="liveElectricalReading">'+(k==="ammeter"?electricalReading("I",i):electricalReading("V",i))+'</div><small>Reading is calculated from the current connected circuit.</small>';
 else if(k==="phmeter")body+='<label>pH <output id="opPhOut">'+o.pH.toFixed(2)+'</output><input id="opPh" type="range" min="0" max="14" step="0.01" value="'+o.pH+'"></label>';
 else body+='<label>Transfer amount <input id="opAmount" type="number" min="0.1" max="100" step="0.1" value="10"></label><button id="opTransfer">Transfer measured amount</button>';
 body+='</div><div class="operation-state">Current liquid: '+liquid.toFixed(2)+' mL / '+apparatusCapacity(item.name)+' mL</div></div>';
 return body;
}
function electricalReading(mode,index){
 const source=S.setup.findIndex(x=>/power supply|battery|dc supply/i.test(x.name));
 const resistor=S.setup.find(x=>/resistor/i.test(x.name));
 const V=source>=0?(S.apparatusOps[source]?.voltage||6):0;
 const R=Number(resistor?.resistance||S.resistorResistance||20);
 const connected=S.connections?.length>0;
 const I=connected&&R>0?V/R:0;
 return mode==="I"?"Current: "+I.toFixed(3)+" A":"Potential difference: "+V.toFixed(2)+" V";
}
function bindOperationPanel(){
 const i=S.selectedApparatus;if(i==null)return;const o=S.apparatusOps[i],item=S.setup[i],k=opKind(item.name);
 $("#clearSelectedApparatus")?.addEventListener("click",()=>{S.selectedApparatus=null;renderConnections()});
 $("#opTarget")?.addEventListener("change",e=>{o.targetIndex=e.target.value===""?null:+e.target.value;save()});
 $("#opOpening")?.addEventListener("input",e=>{o.opening=+e.target.value;$("#opOpeningOut").textContent=o.opening+"%";save()});
 $("#opDuration")?.addEventListener("change",e=>{o.duration=+e.target.value;save()});
 $("#opDrop")?.addEventListener("click",()=>{o.targetIndex=o.targetIndex??null; if(k==="burette")dispenseFrom(i,0.05,"mL");else if(k==="dropper")dispenseFrom(i,0.05,"mL");else toast("Drop control is only available on a dispensing apparatus")});
 $("#opDispense")?.addEventListener("click",()=>dispenseFrom(i,k==="burette"?1:k==="pipette"?25:k==="dropper"?0.05:1,"mL"));
 $("#opTransfer")?.addEventListener("click",()=>{const a=+($("#opAmount")?.value||0);dispenseFrom(i,a,"mL")});
 $("#opTemp")?.addEventListener("input",e=>{o.temp=+e.target.value;$("#opTempOut").textContent=o.temp.toFixed(0)+" °C";S.values[0]=o.temp;save()});
 $("#opMag")?.addEventListener("change",e=>{o.magnification=+e.target.value;S.values[0]=o.magnification;save();toast("Microscope set to ×"+o.magnification)});
 $("#opSample")?.addEventListener("click",()=>{o.samples=(o.samples||0)+1;S.fieldSamples.push({apparatus:item.name,distance:o.distance||0,sample:o.samples});save();renderConnections();toast("Field observation "+o.samples+" recorded")});
 $("#opDistance")?.addEventListener("input",e=>{o.distance=+e.target.value;save()});
 $("#opVoltage")?.addEventListener("input",e=>{o.voltage=+e.target.value;$("#opVoltageOut").textContent=o.voltage.toFixed(1)+" V";S.values[0]=o.voltage;renderConnections();save()});
 $("#opResistance")?.addEventListener("change",e=>{item.resistance=+e.target.value;S.resistorResistance=item.resistance;renderBench();renderConnections();save();toast("Resistor set to "+item.resistance+" Ω")});
 $("#opPh")?.addEventListener("input",e=>{o.pH=+e.target.value;$("#opPhOut").textContent=o.pH.toFixed(2);S.values[0]=o.pH;save()});
 $("#opObserve")?.addEventListener("click",()=>toast("Specimen observed at ×"+o.magnification));
}
function renderConnections(){
 ensureInteractionState();
 const box=$("#connectionPanel");if(!box)return;
 const spec=interactionSpec(current),resistorItems=S.setup.filter(x=>/resistor/i.test(x.name)),resistanceOptions=[1,2,5,10,20,50,100,220,330,470,1000];
 const resistanceUI=resistorItems.length?'<div class="resistor-picker"><label class="picker-label">Resistor resistance</label><select id="resistanceSelect" class="interaction-select">'+resistanceOptions.map(v=>'<option value="'+v+'" '+((S.resistorResistance||20)===v?"selected":"")+'>'+v+' Ω</option>').join("")+'</select><small>Applies to the resistor(s) on the bench.</small></div>':"";
 box.innerHTML=operationPanel()+'<div class="interaction-title">Real-world setup</div>'+resistanceUI+
  '<button class="interaction-action '+(connectionMode?"active":"")+'" id="connectBtn">⌁ '+(connectionMode?"Connecting — click two apparatus":"Connect wires")+'</button>'+
  '<button class="interaction-action '+(pourMode?"active":"")+'" id="pourBtn">◉ '+(pourMode?"Pour mode active":"Choose chemical")+'</button>'+
  '<button class="interaction-action '+(markerMode?"active":"")+'" id="markerBtn">⊙ '+(markerMode?"Click the bench to place marker":"Place fiducial marker")+'</button>'+
  '<div class="interaction-status">'+(spec.wires?"Connections "+S.connections.length+" / "+spec.connections:"Wire connections are available for any apparatus pair.")+'</div>'+
  (spec.markers?'<div class="interaction-status">Fiducial markers '+S.markers.length+" / "+spec.markers+'</div>':"")+
  (spec.requirements.length?'<div class="interaction-status">Chemical setup: '+spec.requirements.filter(r=>chemistryFulfilled(spec.profile,r)).length+" / "+spec.requirements.length+" quantities complete</div>":"")+
  renderReactionProfile(spec);
 $("#resistanceSelect")?.addEventListener("change",()=>{S.resistorResistance=+$("#resistanceSelect").value;S.setup.filter(x=>/resistor/i.test(x.name)).forEach(x=>x.resistance=S.resistorResistance);renderBench();save();toast("Resistor set to "+S.resistorResistance+" Ω")});
 $("#connectBtn")?.addEventListener("click",()=>{connectionMode=!connectionMode;pourMode=false;selectedChemical=null;connectionFirst=null;markerMode=false;document.querySelectorAll(".placed-item").forEach(x=>x.classList.remove("pour-target","connection-first"));renderConnections();toast(connectionMode?"Wire mode: click the first apparatus, then the second":"Wire mode off")});
 $("#pourBtn")?.addEventListener("click",()=>{if(!spec.requirements.length)return toast("No chemical addition is required here");const next=spec.requirements.find(r=>!chemistryFulfilled(spec.profile,r));pourMode=true;connectionMode=false;markerMode=false;selectedChemical=selectedChemical||next?.chemical||null;document.querySelectorAll(".placed-item").forEach(x=>x.classList.add("pour-target"));renderChemicals();renderConnections();toast(selectedChemical?"Pour mode: click the "+(chemistryNeed(spec.profile,selectedChemical)?.target||"target apparatus"):"All chemical quantities are complete")});
 bindOperationPanel();
 $("#markerBtn")?.addEventListener("click",()=>{if(!spec.markers)return toast("Fiducial markers are not needed for this experiment");markerMode=!markerMode;connectionMode=false;pourMode=false;selectedChemical=null;document.querySelectorAll(".placed-item").forEach(x=>x.classList.remove("pour-target","connection-first"));renderConnections();toast(markerMode?"Click anywhere on the bench to place a marker":"Marker mode off")});
}
function renderBench(){
 ensureInteractionState();
 const p=$("#placedApparatus");
 p.innerHTML=S.setup.map((item,i)=>{
  const liq=item.liquid?.length?item.liquid[item.liquid.length-1]:null;
  return '<div class="placed-item" data-index="'+i+'" style="left:'+item.x+'%;top:'+item.y+'%"><span class="placed-visual">'+apparatusSvg(item.name)+'</span>'+(/resistor/i.test(item.name)?'<span class="resistance-badge">'+esc(item.resistance||S.resistorResistance||20)+' Ω</span>':"")+
   (item.liquid?.length?(()=>{const v=targetLiquidState(item);return '<span class="liquid-overlay" style="--liquid:'+v.color+';height:'+v.height+'%;"></span><span class="volume-badge">'+esc(formatQuantity(v.total,"mL"))+' / '+esc(v.cap.toFixed(0))+' mL</span>'})():"")+
   '<b>'+esc(item.name)+'</b><button class="remove-apparatus" data-remove="'+i+'">×</button></div>';
 }).join("");
 $("#benchTip").classList.toggle("hidden",S.setup.length>0);
 p.querySelectorAll(".remove-apparatus").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();S.setup.splice(+b.dataset.remove,1);renderAll();toast("Apparatus removed")}));
 p.querySelectorAll(".placed-item").forEach(el=>{enablePlacedDrag(el);el.addEventListener("click",e=>{if(e.target.closest(".remove-apparatus")||pourMode||connectionMode||markerMode)return;selectApparatus(+el.dataset.index)});});
 renderInteractionGraphics();
}

function renderProcedure(){
 const io=interactionSpec(current),extra=[];
 if(io.requirements.length)extra.push("Follow the reagent quantities shown in the IGCSE reaction profile and add them to the specified apparatus.");
 if(io.wires)extra.push("Connect the required apparatus before switching on the supply.");
 if(io.markers)extra.push("Place "+io.markers+" fiducial markers at useful fixed measurement points.");
 const items=["Read the objective: "+current.objective,"Place every required apparatus on the bench using the drawer.",...extra,"Set "+(current.controls?.[0]||"the first variable")+" and "+(current.controls?.[1]||"the second variable")+" using the controls.","Start the experiment and observe the live response.","Record at least three measurements, changing one variable at a time.","Compare the evidence with the expected relationship: "+equation(current)];
 $("#procedureTab").innerHTML='<h3 class="procedure-title">Step-by-Step Guide</h3>'+items.map((t,i)=>'<div class="step"><span class="step-num">'+(i+1)+'</span><p>'+esc(t)+'</p></div>').join("")+
 '<div class="apparatus-check"><h4>Required Apparatus</h4>'+req(current).map(n=>{const done=S.setup.some(x=>x.name===n);return '<div class="check-row '+(done?"done":"")+'"><span>'+(done?"✓":"")+'</span>'+esc(n)+'</div>'}).join("")+
 '</div><div class="apparatus-check"><h4>Experiment-specific setup</h4>'+
 (io.requirements?io.requirements.map(r=>'<div class="check-row '+(chemistryFulfilled(io.profile,r)?"done":"")+'"><span>'+(chemistryFulfilled(io.profile,r)?"✓":"")+'</span>'+esc(r.chemical)+': '+(r.unit==="drops"?r.amount+" drops":r.amount+" mL")+(r.concentration?" · "+esc(r.concentration):"")+'</div>').join(""):"")+
 (io.wires?'<div class="check-row '+(S.connections.length>=io.connections?"done":"")+'"><span>'+(S.connections.length>=io.connections?"✓":"")+'</span>Electrical connections: '+S.connections.length+" / "+io.connections+'</div>':"")+
 (io.markers?'<div class="check-row '+(S.markers.length>=io.markers?"done":"")+'"><span>'+(S.markers.length>=io.markers?"✓":"")+'</span>Fiducial markers: '+S.markers.length+" / "+io.markers+'</div>':"")+
 '</div>'+(io.profile?'<div class="apparatus-check"><h4>Expected chemical observation</h4><p class="procedure-note">'+esc(io.profile.observation)+'</p></div>':"")+
 '<p class="procedure-note">'+esc(current.safety||"Follow normal laboratory safety procedures.")+'</p>';
}

function renderAll(){
 if(!current)return;
 ensureInteractionState();ensureOps();
 $("#activeTitle").textContent=current.name;$("#activeObjective").textContent=current.objective;
 $("#overviewText").textContent=current.objective+" "+(current.text||"");
 $("#variablesText").innerHTML="<b>Independent:</b> "+esc(current.controls?.[0]||"Variable A")+"<br><b>Dependent:</b> "+esc(current.columns?.[3]||"Result")+"<br><b>Controlled:</b> Keep other conditions constant.";
 $("#equationText").textContent=equation(current);
 $("#outcomesText").innerHTML="<li>Understand "+esc(current.name)+"</li><li>Collect evidence</li><li>Analyse observations and data</li>";
 renderBench();renderDrawer();renderControls();renderChemicals();renderConnections();renderProcedure();renderReadings();renderTable();renderNotebook();updateState();
}

function reset(){
 S=newState(current);ensureInteractionState();ensureOps();selectedChemical=null;pourMode=false;connectionMode=false;connectionFirst=null;markerMode=false;
 renderAll();toast("Experiment reset");
}

const originalBenchClick=document.addEventListener.bind(document);
document.addEventListener("click",e=>{
 if(e.target.closest(".placed-item")||e.target.closest(".apparatus-card")||e.target.closest(".chemical-card"))return;
 if(markerMode&&e.target.closest("#bench"))placeMarkerAtEvent(e);
});


/* ===== Manual blank-bench mode + real stirring interaction ===== */
function stirApparatus(index,targetIndex){
 ensureOps();
 const tool=S.setup[index],target=S.setup[targetIndex];
 if(!tool||!target)return toast("Choose a stirrer and a target vessel");
 if(index===targetIndex)return toast("Choose a different target vessel");
 if(!/stirrer|stirring rod|glass rod/i.test(tool.name))return toast("That apparatus cannot stir");
 const o=S.apparatusOps[index]||{};
 o.targetIndex=targetIndex;
 o.stirring=!o.stirring;
 o.startedAt=o.stirring?Date.now():null;
 S.apparatusOps[index]=o;
 target.mixed=!!o.stirring;
 save();
 renderBench();
 renderApparatusContext(index);
 toast((o.stirring?"Stirring ":"Stopped stirring ")+target.name);
}
const __opKindManualV2=opKind;
opKind=function(name){
 const n=String(name||"").toLowerCase();
 if(n.includes("magnetic stirrer")||n.includes("stirrer"))return"stirrer";
 if(n.includes("stirring rod")||n.includes("glass rod"))return"stirrod";
 return __opKindManualV2(name);
};
const __renderBenchManualV2=renderBench;
renderBench=function(){
 __renderBenchManualV2();
 $$(".placed-item").forEach(el=>{
  const idx=+el.dataset.index,o=S.apparatusOps?.[idx]||{};
  el.classList.toggle("stirring-active",!!o.stirring);
  if(o.stirring&&!el.querySelector(".stirring-indicator")){
   const dot=document.createElement("span");dot.className="stirring-indicator";dot.textContent="↻ STIRRING";el.appendChild(dot);
  }
 });
};

/* ===== Interface V2: 3D bench, auto-setup and contextual apparatus operations ===== */
const INTERFACE_V2_LAYOUTS=[
 [14,28],[35,26],[56,27],[77,27],[24,62],[46,62],[68,62],[86,60]
];
function seedBenchForExperiment(e){
 if(!e)return;
 const names=req(e);
 S.setup=names.map((name,i)=>({
  name,
  x:INTERFACE_V2_LAYOUTS[i%INTERFACE_V2_LAYOUTS.length][0],
  y:INTERFACE_V2_LAYOUTS[i%INTERFACE_V2_LAYOUTS.length][1],
  z:INTERFACE_V2_LAYOUTS[i%INTERFACE_V2_LAYOUTS.length][1],
  resistance:/resistor/i.test(name)?20:undefined,
  liquid:[],
 }));
 ensureOps();
 S.selectedApparatus=null;
 S.connections=[];
 S.markers=[];
 toast("Experiment bench prepared with all required apparatus");
}
function apparatusLabel(name){
 const n=String(name||"").toLowerCase();
 if(/power supply|dc supply|battery/.test(n))return"Power source";
 if(/burette/.test(n))return"Burette";
 if(/pipette/.test(n))return"Volumetric transfer";
 if(/measuring cylinder/.test(n))return"Volume measurement";
 if(/balance/.test(n))return"Mass measurement";
 if(/thermometer/.test(n))return"Temperature";
 if(/stopwatch|stop-clock/.test(n))return"Time measurement";
 if(/microscope/.test(n))return"Microscopy";
 if(/pH meter/.test(n))return"pH measurement";
 if(/quadrat/.test(n))return"Sampling frame";
 return"Apparatus";
}
function renderApparatusContext(index){
 const host=$("#apparatusContext");
 if(!host)return;
 const item=S.setup[index];
 if(!item){host.classList.add("hidden");return}
 ensureOps();
 const o=S.apparatusOps[index]||{};
 const kind=opKind(item.name);
 const liquid=liquidTotal(item,"mL");
 const sources=S.setup.map((x,j)=>({x,j})).filter(v=>v.j!==index&&liquidTotal(v.x,"mL")>0);
 const targets=S.setup.map((x,j)=>({x,j})).filter(v=>v.j!==index);
 const sourceOptions=sources.map(v=>'<option value="'+v.j+'">'+esc(v.x.name)+' — '+formatQuantity(liquidTotal(v.x,"mL"),"mL")+'</option>').join("");
 const targetOptions=targets.map(v=>'<option value="'+v.j+'">'+esc(v.x.name)+'</option>').join("");
 let quick='';
 if(targets.length)quick='<div class="context-quick"><button data-v2-transfer="1">1 mL</button><button data-v2-transfer="5">5 mL</button><button data-v2-transfer="10">10 mL</button><button data-v2-transfer="20">20 mL</button><button data-v2-transfer="25">25 mL</button></div>';
 let body='<div class="context-head"><div><strong>'+esc(item.name)+'</strong><small>'+apparatusLabel(item.name)+' · '+formatQuantity(liquid,"mL")+' liquid</small></div><button id="v2CloseContext" class="context-close">×</button></div>';
 body+='<div class="context-actions">';
 if(kind==="burette"){
  body+='<div class="context-row"><label>Fill from<select id="v2Source"><option value="">Choose source…</option>'+sourceOptions+'</select></label><label>Amount (mL)<input id="v2Amount" type="number" min="0.05" max="50" step="0.05" value="20"></label><button id="v2TransferInto">Fill burette</button></div>';
  body+='<div class="context-row"><label>Target<select id="v2Target"><option value="">Choose target…</option>'+targetOptions+'</select></label><label>Tap opening <output id="v2OpeningOut">'+(o.opening??100)+'%</output><input id="v2Opening" type="range" min="0" max="100" step="1" value="'+(o.opening??100)+'"></label><label>Open time<select id="v2Duration"><option>0.1</option><option>0.2</option><option>0.5</option><option selected>1</option><option>2</option><option>5</option></select> s</label><button id="v2Dispense">Dispense</button><button id="v2Drop">1 drop</button></div>';
 }else if(kind==="pipette"){
  body+='<div class="context-row"><label>Source<select id="v2Source"><option value="">Choose source…</option>'+sourceOptions+'</select></label><button id="v2TransferInto">Load 25 mL</button><button id="v2Dispense">Dispense 25 mL</button></div>';
 }else if(kind==="dropper"){
  body+='<div class="context-row"><label>Target<select id="v2Target">'+targetOptions+'</select></label><button id="v2Dispense">Dispense 1 drop</button></div>';
 }else if(kind==="cylinder"||kind==="syringe"){
  body+='<div class="context-row"><label>Target<select id="v2Target">'+targetOptions+'</select></label><label>Amount (mL)<input id="v2Amount" type="number" min="0.1" max="100" step="0.1" value="10"></label><button id="v2Dispense">Transfer</button></div>';
 }else if(kind==="balance"){
  body+='<div class="context-row"><label>Sample mass (g)<input id="v2Mass" type="number" min="0" max="500" step="0.01" value="'+(o.mass||0)+'"></label><button id="v2Weigh">Weigh / record</button></div>';
 }else if(kind==="stopwatch"){
  body+='<div class="context-row"><label>Timing (s)<input id="v2Time" type="number" min="0.1" max="3600" step="0.1" value="'+(o.time||10)+'"></label><button id="v2TimeStart">Start / record</button></div>';
 }else if(kind==="thermometer"||kind==="waterbath"){
  body+='<div class="context-row"><label>Temperature <output id="v2TempOut">'+(o.temp??25)+' °C</output><input id="v2Temp" type="range" min="0" max="100" step="1" value="'+(o.temp??25)+'"></label><button id="v2ApplyTemp">Apply temperature</button></div>';
 }else if(kind==="microscope"){
  body+='<div class="context-row"><label>Magnification<select id="v2Mag"><option value="40" '+(o.magnification===40?"selected":"")+'>×40</option><option value="100" '+(o.magnification===100?"selected":"")+'>×100</option><option value="400" '+(o.magnification===400?"selected":"")+'>×400</option></select></label><button id="v2Observe">Observe specimen</button></div>';
 }else if(kind==="stirrer"||kind==="stirrod"){
  body+='<div class="context-row"><label>Target vessel<select id="v2Target"><option value="">Choose target…</option>'+targetOptions+'</select></label><button id="v2Stir">'+(o.stirring?"Stop stirring":"Start stirring")+(kind==="stirrer"?" · motor":" · manually")+"</button></div>';
 }else if(kind==="force"){
  body+='<div class="context-row"><label>Force (N)<input id="v2Force" type="number" min="0" max="100" step="0.01" value="'+(o.force||0)+'"></label><button id="v2ForceRecord">Record force</button></div>';
 }else if(kind==="light"){
  body+='<div class="context-row"><label>Light output <output id="v2LightOut">'+(o.light||50)+'%</output><input id="v2Light" type="range" min="0" max="100" step="1" value="'+(o.light||50)+'"></label></div>';
 }else if(kind==="heater"){
  body+='<div class="context-row"><label>Heater power <output id="v2HeatOut">'+(o.heat||50)+'%</output><input id="v2Heat" type="range" min="0" max="100" step="1" value="'+(o.heat||50)+'"></label></div>';
 }else if(kind==="power"){
  body+='<div class="context-row"><label>Supply voltage <output id="v2VoltageOut">'+(o.voltage??6).toFixed(1)+' V</output><input id="v2Voltage" type="range" min="0" max="12" step="0.1" value="'+(o.voltage??6)+'"></label></div>';
 }else if(kind==="resistor"){
  body+='<div class="context-row"><label>Resistance<select id="v2Resistance">'+[1,2,5,10,20,50,100,220,330,470,1000].map(v=>'<option value="'+v+'" '+(Number(item.resistance||20)===v?"selected":"")+'>'+v+' Ω</option>').join("")+'</select></label></div>';
 }else if(kind==="phmeter"){
  body+='<div class="context-row"><label>pH <output id="v2PhOut">'+(o.pH??7).toFixed(2)+'</output><input id="v2Ph" type="range" min="0" max="14" step="0.01" value="'+(o.pH??7)+'"></label></div>';
 }else if(kind==="quadrat"||kind==="transect"){
  body+='<div class="context-row"><button id="v2Sample">Record field observation</button><span class="context-reading">'+(o.samples||0)+' observations</span></div>';
 }else if(kind==="length"){
  body+='<div class="context-row"><label>Reading (mm)<input id="v2Length" type="number" min="0" max="2000" step="0.01" value="'+(o.distance||0)+'"></label><button id="v2Measure">Record measurement</button></div>';
 }else{
  body+='<div class="context-row"><label>Target<select id="v2Target">'+targetOptions+'</select></label><label>Amount (mL)<input id="v2Amount" type="number" min="0.1" max="100" step="0.1" value="10"></label><button id="v2Transfer">Transfer</button></div>';
 }
 if(/beaker|flask|test tube|volumetric flask|spotting tile|evaporating basin|crucible|gas syringe/i.test(item.name)&&targets.length){
  body+='<div class="context-row secondary"><label>Transfer into this '+esc(item.name)+' from<select id="v2Source2"><option value="">Choose source…</option>'+sourceOptions+'</select></label><label>Amount (mL)<input id="v2Amount2" type="number" min="0.1" max="'+apparatusCapacity(item.name)+'" step="0.1" value="10"></label><button id="v2TransferInto2">Pour into '+esc(item.name)+'</button></div>';
 }
 body+='</div><div class="context-note">Clicking an apparatus now opens its real-world controls. Quantities change the source and target inventories; container capacity is enforced.</div>';
 host.innerHTML=body;
 host.classList.remove("hidden");
 const close=()=>{host.classList.add("hidden");S.selectedApparatus=null;document.querySelectorAll(".placed-item").forEach(x=>x.classList.remove("apparatus-selected"));};
 $("#v2CloseContext")?.addEventListener("click",close);
 $("#v2Opening")?.addEventListener("input",e=>{o.opening=+e.target.value;$("#v2OpeningOut").textContent=o.opening+"%";$("#opOpeningOut")&&($("#opOpeningOut").textContent=o.opening+"%");save();});
 $("#v2Duration")?.addEventListener("change",e=>{o.duration=+e.target.value;save();});
 $("#v2Dispense")?.addEventListener("click",()=>{
  const amount=kind==="burette"?1:kind==="pipette"?25:kind==="dropper"?0.05:+($("#v2Amount")?.value||1);
  if(kind==="burette"||kind==="dropper"||kind==="pipette"){o.targetIndex=$("#v2Target")?.value===""?o.targetIndex:+($("#v2Target")?.value);dispenseFrom(index,amount,"mL");}
  else {const t=+($("#v2Target")?.value??-1); if(t>=0)transferApparatus(index,t,amount,"mL");}
 });
 $("#v2Drop")?.addEventListener("click",()=>{o.targetIndex=o.targetIndex??null;dispenseFrom(index,0.05,"mL");});
 $("#v2Transfer")?.addEventListener("click",()=>{const t=+($("#v2Target")?.value??-1),a=+($("#v2Amount")?.value||0);if(t>=0)transferApparatus(index,t,a,"mL");});
 $("#v2TransferInto")?.addEventListener("click",()=>{const source=+($("#v2Source")?.value??-1),a=+($("#v2Amount")?.value||0);if(source>=0)transferApparatus(source,index,a,"mL");});
 $("#v2TransferInto2")?.addEventListener("click",()=>{const source=+($("#v2Source2")?.value??-1),a=+($("#v2Amount2")?.value||0);if(source>=0)transferApparatus(source,index,a,"mL");});
 host.querySelectorAll("[data-v2-transfer]").forEach(btn=>btn.addEventListener("click",()=>{const t=targets[0]?.j;if(t!=null)transferApparatus(index,t,+btn.dataset.v2Transfer,"mL");}));
 $("#v2Mass")?.addEventListener("input",e=>{o.mass=+e.target.value;});
 $("#v2Weigh")?.addEventListener("click",()=>{o.mass=+($("#v2Mass")?.value||0);S.values[0]=o.mass;save();renderConnections();renderApparatusContext(index);toast("Balance reading recorded: "+o.mass.toFixed(2)+" g");});
 $("#v2TimeStart")?.addEventListener("click",()=>{o.time=+($("#v2Time")?.value||0);S.values[0]=o.time;save();toast("Stopwatch reading recorded: "+o.time+" s");});
 $("#v2Temp")?.addEventListener("input",e=>{o.temp=+e.target.value;$("#v2TempOut").textContent=o.temp+" °C";});
 $("#v2ApplyTemp")?.addEventListener("click",()=>{S.values[0]=o.temp;save();toast("Temperature applied: "+o.temp+" °C");});
 $("#v2Mag")?.addEventListener("change",e=>{o.magnification=+e.target.value;save();});
 $("#v2Observe")?.addEventListener("click",()=>toast("Specimen observed at ×"+o.magnification));
 $("#v2Voltage")?.addEventListener("input",e=>{o.voltage=+e.target.value;$("#v2VoltageOut").textContent=o.voltage.toFixed(1)+" V";save();});
 $("#v2Resistance")?.addEventListener("change",e=>{item.resistance=+e.target.value;S.resistorResistance=item.resistance;renderBench();renderConnections();renderApparatusContext(index);save();});
 $("#v2Ph")?.addEventListener("input",e=>{o.pH=+e.target.value;$("#v2PhOut").textContent=o.pH.toFixed(2);});
 $("#v2Sample")?.addEventListener("click",()=>{o.samples=(o.samples||0)+1;S.fieldSamples.push({apparatus:item.name,sample:o.samples,distance:o.distance||0});save();renderApparatusContext(index);toast("Field observation "+o.samples+" recorded");});
 $("#v2Length")?.addEventListener("input",e=>{o.distance=+e.target.value;});
 $("#v2Measure")?.addEventListener("click",()=>{o.distance=+($("#v2Length")?.value||0);S.values[0]=o.distance;save();toast("Measurement recorded: "+o.distance+" mm");});
}
const __selectApparatusV2=selectApparatus;
selectApparatus=function(index){
 __selectApparatusV2(index);
 renderApparatusContext(index);
};
function __seedAfterLoadV2(){
 if(current&&(!S.setup||!S.setup.length)){seedBenchForExperiment(current);renderAll();save();}
}
const __loadV2=load;
load=function(e){
 __loadV2(e);
 seedBenchForExperiment(e);
 renderAll();
 save();
};
const __resetV2=reset;
reset=function(){
 __resetV2();
 seedBenchForExperiment(current);
 renderAll();
 save();
};



/* ===== Never auto-populate the experiment bench ===== */
const __loadManualBlank=load;
load=function(e){
 __loadManualBlank(e);
 S.setup=[];
 S.apparatusOps={};
 S.selectedApparatus=null;
 S.connections=[];
 S.markers=[];
 S.pours=[];
 S.chemicals={};
 selectedChemical=null;
 pourMode=false;
 connectionMode=false;
 connectionFirst=null;
 markerMode=false;
 document.body.classList.add("experiment-active");
 renderAll();
 save();
};
reset=function(){
 if(!current)return;
 S=newState(current);
 selectedChemical=null;
 pourMode=false;
 connectionMode=false;
 connectionFirst=null;
 markerMode=false;
 renderAll();
 save();
 toast("Blank bench reset — place the apparatus yourself");
};

/* ===== Apparatus audit: explicit equipment for the foundational experiments ===== */
const AUDITED_APPARATUS_BY_ID={
 "ohms-law":["DC power supply","Fixed resistor","Ammeter","Voltmeter","Connecting wires","Switch"],
 "series-circuits":["DC power supply","Fixed resistor","Fixed resistor 2","Ammeter","Voltmeter","Connecting wires","Switch"],
 "parallel-circuits":["DC power supply","Fixed resistor","Fixed resistor 2","Ammeter","Voltmeter","Connecting wires","Switch"],
 "resistivity":["DC power supply","Resistance wire","Ammeter","Voltmeter","Micrometer screw gauge","Metre rule","Connecting wires"],
 "power":["DC power supply","Fixed resistor","Ammeter","Voltmeter","Connecting wires","Switch"],
 "density":["Balance","Measuring cylinder","Displacement can","Solid sample"],
 "hookes-law":["Spring","Clamp stand","Mass hanger","Slotted masses","Metre rule"],
 "pendulum":["Clamp stand","String","Pendulum bob","Stopwatch","Metre rule"],
 "moments":["Metre rule","Pivot","Slotted masses","Clamp stand","Force meter"],
 "friction":["Force meter","Wooden block","Slotted masses","Surface board"],
 "lenses":["Convex lens","Lens holder","Object","Screen","Metre rule"],
 "refraction":["Ray box","Glass block","Protractor","Ruler","Paper screen"],
 "thermal-calorimetry":["Metal block","Electrical heater","Thermometer","Balance","Power supply","Stopwatch"],
 "gas-law":["Gas syringe","Pressure sensor","Air sample chamber","Temperature sensor"],
 "water-quality":["Sample bottles","pH meter","Turbidity tube","Dissolved oxygen meter","Thermometer","Measuring cylinder"],
 "soil-composition":["Soil sieve","Measuring cylinder","Balance","Beaker","Stirring rod","Stopwatch"],
 "greenhouse":["Insulated chamber A","Insulated chamber B","Temperature sensors","Heat lamp","Data logger"],
 "weather":["Barometer","Thermometer","Hygrometer","Anemometer","Rain gauge"],
 "renewable-resource-management":["Solar panel","Energy meter","Thermometer","Stopwatch","Balance"]
};
const __mappedApparatusV2=mappedApparatus;
mappedApparatus=function(e){
 if(e&&AUDITED_APPARATUS_BY_ID[e.id])return AUDITED_APPARATUS_BY_ID[e.id];
 const a=__mappedApparatusV2(e);
 return [...new Set(a)].filter(x=>x&& !/^(standard|chemical reagents|measuring equipment|measuring instruments|data sheet|field data sheet)$/i.test(String(x).trim())).slice(0,8);
};


Object.assign(AUDITED_APPARATUS_BY_ID,{
 "food-tests":["Test tubes","Test-tube rack","Dropping pipette","Water bath","Spotting tile"],
 "microscope":["Microscope","Prepared slide","Coverslip","Lens paper"],
 "osmosis":["Cork borer","Measuring cylinder","Balance","Test tubes","Stopwatch"],
 "enzyme":["Test tubes","Water bath","Thermometer","Stopwatch","Dropping pipette"],
 "photosynthesis":["Aquatic plant chamber","Beaker","Lamp","Stopwatch","Ruler"],
 "respiration":["Respirometer","Thermometer","Water bath","Stopwatch"],
 "transpiration":["Potometer","Stopwatch","Lamp","Scale"],
 "ecology-quadrat":["Quadrat frame","Tape measure","Field notebook"],
 "carbon-footprint-comparison":["Balance","Energy meter","Field notebook","Data logger"]
});

/* ===== Apparatus visual + interaction audit layer ===== */
const __apparatusSvgV2=apparatusSvg;
function auditedExtraSvg(name){
 const n=String(name||"").toLowerCase(),w=b=>'<svg class="apparatus-svg" viewBox="0 0 180 140" aria-label="'+esc(name)+'">'+b+'</svg>';
 if(n.includes("switch"))return w('<rect x="35" y="58" width="110" height="25" rx="8" class="metal"/><circle cx="55" cy="70" r="8" class="port"/><circle cx="125" cy="70" r="8" class="port"/><path d="M55 70 L91 45" class="wire-svg"/><circle cx="91" cy="45" r="5" class="knob"/>');
 if(n.includes("resistance wire"))return w('<path d="M20 70 H45 L55 45 L65 95 L75 45 L85 95 L95 45 L105 95 L115 70 H160" class="resistor-svg"/><circle cx="20" cy="70" r="6" class="port"/><circle cx="160" cy="70" r="6" class="port"/>');
 if(n.includes("displacement can"))return w('<path d="M45 35 H135 V110 Q90 126 45 110 Z" class="glass"/><path d="M45 48 H125" class="glass-line-svg"/><path d="M135 55 H155 V80 H135" class="glass-line-svg"/>');
 if(n.includes("wooden block")||n==="block")return w('<rect x="40" y="45" width="100" height="60" rx="5" class="ruler"/><line x1="55" y1="60" x2="125" y2="60" class="scale-svg"/>');
 if(n.includes("surface board"))return w('<rect x="25" y="48" width="130" height="52" rx="5" class="metal"/><path d="M32 58 H148 M32 72 H148 M32 86 H148" class="scale-svg"/>');
 if(n.includes("lens holder"))return w('<rect x="78" y="30" width="24" height="75" class="metal"/><path d="M45 104 H135" class="metal"/><circle cx="90" cy="38" r="18" class="knob"/>');
 if(n.includes("paper screen")||n==="screen")return w('<rect x="42" y="22" width="96" height="96" class="paper-svg"/><line x1="90" y1="22" x2="90" y2="118" class="scale-svg"/>');
 if(n.includes("heater")||n.includes("heat source"))return w('<rect x="43" y="75" width="94" height="32" rx="6" class="metal"/><path d="M55 75 Q65 45 75 75 Q85 45 95 75 Q105 45 115 75" class="wire-coil"/><circle cx="125" cy="91" r="7" class="knob"/>');
 if(n.includes("lamp")||n.includes("light source"))return w('<path d="M75 24 H105 L118 66 Q118 82 90 86 Q62 82 62 66 Z" class="metal"/><circle cx="90" cy="58" r="16" class="screen"/><path d="M90 86 V118 M65 118 H115" class="metal"/>');
 if(n.includes("solar panel"))return w('<rect x="35" y="32" width="110" height="76" class="glass"/><path d="M62 32 V108 M90 32 V108 M118 32 V108 M35 57 H145 M35 82 H145" class="scale-svg"/>');
 if(n.includes("energy meter"))return w('<rect x="40" y="32" width="100" height="76" rx="8" class="metal"/><rect x="55" y="48" width="70" height="30" class="screen"/><text x="90" y="68" text-anchor="middle" class="digital">0.00 kWh</text>');
 if(n.includes("data logger"))return w('<rect x="35" y="35" width="110" height="70" rx="10" class="metal"/><rect x="50" y="48" width="80" height="28" class="screen"/><circle cx="62" cy="90" r="6" class="knob"/><circle cx="90" cy="90" r="6" class="knob"/><circle cx="118" cy="90" r="6" class="knob"/>');
 if(n.includes("temperature sensor"))return w('<rect x="65" y="25" width="50" height="78" rx="8" class="metal"/><rect x="77" y="38" width="26" height="40" class="screen"/><path d="M90 78 V120" class="wire-svg"/>');
 if(n.includes("solar")||n.includes("energy meter")||n.includes("gas sensor"))return w('<rect x="35" y="38" width="110" height="64" rx="8" class="metal"/><rect x="52" y="52" width="76" height="24" class="screen"/><text x="90" y="69" text-anchor="middle" class="digital">LIVE</text>');
 if(n.includes("sample bottle")||n.includes("sample bottles"))return w('<path d="M62 28 H118 V46 H108 V112 Q90 124 72 112 V46 H62 Z" class="glass"/><rect x="72" y="62" width="36" height="34" class="liquid"/>');
 if(n.includes("soil sieve"))return w('<ellipse cx="90" cy="48" rx="55" ry="18" class="metal"/><path d="M35 48 V98 Q90 120 145 98 V48" class="metal"/><ellipse cx="90" cy="48" rx="45" ry="12" class="quadrat"/>');
 if(n.includes("soil sampling kit"))return w('<path d="M55 25 H125 L118 110 H62 Z" class="metal"/><path d="M90 25 V110" class="scale-svg"/><circle cx="90" cy="52" r="14" class="knob"/>');
 if(n.includes("sample net"))return w('<path d="M82 25 L95 82" class="metal"/><path d="M95 82 Q130 72 150 100 Q125 126 95 116 Q80 100 95 82" class="glass"/>');
 if(n.includes("counting tray"))return w('<rect x="28" y="42" width="124" height="62" rx="10" class="tile"/><circle cx="58" cy="73" r="10" class="well"/><circle cx="90" cy="73" r="10" class="well"/><circle cx="122" cy="73" r="10" class="well"/>');
 if(n.includes("field notebook")||n.includes("field data sheet"))return w('<rect x="42" y="22" width="96" height="100" class="paper-svg"/><line x1="55" y1="48" x2="125" y2="48" class="scale-svg"/><line x1="55" y1="65" x2="125" y2="65" class="scale-svg"/><line x1="55" y1="82" x2="125" y2="82" class="scale-svg"/>');
 return null;
}
apparatusSvg=function(name){return auditedExtraSvg(name)||__apparatusSvgV2(name)};
const __opKindAuditV2=opKind;
opKind=function(name){
 const n=String(name||"").toLowerCase();
 if(n.includes("ph meter"))return"phmeter";
 if(n.includes("force meter")||n.includes("newton meter"))return"force";
 if(n.includes("ray box")||n.includes("lamp")||n.includes("light source"))return"light";
 if(n.includes("heater")||n.includes("heat source")||n.includes("bunsen"))return"heater";
 if(n.includes("pH meter"))return"phmeter";
 return __opKindAuditV2(name);
};


$("#toggle3D")?.addEventListener("click",e=>{
 const on=!document.body.classList.contains("flat-lab");
 document.body.classList.toggle("flat-lab",!on);
 e.currentTarget.classList.toggle("active",on);
 e.currentTarget.textContent=on?"3D View":"Flat View";
});

init();
})();