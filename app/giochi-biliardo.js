// BILIARDO (palla 8, dal Giardino Zen) sul motore dei giochi di Natan (giochi.js)
// Ogni tiro è un messaggio «t|velocità x|velocità y|x bianca|y bianca»: i telefoni rifanno la stessa simulazione (solo somme, prodotti e radici quadrate: stesso risultato ovunque).
(function(){
"use strict";
const {E,register,shuffle,mulberry,rnd}=window.__G;
const Z=window.__G.zen;
const sfx=(n,a)=>{try{Z.sfx(n,a)}catch(e){}};
const blSnd=(k,v)=>{try{Z.blSnd(k,v)}catch(e){}};
const L=1000,W=500,R=11.5,MAXV=2600;
const POCKETS=[[-5,-5,25],[500,-17,23],[1005,-5,25],[-5,505,25],[500,517,23],[1005,505,25]];
const BCOL=["#f4f1e8","#e9b81f","#1f4fa8","#c62a20","#5b2c86","#e46e1c","#1f7a43","#7a1d1d","#151515"];
const grp=n=>n===8?"eight":(n<8?"solid":"stripe");
const GNAME={solid:"piene",stripe:"spezzate"};
const FALLI={scratch:"bianca in buca",nohit:"nessuna palla colpita",no8first:"dovevi colpire prima la nera",hit8:"hai colpito prima la nera",hitopp:"hai colpito prima una palla avversaria"};

function rack(Rn){
  const balls=[{n:0,x:250,y:250,on:true}],order=shuffle([2,3,4,5,6,7,9,10,11,12,13,14,15],Rn);let k=0;const dx=Math.sqrt(3)*R+.4;
  for(let row=0;row<5;row++)for(let i=0;i<=row;i++){const n=row===0?1:(row===2&&i===1?8:order[k++]);balls.push({n,x:730+row*dx,y:250+(i-row/2)*(2*R+.4),on:true})}
  return balls}
function passo(bs,dt,ev){
  for(const b of bs){if(!b.on||(!b.vx&&!b.vy))continue;
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    const sp=Math.sqrt(b.vx*b.vx+b.vy*b.vy),ns=Math.max(0,sp-170*dt)*(1-.22*dt);
    if(ns<4){b.vx=0;b.vy=0}else{const f=ns/sp;b.vx*=f;b.vy*=f}
    let gone=false;
    for(const P of POCKETS){const ddx=b.x-P[0],ddy=b.y-P[1];if(ddx*ddx+ddy*ddy<P[2]*P[2]){b.on=false;b.vx=0;b.vy=0;ev.pocket(b);gone=true;break}}
    if(gone)continue;
    const cy=b.y<34||b.y>W-34,cx=b.x<34||b.x>L-34,side=Math.abs(b.x-L/2)<26;
    if(!cy){if(b.x<R&&b.vx<0){b.x=2*R-b.x;b.vx=-b.vx*.78;b.vy*=.96;ev.rail(-b.vx)}else if(b.x>L-R&&b.vx>0){b.x=2*(L-R)-b.x;b.vx=-b.vx*.78;b.vy*=.96;ev.rail(-b.vx)}}
    if(!cx&&!side){if(b.y<R&&b.vy<0){b.y=2*R-b.y;b.vy=-b.vy*.78;b.vx*=.96;ev.rail(-b.vy)}else if(b.y>W-R&&b.vy>0){b.y=2*(W-R)-b.y;b.vy=-b.vy*.78;b.vx*=.96;ev.rail(-b.vy)}}
    const J=R*1.6;
    if(b.x<-J){b.x=-J;b.vx=Math.abs(b.vx)*.5}if(b.x>L+J){b.x=L+J;b.vx=-Math.abs(b.vx)*.5}
    if(b.y<-J){b.y=-J;b.vy=Math.abs(b.vy)*.5}if(b.y>W+J){b.y=W+J;b.vy=-Math.abs(b.vy)*.5}
    if(!b.vx&&!b.vy&&(b.x<R-1||b.x>L-R+1||b.y<R-1||b.y>W-R+1)){   // fermo oltre la sponda: all'imbocco di una buca cade dentro, altrimenti rientra sul tappeto
      let vicino=false;for(const P of POCKETS){const qx=b.x-P[0],qy=b.y-P[1];if(qx*qx+qy*qy<48*48){vicino=true;break}}
      if(vicino){b.on=false;ev.pocket(b)}else{b.x=Math.min(L-R,Math.max(R,b.x));b.y=Math.min(W-R,Math.max(R,b.y))}}}
  const D=2*R;
  for(let i=0;i<bs.length;i++){const a=bs[i];if(!a.on)continue;
    for(let j=i+1;j<bs.length;j++){const c=bs[j];if(!c.on)continue;
      const dx=c.x-a.x,dy=c.y-a.y,d2=dx*dx+dy*dy;if(d2>=D*D||d2===0)continue;
      const d=Math.sqrt(d2),nx=dx/d,ny=dy/d,ov=(D-d)/2;
      a.x-=nx*ov;a.y-=ny*ov;c.x+=nx*ov;c.y+=ny*ov;
      const rel=(a.vx-c.vx)*nx+(a.vy-c.vy)*ny;
      if(rel>0){const jv=rel*.975;a.vx-=jv*nx;a.vy-=jv*ny;c.vx+=jv*nx;c.vy+=jv*ny;ev.hit(a,c,rel)}}}}
const fermo=bs=>bs.every(b=>!b.on||(!b.vx&&!b.vy));
// simula un tiro; se rec2 è dato registra anche i fotogrammi (60 al secondo) e gli urti per l'animazione
function simula(balls,vx,vy,reg){
  const bs=balls.map(b=>({n:b.n,x:b.x,y:b.y,on:b.on,vx:0,vy:0})),cue=bs.find(b=>b.n===0);cue.vx=vx;cue.vy=vy;
  const rec={firstHit:null,pocketed:[],scratch:false};let k=0;const frames=reg?[]:null,evs=reg?[]:null;
  const ev={
    hit:(a,c,rel)=>{if(rec.firstHit==null){if(a.n===0)rec.firstHit=c.n;else if(c.n===0)rec.firstHit=a.n}if(reg&&rel>30)evs.push([k/10|0,"hit",Math.round(rel)])},
    rail:v=>{if(reg&&v>50)evs.push([k/10|0,"rail",Math.round(v)])},
    pocket:b=>{rec.pocketed.push(b.n);if(b.n===0)rec.scratch=true;if(reg)evs.push([k/10|0,"pocket",1])}};
  for(k=0;k<24000;k++){
    if(reg&&k%10===0){const f=new Array(bs.length*2);bs.forEach((b,j)=>{f[2*j]=b.on?Math.round(b.x*10)/10:-999;f[2*j+1]=b.on?Math.round(b.y*10)/10:-999});frames.push(f)}
    passo(bs,1/600,ev);if(fermo(bs))break}
  return {bs,rec,frames,evs}}
function validSpot(balls,x,y,cucina){if(!(x>=R&&x<=L-R&&y>=R&&y<=W-R))return false;if(cucina&&x>250)return false;return balls.every(b=>!b.on||b.n===0||(b.x-x)*(b.x-x)+(b.y-y)*(b.y-y)>=(2*R+1)*(2*R+1))}
function spotLibero(balls,x,y){if(validSpot(balls,x,y))return {x,y};for(let r=10;r<500;r+=8)for(let a=0;a<6.28;a+=.4){const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(validSpot(balls,px,py))return {x:px,y:py}}return {x,y}}
const restanti=(balls,g)=>balls.filter(b=>b.on&&b.n&&b.n!==8&&grp(b.n)===g).length;
// arbitro: aggiorna lo stato T dopo un tiro di chi (p) ha mosso; prev = palle prima del tiro
function giudica(T,p,prev,brkPrima,bs,rec){
  const o=1-p,g=T.groups[p];
  T.balls=bs.map(b=>({n:b.n,x:b.x,y:b.y,on:b.on}));
  const onEight=!!g&&!prev.some(b=>b.on&&b.n&&b.n!==8&&grp(b.n)===g);
  let foul=null;
  if(rec.scratch)foul="scratch";
  else if(rec.firstHit==null)foul="nohit";
  else if(onEight&&rec.firstHit!==8)foul="no8first";
  else if(g&&!onEight&&grp(rec.firstHit)!==g)foul=rec.firstHit===8?"hit8":"hitopp";
  else if(!g&&rec.firstHit===8&&!brkPrima)foul="hit8";
  let pot=rec.pocketed.filter(n=>n!==0);
  if(pot.includes(8)&&brkPrima){const e8=T.balls.find(b=>b.n===8),sp=spotLibero(T.balls,730,250);e8.on=true;e8.x=sp.x;e8.y=sp.y;pot=pot.filter(n=>n!==8)}   // la nera imbucata alla spaccata torna al suo posto
  T.brk=false;T.shotNo=(T.shotNo||0)+1;
  if(pot.includes(8)){T.phase="over";T.winner=(onEight&&!foul)?p:o;T.ev={by:p,kind:"eight",foul,presto:!onEight};return T}
  if(!g&&!foul&&!brkPrima){const f=pot.find(n=>n!==8);if(f){T.groups[p]=grp(f);T.groups[o]=grp(f)==="solid"?"stripe":"solid"}}
  const g2=T.groups[p],potOwn=g2?pot.some(n=>grp(n)===g2):(brkPrima&&pot.length>0);
  if(foul){T.turn=o;T.ballInHand=true;T.ev={by:p,kind:"foul",foul};
    if(rec.scratch){const cue=T.balls.find(b=>b.n===0);cue.on=true;const sp=spotLibero(T.balls,250,250);cue.x=sp.x;cue.y=sp.y}}
  else if(potOwn){T.ballInHand=false;T.ev={by:p,kind:"again",n:pot.length,assegna:(!g&&g2)?g2:null}}
  else{T.turn=o;T.ballInHand=false;T.ev={by:p,kind:"turn",n:pot.length}}
  return T}
const copiaStato=S=>({balls:S.balls,turn:S.turn,groups:S.groups.slice(),ballInHand:S.ballInHand,brk:S.brk,phase:S.phase,winner:S.winner,shotNo:S.shotNo,ev:null});
// parse del tiro: identico per chi lo fa e per chi lo riceve
function leggiTiro(S,seat,k){
  const t=String(k).split("|");if(t[0]!=="t"||t.length<5)return null;
  const vx=+t[1],vy=+t[2],cx=+t[3],cy=+t[4];if(![vx,vy,cx,cy].every(Number.isFinite))return null;
  const sp=Math.sqrt(vx*vx+vy*vy);if(sp<1)return null;const f=sp>MAXV?MAXV/sp:1;
  const a={k:String(k),vx:vx*f,vy:vy*f,cue:null};
  if(S.ballInHand&&validSpot(S.balls,cx,cy,S.brk))a.cue={x:cx,y:cy};
  return a}
const num=v=>(Math.round(v*100)/100).toFixed(2);
const chiave=(vx,vy,cue)=>`t|${num(vx)}|${num(vy)}|${num(cue.x)}|${num(cue.y)}`;
// candidati dei bot: tiri verso le buche, ognuno simulato e giudicato
function candidati(S,seat,lv,noise){
  const g=S.groups[seat],balls=S.balls,cue0=balls.find(b=>b.n===0);
  if(S.brk){const cue=S.ballInHand?{x:220,y:250+(Math.random()*30-15)}:{x:cue0.x,y:cue0.y};const dx=730-cue.x,dy=250-cue.y,d=Math.sqrt(dx*dx+dy*dy);
    return [{cue,vx:dx/d*MAXV*.95,vy:dy/d*MAXV*.95,sc:0,res:null}]}
  const targets=g?(restanti(balls,g)?balls.filter(b=>b.on&&b.n&&b.n!==8&&grp(b.n)===g):balls.filter(b=>b.on&&b.n===8)):balls.filter(b=>b.on&&b.n&&b.n!==8);
  const cands=[];
  for(const t of targets)for(const [px,py] of POCKETS){
    const ex=px-t.x,ey=py-t.y,ed=Math.sqrt(ex*ex+ey*ey),ux=ex/ed,uy=ey/ed,gx=t.x-ux*2*R,gy=t.y-uy*2*R;
    let cp={x:cue0.x,y:cue0.y};
    if(S.ballInHand){const c={x:gx-ux*170,y:gy-uy*170};if(!validSpot(balls,c.x,c.y))continue;cp=c}
    const ax=gx-cp.x,ay=gy-cp.y,ad=Math.sqrt(ax*ax+ay*ay);if(ad<1)continue;const dx=ax/ad,dy=ay/ad,cut=dx*ux+dy*uy;if(cut<.3)continue;
    for(const pw of [.3,.48,.7])cands.push({cue:cp,dx,dy,pw,s0:cut*12-ed*.01})}
  if(!cands.length){const cp=S.ballInHand?spotLibero(balls,250,250):{x:cue0.x,y:cue0.y};
    for(const t of (targets.length?targets:balls.filter(b=>b.on&&b.n))){const ax=t.x-cp.x,ay=t.y-cp.y,ad=Math.sqrt(ax*ax+ay*ay)||1;cands.push({cue:cp,dx:ax/ad,dy:ay/ad,pw:.45,s0:0})}}
  cands.sort((a,b)=>b.s0-a.s0);
  const top=[6,12,20,24][lv==null?1:lv],extra=[2,4,8,12][lv==null?1:lv];
  const pool=cands.slice(0,top).concat(shuffle(cands.slice(top)).slice(0,extra));
  const out=[];
  for(const c of pool){
    const bs0=balls.map(b=>b.n===0?{n:0,x:c.cue.x,y:c.cue.y,on:true}:{n:b.n,x:b.x,y:b.y,on:b.on});
    const vx=c.dx*c.pw*MAXV,vy=c.dy*c.pw*MAXV;const r=simula(bs0,vx,vy,false);
    const T=giudica(copiaStato(Object.assign({},S,{balls:bs0})),seat,bs0,S.brk,r.bs,r.rec);
    let sc=c.s0+Math.random()*4;
    if(T.phase==="over")sc+=T.winner===seat?2000:-2000;
    else{if(T.turn===seat)sc+=200;if(T.ballInHand&&T.turn!==seat)sc-=150;const g2=T.groups[seat];if(g2)sc+=40*(restanti(bs0,g2)-restanti(T.balls,g2))}
    // un po' di imprecisione (più grande ai livelli bassi): la direzione sbaglia di poco
    const a0=Math.atan2(c.dy,c.dx)+(Math.random()-.5)*2*(noise==null?[.03,.015,.007,.002][lv==null?1:lv]:noise);
    out.push({cue:c.cue,vx:Math.cos(a0)*c.pw*MAXV,vy:Math.sin(a0)*c.pw*MAXV,sc,T,rec:r.rec,seat,bs0})}
  return out}
register({id:"biliardo",ord:5,nome:"Biliardo",ic:"🎱",sub:"Palla 8: trascina, mira e tira. Contro un bot o con un amico",min:2,max:2,noEval:true,
  tut:[["🎱","Lo scopo","Palla 8, in due. Chi imbuca per primo una palla prende quel gruppo: piene (1–7) o spezzate (9–15). Quando hai imbucato tutto il tuo gruppo, imbuca la nera per vincere."],
       ["👆","Come si tira","Trascina il dito (o il mouse) allontanandoti dalla bianca: la stecca mira dalla parte opposta e più tiri, più forte colpisci. Lascia per tirare."],
       ["⚠️","I falli","Fallo: bianca in buca, nessuna palla colpita o prima palla colpita che non è tua. L'avversario prende la palla in mano e può metterla dove vuole."],
       ["⚫","La nera","Se imbuchi la nera prima di aver finito il tuo gruppo, o con un fallo, perdi la partita."]],
  init(n,seed){const Rn=mulberry(seed);return {balls:rack(Rn),turn:Rn()<.5?0:1,groups:[null,null],ballInHand:true,brk:true,phase:"play",winner:-1,shotNo:0,ev:null,shot:null,nm:0}},
  turn(S){return S.turn},
  legal(S,seat){return [{k:"tira"},{k:"tira2"}]},      // due voci finte: il tiro vero arriva con parse()
  parse(S,seat,k){return leggiTiro(S,seat,k)},
  apply(S,seat,a){
    const prev=S.balls.map(b=>({n:b.n,x:b.x,y:b.y,on:b.on}));const brkPrima=S.brk;
    const start=S.balls.map(b=>({n:b.n,x:b.x,y:b.y,on:b.on}));
    if(S.ballInHand&&a.cue){const c=start.find(b=>b.n===0);c.x=a.cue.x;c.y=a.cue.y;c.on=true}
    const r=simula(start,a.vx,a.vy,true);
    giudica(S,seat,start,brkPrima,r.bs,r.rec);S.nm++;
    S.shot={by:seat,no:S.shotNo,start,frames:r.frames,evs:r.evs,vx:a.vx,vy:a.vy};
    return S},
  over(S){return S.phase==="over"?{win:[S.winner],text:seats=>{const e=S.ev;return e&&e.kind==="eight"&&(e.presto||e.foul)&&e.by!==S.winner?`${seats[e.by].nome} ha imbucato la nera ${e.foul?"con un fallo":"troppo presto"}: vince ${seats[S.winner].nome}.`:`${seats[S.winner].nome} imbuca la nera: partita vinta!`}}:null},
  pausa(S,a,seat){return S.shot?S.shot.frames.length*1000/60+700:400},
  msgTurno(S,ctx,seat){return S.ballInHand?"Palla in mano: trascina la bianca dove vuoi, poi tira":"Tocca a te: trascina allontanandoti dalla bianca, lascia per tirare"},
  bot(S,seat,lv){
    const cs=candidati(S,seat,lv);
    return cs.map(c=>{const T=c.T;const k=chiave(c.vx,c.vy,c.cue);
      const nostre=T?(S.groups[seat]||T.groups[seat]):null;
      const cade=c.sc||0;
      return {a:leggiTiro(S,seat,k)||{k,vx:c.vx,vy:c.vy,cue:c.cue},f:{
        valore:Math.max(-1,Math.min(1,(cade-100)/400)),
        punti:T?Math.min(1,((T.ev&&T.ev.n)||0)/3):0,
        attacco:T&&T.ev&&(T.ev.kind==="again"||T.phase==="over"&&T.winner===seat)?.8:0,
        difesa:T&&T.turn!==seat&&!T.ballInHand?.3:0,
        rischio:T&&T.ev&&T.ev.kind==="foul"?-1:0,
        conserva:c.rec&&c.rec.scratch?-1:0,
        posizione:0,futuro:T&&T.turn===seat?.4:0,finale:T&&T.phase==="over"&&T.winner===seat?1:0}}})},
  hint(S,seat){const cs=candidati(S,seat,3,0);let b=null;cs.forEach(c=>{if(!b||c.sc>b.sc)b=c});return b},
  view(sh,ctx){
    const info=this;
    const root=E("div","zhall");sh.g.append(root);
    const pl=E("div","zbp"),msg=E("div","zmsg"),cv=document.createElement("canvas");cv.id="blCanvas";cv.setAttribute("aria-label","Tavolo da biliardo");
    const pw=E("div","zpow");const pwi=E("i");pw.append(pwi);
    const help=E("p","zhelp","Trascina allontanandoti dalla bianca: la stecca mira dalla parte opposta e più tiri, più è forte. Lascia per colpire. Con la palla in mano trascina la bianca per spostarla.");
    const tools=E("div","row");tools.style.justifyContent="center";const hb=E("button","btn ghost","💡 Aiuto");hb.id="blHint";tools.append(hb);
    root.append(pl,msg,cv,pw,help,tools);
    let SS=null,cc=null,anim=null,aim=null,drag=null,hint=null,cuePos=null,V=null,vistoShot=0,msgTxt="";
    const nomeDi=(c,s)=>s===c.me?"Tu":(c.seats[s]?c.seats[s].nome:"?");
    function layout(){
      const full=!!root.closest(".gm.full"),wrapW=Math.max(280,(root.clientWidth||360)-24),portrait=wrapW<640,TL=L+80,TW=W+80;
      let s;if(portrait)s=Math.min(wrapW/TW,Math.max(300,innerHeight-(full?90:250))/TL);else s=Math.min(wrapW/TL,Math.max(260,innerHeight-(full?90:230))/TW);
      const cw=portrait?TW*s:TL*s,ch=portrait?TL*s:TW*s,dpr=Math.min(2,window.devicePixelRatio||1);
      cv.width=Math.round(cw*dpr);cv.height=Math.round(ch*dpr);cv.style.width=cw+"px";cv.style.height=ch+"px";
      const S_=s*dpr;V={portrait,S:S_,dpr,m:portrait?[0,S_,-S_,0,(W+40)*S_,40*S_]:[S_,0,0,S_,40*S_,40*S_],rot:portrait?-Math.PI/2:0}}
    function aTavola(e){const r=cv.getBoundingClientRect(),X=(e.clientX-r.left)*V.dpr*(cv.width/V.dpr/r.width),Y=(e.clientY-r.top)*V.dpr*(cv.height/V.dpr/r.height);
      return V.portrait?{x:(Y-40*V.S)/V.S,y:((W+40)*V.S-X)/V.S}:{x:(X-40*V.S)/V.S,y:(Y-40*V.S)/V.S}}
    function disegnaPalla(x,b,rot){
      x.save();x.translate(b.x,b.y);
      x.beginPath();x.ellipse(2.5,3.5,R,R*.9,0,0,7);x.fillStyle="rgba(0,0,0,.28)";x.fill();
      x.rotate(rot);x.beginPath();x.arc(0,0,R,0,7);
      if(b.n===0||b.n>8){x.fillStyle="#f6f3ea";x.fill();if(b.n>8){x.save();x.clip();x.fillStyle=BCOL[b.n-8];x.fillRect(-R,-R*.56,2*R,R*1.12);x.restore()}}
      else{x.fillStyle=BCOL[b.n];x.fill()}
      if(b.n){x.beginPath();x.arc(0,0,R*.5,0,7);x.fillStyle="#fbfaf5";x.fill();x.fillStyle="#111";x.font=`700 ${R*.62}px system-ui,sans-serif`;x.textAlign="center";x.textBaseline="middle";x.fillText(b.n,0,R*.05)}
      const g=x.createRadialGradient(-R*.35,-R*.4,R*.08,0,0,R);g.addColorStop(0,"rgba(255,255,255,.6)");g.addColorStop(.3,"rgba(255,255,255,0)");g.addColorStop(1,"rgba(0,0,0,.32)");
      x.beginPath();x.arc(0,0,R,0,7);x.fillStyle=g;x.fill();x.restore()}
    function raggio(bs,cx,cy,dx,dy){
      let best=1e9,hit=null;
      for(const b of bs){if(!b.on||b.n===0)continue;const ox=b.x-cx,oy=b.y-cy,t=ox*dx+oy*dy;if(t<=0)continue;const d2=ox*ox+oy*oy-t*t;if(d2>4*R*R)continue;const tt=t-Math.sqrt(4*R*R-d2);if(tt<best){best=tt;hit=b}}
      const tw=[dx>0?(L-R-cx)/dx:dx<0?(R-cx)/dx:1e9,dy>0?(W-R-cy)/dy:dy<0?(R-cy)/dy:1e9];const wall=Math.min(...tw);
      if(wall<best){best=wall;hit=null}return {t:Math.max(0,best),hit}}
    const mioTurno=()=>SS&&cc&&SS.phase==="play"&&!anim&&SS.turn===cc.me&&cc.legal.length>0;
    function disegna(bs){
      if(!V)layout();const x=cv.getContext("2d");
      x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,cv.width,cv.height);x.setTransform(...V.m);
      const wood=x.createLinearGradient(0,-40,0,W+40);wood.addColorStop(0,"#6e4527");wood.addColorStop(.5,"#4f2f18");wood.addColorStop(1,"#6e4527");
      x.fillStyle=wood;x.beginPath();x.roundRect?x.roundRect(-40,-40,L+80,W+80,26):x.rect(-40,-40,L+80,W+80);x.fill();
      x.strokeStyle="rgba(255,220,170,.18)";x.lineWidth=2;x.stroke();
      const cl=x.createRadialGradient(L/2,W/2,40,L/2,W/2,L*.62);cl.addColorStop(0,"#24845a");cl.addColorStop(1,"#145538");
      x.fillStyle="#0f4a30";x.fillRect(-12,-12,L+24,W+24);x.fillStyle=cl;x.fillRect(0,0,L,W);
      x.fillStyle="rgba(240,230,200,.75)";
      for(let k=1;k<8;k++){if(k===4)continue;[[L*k/8,-24],[L*k/8,W+24]].forEach(([dx,dy])=>{x.beginPath();x.moveTo(dx,dy-4);x.lineTo(dx+3,dy);x.lineTo(dx,dy+4);x.lineTo(dx-3,dy);x.fill()})}
      for(let k=1;k<4;k++)[[-24,W*k/4],[L+24,W*k/4]].forEach(([dx,dy])=>{x.beginPath();x.moveTo(dx,dy-4);x.lineTo(dx+3,dy);x.lineTo(dx,dy+4);x.lineTo(dx-3,dy);x.fill()});
      x.strokeStyle="rgba(255,255,255,.14)";x.lineWidth=1.5;x.beginPath();x.moveTo(250,0);x.lineTo(250,W);x.stroke();
      x.fillStyle="rgba(255,255,255,.3)";[[250,250],[730,250]].forEach(([a,b])=>{x.beginPath();x.arc(a,b,2.5,0,7);x.fill()});
      POCKETS.forEach(([px,py,pr])=>{x.beginPath();x.arc(px,py,pr,0,7);x.fillStyle="#0b0b0b";x.fill();x.strokeStyle="#2a1a0e";x.lineWidth=3;x.stroke()});
      const cue=bs.find(b=>b.n===0);
      if(SS&&SS.ballInHand&&!anim&&cue&&cue.on&&mioTurno()){x.setLineDash([5,5]);x.strokeStyle="rgba(255,255,255,.7)";x.lineWidth=2;x.beginPath();x.arc(cue.x,cue.y,R*2.4,0,7);x.stroke();x.setLineDash([])}
      if(hint&&!anim&&cue){x.setLineDash([10,8]);x.strokeStyle="rgba(233,184,31,.85)";x.lineWidth=3;x.beginPath();x.moveTo(cue.x,cue.y);x.lineTo(cue.x+hint.dx*420,cue.y+hint.dy*420);x.stroke();x.setLineDash([])}
      if(aim&&!anim&&cue&&cue.on){const r=raggio(bs,cue.x,cue.y,aim.dx,aim.dy),ex=cue.x+aim.dx*r.t,ey=cue.y+aim.dy*r.t;
        x.strokeStyle="rgba(255,255,255,.75)";x.lineWidth=1.6;x.beginPath();x.moveTo(cue.x,cue.y);x.lineTo(ex,ey);x.stroke();
        x.beginPath();x.arc(ex,ey,R,0,7);x.stroke();
        if(r.hit){const nx=r.hit.x-ex,ny=r.hit.y-ey,nd=Math.sqrt(nx*nx+ny*ny)||1;x.strokeStyle="rgba(255,230,150,.8)";x.beginPath();x.moveTo(r.hit.x,r.hit.y);x.lineTo(r.hit.x+nx/nd*90,r.hit.y+ny/nd*90);x.stroke()}
        const back=R+6+aim.power*120,sx=cue.x-aim.dx*back,sy=cue.y-aim.dy*back,tx=sx-aim.dx*430,ty=sy-aim.dy*430;
        x.lineCap="round";x.strokeStyle="#d9b98a";x.lineWidth=6;x.beginPath();x.moveTo(sx,sy);x.lineTo(tx,ty);x.stroke();
        x.strokeStyle="#2b1a10";x.lineWidth=9;x.beginPath();x.moveTo(sx-aim.dx*300,sy-aim.dy*300);x.lineTo(tx,ty);x.stroke();
        x.strokeStyle="#3a6fb0";x.lineWidth=6;x.beginPath();x.moveTo(sx,sy);x.lineTo(sx-aim.dx*4,sy-aim.dy*4);x.stroke();x.lineCap="butt"}
      bs.forEach(b=>{if(b.on)disegnaPalla(x,b,V.rot)});
      pwi.style.width=Math.round((aim&&!anim?aim.power:0)*100)+"%"}
    // palle da mostrare ora: quelle dello stato, con la bianca eventualmente spostata a mano
    function paleStatiche(){const S=SS;const bs=S.balls.map(b=>({n:b.n,x:b.x,y:b.y,on:b.on}));
      if(cuePos&&S.ballInHand&&mioTurno()){const c=bs.find(b=>b.n===0);c.x=cuePos.x;c.y=cuePos.y;c.on=true}return bs}
    function testo(S,c){
      const e=S.ev;if(!e)return "Spacca il triangolo. Puoi spostare la bianca dietro la linea.";
      const p=nomeDi(c,e.by),o=nomeDi(c,1-e.by);
      if(e.kind==="eight")return e.foul||e.presto?`${p}: nera in buca ${e.foul?"con un fallo":"troppo presto"}. Vince ${o}.`:`${p}: nera in buca, partita vinta.`;
      if(e.kind==="foul")return `Fallo di ${p}: ${FALLI[e.foul]}. Palla in mano a ${o}.`;
      if(e.kind==="again")return `${p}: ${e.n>1?"palle imbucate":"palla imbucata"}${e.assegna?` (${GNAME[e.assegna]})`:""}, tira ancora.`;
      return e.n?`${p}: imbucate solo palle avversarie.`:`${p}: niente in buca.`}
    function aggiorna(){
      const S=SS,c=cc;if(!S||!c)return;
      pl.innerHTML="";
      [c.me,1-c.me].forEach(w=>{const g=S.groups[w];const d=E("div",S.turn===w&&S.phase==="play"?"on":"");
        const left=g?S.balls.filter(b=>b.on&&b.n&&b.n!==8&&grp(b.n)===g).map(b=>b.n).sort((a,b)=>a-b):[];
        const dots=left.map(n=>`<span class="zdot" style="background:${n>8?`linear-gradient(#f6f3ea 25%,${BCOL[n-8]} 25% 75%,#f6f3ea 75%)`:BCOL[n]};${n<8&&n!==1&&n!==5?"color:#fff":""}">${n}</span>`).join("")+(g&&!left.length?'<span class="zdot" style="background:#151515;color:#fff">8</span>':"");
        d.innerHTML=`<b>${nomeDi(c,w)}${w===c.me?"":""}</b><small>${g?(left.length?GNAME[g]:"tocca alla nera"):"gruppo da assegnare"}</small><div class="zdots">${dots}</div>`;pl.append(d)});
      let m=anim?"…":testo(S,c);
      if(!anim&&S.phase==="play"){m+=" "+(S.turn===c.me?"Tocca a te.":`Tocca a ${nomeDi(c,S.turn)}.`);if(S.ballInHand&&S.turn===c.me)m+=" Palla in mano: trascina la bianca dove vuoi."}
      msg.textContent=m}
    function finisciAnim(){anim=null;aggiorna();disegna(paleStatiche())}
    function avviaAnim(S){
      const sh_=S.shot;const t0=performance.now();let ie=0;const mio=sfx;
      anim={no:sh_.no};aim=null;hint=null;cuePos=null;
      sfx("cue",Math.sqrt(sh_.vx*sh_.vx+sh_.vy*sh_.vy)/MAXV);
      const fr=sh_.frames,n=fr.length;
      const bs=S.balls.map((b,j)=>({n:b.n,x:b.x,y:b.y,on:b.on}));
      const frame=ts=>{
        if(!anim||anim.no!==sh_.no||!document.body.contains(cv))return;
        const idx=Math.min(n-1,Math.floor((ts-t0)*.06));
        while(ie<sh_.evs.length&&sh_.evs[ie][0]<=idx){const e=sh_.evs[ie++];blSnd(e[1],e[2])}
        const f=fr[idx];const pos=sh_.start.map((b,j)=>({n:b.n,x:f[2*j],y:f[2*j+1],on:f[2*j]>-900}));
        disegna(pos);
        if(idx>=n-1){finisciAnim();return}
        requestAnimationFrame(frame)};
      requestAnimationFrame(frame);
      aggiorna()}
    const draw=(S,c)=>{
      SS=S;cc=c;
      if(!V)layout();
      if(S.shot&&S.shot.no!==vistoShot){vistoShot=S.shot.no;
        if(window.NATAN_GIOCHI_VELOCE){anim=null}else avviaAnim(S);
        try{const e=S.ev;const by=S.shot.by;if(sh.logic&&c.seats[by]&&c.seats[by].tipo!=="bot"&&e){if(e.kind==="again")sh.logic.esito(by,"buona");else if(e.kind==="foul"||(e.kind==="eight"&&by!==S.winner))sh.logic.esito(by,"errore")}}catch(x){}
        if(S.phase==="over")setTimeout(()=>sfx(S.winner===c.me?"win":"lose"),(S.shot.frames.length*1000/60)+400)}
      if(!anim){aggiorna();disegna(paleStatiche())}}
    // puntamento con il dito / mouse
    cv.addEventListener("pointerdown",e=>{
      if(!mioTurno())return;const p=aTavola(e),cue=SS.balls.find(b=>b.n===0);hint=null;
      const cp=cuePos&&SS.ballInHand?cuePos:cue;
      if(SS.ballInHand&&Math.hypot(p.x-cp.x,p.y-cp.y)<R*3)drag="place";else{drag="aim";puntaA(p)}
      try{cv.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault()});
    cv.addEventListener("pointermove",e=>{
      if(!drag||!mioTurno())return;const p=aTavola(e);
      if(drag==="place"){if(validSpot(SS.balls,p.x,p.y,SS.brk)){cuePos={x:p.x,y:p.y}}disegna(paleStatiche())}else puntaA(p)});
    const su=()=>{const d=drag;drag=null;if(d!=="aim"||!mioTurno())return;const a=aim;if(!a||a.power<.04){aim=null;disegna(paleStatiche());return}
      const cue=SS.balls.find(b=>b.n===0);const cp=cuePos&&SS.ballInHand?cuePos:{x:cue.x,y:cue.y};
      const vx=a.dx*a.power*MAXV,vy=a.dy*a.power*MAXV;const k=chiave(vx,vy,cp);aim=null;cuePos=null;cc.act(k)};
    cv.addEventListener("pointerup",su);cv.addEventListener("pointercancel",()=>{drag=null;aim=null;if(SS)disegna(paleStatiche())});
    function puntaA(p){const bs=paleStatiche(),cue=bs.find(b=>b.n===0),dx=cue.x-p.x,dy=cue.y-p.y,d=Math.sqrt(dx*dx+dy*dy);if(d<2)return;
      aim={dx:dx/d,dy:dy/d,power:Math.max(0,Math.min(1,(d-R*2)/320))};disegna(bs)}
    hb.onclick=()=>{if(!mioTurno())return;const b=info.hint(SS,cc.me);if(!b)return;
      const d=Math.sqrt(b.vx*b.vx+b.vy*b.vy);hint={dx:b.vx/d,dy:b.vy/d};if(SS.ballInHand)cuePos={x:b.cue.x,y:b.cue.y};
      sfx("hint");disegna(paleStatiche());msg.textContent=`Prova a tirare lungo la linea gialla, forza circa ${Math.round(d/MAXV*100)}%.`};
    window.addEventListener("resize",()=>{if(!document.body.contains(cv))return;V=null;if(SS){layout();if(!anim)disegna(paleStatiche())}});
    sfx("rack");
    return {draw}}
});
})();
