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
 function setVal(el,v){var proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;var d=Object.getOwnPropertyDescriptor(proto,'value');el.focus();var ok=false;
  try{el.select();if(v)ok=document.execCommand('insertText',false,v)&&el.value===v;}catch(e){}
  if(!ok){if(d&&d.set)d.set.call(el,v);else el.value=v;}
  ['keydown','keypress','keyup'].forEach(function(t){try{el.dispatchEvent(new KeyboardEvent(t,{bubbles:true,key:'a',keyCode:65,which:65}));}catch(e){}});try{el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:v}));}catch(e){el.dispatchEvent(new Event('input',{bubbles:true}));}el.dispatchEvent(new Event('change',{bubbles:true}));try{if(window.jQuery)jQuery(el).trigger('input').trigger('change').trigger('keyup');}catch(e){}try{el.blur();}catch(e){}el.dispatchEvent(new Event('blur',{bubbles:true}));el.dispatchEvent(new FocusEvent('focusout',{bubbles:true}));}
 function setEd(ed,h){var ok=false;
  try{var doc=ed.getDoc&&ed.getDoc();if(doc){ed.focus();doc.execCommand('selectAll',false,null);ok=doc.execCommand('insertHTML',false,h);}}catch(e){}
  if(!ok||!String(ed.getContent()).replace(/<[^>]+>/g,'').trim())ed.setContent(h);
  try{ed.undoManager&&ed.undoManager.add();}catch(e){}try{ed.setDirty(true);}catch(e){}
  ['input','keyup','keydown','change','NodeChange','Dirty','blur'].forEach(function(t){try{ed.fire(t);}catch(e){}});try{var bd=ed.getBody&&ed.getBody();if(bd){bd.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:'a'}));bd.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,key:'a',keyCode:65}));}}catch(e){}try{ed.save();}catch(e){}try{var ta=document.getElementById(ed.id);if(ta){ta.dispatchEvent(new Event('change',{bubbles:true}));}}catch(e){}}
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
 function pnNearText(){var t=pnTitre();if(!t){var dl=[].slice.call(document.querySelectorAll('[role=dialog],.ObjetFenetre_Espace')).filter(function(d){return d.getClientRects().length&&!d.closest('#scfill');}).map(function(d){return String(d.innerText||'').replace(/\s+/g,' ').slice(0,160);});var allT=[].slice.call(document.querySelectorAll('input[id$="_Titre"]')).length;return '(zone Titre introuvable ; champs Titre dans la page : '+allT+(dl.length?' ; fenêtre ouverte : '+dl.join(' | '):' ; aucune fenêtre ouverte')+' ; titre de page : '+document.title.slice(0,60)+')';}var el=t;for(var i=0;i<6&&el.parentElement;i++)el=el.parentElement;return String(el.innerText||'').replace(/\s+/g,' ').slice(0,200);}
 function pnMenuIcons(){var nav=document.querySelector('nav[id$="_secondMenu"],.objetBandeauEntete_secondmenu');if(!nav)return [];return [].slice.call(nav.querySelectorAll('i,[role=button],button')).filter(function(e){return e.getClientRects().length;});}
 function pnSaveDebug(){
  var W=innerWidth;var out=['ecran '+W+'x'+innerHeight+' titre="'+((pnTitre()||{}).value||'').slice(0,30)+'"'];
  pnMenuIcons().forEach(function(e,k){out.push('MENU2 #'+k+' '+String(e.outerHTML).replace(/\s+/g,' ').slice(0,260));});
  [].slice.call(document.querySelectorAll('body *')).forEach(function(e){if(e.closest('#scfill'))return;var r=e.getBoundingClientRect();if(!r.width||!r.height)return;
   var own=[].slice.call(e.childNodes).filter(function(n){return n.nodeType===3;}).map(function(n){return n.nodeValue;}).join(' ').replace(/\s+/g,' ').trim();
   var lab=[e.getAttribute('title'),e.getAttribute('aria-label'),e.getAttribute('ie-hint'),e.getAttribute('role')].filter(Boolean).join('/');var cls=typeof e.className==='string'?e.className.trim().split(/\s+/).slice(0,5).join('.'):'';
   var topRight=r.top<170&&r.right>W-360&&(own||lab||/btn|bouton|Image_|icon/i.test(cls));
   if(topRight||/enregistr|sauveg|valider|disquette/i.test(own+' '+lab+' '+cls))out.push(e.tagName.toLowerCase()+(e.id?'#'+e.id.slice(-30):'')+(cls?'.'+cls:'')+' ['+Math.round(r.left)+','+Math.round(r.top)+' '+Math.round(r.width)+'x'+Math.round(r.height)+']'+(lab?' {'+lab.slice(0,60)+'}':'')+(own?' "'+own.slice(0,40)+'"':''));});
  return out.slice(0,70).join('\n');
 }
 function pnSaveBtn(){
  var dq=[].slice.call(document.querySelectorAll('svg[class*="disquette"]')).map(function(v){return v.closest('[role=button],button,i,a');}).filter(function(x){return x&&x.getClientRects().length&&!x.closest('#scfill')&&x.getAttribute('aria-disabled')!=='true'&&!/Disable/.test(x.className);})[0];if(dq)return dq;
  var all=[].slice.call(document.querySelectorAll('body *'));
  var c=all.filter(function(e){if(!vis(e)||e.closest('#scfill'))return false;var lab=(e.getAttribute('title')||'')+' '+(e.getAttribute('aria-label')||'')+' '+(e.getAttribute('ie-hint')||'')+' '+(e.getAttribute('data-tooltip')||'');var own=[].slice.call(e.childNodes).filter(function(n){return n.nodeType===3;}).map(function(n){return n.nodeValue;}).join(' ');var cls=typeof e.className==='string'?e.className:'';
   return /^\s*enregistrer\s*$/i.test(own)||/\benregistrer\b/i.test(lab)||/enregistr|disquette|Image_Save|btnSave/i.test(cls);}).filter(function(e){return !/travail/i.test(e.textContent||'')&&!(e.getAttribute('aria-disabled')==='true')&&!e.disabled;});
  c.sort(function(a,b){return (a.getBoundingClientRect().top-b.getBoundingClientRect().top)||(b.getBoundingClientRect().right-a.getBoundingClientRect().right);});
  var e=c[0]||null;if(e){var cl=e.closest('button,[role=button],a,[tabindex]');if(cl&&!cl.closest('#scfill'))e=cl;}
  if(!e){var ic=pnMenuIcons().filter(function(x){var lab=(x.getAttribute('title')||'')+(x.getAttribute('aria-label')||'');return !/imprim|export|mail|aide|communication/i.test(lab);});var en=ic.filter(function(x){return !/Disable/.test(x.className)&&x.getAttribute('aria-disabled')!=='true';});if(en.length)e=en[0];}
  return e;
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
  if(it.devoirs&&!window.__scTafAuto){tafNote=' — 📋 travail à faire à ajouter toi-même (pour le '+(it.pour?frDate(it.pour):'prochain cours')+')';}
  if(it.devoirs&&window.__scTafAuto){
   function dlgField(){var ds=[].slice.call(document.querySelectorAll('[role=dialog],.ObjetFenetre_Espace,[id$="_Fenetre"]')).filter(function(d){return d.getClientRects().length&&!d.contains(document.getElementById('scfill'));});
    for(var k=ds.length-1;k>=0;k--){var d=ds[k];var ta=[].slice.call(d.querySelectorAll('textarea')).filter(function(x){return x.getClientRects().length;})[0];if(ta)return {d:d,ta:ta};
     var fr=d.querySelector('iframe');if(fr&&window.tinymce){var e2=[].slice.call(((tinymce.get&&tinymce.get())||[])).filter(function(e){return e.iframeElement===fr||(e.getContainer&&d.contains(e.getContainer()));})[0];if(e2)return {d:d,ed:e2};}
     var ce=d.querySelector('[contenteditable=true]');if(ce&&ce.getClientRects().length)return {d:d,ce:ce};}
    return null;}
   function tafBtn(){return [].slice.call(document.querySelectorAll('button[id$="_btnCreation"]')).filter(function(x){return vis(x)&&x.isConnected&&/travail/i.test(x.textContent||'');})[0]||[].slice.call(document.querySelectorAll('button,[role=button]')).filter(function(x){return vis(x)&&/ajouter un travail/i.test(x.textContent||'');})[0]||null;}
   async function openTaf(){for(var a=0;a<2;a++){var b=tafBtn();if(!b)return null;try{b.focus();}catch(e){}var old0=new Set(pnPopupItems());if(a===0)b.click();else press(b);
     function newItems(){return pnPopupItems().filter(function(x){return !old0.has(x);});}
     var got=await waitFor(function(){return dlgField()||(newItems().length?'menu':null);},a===0?3000:5000);
     if(got==='menu'){await sleep(400);var f1=dlgField();if(f1)return f1;var mi=pnPickItem(newItems(),it.pour);if(mi){press(mi);var f2=await waitFor(dlgField,5000);if(f2)return f2;}}
     else if(got)return got;}return null;}
   var f=await openTaf();
   if(!f){var sb0=pnSaveBtn();if(sb0){press(sb0);await sleep(1200);await pnConfirmDialogs();await sleep(600);}f=await openTaf();}
   if(!f){var bb=tafBtn();tafNote=' — ⚠️ travail à faire NON ajouté (fenêtre « Saisir un travail » restée fermée'+(bb?(bb.disabled||bb.getAttribute('aria-disabled')==='true'?', bouton désactivé':''):', bouton absent')+') : ajoute-le à la main ; texte copié';try{navigator.clipboard&&navigator.clipboard.writeText(it.devoirs);}catch(e){}}
   else{
    if(f.ta)setVal(f.ta,it.devoirs);else if(f.ed)setEd(f.ed,html(it.devoirs));else{f.ce.innerHTML=html(it.devoirs);f.ce.dispatchEvent(new Event('input',{bubbles:true}));}
    await sleep(300);
    var v=[].slice.call(f.d.querySelectorAll('button,[role=button]')).filter(function(x){return x.getClientRects().length&&/^\s*valider\s*$/i.test(x.textContent||'');})[0];
    if(!v)tafNote=' — ⚠️ bouton Valider du travail introuvable : valide la fenêtre toi-même';
    else{var typed=(f.ta?f.ta.value:'');press(v);var gone=await waitFor(function(){return !f.d.getClientRects().length||!document.body.contains(f.d);},4000);if(!gone){press(v);gone=await waitFor(function(){return !f.d.getClientRects().length||!document.body.contains(f.d);},4000);}
     await sleep(800);await pnConfirmDialogs();
     var probe=norm(it.devoirs).slice(0,25);var seen=probe&&[].slice.call(document.querySelectorAll('body *')).some(function(e){return !e.closest('#scfill')&&e.children.length<3&&norm(e.textContent||'').indexOf(probe)>=0&&e.getClientRects().length;});
     if(!gone)tafNote=' — ⚠️ la fenêtre du travail ne s’est pas fermée après Valider';
     else if(!seen)tafNote=' — ⚠️ travail validé mais introuvable dans la page (texte saisi : '+(typed?typed.length+' caractères':'vide')+') : vérifie-le';}
   }
  }
  await sleep(300);var sb=await waitFor(pnSaveBtn,4000);
  if(!sb)return {status:'err',msg:'bouton « Enregistrer » introuvable : touche-le toi-même, en haut à droite',debug:pnSaveDebug()};
  press(sb);await sleep(900);await pnConfirmDialogs();await sleep(500);
  var t2=pnTitre();return {status:'ok',msg:'contenu reporté'+(t2&&t2.value?'':' (à vérifier)')+tafNote,warn:!!tafNote,taf:(it.devoirs&&!window.__scTafAuto)?it.devoirs:''};
 }
 var MOIS=['janvier','fevrier','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre'];
 function deacc(t){return String(t||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/\s+/g,' ');}
 var DRX=/\b(lun|mar|mer|jeu|ven|sam|dim)[a-z]*\.?\s+\d{1,2}(er)?\s+(janv|fevr|mars|avr|mai|juin|juil|aout|sept|oct|nov|dec)/;
 function pnTafRow(txt){var probe=norm(txt).slice(0,25);var cands=[].slice.call(document.querySelectorAll('tr,[role=row]')).filter(function(r){return !r.closest('#scfill')&&r.getClientRects().length&&norm(r.textContent).indexOf(probe)>=0;});cands.sort(function(a,b){return a.textContent.length-b.textContent.length;});return cands[0]||null;}
 function pnDateCell(row){if(!row)return null;var cs=[].slice.call(row.querySelectorAll('td,[role=gridcell],[role=cell],div,span')).filter(function(c){return c.getClientRects().length&&DRX.test(deacc(c.textContent))&&deacc(c.textContent).length<40;});cs.sort(function(a,b){return a.textContent.length-b.textContent.length;});var c=cs[0]||null;if(c){var td=c.closest('td,[role=gridcell],[role=cell]');if(td&&td.textContent.length<40)c=td;}return c;}
 function dateMatch(el,iso){var d=iso.split('-');var t=deacc((el.getAttribute&&((el.getAttribute('aria-label')||'')+' '+(el.getAttribute('title')||'')))+' '+(el.textContent||''));var m=MOIS[+d[1]-1];return t.indexOf(d[2]+'/'+d[1]+'/'+d[0])>=0||new RegExp('\\b0?'+(+d[2])+'(er)? '+m.slice(0,3)).test(t);}
 function pnPopupItems(){return [].slice.call(document.querySelectorAll('[role=menuitem],[role=menuitemradio],[role=option],[role=menu] li,[role=menu] [tabindex],.ObjetMenuContextuel li,[class*="MenuContextuel"] [role],[class*="menu-contextuel"] li')).filter(function(x){return x.getClientRects().length&&!x.closest('#scfill')&&(x.textContent||'').trim();}).filter(function(x,i,a){return !a.some(function(y){return y!==x&&x.contains(y)&&y.matches('[role=menuitem],[role=menuitemradio],[role=option]');});});}
 function pnPickItem(items,pour){if(!items.length)return null;var sc=items.map(function(x){var t=(x.textContent||'').toLowerCase();var s=0;if(pour){var d=pour.split('-');var mois=['janvier','fevrier','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre'][+d[1]-1];var tn=t.normalize('NFD').replace(/[̀-ͯ]/g,'');if(t.indexOf(d[2]+'/'+d[1])>=0)s+=10;if(new RegExp('\\b0?'+(+d[2])+'(er)?\\s+'+mois).test(tn))s+=10;}if(/biblioth|copier|reprendre|dupliquer|modele|modèle|qcm|questionnaire|ressource|kiosque|devoir sur table|evaluation|évaluation/.test(t))s-=20;if(/prochain|suivant|travail|nouveau|saisir|créer|creer/.test(t))s+=3;return {x:x,s:s};});sc.sort(function(a,b){return b.s-a.s;});return sc[0].x;}
 function stripTags(h){var d=document.createElement('div');d.innerHTML=h||'';return d.textContent||'';}
 function strip(h){return String(h||'').replace(/<svg[\s\S]*?<\/svg>/g,'<svg/>').replace(/\s+/g,' ');}
 function tafArea(){var hs=[].slice.call(document.querySelectorAll('body *')).filter(function(e){return !e.closest('#scfill')&&e.children.length<4&&/travail à effectuer/i.test(e.textContent||'')&&e.getClientRects().length;});var h=hs[hs.length-1];if(!h)return null;var el=h;for(var i=0;i<4&&el.parentElement;i++){el=el.parentElement;if(String(el.textContent||'').length>300)break;}return el;}
 var __boxCss=null;
 function boxAside(on){if(on){if(__boxCss===null)__boxCss=box.style.cssText;box.style.top='auto';box.style.bottom='6px';box.style.maxHeight='70px';box.style.overflow='hidden';box.style.pointerEvents='none';box.style.opacity='.9';}else if(__boxCss!==null){box.style.cssText=__boxCss;__boxCss=null;}}
 async function pnTafEnquete(){
  var p=load();var it=(p&&p.items.filter(function(x){return x.devoirs&&x.pour;})[0])||{devoirs:'TEST enquete',pour:''};
  var log=document.getElementById('scfilllog');boxAside(true);try{await pnTafEnqCore(it);}finally{boxAside(false);}
 }
 async function pnTafEnqCore(it){var log=document.getElementById('scfilllog');var out=['PN-TAF v39 '+new Date().toISOString()+' pour='+(it.pour||'?')];
  function dlgs(){return [].slice.call(document.querySelectorAll('[role=dialog],.ObjetFenetre_Espace,[id$="_Fenetre"]')).filter(function(x){return x.getClientRects().length&&!x.closest('#scfill');});}
  function snap(){return new Set([document.body].concat([].slice.call(document.querySelectorAll('body *'))));}
  function added(bef){return [].slice.call(document.querySelectorAll('body *')).filter(function(e){return !bef.has(e)&&e.getClientRects().length&&!e.closest('#scfill')&&(!e.parentElement||bef.has(e.parentElement));});}
  function clean(h){return strip(h).replace(/ style="[^"]*"/g,'').replace(/ data-tooltip[a-z-]*="[^"]*"/g,'');}
  var b=[].slice.call(document.querySelectorAll('button')).filter(function(x){return x.getClientRects().length&&/ajouter un travail/i.test(x.textContent||'');})[0];
  if(!b){out.push('bouton introuvable');}
  else{function taDlg(){var t=[].slice.call(document.querySelectorAll('textarea')).filter(function(x){return x.getClientRects().length&&!x.closest('#scfill');}).pop();return t?(t.closest('[role=dialog],.ObjetFenetre_Espace,[id$="_Fenetre"]')||t.parentElement):null;}
   out.push('BOUTON: '+clean(b.outerHTML).slice(0,250)+' disabled='+b.disabled);
   b.click();var d=await waitFor(taDlg,7000,200);out.push('apres click: '+(d?'fenetre ok':'rien'));
   if(!d){var r=b.getBoundingClientRect();var top=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);out.push('element au centre du bouton: '+(top?clean(top.outerHTML).slice(0,200):'?'));b.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',keyCode:13,bubbles:true}));b.dispatchEvent(new KeyboardEvent('keyup',{key:'Enter',keyCode:13,bubbles:true}));d=await waitFor(taDlg,4000,200);out.push('apres Entree: '+(d?'fenetre ok':'rien'));}
   if(!d){press(b);d=await waitFor(taDlg,5000,200);out.push('apres press: '+(d?'fenetre ok':'rien'));}
   out.push('FENETRE: '+(d?'ok':'aucune ('+dlgs().length+' dialogues visibles)'));
   var ta=d&&[].slice.call(d.querySelectorAll('textarea')).filter(function(x){return x.getClientRects().length;})[0];
   if(!ta){out.push('fenetre/textarea introuvable');}
   else{setVal(ta,it.devoirs);await sleep(300);var v=[].slice.call(d.querySelectorAll('button')).filter(function(x){return /valider/i.test(x.textContent||'');})[0];press(v);await sleep(1500);
    var row=pnTafRow(it.devoirs);out.push('LIGNE: '+(row?clean(row.outerHTML).slice(0,2500):'introuvable'));
    var cell=pnDateCell(row);out.push('CELLULE DATE: '+(cell?clean(cell.outerHTML).slice(0,800):'introuvable'));
    if(cell){var bef=snap();press(cell);await sleep(1500);var nw=added(bef);
     if(!nw.length){var inner=cell.querySelector('div,span,i,[role=button]')||cell;bef=snap();press(inner);try{inner.dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));}catch(e){}await sleep(1500);nw=added(bef);out.push('(2e essai)');}
     out.push('APRES CLIC DATE ('+nw.length+'): '+nw.map(function(e){return clean(e.outerHTML).slice(0,4000);}).join(' || ').slice(0,7000));
     var dd=dlgs().pop();if(dd)out.push('FENETRE DATE: '+clean(dd.outerHTML).slice(0,6000));
     if(it.pour){var root=dd||document;var hits=[].slice.call(root.querySelectorAll('td,[role=gridcell],[role=option],[role=menuitem],li,button,div,span')).filter(function(e){return e.getClientRects().length&&!e.closest('#scfill')&&e.children.length<3&&dateMatch(e,it.pour);});
      out.push('CIBLES '+it.pour+' ('+hits.length+'): '+hits.slice(0,6).map(function(e){return clean(e.outerHTML).slice(0,250);}).join(' || '));}}}}
  out.push('NE PAS ENREGISTRER');
  var tx=document.createElement('textarea');tx.readOnly=true;tx.style.cssText='width:100%;height:140px;font:11px monospace';tx.value=out.join('\n');log.appendChild(tx);
  log.appendChild(btn('📋 Copier l’enquête','#4f46e5',function(){try{navigator.clipboard.writeText(tx.value);}catch(e){tx.select();document.execCommand('copy');}}));
  msg('Enquête terminée : copie-la et envoie-la à Claude. Puis recharge la page Pronote SANS enregistrer.','#b45309');
 }
 async function pnBatch(onlyOne){
  var p=load();if(!p)return;var todo=p.items.filter(function(it){return !done[it.id+'|auto'];});if(onlyOne)todo=todo.slice(0,1);
  if(!todo.length){msg('Toutes les séances de cet envoi sont déjà reportées ✅');return;}
  box.style.maxHeight='45vh';var log=document.getElementById('scfilllog');log.innerHTML='';
  function line(t,c){var d=document.createElement('div');d.style.cssText='font-size:14px;margin:3px 0;color:'+(c||'#111');d.textContent=t;log.appendChild(d);}
  var ok=0,ko=0,sk=0;boxAside(true);try{
  for(var i=0;i<todo.length;i++){var it=todo[i];var lab=it.label+' · '+frDate(it.date).slice(0,5);msg('⏳ '+(i+1)+'/'+todo.length+' : '+lab+' — ne touche pas l’écran','#4f46e5');
   try{var r=await pnDoOne(it,false);
    if(r.status==='ok'){ok++;done[it.id+'|auto']=Date.now();ls(D,JSON.stringify(done));line((r.warn?'🟠 ':'✅ ')+lab+' : '+r.msg,r.warn?'#b45309':'#15803d');if(r.taf){(function(txt){var b2=btn('📋 Copier le travail de '+it.label,'',function(){try{navigator.clipboard.writeText(txt);b2.textContent='✅ Copié';}catch(e){}});log.appendChild(b2);})(r.taf);}if(it.files&&it.files.length)line('   📎 à joindre toi-même : '+it.files.join(', '),'#b45309');}
    else if(r.status==='skip'){sk++;done[it.id+'|auto']=Date.now();ls(D,JSON.stringify(done));line('⏭️ '+lab+' : '+r.msg,'#555');}
    else{ko++;line('⚠️ '+lab+' : '+r.msg,'#dc2626');if(r.debug){var dt=document.createElement('details');dt.open=true;dt.innerHTML='<summary style="font-size:13px">Détail pour Claude (copie et envoie-le)</summary>';var tx=document.createElement('textarea');tx.readOnly=true;tx.style.cssText='width:100%;height:120px;font:11px monospace';tx.value='PN-SAVE v32\n'+r.debug;dt.appendChild(tx);dt.appendChild(btn('📋 Copier le détail','',function(){try{navigator.clipboard.writeText(tx.value);}catch(e){tx.select();document.execCommand('copy');}}));log.appendChild(dt);}if(/Enregistrer/.test(r.msg))break;}}catch(e){ko++;line('⚠️ '+lab+' : '+e.message,'#dc2626');}
  }
  }finally{boxAside(false);}
  msg((ko?'⚠️ ':'✅ ')+ok+' reportée(s), '+sk+' déjà faite(s), '+ko+' problème(s).'+(ko?'':' Dans Suivi de classe, touche « ✅ Martel : tout est reporté ».'),ko?'#b45309':'#15803d');
 }
 function render(){
  var p=load();box.innerHTML='';
  var h=document.createElement('div');h.innerHTML='<b style="font-size:17px">📒 Remplir le cahier de textes</b> <span style="font-size:11px;color:#999">favori v39</span>'+(p?'<div style="font-size:14px;margin-top:2px">Envoi <b>'+esc(({martel:'Martel',vayrac:'Vayrac'})[p.etab]||p.etab||'')+'</b> · <b>'+p.items.length+' séance(s)</b> · préparé le <b>'+esc(p.at||'?')+'</b></div>'+((PRONOTE&&p.etab==='vayrac')||(!PRONOTE&&p.etab==='martel')?'<div style="color:#dc2626;font-weight:700;font-size:13px">⚠️ Cet envoi est celui de '+(p.etab==='vayrac'?'Vayrac (ENT)':'Martel (Pronote)')+' : prépare l’envoi '+(PRONOTE?'Martel':'Vayrac')+' dans l’appli puis touche « Recoller un nouvel envoi ».</div>':''):'');box.appendChild(h);
  var m=document.createElement('div');m.id='scfillmsg';m.style.cssText='font-weight:700;margin:6px 0;min-height:18px';box.appendChild(m);
  var z=document.createElement('textarea');z.id='scfillzone';z.placeholder='Colle ici l’envoi de Suivi de classe';z.style.cssText='display:none;width:100%;height:70px;margin:6px 0;font-size:14px';z.oninput=function(){take(z.value);};box.appendChild(z);
  if(!p){var t=document.createElement('p');t.textContent='Dans Suivi de classe : « 📤 Préparer l’envoi », puis reviens ici et touche « Coller les séances ».';box.appendChild(t);box.appendChild(btn('📋 Coller les séances','#15803d',paste));box.appendChild(btn('Fermer','',function(){box.remove();}));return;}
  var today=new Date().toDateString();var stale=!p.ts||new Date(p.ts).toDateString()!==today;
  if(stale&&!window.__scUseOld){var sb=document.createElement('div');sb.style.cssText='background:#fff7ed;border:2px solid #b45309;border-radius:12px;padding:10px;margin:8px 0';sb.innerHTML='<b>Cet envoi n’est pas celui d’aujourd’hui.</b><div style="font-size:14px;margin:4px 0">Dans l’appli, touche « 📤 Préparer l’envoi », reviens ici, puis touche le bouton ci-dessous (et la bulle « Coller » d’iPadOS).</div>';sb.appendChild(btn('📋 Coller l’envoi du jour','#15803d',paste));sb.appendChild(btn('Utiliser quand même l’ancien','',function(){window.__scUseOld=1;render();}));box.appendChild(sb);box.appendChild(btn('Fermer','',function(){box.remove();}));return;}
  if(PRONOTE){var pa=document.createElement('div');pa.style.cssText='background:#eef2ff;border:2px solid #4f46e5;border-radius:12px;padding:8px 10px;margin:6px 0';pa.innerHTML='<b>⚡ Tout reporter dans Pronote</b><div style="font-size:13px;color:#333">Ouvre Cahier de textes › Saisie sur la semaine en cours. Le favori ouvre chaque cours, remplit titre, contenu et travail à faire, puis touche « Enregistrer ». Ne touche pas l’écran pendant ce temps. Les cours déjà remplis ne sont pas modifiés. Pour l’instant, le travail à faire est à ajouter toi-même (bouton « Copier le travail »).</div>';var nn=p.items.filter(function(it){return !done[it.id+'|auto'];}).length;pa.appendChild(btn('▶︎ Tester sur 1 séance','#4f46e5',function(){pnBatch(true);}));pa.appendChild(btn('⚡ Tout reporter ('+nn+')','#15803d',function(){pnBatch(false);}));pa.appendChild(btn('🔬 Enquête travail à faire','',function(){pnTafEnquete();}));pa.appendChild(btn('🔎 Inspecter les boutons','',function(){var lg=document.getElementById('scfilllog');var tx=document.createElement('textarea');tx.readOnly=true;tx.style.cssText='width:100%;height:120px;font:11px monospace';tx.value='PN-INSPECT\n'+pnSaveDebug();lg.appendChild(tx);lg.appendChild(btn('📋 Copier','',function(){try{navigator.clipboard.writeText(tx.value);}catch(e){tx.select();document.execCommand('copy');}}));}));var lg2=document.createElement('div');lg2.id='scfilllog';pa.appendChild(lg2);box.appendChild(pa);var sep2=document.createElement('div');sep2.style.cssText='font-size:13px;color:#666;margin-top:8px';sep2.textContent='Ou séance par séance (cours sélectionné) :';box.appendChild(sep2);}
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
