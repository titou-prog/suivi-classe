const KEY='suivi-classe-v1';
const DEFAULT_BEHAVIORS=[
 {id:crypto.randomUUID(),type:'bonus',emoji:'🙋',label:"Participe à l'oral"},{id:crypto.randomUUID(),type:'bonus',emoji:'🤝',label:'Aide un camarade'},{id:crypto.randomUUID(),type:'bonus',emoji:'🎵',label:'Très bon travail'},{id:crypto.randomUUID(),type:'bonus',emoji:'✅',label:'Matériel prêt'},
 {id:crypto.randomUUID(),type:'malus',emoji:'🗣️',label:'Parle sans lever la main'},{id:crypto.randomUUID(),type:'malus',emoji:'📵',label:'Téléphone sorti'},{id:crypto.randomUUID(),type:'malus',emoji:'🎒',label:'Oubli de matériel'},{id:crypto.randomUUID(),type:'malus',emoji:'💬',label:'Bavardage'}];
let data=emptyData(); let currentClassId=null; let blockSave=false; let tab='class'; let search=''; let todayOnly=false; let sort='name'; let lastEvents=[];
// ===== STOCKAGE V15 : IndexedDB (bien plus large que localStorage, ~5 Mo sur Safari) =====
const DB_NAME='suivi-classe-db',DB_STORE='kv',DB_KEY='data';
let dbPromise=null,saveTimer=null,saving=Promise.resolve(),storageMode='idb';
function emptyData(){return {classes:[],behaviors:DEFAULT_BEHAVIORS.map(b=>({...b})),events:[],alerts:[],theme:'automatic'}}
function openDB(){
 if(dbPromise)return dbPromise;
 dbPromise=new Promise((res,rej)=>{
  if(!('indexedDB' in window))return rej(new Error('no-idb'));
  let r;try{r=indexedDB.open(DB_NAME,1)}catch(e){return rej(e)}
  r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(DB_STORE))r.result.createObjectStore(DB_STORE)};
  r.onsuccess=()=>{const db=r.result;db.onversionchange=()=>{db.close();dbPromise=null};res(db)};
  r.onerror=()=>rej(r.error||new Error('idb-open'));
  r.onblocked=()=>rej(new Error('idb-blocked'));
 });
 dbPromise.catch(()=>{dbPromise=null});
 return dbPromise;
}
function idbGet(){return openDB().then(db=>new Promise((res,rej)=>{const tx=db.transaction(DB_STORE,'readonly');const q=tx.objectStore(DB_STORE).get(DB_KEY);q.onsuccess=()=>res(q.result||null);q.onerror=()=>rej(q.error)}))}
function idbPut(v){return openDB().then(db=>new Promise((res,rej)=>{const tx=db.transaction(DB_STORE,'readwrite');tx.objectStore(DB_STORE).put(v,DB_KEY);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error||new Error('idb-write'));tx.onabort=()=>rej(tx.error||new Error('idb-abort'))}))}
async function writeStore(d){
 try{await idbPut(d);storageMode='idb'}
 catch(e){
  // Secours : localStorage (utile seulement si IndexedDB est indisponible, par ex. navigation privée)
  try{localStorage.setItem(KEY,JSON.stringify(d));storageMode='ls'}
  catch(e2){throw (e&&e.name==='QuotaExceededError')?e:e2}
 }
}
function persistNow(){
 clearTimeout(saveTimer);saveTimer=null;
 if(blockSave)return Promise.reject(new Error('save-blocked'));
 const p=saving.catch(()=>{}).then(()=>writeStore(data));
 saving=p;return p;
}
function save(){
 applyTheme();
 clearTimeout(saveTimer);
 if(blockSave)return;
 saveTimer=setTimeout(()=>{persistNow().catch(reportSaveError)},150);
}
function flushSave(){if(saveTimer)persistNow().catch(()=>{})}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushSave()});
window.addEventListener('pagehide',flushSave);
function explainStorageError(e){
 const n=e&&e.name||'',m=String(e&&e.message||'');
 if(n==='QuotaExceededError'||/quota/i.test(m))return 'Stockage de l’iPad plein ou limité : libère de la place (Réglages › Général › Stockage de l’iPad) puis réessaie.';
 if(m==='save-blocked')return 'Enregistrement bloqué : les données locales n’ont pas pu être lues. Importe une sauvegarde pour repartir sur une base saine.';
 return 'Impossible d’enregistrer sur cet appareil ('+(n||m||'erreur inconnue')+').';
}
function reportSaveError(e){console.error('Enregistrement local:',e);toast(explainStorageError(e),6000)}
async function updateStorageInfo(){
 const el=document.getElementById('storageInfo');if(!el)return;
 const photos=data.classes.reduce((n,c)=>n+c.students.filter(s=>s.photo).length,0),students=data.classes.reduce((n,c)=>n+c.students.length,0);
 let txt=`${data.classes.length} classe(s) · ${students} élève(s) · ${photos} photo(s) · ${data.events.length} événement(s)`;
 try{if(navigator.storage&&navigator.storage.estimate){const e=await navigator.storage.estimate();txt+=` — Stockage utilisé : ${(e.usage/1048576).toFixed(1)} Mo`+(e.quota?` sur ${Math.round(e.quota/1048576)} Mo disponibles`:'')}}catch(_){}
 txt+=storageMode==='idb'?' · Mode : IndexedDB ✅':' · Mode : secours localStorage ⚠️ (limité à ~5 Mo)';
 const el2=document.getElementById('storageInfo');if(el2)el2.textContent=txt;
}
async function init(){
 let loaded=null,source='',readFailed=false;
 try{loaded=await idbGet();if(loaded)source='idb'}catch(e){console.warn('IndexedDB indisponible :',e);storageMode='ls'}
 if(!loaded){
  try{const raw=localStorage.getItem(KEY);if(raw){loaded=JSON.parse(raw);source='ls'}}
  catch(e){console.warn('Lecture localStorage :',e);readFailed=true}
 }
 if(loaded){
  try{data=normalizeImportedData(loaded)}
  catch(e){console.error('Données locales illisibles :',e);data=emptyData();blockSave=true;readFailed=true}
 }
 currentClassId=data.classes[0]?.id||null;
 applyTheme();render();
 if(readFailed)toast('Données locales illisibles : rien n’a été écrasé. Importe une sauvegarde pour repartir.',7000);
 // Migration automatique depuis l'ancien stockage localStorage (versions ≤ V14)
 if(source==='ls'&&storageMode==='idb'&&!blockSave){
  try{
   await idbPut(data);const back=await idbGet();
   if(back&&Array.isArray(back.classes)&&back.classes.length===data.classes.length){localStorage.removeItem(KEY);toast('Données migrées vers le nouveau stockage ✅',3500)}
  }catch(e){console.warn('Migration impossible :',e)}
 }
 try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(_){}
}
function playSound(kind){
 try{
  const C=window.AudioContext||window.webkitAudioContext; if(!C)return;
  const ctx=window.__audioCtx||(window.__audioCtx=new C());
  if(ctx.state==='suspended')ctx.resume();
  const patterns={
   bonus:[[523.25,0],[659.25,.09]],
   malus:[[220,0],[165,.11]],
   alert:[[880,0],[659.25,.13],[880,.26],[659.25,.39]]
  };
  const notes=patterns[kind]||patterns.bonus;
  const now=ctx.currentTime;
  notes.forEach(([freq,offset])=>{
   const o=ctx.createOscillator(),g=ctx.createGain();
   o.type=kind==='alert'?'square':'sine'; o.frequency.value=freq;
   g.gain.setValueAtTime(0.0001,now+offset);
   g.gain.exponentialRampToValueAtTime(kind==='alert'?0.075:0.045,now+offset+0.012);
   g.gain.exponentialRampToValueAtTime(0.0001,now+offset+0.12);
   o.connect(g);g.connect(ctx.destination);o.start(now+offset);o.stop(now+offset+0.14);
  });
 }catch(e){}
}
function applyTheme(){let dark=data.theme==='dark'||(data.theme==='automatic'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark)}
function currentClass(){return data.classes.find(c=>c.id===currentClassId)}
function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random()}
function initials(name){return name.trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?'}
function avatarColor(name){let n=0;for(const c of name)n=(n*31+c.charCodeAt(0))>>>0;return `hsl(${n%360} 55% 48%)`}
function isToday(d){const a=new Date(d),b=new Date();return a.toDateString()===b.toDateString()}
function eventsFor(id){return data.events.filter(e=>e.studentId===id && (!todayOnly||isToday(e.date)))}
function counts(id){return eventsFor(id).reduce((r,e)=>(e.type==='bonus'?r.bonus++:r.malus++,r),{bonus:0,malus:0})}
function setTab(t){tab=t;render()}
function render(){applyTheme();document.querySelectorAll('.bottom button').forEach(b=>b.classList.remove('active'));document.getElementById('nav-'+tab)?.classList.add('active');document.getElementById('view').innerHTML=tab==='class'?classView():tab==='behaviors'?behaviorView():tab==='reports'?reportsView():dataView();if(tab==='data')updateStorageInfo();}
function classView(){const c=currentClass(); if(!c)return `<div class="panel empty"><div style="font-size:45px">🏫</div><h2>Aucune classe</h2><p>Tu peux créer une classe ou importer directement une base existante.</p><div class="row" style="justify-content:center;margin-top:12px"><button class="primary" onclick="addClass()">➕ Créer une classe</button><button onclick="importDatabase()">📥 Importer une base</button><button onclick="backup()">💾 Sauvegarder</button></div></div>`;
let total=c.students.reduce((a,s)=>{const k=counts(s.id);return {b:a.b+k.bonus,m:a.m+k.malus}}, {b:0,m:0}); let students=c.students.filter(s=>s.name.toLowerCase().includes(search.toLowerCase()));students.sort((a,b)=>sort==='bonus'?counts(b.id).bonus-counts(a.id).bonus:sort==='malus'?counts(b.id).malus-counts(a.id).malus:a.name.localeCompare(b.name,'fr'));
return `<div class="panel"><div class="row"><select class="grow" onchange="currentClassId=this.value;render()">${data.classes.map(x=>`<option value="${x.id}" ${x.id===c.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select><button onclick="addClass()">➕ Classe</button><button onclick="openClassSettings()">⚙️</button></div></div>
<div class="grid stats"><div class="stat"><b class="plus">+${total.b}</b><span>Bonus</span></div><div class="stat"><b class="minus">-${total.m}</b><span>Malus</span></div><div class="stat"><b>${total.b-total.m}</b><span>Solde</span></div><div class="stat"><b>${c.students.length}</b><span>Élèves</span></div></div>
<div class="panel"><div class="controls"><input placeholder="🔎 Rechercher un élève…" value="${esc(search)}" oninput="search=this.value;render()"><button onclick="todayOnly=!todayOnly;render()">${todayOnly?'📅 Aujourd’hui':'📊 Total'}</button><button onclick="sort=sort==='name'?'bonus':sort==='bonus'?'malus':'name';render()">↕️ ${sort==='name'?'Nom':sort==='bonus'?'Bonus':'Malus'}</button></div><div class="row" style="margin-top:9px"><button class="primary" onclick="giveAll()">👥 Toute la classe</button><button onclick="addStudents()">➕ Ajouter des élèves</button><button onclick="backup()">💾 Sauvegarder</button><button onclick="importDatabase()">📥 Importer</button><button onclick="setTab('behaviors')">⭐ Gérer les bonus/malus</button><button class="primary" onclick="randomStudent()">🎲 Aléatoire</button><button onclick="setTab('reports')">📋 Rapports</button><button onclick="undo()" ${lastEvents.length?'':'disabled'}>↩️ Annuler</button></div></div>
${alertBanner()}<div class="grid students">${students.map(studentCard).join('')||'<div class="empty" style="grid-column:1/-1">Aucun élève trouvé.</div>'}</div>`}
function studentCard(s){const k=counts(s.id);return `<article class="student"><div class="avatar" title="Appui long pour gérer l’élève" style="background:${avatarColor(s.name)}" onpointerdown="startStudentPress(event,'${s.id}')" onpointerup="endStudentPress(event,'${s.id}')" onpointercancel="cancelStudentPress()" onpointerleave="cancelStudentPress()" oncontextmenu="return false">${s.photo?`<img src="${s.photo}" alt="">`:initials(s.name)}</div><h3>${esc(s.name)}</h3><div class="score"><span class="plus">+${k.bonus}</span><span class="minus">-${k.malus}</span></div><div class="balance">Solde ${k.bonus-k.malus}</div><div class="actions"><button class="primary" onclick="chooseBehavior('${s.id}','bonus')">➕ Bonus</button><button onclick="chooseBehavior('${s.id}','malus')">➖ Malus</button></div></article>`}
function behaviorView(){return `<div class="panel"><div class="row"><div class="grow"><div class="section-title">Comportements</div><div class="small">Crée autant de catégories de bonus et de malus que nécessaire.</div></div><button class="primary" onclick="behaviorForm()">➕ Ajouter</button></div><div class="row" style="margin-top:10px"><button onclick="behaviorForm();document.getElementById('bType').value='bonus'">➕ Nouveau bonus</button><button onclick="behaviorForm();document.getElementById('bType').value='malus'">➖ Nouveau malus</button></div></div>${['bonus','malus'].map(type=>`<div class="panel"><div class="section-title">${type==='bonus'?'🟢 Bonus':'🔴 Malus'}</div>${data.behaviors.filter(b=>b.type===type).map(b=>`<div class="behavior ${type}"><span class="emoji">${b.emoji}</span><span class="grow">${esc(b.label)}</span><button onclick="behaviorForm('${b.id}')">✏️</button><button class="danger" onclick="deleteBehavior('${b.id}')">🗑️</button></div>`).join('')}</div>`).join('')}`}
function dataView(){const c=currentClass();return `<div class="panel"><div class="section-title">💾 Base de données</div><p class="small">Sauvegarde toute la base de l’application dans un fichier JSON pour la transférer sur un autre appareil.</p><div class="row"><button class="primary" onclick="backup()">💾 Sauvegarder la base</button><button onclick="importDatabase()">📥 Importer une base</button><button onclick="copyCSV()">📋 Copier CSV</button><button onclick="window.print()">🖨️ Imprimer</button></div></div><div class="panel"><div class="section-title">🗄️ Stockage</div><p class="small" id="storageInfo">Calcul…</p></div><div class="panel"><div class="section-title">📊 Classe active</div>${c?`<p><b>${esc(c.name)}</b> · ${c.students.length} élèves</p>`:'<p class="small">Aucune classe active.</p>'}</div><div class="panel"><div class="section-title">🚨 Alertes vie scolaire</div>${data.alerts.length?data.alerts.slice().reverse().slice(0,20).map(a=>`<div class="row" style="padding:7px 0;border-bottom:1px solid var(--line)"><span class="grow"><b>${esc(a.studentName)}</b> · ${esc(a.className)}<br><span class="small">${new Date(a.date).toLocaleString('fr-FR')}</span></span><button onclick="showAlert(data.alerts.find(x=>x.id==='${a.id}'))">Voir</button></div>`).join(''):`<p class="small">Aucune alerte pour le moment.</p>`}</div><div class="panel"><div class="section-title">📱 Installation sur iPad</div><p>Dans Safari : <b>Partager → Sur l’écran d’accueil</b>. Une fois installée, l’application peut continuer à fonctionner hors connexion après son premier chargement.</p><p class="small">Pour une vraie installation PWA, l’adresse du site doit être en HTTPS.</p></div><div class="panel danger-zone"><div class="section-title">⚠️ Zone sensible</div><button class="danger" onclick="wipe()">Tout effacer</button></div>`}
function reportsView(){
 const reports=data.alerts.slice().reverse();
 return `<div class="panel"><div class="row"><div class="grow"><div class="section-title">📋 Rapports de dépassement de malus</div><div class="small">Tous les rapports restent accessibles ici, même après leur consultation.</div></div><button onclick="setTab('class')">👥 Élèves</button></div></div>${reports.length?reports.map(a=>`<div class="panel"><div class="row"><span style="font-size:28px">🚨</span><span class="grow"><b>${esc(a.studentName)}</b> · ${esc(a.className)}<br><span class="small">${new Date(a.date).toLocaleString('fr-FR')} · ${a.streak||5} malus consécutifs</span></span>${a.viewed?'':'<span class="small">Nouveau</span>'}</div><div class="row" style="margin-top:10px"><button class="primary grow" onclick="showAlert(data.alerts.find(x=>x.id==='${a.id}'))">👁️ Voir le rapport</button><button onclick="copyAlert('${a.id}')">📋 Copier</button><button class="danger" onclick="deleteAlert('${a.id}')">🗑️ Supprimer</button></div></div>`).join(''):`<div class="panel empty"><div style="font-size:42px">📋</div><h2>Aucun rapport</h2><p>Les rapports apparaîtront ici après 5 malus consécutifs.</p></div>`}`;
}

function randomStudent(){
 const c=currentClass();
 if(!c||!c.students.length)return toast('Aucun élève dans la classe');
 const n=c.students.length;
 let x;
 if(crypto.getRandomValues){
   const max=0x100000000; const limit=Math.floor(max/n)*n; const buf=new Uint32Array(1);
   do{crypto.getRandomValues(buf); x=buf[0];}while(x>=limit);
   x=x%n;
 }else{x=Math.floor(Math.random()*n)}
 const s=c.students[x];
 openModal(`<div style="text-align:center;padding:10px 0 18px"><div style="font-size:58px">🎲</div><div class="small">Élève tiré au sort</div><h2 style="font-size:30px;margin:8px 0 18px">${esc(s.name)}</h2><p class="small">Tirage effectué parmi tous les élèves de la classe, sans tenir compte des bonus ou des malus.</p><div class="row"><button class="primary grow" onclick="randomStudent()">🎲 Nouveau tirage</button><button onclick="closeModal()">Fermer</button></div></div>`);
}

function openModal(html){document.getElementById('sheet').innerHTML=html;document.getElementById('modal').classList.add('show')};function closeModal(){document.getElementById('modal').classList.remove('show')};document.getElementById('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
function addClass(){openModal(`<h2>Nouvelle classe</h2><input id="mName" placeholder="Nom de la classe" autofocus><textarea id="mStudents" rows="7" placeholder="Un élève par ligne (facultatif)"></textarea><div class="row"><button class="primary" onclick="confirmAddClass()">Créer</button><button onclick="closeModal()">Annuler</button></div>`) }
function confirmAddClass(){const name=document.getElementById('mName').value.trim();if(!name)return toast('Indique un nom de classe');const students=document.getElementById('mStudents').value.split(/\n|;/).map(x=>x.trim()).filter(Boolean).map(name=>({id:uid(),name}));const c={id:uid(),name,students};data.classes.push(c);currentClassId=c.id;save();closeModal();render();}
function addStudents(){openModal(`<h2>Ajouter des élèves</h2><textarea id="mStudents" rows="9" placeholder="Un élève par ligne"></textarea><div class="row"><button class="primary" onclick="confirmAddStudents()">Ajouter</button><button onclick="closeModal()">Annuler</button></div>`) }
function confirmAddStudents(){const c=currentClass();if(!c)return;const names=document.getElementById('mStudents').value.split(/\n|;/).map(x=>x.trim()).filter(Boolean);c.students.push(...names.map(name=>({id:uid(),name})));save();closeModal();render();toast(`${names.length} élève(s) ajouté(s)`)}
function chooseBehavior(studentId,type){const bs=data.behaviors.filter(b=>b.type===type);openModal(`<h2>${type==='bonus'?'➕ Bonus':'➖ Malus'}</h2>${bs.map(b=>`<button style="width:100%;text-align:left;margin:5px 0" onclick="applyBehavior('${studentId}','${b.id}')">${b.emoji} ${esc(b.label)}</button>`).join('')}<button style="width:100%;margin-top:8px" onclick="closeModal()">Annuler</button>`) }
function applyBehavior(studentId,behaviorId){const b=data.behaviors.find(x=>x.id===behaviorId),c=currentClass();if(!b||!c)return;const e={id:uid(),studentId,classId:c.id,behaviorId,type:b.type,label:b.label,emoji:b.emoji,date:new Date().toISOString()};data.events.push(e);lastEvents=[e.id];playSound(b.type==='bonus'?'bonus':'malus');let alert=null;if(b.type==='malus')alert=checkAlert(studentId);save();closeModal();render();if(alert){playSound('alert');showAlert(alert)}else{toast(`${b.emoji} ${b.label}`)}}
function giveAll(){const c=currentClass();if(!c||!c.students.length)return toast('Aucun élève');openModal(`<h2>Attribuer à toute la classe</h2>${data.behaviors.map(b=>`<button style="width:100%;text-align:left;margin:5px 0" onclick="applyAll('${b.id}')">${b.emoji} ${esc(b.label)}</button>`).join('')}<button style="width:100%;margin-top:8px" onclick="closeModal()">Annuler</button>`) }
function applyAll(behaviorId){const b=data.behaviors.find(x=>x.id===behaviorId),c=currentClass();if(!b||!c)return;lastEvents=[];const now=new Date().toISOString();let alerts=[];c.students.forEach(s=>{const e={id:uid(),studentId:s.id,classId:c.id,behaviorId:b.id,type:b.type,label:b.label,emoji:b.emoji,date:now};data.events.push(e);lastEvents.push(e.id);if(b.type==='malus'){const a=checkAlert(s.id);if(a)alerts.push(a)}});playSound(b.type==='bonus'?'bonus':'malus');save();closeModal();render();if(alerts.length){playSound('alert');}if(alerts.length===1)showAlert(alerts[0]);else toast(`${b.emoji} appliqué à ${c.students.length} élèves${alerts.length?` · 🚨 ${alerts.length} alerte(s)`:''}`)}
function consecutiveMalus(studentId){
 const ev=data.events.filter(e=>e.studentId===studentId).sort((a,b)=>new Date(a.date)-new Date(b.date));
 let streak=[];
 for(let i=ev.length-1;i>=0;i--){
   if(ev[i].type!=='malus') break;
   streak.unshift(ev[i]);
 }
 return streak;
}
function checkAlert(studentId){
 const streak=consecutiveMalus(studentId);
 if(streak.length && streak.length%5===0){
   const c=currentClass(),s=c?.students.find(x=>x.id===studentId);
   const alert={id:uid(),studentId,studentName:s?.name||'',className:c?.name||'',date:new Date().toISOString(),streak:streak.length,items:streak.slice(-5).map(e=>({date:e.date,label:e.label,emoji:e.emoji}))};
   data.alerts.push(alert);
   save();
   return alert;
 }
 return null;
}
function showAlert(alert){
 if(!alert)return;
 if(!alert.viewed){alert.viewed=true;save();render();}
 const items=(alert.items||[]).map((x,i)=>`<div class="checkrow"><span style="font-size:20px">${x.emoji||'🔴'}</span><span class="grow"><b>${i+1}. ${esc(x.label)}</b><br><span class="small">${new Date(x.date).toLocaleString('fr-FR')}</span></span></div>`).join('');
 openModal(`<div style="text-align:center;padding:8px 0 14px"><div style="font-size:42px">🚨</div><h2 style="margin:4px 0">Alerte : 5 malus d'affilée</h2><p><b>${esc(alert.studentName)}</b> · ${esc(alert.className)}</p><p class="small">Un rapport récapitulatif a été créé.</p></div><div class="panel" style="margin:0 0 12px"><div class="section-title">Rapport des 5 derniers malus</div>${items}</div><div class="row"><button class="primary grow" onclick="copyAlert('${alert.id}')">📋 Copier le rapport</button><button onclick="closeModal()">Fermer</button></div>`);
}
function alertBanner(){
 const recent=data.alerts.filter(a=>a.className===currentClass()?.name&&!a.viewed).slice(-3).reverse();
 if(!recent.length)return '';
 return `<div class="panel" style="border:2px solid rgba(220,38,38,.35);background:rgba(220,38,38,.06)"><div class="section-title">🚨 Alertes récentes</div>${recent.map(a=>`<div class="row" style="margin:6px 0"><span class="grow"><b>${esc(a.studentName)}</b> · ${new Date(a.date).toLocaleString('fr-FR')}</span><button onclick="showAlert(data.alerts.find(x=>x.id==='${a.id}'))">Voir le rapport</button></div>`).join('')}</div>`;
}
function deleteAlert(id){
 const a=data.alerts.find(x=>x.id===id); if(!a)return;
 if(!confirm(`Supprimer le rapport de ${a.studentName} ?`))return;
 data.alerts=data.alerts.filter(x=>x.id!==id);
 save(); render(); toast('Rapport supprimé');
}
function copyAlert(id){
 const a=data.alerts.find(x=>x.id===id); if(!a)return;
 const text=`ALERTE — 5 MALUS D'AFFILÉE\nÉlève : ${a.studentName}\nClasse : ${a.className}\nDate : ${new Date(a.date).toLocaleString('fr-FR')}\n\n${(a.items||[]).map((x,i)=>`${i+1}. ${x.label} — ${new Date(x.date).toLocaleString('fr-FR')}`).join('\n')}`;
 if(navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(()=>toast('Rapport copié')).catch(()=>fallbackCopy(text)); else fallbackCopy(text);
}
function fallbackCopy(text){openModal(`<h2>Rapport</h2><textarea rows="12">${esc(text)}</textarea><button style="width:100%;margin-top:8px" onclick="closeModal()">Fermer</button>`);}

function undo(){if(!lastEvents.length)return;data.events=data.events.filter(e=>!lastEvents.includes(e.id));lastEvents=[];save();render();toast('Dernière action annulée')}
function studentMenu(id){const s=currentClass().students.find(x=>x.id===id);openModal(`<h2>${esc(s.name)}</h2><input id="newName" value="${esc(s.name)}"><div class="row" style="margin-top:9px"><button class="primary" onclick="renameStudent('${id}')">Renommer</button><label class="grow"><button style="width:100%" onclick="document.getElementById('photoInput').click()">📷 Photo</button><input id="photoInput" type="file" accept="image/*" style="display:none" onchange="setPhoto('${id}',this.files[0])"></label></div><button class="danger" style="width:100%;margin-top:8px" onclick="removeStudent('${id}')">🗑️ Supprimer l’élève</button><button style="width:100%;margin-top:8px" onclick="closeModal()">Fermer</button>`)}
function renameStudent(id){const s=currentClass().students.find(x=>x.id===id);s.name=document.getElementById('newName').value.trim()||s.name;save();closeModal();render()}
function removeStudent(id){if(!confirm('Supprimer cet élève et son historique ?'))return;const c=currentClass();c.students=c.students.filter(s=>s.id!==id);data.events=data.events.filter(e=>e.studentId!==id);save();closeModal();render()}
let studentPressTimer=null,studentPressFired=false;function startStudentPress(e,id){if(e.pointerType==='mouse'&&e.button!==0)return;studentPressFired=false;clearTimeout(studentPressTimer);studentPressTimer=setTimeout(()=>{studentPressFired=true;navigator.vibrate?.(30);studentMenu(id)},550)}function endStudentPress(e,id){clearTimeout(studentPressTimer);if(studentPressFired)e.preventDefault()}function cancelStudentPress(){clearTimeout(studentPressTimer)}
function setPhoto(id,file){if(!file)return;const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const W=360,H=480,can=document.createElement('canvas');can.width=W;can.height=H;const target=W/H,src=img.width/img.height;let sw,sh,sx,sy;if(src>target){sh=img.height;sw=sh*target;sx=(img.width-sw)/2;sy=Math.max(0,(img.height-sh)*0.28)}else{sw=img.width;sh=sw/target;sx=Math.max(0,(img.width-sw)*0.5);sy=0}const ctx=can.getContext('2d');ctx.drawImage(img,sx,sy,sw,sh,0,0,W,H);const s=currentClass().students.find(x=>x.id===id);s.photo=can.toDataURL('image/jpeg',.82);save();closeModal();render();toast('Photo enregistrée')};img.src=r.result};r.readAsDataURL(file)}
function openClassSettings(){const c=currentClass();openModal(`<h2>Classe</h2><input id="className" value="${esc(c.name)}"><div class="row" style="margin-top:9px"><button class="primary" onclick="renameClass()">Renommer</button><button onclick="resetClass()">Réinitialiser les compteurs</button></div><button class="danger" style="width:100%;margin-top:8px" onclick="deleteClass()">Supprimer la classe</button><button style="width:100%;margin-top:8px" onclick="closeModal()">Fermer</button>`) }
function renameClass(){const c=currentClass();c.name=document.getElementById('className').value.trim()||c.name;save();closeModal();render()}
function resetClass(){if(!confirm('Effacer tous les bonus/malus de cette classe ?'))return;const c=currentClass();data.events=data.events.filter(e=>e.classId!==c.id);data.alerts=data.alerts.filter(a=>a.className!==c.name);save();closeModal();render();toast('Compteurs réinitialisés')}
function deleteClass(){if(!confirm('Supprimer définitivement cette classe ?'))return;const id=currentClass().id;data.classes=data.classes.filter(c=>c.id!==id);data.events=data.events.filter(e=>e.classId!==id);currentClassId=data.classes[0]?.id||null;save();closeModal();render()}
function behaviorForm(id){const b=id?data.behaviors.find(x=>x.id===id):null;openModal(`<h2>${b?'Modifier':'Nouveau'} comportement</h2><select id="bType"><option value="bonus" ${b?.type==='bonus'?'selected':''}>Bonus</option><option value="malus" ${b?.type==='malus'?'selected':''}>Malus</option></select><input id="bEmoji" value="${esc(b?.emoji||'⭐')}" placeholder="Emoji"><input id="bLabel" value="${esc(b?.label||'')}" placeholder="Libellé"><button class="primary" style="width:100%;margin-top:8px" onclick="saveBehavior('${id||''}')">Enregistrer</button><button style="width:100%;margin-top:8px" onclick="closeModal()">Annuler</button>`) }
function saveBehavior(id){const type=document.getElementById('bType').value,emoji=document.getElementById('bEmoji').value.trim()||'⭐',label=document.getElementById('bLabel').value.trim();if(!label)return toast('Indique un libellé');if(id){const b=data.behaviors.find(x=>x.id===id);Object.assign(b,{type,emoji,label})}else data.behaviors.push({id:uid(),type,emoji,label});save();closeModal();render()}
function deleteBehavior(id){if(!confirm('Supprimer ce comportement ? L’historique déjà enregistré sera conservé.'))return;data.behaviors=data.behaviors.filter(b=>b.id!==id);save();render()}
function openSettings(){openModal(`<h2>Réglages</h2><select onchange="data.theme=this.value;save();render()"><option value="automatic" ${data.theme==='automatic'?'selected':''}>Automatique</option><option value="light" ${data.theme==='light'?'selected':''}>Clair</option><option value="dark" ${data.theme==='dark'?'selected':''}>Sombre</option></select><p class="small">Les données sont stockées localement dans le navigateur de l’iPad.</p><button style="width:100%" onclick="closeModal()">Fermer</button>`) }
function toggleTheme(){data.theme=data.theme==='automatic'?'dark':data.theme==='dark'?'light':'automatic';save();render()}
function backup(){
 const exportData=JSON.parse(JSON.stringify(data));
 exportData._format='suivi-classe';
 exportData._version=14;
 const blob=new Blob([JSON.stringify(exportData,null,2)],{type:'application/json;charset=utf-8'});
 const a=document.createElement('a');
 const stamp=new Date().toISOString().slice(0,10);
 a.href=URL.createObjectURL(blob);a.download=`suivi-classe-${stamp}.json`;a.click();
 setTimeout(()=>URL.revokeObjectURL(a.href),1000);
 toast('Base sauvegardée');
}
function importDatabase(){
 const input=document.createElement('input');
 input.type='file';
 input.accept='.json,application/json,text/json,*/*';
 input.style.display='none';
 document.body.appendChild(input);
 input.onchange=()=>{
  const file=input.files&&input.files[0];
  input.remove();
  if(file) restoreFile(file);
 };
 input.oncancel=()=>input.remove();
 input.click();
}
function normalizeImportedData(x){
 if(!x || typeof x!=='object' || Array.isArray(x)) throw new Error('format');
 // Accepte les sauvegardes produites par les anciennes versions de l'application.
 if(x.data && typeof x.data==='object') x=x.data;
 if(!Array.isArray(x.classes)) throw new Error('format');
 const out={...x};delete out._format;delete out._version;
 out.classes=Array.isArray(out.classes)?out.classes:[];
 out.events=Array.isArray(out.events)?out.events:[];
 out.behaviors=Array.isArray(out.behaviors)?out.behaviors:DEFAULT_BEHAVIORS.map(b=>({...b}));
 out.alerts=Array.isArray(out.alerts)?out.alerts:[];
 out.theme=out.theme||'automatic';
 out.classes=out.classes.map(c=>({...c,students:Array.isArray(c.students)?c.students:[]}));
 out.events=out.events.map(e=>{const z={...e}; if(z.classId==null && z.class) z.classId=z.class; return z});
 out.alerts=out.alerts.map(a=>({...a,viewed:a.viewed===true}));
 return out;
}
function restoreFile(file){
 if(!file)return;
 const fail=(msg)=>toast(msg,6500);
 const done=async(text)=>{
  let raw=String(text||'').replace(/^\uFEFF/,'').trim();
  if(!raw)return fail('Le fichier est vide.');
  let parsed;
  try{parsed=JSON.parse(raw)}
  catch(e){console.error('Import JSON :',e);return fail('Ce fichier n’est pas un JSON valide (fichier tronqué, modifié ou autre format).')}
  let x;
  try{x=normalizeImportedData(parsed)}
  catch(e){console.error('Import format :',e);return fail('JSON valide, mais ce n’est pas une sauvegarde de Suivi de classe.')}
  if(!x.classes.length)return fail('Cette sauvegarde ne contient aucune classe : import annulé.');
  if(x.classes.some(c=>!c||typeof c!=='object'||c.id==null||typeof c.name!=='string'))return fail('Sauvegarde endommagée : une classe n’a pas d’identifiant ou de nom.');
  const nbStudents=x.classes.reduce((n,c)=>n+c.students.length,0),nbPhotos=x.classes.reduce((n,c)=>n+c.students.filter(s=>s&&s.photo).length,0);
  if(!confirm(`Importer ${x.classes.length} classe(s), ${nbStudents} élève(s), ${nbPhotos} photo(s) et ${x.events.length} événement(s) ?\n\nCela remplacera les données actuellement présentes sur cet appareil.`))return;
  const prev={data,currentClassId,lastEvents,blockSave};
  data=x;currentClassId=data.classes[0]?.id||null;lastEvents=[];blockSave=false;
  toast('Import en cours…',60000);
  try{
   await persistNow();
   render();
   toast('Base importée avec succès ✅',3500);
  }catch(e){
   console.error('Import — écriture locale :',e);
   data=prev.data;currentClassId=prev.currentClassId;lastEvents=prev.lastEvents;blockSave=prev.blockSave;
   render();
   fail('Fichier correct, mais impossible de l’enregistrer. '+explainStorageError(e)+' Tes données précédentes sont conservées.');
  }
 };
 try{
  const r=new FileReader();
  r.onload=()=>done(r.result);
  r.onerror=()=>fail('Impossible de lire le fichier sur cet appareil. Enregistre-le d’abord dans l’app Fichiers, puis réessaie.');
  r.readAsText(file,'UTF-8');
 }catch(e){
  if(typeof file.text==='function')file.text().then(done).catch(()=>fail('Impossible de lire le fichier.'));
  else fail('Lecture des fichiers non disponible sur ce navigateur.');
 }
}
function copyCSV(){const c=currentClass();if(!c)return;let out='Élève;Bonus;Malus;Solde\n';c.students.forEach(s=>{const k=counts(s.id);out+=`"${s.name.replaceAll('"','""')}";${k.bonus};${k.malus};${k.bonus-k.malus}\n`});navigator.clipboard?.writeText(out).then(()=>toast('CSV copié')).catch(()=>{openModal(`<h2>Bilan CSV</h2><textarea rows="12">${esc(out)}</textarea><button style="width:100%;margin-top:8px" onclick="closeModal()">Fermer</button>`)})}
function wipe(){if(!confirm('Effacer toutes les classes, élèves et historiques ?'))return;data={classes:[],behaviors:DEFAULT_BEHAVIORS,events:[],alerts:[],theme:'automatic'};currentClassId=null;blockSave=false;save();render()}
let toastTimer=null;function toast(msg,ms=2200){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),ms)}
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
init();
