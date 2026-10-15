const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const hrefUrl=v=>{v=String(v??"").trim();if(!v)return "#";if(/^(mailto:|tel:)/i.test(v))return v;return /^(https?:\/\/)/i.test(v)?v:"https://"+v};
const clone=o=>JSON.parse(JSON.stringify(o));
const defaultData={
 meta:{name:"Your Name",headline:"Your Professional Title",email:"name@email.com",phone:"+49 000 000000",location:"Berlin, Germany",website:"portfolio.example.com",linkedin:"linkedin.com/in/yourname",photo:null},
 design:{template:"classic",pageSize:"A4",font:"Inter",accent:"#447CE8",text:"#2B2B2B",fontSize:10.5,margin:18,icons:true,compact:false,
  photoSize:36,photoWidth:29,photoRadius:7,
  nameSize:28,nameWeight:750,nameStyle:"normal",
  headlineSize:12,headlineWeight:500,headlineStyle:"normal",
  contactSize:9,contactWeight:400,contactStyle:"normal",
  sectionSize:11,sectionWeight:800,sectionStyle:"uppercase",sectionBorder:true,
  descriptionSize:10.5,descriptionWeight:400,descriptionStyle:"normal",descriptionLine:1.38},
 sections:[
  {id:uid(),type:"summary",title:"Professional Summary",body:"A concise professional summary describing your experience, strengths, and target role."},
  {id:uid(),type:"experience",title:"Experience",items:[
    {role:"Position Title",company:"ORGANIZATION",location:"City, Country",dates:"Month Year – Month Year",bullets:["Describe your experience, skills, and resulting outcomes.","Begin each bullet with an action verb and quantify where possible."]}
  ]},
  {id:uid(),type:"education",title:"Education",items:[
    {degree:"Degree, Concentration",school:"UNIVERSITY",location:"City, Country",dates:"Graduation Date",details:"Relevant coursework, awards, honors or thesis."}
  ]},
  {id:uid(),type:"skills",title:"Skills",groups:[
    {label:"Technical",value:"Software, programming languages, tools"},
    {label:"Languages",value:"English — Fluent; German — A2"}
  ]},
  {id:uid(),type:"custom",title:"Leadership & Activities",items:[
    {role:"ORGANIZATION",company:"Role",location:"City, Country",dates:"Month Year – Month Year",bullets:["Activity, leadership, or achievement."]}
  ]}
 ]};
function normalizeData(x){
 const base=clone(defaultData);
 const out=x&&typeof x==='object'?x:{};
 out.meta={...base.meta,...(out.meta||{})};
 out.design={...base.design,...(out.design||{})};
 if(!Array.isArray(out.sections))out.sections=clone(base.sections);
 out.sections=out.sections.map(sec=>({id:sec.id||uid(),...sec}));
 return out;
}
let data=normalizeData(load()||defaultData), history=[], future=[], zoom=0.85;

function snapshot(){history.push(JSON.stringify(data));if(history.length>30)history.shift();future=[]}
function save(){
 try{localStorage.setItem("ein-cv:data:v1",JSON.stringify(data));localStorage.setItem("cvbuilder-data",JSON.stringify(data));localStorage.setItem("ein-cv:last-saved",new Date().toISOString());const state=$("#saveState");if(state){state.textContent="Saved just now";state.classList.add("saved")}setTimeout(()=>{if(state){state.textContent="Auto-saved";state.classList.remove("saved")}},1100)}catch(e){$("#saveState").textContent="Storage unavailable"}
}
function load(){try{const raw=localStorage.getItem("ein-cv:data:v1")||localStorage.getItem("cvbuilder-data");if(!raw)return null;const x=JSON.parse(raw);if(!x||typeof x!=="object"||!x.meta||!x.design||!Array.isArray(x.sections))return null;return x}catch{return null}}
function mutate(fn){snapshot();fn();renderAll();save()}
function renderAll(){renderControls();renderProfileEditor();renderSectionEditor();renderPaper();applyZoom();updateOverview()}
function setControl(id,value,labelId,suffix=""){
 const el=$(id);if(el)el.value=value;
 const lab=labelId?$(labelId):null;if(lab)lab.textContent=value+suffix;
}
function renderControls(){
 const d=data.design;
 $("#templateSelect").value=d.template;$("#pageSize").value=d.pageSize;$("#fontSelect").value=d.font;
 $("#accentColor").value=d.accent;$("#textColor").value=d.text;$("#fontSize").value=d.fontSize;$("#fontSizeValue").textContent=d.fontSize+"px";
 $("#marginSize").value=d.margin;$("#marginValue").textContent=d.margin+"mm";$("#showIcons").checked=d.icons;$("#compactMode").checked=d.compact;
 setControl("#photoSize",d.photoSize,"#photoSizeValue","mm");setControl("#photoWidth",d.photoWidth,"#photoWidthValue","mm");
 setControl("#nameSize",d.nameSize,"#nameSizeValue","px");setControl("#headlineSize",d.headlineSize,"#headlineSizeValue","px");setControl("#contactSize",d.contactSize,"#contactSizeValue","px");
 setControl("#sectionSize",d.sectionSize,"#sectionSizeValue","px");setControl("#descriptionSize",d.descriptionSize,"#descriptionSizeValue","px");setControl("#descriptionLine",d.descriptionLine,"#descriptionLineValue","");
 $("#photoRadius").value=d.photoRadius;$("#photoRadiusValue").textContent=d.photoRadius+"px";
 $("#nameWeight").value=d.nameWeight;$("#headlineWeight").value=d.headlineWeight;$("#contactWeight").value=d.contactWeight;$("#sectionWeight").value=d.sectionWeight;$("#descriptionWeight").value=d.descriptionWeight;
 $("#nameStyle").value=d.nameStyle;$("#headlineStyle").value=d.headlineStyle;$("#contactStyle").value=d.contactStyle;$("#sectionStyle").value=d.sectionStyle;$("#descriptionStyle").value=d.descriptionStyle;$("#sectionBorder").checked=d.sectionBorder;
}
function field(label,value,oninput,type="text"){
 const wrap=document.createElement("div");wrap.className="field";wrap.innerHTML=`<label>${esc(label)}</label><${type==="textarea"?"textarea":"input"} ${type==="textarea"?"":"type=\"text\""}>${type==="textarea"?esc(value):""}</${type==="textarea"?"textarea":"input"}>`;
 const el=wrap.querySelector("input,textarea");if(type!=="textarea")el.value=value??"";el.addEventListener("input",e=>{oninput(e.target.value);renderPaper();save()});return wrap;
}

async function prepareProfilePhoto(file){
 if(!file || !file.type.startsWith("image/"))throw new Error("Please choose an image file.");
 if(file.size>10*1024*1024)throw new Error("Please choose an image smaller than 10 MB.");
 const url=URL.createObjectURL(file);
 try{
  const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error("Could not read the image."));i.src=url});
  const targetW=420,targetH=525,targetRatio=targetW/targetH,sourceRatio=img.width/img.height;
  let sx=0,sy=0,sw=img.width,sh=img.height;
  if(sourceRatio>targetRatio){sw=Math.round(img.height*targetRatio);sx=Math.round((img.width-sw)/2)}
  else if(sourceRatio<targetRatio){sh=Math.round(img.width/targetRatio);sy=Math.round((img.height-sh)/2)}
  const canvas=document.createElement("canvas");canvas.width=targetW;canvas.height=targetH;
  const ctx=canvas.getContext("2d");ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
  ctx.drawImage(img,sx,sy,sw,sh,0,0,targetW,targetH);
  return canvas.toDataURL("image/jpeg",.82);
 }finally{URL.revokeObjectURL(url)}
}

function renderProfilePhotoControls(body){
 const wrap=document.createElement("div");wrap.className="photo-editor-block";
 wrap.innerHTML=`<div class="photo-editor-row"><div class="photo-editor-preview">${data.meta.photo?`<img src="${data.meta.photo}" alt="Current CV photo">`:`<span>Photo</span>`}</div><div class="photo-editor-copy"><strong>CV photo</strong><span>Optional · portrait works best · JPG, PNG or WebP</span><div class="photo-editor-actions"><label class="mini-upload">${data.meta.photo?"Change photo":"Add photo"}<input id="profilePhotoInput" type="file" accept="image/jpeg,image/png,image/webp"></label>${data.meta.photo?`<button type="button" class="mini-btn" id="removeProfilePhoto">Remove</button>`:""}</div><small id="photoError" class="photo-error" aria-live="polite"></small></div></div>`;
 body.appendChild(wrap);
 const input=wrap.querySelector("#profilePhotoInput");
 input.addEventListener("change",async e=>{
  const file=e.target.files?.[0];if(!file)return;
  const err=wrap.querySelector("#photoError");err.textContent="";
  try{data.meta.photo=await prepareProfilePhoto(file);renderAll();save();}
  catch(ex){err.textContent=ex.message||"Could not use this image.";input.value="";}
 });
 wrap.querySelector("#removeProfilePhoto")?.addEventListener("click",()=>{mutate(()=>{data.meta.photo=null})});
}

function renderProfileEditor(){
 const tab=$("#contentTab");
 let card=$("#profileEditor");
 if(!card){
  card=document.createElement("div");card.id="profileEditor";card.className="profile-editor section-card";
  const list=$("#sectionList");tab.insertBefore(card,list);
 }
 card.innerHTML=`
  <div class="section-card-head profile-head"><span class="profile-symbol">✦</span><strong>Personal details</strong><span class="profile-note">Header</span></div>
  <div class="section-card-body profile-body">
   <div class="inline"><div class="field"><label>Name</label><input data-meta="name" value="${esc(data.meta.name)}"></div><div class="field"><label>Professional title</label><input data-meta="headline" value="${esc(data.meta.headline)}"></div></div>
   <div class="inline"><div class="field"><label>Email</label><input data-meta="email" value="${esc(data.meta.email)}"></div><div class="field"><label>Phone</label><input data-meta="phone" value="${esc(data.meta.phone)}"></div></div>
   <div class="inline"><div class="field"><label>Location</label><input data-meta="location" value="${esc(data.meta.location)}"></div><div class="field"><label>Portfolio URL</label><input data-meta="website" value="${esc(data.meta.website)}"></div></div>
   <div class="field"><label>LinkedIn URL</label><input data-meta="linkedin" value="${esc(data.meta.linkedin)}"></div>
  </div>`;
 const body=card.querySelector(".profile-body");
 renderProfilePhotoControls(body);
 card.querySelectorAll("[data-meta]").forEach(el=>el.addEventListener("input",e=>{data.meta[e.target.dataset.meta]=e.target.value;renderPaper();save()}));
}


function renderSectionEditor(){
 const list=$("#sectionList");list.innerHTML="";
 data.sections.forEach((sec,idx)=>{
  const card=document.importNode($("#sectionEditorTemplate").content,true).firstElementChild;
  card.dataset.id=sec.id;card.querySelector(".section-title-input").value=sec.title;
  card.querySelector(".section-title-input").oninput=e=>{sec.title=e.target.value;renderPaper();save()};
  card.querySelector(".delete-section").onclick=()=>mutate(()=>data.sections.splice(idx,1));
  card.querySelector(".collapse-btn").onclick=()=>card.classList.toggle("collapsed");
  const body=card.querySelector(".section-card-body");
  buildSectionForm(sec,body);
  card.addEventListener("dragstart",e=>{card.classList.add("dragging");e.dataTransfer.setData("text/plain",sec.id)});
  card.addEventListener("dragend",()=>card.classList.remove("dragging"));
  card.draggable=true;list.appendChild(card);
 });
 list.ondragover=e=>e.preventDefault();
 list.ondrop=e=>{e.preventDefault();const id=e.dataTransfer.getData("text/plain");const target=e.target.closest(".section-card");if(!target||!target.dataset.id||target.dataset.id===id)return;mutate(()=>{const a=data.sections.findIndex(s=>s.id===id),b=data.sections.findIndex(s=>s.id===target.dataset.id);const [x]=data.sections.splice(a,1);data.sections.splice(b,0,x)})};
}
function buildSectionForm(sec,body){
 if(sec.type==="summary"||sec.type==="custom"&&sec.body!==undefined){
  body.appendChild(field("Content",sec.body,v=>sec.body=v,"textarea"));return;
 }
 if(sec.type==="project"){
  sec.items ||= [];
  sec.items.forEach((item,i)=>{
   const row=document.createElement("div");row.className="item-row";
   row.appendChild(field("Project name",item.name,v=>item.name=v));
   row.appendChild(field("Role / Technology",item.role,v=>item.role=v));
   row.appendChild(field("Link (optional)",item.link,v=>item.link=v));
   row.appendChild(field("Description / achievements",(item.bullets||[]).join("\n"),v=>item.bullets=v.split("\n").filter(Boolean),"textarea"));
   const del=document.createElement("button");del.className="mini-btn";del.textContent="Remove";del.onclick=()=>mutate(()=>sec.items.splice(i,1));
   row.appendChild(del);body.appendChild(row);
  });
  const add=document.createElement("button");add.className="add-item";add.textContent="＋ Add project";
  add.onclick=()=>mutate(()=>sec.items.push({name:"Project name",role:"Role / Technology",link:"",bullets:["Project result or contribution"]}));
  body.appendChild(add);return;
 }
 if(sec.type==="skills"){
  sec.groups ||= [];
  sec.groups.forEach((g,i)=>{const row=document.createElement("div");row.className="item-row";row.appendChild(field("Category",g.label,v=>g.label=v));row.appendChild(field("Skills",g.value,v=>g.value=v,"textarea"));const del=document.createElement("button");del.className="mini-btn";del.textContent="Remove";del.onclick=()=>mutate(()=>sec.groups.splice(i,1));row.appendChild(del);body.appendChild(row)});
  const add=document.createElement("button");add.className="add-item";add.textContent="＋ Add skill group";add.onclick=()=>mutate(()=>sec.groups.push({label:"Category",value:"Skill, Skill, Skill"}));body.appendChild(add);return;
 }
 if(sec.type==="languages"){
  sec.items ||= [];sec.items.forEach((x,i)=>{const row=document.createElement("div");row.className="item-row";row.appendChild(field("Language",x.language,v=>x.language=v));row.appendChild(field("Level",x.level,v=>x.level=v));const del=document.createElement("button");del.className="mini-btn";del.textContent="Remove";del.onclick=()=>mutate(()=>sec.items.splice(i,1));row.appendChild(del);body.appendChild(row)});
  const add=document.createElement("button");add.className="add-item";add.textContent="＋ Add language";add.onclick=()=>mutate(()=>sec.items.push({language:"German",level:"A2"}));body.appendChild(add);return;
 }
 if(sec.type==="certifications"){
  sec.items ||= [];sec.items.forEach((x,i)=>{const row=document.createElement("div");row.className="item-row";row.appendChild(field("Certification",x.name,v=>x.name=v));row.appendChild(field("Issuer / Date",x.meta,v=>x.meta=v));const del=document.createElement("button");del.className="mini-btn";del.textContent="Remove";del.onclick=()=>mutate(()=>sec.items.splice(i,1));row.appendChild(del);body.appendChild(row)});
  const add=document.createElement("button");add.className="add-item";add.textContent="＋ Add certification";add.onclick=()=>mutate(()=>sec.items.push({name:"Certification",meta:"Issuer · Year"}));body.appendChild(add);return;
 }
 sec.items ||= [];
 sec.items.forEach((item,i)=>{
  const row=document.createElement("div");row.className="item-row";
  if(sec.type==="education"){row.appendChild(field("Degree / Concentration",item.degree,v=>item.degree=v));row.appendChild(field("School",item.school,v=>item.school=v));row.appendChild(field("Location",item.location,v=>item.location=v));row.appendChild(field("Dates",item.dates,v=>item.dates=v));row.appendChild(field("Details",item.details,v=>item.details=v,"textarea"))}
  else {row.appendChild(field("Role / Position",item.role,v=>item.role=v));row.appendChild(field("Organization",item.company,v=>item.company=v));row.appendChild(field("Location",item.location,v=>item.location=v));row.appendChild(field("Dates",item.dates,v=>item.dates=v));row.appendChild(field("Bullets (one per line)",(item.bullets||[]).join("\n"),v=>item.bullets=v.split("\n").filter(Boolean),"textarea"))}
  const del=document.createElement("button");del.className="mini-btn";del.textContent="Remove";del.onclick=()=>mutate(()=>sec.items.splice(i,1));row.appendChild(del);body.appendChild(row)
 });
 const add=document.createElement("button");add.className="add-item";add.textContent="＋ Add item";add.onclick=()=>mutate(()=>sec.items.push(sec.type==="education"?{degree:"Degree",school:"University",location:"City, Country",dates:"Year",details:""}:{role:"Position",company:"Organization",location:"City, Country",dates:"Month Year – Month Year",bullets:["Achievement or responsibility"]}));body.appendChild(add);
}

let inlineEditEnabled = true;
let inlineUndoActive = false;
let inlineSaveTimer = null;

function inlineText(v){ return String(v ?? ""); }
function setNestedInlineValue(el){
 const kind=el.dataset.inlineKind, field=el.dataset.inlineField;
 const secId=el.dataset.inlineSection;
 if(kind==="meta"){
   data.meta[field]=inlineText(el.innerText);
 } else {
   const sec=data.sections.find(x=>x.id===secId);
   if(!sec) return;
   if(kind==="section"){ sec.title=inlineText(el.innerText); }
   else if(kind==="item"){
     const item=sec.items?.[Number(el.dataset.inlineIndex)];
     if(item) item[field]=inlineText(el.innerText);
   } else if(kind==="bullets"){
     const item=sec.items?.[Number(el.dataset.inlineIndex)];
     if(item){
       item.bullets=inlineText(el.innerText).split(/\n+/).map(v=>v.replace(/^\s*[•·-]\s*/,"").trim()).filter(Boolean);
     }
   } else if(kind==="bullet"){
     const item=sec.items?.[Number(el.dataset.inlineIndex)];
     const bi=Number(el.dataset.inlineBulletIndex);
     if(item && Array.isArray(item.bullets))item.bullets[bi]=inlineText(el.innerText);
   } else if(kind==="skill"){
     const group=sec.groups?.[Number(el.dataset.inlineIndex)];
     if(group) group[field]=inlineText(el.innerText);
   } else if(kind==="language"){
     const item=sec.items?.[Number(el.dataset.inlineIndex)];
     if(item) item[field]=inlineText(el.innerText);
   } else if(kind==="certification"){
     const item=sec.items?.[Number(el.dataset.inlineIndex)];
     if(item) item[field]=inlineText(el.innerText);
   }
 }
 clearTimeout(inlineSaveTimer);
 inlineSaveTimer=setTimeout(save,350);
}

function beginInlineEdit(el){
 if(!inlineEditEnabled || el.dataset.inlineLocked==="true") return;
 if(!inlineUndoActive){ snapshot(); inlineUndoActive=true; }
 el.classList.add("inline-editing");
 if(el.dataset.inlineSingle==="true"){
   document.execCommand?.("selectAll",false,null);
 }
}

function endInlineEdit(el){
 el.classList.remove("inline-editing");
 setNestedInlineValue(el);
 inlineUndoActive=false;
 renderPaper();
 applyInlineEditing();
 save();
}

function inlineKeydown(e){
 if(!inlineEditEnabled) return;
 const el=e.currentTarget;
 if(e.key==="Escape"){
   e.preventDefault();
   renderPaper();
   applyInlineEditing();
   return;
 }
 if(e.key==="Enter" && el.dataset.inlineSingle==="true"){
   e.preventDefault();
   el.blur();
 }
}

function applyInlineEditing(){
 const paper=$("#resumePaper");
 if(!paper) return;
 const nodes=paper.querySelectorAll("[data-inline-kind]");
 nodes.forEach(el=>{
   const editable=inlineEditEnabled && el.dataset.inlineLocked!=="true";
   el.setAttribute("contenteditable",editable?"true":"false");
   el.setAttribute("role","textbox");
   el.setAttribute("spellcheck","true");
   if(editable){
     el.classList.add("cv-inline-edit");
     el.onfocus=()=>beginInlineEdit(el);
     el.oninput=()=>setNestedInlineValue(el);
     el.onblur=()=>endInlineEdit(el);
     el.onkeydown=inlineKeydown;
   }else{
     el.classList.remove("cv-inline-edit","inline-editing");
     el.onfocus=null;el.oninput=null;el.onblur=null;el.onkeydown=null;
   }
 });
}

function initInlineEditUI(){
 const btn=$("#inlineEditBtn");
 if(!btn) return;
 const sync=()=>{
   btn.setAttribute("aria-pressed",String(inlineEditEnabled));
   btn.classList.toggle("active",inlineEditEnabled);
   const st=btn.querySelector(".edit-mode-state");if(st)st.textContent=inlineEditEnabled?"On":"Off";
   document.documentElement.classList.toggle("inline-edit-off",!inlineEditEnabled);
   applyInlineEditing();
 };
 btn.onclick=()=>{inlineEditEnabled=!inlineEditEnabled;inlineUndoActive=false;sync();};
 sync();
}

function renderPaper(){
 const p=$("#resumePaper"),d=data.design,m=data.meta;
 p.style.setProperty("--accent",d.accent);p.style.color=d.text;p.style.fontFamily=d.font==="Inter"?"Inter,Arial,sans-serif":d.font;
 p.style.fontSize=d.fontSize+"px";p.style.padding="0";p.style.minHeight="0";
 p.style.width=d.pageSize==="LETTER"?"8.5in":"210mm";
 p.style.setProperty("--ein-page-width",d.pageSize==="LETTER"?"8.5in":"210mm");
 p.style.setProperty("--ein-page-height",d.pageSize==="LETTER"?"11in":"297mm");
 p.style.setProperty("--ein-margin-mm",d.margin+"mm");
 p.className=`resume-paper template-${d.template}${d.compact?" compact":""}`;
 p.style.setProperty("--ein-photo-w",d.photoWidth+"mm");p.style.setProperty("--ein-photo-h",d.photoSize+"mm");p.style.setProperty("--ein-photo-radius",d.photoRadius+"px");
 p.style.setProperty("--ein-name-size",d.nameSize+"px");p.style.setProperty("--ein-name-weight",d.nameWeight);p.style.setProperty("--ein-name-italic",d.nameStyle==="italic"?"italic":"normal");
 p.style.setProperty("--ein-headline-size",d.headlineSize+"px");p.style.setProperty("--ein-headline-weight",d.headlineWeight);p.style.setProperty("--ein-headline-italic",d.headlineStyle==="italic"?"italic":"normal");p.style.setProperty("--ein-headline-transform",d.headlineStyle==="uppercase"?"uppercase":"none");
 p.style.setProperty("--ein-contact-size",d.contactSize+"px");p.style.setProperty("--ein-contact-weight",d.contactWeight);p.style.setProperty("--ein-contact-italic",d.contactStyle==="italic"?"italic":"normal");
 p.style.setProperty("--ein-section-size",d.sectionSize+"px");p.style.setProperty("--ein-section-weight",d.sectionWeight);p.style.setProperty("--ein-section-style",d.sectionStyle);p.style.setProperty("--ein-section-border",d.sectionBorder?"1.3px":"0");
 p.style.setProperty("--ein-description-size",d.descriptionSize+"px");p.style.setProperty("--ein-description-weight",d.descriptionWeight);p.style.setProperty("--ein-description-style",d.descriptionStyle);p.style.setProperty("--ein-description-line",d.descriptionLine);

 const contactParts=[];
 if(m.email)contactParts.push(`<span>${d.icons?"✉ ":""}<a href="${esc("mailto:"+m.email)}"><span data-inline-kind="meta" data-inline-field="email" data-inline-single="true">${esc(m.email)}</span></a></span>`);
 if(m.phone)contactParts.push(`<span>${d.icons?"☎ ":""}<a href="${esc("tel:"+m.phone.replace(/[^+\\d]/g,""))}"><span data-inline-kind="meta" data-inline-field="phone" data-inline-single="true">${esc(m.phone)}</span></a></span>`);
 if(m.location)contactParts.push(`<span>${d.icons?"⌖ ":""}<span data-inline-kind="meta" data-inline-field="location" data-inline-single="true">${esc(m.location)}</span></span>`);
 if(m.website)contactParts.push(`<span>${d.icons?"↗ ":""}<a class="cv-link-fixed" href="${esc(hrefUrl(m.website))}" target="_blank" rel="noopener noreferrer">Portfolio</a></span>`);
 if(m.linkedin)contactParts.push(`<span>${d.icons?"in ":""}<a class="cv-link-fixed" href="${esc(hrefUrl(m.linkedin))}" target="_blank" rel="noopener noreferrer">LinkedIn</a></span>`);
 const contact=contactParts.join("");
 const photoHtml=m.photo?`<div class="cv-photo-wrap"><img class="cv-photo" src="${esc(m.photo)}" alt="Profile photo"></div>`:"";
 const headerHtml=`<header class="cv-header${m.photo?" has-photo":""}"><div class="cv-header-copy"><h1 class="name" data-inline-kind="meta" data-inline-field="name" data-inline-single="true">${esc(m.name)}</h1><div class="headline" data-inline-kind="meta" data-inline-field="headline">${esc(m.headline)}</div><div class="contact-line">${contact}</div></div>${photoHtml}</header>`;
 let sectionsHtml="";
 data.sections.forEach(sec=>{sectionsHtml+=renderSection(sec)});

 // The editor and print/PDF share the same measured page sheets.
 const parsed=document.createElement("div");
 parsed.innerHTML=headerHtml+sectionsHtml;
 const header=parsed.querySelector(".cv-header");
 const sections=[...parsed.querySelectorAll(".cv-section")];
 p.innerHTML="";
 const pageWidth=d.pageSize==="LETTER"?"8.5in":"210mm";
 const pageHeight=d.pageSize==="LETTER"?"11in":"297mm";
 const pageHeightPx=d.pageSize==="LETTER"?1056:1122.52;
 const marginPx=(Number(d.margin)||0)*96/25.4;
 const usableHeight=Math.max(100,pageHeightPx-2*marginPx-2);

 let pages=[];
 const makePage=()=>{
   const page=document.createElement("div");
   page.className="resume-page";
   page.style.width=pageWidth;
   page.style.height=pageHeight;
   page.style.padding=`${d.margin}mm`;
   page.dataset.pageIndex=pages.length+1;
   const content=document.createElement("div");
   content.className="resume-page-content";
   page.appendChild(content);
   p.appendChild(page);
   const record={page,content};
   pages.push(record);
   return record;
 };
 const currentHeight=record=>record.content.scrollHeight;
 const overflows=record=>currentHeight(record)>usableHeight+1;
 let current=makePage();
 if(header)current.content.appendChild(header);

 for(const section of sections){
   const title=section.querySelector(".cv-section-title");
   const blocks=[...section.children].filter(node=>node!==title);
   if(!title && !blocks.length)continue;
   let sectionOnPage=null;
   const startSection=(record,cloneTitle=true)=>{
     const sec=document.createElement("section");
     sec.className="cv-section";
     if(title && cloneTitle)sec.appendChild(title.cloneNode(true));
     record.content.appendChild(sec);
     return sec;
   };
   sectionOnPage=startSection(current,true);

   if(blocks.length===0){
     if(overflows(current) && current.content.children.length>1){
       sectionOnPage.remove();
       current=makePage();
       sectionOnPage=startSection(current,true);
     }
     continue;
   }

   for(const block of blocks){
     sectionOnPage.appendChild(block);
     if(overflows(current)){
       block.remove();
       const emptySection=sectionOnPage.children.length<=1;
       if(emptySection)sectionOnPage.remove();

       // Move this entry to the next sheet instead of letting it be clipped
       // or creating an unintentional trailing blank page.
       current=makePage();
       sectionOnPage=startSection(current,true);
       sectionOnPage.appendChild(block);

       // A single exceptionally tall entry is allowed to flow, rather than
       // hiding its content. The following entry will begin on the next page.
       if(overflows(current)){
         block.dataset.oversize="true";
       }
     }
   }
 }
 if(!pages.length)current=makePage();

 // Inline edit mode and page indicators operate across all generated sheets.
 const count=pages.length;
 $("#pageCount").textContent=count+" page"+(count===1?"":"s");
 $("#pageSizeLabel").textContent=d.pageSize==="LETTER"?"Letter":"A4";
 if($("#accentHex"))$("#accentHex").textContent=String(d.accent).toUpperCase();
 if($("#textHex"))$("#textHex").textContent=String(d.text).toUpperCase();
 applyInlineEditing();
}

function clean(v){return String(v??"").trim()}
function hasSectionContent(sec){
 if(!sec || !clean(sec.title))return false;
 if(sec.type==="summary" || (sec.type==="custom" && sec.body!==undefined))return !!clean(sec.body);
 if(sec.type==="skills")return (sec.groups||[]).some(g=>clean(g.label)||clean(g.value));
 if(sec.type==="languages")return (sec.items||[]).some(x=>clean(x.language)||clean(x.level));
 if(sec.type==="certifications")return (sec.items||[]).some(x=>clean(x.name)||clean(x.meta));
 return (sec.items||[]).some(item=>{
   if(sec.type==="education")return [item.degree,item.school,item.location,item.dates,item.details].some(clean);
   if(sec.type==="project")return [item.name,item.role,item.link,...(item.bullets||[])].some(clean);
   return [item.role,item.company,item.location,item.dates,...(item.bullets||[])].some(clean);
 });
}
function renderDescriptionBlock(secId,index,bullets){
 const lines=(bullets||[]).map(clean).filter(Boolean);
 if(!lines.length)return "";
 return `<div class="cv-item-body cv-description-edit" data-inline-kind="bullets" data-inline-section="${esc(secId)}" data-inline-index="${index}">${lines.map(line=>`<div class="cv-bullet-line">${esc(line)}</div>`).join("")}</div>`;
}
function renderSection(sec){
 if(!hasSectionContent(sec))return "";
 const titleStyle=` data-inline-kind="section" data-inline-section="${esc(sec.id)}" data-inline-single="true"`;
 let h=`<section class="cv-section"><div class="cv-section-title"${titleStyle}>${esc(sec.title)}</div>`;
 if(sec.type==="summary" || (sec.type==="custom"&&sec.body!==undefined)){
   return h+`<div class="cv-item-body" data-inline-kind="item" data-inline-section="${esc(sec.id)}" data-inline-field="body">${esc(sec.body||"").replace(/\n/g,"<br>")}</div></section>`;
 }
 if(sec.type==="skills"){
   const groups=(sec.groups||[]).filter(g=>clean(g.label)||clean(g.value));
   if(!groups.length)return "";
   return h+groups.map((g)=>`<div class="skill-row">${clean(g.label)?`<span class="skill-label" data-inline-kind="skill" data-inline-section="${esc(sec.id)}" data-inline-index="${sec.groups.indexOf(g)}" data-inline-field="label" data-inline-single="true">${esc(g.label)}</span>`:""}${clean(g.label)&&clean(g.value)?": ":""}${clean(g.value)?`<span data-inline-kind="skill" data-inline-section="${esc(sec.id)}" data-inline-index="${sec.groups.indexOf(g)}" data-inline-field="value">${esc(g.value)}</span>`:""}</div>`).join("")+"</section>";
 }
 if(sec.type==="languages"){
   const items=(sec.items||[]).filter(x=>clean(x.language)||clean(x.level));
   if(!items.length)return "";
   return h+items.map((x)=>`<div class="skill-row">${clean(x.language)?`<span class="skill-label" data-inline-kind="language" data-inline-section="${esc(sec.id)}" data-inline-index="${sec.items.indexOf(x)}" data-inline-field="language" data-inline-single="true">${esc(x.language)}</span>`:""}${clean(x.language)&&clean(x.level)?": ":""}${clean(x.level)?`<span data-inline-kind="language" data-inline-section="${esc(sec.id)}" data-inline-index="${sec.items.indexOf(x)}" data-inline-field="level" data-inline-single="true">${esc(x.level)}</span>`:""}</div>`).join("")+"</section>";
 }
 if(sec.type==="certifications"){
   const items=(sec.items||[]).filter(x=>clean(x.name)||clean(x.meta));
   if(!items.length)return "";
   return h+items.map((x)=>`<div class="cv-item"><div class="cv-item-head">${clean(x.name)?`<div class="cv-item-title" data-inline-kind="certification" data-inline-section="${esc(sec.id)}" data-inline-index="${sec.items.indexOf(x)}" data-inline-field="name" data-inline-single="true">${esc(x.name)}</div>`:""}${clean(x.meta)?`<div class="cv-item-meta" data-inline-kind="certification" data-inline-section="${esc(sec.id)}" data-inline-index="${sec.items.indexOf(x)}" data-inline-field="meta" data-inline-single="true">${esc(x.meta)}</div>`:""}</div></div>`).join("")+"</section>";
 }
 if(sec.type==="project"){
   const items=(sec.items||[]).map((item,i)=>({item,i})).filter(({item})=>[item.name,item.role,item.link,...(item.bullets||[])].some(clean));
   if(!items.length)return "";
   return h+items.map(({item,i})=>{
     const role=clean(item.role), link=clean(item.link);
     const title=clean(item.name);
     const bullets=renderDescriptionBlock(sec.id,i,item.bullets);
     return `<div class="cv-item">
       ${title||role||link?`<div class="cv-item-head"><div>${title?`<div class="cv-item-title" data-inline-kind="item" data-inline-section="${esc(sec.id)}" data-inline-index="${i}" data-inline-field="name" data-inline-single="true">${esc(item.name)}</div>`:""}${role?`<div class="cv-item-sub" data-inline-kind="item" data-inline-section="${esc(sec.id)}" data-inline-index="${i}" data-inline-field="role">${esc(item.role)}</div>`:""}</div>${link?`<div class="cv-item-meta"><a class="cv-link-fixed" href="${esc(hrefUrl(item.link))}" target="_blank" rel="noopener noreferrer">View project</a></div>`:""}</div>`:""}${bullets}</div>`;
   }).join("")+"</section>";
 }
 const items=(sec.items||[]).map((item,i)=>({item,i})).filter(({item})=>{
   if(sec.type==="education")return [item.degree,item.school,item.location,item.dates,item.details].some(clean);
   return [item.role,item.company,item.location,item.dates,...(item.bullets||[])].some(clean);
 });
 if(!items.length)return "";
 return h+items.map(({item,i})=>{
   const titleField=sec.type==="education"?"degree":"role",subField=sec.type==="education"?"school":"company";
   const title=clean(sec.type==="education"?item.degree:item.role),sub=clean(sec.type==="education"?item.school:item.company),location=clean(item.location),dates=clean(item.dates);
   const body=sec.type==="education"
     ?(clean(item.details)?`<div class="cv-item-body" data-inline-kind="item" data-inline-section="${esc(sec.id)}" data-inline-index="${i}" data-inline-field="details">${esc(item.details).replace(/\n/g,"<br>")}</div>`:"")
     :renderDescriptionBlock(sec.id,i,item.bullets);
   const head=title||sub||location||dates
     ?`<div class="cv-item-head"><div>${title?`<div class="cv-item-title" data-inline-kind="item" data-inline-section="${esc(sec.id)}" data-inline-index="${i}" data-inline-field="${titleField}" data-inline-single="true">${esc(sec.type==="education"?item.degree:item.role)}</div>`:""}${sub||location?`<div class="cv-item-sub">${sub?`<span data-inline-kind="item" data-inline-section="${esc(sec.id)}" data-inline-index="${i}" data-inline-field="${subField}" data-inline-single="true">${esc(sec.type==="education"?item.school:item.company)}</span>`:""}${sub&&location?" · ":""}${location?`<span data-inline-kind="item" data-inline-section="${esc(sec.id)}" data-inline-index="${i}" data-inline-field="location" data-inline-single="true">${esc(item.location)}</span>`:""}</div>`:""}</div>${dates?`<div class="cv-item-meta" data-inline-kind="item" data-inline-section="${esc(sec.id)}" data-inline-index="${i}" data-inline-field="dates" data-inline-single="true">${esc(item.dates)}</div>`:""}</div>`
     :"";
   return `<div class="cv-item">${head}${body}</div>`;
 }).join("")+"</section>";
}

function addSection(type){
 const defs={
 summary:{title:"Professional Summary",body:"Write a concise professional summary."},
 experience:{title:"Experience",items:[]},education:{title:"Education",items:[]},project:{title:"Projects",items:[{name:"Project name",role:"Role / Technology",link:"",bullets:["Project result or contribution"]}]},
 skills:{title:"Skills",groups:[{label:"Technical",value:"Skill, Skill, Skill"}]},languages:{title:"Languages",items:[{language:"English",level:"Fluent"}]},
 certifications:{title:"Certifications",items:[{name:"Certification",meta:"Issuer · Year"}]},custom:{title:"Custom Section",body:"Add your content here."}};
 const s=clone(defs[type]||defs.custom);s.id=uid();s.type=type;data.sections.push(s)
}

/* Minimal dependency-free DOCX exporter. DOCX is an OOXML package (ZIP of XML files). */
function u8(s){return new TextEncoder().encode(s)}
function crc32(buf){let c=0xffffffff;for(let i=0;i<buf.length;i++){c^=buf[i];for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^0xffffffff)>>>0}
function le32(n){return new Uint8Array([n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255])}
function le16(n){return new Uint8Array([n&255,(n>>>8)&255])}
function concatBytes(parts){let n=parts.reduce((a,b)=>a+b.length,0),o=new Uint8Array(n),p=0;for(const b of parts){o.set(b,p);p+=b.length}return o}
function zipStore(entries){
 const locals=[],centrals=[];let offset=0;
 for(const [name,content] of entries){const nb=u8(name),db=typeof content==="string"?u8(content):content,c=crc32(db);const lh=concatBytes([u8("PK\x03\x04"),le16(20),le16(0),le16(0),le16(0),le16(0),le32(c),le32(db.length),le32(db.length),le16(nb.length),le16(0),nb,db]);locals.push(lh);const ch=concatBytes([u8("PK\x01\x02"),le16(20),le16(20),le16(0),le16(0),le16(0),le16(0),le32(c),le32(db.length),le32(db.length),le16(nb.length),le16(0),le16(0),le16(0),le16(0),le32(0),le32(offset),nb]);centrals.push(ch);offset+=lh.length}
 const cd=concatBytes(centrals),all=concatBytes(locals);const end=concatBytes([u8("PK\x05\x06"),le16(0),le16(0),le16(entries.length),le16(entries.length),le32(cd.length),le32(all.length),le16(0)]);return concatBytes([all,cd,end])
}
function xmlEsc(v){return esc(v).replace(/\n/g,"<w:br/>")}
function docxRun(text,bold=false,italic=false){return `<w:r>${bold?"<w:rPr><w:b/></w:rPr>":italic?"<w:rPr><w:i/></w:rPr>":""}<w:t xml:space="preserve">${xmlEsc(text)}</w:t></w:r>`}
function docxPara(text="",opts={}){const align=opts.align?`<w:jc w:val="${opts.align}"/>`:"";const size=opts.size?`<w:sz w:val="${opts.size*2}"/><w:szCs w:val="${opts.size*2}"/>`:"";const bold=!!opts.bold;const italic=!!opts.italic;return `<w:p><w:pPr>${align}<w:spacing w:after="${opts.after??100}"/></w:pPr><w:r><w:rPr>${bold?"<w:b/>":""}${italic?"<w:i/>":""}${size}</w:rPr><w:t xml:space="preserve">${xmlEsc(text)}</w:t></w:r></w:p>`}
function docxBullet(text,size){return `<w:p><w:pPr><w:pStyle w:val="ListBullet"/><w:spacing w:after="40"/></w:pPr><w:r><w:rPr><w:sz w:val="${size*2}"/><w:szCs w:val="${size*2}"/></w:rPr><w:t xml:space="preserve">${xmlEsc(text)}</w:t></w:r></w:p>`}
function docxHeading(text){
 let t=String(text??"");
 if(data.design.sectionStyle==="uppercase")t=t.toUpperCase();
 else if(data.design.sectionStyle==="lowercase")t=t.toLowerCase();
 else if(data.design.sectionStyle==="capitalize")t=t.replace(/\b\w/g,c=>c.toUpperCase());
 const border=data.design.sectionBorder?`<w:pBdr><w:bottom w:val="single" w:sz="8" w:space="3" w:color="2B2B2B"/></w:pBdr>`:"";
 return `<w:p><w:pPr><w:spacing w:before="180" w:after="70"/>${border}</w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>${Number(data.design.sectionWeight)>=600?"<w:b/>":""}${data.design.sectionStyle==="italic"?"<w:i/>":""}<w:sz w:val="${Math.round(data.design.sectionSize*2)}"/><w:szCs w:val="${Math.round(data.design.sectionSize*2)}"/><w:color w:val="2B2B2B"/></w:rPr><w:t>${xmlEsc(t)}</w:t></w:r></w:p>`;
}
function dataUrlToBytes(dataUrl){
 const b64=String(dataUrl||"").split(",")[1]||"";const bin=atob(b64),out=new Uint8Array(bin.length);
 for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out;
}
function docxRunXml(text,opts={}){
 const bold=opts.bold?"<w:b/>":"",italic=opts.italic?"<w:i/>":"";
 const size=opts.size?`<w:sz w:val="${Math.round(opts.size*2)}"/><w:szCs w:val="${Math.round(opts.size*2)}"/>`:"";
 const color=opts.color?`<w:color w:val="${opts.color.replace('#','')}"/>`:"";
 return `<w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>${bold}${italic}${size}${color}</w:rPr><w:t xml:space="preserve">${xmlEsc(text)}</w:t></w:r>`;
}
function docxCell(content,width){return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/><w:vAlign w:val="top"/></w:tcPr>${content}</w:tc>`}
function docxNoBorderTable(rows){return `<w:tbl><w:tblPr><w:tblW w:w="10400" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="0" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid><w:gridCol w:w="7600"/><w:gridCol w:w="2800"/></w:tblGrid>${rows}</w:tbl>`}
function docxHeaderBlock(){
 const m=data.meta,d=data.design;
 let left=`<w:p><w:pPr><w:spacing w:after="40"/></w:pPr>${docxRunXml(m.name,{bold:Number(d.nameWeight)>=600,italic:d.nameStyle==="italic",size:d.nameSize})}</w:p>`;
 let title=String(m.headline||"");if(d.headlineStyle==="uppercase")title=title.toUpperCase();
 left+=`<w:p><w:pPr><w:spacing w:after="40"/></w:pPr>${docxRunXml(title,{bold:Number(d.headlineWeight)>=600,italic:d.headlineStyle==="italic",size:d.headlineSize,color:"4B5563"})}</w:p>`;
 const parts=[];if(m.email)parts.push(docxRunXml(m.email,{size:d.contactSize,color:"596273"}));if(m.phone)parts.push(docxRunXml(m.phone,{size:d.contactSize,color:"596273"}));if(m.location)parts.push(docxRunXml(m.location,{size:d.contactSize,color:"596273"}));
 left+=`<w:p><w:pPr><w:spacing w:after="50"/></w:pPr>${parts.join(docxRunXml("  •  ",{size:d.contactSize,color:"596273"}))}</w:p>`;
 const links=[];if(m.website)links.push(`<w:hyperlink r:id="rIdWebsite"><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:color w:val="447CE8"/><w:u w:val="single"/><w:sz w:val="${d.contactSize*2}"/></w:rPr><w:t>Portfolio</w:t></w:r></w:hyperlink>`);if(m.linkedin)links.push(`<w:hyperlink r:id="rIdLinkedIn"><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:color w:val="447CE8"/><w:u w:val="single"/><w:sz w:val="${d.contactSize*2}"/></w:rPr><w:t>LinkedIn</w:t></w:r></w:hyperlink>`);
 if(links.length)left+=`<w:p><w:pPr><w:spacing w:after="100"/></w:pPr>${links.join(docxRunXml("  •  ",{size:d.contactSize,color:"596273"}))}</w:p>`;
 let right="";
 if(m.photo){const cx=Math.round(d.photoWidth*36000),cy=Math.round(d.photoSize*36000);right=`<w:p><w:pPr><w:jc w:val="right"/><w:spacing w:after="0"/></w:pPr><w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="1" name="EIN-CV Profile Photo"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="ProfilePhoto.jpg"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdPhoto"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`}
 return docxNoBorderTable(`<w:tr>${docxCell(left,7600)}${docxCell(right,2800)}</w:tr>`);
}
function docxEntryTable(title,sub,dates){
 const size=Math.max(9,Number(data.design.descriptionSize)||10);
 const left=`<w:p><w:pPr><w:spacing w:after="15"/></w:pPr>${docxRunXml(title,{bold:true,size,color:"2B2B2B"})}</w:p><w:p><w:pPr><w:spacing w:after="40"/></w:pPr>${docxRunXml(sub,{italic:true,size:9,color:"596273"})}</w:p>`;
 const right=`<w:p><w:pPr><w:jc w:val="right"/><w:spacing w:after="15"/></w:pPr>${docxRunXml(dates||"",{size:9,color:"596273"})}</w:p>`;
 return docxNoBorderTable(`<w:tr>${docxCell(left,7600)}${docxCell(right,2800)}</w:tr>`);
}
function makeDocx(){
 const m=data.meta;let body="";
 body+=docxHeaderBlock();
 for(const sec of data.sections){body+=docxHeading(sec.title);
  if(sec.type==="summary"||sec.type==="custom"&&sec.body!==undefined){body+=docxPara(sec.body||"",{size:data.design.descriptionSize});continue}
  if(sec.type==="skills"){for(const g of sec.groups||[])body+=docxPara(`${g.label}: ${g.value}`,{size:data.design.descriptionSize});continue}
  if(sec.type==="languages"){for(const x of sec.items||[])body+=docxPara(`${x.language}: ${x.level}`,{size:data.design.descriptionSize});continue}
  if(sec.type==="certifications"){for(const x of sec.items||[])body+=docxPara(`${x.name} — ${x.meta}`,{size:data.design.descriptionSize});continue}
  if(sec.type==="project"){for(const item of sec.items||[]){body+=docxEntryTable(item.name||"Project",item.role||"",item.link||"");for(const b of item.bullets||[])body+=docxBullet(b,data.design.descriptionSize)}continue}
  for(const item of sec.items||[]){const title=sec.type==="education"?item.degree:item.role;const sub=sec.type==="education"?`${item.school||""}${item.location?" · "+item.location:""}`:`${item.company||""}${item.location?" · "+item.location:""}`;body+=docxEntryTable(title,sub,item.dates||"");if(sec.type==="education"){if(item.details)body+=docxPara(item.details,{size:data.design.descriptionSize})}else for(const b of item.bullets||[])body+=docxBullet(b,data.design.descriptionSize)}
 }
 const page=data.design.pageSize==="LETTER"?{w:12240,h:15840}:{w:11906,h:16838};const margin=Math.round((data.design.margin||18)*56.6929);
 const documentXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${body}<w:sectPr><w:pgSz w:w="${page.w}" w:h="${page.h}"/><w:pgMar w:top="${margin}" w:right="${margin}" w:bottom="${margin}" w:left="${margin}"/></w:sectPr></w:body></w:document>`;
 const styles=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="21"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="Heading 2"/><w:basedOn w:val="Normal"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:sz w:val="22"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="ListBullet"><w:name w:val="List Bullet"/><w:basedOn w:val="Normal"/><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr></w:style></w:styles>`;
 const numbering=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/><w:lvl w:ilvl="0"><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:pPr><w:ind w:left="360" w:hanging="180"/></w:pPr></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>`;
 const rels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
 const docRelParts=[`<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`,`<Relationship Id="rIdNumbering" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>`];if(m.photo)docRelParts.push(`<Relationship Id="rIdPhoto" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image.jpg"/>`);if(m.website)docRelParts.push(`<Relationship Id="rIdWebsite" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${esc(hrefUrl(m.website))}" TargetMode="External"/>`);if(m.linkedin)docRelParts.push(`<Relationship Id="rIdLinkedIn" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${esc(hrefUrl(m.linkedin))}" TargetMode="External"/>`);const docRels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${docRelParts.join("")}</Relationships>`;
 const imageDefault=m.photo?`<Default Extension="jpg" ContentType="image/jpeg"/>`:"";
 const types=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${imageDefault}<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.word/numbering.xml"/></Types>`;
 const entries=[["[Content_Types].xml",types],["_rels/.rels",rels],["word/document.xml",documentXml],["word/styles.xml",styles],["word/numbering.xml",numbering],["word/_rels/document.xml.rels",docRels]];if(m.photo)entries.push(["word/media/image.jpg",dataUrlToBytes(m.photo)]);
 const blob=new Blob([zipStore(entries)],{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=(m.name||"CV").replace(/[^a-z0-9_-]+/gi,"_")+"_CV.docx";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
}

function updateOverview(){
 const page=$("#overviewPageFormat"),count=$("#overviewSectionCount");
 if(page)page.textContent=data.design.pageSize==="LETTER"?"Letter":"A4";
 if(count)count.textContent=String(data.sections.filter(sec=>String(sec.title||"").trim()).length);
}
function setWorkspaceView(view){
 const overview=view==="overview",customize=view==="customize";
 $("#overviewTab").classList.toggle("hidden",!overview);
 $("#contentTab").classList.toggle("hidden",overview||customize);
 $("#designTab").classList.toggle("hidden",!customize);
 $$(".primary-nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
 if(customize){$$(".side-tab").forEach(b=>b.classList.toggle("active",b.dataset.tab==="design"));}
 else {$$(".side-tab").forEach(b=>b.classList.toggle("active",b.dataset.tab==="content"));}
 if(view==="overview")updateOverview();
}
$$(".primary-nav-item").forEach(b=>b.addEventListener("click",()=>setWorkspaceView(b.dataset.view)));
$("#overviewEditBtn")?.addEventListener("click",()=>setWorkspaceView("content"));
$("#overviewCustomizeBtn")?.addEventListener("click",()=>setWorkspaceView("customize"));
function applyZoom(){$("#resumePaper").style.transform=`scale(${zoom})`;$("#zoomValue").textContent=Math.round(zoom*100)+"%"}
$$(".side-tab").forEach(b=>b.onclick=()=>{$$(".side-tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("#contentTab").classList.toggle("hidden",b.dataset.tab!=="content");$("#designTab").classList.toggle("hidden",b.dataset.tab!=="design")});
$("#addSectionBtn").onclick=()=>$("#sectionModal").classList.remove("hidden");$("#closeModal").onclick=()=>$("#sectionModal").classList.add("hidden");
$$(".section-options button").forEach(b=>b.onclick=()=>{$("#sectionModal").classList.add("hidden");mutate(()=>addSection(b.dataset.add))});
$("#addExperienceBtn").onclick=()=>mutate(()=>addSection("experience"));$("#addEducationBtn").onclick=()=>mutate(()=>addSection("education"));$("#addProjectBtn").onclick=()=>mutate(()=>addSection("project"));
$("#templateSelect").onchange=e=>{mutate(()=>data.design.template=e.target.value)};$("#pageSize").onchange=e=>{mutate(()=>data.design.pageSize=e.target.value)};
$("#fontSelect").onchange=e=>{mutate(()=>data.design.font=e.target.value)};$("#accentColor").oninput=e=>{data.design.accent=e.target.value;renderPaper();save()};
$("#textColor").oninput=e=>{data.design.text=e.target.value;renderPaper();save()};$("#fontSize").oninput=e=>{data.design.fontSize=+e.target.value;renderPaper();$("#fontSizeValue").textContent=e.target.value+"px";save()};
$("#marginSize").oninput=e=>{data.design.margin=+e.target.value;renderPaper();$("#marginValue").textContent=e.target.value+"mm";save()};
$("#showIcons").onchange=e=>{data.design.icons=e.target.checked;renderPaper();save()};$("#compactMode").onchange=e=>{data.design.compact=e.target.checked;renderPaper();save()};
const bindRange=(id,key,labelId,suffix="",cast=Number)=>$(id)?.addEventListener("input",e=>{data.design[key]=cast(e.target.value);if($(labelId))$(labelId).textContent=e.target.value+suffix;renderPaper();save()});
const bindSelect=(id,key)=>$(id)?.addEventListener("change",e=>{data.design[key]=e.target.value;renderPaper();save()});
bindRange("#photoSize","photoSize","#photoSizeValue","mm");bindRange("#photoWidth","photoWidth","#photoWidthValue","mm");bindRange("#photoRadius","photoRadius","#photoRadiusValue","px");
bindRange("#nameSize","nameSize","#nameSizeValue","px");bindSelect("#nameWeight","nameWeight");bindSelect("#nameStyle","nameStyle");
bindRange("#headlineSize","headlineSize","#headlineSizeValue","px");bindSelect("#headlineWeight","headlineWeight");bindSelect("#headlineStyle","headlineStyle");
bindRange("#contactSize","contactSize","#contactSizeValue","px");bindSelect("#contactWeight","contactWeight");bindSelect("#contactStyle","contactStyle");
bindRange("#sectionSize","sectionSize","#sectionSizeValue","px");bindSelect("#sectionWeight","sectionWeight");bindSelect("#sectionStyle","sectionStyle");
$("#sectionBorder").onchange=e=>{data.design.sectionBorder=e.target.checked;renderPaper();save()};
bindRange("#descriptionSize","descriptionSize","#descriptionSizeValue","px");bindRange("#descriptionLine","descriptionLine","#descriptionLineValue","",Number);bindSelect("#descriptionWeight","descriptionWeight");bindSelect("#descriptionStyle","descriptionStyle");
$("#resetDesign").onclick=()=>mutate(()=>data.design=clone(defaultData.design));
$("#zoomIn").onclick=()=>{zoom=Math.min(1.25,zoom+.05);applyZoom()};$("#zoomOut").onclick=()=>{zoom=Math.max(.55,zoom-.05);applyZoom()};
$("#saveBtn").onclick=save;
$("#printBtn").onclick=()=>{
  renderPaper();
  const st=document.getElementById("printSizeStyle");
  if(!st){const node=document.createElement("style");node.id="printSizeStyle";document.head.appendChild(node)}
  document.getElementById("printSizeStyle").textContent=`@media print{@page{size:${data.design.pageSize==="LETTER"?"Letter":"A4"};margin:0}}`;
  window.print();
};
$("#docxBtn").onclick=makeDocx;
$("#undoBtn").onclick=()=>{if(!history.length)return;future.push(JSON.stringify(data));data=normalizeData(JSON.parse(history.pop()));renderAll();save()};
$("#redoBtn").onclick=()=>{if(!future.length)return;history.push(JSON.stringify(data));data=normalizeData(JSON.parse(future.pop()));renderAll();save()};
$("#exportJsonBtn").onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="EIN-CV.json";a.click();URL.revokeObjectURL(a.href)};
$("#importJson").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{snapshot();const imported=JSON.parse(r.result);if(!imported.meta||!imported.design||!Array.isArray(imported.sections))throw new Error("Invalid structure");data=normalizeData(imported);future=[];renderAll();save()}catch{alert("Invalid CV JSON file.")}};r.readAsText(f)};
$("#brandHome").onclick=e=>{e.preventDefault();window.scrollTo({top:0,behavior:"smooth"})};
document.addEventListener("keydown",e=>{const mod=e.ctrlKey||e.metaKey;if(!mod)return;if(e.key.toLowerCase()==="s"){e.preventDefault();save()}if(e.key.toLowerCase()==="z"){e.preventDefault();if(e.shiftKey)$("#redoBtn").click();else $("#undoBtn").click()}if(e.key.toLowerCase()==="y"){e.preventDefault();$("#redoBtn").click()}});
const motionQuery=window.matchMedia("(prefers-reduced-motion: reduce)");document.documentElement.classList.toggle("reduced-motion",motionQuery.matches);motionQuery.addEventListener?.("change",e=>document.documentElement.classList.toggle("reduced-motion",e.matches));
window.addEventListener("beforeunload",save);
document.addEventListener("click",e=>{
 const link=e.target.closest(".cv-link-fixed");
 if(link && inlineEditEnabled && !(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)){
   e.preventDefault();
 }
});
initInlineEditUI();
renderAll();

/* EIN-CV mobile / interaction helpers */
const sidebarToggle=$("#sidebarToggle");
const appSidebar=$("#appSidebar");
if(sidebarToggle&&appSidebar){
 sidebarToggle.addEventListener("click",()=>{
  const open=appSidebar.classList.toggle("open");
  sidebarToggle.setAttribute("aria-expanded",String(open));
  sidebarToggle.setAttribute("aria-label",open?"Close editor panel":"Open editor panel");
 });
 $$(".side-tab").forEach(tab=>tab.addEventListener("click",()=>{if(window.innerWidth<=780){appSidebar.classList.remove("open");sidebarToggle.setAttribute("aria-expanded","false")}}));
}
window.addEventListener("resize",()=>{if(window.innerWidth>780&&appSidebar){appSidebar.classList.remove("open");if(sidebarToggle)sidebarToggle.setAttribute("aria-expanded","false")}});
window.addEventListener("storage",e=>{
 if(e.key==="ein-cv:data:v1" && e.newValue){
  try{data=normalizeData(JSON.parse(e.newValue));renderAll()}catch{}
 }
});

const sectionModal=$("#sectionModal");
if(sectionModal){
 sectionModal.addEventListener("click",e=>{if(e.target===sectionModal)sectionModal.classList.add("hidden")});
 document.addEventListener("keydown",e=>{if(e.key==="Escape")sectionModal.classList.add("hidden")});
}
