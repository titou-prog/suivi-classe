/* © 2026 Tristan Zanchi. Tous droits réservés. Voir LICENCE.txt */
/* Chiffrement des sauvegardes — Suivi de classe
   AES-GCM 256 bits, clé dérivée du mot de passe par PBKDF2-SHA-256 (600 000 itérations, sel aléatoire).
   Le fichier produit ne contient ni le mot de passe ni rien de lisible : sans le mot de passe, impossible de l'ouvrir.
   Utilisé par app.js (Suivi de classe) et progression.html. */
(function(){
 'use strict';
 var FORMAT='suivi-classe-chiffre',ITER=600000;
 function b64(buf){var b=new Uint8Array(buf),s='',CH=0x8000;for(var i=0;i<b.length;i+=CH)s+=String.fromCharCode.apply(null,b.subarray(i,i+CH));return btoa(s);}
 function unb64(str){var s=atob(str),b=new Uint8Array(s.length);for(var i=0;i<s.length;i++)b[i]=s.charCodeAt(i);return b;}
 function ok(){return !!(window.crypto&&crypto.subtle&&window.TextEncoder);}
 async function key(pwd,salt,iter){
  var base=await crypto.subtle.importKey('raw',new TextEncoder().encode(pwd),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:salt,iterations:iter},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
 }
 async function encrypt(obj,pwd,app){
  if(!ok())throw new Error('Chiffrement indisponible sur ce navigateur');
  var salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
  var k=await key(pwd,salt,ITER);
  var data=await crypto.subtle.encrypt({name:'AES-GCM',iv:iv},k,new TextEncoder().encode(JSON.stringify(obj)));
  return JSON.stringify({_format:FORMAT,v:1,app:app||'suivi-classe',chiffre:'AES-GCM-256',kdf:{name:'PBKDF2',hash:'SHA-256',iter:ITER,salt:b64(salt)},iv:b64(iv),data:b64(data)});
 }
 function isEncrypted(x){return !!(x&&typeof x==='object'&&x._format===FORMAT&&x.data&&x.iv&&x.kdf);}
 async function decrypt(env,pwd){
  if(!ok())throw new Error('Déchiffrement indisponible sur ce navigateur');
  var k=await key(pwd,unb64(env.kdf.salt),env.kdf.iter||ITER);
  var plain;
  try{plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(env.iv)},k,unb64(env.data));}
  catch(e){var er=new Error('Mot de passe incorrect (ou fichier modifié).');er.badPassword=true;throw er;}
  return JSON.parse(new TextDecoder().decode(plain));
 }
 /* Fenêtre de saisie du mot de passe (champ masqué). confirm:true = demande deux fois (création). */
 function askPassword(opt){
  opt=opt||{};
  return new Promise(function(resolve){
   var ov=document.createElement('div');
   ov.style.cssText='position:fixed;inset:0;z-index:2147483646;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:-apple-system,system-ui,sans-serif';
   var dark=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches&&document.documentElement.dataset.theme!=='light';
   var bg=dark?'#1e293b':'#fff',fg=dark?'#f1f5f9':'#0f172a',mu=dark?'#94a3b8':'#475569',bd=dark?'#334155':'#cbd5e1';
   var inp='width:100%;box-sizing:border-box;font-size:18px;padding:12px;border-radius:10px;border:1px solid '+bd+';background:'+(dark?'#0f172a':'#f8fafc')+';color:'+fg+';margin-top:6px';
   ov.innerHTML='<div style="background:'+bg+';color:'+fg+';border-radius:16px;max-width:440px;width:100%;padding:20px;box-shadow:0 20px 50px rgba(0,0,0,.3)">'
    +'<div style="font-size:19px;font-weight:800">🔒 '+(opt.title||'Mot de passe de la sauvegarde')+'</div>'
    +'<div style="font-size:14px;color:'+mu+';margin:6px 0 10px">'+(opt.text||'')+'</div>'
    +'<input id="scp1" type="password" autocomplete="'+(opt.confirm?'new-password':'current-password')+'" placeholder="Mot de passe" style="'+inp+'">'
    +(opt.confirm?'<input id="scp2" type="password" autocomplete="new-password" placeholder="Confirme le mot de passe" style="'+inp+'">':'')
    +'<label style="display:flex;gap:8px;align-items:center;font-size:14px;color:'+mu+';margin-top:10px"><input id="scpv" type="checkbox" style="width:20px;height:20px"> Afficher</label>'
    +'<div id="scperr" style="color:#dc2626;font-weight:700;font-size:14px;min-height:20px;margin-top:6px"></div>'
    +'<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px"><button id="scpno" style="font-size:16px;padding:10px 16px;border-radius:10px;border:1px solid '+bd+';background:transparent;color:'+fg+'">Annuler</button>'
    +'<button id="scpok" style="font-size:16px;padding:10px 18px;border-radius:10px;border:0;background:#4f46e5;color:#fff;font-weight:700">'+(opt.okLabel||'Valider')+'</button></div></div>';
   document.body.appendChild(ov);
   var p1=ov.querySelector('#scp1'),p2=ov.querySelector('#scp2'),err=ov.querySelector('#scperr');
   setTimeout(function(){try{p1.focus();}catch(e){}},50);
   ov.querySelector('#scpv').onchange=function(){var t=this.checked?'text':'password';p1.type=t;if(p2)p2.type=t;};
   function close(v){ov.remove();resolve(v);}
   ov.querySelector('#scpno').onclick=function(){close(null);};
   function go(){var a=p1.value;if(!a){err.textContent='Saisis un mot de passe.';return;}
    if(opt.confirm){if(a.length<8){err.textContent='8 caractères minimum.';return;}if(a!==p2.value){err.textContent='Les deux mots de passe sont différents.';return;}}
    close(a);}
   ov.querySelector('#scpok').onclick=go;
   ov.addEventListener('keydown',function(e){if(e.key==='Enter')go();if(e.key==='Escape')close(null);});
  });
 }
 /* Demande le mot de passe et déchiffre, avec 3 essais. Renvoie l'objet, ou null si annulé. */
 async function decryptInteractive(env,label){
  for(var t=0;t<3;t++){
   var pwd=await askPassword({title:'Sauvegarde chiffrée',text:(label?label+' — ':'')+'saisis le mot de passe choisi lors de la sauvegarde.'+(t?'<br><b style="color:#dc2626">Mot de passe incorrect, réessaie.</b>':''),okLabel:'Ouvrir'});
   if(pwd===null)return null;
   try{return await decrypt(env,pwd);}catch(e){if(!e.badPassword)throw e;}
  }
  throw new Error('Mot de passe incorrect : import annulé.');
 }
 window.SCCrypto={encrypt:encrypt,decrypt:decrypt,isEncrypted:isEncrypted,askPassword:askPassword,decryptInteractive:decryptInteractive,available:ok};
})();
