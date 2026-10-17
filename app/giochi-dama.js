// DAMA ITALIANA (dal Giardino Zen) sul motore dei giochi di Natan (giochi.js): regole vere, i bot ragionano con i loro 35 agenti
(function(){
"use strict";
const {E,register}=window.__G;
const Z=window.__G.zen;
const sfx=(n,a)=>{try{Z.sfx(n,a)}catch(e){}};
const DIRS_ALL=[[-1,-1],[-1,1],[1,-1],[1,1]],DIRS_W=[[-1,-1],[-1,1]],DIRS_B=[[1,-1],[1,1]];
// tavola: 64 caselle, 1 = pedina bianca, 2 = dama bianca, -1 pedina nera, -2 dama nera (il bianco muove dal basso verso l'alto)
function dmInit(){const b=new Array(64).fill(0);for(let r=0;r<8;r++)for(let c=0;c<8;c++)if((r+c)%2===0){if(r<3)b[r*8+c]=-1;else if(r>4)b[r*8+c]=1}return b}
function dmMk(b,from,path,caps,king,promote){let kc=0,fk=99;caps.forEach((m,i)=>{if(Math.abs(b[m])===2){kc++;if(fk===99)fk=i}});return {from,path,caps,byKing:king,kc,fk,promote}}
function dmJumps(b,from,side,king,dirs,cur,path,caps,out){
  const r=cur>>3,c=cur&7;let found=false;
  for(const [dr,dc] of dirs){const r2=r+2*dr,c2=c+2*dc;if(r2<0||r2>7||c2<0||c2>7)continue;
    const mid=(r+dr)*8+c+dc,land=r2*8+c2,q=b[mid];
    if(q*side>=0||(!king&&Math.abs(q)===2)||caps.includes(mid))continue;
    if(b[land]!==0&&land!==from)continue;
    found=true;const np=path.concat(land),nc=caps.concat(mid);
    if(!king&&(side===1?r2===0:r2===7)){out.push(dmMk(b,from,np,nc,king,true));continue}
    dmJumps(b,from,side,king,dirs,land,np,nc,out)}
  if(!found&&path.length)out.push(dmMk(b,from,path,caps,king,false))}
function dmMoves(b,side){
  const caps=[],quiet=[];
  for(let i=0;i<64;i++){const p=b[i];if(p*side<=0)continue;const king=Math.abs(p)===2,dirs=king?DIRS_ALL:(side===1?DIRS_W:DIRS_B);
    dmJumps(b,i,side,king,dirs,i,[],[],caps);
    if(caps.length)continue;
    const r=i>>3,c=i&7;
    for(const [dr,dc] of dirs){const r2=r+dr,c2=c+dc;if(r2<0||r2>7||c2<0||c2>7)continue;const j=r2*8+c2;if(b[j]===0)quiet.push({from:i,path:[j],caps:[],byKing:king,kc:0,fk:99,promote:!king&&(side===1?r2===0:r2===7)})}}
  if(!caps.length)return quiet;
  let m=caps;const mx=Math.max(...m.map(x=>x.caps.length));m=m.filter(x=>x.caps.length===mx);
  if(m.some(x=>x.byKing))m=m.filter(x=>x.byKing);
  const mk=Math.max(...m.map(x=>x.kc));m=m.filter(x=>x.kc===mk);
  const mf=Math.min(...m.map(x=>x.fk));return m.filter(x=>x.fk===mf)}
function dmApply(b,m){const nb=b.slice(),p=nb[m.from];nb[m.from]=0;m.caps.forEach(x=>nb[x]=0);nb[m.path[m.path.length-1]]=m.promote?2*Math.sign(p):p;return nb}
function dmEval(b){let s=0;
  for(let i=0;i<64;i++){const p=b[i];if(!p)continue;const r=i>>3,c=i&7,ctr=(c>=2&&c<=5&&r>=2&&r<=5)?6:0;
    if(p===1)s+=100+(7-r)*4+ctr+(r===7?6:0);else if(p===-1)s-=100+r*4+ctr+(r===0?6:0);else if(p===2)s+=290+ctr;else s-=290+ctr}
  return s}
function dmSearch(b,side,depth,alpha,beta,deadline){
  if(deadline&&performance.now()>deadline)throw 0;
  const moves=dmMoves(b,side);if(!moves.length)return -(100000+depth);
  if(depth<=0&&(!moves[0].caps.length||depth<-6))return side*dmEval(b);
  let best=-1e9;
  for(const m of moves){const v=-dmSearch(dmApply(b,m),-side,depth-1,-beta,-alpha,deadline);if(v>best)best=v;if(v>alpha)alpha=v;if(alpha>=beta)break}
  return best}
// valuta ogni mossa guardando sempre più avanti, finché c'è tempo
const PROF=[2,4,6,8],TEMPO=[40,130,320,650];
function valuta(b,side,moves,lv){
  let vals=moves.map(m=>side*dmEval(dmApply(b,m)));
  const deadline=performance.now()+TEMPO[lv==null?1:lv];
  for(let d=2;d<=PROF[lv==null?1:lv];d+=1){
    try{vals=moves.map(m=>-dmSearch(dmApply(b,m),-side,d-1,-1e9,1e9,deadline))}catch(e){break}}
  return vals}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mk=m=>m.from+">"+m.path.join(">");
const lato=seat=>seat===0?1:-1;
register({id:"dama",ord:4,nome:"Dama",ic:"⚪",sub:"Dama italiana: la presa è obbligatoria",min:2,max:2,
  tut:[["⚪⚫","Lo scopo","Si gioca in due sulla damiera. Il Bianco muove per primo. Perde chi non ha più mosse (o non ha più pedine)."],
       ["↗️","Come si muove","Le pedine avanzano in diagonale di una casella. Si muove solo sulle caselle scure."],
       ["🍽️","Mangiare","Mangiare è obbligatorio, e solo in avanti. Una pedina non può mangiare una dama. Se puoi scegliere, devi fare la presa più grossa; a parità conta prima la presa fatta con la dama, poi quella che mangia più dame."],
       ["♛","La dama","Una pedina che arriva in fondo diventa dama (♛) e si muove anche all'indietro. Dopo 40 mosse a testa senza prese o promozioni è patta."]],
  init(n,seed){return {b:dmInit(),turn:1,quiet:0,last:null,res:null,nm:0}},
  turn(S){return S.turn===1?0:1},
  legal(S,seat){return dmMoves(S.b,lato(seat)).map(m=>({k:mk(m),m}))},
  apply(S,seat,a){
    const m=a.m;S.b=dmApply(S.b,m);S.last=m;S.nm++;S.quiet=(m.caps.length||m.promote)?0:S.quiet+1;
    S.turn=-S.turn;
    if(!dmMoves(S.b,S.turn).length)S.res={win:[seat]};
    else if(S.quiet>=80)S.res={win:[],text:"Patta: 40 mosse a testa senza prese."};
    return S},
  over(S){return S.res?Object.assign({text:S.res.text},S.res):null},
  pausa(S,a,seat){return 450},
  msgTurno(S,ctx,seat){const ms=ctx.legal;return ms.length&&ms[0].m.caps.length?"Tocca a te: la presa è obbligatoria":"Tocca a te"},
  bot(S,seat,lv){
    const side=lato(seat),ms=dmMoves(S.b,side);if(!ms.length)return [];
    const vals=valuta(S.b,side,ms,lv);const home=side===1?7:0;
    return ms.map((m,i)=>{const nb=dmApply(S.b,m);const opp=dmMoves(nb,-side);const oc=opp.length&&opp[0].caps.length?opp[0].caps.length:0;
      const to=m.path[m.path.length-1],tr=to>>3,tc=to&7;const adv=side===1?(7-tr)/7:tr/7;
      return {a:{k:mk(m),m},f:{valore:clamp(vals[i]/400,-1,1),punti:clamp(m.caps.length/3,0,1),attacco:(m.promote?.7:0)+clamp(m.caps.length/3,0,1)*.5,
        difesa:oc===0?.5:0,rischio:-clamp(oc/2,0,1),conserva:(!m.byKing&&(m.from>>3)===home)?-.5:0,
        posizione:(tc>=2&&tc<=5&&tr>=2&&tr<=5)?.5:0,futuro:clamp(vals[i]/400,-1,1)*.8+adv*.2,finale:m.promote?1:0}}})},
  view(sh,ctx){
    const root=E("div","zsand");sh.g.append(root);
    const cnt=E("div","zwho");cnt.style.cssText="text-align:center;color:#5d6555";
    const board=E("div","zdb");board.setAttribute("role","grid");
    const tools=E("div","row");tools.style.justifyContent="center";
    const hb=E("button","btn ghost","💡 Aiuto");hb.id="dmHint";tools.append(hb);
    root.append(cnt,board,tools);
    for(let k=0;k<64;k++){const b=E("button","zsq");board.append(b)}
    let sel=null,partial=[],hint=null,visto=-1,SS=null,cc=null;
    const info=this;
    const moves=()=>cc&&cc.legal?cc.legal.map(x=>x.m):[];
    const draw=(S,c)=>{
      SS=S;cc=c;
      if(S.nm!==visto){const m=S.last;if(visto>=0&&m){sfx(m.caps.length?"dcap":"piece");if(m.promote)setTimeout(()=>sfx("king"),260)}visto=S.nm;sel=null;partial=[];hint=null}
      const flip=c.me===1;const ms=moves();const myTurn=ms.length>0&&S.turn===lato(c.me);
      const movable=new Set(ms.map(m=>m.from));
      const cand=sel!=null?ms.filter(m=>m.from===sel&&partial.every((q,i)=>m.path[i]===q)&&m.path.length>partial.length):[];
      const tg=new Set(cand.map(m=>m.path[partial.length]));
      for(let vi=0;vi<64;vi++){const btn=board.children[vi],vr=vi>>3,vc=vi&7,r=flip?7-vr:vr,c2=flip?7-vc:vc,i=r*8+c2,dark=(r+c2)%2===0,p=S.b[i];
        btn.dataset.i=String(i);let cls="zsq "+(dark?"d":"l");
        if(S.last&&(S.last.from===i||S.last.path.includes(i)))cls+=" lastm";
        if(sel===i)cls+=" sel";else if(myTurn&&movable.has(i)&&sel==null)cls+=" can";
        if(tg.has(i))cls+=" tgt";if(partial.includes(i))cls+=" path";
        if(hint&&(hint.from===i||hint.path.includes(i)))cls+=" hint";
        btn.className=cls;btn.disabled=!dark;
        btn.innerHTML=p?`<span class="zpc ${p>0?"w":"b"}">${Math.abs(p)===2?"♛":""}</span>`:"";
        btn.setAttribute("aria-label",`${"ABCDEFGH"[c2]}${8-r}${p?(p>0?" bianco":" nero")+(Math.abs(p)===2?" dama":""):""}`)}
      const n=v=>S.b.filter(x=>Math.sign(x)===v).length;
      cnt.textContent=`Bianchi ${n(1)} · Neri ${n(-1)}`+(c.me===0?" · tu sei il Bianco":" · tu sei il Nero")};
    board.addEventListener("click",e=>{
      const btn=e.target.closest(".zsq");if(!btn||!SS||!cc)return;const S=SS,c=cc,ms=moves();if(!ms.length||S.turn!==lato(c.me))return;
      const i=+btn.dataset.i;hint=null;
      if(sel!=null){const cand=ms.filter(m=>m.from===sel&&partial.every((q,k)=>m.path[k]===q)&&m.path[partial.length]===i);
        if(cand.length){if(cand[0].path.length===partial.length+1){const m=cand[0];sel=null;partial=[];c.act(mk(m))}else{partial.push(i);sfx("lift");draw(S,c)}return}}
      if(ms.some(m=>m.from===i)){sel=i;partial=[];sfx("lift");draw(S,c);return}
      if(S.b[i]*lato(c.me)>0){sfx("blocked");sh.status.textContent=ms[0].caps.length?"Devi mangiare: scegli una pedina evidenziata.":"Questa pedina non può muovere."}
      sel=null;partial=[];const keep=sh.status.textContent;draw(S,c);sh.status.textContent=keep});
    hb.onclick=()=>{if(!SS||!cc)return;const S=SS,c=cc,ms=moves();if(!ms.length||S.turn!==lato(c.me))return;
      const side=lato(c.me),vals=valuta(S.b,side,ms,2);let bi=0;vals.forEach((v,i)=>{if(v>vals[bi])bi=i});hint=ms[bi];sel=null;partial=[];sfx("hint");draw(S,c)};
    return {draw}}
});
})();
