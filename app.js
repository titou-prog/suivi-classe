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
 try{await edtAutoSelect('start')}catch(e){console.warn('Emploi du temps :',e)}
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
// ===== SONS V16 =====
// Sur iPad : le Web Audio est coupé par le commutateur « silencieux » et reste bloqué tant qu'un geste n'a pas « déverrouillé » l'audio.
// On génère donc de vrais fichiers WAV lus par un élément <audio> (qui ignore ce commutateur), avec le Web Audio en secours.
const SND_RATE=22050;
const SND_DEFS={
 bonus:{wave:'bright',notes:[[523.25,0,.16],[659.25,.10,.16],[783.99,.20,.30]]},
 malus:{wave:'buzz',notes:[[329.63,0,.20],[246.94,.16,.34]]},
 alert:{wave:'buzz',notes:[[880,0,.14],[659.25,.16,.14],[880,.32,.14],[659.25,.48,.14],[880,.64,.14],[659.25,.80,.14],[880,.96,.22]]}
};
function sndSample(wave,ph){
 const t=ph%(2*Math.PI);
 if(wave==='buzz'){let v=0;for(let h=1;h<=7;h+=2)v+=Math.sin(h*t)/h;return v*.9} // carré adouci : audible sur les petits haut-parleurs
 return Math.sin(t)+.45*Math.sin(2*t)+.2*Math.sin(3*t); // timbre brillant
}
// ===== SONS V20 =====
// Problème corrigé : après plusieurs bonus/malus, iPadOS « suspend » le contexte audio ou bloque l'élément <audio> réutilisé,
// et plus rien ne sonnait jusqu'au redémarrage de l'appli.
// Solution : 1) sons pré-calculés joués par le Web Audio (une nouvelle source à chaque son, aucun état à réinitialiser) ;
// 2) le contexte audio est réveillé à CHAQUE toucher (pas seulement au premier) et recréé s'il est fermé ;
// 3) une boucle de silence jouée par un élément <audio> place l'iPad en mode « lecture » : les sons passent même commutateur silencieux activé ;
// 4) secours : un petit lot d'éléments <audio> utilisés à tour de rôle (jamais le même deux fois de suite).
let actx=null,sndBufs=null,sndPool={},sndPoolIdx={},keepAlive=null,lastGesture=0;
function sndRender(def){
 const total=Math.max(...def.notes.map(n=>n[1]+n[2]))+.08,N=Math.ceil(total*SND_RATE),buf=new Float32Array(N);
 def.notes.forEach(([f,st,du])=>{
  const i0=Math.floor(st*SND_RATE),len=Math.floor(du*SND_RATE);
  for(let i=0;i<len&&i0+i<N;i++){
   const t=i/SND_RATE,att=Math.min(1,t/.006),dec=Math.exp(-3.2*t/du),rel=Math.min(1,(len-i)/(SND_RATE*.012));
   buf[i0+i]+=sndSample(def.wave,2*Math.PI*f*t)*att*dec*rel;
  }
 });
 let peak=0;for(let i=0;i<N;i++)peak=Math.max(peak,Math.abs(buf[i]));
 const k=peak?0.92/peak:1;for(let i=0;i<N;i++)buf[i]*=k;
 return buf;
}
function wavURI(samples){
 const N=samples.length,bytes=new Uint8Array(44+N*2),dv=new DataView(bytes.buffer);
 const w=(o,str)=>{for(let i=0;i<str.length;i++)dv.setUint8(o+i,str.charCodeAt(i))};
 w(0,'RIFF');dv.setUint32(4,36+N*2,true);w(8,'WAVE');w(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);
 dv.setUint32(24,SND_RATE,true);dv.setUint32(28,SND_RATE*2,true);dv.setUint16(32,2,true);dv.setUint16(34,16,true);w(36,'data');dv.setUint32(40,N*2,true);
 for(let i=0;i<N;i++)dv.setInt16(44+i*2,Math.max(-1,Math.min(1,samples[i]))*32767,true);
 let bin='';for(let i=0;i<bytes.length;i+=8192)bin+=String.fromCharCode.apply(null,bytes.subarray(i,i+8192));
 return 'data:audio/wav;base64,'+btoa(bin);
}
function synthWavURI(def){return wavURI(sndRender(def))}
let sndSamples=null;
function samplesFor(kind){if(!sndSamples){sndSamples={};for(const k in SND_DEFS)sndSamples[k]=sndRender(SND_DEFS[k])}return sndSamples[kind]||sndSamples.bonus}
function getCtx(){
 const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
 if(!actx||actx.state==='closed'){try{actx=new C();sndBufs=null}catch(e){actx=null;return null}}
 if(!sndBufs){sndBufs={};for(const k in SND_DEFS){const s=samplesFor(k),b=actx.createBuffer(1,s.length,SND_RATE);b.getChannelData(0).set(s);sndBufs[k]=b}}
 return actx;
}
function startKeepAlive(){
 // boucle de silence (1 s) : garde la session audio en mode lecture et ignore le commutateur silencieux
 try{
  if(!keepAlive){keepAlive=new Audio(wavURI(new Float32Array(SND_RATE)));keepAlive.loop=true;keepAlive.setAttribute('playsinline','');keepAlive.preload='auto'}
  if(keepAlive.paused){const p=keepAlive.play();if(p&&p.catch)p.catch(()=>{})}
 }catch(_){}
}
function unlockAudio(){
 // appelé à chaque toucher : réveille l'audio si iPadOS l'a mis en pause
 lastGesture=Date.now();
 startKeepAlive();
 const ctx=getCtx();
 if(ctx&&ctx.state!=='running'){try{ctx.resume().catch(()=>{})}catch(_){}}
}
['pointerdown','touchstart','touchend','click'].forEach(ev=>document.addEventListener(ev,unlockAudio,{passive:true,capture:true}));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&actx&&actx.state!=='running'){try{actx.resume().catch(()=>{})}catch(_){}}});
function ctxPlay(kind){
 const ctx=getCtx();if(!ctx)return false;
 const go=()=>{try{const src=ctx.createBufferSource(),g=ctx.createGain();src.buffer=sndBufs[kind]||sndBufs.bonus;g.gain.value=1;src.connect(g);g.connect(ctx.destination);src.start(0);src.onended=()=>{try{src.disconnect();g.disconnect()}catch(_){}}}catch(e){console.warn('Web Audio :',e)}};
 if(ctx.state==='running'){go();return true}
 // contexte suspendu/interrompu : on tente de le réveiller ; s'il ne répond pas vite, on passe au secours
 let done=false;
 try{ctx.resume().then(()=>{if(!done){done=true;go()}}).catch(()=>{})}catch(_){}
 setTimeout(()=>{if(!done){done=true;
  // contexte bloqué : on le recrée pour les prochains sons et on joue celui-ci avec un élément <audio>
  try{actx.close()}catch(_){};actx=null;sndBufs=null;elPlay(kind)}},250);
 return true;
}
function elPlay(kind){
 try{
  if(!sndPool[kind]){const uri=wavURI(samplesFor(kind));sndPool[kind]=[0,1,2,3].map(()=>{const a=new Audio(uri);a.preload='auto';a.setAttribute('playsinline','');return a});sndPoolIdx[kind]=0}
  const a=sndPool[kind][sndPoolIdx[kind]];sndPoolIdx[kind]=(sndPoolIdx[kind]+1)%sndPool[kind].length;
  try{a.pause();a.currentTime=0}catch(_){}
  a.muted=false;a.volume=1;const p=a.play();if(p&&p.catch)p.catch(()=>{});
 }catch(e){console.warn('Son :',e)}
}
function playSound(kind){
 if(data.soundOn===false)return;
 startKeepAlive();
 if(!ctxPlay(kind))elPlay(kind);
}
function webAudioPlay(kind){ctxPlay(kind)}
function applyTheme(){let dark=data.theme==='dark'||(data.theme==='automatic'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark)}
function currentClass(){return data.classes.find(c=>c.id===currentClassId)}
function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random()}
function initials(name){return name.trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?'}
function avatarColor(name){let n=0;for(const c of name)n=(n*31+c.charCodeAt(0))>>>0;return `hsl(${n%360} 55% 48%)`}
function isToday(d){const a=new Date(d),b=new Date();return a.toDateString()===b.toDateString()}
function eventsFor(id){return data.events.filter(e=>e.studentId===id && !e.cleared && (!todayOnly||isToday(e.date)))}
function counts(id){return eventsFor(id).reduce((r,e)=>(e.type==='bonus'?r.bonus++:r.malus++,r),{bonus:0,malus:0})}
function setTab(t){tab=t;render();window.scrollTo(0,0)}
function render(){applyTheme();document.querySelectorAll('.bottom button').forEach(b=>b.classList.remove('active'));document.getElementById('nav-'+tab)?.classList.add('active');document.getElementById('view').innerHTML=(tab==='class'?'':'<div class="row noprint" style="margin-bottom:12px"><button class="primary" onclick="setTab(\'class\')">← Retour à l’accueil</button></div>')+(tab==='class'?classView():tab==='behaviors'?behaviorView():tab==='reports'?reportsView():tab==='recap'?recapView():dataView());if(tab==='data')updateStorageInfo();}
function sizeKey(){return ['s','m','l'].includes(data.cardSize)?data.cardSize:'s'}
function filteredStudents(c){
 const q=search.toLowerCase();
 const list=c.students.filter(s=>s.name.toLowerCase().includes(q));
 list.sort((a,b)=>sort==='bonus'?counts(b.id).bonus-counts(a.id).bonus:sort==='malus'?counts(b.id).malus-counts(a.id).malus:a.name.localeCompare(b.name,'fr'));
 return list;
}
function studentsGrid(c){return filteredStudents(c).map(studentCard).join('')||'<div class="empty" style="grid-column:1/-1">Aucun élève trouvé.</div>'}
// La recherche ne met à jour que la grille : le champ garde le focus et le clavier de l'iPad reste ouvert
function onSearch(v){search=v;const c=currentClass(),g=document.getElementById('studentGrid');if(c&&g)g.innerHTML=studentsGrid(c)}
function cycleSize(){const o=['s','m','l'];data.cardSize=o[(o.indexOf(sizeKey())+1)%3];save();render()}
function openMore(){openModal(`<h2>Plus d’actions</h2><div class="pick"><button onclick="closeModal();addStudents()">➕ Ajouter des élèves</button><button onclick="closeModal();setTab('reports')">📋 Rapports</button><button onclick="closeModal();backup()">💾 Sauvegarder</button><button onclick="closeModal();importDatabase()">📥 Importer une base</button></div><button style="width:100%;margin-top:10px" onclick="closeModal()">Fermer</button>`)}
function classView(){const c=currentClass(); if(!c)return `<div class="panel empty"><div style="font-size:45px">🏫</div><h2>Aucune classe</h2><p>Tu peux créer une classe ou importer directement une base existante.</p><div class="row" style="justify-content:center;margin-top:12px"><button class="primary" onclick="addClass()">➕ Créer une classe</button><button onclick="importDatabase()">📥 Importer une base</button><button onclick="backup()">💾 Sauvegarder</button></div></div>`;
let total=c.students.reduce((a,s)=>{const k=counts(s.id);return {b:a.b+k.bonus,m:a.m+k.malus}}, {b:0,m:0});
const sizeLabel={s:'Petites',m:'Moyennes',l:'Grandes'}[sizeKey()];
return `${edtBanner()}<div class="panel tight"><div class="row"><select class="grow" onchange="currentClassId=this.value;render()">${data.classes.map(x=>`<option value="${x.id}" ${x.id===c.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select><button onclick="addClass()">➕ Classe</button><button onclick="openClassSettings()">⚙️</button></div>
<div class="chips"><span class="chip plus">+${total.b} bonus</span><span class="chip minus">−${total.m} malus</span><span class="chip">Solde ${total.b-total.m}</span><span class="chip">${c.students.length} élèves</span></div>
<div class="row" style="margin-top:8px"><input class="grow" style="min-width:150px" placeholder="🔎 Rechercher un élève…" value="${esc(search)}" oninput="onSearch(this.value)"><button onclick="todayOnly=!todayOnly;render()">${todayOnly?'📅 Aujourd’hui':'📊 Total'}</button><button onclick="sort=sort==='name'?'bonus':sort==='bonus'?'malus':'name';render()">↕️ ${sort==='name'?'Nom':sort==='bonus'?'Bonus':'Malus'}</button><button onclick="cycleSize()">🖼️ ${sizeLabel}</button></div>
<div class="row" style="margin-top:8px"><button class="primary" onclick="giveAll()">👥 Toute la classe</button><button class="primary" onclick="randomStudent()">🎲 Aléatoire</button><button onclick="undo()" ${lastEvents.length?'':'disabled'}>↩️ Annuler</button><button onclick="setTab('recap')">📊 Récap</button><button onclick="setTab('behaviors')">⭐ Bonus/malus</button><button onclick="openMore()">⋯ Plus</button></div></div>
${alertBanner()}<div id="studentGrid" class="grid students sz-${sizeKey()}">${studentsGrid(c)}</div>`}
function studentCard(s){
 if(sizeKey()==='l')return studentCardLarge(s);
 const k=counts(s.id);
 return `<article class="student compact"><div class="top" title="Appui long pour gérer l’élève" onpointerdown="startStudentPress(event,'${s.id}')" onpointerup="endStudentPress(event,'${s.id}')" onpointercancel="cancelStudentPress()" onpointerleave="cancelStudentPress()" oncontextmenu="return false"><div class="avatar" style="background:${avatarColor(s.name)}">${s.photo?`<img src="${s.photo}" alt="" loading="lazy" decoding="async">`:initials(s.name)}</div><div class="info"><h3>${esc(s.name)}</h3><div class="score"><span class="plus">+${k.bonus}</span><span class="minus">−${k.malus}</span></div></div></div><div class="actions"><button class="bplus" onclick="chooseBehavior('${s.id}','bonus')">➕ Bonus</button><button class="bminus" onclick="chooseBehavior('${s.id}','malus')">➖ Malus</button></div></article>`}
function studentCardLarge(s){const k=counts(s.id);return `<article class="student"><div class="avatar" title="Appui long pour gérer l’élève" style="background:${avatarColor(s.name)}" onpointerdown="startStudentPress(event,'${s.id}')" onpointerup="endStudentPress(event,'${s.id}')" onpointercancel="cancelStudentPress()" onpointerleave="cancelStudentPress()" oncontextmenu="return false">${s.photo?`<img src="${s.photo}" alt="">`:initials(s.name)}</div><h3>${esc(s.name)}</h3><div class="score"><span class="plus">+${k.bonus}</span><span class="minus">-${k.malus}</span></div><div class="balance">Solde ${k.bonus-k.malus}</div><div class="actions"><button class="primary" onclick="chooseBehavior('${s.id}','bonus')">➕ Bonus</button><button onclick="chooseBehavior('${s.id}','malus')">➖ Malus</button></div></article>`}
function behaviorView(){return `<div class="panel"><div class="row"><div class="grow"><div class="section-title">Comportements</div><div class="small">Crée autant de catégories de bonus et de malus que nécessaire.</div></div><button class="primary" onclick="behaviorForm()">➕ Ajouter</button></div><div class="row" style="margin-top:10px"><button onclick="behaviorForm();document.getElementById('bType').value='bonus'">➕ Nouveau bonus</button><button onclick="behaviorForm();document.getElementById('bType').value='malus'">➖ Nouveau malus</button></div></div>${['bonus','malus'].map(type=>`<div class="panel"><div class="section-title">${type==='bonus'?'🟢 Bonus':'🔴 Malus'}</div>${data.behaviors.filter(b=>b.type===type).map(b=>`<div class="behavior ${type}"><span class="emoji">${b.emoji}</span><span class="grow">${esc(b.label)}</span><button onclick="behaviorForm('${b.id}')">✏️</button><button class="danger" onclick="deleteBehavior('${b.id}')">🗑️</button></div>`).join('')}</div>`).join('')}`}
function dataView(){const c=currentClass();return `<div class="panel"><div class="section-title">🔐 Mot de passe & mode classe</div><p class="small">${data.lock&&data.lock.hash?"Mot de passe activé.":"Aucun mot de passe : l’appli s’ouvre sans protection."}</p><div class="row"><button class="primary" onclick="lockSettings()">🔐 ${data.lock&&data.lock.hash?"Gérer le mot de passe":"Créer un mot de passe"}</button><button onclick="openSettings()">⚙️ Autres réglages</button></div></div><div class="panel"><div class="section-title">💾 Base de données</div><p class="small">Sauvegarde toute la base de l’application dans un fichier JSON pour la transférer sur un autre appareil.</p><div class="row"><button class="primary" onclick="backup()">💾 Sauvegarder la base</button><button onclick="importDatabase()">📥 Importer une base</button><button onclick="copyCSV()">📋 Copier CSV</button><button onclick="window.print()">🖨️ Imprimer</button></div></div><div class="panel"><div class="section-title">🗄️ Stockage</div><p class="small" id="storageInfo">Calcul…</p></div><div class="panel"><div class="section-title">📊 Classe active</div>${c?`<p><b>${esc(c.name)}</b> · ${c.students.length} élèves</p>`:'<p class="small">Aucune classe active.</p>'}</div><div class="panel"><div class="section-title">🚨 Alertes vie scolaire</div>${data.alerts.length?data.alerts.slice().reverse().slice(0,20).map(a=>`<div class="row" style="padding:7px 0;border-bottom:1px solid var(--line)"><span class="grow"><b>${esc(a.studentName)}</b> · ${esc(a.className)}<br><span class="small">${new Date(a.date).toLocaleString('fr-FR')}</span></span><button onclick="showAlert(data.alerts.find(x=>x.id==='${a.id}'))">Voir</button></div>`).join(''):`<p class="small">Aucune alerte pour le moment.</p>`}</div><div class="panel"><div class="section-title">📱 Installation sur iPad</div><p>Dans Safari : <b>Partager → Sur l’écran d’accueil</b>. Une fois installée, l’application peut continuer à fonctionner hors connexion après son premier chargement.</p><p class="small">Pour une vraie installation PWA, l’adresse du site doit être en HTTPS.</p></div><div class="panel danger-zone"><div class="section-title">⚠️ Zone sensible</div><button class="danger" onclick="wipe()">Tout effacer</button></div>`}
function reportsView(){
 const reports=data.alerts.slice().reverse();
 return `<div class="panel"><div class="row"><div class="grow"><div class="section-title">📋 Rapports de dépassement de malus</div><div class="small">Tous les rapports restent accessibles ici, même après leur consultation.</div></div><button onclick="setTab('class')">👥 Élèves</button></div></div>${reports.length?reports.map(a=>`<div class="panel"><div class="row"><span style="font-size:28px">🚨</span><span class="grow"><b>${esc(a.studentName)}</b> · ${esc(a.className)}<br><span class="small">${esc(dateFR(a.date))} · 5 malus consécutifs</span></span>${a.viewed?'':'<span class="small">Nouveau</span>'}</div><div class="row" style="margin-top:10px"><button class="primary grow" onclick="showAlert(data.alerts.find(x=>x.id==='${a.id}'))">👁️ Voir le rapport</button><button onclick="copyAlert('${a.id}')">📋 Copier</button><button class="danger" onclick="deleteAlert('${a.id}')">🗑️ Supprimer</button></div></div>`).join(''):`<div class="panel empty"><div style="font-size:42px">📋</div><h2>Aucun rapport</h2><p>Les rapports apparaîtront ici après chaque palier de 5 malus.</p></div>`}`;
}

let recapPeriod='total',recapDetail=false,recapSort='name',recapDir=1;
function recapRows(c){
 const evs=data.events.filter(e=>e.classId===c.id&&!e.cleared&&(recapPeriod!=='today'||isToday(e.date)));
 const cols=[],seen={};
 evs.forEach(e=>{const k=e.type+'|'+e.label;if(!seen[k]){seen[k]={key:k,type:e.type,label:e.label,emoji:e.emoji};cols.push(seen[k])}});
 cols.sort((x,y)=>(x.type===y.type?x.label.localeCompare(y.label,'fr'):(x.type==='bonus'?-1:1)));
 const rows=c.students.map(st=>{
  const mine=evs.filter(e=>e.studentId===st.id),by={};
  mine.forEach(e=>{const k=e.type+'|'+e.label;by[k]=(by[k]||0)+1});
  const b=mine.filter(e=>e.type==='bonus').length,m=mine.length-b;
  return {id:st.id,name:st.name,b,m,solde:b-m,by};
 });
 const dir=recapDir;
 rows.sort((x,y)=>recapSort==='name'?dir*x.name.localeCompare(y.name,'fr'):(dir*(y[recapSort]-x[recapSort])||x.name.localeCompare(y.name,'fr')));
 return {rows,cols};
}
function setRecapSort(k){if(recapSort===k)recapDir=-recapDir;else{recapSort=k;recapDir=1}render()}
function recapView(){
 const c=currentClass();
 if(!c)return `<div class="panel empty"><div style="font-size:45px">📊</div><h2>Aucune classe</h2><p>Crée ou importe une classe pour afficher le tableau récapitulatif.</p></div>`;
 const {rows,cols}=recapRows(c),T=rows.reduce((t,r)=>({b:t.b+r.b,m:t.m+r.m}),{b:0,m:0});
 const arrow=k=>recapSort===k?(recapDir===1?' ▲':' ▼'):'';
 const cell=(v,cls)=>v?`<span class="${cls||''}">${v}</span>`:'<span class="small">–</span>';
 const head=`<th onclick="setRecapSort('name')" style="cursor:pointer">Élève${arrow('name')}</th>`
  +(recapDetail?cols.map(x=>`<th title="${esc(x.label)}" class="${x.type==='bonus'?'plus':'minus'}"><span style="font-size:18px">${esc(x.emoji||'')}</span><br><span class="small">${esc(x.label)}</span></th>`).join(''):'')
  +`<th onclick="setRecapSort('b')" style="cursor:pointer" class="plus">🟢 Bonus${arrow('b')}</th><th onclick="setRecapSort('m')" style="cursor:pointer" class="minus">🔴 Malus${arrow('m')}</th><th onclick="setRecapSort('solde')" style="cursor:pointer">Solde${arrow('solde')}</th>`;
 const body=rows.map(r=>`<tr><td><b>${esc(r.name)}</b></td>`
  +(recapDetail?cols.map(x=>`<td>${cell(r.by[x.key]||0,x.type==='bonus'?'plus':'minus')}</td>`).join(''):'')
  +`<td>${cell(r.b,'plus')}</td><td>${cell(r.m,'minus')}</td><td><b>${r.solde>0?'+':''}${r.solde}</b></td></tr>`).join('');
 const foot=`<tr><td><b>Total classe</b></td>`+(recapDetail?cols.map(x=>`<td><b>${rows.reduce((n,r)=>n+(r.by[x.key]||0),0)}</b></td>`).join(''):'')+`<td><b class="plus">${T.b}</b></td><td><b class="minus">${T.m}</b></td><td><b>${T.b-T.m>0?'+':''}${T.b-T.m}</b></td></tr>`;
 return `<div class="panel"><div class="row"><div class="grow"><div class="section-title">📊 Récapitulatif · ${esc(c.name)}</div><div class="small">${rows.length} élève(s) · ${recapPeriod==='today'?'aujourd’hui':'total'} · noms uniquement, sans photos</div></div></div>
 <div class="row noprint" style="margin-top:10px"><select class="grow" onchange="currentClassId=this.value;render()">${data.classes.map(x=>`<option value="${x.id}" ${x.id===c.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select><button onclick="recapPeriod=recapPeriod==='total'?'today':'total';render()">${recapPeriod==='today'?'📅 Aujourd’hui':'📊 Total'}</button><button onclick="recapDetail=!recapDetail;render()">${recapDetail?'🔽 Masquer le détail':'🔎 Détail par comportement'}</button></div>
 <div class="row noprint" style="margin-top:9px"><button class="primary" onclick="copyRecapCSV()">📋 Copier (CSV)</button><button onclick="window.print()">🖨️ Imprimer</button><button onclick="resetType('bonus')">🟢 Bonus à zéro</button><button onclick="resetType('malus')">🔴 Malus à zéro</button></div></div>
 <div class="panel" style="padding:6px"><div style="overflow-x:auto"><table class="recap"><thead><tr>${head}</tr></thead><tbody>${body||`<tr><td colspan="9" class="small">Aucun élève dans cette classe.</td></tr>`}</tbody><tfoot>${foot}</tfoot></table></div></div>`;
}
function recapCSVText(c){
 const {rows,cols}=recapRows(c),q=v=>`"${String(v).replaceAll('"','""')}"`;
 let out=['Élève'].concat(recapDetail?cols.map(x=>(x.type==='bonus'?'+ ':'- ')+x.label):[],['Bonus','Malus','Solde']).map(q).join(';')+'\n';
 rows.forEach(r=>{out+=[q(r.name)].concat(recapDetail?cols.map(x=>r.by[x.key]||0):[],[r.b,r.m,r.solde]).join(';')+'\n'});
 return out;
}
function copyRecapCSV(){
 const c=currentClass();if(!c)return;const out=recapCSVText(c);
 const fallback=()=>openModal(`<h2>Récapitulatif CSV</h2><textarea rows="12">${esc(out)}</textarea><button style="width:100%;margin-top:8px" onclick="closeModal()">Fermer</button>`);
 try{navigator.clipboard.writeText(out).then(()=>toast('Tableau copié (CSV)')).catch(fallback)}catch(e){fallback()}
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
function studentById(id){for(const c of data.classes){const st=c.students.find(x=>x.id===id);if(st)return st}return null}
function pickButtons(list,fn){return list.map(b=>`<button class="pickbtn ${b.type}" onclick="${fn}('${b.id}')"><span class="emoji">${b.emoji}</span><span>${esc(b.label)}</span></button>`).join('')}
function chooseBehavior(studentId,type){const bs=data.behaviors.filter(b=>b.type===type),st=studentById(studentId);openModal(`<h2 style="margin-bottom:10px">${type==='bonus'?'➕ Bonus':'➖ Malus'} · ${esc(st?st.name:'')}</h2><div class="pick">${bs.map(b=>`<button class="pickbtn ${type}" onclick="applyBehavior('${studentId}','${b.id}')"><span class="emoji">${b.emoji}</span><span>${esc(b.label)}</span></button>`).join('')}</div><button style="width:100%;margin-top:10px" onclick="closeModal()">Annuler</button>`) }
function applyBehavior(studentId,behaviorId){const b=data.behaviors.find(x=>x.id===behaviorId),c=currentClass();if(!b||!c)return;const e={id:uid(),studentId,classId:c.id,behaviorId,type:b.type,label:b.label,emoji:b.emoji,date:new Date().toISOString()};data.events.push(e);lastEvents=[e.id];let alert=null;if(b.type==='malus')alert=checkAlert(studentId);playSound(alert?'alert':(b.type==='bonus'?'bonus':'malus'));save();closeModal();render();if(alert){showAlert(alert)}else{toast(`${b.emoji} ${b.label}`)}}
function giveAll(){const c=currentClass();if(!c||!c.students.length)return toast('Aucun élève');const bon=data.behaviors.filter(b=>b.type==='bonus'),mal=data.behaviors.filter(b=>b.type==='malus');openModal(`<h2 style="margin-bottom:10px">👥 Toute la classe · ${esc(c.name)}</h2><div class="section-title">➕ Bonus</div><div class="pick">${pickButtons(bon,'applyAll')}</div><div class="section-title" style="margin-top:12px">➖ Malus</div><div class="pick">${pickButtons(mal,'applyAll')}</div><button style="width:100%;margin-top:10px" onclick="closeModal()">Annuler</button>`) }
function applyAll(behaviorId){const b=data.behaviors.find(x=>x.id===behaviorId),c=currentClass();if(!b||!c)return;lastEvents=[];const now=new Date().toISOString();let alerts=[];c.students.forEach(s=>{const e={id:uid(),studentId:s.id,classId:c.id,behaviorId:b.id,type:b.type,label:b.label,emoji:b.emoji,date:now};data.events.push(e);lastEvents.push(e.id);if(b.type==='malus'){const a=checkAlert(s.id);if(a)alerts.push(a)}});playSound(alerts.length?'alert':(b.type==='bonus'?'bonus':'malus'));save();closeModal();render();if(alerts.length===1)showAlert(alerts[0]);else toast(`${b.emoji} appliqué à ${c.students.length} élèves${alerts.length?` · 🚨 ${alerts.length} alerte(s)`:''}`)}
function consecutiveMalus(studentId){
 // Tous les malus de l'élève s'additionnent : les bonus n'interrompent jamais la série.
 return data.events.filter(e=>e.studentId===studentId&&e.type==='malus'&&!e.cleared).sort((a,b)=>new Date(a.date)-new Date(b.date));
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
function dateFR(d){return new Date(d).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
function showAlert(alert){
 if(!alert)return;
 if(!alert.viewed){alert.viewed=true;save();render();}
 const items=(alert.items||[]).map((x,i)=>`<div class="checkrow"><span style="font-size:20px">${x.emoji||'🔴'}</span><span class="grow"><b>${i+1}. ${esc(x.label)}</b><br><span class="small">${esc(dateFR(x.date))}</span></span></div>`).join('');
 openModal(`<div style="text-align:center;padding:8px 0 14px"><div style="font-size:42px">🚨</div><h2 style="margin:4px 0">Alerte : 5 malus atteints</h2><p><b>${esc(alert.studentName)}</b> · ${esc(alert.className)}</p><p class="small">Un rapport récapitulatif a été créé.</p></div><div class="panel" style="margin:0 0 12px"><div class="section-title">Rapport des 5 derniers malus</div>${items}</div><div class="row"><button class="primary grow" onclick="copyAlert('${alert.id}')">📋 Copier le rapport</button><button onclick="closeModal()">Fermer</button></div>`);
}
function alertBanner(){
 const recent=data.alerts.filter(a=>a.className===currentClass()?.name&&!a.viewed).slice(-3).reverse();
 if(!recent.length)return '';
 return `<div class="panel" style="border:2px solid rgba(220,38,38,.35);background:rgba(220,38,38,.06)"><div class="section-title">🚨 Alertes récentes</div>${recent.map(a=>`<div class="row" style="margin:6px 0"><span class="grow"><b>${esc(a.studentName)}</b> · ${esc(dateFR(a.date))}</span><button onclick="showAlert(data.alerts.find(x=>x.id==='${a.id}'))">Voir le rapport</button></div>`).join('')}</div>`;
}
function deleteAlert(id){
 const a=data.alerts.find(x=>x.id===id); if(!a)return;
 if(!confirm(`Supprimer le rapport de ${a.studentName} ?`))return;
 data.alerts=data.alerts.filter(x=>x.id!==id);
 save(); render(); toast('Rapport supprimé');
}
function copyAlert(id){
 const a=data.alerts.find(x=>x.id===id); if(!a)return;
 const items=(a.items||[]).slice(-5);
 const text=`RAPPORT — 5 MALUS CONSÉCUTIFS\nÉlève : ${a.studentName}\nClasse : ${a.className}\nDate du rapport : ${dateFR(a.date)}\n\n${a.studentName} a reçu 5 malus. Voici le détail de ces 5 malus :\n\n${items.map((x,i)=>`${i+1}. ${x.label} — ${dateFR(x.date)}`).join('\n')}`;
 if(navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(()=>toast('Rapport copié')).catch(()=>fallbackCopy(text)); else fallbackCopy(text);
}
function fallbackCopy(text){openModal(`<h2>Rapport</h2><textarea rows="12">${esc(text)}</textarea><button style="width:100%;margin-top:8px" onclick="closeModal()">Fermer</button>`);}

function undo(){if(!lastEvents.length)return;data.events=data.events.filter(e=>!lastEvents.includes(e.id));lastEvents=[];save();render();toast('Dernière action annulée')}
function studentMenu(id){const s=currentClass().students.find(x=>x.id===id);openModal(`<h2>${esc(s.name)}</h2><input id="newName" value="${esc(s.name)}"><div class="row" style="margin-top:9px"><button class="primary" onclick="renameStudent('${id}')">Renommer</button><label class="grow"><button style="width:100%" onclick="document.getElementById('photoInput').click()">📷 Photo</button><input id="photoInput" type="file" accept="image/*" style="display:none" onchange="setPhoto('${id}',this.files[0])"></label></div><button class="danger" style="width:100%;margin-top:8px" onclick="removeStudent('${id}')">🗑️ Supprimer l’élève</button><button style="width:100%;margin-top:8px" onclick="closeModal()">Fermer</button>`)}
function renameStudent(id){const s=currentClass().students.find(x=>x.id===id);s.name=document.getElementById('newName').value.trim()||s.name;save();closeModal();render()}
function removeStudent(id){if(!confirm('Supprimer cet élève et son historique ?'))return;const c=currentClass();c.students=c.students.filter(s=>s.id!==id);data.events=data.events.filter(e=>e.studentId!==id);save();closeModal();render()}
let studentPressTimer=null,studentPressFired=false;function startStudentPress(e,id){if(e.pointerType==='mouse'&&e.button!==0)return;studentPressFired=false;clearTimeout(studentPressTimer);studentPressTimer=setTimeout(()=>{studentPressFired=true;navigator.vibrate?.(30);studentMenu(id)},550)}function endStudentPress(e,id){clearTimeout(studentPressTimer);if(studentPressFired)e.preventDefault()}function cancelStudentPress(){clearTimeout(studentPressTimer)}
function setPhoto(id,file){if(!file)return;const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const W=360,H=480,can=document.createElement('canvas');can.width=W;can.height=H;const target=W/H,src=img.width/img.height;let sw,sh,sx,sy;if(src>target){sh=img.height;sw=sh*target;sx=(img.width-sw)/2;sy=Math.max(0,(img.height-sh)*0.28)}else{sw=img.width;sh=sw/target;sx=Math.max(0,(img.width-sw)*0.5);sy=0}const ctx=can.getContext('2d');ctx.drawImage(img,sx,sy,sw,sh,0,0,W,H);const s=currentClass().students.find(x=>x.id===id);s.photo=can.toDataURL('image/jpeg',.82);save();closeModal();render();toast('Photo enregistrée')};img.src=r.result};r.readAsDataURL(file)}
function openClassSettings(){const c=currentClass();openModal(`<h2>Classe</h2><input id="className" value="${esc(c.name)}"><div class="row" style="margin-top:9px"><button class="primary" onclick="renameClass()">Renommer</button></div><div class="section-title" style="margin-top:14px">Remise à zéro</div><div class="row" style="margin-top:6px"><button class="grow" onclick="resetType('bonus')">🟢 Remettre les bonus à zéro</button><button class="grow" onclick="resetType('malus')">🔴 Remettre les malus à zéro</button></div><button class="danger" style="width:100%;margin-top:8px" onclick="resetClass()">♻️ Tout remettre à zéro (bonus + malus)</button><button class="danger" style="width:100%;margin-top:8px" onclick="deleteClass()">Supprimer la classe</button><button style="width:100%;margin-top:8px" onclick="closeModal()">Fermer</button>`) }
function renameClass(){const c=currentClass();c.name=document.getElementById('className').value.trim()||c.name;save();closeModal();render()}
function classAlertFilter(c){const ids=new Set(c.students.map(x=>x.id));return a=>!(ids.has(a.studentId)||a.className===c.name)}
function resetType(type){
 const c=currentClass();if(!c)return;
 const label=type==='bonus'?'bonus':'malus',other=type==='bonus'?'malus':'bonus';
 const n=data.events.filter(e=>e.classId===c.id&&e.type===type&&!e.cleared).length;
 if(!n)return toast(`Aucun ${label} à remettre à zéro dans ${c.name}`);
 if(!confirm(`Remettre à zéro les ${n} ${label} de la classe ${c.name} ?\n\nLes ${other} sont conservés. Pense à sauvegarder la base avant : cette action est définitive.`))return;
 if(type==='bonus'){data.events=data.events.filter(e=>!(e.classId===c.id&&e.type==='bonus'))}
 else{data.events=data.events.filter(e=>!(e.classId===c.id&&e.type==='malus'));data.alerts=data.alerts.filter(classAlertFilter(c))}
 lastEvents=[];save();closeModal();render();toast(`${n} ${label} remis à zéro · les ${other} sont conservés`);
}
function resetClass(){if(!confirm('Effacer TOUS les bonus ET les malus de cette classe ? Cette action est définitive.'))return;const c=currentClass();data.events=data.events.filter(e=>e.classId!==c.id);data.alerts=data.alerts.filter(classAlertFilter(c));lastEvents=[];save();closeModal();render();toast('Compteurs réinitialisés')}
function deleteClass(){if(!confirm('Supprimer définitivement cette classe ?'))return;const id=currentClass().id;data.classes=data.classes.filter(c=>c.id!==id);data.events=data.events.filter(e=>e.classId!==id);currentClassId=data.classes[0]?.id||null;save();closeModal();render()}
function behaviorForm(id){const b=id?data.behaviors.find(x=>x.id===id):null;openModal(`<h2>${b?'Modifier':'Nouveau'} comportement</h2><select id="bType"><option value="bonus" ${b?.type==='bonus'?'selected':''}>Bonus</option><option value="malus" ${b?.type==='malus'?'selected':''}>Malus</option></select><input id="bEmoji" value="${esc(b?.emoji||'⭐')}" placeholder="Emoji"><input id="bLabel" value="${esc(b?.label||'')}" placeholder="Libellé"><button class="primary" style="width:100%;margin-top:8px" onclick="saveBehavior('${id||''}')">Enregistrer</button><button style="width:100%;margin-top:8px" onclick="closeModal()">Annuler</button>`) }
function saveBehavior(id){const type=document.getElementById('bType').value,emoji=document.getElementById('bEmoji').value.trim()||'⭐',label=document.getElementById('bLabel').value.trim();if(!label)return toast('Indique un libellé');if(id){const b=data.behaviors.find(x=>x.id===id);Object.assign(b,{type,emoji,label})}else data.behaviors.push({id:uid(),type,emoji,label});save();closeModal();render()}
function deleteBehavior(id){if(!confirm('Supprimer ce comportement ? L’historique déjà enregistré sera conservé.'))return;data.behaviors=data.behaviors.filter(b=>b.id!==id);save();render()}
function openSettings(){openModal(`<h2>Réglages</h2><select onchange="data.theme=this.value;save();render()"><option value="automatic" ${data.theme==='automatic'?'selected':''}>Automatique</option><option value="light" ${data.theme==='light'?'selected':''}>Clair</option><option value="dark" ${data.theme==='dark'?'selected':''}>Sombre</option></select><label class="row" style="margin:12px 0"><input type="checkbox" style="width:auto" ${data.soundOn===false?'':'checked'} onchange="data.soundOn=this.checked;save()"><span class="grow">🔊 Sons (bonus, malus, alarme)</span></label><div class="row"><button onclick="unlockAudio();const k=data.soundOn;data.soundOn=true;playSound('bonus');data.soundOn=k">▶️ Bonus</button><button onclick="unlockAudio();const k=data.soundOn;data.soundOn=true;playSound('malus');data.soundOn=k">▶️ Malus</button><button onclick="unlockAudio();const k=data.soundOn;data.soundOn=true;playSound('alert');data.soundOn=k">▶️ Alarme</button></div><p class="small">Si tu n’entends rien : monte le volume de l’iPad et vérifie que le mode silencieux est désactivé (centre de contrôle).</p><button style="width:100%;margin:6px 0" onclick="checkUpdate(true)">🔄 Rechercher une mise à jour (version ${APP_VERSION})</button><button style="width:100%;margin:6px 0 10px" onclick="lockSettings()">🔐 Mot de passe & mode classe${data.lock&&data.lock.hash?' (activé)':''}</button><p class="small">Les données sont stockées localement dans le navigateur de l’iPad.</p><button style="width:100%" onclick="closeModal()">Fermer</button>`) }
function toggleTheme(){data.theme=data.theme==='automatic'?'dark':data.theme==='dark'?'light':'automatic';save();render()}
function backup(){
 const exportData=JSON.parse(JSON.stringify(data));
 exportData._format='suivi-classe';
 exportData._version=26;
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
function wipe(){if(!confirm('Effacer toutes les classes, élèves et historiques ?'))return;data={classes:[],behaviors:DEFAULT_BEHAVIORS,events:[],alerts:[],theme:'automatic',...(data.lock?{lock:data.lock}:{})};currentClassId=null;blockSave=false;save();render()}
let toastTimer=null;function toast(msg,ms=2200){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),ms)}
// ===== V19 : LIEN AVEC LE MODULE « PROGRESSION » (emploi du temps, séance précédente, devoirs) =====
// L'appli s'ouvre sur la classe du cours en cours (ou du prochain), d'après l'emploi du temps saisi dans progression.html.
let edt=null,edtFocus=null,edtAutoKey='',edtManual=false;
function edtPad(n){return String(n).padStart(2,'0')}
function edtYmd(d){return d.getFullYear()+'-'+edtPad(d.getMonth()+1)+'-'+edtPad(d.getDate())}
function edtParse(s){const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)}
function edtAdd(s,n){const d=edtParse(s);d.setDate(d.getDate()+n);return edtYmd(d)}
function edtMin(t){const[h,m]=String(t).split(':').map(Number);return h*60+(m||0)}
function edtT(t){const[h,m]=String(t).split(':');return Number(h)+'h'+m}
function edtNorm(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'').replace(/^(\d)e(?=[a-z])/,'$1').replace(/^(\d)eme/,'$1')}
function edtWeekKey(date){const d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));const day=d.getUTCDay()||7;d.setUTCDate(d.getUTCDate()+4-day);const y=d.getUTCFullYear();const w=Math.ceil(((d-Date.UTC(y,0,1))/864e5+1)/7);return{key:y+'-W'+edtPad(w),w}}
function edtWeekType(s){const d=edtParse(s),k=edtWeekKey(d),c=edt.config;if(c.weekMap&&c.weekMap[k.key])return c.weekMap[k.key];const m=d.getMonth();if(m===7||(m===6&&d.getDate()>4))return 'F';return k.w%2===0?'Q1':'Q2'}
function edtSlots(s){
 // même logique que progression.html : l'iCal Pronote (s'il est importé) remplace l'emploi du temps type sur sa période
 const c=edt.config,d=edtParse(s),wd=d.getDay();if(wd===0||wd===6)return[];
 const wt=edtWeekType(s),staticOff=wt==='F'||(c.feries||[]).includes(s),out=[],ics=c.ics||{};
 for(const e of(c.etabs||[])){
  const x=ics[e.id];
  if(x&&Array.isArray(x.events)&&x.from&&s>=x.from&&s<=x.to){
   x.events.forEach(v=>{if(v.d===s&&!v.x&&edtClass(v.c))out.push({id:'ics~'+s+'~'+v.s+'~'+v.c,day:wd,start:v.s,end:v.e,classId:v.c,weeks:'all'})});
  }else if(!staticOff){
   (c.slots||[]).forEach(x=>{const k=edtClass(x.classId);if(k&&k.etab===e.id&&x.day===wd&&(x.weeks==='all'||x.weeks===wt))out.push(x)});
  }
 }
 return out.sort((a,b)=>edtMin(a.start)-edtMin(b.start));
}
function edtClass(id){return(edt.config.classes||[]).find(c=>c.id===id)}
function edtEtab(id){return(edt.config.etabs||[]).find(e=>e.id===id)||{short:'',color:'#64748b'}}
function edtNow(){
 const t=edtYmd(new Date()),n=new Date(),m=n.getHours()*60+n.getMinutes(),l=edtSlots(t);
 const before=Math.max(10,Number(edt.config.notify&&edt.config.notify.minutesBefore)||5);
 let s=l.find(x=>m>=edtMin(x.start)-before&&m<edtMin(x.end));if(s)return{date:t,slot:s,live:m>=edtMin(s.start)};
 s=l.find(x=>edtMin(x.start)>m);if(s)return{date:t,slot:s};
 for(let k=1;k<=60;k++){const d=edtAdd(t,k),l2=edtSlots(d);if(l2.length)return{date:d,slot:l2[0]}}
 return null;
}
function edtNeighbor(o,dir){const l=edtSlots(o.date),i=l.findIndex(x=>x.id===o.slot.id);if(i>=0&&l[i+dir])return{date:o.date,slot:l[i+dir]};for(let k=1;k<=60;k++){const d=edtAdd(o.date,dir*k),l2=edtSlots(d);if(l2.length)return{date:d,slot:dir>0?l2[0]:l2[l2.length-1]}}return null}
function edtSuiviClass(pc){
 if(!pc)return null;
 if(pc.suiviId){const c=data.classes.find(x=>x.id===pc.suiviId);if(c)return c}
 const keys=[edtNorm(pc.name),edtNorm(pc.label)];
 return data.classes.find(c=>keys.includes(edtNorm(c.name)))||data.classes.find(c=>{const n=edtNorm(c.name);return keys.some(k=>k.length>2&&(n.startsWith(k)||k.startsWith(n)))})||null;
}
function edtLoad(){return new Promise(res=>{
 let r;try{r=indexedDB.open('progression-classe-db')}catch(e){return res(null)}
 r.onupgradeneeded=()=>{try{r.transaction.abort()}catch(_){}res(null)};
 r.onsuccess=()=>{const db=r.result;if(!db.objectStoreNames.contains('kv')){db.close();return res(null)}const q=db.transaction('kv','readonly').objectStore('kv').get('data');q.onsuccess=()=>{db.close();res(q.result||null)};q.onerror=()=>{db.close();res(null)}};
 r.onerror=()=>res(null);
})}
async function edtAutoSelect(reason){
 try{edt=await edtLoad()}catch(e){edt=null}
 if(!edt||!edt.config)return;
 const p=new URLSearchParams(location.search);
 if(reason==='start'&&p.get('classe')){
  const pc=edtClass(p.get('classe'));
  if(pc){const t=edtYmd(new Date());const sl=edtSlots(t).find(x=>x.classId===pc.id);edtFocus=sl?{date:t,slot:sl}:{date:t,slot:{id:'v',classId:pc.id,start:'',end:''}};const sc=edtSuiviClass(pc);if(sc)currentClassId=sc.id;edtManual=true;try{history.replaceState(null,'',location.pathname)}catch(_){}return}
 }
 const o=edtNow();if(!o)return;
 const key=o.date+'|'+o.slot.id;
 if(reason==='start'||key!==edtAutoKey){
  edtAutoKey=key;edtFocus=o;edtManual=false;
  const sc=edtSuiviClass(edtClass(o.slot.classId));if(sc)currentClassId=sc.id;
  if(reason!=='start'&&tab==='class'&&!document.getElementById('modal').classList.contains('show'))render();
 }
}
function edtMove(dir){if(!edtFocus||!edtFocus.slot.start)return;const n=edtNeighbor(edtFocus,dir);if(!n)return toast('Aucun autre cours');edtFocus=n;edtManual=true;const sc=edtSuiviClass(edtClass(n.slot.classId));if(sc)currentClassId=sc.id;else toast('Classe non reliée : choisis-la dans Progression › Réglages › Classes',4500);render()}
function edtBack(){edtAutoKey='';edtAutoSelect('resume').then(render)}
function edtBanner(){
 if(!edt||!edtFocus)return `<div class="panel tight noprint" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="small grow">📅 Relie l’emploi du temps pour ouvrir automatiquement la bonne classe et voir la séance précédente.</span><button onclick="goProgression('progression.html')">📅 Progression</button></div>`;
 const pc=edtClass(edtFocus.slot.classId);if(!pc)return '';
 const e=edtEtab(pc.etab),d=edtFocus.date,t=edtYmd(new Date());
 const ses=(edt.sessions||[]).filter(s=>s.classId===pc.id&&!s.skipped);
 const prev=ses.filter(s=>s.date<d).sort((a,b)=>a.date<b.date?1:-1)[0];
 let due=ses.filter(s=>s.devoirsPour===d&&s.date<d&&(s.devoirs||'').trim());
 if(!due.length&&prev&&(prev.devoirs||'').trim()&&(!prev.devoirsPour||prev.devoirsPour>=d))due=[prev];
 const sc=edtSuiviClass(pc);
 const when=d===t?(edtFocus.live?'● En cours':'Aujourd’hui'):edtParse(d).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'short'});
 const short=s=>esc(String(s||'').length>160?String(s).slice(0,157)+'…':s||'');
 return `<div class="panel tight noprint" style="border-left:6px solid ${e.color}">
 <div class="row" style="justify-content:space-between"><button onclick="edtMove(-1)" ${edtFocus.slot.start?'':'disabled'}>◀ Cours précédent</button><div style="text-align:center"><div style="font-weight:800;font-size:17px">${esc(pc.label)} <span class="small">${esc(e.short)}</span></div><div class="small">${esc(when)}${edtFocus.slot.start?' · '+edtT(edtFocus.slot.start)+'–'+edtT(edtFocus.slot.end):''}${edtManual?` · <a href="#" onclick="edtBack();return false">revenir au cours actuel</a>`:''}</div></div><button onclick="edtMove(1)" ${edtFocus.slot.start?'':'disabled'}>Cours suivant ▶</button></div>
 ${sc?'':`<div class="small" style="margin-top:6px;color:var(--bad)">Cette classe n’est pas reliée à une classe de Suivi : Progression › Réglages › Établissements & classes.</div>`}
 <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:8px;margin-top:8px">
  <div style="border:1px solid var(--line);border-radius:14px;padding:9px 11px"><div class="small" style="font-weight:800">⏮ SÉANCE PRÉCÉDENTE${prev?' · '+esc(edtParse(prev.date).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})):''}</div><div style="margin-top:3px">${prev?(prev.title?'<b>'+esc(prev.title)+'</b> — ':'')+short(prev.contenu):'<span class="small">Aucune séance saisie</span>'}</div></div>
  <div style="border:1px solid rgba(79,70,229,.35);background:rgba(79,70,229,.07);border-radius:14px;padding:9px 11px"><div class="small" style="font-weight:800">📒 TRAVAIL POUR CETTE SÉANCE</div><div style="margin-top:3px">${due.length?due.map(s=>short(s.devoirs)).join('<br>'):'<span class="small">Rien de prévu</span>'}</div></div>
 </div>
 <div class="row" style="margin-top:8px"><button class="primary" onclick="goProgression('progression.html?classe=${encodeURIComponent(pc.id)}&date=${d}&saisir=1')">🎤 Fin de cours : dicter la séance</button><button onclick="goProgression('progression.html?classe=${encodeURIComponent(pc.id)}&date=${d}')">📅 Détails & historique</button></div>
 </div>`;
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')edtAutoSelect('resume')});
setInterval(()=>{if(document.visibilityState==='visible')edtAutoSelect('tick')},60000);
// ===== V22 : MOT DE PASSE & MODE CLASSE (voir verrou.js) =====
// Sur la page Élèves, seules les fonctions de cours restent libres. Tout le reste passe par Verrou.requireAdmin().
const _orig={setTab,openSettings,openMore,addClass,openClassSettings,studentMenu,behaviorForm,addStudents,backup,importDatabase,wipe};
function guarded(name,label){return function(...a){Verrou.requireAdmin(()=>_orig[name].apply(this,a),label)}}
setTab=function(t){if(t==='class')return _orig.setTab(t);Verrou.requireAdmin(()=>_orig.setTab(t),({behaviors:'Comportements',recap:'Tableau récap',reports:'Rapports',data:'Données'})[t]||'')};
openSettings=function(){Verrou.requireAdmin(()=>_orig.openSettings(),'Réglages')};
openMore=guarded('openMore','Plus d’actions');addClass=guarded('addClass','Nouvelle classe');openClassSettings=guarded('openClassSettings','Réglages de la classe');
studentMenu=guarded('studentMenu','Fiche élève');behaviorForm=guarded('behaviorForm','Comportements');addStudents=guarded('addStudents','Ajouter des élèves');
backup=guarded('backup','Sauvegarde');importDatabase=guarded('importDatabase','Import');wipe=guarded('wipe','Effacer');
function goProgression(url){Verrou.requireAdmin(()=>{flushSave();location.href=url||'progression.html'},'Progression')}
function lockClassMode(){Verrou.lockNow();closeModal();_orig.setTab('class');toast('🔒 Mode classe : seuls les bonus et malus sont accessibles',3500)}
function updateLockUI(){
 const tb=document.querySelector('.topbar');if(!tb)return;
 let b=document.getElementById('lockBtn');
 if(!Verrou.protectOn()){if(b)b.remove();document.getElementById('lockPill')?.remove();return}
 if(!b){b=document.createElement('button');b.id='lockBtn';(document.getElementById('topBtns')||tb).appendChild(b)}
 const admin=Verrou.isAdmin();
 b.textContent=admin?'🔓':'🔒';b.title=admin?'Repasser en mode classe':'Accès complet (mot de passe)';
 b.onclick=()=>admin?lockClassMode():Verrou.requireAdmin(()=>{toast('🔓 Accès complet');render()},'Accès complet');
 let p=document.getElementById('lockPill');
 if(admin){if(!p){p=document.createElement('button');p.id='lockPill';p.className='vr-pill noprint';p.onclick=lockClassMode;document.body.appendChild(p)}p.textContent='🔓 Accès complet · Verrouiller'}
 else if(p)p.remove();
}
const _render=render;render=function(){_render();updateLockUI()};
// fin d'accès complet (inactivité) : retour automatique en mode classe
let lastAdmin=null;
setInterval(()=>{if(!Verrou.protectOn())return;const a=Verrou.isAdmin();if(lastAdmin&&!a){closeModal();if(tab!=='class')_orig.setTab('class');else render();toast('🔒 Mode classe réactivé',3000)}lastAdmin=a;updateLockUI()},5000);

function lockSettings(){
 const L=data.lock&&data.lock.hash?data.lock:null;
 const num=(id,v,min,max)=>`<input id="${id}" type="number" min="${min}" max="${max}" value="${v}" style="width:90px">`;
 openModal(`<h2>🔐 Mot de passe</h2>
 ${L?`<p class="small">Mot de passe actif depuis le ${new Date(L.createdAt).toLocaleDateString('fr-FR')}.</p>`:'<p class="small">Protège l’appli : mot de passe à l’ouverture et « mode classe » sur la page Élèves (bonus/malus seulement).</p>'}
 ${L?'':`<input id="lkPw1" type="password" placeholder="Nouveau mot de passe (4 caractères minimum)" autocomplete="new-password" style="margin-top:6px"><input id="lkPw2" type="password" placeholder="Confirme le mot de passe" autocomplete="new-password" style="margin-top:8px">
 <p class="small">Astuce : un code uniquement en chiffres affiche le pavé numérique.</p>`}
 <label class="row" style="margin:10px 0"><input type="checkbox" id="lkStart" style="width:auto" ${!L||L.startup!==false?'checked':''}><span class="grow">Demander le mot de passe à l’ouverture de l’appli</span></label>
 <label class="row" style="margin:10px 0"><input type="checkbox" id="lkAdmin" style="width:auto" ${!L||L.protectAdmin!==false?'checked':''}><span class="grow">Mode classe : sur la page Élèves, tout sauf les bonus/malus demande le mot de passe</span></label>
 <div class="row" style="margin:8px 0"><span class="grow">Redemander le mot de passe après</span>${num('lkRelock',L?L.relockMin??5:5,0,240)}<span>min hors de l’appli</span></div>
 <div class="row" style="margin:8px 0"><span class="grow">Accès complet refermé après</span>${num('lkAdminMin',L?L.adminMin??5:5,1,120)}<span>min sans toucher l’écran</span></div>
 <div class="row" style="margin-top:12px"><button class="primary grow" onclick="saveLock()">${L?'💾 Enregistrer les options':'🔐 Activer le mot de passe'}</button></div>
 ${L?`<div class="row" style="margin-top:8px"><button class="grow" onclick="changeLockPw()">✏️ Changer le mot de passe</button><button class="grow" onclick="regenRecovery()">🛟 Nouveau code de secours</button></div><button class="danger" style="width:100%;margin-top:8px" onclick="removeLock()">🗑️ Supprimer le mot de passe</button>`:''}
 <button style="width:100%;margin-top:8px" onclick="closeModal()">Fermer</button>`);
}
function readLockOpts(){const g=id=>document.getElementById(id);return{startup:g('lkStart').checked,protectAdmin:g('lkAdmin').checked,relockMin:Math.max(0,Number(g('lkRelock').value)||0),adminMin:Math.max(1,Number(g('lkAdminMin').value)||5)}}
async function persistLock(){try{await persistNow()}catch(e){toast(explainStorageError(e),6000);return false}Verrou.setConfig(data.lock);Verrou.setAdmin(true);updateLockUI();return true}
async function saveLock(){
 const o=readLockOpts();
 if(data.lock&&data.lock.hash){data.lock={...data.lock,...o};if(await persistLock()){closeModal();toast('Options enregistrées ✅')}return}
 const a=document.getElementById('lkPw1').value,b=document.getElementById('lkPw2').value;
 if(a.length<4)return toast('4 caractères minimum');if(a!==b)return toast('Les deux mots de passe sont différents');
 const r=await Verrou.create(a,o);data.lock=r.cfg;
 if(await persistLock())showRecovery(r.recoveryCode,true);
}
function showRecovery(code,first){openModal(`<h2>🛟 Code de secours</h2><p>${first?'Mot de passe activé ✅. ':''}Note ce code et garde-le hors de l’iPad (carnet, téléphone) : il sert si tu oublies le mot de passe.</p><div style="font-size:34px;font-weight:900;letter-spacing:.12em;text-align:center;padding:16px;border:2px dashed var(--line);border-radius:18px;margin:12px 0">${code}</div><p class="small">Il ne sera plus affiché ensuite. Pense aussi à faire une sauvegarde de la base.</p><button class="primary" style="width:100%" onclick="closeModal()">C’est noté</button>`)}
function changeLockPw(){openModal(`<h2>✏️ Nouveau mot de passe</h2><input id="lkPw1" type="password" placeholder="Nouveau mot de passe" autocomplete="new-password"><input id="lkPw2" type="password" placeholder="Confirme" autocomplete="new-password" style="margin-top:8px"><div class="row" style="margin-top:12px"><button class="primary grow" onclick="confirmChangePw()">Enregistrer</button><button onclick="lockSettings()">Annuler</button></div>`)}
async function confirmChangePw(){const a=document.getElementById('lkPw1').value,b=document.getElementById('lkPw2').value;if(a.length<4)return toast('4 caractères minimum');if(a!==b)return toast('Les deux mots de passe sont différents');data.lock=await Verrou.changePassword(data.lock,a);if(await persistLock()){closeModal();toast('Mot de passe changé ✅')}}
async function regenRecovery(){if(!confirm('Créer un nouveau code de secours ? L’ancien ne fonctionnera plus.'))return;const r=await Verrou.newRecovery(data.lock);data.lock=r.cfg;if(await persistLock())showRecovery(r.recoveryCode,false)}
async function removeLock(){if(!confirm('Supprimer le mot de passe ? L’appli s’ouvrira sans protection.'))return;delete data.lock;if(await persistLock()){closeModal();toast('Mot de passe supprimé')}}
// conserve le mot de passe de l'iPad lors d'un import de sauvegarde ou d'un effacement
const _normImp=normalizeImportedData;normalizeImportedData=function(x){const out=_normImp(x);if(data&&data.lock&&data.lock.hash&&blockSave===false&&data.classes)out.lock=data.lock;return out};
// ===== V24 : détection des mises à jour =====
const APP_VERSION='V26';
async function checkUpdate(manual){
 try{
  const r=await fetch('version.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw 0;
  const v=(await r.json()).version;
  if(v&&v!==APP_VERSION){showUpdateBar(v);return}
  if(manual)toast('Tu as la dernière version ('+APP_VERSION+') ✅');
 }catch(e){if(manual)toast('Vérification impossible (pas de connexion ?)')}
}
function showUpdateBar(v){
 if(document.getElementById('updBar'))return;
 const d=document.createElement('div');d.id='updBar';d.className='noprint';
 d.style.cssText='position:fixed;left:12px;right:12px;top:calc(8px + env(safe-area-inset-top));z-index:9000;background:#4f46e5;color:#fff;border-radius:16px;padding:10px 14px;display:flex;gap:10px;align-items:center;box-shadow:0 8px 24px rgba(0,0,0,.25);font-weight:700';
 d.innerHTML='<span style="flex:1">🆕 Nouvelle version '+v+' disponible</span><button style="background:#fff;color:#4f46e5;border:0" onclick="applyUpdate()">Mettre à jour</button>';
 document.body.appendChild(d);
}
async function applyUpdate(){
 // Installe la nouvelle version : on retire l'ancien service worker et ses fichiers (jamais les données élèves), puis on recharge.
 try{flushSave()}catch(_){}
 const bar=document.getElementById('updBar');if(bar)bar.querySelector('span').textContent='⏳ Mise à jour en cours…';
 try{await persistNow()}catch(_){}
 try{const regs=await navigator.serviceWorker?.getRegistrations()||[];await Promise.all(regs.map(r=>r.unregister()))}catch(_){}
 try{const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)))}catch(_){}
 location.replace(location.pathname+'?v='+Date.now());
}
setTimeout(()=>checkUpdate(false),2500);
setInterval(()=>{if(document.visibilityState==='visible')checkUpdate(false)},10*60000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkUpdate(false)});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
init().catch(e=>console.error(e)).then(()=>{Verrou.boot(data.lock,{onChange:()=>{try{updateLockUI()}catch(_){}},afterUnlock:r=>{if(r&&r.recovery){toast('Code de secours accepté : choisis un nouveau mot de passe',5000);changeLockPw()}}})});
