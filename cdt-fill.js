/* Favori « Remplir le cahier de textes » — chargé par le petit favori Safari (toujours à jour).
   Généré depuis progression.html (fonction cdtFill). Ne pas modifier à la main. */
(function(){
function cdtFill(){
 var K='sc_cdt_payload',D='sc_cdt_done';
 function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){return null;}}
 function norm(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');}
 function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
 function html(t){return String(t||'').split(/\n{2,}/).map(function(p){return '<p>'+esc(p).replace(/\n/g,'<br>')+'</p>';}).join('');}
 var MOIS=['janvier','fevrier','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre'];
 var PRONOTE=/index-education\.net/.test(location.host)||!!(window.GApplication||document.querySelector('input[id$="_Titre"]'));
 var ABR=['janv','fevr','mars','avr','mai','juin','juil','aout','sept','oct','nov','dec'];
 var rawTxt=(document.body.innerText||'').slice(0,60000);
 var pageTxt=norm(rawTxt);
 var head=null;(function(){var re=/(\d{1,2})\s+(janv|f[ée]vr|mars|avr|mai|juin|juil|ao[uû]t|sept|oct|nov|d[ée]c)[a-zéû]*\.?\s+(\d{4})\s*[-–]\s*([^\n–-]{1,30}?)\s*[-–]/i;var m=rawTxt.match(re);if(m){var k=norm(m[2]);var mo=ABR.findIndex(function(a){return k.indexOf(a)===0;});if(mo<0)mo=ABR.findIndex(function(a){return k.slice(0,3)===a.slice(0,3);});head={date:m[3]+'-'+String(mo+1).padStart(2,'0')+'-'+String(+m[1]).padStart(2,'0'),cls:norm(m[4])};}})();
 var done={};try{done=JSON.parse(ls(D)||'{}')||{};}catch(e){done={};}
 var old=document.getElementById('scfill');if(old)old.remove();
 var box=document.createElement('div');box.id='scfill';
 box.style.cssText='position:fixed;left:10px;right:10px;top:10px;max-height:80vh;overflow:auto;-webkit-overflow-scrolling:touch;z-index:2147483647;background:#fff;color:#111;border:3px solid #15803d;border-radius:16px;padding:12px;font:15px -apple-system,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,.45)';
 document.body.appendChild(box);
 function btn(t,bg,fn){var b=document.createElement('button');b.type='button';b.textContent=t;b.style.cssText='min-height:42px;border-radius:12px;border:'+(bg?'0':'1px solid #bbb')+';background:'+(bg||'#fff')+';color:'+(bg?'#fff':'#111')+';font-weight:700;font-size:15px;padding:6px 12px;margin:4px 6px 0 0';b.onclick=fn;return b;}
 function msg(t,col){var m=document.getElementById('scfillmsg');if(m){m.textContent=t;m.style.color=col||'#15803d';}}
 function load(){try{return JSON.parse(ls(K)||'null');}catch(e){return null;}}
 function take(txt){var p=null;try{p=JSON.parse(String(txt||'').trim());}catch(e){}if(!p||p.sc!=='cdt'||!p.items){msg('Ce n’est pas un envoi de Suivi de classe. Recommence « Préparer l’envoi » dans l’appli.','#dc2626');return false;}ls(K,JSON.stringify(p));render();return true;}
 function paste(){if(navigator.clipboard&&navigator.clipboard.readText){navigator.clipboard.readText().then(function(t){if(!take(t))showPasteZone();},function(){showPasteZone();});}else showPasteZone();}
 function showPasteZone(){var z=document.getElementById('scfillzone');if(z)z.style.display='block';msg('Appui long dans la zone ci-dessous › Coller.','#b45309');}
 function score(it){var s=0;if(head){if(head.date===it.date)s+=6;if(head.cls&&(head.cls===norm(it.cls)||head.cls===norm(it.label)))s+=6;if(s)return s;}var c=norm(it.cls),l=norm(it.label);if(c&&pageTxt.indexOf(c)>=0)s+=3;else if(l&&pageTxt.indexOf(l)>=0)s+=2;var d=it.date.split('-');var jj=String(+d[2]);var dm=norm(d[2]+'/'+d[1]+'/'+d[0]);var lg=norm(jj+' '+MOIS[+d[1]-1]+' '+d[0]);var lg2=norm(jj+' '+MOIS[+d[1]-1]);if(pageTxt.indexOf(dm)>=0||pageTxt.indexOf(lg)>=0)s+=3;else if(pageTxt.indexOf(lg2)>=0)s+=2;if(it.start){var h=it.start.split(':');if(pageTxt.indexOf(norm(+h[0]+'h'+h[1]))>=0||pageTxt.indexOf(norm(h[0]+':'+h[1]))>=0)s+=1;}return s;}
 function pnEditor(main){if(!window.tinymce)return null;var eds=(tinymce.get&&tinymce.get())||tinymce.editors||[];eds=[].slice.call(eds);return eds.filter(function(e){var id=e.id||'';return main?/_Descriptif$/.test(id)&&!e.isHidden():!/_Descriptif$/.test(id)&&!e.isHidden();}).pop()||null;}
 function setVal(el,v){var proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;var d=Object.getOwnPropertyDescriptor(proto,'value');el.focus();if(d&&d.set)d.set.call(el,v);else el.value=v;['input','change','keyup','blur'].forEach(function(t){el.dispatchEvent(new Event(t,{bubbles:true}));});}
 function setEd(ed,h){ed.setContent(h);try{ed.setDirty(true);}catch(e){}['input','change','keyup','blur'].forEach(function(t){try{ed.fire(t);}catch(e){}});try{ed.save();}catch(e){}}
 function pnFill(it,part){
  if(part==='contenu'){var t=[].slice.call(document.querySelectorAll('input[id$="_Titre"]')).filter(function(x){return x.offsetParent;})[0];var ed=pnEditor(true);
   if(!t||!ed){msg('Sélectionne d’abord le cours dans l’emploi du temps de Pronote (Cahier de textes › Saisie), puis retouche le favori.','#dc2626');return false;}
   setVal(t,(it.titre||'Séance').slice(0,250));setEd(ed,html(it.contenu));return true;}
  var b=[].slice.call(document.querySelectorAll('button[id$="_btnCreation"], button')).filter(function(x){return /travail/i.test(x.textContent||'')&&x.offsetParent;})[0];
  try{navigator.clipboard&&navigator.clipboard.writeText(it.devoirs);}catch(e){}
  if(!b){msg('Bouton « Ajouter un travail à effectuer » introuvable. Le texte des devoirs est copié : colle-le dans la fenêtre du travail à faire.','#b45309');return false;}
  var before=[].slice.call(((tinymce.get&&tinymce.get())||[])).map(function(e){return e.id;});
  b.click();
  var n=0;(function wait(){n++;var eds=[].slice.call(((window.tinymce&&tinymce.get&&tinymce.get())||[])).filter(function(e){return before.indexOf(e.id)<0&&!e.isHidden();});
   var ta=[].slice.call(document.querySelectorAll('textarea[id$="_Valeur"], [role=dialog] textarea, .ObjetFenetre textarea, [role=dialog] [contenteditable=true]')).filter(function(x){return x.offsetParent;})[0];
   if(eds.length){setEd(eds[eds.length-1],html(it.devoirs));msg('✅ Travail à faire rempli. Vérifie la date « Pour le » puis valide la fenêtre.');}
   else if(ta){if(ta.isContentEditable){ta.innerHTML=html(it.devoirs);ta.dispatchEvent(new Event('input',{bubbles:true}));}else setVal(ta,it.devoirs);msg('✅ Travail à faire rempli. Vérifie la date « Pour le » puis valide la fenêtre.');}
   else if(n<20)setTimeout(wait,250);
   else msg('Fenêtre du travail ouverte : le texte des devoirs est copié, colle-le dans la zone de description (appui long › Coller).','#b45309');})();
  return 'async';
 }
 function form(){var t=document.querySelector('input[name=title]');var ed=(window.CKEDITOR&&CKEDITOR.instances&&(CKEDITOR.instances.content||CKEDITOR.instances[Object.keys(CKEDITOR.instances)[0]]))||null;var ta=document.querySelector('textarea[name=content]');return {title:t,ed:ed,ta:ta,ok:!!(t&&(ed||ta))};}
 function fill(it,part){
  if(PRONOTE){var r=pnFill(it,part);if(r){done[it.id+'|'+part]=Date.now();ls(D,JSON.stringify(done));render();box.style.maxHeight='110px';if(r===true)msg('✅ Rempli (contenu). Vérifie, puis passe à la suite : Pronote enregistre la saisie comme d’habitude.');}return;}
  var f=form();
  if(!f.ok){msg('Ouvre d’abord le formulaire dans l’ENT : « une activité en séance » pour le contenu, ou « un travail à faire suite à la séance » pour les devoirs. Puis retouche le favori.','#dc2626');return;}
  var titre=part==='devoirs'?('Travail à faire'+(it.titre?' — '+it.titre:'')):(it.titre||'Séance');
  var corps=part==='devoirs'?it.devoirs:it.contenu;
  f.title.focus();f.title.value=titre.slice(0,250);f.title.dispatchEvent(new Event('input',{bubbles:true}));f.title.dispatchEvent(new Event('change',{bubbles:true}));
  if(f.ed){f.ed.setData(html(corps));try{f.ed.updateElement();}catch(e){}}else{f.ta.value=corps;f.ta.dispatchEvent(new Event('input',{bubbles:true}));}
  done[it.id+'|'+part]=Date.now();ls(D,JSON.stringify(done));
  var sub=document.querySelector('form input[type=submit].btn--primary, form button[type=submit].btn--primary');
  render();
  msg('✅ Rempli ('+(part==='devoirs'?'travail à faire':'contenu')+'). Vérifie, puis touche « Enregistrer » dans l’ENT.');
  if(sub){sub.style.outline='4px solid #15803d';sub.style.outlineOffset='3px';}
  box.style.maxHeight='110px';try{f.title.scrollIntoView({block:'center'});}catch(e){}
 }
 /* ===== ENT Kosmos : report automatique de toutes les séances (formulaire « Compléter la séance ») ===== */
 function pad2(n){return String(n).padStart(2,'0');}
 function frDate(iso){var d=iso.split('-');return d[2]+'/'+d[1]+'/'+d[0];}
 function parseDT(v){
  if(v==null)return null;
  if(typeof v==='number'||/^\d{9,13}$/.test(String(v))){var n=+v;if(n<1e11)n*=1000;var d=new Date(n);return isNaN(d)||d.getFullYear()<2000?null:d;}
  var s=String(v);var m=s.match(/(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{1,2}):(\d{2}))?/);if(m)return new Date(+m[1],m[2]-1,+m[3],+(m[4]||0),+(m[5]||0));
  m=s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\D+(\d{1,2})[:h](\d{2}))?/);if(m)return new Date(+m[3],m[2]-1,+m[1],+(m[4]||0),+(m[5]||0));
  return null;
 }
 function isoOf(d){return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());}
 function txtDate(t){var m=String(t).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);if(m)return m[3]+'-'+pad2(m[2])+'-'+pad2(m[1]);
  var n=norm(t);for(var i=0;i<12;i++){var r=new RegExp('(\\d{1,2})'+MOIS[i]+'(\\d{4})');var mm=n.match(r);if(mm)return mm[2]+'-'+pad2(i+1)+'-'+pad2(mm[1]);}return '';}
 function txtTime(t){var m=String(t).match(/(\d{1,2})\s*[h:]\s*(\d{2})/);return m?pad2(m[1])+':'+m[2]:'';}
 async function getDoc(url){var r=await fetch(url,{credentials:'same-origin'});if(!r.ok)throw new Error('ENT : erreur '+r.status);var t=await r.text();return {text:t,doc:new DOMParser().parseFromString(t,'text/html'),url:r.url};}
 function candidatesFromHTML(doc){
  var out=[],lastDate='';var it=doc.createNodeIterator(doc.body||doc,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);var n;
  while((n=it.nextNode())){
   if(n.nodeType===3){var d=txtDate(n.nodeValue);if(d)lastDate=d;continue;}
   if(n.tagName==='A'){var h=n.getAttribute('href')||'';var m=h.match(/ID_SEANCE=(\d+)/);if(!m)continue;
    var box=n;for(var k=0;k<4&&box.parentElement&&String(box.parentElement.textContent||'').length<400&&box.parentElement.querySelectorAll('a[href*="ID_SEANCE="]').length<=1;k++)box=box.parentElement;
    var t=[n.getAttribute('aria-label'),n.getAttribute('title'),box.getAttribute&&box.getAttribute('aria-label'),box.textContent||n.textContent].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();out.push({id:m[1],date:txtDate(t)||lastDate,time:txtTime(t),text:t});}
  }
  return out;
 }
 function candidatesFromJSON(j){
  var out=[];(function walk(o){if(!o||typeof o!=='object')return;if(Array.isArray(o)){o.forEach(walk);return;}
   var s=JSON.stringify(o);var id=null,st=null,tx='';
   Object.keys(o).forEach(function(k){var v=o[k];if(v&&typeof v==='object')return;var lk=k.toLowerCase();
    if(id==null&&/seance/.test(lk)&&/id/.test(lk)&&/^\d+$/.test(String(v)))id=String(v);
    if(st==null&&/start|debut|begin|date/.test(lk))st=parseDT(v);
    if(/text|title|titre|libelle|label|classe|groupe|name|nom|matiere|description/.test(lk)&&typeof v==='string')tx+=' '+v;});
   if(id==null){var m=s.match(/ID_SEANCE=(\d+)/);if(m)id=m[1];}
   if(id==null&&o.id!=null&&/^\d+$/.test(String(o.id))&&st)id=String(o.id);
   if(id&&st){out.push({id:id,date:isoOf(st),time:pad2(st.getHours())+':'+pad2(st.getMinutes()),text:(tx+' '+s.replace(/<[^>]+>/g,' ')).slice(0,400)});}
   Object.keys(o).forEach(function(k){if(o[k]&&typeof o[k]==='object')walk(o[k]);});})(j);
  return out;
 }
 async function entFindSeances(items){
  var cdt=await getDoc('/sg.do?PROC=CDT');
  var links=[].slice.call(cdt.doc.querySelectorAll('a[href]')).map(function(a){return a.getAttribute('href');});
  var sched=links.filter(function(h){return /GET_SCHEDULER_EVENTS/.test(h);})[0];
  var list=links.filter(function(h){return /PROC=CDT&VUE=L/.test(h);})[0];
  var cands=candidatesFromHTML(cdt.doc);
  var weeks={};items.forEach(function(it){var d=new Date(it.date+'T12:00:00');var day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);weeks[isoOf(d)]=1;});
  for(var w in weeks){
   var mon=new Date(w+'T00:00:00'),fri=new Date(mon);fri.setDate(fri.getDate()+6);
   var fd=frDate(w),fe=frDate(isoOf(fri));
   if(sched){try{var u=sched.replace(/dateCourante=[^&]*/,'dateCourante='+encodeURIComponent(fd)).replace(/DATECOURANTE=[^&]*/,'DATECOURANTE='+mon.getTime());
    var r=await fetch((u.charAt(0)==='/'?'':'/')+u,{credentials:'same-origin',headers:{'X-Requested-With':'XMLHttpRequest','Accept':'application/json, text/javascript, */*'}});var t=await r.text();
    var j=null;try{j=JSON.parse(t);}catch(e){}cands=cands.concat(j?candidatesFromJSON(j):candidatesFromHTML(new DOMParser().parseFromString(t,'text/html')));}catch(e){}}
   if(list){try{var u2=list.replace(/DATE_DEBUT=[^&]*/,'DATE_DEBUT='+encodeURIComponent(fd)).replace(/dateDebut=[^&]*/,'dateDebut='+encodeURIComponent(fd)).replace(/dateFin=[^&]*/,'dateFin='+encodeURIComponent(fe)).replace(/DATECOURANTE=[^&]*/,'DATECOURANTE='+mon.getTime());
    var L=await getDoc((u2.charAt(0)==='/'?'':'/')+u2);cands=cands.concat(candidatesFromHTML(L.doc));}catch(e){}}
  }
  var byId={};cands.forEach(function(c){if(!c.date||/autre\s*[ée]tablissement/i.test(c.text))return;var k=c.id+'|'+c.date;var e=byId[k];if(!e){byId[k]={id:c.id,date:c.date,time:c.time,text:c.text};}else{if(!e.time&&c.time)e.time=c.time;e.text+=' '+c.text;}});
  cands=Object.keys(byId).map(function(k){return byId[k];});
  return cands;
 }
 function matchSeance(it,cands){
  var c1=norm(it.cls),c2=norm(it.label);
  var best=null,bs=0;cands.forEach(function(c){if(c.date!==it.date)return;var s=1;var t=norm(c.text);if(c1&&t.indexOf(c1)>=0||c2&&t.indexOf(c2)>=0)s+=4;
   if(it.start&&c.time){var a=+it.start.slice(0,2)*60+ +it.start.slice(3),b=+c.time.slice(0,2)*60+ +c.time.slice(3);if(Math.abs(a-b)<=15)s+=3;}
   if(s>bs){bs=s;best=c;}});
  return bs>=4?best:null;
 }
 function formFields(f){var fd=[];[].slice.call(f.elements).forEach(function(e){if(!e.name||e.disabled)return;var t=(e.type||'').toLowerCase();if(/^(submit|button|file|reset|image)$/.test(t))return;if((t==='checkbox'||t==='radio')&&!e.checked)return;if(e.tagName==='SELECT'){[].slice.call(e.options).forEach(function(o){if(o.selected)fd.push([e.name,o.value]);});return;}fd.push([e.name,e.value]);});return fd;}
 async function entSaveSeance(it,idSeance,opts){
  var base='/sg.do?PROC=CDT_SEANCE&ID_SEANCE='+idSeance+'&VUE=E';
  var view=await getDoc(base+'&ACTION=VIEW_SEANCE');
  var existing=(view.text.match(/DELETE_ACTIVITE/g)||[]).length;
  if(existing&&!opts.force)return {status:'skip',msg:'déjà renseignée dans l’ENT ('+existing+' élément(s))'};
  var pg=await getDoc(base+'&ACTION=COMPLETE_SEANCE');
  var f=[].slice.call(pg.doc.forms).filter(function(x){var a=x.querySelector('input[name=ACTION]');return a&&a.value==='SAVE_COMPLETE_SEANCE';})[0];
  if(!f)return {status:'err',msg:'formulaire « compléter la séance » introuvable'};
  var fields=formFields(f);
  function set(name,val){var found=false;fields=fields.map(function(p){if(p[0]===name){found=true;return [name,val];}return p;});if(!found)fields.push([name,val]);}
  set('CONTENU_title',(it.titre||'Séance').slice(0,250));set('CONTENU_content',html(it.contenu||''));
  if(it.devoirs){set('TRAVAIL_title','Travail à faire'+(it.titre?' — '+it.titre:''));set('TRAVAIL_content',html(it.devoirs));}
  var enc=(f.getAttribute('enctype')||'').toLowerCase();var body;
  if(enc.indexOf('multipart')>=0){body=new FormData();fields.forEach(function(p){body.append(p[0],p[1]);});}else{body=new URLSearchParams();fields.forEach(function(p){body.append(p[0],p[1]);});}
  var action=f.getAttribute('action')||'/sg.do';
  var r=await fetch(action.charAt(0)==='/'?action:'/'+action,{method:'POST',credentials:'same-origin',body:body});
  if(!r.ok)return {status:'err',msg:'enregistrement refusé ('+r.status+')'};
  var after=await getDoc(base+'&ACTION=VIEW_SEANCE');var n2=(after.text.match(/DELETE_ACTIVITE/g)||[]).length;
  if(n2>existing)return {status:'ok',msg:'reportée ('+(n2-existing)+' élément(s) ajouté(s))'};
  var errTxt=(new DOMParser().parseFromString(await r.text().catch(function(){return '';}),'text/html').querySelector('.alert,.error,.message--error,.notice--error')||{}).textContent||'';
  return {status:'err',msg:'l’ENT n’a rien enregistré'+(errTxt?' : '+String(errTxt).replace(/\s+/g,' ').slice(0,120):'')};
 }
 async function entBatch(force){
  var p=load();if(!p)return;var todo=p.items.filter(function(it){return force||!done[it.id+'|auto'];});
  if(!todo.length){msg('Toutes les séances de cet envoi sont déjà reportées ✅');return;}
  box.style.maxHeight='80vh';var log=document.getElementById('scfilllog');log.innerHTML='';msg('⏳ Recherche des séances dans l’ENT…','#4f46e5');
  function line(t,c){var d=document.createElement('div');d.style.cssText='font-size:14px;margin:3px 0;color:'+(c||'#111');d.textContent=t;log.appendChild(d);}
  var cands=[];try{cands=await entFindSeances(todo);}catch(e){msg('Impossible de lire le cahier de textes : '+e.message,'#dc2626');return;}
  var ok=0,ko=0,sk=0,miss=[];
  for(var i=0;i<todo.length;i++){var it=todo[i];var lab=it.label+' · '+frDate(it.date).slice(0,5)+(it.start?' '+it.start.replace(':','h'):'');
   msg('⏳ '+(i+1)+'/'+todo.length+' : '+lab,'#4f46e5');
   var c=matchSeance(it,cands);if(!c){line('❓ '+lab+' : séance introuvable dans l’ENT','#b45309');miss.push(it);ko++;continue;}
   try{var r=await entSaveSeance(it,c.id,{force:!!force});
    if(r.status==='ok'){ok++;done[it.id+'|auto']=Date.now();ls(D,JSON.stringify(done));line('✅ '+lab+' : '+r.msg,'#15803d');if(it.files&&it.files.length)line('   📎 à joindre toi-même : '+it.files.join(', '),'#b45309');}
    else if(r.status==='skip'){sk++;done[it.id+'|auto']=Date.now();ls(D,JSON.stringify(done));line('⏭️ '+lab+' : '+r.msg,'#555');}
    else{ko++;line('⚠️ '+lab+' : '+r.msg,'#dc2626');}}catch(e){ko++;line('⚠️ '+lab+' : '+e.message,'#dc2626');}
  }
  msg((ko?'⚠️ ':'✅ ')+ok+' reportée(s), '+sk+' déjà faite(s), '+ko+' problème(s).'+(ko?'':' Dans Suivi de classe, touche « ✅ Vayrac : tout est reporté ».'),ko?'#b45309':'#15803d');
  if(miss.length){var det=document.createElement('details');det.innerHTML='<summary style="font-size:13px">Détail pour Claude (si une séance est introuvable)</summary>';var ta=document.createElement('textarea');ta.readOnly=true;ta.style.cssText='width:100%;height:90px;font:11px monospace';ta.value='MANQUANTES: '+miss.map(function(m){return m.cls+' '+m.date+' '+m.start;}).join(', ')+'\nTROUVEES('+cands.length+'): '+cands.slice(0,30).map(function(c){return c.date+' '+c.time+' '+c.text.replace(/\s+/g,' ').slice(0,140);}).join(' || ');det.appendChild(ta);log.appendChild(det);}
 }
 /* ===== Pronote web : report automatique (clics à l'écran, comme l'utilisateur) ===== */
 function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
 async function waitFor(fn,ms,step){var t0=Date.now();ms=ms||6000;step=step||150;while(Date.now()-t0<ms){try{var v=fn();if(v)return v;}catch(e){}await sleep(step);}return null;}
 function vis(el){return !!(el&&el.offsetParent!==null&&el.getClientRects().length);}
 function press(el){if(!el)return false;try{el.scrollIntoView({block:'center'});}catch(e){}var r=el.getBoundingClientRect();var o={bubbles:true,cancelable:true,view:window,clientX:r.left+r.width/2,clientY:r.top+r.height/2,button:0,buttons:1,pointerType:'touch',isPrimary:true};['pointerdown','mousedown','pointerup','mouseup','click'].forEach(function(t){try{var E=t.indexOf('pointer')===0&&window.PointerEvent?PointerEvent:MouseEvent;el.dispatchEvent(new E(t,o));}catch(e){}});return true;}
 function pnTitre(){return [].slice.call(document.querySelectorAll('input[id$="_Titre"]')).filter(vis)[0]||null;}
 function pnDateIn(txt){
  var t=String(txt||'');var m=t.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);var mA=t.match(/(?:lun|mar|mer|jeu|ven|sam|dim)[a-z]*\.?\s+(\d{1,2})\s+(janv|f[ée]vr|mars|avr|mai|juin|juil|ao[uû]t|sept|oct|nov|d[ée]c)[a-zéû]*\.?(?:\s+(\d{4}))?/i)||t.match(/(\d{1,2})\s+(janv|f[ée]vr|mars|avr|mai|juin|juil|ao[uû]t|sept|oct|nov|d[ée]c)[a-zéû]*\.?(?:\s+(\d{4}))?/i);
  var cand=[];
  if(mA){var k=norm(mA[2]);var mo=ABR.findIndex(function(a){return k.indexOf(a)===0;});if(mo<0)mo=ABR.findIndex(function(a){return k.slice(0,3)===a.slice(0,3);});var y=mA[3]?+mA[3]:0;
   if(!y){var now=new Date();y=now.getFullYear();var dd=new Date(y,mo,+mA[1]);if(dd-now>183*864e5)y--;else if(now-dd>183*864e5)y++;}
   cand.push({i:mA.index,d:y+'-'+pad2(mo+1)+'-'+pad2(+mA[1])});}
  if(m&&!/(dernier|prochain)\s+cours\s+le\s*$/i.test(t.slice(Math.max(0,m.index-25),m.index)))cand.push({i:m.index,d:m[3]+'-'+pad2(m[2])+'-'+pad2(m[1])});
  cand.sort(function(a,b){return a.i-b.i;});return cand[0]?cand[0].d:'';
 }
 function pnHeader(){
  var t=pnTitre();var el=t;
  for(var i=0;i<14&&el;i++){el=el.parentElement;if(!el)break;var tx=String(el.innerText||'');var d=pnDateIn(tx);
   if(d){var lines=tx.split(/\n+/);var hl=lines.filter(function(l){return pnDateIn(l);})[0]||tx;d=pnDateIn(hl)||d;var mm=hl.match(/[-–]\s*([0-9][^\n–-]{0,25}?)\s*(?:[-–]|$)/);return {date:d,cls:mm?norm(mm[1]):'',key:d+'|'+norm(hl).slice(0,120),txt:hl.replace(/\s+/g,' ').slice(0,160)};}}
  return null;
 }
 function pnNearText(){var t=pnTitre();if(!t)return '(zone Titre introuvable)';var el=t;for(var i=0;i<6&&el.parentElement;i++)el=el.parentElement;return String(el.innerText||'').replace(/\s+/g,' ').slice(0,200);}
 function pnSaveBtn(){
  var all=[].slice.call(document.querySelectorAll('button,[role=button],a,i,div,span,img'));
  return all.filter(function(e){if(!vis(e))return false;var lab=(e.getAttribute('title')||'')+' '+(e.getAttribute('aria-label')||'')+' '+(e.getAttribute('ie-hint')||'')+' '+(e.getAttribute('data-tooltip')||'');var own=e.children.length===0?(e.textContent||''):'';var cls=typeof e.className==='string'?e.className:'';
   return /^\s*enregistrer\s*$/i.test(own)||/\benregistrer\b/i.test(lab)||/enregistr|disquette|Image_Save/i.test(cls);}).filter(function(e){return !/travail/i.test(e.textContent||'');}).sort(function(a,b){return b.getBoundingClientRect().right-a.getBoundingClientRect().right;})[0]||null;
 }
 function pnDialogBtn(re){var d=[].slice.call(document.querySelectorAll('[role=dialog],.ObjetFenetre_Espace')).filter(vis).pop();if(!d)return null;return [].slice.call(d.querySelectorAll('button,[role=button]')).filter(function(b){return vis(b)&&re.test(b.textContent||b.getAttribute('aria-label')||'');})[0]||null;}
 async function pnConfirmDialogs(){for(var i=0;i<3;i++){var b=pnDialogBtn(/^\s*(oui|enregistrer|valider|ok)\s*$/i);if(!b)return;press(b);await sleep(700);}}
 async function pnSelectClass(it){
  var c1=norm(it.cls),c2=norm(it.label);
  var h0=pnHeader();
  var els=[].slice.call(document.querySelectorAll('.EmploiDuTemps_Element,[id*="_cours_"]')).filter(function(e){return e.getClientRects().length;});
  function etxt(e){var t=[e.getAttribute('aria-label'),e.getAttribute('title'),e.getAttribute('ie-hint'),e.textContent,e.innerText].concat([].slice.call(e.querySelectorAll('[aria-label],[title]')).map(function(x){return (x.getAttribute('aria-label')||'')+' '+(x.getAttribute('title')||'');})).join(' ');return norm(t).replace(/ouverturedesdetailsducours/g,' ');}
  function hasCls(t){var re=new RegExp('(^|[^a-z0-9])?'+c1);return t.indexOf(c1)>=0&&!(new RegExp(c1+'[0-9]').test(t));}
  var el=els.filter(function(e){var t=etxt(e);return hasCls(t)||(c2&&t.indexOf(c2)>=0);})[0];
  window.__scDebugCours=null;if(!el){window.__scDebugCours=els.slice(0,20).map(function(e){return etxt(e).slice(0,60);});}
  if(!el)return !!(h0&&(h0.cls===c1||h0.cls===c2));press(el);await sleep(500);await pnConfirmDialogs();
  var okSel=await waitFor(function(){var x=pnHeader();if(!x)return false;if(x.cls)return (x.cls===c1||x.cls===c2);return !h0||x.key!==h0.key;},6000);
  if(!okSel){var x=pnHeader();if(x&&!x.cls&&h0&&x.key===h0.key)okSel=true;}
  if(!okSel)window.__scDebugCours=['clic sur la classe fait, mais en-tête non reconnu','texte près du Titre : '+pnNearText()];
  return !!okSel;
 }
 async function pnGoToDate(it){
  for(var step=0;step<20;step++){
   var h=pnHeader();if(!h)return false;if(h.date===it.date)return true;
   var dir=h.date<it.date?'_suiv':'_prec';var b=[].slice.call(document.querySelectorAll('span[id$="'+dir+'"],[id$="'+dir+'"]')).filter(vis)[0];
   if(!b)return false;var before=h.key;press(b);await sleep(300);await pnConfirmDialogs();
   var moved=await waitFor(function(){var x=pnHeader();return x&&x.key!==before;},6000);if(!moved)return false;
   var x=pnHeader();if(x&&((dir==='_suiv'&&x.date>it.date)||(dir==='_prec'&&x.date<it.date)))return false;
  }
  return false;
 }
 async function pnDoOne(it,force){
  if(!(await pnSelectClass(it)))return {status:'err',msg:'classe introuvable dans l’emploi du temps affiché (affiche la semaine en cours)'+(window.__scDebugCours?' — vu : '+window.__scDebugCours.join(' | ').slice(0,300):'')};
  if(!(await pnGoToDate(it))){var hh=pnHeader();return {status:'err',msg:'cours du '+frDate(it.date)+' introuvable (affiché : '+(hh?hh.date+' — '+hh.txt:pnNearText())+')'};}
  var t=pnTitre(),ed=pnEditor(true);if(!t||!ed)return {status:'err',msg:'zone de saisie introuvable'};
  var already=(t.value||'').trim()||stripTags(ed.getContent()).trim();
  if(already&&!force)return {status:'skip',msg:'déjà renseigné dans Pronote'};
  setVal(t,(it.titre||'Séance').slice(0,250));setEd(ed,html(it.contenu||''));await sleep(400);
  var tafNote='';
  if(it.devoirs){
   function dlgField(){var ds=[].slice.call(document.querySelectorAll('[role=dialog],.ObjetFenetre_Espace,[id$="_Fenetre"]')).filter(function(d){return d.getClientRects().length&&!d.contains(document.getElementById('scfill'));});
    for(var k=ds.length-1;k>=0;k--){var d=ds[k];var ta=[].slice.call(d.querySelectorAll('textarea')).filter(function(x){return x.getClientRects().length;})[0];if(ta)return {d:d,ta:ta};
     var fr=d.querySelector('iframe');if(fr&&window.tinymce){var e2=[].slice.call(((tinymce.get&&tinymce.get())||[])).filter(function(e){return e.iframeElement===fr||(e.getContainer&&d.contains(e.getContainer()));})[0];if(e2)return {d:d,ed:e2};}
     var ce=d.querySelector('[contenteditable=true]');if(ce&&ce.getClientRects().length)return {d:d,ce:ce};}
    return null;}
   function tafBtn(){return [].slice.call(document.querySelectorAll('button[id$="_btnCreation"]')).filter(function(x){return vis(x)&&x.isConnected&&/travail/i.test(x.textContent||'');})[0]||[].slice.call(document.querySelectorAll('button,[role=button]')).filter(function(x){return vis(x)&&/ajouter un travail/i.test(x.textContent||'');})[0]||null;}
   async function openTaf(){for(var a=0;a<2;a++){var b=tafBtn();if(!b)return null;try{b.focus();}catch(e){}if(a===0)b.click();else press(b);var f=await waitFor(dlgField,a===0?3000:5000);if(f)return f;}return null;}
   var f=await openTaf();
   if(!f){var sb0=pnSaveBtn();if(sb0){press(sb0);await sleep(1200);await pnConfirmDialogs();await sleep(600);}f=await openTaf();}
   if(!f){var bb=tafBtn();tafNote=' — ⚠️ travail à faire NON ajouté (fenêtre « Saisir un travail » restée fermée'+(bb?(bb.disabled||bb.getAttribute('aria-disabled')==='true'?', bouton désactivé':''):', bouton absent')+') : ajoute-le à la main ; texte copié';try{navigator.clipboard&&navigator.clipboard.writeText(it.devoirs);}catch(e){}}
   else{
    if(f.ta)setVal(f.ta,it.devoirs);else if(f.ed)setEd(f.ed,html(it.devoirs));else{f.ce.innerHTML=html(it.devoirs);f.ce.dispatchEvent(new Event('input',{bubbles:true}));}
    await sleep(300);
    var v=[].slice.call(f.d.querySelectorAll('button,[role=button]')).filter(function(x){return x.getClientRects().length&&/^\s*valider\s*$/i.test(x.textContent||'');})[0];
    if(!v)tafNote=' — ⚠️ bouton Valider du travail introuvable : valide la fenêtre toi-même';
    else{v.click();var gone=await waitFor(function(){return !f.d.getClientRects().length||!document.body.contains(f.d);},4000);if(!gone){press(v);await waitFor(function(){return !f.d.getClientRects().length||!document.body.contains(f.d);},4000);}}
   }
  }
  await sleep(300);var sb=pnSaveBtn();
  if(!sb)return {status:'err',msg:'bouton « Enregistrer » introuvable : touche-le toi-même, en haut à droite'};
  press(sb);await sleep(900);await pnConfirmDialogs();await sleep(500);
  var t2=pnTitre();return {status:'ok',msg:'reportée'+(t2&&t2.value?'':' (à vérifier)')+tafNote,warn:!!tafNote};
 }
 function stripTags(h){var d=document.createElement('div');d.innerHTML=h||'';return d.textContent||'';}
 async function pnBatch(onlyOne){
  var p=load();if(!p)return;var todo=p.items.filter(function(it){return !done[it.id+'|auto'];});if(onlyOne)todo=todo.slice(0,1);
  if(!todo.length){msg('Toutes les séances de cet envoi sont déjà reportées ✅');return;}
  box.style.maxHeight='45vh';var log=document.getElementById('scfilllog');log.innerHTML='';
  function line(t,c){var d=document.createElement('div');d.style.cssText='font-size:14px;margin:3px 0;color:'+(c||'#111');d.textContent=t;log.appendChild(d);}
  var ok=0,ko=0,sk=0;
  for(var i=0;i<todo.length;i++){var it=todo[i];var lab=it.label+' · '+frDate(it.date).slice(0,5);msg('⏳ '+(i+1)+'/'+todo.length+' : '+lab+' — ne touche pas l’écran','#4f46e5');
   try{var r=await pnDoOne(it,false);
    if(r.status==='ok'){ok++;done[it.id+'|auto']=Date.now();ls(D,JSON.stringify(done));line((r.warn?'🟠 ':'✅ ')+lab+' : '+r.msg,r.warn?'#b45309':'#15803d');if(it.files&&it.files.length)line('   📎 à joindre toi-même : '+it.files.join(', '),'#b45309');}
    else if(r.status==='skip'){sk++;done[it.id+'|auto']=Date.now();ls(D,JSON.stringify(done));line('⏭️ '+lab+' : '+r.msg,'#555');}
    else{ko++;line('⚠️ '+lab+' : '+r.msg,'#dc2626');if(/Enregistrer/.test(r.msg))break;}}catch(e){ko++;line('⚠️ '+lab+' : '+e.message,'#dc2626');}
  }
  msg((ko?'⚠️ ':'✅ ')+ok+' reportée(s), '+sk+' déjà faite(s), '+ko+' problème(s).'+(ko?'':' Dans Suivi de classe, touche « ✅ Martel : tout est reporté ».'),ko?'#b45309':'#15803d');
 }
 function render(){
  var p=load();box.innerHTML='';
  var h=document.createElement('div');h.innerHTML='<b style="font-size:17px">📒 Remplir le cahier de textes</b> <span style="font-size:11px;color:#999">favori v27</span>'+(p?'<div style="font-size:14px;margin-top:2px">Envoi <b>'+esc(({martel:'Martel',vayrac:'Vayrac'})[p.etab]||p.etab||'')+'</b> · <b>'+p.items.length+' séance(s)</b> · préparé le <b>'+esc(p.at||'?')+'</b></div>'+((PRONOTE&&p.etab==='vayrac')||(!PRONOTE&&p.etab==='martel')?'<div style="color:#dc2626;font-weight:700;font-size:13px">⚠️ Cet envoi est celui de '+(p.etab==='vayrac'?'Vayrac (ENT)':'Martel (Pronote)')+' : prépare l’envoi '+(PRONOTE?'Martel':'Vayrac')+' dans l’appli puis touche « Recoller un nouvel envoi ».</div>':''):'');box.appendChild(h);
  var m=document.createElement('div');m.id='scfillmsg';m.style.cssText='font-weight:700;margin:6px 0;min-height:18px';box.appendChild(m);
  var z=document.createElement('textarea');z.id='scfillzone';z.placeholder='Colle ici l’envoi de Suivi de classe';z.style.cssText='display:none;width:100%;height:70px;margin:6px 0;font-size:14px';z.oninput=function(){take(z.value);};box.appendChild(z);
  if(!p){var t=document.createElement('p');t.textContent='Dans Suivi de classe : « 📤 Préparer l’envoi », puis reviens ici et touche « Coller les séances ».';box.appendChild(t);box.appendChild(btn('📋 Coller les séances','#15803d',paste));box.appendChild(btn('Fermer','',function(){box.remove();}));return;}
  var today=new Date().toDateString();var stale=!p.ts||new Date(p.ts).toDateString()!==today;
  if(stale&&!window.__scUseOld){var sb=document.createElement('div');sb.style.cssText='background:#fff7ed;border:2px solid #b45309;border-radius:12px;padding:10px;margin:8px 0';sb.innerHTML='<b>Cet envoi n’est pas celui d’aujourd’hui.</b><div style="font-size:14px;margin:4px 0">Dans l’appli, touche « 📤 Préparer l’envoi », reviens ici, puis touche le bouton ci-dessous (et la bulle « Coller » d’iPadOS).</div>';sb.appendChild(btn('📋 Coller l’envoi du jour','#15803d',paste));sb.appendChild(btn('Utiliser quand même l’ancien','',function(){window.__scUseOld=1;render();}));box.appendChild(sb);box.appendChild(btn('Fermer','',function(){box.remove();}));return;}
  if(PRONOTE){var pa=document.createElement('div');pa.style.cssText='background:#eef2ff;border:2px solid #4f46e5;border-radius:12px;padding:8px 10px;margin:6px 0';pa.innerHTML='<b>⚡ Tout reporter dans Pronote</b><div style="font-size:13px;color:#333">Ouvre Cahier de textes › Saisie sur la semaine en cours. Le favori ouvre chaque cours, remplit titre, contenu et travail à faire, puis touche « Enregistrer ». Ne touche pas l’écran pendant ce temps. Les cours déjà remplis ne sont pas modifiés.</div>';var nn=p.items.filter(function(it){return !done[it.id+'|auto'];}).length;pa.appendChild(btn('▶︎ Tester sur 1 séance','#4f46e5',function(){pnBatch(true);}));pa.appendChild(btn('⚡ Tout reporter ('+nn+')','#15803d',function(){pnBatch(false);}));var lg2=document.createElement('div');lg2.id='scfilllog';pa.appendChild(lg2);box.appendChild(pa);var sep2=document.createElement('div');sep2.style.cssText='font-size:13px;color:#666;margin-top:8px';sep2.textContent='Ou séance par séance (cours sélectionné) :';box.appendChild(sep2);}
  if(!PRONOTE){var auto=document.createElement('div');auto.style.cssText='background:#ecfdf5;border:2px solid #15803d;border-radius:12px;padding:8px 10px;margin:6px 0';auto.innerHTML='<b>⚡ Tout reporter automatiquement</b><div style="font-size:13px;color:#333">Retrouve chaque séance dans le cahier de textes et enregistre contenu + travail à faire. Les séances déjà renseignées dans l’ENT sont laissées telles quelles.</div>';auto.appendChild(btn('⚡ Tout reporter ('+p.items.filter(function(it){return !done[it.id+'|auto'];}).length+')','#15803d',function(){entBatch(false);}));var lg=document.createElement('div');lg.id='scfilllog';auto.appendChild(lg);box.appendChild(auto);var sep=document.createElement('div');sep.style.cssText='font-size:13px;color:#666;margin-top:8px';sep.textContent='Ou séance par séance (formulaire ouvert) :';box.appendChild(sep);}
  var items=p.items.map(function(it){return {it:it,s:score(it)};}).sort(function(a,b){return b.s-a.s||(a.it.date<b.it.date?-1:1);});
  items.forEach(function(o,i){var it=o.it;var c=document.createElement('div');c.style.cssText='border:'+(i===0&&o.s>=4?'3px solid #15803d':'1px solid #ddd')+';border-radius:12px;padding:8px 10px;margin:8px 0';
   var d=it.date.split('-');var dc=done[it.id+'|contenu'],dd=done[it.id+'|devoirs'];
   c.innerHTML=(i===0&&o.s>=4?'<div style="color:#15803d;font-weight:800;font-size:13px">➜ Séance probablement affichée</div>':'')+'<b>'+esc(it.label)+'</b> · '+d[2]+'/'+d[1]+(it.start?' · '+esc(it.start.replace(':','h')):'')+'<div style="font-size:14px;margin-top:2px">'+esc(it.titre||'')+'</div>'+(it.devoirs?'<div style="font-size:13px;color:#444">📒 '+esc(it.devoirs.slice(0,120))+'</div>':'');
   c.appendChild(btn((dc?'✓ ':'')+'Contenu de séance','#4f46e5',function(){fill(it,'contenu');}));
   if(it.devoirs)c.appendChild(btn((dd?'✓ ':'')+'Travail à faire','#b45309',function(){fill(it,'devoirs');}));
   box.appendChild(c);});
  box.appendChild(btn('📋 Recoller un nouvel envoi','',paste));
  box.appendChild(btn('Réduire','',function(){box.style.maxHeight=box.style.maxHeight==='60px'?'80vh':'60px';}));
  box.appendChild(btn('Fermer','',function(){box.remove();}));
 }
 render();
 (function autoPaste(){
  if(!navigator.clipboard||!navigator.clipboard.readText){if(!load())showPasteZone();return;}
  navigator.clipboard.readText().then(function(t){var np=null;try{np=JSON.parse(String(t||'').trim());}catch(e){}
   if(np&&np.sc==='cdt'&&np.items){var old=load();var same=old&&old.at===np.at&&JSON.stringify(old.items.map(function(x){return x.id;}))===JSON.stringify(np.items.map(function(x){return x.id;}));
    if(!same){ls(K,JSON.stringify(np));render();msg('📥 Nouvel envoi chargé : '+np.items.length+' séance(s).');}}
   else if(!load())showPasteZone();
   else msg('⚠️ Envoi affiché : celui du '+(load().at||'?')+'. S’il n’est pas d’aujourd’hui, touche « Recoller un nouvel envoi ».','#b45309');
  },function(){if(!load())showPasteZone();else msg('⚠️ Envoi affiché : celui du '+(load().at||'?')+'. S’il n’est pas d’aujourd’hui, touche « Recoller un nouvel envoi ».','#b45309');});
 })();
}
cdtFill();
})();
