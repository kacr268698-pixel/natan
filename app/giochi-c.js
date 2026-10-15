// HOCKEY DA TAVOLO (in tempo reale) e SLING PUCK (a turni con fisica) sul motore dei giochi di Natan (giochi.js)
(function(){
"use strict";
const {E,register,consiglio,sleep,rnd,SLOW}=window.__G;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function css(){if(document.getElementById("gmcssc"))return;const s=E("style");s.id="gmcssc";s.textContent=`
.gm .rtinfo{text-align:center;font-size:13px;color:var(--muted)}
`;document.head.append(s)}

// =================================================================================================== HOCKEY DA TAVOLO
const HW=360,HH=600,HR=24,HP=14,GOAL=130,VMAX=17,VINCE=5;
class Sim{
  constructor(){this.sc=[0,0];this.pad=[{x:HW/2,y:HH-70,vx:0,vy:0},{x:HW/2,y:70,vx:0,vy:0}];this.tg=[[HW/2,HH-70],[HW/2,70]];this.sp=[18,18];this.puck={x:HW/2,y:HH/2,vx:0,vy:0};this.freeze=45;this.ult=-1;this.goal=-1;this.serveTo=Math.random()<.5?0:1;this.idle=0}
  serve(){const p=this.puck;p.x=HW/2;p.y=HH/2;p.vx=(Math.random()-.5)*3;p.vy=(this.serveTo===0?1:-1)*3;this.goal=-1}
  setTarget(seat,x,y){if(!(isFinite(x)&&isFinite(y)))return;x=clamp(x,HR,HW-HR);this.tg[seat]=[x,seat===0?clamp(y,HH/2+HR,HH-HR):clamp(y,HR,HH/2-HR)]}
  step(){
    const P=this.puck;
    // racchette
    for(let s=0;s<2;s++){const p=this.pad[s],t=this.tg[s];let dx=t[0]-p.x,dy=t[1]-p.y;const d=Math.sqrt(dx*dx+dy*dy);const m=this.sp[s];
      if(d>m){dx*=m/d;dy*=m/d}p.vx=dx;p.vy=dy;p.x+=dx;p.y+=dy;
      p.x=clamp(p.x,HR,HW-HR);p.y=s===0?clamp(p.y,HH/2+HR,HH-HR):clamp(p.y,HR,HH/2-HR)}
    if(this.freeze>0){this.freeze--;if(this.freeze===0)this.serve();return}
    P.x+=P.vx;P.y+=P.vy;P.vx*=.9975;P.vy*=.9975;
    if(P.vx*P.vx+P.vy*P.vy<.25){if(++this.idle>300){this.idle=0;this.serveTo=P.y<HH/2?0:1;this.freeze=20}}else this.idle=0;
    // pareti
    if(P.x<HP){P.x=HP;P.vx=Math.abs(P.vx)*.95}else if(P.x>HW-HP){P.x=HW-HP;P.vx=-Math.abs(P.vx)*.95}
    const inGoal=Math.abs(P.x-HW/2)<GOAL/2-HP*.4;
    if(P.y<HP&&!inGoal){P.y=HP;P.vy=Math.abs(P.vy)*.95}
    if(P.y>HH-HP&&!inGoal){P.y=HH-HP;P.vy=-Math.abs(P.vy)*.95}
    if(P.y<-HP){this.sc[0]++;this.goal=0;this.after(0);return}
    if(P.y>HH+HP){this.sc[1]++;this.goal=1;this.after(1);return}
    // racchette contro dischetto
    for(let s=0;s<2;s++){const p=this.pad[s];let nx=P.x-p.x,ny=P.y-p.y;let d=Math.sqrt(nx*nx+ny*ny);const lim=HR+HP;
      if(d<lim){if(d<1e-6){nx=0;ny=s===0?-1:1;d=1}nx/=d;ny/=d;P.x=p.x+nx*lim;P.y=p.y+ny*lim;
        const rv=(P.vx-p.vx)*nx+(P.vy-p.vy)*ny;
        if(rv<0){P.vx-=1.85*rv*nx;P.vy-=1.85*rv*ny}
        const sp=Math.sqrt(P.vx*P.vx+P.vy*P.vy);if(sp>VMAX){P.vx*=VMAX/sp;P.vy*=VMAX/sp}
        if(sp<2.2){P.vx+=nx*2.2;P.vy+=ny*2.2}}}
  }
  after(w){this.freeze=70;this.serveTo=1-w;this.puck.vx=0;this.puck.vy=0}
  fine(){return this.sc[0]>=VINCE?0:this.sc[1]>=VINCE?1:-1}
}
// il «cervello» del bot di hockey: sceglie tra 7 idee, votano i 35 agenti. Tutto nel sistema di riferimento del bot (la sua porta è in basso).
function idee(P){
  const {px,py,vx,vy,ax,ay}=P;const gx=HW/2;const dist=(a,b,c,d)=>Math.sqrt((a-c)*(a-c)+(b-d)*(b-d));
  const sp=Math.sqrt(vx*vx+vy*vy);const verso=vy>0?Math.min(1,vy/9):0;const mia=py>HH/2?1:0;const lenta=1-Math.min(1,sp/12);
  const dir=(tx,ty)=>{const dx=tx-px,dy=ty-py,l=Math.sqrt(dx*dx+dy*dy)||1;return [dx/l,dy/l]};
  const colpo=(tx,ty)=>{const [ux,uy]=dir(tx,ty);const bx=px-ux*(HR+HP-4),by=py-uy*(HR+HP-4);
    if(dist(ax,ay,bx,by)>30)return [bx,by];return [px+ux*28,py+uy*28]};
  // dove arriva il dischetto alla linea di difesa (con i rimbalzi)
  let x=px,y=py,dx=vx,dy=vy,t=0;const yd=HH-95;
  if(dy>0.3){for(let i=0;i<200&&y<yd;i++){x+=dx;y+=dy;if(x<HP||x>HW-HP){dx=-dx;x=clamp(x,HP,HW-HP)}t++}}
  const ix=dy>0.3?x:px;
  const tdiff=Math.max(1,dist(ax,ay,ix,yd)/14);const raggiungibile=dy>0.3?(t>tdiff*.8?1:.3):0.2;
  const lato=px<HW/2?1:-1;
  const out=[];
  const aim=colpo(gx,0),aimS=colpo(px>HW/2?HW*1.5:-HW*.5,0),aimC=colpo(gx,HH/2);
  out.push({n:"difende",tx:clamp(gx+(px-gx)*.5,HR,HW-HR),ty:HH-58,f:{difesa:verso,posizione:.6,rischio:0,valore:verso*.8+(1-mia)*.3,conserva:.4,attacco:0,futuro:.1,punti:0,finale:0}});
  out.push({n:"intercetta",tx:clamp(ix,HR,HW-HR),ty:yd,f:{difesa:verso*raggiungibile,valore:verso*raggiungibile,posizione:.3,rischio:.1,conserva:.2,attacco:.2*lenta,futuro:.2,punti:0,finale:0}});
  out.push({n:"attacca",tx:aim[0],ty:aim[1],f:{attacco:mia*lenta,punti:mia*lenta*(1-Math.abs(px-gx)/HW),valore:mia*lenta*.9,rischio:verso*.8,posizione:0,futuro:.5,conserva:-.2,difesa:0,finale:.2}});
  out.push({n:"sponda",tx:aimS[0],ty:aimS[1],f:{attacco:mia*lenta*.7,punti:.2*mia*lenta,valore:mia*lenta*.6,rischio:verso*.9,futuro:.9*mia,posizione:0,conserva:-.3,difesa:0,finale:.1}});
  out.push({n:"centro",tx:gx,ty:HH-120,f:{difesa:.3,posizione:1,rischio:0,valore:.15+(1-mia)*.3,conserva:.8,attacco:0,futuro:.2,punti:0,finale:0}});
  const dietro=(py>ay+4&&mia)?1:0;
  out.push({n:"ritirata",tx:clamp(px+lato*58,HR,HW-HR),ty:Math.min(HH-HR,py+42),f:{difesa:dietro*.8,valore:dietro,rischio:verso*.3,posizione:.2,conserva:.1,attacco:0,futuro:.3,punti:0,finale:0}});
  const angolo=(px<HP+30||px>HW-HP-30)&&py>HH/2+60?1:0;
  out.push({n:"libera",tx:aimC[0],ty:aimC[1],f:{attacco:angolo*lenta,valore:angolo*.9*lenta,difesa:.3*angolo,rischio:.2,posizione:0,conserva:0,futuro:.4*angolo,punti:0,finale:0}});
  return out
}
const HINFO={id:"hockey",nome:"Hockey da tavolo",ic:"🏒",sub:"Segna 5 gol: muovi la racchetta col dito o il mouse",min:2,max:2,rt:true,
  tut:[["🏒","Lo scopo","È l'hockey da tavolo: spingi il dischetto nella porta dell'avversario. Vince chi segna per primo 5 gol."],
       ["👆","Come si gioca","Muovi la tua racchetta con il dito (o col mouse): sta nella tua metà campo, quella in basso. Il dischetto rimbalza sulle pareti."],
       ["🤖","Gli avversari","Il bot ha 35 agenti che ogni istante scelgono una mossa: difendere, intercettare, attaccare, tirare di sponda… Nei livelli alti è veloce e preciso."]],
  playRT(sh,ctx,cfg){
    css();const net=ctx.net,me=ctx.me;const sim=new Sim();const host=!net||net.host;
    const canvas=E("canvas","rt");canvas.width=HW;canvas.height=HH;canvas.id="hockeyCanvas";canvas.style.width=`min(100%,${Math.round(Math.max(260,innerHeight*.74)*HW/HH)}px)`;const g=canvas.getContext("2d");
    const info=E("div","rtinfo","Muovi la racchetta nella tua metà campo (in basso)");
    sh.g.append(canvas,info);
    const lv=ctx.lv;const vel=[7,10.5,14,18][lv],pausa=[16,11,7,4][lv],rumore=[36,18,7,0][lv];
    sim.sp=[18,18];
    let botSeat=host&&ctx.seats[1].tipo==="bot"?1:-1;
    if(host&&ctx.seats[0].tipo==="bot")botSeat=0;
    if(botSeat>=0)sim.sp[botSeat]=vel;
    let last=0,run=true,fr=0,view={pad:[[HW/2,HH-70],[HW/2,70]],puck:[HW/2,HH/2,0,0],sc:[0,0],freeze:1};
    const flip=me===1;
    // ----- input
    let mio=[HW/2,flip?70:HH-70];
    const pos=e=>{const r=canvas.getBoundingClientRect();let x=(e.clientX-r.left)*HW/r.width,y=(e.clientY-r.top)*HH/r.height;if(flip){x=HW-x;y=HH-y}return [x,y]};
    const mv=e=>{const [x,y]=pos(e);mio=[x,y];if(host)sim.setTarget(me,x,y)};
    canvas.addEventListener("pointermove",mv);canvas.addEventListener("pointerdown",e=>{try{canvas.setPointerCapture(e.pointerId)}catch(x){}mv(e)});
    window.__hockey={sim,ctx,setMio:(x,y)=>{mio=[x,y];if(host)sim.setTarget(me,x,y)}};
    // ----- bot
    let cervello=0,ultimoPensiero=0;
    function pensaBot(){
      const s=botSeat;const P=sim.pad[s],K=sim.puck;
      const T=(x,y)=>s===0?[x,y]:[HW-x,HH-y];
      const [px,py]=T(K.x,K.y),[ax,ay]=T(P.x,P.y);const vx=s===0?K.vx:-K.vx,vy=s===0?K.vy:-K.vy;
      const cands=idee({px,py,vx,vy,ax,ay});
      const bot=ctx.seats[s].bot;const r=consiglio("hockey",cands,bot,lv);const c=r.mossa;
      let tx=c.tx+(Math.random()-.5)*rumore,ty=c.ty+(Math.random()-.5)*rumore*.5;
      const w=T(tx,ty);sim.setTarget(s,w[0],w[1]);
      if(fr-ultimoPensiero>=45){ultimoPensiero=fr;sh.ng.think(`${bot.nome}: «${c.n}» · ${r.voti}/35 agenti d'accordo, guidati da «${r.decide}»`,r.favor,bot.nome);if(ctx.storia[s].length<600)ctx.storia[s].push(r.favor)}}
    // ----- rete
    if(net){
      if(host){net.h.pad=m=>{if(m.seat===1&&ctx.seats[1].tipo==="remoto")sim.setTarget(1,+m.x,+m.y)};
        ctx.onSwap=seat=>{if(seat===1){botSeat=1;sim.sp[1]=vel}}}
      else{net.h.st=m=>{view={pad:m.p,puck:m.q,sc:m.s,freeze:m.f,t:Date.now()}};
        net.h.fin=m=>{if(run){run=false;ctx.finish({win:m.win,text:m.text})}};
        net.h.bye=()=>{if(run){run=false;ctx.finish({win:[],text:"Connessione chiusa: partita interrotta"})}}}
    }
    // ----- disegno
    function draw(){
      const v=host?{pad:[[sim.pad[0].x,sim.pad[0].y],[sim.pad[1].x,sim.pad[1].y]],puck:[sim.puck.x,sim.puck.y,sim.puck.vx,sim.puck.vy],sc:sim.sc,freeze:sim.freeze}:view;
      g.save();g.clearRect(0,0,HW,HH);
      if(flip){g.translate(HW,HH);g.rotate(Math.PI)}
      const gr=g.createLinearGradient(0,0,0,HH);gr.addColorStop(0,"#16346b");gr.addColorStop(.5,"#0f2550");gr.addColorStop(1,"#16346b");g.fillStyle=gr;g.fillRect(0,0,HW,HH);
      g.strokeStyle="rgba(255,255,255,.35)";g.lineWidth=3;g.strokeRect(2,2,HW-4,HH-4);g.beginPath();g.moveTo(0,HH/2);g.lineTo(HW,HH/2);g.stroke();g.beginPath();g.arc(HW/2,HH/2,52,0,7);g.stroke();
      g.fillStyle="#0a0f22";g.fillRect(HW/2-GOAL/2,0,GOAL,8);g.fillRect(HW/2-GOAL/2,HH-8,GOAL,8);
      const col=["#e2463c","#f2c230"];
      v.pad.forEach((p,s)=>{const px=(host?p[0]:s===me?mio[0]:p[0]),py=(host?p[1]:s===me?mio[1]:p[1]);g.beginPath();g.arc(px,py,HR,0,7);g.fillStyle=col[s];g.fill();g.beginPath();g.arc(px,py,HR*.55,0,7);g.fillStyle="rgba(255,255,255,.35)";g.fill()});
      let qx=v.puck[0],qy=v.puck[1];if(!host&&view.t){const dt=Math.min(.08,(Date.now()-view.t)/1000)*60;qx+=v.puck[2]*dt;qy+=v.puck[3]*dt}
      g.beginPath();g.arc(qx,qy,HP,0,7);g.fillStyle="#fff";g.fill();g.strokeStyle="#222";g.lineWidth=2;g.stroke();
      g.restore();
      info.textContent=`${ctx.seats[me].nome} ${v.sc[me]} — ${v.sc[1-me]} ${ctx.seats[1-me].nome}`+(v.freeze>0&&(v.sc[0]+v.sc[1])>0?" · GOL!":"")}
    // ----- ciclo
    let acc=0,tprev=Date.now(),padT=0;
    const tick=()=>{if(!run)return;const now=Date.now();acc+=Math.min(200,now-tprev)*(window.NATAN_GIOCHI_VELOCE?8:1);tprev=now;
      if(host){while(acc>=16.667){acc-=16.667;fr++;
          if(botSeat>=0&&fr%pausa===0&&sim.freeze===0)pensaBot();
          sim.step();
          if(net&&fr%2===0)net.bcast({t:"st",p:[[Math.round(sim.pad[0].x),Math.round(sim.pad[0].y)],[Math.round(sim.pad[1].x),Math.round(sim.pad[1].y)]],q:[Math.round(sim.puck.x*10)/10,Math.round(sim.puck.y*10)/10,Math.round(sim.puck.vx*10)/10,Math.round(sim.puck.vy*10)/10],s:sim.sc,f:sim.freeze});
          const f=sim.fine();
          if(f>=0){run=false;const txt=`${ctx.seats[f].nome} vince ${sim.sc[f]} a ${sim.sc[1-f]}`;if(net)net.bcast({t:"fin",win:[f],text:txt});sh.status.textContent=txt;draw();ctx.finish({win:[f],text:txt});return}}}
      else{acc=0;if(now-padT>33){padT=now;net.send({t:"pad",x:Math.round(mio[0]),y:Math.round(mio[1])})}}
      draw()};
    const iv=setInterval(()=>{if(!run||!document.body.contains(canvas)){run=false;clearInterval(iv);return}tick()},16);
    ctx.stopRT=()=>{run=false;clearInterval(iv)};
    const oldStop=ctx.stop,oldLeave=ctx.leave;ctx.stop=()=>{run=false;oldStop()};ctx.leave=()=>{run=false;oldLeave()};
    sh.status.textContent=host&&botSeat>=0?"Si gioca! Primo a "+VINCE+" gol":"Si gioca online! Primo a "+VINCE+" gol";draw();
  }
};
register(HINFO);
window.__HOCKEY={Sim,idee};

// =================================================================================================== SLING PUCK
// Tavolo con pareti, 3 dischetti per giocatore e un dischetto d'oro al centro: lancia i tuoi dischetti con la fionda e
// fai entrare quello d'oro nella porta avversaria. La fisica usa solo somme e prodotti: è identica su ogni dispositivo (serve per l'online).
const SW=360,SH=560,SG=120,SR=18,SRG=14,ATT=.985,REST=.9,MAXG=3,MAXSHOT=26;
const POS0=()=>{const p=[];for(const x of [80,180,280])p.push({x,y:SH-100,vx:0,vy:0,r:SR,m:1});for(const x of [80,180,280])p.push({x,y:100,vx:0,vy:0,r:SR,m:1});p.push({x:SW/2,y:SH/2,vx:0,vy:0,r:SRG,m:.6});return p};
function simulaSling(S,idx,dx,dy){
  const P=S.pucks.map(p=>Object.assign({},p));const fr=[];const k=.16;
  P[idx].vx=dx*k;P[idx].vy=dy*k;let goal=-1;
  for(let t=0;t<420&&goal<0;t++){
    let mov=0;
    for(let i=0;i<P.length;i++){const p=P[i];p.x+=p.vx;p.y+=p.vy;p.vx*=ATT;p.vy*=ATT;if(p.vx*p.vx+p.vy*p.vy<.0036){p.vx=0;p.vy=0}else mov=1;
      const gold=i===6;
      if(p.x<p.r){p.x=p.r;p.vx=-p.vx*REST}else if(p.x>SW-p.r){p.x=SW-p.r;p.vx=-p.vx*REST}
      const slot=gold&&p.x>SW/2-SG/2+p.r*.3&&p.x<SW/2+SG/2-p.r*.3;
      if(p.y<p.r){if(slot){if(p.y<-p.r){goal=0}}else{p.y=p.r;p.vy=-p.vy*REST}}
      else if(p.y>SH-p.r){if(slot){if(p.y>SH+p.r){goal=1}}else{p.y=SH-p.r;p.vy=-p.vy*REST}}}
    for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j];let nx=b.x-a.x,ny=b.y-a.y;const lim=a.r+b.r;const d2=nx*nx+ny*ny;
      if(d2<lim*lim){let d=Math.sqrt(d2);if(d<1e-6){nx=1;ny=0;d=1}nx/=d;ny/=d;const ov=lim-d;const ia=1/a.m,ib=1/b.m;
        a.x-=nx*ov*ia/(ia+ib);a.y-=ny*ov*ia/(ia+ib);b.x+=nx*ov*ib/(ia+ib);b.y+=ny*ov*ib/(ia+ib);
        const rv=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(rv<0){const j2=-(1+REST)*rv/(ia+ib);a.vx-=j2*ia*nx;a.vy-=j2*ia*ny;b.vx+=j2*ib*nx;b.vy+=j2*ib*ny}}}
    if(t%2===0)fr.push(P.map(p=>[Math.round(p.x*10)/10,Math.round(p.y*10)/10]));
    if(!mov&&t>2)break}
  return {P,goal,fr}
}
function parseSling(S,seat,k){const m=/^s([0-5]):(-?\d{1,3}):(-?\d{1,3})$/.exec(k||"");if(!m)return null;const i=+m[1],dx=+m[2],dy=+m[3];
  if(Math.floor(i/3)!==seat)return null;let mag=Math.sqrt(dx*dx+dy*dy);if(mag<8||mag>101)return null;return {k,i,dx,dy}}
const SINFO={id:"sling",nome:"Sling puck",ic:"🥏",sub:"Lancia i dischetti con la fionda: porta quello d'oro in porta",min:2,max:2,
  tut:[["🥏","Lo scopo","Sul tavolo ci sono 3 dischetti tuoi, 3 dell'avversario e un dischetto d'oro al centro. Fai entrare il dischetto d'oro nella porta avversaria: chi fa 3 gol vince."],
       ["🎯","La fionda","Tocca uno dei tuoi dischetti e trascina il dito all'indietro: più tiri lontano, più forte parte. Lascia per lanciare: il dischetto va nella direzione opposta."],
       ["🧱","Le regole","Le pareti fanno rimbalzare tutto. Si lancia un dischetto a turno. Dopo 26 lanci totali vince chi ha più gol."]],
  init(){return {pucks:POS0(),sc:[0,0],turn:0,shots:0,frames:null,fin:null,id:0,ev:null}},
  turn(S){return S.turn},
  legal(S,seat){return []},
  parse:parseSling,
  apply(S,seat,a){const r=simulaSling(S,a.i,a.dx,a.dy);const N={pucks:r.P,sc:S.sc.slice(),turn:1-S.turn,shots:S.shots+1,frames:r.fr,fin:null,id:S.id+1,ev:{seat,i:a.i,goal:r.goal}};
    if(r.goal>=0){N.sc[r.goal]++;N.pucks=POS0();N.turn=1-r.goal;N.frames=r.fr}
    for(const p of N.pucks){p.vx=0;p.vy=0}
    if(N.sc[0]>=MAXG)N.fin=0;else if(N.sc[1]>=MAXG)N.fin=1;else if(N.shots>=MAXSHOT)N.fin=N.sc[0]>N.sc[1]?0:N.sc[1]>N.sc[0]?1:-1;
    return N},
  over(S){if(S.fin==null)return null;if(S.fin<0)return {win:[],text:`Pareggio ${S.sc[0]} a ${S.sc[1]}`};const w=S.fin;return {win:[w],text:seats=>`${seats[w].nome} vince ${S.sc[w]} a ${S.sc[1-w]}`}},
  pausa(S){return S.frames&&!window.NATAN_GIOCHI_VELOCE?Math.min(3200,S.frames.length*17+400):0},
  bot(S,seat,lv){
    const mine=[0,1,2].map(j=>seat*3+j);const out=[];const noise=[24,12,5,0][lv];const gY=y=>seat===0?SH-y:y;     // quanto il dischetto d'oro è avanzato verso la porta avversaria
    const before=gY(S.pucks[6].y);
    for(const i of mine)for(let a=0;a<360;a+=15)for(const pw of [55,85,100]){
      const rad=a*Math.PI/180;let dx=Math.round(Math.cos(rad)*pw+(Math.random()-.5)*noise*2),dy=Math.round(Math.sin(rad)*pw+(Math.random()-.5)*noise*2);
      const kk=`s${i}:${dx}:${dy}`;const pa=parseSling(S,seat,kk);if(!pa)continue;
      const r=simulaSling(S,i,dx,dy);const g=r.P[6];const post=gY(g.y);
      const goalMe=r.goal===seat?1:0,goalOpp=r.goal>=0&&r.goal!==seat?1:0;
      const near=mine.filter(j=>j!==i).reduce((s,j)=>s+(Math.hypot(r.P[j].x-g.x,r.P[j].y-g.y)<110?1:0),0);
      out.push({a:pa,v:goalMe*3-goalOpp*3+(post-before)/SH,f:{
        valore:goalMe*1-goalOpp*1+(post-before)/SH*1.2,punti:goalMe,attacco:Math.max(0,(post-before)/SH*2),difesa:post>SH*.5?.4:0,
        rischio:goalOpp?1:(post<SH*.25?.5:0),posizione:r.P.slice(0,6).filter((p,j)=>(Math.floor(j/3)===seat)&&(seat===0?p.y<SH/2:p.y>SH/2)).length/3,
        futuro:Math.min(1,near/2),conserva:0,finale:0}})}
    out.sort((x,y)=>y.v-x.v);return out.slice(0,10)},
  msgTurno(S,ctx){return "Tocca a te: tira indietro un tuo dischetto e lascia"},
  view(sh,ctx){
    css();const canvas=E("canvas","rt");canvas.width=SW;canvas.height=SH;canvas.id="slingCanvas";canvas.style.width=`min(100%,${Math.round(Math.max(260,innerHeight*.74)*SW/SH)}px)`;const g=canvas.getContext("2d");
    const info=E("div","rtinfo","");sh.g.append(canvas,info);
    const flip=ctx.me===1;let sel=-1,drag=null,anim=0,lastId=-1,curS=null,curC=null;
    const col=["#e2463c","#2f6fd6"];
    function paint(pos,S,c){
      g.save();g.clearRect(0,0,SW,SH);if(flip){g.translate(SW,SH);g.rotate(Math.PI)}
      const gr=g.createLinearGradient(0,0,0,SH);gr.addColorStop(0,"#1b3a6e");gr.addColorStop(.5,"#122a55");gr.addColorStop(1,"#1b3a6e");g.fillStyle=gr;g.fillRect(0,0,SW,SH);
      g.strokeStyle="rgba(255,255,255,.35)";g.lineWidth=3;g.strokeRect(2,2,SW-4,SH-4);g.beginPath();g.moveTo(0,SH/2);g.lineTo(SW,SH/2);g.stroke();
      g.fillStyle="#0a0f22";g.fillRect(SW/2-SG/2,0,SG,8);g.fillRect(SW/2-SG/2,SH-8,SG,8);
      S.pucks.forEach((p0,i)=>{const p=pos?{x:pos[i][0],y:pos[i][1]}:p0;g.beginPath();g.arc(p.x,p.y,p0.r,0,7);g.fillStyle=i===6?"#f2c230":col[(i/3)|0];g.fill();g.strokeStyle=i===sel?"#fff":"rgba(255,255,255,.55)";g.lineWidth=i===sel?4:2;g.stroke()});
      if(drag&&sel>=0){const p=S.pucks[sel];g.strokeStyle="rgba(255,255,255,.85)";g.lineWidth=3;g.setLineDash([6,5]);g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+drag.dx*1.6,p.y+drag.dy*1.6);g.stroke();g.setLineDash([])}
      g.restore();
      info.textContent=`${ctx.seats[ctx.me].nome} ${S.sc[ctx.me]} — ${S.sc[1-ctx.me]} ${ctx.seats[1-ctx.me].nome} · lanci ${S.shots}/${MAXSHOT} · primo a ${MAXG}`+(S.ev&&S.ev.goal>=0?" · GOL!":"")}
    const pos=e=>{const r=canvas.getBoundingClientRect();let x=(e.clientX-r.left)*SW/r.width,y=(e.clientY-r.top)*SH/r.height;if(flip){x=SW-x;y=SH-y}return [x,y]};
    canvas.addEventListener("pointerdown",e=>{if(!curC||!curC.myTurn||anim)return;const [x,y]=pos(e);const S=curS;
      let best=-1,bd=1e9;for(let j=0;j<3;j++){const i=ctx.me*3+j,p=S.pucks[i];const d=Math.hypot(p.x-x,p.y-y);if(d<p.r+16&&d<bd){bd=d;best=i}}
      if(best>=0){sel=best;drag={dx:0,dy:0};try{canvas.setPointerCapture(e.pointerId)}catch(x){}paint(null,S,curC)}});
    canvas.addEventListener("pointermove",e=>{if(sel<0||!drag)return;const [x,y]=pos(e);const p=curS.pucks[sel];let dx=p.x-x,dy=p.y-y;const l=Math.hypot(dx,dy);const mx=100/1.6;if(l>mx){dx*=mx/l;dy*=mx/l}drag={dx,dy};paint(null,curS,curC)});
    const rel=()=>{if(sel<0)return;const d=drag;const i=sel;sel=-1;drag=null;
      if(d&&curC&&curC.myTurn){let dx=Math.round(d.dx*1.6),dy=Math.round(d.dy*1.6);if(flip){dx=-dx;dy=-dy}
        if(Math.hypot(dx,dy)>=10){curC.act(`s${i}:${dx}:${dy}`)}}
      paint(null,curS,curC)};
    canvas.addEventListener("pointerup",rel);canvas.addEventListener("pointercancel",rel);
    window.__sling={simulaSling,parseSling};
    return {draw(S,c){curS=S;curC=c;
      if(S.id!==lastId&&S.frames&&S.frames.length&&!window.NATAN_GIOCHI_VELOCE&&lastId>=0){lastId=S.id;const fr=S.frames;let n=0;anim=1;
        const prev=(()=>{return null})();const iv=setInterval(()=>{if(n>=fr.length||curS!==S){clearInterval(iv);anim=0;paint(null,S,curC);return}paint(fr[n++],S,curC)},16);return}
      lastId=S.id;paint(null,S,c)}}}
};
register(SINFO);
})();
