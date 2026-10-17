// SCACCHI e DAMA sul motore dei giochi di Natan (giochi.js)
(function(){
"use strict";
const {E,register}=window.__G;
const desktop=()=>{try{return matchMedia("(min-width:900px)").matches}catch(e){return false}};
// ---- logica scacchi
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
const MARGINE=[260,120,60,40],NMAX=[9,8,7,6];
function bestLv(S,lv){
  const t0=Date.now();let d=[1,2,desktop()?3:2,desktop()?3:2][lv];let c=bestMoves(S,d);
  if(lv===3&&desktop()&&Date.now()-t0<350)c=bestMoves(S,4);       // «estremo»: se il computer è veloce, un livello in più
  return c}
register({id:"scacchi",nome:"Scacchi",ic:"♟️",sub:"Il classico: dai scacco matto al re",min:2,max:2,
  tut:[["♔","Lo scopo","Devi dare scacco matto: attaccare il re avversario in modo che non possa più scappare. Chi crea la partita ha i pezzi bianchi e muove per primo."],
       ["♙♘","I pezzi","Pedone: avanti di 1 (di 2 alla prima mossa), mangia in diagonale. Cavallo: a «L», salta gli altri pezzi. Alfiere: in diagonale. Torre: dritto. Regina: dritto e in diagonale. Re: di 1 in ogni direzione."],
       ["👆","Come si muove","Tocca un tuo pezzo: i puntini mostrano dove può andare, i cerchi dove può mangiare. Poi tocca la casella. Il pedone che arriva in fondo diventa regina."],
       ["🏰","Mosse speciali","Arrocco: tocca il re e poi la casella a due passi verso la torre. Ci sono anche la presa «en passant» e lo stallo (se chi deve muovere non ha mosse ma non è sotto scacco, è pareggio)."]],
  init(n,seed){return start()},
  turn(S){return S.turn==="w"?0:1},
  legal(S,seat){return legal(S).map(m=>Object.assign(m,{k:m.f+"-"+m.t}))},
  apply(S,seat,a){const N=make(S,a);N.last=[a.f,a.t];return N},
  over(S){const ms=legal(S);
    if(!ms.length){if(inCheck(S,S.turn==="w")){const win=S.turn==="w"?1:0;return {win:[win],text:seats=>`Scacco matto! Vince ${seats[win].nome}`}}return {win:[],text:"Stallo: pareggio"}}
    if(S.b.filter(Boolean).length===2||S.half>=100)return {win:[],text:"Pareggio"};return null},
  bot(S,seat,lv){const keyed=legal(S).map(m=>Object.assign(m,{k:m.f+"-"+m.t}));
    const c=bestLv(S,lv);const best=c[0]?c[0].v:0;
    return c.filter(x=>x.v>=best-MARGINE[lv]).slice(0,NMAX[lv]).map(x=>({a:keyed.find(m=>m.k===x.m.f+"-"+x.m.t),f:x.f}))},
  msgTurno(S,ctx){return (inCheck(S,S.turn==="w")?"Scacco! ":"")+"Tocca a te: muovi un pezzo "+(ctx.me===0?"bianco":"nero")},
  view(sh,ctx){
    let sel=-1;const board=E("div","board");sh.g.append(board);
    const draw=(S,c)=>{board.innerHTML="";const flip=c.me===1;const ms=sel>=0?c.legal.filter(m=>m.f===sel):[];
      for(let d=0;d<64;d++){const i=flip?63-d:d;const [r,cc]=rc(i);const el=E("div","sq "+((r+cc)%2?"d":"l"));el.dataset.sq=sqName(i);
        if(i===sel)el.classList.add("sel");if(S.last&&S.last.includes(i))el.classList.add("last");
        const m=ms.find(x=>x.t===i);if(m)el.classList.add(m.cap||m.ep?"cap":"mv");
        const p=S.b[i];if(p){el.append(E("span",isW(p)?"pw":"pb",GL[p.toLowerCase()]+"\uFE0E"))}
        el.onclick=()=>{
          if(sel>=0){const mm=c.legal.find(x=>x.f===sel&&x.t===i);if(mm){sel=-1;c.act(mm.k);return}}
          const mine=c.legal.some(x=>x.f===i);sel=mine?i:-1;draw(c.S,c)};
        board.append(el)}};
    return {draw(S,c){if(!c.legal.length)sel=-1;draw(S,c)}}}
});
window.__CHESSAPI={bestLv};
})();

// ---- dama italiana
(function(){
"use strict";
const {E,register}=window.__G;
const desktop=()=>{try{return matchMedia("(min-width:900px)").matches}catch(e){return false}};
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

const key=m=>m.path.join("-");
register({id:"dama",nome:"Dama",ic:"⚪",sub:"Dama italiana: la presa è obbligatoria",min:2,max:2,
  tut:[["⚪⚫","Lo scopo","Mangia tutte le pedine dell'avversario o bloccalo così che non possa più muovere. Chi crea la partita ha le bianche e inizia."],
       ["↗️","Come si muove","Le pedine vanno avanti in diagonale di una casella, solo sulle caselle scure. Tocca una tua pedina e poi la casella dove vuoi andare."],
       ["💥","Mangiare","Se una pedina avversaria è vicina e dietro c'è una casella libera, la salti e la mangi. Se puoi mangiare DEVI farlo, e devi scegliere la presa che mangia di più. Puoi fare più salti di fila."],
       ["👑","La dama","Quando una pedina arriva in fondo diventa dama (👑): si muove e mangia anche all'indietro. Attenzione: nella dama italiana una pedina semplice non può mangiare una dama."]],
  init(n,seed){return start()},
  turn(S){return S.turn==="w"?0:1},
  legal(S,seat){return moves(S).map(m=>Object.assign(m,{k:key(m)}))},
  apply(S,seat,a){const N=make(S,a);N.last=a.path;return N},
  over(S){if(!moves(S).length){const win=S.turn==="w"?1:0;return {win:[win],text:seats=>`${seats[1-win].nome} non ha più mosse: vince ${seats[win].nome}`}}
    if(S.quiet>=80)return {win:[],text:"Troppe mosse senza prese: pareggio"};return null},
  bot(S,seat,lv){const keyed=moves(S).map(m=>Object.assign(m,{k:key(m)}));
    const d=[2,3,desktop()?5:4,desktop()?6:5][lv];const c=bestMoves(S,d);const best=c[0]?c[0].v:0;
    return c.filter(x=>x.v>=best-[120,80,50,40][lv]).map(x=>({a:keyed.find(m=>m.k===key(x.m)),f:x.f}))},
  msgTurno(S,ctx){return moves(S).some(m=>m.caps.length)?"Devi mangiare: muovi una delle pedine evidenziate in giallo":"Tocca a te: muovi una pedina "+(ctx.me===0?"bianca":"nera")},
  view(sh,ctx){
    let sel=-1;const board=E("div","board");sh.g.append(board);
    const draw=(S,c)=>{board.innerHTML="";const flip=c.me===1;const ms=sel>=0?c.legal.filter(m=>m.path[0]===sel):[];const mustFrom=new Set(c.legal.filter(m=>m.caps.length).map(m=>m.path[0]));
      for(let d=0;d<64;d++){const i=flip?63-d:d;const [r,cc]=rc(i);const el=E("div","sq "+((r+cc)%2?"d":"l"));el.dataset.sq=String(i);
        if(i===sel)el.classList.add("sel");if(S.last&&S.last.includes(i))el.classList.add("last");
        const m=ms.find(x=>x.path[x.path.length-1]===i);if(m)el.classList.add(m.caps.length?"cap":"mv");
        const p=S.b[i];if(p){const man=E("div","man "+(p.toLowerCase()==="w"?"w":"b"),king(p)?"👑":"");if(c.legal.length&&mustFrom.has(i))man.style.outline="3px solid #ffd75a";el.append(man)}
        el.onclick=()=>{
          if(sel>=0){const mm=c.legal.find(x=>x.path[0]===sel&&x.path[x.path.length-1]===i);if(mm){sel=-1;c.act(mm.k);return}}
          sel=c.legal.some(x=>x.path[0]===i)?i:-1;draw(c.S,c)};
        board.append(el)}};
    return {draw(S,c){if(!c.legal.length)sel=-1;draw(S,c)}}}
});
})();
