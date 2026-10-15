// =====================================================================================================
// GIOCHI DI NATAN (nucleo): menu, tutorial, lobby (livelli, numero di giocatori, online), bot con nome ed esperienza,
// consiglio dei 35 agenti dietro ogni bot e motore delle partite a turni.
// I giochi veri stanno in giochi-a.js (scacchi, dama), giochi-b.js (tris, 4 di fila, Uno, scopa, briscola)
// e giochi-c.js (hockey da tavolo, sling puck).
//
// Come funziona un bot: per ogni mossa possibile il gioco calcola alcune caratteristiche (valore, punti, attacco, difesa,
// rischio...). Ognuno dei 35 agenti le pesa a modo suo e vota; vince la mossa con più voti. Ogni bot ha i suoi pesi
// (che si correggono dopo ogni partita) e la sua esperienza (partite, vittorie, punti esperienza), salvati su questo dispositivo.
(function(){
"use strict";
const E=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined&&txt!==null)n.textContent=txt;return n};
const LSG={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const rnd=n=>Math.floor(Math.random()*n);
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function shuffle(a,R){R=R||Math.random;for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const SLOW=()=>(window.NATAN_GIOCHI_VELOCE?0:1);
function h32(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}

// ------------------------------------------------------------------ stile
const CSS=`
.gm{display:flex;flex-direction:column;gap:14px;max-width:880px;margin:0 auto;width:100%}
.gm .top{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.gm h1{margin:0}
.gm .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}
.gm .gcard{background:var(--raise);border:1px solid var(--line);border-radius:18px;padding:18px 14px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;transition:transform .15s,border-color .15s;text-align:center;color:var(--text)}
.gm .gcard:hover{transform:translateY(-3px);border-color:var(--acc)}
.gm .gcard .ic{font-size:44px;line-height:1}
.gm .gcard small{color:var(--muted);font-size:13px}
.gm .ng{display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,#1d1f3a,#2a1840);border-radius:16px;padding:12px 14px;color:#fff}
.gm .ng .lg{width:38px;height:38px;border-radius:11px;background:conic-gradient(from 0deg,#7c83ff,#c06bff,#7c83ff);display:grid;place-items:center;font-weight:800}
.gm .ng .tx{flex:1;min-width:0}.gm .ng .tx b{display:block}.gm .ng .tx span{font-size:13px;opacity:.85}
.gm .think{font-size:13px;color:var(--muted);min-height:18px}
.gm .agents{display:flex;flex-wrap:wrap;gap:3px}.gm .agents i{font-style:normal;font-size:10.5px;padding:2px 6px;border-radius:999px;background:var(--raise);color:var(--muted);border:1px solid var(--line)}
.gm .agents i.on{background:var(--acc);color:#fff;border-color:var(--acc)}
.gm .status{font-weight:600}
.gm .board{display:grid;grid-template-columns:repeat(8,1fr);width:min(100%,520px);aspect-ratio:1;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.35);align-self:center;user-select:none;-webkit-user-select:none}
.gm .sq{display:grid;place-items:center;position:relative;cursor:pointer;font-size:min(9vw,46px);line-height:1}
.gm .sq.l{background:#e9dcc3}.gm .sq.d{background:#a77b56}
.gm .sq.sel{box-shadow:inset 0 0 0 4px #7c83ff}.gm .sq.last{box-shadow:inset 0 0 0 4px rgba(255,214,90,.75)}
.gm .sq.mv::after{content:"";width:28%;height:28%;border-radius:50%;background:rgba(40,40,60,.35)}
.gm .sq.cap::after{content:"";position:absolute;inset:6%;border-radius:50%;border:4px solid rgba(40,40,60,.35)}
.gm .pw{color:#fff;-webkit-text-stroke:1.2px #222;text-shadow:0 2px 3px rgba(0,0,0,.45)}.gm .pb{color:#1a1a1a;-webkit-text-stroke:.6px #000;text-shadow:0 1px 2px rgba(255,255,255,.35)}
.gm .man{width:78%;height:78%;border-radius:50%;display:grid;place-items:center;font-size:min(5vw,24px);box-shadow:inset 0 -4px 0 rgba(0,0,0,.25),0 3px 6px rgba(0,0,0,.4)}
.gm .man.w{background:radial-gradient(circle at 35% 30%,#fff,#d8d8d8)}.gm .man.b{background:radial-gradient(circle at 35% 30%,#555,#111);color:#ffd75a}
.gm .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.gm .hand{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;min-height:104px}
.gm .hand.sm{min-height:0;gap:3px}.gm .hand.sm .card{width:26px;height:38px;border-width:2px;border-radius:5px}
.gm .table{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;min-height:104px;padding:10px;border-radius:16px;background:radial-gradient(ellipse at center,#1f6b45,#134a30)}
.gm .card{width:64px;height:96px;border-radius:10px;background:#fff;color:#222;display:flex;flex-direction:column;justify-content:space-between;padding:5px 6px;box-shadow:0 3px 8px rgba(0,0,0,.35);cursor:pointer;font-weight:700;position:relative;transition:transform .12s;flex:0 0 auto}
.gm .card:hover{transform:translateY(-4px)}.gm .card.no{opacity:.45;cursor:default}.gm .card.no:hover{transform:none}
.gm .card .v{font-size:20px;line-height:1}.gm .card .s{font-size:30px;text-align:center;line-height:1}.gm .card .v2{font-size:12px;text-align:right;opacity:.7}
.gm .card.back{background:repeating-linear-gradient(45deg,#3b3f8f,#3b3f8f 6px,#4b51b0 6px,#4b51b0 12px);border:3px solid #fff;cursor:default}
.gm .card.pick{outline:4px solid #ffd75a}
.gm .card.u{color:#fff;align-items:center;justify-content:center;text-align:center}
.gm .card.u .big{font-size:30px;font-weight:900;background:rgba(255,255,255,.95);border-radius:50%;width:48px;height:48px;display:grid;place-items:center;transform:rotate(-12deg)}
.gm .card.u.r{background:#e2463c}.gm .card.u.g{background:#f2c230}.gm .card.u.v{background:#33a65a}.gm .card.u.b{background:#2f6fd6}.gm .card.u.n{background:conic-gradient(#e2463c 0 25%,#f2c230 0 50%,#33a65a 0 75%,#2f6fd6 0)}
.gm .card.u.r .big{color:#e2463c}.gm .card.u.g .big{color:#c79a10}.gm .card.u.v .big{color:#33a65a}.gm .card.u.b .big{color:#2f6fd6}.gm .card.u.n .big{color:#222}
.gm .tut{background:var(--raise);border:1px solid var(--line);border-radius:18px;padding:20px;display:flex;flex-direction:column;gap:12px}
.gm .tut .ill{font-size:54px;text-align:center}.gm .tut .dots{display:flex;gap:6px;justify-content:center}.gm .tut .dots i{width:8px;height:8px;border-radius:50%;background:var(--line)}.gm .tut .dots i.on{background:var(--acc)}
.gm .score{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;font-size:14px}.gm .score b{background:var(--raise);padding:6px 10px;border-radius:10px}
.gm .msg{text-align:center;min-height:22px}
.gm .end{background:linear-gradient(135deg,#232552,#3a1f55);color:#fff;border-radius:18px;padding:18px;text-align:center;display:flex;flex-direction:column;gap:10px;align-items:center}
.gm .end .pl{color:var(--text);text-align:left}
.gm .box{background:var(--raise);border:1px solid var(--line);border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:10px}
.gm .box h3{margin:0;font-size:15px}
.gm .seg{display:flex;gap:6px;flex-wrap:wrap}
.gm .seg button{border:1px solid var(--line);background:transparent;color:var(--text);border-radius:12px;padding:9px 14px;cursor:pointer;font:inherit}
.gm .seg button.on{background:var(--acc);color:#fff;border-color:var(--acc)}
.gm .stepper{display:flex;align-items:center;gap:12px}.gm .stepper b{font-size:22px;min-width:24px;text-align:center}
.gm .stepper button{width:38px;height:38px;border-radius:50%;border:1px solid var(--line);background:transparent;color:var(--text);font-size:20px;cursor:pointer}
.gm .stepper button:disabled{opacity:.35;cursor:default}
.gm .prog{height:6px;border-radius:4px;background:rgba(127,127,160,.25);overflow:hidden;margin:6px 0}.gm .prog i{display:block;height:100%;background:linear-gradient(90deg,#7c83ff,#3ecf8e)}
.gm .trg{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;margin-top:12px}
.gm .tro{border:1px solid rgba(127,127,160,.35);border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:3px;opacity:.72}
.gm .tro.ok{opacity:1;border-color:#f5b84a;background:rgba(245,184,74,.10)}.gm .tro .ic{font-size:30px}
.gm .newtro{margin-top:8px;padding:8px 12px;border-radius:10px;background:rgba(245,184,74,.18);border:1px solid #f5b84a;font-weight:700;font-size:13px}
.gm .pls{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px}
.gm .pl{border:1px solid var(--line);border-radius:14px;padding:10px 12px;display:flex;flex-direction:column;gap:2px;font-size:13px;position:relative;background:var(--raise)}
.gm .pl.turn{border-color:var(--acc);box-shadow:0 0 0 2px var(--acc)}
.gm .pl b{font-size:15px}.gm .pl small{color:var(--muted)}
.gm .pl .xp{height:5px;border-radius:3px;background:var(--line);overflow:hidden;margin-top:3px}.gm .pl .xp i{display:block;height:100%;background:linear-gradient(90deg,#7c83ff,#c06bff)}
.gm .code{font-size:34px;font-weight:800;letter-spacing:6px;text-align:center;padding:8px;border-radius:14px;border:2px dashed var(--acc)}
.gm input.tx{border:1px solid var(--line);background:transparent;color:var(--text);border-radius:12px;padding:10px 12px;font:inherit}
.gm .ttt{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:min(100%,340px);align-self:center}
.gm .ttt button{aspect-ratio:1;border-radius:14px;border:1px solid var(--line);background:var(--raise);font-size:min(16vw,64px);font-weight:800;cursor:pointer;color:var(--text)}
.gm .ttt button.x{color:#e2463c}.gm .ttt button.o{color:#2f6fd6}.gm .ttt button.win{background:#ffe9a8;color:#222}
.gm .f4{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;width:min(100%,460px);align-self:center;background:#2f4fb3;padding:8px;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.35)}
.gm .f4 .cl{aspect-ratio:1;border-radius:50%;background:#101a40;display:block;position:relative;cursor:pointer;border:0;padding:0}
.gm .f4 .cl.p0{background:radial-gradient(circle at 35% 30%,#ff9a8f,#e2463c)}.gm .f4 .cl.p1{background:radial-gradient(circle at 35% 30%,#ffe98a,#e5b710)}
.gm .f4 .cl.win{box-shadow:0 0 0 4px #fff,0 0 14px #fff}.gm .f4 .cl.last{outline:3px solid rgba(255,255,255,.7)}
.gm canvas.rt{width:min(100%,420px);align-self:center;border-radius:16px;touch-action:none;background:#0d1b3a;box-shadow:0 8px 24px rgba(0,0,0,.4)}
.ngintro{position:fixed;inset:0;z-index:999;display:grid;place-items:center;background:radial-gradient(circle at center,#24205a,#0b0b16 70%);animation:ngout .45s ease-in 1.35s forwards;pointer-events:none}
.ngintro .c{display:flex;flex-direction:column;align-items:center;gap:14px;color:#fff;animation:ngin .9s cubic-bezier(.2,1.4,.4,1) both}
.ngintro .lg{width:110px;height:110px;border-radius:30px;display:grid;place-items:center;font-size:56px;background:conic-gradient(from 0deg,#7c83ff,#c06bff,#ff7cc8,#7c83ff);animation:ngspin 1.6s linear infinite;box-shadow:0 0 60px rgba(160,123,255,.7)}
.ngintro .lg span{animation:ngspin 1.6s linear infinite reverse}
.ngintro b{font-size:30px;letter-spacing:.5px}.ngintro small{opacity:.8}
.ngintro i{position:absolute;width:8px;height:8px;border-radius:50%;background:#c06bff;animation:ngp 1.3s ease-out forwards;opacity:0}
@keyframes ngin{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes ngspin{to{transform:rotate(360deg)}}
@keyframes ngout{to{opacity:0;visibility:hidden}}
@keyframes ngp{0%{opacity:1;transform:translate(0,0)}100%{opacity:0;transform:translate(var(--x),var(--y))}}
`;
function style(){if(document.getElementById("gmcss"))return;const s=E("style");s.id="gmcss";s.textContent=CSS;document.head.append(s)}

function intro(){
  if(window.NATAN_GIOCHI_VELOCE)return;
  const o=E("div","ngintro");const c=E("div","c");const lg=E("div","lg");lg.append(E("span","","🎮"));c.append(lg,E("b","","Natan Gaming"),E("small","","30 bot con 35 agenti ciascuno pronti a sfidarti"));o.append(c);
  for(let i=0;i<26;i++){const p=E("i");const a=Math.random()*Math.PI*2,d=120+Math.random()*220;p.style.cssText=`left:50%;top:50%;--x:${Math.cos(a)*d}px;--y:${Math.sin(a)*d}px;animation-delay:${.2+Math.random()*.5}s;background:${["#7c83ff","#c06bff","#ff7cc8","#ffd75a"][i%4]}`;o.append(p)}
  document.body.append(o);setTimeout(()=>o.remove(),2000)
}

// ------------------------------------------------------------------ livelli
const LIV=[{id:"normale",nome:"Normale",ic:"🟢",err:.35},{id:"medio",nome:"Medio",ic:"🟡",err:.15},{id:"difficile",nome:"Difficile",ic:"🟠",err:.04},{id:"estremo",nome:"Estremo",ic:"🔴",err:0}];

// ------------------------------------------------------------------ i 35 agenti
// caratteristiche di ogni mossa (tutte circa tra -1 e +1)
const F=["valore","punti","attacco","difesa","rischio","conserva","posizione","futuro","finale"];
const AGENTI=[
  ["Calcolatore",{valore:3}],["Contabile",{punti:2,valore:1}],["Attaccante",{attacco:2,punti:.5}],["Difensore",{difesa:2,rischio:-1.5}],
  ["Prudente",{rischio:-2.5,valore:.5}],["Risparmiatore",{conserva:2}],["Stratega",{posizione:2,futuro:1}],["Visionario",{futuro:2.5}],
  ["Finalista",{finale:2.5,punti:.5}],["Cacciatore",{attacco:1.5,finale:1}],["Equilibrato",{valore:1,punti:1,difesa:1,posizione:1}],
  ["Tattico",{valore:1.5,attacco:1}],["Paziente",{conserva:1,difesa:1,rischio:-.5}],["Coraggioso",{attacco:1.5,rischio:.3}],
  ["Centrista",{posizione:2.5}],["Osservatore",{difesa:1,futuro:1}],["Memoria",{conserva:1,punti:1}],["Probabilista",{valore:1,rischio:-1}],
  ["Analista",{valore:2,punti:1}],["Matematico",{valore:2.5,futuro:.5}],["Azzardo",{rischio:1.2,attacco:1}],["Veterano",{valore:1,conserva:1,finale:1}],
  ["Cecchino",{attacco:2.5}],["Muro",{difesa:2.5}],["Architetto",{posizione:1.5,futuro:1.5}],["Fiutatore",{punti:1.5,attacco:1}],
  ["Maratoneta",{finale:1.5,conserva:1}],["Bluff",{rischio:.8,futuro:1}],["Scudiero",{difesa:1.5,conserva:1}],["Esploratore",{futuro:1.5,posizione:1}],
  ["Giudice",{valore:1.5,difesa:1,rischio:-1}],["Velocista",{punti:2,attacco:1}],["Saggio",{valore:1,futuro:1,difesa:1,finale:1}],
  ["Sorpresa",{}],["Allenatore",{}]];
const NAG=AGENTI.length;   // 35

// ------------------------------------------------------------------ i bot: nome, esperienza, 35 agenti
const NOMI=["Pino","Luna","Bruno","Stella","Nico","Gaia","Rocco","Mia","Teo","Sara","Leo","Viola","Dado","Ada","Otto","Zoe","Franz","Iris","Gigi","Nora","Max","Lia","Ugo","Elsa","Kiro","Bea","Toto","Vera","Ciro","Pia"];
const BOTS=NOMI.map(n=>({id:n.toLowerCase(),nome:n}));
const TITOLI=["Novizio","Allievo","Esperto","Maestro","Campione","Leggenda"];
const baseXp=id=>30+(h32("xp"+id)%25)*35;                      // ogni bot parte già con un po' di esperienza (da 30 a 870)
const livello=xp=>1+Math.floor(Math.sqrt(xp/20));
const titolo=l=>TITOLI[Math.min(TITOLI.length-1,Math.floor((l-1)/2))];
function allRec(){return LSG.get("natan_bots",{})}
function botInfo(id){const r=allRec()[id]||{};const xp=r.xp==null?baseXp(id):r.xp;const l=livello(xp);
  const sotto=20*(l-1)*(l-1),sopra=20*l*l;
  return {id,p:r.p||0,v:r.v||0,s:r.s||0,n:r.n||0,xp,liv:l,titolo:titolo(l),perc:Math.max(0,Math.min(100,Math.round((xp-sotto)*100/(sopra-sotto))))}}
function pesiBot(id,game){const all=allRec();const r=all[id]||{};const w=r.w&&r.w[game];
  if(Array.isArray(w)&&w.length===NAG)return w.slice();
  return AGENTI.map((a,i)=>.65+.7*((h32(id+"|"+game+"|"+a[0])%1000)/1000))}      // ogni bot ha un «carattere» suo
function salvaBot(id,game,w,esito,lv){
  const all=allRec();const r=all[id]||{p:0,v:0,s:0,n:0,xp:baseXp(id),w:{}};r.w=r.w||{};if(w)r.w[game]=w.map(x=>Math.round(x*1000)/1000);
  if(esito!==undefined){r.p=(r.p||0)+1;esito===true?r.v=(r.v||0)+1:esito===false?r.s=(r.s||0)+1:r.n=(r.n||0)+1;
    r.xp=(r.xp==null?baseXp(id):r.xp)+8+(esito===true?18:esito===null?8:3)+lv*3}
  all[id]=r;LSG.set("natan_bots",all);
  try{if(window.natanGiochiSync)window.natanGiochiSync(all)}catch(e){}
}
// sceglie tra le mosse candidate: ognuna con .f = caratteristiche. Ritorna {mossa, decide, favor, voti}
function consiglio(game,cands,bot,lv){
  if(cands.length===1)return {mossa:cands[0],decide:"Calcolatore",favor:["Calcolatore"],voti:NAG,unica:true};
  const id=(bot&&bot.id)||"natan";const w=pesiBot(id,game);const tot=cands.map(()=>0);const migliore=AGENTI.map(()=>0);
  AGENTI.forEach(([nome,pp],ai)=>{
    let best=-1e9,bi=0;
    cands.forEach((c,i)=>{let s=0;
      if(nome==="Sorpresa")s=Math.random();
      else if(nome==="Allenatore")s=F.reduce((a,k)=>a+Math.max(0,c.f[k]||0),0)+(c.f.valore||0);
      else for(const k in pp)s+=pp[k]*(c.f[k]||0);
      if(s>best){best=s;bi=i}});
    migliore[ai]=bi;tot[bi]+=w[ai]*(nome==="Sorpresa"?.35:1)});
  let bi=0;tot.forEach((v,i)=>{if(v>tot[bi])bi=i});
  let errore=false;if(Math.random()<(LIV[lv==null?3:lv].err)){bi=rnd(cands.length);errore=true}
  const favor=AGENTI.map((a,i)=>i).filter(i=>migliore[i]===bi);
  const decide=(favor.slice().sort((a,b)=>w[b]-w[a])[0])||0;
  return {mossa:cands[bi],decide:AGENTI[decide][0],favor:favor.map(i=>AGENTI[i][0]),voti:favor.length,errore,pesi:w}
}
// fine partita: l'allenatore rinforza gli agenti che erano d'accordo con le mosse se il bot ha vinto, li indebolisce se ha perso
function allena(bot,game,storia,esito,lv){
  const w=pesiBot(bot.id,game);const nomi=AGENTI.map(a=>a[0]);
  if(esito!==null)for(const fav of storia)for(const n of fav){const i=nomi.indexOf(n);if(i>=0)w[i]=Math.max(.3,Math.min(3,w[i]*(esito?1.03:.97)))}
  salvaBot(bot.id,game,w,esito,lv)
}
function scegliBot(n,escludi){const pool=shuffle(BOTS.filter(b=>!(escludi||[]).includes(b.id)));return pool.slice(0,Math.max(0,n))}

// ------------------------------------------------------------------ pezzi grafici comuni
function botCard(b,extra){const i=botInfo(b.id);const d=E("div","pl");d.dataset.bot=b.id;
  d.append(E("b","","🤖 "+b.nome),E("small","",`Liv. ${i.liv} · ${i.titolo} · ${i.xp} XP`),E("small","",`${i.p} partite · ${i.v} vittorie`),E("small","","🧠 35 agenti dietro di lui"));
  const x=E("div","xp");const bar=E("i");bar.style.width=i.perc+"%";x.append(bar);d.append(x);if(extra)d.append(extra);return d}

function ngPanel(){
  const p=E("div","ng");const lg=E("div","lg","N");const tx=E("div","tx");tx.append(E("b","","Natan Gaming"),E("span","","30 bot · 35 agenti dietro ogni bot"));p.append(lg,tx);
  const th=E("div","think");const ag=E("div","agents");AGENTI.forEach(a=>ag.append(E("i","",a[0])));
  return {el:[p,th,ag],think:(t,favor,chi)=>{th.textContent=t||"";[...ag.children].forEach(i=>i.classList.toggle("on",!!favor&&favor.includes(i.textContent)));if(chi!==undefined)p.querySelector(".tx b").textContent=chi||"Natan Gaming"}}
}

// ------------------------------------------------------------------ tutorial
function tutorial(pg,info,start){
  pg.innerHTML="";const g=E("div","gm");pg.append(g);
  const top=E("div","top");const back=E("button","btn ghost","← Ritorna ai giochi");back.onclick=()=>menu(pg);top.append(back);g.append(top);
  g.append(E("h1","",info.ic+" "+info.nome));
  const box=E("div","tut");g.append(box);let k=0;
  const draw=()=>{box.innerHTML="";const s=info.tut[k];
    box.append(E("div","ill",s[0]),E("h2","",s[1]),E("p","",s[2]));
    const d=E("div","dots");info.tut.forEach((_,i)=>d.append(E("i",i===k?"on":"")));box.append(d);
    const r=E("div","row");r.style.justifyContent="space-between";
    const skip=E("button","btn ghost","Salta il tutorial");skip.onclick=start;
    const nx=E("button","btn",k<info.tut.length-1?"Avanti →":"Continua");nx.id="tutNext";nx.onclick=()=>{if(k<info.tut.length-1){k++;draw()}else start()};
    r.append(skip,nx);box.append(r)};
  draw()
}

// ------------------------------------------------------------------ rete (stanze online con PeerJS)
const CODEALF="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function genCode(){let s="";for(let i=0;i<5;i++)s+=CODEALF[rnd(CODEALF.length)];return s}
const pulisci=s=>String(s||"").replace(/[^\p{L}\p{N} _\-]/gu,"").trim().slice(0,14);
function nickSalvato(){return pulisci(LSG.get("natan_gaming_nick",""))||pulisci((LSG.get("natan_profilo",{})||{}).name)||"Giocatore"}
class Net{
  constructor(host){this.host=host;this.q=[];this.w=[];this.h={};this.conns=[];this.peer=null;this.code="";this.up=null}
  push(m){for(let i=0;i<this.w.length;i++){if(this.w[i].p(m)){const x=this.w.splice(i,1)[0];x.r(m);return}}this.q.push(m)}
  next(p){const i=this.q.findIndex(p);if(i>=0)return Promise.resolve(this.q.splice(i,1)[0]);return new Promise(r=>this.w.push({p,r}))}
  reset(){this.q=[];this.w=[]}
  dispatch(m,ent){if(m&&this.h[m.t]){try{this.h[m.t](m,ent)}catch(e){console.error(e)}}else this.push(m)}
  bcast(m){for(const c of this.conns){if(c.conn&&c.conn.open){try{c.conn.send(m)}catch(e){}}}}
  send(m){if(this.up&&this.up.open){try{this.up.send(m)}catch(e){}}}
  close(){try{if(this.host)this.bcast({t:"bye"});else this.send({t:"addio"})}catch(e){}
    const p=this.peer;this.peer=null;setTimeout(()=>{try{p&&p.destroy()}catch(e){}},200)}
}
async function stanzaNuova(nick,onChange){
  if(!window.natanPeerLib)throw new Error("La rete non è disponibile.");
  const P=await window.natanPeerLib();const net=new Net(true);net.nick=nick;net.max=2;
  for(let tent=0;tent<6&&!net.peer;tent++){
    const code=genCode();
    await new Promise(res=>{let p;try{p=new P("natan-gioco-"+code)}catch(e){return res()}
      const t=setTimeout(()=>{try{p.destroy()}catch(e){}res()},9000);
      p.on("open",()=>{clearTimeout(t);net.peer=p;net.code=code;res()});
      p.on("error",e=>{if(!net.peer){clearTimeout(t);try{p.destroy()}catch(x){}res()}})})}
  if(!net.peer)throw new Error("Non riesco a collegarmi alla rete: riprova tra poco.");
  net.peer.on("connection",c=>{
    const ent={conn:c,nome:null,seat:-1,fine:false};
    const gone=()=>{if(ent.fine)return;ent.fine=true;const i=net.conns.indexOf(ent);
      if(i>=0){if(!net.started){net.conns.splice(i,1);onChange&&onChange();net.stato()}else if(net.h.partito)net.h.partito(ent)}};
    c.on("data",m=>{
      if(!m||typeof m!=="object")return;
      if(m.t==="hello"){
        if(ent.nome)return;
        if(net.started||net.conns.length+1>=net.max){try{c.send({t:"pieno"})}catch(e){}setTimeout(()=>{try{c.close()}catch(e){}},300);return}
        let nome=pulisci(m.nome)||"Amico";const usati=[net.nick,...net.conns.map(x=>x.nome)];const base=nome;let k=2;while(usati.includes(nome))nome=base+k++;
        ent.nome=nome;net.conns.push(ent);onChange&&onChange();net.stato()}
      else if(!ent.nome)return;
      else if(m.t==="act")net.push({t:"act",seat:ent.seat,k:m.k});
      else if(m.t==="addio")gone();
      else net.dispatch(Object.assign({},m,{seat:ent.seat}),ent)});
    c.on("close",gone);
  });
  net.stato=()=>{if(net.started)return;net.bcast({t:"lobby",game:net.game,umani:[net.nick,...net.conns.map(x=>x.nome)],n:net.n,lv:net.lv})};
  return net
}
async function unisciti(code,nick,onLobby){
  if(!window.natanPeerLib)throw new Error("La rete non è disponibile.");
  const P=await window.natanPeerLib();const net=new Net(false);net.nick=nick;
  const p=new P();net.peer=p;
  await new Promise((ok,bad)=>{const t=setTimeout(()=>bad(new Error("Non riesco a collegarmi alla rete: riprova tra poco.")),9000);p.on("open",()=>{clearTimeout(t);ok()});p.on("error",e=>{if(!p.open){clearTimeout(t);bad(new Error("Non riesco a collegarmi alla rete."))}})});
  await new Promise((ok,bad)=>{
    const c=p.connect("natan-gioco-"+code.toUpperCase().trim(),{reliable:true});net.up=c;let done=false;
    const nope=msg=>{if(!done){done=true;clearTimeout(t);bad(new Error(msg))}};
    const t=setTimeout(()=>nope("Non trovo la stanza «"+code.toUpperCase()+"». Controlla il codice."),9000);
    c.on("open",()=>{c.send({t:"hello",nome:nick})});
    c.on("error",()=>nope("Non trovo la stanza «"+code.toUpperCase()+"». Controlla il codice."));
    c.on("data",m=>{
      if(!m||typeof m!=="object")return;
      if(m.t==="pieno"){nope("La stanza è già piena.");return}
      if(m.t==="lobby"){if(!done){done=true;clearTimeout(t);ok()}onLobby&&onLobby(m)}
      else net.dispatch(m)});
    c.on("close",()=>{net.dispatch({t:"bye"})});
  });
  return net
}

// ------------------------------------------------------------------ shell di gioco (barra, giocatori, pannello agenti)
function gameShell(pg,info,ctx){
  pg.innerHTML="";const g=E("div","gm");pg.append(g);
  const top=E("div","top");const back=E("button","btn ghost","← Ritorna ai giochi");back.id="gmBack2";back.onclick=()=>{ctx&&ctx.leave&&ctx.leave();menu(pg)};
  const help=E("button","btn ghost","❔ Regole");help.onclick=()=>{ctx&&ctx.leave&&ctx.leave();tutorial(pg,info,()=>lobby(pg,info))};
  top.append(back);
  if(ctx&&ctx.again){const again=E("button","btn ghost","↻ Nuova partita");again.id="gmAgain";again.onclick=ctx.again;top.append(again)}
  top.append(help);g.append(top,E("h1","",info.ic+" "+info.nome));
  const pls=E("div","pls");g.append(pls);
  const ng=ngPanel();ng.el.forEach(x=>g.append(x));
  const status=E("div","status msg");g.append(status);
  const sh={g,ng,status,pls,
    players(seats,turn,me){pls.innerHTML="";seats.forEach((s,i)=>{
      let c;if(s.tipo==="bot")c=botCard(s.bot);else{c=E("div","pl");c.append(E("b","",(i===me?"🙂 ":"👤 ")+s.nome),E("small","",i===me?"Tu":"Giocatore online"))}
      c.classList.toggle("turn",i===turn);c.dataset.seat=String(i);pls.append(c)})}};
  return sh
}
function fineBanner(sh,esitoMe,testo,sotto){
  const e=E("div","end");e.append(E("div","",esitoMe===true?"🏆":esitoMe===false?"🤖":"🤝"),E("h2","",testo),E("small","",sotto||""));
  sh.g.append(e);try{e.scrollIntoView({behavior:"smooth",block:"center"})}catch(x){}return e
}

// ------------------------------------------------------------------ motore delle partite
// info: {id, init(n,seed), turn(S), legal(S,seat), apply(S,seat,a), over(S), bot(S,seat,lv), view(sh,ctx), min, max}
// oppure (giochi in tempo reale) {rt:true, playRT(sh,ctx,cfg)}
function avvia(pg,info,cfg,net,me){
  const live={stop:false};
  const n=cfg.seats.length;
  const seats=cfg.seats.map((s,i)=>s.tipo==="bot"?{tipo:"bot",nome:s.nome,bot:BOTS.find(b=>b.id===s.botId)||{id:s.botId,nome:s.nome}}:{tipo:i===me?"io":"remoto",nome:s.nome});
  const ctx={seats,me,n,lv:cfg.lv,net,
    stop(){live.stop=true},leave(){live.stop=true;if(net)net.close()},
    again:net?null:()=>{live.stop=true;avvia(pg,info,Object.assign({},cfg,{seed:(Math.random()*2**31)|0}),null,0)}};
  const sh=gameShell(pg,info,ctx);ctx.sh=sh;window.__ctxLast=ctx;
  const storia=seats.map(()=>[]);ctx.storia=storia;
  if(net){
    net.reset();
    if(net.host){net.h.partito=ent=>{if(live.stop)return;const seat=ent.seat;if(seat>=0&&seats[seat]&&seats[seat].tipo==="remoto"){const b=scegliBot(1,seats.filter(s=>s.bot).map(s=>s.bot.id))[0];
        const vecchio=seats[seat].nome;seats[seat]={tipo:"bot",nome:b.nome+" (al posto di "+vecchio+")",bot:b};cfg.seats[seat]={tipo:"bot",nome:b.nome,botId:b.id};
        net.bcast({t:"swap",seat,botId:b.id,nome:seats[seat].nome});net.push({t:"wake"});ctx.onSwap&&ctx.onSwap(seat)}}}
    else{net.h.swap=m=>{const b=BOTS.find(x=>x.id===m.botId);if(b&&seats[m.seat])seats[m.seat]={tipo:"bot",nome:m.nome,bot:b};net.push({t:"wakeG"});ctx.onSwap&&ctx.onSwap(m.seat)};
      net.h.bye=()=>{net.push({t:"bye"});ctx.onBye&&ctx.onBye()};
      net.h.do=m=>net.push(m);
      net.h.start=m=>{live.stop=true;avviaOnlineGuest(pg,m)}}
  }
  if(info.rt){
    ctx.finish=res=>{if(live.finito||live.stop)return;live.finito=true;live.stop=true;conclusione(sh,info,seats,ctx,res,storia,pg,cfg,net,me)};
    sh.players(seats,-1,me);info.playRT(sh,ctx,cfg);return ctx}
  let S=info.init(n,cfg.seed);let seq=0;
  let attesa=null;ctx.legal=[];ctx.S=S;
  const risolvi=(S,seat,k)=>info.legal(S,seat).find(x=>x.k===k)||(info.parse?info.parse(S,seat,k):null);
  ctx.act=k=>{if(!attesa)return false;const a=attesa.legal.find(x=>x.k===k)||(info.parse?info.parse(S,attesa.seat,k):null);if(!a)return false;const r=attesa.res;attesa=null;ctx.legal=[];ctx.myTurn=false;r(a);return true};
  const view=info.view(sh,ctx);
  const draw=()=>{ctx.S=S;view.draw(S,ctx)};
  async function pensaBot(seat){
    const st=seats[seat];const lg=info.legal(S,seat);
    if(lg.length===1){sh.ng.think(`${st.bot.nome}: c'era una sola mossa possibile.`,["Calcolatore"],st.bot.nome);await sleep(SLOW()*350);storia[seat].push(["Calcolatore"]);return lg[0]}
    sh.ng.think(`🤔 ${st.bot.nome} ci pensa… i 35 agenti stanno votando`,null,st.bot.nome);await sleep(SLOW()*(300+rnd(400)));
    await sleep(20);const cands=info.bot(S,seat,ctx.lv);
    const r=consiglio(info.id,cands,st.bot,ctx.lv);
    sh.ng.think(`${st.bot.nome} ha deciso · ${r.voti}/35 agenti d'accordo, guidati da «${r.decide}»`,r.favor,st.bot.nome);storia[seat].push(r.favor);
    return r.mossa.a}
  const attendiHost=pred=>net.next(pred);
  async function ciclo(){
    try{
      for(;;){
        if(live.stop)return;
        const o=info.over(S);
        if(o){live.stop=true;draw();conclusione(sh,info,seats,ctx,o,storia,pg,cfg,net,me);return}
        const seat=info.turn(S);const st=seats[seat];
        sh.players(seats,seat,me);
        let a=null;
        if(st.tipo==="io"){
          const lg=info.legal(S,seat);ctx.legal=lg;ctx.myTurn=true;draw();sh.status.textContent=info.msgTurno?info.msgTurno(S,ctx,seat):"Tocca a te";
          a=await new Promise(res=>{attesa={res,legal:lg,seat}});if(live.stop)return;
          if(net){if(net.host)net.bcast({t:"do",seq,seat,k:a.k});
            else{net.send({t:"act",k:a.k});const m=await attendiHost(m=>m.t==="do"||m.t==="bye");if(live.stop)return;if(m.t==="bye"){stopOnline(sh);return}a=risolvi(S,seat,m.k)||a}}
        }else if(st.tipo==="bot"){
          ctx.legal=[];ctx.myTurn=false;draw();sh.status.textContent=`Tocca a ${st.nome}`;
          if(net&&!net.host){const m=await attendiHost(m=>m.t==="do"||m.t==="bye"||m.t==="wakeG");if(live.stop)return;if(m.t==="bye"){stopOnline(sh);return}if(m.t==="wakeG")continue;a=risolvi(S,seat,m.k)}
          else{a=await pensaBot(seat);if(live.stop)return;if(net)net.bcast({t:"do",seq,seat,k:a.k})}
        }else{
          ctx.legal=[];ctx.myTurn=false;draw();sh.status.textContent=`Tocca a ${st.nome}…`;
          if(net.host){const m=await attendiHost(m=>(m.t==="act"&&m.seat===seat)||m.t==="wake");if(live.stop)return;if(m.t==="wake")continue;
            a=risolvi(S,seat,m.k);if(!a)continue;net.bcast({t:"do",seq,seat,k:a.k})}
          else{const m=await attendiHost(m=>m.t==="do"||m.t==="bye"||m.t==="wakeG");if(live.stop)return;if(m.t==="bye"){stopOnline(sh);return}if(m.t==="wakeG")continue;a=risolvi(S,seat,m.k)}
        }
        if(!a)continue;
        S=info.apply(S,seat,a);seq++;draw();
        await sleep(SLOW()*(info.pausa?info.pausa(S,a,seat):450));
      }
    }catch(e){console.error(e);sh.status.textContent="Qualcosa è andato storto: premi «Nuova partita».";}
  }
  sh.players(seats,-1,me);setTimeout(ciclo,0);
  return ctx
}
function stopOnline(sh){sh.status.textContent="La partita online è finita: chi ha creato la stanza si è scollegato.";fineBanner(sh,null,"Connessione chiusa","Puoi tornare ai giochi e iniziare una nuova partita.")}


// ------------------------------------------------------------------ trofei: tanti obiettivi da raggiungere
function nuovoX(){return {streak:0,best:0,lv:{},lvg:{},online:0,onlineW:0,big:0,bigW:0,tot:0,beaten:{},giorni:{}}}
function aggiornaX(info,esito,seats,ctx,net){
  const X=Object.assign(nuovoX(),LSG.get("natan_gaming_x",{}));X.tot++;
  if(esito===true){X.streak++;X.best=Math.max(X.best,X.streak);X.lv[ctx.lv]=(X.lv[ctx.lv]||0)+1;(X.lvg[ctx.lv]=X.lvg[ctx.lv]||{})[info.id]=1;
    seats.forEach(s=>{if(s.tipo==="bot"&&s.bot)X.beaten[s.bot.id]=1})}
  else if(esito===false)X.streak=0;
  if(net){X.online++;if(esito===true)X.onlineW++}
  if(seats.length>=4){X.big++;if(esito===true)X.bigW++}
  try{X.giorni[new Date().toISOString().slice(0,10)]=1}catch(e){}
  LSG.set("natan_gaming_x",X);return X}
function trofei(){
  const st=LSG.get("natan_gaming_stats",{});const X=Object.assign(nuovoX(),LSG.get("natan_gaming_x",{}));
  const hist=LSG.get("natan_test_hist",[]);const T=[];
  const vitt=k=>(st[k]&&st[k].p)||0,tot=Object.values(st).reduce((a,r)=>a+r.p,0),giocati=Object.values(st).reduce((a,r)=>a+r.p+r.v+(r.n||0),0);
  const T_=(id,ic,nome,desc,cur,max,punti)=>T.push({id,ic,nome,desc,cur:Math.min(cur,max),max,ok:cur>=max,punti:punti||10});
  T_("v1","🥇","Primo passo","Vinci la tua prima partita",tot,1,10);T_("v5","🥈","Si comincia a ragionare","Vinci 5 partite",tot,5,10);
  T_("v25","🏅","Giocatore vero","Vinci 25 partite",tot,25,20);T_("v100","🏆","Campione","Vinci 100 partite",tot,100,50);
  T_("g10","🎲","Appassionato","Gioca 10 partite",giocati,10,10);T_("g50","🎯","Instancabile","Gioca 50 partite",giocati,50,20);T_("g200","🔥","Leggenda dei giochi","Gioca 200 partite",giocati,200,50);
  for(const [k,g] of Object.entries(GAMES)){T_("w5"+k,g.ic,"Re di "+g.nome,"Vinci 5 volte a "+g.nome,vitt(k),5,15);T_("w20"+k,"👑","Maestro di "+g.nome,"Vinci 20 volte a "+g.nome,vitt(k),20,30)}
  const nGiochi=Object.keys(GAMES).length;
  T_("tutti","🌈","Giocatore completo","Vinci almeno una volta a ogni gioco",Object.keys(GAMES).filter(k=>vitt(k)>0).length,nGiochi,40);
  LIV.forEach((l,i)=>T_("lv"+i,["🟢","🟡","🟠","🔴"][i]||"⭐","Livello "+(l.nome||l),"Vinci contro bot di livello "+(l.nome||l),X.lv[i]||0,1,15));
  T_("estremi","💀","Domatore dell'Estremo","Vinci a livello Estremo in 3 giochi diversi",Object.keys(X.lvg[3]||{}).length,3,60);
  T_("s3","🔗","Tre di fila","Vinci 3 partite di seguito",X.best,3,15);T_("s5","⛓️","Cinque di fila","Vinci 5 partite di seguito",X.best,5,30);T_("s10","💎","Inarrestabile","Vinci 10 partite di seguito",X.best,10,60);
  T_("on1","🌐","Online!","Gioca una partita online con un amico",X.online,1,15);T_("onw","🤝","Vittoria tra amici","Vinci una partita online",X.onlineW,1,25);T_("onw5","🎉","Re della stanza","Vinci 5 partite online",X.onlineW,5,50);
  T_("big","👥","Tavolo pieno","Gioca una partita con 4 o 5 giocatori",X.big,1,15);T_("bigw","🥳","Vincitore al tavolo","Vinci una partita con 4 o 5 giocatori",X.bigW,1,30);
  T_("bot10","🤖","Cacciatore di bot","Batti 10 bot diversi",Object.keys(X.beaten).length,10,30);T_("bot30","🦾","Spezza-bot","Batti tutti e 30 i bot",Object.keys(X.beaten).length,30,80);
  let maxLiv=1;try{maxLiv=Math.max(...BOTS.map(b=>botInfo(b.id).liv))}catch(e){}
  T_("botlv","📈","Allenatore","Fai arrivare un bot al livello 10",maxLiv,10,40);
  T_("pari","🕊️","Diplomatico","Chiudi una partita in pareggio",Object.values(st).reduce((a,r)=>a+(r.n||0),0),1,10);
  T_("giorni","📅","Giocatore fedele","Gioca in 5 giorni diversi",Object.keys(X.giorni).length,5,30);
  T_("t1","📝","Studente","Fai la tua prima verifica con Natan Test",hist.length,1,15);T_("t5","📚","Secchione","Fai 5 verifiche",hist.length,5,30);
  T_("t10v","🔟","Dieci e lode","Prendi 10 in una verifica",hist.some(h=>h.voto>=10)?1:0,1,50);
  T_("tx","🧠","Cervellone","Prendi almeno 8 in una verifica di livello Estremo",hist.some(h=>h.diff==="Estremo"&&h.voto>=8)?1:0,1,60);
  T_("tuni","🎓","Universitario","Prendi almeno 7 in una verifica di Università",hist.some(h=>/Univ/.test(h.scuola||"")&&h.voto>=7)?1:0,1,40);
  return T}
function schermataTrofei(pg){
  style();pg.innerHTML="";const g=E("div","gm");pg.append(g);const top=E("div","top");const back=E("button","btn ghost","← Giochi");back.id="trBack";back.onclick=()=>menu(pg);top.append(back);g.append(top);
  const T=trofei();const ok=T.filter(t=>t.ok),pt=ok.reduce((a,t)=>a+t.punti,0),tot=T.reduce((a,t)=>a+t.punti,0);
  g.append(E("h1","","🏆 Trofei"),E("p","lead",`${ok.length} su ${T.length} trofei · ${pt} punti su ${tot}`));
  const bar=E("div","prog");const f=E("i");f.style.width=Math.round(pt*100/tot)+"%";bar.append(f);g.append(bar);
  const c=E("div","trg");g.append(c);c.id="trGrid";
  T.slice().sort((a,b)=>(b.ok-a.ok)||((b.cur/b.max)-(a.cur/a.max))).forEach(t=>{const d=E("div","tro"+(t.ok?" ok":""));d.dataset.t=t.id;
    d.append(E("span","ic",t.ok?t.ic:"🔒"),E("strong","",t.nome),E("small","",t.desc));
    const b=E("div","prog");const i=E("i");i.style.width=Math.round(t.cur*100/t.max)+"%";b.append(i);d.append(b,E("small","",t.ok?`✓ Ottenuto · +${t.punti} punti`:`${t.cur} / ${t.max}`));c.append(d)});
}
function controllaTrofei(){   // quali trofei sono nuovi dall'ultima volta?
  const T=trofei();const vecchi=new Set(LSG.get("natan_trofei",[]));const nuovi=T.filter(t=>t.ok&&!vecchi.has(t.id));
  if(nuovi.length)LSG.set("natan_trofei",T.filter(t=>t.ok).map(t=>t.id));return nuovi}
function conclusione(sh,info,seats,ctx,o,storia,pg,cfg,net,me){
  const win=o.win||[];const io=win.includes(me);const pari=!win.length;
  const esito=pari?null:io?true:false;
  seats.forEach((s,i)=>{if(s.tipo==="bot"){const e=pari?null:win.includes(i);allena(s.bot,info.id,storia[i],e,ctx.lv)}});
  const st=LSG.get("natan_gaming_stats",{});const k=st[info.id]=st[info.id]||{v:0,p:0,n:0};
  esito===true?k.p++:esito===false?k.v++:k.n++;LSG.set("natan_gaming_stats",st);aggiornaX(info,esito,seats,ctx,net);   // p = vittorie tue, v = vittorie dei bot (o degli altri)
  const testo=(typeof o.text==="function"?o.text(seats):o.text)||(pari?"Pareggio!":io?"Hai vinto!":"Hai perso");
  sh.status.textContent=testo;
  const sotto=pari?"Pareggio!":io?"Hai vinto! Gli allenatori correggono gli agenti dei bot che hanno sbagliato.":"Ha vinto un altro giocatore. Gli allenatori rinforzano gli agenti che avevano ragione.";
  const e=fineBanner(sh,esito,testo,sotto);e.id="gmEnd";
  try{controllaTrofei().forEach(t=>{const x=E("div","newtro","🏆 Nuovo trofeo: "+t.ic+" "+t.nome+" — "+t.desc);e.append(x)})}catch(er){}
  const bs=seats.filter(s=>s.bot);if(bs.length){const w=E("div","pls");bs.forEach(s=>w.append(botCard(s.bot)));e.append(w)}
  if(net){
    if(net.host){const r=E("button","btn","↻ Rigioca con gli stessi giocatori");r.id="gmRigioca";
      r.onclick=()=>{const nc=Object.assign({},cfg,{seed:(Math.random()*2**31)|0});net.conns.forEach(x=>{if(!x.fine)try{x.conn.send({t:"start",cfg:nc,seat:x.seat})}catch(e){}});avvia(pg,info,nc,net,0)};e.append(r)}
    else e.append(E("small","","Aspetta che chi ha creato la stanza lanci un'altra partita."))}
  sh.players(seats,-1,me);
}

// ------------------------------------------------------------------ lobby: livello, numero di giocatori, online
function lobby(pg,info){
  style();pg.innerHTML="";const g=E("div","gm");pg.append(g);
  const mn=info.min||2,mx=info.max||2;
  const cfg={mode:"bot",lv:Math.min(3,Math.max(0,+LSG.get("natan_gaming_lv",1)||0)),n:Math.min(mx,Math.max(mn,+LSG.get("natan_gaming_n_"+info.id,mn)||mn)),nick:nickSalvato(),bots:[]};
  cfg.bots=scegliBot(cfg.n-1);
  let net=null,errore="";
  const top=E("div","top");const back=E("button","btn ghost","← Ritorna ai giochi");back.onclick=()=>{if(net)net.close();menu(pg)};top.append(back);
  const help=E("button","btn ghost","❔ Regole");help.onclick=()=>{if(net)net.close();tutorial(pg,info,()=>lobby(pg,info))};top.append(help);
  g.append(top,E("h1","",info.ic+" "+info.nome));
  const body=E("div","");body.style.cssText="display:flex;flex-direction:column;gap:14px";g.append(body);
  const umani=()=>net?[net.nick,...net.conns.map(c=>c.nome)]:[cfg.nick];
  function render(){
    body.innerHTML="";
    const b1=E("div","box");b1.append(E("h3","","Dove vuoi giocare?"));const sg=E("div","seg");
    [["bot","🤖 Contro Natan Gaming"],["online","🌐 Online con amici"]].forEach(([m,t])=>{const b=E("button",cfg.mode===m?"on":"",t);b.dataset.mode=m;b.onclick=()=>{if(net){net.close();net=null}cfg.mode=m;errore="";render()};sg.append(b)});b1.append(sg);body.append(b1);
    const b2=E("div","box");b2.append(E("h3","","Livello dei bot"));const sl=E("div","seg");
    LIV.forEach((l,i)=>{const b=E("button",cfg.lv===i?"on":"",l.ic+" "+l.nome);b.dataset.lv=String(i);b.onclick=()=>{cfg.lv=i;LSG.set("natan_gaming_lv",i);if(net)net.lv=i;render();if(net)net.stato()};sl.append(b)});b2.append(sl);body.append(b2);
    if(mx>mn){
      const b3=E("div","box");b3.append(E("h3","",`Quanti giocatori? (da ${mn} a ${mx})`));const st=E("div","stepper");
      const minus=E("button","","−"),plus=E("button","","+"),val=E("b","",String(cfg.n));val.id="nGioc";
      const lo=Math.max(mn,umani().length);
      minus.disabled=cfg.n<=lo;plus.disabled=cfg.n>=mx;minus.id="nMeno";plus.id="nPiu";
      const set=v=>{cfg.n=v;LSG.set("natan_gaming_n_"+info.id,v);if(net){net.max=v;net.n=v}cfg.bots=scegliBot(cfg.n-umani().length);render();if(net)net.stato()};
      minus.onclick=()=>set(cfg.n-1);plus.onclick=()=>set(cfg.n+1);st.append(minus,val,plus);
      b3.append(st,E("small","",cfg.mode==="bot"?"Tu e gli altri sono bot.":"Gli amici entrano con il codice; i posti liberi li prendono i bot."));body.append(b3)}
    const b4=E("div","box");b4.append(E("h3","",cfg.mode==="bot"?"I tuoi avversari":"Giocatori"));const pl=E("div","pls");
    const mie=umani();mie.forEach((nm,i)=>{const c=E("div","pl");c.append(E("b","",(i===0?"🙂 ":"👤 ")+nm),E("small","",i===0?"Tu":"Amico online"));pl.append(c)});
    const nb=Math.max(0,cfg.n-mie.length);while(cfg.bots.length<nb)cfg.bots.push(...scegliBot(1,cfg.bots.map(b=>b.id)));cfg.bots=cfg.bots.slice(0,nb);
    cfg.bots.forEach(b=>pl.append(botCard(b)));b4.append(pl);
    const rb=E("button","btn ghost","🔀 Cambia avversari");rb.id="cambiaBot";rb.onclick=()=>{cfg.bots=scegliBot(Math.max(0,cfg.n-umani().length));render()};
    if(cfg.bots.length)b4.append(rb);body.append(b4);
    if(cfg.mode==="online"){
      const b5=E("div","box");b5.append(E("h3","","Stanza online"));
      if(!net){
        const ni=E("input","tx");ni.value=cfg.nick;ni.placeholder="Il tuo nome";ni.maxLength=14;ni.id="nickIn";ni.oninput=()=>{cfg.nick=pulisci(ni.value)||"Giocatore";LSG.set("natan_gaming_nick",cfg.nick)};
        const cr=E("button","btn","➕ Crea una stanza");cr.id="creaStanza";
        cr.onclick=async()=>{cr.disabled=true;cr.textContent="Creo la stanza…";errore="";
          try{const nn=await stanzaNuova(cfg.nick,()=>{cfg.bots=scegliBot(Math.max(0,cfg.n-umani().length));render()});nn.max=cfg.n;nn.n=cfg.n;nn.lv=cfg.lv;nn.game=info.id;net=nn;render()}
          catch(e){errore=e.message||"errore";render()}};
        b5.append(E("small","","Scrivi il tuo nome (solo il nome, niente dati personali), poi crea la stanza e dai il codice ai tuoi amici."),ni,cr)}
      else{
        const c=E("div","code",net.code);c.id="codiceStanza";
        b5.append(E("small","","Codice della stanza: i tuoi amici aprono Giochi → «Entra in una stanza con un codice» e lo scrivono."),c,E("small","",`${umani().length} di ${cfg.n} giocatori presenti. I posti liberi li prendono i bot.`))}
      if(errore)b5.append(E("small","",errore));
      body.append(b5)}
    const go=E("button","btn","▶ Inizia la partita");go.id="startGame";
    go.onclick=()=>{
      const hum=umani();const nn=Math.max(cfg.n,hum.length);
      const seats=hum.map(nm=>({tipo:"umano",nome:nm}));
      const pool=cfg.bots.slice();while(pool.length<nn-hum.length)pool.push(...scegliBot(1,pool.map(b=>b.id)));
      pool.slice(0,nn-hum.length).forEach(b=>seats.push({tipo:"bot",nome:b.nome,botId:b.id}));
      const c={game:info.id,seats,lv:cfg.lv,seed:(Math.random()*2**31)|0};
      if(net){net.started=true;net.conns.forEach((x,i)=>{x.seat=i+1});
        net.conns.forEach((x,i)=>{try{x.conn.send({t:"start",cfg:c,seat:i+1})}catch(e){}});avvia(pg,info,c,net,0)}
      else avvia(pg,info,c,null,0)};
    body.append(go);
  }
  render()
}

// ospite: è arrivato il messaggio «start» dalla stanza
function avviaOnlineGuest(pg,m){
  const info=GAMES[m.cfg.game];const net=window.__netGuest;if(!info||!net)return;
  avvia(pg,info,m.cfg,net,m.seat)
}
function entraStanza(pg){
  style();pg.innerHTML="";const g=E("div","gm");pg.append(g);
  const top=E("div","top");const back=E("button","btn ghost","← Ritorna ai giochi");back.onclick=()=>{if(window.__netGuest){window.__netGuest.close();window.__netGuest=null}menu(pg)};top.append(back);
  g.append(top,E("h1","","🔑 Entra in una stanza"));
  const b=E("div","box");const ni=E("input","tx");ni.value=nickSalvato();ni.maxLength=14;ni.placeholder="Il tuo nome";ni.id="nickJoin";
  const ci=E("input","tx");ci.placeholder="Codice (5 caratteri)";ci.maxLength=5;ci.id="codeJoin";ci.style.textTransform="uppercase";
  const bt=E("button","btn","Entra");bt.id="entraBtn";const msg=E("div","msg","");msg.id="joinMsg";
  const lobbyBox=E("div","box");lobbyBox.style.display="none";lobbyBox.id="joinLobby";
  b.append(E("small","","Il codice te lo dà l'amico che ha creato la stanza."),ni,ci,bt,msg);g.append(b,lobbyBox);
  bt.onclick=async()=>{
    const code=ci.value.trim();if(code.length<4){msg.textContent="Scrivi il codice della stanza.";return}
    LSG.set("natan_gaming_nick",pulisci(ni.value)||"Giocatore");bt.disabled=true;msg.textContent="Mi collego…";
    try{
      if(window.__netGuest){window.__netGuest.close();window.__netGuest=null}
      const net=await unisciti(code,pulisci(ni.value)||"Giocatore",m=>{
        lobbyBox.style.display="";lobbyBox.innerHTML="";const inf=GAMES[m.game];
        lobbyBox.append(E("h3","",inf?inf.ic+" "+inf.nome:"Partita"),E("small","",`Livello: ${LIV[m.lv||0].nome} · Giocatori presenti: ${(m.umani||[]).join(", ")}`),E("small","","Aspetto che chi ha creato la stanza inizi la partita…"));
        msg.textContent="Sei dentro la stanza ✔"});
      window.__netGuest=net;
      net.h.start=m=>avviaOnlineGuest(pg,m);
      net.h.bye=()=>{msg.textContent="La stanza si è chiusa."};
    }catch(e){msg.textContent=e.message||"Non riesco a entrare.";bt.disabled=false}};
}

// ------------------------------------------------------------------ menu
const GAMES={};
function menu(pg){
  style();pg.innerHTML="";const g=E("div","gm");pg.append(g);
  const top=E("div","top");const back=E("button","btn ghost","← Ritorna");back.id="gmBack";back.onclick=()=>{try{window.openChat()}catch(e){location.reload()}};top.append(back);g.append(top);
  g.append(E("h1","","🎮 Giochi"),E("p","lead","Sfida i bot di Natan Gaming o gioca online con gli amici. Prima di ogni gioco c'è un breve tutorial."));
  const ng=ngPanel();ng.el.forEach(x=>g.append(x));
  const st=LSG.get("natan_gaming_stats",{});
  const c=E("div","cards");g.append(c);
  for(const [k,info] of Object.entries(GAMES)){const b=E("button","gcard");b.dataset.g=k;b.append(E("span","ic",info.ic),E("strong","",info.nome),E("small","",info.sub),E("small","",info.min===info.max?`${info.max} giocatori`:`${info.min}-${info.max} giocatori`));
    const s=st[k];if(s)b.append(E("small","",`Tu ${s.p} · Bot ${s.v}`+(s.n?` · pari ${s.n}`:"")));
    b.onclick=()=>tutorial(pg,info,()=>lobby(pg,info));c.append(b)}
  const tb=E("button","btn ghost");tb.id="trofeiBtn";{const T=trofei();tb.textContent=`🏆 Trofei (${T.filter(t=>t.ok).length}/${T.length})`}tb.onclick=()=>schermataTrofei(pg);tb.style.marginRight="8px";g.append(tb);
  const j=E("button","btn ghost","🔑 Entra in una stanza con un codice");j.id="entraStanza";j.onclick=()=>entraStanza(pg);g.append(j);
  const dt=E("details","box");dt.id="botList";dt.append(E("summary","","🤖 I 30 bot di Natan Gaming (nome, esperienza, 35 agenti ciascuno)"));
  const lst=BOTS.map(b=>botInfo(b.id)).sort((a,b)=>b.xp-a.xp);const w=E("div","pls");w.style.marginTop="10px";
  lst.forEach(i=>w.append(botCard(BOTS.find(b=>b.id===i.id))));dt.append(w);g.append(dt);
}
window.GIOCHI={open(pg){style();intro();menu(pg)},_games:GAMES,_consiglio:consiglio,AGENTI,BOTS,LIV,botInfo,_avvia:avvia};
window.__G={E,LSG,sleep,rnd,shuffle,mulberry,SLOW,h32,GAMES,consiglio,fineBanner,scegliBot,botCard,F,LIV,NAG,
  register(info){GAMES[info.id]=info;return info}};
})();
