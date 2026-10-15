// TRIS, 4 DI FILA, UNO, SCOPA e BRISCOLA sul motore dei giochi di Natan (giochi.js)
(function(){
"use strict";
const {E,register,shuffle,mulberry,rnd}=window.__G;
function css(){if(document.getElementById("gmcssb"))return;const s=E("style");s.id="gmcssb";s.textContent=`
.gm .card.u{width:66px;height:100px;border:3px solid #fff;overflow:hidden;padding:0}
.gm .card.u .ov{position:absolute;left:50%;top:50%;width:78%;height:60%;margin:-30% 0 0 -39%;background:#fff;border-radius:50%;transform:rotate(-24deg);display:grid;place-items:center}
.gm .card.u .big{font-size:34px;font-weight:900;width:auto;height:auto;background:none;border-radius:0;transform:rotate(24deg);display:block;line-height:1}
.gm .card.u .c1,.gm .card.u .c2{position:absolute;font-size:12px;font-weight:800;color:#fff;line-height:1}
.gm .card.u .c1{left:5px;top:4px}.gm .card.u .c2{right:5px;bottom:4px;transform:rotate(180deg)}
.gm .card.u.n .ov{background:conic-gradient(#e2463c 0 25%,#f2c230 0 50%,#33a65a 0 75%,#2f6fd6 0)}
.gm .card.u.n{background:#15151c}.gm .card.u.n .big{color:#fff;text-shadow:0 1px 3px #000;font-size:26px}
.gm .card.u.g .big{color:#b98a00}
.gm .card.uback{background:#15151c;border:3px solid #fff;cursor:default;width:66px;height:100px;overflow:hidden}
.gm .card.uback::before{content:"";position:absolute;left:50%;top:50%;width:80%;height:58%;margin:-29% 0 0 -40%;background:#e2463c;border-radius:50%;transform:rotate(-24deg)}
.gm .card.uback::after{content:"N";position:absolute;inset:0;display:grid;place-items:center;color:#ffd75a;font-weight:900;font-size:26px;transform:rotate(-24deg)}
.gm .hand.sm .card.uback{width:26px;height:38px;border-width:2px}.gm .hand.sm .card.uback::after{font-size:12px}
.gm .card.ita{width:62px;height:104px;padding:0;background:#fbf7ec;border:1px solid #b9ae94;border-radius:7px}
.gm .card.ita svg{width:100%;height:100%;display:block}
.gm .card.itaback{width:62px;height:104px;border-radius:7px;background:repeating-linear-gradient(45deg,#1f5c3a,#1f5c3a 6px,#2b7a4f 6px,#2b7a4f 12px);border:3px solid #fbf7ec;cursor:default}
.gm .hand.sm .card.itaback{width:24px;height:40px;border-width:2px}
.gm .opps{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}.gm .opp{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:12px}
.gm .who{font-size:11px;color:#fff;text-align:center}
.gm .played{display:flex;flex-direction:column;align-items:center;gap:2px}
`;document.head.append(s)}
const nm=(ctx,s)=>ctx.seats[s]?ctx.seats[s].nome:"?";

// =================================================================================================== TRIS
const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function winTris(b){for(const l of LINES){const [a,c,d]=l;if(b[a]&&b[a]===b[c]&&b[a]===b[d])return {p:b[a]-1,l}}return null}
const memo=new Map();
function mmTris(b,turn){const key=b.join("")+turn;if(memo.has(key))return memo.get(key);let v;
  const w=winTris(b);if(w)v=w.p===turn?1:-1;
  else if(b.every(x=>x))v=0;
  else{v=-2;for(let i=0;i<9;i++)if(!b[i]){b[i]=turn+1;const x=-mmTris(b,1-turn);b[i]=0;if(x>v)v=x}}
  memo.set(key,v);return v}
register({id:"tris",nome:"Tris",ic:"❌",sub:"Tre in fila vince",min:2,max:2,
  tut:[["❌⭕","Lo scopo","Metti i tuoi segni (❌ per chi crea la partita, ⭕ per l'altro) sulle caselle di una griglia 3×3. Vince chi per primo ne mette tre in fila."],
       ["➖➕","Come si vince","Tre in fila vale in orizzontale, in verticale o in diagonale. Tocca una casella vuota per giocare."],
       ["🛡️","Un trucco","Se l'avversario ha due segni in fila, blocca la terza casella! E cerca di crearti due possibilità insieme: il bot più forte non sbaglia mai, ma puoi pareggiare."]],
  init(){return {b:Array(9).fill(0),turn:0,last:-1}},
  turn(S){return S.turn},
  legal(S){const o=[];for(let i=0;i<9;i++)if(!S.b[i])o.push({k:"c"+i,i});return o},
  apply(S,seat,a){const b=S.b.slice();b[a.i]=seat+1;return {b,turn:1-S.turn,last:a.i}},
  over(S){const w=winTris(S.b);if(w)return {win:[w.p],text:seats=>`Tris! Vince ${seats[w.p].nome}`};if(S.b.every(x=>x))return {win:[],text:"Pareggio"};return null},
  bot(S,seat,lv){const lg=this.legal(S);const vs=lg.map(a=>{const b=S.b.slice();b[a.i]=seat+1;return -mmTris(b,1-seat)});const best=Math.max(...vs);
    const sc=[.4,.7,1,1][lv];let idx=lg.map((a,j)=>j);if(lv>=2)idx=idx.filter(j=>vs[j]===best);
    const me=seat+1,op=2-seat;
    return idx.map(j=>{const a=lg[j],i=a.i;const b=S.b.slice();b[i]=me;
      const two=LINES.filter(l=>l.includes(i)&&l.filter(x=>b[x]===me).length===2&&l.every(x=>b[x]!==op)).length;
      const blocca=LINES.filter(l=>l.includes(i)&&l.filter(x=>S.b[x]===op).length===2).length;
      const aperte=LINES.filter(l=>l.includes(i)&&l.every(x=>b[x]!==op)).length;
      return {a,f:{valore:vs[j]*sc,posizione:i===4?1:[0,2,6,8].includes(i)?.6:.2,attacco:Math.min(1,two*.8),difesa:Math.min(1,blocca),futuro:aperte/4,rischio:0,punti:0,conserva:0,finale:0}}})},
  view(sh,ctx){
    css();const g=E("div","ttt");g.id="trisGrid";sh.g.append(g);
    return {draw(S,c){g.innerHTML="";const w=winTris(S.b);
      for(let i=0;i<9;i++){const b=E("button",S.b[i]===1?"x":S.b[i]===2?"o":"",S.b[i]===1?"✕":S.b[i]===2?"◯":"");b.dataset.c=String(i);
        if(w&&w.l.includes(i))b.classList.add("win");
        b.onclick=()=>{if(!S.b[i])c.act("c"+i)};g.append(b)}}}}
});

// =================================================================================================== 4 DI FILA
const ORD=[3,2,4,1,5,0,6];
const WINS=[];(function(){for(let r=0;r<6;r++)for(let c=0;c<7;c++)for(const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]){const w=[];for(let k=0;k<4;k++){const rr=r+dr*k,cc=c+dc*k;if(rr<0||rr>5||cc<0||cc>6){w.length=0;break}w.push(rr*7+cc)}if(w.length===4)WINS.push(w)}})();
function win4(g,i){const v=g[i];if(!v)return null;const r=(i/7)|0,c=i%7;
  for(const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]){const cells=[i];
    for(const s of [1,-1]){let rr=r+dr*s,cc=c+dc*s;while(rr>=0&&rr<6&&cc>=0&&cc<7&&g[rr*7+cc]===v){cells.push(rr*7+cc);rr+=dr*s;cc+=dc*s}}
    if(cells.length>=4)return cells}return null}
function ev4(g,turn){const me=turn+1;let s=0;
  for(const w of WINS){let p=0,q=0;for(const i of w){if(g[i]===me)p++;else if(g[i])q++}
    if(p&&q)continue;if(p===3)s+=6;else if(p===2)s+=2;else if(p===1)s+=.2;if(q===3)s-=7;else if(q===2)s-=2.2;else if(q===1)s-=.2}
  for(let r=0;r<6;r++){if(g[r*7+3]===me)s+=1.5;else if(g[r*7+3])s-=1.5}return s}
function nega4(g,h,turn,d,al,be,ply){
  let best=-1e9,any=false;
  for(const c of ORD){if(h[c]>=6)continue;any=true;const i=(5-h[c])*7+c;g[i]=turn+1;h[c]++;let v;
    if(win4(g,i))v=100000-ply;else if(d<=1)v=ev4(g,turn)*10;else v=-nega4(g,h,1-turn,d-1,-be,-al,ply+1);
    g[i]=0;h[c]--;
    if(v>best)best=v;if(v>al)al=v;if(al>=be)break}
  return any?best:0}
function desktop(){try{return matchMedia("(min-width:900px)").matches}catch(e){return false}}
register({id:"forza4",nome:"4 di fila",ic:"🔴",sub:"Allinea 4 gettoni per vincere",min:2,max:2,
  tut:[["🔴🟡","Lo scopo","Fai cadere i tuoi gettoni nelle colonne: vince chi per primo ne allinea quattro. Chi crea la partita ha i gettoni rossi."],
       ["⬇️","Come si gioca","Tocca una colonna: il gettone cade fino in fondo, sopra gli altri. A turno, uno alla volta."],
       ["↗️","Le file","Quattro in fila vale in orizzontale, verticale e in diagonale. Occhio a bloccare l'avversario quando ne ha tre!"]],
  init(){return {g:Array(42).fill(0),h:Array(7).fill(0),turn:0,last:-1}},
  turn(S){return S.turn},
  legal(S){const o=[];for(let c=0;c<7;c++)if(S.h[c]<6)o.push({k:"c"+c,c});return o},
  apply(S,seat,a){const g=S.g.slice(),h=S.h.slice();const i=(5-h[a.c])*7+a.c;g[i]=seat+1;h[a.c]++;return {g,h,turn:1-S.turn,last:i}},
  over(S){if(S.last>=0){const w=win4(S.g,S.last);if(w){const p=S.g[S.last]-1;return {win:[p],text:seats=>`Quattro in fila! Vince ${seats[p].nome}`,cells:w}}}
    if(S.h.every(x=>x>=6))return {win:[],text:"Pareggio"};return null},
  bot(S,seat,lv){const lg=this.legal(S);const g=S.g.slice(),h=S.h.slice();const d=[2,4,6,desktop()?7:6][lv];const me=seat+1,op=3-me;
    const vs=lg.map(a=>{const i=(5-h[a.c])*7+a.c;g[i]=me;h[a.c]++;let v;if(win4(g,i))v=100000;else v=-nega4(g,h,1-seat,d-1,-1e9,1e9,1);g[i]=0;h[a.c]--;return v});
    const best=Math.max(...vs);const marg=[1e9,300,120,40][lv];
    return lg.map((a,j)=>({a,v:vs[j]})).filter(x=>x.v>=best-marg).map(x=>{const c=x.a.c,i=(5-h[c])*7+c;
      let att=0,dif=0,fut=0;for(const w of WINS){if(!w.includes(i))continue;let p=0,q=0;for(const j of w){if(g[j]===me)p++;else if(g[j]===op)q++}
        if(!q&&p===2)att++;if(!q&&p===1)fut+=.5;if(!p&&q===3)dif++}
      g[i]=me;h[c]++;let risk=0;if(h[c]<6){const j=(5-h[c])*7+c;g[j]=op;if(win4(g,j))risk=1;g[j]=0}g[i]=0;h[c]--;
      return {a:x.a,f:{valore:Math.max(-1,Math.min(1,(x.v-best)/150)),attacco:Math.min(1,att*.5),difesa:Math.min(1,dif),rischio:risk,posizione:(3-Math.abs(c-3))/3,futuro:Math.min(1,fut/3),punti:0,conserva:0,finale:0}}})},
  view(sh,ctx){
    css();const gr=E("div","f4");gr.id="f4Grid";sh.g.append(gr);
    return {draw(S,c){gr.innerHTML="";const w=S.last>=0?win4(S.g,S.last):null;
      for(let i=0;i<42;i++){const col=i%7;const b=E("button","cl"+(S.g[i]?" p"+(S.g[i]-1):""));b.dataset.c=String(col);if(w&&w.includes(i))b.classList.add("win");else if(i===S.last)b.classList.add("last");
        b.onclick=()=>c.act("c"+col);gr.append(b)}}}}
});

// =================================================================================================== UNO
const COL=["r","g","v","b"],CN={r:"rosso",g:"giallo",v:"verde",b:"blu",n:"jolly"};
function deckUno(R){const d=[];for(const c of COL){d.push({c,v:"0"});for(let k=0;k<2;k++){for(let n=1;n<=9;n++)d.push({c,v:String(n)});for(const a of ["salta","inverti","+2"])d.push({c,v:a})}}
  for(let k=0;k<4;k++){d.push({c:"n",v:"jolly"});d.push({c:"n",v:"+4"})}return shuffle(d,R)}
const canUno=(card,top,color)=>card.c==="n"||card.c===color||card.v===top.v;
const labelUno=v=>({salta:"⊘",inverti:"⇄",jolly:"★","+2":"+2","+4":"+4"}[v]||v);
function unoEl(k,onclick,ok=true){const d=E("div","card u "+k.c);const ov=E("div","ov");ov.append(E("div","big",labelUno(k.v)));d.append(ov,E("div","c1",labelUno(k.v)),E("div","c2",labelUno(k.v)));
  d.title=CN[k.c]+" "+k.v;if(!ok)d.classList.add("no");if(onclick&&ok)d.onclick=onclick;return d}
const nxt=(S,steps)=>((S.cur+S.dir*steps)%S.n+S.n*4)%S.n;
function pesca(S){if(!S.D.length&&S.pile.length>1){const keep=S.pile.pop();S.D=shuffle(S.pile.splice(0),S.R);S.pile.push(keep)}return S.D.pop()||null}
function bestColor(h){const n={r:0,g:0,v:0,b:0};for(const k of h)if(k.c!=="n")n[k.c]++;return COL.slice().sort((a,b)=>n[b]-n[a])[0]}
register({id:"uno",nome:"Uno",ic:"🃏",sub:"Resta senza carte per primo",min:2,max:5,
  tut:[["🃏","Lo scopo","Vince chi resta per primo senza carte. Ognuno parte con 7 carte. Si gioca in 2, 3, 4 o 5."],
       ["🟥🟦","Come si gioca","Al tuo turno metti sul mazzo una carta dello stesso colore oppure con lo stesso numero o simbolo. Se non puoi, o non vuoi, peschi una carta (e se va bene puoi giocarla subito oppure passare)."],
       ["⊘⇄+2","Le carte speciali","⊘ Salta: il giocatore dopo di te salta il turno. ⇄ Inverti: cambia il verso del giro (in due giocatori funziona come Salta). +2: chi viene dopo pesca 2 carte e salta il turno. ★ Jolly: scegli tu il colore. +4: scegli il colore e chi viene dopo pesca 4 carte e salta il turno."],
       ["📣","UNO!","Quando stai per restare con una sola carta, premi «UNO!» prima di giocare la penultima. Se te ne dimentichi, peschi 2 carte di penalità."]],
  init(n,seed){const R=mulberry(seed);let D=deckUno(R);const hands=[];for(let i=0;i<n;i++){hands.push([]);for(let k=0;k<7;k++)hands[i].push(D.pop())}
    let top=D.pop();while(top.c==="n"){D.unshift(top);top=D.pop()}
    return {n,hands,D,pile:[top],top,color:top.c,dir:1,cur:0,drawn:-1,win:-1,R,ev:null}},
  turn(S){return S.cur},
  legal(S,seat){const h=S.hands[seat];const out=[];const idx=S.drawn>=0?[S.drawn]:h.map((_,i)=>i);
    for(const i of idx){const k=h[i];if(!canUno(k,S.top,S.color))continue;
      for(const col of (k.c==="n"?COL:[null])){out.push({k:`p${i}${col?"c"+col:""}`,i,col,u:false});if(h.length===2)out.push({k:`p${i}${col?"c"+col:""}u`,i,col,u:true})}}
    out.push(S.drawn>=0?{k:"pass"}:{k:"draw"});return out},
  apply(S,seat,a){const h=S.hands[seat];
    if(a.k==="draw"){const c=pesca(S);if(!c){S.ev={seat,t:"vuoto"};S.cur=nxt(S,1);return S}h.push(c);
      if(canUno(c,S.top,S.color)){S.drawn=h.length-1;S.ev={seat,t:"pesca-ok"}}else{S.drawn=-1;S.ev={seat,t:"pesca"};S.cur=nxt(S,1)}return S}
    if(a.k==="pass"){S.drawn=-1;S.ev={seat,t:"passa"};S.cur=nxt(S,1);return S}
    const card=h.splice(a.i,1)[0];S.drawn=-1;S.pile.push(card);S.top=card;S.color=card.c==="n"?a.col:card.c;
    const ev={seat,t:"gioca",card,col:S.color,pen:false,vit:-1,n:0};S.ev=ev;
    if(h.length===1&&!a.u){const x=pesca(S),y=pesca(S);if(x)h.push(x);if(y)h.push(y);ev.pen=true}
    if(!h.length){S.win=seat;return S}
    const v=card.v;
    if(v==="salta"){S.cur=nxt(S,2)}
    else if(v==="inverti"){S.dir=-S.dir;S.cur=S.n===2?seat:nxt(S,1)}
    else if(v==="+2"||v==="+4"){const vit=nxt(S,1);ev.vit=vit;ev.n=v==="+2"?2:4;for(let k=0;k<ev.n;k++){const c=pesca(S);if(c)S.hands[vit].push(c)}S.cur=nxt(S,2)}
    else S.cur=nxt(S,1);
    return S},
  over(S){return S.win>=0?{win:[S.win],text:seats=>`${seats[S.win].nome} ha finito le carte!`}:null},
  bot(S,seat,lv){const h=S.hands[seat];const lg=this.legal(S,seat);const pl=lg.filter(a=>a.i!==undefined);
    if(!pl.length)return lg.map(a=>({a,f:{valore:0}}));
    let c=pl.filter(a=>h.length!==2||a.u);if(h.length===2&&lv===0&&Math.random()<.25)c=pl.filter(a=>!a.u);
    const nx=S.hands[nxt(S,1)].length;const few=1/Math.max(1,nx),maj=bestColor(h);
    return c.map(a=>{const k=h[a.i];const rest=h.filter((_,j)=>j!==a.i);const act=["+2","+4","salta","inverti"].includes(k.v);const col=k.c==="n"?a.col:k.c;
      return {a,f:{valore:(+k.v||0)/9*.5,punti:act?.4:0,attacco:(k.v==="+4"?1:k.v==="+2"?.7:act?.4:0)*few*2,conserva:k.c==="n"?-.7:0,
        posizione:(col===maj?.5:0)+rest.filter(r=>r.c===col).length/10,futuro:rest.filter(r=>r.c===col||r.c==="n").length/8,
        finale:h.length<=2?(act?1:.2):0,rischio:0,difesa:nx<=2&&k.v==="+4"?.8:0}}})},
  msgTurno(S,ctx,seat){return S.drawn>=0?"Hai pescato una carta che va bene: giocala oppure premi «Passa»":"Tocca a te: gioca una carta dello stesso colore o numero"+(S.top.c==="n"?" · colore scelto: "+CN[S.color]:"")},
  view(sh,ctx){
    css();let uno=false,pend=-1;
    const opps=E("div","opps"),mid=E("div","table"),mine=E("div","hand"),ctl=E("div","row"),ev=E("div","msg");ctl.style.justifyContent="center";
    sh.g.append(opps,ev,mid,E("small","","Le tue carte"),mine,ctl);
    const evText=(S,c)=>{const e=S.ev;if(!e)return "";const who=e.seat===c.me?"Tu":nm(c,e.seat);
      if(e.t==="gioca")return `${who} ${e.seat===c.me?"hai giocato":"ha giocato"} ${labelUno(e.card.v)} ${CN[e.card.c]}${e.card.c==="n"?" → "+CN[e.col]:""}`+(e.vit>=0?` · ${e.vit===c.me?"peschi":nm(c,e.vit)+" pesca"} ${e.n} carte`:"")+(e.pen?` · ${who} dimentica UNO: +2 carte`:"")+(S.hands[e.seat]&&S.hands[e.seat].length===1?" · «UNO!»":"");
      if(e.t==="pesca"||e.t==="pesca-ok")return `${who} ${e.seat===c.me?"hai pescato":"ha pescato"}`;if(e.t==="passa")return `${who} ${e.seat===c.me?"passi":"passa"}`;return ""};
    return {draw(S,c){
      opps.innerHTML="";S.hands.forEach((h,s)=>{if(s===c.me)return;const o=E("div","opp");o.append(E("span","",`${nm(c,s)} · ${h.length} carte`));const hd=E("div","hand sm");h.forEach(()=>hd.append(E("div","card uback")));o.append(hd);opps.append(o)});
      ev.textContent=evText(S,c);
      mid.innerHTML="";mid.append(unoEl(S.top));const cc=E("div","");cc.style.cssText="align-self:center;color:#fff;font-weight:700";cc.textContent="Colore: "+CN[S.color]+(S.dir===1?" · giro ↻":" · giro ↺");mid.append(cc);
      const dk=E("div","card uback");dk.title="Mazzo: "+S.D.length;mid.append(dk);
      const my=S.hands[c.me];const myTurn=c.legal.length>0;
      mine.innerHTML="";my.forEach((k,i)=>{const ok=myTurn&&c.legal.some(a=>a.i===i);
        mine.append(unoEl(k,()=>{const needU=uno&&my.length===2;
          if(k.c==="n"){pend=i;this.draw(S,c);return}
          if(c.act(`p${i}${needU?"u":""}`)){uno=false;pend=-1}},ok))});
      ctl.innerHTML="";
      if(!myTurn||S.win>=0)return;
      if(pend>=0&&c.legal.some(a=>a.i===pend)){ctl.append(E("span","","Scegli il colore:"));
        for(const col of COL){const b=E("button","btn","");b.style.background={r:"#e2463c",g:"#f2c230",v:"#33a65a",b:"#2f6fd6"}[col];b.style.color=col==="g"?"#222":"#fff";b.textContent=CN[col];b.dataset.col=col;
          b.onclick=()=>{const needU=uno&&my.length===2;const i=pend;if(c.act(`p${i}c${col}${needU?"u":""}`)){uno=false;pend=-1}};ctl.append(b)}return}
      const dr=c.legal.find(a=>a.k==="draw"),ps=c.legal.find(a=>a.k==="pass");
      if(dr){const b=E("button","btn ghost","🂠 Pesca");b.id="unoPesca";b.onclick=()=>{pend=-1;c.act("draw")};ctl.append(b)}
      if(ps){const b=E("button","btn ghost","Passa");b.id="unoPassa";b.onclick=()=>c.act("pass");ctl.append(b)}
      const ub=E("button","btn"+(uno?"":" ghost"),uno?"UNO! ✓":"📣 UNO!");ub.id="unoBtn";ub.disabled=my.length>2;ub.onclick=()=>{uno=!uno;this.draw(S,c)};ctl.append(ub)}}}
});

// =================================================================================================== carte italiane (disegnate qui, senza immagini)
const SEMI=["denari","coppe","spade","bastoni"],ICO={denari:"🪙",coppe:"🏆",spade:"🗡️",bastoni:"🪵"},TINT={denari:"#a8760b",coppe:"#b3261e",spade:"#27508f",bastoni:"#2c6e31"};
const NOME=v=>({1:"A",8:"F",9:"C",10:"R"}[v]||String(v));
const NOMEL=v=>({1:"Asso",8:"Fante",9:"Cavallo",10:"Re"}[v]||String(v));
const SIMBOLI=`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="sy-denari" viewBox="-10 -10 20 20"><circle r="9" fill="#e8b923" stroke="#8a5a00" stroke-width="1"/><circle r="5.5" fill="#d9531e" stroke="#8a5a00" stroke-width=".8"/><circle r="2" fill="#f7d35c"/></symbol>
<symbol id="sy-coppe" viewBox="-10 -10 20 20"><path d="M-7 -8H7C7 0 3 3 1 4V7H5V9H-5V7H-1V4C-3 3 -7 0 -7 -8Z" fill="#c8342b" stroke="#6b1210" stroke-width="1"/><path d="M-5 -6H5" stroke="#f3b7a8" stroke-width="1.2"/></symbol>
<symbol id="sy-spade" viewBox="-10 -10 20 20"><path d="M0 -9C3 -4 3 3 0 7C-3 3 -3 -4 0 -9Z" fill="#9fb7d9" stroke="#1d3d73" stroke-width="1"/><path d="M-5 5H5" stroke="#1d3d73" stroke-width="2"/><path d="M0 5V9" stroke="#1d3d73" stroke-width="2"/></symbol>
<symbol id="sy-bastoni" viewBox="-10 -10 20 20"><path d="M-2.5 -9C2 -10 3.5 -6 2.5 -3L2 8C1 10 -1 10 -2 8L-2.5 -3C-3.5 -6 -4 -8 -2.5 -9Z" fill="#7a9c3b" stroke="#2c4a12" stroke-width="1"/><circle cx="0" cy="-3" r="1.2" fill="#2c4a12"/><circle cx="0" cy="2" r="1.2" fill="#2c4a12"/></symbol>
</defs></svg>`;
const PIPS={1:[[30,50,22]],2:[[30,24,13],[30,76,13]],3:[[30,22,12],[30,50,12],[30,78,12]],4:[[18,24,12],[42,24,12],[18,76,12],[42,76,12]],
  5:[[18,24,12],[42,24,12],[30,50,12],[18,76,12],[42,76,12]],6:[[18,22,12],[42,22,12],[18,50,12],[42,50,12],[18,78,12],[42,78,12]],
  7:[[18,22,11],[42,22,11],[30,36,11],[18,52,11],[42,52,11],[18,80,11],[42,80,11]]};
function itaSvg(k){
  if(!document.getElementById("itaSym")){const d=E("div");d.id="itaSym";d.innerHTML=SIMBOLI;d.style.cssText="position:absolute;width:0;height:0;overflow:hidden";document.body.append(d)}
  const col=TINT[k.s];let body="";
  if(k.v<=7)for(const [x,y,s] of PIPS[k.v])body+=`<use href="#sy-${k.s}" x="${x-s}" y="${y-s}" width="${2*s}" height="${2*s}"/>`;
  else{const fig=k.v===8?"🧑":k.v===9?"🐴":"👑";
    body+=`<rect x="8" y="14" width="44" height="64" rx="5" fill="${col}" opacity=".13" stroke="${col}" stroke-width="1.2"/><text x="30" y="55" font-size="30" text-anchor="middle">${fig}</text><use href="#sy-${k.s}" x="19" y="62" width="22" height="22"/>`}
  return `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="56" height="96" rx="4" fill="none" stroke="${col}" stroke-width="1.4"/>${body}<text x="7" y="13" font-size="10" font-weight="700" fill="${col}">${NOME(k.v)}</text><text x="53" y="94" font-size="10" font-weight="700" fill="${col}" text-anchor="end">${NOME(k.v)}</text></svg>`}
function itaEl(k,onclick,ok=true){const d=E("div","card ita");d.innerHTML=itaSvg(k);d.title=NOMEL(k.v)+" di "+k.s;if(!ok)d.classList.add("no");if(onclick&&ok)d.onclick=onclick;return d}
function mazzo(R,senza){const d=[];for(const s of SEMI)for(let v=1;v<=10;v++)if(!(senza&&senza.s===s&&senza.v===v))d.push({s,v});return shuffle(d,R)}

// =================================================================================================== SCOPA (2, 3 o 4 giocatori; in 4 si gioca a squadre)
const PRIM={7:21,6:18,1:16,5:15,4:14,3:13,2:12,8:10,9:10,10:10};
function prese(tavolo,v){const s=tavolo.map((k,i)=>({k,i})).filter(x=>x.k.v===v);if(s.length)return s.map(x=>[x.i]);
  const out=[],n=tavolo.length;for(let m=1;m<(1<<n);m++){let sum=0,ids=[];for(let i=0;i<n;i++)if(m&(1<<i)){sum+=tavolo[i].v;ids.push(i)}if(sum===v&&ids.length>1)out.push(ids)}return out}
function primiera(cs){let t=0;for(const s of SEMI){const m=Math.max(0,...cs.filter(k=>k.s===s).map(k=>PRIM[k.v]));if(!m)return 0;t+=m}return t}
const entScopa=(S,seat)=>S.n===4?seat%2:seat;
const nEnt=S=>S.n===4?2:S.n;
function punteggioScopa(S){const E_=nEnt(S);const bag=Array.from({length:E_},()=>[]);S.prese.forEach((p,s)=>bag[entScopa(S,s)].push(...p));
  const pt=Array(E_).fill(0),det=[];
  const piu=(vals,txt)=>{const m=Math.max(...vals);const w=vals.map((v,i)=>v===m?i:-1).filter(i=>i>=0);if(w.length===1&&m>0){pt[w[0]]++;det.push([w[0],txt])}};
  piu(bag.map(b=>b.length),"carte");piu(bag.map(b=>b.filter(k=>k.s==="denari").length),"denari");
  bag.forEach((b,i)=>{if(b.some(k=>k.s==="denari"&&k.v===7)){pt[i]++;det.push([i,"settebello"])}});
  piu(bag.map(primiera),"primiera");
  S.scope.forEach((x,s)=>{if(x){pt[entScopa(S,s)]+=x;det.push([entScopa(S,s),x+" scop"+(x>1?"e":"a")])}});
  return {pt,det}}
function nuovaSmazzata(S){S.D=mazzo(S.R);S.tav=[S.D.pop(),S.D.pop(),S.D.pop(),S.D.pop()];S.hands=Array.from({length:S.n},()=>[]);S.prese=Array.from({length:S.n},()=>[]);S.scope=Array(S.n).fill(0);S.last=-1;
  deal(S);S.cur=S.giro%S.n}
function deal(S){for(let i=0;i<3;i++)for(let s=0;s<S.n;s++)S.hands[s].push(S.D.pop())}
register({id:"scopa",nome:"Scopa",ic:"🧹",sub:"Carte italiane: prendi, fai scopa, arriva a 11",min:2,max:4,
  tut:[["🧹","Lo scopo","Si gioca con 40 carte italiane (denari 🪙, coppe 🏆, spade 🗡️, bastoni 🪵). Vince chi arriva per primo a 11 punti, in più smazzate. In 4 si gioca a squadre: tu e chi ti siede di fronte."],
       ["🃏","Prendere","Giochi una carta: se sul tavolo c'è una carta con lo stesso valore la prendi (Fante=8, Cavallo=9, Re=10). Altrimenti puoi prendere più carte che sommate fanno il suo valore. Se non prendi niente, la carta resta sul tavolo."],
       ["✨","Scopa!","Se prendi tutte le carte del tavolo fai «scopa»: un punto in più. Attenzione a non lasciare sul tavolo carte che l'avversario può prendere tutte insieme."],
       ["🏅","I punti","A fine smazzata: 1 punto a chi ha più carte, 1 a chi ha più denari, 1 per il settebello (7 di denari), 1 per la primiera (i migliori 7, 6 e assi di ogni seme), più le scope."]],
  init(n,seed){const S={n,R:mulberry(seed),tot:Array(n===4?2:n).fill(0),giro:0,msg:null,fin:null};nuovaSmazzata(S);return S},
  turn(S){return S.cur},
  legal(S,seat){const out=[];S.hands[seat].forEach((k,i)=>{const op=prese(S.tav,k.v);if(op.length)op.forEach(o=>out.push({k:`p${i}:${o.join(",")}`,i,opt:o}));else out.push({k:`p${i}:`,i,opt:null})});return out},
  apply(S,seat,a){const h=S.hands[seat];const k=h.splice(a.i,1)[0];S.msg=null;const ev={seat,card:k,opt:null,scopa:false};S.ev=ev;
    if(a.opt){const taken=a.opt.map(i=>S.tav[i]);S.tav=S.tav.filter((_,i)=>!a.opt.includes(i));S.prese[seat].push(k,...taken);S.last=seat;ev.opt=taken;
      const ultima=!S.D.length&&S.hands.every(x=>!x.length);if(!S.tav.length&&!ultima){S.scope[seat]++;ev.scopa=true}}
    else S.tav.push(k);
    S.cur=(seat+1)%S.n;
    if(S.hands.every(x=>!x.length)){
      if(S.D.length)deal(S);
      else{if(S.tav.length&&S.last>=0){S.prese[S.last].push(...S.tav);S.tav=[]}
        const r=punteggioScopa(S);r.pt.forEach((x,i)=>S.tot[i]+=x);S.msg={pt:r.pt,det:r.det};
        const m=Math.max(...S.tot);const w=S.tot.map((v,i)=>v===m?i:-1).filter(i=>i>=0);
        if(m>=11&&w.length===1)S.fin=w[0];else{S.giro++;nuovaSmazzata(S)}}}
    return S},
  over(S){if(S.fin==null)return null;const e=S.fin;const win=[];for(let s=0;s<S.n;s++)if(entScopa(S,s)===e)win.push(s);
    return {win,text:seats=>`${win.map(s=>seats[s].nome).join(" e ")} ${win.length>1?"vincono":"vince"} ${S.tot[e]} a ${Math.max(0,...S.tot.filter((_,i)=>i!==e))}`}},
  bot(S,seat,lv){const h=S.hands[seat];const cands=[];const D=S.D;
    this.legal(S,seat).forEach(a=>{const k=h[a.i];const taken=a.opt?a.opt.map(j=>S.tav[j]):[];const resto=a.opt?S.tav.filter((_,j)=>!a.opt.includes(j)):[...S.tav,k];const somma=resto.reduce((x,y)=>x+y.v,0);
      const tutti=[k,...taken];const settebello=a.opt&&tutti.some(x=>x.s==="denari"&&x.v===7);
      cands.push({a,f:{punti:a.opt?(taken.length+1)/5+tutti.filter(x=>x.s==="denari").length*.15:0,attacco:(a.opt&&!resto.length)?1.4:0,
        rischio:(resto.length&&somma<=10)?.8:(resto.length===1?.3:0),conserva:(!a.opt&&(k.v===7||k.s==="denari"))?-.6:0,
        valore:(settebello?1.2:0)+(a.opt?tutti.reduce((x,y)=>x+(y.v===7?.3:y.v===6?.15:0),0):0),posizione:0,futuro:!a.opt?(1-k.v/10)*.3:0,
        finale:!D.length&&a.opt?.4:0,difesa:0}})});
    return cands},
  msgTurno(S,ctx){return "Tocca a te: gioca una carta"},
  view(sh,ctx){
    css();const sc=E("div","score"),opps=E("div","opps"),tav=E("div","table"),mine=E("div","hand"),ctl=E("div","row"),ev=E("div","msg");ctl.style.justifyContent="center";
    sh.g.append(sc,opps,ev,tav,E("small","","Le tue carte"),mine,ctl);
    const entName=(c,e)=>c.n===4?(e===entScopa({n:4},c.me)?"La tua squadra":"Squadra avversaria"):(nm(c,e)+(e===c.me?" (tu)":""));
    let pick=-1;
    return {draw(S,c){
      sc.innerHTML="";S.tot.forEach((v,e)=>sc.append(E("b","",`${entName(c,e)}: ${v}`)));sc.append(E("b","",`Mazzo ${S.D.length}`));
      sc.append(E("b","","Scope: "+S.scope.map((x,s)=>`${nm(c,s)} ${x}`).join(" · ")));
      opps.innerHTML="";S.hands.forEach((h,s)=>{if(s===c.me)return;const o=E("div","opp");o.append(E("span","",nm(c,s)));const hd=E("div","hand sm");h.forEach(()=>hd.append(E("div","card itaback")));o.append(hd);opps.append(o)});
      let t="";if(S.msg){t="Fine smazzata: "+S.msg.pt.map((p,e)=>`${entName(c,e)} +${p}`).join(", ")+" ("+S.msg.det.map(d=>entName(c,d[0])+": "+d[1]).join(", ")+")"}
      else if(S.ev){const e=S.ev;const who=e.seat===c.me?"Tu":nm(c,e.seat);t=who+" "+(e.opt?(e.scopa?"fa SCOPA! ✨ ":"prende ")+e.opt.map(x=>NOMEL(x.v)).join(" + ")+" con "+NOMEL(e.card.v)+" di "+e.card.s:"posa "+NOMEL(e.card.v)+" di "+e.card.s)}
      ev.textContent=t;
      tav.innerHTML="";S.tav.forEach(k=>tav.append(itaEl(k)));if(!S.tav.length)tav.append(E("span","","(tavolo vuoto)"));
      mine.innerHTML="";const my=S.hands[c.me];my.forEach((k,i)=>mine.append(itaEl(k,()=>{
        const vs=c.legal.filter(a=>a.i===i);if(vs.length===1){pick=-1;c.act(vs[0].k)}else if(vs.length>1){pick=i;this.draw(S,c)}},c.legal.some(a=>a.i===i))));
      ctl.innerHTML="";
      if(pick>=0){const vs=c.legal.filter(a=>a.i===pick);ctl.append(E("span","","Cosa prendi?"));
        vs.forEach((a,j)=>{const b=E("button","btn ghost",a.opt.map(x=>NOMEL(S.tav[x].v)+" "+ICO[S.tav[x].s]).join(" + "));b.dataset.opt=String(j);b.onclick=()=>{pick=-1;c.act(a.k)};ctl.append(b)})}}}}
});

// =================================================================================================== BRISCOLA (da 2 a 5 giocatori; in 4 a squadre)
const FORZA={1:10,3:9,10:8,9:7,8:6,7:5,6:4,5:3,4:2,2:1},PUNTI={1:11,3:10,10:4,9:3,8:2};
const pt=k=>PUNTI[k.v]||0;
const entBr=(S,s)=>S.n===4?s%2:s;
function vincitoreMano(S){let w=0;for(let i=1;i<S.tavolo.length;i++){const a=S.tavolo[w].k,b=S.tavolo[i].k;
  if(a.s===b.s){if(FORZA[b.v]>FORZA[a.v])w=i}else if(b.s===S.br.s)w=i}return S.tavolo[w].seat}
register({id:"briscola",nome:"Briscola",ic:"🎴",sub:"Carte italiane: fai più punti",min:2,max:5,
  tut:[["🎴","Lo scopo","Si gioca con 40 carte italiane. Ognuno ha 3 carte. La carta girata sotto il mazzo è la «briscola»: il suo seme batte tutti gli altri."],
       ["⚔️","La mano","Ognuno gioca una carta. Vince la carta più forte dello stesso seme della prima, oppure una briscola. Se il seme è diverso e nessuno gioca briscola, vince chi ha giocato per primo."],
       ["🔢","Forza e punti","Ordine di forza: Asso, 3, Re, Cavallo, Fante, 7, 6, 5, 4, 2. Punti: Asso 11, 3 vale 10, Re 4, Cavallo 3, Fante 2, le altre 0. In tutto ci sono 120 punti."],
       ["🏆","Chi vince","Chi vince la mano prende le carte, pesca per primo e gioca la mano dopo. In 2 vince chi ha più di 60 punti. In 4 si gioca a squadre (tu e chi ti siede di fronte). In 3 e in 5 ognuno gioca per sé e vince chi fa più punti."]],
  init(n,seed){const R=mulberry(seed);const D=mazzo(R,n===3?{s:"coppe",v:2}:null);const br=D[0];const hands=[];for(let i=0;i<n;i++){hands.push([]);for(let k=0;k<3;k++)hands[i].push(D.pop())}
    return {n,D,br,hands,pts:Array(n).fill(0),tavolo:[],cur:0,ev:null,R}},
  turn(S){return S.cur},
  legal(S,seat){return S.hands[seat].map((k,i)=>({k:"p"+i,i}))},
  apply(S,seat,a){const k=S.hands[seat].splice(a.i,1)[0];S.tavolo.push({seat,k});S.ev={seat,card:k,presa:null};
    if(S.tavolo.length<S.n){S.cur=(seat+1)%S.n;return S}
    const w=vincitoreMano(S);const p=S.tavolo.reduce((x,y)=>x+pt(y.k),0);S.pts[w]+=p;S.ev.presa={w,p,carte:S.tavolo.slice()};S.tavolo=[];
    for(let j=0;j<S.n;j++){const s=(w+j)%S.n;if(S.D.length)S.hands[s].push(S.D.pop())}
    S.cur=w;return S},
  over(S){if(!S.hands.every(h=>!h.length)||S.D.length)return null;
    if(S.n===2){const [a,b]=S.pts;return a>60?{win:[0],text:seats=>`${seats[0].nome} vince ${a} a ${b}`}:b>60?{win:[1],text:seats=>`${seats[1].nome} vince ${b} a ${a}`}:{win:[],text:"60 a 60: pareggio"}}
    if(S.n===4){const t=[S.pts[0]+S.pts[2],S.pts[1]+S.pts[3]];if(t[0]===t[1])return {win:[],text:"60 a 60: pareggio"};const e=t[0]>t[1]?0:1;const win=[e,e+2];return {win,text:seats=>`${seats[win[0]].nome} e ${seats[win[1]].nome} vincono ${t[e]} a ${t[1-e]}`}}
    const m=Math.max(...S.pts);const win=S.pts.map((v,i)=>v===m?i:-1).filter(i=>i>=0);
    return {win,text:seats=>`${win.map(s=>seats[s].nome).join(" e ")} ${win.length>1?"pareggiano":"vince"} con ${m} punti`}},
  bot(S,seat,lv){const h=S.hands[seat];const resp=S.tavolo.length>0;
    let cur=null;if(resp){let w=0;for(let i=1;i<S.tavolo.length;i++){const a=S.tavolo[w].k,b=S.tavolo[i].k;if(a.s===b.s){if(FORZA[b.v]>FORZA[a.v])w=i}else if(b.s===S.br.s)w=i}cur=S.tavolo[w].k}
    const sulTavolo=S.tavolo.reduce((x,y)=>x+pt(y.k),0);const last=S.D.length===0;
    return h.map((k,i)=>{const isB=k.s===S.br.s;const a={k:"p"+i,i};
      if(resp){const win=(cur.s===k.s?FORZA[k.v]>FORZA[cur.v]:isB);const p=sulTavolo+pt(k);
        return {a,f:{valore:win?p/21:-p/21,punti:win?p/11:0,attacco:win&&sulTavolo>=10?1:0,conserva:(isB?-.5:0)-(pt(k)>=10&&!win?.8:0),rischio:!win?pt(k)/11:0,
          difesa:win&&isB&&sulTavolo>=3?.6:0,posizione:0,futuro:-(FORZA[k.v]/10)*.3,finale:last&&win?.5:0}}}
      return {a,f:{valore:-pt(k)/11,punti:0,attacco:0,conserva:(isB?-.6:0)-(pt(k)>=10?.7:0),rischio:pt(k)/11*.8,difesa:0,posizione:0,futuro:-(FORZA[k.v]/10)*.2,finale:0}}})},
  msgTurno(S,ctx){return `Tocca a te: gioca una carta (la briscola è ${S.br.s} ${ICO[S.br.s]})`},
  pausa(S,a,seat){return S.ev&&S.ev.presa?900:450},
  view(sh,ctx){
    css();const sc=E("div","score"),opps=E("div","opps"),tav=E("div","table"),mine=E("div","hand"),ev=E("div","msg");
    sh.g.append(sc,opps,ev,tav,E("small","","Le tue carte"),mine);
    return {draw(S,c){
      sc.innerHTML="";
      if(S.n===4){sc.append(E("b","",`La tua squadra ${S.pts[c.me%2]+S.pts[c.me%2+2]}`),E("b","",`Avversari ${S.pts[1-c.me%2]+S.pts[1-c.me%2+2]}`))}
      else S.pts.forEach((p,s)=>sc.append(E("b","",`${nm(c,s)}${s===c.me?" (tu)":""} ${p}`)));
      sc.append(E("b","",`Mazzo ${S.D.length}`),E("b","",`Briscola: ${ICO[S.br.s]} ${S.br.s}`));
      opps.innerHTML="";S.hands.forEach((h,s)=>{if(s===c.me)return;const o=E("div","opp");o.append(E("span","",nm(c,s)));const hd=E("div","hand sm");h.forEach(()=>hd.append(E("div","card itaback")));o.append(hd);opps.append(o)});
      tav.innerHTML="";
      if(S.D.length){const b=itaEl(S.br);b.style.transform="rotate(90deg) scale(.8)";b.style.opacity=".9";tav.append(b)}
      S.tavolo.forEach(x=>{const w=E("div","played");w.append(itaEl(x.k),E("div","who",x.seat===c.me?"Tu":nm(c,x.seat)));tav.append(w)});
      const e=S.ev;let t="";if(e){if(e.presa){const wn=e.presa.w===c.me?"Prendi tu":"Prende "+nm(c,e.presa.w);t=wn+(e.presa.p?` (${e.presa.p} punti)`:"")}else t=(e.seat===c.me?"Tu hai giocato ":nm(c,e.seat)+" ha giocato ")+NOMEL(e.card.v)+" di "+e.card.s}
      ev.textContent=t;
      mine.innerHTML="";S.hands[c.me].forEach((k,i)=>mine.append(itaEl(k,()=>c.act("p"+i),c.legal.some(a=>a.i===i))))}}}
});
window.__CARTE={prese,primiera,vincitoreMano,FORZA,PUNTI};
})();
