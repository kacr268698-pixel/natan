// GIOCHI IN TEMPO REALE di Natan: Calcio (visto dall'alto) e Hockey da tavolo, contro i bot di Natan Gaming.
(function(){
"use strict";
const {E,register}=window.__G;
const Z=window.__G.zen||{};const A=Z.A;
const sfx=(n,a)=>{try{Z.sfx(n,a)}catch(e){}};
function tone(f,d,o){try{if(!A||!A.sfx)return;const c=A.init();if(!c)return;o=o||{};A.tone(f,c.currentTime+.005+(o.at||0),d,o)}catch(e){}}
function noise(d,o){try{if(!A||!A.sfx)return;const c=A.init();if(!c)return;o=o||{};A.noise(c.currentTime+.005+(o.at||0),d,o)}catch(e){}}
const SN={kick:()=>{tone(150,.1,{gain:.12,to:70});noise(.04,{f:900,q:1,gain:.05})},hit:()=>{tone(900,.05,{type:"triangle",gain:.08,to:700})},wall:()=>tone(520,.04,{type:"triangle",gain:.05,to:420}),
  goal:()=>{[523,659,784,1046].forEach((f,i)=>tone(f,.25,{at:i*.09,gain:.09,type:"triangle"}));noise(.6,{f:2500,q:.4,gain:.04})},whistle:()=>{tone(2300,.25,{gain:.06,type:"sine"});tone(2500,.3,{at:.2,gain:.06})}};
const snd=n=>{try{SN[n]()}catch(e){}};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pic=(id,em,col)=>{try{Z.PIC[id]=`<svg class="pic pic-sp" viewBox="0 0 240 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style="--gc:${col}"><circle cx="120" cy="60" r="46" fill="rgba(255,255,255,.08)"/><text x="120" y="84" font-size="62" text-anchor="middle">${em}</text></svg>`}catch(e){}};
(function(){if(document.getElementById("lvStyle"))return;const s=document.createElement("style");s.id="lvStyle";s.textContent=`
.lvw{display:flex;flex-direction:column;align-items:center;gap:8px;padding:8px}
.lvscore{display:flex;gap:14px;align-items:center;font-weight:800;font-size:1.25rem}
.lvscore small{font-weight:600;font-size:.8rem;opacity:.7}
.lvscore b{min-width:2ch;text-align:center;font-size:1.8rem;transition:transform .3s}
.lvscore b.pop{transform:scale(1.5)}
.lvcv{border-radius:14px;touch-action:none;box-shadow:0 10px 30px #0006;max-width:100%}
.lvhelp{font-size:.85rem;opacity:.75;text-align:center;max-width:420px}
.lvbtn{font-size:1rem;padding:12px 22px}
`;document.head.append(s)})();
const LVS=[.55,.7,.85,1];
function fitc(root,cv,lw,lh){const full=!!root.closest(".gm.full"),dpr=Math.min(2,window.devicePixelRatio||1);
  const w=Math.max(240,(root.clientWidth||360)-20),hmax=Math.max(260,innerHeight-(full?110:300));const s=Math.min(w/lw,hmax/lh);
  cv.width=Math.round(lw*s*dpr);cv.height=Math.round(lh*s*dpr);cv.style.width=lw*s+"px";cv.style.height=lh*s+"px";return cv.width/lw}
function loop(cv,step,draw){let on=true,last=performance.now(),acc=0;const f=ts=>{if(!on)return;if(!document.body.contains(cv)){on=false;return}
    acc+=Math.min(.1,(ts-last)/1000);last=ts;let n=0;while(acc>=1/60&&n<6){step(1/60);acc-=1/60;n++}draw();requestAnimationFrame(f)};requestAnimationFrame(f);return ()=>{on=false}}
function frame(sh,ctx,id,LW,LH,help,metaT,objetivo){
  const root=E("div","lvw");sh.g.append(root);const sc=E("div","lvscore"),cv=document.createElement("canvas");cv.className="lvcv";cv.id=id;
  const hp=E("p","lvhelp",help);root.append(sc,cv,hp);const R={root,sc,cv,S:1};
  R.fit=()=>{R.S=fitc(root,cv,LW,LH)};R.fit();window.addEventListener("resize",()=>{if(document.body.contains(cv))R.fit()});
  R.pt=e=>{const r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*LW,y:(e.clientY-r.top)/r.height*LH}};
  R.score=(a,b,t,flash)=>{const esc=t=>String(t).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));const n=[esc(ctx.seats[0].nome),esc(ctx.seats[1].nome)];sc.innerHTML=`<span><small>${n[0]}</small></span><b${flash===0?' class="pop"':''}>${a}</b><span>—</span><b${flash===1?' class="pop"':''}>${b}</b><span><small>${n[1]}</small></span><small>⏱ ${Math.max(0,Math.ceil(t))}s</small>`};
  return R}
function avvio(R,sh,ctx,go){   // schermata «Pronti?» con un bottone, poi parte
  const c=R.cv.getContext("2d");const b=E("button","btn lvbtn","▶ Inizia la partita");b.id="lvStart";R.root.insertBefore(b,R.cv);b.onclick=()=>{b.remove();snd("whistle");go()};sh.status.textContent="Premi «Inizia la partita» quando sei pronto";}
function fine(ctx,a,b,golden){const win=a>b?[0]:b>a?[1]:[];ctx.finish({win,text:s=>win.length?`${s[win[0]].nome} vince ${Math.max(a,b)} a ${Math.min(a,b)}!`:`Pareggio ${a} a ${b}`})}

// =============================================================== CALCIO
const CW=360,CH=540,GW=110,PR=15,BR=9;
register({id:"calcio",ord:15,nome:"Calcio",ic:"⚽",col:"#2f9e44",sub:"Partita vista dall'alto: tu contro un bot",min:2,max:2,noEval:true,noOnline:true,rt:true,
  tut:[["⚽","Lo scopo","Segna più gol dell'avversario in 90 secondi. Tu giochi in basso e attacchi la porta in alto."],["👆","Come si muove","Tieni premuto e trascina: il tuo giocatore con il cerchio bianco corre verso il dito. Toccando il pallone lo spingi."],["⚡","Il tiro","Premi «Tiro» (o doppio tocco) quando sei vicino al pallone per calciare forte."],["🧤","Squadra","Ogni squadra ha un portiere e due giocatori: gli altri si muovono da soli."]],
  playRT(sh,ctx,cfg){
    const R=frame(sh,ctx,"lvCalcio",CW,CH,"Trascina il dito: il giocatore bianco corre lì. Tocca il pallone per spingerlo, premi «⚡ Tiro» vicino al pallone per calciare forte.");
    const lv=LVS[clamp(ctx.lv==null?1:ctx.lv,0,3)];
    const kb=E("button","btn ghost lvbtn","⚡ Tiro");kb.id="lvKick";R.root.append(kb);
    const mk=(x,y,t,ro)=>({x,y,vx:0,vy:0,t,ro,r:PR,hx:x,hy:y});
    let P,B,sc,time,gold,pause,flash,tgt=null,ctl=0,kickT=0,done=false;
    const kickoff=who=>{P=[mk(CW/2,CH-40,0,"g"),mk(CW/2-70,CH-170,0,"a"),mk(CW/2+60,CH-250,0,"b"),mk(CW/2,40,1,"g"),mk(CW/2+70,170,1,"a"),mk(CW/2-60,250,1,"b")];
      B={x:CW/2,y:CH/2,vx:0,vy:0};ctl=1;pause=1.1;P.forEach(p=>{p.hx=p.x;p.hy=p.y})};
    const reset=()=>{sc=[0,0];time=90;gold=false;flash=-1;kickoff()};reset();
    const goTo=(p,x,y,sp,dt)=>{const dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy);if(d<2){p.vx*=.5;p.vy*=.5;return}const k=Math.min(1,d/22);p.vx+=(dx/d*sp*k-p.vx)*Math.min(1,dt*9);p.vy+=(dy/d*sp*k-p.vy)*Math.min(1,dt*9)};
    const kick=(p,pw)=>{const dx=B.x-p.x,dy=B.y-p.y,d=Math.hypot(dx,dy)||1;B.vx=dx/d*pw;B.vy=dy/d*pw;snd("kick")};
    const goal=who=>{sc[who]++;flash=who;snd("goal");pause=1.6;setTimeout(()=>{if(!done&&document.body.contains(R.cv))flash=-1},800);
      if(gold||0){}kickoff();pause=1.6;if(gold){done=true;setTimeout(()=>fine(ctx,sc[0],sc[1]),900)}};
    const botThink=(dt)=>{const sp=210*lv;
      const bot=P.filter(p=>p.t===1);const near=bot.filter(p=>p.ro!=="g").sort((a,b)=>Math.hypot(a.x-B.x,a.y-B.y)-Math.hypot(b.x-B.x,b.y-B.y))[0];
      for(const p of bot){
        if(p.ro==="g"){const gx=clamp(B.x,CW/2-GW/2+8,CW/2+GW/2-8);goTo(p,gx,B.y<170?clamp(B.y,22,100):38,160*lv+20,dt);continue}
        if(p===near){const bx=B.x-(B.x-CW/2)*.0,by=B.y;
          // si mette dietro il pallone rispetto alla porta avversaria (in basso) e poi spinge
          const gx=CW/2,gy=CH,dx=gx-B.x,dy=gy-B.y,d=Math.hypot(dx,dy)||1;const bx2=B.x-dx/d*22,by2=B.y-dy/d*22;
          const dist=Math.hypot(B.x-p.x,B.y-p.y);if(p.y<B.y-4||dist<30)goTo(p,B.x,B.y,sp,dt);else goTo(p,bx2,by2,sp,dt);
          if(dist<PR+BR+3&&Math.random()<dt*(1.2+lv*2.2)&&B.y>CH*.35)kick(p,430+lv*140)}
        else{const hy=p.ro==="a"?clamp(B.y-80,90,CH*.55):clamp(B.y-160,70,CH*.45),hx=p.ro==="a"?CW/2+(B.x-CW/2)*.4+50:CW/2+(B.x-CW/2)*.4-60;goTo(p,hx,hy,sp*.8,dt)}}};
    const meAi=(dt)=>{const me=P.filter(p=>p.t===0);
      const ranked=me.filter(p=>p.ro!=="g").sort((a,b)=>Math.hypot(a.x-B.x,a.y-B.y)-Math.hypot(b.x-B.x,b.y-B.y));ctl=P.indexOf(ranked[0]);
      for(const p of me){if(p===P[ctl]){if(tgt)goTo(p,tgt.x,tgt.y,235,dt);else{p.vx*=.85;p.vy*=.85}}
        else if(p.ro==="g"){const gx=clamp(B.x,CW/2-GW/2+8,CW/2+GW/2-8);goTo(p,gx,B.y>CH-170?clamp(B.y,CH-100,CH-22):CH-38,190,dt)}
        else{const o=ranked[0]===P[ctl]&&p===ranked[1]?p:p;const hy=p.ro==="a"?clamp(B.y+70,CH*.45,CH-100):clamp(B.y+10,CH*.3,CH*.7),hx=p.ro==="a"?CW/2+(B.x-CW/2)*.4-60:CW/2+(B.x-CW/2)*.4+60;goTo(p,hx,hy,190,dt)}}};
    const step=dt=>{
      if(done||!started)return;
      if(pause>0){pause-=dt;return}
      time-=dt;if(!gold&&time<=0){if(sc[0]!==sc[1]){done=true;snd("whistle");setTimeout(()=>fine(ctx,sc[0],sc[1]),700);return}gold=true;time=30;sh.status.textContent="Pareggio: gol d'oro! Chi segna per primo vince";snd("whistle")}
      if(gold&&time<=0){done=true;setTimeout(()=>fine(ctx,sc[0],sc[1]),500);return}
      meAi(dt);botThink(dt);
      for(const p of P){p.x+=p.vx*dt;p.y+=p.vy*dt;p.x=clamp(p.x,PR,CW-PR);p.y=clamp(p.y,PR,CH-PR);}
      // giocatori contro giocatori
      for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<PR*2&&d>0){const o=(PR*2-d)/2,nx=dx/d,ny=dy/d;a.x-=nx*o;a.y-=ny*o;b.x+=nx*o;b.y+=ny*o}}
      // pallone
      B.x+=B.vx*dt;B.y+=B.vy*dt;const f=Math.pow(.42,dt);B.vx*=f;B.vy*=f;if(Math.hypot(B.vx,B.vy)<3){B.vx=0;B.vy=0}
      const inG=B.x>CW/2-GW/2&&B.x<CW/2+GW/2;
      if(B.x<BR){B.x=BR;B.vx=Math.abs(B.vx)*.8;snd("wall")}if(B.x>CW-BR){B.x=CW-BR;B.vx=-Math.abs(B.vx)*.8;snd("wall")}
      if(B.y<BR){if(inG&&B.y<-4){goal(0);return}if(!inG||B.y>0){if(!inG){B.y=BR;B.vy=Math.abs(B.vy)*.8;snd("wall")}}}
      if(B.y>CH-BR){if(inG&&B.y>CH+4){goal(1);return}if(!inG){B.y=CH-BR;B.vy=-Math.abs(B.vy)*.8;snd("wall")}}
      if(inG&&(B.y<BR||B.y>CH-BR)){if(B.x<CW/2-GW/2+BR){B.x=CW/2-GW/2+BR;B.vx=Math.abs(B.vx)}if(B.x>CW/2+GW/2-BR){B.x=CW/2+GW/2-BR;B.vx=-Math.abs(B.vx)}}
      for(const p of P){const dx=B.x-p.x,dy=B.y-p.y,d=Math.hypot(dx,dy),m=PR+BR;
        if(d<m&&d>0){const nx=dx/d,ny=dy/d;B.x=p.x+nx*m;B.y=p.y+ny*m;const rel=(B.vx-p.vx)*nx+(B.vy-p.vy)*ny;
          if(rel<0){B.vx-=1.6*rel*nx;B.vy-=1.6*rel*ny}const sp=Math.hypot(p.vx,p.vy);B.vx+=nx*sp*.35;B.vy+=ny*sp*.35;
          if(p.ro==="g"&&sp<40){B.vx*=.7;B.vy*=.7}snd("hit")}}
      const bs=Math.hypot(B.vx,B.vy);if(bs>620){B.vx*=620/bs;B.vy*=620/bs}};
    let started=false;
    const draw=()=>{if(!P)return;const x=R.cv.getContext("2d"),s=R.S;x.setTransform(s,0,0,s,0,0);
      x.fillStyle="#1f7a33";x.fillRect(0,0,CW,CH);for(let i=0;i<9;i++){x.fillStyle=i%2?"#228a38":"#1f7a33";x.fillRect(0,i*CH/9,CW,CH/9)}
      x.strokeStyle="#ffffffcc";x.lineWidth=3;x.strokeRect(4,4,CW-8,CH-8);x.beginPath();x.moveTo(4,CH/2);x.lineTo(CW-4,CH/2);x.stroke();x.beginPath();x.arc(CW/2,CH/2,50,0,7);x.stroke();
      x.strokeRect(CW/2-80,4,160,70);x.strokeRect(CW/2-80,CH-74,160,70);
      x.fillStyle="#fff";x.fillRect(CW/2-GW/2,-4,GW,10);x.fillRect(CW/2-GW/2,CH-6,GW,10);x.fillStyle="#ffffff40";x.fillRect(CW/2-GW/2,0,GW,6);x.fillRect(CW/2-GW/2,CH-6,GW,6);
      for(let i=0;i<P.length;i++){const p=P[i];x.save();x.translate(p.x,p.y);x.fillStyle="#0004";x.beginPath();x.ellipse(2,3,PR,PR*.85,0,0,7);x.fill();
        x.fillStyle=p.t===0?(p.ro==="g"?"#ffd43b":"#e03131"):(p.ro==="g"?"#74c0fc":"#1971c2");x.beginPath();x.arc(0,0,PR,0,7);x.fill();x.strokeStyle="#fff";x.lineWidth=i===ctl?4:1.5;x.stroke();
        x.fillStyle="#fff";x.font="bold 11px sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText(p.ro==="g"?"P":p.ro==="a"?"A":"B",0,1);x.restore()}
      x.save();x.translate(B.x,B.y);x.fillStyle="#0005";x.beginPath();x.ellipse(2,3,BR,BR*.9,0,0,7);x.fill();const g=x.createRadialGradient(-3,-3,1,0,0,BR);g.addColorStop(0,"#fff");g.addColorStop(1,"#ccc");x.fillStyle=g;x.beginPath();x.arc(0,0,BR,0,7);x.fill();x.fillStyle="#222";x.beginPath();x.arc(0,0,3.5,0,7);x.fill();x.restore();
      if(tgt&&!done){x.strokeStyle="#ffffff90";x.lineWidth=2;x.beginPath();x.arc(tgt.x,tgt.y,9,0,7);x.stroke()}
      if(pause>0&&flash>=0&&!done){x.fillStyle="#0007";x.fillRect(0,CH/2-40,CW,80);x.fillStyle="#fff";x.font="800 44px sans-serif";x.textAlign="center";x.fillText("GOL!",CW/2,CH/2+14)}
      R.score(sc[0],sc[1],time,pause>1.2?flash:-1)};
    const down=e=>{if(!started||done)return;tgt=R.pt(e);const t=performance.now();if(t-kickT<300)doKick();kickT=t;try{R.cv.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault()};
    R.cv.addEventListener("pointerdown",down);R.cv.addEventListener("pointermove",e=>{if(tgt&&e.buttons)tgt=R.pt(e)});
    R.cv.addEventListener("pointerup",()=>{tgt=null});R.cv.addEventListener("pointercancel",()=>{tgt=null});
    const doKick=()=>{if(!started||done||pause>0)return;const p=P[ctl];if(p&&Math.hypot(B.x-p.x,B.y-p.y)<PR+BR+16)kick(p,560)};
    kb.onclick=doKick;
    loop(R.cv,step,draw);draw();
    avvio(R,sh,ctx,()=>{started=true;sh.status.textContent="Partita in corso!"});
  }});
pic("calcio","⚽","#2f9e44");

// =============================================================== HOCKEY DA TAVOLO
const HW=320,HH=540,HR=26,PUR=15,HG=120;
register({id:"hockey",ord:16,nome:"Hockey da tavolo",ic:"🏒",col:"#1971c2",sub:"Manda il disco nella porta avversaria",min:2,max:2,noEval:true,noOnline:true,rt:true,
  tut:[["🏒","Lo scopo","Il primo a fare 7 gol (o chi ne ha di più dopo 90 secondi) vince."],["👆","Come si gioca","Trascina il dito nella tua metà campo (in basso): la tua racchetta segue il dito e colpisce il disco."],["🛡️","Difesa","Torna davanti alla tua porta quando il disco arriva veloce."]],
  playRT(sh,ctx,cfg){
    const R=frame(sh,ctx,"lvHockey",HW,HH,"Trascina il dito nella tua metà campo (in basso): la racchetta segue il dito e colpisce il disco. Primo a 7 gol!");
    const lv=LVS[clamp(ctx.lv==null?1:ctx.lv,0,3)];
    let me,ai,pk,sc,time,pause,flash,done=false,started=false,tgt=null,gold=false;
    const serve=who=>{me={x:HW/2,y:HH-70,vx:0,vy:0};ai={x:HW/2,y:70,vx:0,vy:0};pk={x:HW/2,y:who===0?HH/2+60:HH/2-60,vx:0,vy:0};pause=1.1};
    sc=[0,0];time=90;flash=-1;serve(0);
    const step=dt=>{if(done||!started)return;if(pause>0){pause-=dt;return}
      time-=dt;if(!gold&&time<=0){if(sc[0]!==sc[1]){done=true;snd("whistle");setTimeout(()=>fine(ctx,sc[0],sc[1]),600);return}gold=true;time=30;sh.status.textContent="Pareggio: gol d'oro!";snd("whistle")}
      if(gold&&time<=0){done=true;setTimeout(()=>fine(ctx,sc[0],sc[1]),500);return}
      // mia racchetta: segue il dito con velocità limitata
      const ox=me.x,oy=me.y;if(tgt){const tx=clamp(tgt.x,HR,HW-HR),ty=clamp(tgt.y,HH/2+HR,HH-HR),dx=tx-me.x,dy=ty-me.y,d=Math.hypot(dx,dy),mx=900*dt;if(d>mx){me.x+=dx/d*mx;me.y+=dy/d*mx}else{me.x=tx;me.y=ty}}
      me.vx=(me.x-ox)/dt;me.vy=(me.y-oy)/dt;
      // bot
      const ax=ai.x,ay=ai.y;let tx=HW/2,ty=60;const sp=(300+260*lv)*dt;
      if(pk.y<HH/2-5||(pk.vy<-20&&pk.y<HH*.62)){ // disco nella sua metà: lo attacca dietro-dietro verso la mia porta
        if(Math.abs(pk.vy)<80&&pk.y<HH/2){tx=pk.x+(pk.x-HW/2)*.1;ty=pk.y-26;if(ai.y<pk.y-8&&Math.abs(ai.x-pk.x)<24){tx=pk.x;ty=pk.y+30}}
        else{tx=pk.x;ty=Math.min(pk.y-HR,HH/2-HR-4)}}
      else{tx=clamp(pk.x,HW/2-HG/2,HW/2+HG/2);ty=52+(pk.y>HH*.75?0:12)}
      tx=clamp(tx,HR,HW-HR);ty=clamp(ty,HR,HH/2-HR);const bx=tx-ai.x,by=ty-ai.y,bd=Math.hypot(bx,by);if(bd>sp){ai.x+=bx/bd*sp;ai.y+=by/bd*sp}else{ai.x=tx;ai.y=ty}
      ai.vx=(ai.x-ax)/dt;ai.vy=(ai.y-ay)/dt;
      // disco
      pk.x+=pk.vx*dt;pk.y+=pk.vy*dt;const f=Math.pow(.88,dt);pk.vx*=f;pk.vy*=f;
      const inG=pk.x>HW/2-HG/2+PUR&&pk.x<HW/2+HG/2-PUR;
      if(pk.x<PUR){pk.x=PUR;pk.vx=Math.abs(pk.vx);snd("wall")}if(pk.x>HW-PUR){pk.x=HW-PUR;pk.vx=-Math.abs(pk.vx);snd("wall")}
      if(pk.y<PUR&&!inG){pk.y=PUR;pk.vy=Math.abs(pk.vy);snd("wall")}if(pk.y>HH-PUR&&!inG){pk.y=HH-PUR;pk.vy=-Math.abs(pk.vy);snd("wall")}
      if(pk.y<-PUR){sc[0]++;flash=0;snd("goal");pause=1.6;serve(1);if(gold||sc[0]>=7){done=true;setTimeout(()=>fine(ctx,sc[0],sc[1]),1100)}return}
      if(pk.y>HH+PUR){sc[1]++;flash=1;snd("goal");pause=1.6;serve(0);if(gold||sc[1]>=7){done=true;setTimeout(()=>fine(ctx,sc[0],sc[1]),1100)}return}
      for(const p of [me,ai]){const dx=pk.x-p.x,dy=pk.y-p.y,d=Math.hypot(dx,dy),m=HR+PUR;if(d<m&&d>0){const nx=dx/d,ny=dy/d;pk.x=p.x+nx*m;pk.y=p.y+ny*m;
          const rel=(pk.vx-p.vx)*nx+(pk.vy-p.vy)*ny;if(rel<0){pk.vx-=1.9*rel*nx;pk.vy-=1.9*rel*ny}snd("hit")}}
      const s=Math.hypot(pk.vx,pk.vy);if(s>1100){pk.vx*=1100/s;pk.vy*=1100/s}};
    const draw=()=>{const x=R.cv.getContext("2d"),s=R.S;x.setTransform(s,0,0,s,0,0);
      const g=x.createLinearGradient(0,0,0,HH);g.addColorStop(0,"#0b5394");g.addColorStop(.5,"#1c7ed6");g.addColorStop(1,"#0b5394");x.fillStyle=g;x.fillRect(0,0,HW,HH);
      x.strokeStyle="#ffffff90";x.lineWidth=3;x.beginPath();x.moveTo(0,HH/2);x.lineTo(HW,HH/2);x.stroke();x.beginPath();x.arc(HW/2,HH/2,48,0,7);x.stroke();
      x.fillStyle="#051a33";x.fillRect(HW/2-HG/2,-2,HG,12);x.fillRect(HW/2-HG/2,HH-10,HG,12);
      x.strokeStyle="#fff";x.lineWidth=5;x.strokeRect(2,2,HW-4,HH-4);x.fillStyle="#1c7ed6";x.fillRect(HW/2-HG/2+2,0,HG-4,6);x.fillRect(HW/2-HG/2+2,HH-6,HG-4,6);
      const pad=(p,c)=>{x.save();x.translate(p.x,p.y);x.fillStyle="#0005";x.beginPath();x.arc(3,4,HR,0,7);x.fill();x.fillStyle=c;x.beginPath();x.arc(0,0,HR,0,7);x.fill();x.fillStyle="#ffffff55";x.beginPath();x.arc(0,0,HR*.55,0,7);x.fill();x.strokeStyle="#fff";x.lineWidth=2.5;x.stroke();x.restore()};
      pad(ai,"#f03e3e");pad(me,"#ffd43b");
      x.save();x.translate(pk.x,pk.y);x.fillStyle="#0006";x.beginPath();x.arc(2,3,PUR,0,7);x.fill();x.fillStyle="#111";x.beginPath();x.arc(0,0,PUR,0,7);x.fill();x.strokeStyle="#aaa";x.lineWidth=2;x.stroke();x.restore();
      if(pause>0&&flash>=0&&!done){x.fillStyle="#0007";x.fillRect(0,HH/2-40,HW,80);x.fillStyle="#fff";x.font="800 44px sans-serif";x.textAlign="center";x.fillText("GOL!",HW/2,HH/2+14)}
      R.score(sc[0],sc[1],time,pause>1.2?flash:-1)};
    R.cv.addEventListener("pointerdown",e=>{if(!started||done)return;tgt=R.pt(e);try{R.cv.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault()});
    R.cv.addEventListener("pointermove",e=>{if(tgt||e.buttons)tgt=R.pt(e)});
    loop(R.cv,step,draw);draw();
    avvio(R,sh,ctx,()=>{started=true;sh.status.textContent="Partita in corso!"});
  }});
pic("hockey","🏒","#1971c2");
})();
