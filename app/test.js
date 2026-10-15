// NATAN TEST: verifiche a scelta multipla (scuola media, superiori, università) con una breve animazione di Natan
(function(){
"use strict";
const L=window.natanTestLib;const {el,LS,api}=L;
const SCUOLE=["Scuola media","Scuole superiori","Università"],DIFF=["Facile","Medio","Difficile","Estremo"];
const LIV={"Scuola media":"uno studente di scuola media (11-14 anni): parole semplici, frasi corte","Scuole superiori":"uno studente delle superiori (14-19 anni): linguaggio da manuale scolastico","Università":"uno studente universitario: terminologia tecnica e concetti più profondi"};
const DIF={"Facile":"domande dirette, una sola idea, risposte sbagliate chiaramente diverse","Medio":"domande che richiedono di aver capito, risposte sbagliate plausibili","Difficile":"domande di ragionamento, risposte sbagliate molto simili alla giusta","Estremo":"domande da esame difficile: collegano più idee, eccezioni e casi particolari, risposte sbagliate quasi identiche"};
function css(){if(document.getElementById("ntcss"))return;const s=el("style");s.id="ntcss";s.textContent=`
.nt{max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:14px}
.nt .stage{background:var(--raise,#1f2129);border-radius:18px;padding:6px 0;display:flex;justify-content:center;overflow:hidden}
.nt svg.nat{width:min(100%,420px);height:auto}
.nt .body{animation:ntb 2.6s ease-in-out infinite;transform-origin:center bottom;transform-box:fill-box}
.nt .intro .body{animation:ntin 1s ease-out 1, ntb 2.6s ease-in-out 1s infinite}
.nt .eye{animation:ntblink 3.4s infinite;transform-origin:center;transform-box:fill-box}
.nt .pen{transform-origin:center;animation:ntbob 1.6s ease-in-out infinite;transform-box:fill-box}
.nt .writing .pen{animation:ntwrite 1.1s linear infinite}
.nt .ln{stroke-dasharray:130;stroke-dashoffset:0}.nt .writing .ln{animation:ntln 2.2s linear infinite}
.nt .writing .ln:nth-of-type(2){animation-delay:.3s}.nt .writing .ln:nth-of-type(3){animation-delay:.6s}.nt .writing .ln:nth-of-type(4){animation-delay:.9s}
.nt .hello{animation:nthi 2.4s ease-out 1 both}
.nt .happy .body{animation:ntjump .5s ease-out 3}
@keyframes ntb{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}@keyframes ntin{from{transform:translateX(-160px)}to{transform:none}}
@keyframes ntblink{0%,94%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}@keyframes ntbob{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}
@keyframes ntwrite{0%{transform:translate(0,0)}25%{transform:translate(80px,6px)}26%{transform:translate(0,22px)}50%{transform:translate(80px,28px)}51%{transform:translate(0,44px)}75%{transform:translate(80px,50px)}100%{transform:translate(0,0)}}
@keyframes ntln{0%{stroke-dashoffset:130}60%,100%{stroke-dashoffset:0}}@keyframes nthi{0%,60%{opacity:1}100%{opacity:0}}@keyframes ntjump{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
.nt .card{background:var(--raise,#1f2129);border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:10px}
.nt .chips{display:flex;gap:6px;flex-wrap:wrap}.nt .chip{padding:8px 12px;border-radius:999px;border:1px solid var(--line,#2c2f3b);background:transparent;color:inherit;font-size:14px;cursor:pointer}
.nt .chip.on{background:var(--accent,#7c83ff);border-color:transparent;color:#fff;font-weight:700}
.nt input[type=text]{padding:12px;border-radius:12px;border:1px solid var(--line,#2c2f3b);background:var(--bg,#15161c);color:inherit;font-size:16px;width:100%;box-sizing:border-box}
.nt .opt{display:block;width:100%;text-align:left;padding:12px 14px;margin:5px 0;border-radius:12px;border:1px solid var(--line,#2c2f3b);background:transparent;color:inherit;font-size:15px;cursor:pointer}
.nt .opt.good{background:#1f5c3a;border-color:#3ecf8e}.nt .opt.bad{background:#5c2020;border-color:#f06464}.nt .opt:disabled{cursor:default}
.nt .fb{font-size:14px;line-height:1.45}.nt .big{font-size:48px;font-weight:800;text-align:center}.nt small{opacity:.7}
.nt .prog{height:6px;border-radius:4px;background:rgba(127,127,160,.25);overflow:hidden}.nt .prog i{display:block;height:100%;background:var(--accent,#7c83ff);transition:width .3s}`;document.head.append(s)}
function natan(estado){return `<svg class="nat ${estado||""}" viewBox="0 0 420 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<g class="${estado==="intro"?"intro":""}"><rect x="250" y="22" width="150" height="110" rx="6" fill="#f4f1e8" stroke="#2c2f3b" stroke-width="2"/>
<g stroke="#9aa0b5" stroke-width="3" stroke-linecap="round" fill="none"><line class="ln" x1="262" y1="44" x2="380" y2="44"/><line class="ln" x1="262" y1="66" x2="360" y2="66"/><line class="ln" x1="262" y1="88" x2="380" y2="88"/><line class="ln" x1="262" y1="110" x2="340" y2="110"/></g>
<g class="pen"><polygon points="262,36 284,26 288,32 266,42" fill="#f5b84a" stroke="#a8741a"/></g>
<g class="body"><circle cx="118" cy="82" r="46" fill="#7c83ff" stroke="#929aff" stroke-width="3"/><text x="118" y="94" text-anchor="middle" font-size="34" font-weight="800" fill="#fff" font-family="system-ui,sans-serif">N</text>
<ellipse class="eye" cx="101" cy="64" rx="7" ry="8" fill="#fff"/><ellipse class="eye" cx="135" cy="64" rx="7" ry="8" fill="#fff"/><circle cx="103" cy="66" r="3.5" fill="#222"/><circle cx="137" cy="66" r="3.5" fill="#222"/>
<path d="M104 98 Q118 108 132 98" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></g></g>
${estado==="intro"?'<text class="hello" x="210" y="16" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor" font-family="system-ui,sans-serif">Ciao! Facciamo una verifica? 📝</text>':""}</svg>`}
const view=pg=>{const d=el("div","nt");pg.append(d);return d};
let ROOT=null;
const stage=(r,estado)=>{let s=r.querySelector(".stage");if(!s){s=el("div","stage");r.prepend(s)}s.innerHTML=natan(estado)};

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
async function daDispositivo(arg,sc,df,n,prog){
  const lvl=L.deviceLevel();if(!lvl)throw Object.assign(new Error("Il server di Natan è spento e sul tuo dispositivo non c'è ancora un Natan scaricato (lo trovi in Impostazioni)."),{code:0});
  prog("Natan sul tuo dispositivo scrive le domande…");const note=await appunti(arg);
  const r=await L.gen(lvl,[{role:"system",content:"Sei Natan e prepari verifiche scolastiche. Rispondi solo nel formato richiesto."},{role:"user",content:prompt(arg,sc,df,n+1,note)}],{maxTokens:1300});
  prog("Controllo le domande…");const buone=[];let scarti=0;for(const x of leggi(r.text)){const d=ripara(x);const c=controlli(d,arg,buone);if(c.length)scarti++;else buone.push(d)}
  return{domande:rimescola(buone.slice(0,n),Date.now()%100000),n_scartate:scarti,come:"sul dispositivo",argomento:arg,scuola:sc,diff:df}}
async function genera(arg,sc,df,n,prog){
  prog("Chiedo a Natan sul Mac…");
  try{return await api("/test/genera",{argomento:arg,scuola:sc,diff:df,n})}
  catch(e){if(e.code===401)throw e;if(e.code===0||e.code===503||e.code===500)return await daDispositivo(arg,sc,df,n,prog);throw e}}

function setup(){const r=ROOT;r.innerHTML="";stage(r,"intro");
  const c=el("div","card");r.append(c);let sc=LS.get("natan_test_sc","Scuole superiori"),df=LS.get("natan_test_df","Medio");
  const grp=(titolo,vals,cur,set)=>{c.append(el("strong","",titolo));const w=el("div","chips");vals.forEach(v=>{const b=el("button","chip"+(v===cur?" on":""),v);b.dataset.v=v;b.onclick=()=>{set(v);[...w.children].forEach(x=>x.classList.toggle("on",x===b))};w.append(b)});c.append(w)};
  grp("Scuola",SCUOLE,sc,v=>{sc=v;LS.set("natan_test_sc",v)});grp("Difficoltà",DIFF,df,v=>{df=v;LS.set("natan_test_df",v)});
  c.append(el("strong","","Su cosa vuoi la verifica?"));const i=el("input");i.type="text";i.id="ntArg";i.placeholder="es. la fotosintesi, la rivoluzione francese, le derivate";i.maxLength=120;c.append(i);
  const w=el("div","chips");let n=LS.get("natan_test_n",8);[5,8,10].forEach(v=>{const b=el("button","chip"+(v===n?" on":""),v+" domande");b.onclick=()=>{n=v;LS.set("natan_test_n",v);[...w.children].forEach(x=>x.classList.toggle("on",x===b))};w.append(b)});c.append(w);
  const go=el("button","btn","📝 Prepara la verifica");go.id="ntGo";go.onclick=()=>{const a=i.value.trim();if(!a){L.toast("Scrivi su cosa vuoi la verifica");i.focus();return}avvia(a,sc,df,n)};i.onkeydown=e=>{if(e.key==="Enter")go.onclick()};c.append(go);
  const h=LS.get("natan_test_hist",[]);if(h.length){const m=h.slice(-5).reverse().map(x=>`${x.arg}: ${x.voto}/10`).join(" · ");c.append(el("small","","Ultime verifiche: "+m))}}
async function avvia(arg,sc,df,n){const r=ROOT;r.innerHTML="";stage(r,"writing");const c=el("div","card");const st=el("div","fb","Cerco negli appunti…");c.append(st);r.append(c);
  try{const x=await genera(arg,sc,df,n,t=>{st.textContent=t});if(!x.domande||!x.domande.length)throw new Error("Non sono riuscito a fare domande su questo argomento: prova con parole più semplici.");
    Q.dom=x.domande;Q.ris=[];Q.i=0;Q.meta={arg:x.argomento||arg,sc:x.scuola||sc,df:x.diff||df};domanda()}
  catch(e){r.innerHTML="";stage(r,"");const c2=el("div","card");c2.append(el("div","fb","⚠ "+(e.message==="offline"?"Il server di Natan è spento.":e.message)));const b=el("button","btn","← Torna indietro");b.onclick=setup;c2.append(b);r.append(c2)}}
const Q={dom:[],ris:[],i:0,meta:{}};
function domanda(){const r=ROOT;r.innerHTML="";stage(r,"");const d=Q.dom[Q.i];const c=el("div","card");r.append(c);
  c.append(el("small","",`Domanda ${Q.i+1} di ${Q.dom.length} · ${Q.meta.arg} · ${Q.meta.df}`));const p=el("div","prog");const f=el("i");f.style.width=Math.round(Q.i*100/Q.dom.length)+"%";p.append(f);c.append(p);
  c.append(el("strong","",d.d));const bs=[];const fb=el("div","fb");const nx=el("button","btn",Q.i+1===Q.dom.length?"Vedi il voto":"Avanti →");nx.id="ntNext";nx.style.display="none";
  d.o.forEach((o,k)=>{const b=el("button","opt","ABCD"[k]+".  "+o);b.dataset.k=k;b.onclick=()=>{if(Q.ris.length>Q.i)return;Q.ris.push(k);const ok=k===d.c;
    bs.forEach((x,j)=>{x.disabled=true;if(j===d.c)x.classList.add("good");else if(j===k)x.classList.add("bad")});fb.textContent=(ok?"✅ Giusto! ":"❌ Non è questa. ")+(d.sp||"");stage(r,ok?"happy":"");nx.style.display="";};bs.push(b);c.append(b)});
  c.append(fb,nx);nx.onclick=()=>{Q.i++;Q.i<Q.dom.length?domanda():fine()}}
function fine(){const r=ROOT;r.innerHTML="";const g=Q.ris.filter((x,i)=>x===Q.dom[i].c).length,n=Q.dom.length,voto=Math.round(g/n*100)/10;stage(r,voto>=6?"happy":"");
  const h=LS.get("natan_test_hist",[]);h.push({voto,arg:Q.meta.arg,scuola:Q.meta.sc,diff:Q.meta.df,n,g,ts:Date.now()});LS.set("natan_test_hist",h.slice(-100));
  const c=el("div","card");r.append(c);const b=el("div","big",voto+"/10");b.style.color=voto>=6?"#3ecf8e":voto>=4?"#f5b84a":"#f06464";c.append(b,el("small","",`${g} giuste su ${n} · ${Q.meta.arg} · ${Q.meta.sc}, ${Q.meta.df.toLowerCase()}`));
  const sb=Q.dom.filter((d,i)=>Q.ris[i]!==d.c);if(sb.length){c.append(el("strong","","Da ripassare:"));sb.slice(0,5).forEach(d=>c.append(el("div","fb","• "+d.d+"\n   Giusta: "+d.o[d.c]+(d.sp?" — "+d.sp:""))))}else c.append(el("div","fb","Perfetto! Nessun errore 🎉"));
  const w=el("div","chips");const b1=el("button","btn","Un'altra verifica");b1.onclick=setup;const b2=el("button","btn ghost","Più difficile");b2.onclick=()=>{LS.set("natan_test_df",DIFF[Math.min(3,DIFF.indexOf(Q.meta.df)+1)]);setup();const i=$("ntArg");if(i)i.value=Q.meta.arg};
  w.append(b1,b2);c.append(w);try{window.natanTestSync&&window.natanTestSync()}catch(e){}}
const $=id=>document.getElementById(id);
window.NATAN_TEST={open(pg){css();pg.append(el("h1","","Test"));ROOT=view(pg);setup()}};
})();
