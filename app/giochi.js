// =====================================================================================================
// GIOCHI DI NATAN: Scacchi, Dama, Carte colorate (stile Uno), Scopa e Briscola contro «Natan Gaming».
// Natan Gaming è un consiglio di 20 agenti: per ogni mossa possibile il gioco calcola alcune caratteristiche
// (valore, punti, attacco, difesa, rischio...), ogni agente le pesa a modo suo e vota; vince la mossa con più voti.
// L'«Allenatore» corregge i pesi dopo ogni partita (si ricorda tra una partita e l'altra, su questo dispositivo).
(function(){
"use strict";
const E=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined&&txt!==null)n.textContent=txt;return n};
const LSG={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const rnd=n=>Math.floor(Math.random()*n);
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const SLOW=()=>(window.NATAN_GIOCHI_VELOCE?0:1);

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
.gm .agents{display:flex;flex-wrap:wrap;gap:4px}.gm .agents i{font-style:normal;font-size:11px;padding:3px 7px;border-radius:999px;background:var(--raise);color:var(--muted);border:1px solid var(--line)}
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
  const o=E("div","ngintro");const c=E("div","c");const lg=E("div","lg");lg.append(E("span","","🎮"));c.append(lg,E("b","","Natan Gaming"),E("small","","20 agenti pronti a sfidarti"));o.append(c);
  for(let i=0;i<26;i++){const p=E("i");const a=Math.random()*Math.PI*2,d=120+Math.random()*220;p.style.cssText=`left:50%;top:50%;--x:${Math.cos(a)*d}px;--y:${Math.sin(a)*d}px;animation-delay:${.2+Math.random()*.5}s;background:${["#7c83ff","#c06bff","#ff7cc8","#ffd75a"][i%4]}`;o.append(p)}
  document.body.append(o);setTimeout(()=>o.remove(),2000)
}

// ------------------------------------------------------------------ il consiglio dei 20 agenti
// caratteristiche di ogni mossa (tutte circa tra -1 e +1): valore, punti, attacco, difesa, rischio, conserva, posizione, futuro, finale
const F=["valore","punti","attacco","difesa","rischio","conserva","posizione","futuro","finale"];
const AGENTI=[
  ["Calcolatore",{valore:3}],["Contabile",{punti:2,valore:1}],["Attaccante",{attacco:2,punti:.5}],["Difensore",{difesa:2,rischio:-1.5}],
  ["Prudente",{rischio:-2.5,valore:.5}],["Risparmiatore",{conserva:2}],["Stratega",{posizione:2,futuro:1}],["Visionario",{futuro:2.5}],
  ["Finalista",{finale:2.5,punti:.5}],["Cacciatore",{attacco:1.5,finale:1}],["Equilibrato",{valore:1,punti:1,difesa:1,posizione:1}],
  ["Tattico",{valore:1.5,attacco:1}],["Paziente",{conserva:1,difesa:1,rischio:-.5}],["Coraggioso",{attacco:1.5,rischio:.3}],
  ["Centrista",{posizione:2.5}],["Osservatore",{difesa:1,futuro:1}],["Memoria",{conserva:1,punti:1}],["Probabilista",{valore:1,rischio:-1}],
  ["Sorpresa",{}],["Allenatore",{}]];
function pesi(game){const p=LSG.get("natan_gaming_pesi_"+game,null);return Array.isArray(p)&&p.length===AGENTI.length?p:AGENTI.map(()=>1)}
// sceglie tra le mosse candidate: ognuna con .f = caratteristiche. Ritorna {mossa, decide, voti}
function consiglio(game,cands){
  if(cands.length===1)return {mossa:cands[0],decide:"Calcolatore",unica:true};
  const w=pesi(game);const tot=cands.map(()=>0);const migliore=AGENTI.map(()=>0);
  AGENTI.forEach(([nome,pp],ai)=>{
    let best=-1e9,bi=0;
    cands.forEach((c,i)=>{let s=0;
      if(nome==="Sorpresa")s=Math.random();
      else if(nome==="Allenatore")s=F.reduce((a,k)=>a+(c.f[k]||0)*(LSG.get("natan_gaming_stile_"+game,{})[k]||0),0)+(c.f.valore||0);
      else for(const k in pp)s+=pp[k]*(c.f[k]||0);
      if(s>best){best=s;bi=i}});
    migliore[ai]=bi;tot[bi]+=w[ai]*(nome==="Sorpresa"?.35:1)});
  let bi=0;tot.forEach((v,i)=>{if(v>tot[bi])bi=i});
  const favor=AGENTI.map((a,i)=>i).filter(i=>migliore[i]===bi);
  const decide=favor.sort((a,b)=>w[b]-w[a])[0];
  cands[bi]._agenti=favor.map(i=>AGENTI[i][0]);
  return {mossa:cands[bi],decide:AGENTI[decide??0][0],favor:favor.map(i=>AGENTI[i][0]),voti:Math.round(favor.length)}
}
// fine partita: l'Allenatore rinforza gli agenti che erano d'accordo con le mosse se Natan ha vinto, li indebolisce se ha perso
function allena(game,storia,vinto){
  const w=pesi(game);const nomi=AGENTI.map(a=>a[0]);
  for(const fav of storia)for(const n of fav){const i=nomi.indexOf(n);if(i>=0)w[i]=Math.max(.3,Math.min(3,w[i]*(vinto?1.03:.97)))}
  LSG.set("natan_gaming_pesi_"+game,w);
  const st=LSG.get("natan_gaming_stats",{});st[game]=st[game]||{v:0,p:0,n:0};vinto===true?st[game].v++:vinto===false?st[game].p++:st[game].n++;LSG.set("natan_gaming_stats",st)
}
function ngPanel(){
  const p=E("div","ng");const lg=E("div","lg","N");const tx=E("div","tx");tx.append(E("b","","Natan Gaming"),E("span","","20 agenti studiano ogni mossa"));p.append(lg,tx);
  const th=E("div","think");const ag=E("div","agents");AGENTI.forEach(a=>ag.append(E("i","",a[0])));
  return {el:[p,th,ag],think:(t,favor)=>{th.textContent=t||"";[...ag.children].forEach(i=>i.classList.toggle("on",!!favor&&favor.includes(i.textContent)))}}
}
async function pensa(ng,game,cands,cosa){
  ng.think("🤔 Natan Gaming ci pensa… i 20 agenti stanno votando",null);await sleep(SLOW()*(500+rnd(500)));
  const r=consiglio(game,cands);
  ng.think(r.unica?"Natan Gaming: c'era una sola mossa possibile.":`Natan Gaming ${cosa||"ha deciso"} · ${r.voti}/20 agenti d'accordo, guidati da «${r.decide}»`,r.favor||[r.decide]);
  return r
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
    const nx=E("button","btn",k<info.tut.length-1?"Avanti →":"Inizia a giocare");nx.id="tutNext";nx.onclick=()=>{if(k<info.tut.length-1){k++;draw()}else start()};
    r.append(skip,nx);box.append(r)};
  draw()
}

// ------------------------------------------------------------------ menu
const GAMES={};
function menu(pg){
  pg.innerHTML="";const g=E("div","gm");pg.append(g);
  const top=E("div","top");const back=E("button","btn ghost","← Ritorna");back.id="gmBack";back.onclick=()=>{try{window.openChat()}catch(e){location.reload()}};top.append(back);g.append(top);
  g.append(E("h1","","🎮 Giochi"),E("p","lead","Sfida Natan Gaming: prima di ogni gioco c'è un breve tutorial."));
  const ng=ngPanel();ng.el.forEach(x=>g.append(x));
  const st=LSG.get("natan_gaming_stats",{});
  const c=E("div","cards");g.append(c);
  for(const [k,info] of Object.entries(GAMES)){const b=E("button","gcard");b.dataset.g=k;b.append(E("span","ic",info.ic),E("strong","",info.nome),E("small","",info.sub));
    const s=st[k];if(s)b.append(E("small","",`Tu ${s.p} · Natan ${s.v}`+(s.n?` · pari ${s.n}`:"")));
    b.onclick=()=>tutorial(pg,info,()=>info.play(pg));c.append(b)}
}
function gameShell(pg,info){
  pg.innerHTML="";const g=E("div","gm");pg.append(g);
  const top=E("div","top");const back=E("button","btn ghost","← Ritorna ai giochi");back.onclick=()=>menu(pg);
  const again=E("button","btn ghost","↻ Nuova partita");again.onclick=()=>info.play(pg);
  const help=E("button","btn ghost","❔ Regole");help.onclick=()=>tutorial(pg,info,()=>info.play(pg));
  top.append(back,again,help);g.append(top,E("h1","",info.ic+" "+info.nome));
  const ng=ngPanel();ng.el.forEach(x=>g.append(x));
  const status=E("div","status msg");g.append(status);
  return {g,ng,status}
}
function fine(sh,game,storia,vinto,testo){
  allena(game,storia,vinto);
  const e=E("div","end");e.append(E("div","",vinto===true?"🤖":vinto===false?"🏆":"🤝"),E("h2","",testo),
    E("small","",vinto===true?"Natan Gaming ha vinto. L'Allenatore ha rinforzato gli agenti che avevano ragione.":vinto===false?"Hai battuto Natan Gaming! L'Allenatore corregge gli agenti che hanno sbagliato.":"Pareggio!"));
  sh.g.append(e);e.scrollIntoView({behavior:"smooth",block:"center"})
}
window.GIOCHI={open(pg){style();intro();menu(pg)},_games:GAMES,_consiglio:consiglio,AGENTI};
window.__G={E,LSG,sleep,rnd,shuffle,SLOW,pensa,gameShell,fine,GAMES,consiglio};
})();

// =====================================================================================================
// SCACCHI
(function(){
const {E,sleep,pensa,gameShell,fine,GAMES}=window.__G;
const VAL={p:100,n:320,b:330,r:500,q:900,k:0};
const isW=p=>p&&p===p.toUpperCase();
const N8=[-17,-15,-10,-6,6,10,15,17];
const rc=i=>[i>>3,i&7];
function start(){const r="rnbqkbnr",b=[];for(const ch of r)b.push(ch);for(let i=0;i<8;i++)b.push("p");for(let i=0;i<32;i++)b.push("");for(let i=0;i<8;i++)b.push("P");for(const ch of r)b.push(ch.toUpperCase());
  return {b,turn:"w",cast:"KQkq",ep:-1,half:0,ply:0}}
function attacked(b,sq,byW){
  const [r,c]=rc(sq);
  const pr=byW?r+1:r-1;                                      // pedoni
  for(const dc of [-1,1]){const cc=c+dc;if(pr>=0&&pr<8&&cc>=0&&cc<8){const p=b[pr*8+cc];if(p===(byW?"P":"p"))return true}}
  for(const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]){const rr=r+dr,cc=c+dc;if(rr>=0&&rr<8&&cc>=0&&cc<8&&b[rr*8+cc]===(byW?"N":"n"))return true}
  for(const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]){
    let rr=r+dr,cc=c+dc,first=true;
    while(rr>=0&&rr<8&&cc>=0&&cc<8){const p=b[rr*8+cc];
      if(p){if(isW(p)===byW){const t=p.toLowerCase();const diag=dr&&dc;
        if(t==="q"||(diag&&t==="b")||(!diag&&t==="r")||(first&&t==="k"))return true}break}
      rr+=dr;cc+=dc;first=false}}
  return false
}
function kingSq(b,w){return b.indexOf(w?"K":"k")}
function inCheck(S,w){return attacked(S.b,kingSq(S.b,w),!w)}
function pseudo(S){
  const b=S.b,w=S.turn==="w",out=[];
  for(let i=0;i<64;i++){const p=b[i];if(!p||isW(p)!==w)continue;const t=p.toLowerCase();const [r,c]=rc(i);
    const add=(to,extra)=>{const q=b[to];if(q&&isW(q)===w)return false;out.push(Object.assign({f:i,t:to,p:t,cap:q||""},extra||{}));return !q};
    if(t==="p"){const dir=w?-1:1,r1=r+dir;
      if(r1>=0&&r1<8&&!b[r1*8+c]){if(r1===0||r1===7)out.push({f:i,t:r1*8+c,p:t,cap:"",promo:"q"});else{out.push({f:i,t:r1*8+c,p:t,cap:""});
        const r2=r+2*dir;if((w&&r===6||!w&&r===1)&&!b[r2*8+c])out.push({f:i,t:r2*8+c,p:t,cap:"",dbl:true})}}
      for(const dc of [-1,1]){const cc=c+dc;if(cc<0||cc>7||r1<0||r1>7)continue;const to=r1*8+cc,q=b[to];
        if(q&&isW(q)!==w)out.push({f:i,t:to,p:t,cap:q,promo:(r1===0||r1===7)?"q":undefined});
        else if(to===S.ep)out.push({f:i,t:to,p:t,cap:w?"p":"P",ep:true})}}
    else if(t==="n"){for(const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]){const rr=r+dr,cc=c+dc;if(rr>=0&&rr<8&&cc>=0&&cc<8)add(rr*8+cc)}}
    else if(t==="k"){for(const [dr,dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]){const rr=r+dr,cc=c+dc;if(rr>=0&&rr<8&&cc>=0&&cc<8)add(rr*8+cc)}
      const row=w?7:0,K=w?"K":"k",Q=w?"Q":"q";
      if(i===row*8+4&&!attacked(b,i,!w)){
        if(S.cast.includes(K)&&!b[row*8+5]&&!b[row*8+6]&&b[row*8+7]===(w?"R":"r")&&!attacked(b,row*8+5,!w)&&!attacked(b,row*8+6,!w))out.push({f:i,t:row*8+6,p:"k",cap:"",castle:"k"});
        if(S.cast.includes(Q)&&!b[row*8+3]&&!b[row*8+2]&&!b[row*8+1]&&b[row*8]===(w?"R":"r")&&!attacked(b,row*8+3,!w)&&!attacked(b,row*8+2,!w))out.push({f:i,t:row*8+2,p:"k",cap:"",castle:"q"})}}
    else{const dirs=t==="b"?[[-1,-1],[-1,1],[1,-1],[1,1]]:t==="r"?[[-1,0],[1,0],[0,-1],[0,1]]:[[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]];
      for(const [dr,dc] of dirs){let rr=r+dr,cc=c+dc;while(rr>=0&&rr<8&&cc>=0&&cc<8){if(!add(rr*8+cc))break;rr+=dr;cc+=dc}}}}
  return out
}
function make(S,m){
  const b=S.b.slice(),w=S.turn==="w";const p=b[m.f];b[m.t]=m.promo?(w?m.promo.toUpperCase():m.promo):p;b[m.f]="";
  if(m.ep)b[m.t+(w?8:-8)]="";
  if(m.castle){const row=w?7:0;if(m.castle==="k"){b[row*8+5]=b[row*8+7];b[row*8+7]=""}else{b[row*8+3]=b[row*8];b[row*8]=""}}
  let cast=S.cast;
  if(p==="K")cast=cast.replace("K","").replace("Q","");if(p==="k")cast=cast.replace("k","").replace("q","");
  for(const [sq,ch] of [[63,"K"],[56,"Q"],[7,"k"],[0,"q"]])if(m.f===sq||m.t===sq)cast=cast.replace(ch,"");
  return {b,turn:w?"b":"w",cast,ep:m.dbl?(m.f+m.t)/2:-1,half:(m.p==="p"||m.cap)?0:S.half+1,ply:S.ply+1}
}
function legal(S){const w=S.turn==="w";return pseudo(S).filter(m=>!inCheck(make(S,m),w))}
// valutazione dal punto di vista del bianco
const CEN=[0,1,2,3,3,2,1,0];
function evalB(b){
  let s=0,minor=0;for(const p of b)if(p&&"nbrqNBRQ".includes(p))minor++;const endg=minor<=6;
  for(let i=0;i<64;i++){const p=b[i];if(!p)continue;const w=isW(p),t=p.toLowerCase(),[r,c]=rc(i);let v=VAL[t];
    if(t==="p")v+=(w?6-r:r-1)*(endg?14:6)+(c>=2&&c<=5?4:0);
    else if(t==="n"||t==="b")v+=(CEN[r]+CEN[c])*5-((w?r===7:r===0)?12:0);
    else if(t==="q")v+=(CEN[r]+CEN[c])*2;
    else if(t==="k")v+=endg?(CEN[r]+CEN[c])*8:((w?r===7:r===0)?(c<=2||c>=6?18:0):-25);
    else if(t==="r")v+=((w?r===1:r===6)?20:0);
    s+=w?v:-v}
  return s
}
function search(S,d,a,bt,q=0){
  const ms=d>0?legal(S):legal(S).filter(m=>m.cap);
  const sign=S.turn==="w"?1:-1;
  if(d<=0){const stand=sign*evalB(S.b);if(q>=3||!ms.length)return stand;if(stand>=bt)return stand;if(stand>a)a=stand}
  else if(!ms.length)return inCheck(S,S.turn==="w")?-100000+S.ply:0;
  ms.sort((x,y)=>(VAL[(y.cap||"").toLowerCase()]||0)-(VAL[(x.cap||"").toLowerCase()]||0));
  let best=d>0?-1e9:a;
  for(const m of ms){const v=-search(make(S,m),d-1,-bt,-a,d<=0?q+1:0);if(v>best)best=v;if(v>a)a=v;if(a>=bt)break}
  return best
}
function features(S,m,v,best){
  const w=S.turn==="w",N=make(S,m),f={};
  f.valore=Math.max(-1,(v-best)/120);
  f.punti=(VAL[(m.cap||"").toLowerCase()]||0)/900+(m.promo?.9:0);
  f.attacco=(inCheck(N,!w)?.8:0);
  f.difesa=attacked(S.b,m.f,!w)&&m.p!=="k"?.6:0;
  const hang=attacked(N.b,m.t,!w)&&!attacked(N.b,m.t,w);f.rischio=hang?(VAL[m.promo||m.p]||50)/900:0;
  f.conserva=(m.p==="q"&&S.ply<16)?-.5:(m.p==="k"&&!m.castle&&S.ply<40)?-.4:0;
  const [r,c]=rc(m.t),[r0,c0]=rc(m.f);f.posizione=((CEN[r]+CEN[c])-(CEN[r0]+CEN[c0]))/6;
  f.futuro=(m.castle?1:0)+(("nb".includes(m.p)&&(w?r0===7:r0===0))?.6:0)+(m.p==="p"?.15:0);
  const pieces=S.b.filter(x=>x&&"nbrqNBRQ".includes(x)).length;f.finale=pieces<=6?(m.p==="p"?.6:m.p==="k"?.3:0):0;
  return f
}
function bestMoves(S,depth){
  const ms=legal(S);let best=-1e9;const sc=ms.map(m=>{const v=-search(make(S,m),depth-1,-1e9,1e9);if(v>best)best=v;return v});
  const cands=ms.map((m,i)=>({m,v:sc[i]})).filter(x=>x.v>=best-60).sort((a,b)=>b.v-a.v).slice(0,7);
  return cands.map(x=>({m:x.m,v:x.v,f:features(S,x.m,x.v,best)}))
}
window.__CHESS={start,legal,make,inCheck,bestMoves,search};
const GL={K:"♔",Q:"♕",R:"♖",B:"♗",N:"♘",P:"♙",k:"♚",q:"♛",r:"♜",b:"♝",n:"♞",p:"♟"};
const FILES="abcdefgh";
const sqName=i=>FILES[i&7]+(8-(i>>3));
GAMES.scacchi={nome:"Scacchi",ic:"♟️",sub:"Il classico: dai scacco matto al re",
  tut:[["♔","Lo scopo","Devi dare scacco matto: attaccare il re avversario in modo che non possa più scappare. Tu hai i pezzi bianchi e muovi per primo."],
       ["♙♘","I pezzi","Pedone: avanti di 1 (di 2 alla prima mossa), mangia in diagonale. Cavallo: a «L», salta gli altri pezzi. Alfiere: in diagonale. Torre: dritto. Regina: dritto e in diagonale. Re: di 1 in ogni direzione."],
       ["👆","Come si muove","Tocca un tuo pezzo: i puntini mostrano dove può andare, i cerchi dove può mangiare. Poi tocca la casella. Il pedone che arriva in fondo diventa regina."],
       ["🏰","Mosse speciali","Arrocco: tocca il re e poi la casella a due passi verso la torre. Ci sono anche la presa «en passant» e lo stallo (se chi deve muovere non ha mosse ma non è sotto scacco, è pareggio)."]],
  play(pg){
    const sh=gameShell(pg,this);let S=start(),sel=-1,last=[],busy=false;const storia=[];const depth=matchMedia("(min-width:900px)").matches?3:2;
    const board=E("div","board");sh.g.append(board);
    const draw=()=>{board.innerHTML="";const ms=sel>=0?legal(S).filter(m=>m.f===sel):[];
      for(let i=0;i<64;i++){const [r,c]=rc(i);const d=E("div","sq "+((r+c)%2?"d":"l"));d.dataset.sq=sqName(i);
        if(i===sel)d.classList.add("sel");if(last.includes(i))d.classList.add("last");
        const m=ms.find(x=>x.t===i);if(m)d.classList.add(m.cap?"cap":"mv");
        const p=S.b[i];if(p){const s=E("span",isW(p)?"pw":"pb",GL[p.toLowerCase()]+"\uFE0E");d.append(s)}
        d.onclick=()=>tap(i);board.append(d)}};
    const over=()=>{const ms=legal(S);
      if(!ms.length){const chk=inCheck(S,S.turn==="w");if(chk){const nat=S.turn==="w";sh.status.textContent=nat?"Scacco matto! Ha vinto Natan Gaming.":"Scacco matto! Hai vinto!";fine(sh,"scacchi",storia,nat,nat?"Scacco matto: vince Natan Gaming":"Scacco matto: hai vinto!")}
        else{sh.status.textContent="Stallo: pareggio.";fine(sh,"scacchi",storia,null,"Stallo: pareggio")}return true}
      const pcs=S.b.filter(Boolean);if(pcs.length===2||S.half>=100){sh.status.textContent="Pareggio.";fine(sh,"scacchi",storia,null,"Pareggio");return true}
      return false};
    const tap=async i=>{
      if(busy||S.turn!=="w")return;const p=S.b[i];
      if(sel>=0){const m=legal(S).find(x=>x.f===sel&&x.t===i);
        if(m){S=make(S,m);last=[m.f,m.t];sel=-1;draw();if(over())return;await natan();return}}
      sel=(p&&isW(p))?i:-1;draw()};
    const natan=async()=>{busy=true;sh.status.textContent=inCheck(S,false)?"Natan Gaming è sotto scacco!":"Tocca a Natan Gaming";
      await sleep(30);const c=bestMoves(S,depth);const r=await pensa(sh.ng,"scacchi",c,"ha mosso");storia.push(r.favor||[]);
      const m=r.mossa.m;S=make(S,m);last=[m.f,m.t];draw();busy=false;
      if(!over())sh.status.textContent=(inCheck(S,true)?"Scacco! ":"")+"Tocca a te ("+sqName(m.f)+"→"+sqName(m.t)+")"};
    sh.status.textContent="Tocca a te: muovi un pezzo bianco";draw()}};
})();

// =====================================================================================================
// DAMA ITALIANA
(function(){
const {E,sleep,pensa,gameShell,fine,GAMES}=window.__G;
const rc=i=>[i>>3,i&7],ok=(r,c)=>r>=0&&r<8&&c>=0&&c<8;
function start(){const b=Array(64).fill("");for(let i=0;i<64;i++){const [r,c]=rc(i);if((r+c)%2===1){if(r<3)b[i]="b";else if(r>4)b[i]="w"}}return {b,turn:"w",ply:0,quiet:0}}
const mine=(p,w)=>p&&(w?p.toLowerCase()==="w":p.toLowerCase()==="b");
const king=p=>p==="W"||p==="B";
function caps(b,from,p,w,taken,path,out){
  const [r,c]=rc(from);const dirs=king(p)?[[-1,-1],[-1,1],[1,-1],[1,1]]:(w?[[-1,-1],[-1,1]]:[[1,-1],[1,1]]);let any=false;
  for(const [dr,dc] of dirs){const mr=r+dr,mc=c+dc,lr=r+2*dr,lc=c+2*dc;if(!ok(lr,lc))continue;const mid=mr*8+mc,land=lr*8+lc;
    const q=b[mid];if(!q||mine(q,w)||taken.includes(mid)||b[land])continue;
    if(!king(p)&&king(q))continue;                                        // nella dama italiana la pedina non mangia la dama
    any=true;const np=[...path,land],nt=[...taken,mid];
    const promo=!king(p)&&(w?lr===0:lr===7);
    const b2=b.slice();b2[from]="";b2[land]=p;
    if(promo)out.push({path:np,caps:nt,promo:true,king:king(p),kcaps:nt.map(x=>king(b[x])?1:0)});
    else caps(b2,land,p,w,nt,np,out)}
  if(!any&&taken.length)out.push({path,caps:taken,promo:false,king:king(p),kcaps:taken.map(x=>king(b[x])?1:0)})
}
function moves(S){
  const w=S.turn==="w",b=S.b;let cs=[];
  for(let i=0;i<64;i++)if(mine(b[i],w)){const o=[];caps(b,i,b[i],w,[],[i],o);cs=cs.concat(o)}
  if(cs.length){                                                          // presa obbligatoria: la più ricca (regole italiane)
    const mx=Math.max(...cs.map(m=>m.caps.length));cs=cs.filter(m=>m.caps.length===mx);
    if(cs.some(m=>m.king))cs=cs.filter(m=>m.king);
    const kk=Math.max(...cs.map(m=>m.kcaps.reduce((a,x)=>a+x,0)));cs=cs.filter(m=>m.kcaps.reduce((a,x)=>a+x,0)===kk);
    if(kk>0){const first=Math.min(...cs.map(m=>m.kcaps.indexOf(1)));cs=cs.filter(m=>m.kcaps.indexOf(1)===first)}
    return cs}
  const out=[];
  for(let i=0;i<64;i++){const p=b[i];if(!mine(p,w))continue;const [r,c]=rc(i);
    const dirs=king(p)?[[-1,-1],[-1,1],[1,-1],[1,1]]:(w?[[-1,-1],[-1,1]]:[[1,-1],[1,1]]);
    for(const [dr,dc] of dirs){const rr=r+dr,cc=c+dc;if(ok(rr,cc)&&!b[rr*8+cc])out.push({path:[i,rr*8+cc],caps:[],promo:!king(p)&&(w?rr===0:rr===7)})}}
  return out
}
function make(S,m){const b=S.b.slice();const from=m.path[0],to=m.path[m.path.length-1];let p=b[from];b[from]="";for(const x of m.caps)b[x]="";
  if(m.promo)p=p.toUpperCase();b[to]=p;return {b,turn:S.turn==="w"?"b":"w",ply:S.ply+1,quiet:m.caps.length?0:S.quiet+1}}
function evalW(b){let s=0;for(let i=0;i<64;i++){const p=b[i];if(!p)continue;const [r,c]=rc(i);const w=p.toLowerCase()==="w";
  let v=king(p)?170:100+(w?7-r:r)*4+(c>1&&c<6?3:0)+((w?r===7:r===0)?6:0);s+=w?v:-v}return s}
function search(S,d,a,bt){const ms=moves(S);if(!ms.length)return -100000+S.ply;if(d<=0)return (S.turn==="w"?1:-1)*evalW(S.b);
  let best=-1e9;for(const m of ms){const v=-search(make(S,m),m.caps.length&&d===1?1:d-1,-bt,-a);if(v>best)best=v;if(v>a)a=v;if(a>=bt)break}return best}
function threatened(S2,sq){const o=moves(S2);return o.some(m=>m.caps.includes(sq))}
function bestMoves(S,depth){
  const ms=moves(S);let best=-1e9;const sc=ms.map(m=>{const v=-search(make(S,m),depth-1,-1e9,1e9);if(v>best)best=v;return v});
  return ms.map((m,i)=>({m,v:sc[i]})).filter(x=>x.v>=best-40).sort((a,b)=>b.v-a.v).slice(0,7).map(x=>{
    const N=make(S,x.m),to=x.m.path[x.m.path.length-1],[r,c]=rc(to),[r0]=rc(x.m.path[0]);
    const f={valore:Math.max(-1,(x.v-best)/100),punti:x.m.caps.length/3,attacco:0,difesa:threatened({b:S.b,turn:S.turn==="w"?"b":"w"},x.m.path[0])?.6:0,
      rischio:threatened(N,to)?.8:0,conserva:(S.turn==="b"&&r0===0)||(S.turn==="w"&&r0===7)?-.4:0,posizione:(c>1&&c<6?.4:0),
      futuro:x.m.promo?1:(Math.abs(r-r0)*.1),finale:king(S.b[x.m.path[0]])?.4:0};
    const after={b:N.b,turn:S.turn};f.attacco=moves(after).some(m=>m.caps.length)?.5:0;return {m:x.m,v:x.v,f}})}
window.__DAMA={start,moves,make,bestMoves};
GAMES.dama={nome:"Dama",ic:"⚪",sub:"Dama italiana: la presa è obbligatoria",
  tut:[["⚪⚫","Lo scopo","Mangia tutte le pedine di Natan Gaming o bloccalo così che non possa più muovere. Tu hai le bianche e inizi tu."],
       ["↗️","Come si muove","Le pedine vanno avanti in diagonale di una casella, solo sulle caselle scure. Tocca una tua pedina e poi la casella dove vuoi andare."],
       ["💥","Mangiare","Se una pedina avversaria è vicina e dietro c'è una casella libera, la salti e la mangi. Se puoi mangiare DEVI farlo, e devi scegliere la presa che mangia di più. Puoi fare più salti di fila."],
       ["👑","La dama","Quando una pedina arriva in fondo diventa dama (👑): si muove e mangia anche all'indietro. Attenzione: nella dama italiana una pedina semplice non può mangiare una dama."]],
  play(pg){
    const sh=gameShell(pg,this);let S=start(),sel=-1,last=[],busy=false;const storia=[];const depth=matchMedia("(min-width:900px)").matches?6:5;
    const board=E("div","board");sh.g.append(board);
    const draw=()=>{board.innerHTML="";const all=moves(S);const ms=sel>=0?all.filter(m=>m.path[0]===sel):[];const mustFrom=new Set(all.filter(m=>m.caps.length).map(m=>m.path[0]));
      for(let i=0;i<64;i++){const [r,c]=rc(i);const d=E("div","sq "+((r+c)%2?"d":"l"));d.dataset.sq=String(i);
        if(i===sel)d.classList.add("sel");if(last.includes(i))d.classList.add("last");
        const m=ms.find(x=>x.path[x.path.length-1]===i);if(m)d.classList.add(m.caps.length?"cap":"mv");
        const p=S.b[i];if(p){const man=E("div","man "+(p.toLowerCase()==="w"?"w":"b"),king(p)?"👑":"");if(S.turn==="w"&&mustFrom.has(i)&&p.toLowerCase()==="w")man.style.outline="3px solid #ffd75a";d.append(man)}
        d.onclick=()=>tap(i);board.append(d)}};
    const over=()=>{if(!moves(S).length){const nat=S.turn==="w";sh.status.textContent=nat?"Non hai più mosse: vince Natan Gaming.":"Natan Gaming non ha più mosse: hai vinto!";
      fine(sh,"dama",storia,nat,nat?"Vince Natan Gaming":"Hai vinto!");return true}
      if(S.quiet>=80){sh.status.textContent="Troppe mosse senza prese: pareggio.";fine(sh,"dama",storia,null,"Pareggio");return true}return false};
    const tap=async i=>{if(busy||S.turn!=="w")return;
      if(sel>=0){const m=moves(S).find(x=>x.path[0]===sel&&x.path[x.path.length-1]===i);if(m){S=make(S,m);last=m.path;sel=-1;draw();if(over())return;await natan();return}}
      const all=moves(S);sel=all.some(m=>m.path[0]===i)?i:-1;
      if(sel<0&&mine(S.b[i],true)&&all.some(m=>m.caps.length))sh.status.textContent="Devi mangiare: muovi una delle pedine evidenziate in giallo";draw()};
    const natan=async()=>{busy=true;sh.status.textContent="Tocca a Natan Gaming";await sleep(30);
      const r=await pensa(sh.ng,"dama",bestMoves(S,depth),"ha mosso");storia.push(r.favor||[]);const m=r.mossa.m;S=make(S,m);last=m.path;draw();busy=false;
      if(!over())sh.status.textContent=(m.caps.length?`Natan Gaming ha mangiato ${m.caps.length} ${m.caps.length>1?"pedine":"pedina"}. `:"")+"Tocca a te"};
    sh.status.textContent="Tocca a te: muovi una pedina bianca";draw()}};
})();

// =====================================================================================================
// CARTE COLORATE (stile Uno)
(function(){
const {E,sleep,shuffle,pensa,gameShell,fine,GAMES}=window.__G;
const COL=["r","g","v","b"],CN={r:"rosso",g:"giallo",v:"verde",b:"blu",n:"jolly"};
function deck(){const d=[];for(const c of COL){d.push({c,v:"0"});for(let k=0;k<2;k++){for(let n=1;n<=9;n++)d.push({c,v:String(n)});for(const a of ["salta","inverti","+2"])d.push({c,v:a})}}
  for(let k=0;k<4;k++){d.push({c:"n",v:"jolly"});d.push({c:"n",v:"+4"})}return shuffle(d)}
const can=(card,top,color)=>card.c==="n"||card.c===color||card.v===top.v;
const label=v=>({salta:"⊘",inverti:"⇄",jolly:"★","+2":"+2","+4":"+4"}[v]||v);
function cardEl(k,onclick,ok=true){const d=E("div","card u "+k.c);d.append(E("div","big",label(k.v)));d.title=CN[k.c]+" "+k.v;if(!ok)d.classList.add("no");if(onclick&&ok)d.onclick=onclick;return d}
function bestColor(h){const n={r:0,g:0,v:0,b:0};for(const k of h)if(k.c!=="n")n[k.c]++;return COL.sort((a,b)=>n[b]-n[a])[0]}
window.__UNO={deck,can};
GAMES.uno={nome:"Carte colorate",ic:"🃏",sub:"Stile Uno: resta senza carte per primo",
  tut:[["🃏","Lo scopo","Vince chi resta per primo senza carte. Tu e Natan Gaming partite con 7 carte."],
       ["🟥🟦","Come si gioca","Al tuo turno metti sul mazzo una carta dello stesso colore oppure con lo stesso numero o simbolo. Se non puoi, peschi una carta (e se va bene puoi giocarla subito)."],
       ["⊘⇄+2","Le carte speciali","⊘ Salta e ⇄ Inverti: l'avversario salta il turno. +2: l'avversario pesca 2 carte e salta il turno. ★ Jolly: scegli tu il colore. +4: scegli il colore e l'avversario pesca 4 carte (in questa versione il +4 si può giocare sempre)."],
       ["📣","UNO!","Quando stai per restare con una sola carta, premi «UNO!» prima di giocarla. Se te ne dimentichi, Natan Gaming se ne accorge e peschi 2 carte."]],
  play(pg){
    const sh=gameShell(pg,this);let D=deck();const hand=[D.pop(),D.pop(),D.pop(),D.pop(),D.pop(),D.pop(),D.pop()],nat=[D.pop(),D.pop(),D.pop(),D.pop(),D.pop(),D.pop(),D.pop()];
    let top=D.pop();while(top.c==="n"){D.unshift(top);top=D.pop()}let color=top.c,busy=false,uno=false,drew=null,finished=false;const pile=[top];const storia=[];
    const draw1=()=>{if(!D.length){const keep=pile.pop();D=shuffle(pile.splice(0));pile.push(keep)}return D.pop()};
    const opp=E("div","hand");const mid=E("div","table");const mine=E("div","hand");const ctl=E("div","row");ctl.style.justifyContent="center";
    sh.g.append(E("small","","Le carte di Natan Gaming"),opp,mid,E("small","","Le tue carte"),mine,ctl);
    const render=()=>{opp.innerHTML="";nat.forEach(()=>opp.append(E("div","card back")));
      mid.innerHTML="";mid.append(cardEl(top));const cc=E("div","");cc.style.cssText="align-self:center;color:#fff;font-weight:700";cc.textContent="Colore: "+CN[color];mid.append(cc);
      const dk=E("div","card back");dk.style.cursor="pointer";dk.title="Pesca";mid.append(dk);dk.onclick=pesca;
      mine.innerHTML="";hand.forEach((k,i)=>{const ok=!busy&&!finished&&(drew?k===drew:true)&&can(k,top,color);mine.append(cardEl(k,()=>play(i),ok))});
      ctl.innerHTML="";if(finished)return;
      const pb=E("button","btn ghost","🂠 Pesca");pb.id="unoPesca";pb.onclick=pesca;pb.disabled=busy||!!drew;ctl.append(pb);
      if(drew){const ps=E("button","btn ghost","Passa");ps.id="unoPassa";ps.onclick=()=>{drew=null;natan()};ctl.append(ps)}
      const ub=E("button","btn"+(uno?"":" ghost"),uno?"UNO! ✓":"📣 UNO!");ub.id="unoBtn";ub.onclick=()=>{uno=true;render()};ub.disabled=busy||hand.length>2;ctl.append(ub)};
    const effect=async(k,victim,who)=>{
      if(k.v==="+2"){victim.push(draw1(),draw1());return true}
      if(k.v==="+4"){victim.push(draw1(),draw1(),draw1(),draw1());return true}
      return k.v==="salta"||k.v==="inverti"};
    const chooseColor=()=>new Promise(res=>{ctl.innerHTML="";ctl.append(E("span","","Scegli il colore:"));
      for(const c of COL){const b=E("button","btn","");b.style.background={r:"#e2463c",g:"#f2c230",v:"#33a65a",b:"#2f6fd6"}[c];b.textContent=CN[c];b.dataset.col=c;b.onclick=()=>res(c);ctl.append(b)}});
    const check=()=>{if(!hand.length){finished=true;render();sh.status.textContent="Hai finito le carte: hai vinto!";fine(sh,"uno",storia,false,"Hai vinto!");return true}
      if(!nat.length){finished=true;render();sh.status.textContent="Natan Gaming ha finito le carte.";fine(sh,"uno",storia,true,"Vince Natan Gaming");return true}return false};
    async function play(i){if(busy||finished)return;const k=hand[i];if(!can(k,top,color))return;
      busy=true;hand.splice(i,1);pile.push(k);top=k;color=k.c;drew=null;
      if(k.c==="n"){render();color=await chooseColor()}
      let msg="";if(hand.length===1&&!uno){hand.push(draw1(),draw1());msg="Natan Gaming: «Non hai detto UNO!» Peschi 2 carte. "}
      uno=false;const skip=await effect(k,nat);render();if(check())return;
      if(skip){sh.status.textContent=msg+"Natan Gaming salta il turno: tocca a te di nuovo";busy=false;render();return}
      sh.status.textContent=msg;busy=false;await natan()}
    async function pesca(){if(busy||finished||drew)return;const k=draw1();hand.push(k);
      if(can(k,top,color)){drew=k;sh.status.textContent="Hai pescato una carta che va bene: giocala oppure premi «Passa»";render()}
      else{sh.status.textContent="Hai pescato";render();await natan()}}
    async function natan(){if(finished)return;busy=true;render();sh.status.textContent="Tocca a Natan Gaming";
      for(;;){
        const playable=nat.map((k,i)=>({k,i})).filter(x=>can(x.k,top,color));
        if(!playable.length){const k=draw1();nat.push(k);await sleep(400);render();
          if(!can(k,top,color)){sh.status.textContent="Natan Gaming ha pescato. Tocca a te";busy=false;render();return}continue}
        const few=1/Math.max(1,hand.length),maj=bestColor(nat);
        const cands=playable.map(x=>{const k=x.k;const rest=nat.filter((_,j)=>j!==x.i);const act=["+2","+4","salta","inverti"].includes(k.v);
          return {x,f:{valore:(+k.v||0)/9*.5,punti:act?.4:0,attacco:(k.v==="+4"?1:k.v==="+2"?.7:act?.4:0)*few*2,
            conserva:k.c==="n"?-.7:0,posizione:(k.c===maj?.5:0),futuro:rest.filter(r=>r.c===(k.c==="n"?maj:k.c)||r.c==="n").length/8,
            finale:hand.length<=2?(act?1:.2):0,rischio:0,difesa:hand.length<=2&&k.v==="+4"?.8:0}}});
        const r=await pensa(sh.ng,"uno",cands,"ha giocato");storia.push(r.favor||[]);const {k,i}=r.mossa.x;
        nat.splice(i,1);pile.push(k);top=k;color=k.c==="n"?bestColor(nat):k.c;
        const skip=await effect(k,hand);render();
        if(check())return;
        if(skip){sh.status.textContent=(k.v==="+2"?"Peschi 2 carte e ":k.v==="+4"?"Peschi 4 carte e ":"")+"salti il turno: Natan Gaming gioca ancora";await sleep(700);continue}
        break}
      sh.status.textContent=(nat.length===1?"Natan Gaming: «UNO!» · ":"")+"Tocca a te"+(top.c==="n"?" · colore scelto: "+CN[color]:"");busy=false;render()}
    sh.status.textContent="Tocca a te: gioca una carta dello stesso colore o numero";render()}};
})();

// =====================================================================================================
// CARTE ITALIANE: Scopa e Briscola
(function(){
const {E,sleep,shuffle,pensa,gameShell,fine,GAMES}=window.__G;
const SEMI=["denari","coppe","spade","bastoni"],ICO={denari:"🪙",coppe:"🏆",spade:"🗡️",bastoni:"🪵"},TINT={denari:"#b8860b",coppe:"#c0392b",spade:"#2c5aa0",bastoni:"#2e7d32"};
const NOME=v=>({1:"A",8:"F",9:"C",10:"R"}[v]||String(v));
const NOMEL=v=>({1:"Asso",8:"Fante",9:"Cavallo",10:"Re"}[v]||String(v));
function mazzo(){const d=[];for(const s of SEMI)for(let v=1;v<=10;v++)d.push({s,v});return shuffle(d)}
function cardEl(k,onclick,ok=true){const d=E("div","card");d.style.borderLeft="5px solid "+TINT[k.s];d.style.color=TINT[k.s];
  d.append(E("div","v",NOME(k.v)),E("div","s",ICO[k.s]),E("div","v2",NOMEL(k.v)+" di "+k.s));d.title=NOMEL(k.v)+" di "+k.s;if(!ok)d.classList.add("no");if(onclick&&ok)d.onclick=onclick;return d}
const PRIM={7:21,6:18,1:16,5:15,4:14,3:13,2:12,8:10,9:10,10:10};
function prese(tavolo,v){const s=tavolo.map((k,i)=>({k,i})).filter(x=>x.k.v===v);if(s.length)return s.map(x=>[x.i]);
  const out=[],n=tavolo.length;for(let m=1;m<(1<<n);m++){let sum=0,ids=[];for(let i=0;i<n;i++)if(m&(1<<i)){sum+=tavolo[i].v;ids.push(i)}if(sum===v&&ids.length>1)out.push(ids)}return out}
function primiera(cs){let t=0;for(const s of SEMI){const m=Math.max(0,...cs.filter(k=>k.s===s).map(k=>PRIM[k.v]));if(!m)return 0;t+=m}return t}
function punteggio(a,b,sa,sb){const r={a:sa,b:sb,det:[]};
  const add=(cond,who,txt)=>{if(cond===1){r.a++;r.det.push("tu: "+txt)}else if(cond===-1){r.b++;r.det.push("Natan: "+txt)}};
  add(Math.sign(a.length-b.length),0,"carte");const da=a.filter(k=>k.s==="denari").length,db=b.filter(k=>k.s==="denari").length;add(Math.sign(da-db),0,"denari");
  add(a.some(k=>k.s==="denari"&&k.v===7)?1:-1,0,"settebello");const pa=primiera(a),pb=primiera(b);add(Math.sign(pa-pb),0,"primiera");
  if(sa)r.det.push("tu: "+sa+" scop"+(sa>1?"e":"a"));if(sb)r.det.push("Natan: "+sb+" scop"+(sb>1?"e":"a"));return r}
window.__SCOPA={prese,primiera,punteggio,mazzo};
GAMES.scopa={nome:"Scopa",ic:"🧹",sub:"Carte italiane: prendi, fai scopa, arriva a 11",
  tut:[["🧹","Lo scopo","Si gioca con 40 carte italiane (denari 🪙, coppe 🏆, spade 🗡️, bastoni 🪵). Vince chi arriva per primo a 11 punti, in più smazzate."],
       ["🃏","Prendere","Giochi una carta: se sul tavolo c'è una carta con lo stesso valore la prendi (Fante=8, Cavallo=9, Re=10). Altrimenti puoi prendere più carte che sommate fanno il suo valore. Se non prendi niente, la carta resta sul tavolo."],
       ["✨","Scopa!","Se prendi tutte le carte del tavolo fai «scopa»: un punto in più. Attenta a non lasciare sul tavolo carte che l'avversario può prendere tutte insieme."],
       ["🏅","I punti","A fine smazzata: 1 punto a chi ha più carte, 1 a chi ha più denari, 1 per il settebello (7 di denari), 1 per la primiera (i migliori 7, 6 e assi di ogni seme), più le scope."]],
  play(pg){
    const sh=gameShell(pg,this);let tot={a:0,b:0};const storia=[];let primo=0;
    const opp=E("div","hand"),tav=E("div","table"),mine=E("div","hand"),ctl=E("div","row"),sc=E("div","score");ctl.style.justifyContent="center";
    sh.g.append(sc,E("small","","Natan Gaming"),opp,tav,E("small","","Le tue carte"),mine,ctl);
    const smazzata=()=>{const D=mazzo();const st={D,tav:[D.pop(),D.pop(),D.pop(),D.pop()],ha:[],hb:[],pa:[],pb:[],sa:0,sb:0,last:null,turn:primo,busy:false};
      const dai=()=>{for(let i=0;i<3;i++){st.ha.push(st.D.pop());st.hb.push(st.D.pop())}};dai();
      const render=()=>{sc.innerHTML="";sc.append(E("b","",`Tu ${tot.a}`),E("b","",`Natan ${tot.b}`),E("b","",`Mazzo ${st.D.length}`),E("b","",`Scope: tu ${st.sa} · Natan ${st.sb}`));
        opp.innerHTML="";st.hb.forEach(()=>opp.append(E("div","card back")));tav.innerHTML="";st.tav.forEach(k=>tav.append(cardEl(k)));if(!st.tav.length)tav.append(E("span","","(tavolo vuoto)"));
        mine.innerHTML="";st.ha.forEach((k,i)=>mine.append(cardEl(k,()=>gioca(i),!st.busy&&st.turn===0)))};
      const scegli=opts=>new Promise(res=>{ctl.innerHTML="";ctl.append(E("span","","Cosa prendi?"));
        opts.forEach((o,j)=>{const b=E("button","btn ghost",o.map(i=>NOMEL(st.tav[i].v)+" "+ICO[st.tav[i].s]).join(" + "));b.dataset.opt=String(j);b.onclick=()=>{ctl.innerHTML="";res(o)};ctl.append(b)})});
      const applica=(who,k,opt)=>{const h=who===0?st.pa:st.pb;let txt;
        if(opt){const taken=opt.map(i=>st.tav[i]);st.tav=st.tav.filter((_,i)=>!opt.includes(i));h.push(k,...taken);st.last=who;
          const ultima=!st.D.length&&!st.ha.length&&!st.hb.length;
          if(!st.tav.length&&!ultima){who===0?st.sa++:st.sb++;txt="SCOPA! ✨"}else txt="prende "+taken.map(t=>NOMEL(t.v)).join(" + ")}
        else{st.tav.push(k);txt="posa "+NOMEL(k.v)+" di "+k.s}return txt};
      const dopo=async()=>{
        if(!st.ha.length&&!st.hb.length){
          if(st.D.length){dai();render()}
          else{if(st.tav.length&&st.last!==null){(st.last===0?st.pa:st.pb).push(...st.tav);st.tav=[]}
            const r=punteggio(st.pa,st.pb,st.sa,st.sb);tot.a+=r.a;tot.b+=r.b;render();
            sh.status.textContent=`Fine smazzata: tu +${r.a}, Natan +${r.b} (${r.det.join(", ")})`;
            if((tot.a>=11||tot.b>=11)&&tot.a!==tot.b){fine(sh,"scopa",storia,tot.b>tot.a,tot.a>tot.b?`Hai vinto ${tot.a} a ${tot.b}!`:`Vince Natan Gaming ${tot.b} a ${tot.a}`);return true}
            const nx=E("button","btn","Prossima smazzata →");nx.id="scopaNext";nx.onclick=()=>{primo=1-primo;ctl.innerHTML="";smazzata()};ctl.innerHTML="";ctl.append(nx);return true}}
        return false};
      async function gioca(i){if(st.busy||st.turn!==0)return;st.busy=true;const k=st.ha.splice(i,1)[0];render();
        const opts=prese(st.tav,k.v);let opt=null;if(opts.length===1)opt=opts[0];else if(opts.length>1)opt=await scegli(opts);
        sh.status.textContent="Tu: "+applica(0,k,opt);st.turn=1;render();if(await dopo())return;await sleep(500);await natan()}
      async function natan(){st.busy=true;render();
        const cands=[];st.hb.forEach((k,i)=>{const opts=prese(st.tav,k.v);
          const valuta=opt=>{const taken=opt?opt.map(j=>st.tav[j]):[];const resto=opt?st.tav.filter((_,j)=>!opt.includes(j)):[...st.tav,k];const somma=resto.reduce((a,x)=>a+x.v,0);
            const tutti=[k,...taken];const settebello=tutti.some(x=>x.s==="denari"&&x.v===7)&&opt;
            return {i,opt,f:{punti:opt?(taken.length+1)/5+tutti.filter(x=>x.s==="denari").length*.15:0,attacco:(opt&&!resto.length)?1.4:0,
              rischio:(resto.length&&somma<=10)?.8:(resto.length===1?.3:0),conserva:(!opt&&(k.v===7||k.s==="denari"))?-.6:0,
              valore:(settebello?1.2:0)+(opt?tutti.reduce((a,x)=>a+(x.v===7?.3:x.v===6?.15:0),0):0),posizione:0,futuro:!opt?(1-k.v/10)*.3:0,
              finale:!st.D.length&&opt?.4:0,difesa:0}}};
          if(opts.length)opts.forEach(o=>cands.push(valuta(o)));else cands.push(valuta(null))});
        const r=await pensa(sh.ng,"scopa",cands,"ha giocato");storia.push(r.favor||[]);const k=st.hb.splice(r.mossa.i,1)[0];
        const tx=applica(1,k,r.mossa.opt);sh.status.textContent="Natan Gaming "+tx+(r.mossa.opt?" (con "+NOMEL(k.v)+" di "+k.s+")":"")+" · tocca a te";st.turn=0;st.busy=false;render();
        if(await dopo())return;if(st.turn===1)await natan()}
      render();sh.status.textContent=st.turn===0?"Tocca a te: gioca una carta":"Inizia Natan Gaming";if(st.turn===1)setTimeout(natan,600)};
    smazzata()}};

// --- Briscola
const FORZA={1:10,3:9,10:8,9:7,8:6,7:5,6:4,5:3,4:2,2:1},PUNTI={1:11,3:10,10:4,9:3,8:2};
const pt=k=>PUNTI[k.v]||0;
function vince(a,b,br){if(a.s===b.s)return FORZA[b.v]>FORZA[a.v]?1:0;return b.s===br?1:0}       // 0 = vince chi ha giocato per primo
window.__BRISCOLA={vince,pt};
GAMES.briscola={nome:"Briscola",ic:"🎴",sub:"Carte italiane: fai più di 60 punti",
  tut:[["🎴","Lo scopo","Si gioca con 40 carte italiane. Ognuno ha 3 carte. La carta girata sotto il mazzo è la «briscola»: il suo seme batte tutti gli altri."],
       ["⚔️","La mano","Uno gioca una carta, l'altro risponde. Vince la carta più forte dello stesso seme, oppure una briscola. Se il seme è diverso e nessuno gioca briscola, vince chi ha giocato per primo."],
       ["🔢","Forza e punti","Ordine di forza: Asso, 3, Re, Cavallo, Fante, 7, 6, 5, 4, 2. Punti: Asso 11, 3 vale 10, Re 4, Cavallo 3, Fante 2, le altre 0. In tutto ci sono 120 punti."],
       ["🏆","Chi vince","Chi vince la mano prende le carte, pesca per primo e gioca la mano dopo. Alla fine vince chi ha più di 60 punti (60 a 60 è pareggio)."]],
  play(pg){
    const sh=gameShell(pg,this);const D=mazzo();const br=D[0];const ha=[D.pop(),D.pop(),D.pop()],hb=[D.pop(),D.pop(),D.pop()];let pa=0,pb=0,lead=0,inTav=null,busy=false;const storia=[];
    const sc=E("div","score"),opp=E("div","hand"),tav=E("div","table"),mine=E("div","hand");sh.g.append(sc,E("small","","Natan Gaming"),opp,tav,E("small","","Le tue carte"),mine);
    const render=()=>{sc.innerHTML="";sc.append(E("b","",`Tu ${pa}`),E("b","",`Natan ${pb}`),E("b","",`Mazzo ${D.length}`),E("b","",`Briscola: ${ICO[br.s]} ${br.s}`));
      opp.innerHTML="";hb.forEach(()=>opp.append(E("div","card back")));tav.innerHTML="";
      if(D.length){const b=cardEl(br);b.style.transform="rotate(90deg) scale(.85)";b.style.opacity=".9";tav.append(b)}
      if(inTav)tav.append(cardEl(inTav.k));if(!inTav&&!D.length)tav.append(E("span","",""));
      mine.innerHTML="";ha.forEach((k,i)=>mine.append(cardEl(k,()=>gioca(i),!busy&&(lead===0?!inTav:inTav&&inTav.who===1))))};
    const pesca=w=>{if(!D.length)return;const first=w===0?ha:hb,sec=w===0?hb:ha;first.push(D.pop());sec.push(D.pop())};
    const chiudi=async(a,b,primo)=>{const w=vince(a,b,br.s)===0?primo:1-primo;const p=pt(a)+pt(b);w===0?pa+=p:pb+=p;
      sh.status.textContent=(w===0?"Prendi tu":"Prende Natan Gaming")+(p?` (${p} punti)`:"")+(w===0&&ha.length>1?" · tocca a te":"");inTav=null;pesca(w);lead=w;render();
      if(!ha.length&&!hb.length){const vin=pa>60?false:pb>60?true:null;fine(sh,"briscola",storia,vin,vin===false?`Hai vinto ${pa} a ${pb}!`:vin?`Vince Natan Gaming ${pb} a ${pa}`:"60 a 60: pareggio");return}
      await sleep(700);if(lead===1)await natan()};
    async function gioca(i){if(busy)return;if(lead===0&&inTav)return;if(lead===1&&!(inTav&&inTav.who===1))return;
      const k=ha.splice(i,1)[0];
      if(lead===0){inTav={k,who:0};render();busy=true;await sleep(400);await natan()}
      else{const a=inTav.k;inTav={k,who:0};render();busy=true;await sleep(600);busy=false;await chiudi(a,k,1)}}
    async function natan(){busy=true;render();
      const resp=inTav&&inTav.who===0;const a=resp?inTav.k:null;
      const cands=hb.map((k,i)=>{const isB=k.s===br.s;
        if(resp){const win=vince(a,k,br.s)===1;const p=pt(a)+pt(k);
          return {i,f:{valore:win?p/21:-p/21,punti:win?p/11:0,attacco:win&&pt(a)>=10?1:0,conserva:(isB?-.5:0)-(pt(k)>=10&&!win?.8:0),rischio:!win?pt(k)/11:0,
            difesa:win&&isB&&pt(a)>=3?.6:0,posizione:0,futuro:-(FORZA[k.v]/10)*.3,finale:!D.length&&win?.5:0}}}
        return {i,f:{valore:-pt(k)/11,punti:0,attacco:0,conserva:(isB?-.6:0)-(pt(k)>=10?.7:0),rischio:pt(k)/11*.8,difesa:0,posizione:0,futuro:-(FORZA[k.v]/10)*.2,finale:0}}});
      const r=await pensa(sh.ng,"briscola",cands,"ha giocato");storia.push(r.favor||[]);const k=hb.splice(r.mossa.i,1)[0];
      if(resp){const a2=inTav.k;inTav={k,who:1};render();await sleep(700);busy=false;await chiudi(a2,k,0)}
      else{inTav={k,who:1};busy=false;render();sh.status.textContent="Natan Gaming ha giocato "+NOMEL(k.v)+" di "+k.s+": rispondi"}}
    render();sh.status.textContent="Tocca a te: gioca una carta (la briscola è "+br.s+" "+ICO[br.s]+")"}};
})();
