// GIOCHI CLASSICI di Natan: Forza 4, Reversi e Memory sul motore dei giochi di Natan (giochi.js).
(function(){
"use strict";
const {E,register,shuffle,mulberry,rnd}=window.__G;
const Z=window.__G.zen||{};
const sfx=(n,a)=>{try{Z.sfx(n,a)}catch(e){}};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const nomeDi=(c,s)=>s===c.me?"Tu":(c.seats[s]?c.seats[s].nome:"?");
const pic=(id,em,col)=>{try{Z.PIC[id]=`<svg class="pic pic-sp" viewBox="0 0 240 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style="--gc:${col}"><rect width="240" height="120" fill="${col}" opacity=".25"/><text x="120" y="82" font-size="64" text-anchor="middle">${em}</text></svg>`}catch(e){}};
(function(){if(document.getElementById("clStyle"))return;const s=document.createElement("style");s.id="clStyle";s.textContent=`
.clw{display:flex;flex-direction:column;align-items:center;gap:10px;padding:10px}
.clinfo{font-weight:700;text-align:center;min-height:1.4em}
.f4{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;background:linear-gradient(#2b5fd9,#1c3f9a);padding:10px;border-radius:16px;width:min(94vw,440px,62vh);box-shadow:0 10px 30px #0006, inset 0 2px 0 #fff3}
.f4 button{aspect-ratio:1;border-radius:50%;border:0;background:#0d1b3d;position:relative;padding:0;cursor:pointer;overflow:hidden;box-shadow:inset 0 4px 8px #0008}
.f4 button:disabled{cursor:default}
.f4 button.hov:hover:not(:disabled){background:#17306b}
.f4 i{position:absolute;inset:6%;border-radius:50%}
.f4 i.a{background:radial-gradient(circle at 35% 30%,#ff9a9a,#e03131 60%,#9c1c1c)}
.f4 i.b{background:radial-gradient(circle at 35% 30%,#fff1a6,#fcc419 60%,#c99700)}
.f4 i.drop{animation:f4drop .55s cubic-bezier(.5,0,.9,.5) both}
.f4 i.win{animation:f4win .7s ease-in-out infinite alternate;box-shadow:0 0 14px 4px #fff}
@keyframes f4drop{0%{transform:translateY(var(--dy,-400%))}70%{transform:translateY(0)}82%{transform:translateY(-14%)}100%{transform:translateY(0)}}
@keyframes f4win{from{transform:scale(1)}to{transform:scale(1.12)}}
.rv{display:grid;grid-template-columns:repeat(8,1fr);gap:2px;background:#0b3d1f;padding:6px;border-radius:12px;width:min(94vw,480px,66vh);box-shadow:0 10px 30px #0006}
.rv button{aspect-ratio:1;border:0;background:linear-gradient(#2f8f4e,#267a41);position:relative;padding:0;cursor:default;border-radius:3px}
.rv button.can{cursor:pointer}
.rv button.can::after{content:"";position:absolute;inset:38%;border-radius:50%;background:#fff6;animation:rvp 1.2s ease-in-out infinite}
@keyframes rvp{50%{transform:scale(1.5);opacity:.4}}
.rv button.hint::after{background:#ffd166;inset:30%}
.rv .d{position:absolute;inset:9%;border-radius:50%;transition:transform .5s,background .25s .12s;box-shadow:0 3px 5px #0007}
.rv .d.k{background:radial-gradient(circle at 35% 30%,#555,#111)}
.rv .d.w{background:radial-gradient(circle at 35% 30%,#fff,#cfd4dc)}
.rv .d.new{animation:rvnew .4s ease-out}
.rv .d.flip{animation:rvflip .55s ease-in-out}
.rv button.last{outline:2px solid #ffd166;outline-offset:-2px}
@keyframes rvnew{from{transform:scale(0)}to{transform:scale(1)}}
@keyframes rvflip{0%{transform:rotateY(0)}50%{transform:rotateY(90deg) scale(1.1)}100%{transform:rotateY(0)}}
.gm.full .f4,.gm.full .rv,.gm.full .mm{width:min(76vw,70vh,520px)}
.mm{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;width:min(94vw,420px,60vh)}
.mm button{aspect-ratio:1;border:0;background:none;padding:0;perspective:600px;cursor:pointer}
.mm .in{position:absolute;inset:0;transition:transform .5s;transform-style:preserve-3d}
.mm button{position:relative}
.mm .fa,.mm .fb{position:absolute;inset:0;border-radius:14px;backface-visibility:hidden;display:flex;align-items:center;justify-content:center;font-size:clamp(26px,9vw,52px)}
.mm .fa{background:linear-gradient(135deg,#6c5ce7,#a29bfe);box-shadow:inset 0 0 0 3px #fff3}
.mm .fa::after{content:"?";color:#fff8;font-weight:800}
.mm .fb{background:#fff;transform:rotateY(180deg);box-shadow:0 2px 8px #0004}
.mm button.up .in{transform:rotateY(180deg)}
.mm button.ok .fb{background:#d3f9d8;animation:mmok .6s}
.mm button.ok{cursor:default}
@keyframes mmok{50%{transform:rotateY(180deg) scale(1.15)}}
`;document.head.append(s)})();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

// =============================================================== FORZA 4
const FR=6,FC=7;
const f4Win=(b,p)=>{const dirs=[[0,1],[1,0],[1,1],[1,-1]];for(let r=0;r<FR;r++)for(let c=0;c<FC;c++){if(b[r*FC+c]!==p)continue;for(const [dr,dc] of dirs){const cells=[[r,c]];for(let k=1;k<4;k++){const rr=r+dr*k,cc=c+dc*k;if(rr<0||rr>=FR||cc<0||cc>=FC||b[rr*FC+cc]!==p)break;cells.push([rr,cc])}if(cells.length===4)return cells.map(x=>x[0]*FC+x[1])}}return null};
const f4Row=(b,c)=>{for(let r=FR-1;r>=0;r--)if(b[r*FC+c]===0)return r;return -1};
const f4Cols=b=>{const o=[];for(const c of [3,2,4,1,5,0,6])if(b[c]===0)o.push(c);return o};
function f4Score(b,p){let s=0;const q=3-p;
  for(let r=0;r<FR;r++)for(let c=0;c<FC;c++)for(const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]){let a=0,o=0,e=0,ok=true;for(let k=0;k<4;k++){const rr=r+dr*k,cc=c+dc*k;if(rr<0||rr>=FR||cc<0||cc>=FC){ok=false;break}const v=b[rr*FC+cc];v===p?a++:v===q?o++:e++}
    if(!ok)continue;if(a&&o)continue;if(a===3)s+=6;else if(a===2)s+=2;else if(a===1)s+=.3;if(o===3)s-=7;else if(o===2)s-=2.2}
  for(let r=0;r<FR;r++)if(b[r*FC+3]===p)s+=1.5;return s}
function f4Neg(b,p,d,al,be){
  if(f4Win(b,3-p))return -1000-d;const cols=f4Cols(b);if(!cols.length)return 0;if(d===0)return f4Score(b,p);
  let best=-1e9;for(const c of cols){const r=f4Row(b,c);b[r*FC+c]=p;const v=-f4Neg(b,3-p,d-1,-be,-al);b[r*FC+c]=0;if(v>best)best=v;if(v>al)al=v;if(al>=be)break}return best}
register({id:"forza4",ord:12,nome:"Forza 4",ic:"🔴",col:"#2b5fd9",sub:"Allinea quattro dischi prima dell'avversario",min:2,max:2,noEval:true,
  tut:[["🔴","Lo scopo","Fai cadere i dischi nelle colonne: vince chi per primo ne allinea quattro in orizzontale, in verticale o in diagonale."],["👆","Come si gioca","Tocca una colonna: il disco scende fino in fondo."],["🧠","Consiglio","Blocca le tre in fila dell'avversario e cerca di fare due minacce insieme."]],
  init(){return {b:new Array(42).fill(0),turn:0,nm:0,last:-1,win:null,full:false}},
  turn(S){return S.turn},
  legal(S,seat){return f4Cols(S.b).map(c=>({k:"c"+c,c}))},
  apply(S,seat,a){const b=S.b.slice(),r=f4Row(b,a.c);b[r*FC+a.c]=seat+1;S.b=b;S.last=r*FC+a.c;S.nm++;
    const w=f4Win(b,seat+1);if(w)S.win={by:seat,cells:w};else if(!b.includes(0))S.full=true;S.turn=1-seat;return S},
  over(S){return S.win?{win:[S.win.by]}:S.full?{win:[],text:"Pareggio: la griglia è piena."}:null},
  pausa(S){return 650},
  msgTurno(S,c,seat){return "Tocca a te: scegli una colonna"},
  bot(S,seat,lv){const p=seat+1,d=[2,3,5,6][clamp(lv==null?1:lv,0,3)];
    return f4Cols(S.b).map(c=>{const b=S.b.slice(),r=f4Row(b,c);b[r*FC+c]=p;const win=!!f4Win(b,p);const v=win?1000:-f4Neg(b,3-p,d-1,-1e9,1e9);
      const bb=S.b.slice();bb[r*FC+c]=3-p;const block=!!f4Win(bb,3-p);
      return {a:{k:"c"+c,c},f:{valore:clamp(v/40,-1,1),punti:win?1:0,attacco:clamp(f4Score(b,p)/20,-1,1),difesa:block?1:0,rischio:v<-900?-1:0,conserva:0,posizione:1-Math.abs(c-3)/3,futuro:clamp(v/80,-1,1),finale:win?1:0}}})},
  view(sh,ctx){
    const root=E("div","clw"),inf=E("div","clinfo"),bd=E("div","f4");root.append(inf,bd);sh.g.append(root);
    const bt=[];for(let r=0;r<FR;r++)for(let c=0;c<FC;c++){const b=E("button","hov");b.dataset.c=String(c);b.setAttribute("aria-label","Colonna "+(c+1));bd.append(b);bt.push(b)}
    let SS=null,cc=null,seen=0;
    bd.onclick=e=>{const b=e.target.closest("button");if(!b||!SS||!cc||!cc.myTurn)return;const c=+b.dataset.c;if(cc.legal.find(x=>x.c===c)){sfx("piece");cc.act("c"+c)}};
    const draw=(S,c)=>{SS=S;cc=c;
      for(let i=0;i<42;i++){const b=bt[i],v=S.b[i];b.disabled=!(c.myTurn&&S.b[i%FC]===0);const old=b.firstChild;
        const has=old?(old.classList.contains("a")?1:2):0;
        if(v!==has||(v&&S.win&&S.win.cells.includes(i)!==old.classList.contains("win"))){b.innerHTML="";if(v){const d=E("i",v===1?"a":"b");if(i===S.last&&S.nm!==seen){d.classList.add("drop");d.style.setProperty("--dy",-(Math.floor(i/FC)*105+120)+"%");sfx("piece")}if(S.win&&S.win.cells.includes(i))d.classList.add("win");b.append(d)}}}
      seen=S.nm;
      inf.textContent=S.win?`${nomeDi(c,S.win.by)} ${S.win.by===c.me?"hai":"ha"} fatto Forza 4!`:S.full?"Griglia piena":`${nomeDi(c,S.turn)} ${S.turn===0?"🔴":"🟡"} — ${S.turn===c.me?"tocca a te":"sta pensando"}`};
    return {draw}}});
pic("forza4","🔴","#2b5fd9");

// =============================================================== REVERSI
const RD=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
function rvFlips(b,i,p){const r=i>>3,c=i&7,out=[];if(b[i])return out;
  for(const [dr,dc] of RD){const t=[];let rr=r+dr,cc=c+dc;while(rr>=0&&rr<8&&cc>=0&&cc<8&&b[rr*8+cc]===3-p){t.push(rr*8+cc);rr+=dr;cc+=dc}
    if(t.length&&rr>=0&&rr<8&&cc>=0&&cc<8&&b[rr*8+cc]===p)out.push(...t)}return out}
const rvMoves=(b,p)=>{const o=[];for(let i=0;i<64;i++){const f=rvFlips(b,i,p);if(f.length)o.push({i,f})}return o};
const RW=[100,-20,10,5,5,10,-20,100,-20,-50,-2,-2,-2,-2,-50,-20,10,-2,-1,-1,-1,-1,-2,10,5,-2,-1,-1,-1,-1,-2,5,5,-2,-1,-1,-1,-1,-2,5,10,-2,-1,-1,-1,-1,-2,10,-20,-50,-2,-2,-2,-2,-50,-20,100,-20,10,5,5,10,-20,100];
function rvEval(b,p){let s=0,n=0;for(let i=0;i<64;i++){if(b[i]===p){s+=RW[i];n++}else if(b[i]){s-=RW[i];n--}}
  const m=rvMoves(b,p).length-rvMoves(b,3-p).length;return s+m*6+(b.every(x=>x)?n*50:0)}
function rvPlay(b,i,p,f){const nb=b.slice();nb[i]=p;f.forEach(x=>nb[x]=p);return nb}
function rvNeg(b,p,d,al,be){const ms=rvMoves(b,p);if(!ms.length){const o=rvMoves(b,3-p);if(!o.length){let n=0;b.forEach(x=>{if(x===p)n++;else if(x)n--});return n*100}return -rvNeg(b,3-p,d,-be,-al)}
  if(d===0)return rvEval(b,p);let best=-1e9;for(const m of ms){const v=-rvNeg(rvPlay(b,m.i,p,m.f),3-p,d-1,-be,-al);if(v>best)best=v;if(v>al)al=v;if(al>=be)break}return best}
register({id:"reversi",ord:13,nome:"Reversi",ic:"⚫",col:"#267a41",sub:"Circonda i dischi avversari e girali",min:2,max:2,noEval:true,
  tut:[["⚫","Lo scopo","Alla fine vince chi ha più dischi del proprio colore."],["↔️","Come si gioca","Metti un disco in modo da chiudere in linea uno o più dischi avversari tra il tuo nuovo disco e un tuo disco: quelli si girano."],["🔆","Mosse possibili","I puntini bianchi mostrano dove puoi giocare. Se non puoi muovere, passi il turno da solo."],["📐","Consiglio","Gli angoli sono i punti più forti, le caselle vicine agli angoli sono pericolose."]],
  init(){const b=new Array(64).fill(0);b[27]=2;b[36]=2;b[28]=1;b[35]=1;return {b,turn:0,nm:0,last:-1,flips:[],end:false,pass:null}},
  turn(S){return S.turn},
  legal(S,seat){return rvMoves(S.b,seat+1).map(m=>({k:"p"+m.i,m}))},
  apply(S,seat,a){const m=a.m||rvMoves(S.b,seat+1).find(x=>"p"+x.i===a.k);S.b=rvPlay(S.b,m.i,seat+1,m.f);S.last=m.i;S.flips=m.f;S.nm++;S.pass=null;
    if(rvMoves(S.b,2-seat).length)S.turn=1-seat;else if(rvMoves(S.b,seat+1).length){S.turn=seat;S.pass=1-seat}else S.end=true;return S},
  over(S){if(!S.end)return null;let a=0,b=0;S.b.forEach(x=>{if(x===1)a++;else if(x===2)b++});return a===b?{win:[],text:`Pareggio ${a} a ${b}`}:{win:[a>b?0:1],text:s=>`${s[a>b?0:1].nome} vince ${Math.max(a,b)} a ${Math.min(a,b)}`}},
  pausa(S){return 750},
  msgTurno(S,c,seat){return "Tocca a te: scegli una casella con il puntino"+(S.pass!=null?" (l'avversario non poteva muovere)":"")},
  bot(S,seat,lv){const p=seat+1,d=[1,2,3,4][clamp(lv==null?1:lv,0,3)],ms=rvMoves(S.b,p);
    return ms.map(m=>{const nb=rvPlay(S.b,m.i,p,m.f),v=-rvNeg(nb,3-p,d-1,-1e9,1e9),corner=[0,7,56,63].includes(m.i);
      return {a:{k:"p"+m.i,m},f:{valore:clamp(v/300,-1,1),punti:clamp(m.f.length/8,0,1),attacco:corner?1:clamp(RW[m.i]/100,-1,1),difesa:clamp(-rvMoves(nb,3-p).length/10,-1,0)+.5,rischio:RW[m.i]<=-20?-1:0,conserva:0,posizione:clamp(RW[m.i]/100,-1,1),futuro:clamp(v/500,-1,1),finale:corner?1:0}}})},
  view(sh,ctx){
    const root=E("div","clw"),inf=E("div","clinfo"),bd=E("div","rv"),tl=E("div","row");tl.style.justifyContent="center";const hb=E("button","btn ghost","💡 Aiuto");hb.id="rvHint";tl.append(hb);root.append(inf,bd,tl);sh.g.append(root);
    const bt=[];for(let i=0;i<64;i++){const b=E("button");b.dataset.i=String(i);bd.append(b);bt.push(b)}
    let SS=null,cc=null,seen=-1,hint=-1;
    bd.onclick=e=>{const b=e.target.closest("button");if(!b||!SS||!cc||!cc.myTurn)return;const m=cc.legal.find(x=>x.m.i===+b.dataset.i);if(m){hint=-1;cc.act(m.k)}};
    hb.onclick=()=>{if(!SS||!cc||!cc.myTurn)return;const p=cc.me+1;let bi=-1,bv=-1e9;for(const m of cc.legal){const v=-rvNeg(rvPlay(SS.b,m.m.i,p,m.m.f),3-p,2,-1e9,1e9);if(v>bv){bv=v;bi=m.m.i}}hint=bi;sfx("hint");draw(SS,cc)};
    const draw=(S,c)=>{SS=S;cc=c;const fresh=S.nm!==seen;const can=new Set(c.myTurn?c.legal.map(x=>x.m.i):[]);
      let a=0,b2=0;
      for(let i=0;i<64;i++){const v=S.b[i],bt_=bt[i];if(v===1)a++;else if(v===2)b2++;
        bt_.className=(can.has(i)?"can":"")+(i===hint?" hint":"")+(i===S.last?" last":"");bt_.disabled=!can.has(i);
        const cur=bt_.firstChild;const cls=v===1?"k":v===2?"w":"";
        if(!v){if(cur)bt_.innerHTML=""}
        else if(!cur||!cur.classList.contains(cls)){bt_.innerHTML="";const d=E("i","d "+cls);if(fresh&&i===S.last)d.classList.add("new");else if(fresh&&S.flips.includes(i))d.classList.add("flip");bt_.append(d)}}
      if(fresh)sfx("piece");seen=S.nm;
      inf.textContent=`⚫ ${a}  ·  ⚪ ${b2}   —   `+(S.end?"Fine":`${nomeDi(c,S.turn)} (${S.turn===0?"nero":"bianco"})`)+(S.pass!=null&&!S.end?` · ${nomeDi(c,S.pass)} salta il turno`:"")};
    return {draw}}});
pic("reversi","⚫","#267a41");

// =============================================================== MEMORY
const MEM=["🍎","🚀","🐙","🎸","🌵","🦄","🍕","⚽","🐳","🌈","🎲","🍩"];
register({id:"memory",ord:14,nome:"Memory",ic:"🃏",col:"#6c5ce7",sub:"Trova le coppie uguali e ricorda dove sono",min:2,max:2,noEval:true,
  tut:[["🃏","Lo scopo","Ci sono 8 coppie di carte coperte: vince chi ne trova di più."],["👆","Come si gioca","Gira due carte. Se sono uguali le tieni e giochi ancora, se sono diverse si rigirano e tocca all'altro."],["🧠","Consiglio","Ricorda anche le carte che gira l'avversario!"]],
  init(n,seed){const R=mulberry((seed|0)+99),v=[];for(let i=0;i<8;i++)v.push(i,i);for(let i=15;i>0;i--){const j=Math.floor(R()*(i+1));[v[i],v[j]]=[v[j],v[i]]}
    return {v,got:new Array(16).fill(-1),sc:[0,0],turn:0,nm:0,last:null,ev:[],seen:[]}},
  turn(S){return S.turn},
  legal(S,seat){return [{k:"m"}]},
  parse(S,seat,k){const t=String(k).split("|");if(t[0]!=="m")return null;const i=+t[1],j=+t[2];if(!Number.isInteger(i)||!Number.isInteger(j)||i===j||i<0||j<0||i>15||j>15||S.got[i]>=0||S.got[j]>=0)return null;return {k:`m|${i}|${j}`,i,j}},
  apply(S,seat,a){const ok=S.v[a.i]===S.v[a.j];S.last={i:a.i,j:a.j,ok,by:seat};S.nm++;S.seen=S.seen.concat([a.i,a.j]).slice(-32);
    if(ok){S.got[a.i]=seat;S.got[a.j]=seat;S.sc[seat]++;S.seen=S.seen.filter(x=>x!==a.i&&x!==a.j)}else S.turn=1-seat;return S},
  over(S){if(S.got.some(x=>x<0))return null;const [a,b]=S.sc;return a===b?{win:[],text:`Pareggio ${a} a ${b}`}:{win:[a>b?0:1],text:s=>`${s[a>b?0:1].nome} vince ${Math.max(a,b)} a ${Math.min(a,b)}`}},
  pausa(S){return S.last&&S.last.ok?1000:1500},
  msgTurno(S,c,seat){return "Tocca a te: gira due carte"},
  bot(S,seat,lv){const li=clamp(lv==null?1:lv,0,3),mem=[3,6,10,16][li],rec=S.seen.slice(-mem*1),R=mulberry(7+S.nm*13+seat);
    const known=[...new Set(rec)].filter(i=>S.got[i]<0),unk=[];for(let i=0;i<16;i++)if(S.got[i]<0&&!known.includes(i))unk.push(i);
    const out=[],mk=(i,j,v,pt)=>out.push({a:{k:`m|${i}|${j}`,i,j},f:{valore:v,punti:pt,attacco:pt,difesa:0,rischio:0,conserva:0,posizione:0,futuro:v*.5,finale:pt}});
    for(let x=0;x<known.length;x++)for(let y=x+1;y<known.length;y++)if(S.v[known[x]]===S.v[known[y]])mk(known[x],known[y],1,1);
    if(unk.length>=2){for(let n=0;n<6;n++){const i=unk[Math.floor(R()*unk.length)];let j=unk[Math.floor(R()*unk.length)];if(i===j)continue;mk(i,j,.1+ (known.some(k=>S.v[k]===S.v[j])?0:.2),0)}}
    if(!out.length){const l=[];for(let i=0;i<16;i++)if(S.got[i]<0)l.push(i);mk(l[0],l[1],0,0)}
    return out},
  view(sh,ctx){
    const root=E("div","clw"),inf=E("div","clinfo"),bd=E("div","mm");root.append(inf,bd);sh.g.append(root);
    const bt=[];for(let i=0;i<16;i++){const b=E("button");b.dataset.i=String(i);const n=E("div","in");n.append(E("div","fa"),E("div","fb"));b.append(n);bd.append(b);bt.push(b)}
    let SS=null,cc=null,first=-1,seen=-1,until=0,tm=0;
    const draw=(S,c)=>{SS=S;cc=c;
      if(S.nm!==seen){seen=S.nm;first=-1;if(S.last){until=Date.now()+(S.last.ok?900:1400);clearTimeout(tm);tm=setTimeout(()=>{if(document.body.contains(bd))draw(SS,cc)},until-Date.now()+30);sfx(S.last.ok?"dcap":"piece")}}
      const show=Date.now()<until&&S.last?[S.last.i,S.last.j]:[];
      for(let i=0;i<16;i++){const b=bt[i];b.querySelector(".fb").textContent=(S.got[i]>=0||show.includes(i)||first===i)?MEM[S.v[i]]:"";
        b.className=(S.got[i]>=0?"up ok":"")+(show.includes(i)||first===i?" up":"");b.disabled=S.got[i]>=0}
      inf.textContent=`${nomeDi(c,0)} ${S.sc[0]}  ·  ${nomeDi(c,1)} ${S.sc[1]}  —  ${S.turn===c.me?"tocca a te":"gioca "+nomeDi(c,S.turn)}`};
    bd.onclick=e=>{const b=e.target.closest("button");if(!b||!SS||!cc||!cc.myTurn||Date.now()<until)return;const i=+b.dataset.i;if(SS.got[i]>=0||i===first)return;
      if(first<0){first=i;sfx("lift");draw(SS,cc)}else{const f=first;first=-1;cc.act(`m|${f}|${i}`)}};
    return {draw}}});
pic("memory","🃏","#6c5ce7");
})();
