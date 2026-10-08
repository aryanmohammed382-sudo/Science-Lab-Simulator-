(()=>{"use strict";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let mode="experiment",experimentHome=null,chemicalHome=null,procedureHome=null;
function cacheHomes(){
 const workspace=$("#workspaceGrid"),lab=$("#labColumn"),exp=document.querySelector(".experiment-panel"),chem=$("#chemicalSidebar"),proc=$("#procedurePanel");
 if(!workspace||!lab||!exp||!chem||!proc)return false;
 experimentHome={parent:workspace,before:lab};
 chemicalHome={parent:lab,before:$("#infoGrid")};
 procedureHome={parent:workspace,before:null};
 return true;
}
function restore(node,home){
 if(!node||!home)return;
 if(home.before&&home.before.parentElement===home.parent)home.parent.insertBefore(node,home.before);
 else home.parent.appendChild(node);
}
function refreshInstructionHeader(){
 const title=$("#activeTitle"),obj=$("#activeObjective");
 if($("#instructionTitle")&&title)$("#instructionTitle").textContent="Instructions & Notes";
 if($("#instructionObjective")&&obj)$("#instructionObjective").textContent=obj.textContent||"";
 if($("#instructionSubjectLabel")&&title)$("#instructionSubjectLabel").textContent=(title.textContent||"Science Experiment")+" · EXPERIMENT GUIDE";
}
function buildInstructionContent(){
 const box=$("#instructionContent"),lab=$("#labColumn"),title=$("#activeTitle"),obj=$("#activeObjective"),drawer=$("#apparatusTray"),controls=$("#controls"),proc=$("#procedureTab");
 if(!box||!lab||!title)return;
 const cards=[...document.querySelectorAll(".apparatus-card")];
 const apparatus=cards.map(c=>({name:c.querySelector("b")?.textContent||"",svg:c.querySelector(".drawer-visual")?.innerHTML||""}));
 const controlNodes=[...document.querySelectorAll("#controls .control")];
 box.innerHTML='<div class="instruction-card objective-card"><span class="instruction-card-icon">◎</span><div><span class="card-kicker">WHAT YOU ARE INVESTIGATING</span><h3>'+title.textContent+'</h3><p>'+((obj&&obj.textContent)||"Investigate the experiment and record the evidence.")+'</p></div></div>'+
 '<div class="instruction-columns"><div class="instruction-card"><div class="card-heading"><span>⚗</span><h3>Required Apparatus</h3></div><div class="required-apparatus-list">'+apparatus.map(a=>'<div class="required-apparatus-chip"><span class="instruction-apparatus-svg">'+a.svg+'</span><span>'+a.name+'</span></div>').join("")+'</div></div>'+
 '<div class="instruction-card"><div class="card-heading"><span>↕</span><h3>Variables</h3></div><div class="variable-list">'+controlNodes.map(n=>'<div><b>Experiment control</b><span>'+n.querySelector("span")?.textContent+'</span></div>').join("")+'<div><b>Result</b><span>Watch the live reading or visible colour/physical change</span></div></div></div></div>'+
 '<div class="instruction-card"><div class="card-heading"><span>▣</span><h3>How to use the lab</h3></div><ol class="instruction-steps"><li>Open <b>Experiment Tab</b> and drag the required apparatus from the drawer onto the large bench.</li><li>Operate apparatus directly on the bench. Use the contextual controls that appear when an item is selected.</li><li>Return here for the procedure, notes and chemical choices when the experiment requires reagents.</li><li>Change one variable at a time and record the live result in the experiment tab.</li></ol></div>'+
 '<div class="instruction-card observation-card"><div class="card-heading"><span>◉</span><h3>What to observe</h3></div><p>Watch the measured variable and any visible response such as a colour change, precipitate, gas, movement, temperature or electrical reading.</p></div>';
}
function renderInstructionList(){
 const src=document.querySelector(".experiment-panel"),target=$("#instructionExperimentList");
 if(!src||!target)return;
 target.innerHTML="";
 const search=src.querySelector("#experimentSearch");
 const count=src.querySelector("#experimentCountLabel");
 const list=src.querySelector("#experimentList");
 if(search)search.addEventListener("input",()=>{target._mirrorQuery=search.value;target.innerHTML="";cloneItems();});
 function cloneItems(){
   const items=[...src.querySelectorAll(".experiment-item")];
   target.innerHTML=items.map((b,i)=>{const n=b.querySelector("h3")?.textContent||"",p=b.querySelector("p")?.textContent||"",thumb=b.querySelector(".experiment-thumb")?.innerHTML||"";return '<button class="instruction-experiment-item" data-mirror-index="'+i+'"><span class="instruction-experiment-icon">'+thumb+'</span><span><b>'+n+'</b><small>'+p+'</small></span></button>';}).join("")||'<div class="instruction-empty">No experiments found.</div>';
   target.querySelectorAll("[data-mirror-index]").forEach(b=>b.addEventListener("click",()=>{const i=+b.dataset.mirrorIndex,items=[...src.querySelectorAll(".experiment-item")];items[i]?.click();setTimeout(()=>enterMode("instructions"),0);}));
   const active=[...target.querySelectorAll(".instruction-experiment-item")].find(b=>b.textContent.trim().startsWith($("#activeTitle")?.textContent||"___"));active?.classList.add("active");
 }
 cloneItems();
 if(list&&count){const obs=new MutationObserver(cloneItems);obs.observe(list,{childList:true,subtree:true});target._observer=obs;}
}
function enterMode(next){
 if(next==="instructions"&&!$("#activeTitle")?.textContent||$("#activeTitle")?.textContent==="Select an experiment")return;
 cacheHomes();
 const workspace=$("#workspaceGrid"),lab=$("#labColumn"),exp=document.querySelector(".experiment-panel"),chem=$("#chemicalSidebar"),proc=$("#procedurePanel");
 if(!workspace||!lab||!exp||!chem||!proc)return;
 mode=next;
 $$(".lab-mode-tab").forEach(b=>b.classList.toggle("active",b.dataset.labMode===next));
 if(next==="instructions"){
   workspace.style.display="none";lab.classList.add("hidden-instructions-lab");
   $("#instructionsView")?.classList.add("active");
   $("#instructionsChemicalMount")?.appendChild(chem);
   $("#instructionsProcedureMount")?.appendChild(proc);
   $("#instructionExperimentList")?.appendChild(exp);
   exp.classList.add("instruction-moved-panel");
   buildInstructionContent();refreshInstructionHeader();
   const notes=$("#instructionNotesBox"),key="sls-experiment-notes-"+(document.title+"-"+($("#activeTitle")?.textContent||"")).replace(/\s+/g,"-");
   if(notes)notes.value=localStorage.getItem(key)||"";
 }else{
   restore(exp,experimentHome);restore(chem,chemicalHome);restore(proc,procedureHome);
   exp.classList.remove("instruction-moved-panel");$("#instructionsView")?.classList.remove("active");
   workspace.style.display="";lab.classList.remove("hidden-instructions-lab");
 }
 document.body.classList.toggle("instructions-mode",next==="instructions");
 document.body.classList.toggle("experiment-active",next==="experiment");
 window.scrollTo({top:0,behavior:"smooth"});
}
function bind(){
 cacheHomes();
 $$(".lab-mode-tab").forEach(b=>b.addEventListener("click",()=>enterMode(b.dataset.labMode)));
 $("#instructionBtn")?.addEventListener("click",()=>enterMode("instructions"));
 $("#experimentNav")?.addEventListener("click",()=>enterMode("experiment"));
 $$(".instruction-main-tab").forEach(b=>b.addEventListener("click",()=>{const t=b.dataset.instructionTab;$$("#instructionContent,#instructionNotes").forEach(x=>x.classList.add("hidden"));$("#"+(t==="notes"?"instructionNotes":"instructionContent"))?.classList.remove("hidden");if(t==="notes"){const key="sls-experiment-notes-"+(document.title+"-"+($("#activeTitle")?.textContent||"")).replace(/\s+/g,"-"),n=$("#instructionNotesBox");if(n)n.value=localStorage.getItem(key)||"";}}));
 $("#instructionNotesBox")?.addEventListener("input",e=>{const key="sls-experiment-notes-"+(document.title+"-"+($("#activeTitle")?.textContent||"")).replace(/\s+/g,"-");localStorage.setItem(key,e.target.value);$("#notesSaveState").textContent="Saved automatically";});
 const originalClick=document.body.addEventListener;
 document.addEventListener("click",e=>{if(e.target.closest(".experiment-item")&&mode==="instructions")setTimeout(()=>{buildInstructionContent();refreshInstructionHeader();},30);});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind);else bind();
})();