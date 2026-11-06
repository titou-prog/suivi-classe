/* =====================================================================
   VERROU — mot de passe de Suivi de classe (partagé avec progression.html)
   - Écran de mot de passe à l'ouverture de l'appli (et au retour après X minutes hors de l'appli)
   - « Mode classe » : sur la page Élèves, seules les fonctions de cours restent libres
     (bonus, malus, toute la classe, aléatoire, annuler). Le reste demande le mot de passe.
   - Le mot de passe n'est jamais stocké en clair : empreinte SHA-256 salée + code de secours.
   Configuration enregistrée dans les données de Suivi de classe : data.lock
   ===================================================================== */
const Verrou=(()=>{
 let cfg=null,fails=0,blockedUntil=0,hiddenAt=0,pending=null,onChange=()=>{};
 const HINT='sc-lock-hint',UNLOCKED='sc-unlocked',ADMIN='sc-admin-until';
 const ss={get:k=>{try{return sessionStorage.getItem(k)}catch(_){return null}},set:(k,v)=>{try{sessionStorage.setItem(k,v)}catch(_){}},del:k=>{try{sessionStorage.removeItem(k)}catch(_){}}};
 const ls={get:k=>{try{return localStorage.getItem(k)}catch(_){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(_){}},del:k=>{try{localStorage.removeItem(k)}catch(_){}}};
 const escH=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

 /* ---------- style + écran ---------- */
 const css=`#vrLock{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;padding:20px;background:var(--bg,#f5f7fb);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;color:var(--text,#172033)}
#vrLock.show{display:flex}#vrLock.dim{background:rgba(15,23,42,.62);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
#vrLock .vr-card{width:100%;max-width:420px;background:var(--card,#fff);border:1px solid var(--line,#e5e7eb);border-radius:26px;padding:26px 22px;box-shadow:0 20px 60px rgba(0,0,0,.18);text-align:center}
#vrLock .vr-ico{font-size:46px;line-height:1}#vrLock h2{margin:10px 0 4px;font-size:22px}#vrLock p{margin:0 0 14px;color:var(--muted,#667085);font-size:14px}
#vrLock input{width:100%;box-sizing:border-box;font-size:22px;text-align:center;letter-spacing:.18em;padding:13px;border-radius:15px;border:1px solid var(--line,#e5e7eb);background:var(--card,#fff);color:var(--text,#172033);outline:none}
#vrLock input:focus{border-color:#4f46e5;box-shadow:0 0 0 3px rgba(79,70,229,.18)}
#vrLock button{font:inherit;min-height:50px;border-radius:15px;border:1px solid var(--line,#e5e7eb);background:var(--card,#fff);color:var(--text,#172033);font-weight:700;font-size:16px;width:100%;margin-top:10px;cursor:pointer}
#vrLock button.vr-go{background:#4f46e5;border-color:#4f46e5;color:#fff}#vrLock .vr-link{background:none;border:0;min-height:36px;font-size:14px;color:var(--muted,#667085);text-decoration:underline}
#vrLock .vr-err{color:#dc2626;font-weight:700;min-height:22px;margin-top:8px;font-size:14px}
#vrLock .vr-shake{animation:vrShake .35s}@keyframes vrShake{20%,60%{transform:translateX(-9px)}40%,80%{transform:translateX(9px)}}
.vr-pill{position:fixed;left:0;right:0;margin:0 auto;width:max-content;top:calc(10px + env(safe-area-inset-top));z-index:45;min-height:42px!important;border-radius:999px!important;padding:6px 14px!important;font-weight:800!important;background:#15803d!important;color:#fff!important;border-color:#15803d!important;box-shadow:0 6px 20px rgba(0,0,0,.18)}
`;
 function injectCss(){if(document.getElementById('vrCss'))return;const st=document.createElement('style');st.id='vrCss';st.textContent=css;document.head.appendChild(st)}
 function ensureDom(){
  injectCss();
  if(document.getElementById('vrLock'))return document.getElementById('vrLock');
  const d=document.createElement('div');d.id='vrLock';d.innerHTML='<div class="vr-card"><div class="vr-ico">🔒</div><h2>Suivi de classe</h2><p>Chargement…</p></div>';
  document.body.appendChild(d);return d;
 }
 // Écran opaque immédiat si un verrou est connu : aucune donnée élève n'apparaît avant le mot de passe
 function earlyCover(){injectCss();if(ls.get(HINT)==='1'&&ss.get(UNLOCKED)!=='1'){const d=ensureDom();d.classList.add('show');d.classList.remove('dim')}}

 /* ---------- empreintes ---------- */
 async function sha(txt){
  if(window.crypto&&crypto.subtle){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(txt));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')}
  let h=5381;for(let i=0;i<txt.length;i++)h=((h<<5)+h+txt.charCodeAt(i))>>>0;return 'djb2-'+h.toString(16); // secours (ne devrait pas servir sur iPad)
 }
 const hashPw=(pw,salt)=>sha(salt+'|'+pw);
 function randomStr(n,alpha){const a=alpha||'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const r=new Uint32Array(n);(window.crypto||{}).getRandomValues?crypto.getRandomValues(r):r.forEach((_,i)=>r[i]=Math.random()*4e9);return Array.from(r,x=>a[x%a.length]).join('')}

 /* ---------- état ---------- */
 const enabled=()=>!!(cfg&&cfg.hash);
 const startupOn=()=>enabled()&&cfg.startup!==false;
 const protectOn=()=>enabled()&&cfg.protectAdmin!==false;
 function isAdmin(){if(!protectOn())return true;return Number(ss.get(ADMIN)||0)>Date.now()}
 function setAdmin(on){if(on)ss.set(ADMIN,String(Date.now()+Math.max(1,Number(cfg&&cfg.adminMin)||5)*60000));else ss.del(ADMIN);onChange()}
 function touch(){if(protectOn()&&isAdmin())ss.set(ADMIN,String(Date.now()+Math.max(1,Number(cfg.adminMin)||5)*60000))}
 ['pointerdown','keydown'].forEach(ev=>document.addEventListener(ev,touch,{passive:true,capture:true}));

 /* ---------- écran de saisie ---------- */
 function show(opt){
  const d=ensureDom();pending=opt;
  d.classList.add('show');d.classList.toggle('dim',!!opt.dim);
  const numeric=cfg&&cfg.numeric;
  d.innerHTML=`<div class="vr-card" id="vrCard"><div class="vr-ico">${opt.icon||'🔒'}</div><h2>${escH(opt.title)}</h2><p>${escH(opt.sub||'')}</p>
   <form id="vrForm" autocomplete="off" novalidate onsubmit="return false">${opt.recovery?'<input id="vrPw" type="text" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" placeholder="XXXX-XXXX">':`<input id="vrPw" type="password" ${numeric?'inputmode="numeric"':''} autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Mot de passe">`}
   <div class="vr-err" id="vrErr"></div><button type="submit" class="vr-go" id="vrGo">${opt.recovery?'Valider le code':'Déverrouiller'}</button></form>
   ${opt.cancellable?'<button id="vrCancel">Annuler</button>':''}
   ${opt.recovery?'<button class="vr-link" id="vrBack">← Revenir au mot de passe</button>':'<button class="vr-link" id="vrForgot">Mot de passe oublié ?</button>'}</div>`;
  const pw=d.querySelector('#vrPw');
  d.querySelector('#vrForm').onsubmit=e=>{e.preventDefault();submit();return false};
  if(opt.cancellable)d.querySelector('#vrCancel').onclick=()=>{hide();opt.onCancel&&opt.onCancel()};
  const f=d.querySelector('#vrForgot');if(f)f.onclick=()=>show({...opt,recovery:true,icon:'🛟',sub:'Saisis le code de secours noté lors de la création du mot de passe.'});
  const b=d.querySelector('#vrBack');if(b)b.onclick=()=>show({...opt,recovery:false,icon:opt.icon0||'🔒',sub:opt.sub0||opt.sub});
  setTimeout(()=>{try{pw.focus()}catch(_){}},60);
 }
 function hide(){const d=document.getElementById('vrLock');if(d){d.classList.remove('show');d.innerHTML=''}pending=null}
 async function submit(){
  const opt=pending;if(!opt)return;
  const d=document.getElementById('vrLock'),pw=d.querySelector('#vrPw'),err=d.querySelector('#vrErr'),card=d.querySelector('#vrCard');
  const now=Date.now();if(now<blockedUntil){err.textContent=`Trop d’essais : patiente ${Math.ceil((blockedUntil-now)/1000)} s`;return}
  const v=pw.value;if(!v){err.textContent='Saisis le '+(opt.recovery?'code':'mot de passe');return}
  let ok=false;
  if(opt.recovery)ok=!!cfg.recoveryHash&&(await hashPw(v.trim().toUpperCase().replace(/[^A-Z0-9]/g,''),cfg.salt))===cfg.recoveryHash;
  else ok=(await hashPw(v,cfg.salt))===cfg.hash;
  if(ok){fails=0;hide();opt.onOk&&opt.onOk({recovery:!!opt.recovery});return}
  fails++;pw.value='';card.classList.remove('vr-shake');void card.offsetWidth;card.classList.add('vr-shake');
  if(fails>=5){blockedUntil=Date.now()+30000*Math.pow(2,Math.min(4,fails-5));err.textContent='Trop d’essais : patiente '+Math.round((blockedUntil-Date.now())/1000)+' s'}
  else err.textContent=opt.recovery?'Code incorrect':'Mot de passe incorrect';
  try{navigator.vibrate&&navigator.vibrate(80)}catch(_){}
 }

 /* ---------- API ---------- */
 function startupScreen(after){
  show({title:'Suivi de classe',sub:'Saisis ton mot de passe pour ouvrir l’appli.',sub0:'Saisis ton mot de passe pour ouvrir l’appli.',icon0:'🔒',
   onOk:r=>{ss.set(UNLOCKED,'1');if(r.recovery){setAdmin(true)}onChange();after&&after(r)}});
 }
 function boot(lockCfg,opt={}){
  cfg=lockCfg&&lockCfg.hash?lockCfg:null;onChange=opt.onChange||onChange;
  if(enabled())ls.set(HINT,'1');else{ls.del(HINT);ss.del(ADMIN)}
  if(startupOn()&&ss.get(UNLOCKED)!=='1'){startupScreen(opt.afterUnlock)}
  else{hide();opt.afterUnlock&&opt.afterUnlock({})}
  onChange();
 }
 function requireAdmin(next,label,onCancel){
  if(isAdmin())return next();
  show({title:'Accès protégé',sub:(label?label+' · ':'')+'mot de passe nécessaire (mode classe actif).',sub0:(label?label+' · ':'')+'mot de passe nécessaire (mode classe actif).',icon:'🔐',icon0:'🔐',dim:true,cancellable:true,onCancel,
   onOk:r=>{setAdmin(true);next(r)}});
 }
 function lockNow(){setAdmin(false)}
 document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'){hiddenAt=Date.now();return}
  if(!enabled()||!hiddenAt)return;
  const away=Date.now()-hiddenAt;hiddenAt=0;
  if(startupOn()&&away>=Math.max(0,Number(cfg.relockMin??5))*60000){ss.del(UNLOCKED);ss.del(ADMIN);onChange();startupScreen(pendingAfter)}
 });
 let pendingAfter=null;
 async function create(pw,options){
  const salt=randomStr(16,'abcdefghijklmnopqrstuvwxyz0123456789');const rec=randomStr(8);
  const c={hash:await hashPw(pw,salt),salt,recoveryHash:await hashPw(rec,salt),numeric:/^\d+$/.test(pw),startup:true,protectAdmin:true,relockMin:5,adminMin:5,createdAt:new Date().toISOString(),...(options||{})};
  return{cfg:c,recoveryCode:rec.slice(0,4)+'-'+rec.slice(4)};
 }
 async function changePassword(oldCfg,pw){
  // garde le code de secours existant (même sel)
  return{...oldCfg,hash:await hashPw(pw,oldCfg.salt),numeric:/^\d+$/.test(pw),updatedAt:new Date().toISOString()};
 }
 async function newRecovery(oldCfg){const rec=randomStr(8);return{cfg:{...oldCfg,recoveryHash:await hashPw(rec,oldCfg.salt)},recoveryCode:rec.slice(0,4)+'-'+rec.slice(4)}}
 function setConfig(c){cfg=c&&c.hash?c:null;if(enabled()){ls.set(HINT,'1');ss.set(UNLOCKED,'1')}else{ls.del(HINT);ss.del(ADMIN)}onChange()}
 function setAfterUnlock(fn){pendingAfter=fn}
 function coverIfNotAdmin(){if(ls.get(HINT)==='1'&&!(Number(ss.get(ADMIN)||0)>Date.now())){const d=ensureDom();d.classList.add('show');d.classList.remove('dim')}}
 return{earlyCover,coverIfNotAdmin,boot,requireAdmin,isAdmin,setAdmin,lockNow,enabled,protectOn,startupOn,create,changePassword,newRecovery,setConfig,setAfterUnlock,getConfig:()=>cfg};
})();
Verrou.earlyCover();
