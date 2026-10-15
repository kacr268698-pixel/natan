// =====================================================================================================
// GIOCHI DI NATAN (nucleo): menu, tutorial, lobby (livelli, numero di giocatori, online), bot con nome ed esperienza,
// consiglio dei 35 agenti dietro ogni bot e motore delle partite a turni.
// I giochi veri (il «Giardino Zen» di Natan) stanno in giochi-z.js (suoni, musica, Sudoku e Mahjong), giochi-carte.js (Scopa d'Assi e Uno),
// giochi-dama.js (Dama) e giochi-biliardo.js (Biliardo). Sudoku e Mahjong girano nella pagina a parte zen.html.
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
.gm details.agdet summary{cursor:pointer;color:var(--muted);font-size:13px;margin-bottom:6px}
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
.gm .emobar{display:flex;gap:6px;overflow-x:auto;padding:2px;-webkit-overflow-scrolling:touch;align-items:center}
.gm .emobar small{color:var(--muted);white-space:nowrap;margin-right:2px}
.gm .emobar button{flex:0 0 auto;width:42px;height:42px;border-radius:50%;border:1px solid var(--line);background:var(--raise);font-size:22px;line-height:1;cursor:pointer;transition:transform .1s}
.gm .emobar button:active{transform:scale(1.25)}.gm .emobar button:disabled{opacity:.45}
.gm .emob{position:absolute;right:8px;top:-16px;font-size:30px;line-height:1;background:var(--raise);border:1px solid var(--line);border-radius:18px;padding:3px 9px;box-shadow:0 4px 14px rgba(0,0,0,.35);animation:emopop 2.6s ease forwards;pointer-events:none;z-index:5}
@keyframes emopop{0%{transform:translateY(10px) scale(.3);opacity:0}10%{transform:translateY(0) scale(1.18);opacity:1}18%{transform:scale(1)}82%{opacity:1}100%{opacity:0;transform:translateY(-12px)}}
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
  const o=E("div","ngintro");const c=E("div","c");const lg=E("div","lg");lg.append(E("span","","🎮"));c.append(lg,E("b","","Natan Gaming"),E("small","","30 bot con 35 agenti ciascuno · Giardino Zen"));o.append(c);
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
  const det=E("details","agdet");det.append(E("summary","","🧠 Vedi i 35 agenti che votano"),ag);
  return {el:[p,th,det],think:(t,favor,chi)=>{th.textContent=t||"";[...ag.children].forEach(i=>i.classList.toggle("on",!!favor&&favor.includes(i.textContent)));if(chi!==undefined)p.querySelector(".tx b").textContent=chi||"Natan Gaming"}}
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
const PEERCFG={config:{iceServers:[{urls:"stun:stun.l.google.com:19302"},{urls:"stun:stun1.l.google.com:19302"},{urls:"stun:global.stun.twilio.com:3478"},{urls:"stun:stun.cloudflare.com:3478"},
  {urls:["turn:openrelay.metered.ca:80","turn:openrelay.metered.ca:443","turn:openrelay.metered.ca:443?transport=tcp"],username:"openrelayproject",credential:"openrelayproject"},
  {urls:"turn:eu-0.turn.peerjs.com:3478",username:"peerjs",credential:"peerjsp"},{urls:"turn:us-0.turn.peerjs.com:3478",username:"peerjs",credential:"peerjsp"}],sdpSemantics:"unified-plan"}};
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
    try{clearInterval(this.hb);if(this.vis)document.removeEventListener("visibilitychange",this.vis)}catch(e){}
    if(this.rel){const R=this.rel,code=this.code;setTimeout(()=>{R.stop=true;relayPost(R.base,{op:"chiudi",c:code,tok:R.tok},4000).catch(()=>{})},500)}
    const p=this.peer;this.peer=null;setTimeout(()=>{try{p&&p.destroy()}catch(e){}},200)}
}
// --- via di riserva: se i due telefoni non riescono a collegarsi direttamente (reti diverse, 4G, scuola), le mosse passano dal Mac di Kevin
const RID=()=>{const a=new Uint8Array(12);(window.crypto||{getRandomValues:x=>x.forEach((_,i)=>x[i]=rnd(256))}).getRandomValues(a);return [...a].map(x=>x.toString(16).padStart(2,"0")).join("")};
async function relayPost(base,body,ms){const c=new AbortController();const t=setTimeout(()=>c.abort(),ms||30000);
  try{const r=await fetch(base+"/stanza",{method:"POST",headers:{"Content-Type":"text/plain"},body:JSON.stringify(body),signal:c.signal,cache:"no-store"});return await r.json()}finally{clearTimeout(t)}}
class RConn{                                   // sembra una connessione di PeerJS (on, send, close, open) ma passa dal Mac
  constructor(){this.l={};this.open=false;this.relay=true;this.coda=Promise.resolve()}
  on(e,f){(this.l[e]=this.l[e]||[]).push(f)}
  emit(e,...a){(this.l[e]||[]).forEach(f=>{try{f(...a)}catch(x){console.error(x)}})}
  invia(base,body){this.coda=this.coda.then(async()=>{        // in fila (le mosse arrivano nell'ordine giusto) e con qualche nuovo tentativo se la rete balbetta
    for(let k=0;k<4;k++){try{const r=await relayPost(base,body,15000);if(r)return}catch(e){}await sleep(800*(k+1))}}).catch(()=>{})}
}
async function relayBase(){try{return window.natanRelayBase?(await window.natanRelayBase())||"":""}catch(e){return ""}}
function relayOspite(base,code){
  const c=new RConn();const g=RID();let vivo=true,da=0;
  c.send=m=>{if(vivo)c.invia(base,{op:"invia",c:code,de:g,a:"h",m})};
  c.close=()=>{if(!vivo)return;c.invia(base,{op:"invia",c:code,de:g,a:"h",m:{t:"addio"}});vivo=false;c.open=false};
  c.iniz=async()=>{                              // ritorna "" se è entrato, altrimenti il motivo
    let r;try{r=await relayPost(base,{op:"entra",c:code,g},9000)}catch(e){return "blocco"}
    if(r.err==="nostanza")return "nostanza";if(r.err==="pieno")return "pieno";if(r.err)return "blocco";
    c.open=true;c.emit("open");
    (async()=>{let errs=0;
      while(vivo){try{const r=await relayPost(base,{op:"poll",c:code,chi:g,da,att:15},25000);errs=0;
          if(r.err){break}
          for(const [n,de,m] of r.m||[]){da=Math.max(da,n);if(vivo)c.emit("data",m)}}
        catch(e){if(++errs>6)break;await sleep(1500)}}
      if(vivo){vivo=false;c.open=false;c.emit("close")}})();
    return ""};
  return c}
function relayOspiteLato(net,de){                // dal lato di chi ha creato la stanza: la «connessione» con un ospite che arriva dal Mac
  const R=net.rel;const c=new RConn();c.open=true;
  c.send=m=>{if(c.open)c.invia(R.base,{op:"invia",c:net.code,de:"h",tok:R.tok,a:de,m})};
  c.close=()=>{c.open=false};return c}
async function relayCreatore(net,accogli){
  const R=net.rel;const conns={};let da=0,errs=0;
  while(!R.stop){
    try{const r=await relayPost(R.base,{op:"poll",c:net.code,chi:"h",tok:R.tok,da,att:15},25000);errs=0;
      if(r.err==="nostanza"){const x=await relayPost(R.base,{op:"crea",c:net.code,tok:R.tok},9000);if(!x.ok)break;continue}
      if(r.err)break;
      for(const [n,de,m] of r.m||[]){da=Math.max(da,n);let c=conns[de];
        if(!c){if(!m||m.t!=="hello")continue;c=conns[de]=relayOspiteLato(net,de);accogli(c)}
        if(m&&m.t==="addio"){c.emit("data",m);c.open=false;c.emit("close");delete conns[de];continue}
        c.emit("data",m)}}
    catch(e){if(++errs>8)break;await sleep(1500)}}
}
async function stanzaNuova(nick,onChange){
  let P=null,perr=null;
  try{if(!window.natanPeerLib)throw new Error("La rete non è disponibile.");P=await window.natanPeerLib()}catch(e){perr=e}
  const net=new Net(true);net.nick=nick;net.max=2;
  if(P){
    for(let tent=0;tent<6&&!net.peer;tent++){
      const code=genCode();
      await new Promise(res=>{let p;try{p=new P("natan-gioco-"+code,PEERCFG)}catch(e){return res()}
        const t=setTimeout(()=>{try{p.destroy()}catch(e){}res()},9000);
        p.on("open",()=>{clearTimeout(t);net.peer=p;net.code=code;res()});
        p.on("error",e=>{if(!net.peer){clearTimeout(t);try{p.destroy()}catch(x){}res()}})})}}
  // la via di riserva dal Mac: si prepara in parallelo (se il Mac non risponde, resta solo la connessione diretta)
  const base=await relayBase();
  if(base){
    const R={base,tok:RID(),stop:false};net.rel=R;
    const prova=async()=>{try{
      for(let k=0;k<(net.code?1:6);k++){
        const code=net.code||genCode();const r=await relayPost(base,{op:"crea",c:code,tok:R.tok},7000);
        if(r.ok){net.code=code;return true}
        if(net.code)return false}}catch(e){}return false};
    net.relOk=await prova();if(!net.relOk){net.rel=null}}
  if(!net.code)throw (perr&&!net.rel?perr:new Error("Non riesco a collegarmi alla rete: riprova tra poco."));
  // La stanza esiste solo finché il telefono resta collegato al servizio di PeerJS: se la connessione cade (pagina in secondo piano,
  // rete che cambia) il codice sparisce. Quindi la riattacchiamo subito, in automatico.
  const keep=()=>{const q=net.peer;if(q&&q.disconnected&&!q.destroyed){try{q.reconnect()}catch(e){}}};
  if(net.peer){
    net.peer.on("disconnected",()=>setTimeout(keep,500));
    net.peer.on("error",e=>{if(e&&["network","server-error","socket-error","socket-closed"].includes(e.type))setTimeout(keep,2000)})}
  net.hb=setInterval(keep,8000);net.vis=()=>{if(!document.hidden)keep()};document.addEventListener("visibilitychange",net.vis);
  const accogli=c=>{
    const ent={conn:c,nome:null,seat:-1,fine:false};
    const gone=()=>{if(ent.fine)return;ent.fine=true;const i=net.conns.indexOf(ent);
      if(i>=0){if(!net.started){net.conns.splice(i,1);onChange&&onChange();net.stato()}else if(net.h.partito)net.h.partito(ent)}};
    c.on("data",m=>{
      if(!m||typeof m!=="object")return;
      if(m.t==="hello"){
        if(ent.nome)return;
        if(c.relay&&GAMES[net.game]&&GAMES[net.game].rt){try{c.send({t:"nort"})}catch(e){}setTimeout(()=>{try{c.close()}catch(e){}},300);return}
        if(net.started||net.conns.length+1>=net.max){try{c.send({t:"pieno"})}catch(e){}setTimeout(()=>{try{c.close()}catch(e){}},300);return}
        let nome=pulisci(m.nome)||"Amico";const usati=[net.nick,...net.conns.map(x=>x.nome)];const base=nome;let k=2;while(usati.includes(nome))nome=base+k++;
        ent.nome=nome;net.conns.push(ent);onChange&&onChange();net.stato()}
      else if(!ent.nome)return;
      else if(m.t==="act")net.push({t:"act",seat:ent.seat,k:m.k});
      else if(m.t==="addio")gone();
      else net.dispatch(Object.assign({},m,{seat:ent.seat}),ent)});
    c.on("close",gone);
  };
  if(net.peer)net.peer.on("connection",accogli);
  if(net.rel)relayCreatore(net,accogli);
  net.stato=()=>{if(net.started)return;net.bcast({t:"lobby",game:net.game,umani:[net.nick,...net.conns.map(x=>x.nome)],n:net.n,lv:net.lv})};
  return net
}
async function unisciti(code,nick,onLobby){
  code=String(code||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
  const net=new Net(false);net.nick=nick;
  // un tentativo con una «connessione» (diretta o dal Mac): "ok", "pieno", "nort", "nostanza" (il codice non esiste) o "blocco" (c'è ma non si collega)
  const tenta=(apri,tempo)=>new Promise(res=>{
    let done=false;const fine=r=>{if(!done){done=true;clearTimeout(t);cur=null;res(r)}};
    const c=apri();net.up=c;
    const t=setTimeout(()=>{try{c.close()}catch(e){}fine("blocco")},tempo);
    cur=e=>{if(e&&e.type==="peer-unavailable")fine("nostanza")};
    c.on("open",()=>{c.send({t:"hello",nome:nick})});
    c.on("error",()=>fine("blocco"));
    c.on("data",m=>{
      if(!m||typeof m!=="object")return;
      if(m.t==="pieno"){fine("pieno");return}
      if(m.t==="nort"){fine("nort");return}
      if(m.t==="lobby"){fine("ok");onLobby&&onLobby(m)}
      else net.dispatch(m)});
    c.on("close",()=>{if(!done)fine("blocco");else net.dispatch({t:"bye"})});
    if(c.iniz)c.iniz().then(e=>{if(e)fine(e)});
  });
  let cur=null,r="blocco";
  // 1) connessione diretta tra i telefoni (veloce, non dipende dal Mac)
  try{
    if(!window.natanPeerLib)throw 0;
    const P=await window.natanPeerLib();const p=new P(undefined,PEERCFG);net.peer=p;
    await new Promise((ok,bad)=>{const t=setTimeout(()=>bad(0),10000);p.on("open",()=>{clearTimeout(t);ok()});
      p.on("error",e=>{if(!p.open){clearTimeout(t);bad(0)}else if(cur)cur(e)})});
    for(let k=0;k<2;k++){
      r=await tenta(()=>p.connect("natan-gioco-"+code,{reliable:true}),10000);
      if(r==="ok"||r==="pieno")break;
      try{net.up&&net.up.close()}catch(e){}
      if(r==="blocco")break;
      if(k<1)await sleep(1800)}
  }catch(e){r="blocco"}
  // 2) via di riserva dal Mac: funziona con qualsiasi rete
  let provato=false;
  if(r!=="ok"&&r!=="pieno"){
    const base=await relayBase();
    if(base){provato=true;
      const r2=await tenta(()=>relayOspite(base,code),14000);
      if(r2==="ok"||r2==="pieno"||r2==="nort")r=r2;
      else if(r2==="nostanza"&&r==="nostanza")r="nostanza";
      else r="blocco"}}
  if(r==="ok")return net;
  net.close();
  if(r==="pieno")throw new Error("La stanza è già piena.");
  if(r==="nort")throw new Error("Questo gioco in tempo reale ha bisogno della connessione diretta tra i telefoni, che qui è bloccata. Scegliete un gioco a turni (dama, biliardo, carte…) oppure collegatevi alla stessa rete Wi-Fi.");
  if(r==="nostanza")throw new Error("Non trovo la stanza «"+code+"». Controlla il codice e chiedi all'amico di tenere aperta la pagina della stanza (se esce o blocca il telefono, il codice smette di funzionare).");
  throw new Error("La stanza «"+code+"» c'è, ma la connessione non parte"+(provato?" nemmeno passando dal Mac di Kevin":" (la rete la blocca)")+". Riprova tra un attimo.")
}

// ------------------------------------------------------------------ reazioni con le emoji (giocatori e bot)
const EMO=["👋","👍","👏","😮","😂","😅","🤔","😎","🔥","🤝","😢","🎉"];
const EMOMS=2600;
// ogni bot ha un carattere suo e fisso: quanto parla e con che tono (gentile, sfottitore, tranquillo)
function emoCarattere(id){const h=h32("emo"+id);return {parla:.35+(h%50)/100,tono:["gentile","sfottitore","tranquillo"][(h>>>7)%3]}}
const EMOSET={
  ciao:{gentile:["👋"],sfottitore:["👋"],tranquillo:["👋"]},
  buona:{gentile:["👏","😮"],sfottitore:["😮","🤔","😅"],tranquillo:["🤔","😮","👍"]},          // il giocatore ha fatto una bella mossa
  errore:{gentile:["🤔","😮"],sfottitore:["😏","😜","😎"],tranquillo:["😎","🤔"]},             // il giocatore ha sbagliato
  grande:{gentile:["😎","😊"],sfottitore:["😎","😏","🔥"],tranquillo:["😎","👍"]},            // il bot ha fatto una mossa forte
  sbaglio:{gentile:["😬","🙈"],sfottitore:["🙈","😅"],tranquillo:["😅","🤷"]},                // il bot ha sbagliato
  dubbio:{gentile:["🤔"],sfottitore:["🤔","😅"],tranquillo:["🤔"]},                           // i suoi agenti non erano d'accordo
  vinto:{gentile:["🎉","🤝"],sfottitore:["😎","🏆","😜"],tranquillo:["😎","👍"]},
  perso:{gentile:["👏","🤝"],sfottitore:["😅","🙈","😤"],tranquillo:["😅","👏"]},
  pari:{gentile:["🤝"],sfottitore:["🤝","😅"],tranquillo:["🤝"]}};
// come risponde un bot a una reazione di un giocatore: dipende da chi sta vincendo e dal suo carattere
function emoRisposta(e,avanti,tono){
  switch(e){
    case "👋":return ["👋"];
    case "👍":case "👏":return tono==="sfottitore"?["😎","😜"]:["🙏","😊"];
    case "😂":return avanti?["😂","😎"]:["😅"];
    case "😮":return avanti?["😏","😎"]:["😬","😅"];
    case "😅":return avanti?["😎","😜"]:["😅","🤝"];
    case "🤔":return avanti?["😏"]:["🤔"];
    case "😎":return avanti?["😎","😤"]:["😮","🤔"];
    case "🔥":return avanti?["😎"]:["😮","😅"];
    case "🤝":return ["🤝"];
    case "😢":return tono==="sfottitore"?["😜","🤗"]:["🤗"];
    case "🎉":return avanti?["😅","🤔"]:["👏","🎉"];
  }
  return []}
function creaEmoBot(sh,ctx,seats,net,info){
  const L={n:0,ult:0,per:{},mom:0,off:false,fin:false};            // mom > 0: stanno vincendo i bot; < 0: sta vincendo chi gioca
  const cl=x=>Math.max(-4,Math.min(4,x));
  const botSeats=()=>seats.map((s,i)=>s.tipo==="bot"?i:-1).filter(i=>i>=0);
  const pick=()=>{const b=botSeats();return b.length?b[rnd(b.length)]:-1};
  const dire=(seat,sit,o)=>{o=o||{};
    const s=seats[seat];if(!s||s.tipo!=="bot"||!sh.g.isConnected)return false;
    const c=emoCarattere(s.bot.id),now=Date.now();
    if(!o.fine){
      if(L.n>=14||now-L.ult<(o.min==null?2500:o.min)||now-(L.per[seat]||0)<(o.min==null?7000:o.min))return false;
      if(Math.random()>Math.min(1,(o.forza==null?.5:o.forza)*(.4+c.parla)))return false}
    const lista=Array.isArray(sit)?sit:(EMOSET[sit]||{})[c.tono]||[];if(!lista.length)return false;
    const e=lista[rnd(lista.length)];L.n++;L.ult=now;L.per[seat]=now;
    setTimeout(()=>{if(!sh.g.isConnected||(L.fin&&!o.fine))return;sh.emo(seat,e);if(net&&net.host)net.bcast({t:"emo",seat,e})},o.ritardo||600);
    return true};
  return {
    ciao(){const b=pick();if(b>=0)dire(b,"ciao",{ritardo:1000+rnd(900),forza:1.4})},
    // una persona sta per muovere: il bot guarda se la mossa è tra le migliori o tra le peggiori e reagisce
    umana(S,seat,a){
      if(L.off||info.noEval||botSeats().length===0||!a)return;
      const t0=Date.now();let cands;try{cands=info.bot(S,seat,0)}catch(e){return}
      if(Date.now()-t0>400)L.off=true;                                // se il calcolo costa troppo, il gioco non ne risente mai più
      if(!cands||cands.length<3)return;
      const val=c=>(c.f&&+c.f.valore)||0;const vals=cands.map(val);const mx=Math.max(...vals),mn=Math.min(...vals),range=mx-mn;
      if(!(range>=.15))return;
      const mia=cands.find(c=>c.a&&c.a.k===a.k);if(!mia)return;
      const gap=(mx-val(mia))/range;const b=pick();if(b<0)return;
      if(gap<=.05){L.mom=cl(L.mom-1);dire(b,"buona",{forza:.7,ritardo:800+rnd(600)})}
      else if(gap>=.8){L.mom=cl(L.mom+1);dire(b,"errore",{forza:.8,ritardo:800+rnd(600)})}},
    // un bot ha scelto la sua mossa (r = il voto dei 35 agenti)
    bot(seat,r){
      const f=(r&&r.mossa&&r.mossa.f)||{};
      if(!r||r.unica)return;
      if(r.errore){L.mom=cl(L.mom-.7);dire(seat,"sbaglio",{forza:.9,ritardo:900});return}
      if((f.punti||0)>=.5||(f.attacco||0)>=.7||(f.finale||0)>=.8){L.mom=cl(L.mom+.5);dire(seat,"grande",{forza:.6,ritardo:800});return}
      if(r.voti<=11)dire(seat,"dubbio",{forza:.35,ritardo:600})},
    // una persona ha mandato una reazione: un bot può risponderle
    rispondi(da,e){
      const b=pick();if(b<0||!seats[b])return;
      const lista=emoRisposta(e,L.mom>.5,emoCarattere(seats[b].bot.id).tono);
      if(lista.length)dire(b,lista,{forza:.95,min:1500,ritardo:1000+rnd(1200)})},
    // l'esito di un tiro (biliardo): il bot reagisce al colpo di una persona
    esito(seat,tipo){
      if(L.off||botSeats().length===0)return;const b=pick();if(b<0)return;
      if(tipo==="buona"){L.mom=cl(L.mom-1);dire(b,"buona",{forza:.7,ritardo:900+rnd(600)})}
      else{L.mom=cl(L.mom+1);dire(b,"errore",{forza:.8,ritardo:900+rnd(600)})}},
    // fine partita: ognuno dei bot saluta a modo suo
    fine(win,pari){
      L.fin=true;botSeats().forEach((i,k)=>dire(i,pari?"pari":(win||[]).includes(i)?"vinto":"perso",{fine:true,ritardo:700+k*500+rnd(500)}))}}
}
function installaEmo(sh,ctx,seats,net,me,info){
  const logic=(!net||net.host)?creaEmoBot(sh,ctx,seats,net,info):null;sh.logic=logic;
  let ultimo=0;
  sh.manda=e=>{const now=Date.now();if(!EMO.includes(e)||now-ultimo<700)return;ultimo=now;
    sh.emo(me,e);
    if(net){if(net.host)net.bcast({t:"emo",seat:me,e});else net.send({t:"emo",e})}
    if(logic)logic.rispondi(me,e)};
  if(net){
    if(net.host)net.h.emo=(m,ent)=>{                                   // da un amico: la mostro e la giro agli altri
      if(!EMO.includes(m.e)||!(m.seat>=0)||!seats[m.seat])return;
      const now=Date.now();if(ent&&now-(ent.ultEmo||0)<600)return;if(ent)ent.ultEmo=now;
      sh.emo(m.seat,m.e);
      for(const c of net.conns){if(c!==ent&&c.conn&&c.conn.open){try{c.conn.send({t:"emo",seat:m.seat,e:m.e})}catch(x){}}}
      if(logic)logic.rispondi(m.seat,m.e)};
    else net.h.emo=m=>{if(EMO.includes(m.e)&&seats[m.seat])sh.emo(m.seat,m.e)}}
  if(logic)logic.ciao()
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
  const bub={};                                                       // reazioni in corso: posto -> {e, fino a quando}
  const mostra=seat=>{const b=bub[seat];if(!b)return;const resto=b.until-Date.now();if(resto<=0){delete bub[seat];return}
    const c=pls.querySelector('[data-seat="'+seat+'"]');if(!c)return;c.querySelectorAll(".emob").forEach(x=>x.remove());
    const x=E("span","emob",b.e);x.style.animationDelay="-"+((EMOMS-resto)/1000).toFixed(2)+"s";c.append(x)};
  const bar=E("div","emobar");bar.id="emoBar";bar.append(E("small","","Reazioni:"));
  EMO.forEach(e=>{const b=E("button","",e);b.dataset.e=e;b.setAttribute("aria-label","Manda "+e);b.onclick=()=>{if(sh.manda)sh.manda(e)};bar.append(b)});
  g.append(bar);
  const sh={g,ng,status,pls,bar,
    emo(seat,e){bub[seat]={e,until:Date.now()+EMOMS};mostra(seat);
      setTimeout(()=>{const b=bub[seat];if(b&&b.until<=Date.now()){delete bub[seat];const c=pls.querySelector('[data-seat="'+seat+'"]');c&&c.querySelectorAll(".emob").forEach(x=>x.remove())}},EMOMS+80)},
    players(seats,turn,me){pls.innerHTML="";seats.forEach((s,i)=>{
      let c;if(s.tipo==="bot")c=botCard(s.bot);else{c=E("div","pl");c.append(E("b","",(i===me?"🙂 ":"👤 ")+s.nome),E("small","",i===me?"Tu":"Giocatore online"))}
      c.classList.toggle("turn",i===turn);c.dataset.seat=String(i);pls.append(c)});
      Object.keys(bub).forEach(k=>mostra(k))}};
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
  if(net)net.reset();
  installaEmo(sh,ctx,seats,net,me,info);
  if(net){
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
  let S=info.init(n,cfg.seed,cfg.opz||{});let seq=0;
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
    try{sh.logic&&sh.logic.bot(seat,r)}catch(e){}
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
        if(st.tipo!=="bot"&&sh.logic){try{sh.logic.umana(S,seat,a)}catch(e){}}
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
  try{sh.logic&&sh.logic.fine(win,pari)}catch(er){}
}

// ------------------------------------------------------------------ lobby: livello, numero di giocatori, online
function lobby(pg,info){
  style();pg.innerHTML="";const g=E("div","gm");pg.append(g);
  const mn=info.min||2,mx=info.max||2;
  const cfg={mode:"bot",lv:Math.min(3,Math.max(0,+LSG.get("natan_gaming_lv",1)||0)),n:Math.min(mx,Math.max(mn,+LSG.get("natan_gaming_n_"+info.id,mn)||mn)),nick:nickSalvato(),bots:[]};
  cfg.opz=Object.assign({},...(info.opzioni||[]).map(o=>({[o.id]:!!o.def})),LSG.get("natan_gaming_opz_"+info.id,{}));
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
    if(info.opzioni&&info.opzioni.length){
      const b6=E("div","box");b6.append(E("h3","","Regole"));
      info.opzioni.forEach(o=>{const lab=E("label");lab.style.cssText="display:flex;gap:10px;align-items:flex-start;cursor:pointer";
        const cb=E("input");cb.type="checkbox";cb.id="opz_"+o.id;cb.checked=!!cfg.opz[o.id];cb.onchange=()=>{cfg.opz[o.id]=cb.checked;LSG.set("natan_gaming_opz_"+info.id,cfg.opz)};
        const tx=E("span");tx.append(E("b","",o.nome),E("br"),E("small","",o.desc));lab.append(cb,tx);b6.append(lab)});
      body.append(b6)}
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
        b5.append(E("small","","Codice della stanza: i tuoi amici aprono Giochi → «Entra in una stanza con un codice» e lo scrivono. Tieni aperta questa pagina e il telefono acceso finché non sono entrati."),c,E("small","",`${umani().length} di ${cfg.n} giocatori presenti. I posti liberi li prendono i bot.`),
          E("small","",net.relOk?"✅ Funziona anche con amici su un'altra rete Wi-Fi o con il 4G/5G.":"ℹ️ Per ora solo connessione diretta: tra reti diverse a volte non passa (il Mac di Kevin non risponde, quindi manca la via di riserva)."))}
      if(errore)b5.append(E("small","",errore));
      body.append(b5)}
    const go=E("button","btn","▶ Inizia la partita");go.id="startGame";
    go.onclick=()=>{
      const hum=umani();const nn=Math.max(cfg.n,hum.length);
      const seats=hum.map(nm=>({tipo:"umano",nome:nm}));
      const pool=cfg.bots.slice();while(pool.length<nn-hum.length)pool.push(...scegliBot(1,pool.map(b=>b.id)));
      pool.slice(0,nn-hum.length).forEach(b=>seats.push({tipo:"bot",nome:b.nome,botId:b.id}));
      const c={game:info.id,seats,lv:cfg.lv,seed:(Math.random()*2**31)|0,opz:cfg.opz};
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
// una vittoria nei giochi da soli (Sudoku, Mahjong): conta per le statistiche e i trofei
function soloVinto(id){
  const info=GAMES[id];if(!info)return;
  const st=LSG.get("natan_gaming_stats",{});const k=st[id]=st[id]||{v:0,p:0,n:0};k.p++;LSG.set("natan_gaming_stats",st);
  const X=Object.assign(nuovoX(),LSG.get("natan_gaming_x",{}));X.tot++;try{X.giorni[new Date().toISOString().slice(0,10)]=1}catch(e){}LSG.set("natan_gaming_x",X);
  try{controllaTrofei()}catch(e){}}
function menu(pg){
  style();pg.innerHTML="";const g=E("div","gm zmenu");pg.append(g);
  const Z=window.__G.zen||null;
  const top=E("div","top");const back=E("button","btn ghost","← Ritorna");back.id="gmBack";back.onclick=()=>{try{window.openChat()}catch(e){location.reload()}};top.append(back);g.append(top);
  const hero=E("div","zhero");const hl=E("div");const h1=E("h1","","Giardino Zen");h1.append(E("span","","庭"));
  hl.append(h1,E("p","","Giochi calmi da soli, contro i bot di Natan Gaming o con gli amici online."));hero.append(hl);
  if(Z){const ctl=E("div","zctl");const mb=E("button","","Musica: "+Z.STYLES[Z.Music.idx].name);mb.id="musicBtn";mb.onclick=()=>{Z.A.init();Z.Music.cycle();mb.textContent="Musica: "+Z.STYLES[Z.Music.idx].name};
    const sb=E("button","",Z.A.sfx?"Suoni accesi":"Suoni spenti");sb.id="sfxBtn";sb.onclick=()=>{Z.A.sfx=!Z.A.sfx;LSG.set("natan_zen_sfx",Z.A.sfx);sb.textContent=Z.A.sfx?"Suoni accesi":"Suoni spenti";if(Z.A.sfx)Z.sfx("hint")};
    ctl.append(mb,sb);hero.append(ctl);
    g.addEventListener("pointerdown",()=>{try{Z.A.init();Z.Music.start()}catch(e){}},{once:true});setTimeout(()=>{try{Z.Music.start()}catch(e){}},50)}
  g.append(hero);
  const ng=ngPanel();ng.el.forEach(x=>g.append(x));
  const st=LSG.get("natan_gaming_stats",{});
  const c=E("div","cards zcards");g.append(c);
  const lista=Object.entries(GAMES).sort((a,b)=>(a[1].ord||99)-(b[1].ord||99));
  for(const [k,info] of lista){const b=E("button","gcard zstone");b.dataset.g=k;
    if(Z&&Z.PIC&&Z.PIC[k]){const w=E("div");w.innerHTML=Z.PIC[k];b.append(w.firstChild)}else b.append(E("span","ic",info.ic));
    const t=E("span","txt");t.append(E("strong","",info.nome),E("small","",info.sub),E("small","",info.solo?"Da solo":info.min===info.max?`${info.max} giocatori`:`${info.min}-${info.max} giocatori`));
    const s=st[k];if(s)t.append(E("small","",info.solo?`Vinte: ${s.p}`:`Tu ${s.p} · Bot ${s.v}`+(s.n?` · pari ${s.n}`:"")));
    b.append(t);
    b.onclick=()=>info.apri?info.apri(pg,()=>menu(pg)):tutorial(pg,info,()=>lobby(pg,info));c.append(b)}
  const tb=E("button","btn ghost");tb.id="trofeiBtn";{const T=trofei();tb.textContent=`🏆 Trofei (${T.filter(t=>t.ok).length}/${T.length})`}tb.onclick=()=>schermataTrofei(pg);tb.style.marginRight="8px";g.append(tb);
  const j=E("button","btn ghost","🔑 Entra in una stanza con un codice");j.id="entraStanza";j.onclick=()=>entraStanza(pg);g.append(j);
  const dt=E("details","box");dt.id="botList";dt.append(E("summary","","🤖 I 30 bot di Natan Gaming (nome, esperienza, 35 agenti ciascuno)"));
  const lst=BOTS.map(b=>botInfo(b.id)).sort((a,b)=>b.xp-a.xp);const w=E("div","pls");w.style.marginTop="10px";
  lst.forEach(i=>w.append(botCard(BOTS.find(b=>b.id===i.id))));dt.append(w);g.append(dt);
}
window.GIOCHI={open(pg){style();intro();menu(pg)},_games:GAMES,_net:{stanzaNuova,unisciti},_consiglio:consiglio,AGENTI,BOTS,LIV,botInfo,_avvia:avvia};
window.__G={E,LSG,sleep,rnd,shuffle,mulberry,SLOW,h32,GAMES,consiglio,fineBanner,scegliBot,botCard,F,LIV,NAG,soloVinto,menu,
  register(info){GAMES[info.id]=info;return info}};
})();
