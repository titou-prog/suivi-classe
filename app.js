const KEY='suivi-classe-v1';
const DEFAULT_BEHAVIORS=[
 {id:crypto.randomUUID(),type:'bonus',emoji:'🙋',label:"Participe à l'oral"},{id:crypto.randomUUID(),type:'bonus',emoji:'🤝',label:'Aide un camarade'},{id:crypto.randomUUID(),type:'bonus',emoji:'🎵',label:'Très bon travail'},{id:crypto.randomUUID(),type:'bonus',emoji:'✅',label:'Matériel prêt'},
 {id:crypto.randomUUID(),type:'malus',emoji:'🗣️',label:'Parle sans lever la main'},{id:crypto.randomUUID(),type:'malus',emoji:'📵',label:'Téléphone sorti'},{id:crypto.randomUUID(),type:'malus',emoji:'🎒',label:'Oubli de matériel'},{id:crypto.randomUUID(),type:'malus',emoji:'💬',label:'Bavardage'}];
let data=load(); let currentClassId=data.classes[0]?.id||null; let tab='class'; let search=''; let todayOnly=false; let sort='name'; let lastEvents=[];
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));if(x){x.behaviors??=DEFAULT_BEHAVIORS; x.classes??=[]; x.events??=[]; x.alerts??=[]; x.alerts.forEach(a=>{if(a.viewed===undefined)a.viewed=false}); return x}}catch(e){} return {classes:[],behaviors:DEFAULT_BEHAVIORS,events:[],alerts:[],theme:'automatic'} }
function save(){localStorage.setItem(KEY,JSON.stringify(data));applyTheme()}
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
function render(){applyTheme();document.querySelectorAll('.bottom button').forEach(b=>b.classList.remove('active'));document.getElementById('nav-'+tab)?.classList.add('active');document.getElementById('view').innerHTML=tab==='class'?classView():tab==='behaviors'?behaviorView():tab==='reports'?reportsView():dataView();}
function classView(){const c=currentClass(); if(!c)return `<div class="panel empty"><div style="font-size:45px">🏫</div><h2>Aucune classe</h2><p>Tu peux créer une classe ou importer directement une base existante.</p><div class="row" style="justify-content:center;margin-top:12px"><button class="primary" onclick="addClass()">➕ Créer une classe</button><button onclick="importDatabase()">📥 Importer une base</button><button onclick="backup()">💾 Sauvegarder</button></div></div>`;
let total=c.students.reduce((a,s)=>{const k=counts(s.id);return {b:a.b+k.bonus,m:a.m+k.malus}}, {b:0,m:0}); let students=c.students.filter(s=>s.name.toLowerCase().includes(search.toLowerCase()));students.sort((a,b)=>sort==='bonus'?counts(b.id).bonus-counts(a.id).bonus:sort==='malus'?counts(b.id).malus-counts(a.id).malus:a.name.localeCompare(b.name,'fr'));
return `<div class="panel"><div class="row"><select class="grow" onchange="currentClassId=this.value;render()">${data.classes.map(x=>`<option value="${x.id}" ${x.id===c.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select><button onclick="addClass()">➕ Classe</button><button onclick="openClassSettings()">⚙️</button></div></div>
<div class="grid stats"><div class="stat"><b class="plus">+${total.b}</b><span>Bonus</span></div><div class="stat"><b class="minus">-${total.m}</b><span>Malus</span></div><div class="stat"><b>${total.b-total.m}</b><span>Solde</span></div><div class="stat"><b>${c.students.length}</b><span>Élèves</span></div></div>
<div class="panel"><div class="controls"><input placeholder="🔎 Rechercher un élève…" value="${esc(search)}" oninput="search=this.value;render()"><button onclick="todayOnly=!todayOnly;render()">${todayOnly?'📅 Aujourd’hui':'📊 Total'}</button><button onclick="sort=sort==='name'?'bonus':sort==='bonus'?'malus':'name';render()">↕️ ${sort==='name'?'Nom':sort==='bonus'?'Bonus':'Malus'}</button></div><div class="row" style="margin-top:9px"><button class="primary" onclick="giveAll()">👥 Toute la classe</button><button onclick="addStudents()">➕ Ajouter des élèves</button><button onclick="backup()">💾 Sauvegarder</button><button onclick="importDatabase()">📥 Importer</button><button onclick="setTab('behaviors')">⭐ Gérer les bonus/malus</button><button class="primary" onclick="randomStudent()">🎲 Aléatoire</button><button onclick="setTab('reports')">📋 Rapports</button><button onclick="undo()" ${lastEvents.length?'':'disabled'}>↩️ Annuler</button></div></div>
${alertBanner()}<div class="grid students">${students.map(studentCard).join('')||'<div class="empty" style="grid-column:1/-1">Aucun élève trouvé.</div>'}</div>`}
function studentCard(s){const k=counts(s.id);return `<article class="student"><div class="avatar" title="Appui long pour gérer l’élève" style="background:${avatarColor(s.name)}" onpointerdown="startStudentPress(event,'${s.id}')" onpointerup="endStudentPress(event,'${s.id}')" onpointercancel="cancelStudentPress()" onpointerleave="cancelStudentPress()" oncontextmenu="return false">${s.photo?`<img src="${s.photo}" alt="">`:initials(s.name)}</div><h3>${esc(s.name)}</h3><div class="score"><span class="plus">+${k.bonus}</span><span class="minus">-${k.malus}</span></div><div class="balance">Solde ${k.bonus-k.malus}</div><div class="actions"><button class="primary" onclick="chooseBehavior('${s.id}','bonus')">➕ Bonus</button><button onclick="chooseBehavior('${s.id}','malus')">➖ Malus</button></div></article>`}
function behaviorView(){return `<div class="panel"><div class="row"><div class="grow"><div class="section-title">Comportements</div><div class="small">Crée autant de catégories de bonus et de malus que nécessaire.</div></div><button class="primary" onclick="behaviorForm()">➕ Ajouter</button></div><div class="row" style="margin-top:10px"><button onclick="behaviorForm();document.getElementById('bType').value='bonus'">➕ Nouveau bonus</button><button onclick="behaviorForm();document.getElementById('bType').value='malus'">➖ Nouveau malus</button></div></div>${['bonus','malus'].map(type=>`<div class="panel"><div class="section-title">${type==='bonus'?'🟢 Bonus':'🔴 Malus'}</div>${data.behaviors.filter(b=>b.type===type).map(b=>`<div class="behavior ${type}"><span class="emoji">${b.emoji}</span><span class="grow">${esc(b.label)}</span><button onclick="behaviorForm('${b.id}')">✏️</button><button class="danger" onclick="deleteBehavior('${b.id}')">🗑️</button></div>`).join('')}</div>`).join('')}`}
function dataView(){const c=currentClass();return `<div class="panel"><div class="section-title">💾 Base de données</div><p class="small">Sauvegarde toute la base de l’application dans un fichier JSON pour la transférer sur un autre appareil.</p><div class="row"><button class="primary" onclick="backup()">💾 Sauvegarder la base</button><button onclick="importDatabase()">📥 Importer une base</button><button onclick="copyCSV()">📋 Copier CSV</button><button onclick="window.print()">🖨️ Imprimer</button></div></div><div class="panel"><div class="section-title">📊 Classe active</div>${c?`<p><b>${esc(c.name)}</b> · ${c.students.length} élèves</p>`:'<p class="small">Aucune classe active.</p>'}</div><div class="panel"><div class="section-title">🚨 Alertes vie scolaire</div>${data.alerts.length?data.alerts.slice().reverse().slice(0,20).map(a=>`<div class="row" style="padding:7px 0;border-bottom:1px solid var(--line)"><span class="grow"><b>${esc(a.studentName)}</b> · ${esc(a.className)}<br><span class="small">${new Date(a.date).toLocaleString('fr-FR')}</span></span><button onclick="showAlert(data.alerts.find(x=>x.id==='${a.id}'))">Voir</button></div>`).join(''):`<p class="small">Aucune alerte pour le moment.</p>`}</div><div class="panel"><div class="section-title">📱 Installation sur iPad</div><p>Dans Safari : <b>Partager → Sur l’écran d’accueil</b>. Une fois installée, l’application peut continuer à fonctionner hors connexion après son premier chargement.</p><p class="small">Pour une vraie installation PWA, l’adresse du site doit être en HTTPS.</p></div><div class="panel danger-zone"><div class="section-title">⚠️ Zone sensible</div><button class="danger" onclick="wipe()">Tout effacer</button></div>`}
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
 if(!x || typeof x!=='object') throw new Error('format');
 // Accepte les sauvegardes produites par les anciennes versions de l'application.
 if(x.data && typeof x.data==='object') x=x.data;
 const out={...x};
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
 const done=(text)=>{
  try{
   const raw=String(text||'').replace(/^\uFEFF/,'').trim();
   if(!raw) throw new Error('empty-file');
   const parsed=JSON.parse(raw);
   const x=normalizeImportedData(parsed);
   if(!x.classes.length) throw new Error('no-classes');
   if(!confirm('Importer cette base va remplacer les données actuellement présentes sur cet appareil. Continuer ?'))return;
   data=x;
   currentClassId=data.classes[0]?.id||null;
   lastEvents=[];
   save();
   render();
   toast('Base importée avec succès');
  }catch(e){
   console.error('Import JSON:',e);
   toast('JSON valide mais format de sauvegarde non reconnu');
  }
 };
 try{
  // FileReader est le mode le plus compatible avec Safari/iPad.
  const r=new FileReader();
  r.onload=()=>done(r.result);
  r.onerror=()=>toast('Impossible de lire le fichier sur cet appareil');
  r.readAsText(file,'UTF-8');
 }catch(e){
  // Secours pour les navigateurs récents.
  if(typeof file.text==='function') file.text().then(done).catch(()=>toast('Impossible de lire le fichier'));
  else toast('Lecture des fichiers non disponible');
 }
}
function copyCSV(){const c=currentClass();if(!c)return;let out='Élève;Bonus;Malus;Solde\n';c.students.forEach(s=>{const k=counts(s.id);out+=`"${s.name.replaceAll('"','""')}";${k.bonus};${k.malus};${k.bonus-k.malus}\n`});navigator.clipboard?.writeText(out).then(()=>toast('CSV copié')).catch(()=>{openModal(`<h2>Bilan CSV</h2><textarea rows="12">${esc(out)}</textarea><button style="width:100%;margin-top:8px" onclick="closeModal()">Fermer</button>`)})}
function wipe(){if(!confirm('Effacer toutes les classes, élèves et historiques ?'))return;data={classes:[],behaviors:DEFAULT_BEHAVIORS,events:[],alerts:[],theme:'automatic'};currentClassId=null;save();render()}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
