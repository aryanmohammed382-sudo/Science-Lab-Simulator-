(()=>{"use strict";
const E=window.EXPERIMENTS||[],$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let subject=null,current=null,S=null,drag=null,toastTimer;
const esc=x=>String(x??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const subjectInfo={Physics:{label:"Physics",icon:"⚛",class:"physics"},Chemistry:{label:"Chemistry",icon:"⚗",class:"chemistry"},Biology:{label:"Biology",icon:"◉",class:"biology"},Environmental:{label:"Environmental Science",icon:"◎",class:"environmental"}};
const normalizeSubject=s=>s==="Environmental Science"?"Environmental":s;
const fallback={Physics:["DC power supply","Ammeter","Voltmeter","Connecting wires"],Chemistry:["Beaker","Conical flask","Measuring cylinder","Thermometer"],Biology:["Microscope","Microscope slide","Coverslip","Plant sample"],Environmental:["Quadrat","Soil sample","Measuring instruments","Data sheet"]};
const ranges=n=>{n=n.toLowerCase();if(n.includes("ph"))return[1,14,.1,7];if(n.includes("angle"))return[0,85,1,30];if(n.includes("temperature"))return[5,90,1,25];if(n.includes("voltage"))return[0,12,.1,6];if(n.includes("resistance"))return[1,100,1,20];if(n.includes("mass"))return[1,500,1,50];if(/length|distance|height|diameter|volume/.test(n))return[1,100,.1,20];if(n.includes("time"))return[1,120,1,10];return[0,100,.1,20]};
const req=e=>[...new Set((e?.materials?.length?e.materials:fallback[e?.subject]||fallback.Physics).filter(Boolean))].slice(0,8);
const newState=e=>({setup:[],values:(e.controls||["Variable A","Variable B"]).slice(0,2).map((n,i)=>ranges(n)[3]),rows:[],running:false,completed:false});
function toast(t){const x=$("#toast");if(!x)return;x.textContent=t;x.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>x.classList.remove("show"),1900)}
function save(){localStorage.setItem("sls-redesign-state",JSON.stringify({subject,current:current?.id,S}))}
function formula(e){const a=+S.values[0]||0,b=+S.values[1]||0;switch(e.type){case"ohm":return a/(b||1);case"series":return a/(b+20);case"parallel":return a/(b||1);case"resistivity":return .0175*a/(Math.PI*Math.pow(b/2000,2));case"power":return a*a/(b||1);case"density":return a/(b||1);case"hooke":return a/(b||1);case"pendulum":return 2*Math.PI*Math.sqrt(Math.max(.01,a/100));case"moments":case"friction":return a*b;case"lens":return a===b?Infinity:a*b/(a-b);case"refraction":return Math.asin(Math.sin(a*Math.PI/180)/(b||1))*180/Math.PI;case"thermal":return a*50;case"gas":return a?b*100/a:0;default:return(a+b)/2}}
function equation(e){return{ohm:"V = I × R",series:"Rₜ = R₁ + R₂",parallel:"1/Rₜ = 1/R₁ + 1/R₂",resistivity:"R = ρL/A",power:"P = V × I",density:"ρ = m/V",hooke:"F = kx",pendulum:"T = 2π√(L/g)",moments:"Clockwise = Anticlockwise",friction:"F = μN",lens:"1/f = 1/u + 1/v",refraction:"n₁sinθ₁ = n₂sinθ₂",thermal:"Q = mcΔT",gas:"PV = constant"}[e.type]||"Use the recorded evidence to identify the relationship."}
function apparatusSvg(name){const n=String(name).toLowerCase(),label=esc(name);const w=b=>'<svg class="apparatus-svg" viewBox="0 0 180 140" aria-label="'+label+'">'+b+"</svg>";
if(n.includes("ammeter")||n.includes("voltmeter")){const u=n.includes("ammeter")?"A":"V";return w('<rect x="22" y="18" width="136" height="100" rx="18" class="metal"/><rect x="42" y="37" width="96" height="42" rx="6" class="screen"/><text x="90" y="66" text-anchor="middle" class="digital">0.00 '+u+'</text><circle cx="62" cy="98" r="9" class="knob"/><circle cx="118" cy="98" r="9" class="knob"/><circle cx="35" cy="98" r="5" class="port"/><circle cx="145" cy="98" r="5" class="port"/>')}
if(/power supply|battery|dc supply/.test(n))return w('<rect x="15" y="35" width="150" height="78" rx="12" class="metal"/><rect x="29" y="48" width="67" height="30" rx="5" class="screen"/><text x="62" y="68" text-anchor="middle" class="digital">6.0 V</text><circle cx="128" cy="63" r="18" class="knob"/><circle cx="42" cy="96" r="6" class="port"/><circle cx="138" cy="96" r="6" class="port"/>');
if(n.includes("resistor"))return w('<line x1="12" y1="70" x2="43" y2="70" class="wire-svg"/><path d="M43 70 L55 48 L68 92 L81 48 L94 92 L107 48 L120 70" class="resistor-svg"/><line x1="120" y1="70" x2="168" y2="70" class="wire-svg"/>');
if(n.includes("wire"))return w('<path d="M15 82 C45 15 135 15 165 82" class="wire-coil"/><circle cx="15" cy="82" r="8" class="port"/><circle cx="165" cy="82" r="8" class="port"/>');
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
function mini(name){return apparatusSvg(name).replace('class="apparatus-svg"','class="apparatus-svg mini-svg"')}
function setupOK(){const have=S.setup.map(x=>String(x.name).toLowerCase());return req(current).every(r=>have.some(h=>h===r.toLowerCase()||h.includes(r.toLowerCase())||r.toLowerCase().includes(h)))}
function subjectCards(){const groups=["Physics","Chemistry","Biology","Environmental"];const html=groups.map(s=>{const i=subjectInfo[s],n=E.filter(e=>normalizeSubject(e.subject)===s).length;return'<button class="subject-card '+i.class+(subject===s?" active":"")+'" data-subject="'+s+'"><span class="subject-icon">'+i.icon+'</span><b>'+i.label+'</b><small>'+n+' experiments</small></button>'}).join("");$("#subjectGrid").innerHTML=html;$("#modalSubjects").innerHTML=groups.map(s=>{const i=subjectInfo[s],n=E.filter(e=>normalizeSubject(e.subject)===s).length;return'<button class="modal-subject '+i.class+'" data-subject="'+s+'">'+i.icon+' '+i.label+'<small>'+n+' experiments</small></button>'}).join("");$$("[data-subject]").forEach(b=>b.addEventListener("click",()=>chooseSubject(b.dataset.subject)))}
function chooseSubject(s){subject=s;$("#subjectModal").classList.add("hidden");subjectCards();renderExperimentList();const first=E.find(e=>normalizeSubject(e.subject)===subject);if(first)load(first);window.scrollTo({top:0,behavior:"smooth"});save()}
function renderExperimentList(){const box=$("#experimentList"),q=($("#experimentSearch").value||"").toLowerCase(),arr=E.filter(e=>normalizeSubject(e.subject)===subject&&(!q||[e.name,e.objective].join(" ").toLowerCase().includes(q)));$("#experimentCountLabel").textContent=arr.length+" available";box.innerHTML=arr.map(e=>'<button class="experiment-item '+(current?.id===e.id?"active":"")+'" data-id="'+esc(e.id)+'"><span class="experiment-thumb">'+mini((e.materials||fallback[e.subject]||["Beaker"])[0])+'</span><span><h3>'+esc(e.name)+'</h3><p>'+esc(e.subject)+' · '+(e.level===1?"Beginner":e.level===2?"Intermediate":"Advanced")+'</p><small>'+req(e).length+' apparatus · Practical</small></span></button>').join("")||'<div style="padding:20px;color:#789;font-size:10px">No experiments found.</div>';box.querySelectorAll("[data-id]").forEach(b=>b.addEventListener("click",()=>load(E.find(e=>e.id===b.dataset.id))))}
function load(e){if(!e)return;current=e;S=newState(e);renderExperimentList();renderAll();save();document.querySelector(".lab-column")?.scrollIntoView({behavior:"smooth",block:"start"})}
function renderAll(){if(!current)return;$("#activeTitle").textContent=current.name;$("#activeObjective").textContent=current.objective;$("#overviewText").textContent=current.objective+" "+(current.text||"");$("#variablesText").innerHTML="<b>Independent:</b> "+esc(current.controls?.[0]||"Variable A")+"<br><b>Dependent:</b> "+esc(current.columns?.[3]||"Result")+"<br><b>Controlled:</b> Keep other conditions constant.";$("#equationText").textContent=equation(current);$("#outcomesText").innerHTML="<li>Understand "+esc(current.name)+"</li><li>Collect repeated measurements</li><li>Analyse and explain evidence</li>";renderBench();renderDrawer();renderControls();renderProcedure();renderReadings();renderTable();renderNotebook();updateState()}
function renderBench(){const p=$("#placedApparatus");p.innerHTML=S.setup.map((item,i)=>'<div class="placed-item" data-index="'+i+'" style="left:'+item.x+'%;top:'+item.y+'%"><span class="placed-visual">'+apparatusSvg(item.name)+'</span><b>'+esc(item.name)+'</b><button class="remove-apparatus" data-remove="'+i+'">×</button></div>').join("");$("#benchTip").classList.toggle("hidden",S.setup.length>0);p.querySelectorAll(".remove-apparatus").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();S.setup.splice(+b.dataset.remove,1);renderAll();toast("Apparatus removed")}));p.querySelectorAll(".placed-item").forEach(el=>enablePlacedDrag(el))}
function renderDrawer(){const box=$("#apparatusTray"),q=($("#apparatusSearch").value||"").toLowerCase(),items=req(current).filter(n=>n.toLowerCase().includes(q));box.innerHTML=items.map(n=>{const placed=S.setup.some(x=>x.name===n);return'<button class="apparatus-card '+(placed?"placed":"required")+'" data-name="'+esc(n)+'" '+(placed?"disabled":"")+'><span class="drawer-visual">'+apparatusSvg(n)+'</span><b>'+esc(n)+'</b><small>'+(placed?"PLACED":"REQUIRED")+'</small></button>'}).join("")||'<span style="font-size:9px;color:#aac">No matching apparatus.</span>';box.querySelectorAll(".apparatus-card:not([disabled])").forEach(b=>enableTrayDrag(b))}
function enableTrayDrag(el){el.addEventListener("pointerdown",e=>{if(e.button!==0)return;e.preventDefault();drag={name:el.dataset.name,moved:false,startX:e.clientX,startY:e.clientY,ghost:null,pointerId:e.pointerId};el.setPointerCapture?.(e.pointerId);document.addEventListener("pointermove",dragMove);document.addEventListener("pointerup",dragEnd,{once:true})})}
function dragMove(e){if(!drag)return;if(!drag.moved&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<4)return;if(!drag.moved){drag.moved=true;drag.ghost=document.createElement("div");drag.ghost.className="drag-ghost";drag.ghost.innerHTML=apparatusSvg(drag.name);document.body.appendChild(drag.ghost);$("#bench").classList.add("drag-target")}if(drag.ghost){drag.ghost.style.left=e.clientX+"px";drag.ghost.style.top=e.clientY+"px"}}
function dragEnd(e){if(!drag)return;const d=drag;drag=null;document.removeEventListener("pointermove",dragMove);$("#bench").classList.remove("drag-target");if(d.ghost)d.ghost.remove();if(!d.moved){toast("Drag the apparatus onto the bench to place it");return}const r=$("#bench").getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom){toast("Release the apparatus over the bench");return}placeAt(d.name,e.clientX,e.clientY)}
function placeAt(name,clientX,clientY){if(S.setup.some(x=>x.name===name)){toast(name+" is already on the bench");return}const r=$("#bench").getBoundingClientRect();const x=Math.max(6,Math.min(94,((clientX-r.left)/r.width)*100));const y=Math.max(10,Math.min(88,((clientY-r.top)/r.height)*100));S.setup.push({name,x:+x.toFixed(2),y:+y.toFixed(2)});renderAll();toast(name+" placed exactly where you dropped it")}
function enablePlacedDrag(el){el.addEventListener("pointerdown",e=>{if(e.target.closest(".remove-apparatus"))return;e.preventDefault();const i=+el.dataset.index,bench=$("#bench"),r=bench.getBoundingClientRect(),item=S.setup[i];const move=ev=>{const x=Math.max(6,Math.min(94,((ev.clientX-r.left)/r.width)*100));const y=Math.max(10,Math.min(88,((ev.clientY-r.top)/r.height)*100));item.x=+x.toFixed(2);item.y=+y.toFixed(2);el.style.left=item.x+"%";el.style.top=item.y+"%"};const up=ev=>{el.releasePointerCapture?.(ev.pointerId);el.classList.remove("moving");el.removeEventListener("pointermove",move);el.removeEventListener("pointerup",up);save()};el.setPointerCapture?.(e.pointerId);el.classList.add("moving");el.addEventListener("pointermove",move);el.addEventListener("pointerup",up)})}
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
 "Phenolphthalein":{color:"#f5a2d2",symbol:"PP"},
 "Sodium thiosulfate solution":{color:"#d8e9ef",symbol:"Na2S2O3"},
 "Hydrogen peroxide":{color:"#d8f5ff",symbol:"H2O2"},
 "Iodine solution":{color:"#8b5a2b",symbol:"I2"},
 "Benedict's solution":{color:"#4f9fd1",symbol:"Benedict"},
 "Biuret reagent":{color:"#7459c8",symbol:"Biuret"},
 "Sodium hydrogencarbonate solution":{color:"#d7f1ff",symbol:"NaHCO3"},
 "Sucrose solution":{color:"#dcecff",symbol:"Sucrose"},
 "Salt solution":{color:"#dcecff",symbol:"Salt"},
 "Acid sample":{color:"#ffd6df",symbol:"Acid"},
 "Base sample":{color:"#d8e7ff",symbol:"Base"},
 "Solvent":{color:"#d7f1ff",symbol:"Solvent"},
 "Ink sample":{color:"#394f9b",symbol:"Ink"},
 "Electrolyte solution":{color:"#b8e9f4",symbol:"Electrolyte"},
 "Metal salt solution":{color:"#7ec5d7",symbol:"Salt"}
};
let selectedChemical=null,pourMode=false,connectionMode=false,connectionFirst=null,markerMode=false;

function interactionSpec(e){
 const t=(e?.type||"").toLowerCase(), n=(e?.name||"").toLowerCase(), m=(e?.materials||[]).join(" ").toLowerCase();
 let chemicals=[];
 const maps={
  titration:["Dilute hydrochloric acid","Dilute sodium hydroxide","Phenolphthalein"],
  ph:["Universal indicator","Water"],
  rates:["Dilute hydrochloric acid","Sodium thiosulfate solution"],
  electrolysis:["Electrolyte solution","Water"],
  displacement:["Metal salt solution","Water"],
  flame:["Dilute hydrochloric acid"],
  salt:["Dilute hydrochloric acid","Dilute sodium hydroxide"],
  food:["Iodine solution","Benedict's solution","Biuret reagent"],
  osmosis:["Sucrose solution","Water"],
  enzyme:["Hydrogen peroxide","Water"],
  photosynthesis:["Sodium hydrogencarbonate solution","Water"],
  respiration:["Water"],
  transpiration:["Water"],
  chromatography:["Solvent","Ink sample"]
 };
 if(maps[t]) chemicals=maps[t];
 else if(n.includes("chromatography")) chemicals=maps.chromatography;
 else if(/carbonate|neutralisation|acid|alkali/.test(n)) chemicals=["Dilute hydrochloric acid","Dilute sodium hydroxide"];
 else if(e?.subject==="Chemistry") chemicals=["Water","Acid sample","Base sample"];
 const wires=/wire|wires|connecting/.test(m)||["ohm","series","parallel","electrolysis"].includes(t);
 const markers=/lens|refraction|diffraction|interference|projectile|pendulum|free-fall|inclined|wave|calibration|measurement/.test(n);
 return {chemicals:[...new Set(chemicals)],wires,connections:wires?(t==="series"||t==="parallel"?3:1):0,markers:markers?2:0};
}
function ensureInteractionState(){
 if(!S.chemicals)S.chemicals={};
 if(!S.pours)S.pours=[];
 if(!S.connections)S.connections=[];
 if(!S.markers)S.markers=[];
}
function interactionOK(){
 ensureInteractionState();
 const spec=interactionSpec(current);
 return {
  chemOK:spec.chemicals.every(c=>(S.chemicals[c]?.volume||0)>0),
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
function chemicalColor(name){return CHEMICALS[name]?.color||"#bfe8f4"}
function isContainer(name){return /beaker|flask|test tube|spotting|basin|dish|cylinder|burette|pipette|tube/i.test(name)}

function renderChemicals(){
 ensureInteractionState();
 const box=$("#chemicalTray"),status=$("#chemicalStatus"),spec=interactionSpec(current);
 if(!box)return;
 const list=spec.chemicals.length?spec.chemicals:Object.keys(CHEMICALS).slice(0,4);
 box.innerHTML=list.map(c=>{
  const v=S.chemicals[c]?.volume??100;
  return '<button class="chemical-card '+(selectedChemical===c?"selected":"")+'" data-chemical="'+esc(c)+'"><span class="chemical-bottle" style="--chemical:'+chemicalColor(c)+'"><b>'+esc(CHEMICALS[c]?.symbol||"")+'</b></span><span><strong>'+esc(c)+'</strong><small>'+v+' mL available</small></span></button>';
 }).join("");
 box.querySelectorAll(".chemical-card").forEach(b=>b.addEventListener("click",()=>{
  selectedChemical=b.dataset.chemical;
  pourMode=true;connectionMode=false;connectionFirst=null;
  document.querySelectorAll(".placed-item").forEach(x=>x.classList.add("pour-target"));
  renderChemicals();renderConnections();
  toast("Selected "+selectedChemical+" — click a container to pour");
 }));
 if(status)status.textContent=selectedChemical?"Pouring: "+selectedChemical:"Choose a chemical, then click a container to pour 10 mL.";
}

function renderConnections(){
 ensureInteractionState();
 const box=$("#connectionPanel");if(!box)return;
 const spec=interactionSpec(current);
 box.innerHTML='<div class="interaction-title">Real-world setup</div>'+
  '<button class="interaction-action '+(connectionMode?"active":"")+'" id="connectBtn">⌁ '+(connectionMode?"Connecting — click two apparatus":"Connect wires")+'</button>'+
  '<button class="interaction-action '+(pourMode?"active":"")+'" id="pourBtn">◉ '+(pourMode?"Pour mode active":"Choose chemical")+'</button>'+
  '<button class="interaction-action '+(markerMode?"active":"")+'" id="markerBtn">⊙ '+(markerMode?"Click the bench to place marker":"Place fiducial marker")+'</button>'+
  '<div class="interaction-status">'+(spec.wires?"Connections "+S.connections.length+" / "+spec.connections:"No wire connection required for this experiment.")+'</div>'+
  (spec.markers?'<div class="interaction-status">Fiducial markers '+S.markers.length+" / "+spec.markers+'</div>':"")+
  (spec.chemicals.length?'<div class="interaction-status">Chemical additions: '+S.pours.length+'</div>':"");
 $("#connectBtn")?.addEventListener("click",()=>{
  connectionMode=!connectionMode;pourMode=false;selectedChemical=null;connectionFirst=null;markerMode=false;
  document.querySelectorAll(".placed-item").forEach(x=>x.classList.remove("pour-target","connection-first"));
  renderConnections();toast(connectionMode?"Click the first apparatus, then the second":"Wire mode off");
 });
 $("#pourBtn")?.addEventListener("click",()=>{
  if(!spec.chemicals.length)return toast("No chemical addition is required here");
  pourMode=true;connectionMode=false;markerMode=false;selectedChemical=selectedChemical||spec.chemicals[0];
  renderChemicals();renderConnections();toast("Choose a chemical, then click a container");
 });
 $("#markerBtn")?.addEventListener("click",()=>{
  if(!spec.markers)return toast("Fiducial markers are not needed for this experiment");
  markerMode=!markerMode;connectionMode=false;pourMode=false;selectedChemical=null;
  renderConnections();toast(markerMode?"Click anywhere on the bench to place a marker":"Marker mode off");
 });
}

function pourChemical(targetIndex){
 ensureInteractionState();
 if(!selectedChemical)return toast("Choose a chemical first");
 const target=S.setup[targetIndex];
 if(!target||!isContainer(target.name))return toast("Pour into a beaker, flask, tube, basin or similar container");
 const available=S.chemicals[selectedChemical]?.volume??100;
 if(available<10)return toast("That bottle is empty");
 S.chemicals[selectedChemical]={volume:available-10};
 target.liquid=target.liquid||[];
 target.liquid.push({chemical:selectedChemical,amount:10});
 S.pours.push({chemical:selectedChemical,target:target.name,amount:10});
 toast("10 mL of "+selectedChemical+" poured into "+target.name);
 selectedChemical=null;pourMode=false;
 renderAll();save();
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

function renderInteractionGraphics(){
 const layer=$("#connectionLayer"),markers=$("#fiducials");
 if(layer)layer.innerHTML=S.connections.map(c=>{
  const a=S.setup[c.a],b=S.setup[c.b];if(!a||!b)return "";
  return '<line x1="'+a.x+'%" y1="'+a.y+'%" x2="'+b.x+'%" y2="'+b.y+'%" class="connection-line"/>';
 }).join("");
 if(markers)markers.innerHTML=S.markers.map(m=>'<div class="fiducial-marker" style="left:'+m.x+'%;top:'+m.y+'%"><span>'+m.id+'</span></div>').join("");
}

function renderBench(){
 ensureInteractionState();
 const p=$("#placedApparatus");
 p.innerHTML=S.setup.map((item,i)=>{
  const liq=item.liquid?.length?item.liquid[item.liquid.length-1]:null;
  return '<div class="placed-item" data-index="'+i+'" style="left:'+item.x+'%;top:'+item.y+'%"><span class="placed-visual">'+apparatusSvg(item.name)+'</span>'+
   (liq?'<span class="liquid-overlay" style="--liquid:'+chemicalColor(liq.chemical)+'"></span>':"")+
   '<b>'+esc(item.name)+'</b><button class="remove-apparatus" data-remove="'+i+'">×</button></div>';
 }).join("");
 $("#benchTip").classList.toggle("hidden",S.setup.length>0);
 p.querySelectorAll(".remove-apparatus").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();S.setup.splice(+b.dataset.remove,1);renderAll();toast("Apparatus removed")}));
 p.querySelectorAll(".placed-item").forEach(el=>enablePlacedDrag(el));
 renderInteractionGraphics();
}

function enablePlacedDrag(el){
 el.addEventListener("pointerdown",e=>{
  if(e.target.closest(".remove-apparatus"))return;
  const i=+el.dataset.index;
  if(pourMode){e.preventDefault();pourChemical(i);return}
  if(selectConnection(i))return;
  if(markerMode)return;
  e.preventDefault();
  const bench=$("#bench"),r=bench.getBoundingClientRect(),item=S.setup[i];
  const move=ev=>{
   const x=Math.max(6,Math.min(94,((ev.clientX-r.left)/r.width)*100));
   const y=Math.max(10,Math.min(88,((ev.clientY-r.top)/r.height)*100));
   item.x=+x.toFixed(2);item.y=+y.toFixed(2);el.style.left=item.x+"%";el.style.top=item.y+"%";renderInteractionGraphics();
  };
  const up=ev=>{el.releasePointerCapture?.(ev.pointerId);el.classList.remove("moving");el.removeEventListener("pointermove",move);el.removeEventListener("pointerup",up);save()};
  el.setPointerCapture?.(e.pointerId);el.classList.add("moving");el.addEventListener("pointermove",move);el.addEventListener("pointerup",up);
 });
}

function renderAll(){
 if(!current)return;
 ensureInteractionState();
 $("#activeTitle").textContent=current.name;$("#activeObjective").textContent=current.objective;
 $("#overviewText").textContent=current.objective+" "+(current.text||"");
 $("#variablesText").innerHTML="<b>Independent:</b> "+esc(current.controls?.[0]||"Variable A")+"<br><b>Dependent:</b> "+esc(current.columns?.[3]||"Result")+"<br><b>Controlled:</b> Keep other conditions constant.";
 $("#equationText").textContent=equation(current);
 $("#outcomesText").innerHTML="<li>Understand "+esc(current.name)+"</li><li>Collect repeated measurements</li><li>Analyse and explain evidence</li>";
 renderBench();renderDrawer();renderControls();renderChemicals();renderConnections();renderProcedure();renderReadings();renderTable();renderNotebook();updateState();
}

function renderProcedure(){
 const io=interactionSpec(current),extra=[];
 if(io.chemicals.length)extra.push("Choose the correct chemicals and pour measured amounts into the appropriate containers.");
 if(io.wires)extra.push("Connect the required apparatus before switching on the supply.");
 if(io.markers)extra.push("Place "+io.markers+" fiducial markers at useful fixed measurement points.");
 const items=["Read the objective: "+current.objective,"Place every required apparatus on the bench using the drawer.",...extra,"Set "+(current.controls?.[0]||"the first variable")+" and "+(current.controls?.[1]||"the second variable")+" using the controls.","Start the experiment and observe the live response.","Record at least three measurements, changing one variable at a time.","Compare the evidence with the expected relationship: "+equation(current)];
 $("#procedureTab").innerHTML='<h3 class="procedure-title">Step-by-Step Guide</h3>'+items.map((t,i)=>'<div class="step"><span class="step-num">'+(i+1)+'</span><p>'+esc(t)+'</p></div>').join("")+
 '<div class="apparatus-check"><h4>Required Apparatus</h4>'+req(current).map(n=>{const done=S.setup.some(x=>x.name===n);return '<div class="check-row '+(done?"done":"")+'"><span>'+(done?"✓":"")+'</span>'+esc(n)+'</div>'}).join("")+
 '</div><div class="apparatus-check"><h4>Experiment-specific setup</h4>'+
 (io.chemicals.length?io.chemicals.map(n=>'<div class="check-row '+((S.chemicals[n]?.volume||0)>0?"done":"")+'"><span>'+((S.chemicals[n]?.volume||0)>0?"✓":"")+'</span>'+esc(n)+'</div>').join(""):"")+
 (io.wires?'<div class="check-row '+(S.connections.length>=io.connections?"done":"")+'"><span>'+(S.connections.length>=io.connections?"✓":"")+'</span>Electrical connections: '+S.connections.length+" / "+io.connections+'</div>':"")+
 (io.markers?'<div class="check-row '+(S.markers.length>=io.markers?"done":"")+'"><span>'+(S.markers.length>=io.markers?"✓":"")+'</span>Fiducial markers: '+S.markers.length+" / "+io.markers+'</div>':"")+
 '</div><p class="procedure-note">'+esc(current.safety||"Follow normal laboratory safety procedures.")+'</p>';
}

function updateState(){
 const ok=setupOK(),x=$("#runState");
 x.textContent=S.completed?"COMPLETE":S.running?"RUNNING":ok?"READY":"SETUP REQUIRED";
 x.className="run-state "+(S.completed||ok?"ready":S.running?"running":"");
 $("#startBtn").disabled=!ok||S.running;$("#recordBtn").disabled=!S.running||!ok;
}
function reset(){
 S=newState(current);ensureInteractionState();selectedChemical=null;pourMode=false;connectionMode=false;connectionFirst=null;markerMode=false;
 renderAll();toast("Experiment reset");
}

const originalBenchClick=document.addEventListener.bind(document);
document.addEventListener("click",e=>{
 if(e.target.closest(".placed-item")||e.target.closest(".apparatus-card")||e.target.closest(".chemical-card"))return;
 if(markerMode&&e.target.closest("#bench"))placeMarkerAtEvent(e);
});
init();
})();