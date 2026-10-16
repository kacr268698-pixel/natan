// GIOCHI SPORTIVI di Natan: Freccette, Basket, Bowling, Minigolf e Curling sul motore dei giochi di Natan (giochi.js).
// Sono tutti a turni e senza casualità nascosta: ogni tiro è un messaggio breve, e tutti i telefoni rifanno la stessa simulazione (sempre uguale ovunque).
(function(){
"use strict";
const {E,register,shuffle,mulberry,rnd}=window.__G;
const Z=window.__G.zen||{};
const sfx=(n,a)=>{try{Z.sfx(n,a)}catch(e){}};
const A=Z.A;
function tone(f,d,o){try{if(!A||!A.sfx)return;const c=A.init();if(!c)return;o=o||{};A.tone(f,c.currentTime+.005+(o.at||0),d,o)}catch(e){}}
function noise(d,o){try{if(!A||!A.sfx)return;const c=A.init();if(!c)return;o=o||{};A.noise(c.currentTime+.005+(o.at||0),d,o)}catch(e){}}
const SND={
  whoosh:()=>noise(.2,{f:1800,to:500,q:.7,gain:.05}),
  thud:()=>{tone(170,.12,{gain:.1,to:80});noise(.05,{f:900,q:1,gain:.05})},
  swish:()=>{noise(.35,{f:3400,to:2200,q:.5,gain:.05});tone(1500,.2,{type:"triangle",gain:.02,to:1100})},
  rim:()=>{tone(420,.25,{type:"triangle",gain:.07,to:380});tone(840,.2,{type:"triangle",gain:.03})},
  board:()=>{tone(130,.12,{gain:.09,to:90});noise(.05,{f:1200,q:1,gain:.04})},
  bounce:()=>tone(110,.1,{gain:.08,to:70}),
  strike:()=>{noise(.5,{f:900,to:300,q:.6,gain:.09});for(let i=0;i<6;i++)tone(300+Math.random()*500,.08,{type:"triangle",gain:.05,to:200,at:i*.05})},
  pin:()=>{tone(700+Math.random()*500,.07,{type:"triangle",gain:.05,to:400});noise(.03,{f:2500,q:1,gain:.03})},
  roll:()=>noise(.9,{f:260,to:200,q:.5,gain:.025,type:"lowpass"}),
  putt:()=>{tone(260,.06,{type:"triangle",gain:.09,to:160});noise(.02,{f:3000,q:2,gain:.04})},
  hole:()=>{tone(300,.2,{gain:.07,to:90});tone(520,.15,{type:"triangle",gain:.04,at:.1})},
  stone:()=>{tone(150,.12,{gain:.07,to:100});noise(.06,{f:600,q:1,gain:.05})},
  slide:()=>noise(1.2,{f:420,to:300,q:.4,gain:.02,type:"lowpass"}),
  goal:()=>{[523,659,784,1047].forEach((f,i)=>tone(f,.3,{type:"triangle",gain:.06,at:i*.1}));noise(.7,{f:1200,q:.4,gain:.03})},
  whistle:()=>{tone(2400,.35,{gain:.04,to:2100});tone(2500,.3,{gain:.03,at:.2})},
  kick:()=>{tone(180,.08,{gain:.1,to:90});noise(.03,{f:1500,q:1,gain:.05})},
  puck:()=>tone(900,.05,{type:"triangle",gain:.07,to:700}),
  click:()=>tone(900,.04,{type:"triangle",gain:.05,to:700}),
  drop:()=>{tone(520,.12,{type:"triangle",gain:.07,to:300});noise(.04,{f:1800,q:1,gain:.03})},
  flip:()=>{tone(800,.06,{type:"triangle",gain:.05,to:1200})}};
const snd=(n)=>{try{SND[n]()}catch(e){}};
(function(){if(document.getElementById("spcss"))return;const s=document.createElement("style");s.id="spcss";
s.textContent=`
.gm .sp{background:linear-gradient(160deg,#1c2442,#101528);color:#eef1ff;border-radius:20px;padding:12px;display:flex;flex-direction:column;gap:10px;align-items:stretch;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}
.gm .sp canvas{display:block;margin:0 auto;touch-action:none;max-width:100%;border-radius:14px}
.gm .sp .spmsg{text-align:center;min-height:3.2em;font-size:14px;line-height:1.35}
.gm .sp .sphelp{text-align:center;font-size:12.5px;color:#aab4d8;margin:0}
.gm .sp .sptools{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.gm .sp .spscore{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.gm .sp .spscore>div{flex:1 1 110px;max-width:220px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:7px 10px;text-align:center;transition:transform .2s,box-shadow .2s,background .2s}
.gm .sp .spscore>div.on{background:rgba(255,214,102,.16);border-color:#ffd166;box-shadow:0 0 16px rgba(255,214,102,.25);transform:translateY(-2px)}
.gm .sp .spscore b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gm .sp .spscore em{display:block;font-style:normal;font-size:30px;font-weight:800;line-height:1.1;font-variant-numeric:tabular-nums}
.gm .sp .spscore small{display:block;color:#aab4d8;font-size:12px;min-height:1.2em}
.gm .sp .sppow{height:8px;border-radius:4px;background:rgba(255,255,255,.12);overflow:hidden;max-width:340px;width:100%;margin:0 auto}
.gm .sp .sppow i{display:block;height:100%;width:0;background:linear-gradient(90deg,#4ade80,#facc15,#ef4444)}
.gm .sp .spseg{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}
.gm .sp .spseg button{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.07);color:inherit;border-radius:999px;padding:7px 14px;font:inherit;font-size:14px;cursor:pointer}
.gm .sp .spseg button.on{background:#ffd166;color:#1a1a2e;border-color:#ffd166;font-weight:700}
.gm .gcard.zstone .pic-sp{background:linear-gradient(150deg,var(--gc,#2b3a78),#10152e)}
.gm .pop{animation:sppop .5s ease}
@keyframes sppop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
`;document.head.append(s)})();
const pic=(id,em,col)=>{try{Z.PIC[id]=`<svg class="pic pic-sp" viewBox="0 0 240 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style="--gc:${col}"><circle cx="120" cy="60" r="46" fill="rgba(255,255,255,.08)"/><text x="120" y="84" font-size="62" text-anchor="middle">${em}</text></svg>`}catch(e){}};
// tavolo di gioco a coordinate «logiche» lw×lh: ritorna la scala per disegnare e per leggere il dito
function fit(root,cv,lw,lh,riserva){
  const full=!!root.closest(".gm.full"),dpr=Math.min(2,window.devicePixelRatio||1);
  const w=Math.max(260,(root.clientWidth||360)-24),hmax=Math.max(240,innerHeight-(full?90:(riserva||270)));
  const s=Math.min(w/lw,hmax/lh),cw=lw*s,ch=lh*s;
  cv.width=Math.round(cw*dpr);cv.height=Math.round(ch*dpr);cv.style.width=cw+"px";cv.style.height=ch+"px";
  return cv.width/lw}
const ptr=(cv,e,lw,lh)=>{const r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*lw,y:(e.clientY-r.top)/r.height*lh}};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const num=v=>(Math.round(v*100)/100).toFixed(2);
// animazione a fotogrammi registrati (60 al secondo): chiama draw(i) fino alla fine
function play(frames,evs,drawFn,snd2,done){
  const t0=performance.now();let ie=0,stop=false;const n=frames.length;
  const step=ts=>{if(stop)return;const i=Math.min(n-1,Math.floor((ts-t0)*.06));
    while(evs&&ie<evs.length&&evs[ie][0]<=i){try{snd2(evs[ie][1],evs[ie][2])}catch(e){}ie++}
    drawFn(i);if(i>=n-1){done();return}requestAnimationFrame(step)};
  requestAnimationFrame(step);return ()=>{stop=true}}
const nomeDi=(c,s)=>s===c.me?"Tu":(c.seats[s]?c.seats[s].nome:"?");
const FALSE2=[{k:"tira"},{k:"tira2"}];     // due voci finte: il tiro vero arriva con parse()

// ============================================================ FRECCETTE (301)
const DORD=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5],BR=170;
function puntiFr(x,y){
  const r=Math.sqrt(x*x+y*y);
  if(r<6.4)return {p:50,l:"Bull"};
  if(r<16)return {p:25,l:"Bull esterno"};
  if(r>BR)return {p:0,l:"Fuori"};
  let a=Math.atan2(x,-y);if(a<0)a+=2*Math.PI;
  const n=DORD[Math.floor(((a+Math.PI/20)%(2*Math.PI))/(Math.PI/10))];
  if(r>=99&&r<107)return {p:3*n,l:"Triplo "+n};
  if(r>=162)return {p:2*n,l:"Doppio "+n};
  return {p:n,l:String(n)}}
const FRR=[34,22,14,9];                       // quanto trema la mano dei bot (livello 0..3)
function scatter(seed,nm,r){const R=mulberry((seed^0x9e3779b9)+nm*7919),ang=R()*6.2832,u=Math.max(1e-6,R());const d=Math.min(2*r,r*.45*Math.sqrt(-2*Math.log(u)));return {dx:Math.cos(ang)*d,dy:Math.sin(ang)*d}}
function candFr(S,seat,lv){
  const rem=S.sc[seat],r=FRR[lv==null?1:lv],out=[];const pts=[];
  for(let i=0;i<20;i++){const a=i*Math.PI/10,n=DORD[i];[[103,"T"],[166,"D"],[134,"S"],[58,"s"]].forEach(([rad,t])=>pts.push({x:rad*Math.sin(a),y:-rad*Math.cos(a),n,t}))}
  pts.push({x:0,y:0,n:25,t:"B"},{x:0,y:11,n:25,t:"b"});
  const R=mulberry(777+S.nm*31);
  for(const c of pts){let sum=0,bust=0,win=0;const N=18;
    for(let s=0;s<N;s++){const ang=R()*6.2832,u=Math.max(1e-6,R()),d=Math.min(2*r,r*.45*Math.sqrt(-2*Math.log(u)));
      const res=puntiFr(c.x+Math.cos(ang)*d,c.y+Math.sin(ang)*d);const after=rem-res.p;
      if(after<0)bust++;else{sum+=res.p;if(after===0)win++}}
    const mean=sum/N,pb=bust/N,pw=win/N;
    out.push({x:c.x,y:c.y,r,mean,pb,pw,
      sc:mean+pw*400-pb*(S.start-rem+25)});}
  return out}
const FRL="🎯";
register({id:"freccette",ord:7,nome:"Freccette",ic:"🎯",col:"#7a1f2b",sub:"301: tieni premuto per fermare la mano, lascia per lanciare",min:2,max:4,noEval:true,
  tut:[["🎯","Lo scopo","Si parte da 301 punti. Ogni turno lanci 3 freccette e togli il punteggio dal totale: vince chi arriva esattamente a zero."],
       ["✋","Come si lancia","Tocca e tieni premuto sul bersaglio dove vuoi colpire: il cerchio si stringe, più aspetti più la mano è ferma. Lascia per lanciare."],
       ["⭕","I punteggi","I numeri vanno da 1 a 20. L'anello esterno vale doppio, l'anello stretto vale triplo, il centro vale 25 e 50."],
       ["💥","Sballare","Se superi lo zero il turno è nullo: torni al punteggio di inizio turno."]],
  init(n,seed){return {n,sc:Array(n).fill(301),turn:0,thrown:0,start:301,darts:[],over:false,winner:-1,nm:0,seed,ev:null,shot:null}},
  turn(S){return S.turn},legal(S,seat){return FALSE2},
  parse(S,seat,k){const t=String(k).split("|");if(t[0]!=="d"||t.length<4)return null;const x=+t[1],y=+t[2],r=+t[3];if(![x,y,r].every(Number.isFinite))return null;
    return {k:String(k),x:clamp(x,-BR*1.15,BR*1.15),y:clamp(y,-BR*1.15,BR*1.15),r:clamp(r,8,46)}},
  apply(S,seat,a){
    const sc=scatter(S.seed,S.nm,a.r),px=a.x+sc.dx,py=a.y+sc.dy,res=puntiFr(px,py),prev=S.darts.slice();
    const before=S.sc[seat],after=before-res.p,bust=after<0;S.nm++;S.thrown++;S.darts=prev.concat([{x:px,y:py,l:res.l,p:res.p}]);
    const startTurn=S.start;
    if(bust){S.sc[seat]=S.start;S.ev={by:seat,kind:"bust",res}}
    else{S.sc[seat]=after;if(after===0){S.over=true;S.winner=seat;S.ev={by:seat,kind:"win",res}}else S.ev={by:seat,kind:"dart",res}}
    S.shot={by:seat,no:S.nm,x:px,y:py,res,bust,prev,aim:{x:a.x,y:a.y,r:a.r},start:startTurn,fin:S.sc[seat]};
    if(!S.over&&(bust||S.thrown>=3)){S.turn=(seat+1)%S.n;S.thrown=0;S.darts=[];S.start=S.sc[S.turn]}
    return S},
  over(S){return S.over?{win:[S.winner],text:seats=>`${seats[S.winner].nome} chiude a zero: partita vinta!`}:null},
  pausa(S,a,seat){return 1300},
  msgTurno(S,ctx,seat){return `Tocca a te: dardo ${S.thrown+1} di 3. Tieni premuto sul punto da colpire, lascia per lanciare.`},
  bot(S,seat,lv){
    const I=this;return candFr(S,seat,lv).map(c=>({a:I.parse(S,seat,`d|${num(c.x)}|${num(c.y)}|${c.r}`),f:{
      valore:clamp((c.mean-18)/30,-1,1),punti:clamp(c.mean/60,0,1),attacco:clamp(c.pw*2,0,1),difesa:0,rischio:-clamp(c.pb*1.5,0,1),conserva:-(c.pb>.4?1:0),posizione:0,futuro:clamp(1-c.pb,0,1)*.3,finale:c.pw>.35?1:0}}))},
  hint(S,seat){let b=null;candFr(S,seat,2).forEach(c=>{if(!b||c.sc>b.sc)b=c});return b},
  view(sh,ctx){
    const info=this,LW=400,LH=400,C=200;
    const root=E("div","sp");sh.g.append(root);
    const sc=E("div","spscore"),msg=E("div","spmsg"),cv=document.createElement("canvas");cv.id="frCanvas";cv.setAttribute("aria-label","Bersaglio");
    const help=E("p","sphelp","Tieni premuto sul punto da colpire: il cerchio si stringe e la mano si ferma. Lascia per lanciare.");
    const tools=E("div","sptools");const hb=E("button","btn ghost","💡 Aiuto");hb.id="frHint";tools.append(hb);
    root.append(sc,msg,cv,help,tools);
    let SS=null,cc=null,anim=null,hold=null,hint=null,seen=0,S_=1,raf=0;
    const mio=()=>SS&&cc&&SS.phase!=="x"&&!SS.over&&!anim&&SS.turn===cc.me&&cc.legal.length>0;
    const radius=t=>Math.max(8,46-(t/1500)*38);
    function board(x){
      x.save();x.translate(C,C);
      const g=x.createRadialGradient(0,0,0,0,0,200);g.addColorStop(0,"#2a1c12");g.addColorStop(1,"#150d08");x.fillStyle="#1a0f09";x.beginPath();x.arc(0,0,177,0,7);x.fill();
      for(let i=0;i<20;i++){const a0=-Math.PI/2+(i-.5)*Math.PI/10,a1=a0+Math.PI/10,dark=i%2===0;
        const ring=(r0,r1,col)=>{x.beginPath();x.arc(0,0,r1,a0,a1);x.arc(0,0,r0,a1,a0,true);x.closePath();x.fillStyle=col;x.fill()};
        ring(16,99,dark?"#14120f":"#efe3c3");ring(99,107,dark?"#c5271e":"#1d8a45");ring(107,162,dark?"#14120f":"#efe3c3");ring(162,170,dark?"#c5271e":"#1d8a45")}
      x.beginPath();x.arc(0,0,16,0,7);x.fillStyle="#1d8a45";x.fill();x.beginPath();x.arc(0,0,6.4,0,7);x.fillStyle="#c5271e";x.fill();
      x.strokeStyle="rgba(190,190,190,.55)";x.lineWidth=1;for(let i=0;i<20;i++){const a=-Math.PI/2+(i-.5)*Math.PI/10;x.beginPath();x.moveTo(Math.cos(a)*16,Math.sin(a)*16);x.lineTo(Math.cos(a)*170,Math.sin(a)*170);x.stroke()}
      [16,99,107,162,170].forEach(r=>{x.beginPath();x.arc(0,0,r,0,7);x.stroke()});
      x.fillStyle="#f4f0e4";x.font="700 15px system-ui,sans-serif";x.textAlign="center";x.textBaseline="middle";
      for(let i=0;i<20;i++){const ang=i*Math.PI/10;x.fillText(DORD[i],Math.sin(ang)*186,-Math.cos(ang)*186)}
      x.restore()}
    function dardo(x,px,py,k,rot){
      x.save();x.translate(C+px,C+py);x.scale(k,k);x.rotate(rot||0);
      x.fillStyle="rgba(0,0,0,.35)";x.beginPath();x.ellipse(3,4,4,3,0,0,7);x.fill();
      x.strokeStyle="#c9c9d1";x.lineWidth=2.2;x.beginPath();x.moveTo(0,0);x.lineTo(0,-24);x.stroke();
      x.fillStyle="#e23b3b";x.beginPath();x.moveTo(0,-24);x.lineTo(-7,-36);x.lineTo(0,-31);x.lineTo(7,-36);x.closePath();x.fill();
      x.fillStyle="#ffd166";x.fillRect(-1.6,-18,3.2,8);x.restore()}
    function disegna(extra){
      if(!S_)return;const x=cv.getContext("2d");x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,cv.width,cv.height);x.setTransform(S_,0,0,S_,0,0);
      x.fillStyle="#0f1226";x.fillRect(0,0,LW,LH);board(x);
      const ds=(extra&&extra.darts)||(SS?SS.darts:[]);ds.forEach(d=>dardo(x,d.x,d.y,1,.04));
      if(extra&&extra.fly)dardo(x,extra.fly.x,extra.fly.y,extra.fly.k,extra.fly.rot);
      if(hint&&!anim){x.strokeStyle="#ffd166";x.lineWidth=2.5;x.setLineDash([5,4]);x.beginPath();x.arc(C+hint.x,C+hint.y,14,0,7);x.stroke();x.setLineDash([])}
      if(hold&&!anim){const r=radius(performance.now()-hold.t0),px=C+hold.x,py=C+hold.y;
        x.strokeStyle="rgba(255,255,255,.9)";x.lineWidth=2;x.beginPath();x.arc(px,py,r,0,7);x.stroke();x.beginPath();x.moveTo(px-r-6,py);x.lineTo(px+r+6,py);x.moveTo(px,py-r-6);x.lineTo(px,py+r+6);x.stroke();
        x.fillStyle="rgba(255,214,102,.25)";x.beginPath();x.arc(px,py,r,0,7);x.fill()}}
    function layout(){S_=fit(root,cv,LW,LH,330)}
    function aggiorna(){
      const S=SS,c=cc;if(!S||!c)return;sc.innerHTML="";
      for(let i=0;i<S.n;i++){const d=E("div",S.turn===i&&!S.over?"on":"");d.append(E("b","",nomeDi(c,i)),E("em","",String(S.sc[i])),E("small","",S.turn===i&&!S.over?`dardo ${S.thrown+1}/3`:""));sc.append(d)}
      let m="Parti da 301: arriva esattamente a zero.";const e=S.ev;
      if(e&&!anim){const p=nomeDi(c,e.by);m=e.kind==="win"?`${p}: ${e.res.l} — zero! Partita vinta.`:e.kind==="bust"?`${p}: ${e.res.l} (${e.res.p}) — sballato! Il turno non vale.`:`${p}: ${e.res.l} (${e.res.p}).`}
      if(!anim&&!S.over)m+=" "+(S.turn===c.me?"Tocca a te.":`Tocca a ${nomeDi(c,S.turn)}.`);
      if(anim)m="…";msg.textContent=m}
    function lancia(S){
      const sh_=S.shot;anim={no:sh_.no};hold=null;hint=null;snd("whoosh");const t0=performance.now(),D=520;
      const frame=ts=>{if(!anim||anim.no!==sh_.no||!document.body.contains(cv))return;
        const u=Math.min(1,(ts-t0)/D),e=1-Math.pow(1-u,3);
        const x0=sh_.aim.x*.4,y0=300;disegna({darts:sh_.prev,fly:{x:x0+(sh_.x-x0)*e,y:y0+(sh_.y-y0)*e,k:2.3-1.3*e,rot:(1-e)*.5}});
        if(u>=1){snd(sh_.res.p?"thud":"board");anim=null;aggiorna();disegna({darts:sh_.prev.concat([{x:sh_.x,y:sh_.y}])});
          setTimeout(()=>{if(!anim)disegna()},900);return}
        requestAnimationFrame(frame)};requestAnimationFrame(frame);aggiorna()}
    const draw=(S,c)=>{SS=S;cc=c;if(!S_||S_===1)layout();
      if(S.shot&&S.shot.no!==seen){seen=S.shot.no;
        try{const by=S.shot.by;if(sh.logic&&c.seats[by]&&c.seats[by].tipo!=="bot"){if(S.shot.bust||S.shot.res.p===0)sh.logic.esito(by,"errore");else if(S.shot.res.p>=40)sh.logic.esito(by,"buona")}}catch(e){}
        if(window.NATAN_GIOCHI_VELOCE){anim=null;aggiorna();disegna()}else lancia(S)}
      else if(!anim){aggiorna();disegna()}};
    const pos=e=>{const p=ptr(cv,e,LW,LH);const dy=e.pointerType==="touch"?-46:0;return {x:p.x-C,y:p.y-C+dy}};
    cv.addEventListener("pointerdown",e=>{if(!mio())return;hint=null;const p=pos(e);hold={t0:performance.now(),x:p.x,y:p.y};
      const tick=()=>{if(!hold)return;disegna();raf=requestAnimationFrame(tick)};tick();try{cv.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault()});
    cv.addEventListener("pointermove",e=>{if(!hold)return;const p=pos(e);hold.x=p.x;hold.y=p.y});
    cv.addEventListener("pointerup",e=>{if(!hold)return;const h=hold,p=pos(e);hold=null;cancelAnimationFrame(raf);if(!mio()){disegna();return}
      const r=radius(performance.now()-h.t0);cc.act(`d|${num(p.x)}|${num(p.y)}|${Math.round(r*10)/10}`)});
    cv.addEventListener("pointercancel",()=>{hold=null;disegna()});
    hb.onclick=()=>{if(!mio())return;const b=info.hint(SS,cc.me);if(!b)return;hint={x:b.x,y:b.y};snd("click");disegna();msg.textContent="Il cerchio giallo è un buon punto da mirare. Tieni la mano ferma!"};
    window.addEventListener("resize",()=>{if(!document.body.contains(cv))return;layout();disegna()});
    return {draw}}
});
pic("freccette","🎯","#7a1f2b");

// ============================================================ BASKET (tiri dalla distanza che scegli)
const BK={W:640,H:400,G:900,floor:372,RL:{x:460,y:170},RR:{x:540,y:170},rr:4,br:14,board:{x:552,y0:96,y1:196},hoopX:500,
  spots:[{x:410,p:1,n:"Vicino"},{x:300,p:2,n:"Medio"},{x:170,p:3,n:"Lontano"}],hand:{y:262},tiri:8};
function simBk(spot,vx,vy,reg){
  let x=BK.spots[spot].x,y=BK.hand.y,u=vx,v=vy;const dt=1/240,fr=reg?[]:null,evs=reg?[]:null;let scored=false,py=y,rim=0,k=0,after=0,rot=0;
  const hit=(c)=>{const dx=x-c.x,dy=y-c.y,d2=dx*dx+dy*dy,R=BK.br+BK.rr;if(d2>=R*R||d2===0)return false;const d=Math.sqrt(d2),nx=dx/d,ny=dy/d;x=c.x+nx*R;y=c.y+ny*R;
    const vn=u*nx+v*ny;if(vn<0){u-=(1+.55)*vn*nx;v-=(1+.55)*vn*ny;u*=.97;v*=.97;rim++;if(reg)evs.push([k>>2,"rim",1])}return true};
  for(k=0;k<1500;k++){
    py=y;v+=BK.G*dt;x+=u*dt;y+=v*dt;rot+=u*dt*.02;
    hit(BK.RL);hit(BK.RR);
    if(x+BK.br>BK.board.x&&y>BK.board.y0&&y<BK.board.y1&&u>0){x=BK.board.x-BK.br;u=-u*.6;if(reg)evs.push([k>>2,"board",1])}
    if(y+BK.br>BK.floor&&v>0){y=BK.floor-BK.br;v=-v*.5;u*=.9;if(Math.abs(v)<40)v=0;if(reg&&Math.abs(v)>60)evs.push([k>>2,"bounce",1])}
    if(!scored&&py<BK.RL.y&&y>=BK.RL.y&&v>0&&Math.abs(x-BK.hoopX)<30){scored=true;if(reg)evs.push([k>>2,rim?"net":"swish",1])}
    if(reg&&k%4===0)fr.push([Math.round(x*10)/10,Math.round(y*10)/10,Math.round(rot*100)/100]);
    if(scored){after++;if(after>50)break}
    else if(y>BK.floor-BK.br-1&&Math.abs(u)<20&&v===0)break;
    else if(x>BK.W+40||x<-60)break}
  if(reg&&fr.length===0)fr.push([x,y,0]);
  return {scored,rim,frames:fr,evs}}
const BKN=[.05,.03,.015,.004];
register({id:"basket",ord:8,nome:"Basket",ic:"🏀",col:"#b4531a",sub:"Scegli la distanza, trascina per mirare e tira a canestro",min:2,max:2,noEval:true,
  tut:[["🏀","Lo scopo","Ognuno ha 8 tiri. Il canestro vale 1, 2 o 3 punti a seconda della distanza che scegli: più sei lontano, più vale. Vince chi fa più punti; in caso di parità si tira ancora a oltranza."],
       ["📍","La distanza","Prima di tirare scegli Vicino (1 punto), Medio (2) o Lontano (3)."],
       ["👆","Come si tira","Trascina il dito indietro e in basso, lontano dal pallone: la freccia mostra l'angolo e la forza. Lascia per tirare."],
       ["💡","Consiglio","Se sbagli, ricorda dove è passata la palla e correggi un po' l'angolo o la forza. L'Aiuto ti mostra un tiro che funziona."]],
  init(n,seed){return {sc:[0,0],shots:[0,0],turn:0,over:false,winner:-1,nm:0,ev:null,shot:null,spot:1}},
  turn(S){return S.turn},legal(S,seat){return FALSE2},
  parse(S,seat,k){const t=String(k).split("|");if(t[0]!=="b"||t.length<4)return null;const sp=+t[1],vx=+t[2],vy=+t[3];if(![sp,vx,vy].every(Number.isFinite)||sp<0||sp>2||sp!==Math.floor(sp))return null;
    const v=Math.sqrt(vx*vx+vy*vy);if(v<50)return null;const f=v>1100?1100/v:1;return {k:String(k),spot:sp,vx:vx*f,vy:vy*f}},
  apply(S,seat,a){
    const r=simBk(a.spot,a.vx,a.vy,true),pts=r.scored?BK.spots[a.spot].p:0;
    S.nm++;S.shots[seat]++;S.sc[seat]+=pts;S.spot=a.spot;S.ev={by:seat,kind:r.scored?"canestro":"fuori",pts,rim:r.rim,spot:a.spot};
    S.shot={by:seat,no:S.nm,frames:r.frames,evs:r.evs,spot:a.spot,scored:r.scored,pts};
    const tot=BK.tiri;
    if(S.shots[0]===S.shots[1]&&S.shots[0]>=tot&&(S.sc[0]!==S.sc[1]||S.shots[0]>=tot+5)){S.over=true;S.winner=S.sc[0]>S.sc[1]?0:S.sc[0]<S.sc[1]?1:-1}
    else S.turn=S.shots[0]<=S.shots[1]?0:1;
    return S},
  over(S){return S.over?(S.winner<0?{win:[],text:"Pareggio dopo i tiri supplementari!"}:{win:[S.winner],text:seats=>`${seats[S.winner].nome} vince ${S.sc[S.winner]} a ${S.sc[1-S.winner]}!`}):null},
  pausa(S,a,seat){return S.shot.frames.length*1000/60+600},
  msgTurno(S,ctx,seat){return "Tocca a te: scegli la distanza, trascina indietro e in basso per mirare, lascia per tirare"},
  bot(S,seat,lv){
    const I=this,li=lv==null?1:lv,out=[];const R=mulberry(99+S.nm*13);
    for(let sp=0;sp<3;sp++){const cand=[];
      for(let ang=32;ang<=74;ang+=2){const rad=ang*Math.PI/180,cx=Math.cos(rad),sn=Math.sin(rad);
        let lo=null;for(let v=380;v<=1100;v+=20){const vx=cx*v,vy=-sn*v;const r=simBk(sp,vx,vy,false);if(r.scored){lo=lo||{v,vx,vy,ang};
          // robustezza: stesso tiro con piccole variazioni
          const r2=simBk(sp,cx*(v+14),-sn*(v+14),false),r3=simBk(sp,cx*(v-14),-sn*(v-14),false);cand.push({sp,vx,vy,rob:(r2.scored?1:0)+(r3.scored?1:0),pts:BK.spots[sp].p});break}}}
      cand.sort((a,b)=>b.rob-a.rob);cand.slice(0,3).forEach(c=>out.push(c))}
    // un po' di imprecisione: più grande ai livelli bassi
    return out.map(c=>{const e=BKN[li],v=Math.sqrt(c.vx*c.vx+c.vy*c.vy),ang=Math.atan2(c.vy,c.vx)+(R()-.5)*2*e*3,vv=v*(1+(R()-.5)*2*e);
      const vx=Math.cos(ang)*vv,vy=Math.sin(ang)*vv,r=simBk(c.sp,vx,vy,false);
      return {a:I.parse(S,seat,`b|${c.sp}|${num(vx)}|${num(vy)}`),f:{valore:r.scored?c.pts/3:-.4,punti:r.scored?c.pts/3:0,attacco:r.scored?(c.pts>=3?.9:.4):0,difesa:0,rischio:r.scored?0:-.6,conserva:0,posizione:0,futuro:c.rob/2*.3,finale:0}}})},
  hint(S,seat){let best=null;const sp=S.spot;for(let ang=40;ang<=70&&!best;ang+=2){const rad=ang*Math.PI/180;for(let v=380;v<=1100;v+=10){const vx=Math.cos(rad)*v,vy=-Math.sin(rad)*v;if(simBk(sp,vx,vy,false).scored){best={spot:sp,vx,vy};break}}}return best},
  view(sh,ctx){
    const info=this,LW=BK.W,LH=BK.H;
    const root=E("div","sp");sh.g.append(root);
    const sc=E("div","spscore"),msg=E("div","spmsg"),cv=document.createElement("canvas");cv.id="bkCanvas";cv.setAttribute("aria-label","Campo da basket");
    const seg=E("div","spseg");const sb=BK.spots.map((s,i)=>{const b=E("button","",`${s.n} · ${s.p} pt`);b.dataset.spot=String(i);seg.append(b);return b});
    const pw=E("div","sppow");const pwi=E("i");pw.append(pwi);
    const help=E("p","sphelp","Trascina indietro e in basso, lontano dal pallone: la linea mostra la direzione e la forza. Lascia per tirare.");
    const tools=E("div","sptools");const hb=E("button","btn ghost","💡 Aiuto");hb.id="bkHint";tools.append(hb);
    root.append(sc,msg,cv,seg,pw,help,tools);
    let SS=null,cc=null,anim=null,spot=1,aim=null,drag=false,seen=0,S_=1,hint=null,stop=null,lastTrace=null;
    const mio=()=>SS&&cc&&!SS.over&&!anim&&SS.turn===cc.me&&cc.legal.length>0;
    function sel(){sb.forEach((b,i)=>b.classList.toggle("on",i===spot))}
    sb.forEach((b,i)=>b.onclick=()=>{spot=i;sel();hint=null;disegna(null)});
    function campo(x){
      const g=x.createLinearGradient(0,0,0,LH);g.addColorStop(0,"#2a3a6b");g.addColorStop(.62,"#192347");g.addColorStop(.62,"#b97b3d");g.addColorStop(1,"#8a5427");x.fillStyle=g;x.fillRect(0,0,LW,LH);
      x.fillStyle="rgba(255,255,255,.05)";for(let i=0;i<6;i++)x.fillRect(20+i*110,40,60,150);
      x.strokeStyle="rgba(255,255,255,.35)";x.lineWidth=2;BK.spots.forEach(s=>{x.beginPath();x.moveTo(s.x,BK.floor-2);x.lineTo(s.x,BK.floor+10);x.stroke()});
      x.fillStyle="#c9c9d2";x.fillRect(BK.board.x,BK.board.y0,7,BK.board.y1-BK.board.y0);x.fillStyle="#fff";x.fillRect(BK.board.x-2,BK.board.y0+8,3,70);
      x.fillStyle="#8a8a96";x.fillRect(BK.board.x+7,BK.board.y0+40,8,BK.floor-BK.board.y0-40);
      x.strokeStyle="rgba(255,255,255,.55)";x.lineWidth=1.2;for(let i=0;i<7;i++){const t=i/6;x.beginPath();x.moveTo(BK.RL.x+t*80,BK.RL.y+2);x.lineTo(BK.hoopX-20+t*40,BK.RL.y+46);x.stroke()}
      x.beginPath();x.moveTo(BK.hoopX-20,BK.RL.y+46);x.lineTo(BK.hoopX+20,BK.RL.y+46);x.stroke();
      x.strokeStyle="#ff6a2b";x.lineWidth=6;x.lineCap="round";x.beginPath();x.moveTo(BK.RL.x,BK.RL.y);x.lineTo(BK.RR.x,BK.RR.y);x.stroke();x.lineCap="butt"}
    function giocatore(x,sx){x.fillStyle="rgba(0,0,0,.28)";x.beginPath();x.ellipse(sx,BK.floor+6,26,6,0,0,7);x.fill();
      x.fillStyle="#ffd166";x.beginPath();x.arc(sx-16,BK.hand.y-52,13,0,7);x.fill();x.fillStyle="#e24c4c";x.fillRect(sx-30,BK.hand.y-38,28,56);x.fillStyle="#2b3560";x.fillRect(sx-28,BK.hand.y+18,10,56);x.fillRect(sx-14,BK.hand.y+18,10,56);
      x.strokeStyle="#ffd166";x.lineWidth=8;x.lineCap="round";x.beginPath();x.moveTo(sx-6,BK.hand.y-24);x.lineTo(sx+4,BK.hand.y);x.stroke();x.lineCap="butt"}
    function palla(x,px,py,rot){x.save();x.translate(px,py);x.rotate(rot||0);x.beginPath();x.arc(0,0,BK.br,0,7);const g=x.createRadialGradient(-5,-5,2,0,0,BK.br);g.addColorStop(0,"#ff9a4d");g.addColorStop(1,"#c2521a");x.fillStyle=g;x.fill();
      x.strokeStyle="#4a1d08";x.lineWidth=1.4;x.beginPath();x.moveTo(-BK.br,0);x.lineTo(BK.br,0);x.moveTo(0,-BK.br);x.lineTo(0,BK.br);x.moveTo(-9,-10);x.quadraticCurveTo(-3,0,-9,10);x.moveTo(9,-10);x.quadraticCurveTo(3,0,9,10);x.stroke();x.restore()}
    function disegna(b){
      const x=cv.getContext("2d");x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,cv.width,cv.height);x.setTransform(S_,0,0,S_,0,0);campo(x);
      const sx=BK.spots[spot].x;giocatore(x,sx);
      if(lastTrace&&!anim){x.fillStyle="rgba(255,255,255,.28)";lastTrace.forEach((q,i)=>{if(i%3===0){x.beginPath();x.arc(q[0],q[1],2.2,0,7);x.fill()}})}
      if(hint&&!anim){const v0=Math.sqrt(hint.vx*hint.vx+hint.vy*hint.vy);x.strokeStyle="#ffd166";x.lineWidth=3;x.setLineDash([8,6]);x.beginPath();x.moveTo(sx,BK.hand.y);x.lineTo(sx+hint.vx/v0*90,BK.hand.y+hint.vy/v0*90);x.stroke();x.setLineDash([])}
      if(aim&&!anim){let px=sx,py=BK.hand.y,u=aim.vx,v=aim.vy;x.fillStyle="rgba(255,255,255,.85)";for(let i=0;i<16;i++){for(let j=0;j<4;j++){px+=u/240;py+=v/240;v+=BK.G/240}x.beginPath();x.arc(px,py,2.6-.08*i,0,7);x.fill()}}
      const p=b||{x:sx,y:BK.hand.y,r:0};palla(x,p.x,p.y,p.r);
      pwi.style.width=Math.round((aim&&!anim?aim.pow:0)*100)+"%"}
    function layout(){S_=fit(root,cv,LW,LH,360)}
    function aggiorna(){
      const S=SS,c=cc;if(!S||!c)return;sc.innerHTML="";
      for(let i=0;i<2;i++){const d=E("div",S.turn===i&&!S.over?"on":"");d.append(E("b","",nomeDi(c,i)),E("em","",String(S.sc[i])),E("small","",`tiri ${Math.min(S.shots[i],BK.tiri)}/${BK.tiri}`+(S.shots[0]>=BK.tiri&&S.shots[1]>=BK.tiri?" · a oltranza":"")));sc.append(d)}
      const e=S.ev;let m="Otto tiri a testa: vince chi segna di più.";
      if(e&&!anim){const p=nomeDi(c,e.by);m=e.kind==="canestro"?`${p}: canestro da ${e.pts}${e.rim?" (dopo il ferro!)":""}.`:`${p}: fuori${e.rim?", ha preso il ferro":""}.`}
      if(!anim&&!S.over)m+=" "+(S.turn===c.me?"Tocca a te.":`Tocca a ${nomeDi(c,S.turn)}.`);
      if(anim)m="…";msg.textContent=m}
    function suono(k){snd(k==="net"?"swish":k)}
    function anima(S){
      const s=S.shot;anim={no:s.no};aim=null;hint=null;spot=s.spot;sel();snd("whoosh");
      stop=play(s.frames,s.evs,i=>{const f=s.frames[i];disegna({x:f[0],y:f[1],r:f[2]})},suono,()=>{lastTrace=s.frames.slice();anim=null;aggiorna();disegna(null);if(s.scored)setTimeout(()=>{if(!anim)lastTrace=null},1200)});aggiorna()}
    const draw=(S,c)=>{SS=S;cc=c;if(S_===1)layout();
      if(S.shot&&S.shot.no!==seen){seen=S.shot.no;
        try{const by=S.shot.by;if(sh.logic&&c.seats[by]&&c.seats[by].tipo!=="bot")sh.logic.esito(by,S.shot.scored?"buona":"errore")}catch(e){}
        if(window.NATAN_GIOCHI_VELOCE){anim=null}else anima(S)}
      if(!anim){sel();aggiorna();disegna(null)}};
    const calc=p=>{const sx=BK.spots[spot].x,dx=sx-p.x,dy=BK.hand.y-p.y,d=Math.sqrt(dx*dx+dy*dy);if(d<4)return null;
      const pow=clamp((d-14)/170,0,1),v=380+pow*720;return {vx:dx/d*v,vy:dy/d*v,pow}};
    cv.addEventListener("pointerdown",e=>{if(!mio())return;hint=null;drag=true;aim=calc(ptr(cv,e,LW,LH));lastTrace=null;disegna(null);try{cv.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault()});
    cv.addEventListener("pointermove",e=>{if(!drag)return;aim=calc(ptr(cv,e,LW,LH));disegna(null)});
    cv.addEventListener("pointerup",e=>{if(!drag)return;drag=false;const a=aim;aim=null;if(!a||!mio()||a.pow<.03){disegna(null);return}
      if(a.vx<=0||a.vy>=0){msg.textContent="Tira verso l'alto e verso il canestro: trascina indietro e in basso.";disegna(null);return}
      cc.act(`b|${spot}|${num(a.vx)}|${num(a.vy)}`)});
    cv.addEventListener("pointercancel",()=>{drag=false;aim=null;disegna(null)});
    hb.onclick=()=>{if(!mio())return;const h=info.hint(Object.assign({},SS,{spot}),cc.me);if(!h){msg.textContent="Da qui non trovo un tiro: prova un'altra distanza.";return}hint=h;snd("click");disegna(null);const v=Math.sqrt(h.vx*h.vx+h.vy*h.vy);msg.textContent=`La linea gialla mostra l'angolo giusto. Forza circa ${Math.round((v-380)/720*100)}%.`};
    window.addEventListener("resize",()=>{if(!document.body.contains(cv))return;layout();if(!anim)disegna(null)});
    return {draw}}
});
pic("basket","🏀","#b4531a");

// ============================================================ BOWLING (10 frames, punteggio vero)
const BW={W:220,H:720,x0:30,x1:190,pr:7,br:14,y0:24,start:668,py:96,sp:30};
function pinsIniz(){const p=[];let n=0;for(let row=0;row<4;row++)for(let i=0;i<=row;i++){p.push({n:n++,x:110+(i-row/2)*BW.sp,y:BW.py+(3-row)*(BW.sp*.87),on:true,vx:0,vy:0})}return p}
const PIN0=pinsIniz();
function simBw(stand,bx,vx,vy,reg){
  const bs=[{x:bx,y:BW.start,vx,vy,m:5,r:BW.br,ball:true,gut:false}];
  PIN0.forEach((p,i)=>bs.push({x:p.x,y:p.y,vx:0,vy:0,m:1.3,r:BW.pr,pin:i,on:stand[i],x0:p.x,y0:p.y,down:false}));
  const dt=1/240,fr=reg?[]:null,evs=reg?[]:null;let k=0,calm=0;
  for(k=0;k<2600;k++){
    for(const b of bs){if(b.pin!==undefined&&!b.on)continue;
      b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.ball){if(!b.gut&&(b.x<BW.x0+4||b.x>BW.x1-4)&&b.y>BW.py+60&&false){}
        if(!b.gut&&(b.x<BW.x0-2||b.x>BW.x1+2)){b.gut=true;b.vx=0;if(reg)evs.push([k>>2,"gutter",1])}
        if(b.gut){b.x=Math.max(BW.x0-12,Math.min(BW.x1+12,b.x))}
        b.vx*=1-.05*dt;b.vy*=1-.05*dt;if(b.y<-40){b.vy=0;b.vx=0}}
      else{const sp=Math.sqrt(b.vx*b.vx+b.vy*b.vy);if(sp>0){const ns=Math.max(0,sp-210*dt);const f=ns/sp;b.vx*=f;b.vy*=f;if(ns<5){b.vx=0;b.vy=0}}
        if(b.y<BW.y0+b.r&&b.vy<0){b.y=BW.y0+b.r;b.vy=-b.vy*.4}
        if(b.x<BW.x0-18||b.x>BW.x1+18){b.down=true}
        if(Math.abs(b.x-b.x0)>11||Math.abs(b.y-b.y0)>11)b.down=true}}
    for(let i=0;i<bs.length;i++){const a=bs[i];if(a.pin!==undefined&&!a.on)continue;
      for(let j=i+1;j<bs.length;j++){const c=bs[j];if(c.pin!==undefined&&!c.on)continue;
        if(a.gut||c.gut)continue;
        const dx=c.x-a.x,dy=c.y-a.y,R=a.r+c.r,d2=dx*dx+dy*dy;if(d2>=R*R||d2===0)continue;
        const d=Math.sqrt(d2),nx=dx/d,ny=dy/d,ov=R-d,tm=a.m+c.m;a.x-=nx*ov*c.m/tm;a.y-=ny*ov*c.m/tm;c.x+=nx*ov*a.m/tm;c.y+=ny*ov*a.m/tm;
        const rel=(a.vx-c.vx)*nx+(a.vy-c.vy)*ny;if(rel>0){const jj=(1+.78)*rel/(1/a.m+1/c.m);a.vx-=jj/a.m*nx;a.vy-=jj/a.m*ny;c.vx+=jj/c.m*nx;c.vy+=jj/c.m*ny;
          if(reg&&rel>40)evs.push([k>>2,"pin",Math.round(rel)])}}}
    if(reg&&k%4===0)fr.push(bs.map(b=>[Math.round(b.x*10)/10,Math.round(b.y*10)/10,b.pin!==undefined&&!b.on?0:1]));
    let moving=bs[0].y>-30&&(bs[0].vx||bs[0].vy);for(let i=1;i<bs.length&&!moving;i++){const b=bs[i];if((b.on||b.on===undefined&&false)&&(b.vx||b.vy))moving=true}
    if(!moving){calm++;if(calm>30)break}else calm=0}
  const down=bs.slice(1).map((b,i)=>stand[i]&&(b.down||b.y<BW.y0-2?true:false));
  const nowStand=stand.map((s,i)=>s&&!down[i]);
  return {stand:nowStand,down:stand.filter((s,i)=>s&&!nowStand[i]).length,frames:fr,evs}}
// punteggio vero: rolls è l'elenco dei tiri di un giocatore
function frameBw(rolls){const fr=[];let i=0;
  for(let f=0;f<10;f++){const r1=rolls[i];if(r1===undefined){break}
    if(f<9){if(r1===10){fr.push({r:[10],n:1});i++}else{const r2=rolls[i+1];fr.push({r:r2===undefined?[r1]:[r1,r2],n:r2===undefined?1:2});i+=2}}
    else{const a=rolls.slice(i);fr.push({r:a,n:a.length})}}
  return fr}
function totBw(rolls){let t=0,i=0;const out=[];
  for(let f=0;f<10;f++){if(rolls[i]===undefined)break;
    if(f<9){if(rolls[i]===10){if(rolls[i+2]===undefined){out.push(null);i++;continue}t+=10+rolls[i+1]+rolls[i+2];i++}
      else{if(rolls[i+1]===undefined)break;if(rolls[i]+rolls[i+1]===10){if(rolls[i+2]===undefined){out.push(null);i+=2;continue}t+=10+rolls[i+2]}else t+=rolls[i]+rolls[i+1];i+=2}
      out.push(t)}
    else{const a=rolls.slice(i);const need=(a[0]===10||(a[1]!==undefined&&a[0]+a[1]===10))?3:2;if(a.length<need){out.push(null)}else{t+=a.slice(0,need).reduce((x,y)=>x+y,0);out.push(t)}}}
  return {out,total:t}}
const BWN=[.05,.025,.01,.003];
function flowBw(rolls){            // dove si trova il giocatore: frame corrente, tiri già fatti, finito?, birilli pieni per il prossimo tiro?
  let i=0;
  for(let f=0;f<9;f++){
    if(i>=rolls.length)return {f,r:0,done:false,fresh:true};
    if(rolls[i]===10){i++;continue}
    if(i+1>=rolls.length)return {f,r:1,done:false,fresh:false};
    i+=2}
  const a=rolls.slice(i);
  if(a.length===0)return {f:9,r:0,done:false,fresh:true};
  if(a.length===1)return {f:9,r:1,done:false,fresh:a[0]===10};
  const bonus=a[0]===10||a[0]+a[1]===10;
  if(!bonus)return {f:9,r:2,done:true,fresh:true};
  if(a.length===2)return {f:9,r:2,done:false,fresh:(a[0]===10&&a[1]===10)||(a[0]!==10)};
  return {f:9,r:3,done:true,fresh:true}}
const fineFr=(S,seat)=>flowBw(S.rolls[seat]).done;
register({id:"bowling",ord:9,nome:"Bowling",ic:"🎳",col:"#2b5fa8",sub:"10 frame: posiziona la palla, trascina e lancia per fare strike",min:2,max:2,noEval:true,
  tut:[["🎳","Lo scopo","Dieci frame a testa. In ogni frame hai due lanci per abbattere i dieci birilli. Strike (tutti al primo lancio) e spare (tutti in due) danno punti bonus."],
       ["👆","Come si lancia","Trascina la palla a destra o a sinistra per sceglierne la posizione. Poi trascina indietro, lontano dalla palla: la linea mostra la direzione. Lascia per lanciare."],
       ["➕","Punteggio","Strike: 10 più i due lanci successivi. Spare: 10 più il lancio successivo. Il massimo è 300."],
       ["🕳️","Canaline","Se la palla esce dalla pista finisce nella canalina e non abbatte niente."]],
  init(n,seed){return {rolls:[[],[]],stand:PIN0.map(()=>true),roll:0,turn:0,x:110,over:false,winner:-1,nm:0,ev:null,shot:null,cur:[0,0]}},
  turn(S){return S.turn},legal(S,seat){return FALSE2},
  parse(S,seat,k){const t=String(k).split("|");if(t[0]!=="w"||t.length<4)return null;const x=+t[1],vx=+t[2],vy=+t[3];if(![x,vx,vy].every(Number.isFinite))return null;
    const v=Math.sqrt(vx*vx+vy*vy);if(v<60||vy>=0)return null;const f=v>1000?1000/v:1;return {k:String(k),x:clamp(x,BW.x0+10,BW.x1-10),vx:vx*f,vy:vy*f}},
  apply(S,seat,a){
    const fresh=S.stand.every(x=>x),prima=S.stand.filter(x=>x).length;
    const r=simBw(S.stand,a.x,a.vx,a.vy,true),n=r.down;S.nm++;S.rolls[seat].push(n);S.x=a.x;
    const fl=flowBw(S.rolls[seat]);
    S.stand=fl.fresh||fl.done?PIN0.map(()=>true):r.stand;
    S.ev={by:seat,kind:"tiro",n,strike:fresh&&n===10,spare:!fresh&&n===prima&&n>0};
    S.shot={by:seat,no:S.nm,frames:r.frames,evs:r.evs,start:{x:a.x},n};
    const d0=fineFr(S,0),d1=fineFr(S,1);
    if(d0&&d1){S.over=true;const t0=totBw(S.rolls[0]).total,t1=totBw(S.rolls[1]).total;S.winner=t0>t1?0:t1>t0?1:-1}
    else{const o=1-seat;const fineMio=fl.done,frameFinito=fl.r===0;       // un frame è finito: tocca all'altro (se non ha già finito)
      if(fineMio||frameFinito)S.turn=fineFr(S,o)?seat:o;else S.turn=seat}
    return S},
  over(S){return S.over?(S.winner<0?{win:[],text:"Pareggio!"}:{win:[S.winner],text:seats=>`${seats[S.winner].nome} vince ${totBw(S.rolls[S.winner]).total} a ${totBw(S.rolls[1-S.winner]).total}!`}):null},
  pausa(S,a,seat){return S.shot.frames.length*1000/60+500},
  msgTurno(S,ctx,seat){return "Tocca a te: sposta la palla, poi trascina indietro per mirare e lascia per lanciare"},
  bot(S,seat,lv){
    const I=this,li=lv==null?1:lv,R=mulberry(31+S.nm*17),out=[];
    for(let x=60;x<=160;x+=10)for(let off=-16;off<=16;off+=4)for(const v of [750,900]){
      const tx=110+off,ty=BW.py+20,dx=tx-x,dy=ty-BW.start,d=Math.sqrt(dx*dx+dy*dy);
      const e=BWN[li],ang=Math.atan2(dy,dx)+(R()-.5)*2*e,vv=v*(1+(R()-.5)*e);const vx=Math.cos(ang)*vv,vy=Math.sin(ang)*vv;
      const r=simBw(S.stand,x,vx,vy,false);const nr=S.stand.filter(x=>x).length;
      out.push({a:I.parse(S,seat,`w|${x}|${num(vx)}|${num(vy)}`),n:r.down,nr,f:{valore:r.down/Math.max(1,nr),punti:r.down/10,attacco:r.down===nr?.9:0,difesa:0,rischio:r.down===0?-.6:0,conserva:0,posizione:0,futuro:0,finale:r.down===nr?1:0}})}
    out.sort((a,b)=>b.n-a.n);return out.slice(0,16)},
  hint(S,seat){let best=null,bn=-1;const li=3;for(let x=70;x<=150;x+=10)for(let off=-12;off<=12;off+=4){const tx=110+off,ty=BW.py+20,dx=tx-x,dy=ty-BW.start,d=Math.sqrt(dx*dx+dy*dy),vx=dx/d*850,vy=dy/d*850;const r=simBw(S.stand,x,vx,vy,false);if(r.down>bn){bn=r.down;best={x,vx,vy}}}return best},
  view(sh,ctx){
    const info=this,LW=BW.W,LH=BW.H;
    const root=E("div","sp");sh.g.append(root);
    const sc=E("div","spscore"),msg=E("div","spmsg"),cv=document.createElement("canvas");cv.id="bwCanvas";cv.setAttribute("aria-label","Pista da bowling");
    const tab=E("div","sptools");tab.id="bwTab";tab.style.fontSize="12px";
    const pw=E("div","sppow");const pwi=E("i");pw.append(pwi);
    const help=E("p","sphelp","Trascina la palla per spostarla. Poi trascina indietro, lontano dalla palla, per mirare. Lascia per lanciare.");
    const tools=E("div","sptools");const hb=E("button","btn ghost","💡 Aiuto");hb.id="bwHint";tools.append(hb);
    root.append(sc,msg,cv,pw,tab,help,tools);
    let SS=null,cc=null,anim=null,aim=null,drag=null,hint=null,bx=110,seen=0,S_=1;
    const mio=()=>SS&&cc&&!SS.over&&!anim&&SS.turn===cc.me&&cc.legal.length>0;
    function pista(x){
      x.fillStyle="#1a1020";x.fillRect(0,0,LW,LH);
      x.fillStyle="#0e0a14";x.fillRect(BW.x0-24,0,24,LH);x.fillRect(BW.x1,0,24,LH);
      const g=x.createLinearGradient(BW.x0,0,BW.x1,0);g.addColorStop(0,"#c48a4a");g.addColorStop(.5,"#e0aa66");g.addColorStop(1,"#c48a4a");x.fillStyle=g;x.fillRect(BW.x0,0,BW.x1-BW.x0,LH);
      x.strokeStyle="rgba(120,70,30,.35)";x.lineWidth=1;for(let i=1;i<10;i++){const px=BW.x0+i*16;x.beginPath();x.moveTo(px,0);x.lineTo(px,LH);x.stroke()}
      x.fillStyle="rgba(60,30,10,.55)";for(let i=0;i<7;i++){x.beginPath();x.moveTo(110+(i-3)*14,BW.start-150-i%3*10);x.lineTo(110+(i-3)*14-4,BW.start-134-i%3*10);x.lineTo(110+(i-3)*14+4,BW.start-134-i%3*10);x.closePath();x.fill()}
      x.fillStyle="#222";x.fillRect(BW.x0,0,BW.x1-BW.x0,BW.y0-4);x.fillStyle="rgba(0,0,0,.5)";x.fillRect(BW.x0,BW.y0-6,BW.x1-BW.x0,6)}
    function pino(x,p){x.save();x.translate(p[0],p[1]);x.fillStyle="rgba(0,0,0,.25)";x.beginPath();x.ellipse(2,3,BW.pr,BW.pr*.8,0,0,7);x.fill();
      const g=x.createRadialGradient(-2,-2,1,0,0,BW.pr);g.addColorStop(0,"#fff");g.addColorStop(1,"#d9d9e0");x.fillStyle=g;x.beginPath();x.arc(0,0,BW.pr,0,7);x.fill();x.fillStyle="#d32f2f";x.beginPath();x.arc(0,0,BW.pr*.5,0,7);x.fill();x.restore()}
    function pallaB(x,px,py){x.save();x.translate(px,py);x.fillStyle="rgba(0,0,0,.3)";x.beginPath();x.ellipse(3,4,BW.br,BW.br*.85,0,0,7);x.fill();
      const g=x.createRadialGradient(-5,-5,2,0,0,BW.br);g.addColorStop(0,"#6aa6ff");g.addColorStop(1,"#10306e");x.fillStyle=g;x.beginPath();x.arc(0,0,BW.br,0,7);x.fill();
      x.fillStyle="#08183c";[[-3,-3],[3,-4],[0,3]].forEach(([a,b])=>{x.beginPath();x.arc(a,b,1.8,0,7);x.fill()});x.restore()}
    function disegna(f){
      const x=cv.getContext("2d");x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,cv.width,cv.height);x.setTransform(S_,0,0,S_,0,0);pista(x);
      if(f){f.slice(1).forEach((p,i)=>{if(p[2])pino(x,p)});pallaB(x,f[0][0],f[0][1])}
      else{const st=SS?SS.stand:PIN0.map(()=>true);PIN0.forEach((p,i)=>{if(st[i])pino(x,[p.x,p.y])});
        const cx=(drag==="place"||aim)?bx:(SS?SS.x:110);
        if(hint&&!anim){x.strokeStyle="#ffd166";x.lineWidth=3;x.setLineDash([8,6]);x.beginPath();x.moveTo(hint.x,BW.start);const d=Math.sqrt(hint.vx*hint.vx+hint.vy*hint.vy);x.lineTo(hint.x+hint.vx/d*520,BW.start+hint.vy/d*520);x.stroke();x.setLineDash([])}
        if(aim&&!anim){x.strokeStyle="rgba(255,255,255,.85)";x.lineWidth=2;x.setLineDash([6,5]);x.beginPath();x.moveTo(bx,BW.start);x.lineTo(bx+aim.dx*540,BW.start+aim.dy*540);x.stroke();x.setLineDash([])}
        if(mio()&&!aim){x.strokeStyle="rgba(255,255,255,.55)";x.lineWidth=2;x.setLineDash([4,4]);x.beginPath();x.arc(bx,BW.start,BW.br*1.9,0,7);x.stroke();x.setLineDash([])}
        pallaB(x,bx,BW.start)}
      pwi.style.width=Math.round((aim&&!anim?aim.pow:0)*100)+"%"}
    function layout(){S_=fit(root,cv,LW,LH,380)}
    function tabella(){
      const S=SS,c=cc;if(!S||!c)return;tab.innerHTML="";
      for(let s=0;s<2;s++){const t=totBw(S.rolls[s]),f=frameBw(S.rolls[s]);const d=E("div","");d.style.cssText="background:rgba(255,255,255,.06);border-radius:10px;padding:5px 8px;min-width:150px";
        d.append(E("b","",nomeDi(c,s)+": "));const row=E("span","",f.map((fr,i)=>{const r=fr.r;let s2;if(i<9)s2=r[0]===10?"X":(r.length>1?(r[0]+r[1]===10?(r[0]||"-")+"/":(r[0]||"-")+(r[1]||"-")):(r[0]||"-")+"");else s2=r.map((v,j)=>v===10?"X":(j>0&&r[j-1]!==10&&r[j-1]+v===10?"/":v||"-")).join("");return s2}).join(" · ")||"—");d.append(row);tab.append(d)}}
    function aggiorna(){
      const S=SS,c=cc;if(!S||!c)return;sc.innerHTML="";
      for(let i=0;i<2;i++){const d=E("div",S.turn===i&&!S.over?"on":"");const t=totBw(S.rolls[i]);d.append(E("b","",nomeDi(c,i)),E("em","",String(t.total)),E("small","",`frame ${Math.min(10,frameBw(S.rolls[i]).length||1)}/10`));sc.append(d)}
      let m="Dieci frame a testa. Più birilli abbatti, più punti fai.";const e=S.ev;
      if(e&&!anim){const p=nomeDi(c,e.by);m=e.strike?`${p}: STRIKE! Tutti giù.`:e.spare?`${p}: spare, ${e.n} birilli.`:e.n?`${p}: ${e.n} ${e.n===1?"birillo":"birilli"}.`:`${p}: nessun birillo.`}
      if(!anim&&!S.over)m+=" "+(S.turn===c.me?"Tocca a te.":`Tocca a ${nomeDi(c,S.turn)}.`);
      if(anim)m="…";msg.textContent=m;tabella()}
    function suono(k,v){if(k==="pin"){if(v>40)snd("pin")}else snd(k)}
    function anima(S){const s=S.shot;anim={no:s.no};aim=null;hint=null;bx=s.start.x;snd("roll");
      play(s.frames,s.evs,i=>disegna(s.frames[i]),suono,()=>{anim=null;if(s.n>=10)snd("strike");aggiorna();disegna(null)});aggiorna()}
    const draw=(S,c)=>{SS=S;cc=c;if(S_===1)layout();
      if(!drag&&!aim)bx=S.x;
      if(S.shot&&S.shot.no!==seen){seen=S.shot.no;
        try{const by=S.shot.by;if(sh.logic&&c.seats[by]&&c.seats[by].tipo!=="bot")sh.logic.esito(by,S.shot.n>=7?"buona":S.shot.n<=2?"errore":null)}catch(e){}
        if(window.NATAN_GIOCHI_VELOCE){anim=null}else anima(S)}
      if(!anim){aggiorna();disegna(null)}};
    cv.addEventListener("pointerdown",e=>{if(!mio())return;hint=null;const p=ptr(cv,e,LW,LH);
      if(Math.hypot(p.x-bx,p.y-BW.start)<BW.br*2.6){drag="place"}else{drag="aim";mira(p)}
      try{cv.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault();disegna(null)});
    cv.addEventListener("pointermove",e=>{if(!drag)return;const p=ptr(cv,e,LW,LH);if(drag==="place"){bx=clamp(p.x,BW.x0+10,BW.x1-10);disegna(null)}else mira(p)});
    function mira(p){const dx=bx-p.x,dy=BW.start-p.y,d=Math.sqrt(dx*dx+dy*dy);if(d<4){aim=null;return}
      aim={dx:dx/d,dy:dy/d,pow:clamp((d-14)/200,0,1)};disegna(null)}
    cv.addEventListener("pointerup",e=>{const d=drag;drag=null;if(d!=="aim"){disegna(null);return}const a=aim;aim=null;if(!a||!mio()||a.pow<.04||a.dy>=-.15){if(a&&a.dy>=-.15)msg.textContent="Tira verso i birilli: trascina verso il basso, lontano da loro.";disegna(null);return}
      const v=450+a.pow*550;cc.act(`w|${Math.round(bx*10)/10}|${num(a.dx*v)}|${num(a.dy*v)}`)});
    cv.addEventListener("pointercancel",()=>{drag=null;aim=null;disegna(null)});
    hb.onclick=()=>{if(!mio())return;const h=info.hint(SS,cc.me);if(!h)return;hint=h;bx=h.x;snd("click");disegna(null);msg.textContent="La linea gialla è una buona traiettoria. Posiziona la palla dove parte e tira con forza media-alta."};
    window.addEventListener("resize",()=>{if(!document.body.contains(cv))return;layout();if(!anim)disegna(null)});
    return {draw}}
});
pic("bowling","🎳","#2b5fa8");

// ============================================================ CURLING (3 mani da 4 sassi a testa)
const CU={W:240,H:720,cx:120,cy:140,r:[14,46,80,112],sr:16,start:672,hog:470,back:20,ends:3,per:4,acc:420};
function distC(s){const dx=s.x-CU.cx,dy=s.y-CU.cy;return Math.sqrt(dx*dx+dy*dy)}
function simCu(stones,x0,vx,vy,seat,reg){
  const bs=stones.filter(s=>s.on).map(s=>({x:s.x,y:s.y,seat:s.seat,vx:0,vy:0,on:true,id:s.id}));
  const nid=1+stones.reduce((m,s)=>Math.max(m,s.id||0),0);
  bs.push({x:x0,y:CU.start,seat,vx,vy,on:true,id:nid,nuovo:true});
  const dt=1/300,fr=reg?[]:null,evs=reg?[]:null;let k=0,calm=0,slideSnd=0;
  for(k=0;k<9000;k++){
    let moving=false;
    for(const b of bs){if(!b.on)continue;const sp=Math.sqrt(b.vx*b.vx+b.vy*b.vy);if(sp>0){moving=true;const ns=Math.max(0,sp-CU.acc*dt);const f=ns/sp;b.vx*=f;b.vy*=f;if(ns<3){b.vx=0;b.vy=0}}
      b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.x<CU.sr-2||b.x>CU.W-CU.sr+2){b.on=false;if(reg)evs.push([k/5|0,"out",1])}
      else if(b.y<CU.back){b.on=false;if(reg)evs.push([k/5|0,"out",1])}}
    const D=2*CU.sr;
    for(let i=0;i<bs.length;i++){const a=bs[i];if(!a.on)continue;
      for(let j=i+1;j<bs.length;j++){const c=bs[j];if(!c.on)continue;
        const dx=c.x-a.x,dy=c.y-a.y,d2=dx*dx+dy*dy;if(d2>=D*D||d2===0)continue;
        const d=Math.sqrt(d2),nx=dx/d,ny=dy/d,ov=(D-d)/2;a.x-=nx*ov;a.y-=ny*ov;c.x+=nx*ov;c.y+=ny*ov;
        const rel=(a.vx-c.vx)*nx+(a.vy-c.vy)*ny;if(rel>0){const jv=rel*.96;a.vx-=jv*nx;a.vy-=jv*ny;c.vx+=jv*nx;c.vy+=jv*ny;if(reg&&rel>25)evs.push([k/5|0,"stone",Math.round(rel)])}}}
    if(reg&&k%5===0)fr.push(bs.map(b=>[Math.round(b.x*10)/10,Math.round(b.y*10)/10,b.on?1:0]));
    if(!moving){calm++;if(calm>20)break}else calm=0}
  // il sasso che non ha superato la linea di lancio (hog) è fuori
  const nuovo=bs[bs.length-1];if(nuovo.on&&nuovo.y>CU.hog){nuovo.on=false;if(reg&&fr.length)fr[fr.length-1][bs.length-1][2]=0}
  const out=bs.map(b=>({id:b.id,seat:b.seat,x:b.x,y:b.y,on:b.on}));
  return {stones:out,frames:fr,evs,seats:bs.map(b=>b.seat)}}
// punteggio della mano: chi ha il sasso più vicino al centro segna un punto per ogni suo sasso più vicino del miglior sasso avversario
function puntiMano(stones){
  const dentro=stones.filter(s=>s.on&&distC(s)<CU.r[3]+CU.sr).sort((a,b)=>distC(a)-distC(b));
  if(!dentro.length)return {seat:-1,pts:0};
  const w=dentro[0].seat;let n=0;for(const s of dentro){if(s.seat===w)n++;else break}
  return {seat:w,pts:n}}
const CUN=[.05,.025,.011,.004];
register({id:"curling",ord:10,nome:"Curling",ic:"🥌",col:"#1f6f8b",sub:"Fai scivolare i sassi verso il centro e butta fuori quelli avversari",min:2,max:2,noEval:true,
  tut:[["🥌","Lo scopo","Tre mani. In ogni mano ognuno lancia 4 sassi a turno. Vince la mano chi ha il sasso più vicino al centro del bersaglio, e fa un punto per ogni suo sasso più vicino di quelli dell'avversario."],
       ["👆","Come si lancia","Trascina indietro, lontano dal sasso: la linea mostra la direzione, più tiri e più forte va. Lascia per lanciare. Il sasso può anche urtare gli altri."],
       ["🚫","Fuori gioco","Un sasso che esce dai lati o dal fondo è eliminato. Se non supera la linea tratteggiata è eliminato anche lui."],
       ["💡","Strategia","Metti un sasso davanti al bersaglio come protezione, oppure colpisci forte per buttare fuori quelli avversari."]],
  init(n,seed){return {stones:[],end:0,throws:[0,0],sc:[0,0],ends:[],turn:0,first:0,over:false,winner:-1,nm:0,ev:null,shot:null}},
  turn(S){return S.turn},legal(S,seat){return FALSE2},
  parse(S,seat,k){const t=String(k).split("|");if(t[0]!=="c"||t.length<4)return null;const x=+t[1],vx=+t[2],vy=+t[3];if(![x,vx,vy].every(Number.isFinite)||vy>=0)return null;
    const v=Math.sqrt(vx*vx+vy*vy);if(v<60)return null;const f=v>1000?1000/v:1;return {k:String(k),x:clamp(x,40,CU.W-40),vx:vx*f,vy:vy*f}},
  apply(S,seat,a){
    const r=simCu(S.stones,a.x,a.vx,a.vy,seat,true);S.nm++;S.throws[seat]++;S.stones=r.stones.filter(s=>s.on);
    S.shot={by:seat,no:S.nm,frames:r.frames,evs:r.evs,seats:r.seats,x:a.x,id:r.stones[r.stones.length-1].id,fuori:!r.stones[r.stones.length-1].on};
    S.ev={by:seat,kind:"lancio",fuori:S.shot.fuori};
    const tot=CU.per;
    if(S.throws[0]>=tot&&S.throws[1]>=tot){          // mano finita
      const m=puntiMano(S.stones);if(m.seat>=0)S.sc[m.seat]+=m.pts;S.ends.push(m);S.ev={by:seat,kind:"mano",m};
      S.end++;S.throws=[0,0];S.stones=[];
      S.first=m.seat>=0?1-m.seat:1-S.first;S.turn=S.first;                                     // chi ha perso la mano inizia la prossima
      if(S.end>=CU.ends&&(S.sc[0]!==S.sc[1]||S.end>=CU.ends+3)){S.over=true;S.winner=S.sc[0]>S.sc[1]?0:S.sc[0]<S.sc[1]?1:-1}}
    else S.turn=S.throws[S.first]<=S.throws[1-S.first]?S.first:1-S.first;
    return S},
  over(S){return S.over?(S.winner<0?{win:[],text:"Pareggio!"}:{win:[S.winner],text:seats=>`${seats[S.winner].nome} vince ${S.sc[S.winner]} a ${S.sc[1-S.winner]}!`}):null},
  pausa(S,a,seat){return S.shot.frames.length*1000/60+(S.ev&&S.ev.kind==="mano"?1500:500)},
  msgTurno(S,ctx,seat){return "Tocca a te: trascina indietro per mirare, lascia per lanciare il sasso"},
  bot(S,seat,lv){
    const I=this,li=lv==null?1:lv,R=mulberry(7+S.nm*19),out=[],opp=S.stones.filter(s=>s.seat!==seat);
    const base=S.stones;const eval_=r=>{const st=r.stones;const m=puntiMano(st);const mio=m.seat===seat?m.pts:(m.seat<0?0:-m.pts);return mio};
    const push=(x,dx,dy,v,tag)=>{const e=CUN[li],ang=Math.atan2(dy,dx)+(R()-.5)*2*e,vv=v*(1+(R()-.5)*e),vx=Math.cos(ang)*vv,vy=Math.sin(ang)*vv;
      const r=simCu(base,x,vx,vy,seat,false);const val=eval_(r),nuovo=r.stones[r.stones.length-1];
      const tuoi=r.stones.filter(s=>s.on&&s.seat===seat).length-base.filter(s=>s.seat===seat).length,loro=opp.length-r.stones.filter(s=>s.on&&s.seat!==seat).length;
      out.push({a:I.parse(S,seat,`c|${x}|${num(vx)}|${num(vy)}`),f:{valore:clamp(val/3,-1,1),punti:clamp(val/4,0,1),attacco:clamp(loro/2,0,1),difesa:nuovo.on&&nuovo.y<CU.hog?.3:0,rischio:nuovo.on?0:-.5,conserva:0,posizione:nuovo.on?clamp(1-distC(nuovo)/200,0,1):0,futuro:clamp(val/6,0,.3),finale:0}})};
    for(const v of [610,650,690,730,770])for(const x of [CU.cx-14,CU.cx,CU.cx+14])push(x,CU.cx-x,CU.cy-CU.start+(CU.hog-CU.hog),v,"draw");
    for(const s of opp.slice(0,5))for(const v of [820,950]){const dx=s.x-CU.cx,dy=s.y-CU.start;push(CU.cx,dx,dy,v,"take")}
    for(const v of [520,550])push(CU.cx,0,-1,v,"guardia");
    return out},
  hint(S,seat){let best=null,bv=-99;for(const v of [640,680,720]){const r=simCu(S.stones,CU.cx,0,-v,seat,false);const m=puntiMano(r.stones);const val=m.seat===seat?m.pts:(m.seat<0?0:-m.pts);const n=r.stones[r.stones.length-1];const sc=val*10+(n.on?-distC(n)/100:-9);if(sc>bv){bv=sc;best={x:CU.cx,vx:0,vy:-v}}}return best},
  view(sh,ctx){
    const info=this,LW=CU.W,LH=CU.H;
    const root=E("div","sp");sh.g.append(root);
    const sc=E("div","spscore"),msg=E("div","spmsg"),cv=document.createElement("canvas");cv.id="cuCanvas";cv.setAttribute("aria-label","Pista da curling");
    const pw=E("div","sppow");const pwi=E("i");pw.append(pwi);
    const help=E("p","sphelp","Trascina indietro, lontano dal sasso: la linea mostra la direzione, più tiri e più forte va. Lascia per lanciare.");
    const tools=E("div","sptools");const hb=E("button","btn ghost","💡 Aiuto");hb.id="cuHint";tools.append(hb);
    root.append(sc,msg,cv,pw,help,tools);
    let SS=null,cc=null,anim=null,aim=null,drag=false,hint=null,seen=0,S_=1;
    const mio=()=>SS&&cc&&!SS.over&&!anim&&SS.turn===cc.me&&cc.legal.length>0;
    const COL=["#d8372f","#f2c230"];
    function pista(x){
      const g=x.createLinearGradient(0,0,0,LH);g.addColorStop(0,"#dcefff");g.addColorStop(1,"#bcd8ee");x.fillStyle=g;x.fillRect(0,0,LW,LH);
      x.strokeStyle="rgba(120,160,190,.4)";x.lineWidth=1;for(let i=0;i<14;i++){x.beginPath();x.moveTo(8+i*17,0);x.lineTo(8+i*17+(i%3-1)*6,LH);x.stroke()}
      CU.r.slice().reverse().forEach((r,i)=>{x.beginPath();x.arc(CU.cx,CU.cy,r,0,7);x.fillStyle=["#2a62b8","#fff","#d8372f","#fff"][i];x.fill()});
      x.beginPath();x.arc(CU.cx,CU.cy,CU.r[0]*.55,0,7);x.fillStyle="#fff";x.fill();
      x.strokeStyle="rgba(30,50,90,.5)";x.lineWidth=2;x.beginPath();x.moveTo(0,CU.cy);x.lineTo(LW,CU.cy);x.moveTo(CU.cx,0);x.lineTo(CU.cx,LH);x.stroke();
      x.setLineDash([8,6]);x.strokeStyle="rgba(200,50,50,.7)";x.lineWidth=3;x.beginPath();x.moveTo(0,CU.hog);x.lineTo(LW,CU.hog);x.stroke();x.setLineDash([]);
      x.fillStyle="rgba(20,40,80,.8)";x.fillRect(0,0,LW,CU.back-6);x.fillRect(0,0,6,LH);x.fillRect(LW-6,0,6,LH)}
    function sasso(x,px,py,seat,sel){x.save();x.translate(px,py);x.fillStyle="rgba(0,0,0,.25)";x.beginPath();x.ellipse(2,3,CU.sr,CU.sr*.9,0,0,7);x.fill();
      const g=x.createRadialGradient(-5,-5,2,0,0,CU.sr);g.addColorStop(0,"#d9dce4");g.addColorStop(1,"#80848f");x.fillStyle=g;x.beginPath();x.arc(0,0,CU.sr,0,7);x.fill();
      x.fillStyle=COL[seat];x.beginPath();x.arc(0,0,CU.sr*.62,0,7);x.fill();x.fillStyle="rgba(0,0,0,.35)";x.fillRect(-CU.sr*.15,-CU.sr*.62,CU.sr*.3,CU.sr*1.24);
      if(sel){x.strokeStyle="#fff";x.lineWidth=2;x.beginPath();x.arc(0,0,CU.sr+3,0,7);x.stroke()}x.restore()}
    function disegna(f){
      const x=cv.getContext("2d");x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,cv.width,cv.height);x.setTransform(S_,0,0,S_,0,0);pista(x);
      const S=SS;
      if(f){f.forEach((p,i)=>{if(p[2])sasso(x,p[0],p[1],S.shot.seats[i],false)})}
      else if(S){S.stones.forEach(s=>sasso(x,s.x,s.y,s.seat,false));
        if(mio()){if(hint){x.strokeStyle="#0a3d62";x.lineWidth=3;x.setLineDash([8,6]);x.beginPath();x.moveTo(hint.x,CU.start);const d=Math.sqrt(hint.vx*hint.vx+hint.vy*hint.vy);x.lineTo(hint.x+hint.vx/d*500,CU.start+hint.vy/d*500);x.stroke();x.setLineDash([])}
          if(aim){x.strokeStyle="rgba(20,40,90,.85)";x.lineWidth=2.5;x.setLineDash([7,5]);x.beginPath();x.moveTo(CU.cx,CU.start);x.lineTo(CU.cx+aim.dx*(180+aim.pow*340),CU.start+aim.dy*(180+aim.pow*340));x.stroke();x.setLineDash([])}
          sasso(x,CU.cx,CU.start,SS.turn,true)}}
      pwi.style.width=Math.round((aim&&!anim?aim.pow:0)*100)+"%"}
    function layout(){S_=fit(root,cv,LW,LH,360)}
    function aggiorna(){
      const S=SS,c=cc;if(!S||!c)return;sc.innerHTML="";
      for(let i=0;i<2;i++){const d=E("div",S.turn===i&&!S.over?"on":"");d.append(E("b","",nomeDi(c,i)),E("em","",String(S.sc[i])),E("small","",`${i===0?"🔴":"🟡"} sassi ${CU.per-S.throws[i]} · mano ${Math.min(S.end+1,CU.ends)}/${CU.ends}`));sc.append(d)}
      let m="Tre mani da 4 sassi a testa: vince chi segna più punti.";const e=S.ev;
      if(e&&!anim){const p=nomeDi(c,e.by);if(e.kind==="mano")m=e.m.seat<0?"Mano finita: nessun punto.":`Mano finita: ${nomeDi(c,e.m.seat)} segna ${e.m.pts} ${e.m.pts===1?"punto":"punti"}.`;else m=e.fuori?`${p}: il sasso è fuori gioco.`:`${p}: sasso lanciato.`}
      if(!anim&&!S.over)m+=" "+(S.turn===c.me?"Tocca a te.":`Tocca a ${nomeDi(c,S.turn)}.`);
      if(anim)m="…";msg.textContent=m}
    function suono(k,v){snd(k==="stone"?"stone":k==="out"?"bounce":k)}
    function anima(S){const s=S.shot;anim={no:s.no};aim=null;hint=null;snd("slide");
      play(s.frames,s.evs,i=>disegna(s.frames[i]),suono,()=>{anim=null;aggiorna();disegna(null)});aggiorna()}
    const draw=(S,c)=>{SS=S;cc=c;if(S_===1)layout();
      if(S.shot&&S.shot.no!==seen){seen=S.shot.no;
        try{const by=S.shot.by;if(sh.logic&&c.seats[by]&&c.seats[by].tipo!=="bot"){const n=S.stones.length;if(S.shot.fuori)sh.logic.esito(by,"errore")}}catch(e){}
        if(window.NATAN_GIOCHI_VELOCE){anim=null}else anima(S)}
      if(!anim){aggiorna();disegna(null)}};
    cv.addEventListener("pointerdown",e=>{if(!mio())return;hint=null;drag=true;mira(ptr(cv,e,LW,LH));try{cv.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault()});
    cv.addEventListener("pointermove",e=>{if(drag)mira(ptr(cv,e,LW,LH))});
    function mira(p){const dx=CU.cx-p.x,dy=CU.start-p.y,d=Math.sqrt(dx*dx+dy*dy);if(d<4){aim=null;disegna(null);return}aim={dx:dx/d,dy:dy/d,pow:clamp((d-14)/230,0,1)};disegna(null)}
    cv.addEventListener("pointerup",e=>{if(!drag)return;drag=false;const a=aim;aim=null;if(!a||!mio()||a.pow<.03){disegna(null);return}
      if(a.dy>=-.2){msg.textContent="Lancia verso il bersaglio: trascina verso il basso, lontano da lui.";disegna(null);return}
      const v=380+a.pow*620;cc.act(`c|${CU.cx}|${num(a.dx*v)}|${num(a.dy*v)}`)});
    cv.addEventListener("pointercancel",()=>{drag=false;aim=null;disegna(null)});
    hb.onclick=()=>{if(!mio())return;const h=info.hint(SS,cc.me);if(!h)return;hint=h;snd("click");disegna(null);const v=Math.sqrt(h.vx*h.vx+h.vy*h.vy);msg.textContent=`Una buona traiettoria: dritta, con forza circa ${Math.round((v-380)/620*100)}%.`};
    window.addEventListener("resize",()=>{if(!document.body.contains(cv))return;layout();if(!anim)disegna(null)});
    return {draw}}
});
pic("curling","🥌","#1f6f8b");

// ============================================================ MINIGOLF (3 buche, vince chi fa meno colpi)
const GF={W:400,H:560,br:8,hr:12,acc:230,max:7,
  holes:[
    {par:2,tee:[200,500],hole:[200,90],walls:[[110,250,180,18]],bump:[]},
    {par:3,tee:[90,500],hole:[90,90],walls:[[0,300,270,18],[150,120,18,120]],bump:[]},
    {par:3,tee:[200,500],hole:[200,80],walls:[],bump:[[130,300,28],[270,300,28],[200,190,28]]}]};
function simGf(h,x0,y0,vx,vy,reg){
  const H=GF.holes[h];let x=x0,y=y0,u=vx,v=vy,k=0,dentro=false,calm=0;const dt=1/300,fr=reg?[]:null,evs=reg?[]:null,R=GF.br;
  const W=H.walls.map(w=>({x0:w[0],y0:w[1],x1:w[0]+w[2],y1:w[1]+w[3]}));
  for(k=0;k<6000;k++){
    const sp=Math.sqrt(u*u+v*v);if(sp>0){const ns=Math.max(0,sp-GF.acc*dt);u*=ns/sp;v*=ns/sp;if(ns<4){u=0;v=0}}
    x+=u*dt;y+=v*dt;
    if(x<R){x=R;u=-u*.8;if(reg)evs.push([k/5|0,"wall",1])}if(x>GF.W-R){x=GF.W-R;u=-u*.8;if(reg)evs.push([k/5|0,"wall",1])}
    if(y<R){y=R;v=-v*.8;if(reg)evs.push([k/5|0,"wall",1])}if(y>GF.H-R){y=GF.H-R;v=-v*.8;if(reg)evs.push([k/5|0,"wall",1])}
    for(const w of W){const cx=Math.max(w.x0,Math.min(x,w.x1)),cy=Math.max(w.y0,Math.min(y,w.y1)),dx=x-cx,dy=y-cy,d2=dx*dx+dy*dy;
      if(d2<R*R){let nx,ny,d;if(d2===0){nx=0;ny=-1;d=0}else{d=Math.sqrt(d2);nx=dx/d;ny=dy/d}
        x=cx+nx*R;y=cy+ny*R;const vn=u*nx+v*ny;if(vn<0){u-=1.8*vn*nx;v-=1.8*vn*ny;if(reg)evs.push([k/5|0,"wall",1])}}}
    for(const b of H.bump){const dx=x-b[0],dy=y-b[1],d2=dx*dx+dy*dy,RR=R+b[2];if(d2<RR*RR&&d2>0){const d=Math.sqrt(d2),nx=dx/d,ny=dy/d;x=b[0]+nx*RR;y=b[1]+ny*RR;const vn=u*nx+v*ny;if(vn<0){u-=2*vn*nx;v-=2*vn*ny;u*=1.02;v*=1.02;if(reg)evs.push([k/5|0,"wall",1])}}}
    const hx=H.hole[0]-x,hy=H.hole[1]-y,hd=Math.sqrt(hx*hx+hy*hy),s2=Math.sqrt(u*u+v*v);
    if(hd<GF.hr&&s2<430){dentro=true;x=H.hole[0];y=H.hole[1];u=0;v=0;if(reg)evs.push([k/5|0,"hole",1]);if(reg&&k%5!==0)fr.push([x,y]);break}
    if(hd<GF.hr*2.2&&s2<170&&hd>1){u+=hx/hd*260*dt;v+=hy/hd*260*dt}      // un po' di attrazione vicino alla buca se va piano
    if(reg&&k%5===0)fr.push([Math.round(x*10)/10,Math.round(y*10)/10]);
    if(u===0&&v===0){calm++;if(calm>10)break}else calm=0}
  if(reg&&!fr.length)fr.push([x,y]);
  return {x,y,dentro,frames:fr,evs}}
const GFN=[.07,.035,.014,.004];
const dGf=(h,x,y)=>{const H=GF.holes[h];return Math.sqrt((x-H.hole[0])*(x-H.hole[0])+(y-H.hole[1])*(y-H.hole[1]))};
function turnoGf(S){      // gioca per primo chi è più lontano dalla buca (tra chi non ha finito)
  let b=-1,bd=-1;for(let i=0;i<2;i++){if(S.balls[i].in)continue;const d=dGf(S.hole,S.balls[i].x,S.balls[i].y);if(d>bd+1e-9||(b<0)){if(d>bd){bd=d;b=i}}}return b<0?0:b}
register({id:"minigolf",ord:11,nome:"Minigolf",ic:"⛳",col:"#2f7d3b",sub:"Tre buche: meno colpi fai, meglio è. Occhio agli ostacoli",min:2,max:2,noEval:true,
  tut:[["⛳","Lo scopo","Tre buche. Imbuca la pallina con meno colpi possibile: vince chi alla fine ha fatto meno colpi in tutto. Dopo 7 colpi la buca è persa e conta 8."],
       ["👆","Come si tira","Trascina indietro, lontano dalla pallina: la linea mostra la direzione, più tiri e più forte colpisci. Lascia per tirare."],
       ["🧱","Gli ostacoli","Muri e paletti fanno rimbalzare la pallina: usa i rimbalzi per aggirarli."],
       ["🕳️","La buca","Se arriva troppo veloce la pallina salta oltre la buca: tira piano quando sei vicino."]],
  init(n,seed){const T=GF.holes[0].tee;return {hole:0,balls:[{x:T[0]-14,y:T[1],in:false},{x:T[0]+14,y:T[1],in:false}],st:[[0,0,0],[0,0,0]],cur:[0,0],turn:0,over:false,winner:-1,nm:0,ev:null,shot:null}},
  turn(S){return S.turn},legal(S,seat){return FALSE2},
  parse(S,seat,k){const t=String(k).split("|");if(t[0]!=="g"||t.length<3)return null;const vx=+t[1],vy=+t[2];if(![vx,vy].every(Number.isFinite))return null;const v=Math.sqrt(vx*vx+vy*vy);if(v<30)return null;const f=v>950?950/v:1;return {k:String(k),vx:vx*f,vy:vy*f}},
  apply(S,seat,a){
    const b=S.balls[seat],r=simGf(S.hole,b.x,b.y,a.vx,a.vy,true);S.nm++;S.cur[seat]++;b.x=r.x;b.y=r.y;
    if(r.dentro)b.in=true;else if(S.cur[seat]>=GF.max){b.in=true;S.cur[seat]=GF.max+1}
    S.ev={by:seat,kind:r.dentro?"buca":(b.in?"max":"colpo"),n:S.cur[seat]};
    S.shot={by:seat,no:S.nm,frames:r.frames,evs:r.evs,dentro:r.dentro,hole:S.hole};
    if(S.balls[0].in&&S.balls[1].in){
      S.st[0][S.hole]=S.cur[0];S.st[1][S.hole]=S.cur[1];S.ev={by:seat,kind:"fine",c0:S.cur[0],c1:S.cur[1]};
      if(S.hole>=2){S.over=true;const t0=S.st[0].reduce((x,y)=>x+y,0),t1=S.st[1].reduce((x,y)=>x+y,0);S.winner=t0<t1?0:t1<t0?1:-1}
      else{const first=S.cur[0]<S.cur[1]?0:S.cur[1]<S.cur[0]?1:S.hole%2;S.hole++;const T=GF.holes[S.hole].tee;S.balls=[{x:T[0]-14,y:T[1],in:false},{x:T[0]+14,y:T[1],in:false}];S.cur=[0,0];S.turn=first}}
    else S.turn=S.balls[1-seat].in?seat:(S.balls[seat].in?1-seat:turnoGf(S));
    return S},
  over(S){return S.over?(S.winner<0?{win:[],text:"Pareggio!"}:{win:[S.winner],text:seats=>`${seats[S.winner].nome} vince con ${S.st[S.winner].reduce((x,y)=>x+y,0)} colpi contro ${S.st[1-S.winner].reduce((x,y)=>x+y,0)}!`}):null},
  pausa(S,a,seat){return S.shot.frames.length*1000/60+(S.ev&&S.ev.kind==="fine"?1400:450)},
  msgTurno(S,ctx,seat){return "Tocca a te: trascina indietro dalla pallina per mirare, lascia per tirare"},
  cand(S,seat,li,noise){
    const b=S.balls[seat],h=S.hole,out=[],R=mulberry(11+S.nm*23);
    for(let ang=0;ang<360;ang+=6){const rad=ang*Math.PI/180,cx=Math.cos(rad),sn=Math.sin(rad);
      for(const v of [120,220,330,450,600,760]){const r=simGf(h,b.x,b.y,cx*v,sn*v,false);out.push({vx:cx*v,vy:sn*v,v,ang:rad,d:dGf(h,r.x,r.y),dentro:r.dentro})}}
    out.sort((a,b)=>(a.dentro?-1000:a.d)-(b.dentro?-1000:b.d));return out.slice(0,14)},
  bot(S,seat,lv){const I=this,li=lv==null?1:lv,R=mulberry(5+S.nm*29);
    return I.cand(S,seat,li).map(c=>{const e=GFN[li],ang=c.ang+(R()-.5)*2*e,v=c.v*(1+(R()-.5)*e*2),vx=Math.cos(ang)*v,vy=Math.sin(ang)*v;
      const r=simGf(S.hole,S.balls[seat].x,S.balls[seat].y,vx,vy,false),d=dGf(S.hole,r.x,r.y);
      return {a:I.parse(S,seat,`g|${num(vx)}|${num(vy)}`),f:{valore:r.dentro?1:clamp(1-d/300,-1,1)*.8,punti:r.dentro?1:0,attacco:r.dentro?.9:0,difesa:0,rischio:0,conserva:0,posizione:clamp(1-d/300,0,1),futuro:clamp(1-d/200,0,1)*.4,finale:r.dentro?1:0}}})},
  hint(S,seat){const c=this.cand(S,seat,3);return c[0]?{vx:c[0].vx,vy:c[0].vy,v:c[0].v}:null},
  view(sh,ctx){
    const info=this,LW=GF.W,LH=GF.H;
    const root=E("div","sp");sh.g.append(root);
    const sc=E("div","spscore"),msg=E("div","spmsg"),cv=document.createElement("canvas");cv.id="gfCanvas";cv.setAttribute("aria-label","Percorso di minigolf");
    const pw=E("div","sppow");const pwi=E("i");pw.append(pwi);
    const help=E("p","sphelp","Trascina indietro, lontano dalla pallina: la linea mostra la direzione, più tiri e più forte colpisci. Lascia per tirare.");
    const tools=E("div","sptools");const hb=E("button","btn ghost","💡 Aiuto");hb.id="gfHint";tools.append(hb);
    root.append(sc,msg,cv,pw,help,tools);
    let SS=null,cc=null,anim=null,aim=null,drag=false,hint=null,seen=0,S_=1,viste=null;
    const COL=["#fff","#ffd166"];
    const mio=()=>SS&&cc&&!SS.over&&!anim&&SS.turn===cc.me&&cc.legal.length>0;
    function tavolo(x,h){const H=GF.holes[h];
      x.fillStyle="#1a4d2a";x.fillRect(0,0,LW,LH);const g=x.createLinearGradient(0,0,0,LH);g.addColorStop(0,"#3c9a4e");g.addColorStop(1,"#2d7f3f");x.fillStyle=g;x.fillRect(6,6,LW-12,LH-12);
      x.fillStyle="rgba(255,255,255,.05)";for(let i=0;i<14;i++)x.fillRect(6,6+i*40,LW-12,20);
      x.fillStyle="rgba(255,255,255,.25)";x.beginPath();x.ellipse(H.tee[0],H.tee[1]+14,40,8,0,0,7);x.fill();
      H.walls.forEach(w=>{x.fillStyle="#7a4b27";x.fillRect(w[0],w[1],w[2],w[3]);x.fillStyle="#a0693a";x.fillRect(w[0],w[1],w[2],4)});
      H.bump.forEach(b=>{x.beginPath();x.arc(b[0],b[1],b[2],0,7);x.fillStyle="#b13a3a";x.fill();x.strokeStyle="#ffd9d9";x.lineWidth=3;x.stroke()});
      x.beginPath();x.arc(H.hole[0],H.hole[1],GF.hr,0,7);x.fillStyle="#050505";x.fill();x.strokeStyle="#2c1b0e";x.lineWidth=3;x.stroke();
      x.strokeStyle="#ddd";x.lineWidth=2;x.beginPath();x.moveTo(H.hole[0],H.hole[1]);x.lineTo(H.hole[0],H.hole[1]-44);x.stroke();x.fillStyle="#e63946";x.beginPath();x.moveTo(H.hole[0],H.hole[1]-44);x.lineTo(H.hole[0]+22,H.hole[1]-36);x.lineTo(H.hole[0],H.hole[1]-28);x.fill()}
    function pallina(x,px,py,seat,sel){x.save();x.translate(px,py);x.fillStyle="rgba(0,0,0,.3)";x.beginPath();x.ellipse(2,3,GF.br,GF.br*.85,0,0,7);x.fill();
      const g=x.createRadialGradient(-2,-3,1,0,0,GF.br);g.addColorStop(0,"#fff");g.addColorStop(1,seat===0?"#c8ccd8":"#e0a920");x.fillStyle=g;x.beginPath();x.arc(0,0,GF.br,0,7);x.fill();
      if(sel){x.strokeStyle="#fff";x.lineWidth=2;x.beginPath();x.arc(0,0,GF.br+4,0,7);x.stroke()}x.restore()}
    function disegna(f,quale){
      const S=SS;if(!S)return;const x=cv.getContext("2d");x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,cv.width,cv.height);x.setTransform(S_,0,0,S_,0,0);tavolo(x,f?S.shot.hole:S.hole);
      const palle=S.balls.map((b,i)=>({x:b.x,y:b.y,in:b.in,i}));
      if(f){const by=S.shot.by;palle.forEach(p=>{if(p.i===by){p.x=f[0];p.y=f[1];p.in=false}else if(p.in&&S.shot.hole!==S.hole){p.in=true}})}
      palle.forEach(p=>{if(!p.in||(f&&p.i===S.shot.by&&!(f&&S.shot.dentro&&f===S.shot.frames[S.shot.frames.length-1])))pallina(x,p.x,p.y,p.i,!f&&mio()&&p.i===S.turn)});
      if(!f&&mio()){const b=S.balls[S.turn];
        if(hint){const d=Math.sqrt(hint.vx*hint.vx+hint.vy*hint.vy);x.strokeStyle="#ffd166";x.lineWidth=3;x.setLineDash([8,6]);x.beginPath();x.moveTo(b.x,b.y);x.lineTo(b.x+hint.vx/d*200,b.y+hint.vy/d*200);x.stroke();x.setLineDash([])}
        if(aim){x.strokeStyle="rgba(255,255,255,.9)";x.lineWidth=2.5;x.setLineDash([7,5]);x.beginPath();x.moveTo(b.x,b.y);x.lineTo(b.x+aim.dx*(60+aim.pow*220),b.y+aim.dy*(60+aim.pow*220));x.stroke();x.setLineDash([])}}
      pwi.style.width=Math.round((aim&&!anim?aim.pow:0)*100)+"%"}
    function layout(){S_=fit(root,cv,LW,LH,350)}
    function aggiorna(){
      const S=SS,c=cc;if(!S||!c)return;sc.innerHTML="";
      for(let i=0;i<2;i++){const d=E("div",S.turn===i&&!S.over?"on":"");const tot=S.st[i].reduce((a,b)=>a+b,0)+(S.over?0:S.cur[i]);d.append(E("b","",nomeDi(c,i)),E("em","",String(tot)),E("small","",S.over?"":`buca ${S.hole+1}/3 · par ${GF.holes[S.hole].par} · colpi ${S.cur[i]}`));sc.append(d)}
      let m="Tre buche: vince chi fa meno colpi in tutto.";const e=S.ev;
      if(e&&!anim){const p=nomeDi(c,e.by);m=e.kind==="buca"?`${p}: in buca in ${e.n} ${e.n===1?"colpo":"colpi"}!`:e.kind==="max"?`${p}: troppi colpi, la buca vale 8.`:e.kind==="fine"?`Buca finita: ${nomeDi(c,0)} ${e.c0}, ${nomeDi(c,1)} ${e.c1}.`:`${p}: colpo ${e.n}.`}
      if(!anim&&!S.over)m+=" "+(S.turn===c.me?"Tocca a te.":`Tocca a ${nomeDi(c,S.turn)}.`);
      if(anim)m="…";msg.textContent=m}
    function suono(k){snd(k==="wall"?"bounce":k)}
    function anima(S){const s=S.shot;anim={no:s.no};aim=null;hint=null;snd("putt");
      play(s.frames,s.evs,i=>disegna(s.frames[i]),suono,()=>{anim=null;aggiorna();disegna(null)});aggiorna()}
    const draw=(S,c)=>{SS=S;cc=c;if(S_===1)layout();
      if(S.shot&&S.shot.no!==seen){seen=S.shot.no;
        try{const by=S.shot.by;if(sh.logic&&c.seats[by]&&c.seats[by].tipo!=="bot"){if(S.shot.dentro)sh.logic.esito(by,"buona");else if(S.cur[by]>=GF.max)sh.logic.esito(by,"errore")}}catch(e){}
        if(window.NATAN_GIOCHI_VELOCE){anim=null}else anima(S)}
      if(!anim){aggiorna();disegna(null)}};
    cv.addEventListener("pointerdown",e=>{if(!mio())return;hint=null;drag=true;mira(ptr(cv,e,LW,LH));try{cv.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault()});
    cv.addEventListener("pointermove",e=>{if(drag)mira(ptr(cv,e,LW,LH))});
    function mira(p){const b=SS.balls[SS.turn],dx=b.x-p.x,dy=b.y-p.y,d=Math.sqrt(dx*dx+dy*dy);if(d<4){aim=null;disegna(null);return}aim={dx:dx/d,dy:dy/d,pow:clamp((d-12)/190,0,1)};disegna(null)}
    cv.addEventListener("pointerup",e=>{if(!drag)return;drag=false;const a=aim;aim=null;if(!a||!mio()||a.pow<.03){disegna(null);return}
      const v=90+a.pow*860;cc.act(`g|${num(a.dx*v)}|${num(a.dy*v)}`)});
    cv.addEventListener("pointercancel",()=>{drag=false;aim=null;disegna(null)});
    hb.onclick=()=>{if(!mio())return;const h=info.hint(SS,cc.me);if(!h)return;hint=h;snd("click");disegna(null);msg.textContent=`La linea gialla è una buona direzione, forza circa ${Math.round((h.v-90)/860*100)}%.`};
    window.addEventListener("resize",()=>{if(!document.body.contains(cv))return;layout();if(!anim)disegna(null)});
    return {draw}}
});
pic("minigolf","⛳","#2f7d3b");
})();
