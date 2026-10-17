// NATAN TEST: verifiche a scelta multipla (scuola media, superiori, università) con una breve animazione di Natan
(function(){
"use strict";
const L=window.natanTestLib;const {el,LS,api}=L;
const SCUOLE=["Scuola media","Scuole superiori","Università"],DIFF=["Facile","Medio","Difficile","Estremo"];
const LIV={"Scuola media":"uno studente di scuola media (11-14 anni): parole semplici, frasi corte","Scuole superiori":"uno studente delle superiori (14-19 anni): linguaggio da manuale scolastico","Università":"uno studente universitario: terminologia tecnica e concetti più profondi"};
const DIF={"Facile":"domande dirette, una sola idea, risposte sbagliate chiaramente diverse","Medio":"domande che richiedono di aver capito, risposte sbagliate plausibili","Difficile":"domande di ragionamento, risposte sbagliate molto simili alla giusta","Estremo":"domande da esame difficile: collegano più idee, eccezioni e casi particolari, risposte sbagliate quasi identiche"};
// ---- controlli e prompt (stessa idea del Mac: scrittura, 20 controlli, rimescolamento)
const wd=t=>new Set((String(t||"").toLowerCase().match(/\p{L}{4,}/gu)||[]));
function prompt(arg,sc,df,n,note){const ap=note.length?"\n\nAppunti da usare come fonte:\n"+note.slice(0,4).map(x=>x.slice(0,450)).join("\n---\n"):"";
  return `Prepara una verifica a scelta multipla di ${n} domande sull'argomento: «${arg}».\nScrivi per ${LIV[sc]}. Difficoltà ${df.toLowerCase()}: ${DIF[df]}.\nMescola i tipi di domanda (definizione, causa ed effetto, confronto, esempio, vero o falso, completa la frase). Ogni domanda ha 4 opzioni, UNA sola giusta, e una spiegazione di una frase.${ap}\n\nRispondi SOLO con un array JSON, in italiano, senza LaTeX:\n[{"d":"testo della domanda","o":["A","B","C","D"],"c":0,"sp":"perché è giusta"}]\n("c" è la posizione 0-3 della risposta giusta.) Non inventare fatti.`}
function leggi(t){t=String(t||"").replace(/```(?:json)?/g,"");const a=t.indexOf("["),b=t.lastIndexOf("]");if(a<0||b<=a)return[];let s=t.slice(a,b+1);
  for(const c of [s,s.replace(/,\s*([\]}])/g,"$1")]){try{const v=JSON.parse(c);if(Array.isArray(v))return v.filter(x=>x&&typeof x==="object")}catch(e){}}return[]}
function ripara(d){let o=(d.o||d.opzioni||[]).map(x=>String(x).replace(/^\s*(?:[A-Da-d][).:]|\d[).])\s*/,"").trim());o=[...new Set(o.filter(Boolean))].slice(0,4);
  let c=d.c!=null?d.c:d.giusta;c=/^-?\d+$/.test(String(c))?+c:("ABCD".indexOf(String(c||"").trim().toUpperCase()[0]));
  let q=String(d.d||d.domanda||"").replace(/\s+/g," ").trim();if(q&&!/[?:.…]$/.test(q))q+="?";return{d:q,o,c,sp:String(d.sp||d.spiegazione||"").replace(/\s+/g," ").trim()}}
function controlli(d,arg,altre){const r=[];const{d:q,o,c,sp}=d;
  if(o.length!==4)r.push("opzioni");if(new Set(o.map(x=>x.toLowerCase())).size!==o.length)r.push("uguali");if(!(c>=0&&c<o.length))r.push("indice");
  if(q.length<12||q.length>420)r.push("lunghezza");if(o.some(x=>!x||x.length>220))r.push("opzione");
  if(o.some(x=>/tutte le (precedenti|risposte)|nessuna delle/i.test(x)))r.push("tutte");if(/[一-鿿]|\\frac|\$\$/.test(q+o.join("")+sp))r.push("strano");
  if(sp.length<8)r.push("spiegazione");if(altre.some(a=>a.d.slice(0,60).toLowerCase()===q.slice(0,60).toLowerCase()))r.push("doppia");
  if(c>=0&&o[c]&&o[c].length>18&&q.toLowerCase().includes(o[c].toLowerCase()))r.push("risposta nella domanda");
  const st=[...wd(arg)].map(x=>x.slice(0,5)),tx=[...wd(q+" "+sp+" "+o.join(" "))].map(x=>x.slice(0,5));if(st.length&&!st.some(x=>tx.includes(x)))r.push("fuori argomento");return r}
function rimescola(ds,seme){let s=seme||1;const R=()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296};
  ds.forEach(d=>{const g=d.o[d.c];const al=d.o.filter((_,j)=>j!==d.c);for(let i=al.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[al[i],al[j]]=[al[j],al[i]]}const p=Math.floor(R()*4);al.splice(p,0,g);d.o=al;d.c=p});return ds}
async function appunti(arg){try{const r=await L.cerca(arg);return r}catch(e){return[]}}
const wstem=t=>String(t||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").match(/[a-z0-9]{3,}/g)||[];
function promptAperte(arg,sc,df,k,note){const ap=note.length?"\n\nAppunti da usare come fonte:\n"+note.slice(0,4).map(x=>x.slice(0,450)).join("\n---\n"):"";
  return `Prepara ${k} domande APERTE (risposta scritta di una o due frasi) sull'argomento: «${arg}».\nScrivi per ${LIV[sc]}. Difficoltà ${df.toLowerCase()}: ${DIF[df]}.\nOgni domanda ha una risposta modello breve (1-2 frasi) e da 3 a 5 parole chiave che una buona risposta deve contenere.${ap}\n\nRispondi SOLO con un array JSON, in italiano, senza LaTeX:\n[{"d":"testo della domanda","r":"risposta modello","k":["parola1","parola2","parola3"]}]\nNon inventare fatti.`}
function ripAperta(x){const q0=String(x.d||x.domanda||"").replace(/\s+/g," ").trim(),q=q0&&!/[?:.…]$/.test(q0)?q0+"?":q0,r=String(x.r||x.risposta||"").replace(/\s+/g," ").trim();
  const k=[...new Set((x.k||x.parole||[]).map(a=>String(a).trim().toLowerCase()).filter(a=>a.length>=3&&a.length<=30))].slice(0,6);
  const rs=wstem(r).map(a=>a.slice(0,5));const ok=q.length>=12&&q.length<=300&&r.length>=12&&r.length<=450&&k.length>=2&&k.filter(a=>rs.includes((wstem(a)[0]||"").slice(0,5))).length>=Math.max(2,Math.floor(k.length/2))&&!/[一-鿿]|\\frac|\$\$/.test(q+r);
  return ok?{d:q,r,k}:null}
async function aperteDaDispositivo(arg,sc,df,k,prog){const lvl=L.deviceLevel();if(!lvl)return[];prog("Natan scrive le domande aperte…");const note=await appunti(arg);
  try{const r=await L.gen(lvl,[{role:"system",content:"Sei Natan e prepari verifiche scolastiche. Rispondi solo nel formato richiesto."},{role:"user",content:promptAperte(arg,sc,df,k+1,note)}],{maxTokens:1000});
    const out=[];for(const x of leggi(r.text)){const a=ripAperta(x);if(a&&!out.some(b=>b.d.slice(0,40)===a.d.slice(0,40)))out.push(a)}return out.slice(0,k)}catch(e){return[]}}
async function daDispositivo(arg,sc,df,n,prog){
  const lvl=L.deviceLevel();if(!lvl)throw Object.assign(new Error("Il server di Natan è spento e sul tuo dispositivo non c'è ancora un Natan scaricato (lo trovi in Impostazioni)."),{code:0});
  prog("Natan sul tuo dispositivo scrive le domande…");const note=await appunti(arg);
  const r=await L.gen(lvl,[{role:"system",content:"Sei Natan e prepari verifiche scolastiche. Rispondi solo nel formato richiesto."},{role:"user",content:prompt(arg,sc,df,n+1,note)}],{maxTokens:1300});
  prog("Controllo le domande…");const buone=[];let scarti=0;for(const x of leggi(r.text)){const d=ripara(x);const c=controlli(d,arg,buone);if(c.length)scarti++;else buone.push(d)}
  return{domande:rimescola(buone.slice(0,n),Date.now()%100000),n_scartate:scarti,come:"sul dispositivo",argomento:arg,scuola:sc,diff:df}}
async function genera(arg,sc,df,n,k,prog){
  prog("Chiedo a Natan sul Mac…");let x=null;
  try{x=await api("/test/genera",{argomento:arg,scuola:sc,diff:df,n,aperte:k})}
  catch(e){if(e.code===401)throw e;if(!(e.code===0||e.code===503||e.code===500))throw e;
    x=n>0?await daDispositivo(arg,sc,df,n,prog):{domande:[],argomento:arg,scuola:sc,diff:df}}
  x.aperte=Array.isArray(x.aperte)?x.aperte:[];
  if(k>x.aperte.length){const piu=await aperteDaDispositivo(arg,sc,df,k-x.aperte.length,prog);x.aperte=x.aperte.concat(piu)}
  return x}
// ---- correzione delle risposte aperte: quante parole chiave ci sono nella risposta
function correggiAperta(q,txt){const toks=new Set(wstem(txt).map(a=>a.slice(0,5)));const words=wstem(txt);
  const hit=q.k.map(k=>{const s=wstem(k);return s.length>0&&s.every(w=>toks.has(w.slice(0,5)))});
  const f=hit.filter(Boolean).length/Math.max(1,q.k.length);const punti=words.length<3?0:f>=.7?1:f>=.4?.5:0;
  return{hit,punti,f}}

// ---------------------------------------------------------------- grafica e animazioni
const RM=()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){return false}};
function css(){if(document.getElementById("ntcss"))return;const s=el("style");s.id="ntcss";s.textContent=`
.nt{max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:16px;--ntg:linear-gradient(135deg,#7c83ff,#b06cff 60%,#ff7ab6)}
.nt .hero{position:relative;border-radius:22px;padding:18px 18px 10px;background:var(--ntg);color:#fff;overflow:hidden;display:flex;align-items:center;gap:6px;animation:ntpop .6s cubic-bezier(.2,.9,.3,1.2) both}
.nt .hero::before,.nt .hero::after{content:"";position:absolute;border-radius:50%;background:rgba(255,255,255,.14);animation:ntfloat 7s ease-in-out infinite}
.nt .hero::before{width:180px;height:180px;right:-50px;top:-70px}.nt .hero::after{width:110px;height:110px;right:90px;bottom:-60px;animation-delay:-3s}
.nt .hero .tx{position:relative;z-index:1;flex:1;min-width:0}.nt .hero h2{margin:0 0 4px;font-size:clamp(22px,5vw,30px);letter-spacing:-.5px;color:#fff}.nt .hero p{margin:0;opacity:.92;font-size:14px;line-height:1.4}
.nt .hero svg.nat{width:min(46%,200px);height:auto;position:relative;z-index:1;flex:none}
.nt .stage{border-radius:20px;background:var(--ntg);padding:6px 0;display:flex;justify-content:center;overflow:hidden;animation:ntpop .5s both}
.nt .stage svg.nat{width:min(100%,360px);height:auto}
.nt .body{animation:ntb 2.6s ease-in-out infinite;transform-origin:center bottom;transform-box:fill-box}
.nt .intro .body{animation:ntin 1s ease-out 1,ntb 2.6s ease-in-out 1s infinite}
.nt .eye{animation:ntblink 3.4s infinite;transform-origin:center;transform-box:fill-box}
.nt .pen{transform-origin:center;animation:ntbob 1.6s ease-in-out infinite;transform-box:fill-box}
.nt .writing .pen{animation:ntwrite 1.1s linear infinite}
.nt .ln{stroke-dasharray:130;stroke-dashoffset:0}.nt .writing .ln{animation:ntln 2.2s linear infinite}
.nt .writing .ln:nth-of-type(2){animation-delay:.3s}.nt .writing .ln:nth-of-type(3){animation-delay:.6s}.nt .writing .ln:nth-of-type(4){animation-delay:.9s}
.nt .happy .body{animation:ntjump .5s ease-out 3}.nt .sad .body{animation:ntsad 1.2s ease-in-out 2}
.nt .spark{animation:ntspark 1.3s ease-in-out infinite;transform-box:fill-box;transform-origin:center}.nt .spark:nth-of-type(2){animation-delay:.4s}.nt .spark:nth-of-type(3){animation-delay:.8s}
@keyframes ntb{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}@keyframes ntin{from{transform:translateX(-160px)}to{transform:none}}
@keyframes ntblink{0%,94%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}@keyframes ntbob{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}
@keyframes ntwrite{0%{transform:translate(0,0)}25%{transform:translate(80px,6px)}26%{transform:translate(0,22px)}50%{transform:translate(80px,28px)}51%{transform:translate(0,44px)}75%{transform:translate(80px,50px)}100%{transform:translate(0,0)}}
@keyframes ntln{0%{stroke-dashoffset:130}60%,100%{stroke-dashoffset:0}}@keyframes ntjump{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
@keyframes ntsad{0%,100%{transform:rotate(0)}30%{transform:rotate(-5deg)}70%{transform:rotate(5deg)}}@keyframes ntspark{0%,100%{opacity:.2;transform:scale(.6)}50%{opacity:1;transform:scale(1.2)}}
@keyframes ntpop{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}@keyframes ntfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(14px)}}
@keyframes ntslide{from{opacity:0;transform:translateX(34px)}to{opacity:1;transform:none}}@keyframes ntshake{0%,100%{transform:none}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
@keyframes ntglow{0%{box-shadow:0 0 0 0 rgba(62,207,142,.7)}100%{box-shadow:0 0 0 18px rgba(62,207,142,0)}}@keyframes ntshine{from{transform:translateX(-120%)}to{transform:translateX(220%)}}
@keyframes ntrise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.nt .card{background:var(--raise,#1f2129);border:1px solid var(--line,#2c2f3b);border-radius:20px;padding:18px;display:flex;flex-direction:column;gap:12px;animation:ntpop .45s both}
.nt .card.q{animation:ntslide .38s cubic-bezier(.2,.8,.3,1) both}
.nt .lab{font-weight:700;font-size:13px;letter-spacing:.4px;text-transform:uppercase;opacity:.7;display:flex;align-items:center;gap:8px}
.nt .tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(104px,1fr));gap:8px}
.nt .tile{border:1.5px solid var(--line,#2c2f3b);background:transparent;color:inherit;border-radius:16px;padding:12px 8px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:14px;font-weight:600;transition:transform .18s,border-color .18s,background .18s,box-shadow .18s}
.nt .tile .e{font-size:26px;transition:transform .25s}.nt .tile small{font-weight:500;opacity:.65;font-size:11.5px}
.nt .tile:hover{transform:translateY(-3px);border-color:var(--accent,#7c83ff)}.nt .tile:hover .e{transform:scale(1.18) rotate(-6deg)}.nt .tile:active{transform:scale(.96)}
.nt .tile.on{background:linear-gradient(135deg,rgba(124,131,255,.28),rgba(176,108,255,.22));border-color:var(--accent,#7c83ff);box-shadow:0 6px 18px rgba(124,131,255,.28)}
.nt .seg{display:flex;background:rgba(127,127,160,.15);border-radius:14px;padding:4px;gap:4px;position:relative}
.nt .seg button{flex:1;border:0;background:transparent;color:inherit;padding:10px 6px;border-radius:11px;font-size:14px;font-weight:600;cursor:pointer;transition:background .2s,color .2s,transform .15s}
.nt .seg button.on{background:var(--accent,#7c83ff);color:#fff;box-shadow:0 3px 10px rgba(124,131,255,.4)}.nt .seg button:active{transform:scale(.95)}
.nt .sug{display:flex;gap:6px;flex-wrap:wrap}.nt .sug button{border:1px dashed var(--line,#2c2f3b);background:transparent;color:inherit;border-radius:999px;padding:6px 12px;font-size:13px;cursor:pointer;opacity:.85;transition:all .15s;animation:ntrise .4s both}
.nt .sug button:hover{border-style:solid;border-color:var(--accent,#7c83ff);transform:translateY(-2px);opacity:1}
.nt input[type=text],.nt textarea{padding:14px;border-radius:14px;border:1.5px solid var(--line,#2c2f3b);background:var(--bg,#15161c);color:inherit;font-size:16px;width:100%;box-sizing:border-box;font-family:inherit;transition:border-color .2s,box-shadow .2s}
.nt input[type=text]:focus,.nt textarea:focus{outline:none;border-color:var(--accent,#7c83ff);box-shadow:0 0 0 4px rgba(124,131,255,.22)}.nt textarea{min-height:112px;resize:vertical;line-height:1.5}
.nt .go{position:relative;overflow:hidden;border:0;border-radius:16px;padding:15px 20px;font-size:17px;font-weight:800;color:#fff;background:var(--ntg);cursor:pointer;transition:transform .15s,box-shadow .2s;box-shadow:0 8px 22px rgba(124,131,255,.4)}
.nt .go:hover{transform:translateY(-2px)}.nt .go:active{transform:scale(.97)}.nt .go::after{content:"";position:absolute;top:0;bottom:0;width:40%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.35),transparent);animation:ntshine 2.8s ease-in-out infinite}
.nt .go.sec{background:transparent;color:inherit;border:1.5px solid var(--line,#2c2f3b);box-shadow:none;font-weight:700;font-size:15px}.nt .go.sec::after{display:none}
.nt .row{display:flex;gap:8px;flex-wrap:wrap}.nt .row>*{flex:1;min-width:130px}
.nt .hist{display:flex;gap:6px;flex-wrap:wrap;align-items:center;font-size:13px}.nt .hist b{padding:3px 9px;border-radius:999px;color:#fff;font-size:12px}
.nt .meta{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;opacity:.85}
.nt .badge{padding:3px 10px;border-radius:999px;background:rgba(124,131,255,.2);font-weight:700;font-size:12px}.nt .badge.o{background:rgba(255,122,182,.22)}
.nt .prog{height:8px;border-radius:6px;background:rgba(127,127,160,.22);overflow:hidden}.nt .prog i{display:block;height:100%;background:var(--ntg);transition:width .5s cubic-bezier(.2,.8,.3,1);border-radius:6px}
.nt .qt{font-size:clamp(17px,4.2vw,21px);font-weight:700;line-height:1.35}
.nt .opt{display:flex;gap:12px;align-items:center;width:100%;text-align:left;padding:13px 14px;border-radius:14px;border:1.5px solid var(--line,#2c2f3b);background:transparent;color:inherit;font-size:15px;cursor:pointer;transition:transform .15s,border-color .15s,background .2s;animation:ntrise .35s both}
.nt .opt .l{flex:none;width:30px;height:30px;border-radius:10px;display:grid;place-items:center;font-weight:800;background:rgba(127,127,160,.2);transition:all .2s}
.nt .opt:hover:not(:disabled){transform:translateX(4px);border-color:var(--accent,#7c83ff)}.nt .opt:active:not(:disabled){transform:scale(.98)}
.nt .opt.good{background:rgba(62,207,142,.16);border-color:#3ecf8e;animation:ntglow .8s}.nt .opt.good .l{background:#3ecf8e;color:#0b2d1d}
.nt .opt.bad{background:rgba(240,100,100,.15);border-color:#f06464;animation:ntshake .45s}.nt .opt.bad .l{background:#f06464;color:#fff}.nt .opt:disabled{cursor:default}
.nt .fb{font-size:14.5px;line-height:1.5;animation:ntrise .35s both}.nt .fb.ok{color:#3ecf8e}.nt .fb.no{color:#f58a8a}.nt .fb span{color:var(--fg,inherit)}
.nt .kw{display:flex;gap:6px;flex-wrap:wrap}.nt .kw b{padding:4px 10px;border-radius:999px;font-size:12.5px;animation:ntrise .3s both}.nt .kw b.y{background:rgba(62,207,142,.2);color:#3ecf8e}.nt .kw b.n{background:rgba(240,100,100,.18);color:#f58a8a}
.nt .model{padding:12px 14px;border-radius:14px;background:rgba(124,131,255,.12);border-left:4px solid var(--accent,#7c83ff);font-size:14.5px;line-height:1.5;animation:ntrise .35s both}
.nt .cnt{font-size:12px;opacity:.6;text-align:right}
.nt .res{display:grid;place-items:center;gap:6px;padding:6px 0}
.nt .ring{position:relative;width:170px;height:170px}.nt .ring svg{transform:rotate(-90deg)}.nt .ring circle{fill:none;stroke-width:12;stroke-linecap:round}
.nt .ring .bg{stroke:rgba(127,127,160,.22)}.nt .ring .fg{transition:stroke-dashoffset 1.4s cubic-bezier(.2,.8,.3,1)}
.nt .ring .num{position:absolute;inset:0;display:grid;place-items:center;font-size:42px;font-weight:800}.nt .ring .num small{display:block;font-size:13px;opacity:.65;font-weight:600;text-align:center;margin-top:-4px}
.nt .rv{display:flex;flex-direction:column;gap:8px}.nt .rv details{border:1px solid var(--line,#2c2f3b);border-radius:14px;padding:10px 12px;animation:ntrise .4s both}
.nt .rv summary{cursor:pointer;font-weight:600;font-size:14.5px;list-style:none;display:flex;gap:10px;align-items:flex-start}.nt .rv summary::-webkit-details-marker{display:none}
.nt .rv .in{margin-top:8px;font-size:14px;line-height:1.5;opacity:.92}
.ntconf{position:fixed;z-index:9999;pointer-events:none;width:9px;height:14px;border-radius:2px}
@media (prefers-reduced-motion:reduce){.nt *,.nt *::before,.nt *::after{animation:none!important;transition:none!important}}`;document.head.append(s)}
function natan(estado){const e=estado||"";return `<svg class="nat ${e}" viewBox="0 0 420 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs><radialGradient id="ntb${e}" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".45" stop-color="#9aa0ff"/><stop offset="1" stop-color="#5a5fe0"/></radialGradient></defs>
<g class="${e==="intro"?"intro":""}"><rect x="250" y="22" width="150" height="110" rx="8" fill="#fbf8ee" stroke="rgba(0,0,0,.25)" stroke-width="2"/>
<g stroke="#9aa0b5" stroke-width="3" stroke-linecap="round" fill="none"><line class="ln" x1="262" y1="44" x2="380" y2="44"/><line class="ln" x1="262" y1="66" x2="360" y2="66"/><line class="ln" x1="262" y1="88" x2="380" y2="88"/><line class="ln" x1="262" y1="110" x2="340" y2="110"/></g>
<g class="pen"><polygon points="262,36 284,26 288,32 266,42" fill="#f5b84a" stroke="#a8741a"/></g>
<g class="body"><ellipse cx="118" cy="132" rx="38" ry="6" fill="rgba(0,0,0,.2)"/><circle cx="118" cy="82" r="46" fill="url(#ntb${e})" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>
<ellipse class="eye" cx="101" cy="64" rx="7" ry="8" fill="#fff"/><ellipse class="eye" cx="135" cy="64" rx="7" ry="8" fill="#fff"/><circle cx="103" cy="66" r="3.5" fill="#222"/><circle cx="137" cy="66" r="3.5" fill="#222"/>
<circle cx="90" cy="80" r="6" fill="#ff7ab6" opacity=".45"/><circle cx="146" cy="80" r="6" fill="#ff7ab6" opacity=".45"/>
${e==="sad"?'<path d="M104 84 Q118 76 132 84" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>':'<path d="M104 78 Q118 90 132 78" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>'}</g></g>
${e==="happy"?'<g fill="#ffe066"><path class="spark" d="M190 30l4 9 9 4-9 4-4 9-4-9-9-4 9-4z"/><path class="spark" d="M205 70l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><path class="spark" d="M170 12l3 6 6 3-6 3-3 6-3-6-6-3 6-3z"/></g>':""}</svg>`}
function confetti(x,y,n){if(RM())return;const cols=["#ff7ab6","#7c83ff","#ffd43b","#3ecf8e","#4dabf7","#ff922b"];
  for(let i=0;i<(n||26);i++){const d=document.createElement("i");d.className="ntconf";d.style.left=x+"px";d.style.top=y+"px";d.style.background=cols[i%cols.length];document.body.append(d);
    const a=Math.random()*Math.PI*2,v=90+Math.random()*190,dx=Math.cos(a)*v,dy=Math.sin(a)*v-120,r=Math.random()*720-360;
    try{d.animate([{transform:"translate(0,0) rotate(0)",opacity:1},{transform:`translate(${dx}px,${dy}px) rotate(${r/2}deg)`,opacity:1,offset:.45},{transform:`translate(${dx*1.15}px,${dy+280}px) rotate(${r}deg)`,opacity:0}],{duration:1300+Math.random()*700,easing:"cubic-bezier(.2,.7,.3,1)"}).onfinish=()=>d.remove()}catch(e){d.remove()}}}
const view=pg=>{const d=el("div","nt");pg.append(d);return d};
let ROOT=null;
const stage=(r,estado)=>{let s=r.querySelector(".stage");if(!s){s=el("div","stage");r.prepend(s)}s.innerHTML=natan(estado)};
const $=id=>document.getElementById(id);
const TEMI={"Scuola media":["il sistema solare","le frazioni","l'Impero romano","gli stati della materia","la Divina Commedia","il present simple"],"Scuole superiori":["la fotosintesi","le derivate","la Rivoluzione francese","la seconda legge di Newton","il Romanticismo","il Latino: l'ablativo assoluto"],"Università":["le reti neurali","il diritto commerciale","la termodinamica","la macroeconomia","l'algebra lineare","la farmacocinetica"]};
const SCI={"Scuola media":"🎒","Scuole superiori":"📚","Università":"🎓"},DFI={"Facile":"🌱","Medio":"🔥","Difficile":"🔥🔥","Estremo":"💀"};
const TIPI=[["scelta","Scelta multipla"],["mista","Miste"],["aperta","Solo aperte"]];

function setup(){const r=ROOT;r.innerHTML="";
  const hero=el("div","hero");const tx=el("div","tx");tx.append(el("h2","","Natan Test 📝"),el("p","","Verifiche su qualsiasi argomento, con domande a scelta multipla e domande aperte. Natan ti corregge e ti dice cosa ripassare."));hero.append(tx);
  const sv=el("div");sv.innerHTML=natan("intro");hero.append(sv.firstChild);r.append(hero);
  const c=el("div","card");r.append(c);let sc=LS.get("natan_test_sc","Scuole superiori"),df=LS.get("natan_test_df","Medio"),n=LS.get("natan_test_n",8),tp=LS.get("natan_test_tp","mista");
  const tiles=(titolo,vals,cur,set,ico,sub)=>{c.append(el("div","lab",titolo));const w=el("div","tiles");vals.forEach(v=>{const b=el("button","tile"+(v===cur?" on":""));b.dataset.v=v;b.innerHTML=`<span class="e">${ico[v]}</span>${v}${sub&&sub[v]?`<small>${sub[v]}</small>`:""}`;
    b.onclick=()=>{set(v);[...w.children].forEach(x=>x.classList.toggle("on",x===b));if(titolo==="Scuola")sug()};w.append(b)});c.append(w)};
  tiles("Scuola",SCUOLE,sc,v=>{sc=v;LS.set("natan_test_sc",v)},SCI);
  tiles("Difficoltà",DIFF,df,v=>{df=v;LS.set("natan_test_df",v)},DFI,{"Facile":"si parte","Medio":"serve capire","Difficile":"ragionare","Estremo":"da esame"});
  c.append(el("div","lab","Su cosa vuoi la verifica?"));const i=el("input");i.type="text";i.id="ntArg";i.placeholder="es. la fotosintesi, la rivoluzione francese, le derivate";i.maxLength=120;c.append(i);
  const sg=el("div","sug");c.append(sg);const sug=()=>{sg.innerHTML="";TEMI[sc].forEach((t,k)=>{const b=el("button","",t);b.style.animationDelay=k*.05+"s";b.onclick=()=>{i.value=t;i.focus()};sg.append(b)})};sug();
  const seg=(titolo,vals,cur,set)=>{c.append(el("div","lab",titolo));const w=el("div","seg");vals.forEach(([v,t])=>{const b=el("button",v===cur?"on":"",t);b.dataset.v=v;b.onclick=()=>{set(v);[...w.children].forEach(x=>x.classList.toggle("on",x===b))};w.append(b)});c.append(w)};
  seg("Quante domande",[5,8,10].map(v=>[v,v+" domande"]),n,v=>{n=+v;LS.set("natan_test_n",+v)});
  seg("Che tipo",TIPI,tp,v=>{tp=v;LS.set("natan_test_tp",v)});
  const go=el("button","go","✨ Prepara la verifica");go.id="ntGo";go.onclick=()=>{const a=i.value.trim();if(!a){L.toast("Scrivi su cosa vuoi la verifica");i.focus();return}avvia(a,sc,df,n,tp)};i.onkeydown=e=>{if(e.key==="Enter")go.onclick()};c.append(go);
  const h=LS.get("natan_test_hist",[]);if(h.length){const w=el("div","hist");w.append(el("span","","Ultime verifiche:"));h.slice(-5).reverse().forEach(x=>{const b=el("b","",`${String(x.arg).slice(0,18)} · ${x.voto}`);b.style.background=x.voto>=6?"#2fa36b":x.voto>=4?"#c98a10":"#c24848";b.title=x.arg;w.append(b)});c.append(w)}}
function mescola(m,a){const out=[],k=a.length;if(!k)return m.map(d=>({t:"m",...d}));if(!m.length)return a.map(d=>({t:"a",...d}));
  const tot=m.length+k,pos=new Set(a.map((_,j)=>Math.min(tot-1,Math.floor((j+1)*tot/(k+1)))));let mi=0,ai=0;for(let p=0;p<tot;p++){if(pos.has(p)&&ai<k)out.push({t:"a",...a[ai++]});else if(mi<m.length)out.push({t:"m",...m[mi++]});else out.push({t:"a",...a[ai++]})}return out}
async function avvia(arg,sc,df,n,tp){const r=ROOT;r.innerHTML="";stage(r,"writing");const c=el("div","card");const st=el("div","fb","Cerco negli appunti…");c.append(st);r.append(c);
  const k=tp==="scelta"?0:tp==="aperta"?n:Math.max(1,Math.round(n*.4)),m=n-k;
  try{const x=await genera(arg,sc,df,m,k,t=>{st.textContent=t});const items=mescola((x.domande||[]).slice(0,m),(x.aperte||[]).slice(0,k));
    if(!items.length)throw new Error("Non sono riuscito a fare domande su questo argomento: prova con parole più semplici.");
    Q.items=items;Q.ris=[];Q.i=0;Q.meta={arg:x.argomento||arg,sc:x.scuola||sc,df:x.diff||df};domanda()}
  catch(e){r.innerHTML="";stage(r,"sad");const c2=el("div","card");c2.append(el("div","fb no","⚠ "+(e.message==="offline"?"Il server di Natan è spento.":e.message)));const b=el("button","go sec","← Torna indietro");b.onclick=setup;c2.append(b);r.append(c2)}}
const Q={items:[],ris:[],i:0,meta:{}};
function testa(c,d){c.append(Object.assign(el("div","meta"),{innerHTML:`<span>Domanda <b>${Q.i+1}</b> di ${Q.items.length} · ${Q.meta.arg}</span><span class="badge${d.t==="a"?" o":""}">${d.t==="a"?"✍️ aperta":"scelta multipla"}</span>`}));
  const p=el("div","prog");const f=el("i");f.style.width=Math.round(Q.i*100/Q.items.length)+"%";p.append(f);c.append(p);requestAnimationFrame(()=>requestAnimationFrame(()=>{f.style.width=Math.round((Q.i+1)*100/Q.items.length)+"%"}));return p}
function avanti(r,c,fb,last){const nx=el("button","go",last?"Vedi il voto 🎯":"Avanti →");nx.id="ntNext";nx.onclick=()=>{Q.i++;Q.i<Q.items.length?domanda():fine()};c.append(nx);try{nx.scrollIntoView({behavior:"smooth",block:"nearest"})}catch(e){}}
function domanda(){const r=ROOT;r.innerHTML="";stage(r,"");const d=Q.items[Q.i];const c=el("div","card q");r.append(c);testa(c,d);c.append(el("div","qt",d.d));const fb=el("div","fb");
  if(d.t==="a")return aperta(r,c,d,fb);
  const bs=[];d.o.forEach((o,k)=>{const b=el("button","opt");b.innerHTML=`<span class="l">${"ABCD"[k]}</span><span>${o.replace(/</g,"&lt;")}</span>`;b.style.animationDelay=k*.07+"s";b.dataset.k=k;
    b.onclick=()=>{if(Q.ris.length>Q.i)return;const ok=k===d.c;Q.ris.push({p:ok?1:0,k});bs.forEach((x,j)=>{x.disabled=true;if(j===d.c)x.classList.add("good");else if(j===k)x.classList.add("bad")});
      fb.className="fb "+(ok?"ok":"no");fb.innerHTML=(ok?"✅ <b>Giusto!</b> ":"❌ <b>Non è questa.</b> ")+`<span>${(d.sp||"").replace(/</g,"&lt;")}</span>`;stage(r,ok?"happy":"sad");
      if(ok){const q=b.getBoundingClientRect();confetti(q.left+q.width/2,q.top+q.height/2,18)}c.append(fb);avanti(r,c,fb,Q.i+1===Q.items.length)};bs.push(b);c.append(b)})}
function aperta(r,c,d,fb){const ta=el("textarea");ta.id="ntOpen";ta.placeholder="Scrivi qui la tua risposta con parole tue…";ta.maxLength=600;const cn=el("div","cnt","0 / 600");ta.oninput=()=>{cn.textContent=ta.value.length+" / 600"};c.append(ta,cn);
  const bt=el("button","go","Controlla la risposta");bt.id="ntCheck";c.append(bt);ta.focus&&setTimeout(()=>{try{ta.focus({preventScroll:true})}catch(e){}},300);
  bt.onclick=()=>{const t=ta.value.trim();if(t.length<3){L.toast("Scrivi almeno una risposta");return}const g=correggiAperta(d,t);ta.disabled=true;bt.remove();cn.remove();
    const rs={p:g.punti,txt:t,self:false};Q.ris.push(rs);
    const v=g.punti===1?["ok","✅ <b>Giusto!</b> Hai detto le cose importanti."]:g.punti===.5?["ok","🟡 <b>Quasi!</b> Manca ancora qualcosa."]:["no","❌ <b>Non ci siamo.</b> Guarda la risposta modello."];
    fb.className="fb "+v[0];fb.innerHTML=v[1];c.append(fb);const kw=el("div","kw");d.k.forEach((k,j)=>{const b=el("b",g.hit[j]?"y":"n",(g.hit[j]?"✓ ":"✗ ")+k);b.style.animationDelay=j*.08+"s";kw.append(b)});c.append(el("div","lab","Parole chiave"),kw);
    c.append(el("div","lab","Risposta modello"),Object.assign(el("div","model"),{textContent:d.r}));stage(r,g.punti===1?"happy":g.punti===.5?"":"sad");
    if(g.punti===1){const q=fb.getBoundingClientRect();confetti(q.left+60,q.top,22)}
    if(g.punti<1){const s=el("button","go sec","👍 Secondo me era giusta lo stesso");s.onclick=()=>{rs.p=1;rs.self=true;s.remove();fb.className="fb ok";fb.innerHTML="✅ Va bene: l'hai segnata tu come giusta.";const q=fb.getBoundingClientRect();confetti(q.left+60,q.top,14)};c.append(s)}
    avanti(r,c,fb,Q.i+1===Q.items.length)}}
function ringa(v){const R=70,C=2*Math.PI*R,col=v>=6?"#3ecf8e":v>=4?"#f5b84a":"#f06464";
  const d=el("div","ring");d.innerHTML=`<svg width="170" height="170" viewBox="0 0 170 170"><circle class="bg" cx="85" cy="85" r="${R}"/><circle class="fg" cx="85" cy="85" r="${R}" stroke="${col}" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg><div class="num"><div><span id="ntNum">0</span><small>su 10</small></div></div>`;
  const fg=d.querySelector(".fg");requestAnimationFrame(()=>requestAnimationFrame(()=>{fg.style.strokeDashoffset=C*(1-v/10)}));
  const num=d.querySelector("#ntNum"),t0=performance.now(),T=RM()?0:1300;const tick=ts=>{const k=T?Math.min(1,(ts-t0)/T):1;num.textContent=(Math.round(v*k*10)/10).toString().replace(".",",");if(k<1&&document.body.contains(num))requestAnimationFrame(tick)};requestAnimationFrame(tick);return d}
function fine(){const r=ROOT;r.innerHTML="";const n=Q.items.length,g=Q.ris.reduce((a,x)=>a+x.p,0),voto=Math.round(g/n*100)/10;stage(r,voto>=6?"happy":"sad");
  const h=LS.get("natan_test_hist",[]);h.push({voto,arg:Q.meta.arg,scuola:Q.meta.sc,diff:Q.meta.df,n,g:Math.round(g*10)/10,ts:Date.now()});LS.set("natan_test_hist",h.slice(-100));
  const c=el("div","card");r.append(c);const rs=el("div","res");rs.append(ringa(voto));
  const frase=voto>=9?"Fantastico! 🏆":voto>=7?"Molto bene! 🎉":voto>=6?"Sufficiente, si può migliorare 👍":voto>=4?"Ci sei quasi: ripassa e riprova 💪":"Non preoccuparti, si impara sbagliando 🌱";
  rs.append(el("strong","",frase),el("small","",`${Math.round(g*10)/10} punti su ${n} · ${Q.meta.arg} · ${Q.meta.sc}, ${Q.meta.df.toLowerCase()}`));c.append(rs);
  if(voto>=6)setTimeout(()=>{const q=rs.getBoundingClientRect();confetti(q.left+q.width/2,q.top+90,48);setTimeout(()=>confetti(q.left+q.width/2-80,q.top+120,24),250);setTimeout(()=>confetti(q.left+q.width/2+80,q.top+120,24),450)},500);
  c.append(el("div","lab","Rivediamo le risposte"));const w=el("div","rv");
  Q.items.forEach((d,i)=>{const x=Q.ris[i]||{p:0},ic=x.p===1?"✅":x.p===.5?"🟡":"❌";const dt=el("details");dt.style.animationDelay=i*.06+"s";
    const risp=d.t==="m"?(x.k!=null?`La tua risposta: ${d.o[x.k]}\nGiusta: ${d.o[d.c]}${d.sp?" — "+d.sp:""}`:""):`La tua risposta: ${x.txt||"—"}\nRisposta modello: ${d.r}`;
    const sm=el("summary","",`${ic} ${d.d}`);const bd=el("div","in");bd.style.whiteSpace="pre-wrap";bd.textContent=risp;dt.append(sm,bd);w.append(dt)});c.append(w);
  const row=el("div","row");const b1=el("button","go","Un'altra verifica");b1.onclick=setup;const b2=el("button","go sec","Più difficile 🔥");b2.onclick=()=>{LS.set("natan_test_df",DIFF[Math.min(3,DIFF.indexOf(Q.meta.df)+1)]);setup();const i=$("ntArg");if(i)i.value=Q.meta.arg};
  row.append(b1,b2);c.append(row);try{window.natanTestSync&&window.natanTestSync()}catch(e){}}
window.NATAN_TEST={open(pg){css();ROOT=view(pg);setup()}};
})();
