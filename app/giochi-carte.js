// SCOPA D'ASSI (dal Giardino Zen) e UNO sul motore dei giochi di Natan (giochi.js)
(function(){
"use strict";
const {E,register,shuffle,mulberry,rnd}=window.__G;
const Z=window.__G.zen;
const sfx=(n,a)=>{try{Z.sfx(n,a)}catch(e){}};

// =================================================================================================== SCOPA D'ASSI (2 giocatori, carte italiane, l'Asso prende tutto)
const SUITS=["d","c","s","b"],SUIT_NAME={d:"Denari",c:"Coppe",s:"Spade",b:"Bastoni"};
const VNAME=["","Asso","2","3","4","5","6","7","Fante","Cavallo","Re"];
const val=c=>+c.slice(1),suit=c=>c[0];
const cname=c=>`${VNAME[val(c)]} di ${SUIT_NAME[suit(c)]}`;
const other=s=>1-s;
function newDeck(){const d=[];for(const s of SUITS)for(let v=1;v<=10;v++)d.push(s+v);return d}
function captureOptions(card,table){
  const v=val(card);
  if(v===1){const aces=table.filter(t=>val(t)===1);if(aces.length)return aces.map(a=>({take:[a]}));if(table.length)return [{take:table.slice(),ace:true}];return []}
  const singles=table.filter(t=>val(t)===v);if(singles.length)return singles.map(t=>({take:[t]}));
  const res=[],n=table.length;
  for(let m=1;m<(1<<n);m++){if(!(m&(m-1)))continue;let sum=0;const take=[];for(let i=0;i<n;i++)if(m>>i&1){sum+=val(table[i]);take.push(table[i])}if(sum===v)res.push({take})}
  return res}
const PRIM={7:21,6:18,1:16,5:15,4:14,3:13,2:12,8:10,9:10,10:10};
function primiera(cards){let tot=0;for(const su of SUITS){const vs=cards.filter(c=>suit(c)===su).map(c=>PRIM[val(c)]);if(!vs.length)return 0;tot+=Math.max(...vs)}return tot}
function nuovaMano(S,first){
  const deck=shuffle(newDeck(),S.R);S.deck=deck;S.table=deck.splice(0,4);S.hands=[deck.splice(0,3),deck.splice(0,3)];S.caps=[[],[]];S.scope=[0,0];
  S.turn=first;S.starter=first;S.lastTaker=-1;S.lastMove=null;S.round++}
function punteggio(S){
  const A=S.caps[0],B=S.caps[1],den=x=>x.filter(c=>suit(c)==="d").length;
  const raw=[{carte:A.length,denari:den(A),primiera:primiera(A)},{carte:B.length,denari:den(B),primiera:primiera(B)}];
  const pts=[{},{}];
  ["carte","denari","primiera"].forEach(k=>{pts[0][k]=raw[0][k]>raw[1][k]?1:0;pts[1][k]=raw[1][k]>raw[0][k]?1:0});
  pts[0].sette=A.includes("d7")?1:0;pts[1].sette=B.includes("d7")?1:0;pts[0].scope=S.scope[0];pts[1].scope=S.scope[1];
  [0,1].forEach(w=>{pts[w].tot=pts[w].carte+pts[w].denari+pts[w].primiera+pts[w].sette+pts[w].scope;S.scores[w]+=pts[w].tot});
  S.sumShow={round:S.round,pts,raw,scores:S.scores.slice()};
  const [a,b]=S.scores;if((a>=11||b>=11)&&a!==b)S.winner=a>b?0:1}
register({id:"scopa",ord:2,nome:"Scopa d'Assi",ic:"🧹",sub:"Carte italiane: l'Asso prende tutto. Arriva a 11",min:2,max:2,
  tut:[["🧹","Lo scopo","Si gioca con 40 carte italiane (denari 🪙, coppe 🏆, spade 🗡️, bastoni 🪵). Vince chi arriva per primo a 11 punti, in più mani."],
       ["🃏","Come si prende","Giochi una carta: se in tavola ce n'è una dello stesso valore la prendi; altrimenti puoi prendere più carte che sommate fanno il suo valore. Se non puoi prendere, la carta resta in tavola."],
       ["A","L'Asso","L'Asso prende tutte le carte in tavola. Se in tavola c'è già un Asso, prende solo quello. Con l'Asso pigliatutto non vale scopa."],
       ["🧹","Scopa e punti","Fai scopa quando sgomberi la tavola. A fine mano: un punto per carte, denari, settebello e primiera, più le scope."]],
  init(n,seed){const R=mulberry(seed);const S={n:2,R,scores:[0,0],round:0,winner:-1,nm:0,sumShow:null};nuovaMano(S,R()<.5?0:1);return S},
  turn(S){return S.turn},
  legal(S,seat){const out=[];for(const card of S.hands[seat]){const opts=captureOptions(card,S.table);
      if(opts.length)opts.forEach((o,i)=>out.push({k:card+":"+i,card,oi:i,opt:o}));else out.push({k:card+":0",card,oi:0,opt:null})}return out},
  apply(S,seat,a){
    S.sumShow=null;S.nm++;S.hands[seat]=S.hands[seat].filter(c=>c!==a.card);
    const opts=captureOptions(a.card,S.table);const m={by:seat,card:a.card,take:[],scopa:false,ace:false,dealt:false,rest:null};
    if(opts.length){const o=opts[Math.min(a.oi||0,opts.length-1)];
      S.table=S.table.filter(t=>!o.take.includes(t));S.caps[seat].push(a.card,...o.take);S.lastTaker=seat;m.take=o.take;m.ace=!!o.ace;
      const last=!S.deck.length&&!S.hands[0].length&&!S.hands[1].length;
      if(!S.table.length&&!o.ace&&!last){S.scope[seat]++;m.scopa=true}}
    else S.table.push(a.card);
    S.turn=other(seat);S.lastMove=m;
    if(!S.hands[0].length&&!S.hands[1].length){
      if(S.deck.length){S.hands[0]=S.deck.splice(0,3);S.hands[1]=S.deck.splice(0,3);m.dealt=true}
      else{if(S.table.length&&S.lastTaker>=0){m.rest={to:S.lastTaker,cards:S.table.slice()};S.caps[S.lastTaker].push(...S.table);S.table=[]}
        punteggio(S);if(S.winner<0)nuovaMano(S,other(S.starter))}}
    return S},
  over(S){return S.winner>=0?{win:[S.winner],text:seats=>`${seats[S.winner].nome} vince ${S.scores[S.winner]} a ${S.scores[other(S.winner)]}!`}:null},
  pausa(S,a,seat){return S.sumShow?3200:650},
  bot(S,seat,lv){
    return this.legal(S,seat).map(a=>{
      const card=a.card;let sc,punti=0,attacco=0,difesa=0,rischio=0,conserva=0,posizione=0,finale=0;
      if(a.opt){const o=a.opt,tk=[card,...o.take];
        sc=tk.length+tk.filter(c=>suit(c)==="d").length*1.2+(tk.includes("d7")?12:0)+tk.filter(c=>val(c)===7).length*2.5+tk.filter(c=>val(c)===6).length;
        const rem=S.table.filter(t=>!o.take.includes(t));const rs=rem.reduce((x,c)=>x+val(c),0);
        if(!rem.length&&!o.ace){sc+=10;attacco=1}else if(rem.length&&rs<=10){sc-=2.5;rischio=-.8}
        if(rem.length&&rs>10)difesa=.6;
        punti=Math.min(1,tk.filter(c=>suit(c)==="d").length/4+(tk.includes("d7")?.5:0)+tk.filter(c=>val(c)===7).length/6);
        posizione=Math.min(1,tk.length/5);finale=!S.deck.length?.5:0}
      else{const sum=S.table.reduce((x,c)=>x+val(c),0)+val(card);
        sc=-1-(val(card)===7?4:0)-(card==="d7"?10:0)-(suit(card)==="d"?1:0)-(val(card)===1?3:0)+(val(card)>=8?1:0);if(sum<=10){sc-=3;rischio=-.8}else difesa=.6;
        conserva=-((card==="d7"?1:0)+(val(card)===7?.6:0)+(suit(card)==="d"?.3:0)+(val(card)===1?.5:0))+(val(card)>=8?.3:0)}
      return {a,f:{valore:Math.max(-1,Math.min(1,sc/16)),punti,attacco,difesa,rischio,conserva,posizione,futuro:0,finale}}})},
  msgTurno(S,ctx,seat){return "Tocca a te: gioca una carta"},
  view(sh,ctx){
    Z.simboli();
    const root=E("div","zfelt");sh.g.append(root);
    const rowO=E("div","zrow"),oh=E("div","zhand"),sc=E("div","zscore"),tb=E("div","ztable"),st=E("div","zstat"),ch=E("div","zchoose"),sum=E("div","zsum"),hd=E("div","zhand"),rowM=E("div","zrow");
    ch.hidden=true;sum.hidden=true;
    root.append(rowO,oh,sc,tb,st,ch,sum,hd,rowM);
    let pend=null,vistoNm=-1;
    const cardEl=(c,tag)=>{const e=document.createElement(tag||"div");e.className="zcard";const v=val(c),lab={1:"A",8:"F",9:"C",10:"R"}[v]||v;
      e.innerHTML=`<span class="cv">${lab}</span><svg viewBox="0 0 40 40" aria-hidden="true"><use href="#su-${suit(c)}"/></svg>${v>7?`<span class="fig">${VNAME[v]}</span>`:`<span class="cv b">${lab}</span>`}`;
      e.title=cname(c);e.dataset.c=c;if(tag==="button")e.type="button";return e};
    const nm=(c,s)=>c.seats[s]?String(c.seats[s].nome).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch])):"?";
    const mossa=(S,c)=>{const m=S.lastMove;if(!m)return "";const who=m.by===c.me?"Hai giocato":`${nm(c,m.by)} gioca`;
      let t=`${who} ${cname(m.card)}`;if(m.ace)t+=" e prende tutto";else if(m.take.length)t+=` e prende ${m.take.map(x=>VNAME[val(x)]).join(" + ")}`;
      if(m.scopa)t+=" · SCOPA!";if(m.rest)t+=` · le ultime carte vanno a ${m.rest.to===c.me?"te":nm(c,m.rest.to)}`;return t};
    const V={draw(S,c){
      const me=c.me,op=other(me);
      if(S.nm!==vistoNm){const m=S.lastMove;if(vistoNm>=0&&m){if(m.scopa)sfx("scopa");else if(m.take.length)sfx("take");else sfx("card");if(m.dealt)setTimeout(()=>sfx("deal"),450)}vistoNm=S.nm}
      rowO.innerHTML="";const a1=E("div","zwho"),a2=E("div","zwho");a1.innerHTML=`<b>${nm(c,op)}</b> · prese ${S.caps[op].length} · scope ${S.scope[op]}`;a2.textContent=`Mano ${S.round} · mazzo ${S.deck.length}`;rowO.append(a1,a2);
      oh.innerHTML="";S.hands[op].forEach(()=>oh.append(E("div","zcard back")));
      sc.innerHTML=`<small>Tu</small>${S.scores[me]}<span style="opacity:.5">–</span>${S.scores[op]}<small>${nm(c,op)}</small>`;
      tb.innerHTML="";if(!S.table.length)tb.append(E("span","zwho","Tavola vuota"));
      S.table.forEach(x=>{const e=cardEl(x);if(S.lastMove&&!S.lastMove.take.length&&S.lastMove.card===x)e.classList.add("last");if(pend&&pend.hot.includes(x))e.classList.add("hot");tb.append(e)});
      const mio=c.legal.length>0&&S.turn===me;
      hd.innerHTML="";S.hands[me].forEach(x=>{const b=cardEl(x,"button");b.disabled=!mio;b.onclick=()=>pick(x,S,c);if(pend&&pend.card===x)b.classList.add("hot");hd.append(b)});
      let t=mossa(S,c);t+=(t?" — ":"")+(S.turn===me&&mio?"Tocca a te.":`Tocca a ${nm(c,S.turn)}…`);st.textContent=t;
      rowM.innerHTML="";const m1=E("div","zwho");m1.innerHTML=`<b>${nm(c,me)}</b> (tu) · prese ${S.caps[me].length} · scope ${S.scope[me]}`;rowM.append(m1);
      // scelta fra più prese possibili
      ch.hidden=!pend;if(pend){ch.innerHTML="";ch.append(E("b","",`Cosa prendi con ${cname(pend.card)}?`));const w=E("div","opts");
        pend.opts.forEach((o,i)=>{const b=E("button","opt");b.type="button";b.dataset.i=String(i);o.take.forEach(x=>b.append(cardEl(x)));
          b.onmouseenter=()=>{pend.hot=o.take;tb.querySelectorAll(".zcard").forEach(e=>e.classList.toggle("hot",o.take.includes(e.dataset.c)))};
          b.onclick=()=>{const p=pend;pend=null;c.act(p.card+":"+i)};w.append(b)});
        const an=E("button","btn ghost","Annulla");an.onclick=()=>{pend=null;V.draw(S,c)};ch.append(w,an)}
      // riepilogo della mano
      const R=S.sumShow;sum.hidden=!R;if(R){const P=R.pts,Rw=R.raw;
        const row=(l,k,raw)=>`<tr><td>${l}</td><td>${P[me][k]}${raw?` <small>(${Rw[me][k]})</small>`:""}</td><td>${P[op][k]}${raw?` <small>(${Rw[op][k]})</small>`:""}</td></tr>`;
        sum.innerHTML=`<h3>Fine della mano ${R.round}</h3><table><thead><tr><th></th><th>Tu</th><th>${nm(c,op)}</th></tr></thead><tbody>${row("Carte","carte",1)}${row("Denari","denari",1)}${row("Settebello","sette")}${row("Primiera","primiera",1)}${row("Scope","scope")}<tr><th>Punti della mano</th><th>${P[me].tot}</th><th>${P[op].tot}</th></tr><tr><th>Totale</th><th>${R.scores[me]}</th><th>${R.scores[op]}</th></tr></tbody></table>`}}};
    function pick(card,S,c){
      if(!c.myTurn||S.turn!==c.me)return;
      const opts=captureOptions(card,S.table);
      if(opts.length>1){pend={card,opts,hot:[]};V.draw(S,c);return}
      c.act(card+":0")}
    return V;
  }
});

// =================================================================================================== UNO
const COL=["r","g","v","b"],CN={r:"rosso",g:"giallo",v:"verde",b:"blu",n:"jolly"};
const COLORI={r:"#e2463c",g:"#f2c230",v:"#33a65a",b:"#2f6fd6"};
function cssUno(){if(document.getElementById("gmcssuno"))return;const s=E("style");s.id="gmcssuno";s.textContent=`
.gm .zuno{background:radial-gradient(ellipse at 50% 30%,#2a3a8a,#12163a 78%);color:#fff;border-radius:20px;padding:14px;display:flex;flex-direction:column;gap:12px;--uw:64px;box-shadow:0 8px 26px rgba(0,0,0,.4)}
.gm .zuopps{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.gm .zuopp{display:flex;flex-direction:column;align-items:center;gap:5px;padding:7px 12px;border-radius:14px;background:rgba(255,255,255,.07);border:2px solid transparent;font-size:13px;min-width:92px;transition:border-color .2s,background .2s;position:relative}
.gm .zuopp.on{border-color:#ffd75a;background:rgba(255,215,90,.14);box-shadow:0 0 16px rgba(255,215,90,.35)}
.gm .zuopp .fan{display:flex;--uw:22px}.gm .zuopp .fan .zucard{margin-left:-11px;border-width:2px;border-radius:5px}.gm .zuopp .fan .zucard:first-child{margin-left:0}
.gm .zuopp .unob{position:absolute;top:-12px;right:-6px;background:#e2463c;color:#fff;font-weight:900;font-size:12px;padding:2px 8px;border-radius:999px;animation:zupop .5s ease-out;box-shadow:0 2px 8px rgba(0,0,0,.4)}
.gm .zumid{display:flex;align-items:center;justify-content:center;gap:clamp(14px,5vw,40px);padding:6px 0}
.gm .zupile{position:relative;width:calc(var(--uw)*1.5);height:calc(var(--uw)*1.62);display:grid;place-items:center}
.gm .zupile .zucard{position:absolute}
.gm .zucard.drop{animation:zudrop .35s ease-out}
.gm .zudeckw{display:flex;flex-direction:column;align-items:center;gap:6px}
.gm .zudeck{cursor:default;position:relative}.gm .zudeck.can{cursor:pointer;box-shadow:0 0 0 3px #ffd75a,0 3px 10px rgba(0,0,0,.5)}
.gm .zudeckw small{color:#c9d0ff;font-weight:600;font-size:12px}
.gm .zucol{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:13px;color:#dfe3ff}
.gm .zucol i{width:38px;height:38px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 18px var(--cc,#fff)}
.gm .zucol .dir{font-size:20px;display:inline-block}
.gm .zucol .dir.a{animation:zuspin 4s linear infinite}.gm .zucol .dir.b{animation:zuspin 4s linear infinite reverse}
.gm .zuev{min-height:3.6em;text-align:center;font-size:14px;color:#dfe3ff;display:flex;flex-direction:column;gap:2px}
.gm .zuev span{opacity:.55}.gm .zuev span:last-child{opacity:1;font-weight:700;color:#fff}
.gm .zuhand{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;min-height:calc(var(--uw)*1.5);padding-top:10px}
.gm .zuhand.dense{flex-wrap:nowrap;overflow-x:auto;justify-content:flex-start;padding-bottom:6px;-webkit-overflow-scrolling:touch}
.gm .zuhand.dense .zucard+.zucard{margin-left:-26px}
.gm .zuhand.dense .zucard.ok:hover{z-index:5}
.gm .zucard{width:var(--uw);height:calc(var(--uw)*1.5);border-radius:10px;border:3px solid #fff;position:relative;overflow:hidden;color:#fff;font-weight:800;background:var(--cc);box-shadow:0 3px 8px rgba(0,0,0,.45);padding:0;flex:none;font-family:inherit;display:block}
.gm .zucard.c-r{--cc:#e2463c;--tx:#e2463c}.gm .zucard.c-g{--cc:#f2c230;--tx:#b98a00}.gm .zucard.c-v{--cc:#33a65a;--tx:#33a65a}.gm .zucard.c-b{--cc:#2f6fd6;--tx:#2f6fd6}.gm .zucard.c-n{--cc:#15151c;--tx:#15151c}
.gm .zucard .ov{position:absolute;left:50%;top:50%;width:80%;height:62%;margin:-31% 0 0 -40%;background:#fff;border-radius:50%;transform:rotate(-24deg);display:grid;place-items:center}
.gm .zucard .big{transform:rotate(24deg);color:var(--tx);font-size:calc(var(--uw)*.5);font-weight:900;line-height:1}
.gm .zucard .c1,.gm .zucard .c2{position:absolute;font-size:calc(var(--uw)*.19);line-height:1}
.gm .zucard .c1{left:5px;top:4px}.gm .zucard .c2{right:5px;bottom:4px;transform:rotate(180deg)}
.gm .zucard.c-n .ov{background:conic-gradient(#e2463c 0 25%,#f2c230 0 50%,#33a65a 0 75%,#2f6fd6 0)}
.gm .zucard.c-n .big{color:#fff;text-shadow:0 1px 3px #000;font-size:calc(var(--uw)*.4)}
.gm .zucard.back{background:#15151c}.gm .zucard.back::before{content:"";position:absolute;left:50%;top:50%;width:80%;height:58%;margin:-29% 0 0 -40%;background:#e2463c;border-radius:50%;transform:rotate(-24deg)}
.gm .zucard.back::after{content:"N";position:absolute;inset:0;display:grid;place-items:center;color:#ffd75a;font-weight:900;font-size:calc(var(--uw)*.4);transform:rotate(-24deg)}
.gm .zuhand .zucard{transition:transform .14s,filter .14s}
.gm .zuhand .zucard.ok{cursor:pointer;box-shadow:0 0 0 2px #ffd75a,0 4px 12px rgba(0,0,0,.5)}
.gm .zuhand .zucard.ok:hover{transform:translateY(-12px)}
.gm .zuhand .zucard.no{filter:brightness(.6) saturate(.8);cursor:default}
.gm .zuhand .zucard.hint{animation:zuhint .7s ease-in-out 4;outline:3px solid #fff}
.gm .zuctl{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center}
.gm .zuctl button.cc{width:46px;height:46px;border-radius:50%;border:3px solid #fff;color:#fff;font-weight:800;cursor:pointer;font-size:11px}
.gm .zuctl .unoB{background:#e2463c;color:#fff;font-weight:900;border:3px solid #fff;border-radius:999px;padding:10px 18px;font-size:16px;cursor:pointer}
.gm .zuctl .unoB.on{background:#33a65a}.gm .zuctl .unoB.ric{animation:zupulse .8s ease-in-out infinite}.gm .zuctl .unoB:disabled{opacity:.4;animation:none}
.gm .zuctl .zb2{border:1px solid rgba(255,255,255,.4);background:rgba(255,255,255,.1);color:#fff;border-radius:999px;padding:9px 16px;font:inherit;cursor:pointer}
@keyframes zudrop{from{transform:translateY(-40px) scale(1.25) rotate(-8deg);opacity:.3}to{transform:none;opacity:1}}
@keyframes zupop{0%{transform:scale(.2)}70%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes zuspin{to{transform:rotate(360deg)}}
@keyframes zuhint{50%{transform:translateY(-14px)}}
@keyframes zupulse{50%{transform:scale(1.1)}}
`;document.head.append(s)}
function deckUno(R){const d=[];for(const c of COL){d.push({c,v:"0"});for(let k=0;k<2;k++){for(let n=1;n<=9;n++)d.push({c,v:String(n)});for(const a of ["salta","inverti","+2"])d.push({c,v:a})}}
  for(let k=0;k<4;k++){d.push({c:"n",v:"jolly"});d.push({c:"n",v:"+4"})}return shuffle(d,R)}
const canUno=(card,top,color)=>card.c==="n"||card.c===color||card.v===top.v;
const labelUno=v=>({salta:"⊘",inverti:"⇄",jolly:"★","+2":"+2","+4":"+4"}[v]||v);
const nxt=(S,steps)=>((S.cur+S.dir*steps)%S.n+S.n*4)%S.n;
function pesca(S){if(!S.D.length&&S.pile.length>1){const keep=S.pile.pop();S.D=shuffle(S.pile.splice(0),S.R);S.pile.push(keep)}return S.D.pop()||null}
function bestColor(h){const n={r:0,g:0,v:0,b:0};for(const k of h)if(k.c!=="n")n[k.c]++;return COL.slice().sort((a,b)=>n[b]-n[a])[0]}
const ORD={r:0,g:1,v:2,b:3,n:4};
const vOrd=v=>({"salta":10,"inverti":11,"+2":12,"jolly":13,"+4":14}[v]||+v);
function uEl(k,o){o=o||{};const d=E(o.tag||"div","zucard c-"+k.c+(o.cls?" "+o.cls:""));const lab=labelUno(k.v);
  d.innerHTML=`<span class="c1">${lab}</span><span class="ov"><span class="big">${lab}</span></span><span class="c2">${lab}</span>`;d.title=CN[k.c]+" "+k.v;return d}
register({id:"uno",ord:6,nome:"Uno",ic:"🃏",sub:"Resta senza carte per primo",min:2,max:5,
  opzioni:[{id:"imp",nome:"Somma i +2 e i +4",desc:"Se ti arriva un +2 puoi rispondere con un altro +2 (e un +4 su un +4): la penalità si somma e pesca chi non può rispondere.",def:false}],
  tut:[["🃏","Lo scopo","Vince chi resta per primo senza carte. Ognuno parte con 7 carte. Si gioca in 2, 3, 4 o 5."],
       ["🟥🟦","Come si gioca","Al tuo turno metti sul mazzo una carta dello stesso colore oppure con lo stesso numero o simbolo. Le carte che puoi giocare sono illuminate. Se non puoi, o non vuoi, peschi una carta (e se va bene puoi giocarla subito oppure passare)."],
       ["⊘⇄+2","Le carte speciali","⊘ Salta: il giocatore dopo di te salta il turno. ⇄ Inverti: cambia il verso del giro (in due giocatori funziona come Salta). +2: chi viene dopo pesca 2 carte e salta il turno. ★ Jolly: scegli tu il colore. +4: scegli il colore e chi viene dopo pesca 4 carte e salta il turno."],
       ["📣","UNO!","Quando stai per restare con una sola carta, premi «UNO!» prima di giocare la penultima: il pulsante pulsa per ricordartelo. Se te ne dimentichi, peschi 2 carte di penalità."],
       ["➕","Regola della casa","Nella schermata prima della partita puoi attivare «Somma i +2 e i +4»: un +2 si può rispondere con un altro +2, e la penalità cresce finché qualcuno non può più rispondere."]],
  init(n,seed,opz){const R=mulberry(seed);let D=deckUno(R);const hands=[];for(let i=0;i<n;i++){hands.push([]);for(let k=0;k<7;k++)hands[i].push(D.pop())}
    let top=D.pop();while(top.c==="n"){D.unshift(top);top=D.pop()}
    return {n,hands,D,pile:[top],top,color:top.c,dir:1,cur:0,drawn:-1,win:-1,R,ev:null,nm:0,pend:0,pendV:null,opz:opz||{}}},
  turn(S){return S.cur},
  legal(S,seat){const h=S.hands[seat];const out=[];const idx=S.drawn>=0?[S.drawn]:h.map((_,i)=>i);
    for(const i of idx){const k=h[i];
      if(S.pend>0){if(k.v!==S.pendV)continue}else if(!canUno(k,S.top,S.color))continue;
      for(const col of (k.c==="n"?COL:[null])){out.push({k:`p${i}${col?"c"+col:""}`,i,col,u:false});if(h.length===2)out.push({k:`p${i}${col?"c"+col:""}u`,i,col,u:true})}}
    out.push(S.drawn>=0?{k:"pass"}:{k:"draw"});return out},
  apply(S,seat,a){const h=S.hands[seat];S.nm++;
    if(a.k==="draw"){
      if(S.pend>0){const n=S.pend;for(let j=0;j<n;j++){const c=pesca(S);if(c)h.push(c)}S.pend=0;S.pendV=null;S.drawn=-1;S.ev={seat,t:"subisce",n};S.cur=nxt(S,1);return S}
      const c=pesca(S);if(!c){S.ev={seat,t:"vuoto"};S.cur=nxt(S,1);return S}h.push(c);
      if(canUno(c,S.top,S.color)){S.drawn=h.length-1;S.ev={seat,t:"pesca-ok"}}else{S.drawn=-1;S.ev={seat,t:"pesca"};S.cur=nxt(S,1)}return S}
    if(a.k==="pass"){S.drawn=-1;S.ev={seat,t:"passa"};S.cur=nxt(S,1);return S}
    const card=h.splice(a.i,1)[0];S.drawn=-1;S.pile.push(card);S.top=card;S.color=card.c==="n"?a.col:card.c;
    const ev={seat,t:"gioca",card,col:S.color,pen:false,vit:-1,n:0};S.ev=ev;
    if(h.length===1&&!a.u){const x=pesca(S),y=pesca(S);if(x)h.push(x);if(y)h.push(y);ev.pen=true}
    if(!h.length){S.win=seat;return S}
    const v=card.v;
    if(v==="salta"){S.cur=nxt(S,2)}
    else if(v==="inverti"){S.dir=-S.dir;S.cur=S.n===2?seat:nxt(S,1)}
    else if(v==="+2"||v==="+4"){const n=v==="+2"?2:4;
      if(S.opz&&S.opz.imp){S.pend+=n;S.pendV=v;ev.acc=S.pend;S.cur=nxt(S,1)}
      else{const vit=nxt(S,1);ev.vit=vit;ev.n=n;for(let k=0;k<n;k++){const c=pesca(S);if(c)S.hands[vit].push(c)}S.cur=nxt(S,2)}}
    else S.cur=nxt(S,1);
    return S},
  over(S){return S.win>=0?{win:[S.win],text:seats=>`${seats[S.win].nome} ha finito le carte!`}:null},
  pausa(S,a,seat){return 520},
  bot(S,seat,lv){const h=S.hands[seat];const lg=this.legal(S,seat);const pl=lg.filter(a=>a.i!==undefined);
    if(!pl.length)return lg.map(a=>({a,f:{valore:0}}));
    let c=pl.filter(a=>h.length!==2||a.u);if(h.length===2&&lv===0&&Math.random()<.25)c=pl.filter(a=>!a.u);
    const nx=S.hands[nxt(S,1)].length;const few=1/Math.max(1,nx),maj=bestColor(h);
    const out=c.map(a=>{const k=h[a.i];const rest=h.filter((_,j)=>j!==a.i);const act=["+2","+4","salta","inverti"].includes(k.v);const col=k.c==="n"?a.col:k.c;
      return {a,f:{valore:(+k.v||0)/9*.5,punti:act?.4:0,attacco:(k.v==="+4"?1:k.v==="+2"?.7:act?.4:0)*few*2,conserva:k.c==="n"?-.7:0,
        posizione:(col===maj?.5:0)+rest.filter(r=>r.c===col).length/10,futuro:rest.filter(r=>r.c===col||r.c==="n").length/8,
        finale:h.length<=2?(act?1:.2):0,rischio:0,difesa:nx<=2&&k.v==="+4"?.8:0}}});
    if(S.pend>0){const d=lg.find(a=>a.k==="draw");if(d)out.push({a:d,f:{valore:-.5,punti:0,attacco:-.5,difesa:-.2,rischio:-.4,conserva:0,posizione:0,futuro:0,finale:0}})}
    return out},
  msgTurno(S,ctx,seat){
    if(S.pend>0)return `Ti arriva un +${S.pend}: rispondi con un ${S.pendV} oppure pesca ${S.pend} carte`;
    return S.drawn>=0?"Hai pescato una carta che va bene: giocala oppure premi «Passa»":"Tocca a te: gioca una carta illuminata"+(S.top.c==="n"?" · colore scelto: "+CN[S.color]:"")},
  view(sh,ctx){
    cssUno();const info=this;let uno=false,scelta=-1,hintI=-1,visto=-1;const log=[];
    const root=E("div","zuno");sh.g.append(root);
    const opps=E("div","zuopps"),mid=E("div","zumid"),ev=E("div","zuev"),mine=E("div","zuhand"),ctl=E("div","zuctl");
    root.append(opps,mid,ev,mine,ctl);
    const nm=(c,s)=>c.seats[s]?String(c.seats[s].nome).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch])):"?";
    const evText=(S,c)=>{const e=S.ev;if(!e)return "";const io=e.seat===c.me,who=io?"Tu":nm(c,e.seat);
      if(e.t==="gioca")return `${who} ${io?"hai giocato":"ha giocato"} ${labelUno(e.card.v)} ${CN[e.card.c]}${e.card.c==="n"?" → "+CN[e.col]:""}`
        +(e.vit>=0?` · ${e.vit===c.me?"peschi":nm(c,e.vit)+" pesca"} ${e.n} carte`:"")+(e.acc?` · penalità accumulata: +${e.acc}`:"")
        +(e.pen?` · ${io?"dimentichi":"dimentica"} UNO: +2 carte`:"")+(S.hands[e.seat]&&S.hands[e.seat].length===1&&!e.pen?" · «UNO!»":"");
      if(e.t==="subisce")return `${who} ${io?"peschi":"pesca"} ${e.n} carte`;
      if(e.t==="pesca"||e.t==="pesca-ok")return `${who} ${io?"hai pescato":"ha pescato"}`;if(e.t==="passa")return `${who} ${io?"passi":"passa"}`;return ""};
    const suono=S=>{const e=S.ev;if(!e)return;
      if(e.t==="gioca"){if(!e.pen&&S.hands[e.seat]&&S.hands[e.seat].length===1)sfx("uno");else if(e.card.v==="salta"||e.card.v==="inverti")sfx("stop");else if(e.vit>=0||e.acc)sfx("take");else sfx("card")}
      else if(e.t==="pesca"||e.t==="pesca-ok"||e.t==="subisce")sfx("pesca");else if(e.t==="passa")sfx("pop")};
    const V={draw(S,c){
      const nuovo=S.nm!==visto;
      if(nuovo){if(visto>=0){suono(S);const t=evText(S,c);if(t){log.push(t);if(log.length>3)log.shift()}hintI=-1}visto=S.nm}
      const my=S.hands[c.me];const myTurn=c.legal.length>0&&S.cur===c.me;
      // avversari
      opps.innerHTML="";S.hands.forEach((h,s)=>{if(s===c.me)return;const o=E("div","zuopp"+(S.cur===s&&S.win<0?" on":""));o.dataset.seat=String(s);o.append(E("b","",nm(c,s)+" · "+h.length+" carte"));
        const fan=E("div","fan");h.slice(0,10).forEach(()=>fan.append(E("div","zucard back")));o.append(fan);if(h.length===1)o.append(E("span","unob","UNO!"));opps.append(o)});
      // centro: mazzo, pila, colore
      mid.innerHTML="";
      const dkw=E("div","zudeckw");const dk=E("div","zucard back zudeck"+(myTurn&&c.legal.some(a=>a.k==="draw")?" can":""));dk.id="unoMazzo";dk.title="Mazzo: "+S.D.length;dkw.append(dk,E("small","",S.D.length+" nel mazzo"));
      dk.onclick=()=>{if(myTurn&&c.legal.some(a=>a.k==="draw")){scelta=-1;c.act("draw")}};
      const wrap=E("div","zupile");const ult=S.pile.slice(-3);ult.forEach((k,j)=>{const idx=S.pile.length-ult.length+j;const el=uEl(k,{cls:j===ult.length-1&&nuovo&&visto>0?"drop":""});el.style.transform=`rotate(${j===ult.length-1?0:((idx*37)%23)-11}deg)`;wrap.append(el)});
      const ind=E("div","zucol");const dot=E("i");dot.style.background=S.color==="n"?"#555":COLORI[S.color];dot.style.setProperty("--cc",S.color==="n"?"#fff":COLORI[S.color]);
      ind.append(dot,E("span","","Colore: "+CN[S.color]),E("span","dir "+(S.dir===1?"a":"b"),"↻"));
      if(S.pend>0)ind.append(E("b","","Penalità +"+S.pend));
      mid.append(dkw,wrap,ind);
      ev.innerHTML="";log.forEach(t=>ev.append(E("span","",t)));
      // la mia mano, in ordine di colore
      const ordine=my.map((k,i)=>i).sort((a,b)=>(ORD[my[a].c]-ORD[my[b].c])||(vOrd(my[a].v)-vOrd(my[b].v)));
      mine.innerHTML="";mine.classList.toggle("dense",my.length>9);
      ordine.forEach(i=>{const k=my[i];const ok=myTurn&&c.legal.some(a=>a.i===i);
        const el=uEl(k,{tag:"button",cls:ok?"ok":"no"+(i===hintI?" hint":"")});if(ok&&i===hintI)el.classList.add("hint");el.type="button";el.dataset.i=String(i);
        if(ok)el.onclick=()=>{const needU=uno&&my.length===2;
          if(k.c==="n"){scelta=i;V.draw(S,c);return}
          if(c.act(`p${i}${needU?"u":""}`)){uno=false;scelta=-1}};
        mine.append(el)});
      // comandi
      ctl.innerHTML="";
      if(!myTurn||S.win>=0)return;
      if(scelta>=0&&c.legal.some(a=>a.i===scelta)){ctl.append(E("span","","Scegli il colore:"));
        for(const col of COL){const b=E("button","cc",CN[col]);b.style.background=COLORI[col];b.style.color=col==="g"?"#222":"#fff";b.dataset.col=col;
          b.onclick=()=>{const needU=uno&&my.length===2;const i=scelta;if(c.act(`p${i}c${col}${needU?"u":""}`)){uno=false;scelta=-1}};ctl.append(b)}
        const an=E("button","zb2","Annulla");an.onclick=()=>{scelta=-1;V.draw(S,c)};ctl.append(an);return}
      const dr=c.legal.find(a=>a.k==="draw"),ps=c.legal.find(a=>a.k==="pass");
      if(dr){const b=E("button","zb2",S.pend>0?`🂠 Pesca ${S.pend}`:"🂠 Pesca");b.id="unoPesca";b.onclick=()=>{scelta=-1;c.act("draw")};ctl.append(b)}
      if(ps){const b=E("button","zb2","Passa");b.id="unoPassa";b.onclick=()=>c.act("pass");ctl.append(b)}
      const ub=E("button","unoB"+(uno?" on":(my.length===2?" ric":"")),uno?"UNO! ✓":"📣 UNO!");ub.id="unoBtn";ub.disabled=my.length>2;ub.onclick=()=>{uno=!uno;if(uno)sfx("uno");V.draw(S,c)};ctl.append(ub);
      const hb=E("button","zb2","💡 Suggerimento");hb.id="unoHint";
      hb.onclick=()=>{try{const cs=info.bot(S,c.me,3).filter(x=>x.a&&x.a.i!==undefined);cs.sort((a,b)=>((b.f.valore||0)+(b.f.attacco||0)*.5+(b.f.posizione||0)*.3)-((a.f.valore||0)+(a.f.attacco||0)*.5+(a.f.posizione||0)*.3));
        hintI=cs.length?cs[0].a.i:-1;sfx("hint");V.draw(S,c)}catch(e){}};
      ctl.append(hb)}};
    return V}
});
})();
