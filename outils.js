/* © 2026 Tristan Zanchi. Tous droits réservés. Voir LICENCE.txt */
/* Outils activables de Suivi de classe (partagé par toutes les pages).
   Tous les outils se cochent dans Réglages › Outils (le suivi bonus/malus est coché par défaut).
   Décocher un outil le cache seulement : aucune donnée n'est effacée. */
(function(){
 'use strict';
 var KEY='sc_tools',AIKEY='sc_ai';
 var LIST=[
  {id:'bm',icon:'👥',name:'Suivi bonus/malus',desc:'Bonus et malus des élèves, élève au hasard, tableau récapitulatif, rapports d’alerte (5 malus).',ai:'',def:true},
  {id:'edt',icon:'🗓️',name:'Emploi du temps',desc:'Bandeau « cours en cours », semaine, import de l’emploi du temps Pronote (iCal).',ai:''},
  {id:'cdt',icon:'📒',name:'Cahier de textes & progressions',desc:'Séance de fin de cours, devoirs, fichiers joints, séquences, progressions de l’année.',ai:'option : reformulation de la dictée et transcription audio',needs:['edt']},
  {id:'report',icon:'📤',name:'Report Pronote / ENT',desc:'Favori Safari qui reporte les séances et les devoirs, et les malus dans la feuille d’appel (Vayrac).',ai:'',needs:['cdt']},
  {id:'trace',icon:'✍️',name:'Trace écrite',desc:'Photos du tableau → fiche de cours, synthèse Word, flash test.',ai:'nécessaire'},
  {id:'qcm',icon:'📷',name:'QCM en direct',desc:'QCM projetés, scan des cartes des élèves avec l’iPad, résultats.',ai:'option : créer un QCM à partir d’une séance, d’une fiche ou d’une séquence'}
 ];
 function read(){try{var v=JSON.parse(localStorage.getItem(KEY)||'null');return v&&typeof v==='object'?v:null;}catch(e){return null;}}
 function write(v){try{localStorage.setItem(KEY,JSON.stringify(v));}catch(e){}}
 function state(){var v=read()||{};var o={};LIST.forEach(function(t){o[t.id]=(v[t.id]===undefined&&t.def)?true:!!v[t.id];});return o;}
 function on(id){return !!state()[id];}
 function set(id,val){var s=state();s[id]=!!val;var msgs=[];
  function up(x){(byId(x).needs||[]).forEach(function(n){if(!s[n]){s[n]=true;msgs.push(byId(n).name);up(n);}});}
  function down(x){LIST.forEach(function(t){if(s[t.id]&&(t.needs||[]).indexOf(x)>=0){s[t.id]=false;msgs.push(t.name);down(t.id);}});}
  if(val)up(id);else down(id);
  write(s);return msgs;}
 function byId(id){for(var i=0;i<LIST.length;i++)if(LIST[i].id===id)return LIST[i];return {};}
 function known(){return !!read();}
 /* Première ouverture après la mise à jour : coche les outils déjà utilisés ; sur un iPad neuf, rien n'est coché. */
 function idbHas(db,store,test){return new Promise(function(res){var r;try{r=indexedDB.open(db);}catch(e){return res(false);}
  r.onupgradeneeded=function(){try{r.transaction.abort();}catch(_){}res(false);};
  r.onsuccess=function(){var d=r.result;if(!d.objectStoreNames.contains(store)){d.close();return res(false);}
   try{var q=d.transaction(store,'readonly').objectStore(store).get('data');q.onsuccess=function(){d.close();res(test(q.result));};q.onerror=function(){d.close();res(false);};}catch(e){d.close();res(false);}};
  r.onerror=function(){res(false);};});}
 function idbCount(db,store){return new Promise(function(res){var r;try{r=indexedDB.open(db);}catch(e){return res(0);}
  r.onupgradeneeded=function(){try{r.transaction.abort();}catch(_){}res(0);};
  r.onsuccess=function(){var d=r.result;if(!d.objectStoreNames.contains(store)){d.close();return res(0);}try{var q=d.transaction(store,'readonly').objectStore(store).count();q.onsuccess=function(){d.close();res(q.result||0);};q.onerror=function(){d.close();res(0);};}catch(e){d.close();res(0);}};
  r.onerror=function(){res(0);};});}
 async function init(){
  if(known())return state();
  var prog=await idbHas('progression-classe-db','kv',function(x){return !!(x&&Array.isArray(x.sessions)&&x.sessions.length);});
  var progCfg=await idbHas('progression-classe-db','kv',function(x){return !!(x&&x.config&&x.config.ics&&Object.keys(x.config.ics).length);});
  var qcm=(await idbCount('qcmscan','kv'))>0;var trace=false;try{trace=JSON.parse(localStorage.getItem('trace_sessions')||'[]').length>0;}catch(e){}
  var s={bm:true,edt:prog||progCfg,cdt:prog,report:prog,trace:trace,qcm:qcm||prog};
  write(s);return state();
 }
 /* Clé IA partagée (une seule saisie pour tous les outils) */
 function ai(){var v=null;try{v=JSON.parse(localStorage.getItem(AIKEY)||'null');}catch(e){}v=v&&typeof v==='object'?v:{};
  if(!v.geminiKey){try{v.geminiKey=localStorage.getItem('gemini_pro_api_key')||'';}catch(e){}}
  v.provider=v.provider||'gemini';v.geminiModel=v.geminiModel||'gemini-flash-latest';v.claudeModel=v.claudeModel||'claude-haiku-5-5';v.claudeKey=v.claudeKey||'';return v;}
 function setAi(p){var v=ai();for(var k in p)v[k]=p[k];try{localStorage.setItem(AIKEY,JSON.stringify(v));if(v.geminiKey)localStorage.setItem('gemini_pro_api_key',v.geminiKey);else localStorage.removeItem('gemini_pro_api_key');}catch(e){}return v;}
 function aiReady(){var v=ai();return v.provider==='claude'?!!v.claudeKey:!!v.geminiKey;}
 /* Page d'un outil désactivé : propose de l'activer ou de revenir */
 function guard(id){if(on(id))return true;var t=byId(id);
  var d=document.createElement('div');d.style.cssText='position:fixed;inset:0;z-index:2147483600;background:rgba(15,23,42,.6);display:flex;align-items:center;justify-content:center;padding:16px;font-family:-apple-system,system-ui,sans-serif';
  d.innerHTML='<div style="background:#fff;color:#0f172a;border-radius:16px;max-width:420px;width:100%;padding:20px"><div style="font-size:40px">'+t.icon+'</div><div style="font-size:19px;font-weight:800;margin:6px 0">'+t.name+' n’est pas activé</div><div style="font-size:15px;color:#475569">'+t.desc+(t.ai?'<br><b>🤖 IA</b> : '+t.ai:'')+'</div><div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap"><button id="scgOn" style="font-size:16px;padding:12px 16px;border-radius:10px;border:0;background:#4f46e5;color:#fff;font-weight:700">Activer cet outil</button><button id="scgBack" style="font-size:16px;padding:12px 16px;border-radius:10px;border:1px solid #cbd5e1;background:#fff">← Retour</button></div></div>';
  document.body.appendChild(d);d.querySelector('#scgOn').onclick=function(){set(id,true);location.reload();};d.querySelector('#scgBack').onclick=function(){location.href='index.html';};
  return false;}
 window.SCTools={LIST:LIST,state:state,on:on,set:set,byId:byId,init:init,known:known,ai:ai,setAi:setAi,aiReady:aiReady,guard:guard};
})();
